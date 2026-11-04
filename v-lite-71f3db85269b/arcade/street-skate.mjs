import{Batch}from'./engine.mjs';
import{splitStatic}from'./render-budget.mjs';
export const STREET_SPOTS=[{id:'sol-stairs',x:519,z:-47,name:'Солнцево · лестничный спот'},{id:'center-stairs',x:815,z:-5,name:'Центр · двор с гранями'},{id:'vdnh-lines',x:1190,z:-35,name:'ВДНХ · скейт-линии'},{id:'island-lines',x:1390,z:17,name:'Остров · скейт-плаза'}];
export const STREET_STAIRS=STREET_SPOTS.map((p,i)=>({...p,w:8,d:8,h:i%2?1.2:.96,steps:6}));
export const STREET_DECKS=STREET_STAIRS.map(p=>({x:p.x,z:p.z-7,w:10,d:6,h:p.h}));
export const STREET_BANKS=STREET_STAIRS.map((p,i)=>({id:p.id+'-bank',x:p.x-10,z:p.z-7,w:10,d:6,h:p.h,kind:'bank'}));
export const STREET_GRINDS=STREET_STAIRS.flatMap((p,i)=>[
 ...[-1,1].map(side=>({id:p.id+'-deck-'+side,x:p.x+side*3,z:p.z-7,w:.16,d:5,h:p.h+.62,kind:'rail'})),
 {id:p.id+'-left',x:p.x-3,z:p.z,w:.16,d:8,h:p.h/2+.62,slopeZ:-p.h/8,kind:'rail'},
 {id:p.id+'-right',x:p.x+3,z:p.z,w:.16,d:8,h:p.h/2+.62,slopeZ:-p.h/8,kind:'rail'},
 {id:p.id+'-ledge',x:p.x+7,z:p.z+7,w:12,d:.65,h:.46,kind:'curb',capOffset:.17},
 {id:p.id+'-flat',x:p.x-11,z:p.z+7,w:8,d:.16,h:.65,kind:'rail'}
]);
const inside=(x,z,b,r=0)=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r;
const clamp=x=>Math.max(0,Math.min(1,x));
export function railHeight(r,x,z){return r.h+(r.slopeX||0)*(x-r.x)+(r.slopeZ||0)*(z-r.z);}
export function streetGround(x,z){let h=0;for(const b of STREET_BANKS)if(inside(x,z,b))h=Math.max(h,b.h*clamp((x-b.x+b.w/2)/b.w));for(const d of STREET_DECKS)if(inside(x,z,d))h=Math.max(h,d.h);for(const s of STREET_STAIRS)if(inside(x,z,s)){const t=clamp((s.z+s.d/2-z)/s.d);h=Math.max(h,Math.ceil(t*s.steps-1e-8)*s.h/s.steps);}for(const r of STREET_GRINDS)if(inside(x,z,r))h=Math.max(h,railHeight(r,x,z));return h;}
export function streetSample(x,z){for(const b of STREET_BANKS)if(inside(x,z,b))return{height:b.h*clamp((x-b.x+b.w/2)/b.w),slopeX:b.h/b.w,slopeZ:0,ramp:b.id};for(const r of STREET_GRINDS)if((r.slopeX||r.slopeZ)&&inside(x,z,r))return{height:railHeight(r,x,z),slopeX:r.slopeX||0,slopeZ:r.slopeZ||0,ramp:r.id};return{height:streetGround(x,z),slopeX:0,slopeZ:0,ramp:null};}
export function streetBlocked(x,z,y,r=.5){return STREET_DECKS.some(d=>y<d.h-.22&&inside(x,z,d,r))||STREET_GRINDS.some(b=>inside(x,z,b,r)&&y<railHeight(b,x,z)-.12)||streetGround(x,z)>y+.58;}
export const STREET_CAMERA=[...STREET_DECKS,...STREET_STAIRS,...STREET_GRINDS];
let cached;export function streetChunks(){if(cached)return cached;const b=new Batch();
 for(const p of STREET_SPOTS){b.box([p.x,.09,p.z],[34,.14,25],'#9aabb0');for(let x=-16;x<17;x+=4)b.box([p.x+x,.166,p.z],[.025,.01,24],'#c9c9ba');for(const s of[-1,1]){b.box([p.x+s*15,.65,p.z-11],[2.6,1.3,1.1],'#334a5c');b.box([p.x+s*15,.76,p.z-10.43],[1.8,.14,.02],'#b7db89');}}
 for(const d of STREET_DECKS)b.box([d.x,(d.h+.17)/2,d.z],[d.w,d.h+.17,d.d],'#adbbb5');
 for(const s of STREET_STAIRS)for(let i=0;i<s.steps;i++){const h=(i+1)*s.h/s.steps,z=s.z+s.d/2-(i+.5)*s.d/s.steps;b.box([s.x,(h+.17)/2,z],[s.w,h+.17,s.d/s.steps],'#b8c1b9');b.box([s.x,h+.18,z+s.d/s.steps/2-.05],[s.w,.02,.1],'#d8cdad');}
 for(const r of STREET_BANKS){const low=r.x-r.w/2,high=r.x+r.w/2;b.quad([low,.17,r.z+r.d/2],[high,r.h+.17,r.z+r.d/2],[high,r.h+.17,r.z-r.d/2],[low,.17,r.z-r.d/2],'#b0bcb7');for(const z of[r.z-r.d/2,r.z+r.d/2])b.tri([low,.17,z],[high,r.h+.17,z],[high,.17,z],'#869da7');}
 for(const r of STREET_GRINDS){if(r.kind==='curb'){b.box([r.x,(r.h+.17)/2,r.z],[r.w,r.h+.17,r.d],'#a9b9b5');b.box([r.x,r.h+.18,r.z],[r.w,.02,r.d+.05],'#d4c5a6');continue;}const a=[r.x-r.w/2,0,r.z-r.d/2],c=[r.x+r.w/2,0,r.z+r.d/2];if(r.w>r.d){a[2]=c[2]=r.z;}else a[0]=c[0]=r.x;a[1]=railHeight(r,a[0],a[2])-.015;c[1]=railHeight(r,c[0],c[2])-.015;b.limb(a,c,.06,'#d5b88c');for(let u=0;u<=1;u+=.25){const x=a[0]+(c[0]-a[0])*u,z=a[2]+(c[2]-a[2])*u,h=railHeight(r,x,z);b.box([x,h/2,z],[.1,h,.1],'#627f8d');}}
 const parts=splitStatic(b,32);if(parts.global.data.length)throw Error('Street geometry lost');cached=parts.chunks;return cached;
}
