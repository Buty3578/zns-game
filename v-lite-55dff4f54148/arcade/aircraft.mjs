import{METRO_POSTS}from'./metro.mjs';
import{STREET_PROPS}from'./street-events.mjs';
import{approach}from'./motion.mjs';
import{CAPITAL_CAMERA_BOXES,CAPITAL_FURNITURE}from'./capital-districts.mjs';
import{URBAN_CAMERA}from'./urban-infill.mjs';
import{SOL_CAMERA_BOXES}from'./solntsevo.mjs';
import{MOSCOW_CAMERA_BOXES}from'./moskovsky.mjs';
import{CITY_CAMERA_BOXES}from'./new-district.mjs';
import{STREET_CAMERA}from'./street-skate.mjs';
import{BUILDINGS}from'./world.mjs';
export const AIRFIELD={id:'airfield',x:1432,z:52,name:'Самолёт «Бит-крыло»',hint:'V / Сесть. Газ — вверх; Пробел / Вверх — набор высоты; Ctrl / Снижение — посадка. X — выход на земле.'};
export const PLANE_START={id:'plane',name:AIRFIELD.name,x:1432,z:52,yaw:Math.PI/2,color:'#f0c978'};
const boxes=[...METRO_POSTS,...STREET_PROPS,...CAPITAL_CAMERA_BOXES,...CAPITAL_FURNITURE,...URBAN_CAMERA,...SOL_CAMERA_BOXES,...MOSCOW_CAMERA_BOXES,...CITY_CAMERA_BOXES,...STREET_CAMERA,...BUILDINGS.map(([x,z,w,h,d])=>({x,z,w,h,d}))];
export function aircraftBlocked(v,x,y,z,ground,solid){
 if(x< -35||x>1457||z< -85||z>57||y>66)return true;
 for(const [side,forward,r]of[[0,0,.8],[0,1,.65],[0,-1,.65],[0,2,.6],[0,-2,.6],...[-3.4,-2.7,-2,-1.3,1.3,2,2.7,3.4].map(x=>[x,0,.5])]){
  const xx=x+Math.cos(v.yaw)*side-Math.sin(v.yaw)*forward,zz=z-Math.sin(v.yaw)*side-Math.cos(v.yaw)*forward;
  if(ground(xx,zz)>y+.22||boxes.some(b=>y<b.h+.3&&Math.abs(xx-b.x)<b.w/2+r&&Math.abs(zz-b.z)<b.d/2+r)||y<1&&solid(xx,zz,y,r))return true;
 }return false;
}
export function stepAircraft(v,dt,input,{ground,solid}){
 dt=Math.max(0,Math.min(.05,dt));const floor=ground(v.x,v.z),air=v.y>floor+.08,down=!!input.brake||!!v.dismount,throttle=-(input.z||0);
 v.speed=approach(v.speed,down?(air?14:0):throttle>0?28:air?20:0,down&&!air?3:1.3,dt);
 v.steer=approach(v.steer||0,input.x||0,5,dt);const oldYaw=v.yaw;v.yaw-=v.steer*Math.min(1,v.speed/6)*(air?.72:1.2)*dt;
 v.lean=approach(v.lean||0,air?-v.steer*.35:0,4,dt);
 const vy=v.speed>13?(down?-4:input.climb?5:air?0:0):air?-3:0;
 v.pitch=approach(v.pitch||0,-vy*.045,4,dt);v.vy=vy;
 const dx=-Math.sin(v.yaw)*v.speed*dt,dz=-Math.cos(v.yaw)*v.speed*dt,n=Math.max(1,Math.ceil(Math.hypot(dx,dz,vy*dt)/.2));let collision=false,landed=false;
 for(let i=0;i<n;i++){const x=v.x+dx/n,z=v.z+dz/n,g=ground(x,z),y=Math.max(g,Math.min(65,v.y+vy*dt/n));
  if(aircraftBlocked(v,x,y,z,ground,solid)){collision=true;break;}
  landed ||= v.y>g+.01&&y===g;v.x=x;v.y=y;v.z=z;
 }
 if(collision){v.yaw=oldYaw;v.speed=0;v.vy=0;}v.grounded=v.y<=ground(v.x,v.z)+.01;v.travelYaw=v.yaw;v.wheel+=v.speed*dt*2;return{collision,landed};
}
