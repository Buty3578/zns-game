import{vehicleKind,DISTRICT_VEHICLES,vehiclePlaces}from'./district-vehicles.mjs';
// Continuous segment/box intersection: even thin walls must stop the camera.
export function cameraEyeOutsideWalls(target,eye,boxes,padding=.22){
 const delta=eye.map((v,i)=>v-target[i]);let fraction=1;
 for(const b of boxes){
  const lo=[b.x-b.w/2-padding,-padding,b.z-b.d/2-padding],hi=[b.x+b.w/2+padding,b.h+padding,b.z+b.d/2+padding];
  // A camera target inside a volume (e.g. a secret doorway) must remain usable.
  if(target.every((v,i)=>v>=lo[i]&&v<=hi[i]))continue;
  let enter=0,leave=1;
  for(let i=0;i<3;i++){
   if(Math.abs(delta[i])<1e-9){if(target[i]<lo[i]||target[i]>hi[i]){enter=2;break;}continue;}
   const a=(lo[i]-target[i])/delta[i],c=(hi[i]-target[i])/delta[i];
   enter=Math.max(enter,Math.min(a,c));leave=Math.min(leave,Math.max(a,c));
  }
  if(enter<=leave&&enter>=0&&enter<=1)fraction=Math.min(fraction,Math.max(0,enter-.01));
 }
 return target.map((v,i)=>v+delta[i]*fraction);
}

// Smooth the target and camera independently, then enforce obstruction clearance.
// Retraction is immediate at a wall; recovery uses the slower follow damping.
export function followCamera(previous,desired,boxes,dt){
 const smooth=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*(1-Math.exp(-k*dt)));
 const target=cameraEyeOutsideWalls(desired.target,smooth(previous.target,desired.target,12),boxes,.18);
 const ideal=cameraEyeOutsideWalls(target,desired.eye,boxes,.3);
 const eye=cameraEyeOutsideWalls(target,smooth(previous.eye,ideal,7),boxes,.3);
 eye[1]=Math.max(.35,eye[1]);
 return{target,eye};
}

// Conservative boxes for moving bodies; the controlled vehicle is excluded.
export function trafficCameraBoxes(city,transit,journey){
 const p=journey.world.player,boxes=[];
 const add=(v,w,d,h)=>{if(v===journey.vehicle||Math.hypot(v.x-p.x,v.z-p.z)>35)return;const c=Math.abs(Math.cos(v.yaw||0)),s=Math.abs(Math.sin(v.yaw||0));boxes.push({x:v.x,z:v.z,w:w*c+d*s,d:d*c+w*s,h});};
 for(const car of city.cars)add(car,2,car.kind==='van'?4.4:car.kind==='compact'?3.3:3.8,car.kind==='van'?2.1:1.8);
 for(const bus of transit.buses)add(bus,2.2,6.5,2.9);
 for(const v of journey.vehicles||[])add(v,vehicleKind(v)==='bike'?.8:2,vehicleKind(v)==='bike'?2.3:4,vehicleKind(v)==='bike'?1.6:1.8);
 if(journey.vehicle?.service!=='commuter'&&transit.trainX!==null)add({x:transit.trainX,z:-86},24,2.6,2.6);
 return boxes;
}

export function orbitView(p,yaw,pitch,distance){
 const vertical=Math.max(-.9,Math.min(1.3,pitch));
 return{target:[p.x,p.y+1.55+Math.max(0,-vertical)*12,p.z],eye:[p.x+Math.sin(yaw)*distance,p.y+3.6+Math.max(0,vertical)*4.3,p.z+Math.cos(yaw)*distance]};
}
