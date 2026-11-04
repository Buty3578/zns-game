import{STREET_GRINDS,railHeight}from'./street-skate.mjs';
import{CITY_OBSTACLES}from'./new-district.mjs';
import{MOSCOW_GRIND}from'./moskovsky.mjs';
import{SOL_OBSTACLES}from'./solntsevo.mjs';

export const GRIND_SURFACES=[...CITY_OBSTACLES.filter(o=>o.kind==='rail'||o.kind==='curb'),...MOSCOW_GRIND,...SOL_OBSTACLES.filter(o=>o.kind==='rail'||o.kind==='curb'||o.kind==='ledge'),...STREET_GRINDS];
export const GRIND_POINTS={'50-50':180,Boardslide:220,'5-0':240,Nosegrind:240,Noseslide:260,Tailslide:260,Lipslide:280,Crooked:300,Smith:320};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const diff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
function railAxis(rail){return rail.d>=rail.w?'z':'x';}
function railAngle(rail){return railAxis(rail)==='z'?0:Math.PI/2;}
function candidate(v,rail){const axis=railAxis(rail),side=axis==='z'?Math.abs(v.x-rail.x):Math.abs(v.z-rail.z),along=axis==='z'?Math.abs(v.z-rail.z):Math.abs(v.x-rail.x),length=axis==='z'?rail.d:rail.w;return side<.37&&along<length/2-.35&&Math.abs(v.y-railHeight(rail,v.x,v.z))<.12;}
export function grindKind(v,rail,input){const angle=Math.abs(diff(v.yaw,railAngle(rail)))%Math.PI,skew=Math.min(angle,Math.PI-angle)>.25,steer=input.x||0;
 if(skew)return steer<-.3?'Tailslide':steer>.3?'Noseslide':'Boardslide';
 return steer<-.3?'5-0':steer>.3?'Nosegrind':'50-50';
}
// Local board contact sits on the rail cap (y = h + .045).
export function grindVisual(kind,surfaceKind='rail',capOffset,from,blend=1){
 const pitch=kind==='5-0'?.2:kind==='Nosegrind'?-.2:kind==='Crooked'?-.17:kind==='Smith'?.16:0;
 const slide=kind==='Boardslide'||kind==='Noseslide'||kind==='Tailslide'||kind==='Lipslide';
 const contactZ=kind==='Noseslide'?-.72:kind==='Tailslide'?.72:kind==='Smith'?-.55:pitch>0?.55:pitch<0?-.55:0;
 const surface=slide?.29+Math.max(0,(Math.abs(contactZ)-.58)/.37)**2*.085:.215;
 const contactY=.37+(surface-.37)*Math.cos(pitch)-contactZ*Math.sin(pitch);
 const pose={base:(capOffset??(surfaceKind==='rail'?.045:0))-contactY,pitch,yaw:kind==='Lipslide'?-Math.PI/2:slide?Math.PI/2:kind==='Crooked'?.28:kind==='Smith'?-.24:0,shift:slide?-contactZ:0,contactY,contactZ};if(from&&blend<1){const old=grindVisual(from,surfaceKind,capOffset);for(const key of Object.keys(pose))pose[key]=key==='yaw'?old[key]+diff(pose[key],old[key])*blend:old[key]+(pose[key]-old[key])*blend;}return pose;
}
export class SkateGrind{
 constructor(j){this.j=j;this.active=null;this.pending=null;this.escape=false;}
 reset(){this.active=null;this.pending=null;this.escape=false;const v=this.j.vehicle;if(v?.id==='skate'){v.grindKind=null;v.grindYaw=0;v.grindFromKind=null;v.grindMix=1;}}
 jump(){if(!this.active||this.escape)return false;this.escape=true;return true;}
 tryCatch(v,result,input){if(this.active||(!result.landed&&!(v.vy<0&&!v.grounded))||result.collision||v.speed<3||v.bail>0||!this.j.style.flight||this.j.style.canTouchRail?.()===false)return false;
  const rail=GRIND_SURFACES.find(r=>candidate(v,r));if(!rail)return false;
  const axis=railAxis(rail),delta=Math.abs(diff(v.yaw,railAngle(rail))),skew=Math.min(delta,Math.PI-delta);if(skew>.75)return false;
  const kind=grindKind(v,rail,input),sign=axis==='z'?-Math.sign(Math.cos(v.yaw)):-Math.sign(Math.sin(v.yaw));
  this.active={rail,axis,sign:sign||1,kind,time:0,distance:0,balance:.05,segmentAt:0,segmentDistance:0,receipts:[],seen:new Set(),switchCooldown:0};this.pending=null;
  if(axis==='z')v.x=rail.x;else v.z=rail.z;
  v.y=railHeight(rail,v.x,v.z);v.yaw=axis==='z'?(sign<0?0:Math.PI):(sign<0?Math.PI/2:-Math.PI/2);v.grounded=true;v.vy=0;v.push=0;v.grindKind=kind;v.grindYaw=kind==='Boardslide'||kind.endsWith('slide')?Math.PI/2:0;
  this.j.style.touchRail?.();result.landed=false;result.grinding=true;result.grindStart=kind;this.j.style.say(kind+' · держи баланс');return true;
 }
 closeSegment(a){const distance=a.distance-a.segmentDistance,time=a.time-a.segmentAt;if(distance>=1.2&&time>=.18&&!a.seen.has(a.kind)){a.receipts.push({kind:a.kind,name:a.kind,points:GRIND_POINTS[a.kind],grind:true});a.seen.add(a.kind);}}
 switchKind(){const a=this.active;if(!a||a.switchCooldown>0||a.distance-a.segmentDistance<1.2||a.time-a.segmentAt<.25)return false;this.closeSegment(a);const kinds=['50-50','Boardslide','Lipslide','5-0','Nosegrind','Noseslide','Tailslide'],next=a.inputX<-.3?'Crooked':a.inputX>.3?'Smith':kinds[(kinds.indexOf(a.kind)+1)%kinds.length],v=this.j.vehicle;if(next===a.kind)return false;v.grindFromKind=a.kind;v.grindMix=0;a.kind=next;a.segmentAt=a.time;a.segmentDistance=a.distance;a.switchCooldown=.35;v.grindKind=next;this.j.style.say(next+' · связка на перилах');return true;}
 step(v,dt,input){const a=this.active,rail=a.rail,axis=a.axis,result={landed:false,collision:false,impact:0,tookOff:false,ollie:false,grinding:true};dt=clamp(dt,0,.05);
  a.inputX=input.x||0;a.time+=dt;a.switchCooldown=Math.max(0,a.switchCooldown-dt);v.grindMix=Math.min(1,(v.grindMix??1)+dt/.18);a.balance=clamp(a.balance+dt*((input.x||0)*.7+.16+a.balance*.3+Math.sin(a.time*2)*.08),-1.2,1.2);
  v.speed=Math.max(0,v.speed-(.65+Math.abs(a.balance)*.55)*dt);const distance=v.speed*dt;a.distance+=distance;
  if(axis==='z'){v.x=rail.x;v.z+=a.sign*distance;}else{v.z=rail.z;v.x+=a.sign*distance;}
  v.wheel=(v.wheel+distance/.14)%(Math.PI*2);v.lean=a.balance*.15;v.grindKind=a.kind;v.grounded=true;v.y=railHeight(rail,v.x,v.z);v.vy=0;
  const pos=axis==='z'?v.z:v.x,center=axis==='z'?rail.z:rail.x,end=(axis==='z'?rail.d:rail.w)/2-.25;
  const fall=Math.abs(a.balance)>1||v.speed<1.5,leave=this.escape||Math.abs(pos-center)>end||fall;
  if(leave){this.active=null;this.escape=false;v.grindKind=null;v.grindYaw=0;v.grindFromKind=null;v.grindMix=1;v.grounded=false;v.vy=fall?-.5:5.4;v.y=railHeight(rail,v.x,v.z)+.03;v.vy+=Math.max(-2,Math.min(2,((rail.slopeX||0)*(axis==='x'?a.sign:0)+(rail.slopeZ||0)*(axis==='z'?a.sign:0))*v.speed));
   if(fall){v.bail=.65;v.speed*=.3;this.pending=null;this.j.style.abort('Срыв с перил — очки потеряны');result.collision=true;}
   else{this.closeSegment(a);this.pending={kind:a.kind,distance:a.distance,time:a.time,receipts:a.receipts};this.j.style.leaveRail?.(v);this.j.style.say(a.kind+' · приземлись чисто');}
  }
  return result;
 }
 finish(v,result){if(!this.pending)return 0;if(result.collision||v.bail>0){this.pending=null;return 0;}if(!result.landed)return 0;
  const p=this.pending;this.pending=null;if(p.deferred)return 0;if(p.distance<1.2||p.time<.18||result.impact>=18)return 0;
  return p.scored?p.points:this.j.style.awardGrind(p.kind,result.impact<=13&&Math.abs(v.steer)<.6);
 }
}
