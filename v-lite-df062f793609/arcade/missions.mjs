import{TRICKS}from'./skate-style.mjs';
import{CITY_RAMPS,rampSample}from'./new-district.mjs';
import{createSkate}from'./skate.mjs';
const point=([x,z,ramp])=>({x,z,...(ramp?{ramp}:{})});
const tokens=coords=>coords.map(([x,z],id)=>({id,x,z,y:rampSample(x,z).height+.95}));
export const MISSIONS=[
 {id:'first',title:'Первый заезд',description:'Проедь короткую трассу и собери 10 винилов.',reward:250,coins:5,start:{x:174,z:28,yaw:0},points:[[174,-12],[146,-22]].map(point),tokens:tokens([[174,24],[174,20],[174,14],[174,10],[174,7],[174,-10],[171,-17],[166,-22],[158,-22],[150,-22]])},
 {id:'ramps',title:'Покори рампы',description:'Проедь с вылетом и приземлением все три рампы, затем доберись до финиша.',reward:400,coins:8,start:{x:158,z:22,yaw:0},points:[[158,12],[158,-9,'low'],[163,-16],[163,28],[174,28],[174,14],[174,-9,'medium'],[179,-16],[179,28],[190,28],[190,17],[190,-10,'high'],[205,-22]].map(point),tokens:[]},
 {id:'music',title:'Музыкальный маршрут',description:'Собери 15 винилов и приезжай к уличному танцполу.',reward:500,coins:10,start:{x:174,z:28,yaw:Math.PI},points:[[174,52],[210,50]].map(point),tokens:tokens([[174,32],[174,36],[174,40],[174,44],[174,48],[174,52],...[178,182,186,190,194,198,202,206].map(x=>[x,52]),[210,50]])}
 ];
MISSIONS.push({...MISSIONS[1],id:'style',title:'Стиль на 2000',description:'Набери 2000 Style Points: три рампы, минимум три вида трюков и два приземления с комбо ×2 или ×3.',reward:600,coins:12,styleGoal:2000});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
// Only canonical IDs/indices are saved; arbitrary positions can never become respawn points.
export function missionSave(value){
 const v=value&&typeof value==='object'?value:{},wins=Array.isArray(v.wins)?[...new Set(v.wins.filter(id=>MISSIONS.some(m=>m.id===id)))]:[];
 const a=v.active,m=MISSIONS.find(m=>m.id===a?.id);if(!m)return{wins,active:null};
 const filter=(items,valid)=>Array.isArray(items)?[...new Set(items.filter(valid))]:[];
 return{wins,active:{id:m.id,status:a.status==='complete'&&wins.includes(m.id)?'complete':'active',index:Number.isInteger(a.index)?Math.max(0,Math.min(m.points.length-1,a.index)):0,
 collected:filter(a.collected,id=>Number.isInteger(id)&&id>=0&&id<m.tokens.length),ramps:filter(a.ramps,id=>CITY_RAMPS.some(r=>r.id===id)),stylePoints:Number.isSafeInteger(a.stylePoints)?Math.max(0,Math.min(1e9,a.stylePoints)):0,combos:Number.isSafeInteger(a.combos)?Math.max(0,Math.min(1e6,a.combos)):0,tricks:filter(a.tricks,id=>Object.hasOwn(TRICKS,id)),time:finite(a.time)?Math.max(0,a.time):0}};
}
export class MusicMissions{
 constructor(journey,data){this.j=journey;const s=missionSave(data);this.wins=new Set(s.wins);this.active=s.active?{...s.active,collected:new Set(s.active.collected),ramps:new Set(s.active.ramps),tricks:new Set(s.active.tricks)}:null;this.previous=null;this.armed=null;this.flying=null;if(this.active?.status==='active')this.recover(false);}
 get definition(){return MISSIONS.find(m=>m.id===this.active?.id);}
 get running(){return this.active?.status==='active';}
 get checkpoint(){const a=this.active,m=this.definition;return a&&m?(a.index?{...m.points[a.index-1],yaw:Math.atan2(-(m.points[a.index].x-m.points[a.index-1].x),-(m.points[a.index].z-m.points[a.index-1].z))}:m.start):null;}
 start(id){const j=this.j,m=MISSIONS.find(m=>m.id===id);if(!m||j.story?.running||j.crew?.running||j.artifactQuest?.running||j.race||j.chase||j.park.active||j.skateChallenge||j.vehicle&&!j.skating)return false;
  if(m.styleGoal)this.j.style.resetRun();this.active={stylePoints:0,combos:0,tricks:new Set(),id,status:'active',index:0,collected:new Set(),ramps:new Set(),time:0};this.recover(false);j.emit('missionStart',{title:m.title});return true;}
 cancel(){this.active=null;this.previous=this.armed=this.flying=null;}
 recover(announce=true){if(!this.running)return false;const j=this.j,p=j.world.player,c=this.checkpoint,y=j.ground(c.x,c.z);j.style?.abort('Возврат к точке — очки полёта потеряны',announce);
  Object.assign(p,{x:c.x,z:c.z,y,yaw:c.yaw||0,vx:0,vz:0,vy:0,speed:0,grounded:true,air:0,land:0,moveBlend:0,runBlend:0,jumpBuffer:0,coyote:.12,motionState:'idle'});
  j.transform(null,null);j.vehicle=createSkate(p);j.mount=0;j.pull=null;j.danceTime=0;j.invincible=3;this.previous={...p};this.armed=this.flying=null;if(announce)j.emit('missionRespawn');return true;}
 get objective(){const a=this.active,m=this.definition;if(!a)return null;let target=m.points[a.index];
  if(a.index===m.points.length-1&&a.collected.size<m.tokens.length)target=m.tokens.find(t=>!a.collected.has(t.id));
  return{...target,type:'musicMission',label:m.title+' · '+(m.styleGoal?`${a.stylePoints}/${m.styleGoal} SP · ${a.ramps.size}/3 рампы`:m.tokens.length?`${a.collected.size}/${m.tokens.length} винилов`:`${a.ramps.size}/3 рампы`),hint:a.status==='complete'?'Миссия завершена. Повторить можно в журнале.':m.description+(m.styleGoal?' Сейчас: '+a.tricks.size+'/3 вида, '+a.combos+'/2 комбо. TRICK: на земле — прыжок с трюком, в воздухе — трюк.':'')+' Зелёные кольца — контрольные точки. Если пропустил рампу, нажми ↶ Точка.'};
 }
 update(dt){if(!this.running)return;const a=this.active,m=this.definition,j=this.j,p=j.world.player;a.time+=dt;
  const before=this.previous||p;
  // Swept pickup prevents skipping a token at high speed; vertical contact matters too.
  const dx=p.x-before.x,dy=p.y-before.y,dz=p.z-before.z,den=dx*dx+dy*dy+dz*dz;
  for(const t of m.tokens)if(!a.collected.has(t.id)){
   const u=den?Math.max(0,Math.min(1,((t.x-before.x)*dx+(t.y-before.y-1)*dy+(t.z-before.z)*dz)/den)):0;
   if(Math.hypot(t.x-before.x-dx*u,t.z-before.z-dz*u)<1.65&&Math.abs(t.y-before.y-dy*u-1)<1.45){a.collected.add(t.id);j.sparkle(t.x,t.y,t.z,'#d5ff8d',10);j.emit('musicToken',{count:a.collected.size,total:m.tokens.length});}
  }
  if(j.skating){const s=rampSample(p.x,p.z);if(p.grounded&&s.ramp&&s.height>.3)this.armed=s.ramp;
   if(!p.grounded&&before.grounded&&this.armed){const r=CITY_RAMPS.find(r=>r.id===this.armed);if(Math.abs(p.x-r.x)<r.w/2&&p.z<1&&p.y>r.h-.15)this.flying=r.id;this.armed=null;}
   if(p.grounded&&!before.grounded&&this.flying){const r=CITY_RAMPS.find(r=>r.id===this.flying);if(p.z<0)a.ramps.add(r.id);this.flying=null;}
  }else this.armed=this.flying=null;
  const target=m.points[a.index],last=a.index===m.points.length-1;
  if(j.skating&&p.grounded&&distance(p,target)<2.7&&(!target.ramp||a.ramps.has(target.ramp))&&(!last||a.collected.size===m.tokens.length&&(!['ramps','style'].includes(m.id)||a.ramps.size===3)&&(!m.styleGoal||a.stylePoints>=m.styleGoal&&a.tricks.size>=3&&a.combos>=2))){
   if(!last){a.index++;j.emit('missionCheckpoint',{index:a.index});j.sparkle(p.x,p.y+.4,p.z,'#9feedd',12);}
   else{a.status='complete';const first=!this.wins.has(m.id);this.wins.add(m.id);if(first){j.score+=m.reward;j.bonusCoins+=m.coins;}j.vehicle.speed=0;j.emit('missionComplete',{id:m.id,title:m.title,first,points:first?m.reward:0,coins:first?m.coins:0,time:a.time});}
  }
  this.previous={...p};
 }
 recordStyle(e){const a=this.active;if(!this.running||!this.definition.styleGoal)return;a.stylePoints=Math.min(1e9,a.stylePoints+e.points);a.tricks.add(e.kind);if(e.multiplier>=2)a.combos++;}
 snapshot(){const a=this.active;return{wins:[...this.wins],active:a?{id:a.id,status:a.status,index:a.index,time:a.time,stylePoints:a.stylePoints,combos:a.combos,tricks:[...a.tricks],collected:[...a.collected],ramps:[...a.ramps]}:null};}
}
