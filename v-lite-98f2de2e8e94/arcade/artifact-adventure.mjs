// Optional neighbourhood adventure. It does not share counters with the stage story.
export const ARTIFACT={x:145,z:-49};
export const ARTIFACT_STUDIO={x:205,z:-50};
export const ARTIFACT_BARRIER={x:180,z:-48,w:4,d:1.2,h:1.7};
export const ADVENTURE_ENEMIES=Object.freeze([
 {id:'pursuer',name:'Шорох',kind:'pursuer',x:138,z:-44,color:'#efaa78'},
 {id:'jumper',name:'Пружинка',kind:'jumper',x:149,z:-56,color:'#87dfcb'},
 {id:'guard',name:'Страж ритма',kind:'guard',x:148,z:-48,color:'#bca8e8'}
]);
export const ADVENTURE_ITEMS=Object.freeze([
 {id:'speed',name:'Скорость',x:132,z:-40,color:'#79e4d4',duration:12},
 {id:'invisible',name:'Невидимость',x:142,z:-38,color:'#a6b8ff',duration:11},
 {id:'jump',name:'Суперпрыжок',x:154,z:-42,color:'#f7d381',duration:12},
 {id:'strong',name:'Суперсила',x:171,z:-46,color:'#d9b0ef',duration:16}
]);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const finite=(value,min=0,max=1e6)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
export function artifactSave(value){const v=value&&typeof value==='object'?value:{};return{
 status:['idle','active','complete'].includes(v.status)?v.status:'idle',barrierBroken:v.barrierBroken===true,
 carrying:v.carrying===true,collected:Array.isArray(v.collected)?[...new Set(v.collected.filter(id=>ADVENTURE_ITEMS.some(p=>p.id===id)))]:[],
 power:ADVENTURE_ITEMS.some(p=>p.id===v.power)?v.power:null,powerTime:finite(v.powerTime,0,30),
 time:finite(v.time),bestTime:finite(v.bestTime),wins:Math.floor(finite(v.wins,0,1e5))};}
export class ArtifactAdventure{
 constructor(j,data){this.j=j;Object.assign(this,artifactSave(data));this.collected=new Set(this.collected);this.enemies=ADVENTURE_ENEMIES.map(d=>({...d,homeX:d.x,homeZ:d.z,state:'patrol',chaseTime:0,cooldown:0,hitCooldown:0,phase:0,y:0,yaw:0,speed:0,hopTime:0,alertReady:true}));}
 get running(){return this.status==='active';}
 get objective(){if(!this.running)return null;const p=this.j.world.player,target=this.carrying?ARTIFACT_STUDIO:ARTIFACT;
  const way=!this.carrying&&p.x<20?{x:25,z:-9}:!this.carrying&&p.x<122?{x:128,z:-9}:this.carrying&&!this.barrierBroken&&!this.powerActive('strong')&&p.x<178?{x:181,z:-42}:target;
  return{...way,type:'artifact',label:this.carrying?'Доставь артефакт в Заметь наш стиль':'Спаси музыкальный артефакт',hint:this.carrying?'Следуй к студии. Противники вскоре вернутся на свои места.':'Отыщи светящийся артефакт в Берёзовом парке.'};}
 start(){const j=this.j;if(j.story.running||j.missions.running||j.skateChallenge||j.race||j.chase?.running||j.park.active||j.vehicle&&!j.skating)return false;
  this.status='active';this.carrying=false;this.barrierBroken=false;this.collected.clear();this.power=null;this.powerTime=0;this.time=0;
  for(const e of this.enemies)Object.assign(e,{x:e.homeX,z:e.homeZ,state:'patrol',chaseTime:0,cooldown:0,hitCooldown:0,y:0,hopTime:0,alertReady:true});
  j.emit('artifactStart');return true;}
 powerActive(id){return this.running&&this.power===id&&this.powerTime>0;}
 barrierBlocks(x,z,y,r=.5){const b=ARTIFACT_BARRIER;return this.running&&!this.barrierBroken&&y<b.h-.1&&Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r;}
 breakBarrier(){const b=ARTIFACT_BARRIER,p=this.j.world.player;if(!this.running||this.barrierBroken||!this.powerActive('strong')||distance(p,b)>5)return false;
  this.barrierBroken=true;this.j.sparkle(b.x,1,b.z,'#e7c6ff',22);this.j.emit('artifactBarrier');return true;}
 collectPower(item){this.collected.add(item.id);this.power=item.id;this.powerTime=item.duration;const p=this.j.world.player;this.j.sparkle(p.x,p.y+1,p.z,item.color,18);this.j.emit('artifactPower',{name:item.name,id:item.id,duration:item.duration});}
 recover(){if(!this.running)return false;const j=this.j,p=j.world.player,at=this.carrying?{x:164,z:-42}:{x:128,z:-40};j.style.abort('',false);j.vehicle=null;j.pull=null;Object.assign(p,{...at,y:j.ground(at.x,at.z),vx:0,vz:0,vy:0,speed:0,grounded:true,air:0,land:0,jumpBuffer:0,motionState:'idle'});j.invincible=3;j.emit('artifactRecover');return true;}
 move(e,dt,x,z,speed){const j=this.j,dx=x-e.x,dz=z-e.z,length=Math.hypot(dx,dz)||1,step=speed*dt;const nx=e.x+dx/length*step,nz=e.z+dz/length*step,ox=e.x,oz=e.z;
  const pass=(x,z)=>{if(!j.solid(x,z,0,.54))return true;if(e.kind==='jumper'&&j.ground(x,z)<=.7&&!j.solid(x,z,.95,.54)){e.hopTime=.55;return true;}return false;};
  if(pass(nx,e.z))e.x=nx;if(pass(e.x,nz))e.z=nz;
  e.speed=Math.hypot(e.x-ox,e.z-oz)/Math.max(dt,.001);if(e.speed>.1)e.yaw=Math.atan2(-(e.x-ox),-(e.z-oz));}
 updateEnemy(e,dt){const j=this.j,p=j.world.player;e.phase+=dt*4;e.cooldown=Math.max(0,e.cooldown-dt);e.hitCooldown=Math.max(0,e.hitCooldown-dt);e.hopTime=Math.max(0,e.hopTime-dt);e.y=e.hopTime>0?Math.sin((1-e.hopTime/.55)*Math.PI)*.75:0;
  const radius=e.kind==='guard'?6:8,limit=e.kind==='guard'?5:e.kind==='jumper'?13:18,maxTime=e.kind==='guard'?3.5:e.kind==='jumper'?5:6,near=distance(e,p)<radius&&!this.powerActive('invisible'),leash=distance(e,{x:e.homeX,z:e.homeZ});
  if(distance(e,p)>radius+4)e.alertReady=true;
  if(e.state==='chase'){e.chaseTime+=dt;if(e.chaseTime>maxTime||leash>limit||distance(e,p)>13||this.powerActive('invisible')){e.state='return';e.cooldown=4;e.alertReady=false;}}
  else if(e.cooldown<=0&&e.alertReady&&near){e.state='chase';e.chaseTime=0;e.alertReady=false;j.emit('artifactEnemyAlert',{name:e.name});}
  if(e.state==='chase')this.move(e,dt,p.x,p.z,e.kind==='guard'?2.7:e.kind==='jumper'?3.4:3.9);
  else if(e.state==='return'){this.move(e,dt,e.homeX,e.homeZ,3.2);if(leash<.8)e.state='patrol';}
  else this.move(e,dt,e.homeX+Math.sin(e.phase*.24)*(e.kind==='guard'?1.5:2),e.homeZ+Math.cos(e.phase*.21)*(e.kind==='guard'?1.5:2),1.2);
  if(distance(e,p)<1.35&&p.y<2&&e.y<.6&&e.hitCooldown<=0&&j.invincible<=0&&!this.powerActive('invisible')){
   e.hitCooldown=3;e.state='return';e.cooldown=4;e.alertReady=false;j.invincible=2.4;
   if(j.skating){j.vehicle.speed*=.55;j.vehicle.hit=1.2;}else{j.stumble=.28;p.vx=(p.x-e.x)*2;p.vz=(p.z-e.z)*2;}
   j.emit('artifactEnemyTouch',{name:e.name});
  }
 }
 update(dt){if(!this.running)return;const j=this.j,p=j.world.player;this.time+=dt;
  if(this.powerTime>0){this.powerTime=Math.max(0,this.powerTime-dt);if(!this.powerTime){const name=this.power;this.power=null;j.emit('artifactPowerEnd',{id:name});}}
  for(const item of ADVENTURE_ITEMS)if(!this.collected.has(item.id)&&distance(p,item)<1.6&&p.y<2.4)this.collectPower(item);
  for(const e of this.enemies)this.updateEnemy(e,dt);
  if(!this.carrying&&distance(p,ARTIFACT)<1.8&&p.y<2.5){this.carrying=true;j.emit('artifactPicked');}
  if(this.carrying&&distance(p,ARTIFACT_STUDIO)<6){this.status='complete';this.wins++;this.bestTime=this.bestTime?Math.min(this.bestTime,this.time):this.time;const first=this.wins===1;if(first){j.score+=650;j.bonusCoins+=12;}j.emit('artifactComplete',{first,time:this.time,points:first?650:0,coins:first?12:0});}
 }
 snapshot(){return{status:this.status,carrying:this.carrying,barrierBroken:this.barrierBroken,collected:[...this.collected],power:this.power,powerTime:this.powerTime,time:this.time,bestTime:this.bestTime,wins:this.wins};}
}
