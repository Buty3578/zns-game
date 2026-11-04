import{STAGES,makeChart}from'./core.mjs';
const midi=n=>440*2**((n-69)/12);
export function compose(level){
 const s=STAGES[level],q=60/s.bpm,events=[],add=(beat,type,pitch=0,length=0,gain=1)=>events.push({time:beat*q,type,pitch,length:length*q,gain});
 const roots=[0,-5,3,-2],motifs=[[12,15,19,22,19,15,10,12],[12,19,22,24,22,19,15,10],[12,12,19,15,22,24,19,15]];
 for(let bar=0;bar<s.bars;bar++){
  const base=bar*4,root=s.root+roots[Math.floor(bar/2)%4],intro=bar<4,breakdown=bar>=12&&bar<16,outro=bar>=s.bars-4,drop=bar>=16&&!outro;
  const energy=intro?.65:breakdown?.52:outro?.75:1;
  let kicks=level===0?[0,1.75,2.5]:level===1?[0,.75,2,2.75]:[0,1.5,2,2.75];
  if(intro)kicks=[0,2];if(breakdown)kicks=bar===15?[0,1,2,3]:[0];
  for(const b of kicks)add(base+b,'kick',0,0,energy);
  if(!breakdown||bar===15)for(const b of[1,3]){add(base+b,'snare',0,0,.9*energy);if(level>0)add(base+b+.018,'clap',0,0,.48*energy);}
  for(let h=0;h<8;h++){if(breakdown&&h%2)continue;add(base+h*.5+(level<2&&h%2?.045:0),'hat',0,0,(h%2?.36:.52)*energy);}
  if(drop&&bar%2===1)for(const b of[2.75,3.25,3.75])add(base+b,'hat',0,0,.25);
  if(!intro&&!breakdown)add(base+3.5,'open',0,0,.35);
  if(bar%4===0)add(base,'crash',0,0,bar===16?.7:.3);
  if(bar%8===7&&!outro)for(let i=0;i<4;i++)add(base+3+i*.25,'snare',0,0,.22+i*.12);
  const bass=level===0?[[0,0,.7],[1.5,0,.35],[2.5,7,.4],[3.5,10,.3]]:level===1?[[0,0,.45],[.75,12,.25],[1.5,0,.35],[2,7,.45],[3,10,.3],[3.5,7,.25]]:[[0,0,.65],[1,0,.3],[1.75,12,.2],[2.5,7,.35],[3.25,10,.35]];
  if(!breakdown)for(const[b,n,d]of bass)add(base+b,'bass',root+n,d,(intro?.65:1));
  else add(base,'bass',root,2.5,.55);
  const chord=[root+12,root+15,root+19,root+22];
  for(const b of (level===1&&!intro&&!breakdown?[.5,1.5,2.75]:[0,2]))for(const n of chord)add(base+b,'chord',n,breakdown?1.8:level===1?.27:1.3,intro?.55:.75);
  if(bar>=4&&!(bar>=12&&bar<14)&&bar<s.bars-2){const motif=motifs[level],positions=level===0?[.5,1.5,2.75]:[.5,1.25,2.5,3.5];for(let i=0;i<positions.length;i++){const ix=(i+(bar%4)*2+Math.floor(bar/8))%8;add(base+positions[i],'lead',root+motif[ix],.25+(i%2)*.18,drop?.85:.58);}}
  if(bar===15){add(base,'rise',0,4,.5);for(let i=0;i<8;i++)add(base+2+i*.25,'snare',0,0,.15+i*.07);}
 }
 // A restrained stab reinforces every playable accent on the same beat grid.
 for(const n of makeChart(level))add(n.beat,'accent',s.root+24+[0,3,7,10][n.lane],n.duration/q||.12,.32);
 add(s.bars*4,'kick',0,0,1);for(const n of[0,3,7,10])add(s.bars*4,'chord',s.root+12+n,1.6,.7);
 return events.sort((a,b)=>a.time-b.time);
}
export class SoundEngine{
 constructor(){this.ctx=null;this.volume=.65;this.effects=true;this.offset=0;this.running=false;this.level=0;this.events=[];this.cursor=0;}
 async init(){if(!this.ctx){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)throw Error('Этот браузер не поддерживает Web Audio. Открой игру в актуальном браузере.');this.ctx=new AC();const c=this.ctx;this.master=c.createGain();this.master.gain.value=this.volume*.75;const limiter=c.createDynamicsCompressor();limiter.threshold.value=-13;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.005;limiter.release.value=.16;this.master.connect(limiter);limiter.connect(c.destination);this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);let seed=8191;const d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=(seed/1073741824-1);}}await this.ctx.resume();}
 setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v*.75,this.ctx.currentTime,.025);}
 bus(){const c=this.ctx;this.track=c.createGain();this.track.connect(this.master);this.delay=c.createDelay(.8);this.delay.delayTime.value=60/STAGES[this.level].bpm*.75;const feedback=c.createGain();feedback.gain.value=.22;const wet=c.createGain();wet.gain.value=.14;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;this.delay.connect(filter);filter.connect(feedback);feedback.connect(this.delay);filter.connect(wet);wet.connect(this.track);this.nodes=[this.track,this.delay,feedback,wet,filter];}
 start(level){this.stop();this.level=level;this.bus();this.events=compose(level);this.cursor=0;this.origin=this.ctx.currentTime+.18;this.running=true;this.tick();this.timer=setInterval(()=>this.tick(),25);}
 time(){return this.ctx?this.ctx.currentTime-this.origin:0;}
 tick(){if(!this.running)return;const horizon=this.time()+.22;while(this.cursor<this.events.length&&this.events[this.cursor].time<horizon){const e=this.events[this.cursor++];this.play(e,this.origin+e.time);}}
 async pause(){if(this.running){this.running=false;clearInterval(this.timer);await this.ctx.suspend();}}
 async resume(){await this.ctx.resume();this.running=true;this.tick();this.timer=setInterval(()=>this.tick(),25);}
 stop(){clearInterval(this.timer);this.running=false;if(this.nodes){for(const n of this.nodes)try{n.disconnect();}catch{}this.nodes=null;}}
 envelope(t,vol,attack,duration,target=this.track){const c=this.ctx,g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(attack+.005,duration));g.connect(target);return g;}
 osc(type,hz,t,d,vol,target=this.track,endHz){const c=this.ctx,o=c.createOscillator(),g=this.envelope(t,vol,.005,d,target);o.type=type;o.frequency.setValueAtTime(hz,t);if(endHz)o.frequency.exponentialRampToValueAtTime(endHz,t+d*.8);o.connect(g);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};return o;}
 noiseHit(t,d,vol,freq,type='highpass',target=this.track){const c=this.ctx,b=c.createBufferSource(),f=c.createBiquadFilter(),g=this.envelope(t,vol,.002,d,target);b.buffer=this.noise;f.type=type;f.frequency.value=freq;b.connect(f);f.connect(g);b.start(t);b.stop(t+d+.02);b.onended=()=>{b.disconnect();f.disconnect();g.disconnect();};}
 play(e,t){t=Math.max(t,this.ctx.currentTime+.001);const v=e.gain;
  if(e.type==='kick'){this.osc('sine',155,t,.28,.8*v,this.track,42);this.noiseHit(t,.025,.07*v,2200);}
  else if(e.type==='snare'){this.noiseHit(t,.16,.32*v,1600);this.osc('triangle',185,t,.11,.16*v,this.track,115);}
  else if(e.type==='clap'){for(let i=0;i<3;i++)this.noiseHit(t+i*.012,.065,.15*v,1100,'bandpass');}
  else if(e.type==='hat'||e.type==='open'||e.type==='crash'){this.noiseHit(t,e.type==='hat'?.047:e.type==='open'?.22:1,.17*v,e.type==='crash'?5500:7800);}
  else if(e.type==='bass'){const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(750,t);f.frequency.exponentialRampToValueAtTime(150,t+e.length);f.Q.value=1.6;f.connect(this.track);this.osc('sawtooth',midi(e.pitch),t,e.length,.19*v,f);const sub=this.osc('sine',midi(e.pitch)/2,t,e.length,.17*v,f),cleanup=sub.onended;sub.onended=()=>{cleanup();f.disconnect();};}
  else if(e.type==='chord'){this.osc('sine',midi(e.pitch),t,e.length,.07*v);this.osc('triangle',midi(e.pitch)*2,t,e.length*.45,.023*v);}
  else if(e.type==='lead'||e.type==='accent'){const d=Math.max(.13,e.length),hz=midi(e.pitch);this.osc('triangle',hz,t,d,.12*v);this.osc('sine',hz*2,t,d*.65,.028*v);this.osc('triangle',hz,t,d,.08*v,this.delay);}
  else if(e.type==='rise'){const c=this.ctx,b=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();b.buffer=this.noise;b.loop=true;f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(7000,t+e.length);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.1*v,t+e.length-.03);g.gain.linearRampToValueAtTime(0,t+e.length);b.connect(f);f.connect(g);g.connect(this.track);b.start(t);b.stop(t+e.length);b.onended=()=>{b.disconnect();f.disconnect();g.disconnect();};}
 }
 fx(quality){if(this.effects&&this.ctx&&this.ctx.state==='running')this.osc('sine',quality===1?1046:784,this.ctx.currentTime+.002,.05,.025,this.master);}
}
