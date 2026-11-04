import{vehicleKind,DISTRICT_VEHICLES,vehiclePlaces}from'./district-vehicles.mjs';
import{aircraftModel}from'./street-events-view.mjs';
import{oval,badge}from'./detail.mjs';
import{GATE,CHEST,WALLS,ROOF,GHOST_GATE,GHOST_CHEST,SAFE,POWERS}from'./adventure.mjs';
import{RAMPS,DRIVE_RACE}from'./journey.mjs';
import{crowdCharacter}from'./npc.mjs';
import{BUILDINGS}from'./world.mjs';
import{parkWorld,parkActors}from'./park-world.mjs';
export function ring(b,x,y,z,r,color,vertical=false,yaw=0,n=24){b.group([x,y,z],yaw,()=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=(i+1)/n*Math.PI*2;b.limb(vertical?[Math.cos(a)*r,Math.sin(a)*r,0]:[Math.cos(a)*r,0,Math.sin(a)*r],vertical?[Math.cos(c)*r,Math.sin(c)*r,0]:[Math.cos(c)*r,0,Math.sin(c)*r],.07,color);}});}
export function star(b,x,y,z,t,color='#ffe380',r=.5){b.group([x,y,z],t,()=>{for(let i=0;i<5;i++){const a=i*Math.PI*.4,c=a+Math.PI*.4;b.tri([0,0,.07],[Math.sin(a)*r,Math.cos(a)*r,0],[Math.sin(a+.314)*r*.4,Math.cos(a+.314)*r*.4,0],color);b.tri([0,0,.07],[Math.sin(a+.314)*r*.4,Math.cos(a+.314)*r*.4,0],[Math.sin(c)*r,Math.cos(c)*r,0],color);}});}
function shadow(b,x,z,r=1,y=.19){for(let i=0;i<4;i++)b.cylinder([x,y+i*.004,z],r*(1-i*.19),.003,['#758b86','#6d8481','#627c7b','#5d7475'][i],16);}
export function playfulWorld(b){parkWorld(b);
 // Baked planar shadows and brighter landscaping cost no extra render passes.
 for(const[x,z,w,h,d]of BUILDINGS){const sx=h*.37,sz=-h*.22;b.quad([x-w/2,.18,z-d/2],[x+w/2+sx,.18,z-d/2+sz],[x+w/2+sx,.18,z+d/2+sz],[x+w/2,.18,z+d/2],'#708987');}
 for(const[x,z]of[[-26,34],[28,6],[-29,-12],[11,-48],[31,-49],[-32,-53],[-33,4],[32,37],[-34,-27],[32,-25],[-11,36],[14,38],[-3,8],[34,17]]){shadow(b,x+.5,z-.4,1.8);oval(b,[x,3.5,z],[1.7,1.65,1.65],'#62b981',8,5);oval(b,[x-.45,4.3,z-.2],[1.18,1.2,1.15],'#9ad268',8,4);for(let i=0;i<3;i++)oval(b,[x+Math.sin(i*2)*1.4,.35,z+Math.cos(i*2)*1.4],[.52,.35,.48],'#77b791',7,4);}
 for(const[x,z]of[[-20,34],[8,30],[-17,7],[16,-16],[30,-45]]){b.cylinder([x,.12,z],1.25,.16,'#dfc6a0',12);for(let i=0;i<7;i++){const a=i*2.4;b.limb([x+Math.sin(a)*.9,.18,z+Math.cos(a)*.9],[x+Math.sin(a)*.9,.58,z+Math.cos(a)*.9],.018,'#528a60');oval(b,[x+Math.sin(a)*.9,.6,z+Math.cos(a)*.9],[.14,.11,.14],i%2?'#ffc788':'#d79cec',6,3);}}
 for(const w of WALLS){b.box([w.x,w.h/2,w.z],[w.w,w.h,w.d],w.x<0?'#b8bdd1':'#89c5c6');b.box([w.x,w.h+.07,w.z],[w.w+.14,.14,w.d+.14],'#e4e7d3');}
 // Destructible entrance is rendered dynamically; the intact frame stays here.
 for(const x of[-37.1,-30.9]){b.box([x,2.15,29.5],[.35,4.3,.65],'#e9c596');b.sphere([x,4.5,29.5],.25,'#c5f989');}
 b.box([-34,4.15,29.5],[6.5,.35,.65],'#768c9a');badge(b,-35.15,3.93,29.86,.21,'#e1ffac');
 for(const x of[6.6,13.4])b.box([x,2,-20.7],[.18,4,.45],'#819bea');b.box([10,4,-20.7],[7,.2,.5],'#819bea');
 for(const r of RAMPS){const[x,z,w,d,h]=[r.x,r.z,r.w,r.d,r.h];b.quad([x-w/2,.17,z-d/2],[x+w/2,.17,z-d/2],[x+w/2,h,z],[x-w/2,h,z],'#e4ae75');b.quad([x-w/2,h,z],[x+w/2,h,z],[x+w/2,.17,z+d/2],[x-w/2,.17,z+d/2],'#e4ae75');for(const side of[-1,1]){b.tri([x+side*w/2,.15,z-d/2],[x+side*w/2,h,z],[x+side*w/2,.15,z+d/2],'#a7807b');}b.box([x,h+.03,z],[w,.05,.15],'#f7e398');}
 for(const x of[17,21,26,30])b.box([x,.185,36],[.12,.025,5],'#fff3c0');
 ring(b,SAFE.x,.2,SAFE.z,3.6,'#bbf78b');
 // Clouds stay outside the play space; distant shapes are lightweight meshes.
 for(const[x,y,z]of[[-40,45,-90],[8,53,-105],[60,40,-83],[-70,40,8]])for(let i=0;i<3;i++)oval(b,[x+i*5,y+(i===1?2:0),z],[8,3.5,4.5],'#e7f4f2',8,4);
}
export function monster(b,m,t,{friendly=false,kind=null,low=false}={}){const col=kind?POWERS[kind].color:['#ba8be7','#f1b071','#f28db6'][m.id%3],bounce=Math.sin(m.phase||t*3)*.09,bodyScale=kind==='strong'?1.18:1;
 shadow(b,m.x,m.z,.8);b.group([m.x,.15,m.z],m.yaw||Math.sin(t*.4)*.3,()=>{
 const y=1.2+bounce;oval(b,[0,y,0],[.72,.85,.57],col,low?7:10,low?4:6);
 for(const side of[-1,1]){const gait=Math.sin((m.phase||t*3)+side)*.12;b.box([side*.4,.18,-.13+gait],[.43,.28,.64],'#596978');oval(b,[side*.74,y-.19,-.04],[.2,.3,.22],col,7,4);oval(b,[side*.26,y+.28,-.5],[.22,.28,.1],'#fff8e1',9,5);oval(b,[side*.26,y+.25,-.595],[.09,.13,.055],'#303f62',7,4);b.sphere([side*.23,y+.3,-.646],.038,'#ffffff');oval(b,[side*.47,y-.03,-.5],[.115,.062,.035],'#efacaf',6,3);b.limb([side*.38,y+.67,0],[side*.5,y+1.1,.05],.11,col);oval(b,[side*.51,y+1.1,.05],[.14,.18,.13],kind==='strong'?'#ebff9c':'#ffdc96',7,4);}
 b.limb([-.18,y-.1,-.566],[0,y-.18,-.59],.036,'#4f4260');b.limb([0,y-.18,-.59],[.18,y-.1,-.566],.036,'#4f4260');
 if(friendly){b.box([0,y-.4,-.537],[.48,.2,.04],'#f5f9d3');b.sphere([0,y-.4,-.57],.09,col);}else{b.box([0,y-.48,-.48],[.5,.18,.06],'#f7dbaa');}
 if(m.stun>0){for(let j=0;j<3;j++){const a=t*3+j*2.1;star(b,Math.sin(a)*.8,2.7,Math.cos(a)*.8,t,'#ffec94',.15);}if(m.state==='web'){for(const a of[-.5,0,.5]){b.limb([-.72,.8+a,-.62],[.72,1.7+a,-.62],.025,'#d1fff6');b.limb([.72,.8+a,-.63],[-.72,1.7+a,-.63],.025,'#d1fff6');}}}
 },bodyScale);
}
function wheel(b,x,y,z,rotation,r=.48,width=.2){for(let i=0;i<16;i++){const a=i/16*Math.PI*2,c=(i+1)/16*Math.PI*2,p=[x-width/2,y+Math.cos(a)*r,z+Math.sin(a)*r],q=[x-width/2,y+Math.cos(c)*r,z+Math.sin(c)*r],pp=[x+width/2,p[1],p[2]],qq=[x+width/2,q[1],q[2]];b.quad(p,q,qq,pp,'#2c3c4c');for(const side of[-1,1]){const xx=x+side*width/2;b.tri([xx,y,z],[xx,p[1],p[2]],[xx,q[1],q[2]],'#3a4b5b');}}for(const side of[-1,1]){const xx=x+side*(width/2+.012);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+rotation;b.limb([xx,y,z],[xx,y+Math.cos(a)*r*.73,z+Math.sin(a)*r*.73],.025,'#d8e5e1');}b.sphere([xx,y,z],.095,'#ffe4a3');}}
export function vehicle(b,v,occupied=false){if(v.id==='plane'){aircraftModel(b,v);return;}shadow(b,v.x,v.z,vehicleKind(v)==='car'?1.9:1);b.group([v.x,v.y+.18,v.z],v.yaw,()=>{b.pose([0,0,0],{roll:vehicleKind(v)==='bike'?(v.lean||0):0},()=>{if(vehicleKind(v)==='car'){
 b.box([0,.65,0],[2.15,.66,3.85],v.color);b.box([0,.62,0],[2.3,.24,3.97],'#eddcbd');b.box([0,1.1,-1.1],[2.05,.27,1.55],v.color);b.box([0,1.05,1.3],[2.04,.37,.85],v.color);b.box([0,1.02,.15],[1.7,.14,1.5],'#354a62');
 for(const x of[-.96,.96]){b.box([x,1.15,.2],[.23,.56,1.75],v.color);b.limb([x,1.13,-.59],[x,1.8,-.25],.067,'#d8e2db');b.limb([x,1.42,.86],[x,1.86,.8],.068,'#d8e2db');}b.limb([-.96,1.8,-.25],[.96,1.8,-.25],.064,'#d8e2db');b.limb([-.96,1.86,.8],[.96,1.86,.8],.064,'#d8e2db');b.quad([-.9,1.17,-.58],[.9,1.17,-.58],[.9,1.76,-.27],[-.9,1.76,-.27],'#87c5d5');b.box([0,1.31,.73],[1.6,.45,.24],'#536984');
 for(const side of[-1,1]){for(const z of[-1.24,1.23])wheel(b,side*1.11,.45,z,v.wheel,.48,.24);b.box([side*.71,1.02,-1.95],[.5,.22,.035],'#fff3b9');b.box([side*.74,.91,1.945],[.37,.19,.025],'#ed8b88');b.box([side*1.22,1.3,-.3],[.24,.15,.35],v.color);}b.box([0,.73,-2],[.8,.18,.05],'#3c596e');if(v.body==='truck'){b.box([0,1.35,1.2],[1.95,1.1,1.3],v.color);b.box([0,1.35,1.77],[1.7,.85,.05],'#d5d8ca');}else if(v.body==='pickup'){b.box([0,1.5,-.45],[1.8,.55,1.45],'#8eaaaf');b.quad([-.9,1.78,-1.17],[.9,1.78,-1.17],[.9,1.22,-1.85],[-.9,1.22,-1.85],'#b9c4c4');b.box([0,1.1,1],[1.65,.1,1.1],'#344b58');}else if(v.body==='coupe')b.box([0,1.85,.25],[1.9,.12,1.25],v.color);badge(b,-.25,.78,-2.035,.045,'#e6ffd2');
 }else{
 for(const z of[-1.05,1.05])wheel(b,0,.45,z,v.wheel,.49,.27);for(const side of[-1,1]){b.limb([side*.16,.45,-1.05],[side*.2,1.54,-.76],.07,'#d6dbd2');b.limb([side*.13,.45,1.05],[side*.16,1.05,.45],.085,v.color);}b.limb([0,.45,-1.05],[0,1.05,.1],.12,'#647689');b.limb([0,1.05,.1],[0,.55,1.03],.12,v.color);oval(b,[0,1.16,-.25],[.32,.26,.54],v.color,9,5);b.box([0,1.22,.5],[.52,.18,.91],'#3b4c62');b.limb([-.53,1.57,-.76],[.53,1.57,-.76],.055,'#465b6b');for(const side of[-1,1])b.limb([side*.35,1.58,-.76],[side*.57,1.58,-.72],.065,'#293e53');oval(b,[0,1.48,-1],[.22,.24,.13],'#ffedb5',8,4);b.box([0,1.16,1.05],[.34,.14,.16],'#ef8c99');b.limb([.27,.65,.4],[.27,.55,1.2],.09,'#c6d3d3');
 }});});}
function chest(b,p,open,t){b.group([p.x,.35,p.z],0,()=>{b.box([0,.35,0],[1.4,.7,1.05],open?'#a8c892':'#c79e69');b.box([0,open?.86:.8,open?.4:0],[1.48,.23,1.12],'#ffe1a0');for(const side of[-1,1])b.box([side*.43,.47,-.545],[.16,.73,.055],'#b4865b');b.box([0,.63,-.58],[.21,.23,.1],'#f5f6cb');if(!open)star(b,0,1.3+Math.sin(t*2)*.12,0,t);});}
export function adventureActors(b,j,t,low=false){const p=j.world.player,near=o=>Math.hypot(o.x-p.x,o.z-p.z)<(low?32:47);
 for(const m of j.monsters)if(near(m))monster(b,m,t,{low});for(const f of j.friends)if(near(f)){monster(b,{...f,phase:t*2,yaw:Math.atan2(f.x-p.x,f.z-p.z)},t,{friendly:true,kind:f.id,low});ring(b,f.x,.2,f.z,1.35,POWERS[f.id].color,false,0,12);}
 for(const v of j.vehicles)if(near(v))vehicle(b,v,j.vehicle===v);
 if(!j.gateOpen){b.box([GATE.x,1.8,GATE.z],[GATE.w,3.6,.46],'#eeb482');for(const x of[-36,-34,-32]){b.box([x,1.8,29.78],[.19,3.55,.1],'#cb8b70');}b.limb([-36.8,.55,29.86],[-31.2,3.3,29.86],.08,'#f9dfab');b.limb([-36.8,3.3,29.89],[-31.2,.55,29.89],.08,'#f9dfab');}else{for(let i=0;i<5;i++)b.box([-36+i,.3,29.9+Math.sin(i)], [.7,.25,.35],'#dcb086');}
 chest(b,CHEST,j.secrets.has('strong'),t);chest(b,GHOST_CHEST,j.secrets.has('shade'),t);
 for(let i=0;i<9;i++){const x=6.8+i*.8;b.limb([x,.3,-20.7],[x,3.8,-20.7],.035,j.power==='shade'?'#b7f7e0':'#88cfdf');}if(!j.secrets.has('roof')){star(b,32,4.2+Math.sin(t*2)*.15,27,t,'#ffe08a',.65);ring(b,32,6.5,27,.6,'#83f6ed',true,t,12);b.limb([32,3.4,27],[32,6.5,27],.035,'#beece7');}
 if(j.race){const point=DRIVE_RACE.points[j.race.index],prev=j.race.index?DRIVE_RACE.points[j.race.index-1]:j.vehicles[0];ring(b,point.x,2.8,point.z,2.7,'#c5ff8d',true,Math.atan2(point.x-prev.x,point.z-prev.z),18);star(b,point.x,6.1,point.z,t,'#c5ff8d');}
 parkActors(b,j,t,low);
 const objective=j.visualGoal||j.objective;if(!j.race&&objective&&(j.quest<5||j.park.active||j.contracts?.running||objective.type==='city')){ring(b,objective.x,(j.ground(objective.x,objective.z)||0)+.21,objective.z,1.1+.1*Math.sin(t*3),'#d2ff95',false,0,12);star(b,objective.x,(j.ground(objective.x,objective.z)||0)+3.4+Math.sin(t*2)*.2,objective.z,t*.4,'#deff9c',.3);}
 if(j.surprise){const s=j.surprise;if(s.type==='coins')for(const c of s.coins)if(!c.picked)star(b,c.x,1+Math.sin(t*3)*.1,c.z,t,'#ffd76a',.3);if(s.type==='star')star(b,s.x,1.3,s.z,t,'#ffe885',.8);if(s.type==='party'){ring(b,s.x,.2,s.z,2,'#f2a1ee',false,0,16);crowdCharacter(b,{x:s.x,z:s.z,y:.2,phase:t*6,dance:true,color:'#edb5e8'});}}
 if(j.webLine){const a=j.webLine.from,c=j.webLine.to;b.limb([a.x,a.y+1.5,a.z],[c.x,c.y+.3,c.z],.035,'#e7fff2');}
 for(const q of j.particles)if(!low||q.life>.65)b.sphere([q.x,q.y,q.z],Math.max(.025,q.life*.065),q.color);
 for(let i=0;i<(low?2:5);i++){const x=Math.sin(t*.18+i)*18,z=24+Math.cos(t*.18+i)*9,y=7+Math.sin(t*.5+i)*.6,flap=Math.sin(t*9+i)*.26;b.limb([x,y,z],[x+.42,y+flap,z+.05],.04,'#eef1de');b.limb([x,y,z],[x-.42,y+flap,z+.05],.04,'#eef1de');}
}
