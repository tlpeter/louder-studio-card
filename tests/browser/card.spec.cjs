const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  page.testErrors=[];page.on('pageerror',error=>page.testErrors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test.afterEach(async({page})=>{expect(page.testErrors).toEqual([]);});

async function open(page){
  await page.goto('/');await expect(page.locator('#title')).toHaveText('Demo track');
  await page.getByText('Kleuren & uiterlijk',{exact:true}).click();
}

for(const skin of ['modern','retro','vintage','midnight']){
  test('style '+skin+' renders without sending device commands',async({page})=>{
    await open(page);await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption(skin);
    await expect(page.locator('.studio')).toHaveAttribute('data-skin',skin);
    await expect(page.locator('#bands input')).toHaveCount(15);
    await expect(page.getByRole('slider',{name:'Groepsvolume',exact:true})).toBeEnabled();
    if(skin==='vintage')await expect(page.locator('.analog-meters')).toBeVisible();
    else await expect(page.locator('.analog-meters')).toBeHidden();
    await expect(page.locator('#commands')).toHaveText('Geen opdrachten.');
  });
}

test('colors and visualization persist independently per style',async({page})=>{
  await open(page);
  await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption('vintage');
  await page.getByRole('button',{name:'Paars',exact:true}).click();
  await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption('modern');
  await page.getByRole('button',{name:'Oceaan',exact:true}).click();
  await page.getByRole('combobox',{name:'Visualisatie',exact:true}).selectOption('analog');
  await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption('vintage');
  await expect(page.locator('[data-color-out="accent"]')).toHaveText('#BF8CFF');
  await page.reload();await page.getByText('Kleuren & uiterlijk',{exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Stijl',exact:true})).toHaveValue('vintage');
  await expect(page.locator('[data-color-out="accent"]')).toHaveText('#BF8CFF');
  await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption('modern');
  await expect(page.locator('[data-color-out="accent"]')).toHaveText('#46C9ED');
  await expect(page.getByRole('combobox',{name:'Visualisatie',exact:true})).toHaveValue('analog');
  await expect(page.locator('#commands')).toHaveText('Geen opdrachten.');
});

test('profiles target the selected board and manual changes become custom',async({page})=>{
  await open(page);await page.getByRole('button',{name:'Bas',exact:true}).click();
  await expect(page.locator('#preset-active')).toHaveText('Huidig: Bas');
  let commands=JSON.parse(await page.locator('#commands').textContent());
  expect(commands).toHaveLength(7);expect(commands.every(c=>c.target.entity_id.startsWith('number.speaker_links_left_'))).toBe(true);
  await page.getByRole('button',{name:'Rechts',exact:true}).click();
  await page.getByRole('button',{name:'Disco',exact:true}).click();
  await expect(page.locator('#preset-active')).toHaveText('Huidig: Disco');
  await page.getByRole('slider',{name:'Rechts 20 Hz',exact:true}).press('ArrowRight');
  await expect(page.locator('#preset-active')).toHaveText('Huidig: Aangepast');
  commands=JSON.parse(await page.locator('#commands').textContent());
  expect(commands.slice(7).every(c=>c.target.entity_id.startsWith('number.speaker_rechts_left_'))).toBe(true);
});

test('all four styles fit a mobile viewport',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});await open(page);
  for(const skin of ['modern','retro','vintage','midnight']){
    await page.getByRole('combobox',{name:'Stijl',exact:true}).selectOption(skin);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    expect(overflow,skin+' should fit the page width').toBe(false);
    await page.screenshot({path:testInfo.outputPath(skin+'-mobile.png'),fullPage:true});
  }
});

test('live needles react to PCM level, silence and missing data without demo fallback',async({page})=>{
  await page.addInitScript(()=>{
    window.testAmplitude=.5;window.testEmitAudio=true;window.testClosedSockets=0;
    window.WebSocket=class{
      constructor(){this.readyState=0;setTimeout(()=>{
        this.readyState=1;this.onopen?.();
        this.interval=setInterval(()=>{
          if(!window.testEmitAudio)return;
          const data=new ArrayBuffer(1033),view=new DataView(data);view.setUint8(0,22);view.setBigInt64(1,BigInt(Math.round(performance.now()*1000+1000000)),false);
          const bytes=new Uint8Array(data,9);for(let i=0;i<1024;i++)bytes[i]=Math.round(128+127*window.testAmplitude*Math.sin(2*Math.PI*32*i/1024));
          this.onmessage?.({data});
        },20);
      },0);}
      send(text){const msg=JSON.parse(text);if(msg.type==='client/time')queueMicrotask(()=>{
        const now=Math.round(performance.now()*1000+1000000);
        this.onmessage?.({data:JSON.stringify({type:'server/time',payload:{client_transmitted:msg.payload.client_transmitted,server_received:now,server_transmitted:now}})});
      });}
      close(){clearInterval(this.interval);this.readyState=3;window.testClosedSockets++;}
    };
  });
  await open(page);
  await page.evaluate(()=>{
    const card=document.querySelector('louder-amplifier-card');
    card.hass={...card.hass,async callWS(msg){
      if(msg.endpoint?.endsWith('/info'))return {ingress_entry:'/api/hassio_ingress/fixture/'};
      if(msg.endpoint==='/ingress/session')return {session:'synthetic-test-session'};
      return {platform:'music_assistant',unique_id:'fixture-group'};
    }};
  });
  await page.getByRole('combobox',{name:'Visualisatie',exact:true}).selectOption('analog');
  await page.getByRole('combobox',{name:'Databron',exact:true}).selectOption('live');
  await expect(page.locator('.demo-line>span')).toHaveText('Live · mono-bronniveau');
  const angle=async()=>Number((await page.locator('.vu-needle').first().getAttribute('transform')).match(/rotate\(([-\d.]+)/)[1]);
  await expect.poll(angle,{timeout:6000}).toBeGreaterThan(0);
  await page.evaluate(()=>{window.testAmplitude=0;});
  await expect.poll(angle,{timeout:6000}).toBeLessThan(-45);
  await page.evaluate(()=>{window.testAmplitude=.5;});
  await expect.poll(angle,{timeout:6000}).toBeGreaterThan(0);
  await page.evaluate(()=>{window.testEmitAudio=false;});
  await expect(page.locator('.demo-line>span')).toHaveText('Live · wachten op audiodata');
  await expect.poll(angle,{timeout:6000}).toBeLessThan(-45);
  await expect(page.locator('#commands')).toHaveText('Geen opdrachten.');
  await page.getByRole('combobox',{name:'Databron',exact:true}).selectOption('demo');
  await expect.poll(()=>page.evaluate(()=>window.testClosedSockets)).toBeGreaterThan(0);
});
