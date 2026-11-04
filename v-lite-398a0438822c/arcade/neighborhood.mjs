// Shared, static low-poly architecture. Window panes are quads, not six-sided boxes.
// Buildings are baked once into the district's existing spatial chunks.
export function neighborhoodBuilding(b,o){
 const {x,z,w,d,h}=o,shop=o.kind==='shop',church=o.kind==='church';
 const wall=o.color||'#d4c3ad',accent=o.accent||'#6e8798',body=church?11:h;
 b.box([x,.025,z+d/2+1.15],[w+1.2,.05,2.3],'#d0cebd');
 b.box([x,body/2,z],[w,body,d],wall);
 b.box([x,.32,z],[w+.16,.64,d+.16],'#83918f');
 b.box([x,body+.18,z],[w+.4,.36,d+.4],accent);
 const pane=(xx,y,zz,ww,hh)=>b.quad([xx-ww/2,y-hh/2,zz],[xx+ww/2,y-hh/2,zz],[xx+ww/2,y+hh/2,zz],[xx-ww/2,y+hh/2,zz],'#608a9b');
 if(church){
  b.box([x,12.8,z],[6,3.2,6],'#eee4cf');
  // Original stylised onion dome, with a small cross; no external model/texture.
  const profile=[[14.4,2.2],[15.5,3.3],[17,3.7],[18.6,2.6],[20.1,.9],[20.8,0]];
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<12;i++){
   const [a,r]=profile[j],[c,s]=profile[j+1],u=i*Math.PI/6,v=(i+1)*Math.PI/6;
   b.quad([x+Math.cos(u)*r,a,z+Math.sin(u)*r],[x+Math.cos(v)*r,a,z+Math.sin(v)*r],[x+Math.cos(v)*s,c,z+Math.sin(v)*s],[x+Math.cos(u)*s,c,z+Math.sin(u)*s],'#dbb665');
  }
  b.box([x,22,z],[.16,2.5,.16],'#e7c67b');b.box([x,22.4,z],[1.4,.16,.16],'#e7c67b');
  for(const side of[-1,1]){pane(x+side*w*.3,6,z+d/2+.03,1.2,3.6);b.box([x+side*w*.4,5.5,z+d/2+.12],[.55,11,.32],'#eee4cf');}
  b.box([x,2,z+d/2+.05],[2.5,4,.12],'#7c665c');
  b.box([x,4.2,z+d/2+.3],[3.6,.4,.6],accent);
  return;
 }
 if(shop){
  for(const side of[-1,1])pane(x+side*w*.26,1.9,z+d/2+.03,w*.32,2.6);
  b.box([x,1.6,z+d/2+.08],[1.35,3.2,.12],'#3c596e');
  b.box([x,body-.7,z+d/2+.12],[w-.5,.8,.18],accent);
  b.box([x,3.5,z+d/2+.25],[w+.1,.14,.6],accent);
  // Shop emblems (bakery / grocery / music) use only a few primitives.
  if(o.shop==='bakery')for(let i=-1;i<=1;i++)b.box([x+i*.55,body-.7,z+d/2+.23],[.35,.35,.06],'#f4dfb0');
  else if(o.shop==='music'){b.box([x+.2,body-.65,z+d/2+.23],[.1,.5,.06],'#f2dbb5');b.sphere([x,body-.85,z+d/2+.26],.2,'#f2dbb5');}
  else {b.box([x,body-.7,z+d/2+.23],[.7,.14,.06],'#e5efc2');b.box([x,body-.7,z+d/2+.23],[.14,.6,.06],'#e5efc2');}
  return;
 }
 for(let y=2.5;y<body-1;y+=3)for(let xx=x-w/2+1.7;xx<x+w/2-1;xx+=2.8){pane(xx,y,z+d/2+.025,1.25,1.6);pane(xx,y,z-d/2-.025,1.25,1.6);}
 for(let y=2.5;y<body-1;y+=3)for(let zz=z-d/2+1.7;zz<z+d/2-1;zz+=3.2)for(const s of[-1,1])b.quad([x+s*(w/2+.025),y-.8,zz-.65],[x+s*(w/2+.025),y-.8,zz+.65],[x+s*(w/2+.025),y+.8,zz+.65],[x+s*(w/2+.025),y+.8,zz-.65],'#608a9b');
 b.box([x,1.5,z+d/2+.04],[1.5,3,.1],accent);
 b.box([x,3.2,z+d/2+.25],[2.5,.16,.6],accent);
 if(o.kind==='tower')for(const s of[-1,1])b.box([x+s*w*.35,body/2,z+d/2+.06],[.5,body,.12],accent);
 if(o.kind==='brick')for(let y=3;y<body;y+=3)b.box([x,y,z],[w+.12,.12,d+.12],accent);
 if(o.kind==='townhouse'){
  const y=body+.4;
  b.quad([x-w/2-.3,y,z-d/2-.3],[x+w/2+.3,y,z-d/2-.3],[x+w/2+.3,y+2,z],[x-w/2-.3,y+2,z],accent);
  b.quad([x-w/2-.3,y+2,z],[x+w/2+.3,y+2,z],[x+w/2+.3,y,z+d/2+.3],[x-w/2-.3,y,z+d/2+.3],accent);
 }
}
