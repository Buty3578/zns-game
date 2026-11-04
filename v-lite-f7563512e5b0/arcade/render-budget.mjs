import{Batch}from'./engine.mjs';
// Keep the large ground planes, but cull distant old-district geometry like the new city.
export function splitStatic(batch,size=32){
 const global=new Batch(),cells=new Map();
 for(let i=0;i<batch.data.length;i+=27){const tri=batch.data.slice(i,i+27),xs=[tri[0],tri[9],tri[18]],zs=[tri[2],tri[11],tri[20]];
  if(Math.max(...xs)-Math.min(...xs)>size*1.5||Math.max(...zs)-Math.min(...zs)>size*1.5){global.data.push(...tri);continue;}
  const key=Math.floor((xs[0]+xs[1]+xs[2])/3/size)+','+Math.floor((zs[0]+zs[1]+zs[2])/3/size);
  if(!cells.has(key))cells.set(key,new Batch());cells.get(key).data.push(...tri);
 }
 const chunks=[...cells.values()].map(batch=>{let left=Infinity,right=-Infinity,front=Infinity,back=-Infinity;for(let i=0;i<batch.data.length;i+=9){left=Math.min(left,batch.data[i]);right=Math.max(right,batch.data[i]);front=Math.min(front,batch.data[i+2]);back=Math.max(back,batch.data[i+2]);}return{batch,bounds:{x:(left+right)/2,z:(front+back)/2,radius:Math.hypot(right-left,back-front)/2}};});
 return{global,chunks};
}
export class FrameMeter{
 constructor(){this.previous=0;this.samples=[];}
 sample(now){const dt=now-this.previous;this.previous=now;if(dt<=0||dt>250)return;this.samples.push(dt);if(this.samples.length>120)this.samples.shift();}
 get report(){if(this.samples.length<10)return'Измерение FPS: начни игру';const mean=this.samples.reduce((a,b)=>a+b,0)/this.samples.length,sorted=[...this.samples].sort((a,b)=>a-b);return`${Math.round(1000/mean)} FPS · 95% кадров ≤ ${Math.round(sorted[Math.ceil(sorted.length*.95)-1])} мс`;}
}
