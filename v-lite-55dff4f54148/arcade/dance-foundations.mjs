// Original procedural blocking based on instructor breakdowns; no third-party animation data.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>Array.isArray(a)?a.map((v,i)=>mix(v,b[i],t)):typeof a==='object'?Object.fromEntries(Object.keys(a).map(k=>[k,mix(a[k],b[k],t)])):a+(b-a)*t;
const frame=(l,r,p=[0,-.08,0],torso={},hands=[[-.6,1.35,-.2],[.6,1.35,-.2]],feet=[{pitch:0,yaw:0,pivotZ:0},{pitch:0,yaw:0,pivotZ:0}])=>({left:l,right:r,pelvis:p,torso:{pitch:torso.pitch||0,roll:torso.roll||0,yaw:torso.yaw||0},hands,elbows:[[-.49,1.55,-.12],[.49,1.55,-.12]],yaw:0,hipYaw:0,feet});
function clip(keys,beat){beat=((beat%4)+4)%4;const i=Math.floor(beat*2),u=smooth(beat*2-i);return mix(keys[i],keys[(i+1)%keys.length],u);}
const sideClips=new Map();let charlestonClip;
function sideStep(beat,diagonal){
 if(sideClips.has(diagonal))return clip(sideClips.get(diagonal),beat);
 const z=diagonal?.14:0;
 const keys=[
 [[.05,.16,z],[.45,.16,0],.26],
 [[-.45,.27,-z],[.45,.16,0],.08],
 [[-.45,.16,-z],[.45,.16,0],-.26],
 [[-.45,.16,-z],[-.05,.25,0],-.28],
 [[-.45,.16,-z],[-.05,.16,0],-.26],
 [[-.45,.16,-z],[.45,.27,z],-.08],
 [[-.45,.16,-z],[.45,.16,z],.26],
 [[.05,.25,0],[.45,.16,z],.28]
 ];
 const frames=keys.map(([l,r,x],i)=>frame(l,r,[x,-.12+(i%2)*.055,0],{roll:-x*.22,pitch:diagonal?.09:.04},[[-.64,1.26+(i%2)*.1,-.24-x*.3],[.64,1.26+(i%2)*.1,-.24+x*.3]]));sideClips.set(diagonal,frames);return clip(frames,beat);
}
export function foundationPose(id,phase){
 const beat=phase/Math.PI,s=Math.sin(phase),c=Math.cos(phase),down=(1+Math.cos(phase*2))/2;
 if(id==='bounce')return frame([-.23,.16,0],[.23,.16,0],[0,-.04-.15*down,0],{pitch:.04+.07*down},[[-.56,1.34-.08*down,-.18],[.56,1.34-.08*down,-.18]]);
 if(id==='rock')return frame([-.23,.16,-.15],[.23,.16,.15],[0,-.08-.04*down,.14*s],{pitch:-.12*s},[[-.62,1.32+.1*s,-.2-.1*s],[.62,1.32-.1*s,-.2-.1*s]]);
 if(id==='step-touch'||id==='two-step')return sideStep(beat,id==='two-step');
 if(id==='running-man'||id==='roger-rabbit'){
  const back=id==='roger-rabbit'?-1:1,q=((beat%2)+2)%2*2,i=Math.floor(q),u=smooth(q-i);
  const legs=[[[ -.2,.16,.28*back],[.2,.16,-.28*back]],[[ -.2,.48,-.12*back],[.2,.16,0]],[[ -.2,.16,-.28*back],[.2,.16,.28*back]],[[ -.2,.16,0],[.2,.48,-.12*back]]];
  const [l,r]=mix(legs[i],legs[(i+1)%4],u),prep=Math.sin(Math.PI*(q%2)/2)**2;
  return frame(l,r,[0,-.14+.11*prep,id==='roger-rabbit'?.1:0],{pitch:id==='roger-rabbit'?-.08:.1},[[-.63,1.48-.3*prep,-.3+.2*prep],[.63,1.48-.3*prep,-.3+.2*prep]]);
 }
 if(id==='cabbage-patch')return frame([-.27,.16,0],[.27,.16,0],[.12*c,-.12+.04*Math.sin(phase*2),.025*s],{roll:-.07*c,yaw:.06*c},[[-.36+.25*c,1.38+.18*s,-.48],[.36+.25*c,1.38+.18*s,-.48]]);
 if(id==='heel-toe'){
  const turn=.38*s,feet=[{pitch:.12*s,yaw:turn,pivotZ:s>=0?.16:-.38},{pitch:-.12*s,yaw:turn,pivotZ:s>=0?-.38:.16}];
  const p=frame([-.19,.16,0],[.19,.16,0],[.09*s,-.1,.02*c],{yaw:.14*s,roll:-.04*s},[[-.64,1.3,-.2-.12*s],[.64,1.3,-.2+.12*s]],feet);p.hipYaw=.14*s;return p;
 }
 if(id==='charleston'){
  if(charlestonClip)return clip(charlestonClip,beat);
  const keys=[
   [[-.2,.16,0],[.2,.16,0]], [[-.2,.25,-.34],[.2,.16,0]], [[-.2,.16,-.34],[.2,.16,0]], [[-.2,.25,0],[.2,.16,0]],
   [[-.2,.16,0],[.2,.16,0]], [[-.2,.16,0],[.2,.25,.34]], [[-.2,.16,0],[.2,.16,.34]], [[-.2,.16,0],[.2,.25,0]]
  ];
  charlestonClip=keys.map(([l,r],i)=>frame(l,r,[0,-.08-(i%2?0:.04),i<4?.07:-.07],{pitch:.07},[[-.6,1.3,-.18-r[2]*.7],[.6,1.3,-.18-l[2]*.7]],[{pitch:0,yaw:(i%2?-.15:.15),pivotZ:-.35},{pitch:0,yaw:(i%2?.15:-.15),pivotZ:-.35}]));return clip(charlestonClip,beat);
 }
 if(id==='robocop'){
  const side=Math.sign(s||1),hit=Math.sin(phase)**4;
  const p=frame([-.26,.16,0],[.26,.16,0],[.07*side*hit,-.13+.06*hit,0],{roll:.12*side*hit},[[-.46,1.5+.2*hit,-.48],[.46,1.5+.2*hit,-.48]]);
  p.elbows=[[-.48,1.5+.2*hit,-.08],[.48,1.5+.2*hit,-.08]];return p;
 }
 return null;
}
// Render the ankle at the same position as the shoe rotated about its contact point.
export function danceAnkle(foot,angles){
 const pivot=[foot[0],foot[1]-.14,foot[2]+angles.pivotZ],x=0,y=.14,z=-angles.pivotZ,c=Math.cos(angles.pitch),s=Math.sin(angles.pitch),ry=y*c-z*s,rz=y*s+z*c;
 return[pivot[0]+rz*Math.sin(angles.yaw),pivot[1]+ry,pivot[2]+rz*Math.cos(angles.yaw)];
}
