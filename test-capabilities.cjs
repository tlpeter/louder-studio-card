const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let Card;
vm.runInNewContext(fs.readFileSync(__dirname+'/louder-amplifier-card.js','utf8'),{HTMLElement:class{},window:{},customElements:{get(){},define(tag,cls){if(tag==='multiroom-audio-dashboard')Card=cls;}}});
const features={media_pause:1,media_seek:2,volume_set:4,volume_mute:8,media_previous_track:16,media_next_track:32,turn_on:128,turn_off:256,volume_up:1024,volume_down:1024,select_source:2048,media_stop:4096,media_play:16384,shuffle_set:32768,select_sound_mode:65536,repeat_set:262144};
function setup(bits){
 const c=Object.create(Card.prototype),calls=[],errors={textContent:''};
 c._cfg={entity:'media_player.main',boards:[{player:'media_player.other'}]};
 c._allowed=new Set(['media_player.main','media_player.other','number.eq','select.mode']);
 c._q=()=>errors;
 c._hass={states:{'media_player.main':{state:'playing',attributes:{supported_features:bits,volume_level:.2,is_volume_muted:false,source_list:['TV','Radio'],sound_mode_list:['Music'],media_duration:180}},'media_player.other':{state:'playing',attributes:{supported_features:8}},'number.eq':{state:'0',attributes:{min:-15,max:15,step:1}},'select.mode':{state:'Off',attributes:{options:['Off','EQ 15 Band']}}},async callService(...args){calls.push(args);}};
 return {c,calls,errors};
}
(async()=>{
 // Independently test every HA capability bit; these are protocol tests, not brand certifications.
 for(const [service,bit] of Object.entries(features)){
  const positive=setup(bit),negative=setup(0);
  const data=service==='volume_set'?{volume_level:.5}:service==='volume_mute'?{is_volume_muted:true}:service==='select_source'?{source:'TV'}:service==='select_sound_mode'?{sound_mode:'Music'}:service==='repeat_set'?{repeat:'one'}:service==='shuffle_set'?{shuffle:true}:service==='media_seek'?{seek_position:100}:{};
  assert(await positive.c._call('media_player',service,'media_player.main',data),service);
  assert.equal(positive.calls.length,1);assert.equal(positive.calls[0][3].entity_id,'media_player.main');
  assert.equal(await negative.c._call('media_player',service,'media_player.main',data),false,service+' unavailable');assert.equal(negative.calls.length,0);
 }
 let x=setup(8);await x.c._muteGroup();assert.equal(x.calls.length,1);assert.equal(x.calls[0][3].entity_id,'media_player.main','Do not mute configured but unrelated speakers');
 x=setup(1);assert(x.c._supports('media_player.main','media_play_pause'));x.c._hass.states['media_player.main'].state='paused';assert(!x.c._supports('media_player.main','media_play_pause'));
 for(const bits of [undefined,NaN,-1,'4']){x=setup(bits);assert(!x.c._supports('media_player.main','volume_set'));}
 const all=Object.values(features).reduce((a,b)=>a|b,0);
 for(const [domain,service,id,data] of [
  ['media_player','volume_set','media_player.main',{volume_level:1.1}],['media_player','volume_set','media_player.main',{volume_level:NaN}],['media_player','volume_mute','media_player.main',{is_volume_muted:'true'}],
  ['media_player','select_source','media_player.main',{source:'Invalid'}],['media_player','select_sound_mode','media_player.main',{sound_mode:'Invalid'}],['media_player','repeat_set','media_player.main',{repeat:'invalid'}],['media_player','media_seek','media_player.main',{seek_position:181}],
  ['number','set_value','number.eq',{value:1.5}],['number','set_value','number.eq',{value:16}],['select','select_option','select.mode',{option:'Invalid'}],['number','set_value','media_player.main',{value:1}],['media_player','play_media','media_player.main',{}],['media_player','media_play','media_player.unconfigured',{}]
 ]){x=setup(all);assert.equal(await x.c._call(domain,service,id,data),false,JSON.stringify([domain,service,id,data]));assert.equal(x.calls.length,0);}
 x=setup(all);x.c._hass.states['media_player.main'].state='unavailable';assert.equal(await x.c._call('media_player','media_play','media_player.main',{}),false);
 x=setup(4);await x.c._call('media_player','volume_set','media_player.main',{volume_level:.5,entity_id:'media_player.other',arbitrary:'payload'});assert.equal(JSON.stringify(x.calls[0][2]),JSON.stringify({volume_level:.5}),'Only permitted service fields leave the card');
 x=setup(all);x.c._stopLive=()=>{};x.c._loadColors=()=>{};x.c._build=()=>{};x.c._sync=()=>{};
 x.c.setConfig({entity:'media_player.main',players:['media_player.main','media_player.other']});assert.equal(x.calls.length,0,'No actions on config load');assert.equal(x.c._cfg.boards.length,2);
 for(const config of [{entity:'light.main'},{entity:'media_player.main',players:['light.main']},{entity:'media_player.main',players:['media_player.main','media_player.main']},{entity:'media_player.main',players:[{player:'media_player.main',eq:'number.eq'}]}])assert.throws(()=>x.c.setConfig(config));
 console.log('Capability/security checks passed: every exposed service bit, unsupported/offline states, payload validation, mute isolation, configuration and no actions on load.');
})().catch(error=>{console.error(error);process.exitCode=1;});
