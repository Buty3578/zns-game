import{SoundEngine}from'../audio.mjs';
import{PLAYLIST}from'./playlist.mjs';
export class StudioSound extends SoundEngine{
 constructor(){super();this.buffers=new Map();this.loading=new Map();this.source=null;this.rendered=false;this.media=null;this.mode='buffer';this.selection=0;this.userFile=null;this.userUrl=null;this.wasPlaying=false;this.mutedByUser=false;this.lastCue=new Map();this.wheelDistance=0;}
 async init(){const first=!this.ctx;await super.init();if(first){this.master.disconnect();this.master.connect(this.ctx.destination);}}
 async load(level){if(this.buffers.has(level))return;if(this.loading.has(level))return this.loading.get(level);const job=(async()=>{const response=await fetch(new URL(`../music/track-${level}.mp3`,import.meta.url));if(!response.ok)throw Error('Музыка не загрузилась. Проверь соединение.');const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(level,buffer);while(this.buffers.size>2){const key=[...this.buffers.keys()].find(k=>k!==level&&k!==this.level);if(key===undefined)break;this.buffers.delete(key);}})();this.loading.set(level,job);try{await job;}finally{this.loading.delete(level);}}
 start(level,offset=0){if(!this.buffers.has(level))throw Error('Музыка ещё загружается');this.stop();this.mode='buffer';this.mutedByUser=false;this.rendered=true;this.level=level;const at=this.ctx.currentTime+.18;this.origin=at-offset;const source=this.ctx.createBufferSource();source.buffer=this.buffers.get(level);source.connect(this.master);source.start(at,Math.min(offset,source.buffer.duration-.1));this.source=source;this.running=true;this.musicOffset=0;this.wasPlaying=true;}
 ensureMedia(){if(this.media)return;this.media=new Audio();this.media.preload='metadata';this.media.loop=false;this.media.playsInline=true;this.media.addEventListener('ended',()=>{if(this.running&&!this.mutedByUser&&this.mode==='media'){this.running=false;this.onTrackEnded?.();}});this.media.addEventListener('error',()=>{this.stopMusic();this.onError?.('Этот аудиофайл не удалось воспроизвести. Попробуй другой MP3.');});this.media.volume=this.volume;}
 async upload(file){
  if(!file||(!/\.(mp3|m4a|wav|ogg)$/i.test(file.name)&&!file.type?.startsWith('audio/')))throw Error('Выбери музыкальный файл MP3, M4A, WAV или OGG.');
  if(!file.size)throw Error('Этот файл пустой. Выбери другой трек.');
  if(file.size>60*1024*1024)throw Error('Выбери трек меньше 60 МБ.');
  this.ensureMedia();const previous={url:this.userUrl,file:this.userFile,selection:this.selection,mode:this.mode,src:this.media.src,offset:Math.max(0,this.time()||0)};
  const url=URL.createObjectURL(file);this.userUrl=url;this.userFile=file.name;
  try{await this.playChoice('local');if(previous.url)URL.revokeObjectURL(previous.url);}
  catch(e){
   URL.revokeObjectURL(url);this.userUrl=previous.url;this.userFile=previous.file;this.selection=previous.selection;this.mode=previous.mode;this.musicOffset=previous.offset;
   if(previous.src){this.media.src=previous.src;this.media.currentTime=previous.offset;}else{this.media.removeAttribute?.('src');this.media.load?.();}
   throw Error('Не удалось открыть этот трек. Попробуй другой MP3. Предыдущая музыка осталась доступна.');
  }
 }
 removeUpload(){
  if(!this.userUrl)return;
  const url=this.userUrl;if(this.selection==='local'){this.stopMusic();this.selection=0;this.mode='buffer';this.musicOffset=0;}
  if(this.media?.src===url){this.media.removeAttribute?.('src');this.media.load?.();}
  URL.revokeObjectURL(url);this.userUrl=null;this.userFile=null;
 }
 async playChoice(choice){this.selection=choice;this.musicOffset=0;if(typeof choice==='number'){await this.init();await this.load(choice);this.start(choice);return;}this.ensureMedia();const item=PLAYLIST.find(p=>p.id===choice),url=choice==='local'?this.userUrl:item?new URL('../music/imported/'+item.file,import.meta.url).href:null;if(!url)throw Error('Выбери трек с устройства ещё раз.');this.stop();this.mode='media';this.media.src=url;this.media.volume=this.volume;this.mutedByUser=false;const starting=(async()=>{try{const playing=this.media.play();await Promise.all([this.init(),playing]);this.running=true;this.wasPlaying=true;}catch(e){this.stopMusic();throw e;}})();this.mediaStart=starting;try{await starting;}finally{if(this.mediaStart===starting)this.mediaStart=null;}}
 setVolume(v){super.setVolume(v);if(this.media)this.media.volume=v;}
 time(){return this.mode==='media'?(this.media?.currentTime||0):super.time();}
 // Let an in-flight play settle before pausing, or browsers reject it with AbortError.
 async pause(){if(this.mediaStart)await this.mediaStart.catch(()=>{});if(this.running||this.ctx?.state!=='suspended')this.wasPlaying=this.running;this.media?.pause();this.running=false;if(this.ctx)await this.ctx.suspend();}
 async resume(){if(!this.ctx)return;const shouldPlay=this.wasPlaying&&!this.mutedByUser,playing=shouldPlay&&this.mode==='media'?this.media.play():Promise.resolve();await Promise.all([this.ctx.resume(),playing]);if(shouldPlay)this.running=true;}
 stop(){if(this.source){try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}if(this.media)this.media.pause();super.stop();}
 stopMusic(){this.stop();this.mutedByUser=true;this.wasPlaying=false;}
 pauseMusic(){this.musicOffset=Math.max(0,this.time()||0);this.stopMusic();}
 async resumeMusic(){
  if(this.mode==='media'&&this.media?.src){const playing=this.media.play();this.mutedByUser=false;await Promise.all([this.init(),playing]);this.running=true;this.wasPlaying=true;return;}
  if(this.mode==='buffer'&&this.source&&!this.mutedByUser){await this.init();this.running=true;this.wasPlaying=true;return;}
  if(typeof this.selection==='string'){await this.playChoice(this.selection);return;}
  const choice=typeof this.selection==='number'?this.selection:0;await this.init();await this.load(choice);this.start(choice,this.musicOffset||0);this.wasPlaying=true;
 }
 get duration(){return this.mode==='media'?(this.media?.duration||0):this.buffers.get(this.level)?.duration||0;}
 get title(){return this.selection==='local'?this.userFile:PLAYLIST.find(p=>p.id===this.selection)?.title||['Уличный напор · Boom Bap','Движение квартала · Hip-Hop','Район на битах · Hip-Hop'][this.selection]||'Музыка Заметь наш стиль';}
 // Original short synth cues. They share the Web Audio master but do not restart music.
 cue(name){if(!this.effects||!this.ctx||this.ctx.state!=='running')return false;const t=this.ctx.currentTime+.002,gap={wheel:.11,token:.08,coin:.08,landing:.13,combo:.2,mission:.3}[name]??.08;if(t-(this.lastCue.get(name)??-Infinity)<gap)return false;this.lastCue.set(name,t);
  const tone=(hz,end,d,v,type='sine',delay=0)=>this.osc(type,hz,t+delay,d,v,this.master,end);
  if(name==='wheel'){this.noiseHit(t,.045,.013,650,'bandpass',this.master);}
  else if(name==='jump'){tone(320,540,.12,.055,'triangle');}
  else if(name==='landing'){this.noiseHit(t,.13,.095,420,'lowpass',this.master);tone(125,56,.13,.04);}
  else if(name==='coin'||name==='token'){tone(name==='token'?740:880,1180,.1,.038,'sine');tone(1250,1570,.12,.026,'triangle',.05);}
  else if(name==='combo'){for(let i=0;i<3;i++)tone(523*2**(i*3/12),783*2**(i*3/12),.12,.035,'triangle',i*.055);}
  else if(name==='mission'){for(let i=0;i<4;i++)tone([523,659,784,1046][i],null,.23,.043,'sine',i*.09);}
  else return false;return true;
 }
 motion(speed,dt,onSkate){if(!onSkate||speed<1||!this.effects){this.wheelDistance=0;return;}this.wheelDistance+=speed*dt;const stride=Math.max(.58,1.6-speed*.045);if(this.wheelDistance>=stride){this.wheelDistance%=stride;this.cue('wheel');}}
}
