const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let Card,blocked=false;
const saved=new Map();
vm.runInNewContext(fs.readFileSync(__dirname+'/louder-amplifier-card.js','utf8'),{
  HTMLElement:class{},window:{},customElements:{get(){},define(tag,cls){Card=cls;}},
  localStorage:{getItem(key){if(blocked)throw Error('Storage disabled');return saved.get(key)||null;},setItem(key,value){if(blocked)throw Error('Storage disabled');saved.set(key,value);}}
});
function card(){
 const c=Object.create(Card.prototype),nodes=new Map(),vars=new Map();
 c._cfg={entity:'media_player.louder_speakers'};
 c._q=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'',dataset:{}});return nodes.get(key);};
 c._all=()=>['accent','peak','background'].map(key=>({dataset:{color:key},value:''}));
 c.style={setProperty(key,value){vars.set(key,value);}};c._animate=()=>{};
 c._loadColors();return {c,vars};
}
let {c,vars}=card();
c._applyColors();assert.equal(saved.size,0,'Loading a card must not persist or send commands');
assert.equal(vars.get('--retro-accent'),'#b5e147');
c._input({target:{dataset:{color:'accent'},value:'#33ccff'}});
assert.equal(vars.get('--retro-accent'),'#33ccff');
assert.equal(JSON.parse(saved.get('louder-studio:appearance:media_player.louder_speakers')).accent,'#33ccff');
let next=card();assert.equal(next.c._colors.accent,'#33ccff','Color must survive a card reload');
c._colors.background='#ffffff';c._applyColors();assert.equal(vars.get('--retro-ink'),'#111111');
assert.equal(vars.get('--retro-scheme'),'light');
c._colors.accent='#000000';c._applyColors();assert.notEqual(c._canvasColors.bar,'#000000','Dark bar colors must remain visible on the spectrum');
const before=saved.get('louder-studio:appearance:media_player.louder_speakers');
c._input({target:{dataset:{color:'accent'},value:'url(bad)'}});assert.equal(saved.get('louder-studio:appearance:media_player.louder_speakers'),before);
saved.set('louder-studio:appearance:media_player.louder_speakers','broken json');next=card();assert.equal(next.c._colors.accent,'#b5e147');
saved.set('louder-studio:appearance:media_player.louder_speakers',JSON.stringify({accent:'bad',peak:'#ffffff',background:'javascript:bad'}));
next=card();assert.equal(next.c._colors.accent,'#b5e147');assert.equal(next.c._colors.peak,'#ffffff');
saved.clear();next=card();
next.c._input({target:{dataset:{color:'accent'},value:'#33ccff'}});
next.c._input({target:{dataset:{color:'meter'},value:'#fff6dd'}});
next.c._setSkin('vintage');assert.equal(next.c._skin,'vintage');assert.equal(next.c._visual,'analog');assert.equal(next.c._q('canvas').hidden,true);assert.equal(next.c._q('.analog-meters').hidden,false);
next.c._input({target:{dataset:{color:'meter'},value:'#ccddee'}});
next.c._setSkin('modern');assert.equal(next.c._colors.accent,'#33ccff');assert.equal(next.c._colors.meter,'#fff6dd');assert.equal(next.c._visual,'spectrum');
next.c._change({target:{dataset:{appearance:'visual'},value:'analog'}});
next.c._setSkin('midnight');next.c._setSkin('modern');assert.equal(next.c._visual,'analog','Each skin remembers its own visual choice');
next.c._setSkin('vintage');assert.equal(next.c._colors.meter,'#ccddee');
const restored=card();assert.equal(restored.c._skin,'vintage');assert.equal(restored.c._visual,'analog');assert.equal(restored.c._colors.meter,'#ccddee');
for(const id of ['modern','retro','vintage','midnight']){restored.c._setSkin(id);assert.equal(restored.c._skin,id);assert.equal(restored.c._q('[data-appearance=skin]').value,id);}
restored.c._setSkin('__proto__');assert.equal(restored.c._skin,'midnight');
assert.match(restored.c._analogMeter('Links'),/bronmeter in VU-stijl/);
blocked=true;next=card();next.c._applyColors(true);assert.match(next.c._q('.color-status').textContent,/deze sessie/);
console.log('Appearance checks passed: four skins, independent colors/visuals, old storage migration, reload persistence, contrast, invalid/blocked storage. No HA commands involved.');

