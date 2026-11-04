// Distance-driven gait, collision substeps, buffered jumps and coyote time.
export const approach=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function initMotion(p){
 Object.assign(p,{vx:0,vz:0,speed:0,gait:0,moveBlend:0,runBlend:0,land:0,landTarget:0,landingTime:0,coyote:.12,jumpBuffer:0,lean:0,forwardLean:0,air:0,grounded:true,motionState:'idle'});return p;
}
export function stepMotion(p,dt,dx,dz,{solid,ground,jumpSpeed=7.6,gravity=22,facingYaw}){
 if(dt<=0)return{travelled:0,landed:false,impact:0};
 p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.landingTime=Math.max(0,p.landingTime-dt);p.landTarget=Math.max(0,p.landTarget-dt*5);
 const floor=ground(p.x,p.z);
 if(Math.abs(p.y-floor)<=.045&&p.vy<=0){p.grounded=true;p.coyote=.12;}else{p.grounded=false;p.coyote=Math.max(0,p.coyote-dt);}
 if(p.jumpBuffer>0&&p.coyote>0){p.vy=jumpSpeed;p.jumpBuffer=0;p.coyote=0;p.grounded=false;p.landTarget=0;p.landingTime=0;}
 const desired=Math.hypot(dx,dz),oldSpeed=Math.hypot(p.vx,p.vz),reversing=p.vx*dx+p.vz*dz<0;
 const accel=reversing?18:desired>oldSpeed?10:19;
 p.vx=approach(p.vx,dx,p.grounded?accel:5,dt);p.vz=approach(p.vz,dz,p.grounded?accel:5,dt);
 if(desired<.01&&Math.hypot(p.vx,p.vz)<.025){p.vx=0;p.vz=0;}
 const maxStep=p.grounded?.5:.06;const oldX=p.x,oldZ=p.z,steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vz)*dt/.22));
 for(let i=0;i<steps;i++){
  const sx=p.vx*dt/steps,sz=p.vz*dt/steps;
  if(!solid(p.x+sx,p.z,p.y)&&ground(p.x+sx,p.z)<=p.y+maxStep)p.x+=sx;else p.vx=0;
  if(!solid(p.x,p.z+sz,p.y)&&ground(p.x,p.z+sz)<=p.y+maxStep)p.z+=sz;else p.vz=0;
 }
 const travelled=Math.hypot(p.x-oldX,p.z-oldZ);p.speed=travelled/dt;
 p.runBlend=approach(p.runBlend,smooth((p.speed-6.6)/3.6),9,dt);
 if(p.grounded)p.gait+=travelled/(2.2+.35*p.runBlend)*Math.PI*2;
 // Face actual travel during a turn; a reversal must first brake the old velocity.
 if(desired>.08||Number.isFinite(facingYaw)){
  const moving=p.speed>.3,target=Number.isFinite(facingYaw)?facingYaw:moving?Math.atan2(-p.vx,-p.vz):Math.atan2(-dx,-dz),turn=angleDelta(p.yaw,target);
  p.yaw+=turn*(1-Math.exp(-dt*(p.grounded?12:6)));
  p.lean=approach(p.lean,clamp(turn*.12,-.18,.18)*clamp(p.speed/4),9,dt);
 }else p.lean=approach(p.lean,0,9,dt);
 p.forwardLean=approach(p.forwardLean,clamp((p.speed-oldSpeed)/Math.max(dt,.001)/35,-.25,.35),8,dt);
 p.moveBlend=approach(p.moveBlend,clamp(p.speed/2),12,dt);
 const top=ground(p.x,p.z);let before=p.y;
 if(p.grounded&&top>p.y&&top-p.y<=.5){p.y=top;before=top;}
 p.vy-=gravity*dt;p.y+=p.vy*dt;
 let landed=false,impact=0;
 if(p.y<=top&&before>=top-.08&&p.vy<=0){
  landed=!p.grounded&&p.vy< -2;impact=landed?Math.min(1,-p.vy/12):0;
  if(landed){p.landTarget=impact;p.landingTime=.22;}
  p.y=top;p.vy=0;p.grounded=true;p.coyote=.12;
 }
 // A changed surface must never teleport the player up through a roof.
 if(p.y< -5){p.y=0;p.vy=0;}
 p.air=approach(p.air,p.grounded?0:1,15,dt);
 p.land=approach(p.land,p.landTarget,p.landTarget>p.land?28:14,dt);
 p.motionState=!p.grounded?'jump':p.landingTime>0?'landing':p.speed>7.6?'run':p.speed>.18?'walk':'idle';
 return{travelled,landed,impact};
}
export function gaitFoot(phase,side,blend=1,runBlend=0){
 const run=clamp(runBlend),stance=.6-.08*run,stride=2.2+.35*run,reach=stride*stance/2;
 const u=((phase/(Math.PI*2)+(side>0?.5:0))%1+1)%1,t=clamp((u-stance)/(1-stance)),swing=smooth(t);
 return[side*.2,.16+Math.sin(t*Math.PI)*(.3+.12*run)*blend,(u<stance?-reach+u*stride:reach-swing*reach*2)*blend];
}
export function footPose(phase,side,{moveBlend=0,runBlend=0,air=0,vy=0}={}){
 const foot=gaitFoot(phase,side,clamp(moveBlend),runBlend),jump=clamp(air),rise=smooth((vy+2)/5);
 // Continuous through the apex: no vy>0 branch that snaps the feet by 11 cm.
 const tucked=[side*.2,.23+rise*.11,side<0?.18+rise*.06:-.19-rise*.06];
 return foot.map((v,i)=>v+(tucked[i]-v)*jump);
}
export function legKnee(hip,foot,hint=[0,0,-1]){
 const axis=foot.map((v,i)=>v-hip[i]),distance=Math.hypot(...axis)||1,unit=axis.map(v=>v/distance);
 // Two equal bone lengths with a forward knee pole, instead of a stretched midpoint.
 const dot=hint.reduce((sum,v,i)=>sum+v*unit[i],0),pole=hint.map((v,i)=>v-unit[i]*dot),length=Math.hypot(...pole)||1;
 const bend=Math.sqrt(Math.max(.0025,.61*.61-distance*distance/4));
 return hip.map((v,i)=>(v+foot[i])/2+pole[i]/length*bend);
}
export function armPose(phase,side,{moveBlend=0,runBlend=0,air=0,vy=0,land=0}={}){
 const blend=clamp(moveBlend),run=clamp(runBlend),jump=clamp(air);
 // Each arm counters its own leg, using the exact same stance/swing cycle.
 const swing=-gaitFoot(phase,side,blend,run)[2]*(.72+.1*run);
 const hand=[side*(.43+blend*.025),1.1+run*.27+Math.abs(swing)*.25+land*.06,swing-.04];
 const elbow=[side*.47,1.43+run*.12+Math.abs(swing)*.12,swing*.35+.035];
 const airborneHand=[side*.64,1.65+Math.min(.25,Math.max(0,vy)*.022),-.08];
 const airborneElbow=[side*.5,1.7,.04];
 return{hand:hand.map((x,i)=>x+(airborneHand[i]-x)*jump),elbow:elbow.map((x,i)=>x+(airborneElbow[i]-x)*jump)};
}
// Shared pelvis/torso pose keeps the shoulders and hips connected as states blend.
export function locomotionPose(phase,{idlePhase=0,moveBlend=0,runBlend=0,air=0,land=0,lean=0,forwardLean=0}={}){
 const move=clamp(moveBlend),run=clamp(runBlend),ground=1-clamp(air);
 const bounce=(Math.sin(idlePhase)*.017*(1-move)+Math.cos(phase*2)*(.023+.014*run)*move)*ground;
 const crouch=clamp(land)*.2+air*.08+run*.035;
 return{pelvis:[Math.sin(phase)*.02*move*ground+lean*.08,bounce-crouch,-forwardLean*.12],
  pitch:-move*(.07+.08*run)*ground-forwardLean*.18-air*.04,
  roll:-lean*ground,twist:Math.sin(phase)*.035*move*ground};
}
