const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let Card,nowMs=1000,lastSocket;
class Socket{constructor(url){this.url=url;this.readyState=1;this.sent=[];lastSocket=this;}send(value){this.sent.push(JSON.parse(value));}close(){this.readyState=3;}}
const document={cookie:''};
vm.runInNewContext(fs.readFileSync(__dirname+'/louder-amplifier-card.js','utf8'),{
 HTMLElement:class{},window:{},customElements:{get(){},define(tag,cls){Card=cls;}},ArrayBuffer,Uint8Array,DataView,URL,WebSocket:Socket,
 performance:{now:()=>nowMs},location:{origin:'https://ha.test',protocol:'https:'},document,setInterval:()=>1,clearInterval:()=>{}
});
const Relay=Card.AudioRelay;
function sine(amplitude=.5,bin=32){return Uint8Array.from({length:1024},(_,i)=>Math.round(128+127*amplitude*Math.sin(2*Math.PI*bin*i/1024)));}
function frame(timestamp,bytes){const b=new ArrayBuffer(1033);new DataView(b).setUint8(0,22);new DataView(b).setBigInt64(1,BigInt(timestamp),false);new Uint8Array(b,9).set(bytes);return b;}
(async()=>{
 const quiet=Relay.analyze(new Uint8Array(1024).fill(128));assert.equal(quiet.rms,0);assert(quiet.bars.every(v=>v===0));
 const signal=Relay.analyze(sine());assert(Math.abs(signal.rms-Math.SQRT1_2*.5)<.005);assert(signal.bars.every(v=>v>=0&&v<=1));
 const peak=signal.bars.indexOf(Math.max(...signal.bars));assert(peak>=25&&peak<=28,'FFT must put the sine in the matching logarithmic bin');
 const calls=[],states=[];
 const hass={async callWS(msg){calls.push(msg);if(msg.endpoint?.endsWith('/info'))return {ingress_entry:'/api/hassio_ingress/test-app/'};if(msg.endpoint==='/ingress/session')return {session:'test-session'};return {platform:'music_assistant',unique_id:'test-group'};}};
 const relay=new Relay(hass,'media_player.test',s=>states.push(s));await relay.connect();
 assert.equal(new URL(lastSocket.url).protocol,'wss:');assert.equal(new URL(lastSocket.url).searchParams.get('player'),'test-group');
 assert.equal(calls.length,3);assert(calls.every(x=>x.type==='config/entity_registry/get'||(x.type==='supervisor/api'&&['/addons/d5369777_music_assistant/info','/ingress/session'].includes(x.endpoint))));
 assert.match(document.cookie,/path=\/api\/hassio_ingress\/;SameSite=Strict;Secure/);
 lastSocket.onopen();assert.equal(lastSocket.sent[0].type,'client/time');
 relay.receive(JSON.stringify({type:'server/time',payload:{client_transmitted:990000,server_received:1995000,server_transmitted:1995000}}));
 assert.equal(relay.offset,1000000);
 relay.receive(frame(2000000,sine()));assert(relay.currentLevels().rms>.3);
 nowMs=1300;assert.equal(relay.currentLevels(),null,'Stale waveform cannot keep the meters moving');
 relay.receive(frame(2400000,sine(.2)));assert.equal(relay.currentLevels(),null,'Future waveform must wait for its play-at time');
 nowMs=1400;assert(Math.abs(relay.currentLevels().rms-Math.SQRT1_2*.2)<.005);
 relay.receive(JSON.stringify({type:'stream/clear'}));assert.equal(relay.currentLevels(),null);
 relay.receive(new ArrayBuffer(4));assert.equal(relay.frames.length,0);
 relay.receive(JSON.stringify({type:'server/time',payload:{client_transmitted:'bad'}}));assert.equal(relay.offset,1000000);
 relay.close();assert.equal(lastSocket.readyState,3);assert.equal(relay.frames.length,0);assert.equal(lastSocket.sent.at(-1).type,'client/goodbye');
 const bad=new Relay({async callWS(msg){if(msg.endpoint?.endsWith('/info'))return {ingress_entry:'https://elsewhere.test/api/hassio_ingress/x'};if(msg.endpoint==='/ingress/session')return {session:'test-session'};return {platform:'music_assistant',unique_id:'test-group'};}},'media_player.test',()=>{});
 await assert.rejects(()=>bad.connect(),/geldige Home Assistant/);
 console.log('Audio checks passed: measured RMS/FFT, silence, bounded/timed frames, stale-data stop, authenticated same-origin ingress, read-only HA calls and cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;});

