import{oval}from'./detail.mjs';
import{crowdCharacter}from'./npc.mjs';
import{PARK_ROADS,PARK_PLACES,HUNT_NOTES,PARK_COURSE,DANCE_SPOTS}from'./district.mjs';
export function parkWorld(b){
 b.box([85,-.01,2],[60,.16,122],'#b4d09a');
 for(const[[x1,z1],[x2,z2]]of PARK_ROADS){const vertical=x1===x2,w=vertical?6:Math.abs(x2-x1),d=vertical?Math.abs(z2-z1):6,x=(x1+x2)/2,z=(z1+z2)/2;b.box([x,.08,z],[w+1.5,.12,d+1.5],'#e8ddbf');b.box([x,.15,z],[w,.12,d],'#7b98a4');const len=vertical?d:w;for(let i=3;i<len;i+=7)b.box([vertical?x:x1+i,.22,vertical?z1+i:z],[vertical?.1:2.2,.015,vertical?2.2:.1],'#eaf0cc');}
 // Low planting and a flush fountain leave every playable route open.
 b.cylinder([86,.18,15],8,.16,'#e2d2b5',32);b.cylinder([86,.28,15],3.2,.2,'#a1c8d4',24);b.cylinder([86,.4,15],2.7,.05,'#76d6df',24);
 for(let i=0;i<5;i++){const a=i*Math.PI*.4;b.limb([86,0.45,15],[86+Math.sin(a)*1.7,1.15,15+Math.cos(a)*1.7],.035,'#caeff3');}
 b.cylinder([88,.19,-36],12,.14,'#b9a2cc',32);b.cylinder([88,.28,-36],10.8,.06,'#817ba7',32);
 for(const p of DANCE_SPOTS){b.cylinder([p.x,.35,p.z],2,.06,'#dca5ef',20);b.cylinder([p.x,.39,p.z],1.7,.035,'#bca9d9',20);}
 b.box([88,1.1,-46],[8,.2,1.8],'#31485f');for(const x of[81,95]){b.box([x,1,-46],[1.4,2,1.2],'#344862');for(const y of[.5,1.4])oval(b,[x,y,-45.38],[.42,.42,.03],'#7c97b1',8,4);}
 for(const x of[82,94]){b.limb([x,.2,-44],[x,4,-44],.07,'#52687b');b.limb([x,4,-44],[88,4.8,-44],.045,'#728792');}for(let i=0;i<9;i++)b.sphere([82+i*1.5,4+Math.sin(i/8*Math.PI)*.8,-44],.13,i%2?'#f6d996':'#acdbec');
 for(const[x,z]of[[61,2],[61,36],[63,-34],[113,53],[91,40],[83,49],[91,-20],[58,-40],[63,58],[113,-57]]){b.cylinder([x,1.1,z],.19,2.2,'#937c5e',7);oval(b,[x,3.2,z],[1.7,1.8,1.65],'#7ab97a',8,4);oval(b,[x+.5,4,z-.1],[1.3,1.3,1.3],'#afd66c',8,4);}
 for(const[x,z]of[[77,-20],[96,-20],[77,35],[97,35],[62,25]]){b.box([x,.6,z],[2.4,.2,.65],'#e1b477');b.box([x,1,z+.3],[2.4,.65,.12],'#ddb684');for(const side of[-1,1])b.box([x+side*.8,.3,z],[.15,.6,.65],'#52667c');}
 // Playground sculptures and route flags sit beside the riding surface.
 for(const[x,z]of[[98,30],[76,40]]){b.limb([x-1,.2,z],[x-1,3.4,z],.085,'#e6b685');b.limb([x+1,.2,z],[x+1,3.4,z],.085,'#e6b685');b.limb([x-1,3.4,z],[x+1,3.4,z],.085,'#dca2cb');}
 for(const p of PARK_PLACES){b.cylinder([p.x,.27,p.z],2.6,.09,p.color,24);b.cylinder([p.x,.33,p.z],2.15,.04,'#4c6580',24);}
}
function marker(b,p,t,color,r=.42){b.group([p.x,1.1+Math.sin(t*3+p.x)*.15,p.z],t,()=>{b.sphere([0,0,0],r,color);b.limb([0,0,0],[0,.65,0],.055,color);b.limb([0,.65,0],[.3,.53,0],.055,color);});}
export function parkActors(b,j,t,low){const p=j.world.player,near=x=>Math.hypot(p.x-x.x,p.z-x.z)<(low?32:48),a=j.park.active;
 for(const place of PARK_PLACES)if(near(place))marker(b,place,t,j.park.wins.has(place.id)?'#b3f2a0':place.color,.55);
 if(a?.id==='hunt')for(let i=0;i<HUNT_NOTES.length;i++)if(!a.picked.has(i))marker(b,HUNT_NOTES[i],t,'#ffe384');
 if(a?.id==='ride'){const at=PARK_COURSE[a.index],prev=a.index?PARK_COURSE[a.index-1]:PARK_PLACES[1],yaw=Math.atan2(at.x-prev.x,at.z-prev.z);b.group([at.x,2.7,at.z],yaw,()=>{for(let i=0;i<18;i++){const q=i/18*Math.PI*2,r=(i+1)/18*Math.PI*2;b.limb([Math.cos(q)*2.6,Math.sin(q)*2.6,0],[Math.cos(r)*2.6,Math.sin(r)*2.6,0],.09,'#b9edff');}});}
 if(a?.id==='dance'){const at=DANCE_SPOTS[a.index];marker(b,at,t,'#edbaff',.7);}
 if(near({x:88,z:-36}))for(let i=0;i<(low?3:5);i++){const x=79+i*4.3,z=-42+(i%2)*4;crowdCharacter(b,{x,z,y:.4,yaw:Math.PI,phase:t*5+i*.6,dance:j.danceTime>0||j.park.wins.has('dance'),color:['#7ed7d3','#f1bc8d','#bba3e7'][i%3],scale:.9});}
 if(near({x:86,z:15}))for(let i=0;i<(low?3:7);i++){const a=t*.8+i,y=.55+((t*1.6+i*.31)%1);b.sphere([86+Math.sin(a)*1.7,y,15+Math.cos(a)*1.7],.085,'#cff8fc');}
}
