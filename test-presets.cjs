const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
let Card;
vm.runInNewContext(fs.readFileSync(__dirname+'/louder-amplifier-card.js','utf8'),{
  HTMLElement:class{},window:{},customElements:{get(){},define(tag,cls){Card=cls;}}
});
function setup(failAt=0){
  const {config,states}=JSON.parse(fs.readFileSync(__dirname+'/fixture.json','utf8'));
  const c=Object.create(Card.prototype),calls=[],nodes=new Map();
  c._cfg=config;c._tab=0;c._allowed=new Set(Object.keys(states));
  c._q=selector=>{if(!nodes.has(selector))nodes.set(selector,{textContent:''});return nodes.get(selector);};
  c._sync=()=>{};
  c._hass={states,async callService(domain,service,data,target){
    calls.push({domain,service,data,target});
    if(calls.length===failAt)throw Error('Board disconnected');
    states[target.entity_id].state=String(domain==='number'?data.value:data.option);
  }};
  return {c,calls,states,config};
}
(async()=>{
  let x=setup();
  await x.c._applyPreset('bas');
  assert.equal(x.calls.length,7);
  assert(x.calls.every(call=>call.domain==='number'&&call.target.entity_id.startsWith('number.speaker_links_left_')));
  assert.deepEqual(x.config.boards[0].bands.map(f=>Number(x.states[f.entity].state)),[2,3,5,6,5,3,1,0,0,0,0,0,0,0,0]);
  await x.c._applyPreset('bas');assert.equal(x.calls.length,7,'Already matching bands should not be resent');
  await x.c._applyPreset('vlak');assert(x.config.boards[0].bands.every(f=>Number(x.states[f.entity].state)===0));
  x.c._tab=1;x.states[x.config.boards[1].eq].state='Off';
  await x.c._applyPreset('disco');
  assert.equal(x.calls.at(-1).target.entity_id,x.config.boards[1].eq);
  assert.equal(x.calls.at(-1).data.option,'EQ 15 Band');
  for(const id of ['vlak','bas','disco','rock','pop','jazz','klassiek','zang','nacht']){
    x=setup();await x.c._applyPreset(id);assert(!x.c._q('.error').textContent,id);
    assert(x.calls.every(call=>call.domain==='number'&&call.data.value>=-15&&call.data.value<=15));
  }
  x=setup();x.states[x.config.boards[0].bands[14].entity].state='unavailable';
  await x.c._applyPreset('bas');assert.equal(x.calls.length,0,'All bands must pass preflight before any write');
  assert.match(x.c._q('.error').textContent,/niet beschikbaar/);
  x=setup();x.states[x.config.boards[0].bands[2].entity].attributes.max=2;
  await x.c._applyPreset('bas');assert.equal(x.calls.length,0,'Out of range profile must not partially apply');
  x=setup(2);await x.c._applyPreset('bas');
  assert.equal(x.calls.length,2,'Stop on service failure');
  assert.match(x.c._q('.error').textContent,/niet volledig toegepast/);
  assert.equal(x.c._q('.preset-message').textContent,'');assert.equal(x.c._applyingPreset,false);
  x=setup();await Promise.all([x.c._applyPreset('bas'),x.c._applyPreset('disco')]);
  assert.equal(x.calls.length,7,'Concurrent profile click must not interleave');
  console.log('Preset checks passed: nine curves, correct board, EQ enable, custom ranges, unavailable bands, partial failure, repeat and concurrent clicks.');
})().catch(e=>{console.error(e);process.exitCode=1;});

