import{Batch}from'./engine.mjs';
import{crowdCharacter}from'./npc.mjs';
import{neighborhoodBuilding}from'./neighborhood.mjs';
import{DistrictTransit,BUS_STOPS,busStopGeometry}from'./district-transit.mjs';

// Stylised district connected to the existing east road. Static geometry is baked into 40 m cells.
export const MOSCOW_BOUNDS={minX:239,maxX:389,minZ:-95,maxZ:95};
export const MOSCOW_PLACES=[
 {id:'mall',x:326,z:34,name:'Московский · торговый центр',short:'Торговый центр',hint:'Площадь у торгового центра. Рядом тренируется местная танцевальная команда.'},
 {id:'platform',x:302,z:-10,name:'Московский · автобусная остановка',short:'Автобусы',hint:'Городские автобусы проходят кольцо с двумя остановками. Поезд теперь в Солнцево.'},
 {id:'plaza',x:291,z:30,name:'Московский · скейт-площадь',short:'Скейт-площадь',hint:'Длинные грани и перила для гриндов.'},
 {id:'shops',x:332,z:57,name:'Московский · магазины у дома',short:'Магазины',hint:'Пекарня, музыкальный магазин и жилые дворы рядом с автобусной остановкой.'}
];
export const MOSCOW_ROADS=[[[228,48],[262,48]],[[262,48],[291,30]],[[291,30],[326,34]],[[262,48],[262,-16]],[[262,-16],[298,-16]],[[298,-16],[305,-12]],[[326,34],[369,34]],[[369,34],[369,-16]],[[262,-16],[369,-16]],[[262,48],[369,48]],[[369,48],[369,34]]];
export const MOSCOW_BUILDINGS=[{x:326,z:12,w:33,d:19,h:13,kind:'mall'},{x:367,z:70,w:15,d:17,h:16,kind:'home'},{x:297,z:70,w:14,d:14,h:12,kind:'home'},{x:371,z:-73,w:18,d:13,h:10,kind:'home'},
 {x:248,z:76,w:13,d:14,h:17,kind:'tower',color:'#c3d0c8',accent:'#698c8b'},
 {x:274,z:78,w:16,d:16,h:21,kind:'tower',color:'#c1c8d5',accent:'#6e819d'},
 {x:329,z:78,w:17,d:14,h:15,kind:'brick',color:'#cda995',accent:'#936d66'},
 {x:343,z:-70,w:16,d:17,h:20,kind:'tower',color:'#b3c8cf',accent:'#7c8d9e'},
 {x:313,z:-70,w:18,d:14,h:15,kind:'brick',color:'#d2b8a1',accent:'#a58b7b'},
 {x:279,z:-73,w:15,d:17,h:12,kind:'home',color:'#c7b6ce',accent:'#867e9a'},
 {x:247,z:-64,w:12,d:17,h:15,kind:'tower',color:'#b9c9bc',accent:'#738e8c'},
 {x:285,z:0,w:15,d:15,h:17,kind:'tower',color:'#c7c5b2',accent:'#8d9180'},
 {x:351,z:-43,w:17,d:16,h:21,kind:'brick',color:'#cfb4a9',accent:'#957d80'},
 {x:317,z:60,w:10,d:8,h:4.8,kind:'shop',shop:'bakery',color:'#e1ccb0',accent:'#b58d77'},
 {x:342,z:60,w:12,d:8,h:5.5,kind:'shop',shop:'music',color:'#c5c2d7',accent:'#8a799f'},
 {x:277,z:-34,w:12,d:8,h:4.5,kind:'shop',color:'#c6d8bc',accent:'#789875'},
 {x:321,z:-35,w:15,d:9,h:6,kind:'shop',color:'#dbd2bb',accent:'#819c9e'}];
export const MOSCOW_GRIND=[{x:283,z:27,w:.5,d:14,h:.55,kind:'rail'},{x:298,z:19,w:.55,d:17,h:.7,kind:'rail'},{x:312,z:38,w:13,d:.7,h:.42,kind:'curb'}];
export const MOSCOW_CAMERA_BOXES=[...MOSCOW_BUILDINGS,...MOSCOW_GRIND];
const inside=(x,z,b,pad=0)=>Math.abs(x-b.x)<b.w/2+pad&&Math.abs(z-b.z)<b.d/2+pad;
export function moskovskyGround(x,z){let h=0;for(const b of MOSCOW_GRIND)if(inside(x,z,b))h=Math.max(h,b.h);return h;}
export function moskovskyBlocked(x,z,y,r=.5){return MOSCOW_BUILDINGS.some(b=>inside(x,z,b,r))||MOSCOW_GRIND.some(b=>y<b.h-.08&&inside(x,z,b,r));}
const cells=new Map();
function bake(){cells.clear();const at=(x,z,fn)=>{const key=Math.floor(x/40)+','+Math.floor(z/40);if(!cells.has(key))cells.set(key,new Batch());fn(cells.get(key));};
 for(let x=239;x<389;x+=30)for(let z=-95;z<95;z+=38)at(x+15,z+19,b=>b.box([x+15,-.4,z+19],[30,.7,38],z<0?'#95a9a1':'#b3bfa6'));
 for(const[[x,z],[xx,zz]]of MOSCOW_ROADS){const length=Math.hypot(xx-x,zz-z),n=Math.ceil(length/15),yaw=Math.atan2(xx-x,zz-z);for(let i=0;i<n;i++){const cx=x+(xx-x)*(i+.5)/n,cz=z+(zz-z)*(i+.5)/n;at(cx,cz,b=>b.group([cx,0,cz],yaw,()=>{b.box([0,.055,0],[9.5,.12,length/n+.6],'#d4cfbf');b.box([0,.13,0],[7.4,.09,length/n+.6],'#687b8c');b.box([0,.185,0],[.1,.01,2.8],'#e4ddaf');}));}}
 at(297,31,b=>{b.box([297,.08,31],[44,.16,32],'#b5afbd');for(let i=-2;i<=2;i++){b.box([297+i*7,.17,31],[.08,.01,30],'#d9d7cf');b.box([297,.17,31+i*5],[43,.01,.08],'#d9d7cf');}b.cylinder([303,.25,39],3,.15,'#8bbfc1',14);});
 for(const o of MOSCOW_BUILDINGS)at(o.x,o.z,b=>{if(o.kind!=='mall'){neighborhoodBuilding(b,o);return;}b.box([o.x,o.h/2,o.z],[o.w,o.h,o.d],o.kind==='mall'?'#a89fba':o.kind==='station'?'#829eaa':'#c1b6bd');b.box([o.x,o.h+.22,o.z],[o.w+.5,.45,o.d+.5],'#52667e');for(let x=o.x-o.w/2+1.8;x<o.x+o.w/2-1;x+=3)for(let y=2.7;y<o.h;y+=3.1)b.box([x,y,o.z+o.d/2+.04],[1.5,1.8,.06],o.kind==='mall'?'#72a9b4':'#658194');if(o.kind==='mall'){b.box([o.x,9.7,o.z+o.d/2+.2],[19,1.65,.2],'#34475e');for(let i=-4;i<=4;i++)b.box([o.x+i*2,9.7,o.z+o.d/2+.32],[1.15,.12,.03],i%2?'#f3d999':'#c8f1ae');b.box([o.x,2,o.z+o.d/2+.13],[5,4,.14],'#3d6579');b.box([o.x,4.3,o.z+o.d/2+2],[9,.25,4],'#d8d4c4');}});
 for(const o of MOSCOW_GRIND)at(o.x,o.z,b=>{b.box([o.x,o.h,o.z],[o.w,.09,o.d],o.kind==='rail'?'#d8bda3':'#d8d2bf');if(o.kind==='rail')for(const z of[o.z-o.d/2+.5,o.z+o.d/2-.5])b.box([o.x,o.h/2,z],[.12,o.h,.12],'#56636e');});
 for(const stop of BUS_STOPS)at(stop.x,stop.z,b=>busStopGeometry(b,stop));
 for(const[x,z]of[[264,50],[284,52],[315,50],[350,50],[262,-10],[344,-15]])at(x,z,b=>{b.box([x,2.7,z],[.12,5.4,.12],'#52677c');b.box([x+.55,5.3,z],[1.1,.12,.22],'#a1a4aa');b.box([x+.9,5.18,z],[.5,.06,.3],'#f3ddac');});
 return [...cells.values()].map(batch=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(let i=0;i<batch.data.length;i+=9){minX=Math.min(minX,batch.data[i]);maxX=Math.max(maxX,batch.data[i]);minZ=Math.min(minZ,batch.data[i+2]);maxZ=Math.max(maxZ,batch.data[i+2]);}return{batch,bounds:{x:(minX+maxX)/2,z:(minZ+maxZ)/2,radius:Math.hypot(maxX-minX,maxZ-minZ)/2}};});
}
let chunkCache;export function moskovskyChunks(){return chunkCache||(chunkCache=bake());}
export class MoskovskyLife extends DistrictTransit{
 update(dt,j){
  super.update(dt,j);const p=j.world.player;
  if(p.x>255&&!j.park.visited.has('moskovsky')){j.park.visited.add('moskovsky');j.emit('hint',{message:'Московский открыт! Торговый центр, жилые кварталы и автобусы отмечены на карте.'});}
 }
 draw(b,lights,p,t,weather,low,hideCrew=false){
  super.draw(b,lights,p,t,weather,low);
  if(p.x<246||p.x>390)return;const near=(x,z)=>Math.hypot(p.x-x,p.z-z)<(low?34:52);
  if(weather.night>.15&&near(326,20)){for(let i=-3;i<=3;i++)lights.box([326+i*2.8,9.7,21.7],[1.3,.15,.04],'#f0ddb1');for(const x of[309,343])lights.box([x,.2,25],[1.2,.01,4],'#cfb993');}
  if(!hideCrew&&near(326,34))for(let i=0;i<(low?3:5);i++)crowdCharacter(b,{x:316+i*2.6,z:36+(i%2)*1.2,y:.2,yaw:Math.PI,phase:t*2+i,dance:i%2===0,color:['#d9a6db','#aac7de','#e7bd9b','#b7dfaa','#d5bae9'][i],scale:.86});
 }
}
