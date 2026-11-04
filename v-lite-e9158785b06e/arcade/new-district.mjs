// Shared source of truth for rendering, terrain, collisions, map and challenge.
export const OLD_BOUNDS={minX:-58,maxX:119,minZ:-65,maxZ:70};
export const EXPANSION_BOUNDS={minX:119,maxX:239,minZ:-95,maxZ:95};
export const CITY_PLACES=[
 {id:'homes',x:145,z:48,name:'Лукинский квартал',short:'Квартал',hint:'Панельные дома, двор и широкие проезды.'},
 {id:'skate',x:174,z:28,name:'Центральный скейт-парк',short:'Скейт-парк',hint:'Три рампы. На скейте нажми «Начать круг» у стартового кольца: маршрут на 60–90 секунд.'},
 {id:'green',x:144,z:-49,name:'Парк берёзовых дорожек',short:'Берёзовый парк',hint:'Дорожки, невысокие препятствия и петля среди деревьев.'},
 {id:'dance',x:210,z:50,name:'Уличный танцпол',short:'Танцпол',hint:'У площадки G / «Начать баттл» — обмен связками: повтори за соперником, затем он повторит за тобой. Время на выбор не ограничено; R / ♫ — свободный танец.'},
 {id:'studio',x:205,z:-55,name:'Студия Заметь наш стиль',short:'Студия Заметь наш стиль',hint:'Двор студии, граффити, колонки и места для отдыха.'}
];
export const CITY_RAMPS=[
 {id:'low',x:158,z:3,w:6,d:6,h:.75,segments:6,color:'#b0d989'},
 {id:'medium',x:174,z:4,w:7,d:8,h:1.5,segments:8,color:'#c0a7e1'},
 {id:'high',x:190,z:5,w:7,d:10,h:2.6,segments:10,color:'#efbf83'}
];
export const CITY_BUILDINGS=[
 {x:142,z:62,w:13,d:13,h:18,kind:'home',color:'#d6c6ad'},
 {x:164,z:66,w:12,d:16,h:23,kind:'home',color:'#becbd1'},
 {x:139,z:31,w:12,d:12,h:15,kind:'home',color:'#d4bba8'},
 {x:155,z:40,w:10,d:13,h:12,kind:'home',color:'#c7cdb7'},
 {x:205,z:-67,w:24,d:15,h:7,kind:'studio',color:'#aabed0'},
 {x:235.5,z:4,w:6,d:19,h:17,kind:'home',color:'#c6b6cb'}
];
export const CITY_OBSTACLES=[
 {x:166,z:14,w:1,d:6,h:.32,kind:'curb'}, {x:182,z:14,w:1,d:6,h:.46,kind:'curb'},
 {x:199,z:0,w:.45,d:8,h:.65,kind:'rail'},
 {x:140,z:-42,w:3,d:1.2,h:.35,kind:'box'}, {x:151,z:-58,w:2,d:1.5,h:.5,kind:'box'},
 {x:135,z:-59,w:1,d:4,h:.22,kind:'curb'},
 {x:199,z:42,w:1.1,d:1.1,h:2,kind:'speaker'}, {x:216,z:42,w:1.1,d:1.1,h:2,kind:'speaker'},
 {x:195,z:-55,w:1,d:1,h:1.8,kind:'speaker'}, {x:216,z:-55,w:1,d:1,h:1.8,kind:'speaker'},
 {x:154,z:-53,w:.8,d:.8,h:2.4,kind:'note'}, {x:190,z:-48,w:.8,d:.8,h:2.4,kind:'note'}, {x:220,z:55,w:.8,d:.8,h:2.4,kind:'note'},
 {x:185,z:36,w:10,d:.45,h:2.6,kind:'graffiti'}, {x:147,z:-68,w:8,d:.45,h:2.2,kind:'graffiti'}
];
export const CITY_TREES=[[132,-52],[137,-53],[151,-48],[151,-36],[139,-31],[155,-64],[137,-64],[145,-61],[154,-27],[135,-36],[157,-39],[123,-74],[156,-74],[158,-60],[122,72],[174,73],[151,55],[147,38],[195,62],[202,72],[222,61],[233,-84],[188,-70],[216,-40]].map(([x,z])=>({x,z,w:.35,d:.35,h:2.6}));
export const CITY_BOOSTS=[{x:174,z:18,w:5,d:5,yaw:0},{x:184,z:-82,w:7,d:5,yaw:-Math.PI/2},{x:228,z:22,w:5,d:7,yaw:Math.PI},{x:181,z:82,w:8,d:5,yaw:Math.PI/2}];
export const SKATE_START={x:174,z:28};
export const SKATE_COURSE=[
 [174,12],[174,-12],[166,-22],[146,-22],[144,-49],[128,-40],[128,-65],[144,-82],[176,-82],[207,-82],[222,-82],[228,-66],[228,-45],[205,-49],[207,-22],
 [228,-30],[228,8],[228,48],[210,50],[216,78],[180,82],[144,82],[128,62],[128,48],[145,48],[176,52],[174,28]
].map(([x,z])=>({x,z}));
export const CITY_ROADS=[
 [[104,18],[128,18]],[[104,-9],[128,-9]],
 ...[SKATE_START,...SKATE_COURSE].slice(1).map((p,i)=>{const a=[SKATE_START,...SKATE_COURSE][i];return[[a.x,a.z],[p.x,p.z]];}),
 [[128,-40],[144,-49]],[[144,-49],[146,-22]],[[144,-49],[128,-65]],
 [[174,-12],[205,-55]],[[205,-55],[228,-66]],[[205,-55],[207,-82]],
 [[174,28],[210,50]],[[210,50],[228,48]],[[210,50],[216,78]],
 [[128,18],[148,28]],[[128,-9],[146,-22]],[[145,48],[128,62]],[[145,48],[148,28]],
 [[158,23],[158,-12]],[[190,25],[190,-12]],[[158,-12],[190,-12]]
];
const inside=(x,z,b,pad=0)=>Math.abs(x-b.x)<=b.w/2+pad&&Math.abs(z-b.z)<=b.d/2+pad;
export function rampSample(x,z){
 for(const r of CITY_RAMPS)if(inside(x,z,r)){
  const t=Math.max(0,Math.min(1,(r.z+r.d/2-z)/r.d)),i=Math.min(r.segments-1,Math.floor(t*r.segments)),u=t*r.segments-i;
  const a=(i/r.segments)**2*r.h,b=((i+1)/r.segments)**2*r.h;
  return{height:a+(b-a)*u,slopeX:0,slopeZ:-(b-a)*r.segments/r.d,ramp:r.id};
 }return{height:0,slopeX:0,slopeZ:0,ramp:null};
}
export function cityGround(x,z){let h=rampSample(x,z).height;for(const b of CITY_OBSTACLES)if(inside(x,z,b))h=Math.max(h,b.h);return h;}
export function cityBlocked(x,z,y,r=.5){
 if(CITY_TREES.some(b=>y<b.h&&inside(x,z,b,r)))return true;
 if(CITY_BUILDINGS.some(b=>inside(x,z,b,r)))return true;
 if(CITY_OBSTACLES.some(b=>y<b.h-.08&&inside(x,z,b,r)))return true;
 // The board's nose probes ahead on the slope; the tall rear / sides remain solid.
 return rampSample(x,z).height>y+.58;
}
export function cityBoost(x,z){return CITY_BOOSTS.some(b=>inside(x,z,b));}
export const CITY_CAMERA_BOXES=[...CITY_BUILDINGS,...CITY_OBSTACLES,...CITY_RAMPS,...CITY_TREES];
export const SKATE_LIMIT=100;
export const skateRouteLength=[SKATE_START,...SKATE_COURSE].reduce((sum,p,i,a)=>i?sum+Math.hypot(p.x-a[i-1].x,p.z-a[i-1].z):0,0);
