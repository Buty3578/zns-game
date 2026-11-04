import{ARTIFACT,ARTIFACT_STUDIO,ARTIFACT_BARRIER,ADVENTURE_ITEMS}from'./artifact-adventure.mjs';

// A few reusable primitives keep the optional adventure cheap on phones.
export function artifactActors(b,j,t,low){const q=j.artifactQuest;if(!q.running)return;const p=j.world.player,range=low?30:46,near=o=>Math.hypot(o.x-p.x,o.z-p.z)<range;
 const power=ADVENTURE_ITEMS.find(item=>q.powerActive(item.id));if(power){const radius=power.id==='jump'?1.1:.82;b.cylinder([p.x,j.ground(p.x,p.z)+.08,p.z],radius,.035,power.color,12);if(!low)for(let i=0;i<4;i++){const a=i*Math.PI/2+t*1.4;b.sphere([p.x+Math.cos(a)*radius,p.y+.6+Math.sin(t*3+i)*.15,p.z+Math.sin(a)*radius],.085,power.color,8);}}
 for(const e of q.enemies){if(!near(e))continue;const y=j.ground(e.x,e.z)+e.y;
  b.group([e.x,y,e.z],e.yaw,()=>{b.cylinder([0,.13,0],.65,.035,'#42636c',12);b.sphere([0,.92,0],.64,e.color,10);b.sphere([0,1.63,0],.43,e.color,10);
   for(const side of[-1,1]){b.sphere([side*.18,1.7,-.35],.065,'#293c55',8);b.box([side*.45,.36,0],[.18,.56,.22],'#38566a');}
   if(e.kind==='jumper'){b.sphere([0,.16,0],.31,'#e4fff0',8);b.box([0,1.97,0],[.64,.1,.16],'#e4fff0');}
   if(e.kind==='guard'){b.box([0,.95,-.42],[.66,.16,.1],'#f4e5ad');b.sphere([0,2.12,0],.18,'#f4e5ad',8);}
   if(e.kind==='pursuer')b.box([0,2.02,0],[.76,.12,.2],'#ffe5c6');
  });
  if(e.state==='chase')b.sphere([e.x,y+2.55+Math.sin(t*7)*.1,e.z],.16,'#ffe08d',8);
 }
 for(const item of ADVENTURE_ITEMS){if(q.collected.has(item.id)||!near(item))continue;const y=j.ground(item.x,item.z)+1.2+Math.sin(t*3)*.12;
  b.cylinder([item.x,y,item.z],.47,.1,item.color,10);b.sphere([item.x,y+.28,item.z],.19,'#ffffff',8);}
 if(!q.carrying&&near(ARTIFACT)){const y=j.ground(ARTIFACT.x,ARTIFACT.z)+1.35+Math.sin(t*2)*.12;
  b.cylinder([ARTIFACT.x,y,ARTIFACT.z],.65,.12,'#e9e5a5',12);b.sphere([ARTIFACT.x,y+.35,ARTIFACT.z],.18,'#fff5ce',8);}
 if(!q.barrierBroken&&near(ARTIFACT_BARRIER)){const c=ARTIFACT_BARRIER;b.box([c.x,c.h/2,c.z],[c.w,c.h,c.d],'#9a86b2');for(const x of[-1.3,0,1.3])b.box([c.x+x,1.2,c.z-c.d/2-.03],[.3,.42,.06],'#eac2ed');}
 if(q.carrying&&near(ARTIFACT_STUDIO))b.cylinder([ARTIFACT_STUDIO.x,.11,ARTIFACT_STUDIO.z],2,.05,'#b8f1ab',16);
 const target=q.objective;if(target&&near(target))for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.65;b.sphere([target.x+Math.cos(a)*1.35,1.7+Math.sin(a)*.85,target.z],.085,'#d5ff9c',8);}
}
