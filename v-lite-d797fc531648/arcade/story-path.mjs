import {CITY_RAMPS,rampSample} from './new-district.mjs';
import {createSkate} from './skate.mjs';
import {DANCE_FLOOR} from './dance-battle.mjs';

export const STORY_START=Object.freeze({x:0,z:40,yaw:0});
export const STORY_STUDIO=Object.freeze({x:205,z:-55});
export const STORY_STAGE=Object.freeze({x:205,z:-50});
export const STORY_REWARD=Object.freeze({points:1500,coins:25});
export const STORY_TOKENS=Object.freeze([
 [205,-48],[199,-40],[193,-32],[187,-24],[181,-17],
 [175,-12],[169,-17],[163,-22],[157,-22],[151,-16],
 [151,-8],[151,2],[157,12],[165,20],[174,27]
].map(([x,z],id)=>Object.freeze({id,x,z,y:rampSample(x,z).height+.95})));
export const STORY_TITLES=Object.freeze([
 'Найди студию Заметь наш стиль','Встань на скейт','Собери 15 винилов',
 'Покори три рампы','Набери 2000 SP','Приедь на Street Dance Spot',
 'Пройди музыкальный баттл','Вернись к сцене Заметь наш стиль','Dance Finish'
]);
const finite=(v,min=0,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):0;
const int=(v,max=1e9)=>Math.floor(finite(v,0,max));
const validSet=(v,allowed)=>new Set(Array.isArray(v)?v.filter(x=>allowed.includes(x)):[]);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function storySave(value){
 const v=value&&typeof value==='object'?value:{},best=v.best&&typeof v.best==='object'?v.best:{},collected=validSet(v.collected,STORY_TOKENS.map(t=>t.id)),ramps=validSet(v.ramps,CITY_RAMPS.map(r=>r.id));
 let step=int(v.step,9),status=['idle','active','complete'].includes(v.status)?v.status:'idle';
 const stylePoints=int(v.stylePoints),battleScore=int(v.battleScore),battleAccuracy=int(v.battleAccuracy,100);
 if(status==='complete'&&(collected.size!==15||ramps.size!==3||stylePoints<2000||battleAccuracy<60)){status='active';step=8;}
 if(status==='active'){
  step=Math.min(step,8);
  if(step>=3&&collected.size<15)step=2;
  if(step>=4&&ramps.size<3)step=3;
  if(step>=5&&stylePoints<2000)step=4;
  if(step>=7&&battleAccuracy<60)step=6;
 }else if(status==='complete')step=9;else step=0;
 return{status,step,collected:[...collected],ramps:[...ramps],rampRoute:int(v.rampRoute,3),stylePoints,battleScore,battleAccuracy,time:finite(v.time,0,1e7),
  best:{completions:int(best.completions,1e6),time:finite(best.time,0,1e7),score:int(best.score),style:int(best.style),battle:int(best.battle)}};
}
export class PathToStage{
 constructor(j,data){this.j=j;const s=storySave(data);Object.assign(this,s);this.collected=new Set(s.collected);this.ramps=new Set(s.ramps);this.previous=null;this.armed=null;this.flying=null;}
 get running(){return this.status==='active';}
 get finished(){return this.status==='complete';}
 get progress(){return this.finished?1:this.running?this.step/STORY_TITLES.length:0;}
 get score(){return this.stylePoints+this.battleScore+this.collected.size*30+this.ramps.size*150+(this.finished?STORY_REWARD.points:0);}
 get objective(){
  if(!this.running)return null;
  const n=this.step,base={type:'story',label:STORY_TITLES[n],hint:''};
  if(n===0){const x=this.j.world.player.x,way=x<20?{x:25,z:18}:x<122?{x:128,z:18}:x<140?{x:146,z:-22}:STORY_STUDIO;return{...way,...base,hint:'Следуй за стрелкой через восточный проход к студии Заметь наш стиль.'};}
  if(n===1)return{...STORY_STAGE,...base,hint:'Нажми B или кнопку «Скейт». Дальше — музыкальный маршрут.'};
  if(n===2){const t=STORY_TOKENS.find(t=>!this.collected.has(t.id))||STORY_TOKENS.at(-1);return{...t,...base,label:`Винилы ${this.collected.size}/15`,hint:'Следуй за музыкальными жетонами на скейте.'};}
  if(n===3){const r=CITY_RAMPS.find(r=>!this.ramps.has(r.id))||CITY_RAMPS.at(-1),way=this.rampRoute===0?{x:146,z:-13}:this.rampRoute===1?{x:146,z:24}:this.rampRoute===2?{x:r.x,z:22}:{x:r.x,z:-10};return{...way,...base,label:`Рампы ${this.ramps.size}/3`,hint:this.rampRoute===3?'Разгоняйся по наклону и приземлись за рампой.':'Следуй к разгону, объезжая бордюры.'};}
  if(n===4)return{x:174,z:28,...base,label:`Стиль ${this.stylePoints}/2000 SP`,hint:'Пробел — Ollie; T / TRICK — выбранный трюк. Очки только после посадки.'};
  if(n===5){const p=this.j.world.player,way=p.x<198&&p.z<53?{x:174,z:58}:DANCE_FLOOR;return{...way,...base,hint:'Объедь граффити по верхней дорожке и доберись до танцпола.'};}
  if(n===6)return{...DANCE_FLOOR,...base,hint:'У танцпола нажми G или кнопку «Начать баттл».'};
  if(n===7)return{...STORY_STAGE,...base,label:'Сцена Заметь наш стиль открыта',hint:'Возвращайся к студии Заметь наш стиль. Пройденный маршрут сохранён.'};
  return{...STORY_STAGE,...base,hint:'Сойди со скейта и нажми R / ♫ или кнопку действия у сцены.'};
 }
 start(){const j=this.j;if(j.artifactQuest?.running||j.missions.running||j.skateChallenge||j.race||j.chase?.running||j.park.active||j.vehicle&&!j.skating)return false;
  this.status='active';this.step=0;this.collected.clear();this.ramps.clear();this.rampRoute=2;this.stylePoints=this.battleScore=this.battleAccuracy=this.time=0;
  this.previous=this.armed=this.flying=null;j.style.abort('',false);j.vehicle=null;j.transform(null,null);j.danceTime=0;
  Object.assign(j.world.player,{...STORY_START,y:j.ground(STORY_START.x,STORY_START.z),vx:0,vz:0,vy:0,speed:0,grounded:true,air:0,land:0,jumpBuffer:0,motionState:'idle'});
  j.invincible=6;j.emit('storyStep',{step:0,title:STORY_TITLES[0]});return true;
 }
 advance(){if(!this.running||this.step>=8)return false;this.step++;this.previous={...this.j.world.player};this.armed=this.flying=null;this.j.sparkle(this.j.world.player.x,this.j.world.player.y+.8,this.j.world.player.z,'#d6ffa2',14);this.j.emit('storyStep',{step:this.step,title:STORY_TITLES[this.step]});return true;}
 recover(announce=true){if(!this.running)return false;const j=this.j,p=j.world.player;
  const point=this.step===0?STORY_START:this.step===1||this.step===2?STORY_STAGE:this.step===3||this.step===4?{x:174,z:28,yaw:0}:this.step===5||this.step===6||this.step===7?{x:210,z:50,yaw:0}:STORY_STAGE;
  j.style.abort('',false);Object.assign(p,{x:point.x,z:point.z,y:j.ground(point.x,point.z),yaw:point.yaw||0,vx:0,vz:0,vy:0,speed:0,grounded:true,air:0,land:0,jumpBuffer:0,motionState:'idle'});
  j.vehicle=this.step>=2&&this.step<=5?createSkate(p):null;j.mount=0;j.pull=null;j.invincible=3;this.previous={...p};this.armed=this.flying=null;if(this.step===3)this.rampRoute=2;if(announce)j.emit('storyRecover');return true;
 }
 update(dt){if(!this.running)return;const j=this.j,p=j.world.player;this.time+=Math.max(0,dt);
  if(this.step===0&&distance(p,STORY_STUDIO)<8&&!j.vehicle)this.advance();
  else if(this.step===1&&j.skating)this.advance();
  else if(this.step===3&&j.skating&&this.rampRoute<3&&distance(p,this.objective)<3.8)this.rampRoute++;
  else if(this.step===2&&j.skating){
   const before=this.previous||p,dx=p.x-before.x,dy=p.y-before.y,dz=p.z-before.z,den=dx*dx+dy*dy+dz*dz;
   for(const t of STORY_TOKENS)if(!this.collected.has(t.id)){
    const u=den?Math.max(0,Math.min(1,((t.x-before.x)*dx+(t.y-before.y-1)*dy+(t.z-before.z)*dz)/den)):0;
    if(Math.hypot(t.x-before.x-dx*u,t.z-before.z-dz*u)<1.65&&Math.abs(t.y-before.y-dy*u-1)<1.45){this.collected.add(t.id);j.sparkle(t.x,t.y,t.z,'#d5ff8d',10);j.emit('storyToken',{count:this.collected.size});}
   }
   if(this.collected.size===STORY_TOKENS.length)this.advance();
  }else if(this.step===5&&j.skating&&distance(p,DANCE_FLOOR)<7)this.advance();
  else if(this.step===7&&distance(p,STORY_STAGE)<7)this.advance();
  this.previous={...p};
 }
 onSkateStep(v,result,before,styleGain=0){if(!this.running)return;
  if(this.step===3){const s=rampSample(v.x,v.z);
   if(v.grounded&&s.ramp&&s.height>.3)this.armed=s.ramp;
   if(result.tookOff&&this.armed){const r=CITY_RAMPS.find(r=>r.id===this.armed);if(Math.abs(before.x-r.x)<r.w/2&&v.z<1&&v.y>r.h-.15)this.flying=r.id;this.armed=null;}
   if(result.landed&&this.flying){const id=this.flying;this.flying=null;if(!result.collision&&v.bail<=0&&v.z<0&&!this.ramps.has(id)){this.ramps.add(id);this.rampRoute=0;this.j.emit('storyRamp',{count:this.ramps.size});if(this.ramps.size===CITY_RAMPS.length)this.advance();}}
  }
  if(this.step===4&&styleGain>0){this.stylePoints=Math.min(1e9,this.stylePoints+styleGain);if(this.stylePoints>=2000)this.advance();}
 }
 recordBattle(result,won,duration){if(!this.running||this.step!==6)return false;this.time+=Math.max(0,duration||0);if(!won||result.accuracy<60)return false;this.battleScore=result.score;this.battleAccuracy=result.accuracy;this.advance();return true;}
 finish(){if(!this.running||this.step!==8||this.j.vehicle||distance(this.j.world.player,STORY_STAGE)>=7)return false;
  this.status='complete';this.step=9;const first=this.best.completions===0,total=this.score;
  this.best.completions++;this.best.time=this.best.time?Math.min(this.best.time,this.time):this.time;this.best.score=Math.max(this.best.score,total);this.best.style=Math.max(this.best.style,this.stylePoints);this.best.battle=Math.max(this.best.battle,this.battleScore);
  if(first){this.j.score+=STORY_REWARD.points;this.j.bonusCoins+=STORY_REWARD.coins;}
  this.j.emit('storyComplete',{first,points:first?STORY_REWARD.points:0,coins:first?STORY_REWARD.coins:0,total,time:this.time});return true;
 }
 snapshot(){return{status:this.status,step:this.step,collected:[...this.collected],ramps:[...this.ramps],rampRoute:this.rampRoute,stylePoints:this.stylePoints,battleScore:this.battleScore,battleAccuracy:this.battleAccuracy,time:this.time,best:{...this.best}};}
}
