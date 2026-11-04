import{vehicleKind,DISTRICT_VEHICLES,vehiclePlaces}from'./district-vehicles.mjs';
// Three overlapping circles cover the body, including nose and tail.
export function vehicleContact(v,x,z,solid,ground){
 const half=vehicleKind(v)==='car'?1.02:.65,r=vehicleKind(v)==='car'?1.08:.48;
 for(const offset of[-half,0,half]){const xx=x-Math.sin(v.yaw)*offset,zz=z-Math.cos(v.yaw)*offset;
  // Follow a continuous incline; never accept a step taller than the chassis clearance.
  const center=ground(x,z),floor=ground(xx,zz),y=Math.max(v.y,Math.min(floor,center+.22));
  if(floor>Math.max(v.y,center)+.24||solid(xx,zz,y,r))return true;
 }return ground(x,z)>v.y+.22;
}
