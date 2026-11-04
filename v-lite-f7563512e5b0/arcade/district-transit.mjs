import{trainPassengers}from'./train-passengers.mjs';
import{commuterAtTime,COMMUTER_STOPS}from'./commuter.mjs';
// Ambient transport only. Player car/motorcycle/skate controllers stay in Journey.
export const TRAIN_TRACK={minX:389,maxX:549,z:-86};
export const BUS_ROUTE=[[268,-16],[363,-16],[369,-10],[369,42],[363,48],[268,48],[262,42],[262,-10]];
const legs=BUS_ROUTE.map((a,i)=>{const b=BUS_ROUTE[(i+1)%BUS_ROUTE.length];return Math.hypot(b[0]-a[0],b[1]-a[1]);});
export const BUS_LOOP_LENGTH=legs.reduce((a,b)=>a+b,0);
const wrap=n=>((n%BUS_LOOP_LENGTH)+BUS_LOOP_LENGTH)%BUS_LOOP_LENGTH;
export const BUS_STOPS=[
 {id:'north',x:302,z:-10,progress:34,name:'Московский · автобусная остановка'},
 {id:'south',x:333,z:54,progress:legs.slice(0,4).reduce((a,b)=>a+b,0)+30,name:'Московский · магазины'}
];
export function busAt(progress){
 let left=wrap(progress);
 for(let i=0;i<BUS_ROUTE.length;i++){
  if(left<=legs[i]){const a=BUS_ROUTE[i],b=BUS_ROUTE[(i+1)%BUS_ROUTE.length],u=left/legs[i];return{x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,yaw:Math.atan2(a[0]-b[0],a[1]-b[1])};}
  left-=legs[i];
 }
 return{x:268,z:-16,yaw:-Math.PI/2};
}
export function busStopGeometry(b,stop){
 const {x,z}=stop;b.box([x,.12,z],[8,.24,3.4],'#c7c7bb');
 b.box([x,2.7,z],[5,.18,2.3],'#689d9c');
 for(const s of[-1,1])b.box([x+s*2.2,1.4,z+.7],[.12,2.8,.12],'#526c7c');
 b.box([x+3,1.6,z],[.12,3.2,.12],'#667e8d');
 b.box([x+3,3,z],[.9,.85,.08],'#5c95b2');b.box([x+3,3,z+.05],[.5,.27,.02],'#e9f0dd');
}
export function trainStationGeometry(at){
 const {minX,maxX,z}=TRAIN_TRACK;
 for(let x=minX;x<maxX;x+=8)at(x+4,z,b=>{
  b.box([x+4,-.005,z],[8,.04,4.2],'#878a88');
  for(let s=0;s<8;s+=2)b.box([x+s+.5,.04,z],[.35,.08,3.8],'#8b7d70');
  for(const side of[-1,1])b.box([x+4,.13,z+side*1.1],[8,.12,.09],'#a8afb0');
 });
 for(const station of COMMUTER_STOPS)at(station.x,-78,b=>{b.group([station.x-484,0,0],0,()=>{
  b.box([484,.07,-78],[29,.14,7],'#c6c7bc');
  b.box([484,.15,-81.2],[29,.025,.12],'#f4dca0');
  b.box([484,3,-78],[16,.2,5],'#607b91');
  for(const x of[477,491])b.box([x,1.5,-78],[.14,3,.14],'#627a88');
 });});
}
export class DistrictTransit{
 constructor(){
  this.time=0;this.warned=false;
  this.buses=[0,BUS_LOOP_LENGTH/2].map((progress,i)=>{
   const nextStop=BUS_STOPS.map((s,index)=>({index,d:wrap(s.progress-progress)})).sort((a,b)=>a.d-b.d)[0].index;
   return{progress,speed:0,dwell:0,stops:0,nextStop,color:i?'#d3bd86':'#89bdb5',...busAt(progress)};
  });
 }
 get trainX(){return commuterAtTime(this.time).x;}
 update(dt,j){
  dt=Math.min(.05,Math.max(0,dt));this.time+=dt;if(j.commuterTime>0&&j.commuterTime!==this.lastJourneyTime)this.time=j.commuterTime;this.lastJourneyTime=j.commuterTime;const p=j.world.player;
  for(const bus of this.buses){
   if(bus.dwell>0){bus.dwell=Math.max(0,bus.dwell-dt);continue;}
   const toStop=wrap(BUS_STOPS[bus.nextStop].progress-bus.progress);
   const ahead=busAt(bus.progress+4+bus.speed*bus.speed/12);
   const blocked=p.y<2.6&&Math.hypot(p.x-ahead.x,p.z-ahead.z)<3.4;
   const following=this.buses.some(other=>other!==bus&&wrap(other.progress-bus.progress)<11+bus.speed);
   let target=blocked||following?0:Math.min(5.6,Math.sqrt(12*toStop));
   bus.speed+=Math.max(-6*dt,Math.min(2.3*dt,target-bus.speed));
   let step=Math.min(toStop,bus.speed*dt),next=busAt(bus.progress+step);
   // Check the whole footprint, including overhang, before moving through scenery.
   let obstacle=false;
   for(const s of[-1,1])for(const f of[-1,0,1]){
    const x=next.x+Math.cos(next.yaw)*s*1.1-Math.sin(next.yaw)*f*3.2;
    const z=next.z-Math.sin(next.yaw)*s*1.1-Math.cos(next.yaw)*f*3.2;
    if(j.solid(x,z,0,.15))obstacle=true;
   }
   // Final overlap guard: even at 20 Hz a bus cannot advance into a stationary player.
   const dx=p.x-next.x,dz=p.z-next.z,side=dx*Math.cos(next.yaw)-dz*Math.sin(next.yaw),front=-dx*Math.sin(next.yaw)-dz*Math.cos(next.yaw);
   if(obstacle||(p.y<2.6&&Math.abs(side)<1.65&&Math.abs(front)<3.75)){step=0;bus.speed=0;next=busAt(bus.progress);}
   bus.progress=wrap(bus.progress+step);Object.assign(bus,next);
   if(!obstacle&&!blocked&&toStop<=step+.025){bus.progress=BUS_STOPS[bus.nextStop].progress;Object.assign(bus,busAt(bus.progress));bus.dwell=4;bus.speed=0;bus.stops++;bus.nextStop=(bus.nextStop+1)%BUS_STOPS.length;}
  }
  // A player who moves into a stopped bus is gently placed beside its body.
  for(const bus of this.buses){
   const dx=p.x-bus.x,dz=p.z-bus.z,c=Math.cos(bus.yaw),s=Math.sin(bus.yaw),side=dx*c-dz*s,front=-dx*s-dz*c;
   if(p.y>=2.6||Math.abs(side)>=1.6||Math.abs(front)>=3.7)continue;
   for(const sign of[side<0?-1:1,side<0?1:-1]){
    const x=bus.x+c*sign*1.68-s*front,z=bus.z-s*sign*1.68-c*front;
    if(!j.solid(x,z,p.y,.5)){p.x=x;p.z=z;if(j.vehicle){j.vehicle.x=x;j.vehicle.z=z;j.vehicle.speed=0;}break;}
   }
  }
  const x=this.trainX,{z}=TRAIN_TRACK;
  if(x===null){this.warned=false;return;}
  if(!this.warned&&Math.abs(p.z-z)<14&&Math.abs(p.x-x)<32){j.emit('trainApproach');this.warned=true;}
  if(j.vehicle?.service!=='commuter'&&Math.abs(p.z-z)<1.8&&Math.abs(p.x-x)<13&&p.y<2.5){
   const safeZ=p.z<z?z-3.2:z+3.2;
   if(!j.solid(p.x,safeZ,0,.5)){p.z=safeZ;if(j.vehicle){j.vehicle.z=safeZ;j.vehicle.speed=0;}}
  }
 }
 draw(b,lights,p,t,weather,low){
  const near=(x,z)=>Math.hypot(p.x-x,p.z-z)<(low?38:62);
  for(const bus of this.buses)if(near(bus.x,bus.z))b.group([bus.x,.2,bus.z],bus.yaw,()=>{
   b.box([0,1.3,0],[2.1,2.4,6.4],bus.color);b.box([0,2.6,0],[2.2,.18,6.5],'#dddcc9');
   b.box([0,1.9,-3.22],[1.85,1.05,.035],'#4e7789');
   b.box([0,2.46,-3.24],[1.3,.3,.04],'#e8dca6');
   for(const side of[-1,1]){
    for(let z=-2.3;z<2.8;z+=1.1)b.box([side*1.065,1.9,z],[.025,.9,.85],'#4e7789');
    for(const z of[-2,2])b.pose([side*1.1,.4,z],{roll:Math.PI/2},()=>b.cylinder([side*1.1,.4,z],.4,.16,'#344452',low?6:10));
    b.box([side*.65,.7,-3.24],[.4,.2,.06],'#f7e7b7');
    b.box([side*.65,.7,3.24],[.3,.2,.06],'#bc7778');
   }
   if(weather.night>.1)lights.group([bus.x,.2,bus.z],bus.yaw,()=>{for(const side of[-1,1])lights.box([side*.65,.7,-3.28],[.4,.2,.05],'#fff0b7');});
  });
  const x=this.trainX,{z}=TRAIN_TRACK;
  if(x===null||!near(x,z))return;
  b.group([x,0,z],0,()=>trainPassengers(b,low));for(let i=-1;i<=1;i++){
   const cx=x+i*8;
   b.box([cx,.5,z],[7.8,.1,2.5],'#596d75');b.box([cx,2.5,z],[7.8,.15,2.5],'#ded5ca');for(const side of[-1,1]){b.box([cx+side*3.85,1.5,z],[.1,2.1,2.5],'#ded5ca');for(const dx of[-2.4,2.4]){b.box([cx+dx,1.5,z+side*1.23],[2.8,2.1,.1],'#ded5ca');b.box([cx+dx,.85,z+side*.83],[2,.35,.5],'#765c83');}const open=commuterAtTime(this.time).doors;for(const d of[-1,1])b.box([cx+d*(open?.98:.4),1.4,z+side*1.28],[.78,1.7,.05],'#8c9fa6');}b.box([cx,2.1,z],[7.4,.35,2.55],'#765c83');
   for(const w of[-2,-1,1,2])for(const side of[-1,1])b.box([cx+w*1.25,1.6,z+side*1.27],[.8,.75,.04],'#6b9eab');
   for(const side of[-1,1])for(const w of[-1,1])b.pose([cx+side*2.8,.4,z+w*1.1],{pitch:Math.PI/2},()=>b.cylinder([cx+side*2.8,.4,z+w*1.1],.3,.14,'#344452',low?6:8));
   if(weather.night>.15)for(const side of[-1,1])lights.box([cx,1.65,z+side*1.3],[6.4,.08,.02],'#fae6b7');
  }
 }
}
