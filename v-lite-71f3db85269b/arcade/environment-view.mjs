// Small, distance-culled emissive geometry. No particle systems or external textures.
import{Batch}from'./engine.mjs';
import{BUILDINGS}from'./world.mjs';
import{CITY_BUILDINGS}from'./new-district.mjs';
const OLD_LAMPS=Array.from({length:6},(_,i)=>[-31,-50+i*18]).concat(Array.from({length:6},(_,i)=>[31,-50+i*18]));
const ROAD_LAMPS=[[-5.4,26],[5.4,26],[-5.4,-9],[5.4,-9],[-5.4,-43],[5.4,-43]];
const CITY_LAMPS=[[125,17],[131,-19],[123,-52],[164,-86],[219,-81],[233,-43],[233,32],[218,84],[172,87],[123,45],[186,29]];
const SCHOOL_LIGHTS=[[0,-53],[8,-53],[198,-49],[212,-49]];
const SKATE_LIGHTS=[[159,28],[189,28],[172,64],[214,50]];
const MALL_LIGHTS=[[177,75],[190,75]];
const LIGHTS=[...OLD_LAMPS,...ROAD_LAMPS,...CITY_LAMPS,...SCHOOL_LIGHTS,...SKATE_LIGHTS,...MALL_LIGHTS];
const WINDOWS=[...BUILDINGS.filter(([x])=>x<119).map(([x,z,w,h,d])=>({x,z,w,h,d})),...CITY_BUILDINGS];
const fract=x=>x-Math.floor(x),hash=n=>fract(Math.sin(n*127.1+78.23)*43758.5453);
export function precipitationHeight(seed,time,speed=1.7){return .5+fract(seed-time*speed)*8;}
export function environmentActors(player,t,state,low=false){t=state.elapsed??t;const lights=new Batch(),weather=new Batch(),range=low?48:75;
 if(state.night>.04){for(let i=0;i<LIGHTS.length;i++){const[x,z]=LIGHTS[i];if(Math.hypot(x-player.x,z-player.z)>range)continue;const color=i>=OLD_LAMPS.length+ROAD_LAMPS.length+CITY_LAMPS.length+SCHOOL_LIGHTS.length?'#e6ddad':'#fff1b1';lights.box([x+(i<OLD_LAMPS.length?.6:0),4.72,z],[.4,.22,.42],color);if(!low||i%2===0){const radius=i>=OLD_LAMPS.length+ROAD_LAMPS.length+CITY_LAMPS.length?2.1:1.65;lights.cylinder([x,.205,z],radius,.008,'#d1b971',low?6:10);}}
  for(let i=0;i<WINDOWS.length;i++){const{x,z,w,h,d}=WINDOWS[i];if(Math.hypot(x-player.x,z-player.z)>range)continue;for(let floor=3;floor<h;floor+=6)for(const side of[-1,1])if((i+floor+side)%3!==0)lights.box([x+side*Math.min(1.3,w/4),floor+.5,z+d/2+.055],[1.05,1.35,.035],'#e9c994');}
 }
 if(state.cloud>.12){for(let i=0;i<(low?2:4);i++){const x=player.x+(hash(i+650)*2-1)*30+t*(.16+i*.025)%8,z=player.z-19+i*11,y=22+i*2;for(let k=0;k<3;k++)weather.sphere([x+k*2.3,y+(k%2)*.5,z],1.8,state.night>.4?'#697084':'#d5d9d3');}}
 if(state.wetness>.08){const count=low?4:9;for(let i=0;i<count;i++){const cellX=Math.floor(player.x/16),cellZ=Math.floor(player.z/16),dx=i%3-1,dz=Math.floor(i/3)-1,seed=(cellX+dx)*971+(cellZ+dz)*193;const x=(cellX+dx)*16+hash(seed+51)*12+2,z=(cellZ+dz)*16+hash(seed+75)*12+2;weather.box([x,.205,z],[1+hash(i+92)*1.8,.006,.2+hash(i+20)*.5],state.night>.4?'#8ea1ad':'#afc3c5');}}
 if(state.rain>.02){const count=Math.round((low?14:42)*state.rain);for(let i=0;i<count;i++){const x=player.x+(hash(i+4)*2-1)*17,z=player.z+(hash(i+103)*2-1)*15,y=precipitationHeight(hash(i+301),t);weather.limb([x,y,z],[x+.12,y-.55,z+.02],low?.012:.016,'#b8c9db');}}
 if(state.snow>.02){for(let i=0;i<Math.round((low?20:60)*state.snow);i++){const x=player.x+(hash(i+44)*2-1)*17+Math.sin(t*.6+i)*.35,z=player.z+(hash(i+143)*2-1)*15,y=precipitationHeight(hash(i+341),t,.16);weather.sphere([x,y,z],low?.04:.055,'#f3f7ff');}}
 if(state.weather==='CLEAR'&&state.night<.1){const d=state.sunDirection;lights.sphere([player.x+d[0]*100,(player.y||0)+35+d[1]*45,player.z+d[2]*100],3.2,'#fff2ac');}
 return{lights,weather};}
