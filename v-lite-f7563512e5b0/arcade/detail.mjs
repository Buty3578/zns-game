import{danceAnkle}from'./dance-foundations.mjs';
import{PLATFORMS,CACHES,RACE}from'./systems.mjs';
import{skatePose}from'./skate.mjs';
import{dancePose,blendDancePose}from'./dance-pose.mjs';
import{footPose,legKnee,armPose,locomotionPose}from'./motion.mjs';
const glyph={З:['110','001','010','001','110'],Н:['101','101','111','101','101'],С:['111','100','100','100','111']};
export function badge(b,x,y,z,size,color,word='ЗНС'){let col=0;for(const letter of word){const g=glyph[letter];if(!g)continue;for(let row=0;row<5;row++)for(let k=0;k<3;k++)if(g[row][k]==='1'){const xx=x+(col+k)*size,yy=y-row*size;b.quad([xx,yy,z],[xx+size*.83,yy,z],[xx+size*.83,yy-size*.83,z],[xx,yy-size*.83,z],color);}col+=4;}}
// Cache local ellipsoid vertices/normals; animation only transforms them each frame.
const ovalMeshes=new Map();
export function oval(b,p,r,color,segments=10,rings=6){
 if(b.lowDetail){segments=Math.max(6,Math.round(segments*.7));rings=Math.max(3,Math.round(rings*.7));}
 const key=[...r,segments,rings].join(',');let mesh=ovalMeshes.get(key);
 if(!mesh){const values=[],v=(i,j)=>{const a=i/rings*Math.PI,c=j/segments*Math.PI*2;return[Math.sin(a)*Math.cos(c)*r[0],Math.cos(a)*r[1],Math.sin(a)*Math.sin(c)*r[2]];};
  for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){const a=v(i,j),c=v(i+1,j),d=v(i+1,j+1),e=v(i,j+1);for(const q of[a,c,d,a,d,e]){const normal=q.map((x,k)=>x/(r[k]*r[k])),length=Math.hypot(...normal)||1;values.push(...q,...normal.map(x=>x/length));}}
  mesh=new Float32Array(values);if(ovalMeshes.size>=128)ovalMeshes.delete(ovalMeshes.keys().next().value);ovalMeshes.set(key,mesh);
 }
 for(let i=0;i<mesh.length;i+=6)b.vertexXYZ(p[0]+mesh[i],p[1]+mesh[i+1],p[2]+mesh[i+2],mesh[i+3],mesh[i+4],mesh[i+5],color);
}
export function detailedCharacter(b,{x,z,y=0,yaw=0,phase=0,idlePhase=phase,walking=false,dance=false,color='#b9ff4d',look=0,scale=1,hit=0,danceLane=-1,danceAccent=0,drive=false,danceMoveId=null,previousDanceMoveId=null,danceMoveTime=Infinity,moveBlend=walking?1:0,air=0,land=0,vy=0,lean=0,runBlend=0,forwardLean=0,ride=null,form=null,skate=null}){
 const phrase=Math.floor(phase/(Math.PI*8))%4,s=Math.sin(phase),c=Math.cos(phase),swing=dance?s*.17:0,skin=look===1?'#c38c70':look===2?'#9d7054':'#c89577';
 const boardPose=skate?skatePose(skate):null;
 const locomotion=locomotionPose(phase,{idlePhase,moveBlend,runBlend,air,land,lean,forwardLean});
 const mount=skate?Math.max(0,Math.min(1,skate.mount)):0,boardWeight=mount*mount*(3-2*mount),mix=(a,b)=>a+(b-a)*boardWeight;
 const accent=dance?Math.sin(Math.min(1,danceAccent)*Math.PI/2):0,sideAccent=danceLane===0?-accent:danceLane===3?accent:0;
 let choreo=dance&&danceMoveId?dancePose(danceMoveId,phase):null;if(choreo&&previousDanceMoveId&&danceMoveTime<.2)choreo=blendDancePose(dancePose(previousDanceMoveId,phase),choreo,danceMoveTime/.2);
 const pelvis=choreo?choreo.pelvis:dance?[sideAccent*.12,Math.sin(phase*2)*.09-(phrase===3?.22:0)-(danceLane===1?accent*.16:0),0]:boardPose?locomotion.pelvis.map((v,i)=>mix(v,boardPose.pelvis[i])):ride?[0,0,0]:locomotion.pelvis;
 const hip=1.08+pelvis[1],pose={moveBlend,runBlend,air,vy,land};
 b.group([x,y,z],yaw+(choreo?choreo.yaw:dance&&phrase===1?s*.13:0),()=>{
  const left=choreo?choreo.left:dance?[-.2+s*.11,.16,-swing]:footPose(phase,-1,pose),right=choreo?choreo.right:dance?[.2+s*.11,.16,swing]:footPose(phase,1,pose);
  for(const [i,f] of [left,right].entries()){if(boardPose){const target=i===0?boardPose.left:boardPose.right;for(let k=0;k<3;k++)f[k]=mix(f[k],target[k]);}else if(ride){f[0]=(i===0?-1:1)*(ride==='bike'?.3:.23);f[1]=.55;f[2]=-.42;}}
  for(const side of[-1,1]){const shoe=side<0?left:right,angles=choreo?.feet?.[side<0?0:1],foot=angles?danceAnkle(shoe,angles):shoe,hipYaw=choreo?.hipYaw||0,hipJoint=[side*.18*Math.cos(hipYaw)+pelvis[0],hip,pelvis[2]-side*.18*Math.sin(hipYaw)],knee=legKnee(hipJoint,foot,angles?[-Math.sin(angles.yaw),0,-Math.cos(angles.yaw)]:undefined);b.limb(hipJoint,knee,.16,'#26333e');b.limb(knee,foot,.15,'#334450');b.box([side*.28+pelvis[0],hip-.17,pelvis[2]+.02],[.08,.22,.31],'#4d5a61');b.limb([hipJoint[0]+side*.12,hip-.11,hipJoint[2]],[knee[0]+side*.12,knee[1],knee[2]],.016,color);b.limb([knee[0]+side*.12,knee[1],knee[2]],[foot[0]+side*.12,foot[1]+.1,foot[2]],.016,color);
   b.pose(angles?[shoe[0],shoe[1]-.14,shoe[2]+angles.pivotZ]:shoe,angles?{pitch:angles.pitch,yaw:angles.yaw}:{yaw:boardPose?Math.PI*.42*skate.mount:0},()=>{const foot=shoe;b.box([foot[0],foot[1]-.075,foot[2]-.085],[.36,.13,.6],'#b7c1b7');b.box([foot[0],foot[1]+.01,foot[2]-.07],[.33,.18,.5],'#e0e8df');b.box([foot[0],foot[1]+.05,foot[2]-.16],[.21,.12,.22],look===1?'#8b739c':'#68766c');for(let j=0;j<3;j++)b.box([foot[0],foot[1]+.11,foot[2]-.08-j*.05],[.19,.017,.02],'#fff9df');b.box([foot[0]+side*.175,foot[1]+.01,foot[2]],[.022,.055,.25],color);});
  }
  b.group(pelvis,choreo?0:dance?s*.055:0,()=>{b.pose([0,1.08,0],boardPose?{pitch:mix(locomotion.pitch,boardPose.pitch),yaw:mix(locomotion.twist,boardPose.twist),roll:mix(locomotion.roll,boardPose.roll)}:choreo?choreo.torso:dance||ride?{}:{pitch:locomotion.pitch,yaw:locomotion.twist,roll:locomotion.roll},()=>{
   oval(b,[0,1.47,.015],[.4,.46,.28],color,10,5);b.box([0,1.15,0],[.65,.12,.43],'#68715f');b.box([0,1.7,.005],[.68,.21,.44],color);b.box([0,1.45,-.247],[.37,.035,.026],'#737f63');b.box([0,1.35,-.255],[.39,.14,.035],color);badge(b,-.155,1.72,-.295,.029,'#243b30');b.box([0,1.56,.307],[.56,.29,.018],'#263b3d');badge(b,-.23,1.67,.323,.044,'#d9ff9b');
   // Reflective piping and a separate jacket seam keep the original articulated silhouette readable.
   for(const side of[-1,1]){b.limb([side*.36,1.74,-.12],[side*.37,1.33,-.12],.012,'#e5ffbd');b.box([side*.16,1.06,-.23],[.16,.025,.02],'#d4f799');}
   b.limb([-.17,1.79,-.276],[.17,1.79,-.276],.013,'#f1e6bd');
   oval(b,[0,1.88,.12],[.24,.15,.19],look===1?'#4c354f':'#4b5b48',8,4);for(const side of[-1,1])b.limb([side*.095,1.86,-.18],[side*.08,1.61,-.28],.011,'#e6ead8');
   // Cross-body sling bag, zipper, strap and small patch.
   b.limb([-.28,1.84,-.225],[.25,1.28,-.28],.038,'#34444b');b.box([.24,1.35,-.3],[.29,.28,.11],'#33444c');b.box([.24,1.43,-.362],[.21,.017,.014],'#aab7b5');b.box([.3,1.34,-.363],[.07,.07,.015],'#baf251');
   for(const side of[-1,1]){let{hand,elbow}=armPose(phase,side,pose);
    if(boardPose){const target=boardPose.hands[side<0?0:1],joint=[side*.55,1.57,side*.16];hand=hand.map((v,i)=>mix(v,target[i]));elbow=elbow.map((v,i)=>mix(v,joint[i]));}else if(ride){hand=[side*.35,1.38,-.56];elbow=[side*.47,1.48,-.25];}
    if(choreo){hand=choreo.hands[side<0?0:1];elbow=choreo.elbows[side<0?0:1];if(drive||hit)hand[1]+=.3;}else if(dance){const wave=phrase===2;hand=[side*(wave?.82:.7),wave?1.6+Math.sin(phase+side)*.4:1.38-side*s*.35,-.35+(phrase===1?c*.2:0)];elbow=[side*.54,1.53+side*s*.18,-.1];if(drive||hit)hand[1]+=.45;if(danceLane===2)hand[1]+=.25*accent;hand[0]+=sideAccent*.22;}
    b.limb([side*.35,1.72,0],elbow,.145,color);b.limb(elbow,hand,.12,color);b.limb(hand,[hand[0],hand[1]-.05,hand[2]],.13,'#5b6b55');oval(b,[hand[0],hand[1]-.09,hand[2]],[.09,.12,.08],skin,6,4);b.box([hand[0]-side*.07,hand[1]-.05,hand[2]-.04],[.07,.08,.08],skin);
   }
   b.cylinder([0,1.99,0],.105,.19,skin,8);oval(b,[0,2.17,-.01],[.245,.28,.23],skin,12,7);for(const side of[-1,1]){oval(b,[side*.22,2.15,0],[.042,.075,.035],skin,6,4);oval(b,[side*.094,2.2,-.215],[.055,.064,.021],'#fffbe7',8,4);oval(b,[side*.094,2.195,-.237],[.027,.038,.012],'#293545',8,4);b.sphere([side*.085,2.214,-.249],.011,'#ffffff');b.box([side*.09,2.235,-.2],[.075,.018,.024],'#55402f');}b.box([0,2.13,-.232],[.047,.075,.047],skin);b.box([0,2.04,-.193],[.068,.017,.024],'#81543f');
   if(look===0){oval(b,[0,2.4,.02],[.252,.135,.24],'#263744',10,5);b.box([0,2.36,-.27],[.43,.055,.28],'#293e49');b.box([0,2.43,-.206],[.1,.06,.018],'#b9ed56');}
   else if(look===1){oval(b,[0,2.4,.06],[.235,.14,.22],'#3b3035',10,5);oval(b,[.04,2.54,.16],[.12,.12,.13],'#49363a',8,5);b.box([0,2.35,-.208],[.42,.055,.026],'#bba0d5');}
   else{b.cylinder([0,2.41,.01],.26,.22,'#bec8b6',12);b.cylinder([0,2.3,.01],.33,.05,'#d3dbcc',12);b.box([0,2.4,-.265],[.12,.08,.015],'#253f3f');}
   if(form==='web'){b.box([0,2.18,-.244],[.43,.105,.04],'#f3b648');for(const side of[-1,1])b.box([side*.1,2.19,-.271],[.12,.055,.027],'#1e4c66');b.limb([-.25,1.52,-.294],[.25,1.52,-.294],.025,'#ffeec8');b.limb([0,1.78,-.28],[0,1.24,-.29],.025,'#ffeec8');}if(form==='strong'){for(const side of[-1,1]){oval(b,[side*.4,1.72,.02],[.25,.23,.29],'#9bf069',8,4);b.box([side*.12,1.58,-.295],[.15,.18,.04],'#edffbf');}}if(form==='shade'){b.box([0,2.19,-.25],[.4,.08,.055],'#95fff7');badge(b,-.15,1.69,-.3,.027,'#e5fffd');}
   // Headphones have separate cushions and a curved headband.
   for(const side of[-1,1]){oval(b,[side*.256,2.19,.025],[.047,.105,.1],'#27383f',8,4);b.box([side*.285,2.2,-.005],[.025,.12,.11],color);b.limb([side*.255,2.27,.04],[side*.18,2.49,.02],.025,'#3a4b4b');}b.limb([-.18,2.49,.02],[.18,2.49,.02],.023,'#3a4b4b');
  });});
 },scale);
}
export function districtDetail(b,buildings){
 for(let i=0;i<buildings.length;i++){const[x,z,w,h,d]=buildings[i];
  for(let floor=1;floor<h/3;floor++){const y=floor*3;b.box([x,y,z+d/2+.08],[w,.065,.11],'#7e8e8c');}
  for(let k=0;k<3;k++){const xx=x-w*.32+k*w*.32;b.box([xx,1.55,z+d/2+.03],[1.25,2.65,.12],'#3a555c');b.box([xx,3,z+d/2+.65],[2.1,.18,1.5],'#536c73');b.box([xx,.25,z+d/2+.45],[1.7,.3,.8],'#929e97');b.box([xx+.43,1.56,z+d/2+.13],[.045,.32,.04],'#b8c6b9');}
  if(i%2===0)for(const side of[-1,1]){b.box([x+side*w*.32,h*.52,z+d/2+.35],[1.5,.7,.55],'#d2d1bd');for(let k=0;k<5;k++)b.box([x+side*w*.32-.52+k*.25,h*.52,z+d/2+.65],[.035,.55,.025],'#7a9194');}
  for(let k=0;k<3;k++){b.box([x-w*.3+k*w*.3,h+.5,z],[1.3,1,1.4],'#727f80');}
 }
 // Asphalt details, gutters, tactile crossings and pavement joints.
 for(const z of[36,5,-20,-51])for(const x of[-25,0,25])for(let k=0;k<6;k++)b.box([x-2.5+k, .155,z],[.54,.014,2.3],'#c2c9b2');
 for(let z=-59;z<43;z+=5){b.box([-20.25,.075,z],[.012,.014,4],'#87948d');b.box([20.25,.075,z],[.012,.014,4],'#87948d');}
 for(const[x,z]of[[-22,10],[3,29],[28,-25],[-28,-48]]){b.cylinder([x,.15,z],.48,.03,'#465854',12);for(let k=-2;k<=2;k++)b.box([x+k*.12,.177,z],[.028,.01,.63],'#8c9d93');}
 // Bins, mailboxes and newsstands.
 for(const[x,z]of[[-30,22],[31,-7],[-31,-36],[10,34]]){b.cylinder([x,.52,z],.32,.95,'#426264',10);b.cylinder([x,1.02,z],.36,.11,'#2e4549',10);b.box([x,.79,z-.326],[.37,.18,.035],'#203738');}
 for(const[x,z]of[[-31,31],[31,14],[-31,-12],[30,-43]]){b.box([x,1.9,z],[2.5,3.2,.18],'#49656b');b.box([x,1.9,z-.11],[2.25,2.9,.025],'#cbbcad');b.box([x,2.3,z-.13],[2.02,.65,.015],'#725b90');badge(b,x-.7,2.51,z-.15,.13,'#cbfc72');b.box([x,1.35,z-.13],[1.7,.11,.015],'#657772');b.box([x,1.08,z-.13],[1.5,.08,.015],'#657772');}
 // Original graffiti walls beside each dance spot.
 for(const[x,z,color]of[[-31,15,'#b99be6'],[31,-13,'#eeb877'],[-31,-42,'#92d3c8']]){b.box([x,1.5,z],[4.7,2.7,.28],'#6d7e7b');b.box([x,1.5,z-.15],[4.3,2.3,.04],'#30434b');badge(b,x-1.65,2.33,z-.2,.3,color);for(let k=0;k<4;k++)b.box([x-1.7+k,.56,z-.2],[.045,.36,.03],color);}
 // Basketball court with markings and backboard.
 b.box([10,.11,-8],[8,.08,11],'#756885');for(const x of[6,14])b.box([x,.158,-8],[.05,.012,10.7],'#c6c8b4');for(const z of[-13.35,-2.65])b.box([10,.158,z],[7.9,.012,.06],'#c6c8b4');b.box([10,.16,-8],[7.9,.01,.05],'#c6c8b4');b.cylinder([10,1.7,-13.5],.085,3.4,'#53747a',8);b.box([10,3.4,-13.3],[1.8,1.1,.12],'#d0d9c9');b.box([10,3.35,-13.225],[.75,.6,.03],'#b48b68');
 for(const p of PLATFORMS){b.box([p.x,p.h/2+.08,p.z],[p.w,p.h,p.d],'#806e66');b.box([p.x,p.h+.09,p.z],[p.w+.08,.08,p.d+.08],'#b4a993');for(const side of[-1,1])b.box([p.x+side*.65,p.h/2+.08,p.z],[.09,p.h+.08,p.d+.03],'#556a6a');b.box([p.x,p.h+.14,p.z],[.4,.018,.75],'#b4f35e');}
 b.cylinder([RACE.x,.18,RACE.z],1.8,.1,'#c4a1ee',24);b.cylinder([RACE.x,.24,RACE.z],1.5,.07,'#485573',24);
 // Speaker details and turntables.
 for(const[x,z]of[[-25,18],[25,-10],[-24,-39]]){for(const side of[-1,1])for(const y of[.65,1.2]){b.group([x+side*3.5,y,z-1.605],0,()=>{oval(b,[0,0,0],[.25,.25,.027],'#111f2e',10,4);oval(b,[0,0,-.015],[.11,.11,.03],'#547779',8,4);});}b.box([x,1.3,z-3],[2.2,.15,.7],'#222f3e');for(const side of[-1,1])b.cylinder([x+side*.65,1.42,z-3],.25,.08,'#829692',16);}
}
