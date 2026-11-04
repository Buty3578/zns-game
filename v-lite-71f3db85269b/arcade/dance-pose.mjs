import{foundationPose}from'./dance-foundations.mjs';
const lift=x=>Math.max(0,x);
const foot=(side,x=0,y=0,z=0)=>[side*.2+x,.16+y,z];
const pose=(left,right,pelvis,torso,leftHand,rightHand,leftElbow,rightElbow,yaw=0)=>({left,right,pelvis,torso,hands:[leftHand,rightHand],elbows:[leftElbow,rightElbow],yaw});
const arms=(lx,ly,lz,rx,ry,rz)=>[[lx,ly,lz],[rx,ry,rz]];
const elbows=(lx=-.5,ly=1.55,lz=0,rx=.5,ry=1.55,rz=0)=>[[lx,ly,lz],[rx,ry,rz]];
export const ANIMATED_DANCE_IDS=['bounce','two-step','running-man','roger-rabbit','cabbage-patch','reebok','steve-martin','biz-markie','bart-simpson','smurf','wop','prep','skate','monastery','pepperseed','rock','step-touch','heel-toe','charleston','robocop'];
function legacyPose(id,phase){const s=Math.sin(phase),c=Math.cos(phase),a=Math.sin(phase*2),b=Math.cos(phase*2),step=lift(s),opp=lift(-s);let h,e;
 switch(id){
 case'bounce':h=arms(-.55,1.35+a*.12,-.2,.55,1.35-a*.12,-.2);e=elbows(-.45,1.52,.05,.45,1.52,.05);return pose(foot(-1,0,.04*step,-.07),foot(1,0,.04*opp,.07),[0,-.1+Math.abs(s)*.08,0],{pitch:.08+a*.04},...h,...e);
 case'two-step':h=arms(-.7,1.42+c*.14,-.15,.7,1.42-c*.14,-.15);e=elbows(-.48,1.61,-.02,.48,1.61,.02);return pose(foot(-1,-.18*s,.07*step,-.2*s),foot(1,-.18*s,.07*opp,.2*s),[.16*s,-.06+.04*b,0],{roll:-.11*s,yaw:.08*s},...h,...e,-.07*s);
 case'running-man':h=arms(-.65,1.2+.36*opp,-.42*s,.65,1.2+.36*step,.42*s);e=elbows(-.52,1.56,-.17*s,.52,1.56,.17*s);return pose(foot(-1,0,.27*step,-.38*c),foot(1,0,.27*opp,.38*c),[0,-.1+.05*a,.03],{pitch:.14},...h,...e);
 case'roger-rabbit':h=arms(-.53,1.1+.4*step,.24*c,.53,1.1+.4*opp,-.24*c);e=elbows(-.43,1.54,.16,.43,1.54,.16);return pose(foot(-1,-.05,.23*opp,.33*c),foot(1,.05,.23*step,-.33*c),[0,-.09+.07*Math.abs(a),.12],{pitch:-.09,yaw:.13*s},...h,...e);
 case'cabbage-patch':h=arms(-.54+.2*c,1.36+.28*s,-.37,.54+.2*c,1.36-.28*s,-.37);e=elbows(-.43,1.65,.02,.43,1.65,.02);return pose(foot(-1,-.16*s,.1*step,-.08),foot(1,.16*s,.1*opp,.08),[.15*s,-.1+.04*b,0],{roll:-.12*s,yaw:.09*c},...h,...e);
 case'reebok':h=arms(-.88,1.31+.27*step,.08,-.05,1.55+.18*opp,-.4);e=elbows(-.57,1.62,.04,.35,1.57,-.12);return pose(foot(-1,-.3*step,.15*step,-.23),foot(1,.3*opp,.13*opp,.21),[-.14*s,-.06+.05*a,0],{roll:.18*s,yaw:-.11*s},...h,...e);
 case'steve-martin':h=arms(-.72,1.64+.15*c,-.32,.72,1.18-.15*c,.1);e=elbows(-.45,1.69,-.07,.48,1.48,.15);return pose(foot(-1,.17*s,.13*step,-.29*c),foot(1,-.17*s,.13*opp,.29*c),[.09*s,-.08+.05*b,.06],{yaw:.28*s,pitch:.07},...h,...e,.13*s);
 case'biz-markie':h=arms(-.84,1.25+.17*a,.11,.35,1.75-.2*a,-.34);e=elbows(-.56,1.53,.08,.41,1.64,-.09);return pose(foot(-1,-.22*step,.1*step,.08),foot(1,.11*opp,.06*opp,-.2),[-.17*s,-.15+.07*Math.abs(s),-.04],{roll:.2*s,pitch:.14,yaw:-.08*c},...h,...e);
 case'bart-simpson':h=arms(-.79,1.47,-.18+.17*s,.79,1.47,-.18-.17*s);e=elbows(-.48,1.76,0,.48,1.76,0);return pose(foot(-1,.2*s,.06*step,-.18),foot(1,.2*s,.06*opp,.18),[.22*s,-.06+.04*b,0],{roll:-.18*s,yaw:.12*c},...h,...e,-.1*s);
 case'smurf':h=arms(-.47,1.18+.24*step,-.44,.47,1.18+.24*opp,-.44);e=elbows(-.49,1.5,-.15,.49,1.5,-.15);return pose(foot(-1,-.12,.12*step,-.23*s),foot(1,.12,.12*opp,.23*s),[0,-.23+.09*Math.abs(s),.08],{pitch:.22,yaw:.08*c},...h,...e);
 case'wop':h=arms(-.9,1.7+.15*s,-.22,.66,1.2-.15*s,.2);e=elbows(-.53,1.69,.04,.47,1.52,.12);return pose(foot(-1,-.13*s,.1*step,-.14),foot(1,.13*s,.1*opp,.14),[.13*s,-.07+.04*a,0],{roll:.22*s,yaw:-.3*s},...h,...e,.12*s);
 case'prep':h=arms(-.18,1.34+.13*a,-.41,.18,1.46-.13*a,-.43);e=elbows(-.53,1.64,-.1,.53,1.64,-.1);return pose(foot(-1,.13*c,.06*step,-.22*s),foot(1,-.13*c,.06*opp,.22*s),[0,-.08+.05*b,0],{yaw:.13*c,pitch:.04},...h,...e);
 case'skate':h=arms(-.81,1.51+.12*c,.18,.71,1.4-.12*c,-.31);e=elbows(-.57,1.62,.12,.49,1.6,-.1);return pose(foot(-1,-.18,.05*step,-.34*c),foot(1,.26,.13*opp,.38*c),[.14*s,-.06+.04*b,.03],{roll:-.12*s,pitch:.1,yaw:.17*s},...h,...e);
 case'monastery':h=arms(-.62,1.74-.14*c,-.13,.62,1.74+.14*c,-.13);e=elbows(-.48,1.69,.12,.48,1.69,.12);return pose(foot(-1,-.09,.26*step,.32*c),foot(1,.09,.26*opp,-.32*c),[0,-.09+.06*Math.abs(a),-.05],{pitch:-.11,roll:.08*s},...h,...e);
 case'pepperseed':h=arms(-.58,1.32+.25*a,-.32,.58,1.32-.25*a,-.32);e=elbows(-.46,1.58,-.04,.46,1.58,-.04);return pose(foot(-1,-.14*a,.16*lift(a),-.22*b),foot(1,.14*a,.16*lift(-a),.22*b),[.1*a,-.11+.06*Math.abs(a),0],{yaw:.16*a,roll:-.1*a},...h,...e);
 default:return dancePose('bounce',phase);
 }
}
export function blendDancePose(a,b,t){
 t=Number.isFinite(t)?Math.max(0,Math.min(1,t)):1;
 if(t===0)return a;if(t===1)return b;
 const blend=(x,y)=>{
  if(Array.isArray(x)||Array.isArray(y))return Array.from({length:Math.max(x?.length||0,y?.length||0)},(_,i)=>blend(x?.[i],y?.[i]));
  if(x&&typeof x==='object'||y&&typeof y==='object')return Object.fromEntries([...new Set([...Object.keys(x||{}),...Object.keys(y||{})])].map(k=>[k,blend(x?.[k],y?.[k])]));
  // Omitted rotation axes mean zero, in either direction of the transition.
  const from=Number.isFinite(x)?x:0,to=Number.isFinite(y)?y:0;return from+(to-from)*t;
 };
 return blend(a,b);
}

const supportCache=new Map();
export function dancePose(id,phase){
 const basic=foundationPose(id,phase);if(basic)return basic;
 const p=legacyPose(id,phase);p.torso.yaw=(p.torso.yaw||0)+(p.yaw||0);p.yaw=0;
 // Cache contact positions once. During a stance the support foot stays fixed.
 if(!supportCache.has(id)){
  const frames=Array.from({length:240},(_,i)=>legacyPose(id,i*Math.PI*2/240));
  supportCache.set(id,frames.map((f,i)=>['left','right'].map(key=>{
   if(f[key][1]>.161)return null;
   let at=i;for(let k=0;k<240;k++){const prev=(at+239)%240;if(frames[prev][key][1]>.161)break;at=prev;}
   return frames[at][key].slice();
  })));
 }
 const i=Math.floor(((phase%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*240)%240;
 for(const [n,key]of ['left','right'].entries()){const anchor=supportCache.get(id)[i][n];if(anchor&&p[key][1]<=.161){p[key][0]=anchor[0];p[key][2]=anchor[2];}}
 return p;
}
