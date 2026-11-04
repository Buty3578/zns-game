// Short-lived, geometry-only arcade feedback. No gameplay state is changed here.
const COLORS={landing:'#e9dac0',token:'#c8f38d',combo:'#e8baff',mission:'#ffdfa0'};
export class VisualFeedback{
 constructor(){this.bursts=[];}
 add(kind,x,y,z){if(!COLORS[kind])return;this.bursts.push({kind,x,y,z,age:0});if(this.bursts.length>12)this.bursts.shift();}
 update(dt){for(const item of this.bursts)item.age+=dt;this.bursts=this.bursts.filter(item=>item.age<.55);}
 draw(b,player,skate,low=false){
  const speed=skate?.speed||0;
  if(speed>5&&skate.grounded){const count=low?2:5,y=player.y+.14,sideX=Math.cos(player.yaw),sideZ=-Math.sin(player.yaw),backX=Math.sin(player.yaw),backZ=Math.cos(player.yaw);for(let i=0;i<count;i++){const spread=(i-(count-1)/2)*.25,tail=.42+i*.3,sx=player.x+sideX*spread+backX*tail,sz=player.z+sideZ*spread+backZ*tail;b.limb([sx,y,sz],[sx+backX*(.35+speed*.04),y+.015,sz+backZ*(.35+speed*.04)],.012,i%2?'#c8f38d':'#d6e8eb');}}
  for(const f of this.bursts){const u=f.age/.55,r=.28+u*(f.kind==='landing'?1.5:1.1),n=low?8:14,color=COLORS[f.kind],height=f.y+(f.kind==='landing'?.06:u*.7);for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=(i+1)/n*Math.PI*2;b.limb([f.x+Math.cos(a)*r,height,f.z+Math.sin(a)*r],[f.x+Math.cos(c)*r,height,f.z+Math.sin(c)*r],.018*(1-u)+.006,color);}}
 }
}
