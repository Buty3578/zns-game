import{legacyRampSample}from'./legacy-ramps.mjs';
import{streetSample}from'./street-skate.mjs';
import{capitalTerrain}from'./capital-districts.mjs';
import{Batch}from'./engine.mjs';
import{rampSample,cityBoost}from'./new-district.mjs';
import{solntsevoRampSample}from'./solntsevo.mjs';
import{approach}from'./motion.mjs';

// Arcade controller: metres/seconds, one shared board/rider transform, no rigid-body engine.
export const SKATE_AREA={x:0,z:28,w:7,d:24,label:'СКЕЙТ · РАЗГОН / OLLIE'};
export const SKATE_ROUGH={x:0,z:18,w:6,d:3};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function skateSurface(x,z){return Math.abs(x-SKATE_ROUGH.x)<SKATE_ROUGH.w/2&&Math.abs(z-SKATE_ROUGH.z)<SKATE_ROUGH.d/2?{drag:1.35,landing:.82}:{drag:.23,landing:.97,boost:cityBoost(x,z)?6:0};}
export function createSkate(p){return{id:'skate',name:'Скейт ЗНС',x:p.x,z:p.z,y:p.y,yaw:p.yaw,vy:0,speed:0,wheel:0,steer:0,lean:0,pitch:0,push:0,pushCycle:0,grounded:true,land:0,mount:0,jumpBuffer:0,crouch:0,dismount:false,stanceYaw:0,trickSpin:0,trickFlip:0,boardYaw:0,deckYaw:0,trickTuck:0,bail:0};}
export function queueOllie(v){if(v.dismount||!v.grounded||v.crouch>0||v.jumpBuffer>0||v.bail>0)return false;v.jumpBuffer=.18+(1-v.mount)*.38;return true;}
export function skateCameraDistance(speed){return 2.2*smooth(Math.abs(speed)/12);}
export function skateFootprint(v,x,z,y,solid){const sx=Math.sin(v.yaw)*.57,sz=Math.cos(v.yaw)*.57;return solid(x,z,y,.46)||solid(x+sx,z+sz,y,.42)||solid(x-sx,z-sz,y,.42);}
// At a box edge keep support until the deck clears it; ramp lift-off uses its tangent.
export function skateSupport(v,x,z,ground,terrain){let floor=ground(x,z);for(const side of[-1,1]){const px=x+Math.sin(v.yaw)*.99*side,pz=z+Math.cos(v.yaw)*.99*side,h=ground(px,pz);if(!terrain(px,pz).ramp&&h<=v.y+.06)floor=Math.max(floor,h);}return floor;}
export function skateTerrain(x,z){const legacy=legacyRampSample(x,z);if(legacy.ramp)return legacy;const street=streetSample(x,z);if(street.ramp)return street;if(x>=549)return capitalTerrain(x,z);const solar=solntsevoRampSample(x,z);return solar.ramp?solar:rampSample(x,z);}
export function stepSkate(v,dt,input,{ground,solid,surface=skateSurface,terrain=skateTerrain}){
 dt=Math.min(.05,Math.max(0,dt));const result={landed:false,collision:false,impact:0,tookOff:false,ollie:false};
 v.bail=Math.max(0,(v.bail||0)-dt);if(v.bail>0)input={brake:true};
 v.mount=Math.min(1,v.mount+dt/.38);v.jumpBuffer=Math.max(0,v.jumpBuffer-dt);v.land=approach(v.land,0,12,dt);
 const ready=v.mount===1,brake=v.dismount||input.z>.08||input.brake,throttle=ready&&!brake?clamp(-(input.z||0)):0;
 if(v.grounded&&ready&&v.jumpBuffer>0&&v.crouch===0){v.preOllie=skatePose(v);v.crouch=.12;v.jumpBuffer=0;}
 if(v.crouch>0){v.crouch=Math.max(0,v.crouch-dt);if(v.crouch===0){v.vy=(input.superJump?8.2:6.3)+Math.max(0,v.groundVy||0);v.grounded=false;result.tookOff=true;result.ollie=true;v.push=0;v.preOllie=null;}}
 const pushing=throttle>0&&v.grounded&&!v.crouch&&v.speed<12;
 v.push=approach(v.push,pushing?throttle:0,pushing?12:16,dt);
 if(v.push>.001)v.pushCycle=(v.pushCycle+dt/ .82)%1;
 // Acceleration is delivered during the visible backward foot stroke.
 const stroke=v.pushCycle>.12&&v.pushCycle<.62?Math.sin((v.pushCycle-.12)/.5*Math.PI):0;
 const mat=surface(v.x,v.z),slope=terrain(v.x,v.z),along=-(slope.slopeX*Math.sin(v.yaw)+slope.slopeZ*Math.cos(v.yaw));
 if(v.grounded){v.speed=Math.max(0,v.speed-along*9.5*dt);if(mat.boost&&!brake)v.speed=Math.min(16,v.speed+mat.boost*dt);if(input.speedPower&&!brake)v.speed=Math.min(16,v.speed+3.8*dt);}
 if(v.grounded){v.speed=Math.max(0,v.speed-(brake?11:mat.drag+v.speed*.025)*dt);if(pushing&&v.speed<12)v.speed=Math.min(12,v.speed+15*throttle*stroke*dt);}
 v.steer=approach(v.steer,ready?(input.x||0):0,8,dt);
 const oldYaw=v.yaw;v.yaw-=v.steer*1.9*Math.min(1,v.speed/2.5)*(v.grounded?1:.24)*dt;
 if(skateFootprint(v,v.x,v.z,v.y,solid))v.yaw=oldYaw;
 if(v.grounded)v.speed*=Math.exp(-v.steer*v.steer*.12*dt);
 v.lean=approach(v.lean,-v.steer*.23*Math.min(1,v.speed/6),9,dt);
 const dx=-Math.sin(v.yaw)*v.speed*dt,dz=-Math.cos(v.yaw)*v.speed*dt,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12)),h=dt/n;let travelled=0;
 for(let i=0;i<n;i++){
  const x=v.x+dx/n,z=v.z+dz/n,level=ground(x,z),before=v.y;
  if(skateFootprint(v,x,z,v.y,solid)||level>v.y+.2){result.collision=true;}
  else{v.x=x;v.z=z;travelled+=Math.hypot(dx/n,dz/n);}
  const floor=skateSupport(v,v.x,v.z,ground,terrain),on=terrain(v.x,v.z);
  if(v.grounded){
   if(v.y>floor+.06){v.grounded=false;result.tookOff=true;v.vy=v.groundVy||0;}
   else{v.y=floor;v.groundVy=-(on.slopeX*Math.sin(v.yaw)+on.slopeZ*Math.cos(v.yaw))*v.speed;v.vy=0;}
  }
  if(!v.grounded){v.vy-=22*h;v.y+=v.vy*h;if(v.y<=floor&&before>=floor-.06&&v.vy<=0){result.landed=true;result.impact=-v.vy;v.y=floor;v.vy=0;v.grounded=true;v.speed*=surface(v.x,v.z).landing;v.land=clamp(result.impact/9);v.groundVy=0;}}
  if(result.collision)break;
 }
 if(result.collision){v.speed*=.15;v.push=0;}
 if(v.grounded)v.wheel=(v.wheel+travelled/.14)%(Math.PI*2);
 const support=terrain(v.x,v.z),pitch=Math.atan(-(support.slopeX*Math.sin(v.yaw)+support.slopeZ*Math.cos(v.yaw)));
 v.pitch=approach(v.pitch,v.grounded?pitch:clamp(v.vy/6.3,-.35,1)*.19,16,dt);
 v.slopeRoll=approach(v.slopeRoll||0,v.grounded?Math.atan(support.slopeX*Math.cos(v.yaw)-support.slopeZ*Math.sin(v.yaw)):0,16,dt);
 if(v.speed<.02)v.speed=0;return result;
}
export function skatePose(v){
 const phase=v.pushCycle,weight=v.grounded&&!v.crouch?v.push:0;
 const crouch=v.crouch>0?Math.sin((1-v.crouch/.12)*Math.PI/2)*.18:v.grounded?v.land*.22:.13;
 const stance=[.08,.14,.44];let pushFoot;
 if(phase<.15){const t=smooth(phase/.15);pushFoot=[.08+.52*t,.14+.1*Math.sin(t*Math.PI),.44-.64*t];}
 else if(phase<.62){const t=(phase-.15)/.47;pushFoot=[.6,.14-.37*smooth(t/.18),-.2+.65*t];}
 else{const t=smooth((phase-.62)/.38);pushFoot=[.6-.52*t,-.23+.37*t+.32*Math.sin(t*Math.PI),.45-.01*t];}
 const pose={left:[-.08,.14,-.44],right:stance.map((x,i)=>x+(pushFoot[i]-x)*weight+(i===1?4*weight*(1-weight)*.26:0)),pelvis:[-.06*weight,-crouch-.28*weight,.04*weight],roll:v.lean*.8,pitch:.08+weight*.1,twist:.68+Math.sin(phase*Math.PI*2)*weight*.08,hands:[[-.72,1.42+weight*.08,-.15+Math.sin(phase*Math.PI*2)*weight*.18],[.7,1.4-weight*.08,.2-Math.sin(phase*Math.PI*2)*weight*.18]]};
 // Recover the pushing foot onto the deck before lift-off instead of snapping it.
 if(v.crouch>0&&v.preOllie){const t=smooth(1-v.crouch/.12),start=v.preOllie;
  pose.right=start.right.map((x,i)=>x+(stance[i]-x)*t+(i===1?Math.sin(t*Math.PI)*.24:0));
  pose.pelvis=start.pelvis.map((x,i)=>x+([0,-.18,0][i]-x)*t);
 }
 const tuck=v.trickTuck||0,flipping=Math.abs(v.trickFlip||0)>.001||Math.abs(v.boardYaw||0)>.001;for(const foot of[pose.left,pose.right])foot[1]+=flipping?tuck*.38:0;pose.pelvis[1]+=flipping?tuck*.12:-tuck*.12;pose.twist+=(v.trickSpin?-.18:0)*tuck;for(const hand of pose.hands){hand[0]*=1+tuck*.2;hand[1]+=tuck*.22;}
 if(v.bail>0){pose.pelvis[1]-=.2;pose.pitch+=.28;pose.hands[0][1]+=.25;}
 if(v.manual){pose.pelvis[1]-=.13;pose.pelvis[2]+=.17;for(const hand of pose.hands)hand[1]+=.12;}
 if(v.grindKind){const nose=v.grindKind==='Nosegrind'||v.grindKind==='Noseslide'||v.grindKind==='Crooked',tail=v.grindKind==='5-0'||v.grindKind==='Tailslide'||v.grindKind==='Smith';const oldNose=['Nosegrind','Noseslide','Crooked'].includes(v.grindFromKind),oldTail=['5-0','Tailslide','Smith'].includes(v.grindFromKind),t=v.grindMix??1;pose.pelvis[2]+=(oldNose?-.2:oldTail?.2:0)*(1-t)+(nose?-.2:tail?.2:0)*t;pose.pelvis[1]-=.16;pose.roll+=v.lean*.4;for(const hand of pose.hands)hand[1]+=.18;}
 return pose;
}
// Capsule outline: rounded tips, continuous curved kicktail, unchanged wheelbase/foot contacts.
export function deckOutline(radius=.37,halfStraight=.58,steps=12){const points=[];for(const side of[1,-1])for(let i=0;i<=steps;i++){const a=i/steps*Math.PI;points.push([side*Math.cos(a)*radius,side*(halfStraight+Math.sin(a)*radius)]);}return points;}
function roundedDeck(b){const lift=z=>Math.max(0,(Math.abs(z)-.58)/.37)**2*.085,outline=deckOutline();for(let i=0;i<outline.length;i++){const[x,z]=outline[i],[xx,zz]=outline[(i+1)%outline.length];b.quad([x,.29+lift(z),z],[xx,.29+lift(zz),zz],[xx,.37+lift(zz),zz],[x,.37+lift(z),z],'#b8db76');}
 const surface=(r,h,y,color)=>{b.quad([-r,y,-h],[-r,y,h],[r,y,h],[r,y,-h],color);const rim=deckOutline(r,h);for(let side=0;side<2;side++)for(let i=0;i<12;i++){const[x,z]=rim[side*13+i],[xx,zz]=rim[side*13+i+1];b.tri([0,y,(side?-1:1)*h],[xx,y+lift(zz),zz],[x,y+lift(z),z],color);}};
 surface(.37,.58,.29,'#d5b487');surface(.37,.58,.37,'#c3ed85');surface(.338,.57,.382,'#293e49');
}
let deckMesh;
export function drawSkate(b,v){
 if(!deckMesh){deckMesh=new Batch();roundedDeck(deckMesh);}b.append(deckMesh);
 for(const side of[-1,1])b.box([side*.19,.389,0],[.018,.008,1.1],'#809e93');
 for(const z of[-.52,.52]){b.box([0,.39,z],[.46,.009,.035],'#c5f37a');b.box([0,.28,z],[.52,.025,.06],'#546d78');}
 for(const side of[-1,1]){b.box([0,.25,side*.55],[.55,.07,.1],'#a4bcc0');b.box([0,.389,side*.5],[.4,.012,.06],'#bbe977');
  for(const x of[-.38,.38]){const y=.14,z=side*.55,r=.14;for(let i=0;i<10;i++){const a=i/10*Math.PI*2,c=(i+1)/10*Math.PI*2;for(const sign of[-1,1])b.tri([x+sign*.075,y,z],[x+sign*.075,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+sign*.075,y+Math.cos(c)*r,z+Math.sin(c)*r],'#eddcae');b.quad([x-.075,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+.075,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+.075,y+Math.cos(c)*r,z+Math.sin(c)*r],[x-.075,y+Math.cos(c)*r,z+Math.sin(c)*r],'#9caa9c');}
   for(const sign of[-1,1])b.limb([x+sign*.08,y,z],[x+sign*.08,y+Math.cos(v.wheel)*.115,z+Math.sin(v.wheel)*.115],.025,'#45546b');
  }
 }
}
// Paint only: the old road, coin IDs, quests and collision geometry stay intact.
export function drawSkateArea(b){
 for(const x of[-3.4,3.4])b.box([x,.173,28],[.055,.012,24],'#b6f186');
 for(const z of[39,35,31])for(const side of[-1,1])b.limb([side*.65,.18,z+.45],[0,.18,z-.25],.035,'#d6efa3');
 for(const z of[24,25])b.box([0,.18,z],[4,.014,.12],'#dfb6fc');
 for(const x of[-1.7,1.7])for(let i=0;i<20;i++){const a=i/20*Math.PI*2,c=(i+1)/20*Math.PI*2;b.limb([x+Math.cos(a)*.7,.18,29+Math.sin(a)*.7],[x+Math.cos(c)*.7,.18,29+Math.sin(c)*.7],.035,'#e4d998');}
 b.box([0,.169,18],[6,.01,3],'#9b9286');for(let z=16.8;z<19.5;z+=.4)b.box([0,.18,z],[5.8,.012,.06],'#ccb99a');
}
