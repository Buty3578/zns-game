import{legacyRampSample}from'./legacy-ramps.mjs';
import{vehicleKind,DISTRICT_VEHICLES,vehiclePlaces}from'./district-vehicles.mjs';
// Three overlapping circles cover the body, including nose and tail.
export function vehicleContact(v,x,z,solid,ground){
 const half=vehicleKind(v)==='car'?1.02:.65,r=vehicleKind(v)==='car'?1.08:.48;
 for(const offset of[-half,0,half]){const xx=x-Math.sin(v.yaw)*offset,zz=z-Math.cos(v.yaw)*offset;
  // Follow a continuous incline; never accept a step taller than the chassis clearance.
  const center=ground(x,z),floor=ground(xx,zz),ramp=legacyRampSample(xx,zz).ramp,y=ramp?Math.max(v.y,floor):Math.max(v.y,Math.min(floor,center+.22));
  if(!ramp&&floor>Math.max(v.y,center)+.24||solid(xx,zz,y,r))return true;
 }if(vehicleKind(v)==='car')for(const side of[-1,1])for(const front of[-1.95,0,1.95]){const xx=x+Math.cos(v.yaw)*side*1.2-Math.sin(v.yaw)*front,zz=z-Math.sin(v.yaw)*side*1.2-Math.cos(v.yaw)*front,floor=ground(xx,zz),y=legacyRampSample(xx,zz).ramp?Math.max(v.y,floor):v.y;if(solid(xx,zz,y,.15))return true;}
 return ground(x,z)>v.y+.22;
}
