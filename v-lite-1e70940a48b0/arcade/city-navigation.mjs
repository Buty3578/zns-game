import{PLATFORMS}from'./systems.mjs';
import{RAMPS}from'./legacy-ramps.mjs';
import{CITY_RAMPS}from'./new-district.mjs';
import{SOL_RAMPS}from'./solntsevo.mjs';
import{STREET_BANKS,STREET_STAIRS}from'./street-skate.mjs';
// Height-only collision functions do not expand by radius; keep their envelopes here.
const HEIGHT_OBSTACLES=[...PLATFORMS,...RAMPS,...CITY_RAMPS,...SOL_RAMPS,...STREET_BANKS,...STREET_STAIRS,{x:728,z:-22,w:60,d:44}];
// Small deterministic pedestrian routes. Cached per resident/waypoint, not rebuilt per frame.
export function safePoint(point,solid){
 for(let r=0;r<=10;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
  if(r&&Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
  const x=Math.round(point[0])+dx,z=Math.round(point[1])+dz;if(!solid(x,z))return[x,z];
 }
 return null;
}
export function pedestrianPath(from,to,solid){
 const start=safePoint(from,solid),goal=safePoint(to,solid);if(!start||!goal)return[];
 const key=([x,z])=>x+','+z,queue=[start],seen=new Map([[key(start),null]]);
 const minX=Math.min(start[0],goal[0])-12,maxX=Math.max(start[0],goal[0])+12,minZ=Math.min(start[1],goal[1])-12,maxZ=Math.max(start[1],goal[1])+12;
 for(let i=0;i<queue.length&&i<6000;i++){
  const current=queue[i],k=key(current);
  if(k===key(goal)){const path=[];let at=k;while(seen.get(at)!==null){path.push(at.split(',').map(Number));at=seen.get(at);}return [start,...path.reverse()];}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const next=[current[0]+dx,current[1]+dz],nk=key(next);
   if(next[0]<minX||next[0]>maxX||next[1]<minZ||next[1]>maxZ||seen.has(nk)||solid(...next))continue;
   // Reject thin obstacles between grid centres too.
   if(solid(current[0]+dx*.5,current[1]+dz*.5))continue;
   seen.set(nk,k);queue.push(next);
  }
 }
 return[];
}
export function carFootprint(car,solid){
 const c=Math.cos(car.yaw),s=Math.sin(car.yaw),half=car.kind==='van'?2.2:car.kind==='compact'?1.65:1.9;
 const radius=Math.hypot(1,half)+.2;
 if(!solid(car.x,car.z,0,radius)&&!HEIGHT_OBSTACLES.some(b=>Math.abs(car.x-b.x)<b.w/2+radius&&Math.abs(car.z-b.z)<b.d/2+radius))return false;
 const hit=(side,front)=>solid(car.x+c*side-s*front,car.z-s*side-c*front,0,.16);
 // Continuous perimeter coverage catches thin walls between the old nine probes.
 const sides=Math.ceil(2/.3),ends=Math.ceil(half*2/.3);
 for(let i=0;i<=sides;i++){const side=-1+2*i/sides;if(hit(side,-half)||hit(side,half))return true;}
 for(let i=1;i<ends;i++){const front=-half+half*2*i/ends;if(hit(-1,front)||hit(1,front))return true;}
 return hit(0,0);
}
