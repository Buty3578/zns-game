import{Batch}from'./engine.mjs';
import{crowdCharacter}from'./npc.mjs';
import{neighborhoodBuilding}from'./neighborhood.mjs';
import{trainStationGeometry}from'./district-transit.mjs';

export const SOL_BOUNDS={minX:389,maxX:549,minZ:-95,maxZ:95};
export const SOL_PLACES=[
 {id:'square',x:435,z:55,name:'Солнцево · солнечная площадь',short:'Площадь',hint:'Широкая пешеходная площадь и дорога к скейт-месту.'},
 {id:'street',x:470,z:8,name:'Солнцево · бетонный скейт-спот',short:'Скейт-спот',hint:'Два трамплина, длинные перила, грани и разрыв между приподнятыми платформами.'},
 {id:'dance',x:515,z:-25,name:'Солнцево · уличная сцена',short:'Уличная сцена',hint:'Местная команда тренируется у сцены. Подойди без транспорта и нажми G.'},
 {id:'temple',x:456,z:-54,name:'Солнцево · храм и тихий двор',short:'Храм',hint:'Золотой купол — ориентир у жилых кварталов. Вход внутрь здания пока закрыт.'},
 {id:'station',x:484,z:-75,name:'Солнцево · железнодорожная платформа',short:'Поезд',hint:'Поезд проходит вдоль северной границы района. Жди за жёлтой линией.'},
 {id:'shops',x:456,z:76,name:'Солнцево · лавки на площади',short:'Магазины',hint:'Пекарня и магазин у жилых домов рядом с солнечной площадью.'}
];
export const SOL_ROADS=[[[369,34],[405,34]],[[405,34],[435,55]],[[435,55],[505,55]],[[505,55],[523,22]],[[523,22],[512,-25]],[[512,-25],[467,-38]],[[467,-38],[417,-25]],[[417,-25],[405,34]],[[435,55],[451,30]],[[451,30],[470,8]],[[470,8],[512,-25]],[[467,-38],[484,-55]],[[484,-55],[484,-75]]];
export const SOL_BUILDINGS=[{x:430,z:78,w:18,d:13,h:11},{x:502,z:79,w:19,d:15,h:14},{x:541,z:55,w:10,d:13,h:9},{x:416,z:-70,w:17,d:14,h:10},
 {x:456,z:-66,w:16,d:14,h:24,kind:'church',color:'#e5d9bc',accent:'#93a8a5'},
 {x:534,z:-70,w:12,d:12,h:7,kind:'station',color:'#ccd5c5',accent:'#789993'},
 {x:400,z:70,w:12,d:16,h:17,kind:'tower',color:'#c7c6b7',accent:'#909a8a'},
 {x:429,z:4,w:12,d:16,h:12,kind:'brick',color:'#d2ae97',accent:'#927866'},
 {x:439,z:-18,w:13,d:16,h:19,kind:'tower',color:'#d1c9b3',accent:'#99a1aa'},
 {x:498,z:-65,w:13,d:13,h:16,kind:'tower',color:'#b9ccd0',accent:'#849caa'},
 {x:535,z:-6,w:12,d:14,h:12,kind:'brick',color:'#d4b399',accent:'#a08572'},
 {x:473,z:80,w:17,d:12,h:19,kind:'tower',color:'#bdcdbf',accent:'#7f9c8e'},
 {x:527,z:80,w:12,d:13,h:8,kind:'townhouse',color:'#ddc7ac',accent:'#93887e'},
 {x:400,z:-48,w:12,d:12,h:7,kind:'townhouse',color:'#c8c1ac',accent:'#838e80'},
 {x:457,z:82,w:9,d:8,h:5,kind:'shop',shop:'bakery',color:'#e7d1ad',accent:'#ba956b'},
 {x:437,z:36,w:10,d:9,h:5.5,kind:'shop',color:'#c7d4bb',accent:'#809c7c'}];
export const SOL_RAMPS=[{id:'sol-low',x:448,z:10,w:6,d:6,h:.9,segments:6,color:'#e7b786'},{id:'sol-high',x:485,z:13,w:7,d:9,h:1.8,segments:9,color:'#a7c9d5'}];
export const SOL_OBSTACLES=[{x:458,z:-2,w:.55,d:13,h:.55,kind:'rail'},{x:478,z:-8,w:.55,d:17,h:.68,kind:'rail'},{x:495,z:28,w:14,d:.7,h:.42,kind:'curb'},{x:466,z:24,w:5,d:4,h:.48,kind:'ledge'},{x:476,z:24,w:5,d:4,h:.48,kind:'ledge'}];
export const SOL_CAMERA_BOXES=[...SOL_BUILDINGS.map(b=>({...b,h:b.h+(b.kind==='townhouse'?2.5:0)})),...SOL_RAMPS,...SOL_OBSTACLES];
const inside=(x,z,b,pad=0)=>Math.abs(x-b.x)<b.w/2+pad&&Math.abs(z-b.z)<b.d/2+pad;
export function solntsevoRampSample(x,z){for(const r of SOL_RAMPS)if(inside(x,z,r)){const t=Math.max(0,Math.min(1,(r.z+r.d/2-z)/r.d)),i=Math.min(r.segments-1,Math.floor(t*r.segments)),u=t*r.segments-i,a=r.h*(i/r.segments)**2,b=r.h*((i+1)/r.segments)**2;return{height:a+(b-a)*u,slopeX:0,slopeZ:-(b-a)*r.segments/r.d,ramp:r.id};}return{height:0,slopeX:0,slopeZ:0,ramp:null};}
export function solntsevoGround(x,z){let h=solntsevoRampSample(x,z).height;for(const o of SOL_OBSTACLES)if(inside(x,z,o))h=Math.max(h,o.h);return h;}
export function solntsevoBlocked(x,z,y,r=.5){return SOL_BUILDINGS.some(b=>inside(x,z,b,r))||SOL_OBSTACLES.some(b=>y<b.h-.08&&inside(x,z,b,r))||solntsevoRampSample(x,z).height>y+.58;}
let cache;export function solntsevoChunks(){if(cache)return cache;const cells=new Map(),at=(x,z,fn)=>{const key=Math.floor(x/40)+','+Math.floor(z/40);if(!cells.has(key))cells.set(key,new Batch());fn(cells.get(key));};
 for(let x=389;x<549;x+=32)for(let z=-95;z<95;z+=38)at(x+16,z+19,b=>b.box([x+16,-.4,z+19],[32,.7,38],z>0?'#c1c39a':'#a9bd9d'));
 for(const[[x,z],[xx,zz]]of SOL_ROADS){const length=Math.hypot(xx-x,zz-z),n=Math.ceil(length/16),yaw=Math.atan2(xx-x,zz-z);for(let i=0;i<n;i++){const cx=x+(xx-x)*(i+.5)/n,cz=z+(zz-z)*(i+.5)/n;at(cx,cz,b=>b.group([cx,0,cz],yaw,()=>{b.box([0,.06,0],[9,.12,length/n+.5],'#e3d7b7');b.box([0,.13,0],[7,.09,length/n+.5],'#6d8390');b.box([0,.19,0],[.1,.01,2.6],'#f0dfa8');}));}}
 at(470,8,b=>{b.box([470,.06,8],[54,.12,50],'#b7bfc0');for(let x=445;x<496;x+=5)for(let z=-12;z<31;z+=5)b.box([x,.125,z],[.035,.009,4.8],'#d8d2c6');b.box([471,.135,24],[5,.02,4],'#536f7d');b.box([471,.14,24],[1.6,.015,4],'#e4c48b');});
 for(const r of SOL_RAMPS)at(r.x,r.z,b=>{for(let i=0;i<r.segments;i++){const za=r.z+r.d/2-r.d*i/r.segments,zb=za-r.d/r.segments,ya=r.h*(i/r.segments)**2+.17,yb=r.h*((i+1)/r.segments)**2+.17,l=r.x-r.w/2,h=r.x+r.w/2;b.quad([l,ya,za],[h,ya,za],[h,yb,zb],[l,yb,zb],r.color);for(const x of[l,h])b.quad([x,.17,za],[x,ya,za],[x,yb,zb],[x,.17,zb],'#566f7d');}b.box([r.x,(r.h+.17)/2,r.z-r.d/2],[r.w,r.h+.17,.05],'#637b87');});
 for(const o of SOL_OBSTACLES)at(o.x,o.z,b=>{b.box([o.x,o.h,o.z],[o.w,.09,o.d],o.kind==='rail'?'#edc98d':'#e1d5b9');if(o.kind==='rail')for(const z of[o.z-o.d/2+.4,o.z+o.d/2-.4])b.box([o.x,o.h/2,z],[.12,o.h,.12],'#58687b');if(o.kind==='ledge')b.box([o.x,o.h/2,o.z],[o.w,o.h,o.d],'#abb6b9');});
 for(const o of SOL_BUILDINGS)at(o.x,o.z,b=>neighborhoodBuilding(b,o));
 at(456,-54,b=>{b.box([456,.035,-54],[20,.07,9],'#d5d0b7');b.box([470,.035,-54],[28,.07,3],'#d5d0b7');});
 trainStationGeometry(at);
 at(515,-25,b=>{b.cylinder([515,.12,-25],9,.22,'#d0aeb1',20);b.cylinder([515,.25,-25],7,.05,'#6b778e',20);for(const x of[510,520]){b.box([x,1.1,-32],[1.2,2.2,1],'#425667');b.sphere([x,1.1,-31.42],.35,'#9fb1bb');}b.box([515,2.8,-33],[16,.3,.4],'#7a628b');});
 for(const[x,z]of[[409,48],[426,64],[447,72],[500,66],[530,35],[424,-44],[499,-46]])at(x,z,b=>{b.box([x,1.3,z],[.16,2.6,.16],'#968a75');b.sphere([x,3.1,z],1.4,'#93a874');b.sphere([x+.35,3.8,z],.9,'#b4bd84');});
 cache=[...cells.values()].map(batch=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(let i=0;i<batch.data.length;i+=9){minX=Math.min(minX,batch.data[i]);maxX=Math.max(maxX,batch.data[i]);minZ=Math.min(minZ,batch.data[i+2]);maxZ=Math.max(maxZ,batch.data[i+2]);}return{batch,bounds:{x:(minX+maxX)/2,z:(minZ+maxZ)/2,radius:Math.hypot(maxX-minX,maxZ-minZ)/2}};});return cache;
}
export function solntsevoActors(b,p,t,low,hideCrew=false){if(Math.hypot(p.x-515,p.z+25)>(low?35:50)||hideCrew)return;for(let i=0;i<(low?3:5);i++)crowdCharacter(b,{x:506+i*3.5,z:-21+(i%2)*1.5,y:.25,yaw:Math.PI,phase:t*2+i*.6,dance:i%2===0,color:['#e2a99c','#a5d6c8','#f0d49b','#bda5e4','#a9c7e2'][i],scale:.9});}
