import{Batch}from'./engine.mjs';
import{splitStatic}from'./render-budget.mjs';
import{neighborhoodBuilding}from'./neighborhood.mjs';
export const LANDMARK_PLACES=[
 {id:'vdnh',district:'vdnh',x:1085,z:34,name:'ВДНХ · главный вход',hint:'Арка, центральная аллея и выставочные павильоны.'},
 {id:'fountain',district:'vdnh',x:1150,z:18,name:'ВДНХ · фонтан и павильоны',hint:'Золотые фигуры фонтана, клумбы и прогулочная площадь.'},
 {id:'rocket',district:'vdnh',x:1205,z:4,name:'ВДНХ · космический павильон',hint:'Ракета у павильона — ориентир для городского маршрута.'},
 {id:'dream',district:'dream',x:1378,z:28,name:'Коломенская · Остров мечты',hint:'Остров, мост, яркие башни и прогулочная площадь. Вход в интерьеры пока закрыт.'},
 {id:'island-quay',district:'dream',x:1408,z:55,name:'Остров мечты · променад',hint:'Вода, скверы, кафе и вид на теплоходы.'}
];
export const LANDMARK_ROADS=[[[1032,34],[1269,34]],[[1269,34],[1430,34]],[[1049,55],[1440,55]],[[1103,34],[1103,-44]],[[1085,18],[1225,18]],[[1138,18],[1138,-18]],[[1138,-18],[1150,-18]],[[1205,18],[1205,4]],[[1340,34],[1340,4]],[[1415,34],[1415,4]],[[1378,34],[1378,55]]];
const building=(x,z,w,d,h,kind='brick',i=0)=>({x,z,w,d,h,kind,extension:true,color:['#d3beaa','#c4cdba','#bbcbd0','#cfb6b2'][i%4],accent:['#947967','#8d9b85','#7e9eac'][i%3]});
export const LANDMARK_BUILDINGS=[
 building(1085,26,5,3,13),building(1085,42,5,3,13),
 building(1150,-40,34,24,15),building(1095,-61,19,18,12),building(1208,-56,23,20,16),
 building(1059,-20,12,22,15,'tower'),building(1247,-22,14,22,18,'tower',2),
 ...[1062,1094,1126,1164,1196,1238].map((x,i)=>building(x,46,12,8,4.5,'shop',i)),
 ...[1062,1120,1170,1238].map((x,i)=>building(x,-80,17,14,14+i*3,'tower',i)),
 building(1378,-28,60,38,14),building(1348,-7,9,10,21),building(1408,-7,9,10,21),building(1378,-7,12,10,23),
 building(1324,7,10,22,6,'shop',1),building(1430,6,10,22,6,'shop',2),
 ...[1330,1354,1380,1405,1430].map((x,i)=>building(x,-57,12,8,5,'shop',i))
];
export function islandWater(x,z){return x>=1280&&x<=1460&&z>=-78&&z<=78&&!(x>=1310&&x<=1445&&z>=-65&&z<=60);}
export function landmarkBlocked(x,z,r=.5){if(x<1049)return false;if(islandWater(x,z)&&!(z>28+r&&z<40-r)&&!(z>50+r&&z<60-r))return true;return Math.hypot(x-1150,z-5)<6.5+r||Math.hypot(x-1205,z+12)<3+r;}
function cone(b,x,y,z,r,h,color){for(let i=0;i<12;i++){const a=i*Math.PI/6,c=(i+1)*Math.PI/6;b.tri([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x,y+h,z],[x+Math.cos(c)*r,y,z+Math.sin(c)*r],i%2?color:'#e0cbbb');}}
let cached;
export function landmarkChunks(){if(cached)return cached;const b=new Batch();
 for(let x=1049;x<1469;x+=10)for(let z=-95;z<95;z+=10){const water=z>=65||islandWater(x+5,z+5);b.box([x+5,water?-.32:-.1,z+5],[10,water?.03:.12,10],water?'#55899c':x<1269?'#b3c49b':'#c5b7a6');}
 for(const[[x,z],[xx,zz]]of LANDMARK_ROADS){const n=Math.ceil(Math.hypot(xx-x,zz-z)/10),yaw=Math.atan2(xx-x,zz-z);for(let i=0;i<n;i++)b.group([x+(xx-x)*(i+.5)/n,0,z+(zz-z)*(i+.5)/n],yaw,()=>{b.box([0,.06,0],[10,.12,Math.hypot(xx-x,zz-z)/n+.1],'#d2c9b9');b.box([0,.14,0],[7.5,.08,Math.hypot(xx-x,zz-z)/n+.1],'#77868c');b.box([0,.19,0],[.1,.01,2],'#ded4a5');});}
 // The wide bridge keeps a continuous physical road across the island channel.
 for(const z of[28,40]){b.box([1296,1.05,z],[52,.12,.12],'#88a7af');for(let x=1274;x<1324;x+=5)b.box([x,.6,z],[.12,1.2,.12],'#6e8f9e');}
 for(const [i,o]of LANDMARK_BUILDINGS.entries()){if(i<5||i>=17&&i<=20){b.box([o.x,o.h/2,o.z],[o.w,o.h,o.d],i>=17?'#ccafad':'#d9cdb5');}else neighborhoodBuilding(b,o);}
 // Exhibition entrance and pavilion colonnade.
 b.box([1085,13.5,34],[5,2,20],'#e4d6b8');for(const z of[29,34,39])b.sphere([1085,15.5,z],.8,'#d4b774');
 for(let x=1136;x<=1164;x+=4){b.cylinder([x,5.4,-27.5],.38,10.8,'#eee1c1',8);b.box([x,10.9,-27.5],[1.1,.35,1.2],'#d5bd8b');}cone(b,1150,15,-40,14,6,'#aa9879');
 b.cylinder([1150,.35,5],6.5,.7,'#d8ccb7',24);b.cylinder([1150,.74,5],5.8,.06,'#609dac',24);b.cylinder([1150,1.3,5],1.6,1.4,'#d3ad6f',12);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=1150+Math.cos(a)*4,z=5+Math.sin(a)*4;b.box([x,1.15,z],[.55,1.5,.55],'#d8b86e');b.sphere([x,2.05,z],.3,'#e2c57f');b.limb([x,1.7,z],[x+Math.cos(a)*.5,2.2,z+Math.sin(a)*.5],.1,'#ddbd75');b.limb([x,1.8,z],[1150,3.5,5],.035,'#b4d7d4');}
 b.cylinder([1205,12,-12],1.5,24,'#dce3da',12);cone(b,1205,24,-12,1.5,5,'#ddd7c6');for(const s of[-1,1]){b.tri([1205,0,-12],[1205+s*4,0,-12],[1205,7,-12],'#b7cbd2');b.tri([1205,0,-12],[1205,0,-12+s*4],[1205,7,-12],'#b7cbd2');}b.box([1205,13,-10.48],[1.2,2,.04],'#ac6c69');
 // Stylized indoor theme-park silhouette, closed interiors, explorable island outside.
 for(const x of[1348,1378,1408]){const y=x===1378?23:21;cone(b,x,y,-7,6,9,x===1378?'#9c79ad':'#8e9ebd');b.limb([x,y+9,-7],[x,y+12,-7],.08,'#dec78f');b.box([x+1,y+11,-7],[2,.8,.05],'#e6c691');b.box([x,6,-1.9],[3.3,7,.05],'#58647d');for(let h=12;h<y-1;h+=3)b.box([x,h,-1.9],[1.2,1.7,.05],'#7093a7');}
 b.box([1378,15,-28],[62,2,40],'#b8a7bf');for(let i=0;i<6;i++)b.box([1352+i*10,16.4,-8],[2,1.5,1.2],'#dcc7c0');
 for(let x=1058;x<1450;x+=18){if(islandWater(x,56))continue;b.box([x,1.8,59],[.13,3.6,.13],'#567282');b.box([x,3.65,59],[.65,.15,.7],'#f0dbad');b.box([x,.7,51],[2.7,.15,.6],'#958273');for(const s of[-1,1])b.box([x+s,.34,51],[.12,.7,.5],'#61747d');}
 for(let i=0;i<45;i++){const x=1058+(i*31)%380,z=-72+(i*43)%125;if(islandWater(x,z)||LANDMARK_BUILDINGS.some(o=>Math.abs(x-o.x)<o.w/2+4&&Math.abs(z-o.z)<o.d/2+4)||z>28&&z<41||Math.hypot(x-1150,z-5)<10||Math.hypot(x-1205,z+12)<6)continue;b.box([x,1.1,z],[.25,2.2,.25],'#85705c');b.sphere([x,3,z],1.45,'#87a882');b.box([x,.06,z],[3,.12,3],'#9ab990');}
 const partition=splitStatic(b,64);if(partition.global.data.length)throw Error('Unpartitioned landmark geometry');cached=partition.chunks;return cached;
}
