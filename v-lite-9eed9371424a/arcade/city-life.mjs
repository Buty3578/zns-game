import{trafficRoute,trafficAt}from'./traffic-route.mjs';
import{crowdCharacter}from'./npc.mjs';
import{blocked}from'./world.mjs';
import{safePoint,pedestrianPath,carFootprint}from'./city-navigation.mjs';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angle=(a,b)=>Math.atan2(-(b.x-a.x),-(b.z-a.z));
const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const PEOPLE=[
 {kind:'resident',look:0,color:'#d9b39c',points:[[-31,35],[-31,19],[-31,3]],speed:.88},
 {kind:'resident',look:1,color:'#9cc4bf',points:[[31,31],[31,12],[31,-7]],speed:.76},
 {kind:'resident',look:2,color:'#b9aad7',points:[[-31,-31],[-31,-47],[-28,-53]],speed:.83},
 {kind:'child',look:1,color:'#f1c988',points:[[-21,34],[-17,35],[-19,31]],speed:1.03},
 {kind:'child',look:0,color:'#b7d892',points:[[24,35],[28,33],[25,30]],speed:.96},
 {kind:'dancer',look:0,color:'#b9e797',points:[[-9,-51],[-8,-48],[-3,-48]],speed:.82},
 {kind:'dancer',look:2,color:'#d4a8dd',points:[[193,-51],[199,-49],[204,-50]],speed:.8},
 {kind:'dancer',look:1,color:'#b2d9d1',points:[[210,54],[214,55],[217,52]],speed:.84},
 {kind:'skater',look:0,color:'#e0bd97',points:[[151,27],[152,34],[159,36]],speed:1.43},
 {kind:'skater',look:1,color:'#a9c6e2',points:[[185,31],[191,32],[192,25]],speed:1.5},
 {kind:'resident',look:2,color:'#dab3a3',points:[[132,-48],[141,-46],[148,-49]],speed:.72},
 {kind:'resident',look:0,color:'#a5cd9e',points:[[144,43],[148,51],[152,54]],speed:.86},
 ...[[[588,49],[614,49],[640,49]],[[655,49],[682,49],[708,49]],[[740,49],[770,49],[798,49]],[[870,49],[898,49],[924,49]],[[950,43],[970,43],[1002,43]],[[605,9],[618,3],[636,-5]],[[1060,53],[1110,53],[1140,53]],[[1160,22],[1190,22],[1220,22]],[[1320,53],[1360,53],[1400,53]],[[1338,22],[1378,22],[1415,22]]].map((points,i)=>({kind:'resident',look:i%3,color:['#b8c6ae','#9bb8cc','#ceb6a0'][i%3],points,speed:.8+i*.04}))
];
export const TRAFFIC_ROUTES=[
 [[-25,-23],[-25,2],[25,2],[25,-23]],
 [[210,50],[216,78],[180,82],[144,82],[128,62],[128,48],[145,48],[176,52]],
 [[567,33],[757,33],[767,38],[567,38]],
 [[793,33],[1032,33],[1032,38],[793,38]],
 [[1040,33],[1240,33],[1240,38],[1040,38]],
 [[1315,33],[1420,33],[1420,38],[1315,38]]
];
const routeLength=points=>trafficRoute(points).length,routeAt=trafficAt;
function drawCar(b,lights,c,night){const van=c.kind==='van',length=van?4.4:c.kind==='compact'?3.3:3.8,height=van?1.16:.9;b.group([c.x,.23,c.z],c.yaw,()=>{b.box([0,.52,0],[van?2:1.82,.62,length],c.color);b.box([0,height+.2,.1],[van?1.8:1.55,van?.92:.63,length*.5],c.color);b.box([0,height+.2,-length*.18],[van?1.5:1.35,van?.58:.5,.035],'#7895a4');for(const side of[-1,1]){for(const z of[-length*.31,length*.31]){b.pose([side*.94,.27,z],{roll:Math.PI/2},()=>b.cylinder([side*.94,.27,z],.27,.18,'#273442',8));b.limb([side*1.04,.27,z],[side*1.04,.27+Math.cos(c.wheel||0)*.18,z+Math.sin(c.wheel||0)*.18],.035,'#a3b0ac');}b.box([side*.58,.52,-length*.5-.02],[.38,.14,.05],'#fff0bb');b.box([side*.58,.5,length*.5+.02],[.33,.14,.04],'#d47e82');}b.box([0,.28,-length*.5-.04],[.8,.1,.06],'#526477');});
 if(night>.1){const front={x:c.x-Math.sin(c.yaw)*(length/2+1),z:c.z-Math.cos(c.yaw)*(length/2+1)};for(const side of[-1,1]){const x=front.x+Math.cos(c.yaw)*side*.55,z=front.z-Math.sin(c.yaw)*side*.55;lights.box([x,.79,z],[.4,.18,.12],'#fff3bf');if(side===1)lights.box([x,.205,z-1.1],[.6,.006,1.1],'#d9bf83');}}
}
export class CityLife{
 constructor(){this.time=0;this.events=[];this.people=PEOPLE.map((d,i)=>({id:i,...d,x:d.points[0][0],z:d.points[0][1],target:0,state:'wander',timer:0,phase:i*.91,yaw:0,cooldown:0}));this.cars=[{id:0,route:0,progress:0,cruise:4.4,color:'#c2a7c9',kind:'compact'},{id:1,route:0,progress:91,cruise:3.2,color:'#e0b27d',kind:'van'},{id:2,route:0,progress:45,cruise:4,color:'#96bfc6',kind:'hatch'},{id:3,route:1,progress:8,cruise:3.7,color:'#d7d1a5',kind:'compact'},{id:4,route:1,progress:90,cruise:2.8,color:'#9fb7d6',kind:'van'},...Array.from({length:10},(_,i)=>({id:5+i,route:i<3?2:i<6?3:i<8?4:5,progress:i<6?(i%3)*94:(i%2)*90,cruise:3.5+(i%3)*.35,color:['#739ba5','#b18c7b','#9c99af'][i%3],kind:i%3===0?'van':'compact'}))].map(c=>({...c,speed:c.cruise,contact:0,...routeAt(TRAFFIC_ROUTES[c.route],c.progress)}));}
 update(dt,journey){
  const solid=(x,z,y=0,r=.35)=>journey.solid?journey.solid(x,z,y,r):blocked(x,z,r);
  const walkSolid=(x,z)=>solid(x,z,journey.ground?.(x,z)||0,.4)||x<549&&(journey.ground?.(x,z)||0)>.25;
  if(!this.prepared){
   for(const n of this.people){n.points=n.points.map(p=>safePoint(p,walkSolid)||p);[n.x,n.z]=n.points[0];n.paths=new Map();n.path=[];n.pathIndex=0;}
   this.prepared=true;
  }
  this.groundAt=journey.ground?.bind(journey);dt=clamp(dt,0,.05);this.time+=dt;const player=journey.world.player,show=journey.danceTime>0||journey.skating&&(journey.style?.pending>0||journey.style?.chain>1);
  for(const n of this.people){n.cooldown=Math.max(0,n.cooldown-dt);const distance=dist(n,player);if(show&&distance<7.5&&!n.cooldown&&n.state!=='interaction'){n.state='interaction';n.timer=2.6;n.cooldown=9;}
   if(n.state==='interaction'){n.moveBlend=Math.max(0,(n.moveBlend||0)-dt*5);n.yaw+=turn(n.yaw,angle(n,player))*Math.min(1,dt*4);n.phase+=dt*3;n.timer-=dt;if(n.timer<=0)n.state='wander';continue;}
   if(n.state==='idle'){n.moveBlend=Math.max(0,(n.moveBlend||0)-dt*5);n.timer-=dt;if(n.timer<=0)n.state='wander';continue;}
   if(n.state==='wander'){
    n.target=(n.target+1)%n.points.length;n.state='destination';
    if(!n.paths.has(n.target))n.paths.set(n.target,pedestrianPath([n.x,n.z],n.points[n.target],walkSolid));
    n.path=n.paths.get(n.target);n.pathIndex=0;
   }
   const [x,z]=n.path[n.pathIndex]||n.points[n.target],dx=x-n.x,dz=z-n.z,d=Math.hypot(dx,dz);if(d<.08){if(n.pathIndex<n.path.length-1){n.pathIndex++;continue;}n.state='idle';n.timer=1.2+(n.id%4)*.55;continue;}
   const bend=turn(n.yaw,angle(n,{x,z})),pace=n.speed*Math.max(.25,1-Math.abs(bend)/Math.PI),step=Math.min(d,pace*dt),nx=n.x+dx/d*step,nz=n.z+dz/d*step;
   const nearActor=this.people.some(other=>other!==n&&Math.hypot(nx-other.x,nz-other.z)<.65&&Math.hypot(nx-other.x,nz-other.z)<dist(n,other))||this.cars.some(c=>Math.hypot(nx-c.x,nz-c.z)<3)||Math.hypot(nx-player.x,nz-player.z)<.65;
   if(!walkSolid(nx,nz)&&!nearActor){n.x=nx;n.z=nz;n.timer=0;n.moveBlend=Math.min(1,(n.moveBlend||0)+dt*5);n.phase+=step/(2.2*(n.kind==='child'?.7:.92))*Math.PI*2;}else{n.moveBlend=Math.max(0,(n.moveBlend||0)-dt*6);n.timer=(n.timer||0)+dt;if(n.timer>3){n.timer=0;n.state='wander';n.paths.delete((n.target+1)%n.points.length);}}
   n.yaw+=turn(n.yaw,angle(n,{x,z}))*Math.min(1,dt*6);
  }
  for(const car of this.cars){
   car.contact=Math.max(0,car.contact-dt);
   const route=TRAFFIC_ROUTES[car.route],ahead=routeAt(route,car.progress+3.8+car.speed*car.speed/14),distance=dist(car,player);
   const blocking=player.y<1.4&&dist(ahead,player)<3&&dist(ahead,player)<distance+.6;
   const length=routeLength(route),gap=this.cars.filter(c=>c!==car&&c.route===car.route).reduce((min,c)=>Math.min(min,(c.progress-car.progress+length)%length),Infinity);
   const bend=Math.abs(turn(car.yaw,routeAt(route,car.progress+6).yaw)),pedestrian=this.people.some(n=>Math.hypot(ahead.x-n.x,ahead.z-n.z)<2.4);const target=blocking||pedestrian||gap<8+car.speed?0:car.cruise*Math.max(.4,1-bend/2);
   car.speed+=clamp(target-car.speed,-dt*9,dt*3.5);
   const next=routeAt(route,car.progress+car.speed*dt),candidate={...car,...next,yaw:car.yaw+turn(car.yaw,next.yaw)*Math.min(1,dt*7)};
   const overlaps=this.cars.some(c=>c!==car&&dist(next,c)<5&&dist(next,c)<dist(car,c));
   if(carFootprint(candidate,solid)||overlaps||(player.y<1.4&&dist(next,player)<2.8&&dist(next,player)<distance)){car.speed=0;}
   else{car.progress=(car.progress+car.speed*dt)%length;car.x=next.x;car.z=next.z;car.yaw=candidate.yaw;car.wheel=(car.wheel||0)+car.speed*dt/.27;}
   if(distance<1.85&&player.y<1.4){
    car.speed=0;let nx=player.x-car.x,nz=player.z-car.z,d=Math.hypot(nx,nz);if(d<.01){nx=1;nz=0;d=1;}
    const x=player.x+nx/d*Math.min(.2,dt*6),z=player.z+nz/d*Math.min(.2,dt*6);
    if(!solid(x,z,player.y,.45)){player.x=x;player.z=z;if(journey.vehicle){journey.vehicle.x=x;journey.vehicle.z=z;journey.vehicle.speed*=.55;}}
    if(!car.contact){this.events.push({type:'trafficBump'});car.contact=4;}
   }
  }
 }
 drain(){return this.events.splice(0);}
 draw(b,lights,player,weather,low=false,arena=null){const range=low?27:47,limit=low?5:14;let count=0;for(const n of [...this.people].sort((a,c)=>dist(a,player)-dist(c,player))){if(count>=limit||dist(n,player)>range||arena&&Math.hypot(n.x-arena.x,n.z-arena.z)<9)continue;count++;const dancing=n.state==='interaction';crowdCharacter(b,{x:n.x,z:n.z,y:(n.x>=549?(this.groundAt?.(n.x,n.z)||0):0)+.2,yaw:n.yaw,phase:n.phase,moveBlend:n.moveBlend||0,walking:(n.moveBlend||0)>.02,dance:dancing,color:n.color,look:n.look,scale:n.kind==='child'?.7:n.kind==='skater'?.87:.92,hit:dancing||n.state==='idle'&&n.id%3===0&&Math.sin(n.phase)>0});if(n.kind==='skater'){b.group([n.x,.2,n.z],n.yaw,()=>{b.box([0,.03,0],[.55,.05,1.35],'#ba8db0');for(const x of[-.22,.22])for(const z of[-.45,.45])b.cylinder([x,-.05,z],.11,.08,'#333d4d',6);});}}
  let cars=0;for(const c of this.cars){if(cars>=(low?2:5)||dist(c,player)>(low?34:65))continue;cars++;drawCar(b,lights,c,weather.night);}
  return{people:count,cars};}
}
