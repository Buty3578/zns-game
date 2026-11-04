import{Batch}from'./engine.mjs';
import{splitStatic}from'./render-budget.mjs';
import{STREET_JAMS,STREET_PROPS}from'./street-events.mjs';
import{crowdCharacter}from'./npc.mjs';
import{ring}from'./playful.mjs';
export function streetEventChunks(){const b=new Batch();
 for(const j of STREET_JAMS){b.cylinder([j.x,.18,j.z],5.7,.035,'#405662',24);ring(b,j.x,.22,j.z,5.6,j.color,false,0,16);ring(b,j.x,.225,j.z,1.4,j.color,false,0,12);}
 for(const s of STREET_PROPS){b.box([s.x,.9,s.z],[1,1.8,1],'#283744');for(const y of[.5,1.25])b.sphere([s.x,y,s.z+.51],.3,'#88aaac',8,4);}
 for(let x=1320;x<1450;x+=10)b.box([x+5,.18,52],[10,.05,8],'#53636d');for(let x=1327;x<1445;x+=10)b.box([x,.22,52],[5,.02,.14],'#f4e2b6');for(const z of[48.2,55.8])for(let x=1320;x<1450;x+=10)b.box([x+5,.22,z],[10,.02,.12],'#f4e2b6');
 for(const x of[1326,1441])for(let z=49;z<56;z+=1)b.box([x,.225,z],[4,.02,.4],'#ece5ce');
 const parts=splitStatic(b,32);if(parts.global.data.length)throw Error('Event geometry exceeds chunk size');return parts.chunks;
}
export function streetEventActors(b,j,time,low,activeJam){const p=j.world.player;
 for(const jam of STREET_JAMS){if(activeJam===jam.id||Math.hypot(p.x-jam.x,p.z-jam.z)>(low?32:50))continue;
  const count=low?3:5;for(let i=0;i<count;i++){const a=Math.PI+(i+.5)*Math.PI/count,x=jam.x+Math.cos(a)*4.6,z=jam.z+Math.sin(a)*4.6;
   crowdCharacter(b,{x,z,y:j.ground(x,z)+.19,yaw:Math.atan2(x-jam.x,z-jam.z),phase:time*3+i,dance:i<2,color:[jam.color,'#c8a393','#91b8cc'][i%3],look:i%3,scale:.95});}
 }
 for(const m of j.bosses.items){if(Math.hypot(p.x-m.x,p.z-m.z)>(low?30:45))continue;const y=j.ground(m.x,m.z),warn=m.state==='warn',charge=m.state==='charge',step=charge?Math.sin(m.phase*15)*.6:Math.sin(m.phase*3)*.08;
  if(warn){ring(b,m.x,y+.1,m.z,1.4+(1.1-m.timer)*2,'#ffa16b',false,0,12);b.limb([m.x,y+.12,m.z],[m.x+m.dx*8,y+.12,m.z+m.dz*8],.11,'#ffa16b');}
  b.group([m.x,y,m.z],m.yaw,()=>{b.box([0,1.5,.1],[1.15,1.4,.7],m.color);b.box([0,2.25,0],[.85,.7,.8],'#30374b');b.box([0,2.2,-.415],[.65,.32,.025],'#172936');for(const side of[-1,1]){b.box([side*.2,2.25,-.45],[.16,.08,.04],warn?'#ffbc6a':'#b8e7cf');b.limb([side*.38,.9,0],[side*.4,.2,side*step],.19,'#344255');b.box([side*.4,.12,side*step-.13],[.42,.24,.6],'#c3cabf');b.limb([side*.62,1.95,0],[side*.8,1.05,-side*step],.18,m.color);}b.tri([-.6,2,.42],[.6,2,.42],[0,.5,.65],'#292e47');});
 }
}
export function aircraftModel(b,v){b.group([v.x,v.y+.25,v.z],v.yaw,()=>b.pose([0,.6,0],{roll:v.lean||0,pitch:v.pitch||0},()=>{
 b.box([0,.65,0],[1.2,.8,4.8],v.color);b.box([0,1.18,-.35],[.95,.65,1.4],'#6eabbc');b.box([0,.55,0],[7.4,.18,1.3],v.color);b.tri([-3.7,.65,-.65],[0,.65,-1.2],[3.7,.65,-.65],'#f4dfb6');b.box([0,.9,2],[3,.16,.8],v.color);b.box([0,1.45,2],[.14,1.2,.9],'#df876d');
 b.box([0,.7,-2.55],[.22,.22,.3],'#344456');b.pose([0,.7,-2.74],{roll:v.wheel*4},()=>b.box([0,0,0],[2.1,.09,.09],'#344456'));
 for(const side of[-1,1]){b.limb([side*.7,.5,.7],[side*.9,-.05,.7],.06,'#aeb8b8');b.sphere([side*.9,-.05,.7],.23,'#283744',8,4);}
}));}
