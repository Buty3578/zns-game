import{legacyRampSample}from'./legacy-ramps.mjs';
import{streetGround,streetBlocked}from'./street-skate.mjs';
import{urbanBlocked}from'./urban-infill.mjs';
import{capitalGround,capitalBlocked}from'./capital-districts.mjs';
import{cityGround,cityBlocked}from'./new-district.mjs';
import{moskovskyGround,moskovskyBlocked}from'./moskovsky.mjs';
import{solntsevoGround,solntsevoBlocked}from'./solntsevo.mjs';
import{blocked,COINS,STAGE,BUILDINGS}from'./world.mjs';
import{surfaceAt,platformBlocked}from'./systems.mjs';
import{approach,angleDelta}from'./motion.mjs';
export const POWERS={web:{name:'Луч-паук',color:'#51cbe8',jump:12.6,radius:23,icon:'✳'},strong:{name:'Бит-богатырь',color:'#93ed68',jump:11.8,radius:22,icon:'✦'},shade:{name:'Неон-тень',color:'#a399ff',jump:7.6,radius:21,icon:'◌'}};
export const FRIENDS=[{id:'strong',name:'Бум',x:-29,z:23},{id:'web',name:'Пруж',x:25,z:32},{id:'shade',name:'Шёпот',x:15,z:-22}];
export const GATE={x:-34,z:29.5,w:6.1,d:.6,h:3.8},CHEST={x:-34,z:25.5};
export const ROOF={x:32,z:27,w:4.6,d:4.6,h:3.35};
export const GHOST_GATE={x:10,z:-20.7,w:7,d:.35,h:3.6},GHOST_CHEST={x:10,z:-17};
export const SAFE={x:25,z:40},CHASE_START={x:-25,z:33};
export const WALLS=[{x:-37.2,z:26.2,w:.5,d:7,h:3.8},{x:-30.8,z:26.2,w:.5,d:7,h:3.8},{x:-34,z:22.7,w:6.5,d:.5,h:3.8},{x:6.5,z:-17.5,w:.4,d:6.7,h:3.8},{x:13.5,z:-17.5,w:.4,d:6.7,h:3.8},{x:10,z:-14.2,w:7.4,d:.4,h:3.8}];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),inside=(x,z,b,r=.42)=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r;
export function createMonster(id,x,z){return{id,x,z,homeX:x,homeZ:z,y:0,yaw:0,phase:id*2,state:'patrol',stun:0,touchCooldown:0,speed:0};}
export class DistrictAdventure{
 constructor(world,data={}){this.world=world;this.time=0;this.events=[];this.particles=[];this.monsters=[createMonster(0,-11,39),createMonster(1,-23,5),createMonster(2,26,-19)];this.friends=FRIENDS.map(f=>({...f,originX:f.x,originZ:f.z}));this.power=null;this.powerSource=null;this.powerDistance=0;this.powerLock=0;this.abilityCooldown=0;this.invincible=0;this.stumble=0;this.danceTime=0;this.danceVariant=0;this.pull=null;this.webLine=null;this.gateOpen=!!data.gateOpen;this.secrets=new Set(data.secrets||[]);this.achievements=new Set(data.achievements||[]);this.score=Number(data.score)||0;this.bonusCoins=Number(data.bonusCoins)||0;this.quest=Math.max(0,Math.min(5,Number(data.quest)||0));this.questCoins=Number(data.questCoins)||0;this.celebrated=!!data.celebrated;this.chase=null;this.chaseReady=false;this.race=null;this.raceReady=false;this.vehicle=null;this.vehicles=[];this.mount=0;this.eventTimer=24+Math.random()*8;this.surprise=null;this.randomSeed=(Math.random()*1000000)|0;this.world.isBlocked=(x,z,y)=>this.solid(x,z,y);this.world.groundAt=(x,z)=>this.ground(x,z);}
 emit(type,data={}){this.events.push({type,...data});}
 drain(){return this.events.splice(0);}
 ground(x,z){let h=Math.max(legacyRampSample(x,z).height,surfaceAt(x,z),cityGround(x,z),moskovskyGround(x,z),solntsevoGround(x,z),capitalGround(x,z),streetGround(x,z));if(inside(x,z,ROOF,-.06))h=Math.max(h,ROOF.h);if(Math.abs(x-STAGE.x)<9.5&&z< -53&&z> -63)h=Math.max(h,.7);if(Math.abs(x-STAGE.x)<7&&z< -50.5&&z>=-53)h=Math.max(h,.25);return h;}
 solid(x,z,y,r=.5){if(legacyRampSample(x,z).height>y+.58)return true;if(urbanBlocked(x,z,r)||streetBlocked(x,z,y,r)||capitalBlocked(x,z,y,r)||cityBlocked(x,z,y,r)||moskovskyBlocked(x,z,y,r)||solntsevoBlocked(x,z,y,r))return true;if(blocked(x,z,r)||platformBlocked(x,z,y))return true;if(inside(x,z,ROOF,r)&&y<ROOF.h-.1)return true;for(const b of WALLS)if(y<b.h-.12&&inside(x,z,b,r))return true;if(!this.gateOpen&&y<GATE.h-.1&&inside(x,z,GATE,r))return true;if(this.power!=='shade'&&y<GHOST_GATE.h-.1&&inside(x,z,GHOST_GATE,r))return true;return false;}
 sparkle(x,y,z,color='#ffdd74',count=12){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;this.particles.push({x,y,z,vx:Math.sin(a)*(1.8+Math.random()),vy:2+Math.random()*3,vz:Math.cos(a)*(1.8+Math.random()),life:.8+Math.random()*.5,color});}if(this.particles.length>120)this.particles.splice(0,this.particles.length-120);}
 award(name,points=150){if(this.achievements.has(name))return;this.achievements.add(name);this.score+=points;this.emit('achievement',{name,points});}
 transform(kind,source){if(this.power===kind)return;this.power=kind;this.powerSource=source;this.world.jumpSpeed=POWERS[kind]?.jump||7.6;const p=this.world.player;this.sparkle(p.x,1.5+p.y,p.z,POWERS[kind]?.color||'#fff0a8',24);this.emit('transform',{kind,name:POWERS[kind]?.name||'Снова танцор Заметь наш стиль'});if(kind)this.award('Первое превращение',100);}
 powerUpdate(){if(this.vehicle)return;const p=this.world.player;if(this.power){const f=this.friends.find(f=>f.id===this.powerSource);this.powerDistance=dist(p,f);if(this.powerDistance>POWERS[this.power].radius){this.transform(null,null);this.powerLock=1;}}
  if(this.powerLock<=0&&!this.pull){const f=this.friends.find(f=>dist(p,f)<2.55&&p.y<1.5);if(f)this.transform(f.id,f.id);}
 }
 ability(){if(this.vehicle||this.abilityCooldown>0)return false;const p=this.world.player;
  if(this.power==='strong'){this.abilityCooldown=1;this.sparkle(p.x,p.y+.5,p.z,'#c3ff79',22);if(!this.gateOpen&&dist(p,GATE)<5.2){this.gateOpen=true;this.score+=200;this.emit('gate');this.award('Сила ритма',150);}else{p.jumpBuffer=.18;this.world.jumpSpeed=14;for(const m of this.monsters)if(dist(m,p)<7){m.stun=4;m.state='dizzy';}this.emit('slam');}return true;}
  if(this.power==='web'){this.abilityCooldown=1.2;const m=this.monsters.filter(m=>dist(m,p)<10).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(m&&(this.secrets.has('roof')||dist(p,ROOF)>20)){m.stun=5;m.state='web';this.webLine={from:{...p},to:{...m,y:1},life:.65};this.emit('web');}else if(dist(p,ROOF)<20){this.pull={from:{...p},to:{x:32,z:27,y:ROOF.h},time:0,duration:1.05};this.webLine={from:{...p},to:{x:32,z:27,y:6.8},life:1.1};this.emit('pull');}else{this.abilityCooldown=.2;this.emit('hint',{message:'Подойди ближе к голубому маяку на крыше или к монстру.'});}return true;}
  if(this.power==='shade'){this.abilityCooldown=2;this.sparkle(p.x,p.y+1,p.z,'#a4fff1',12);for(const m of this.monsters)if(dist(m,p)<9){m.stun=2;m.state='confused';}this.emit('hint',{message:'Тебя не видно! Пройди сквозь бирюзовую дверь у Шёпота.'});return true;}
  this.emit('hint',{message:'Обними цветного монстра: он поделится суперсилой!'});return false;
 }
 dance(){if(this.vehicle)return false;this.park?.dance();this.danceTime=4.8;this.danceVariant=(this.danceVariant+1)%4;const p=this.world.player;this.sparkle(p.x,p.y+.2,p.z,'#eea1ff',10);for(const m of this.monsters)if(dist(m,p)<8){m.stun=5;m.state='dance';}if(this.surprise?.type==='party'&&dist(p,this.surprise)<12){this.score+=250;this.surprise=null;this.award('Танцует весь двор');this.emit('hint',{message:'Уличная вечеринка! +250 очков за танец.'});}return true;}
 moveMonster(m,dt,dx,dz,speed){const l=Math.hypot(dx,dz)||1,ox=m.x,oz=m.z,sx=dx/l*speed*dt,sz=dz/l*speed*dt;if(!this.solid(m.x+sx,m.z,0,.65))m.x+=sx;if(!this.solid(m.x,m.z+sz,0,.65))m.z+=sz;if(Math.hypot(m.x-ox,m.z-oz)<.01&&speed>0){const turn=Math.sin(m.phase*.23)>0?1:-1;if(!this.solid(m.x+turn*speed*dt,m.z,0,.65))m.x+=turn*speed*dt;else if(!this.solid(m.x,m.z+turn*speed*dt,0,.65))m.z+=turn*speed*dt;}m.speed=Math.hypot(m.x-ox,m.z-oz)/dt;if(m.speed>.1)m.yaw+=angleDelta(m.yaw,Math.atan2(-(m.x-ox),-(m.z-oz)))*(1-Math.exp(-dt*7));}
 updateMonsters(dt){const p=this.world.player;for(const f of this.friends){f.x=f.originX+Math.sin(this.time*.6+f.originX)*.7;f.z=f.originZ+Math.cos(this.time*.7+f.originX)*.7;}
  for(const m of this.monsters){m.phase+=dt*(m.state==='chase'?7:3);m.touchCooldown=Math.max(0,m.touchCooldown-dt);m.stun=Math.max(0,m.stun-dt);if(m.stun>0){m.speed=0;continue;}const hidden=this.power==='shade'||this.artifactQuest?.powerActive('invisible'),sees=!hidden&&p.y<2.8&&dist(m,p)<(m.state==='chase'?16:10)&&this.danceTime<=0,forced=this.chase?.running&&m.id===0;
   if((sees||forced)&&!this.vehicle&&!hidden){m.state='chase';const gap=dist(m,p)-1.25;if(gap>=0)this.moveMonster(m,dt,p.x-m.x,p.z-m.z,Math.min(forced?5.8:3.7,gap/Math.max(dt,.001)));else this.moveMonster(m,dt,m.x-p.x||.001,m.z-p.z,Math.min(4,-gap/Math.max(dt,.001)));}else{m.state='patrol';const target={x:m.homeX+Math.sin(this.time*.35+m.id*2)*4,z:m.homeZ+Math.cos(this.time*.35+m.id*2)*3};this.moveMonster(m,dt,target.x-m.x,target.z-m.z,dist(m,target)>.6?1.4:0);}
   if(dist(m,p)<1.35&&p.y<1.65&&this.invincible<=0&&!hidden&&!this.vehicle){this.invincible=2.7;this.stumble=.38;m.stun=1.7;m.state='laugh';const a=Math.atan2(p.x-m.x,p.z-m.z);p.vx=Math.sin(a)*8;p.vz=Math.cos(a)*8;p.vy=4.5;this.sparkle(p.x,p.y+.8,p.z,'#ffbdc4',10);this.emit('bump');this.park?.bump();if(this.chase?.running){this.chase.hits++;if(this.chase.hits>=3)this.failChase();}}
  }
 }
 update(dt,input={}){dt=Math.min(dt,.05);this.time+=dt;this.powerLock-=dt;this.abilityCooldown=Math.max(0,this.abilityCooldown-dt);this.invincible=Math.max(0,this.invincible-dt);this.stumble=Math.max(0,this.stumble-dt);this.danceTime=Math.max(0,this.danceTime-dt);this.mount=Math.max(0,this.mount-dt);
  const p=this.world.player,ax=input.x||0,az=input.z||0,mag=Math.min(1,Math.hypot(ax,az));let picked=[];
  if(this.vehicle){this.updateVehicle(dt,input);picked=this.world.collect();this.world.elapsed+=dt;}
  else if(this.pull){const a=this.pull;a.time+=dt;const u=Math.min(1,a.time/a.duration),v=u*u*(3-2*u);p.x=a.from.x+(a.to.x-a.from.x)*v;p.z=a.from.z+(a.to.z-a.from.z)*v;p.y=a.from.y+(a.to.y-a.from.y)*v+Math.sin(u*Math.PI)*3.3;p.vy=0;p.vx=p.vz=0;p.air=1;if(u>=1){this.pull=null;p.grounded=true;p.air=0;this.award('Выше крыш');}this.world.elapsed+=dt;}
  else{if(mag>.15)this.danceTime=0;const speed=(this.stumble>0?0:input.dash?16:input.sprint?10.2:6.6)*(this.artifactQuest?.powerActive('speed')?1.4:1),yaw=input.yaw||0,dx=(ax*Math.cos(yaw)+az*Math.sin(yaw))*speed,dz=(-ax*Math.sin(yaw)+az*Math.cos(yaw))*speed;picked=this.world.update(dt,dx,dz,Number.isFinite(input.facingYaw)?input.facingYaw:undefined);if(this.world.lastMotion.landed&&this.world.lastMotion.impact>.4)this.sparkle(p.x,p.y+.15,p.z,'#eeead1',7);}
  if(picked.length){this.score+=picked.length*30;this.questCoins+=picked.length;this.emit('coins',{count:picked.length});}
  this.updateMonsters(dt);this.powerUpdate();this.updateSecrets();this.updateQuests(dt);this.updateSurprises(dt);
  if(this.webLine){this.webLine.life-=dt;if(this.webLine.life<=0)this.webLine=null;}
  for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy-=7*dt;}this.particles=this.particles.filter(q=>q.life>0);
 }
 updateSecrets(){const p=this.world.player;if(this.gateOpen&&dist(p,CHEST)<1.75&&!this.secrets.has('strong')){this.secrets.add('strong');this.bonusCoins+=12;this.score+=300;this.sparkle(p.x,p.y+1,p.z,'#ffc95e',20);this.emit('secret',{name:'Тайник Бит-богатыря',coins:12});}
  if(dist(p,ROOF)<1.7&&p.y>3&&!this.secrets.has('roof')){this.secrets.add('roof');this.bonusCoins+=8;this.award('Музыка над городом',300);this.emit('secret',{name:'Золотая пластинка на крыше',coins:8});}
  if(this.power==='shade'&&dist(p,GHOST_CHEST)<1.65&&!this.secrets.has('shade')){this.secrets.add('shade');this.bonusCoins+=10;this.award('Секрет невидимки',300);this.emit('secret',{name:'Комната неоновых нот',coins:10});}
 }
 snapshot(){return{quest:this.quest,questCoins:this.questCoins,gateOpen:this.gateOpen,secrets:[...this.secrets],achievements:[...this.achievements],score:this.score,bonusCoins:this.bonusCoins,celebrated:this.celebrated};}
}
