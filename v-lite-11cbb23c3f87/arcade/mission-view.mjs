export function drawVinyl(b,item,t){
b.group([item.x,item.y+Math.sin(t*3+item.id)*.1,item.z],t*1.6+item.id,()=>{
   for(let i=0;i<16;i++){const u=i*Math.PI/8,v=(i+1)*Math.PI/8;for(const side of[-1,1])b.tri([0,0,side*.065],[Math.cos(u)*.42,Math.sin(u)*.42,side*.065],[Math.cos(v)*.42,Math.sin(v)*.42,side*.065],side===1?'#263f55':'#b5db89');}
   b.box([0,0,.075],[.39,.24,.018],'#c4f38b');
   // Tiny geometric Заметь наш стиль label, no texture download or per-frame text canvas.
   const glyphs=['110001010001110','101101111101101','111100100100111'];
   for(const side of[-1,1])for(let g=0;g<3;g++)for(let k=0;k<15;k++)if(glyphs[g][k]==='1'){
    const x=(g*4+k%3-5.5)*.031,y=(2-Math.floor(k/3))*.031,z=side*.09,d=.026;
    b.quad([x,y,z],[x+d,y,z],[x+d,y+d,z],[x,y+d,z],'#375466');
   }
  });
}
// Low-poly Заметь наш стиль vinyls; only active nearby collectibles are drawn.
export function missionActors(b,j,t,low){const a=j.missions.active,m=j.missions.definition,p=j.world.player;if(!a||a.status!=='active')return;
 for(const item of m.tokens){if(a.collected.has(item.id)||Math.hypot(item.x-p.x,item.z-p.z)>(low?32:50))continue;
  drawVinyl(b,item,t);
 }
 const target=m.points[a.index];if(Math.hypot(target.x-p.x,target.z-p.z)<70)for(let i=0;i<16;i++){const v=i*Math.PI/8;b.sphere([target.x+Math.cos(v)*2,2+Math.sin(v)*1.7,target.z],.11,'#9feedd');}
 const c=j.missions.checkpoint;if(c&&Math.hypot(c.x-p.x,c.z-p.z)<45)b.cylinder([c.x,.22,c.z],1.8,.03,'#88cdbc',16);
}
