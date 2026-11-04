import{LANDMARK_PLACES,LANDMARK_ROADS,LANDMARK_BUILDINGS,landmarkBlocked,landmarkChunks}from'./landmark-districts.mjs';
import{neighborhoodBuilding}from'./neighborhood.mjs';
import{Batch}from'./engine.mjs';
import{splitStatic}from'./render-budget.mjs';
export const CAPITAL_BOUNDS={minX:549,maxX:1469,minZ:-95,maxZ:95};
export const CAPITAL_PLACES=[...LANDMARK_PLACES,
 {id:'msu',district:'hills',x:640,z:-8,name:'Воробьёвы горы · МГУ',hint:'Главное здание со шпилем. Поднимись по парковой аллее.'},
 {id:'lookout',district:'hills',x:602,z:8,name:'Воробьёвы горы · парк и смотровая',hint:'Парк, дорожки на склоне и вид на реку.'},
 {id:'stadium',district:'hills',x:728,z:34,name:'Лужники · стадион',hint:'Обойди овальную арену по кольцевой дорожке.'},
 {id:'river',district:'hills',x:690,z:55,name:'Москва-река · набережная',hint:'Катись вдоль ограждения и смотри на теплоходы.'},
 {id:'square',district:'red',x:950,z:12,name:'Красная площадь',hint:'Кремль, собор и каменная площадь. Место финального городского джема.'},
 {id:'cathedral',district:'red',x:992,z:16,name:'Храм Василия Блаженного',hint:'Девять разноцветных куполов — ориентир площади.'},
 {id:'kremlin',district:'red',x:910,z:-4,name:'Кремль · башни и стены',hint:'Красные стены и часовая башня. Внутренний двор закрыт.'},
 {id:'quay',district:'red',x:966,z:55,name:'Кремлёвская набережная',hint:'Продолжение речного маршрута; по реке идут теплоходы.'}
];
export const CAPITAL_ROADS=[...LANDMARK_ROADS,[[523,34],[580,34]],[[580,34],[770,34]],[[770,34],[950,34]],[[580,34],[600,8]],[[600,8],[640,-8]],[[640,-8],[682,8]],[[682,8],[710,34]],[[580,55],[1038,55]],[[580,34],[580,55]],[[770,34],[770,55]],[[870,34],[870,55]],[[950,34],[950,55]],[[950,34],[950,5]]];
function rawGround(x,z){if(x<549||x>1049)return 0;const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};return x<779?3.6*smooth((20-z)/48)*smooth((x-559)/35)*smooth((779-x)/30):0;}
export function capitalGround(x,z){if(x<549||x>1049)return 0;const gx=549+Math.floor((x-549)/5)*5,gz=-95+Math.floor((z+95)/5)*5,u=(x-gx)/5,v=(z-gz)/5,a=rawGround(gx,gz),bb=rawGround(gx+5,gz),c=rawGround(gx+5,gz+5),d=rawGround(gx,gz+5);return u>=v?a+(bb-a)*u+(c-bb)*v:a+(c-d)*u+(d-a)*v;}
export function capitalTerrain(x,z){return{height:capitalGround(x,z),slopeX:(capitalGround(x+.05,z)-capitalGround(x-.05,z))/.1,slopeZ:(capitalGround(x,z+.05)-capitalGround(x,z-.05))/.1,ramp:null};}
export const CAPITAL_INFILL=[
 [570,-62,12,14,12,'brick'],[577,-30,10,12,8,'townhouse'],[696,-65,17,16,18,'tower'],[761,-60,10,15,13,'brick'],[760,8,11,12,7,'shop'],
 [809,-68,16,20,22,'tower'],[838,-66,18,16,17,'brick'],[811,-30,13,18,15,'brick'],[841,-29,13,18,20,'tower'],[810,12,12,9,5,'shop'],[840,12,12,9,5,'shop'],[864,12,10,9,5,'shop'],[1019,-79,18,14,16,'tower'],[1015,47,11,8,5,'shop'],[836,47,11,8,5,'shop'],[799,47,11,8,5,'shop']
].map(([x,z,w,d,h,kind],i)=>({x,z,w,d,h,kind,color:['#c8b79e','#bdcbb8','#b6c7d0','#d0afa6'][i%4],accent:'#869691'}));
export const CAPITAL_BUILDINGS=[
 {x:640,z:-48,w:18,d:16,h:47},{x:620,z:-49,w:23,d:12,h:21},{x:660,z:-49,w:23,d:12,h:21},{x:609,z:-41,w:8,d:25,h:14},{x:671,z:-41,w:8,d:25,h:14},
 {x:884,z:-38,w:12,d:75,h:8},{x:914,z:-71,w:65,d:8,h:9},{x:915,z:-38,w:32,d:28,h:16},
 {x:992,z:-2,w:26,d:24,h:5},{x:960,z:-58,w:22,d:16,h:18},{x:1023,z:-48,w:19,d:34,h:16},...CAPITAL_INFILL,...LANDMARK_BUILDINGS
];
export const CAPITAL_CAMERA_BOXES=CAPITAL_BUILDINGS.map(b=>({...b,h:(b.x===992?37:b.x===640?84:b.h)+capitalGround(b.x,b.z)}));
const inside=(x,z,b,r=0)=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r;
// Match the visible quay furniture: benches, lamp posts and planter bases.
export const CAPITAL_FURNITURE=[
 ...Array.from({length:20},(_,i)=>575+i*24).filter(x=>x<1040&&x!==959&&x!==983).flatMap(x=>[{x,z:50,w:.18,d:.18,h:3.5},{x,z:48,w:3,d:.7,h:.8}]),
 ...[590,705,802,850,1006].map(x=>({x,z:47,w:7,d:3,h:.55}))
];
export function capitalBlocked(x,z,y,r=.5){if(x<549)return false;if(CAPITAL_FURNITURE.some(b=>y<b.h&&inside(x,z,b,r)))return true;if(landmarkBlocked(x,z,r))return true;if(z>62-r&&z<90+r)return true;if(CAPITAL_BUILDINGS.some(b=>inside(x,z,b,r)))return true;const dx=(x-728)/29,dz=(z+22)/21;return dx*dx+dz*dz<1&&dx*dx+dz*dz>.56;}
function dome(b,x,y,z,r,color){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,c=(i+1)/10*Math.PI*2;const rings=[[0,r*.58],[r*.5,r],[r*1.15,r*.65],[r*1.9,0]];for(let k=1;k<rings.length;k++){const [h,rad]=rings[k-1],[hh,rr]=rings[k];b.quad([x+Math.cos(a)*rad,y+h,z+Math.sin(a)*rad],[x+Math.cos(c)*rad,y+h,z+Math.sin(c)*rad],[x+Math.cos(c)*rr,y+hh,z+Math.sin(c)*rr],[x+Math.cos(a)*rr,y+hh,z+Math.sin(a)*rr],i%2?color:'#ead5a3');}}b.limb([x,y+r*1.8,z],[x,y+r*2.3,z],.08,'#e0bd66');b.box([x,y+r*2.17,z],[r*.55,.12,.12],'#e0bd66');}
function star(b,x,y,z,r=1.4){for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,c=(i+1)*Math.PI/5-Math.PI/2,ra=i%2?r*.42:r,rc=i%2?r:r*.42;b.tri([x,y,z],[x+Math.cos(a)*ra,y+Math.sin(a)*ra,z],[x+Math.cos(c)*rc,y+Math.sin(c)*rc,z],'#e5b45d');}}
let cache;
export function capitalChunks(){if(cache)return cache;const b=new Batch();
 // Terrain and its support function use the same five-metre triangulation.
 for(let x=549;x<1049;x+=5)for(let z=-95;z<95;z+=5){const xx=Math.min(1049,x+5);if(z>=65&&z<90){b.quad([x,-.28,z],[xx,-.28,z],[xx,-.28,z+5],[x,-.28,z+5],((x+z)/5)%2?'#477b8e':'#4e8799');continue;}b.quad([x,capitalGround(x,z)-.04,z],[xx,capitalGround(xx,z)-.04,z],[xx,capitalGround(xx,z+5)-.04,z+5],[x,capitalGround(x,z+5)-.04,z+5],x<779?'#8eac80':'#b8b3a3');}
 for(const[[x,z],[xx,zz]]of CAPITAL_ROADS){const n=Math.ceil(Math.hypot(xx-x,zz-z)/3),w=z===55?8:9;for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,cx=x+(xx-x)*t,cz=z+(zz-z)*t,nx=x+(xx-x)*u,nz=z+(zz-z)*u,a=Math.atan2(xx-x,zz-z),sx=Math.cos(a)*w/2,sz=-Math.sin(a)*w/2;b.quad([cx-sx,capitalGround(cx-sx,cz-sz)+.16,cz-sz],[cx+sx,capitalGround(cx+sx,cz+sz)+.16,cz+sz],[nx+sx,capitalGround(nx+sx,nz+sz)+.16,nz+sz],[nx-sx,capitalGround(nx-sx,nz-sz)+.16,nz-sz],z===55?'#d4cab7':'#677d86');}}
 for(let x=559;x<1049;x+=5){b.box([x,1,62],[5,.12,.12],'#a8bbc0');b.box([x,.5,62],[.1,1,.1],'#849da5');}
 // MSU silhouette: stepped wings, central tower, spire and star.
 for(const [i,o]of CAPITAL_BUILDINGS.slice(0,11).entries()){const g=capitalGround(o.x,o.z);b.box([o.x,g+o.h/2,o.z],[o.w,o.h,o.d],i<5?'#dbc8a6':i<7?'#a95446':i===7?'#d5c4a0':i===8?'#d6c5a1':'#d3bd9e');if(i<5||i===7||i>8)for(let y=3;y<o.h;y+=3)for(let x=-o.w/2+2;x<o.w/2;x+=3)b.box([o.x+x,g+y,o.z+o.d/2+.03],[.9,1.5,.06],'#52788a');}
 const g=capitalGround(640,-48);for(const[w,h,y]of[[13,10,52],[8,7,60.5],[4,5,66.5]])b.box([640,g+y,-48],[w,h,11],'#d9c5a1');b.limb([640,g+69,-48],[640,g+82,-48],.24,'#c8aa68');star(b,640,g+83,-48,2);b.box([640,g+46,-39.9],[5,3,.05],'#a58f69');
 // Luzhniki open ring: short stands leave the field and entry corridor readable.
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;if(Math.abs(Math.sin(a))<.13)continue;const x=728+Math.cos(a)*27,z=-22+Math.sin(a)*19;b.group([x,capitalGround(x,z),z],-a,()=>{b.box([0,2.5,0],[5.3,5,6],'#d6d0bb');b.box([0,5.1,0],[6,.25,7],'#d9e4dd');for(let y=1;y<4;y++)b.box([0,y,-2.9],[4.8,.3,.15],y%2?'#c9907b':'#a3bfcb');});}b.quad([710,capitalGround(710,-33)+.08,-33],[746,capitalGround(746,-33)+.08,-33],[746,capitalGround(746,-11)+.08,-11],[710,capitalGround(710,-11)+.08,-11],'#679b73');for(const z of[-31,-13])b.box([728,capitalGround(728,z)+.18,z],[32,.03,.12],'#e5e6ce');
 // Kremlin defensive wall and clock tower; collision envelope stays closed.
 for(let z=-73;z<-1;z+=4)b.box([884,8.4,z],[12,.8,1],'#b96d58');for(const z of[-71,-4]){b.box([884,9,z],[10,18,10],'#b35c49');for(let i=0;i<4;i++){const a=i*Math.PI/2,c=a+Math.PI/2;b.tri([884+Math.cos(a)*7,18,z+Math.sin(a)*7],[884,28,z],[884+Math.cos(c)*7,18,z+Math.sin(c)*7],'#506f66');}}b.box([884,14,1.02],[3.5,3.5,.08],'#314847');b.pose([884,14,1.1],{pitch:Math.PI/2},()=>b.cylinder([884,14,1.1],1.5,.12,'#e5d4a0',12));b.limb([884,14,1.15],[884,15.1,1.15],.09,'#34444d');b.limb([884,14,1.15],[885,13.6,1.15],.09,'#34444d');star(b,884,29,-4);
 // Original low-poly interpretation of Saint Basil's nine colourful domes.
 for(let i=0;i<9;i++){const a=i/8*Math.PI*2,x=i===8?992:992+Math.cos(a)*10,z=i===8?-2:-2+Math.sin(a)*8,h=i===8?27:17+(i%3)*2;b.cylinder([x,h/2,z],i===8?3:2.2,h,i%2?'#d3c39a':'#b96550',8);dome(b,x,h,z,i===8?3.3:2.6,['#7eae88','#bb6776','#dcb878','#7e9cb8'][i%4]);}
 for(let x=927;x<1013;x+=5)for(let z=2;z<43;z+=5)if(!capitalBlocked(x,z,0))b.box([x,.085,z],[4.9,.12,4.9],(x+z)%2?'#bca99c':'#c6b4a4');
 // Distinct park trees, benches, lamps and small riverside music corners.
 for(let i=0;i<42;i++){const x=568+(i*37)%200,z=-70+(i*23)%120;if(CAPITAL_BUILDINGS.some(o=>inside(x,z,o,6))||CAPITAL_ROADS.some(([a,c])=>Math.abs(z-a[1])<6&&Math.abs(z-c[1])<6)||x>698&&z<5)continue;const y=capitalGround(x,z);b.box([x,y+1.4,z],[.3,2.8,.3],'#806f58');b.sphere([x,y+3.5,z],1.65,i%2?'#709b79':'#acc18a');}
 for(let x=575;x<1040;x+=24){if(x===959||x===983)continue;b.box([x,1.6,50],[.12,3.2,.12],'#536d7a');b.box([x,3.3,50],[.65,.14,.7],'#ead7a1');if(x%3===2){b.box([x,.7,48],[3,.15,.7],'#927f6c');for(const s of[-1,1])b.box([x+s,.3,48],[.12,.6,.5],'#536a78');}}
 for(const x of[600,775,960]){b.box([x,.17,55],[7,.01,5],'#81718e');for(const s of[-1,1]){b.box([x+s*3,1.1,55],[.8,1.7,.7],'#324651');b.cylinder([x+s*3,1.2,54.6],.22,.08,'#c9b2de',8);}}
 for(const o of CAPITAL_INFILL)b.group([0,capitalGround(o.x,o.z),0],0,()=>neighborhoodBuilding(b,o));
 for(const x of[590,705,802,850,1006]){b.box([x,.24,47],[7,.48,3],'#aaa798');b.box([x,.51,47],[6.8,.05,2.8],'#79906c');for(const side of[-1,1]){b.box([x+side*2,1.2,47],[.15,1.4,.15],'#a79c82');b.sphere([x+side*2,2.1,47],.8,'#91b787');}}
 const partition=splitStatic(b,64);if(partition.global.data.length)throw Error('Unpartitioned capital geometry');cache=[...partition.chunks,...landmarkChunks()];return cache;
}
export function capitalActors(b,p,t,low,lights=null,night=0){
 if(lights&&night>.1){const near=(x,z)=>Math.hypot(x-p.x,z-p.z)<(low?60:90);for(let x=575;x<1040;x+=24)if(near(x,50))lights.box([x,3.3,50],[.58,.12,.62],'#f7dba0');for(let x=1058;x<1450;x+=18)if(near(x,59))lights.box([x,3.65,59],[.58,.12,.62],'#f7dba0');
  if(near(1378,-7))for(const x of[1348,1378,1408])for(let y=12;y<21;y+=3)lights.box([x,y,-1.82],[1.1,1.6,.04],'#d6b5ed');
  if(near(640,-40))for(const x of[634,640,646])for(let y=10;y<46;y+=6)lights.box([x,capitalGround(640,-48)+y,-39.94],[.8,1.3,.035],'#efd6a1');
  if(near(1150,-27))for(let x=1138;x<=1162;x+=4)lights.box([x,8,-27.2],[.2,3.5,.04],'#e6d1a4');
 }
 for(let i=0;i<(low?3:6);i++){const u=(t*(i%2?3:-2.5)+i*149)%880,x=569+(u+880)%880,z=74+(i%2)*9;if(Math.hypot(x-p.x,z-p.z)>90)continue;b.group([x,-.15,z],i%2?-Math.PI/2:Math.PI/2,()=>{b.box([0,.35,0],[3.4,.7,11],'#dce0d1');b.box([0,1.2,0],[2.8,1.1,7.4],'#f1e8d1');b.box([0,1.3,-.1],[2.85,.5,6.8],'#678b9b');b.box([0,1.85,.4],[3.1,.18,8.5],'#d4b77c');b.box([0,2.35,1.8],[.5,1,.55],'#546d79');});}}
