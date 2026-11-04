import{pedestrianPath}from'./city-navigation.mjs';
export const STREET_JAMS=[
 {id:'jam-park',x:190,z:10,name:'Джем «Парковый грув»',color:'#84e5bb'},
 {id:'jam-river',x:780,z:46.5,name:'Джем «Бит на набережной»',color:'#ebc779'},
 {id:'jam-red',x:980,z:46.5,name:'Джем «Красная волна»',color:'#ed8d91'},
 {id:'jam-island',x:1420,z:24,name:'Джем «Остров ритма»',color:'#b39be8'}
].map(j=>({...j,radius:5.5,hint:'Подойди пешком или на скейте · G / «Войти в джем». Покажи и повтори связку.'}));
export const STREET_PROPS=STREET_JAMS.flatMap(j=>[-1,1].map(side=>({x:j.x+side*6,z:j.z-3,w:1,d:1,h:1.8})));
export const BOSSES=[
 {id:'echo',x:595,z:44,name:'Эхо в капюшоне',color:'#7767a9',speed:8},
 {id:'static',x:1040,z:40,name:'Помеха',color:'#496e87',speed:10},
 {id:'shadow',x:1340,z:44,name:'Тень переулка',color:'#855b7c',speed:11}
];
export const jamAt=(p)=>STREET_JAMS.find(j=>Math.hypot(p.x-j.x,p.z-j.z)<j.radius&&Math.abs(p.y)<.6);
export class StreetBosses{
 constructor(j){this.j=j;this.items=BOSSES.map(b=>({...b,homeX:b.x,homeZ:b.z,state:'idle',timer:0,dodges:0,yaw:0,phase:0}));}
 update(dt){dt=Math.max(0,Math.min(.05,dt));const j=this.j,p=j.world.player;
 const protectedMode=j.story.running||j.missions.running||j.artifactQuest.running||j.contracts.running||j.race||j.skateChallenge||j.park.active||j.crew.running||j.chase?.running||j.power==='shade'||j.artifactQuest.powerActive('invisible')||j.vehicle&&!j.skating||!!jamAt(p);
 for(const b of this.items){b.phase+=dt;b.timer=Math.max(0,b.timer-dt);const distance=Math.hypot(p.x-b.x,p.z-b.z),homeDistance=Math.hypot(p.x-b.homeX,p.z-b.homeZ);
  if(protectedMode||homeDistance>18||Math.abs(p.y-j.ground(p.x,p.z))>2.5){if(b.state==='warn'||b.state==='charge'){b.state='return';b.timer=3;}}
  if(b.state==='idle'&&!protectedMode&&distance<8&&b.timer===0&&homeDistance<13){b.state='warn';b.timer=1.1;const d=distance||1;b.dx=(p.x-b.x)/d;b.dz=(p.z-b.z)/d;b.yaw=Math.atan2(-b.dx,-b.dz);b.hit=false;j.emit('hint',{message:b.name+': готовит рывок! Уйди в сторону. Уклонения: '+b.dodges+'/3.'});}
  else if(b.state==='warn'&&b.timer===0){b.state='charge';b.timer=1.1;}
  else if(b.state==='charge'){
   this.move(b,b.dx*b.speed*dt,b.dz*b.speed*dt);
   if(!b.hit&&!protectedMode&&distance<1.5&&j.invincible<=0){b.hit=true;j.invincible=3;j.stumble=.35;if(j.skating){j.vehicle.speed*=.45;j.style.abort('Помеха сбила комбо',true);}j.sparkle(p.x,p.y+1,p.z,b.color,8);j.emit('hint',{message:'Касание! Отойди в сторону перед следующим рывком.'});}
   if(b.timer===0){if(!b.hit)b.dodges++;b.state='return';b.timer=3;if(b.dodges>=3){j.award('Обойти босса: '+b.name,300);b.dodges=0;b.timer=18;j.emit('hint',{message:b.name+' устал. Проход свободен! Награда — один раз.'});}}
  }else if(b.state==='return'){
   b.pathCooldown=Math.max(0,(b.pathCooldown||0)-dt);const target=b.path?.[0]||[b.homeX,b.homeZ],dx=target[0]-b.x,dz=target[1]-b.z,l=Math.hypot(dx,dz),ox=b.x,oz=b.z;if(l>.15)this.move(b,dx/l*Math.min(l,dt*3),dz/l*Math.min(l,dt*3));else if(b.path?.length)b.path.shift();if(l>.2&&Math.hypot(b.x-ox,b.z-oz)<.005&&!b.pathCooldown){b.pathCooldown=2;b.path=pedestrianPath([b.x,b.z],[b.homeX,b.homeZ],(x,z)=>Math.hypot(x-b.homeX,z-b.homeZ)>20||j.ground(x,z)>.25||j.solid(x,z,j.ground(x,z),.75)).slice(1);}
   if(b.timer===0&&Math.hypot(b.x-b.homeX,b.z-b.homeZ)<.5){b.state='idle';b.timer=3;b.path=null;}
  }
 }
 }
 move(b,dx,dz){const j=this.j,y=j.ground(b.x,b.z),valid=(x,z)=>Math.abs(j.ground(x,z)-y)<.25&&!j.solid(x,z,j.ground(x,z),.7);
 if(valid(b.x+dx,b.z))b.x+=dx;if(valid(b.x,b.z+dz))b.z+=dz;
 }
}
