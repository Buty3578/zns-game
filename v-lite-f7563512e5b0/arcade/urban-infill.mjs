import{CAPITAL_BUILDINGS,CAPITAL_ROADS,capitalGround,capitalBlocked}from'./capital-districts.mjs';
import{CAPITAL_CONTRACTS}from'./capital-contracts.mjs';
import{STREET_SPOTS}from'./street-skate.mjs';
import{Batch}from'./engine.mjs';
import{splitStatic}from'./render-budget.mjs';
import{neighborhoodBuilding}from'./neighborhood.mjs';
const segment=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
const missionPaths=CAPITAL_CONTRACTS.flatMap(c=>c.points.slice(1).map((p,i)=>[[c.points[i].x,c.points[i].z],[p.x,p.z]]));
export const URBAN_BUILDINGS=[];
for(let x=560;x<1450;x+=22)for(let z=-82;z<=28;z+=22){
 const n=Math.abs((x*37+z*13)|0),w=9+n%4,d=10+n%3,h=7+n%22;
 if(x<779&&(Math.hypot(x-640,z+48)<65||Math.hypot(x-728,z+22)<42)||x>870&&x<1010&&z> -23||x>1115&&x<1225&&z> -30||x>1335&&x<1420&&z> -5)continue;
 if(capitalBlocked(x,z,0,8)||CAPITAL_BUILDINGS.some(b=>Math.abs(x-b.x)<(b.w+w)/2+4&&Math.abs(z-b.z)<(b.d+d)/2+4)||STREET_SPOTS.some(p=>Math.abs(x-p.x)<30&&Math.abs(z-p.z)<23)||[...CAPITAL_ROADS,...missionPaths].some(([a,b])=>segment(x,z,a,b)<Math.hypot(w,d)/2+6))continue;
 const y=capitalGround(x,z);if(Math.abs(capitalGround(x-w/2,z-d/2)-y)>.65||Math.abs(capitalGround(x+w/2,z+d/2)-y)>.65)continue;
 URBAN_BUILDINGS.push({x,z,w,d,h,y,kind:['brick','tower','townhouse','shop'][n%4],color:['#b9c6b8','#c3b6a2','#b3c4cd','#c8aaa0'][n%4],accent:'#7e969a'});
}
export const URBAN_CAMERA=URBAN_BUILDINGS.map(b=>({...b,h:b.h+b.y}));
export function urbanBlocked(x,z,r=.5){return URBAN_BUILDINGS.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);}
let cache;export function urbanChunks(){if(cache)return cache;const b=new Batch();for(const o of URBAN_BUILDINGS){b.group([0,o.y,0],0,()=>{neighborhoodBuilding(b,o);b.box([o.x,o.h+.2,o.z],[o.w+.6,.4,o.d+.6],'#617b88');for(const side of[-1,1])b.box([o.x+side*(o.w/2-1),.4,o.z+o.d/2+1.4],[.5,.8,.5],'#729880');});}const p=splitStatic(b,32);if(p.global.data.length)throw Error('Infill lost');cache=p.chunks;return cache;}
