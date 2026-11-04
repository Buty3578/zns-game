const LIME='#c5ff4a',PURPLE='#b7a0ff';
export function canvasSize(canvas){const r=canvas.getBoundingClientRect(),d=Math.min(globalThis.devicePixelRatio||1,2);if(canvas.width!==Math.round(r.width*d)||canvas.height!==Math.round(r.height*d)){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);}const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return{ctx,w:r.width,h:r.height};}
function poly(c,pts,fill){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();}
function limb(c,pts,color,width){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
export function dancer(c,x,y,scale,beat,index,look=0,drive=false,hit=0,holding=false,final=false){
 c.save();c.translate(x,y);c.scale(scale,scale);const phase=beat*Math.PI*2+(drive?0:index*.38),bounce=Math.sin(phase),slow=Math.sin(phase/2),phrase=Math.floor(beat/4)%4,skin=['#a87757','#d3a082','#8b6048','#bc8766','#b78d70'][index];
 const outfit=index===2?[LIME,PURPLE,'#e9eddf'][look]:['#b4baab','#727866',LIME,'#8a72ae','#e5e9dc'][index];
 const bodyY=-126+(final?0:bounce*(drive?8:5)),lean=final?(index-2)*2:(holding?Math.sin(phase/4)*9:slow*5)+(hit>0?Math.sin(phase)*6:0),hipY=-70+bounce*3;
 c.fillStyle='#0007';c.beginPath();c.ellipse(0,7,45,8,0,0,Math.PI*2);c.fill();
 // Loose trousers and contrasting seam lines.
 const lkx=-24+(final?-12:slow*12),rkx=25+(final?12:-slow*12),lfx=-32+(final?-8:Math.max(0,-bounce)*12),rfx=32+(final?8:Math.max(0,bounce)*12);
 limb(c,[[-16,hipY],[lkx,-36],[lfx,-6]],'#25292b',25);limb(c,[[16,hipY],[rkx,-34],[rfx,-6]],'#303538',25);
 limb(c,[[-21,hipY+6],[lkx-6,-34],[lfx-6,-11]],'#707365',2);limb(c,[[22,hipY+5],[rkx+6,-34],[rfx+7,-11]],'#818675',2);
 poly(c,[[lfx-14,-10],[lfx+8,-10],[lfx+15,3],[lfx-19,3]],'#ecf0e3');poly(c,[[rfx-9,-10],[rfx+12,-10],[rfx+23,3],[rfx-12,3]],'#ecf0e3');limb(c,[[lfx-17,4],[lfx+15,4]],'#93988e',3);limb(c,[[rfx-11,4],[rfx+23,4]],'#93988e',3);
 let le=[-44+lean,bodyY+35],lh=[-35+lean,bodyY+65],re=[44+lean,bodyY+32],rh=[35+lean,bodyY+64];
 if(final){le=[-49,bodyY-20];lh=[-59,bodyY-60];re=[44,bodyY+25];rh=[19,bodyY+45];}
 else if(holding){le=[-46+lean,bodyY+Math.sin(phase/4)*25];lh=[-68+lean,bodyY-22+Math.sin(phase/4)*32];re=[48+lean,bodyY-Math.sin(phase/4)*25];rh=[65+lean,bodyY-22-Math.sin(phase/4)*32];}
 else if(drive||phrase===2){le=[-43+lean,bodyY-5+bounce*23];lh=[-62+lean,bodyY-20+bounce*28];re=[43+lean,bodyY-5-bounce*23];rh=[62+lean,bodyY-20-bounce*28];}
 else if(phrase===1){le=[-43+lean,bodyY+18+bounce*14];lh=[-16+lean,bodyY-9];re=[49+lean,bodyY+12];rh=[67+lean,bodyY-12-bounce*24];}
 else if(phrase===3){le=[-47+lean,bodyY+8];lh=[-60+lean,bodyY-28-bounce*14];re=[43+lean,bodyY+24];rh=[lean,bodyY+27+bounce*18];}
 else{lh[0]+=slow*19;rh[0]+=slow*19;le[1]+=bounce*8;re[1]-=bounce*8;}
 limb(c,[[-23+lean,bodyY+4],le,lh],outfit,18);limb(c,[[23+lean,bodyY+4],re,rh],outfit,18);circle(c,...lh,7,skin);circle(c,...rh,7,skin);
 poly(c,[[-24+lean,bodyY-7],[24+lean,bodyY-7],[29+lean,bodyY+37],[23,hipY+7],[-24,hipY+7],[-29+lean,bodyY+37]],outfit);
 poly(c,[[13+lean,bodyY+5],[25+lean,bodyY+4],[23,hipY+7],[13,hipY+7]],'#0002');
 c.strokeStyle='#14171455';c.lineWidth=1.2;c.strokeRect(-14+lean,bodyY+34,29,11);c.fillStyle=index===3?'#efe8ff':'#16200e';c.font='900 16px Arial';c.textAlign='center';c.fillText('Заметь наш стиль',lean,bodyY+22);limb(c,[[-8+lean,bodyY-3],[-5+lean,bodyY+9]],'#2228',1);limb(c,[[8+lean,bodyY-3],[5+lean,bodyY+9]],'#2228',1);
 circle(c,lean,bodyY-10,12,outfit);limb(c,[[lean,bodyY-10],[lean,bodyY-22]],skin,14);circle(c,lean,bodyY-34,18,skin);
 // Three silhouettes: cap, tied hair, bucket hat.
 const style=index===2?look:index%3;
 if(style===0){poly(c,[[lean-19,bodyY-38],[lean-16,bodyY-51],[lean+14,bodyY-54],[lean+20,bodyY-38]],'#222a20');limb(c,[[lean-20,bodyY-38],[lean+27,bodyY-40]],'#292f26',5);}
 else if(style===1){circle(c,lean,bodyY-44,18,'#26211f');circle(c,lean+12,bodyY-59,9,'#26211f');poly(c,[[lean-17,bodyY-43],[lean+15,bodyY-43],[lean+17,bodyY-30],[lean+8,bodyY-42],[lean-13,bodyY-34]],'#26211f');circle(c,lean-16,bodyY-28,3,LIME);}
 else{poly(c,[[lean-15,bodyY-54],[lean+15,bodyY-54],[lean+21,bodyY-39],[lean-21,bodyY-39]],'#c1c5b4');poly(c,[[lean-23,bodyY-40],[lean+23,bodyY-40],[lean+29,bodyY-34],[lean-28,bodyY-34]],'#d9ddcb');}
 limb(c,[[lean-9,bodyY-30],[lean-5,bodyY-30]],'#372c28',1.7);limb(c,[[lean+5,bodyY-30],[lean+9,bodyY-30]],'#372c28',1.7);limb(c,[[lean-3,bodyY-21],[lean+4,bodyY-21]],'#6b4736',1.1);c.restore();
}
function crowd(c,w,h,beat,level,reduced){for(let i=0;i<24;i++){const x=i*w/23,y=h*.71+Math.sin(i*1.8)*13,move=reduced?0:Math.sin(beat*Math.PI+i)*4;circle(c,x,y+move,8,'#14151a');limb(c,[[x,y+14],[x,y+48]],'#14151a',18);if(level===2||i%3===0){limb(c,[[x-6,y+20],[x-17,y-5+move],[x-19,y-17+move]],'#14151a',7);limb(c,[[x+6,y+20],[x+17,y-12+move]],'#14151a',7);}}}
export function scene(canvas,{level=0,beat=0,look=0,drive=false,hit=0,holding=false,final=false,reduced=false,hero=false}={}){
 const{ctx:c,w,h}=canvasSize(canvas);if(!w||!h)return;c.clearRect(0,0,w,h);const pulse=reduced?0:Math.max(0,Math.sin(beat*Math.PI*2));
 const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,hero?'#303b25':level===1?'#232133':'#20291e');bg.addColorStop(1,'#111512');c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(hero){c.save();c.translate(w*.47,h*.46);c.rotate(-.12);c.fillStyle='#b5ff4520';c.fillRect(-w*.44,-h*.23,w*.9,h*.49);c.strokeStyle='#c5ff4a44';c.lineWidth=1;c.strokeRect(-w*.44,-h*.23,w*.9,h*.49);c.fillStyle='#c5ff4a';c.font=`900 ${w*.36}px Arial`;c.textAlign='center';c.fillText('Заметь наш стиль',0,h*.115);c.restore();for(let i=0;i<6;i++){c.strokeStyle='#c5ff4a0a';c.beginPath();c.arc(w*.5,h*.57,h*(.18+i*.08),0,Math.PI*2);c.stroke();}}
 else if(level===0){for(let i=0;i<5;i++){const x=18+i*w*.19;c.fillStyle='#82907210';c.fillRect(x,h*.13,w*.17,h*.52);c.strokeStyle='#c1ccad22';c.strokeRect(x,h*.13,w*.17,h*.52);poly(c,[[x,h*.65],[x+w*.17,h*.2],[x+w*.17,h*.32],[x+w*.07,h*.65]],'#e7ffe608');}limb(c,[[0,h*.56],[w,h*.56]],'#7b836455',4);}
 else if(level===1){for(let y=0;y<h*.65;y+=26)for(let x=-40;x<w;x+=76){c.strokeStyle='#a39aba0b';c.strokeRect(x+(Math.round(y/26)%2)*38,y,75,25);}c.save();c.translate(w*.21,h*.3);c.rotate(-.13);c.font=`italic 900 ${Math.min(w*.13,120)}px Arial`;c.fillStyle='#b7a0ff55';c.fillText('Заметь наш стиль',-w*.14,20);c.restore();for(let i=0;i<12;i++)circle(c,i*w/11,h*.11+Math.sin(i/11*Math.PI)*18,3,'#ecf3c7');crowd(c,w,h,beat,level,reduced);}
 else{for(let i=0;i<11;i++){const x=18+i*w/11;c.fillStyle=i%2?'#b7a0ff16':'#c5ff4a12';c.fillRect(x,h*.12,w/16,h*.42);for(let j=0;j<8;j++){c.fillStyle=(i+j+Math.floor(beat))%4===0?'#c5ff4a50':'#c5ff4a0c';c.fillRect(x+4,h*.14+j*h*.055,w/16-8,3);}}crowd(c,w,h,beat,level,reduced);}
 const floor=c.createLinearGradient(0,h*.68,0,h);floor.addColorStop(0,'#57604730');floor.addColorStop(1,'#131910');c.fillStyle=floor;c.fillRect(0,h*.71,w,h*.29);for(let i=-4;i<10;i++)limb(c,[[w*.42,h*.69],[i*w*.22,h]],'#b0c58b0e',1);for(let i=0;i<4;i++)limb(c,[[0,h*(.74+i*.08)],[w,h*(.74+i*.08)]],'#b0c58b0c',1);
 if((drive||level===2||hero)&&!reduced){for(let i=0;i<3;i++){const sx=w*(.15+i*.3),end=sx+Math.sin(beat*.2+i)*w*.22;const g=c.createLinearGradient(sx,0,end,h*.9);g.addColorStop(0,drive?'#c5ff4a2a':'#b7a0ff15');g.addColorStop(1,'#c5ff4a00');poly(c,[[sx,0],[end-w*.16,h*.87],[end+w*.16,h*.87]],g);}}
 // Responsive crew stays to the left of the note highway during play.
 const area=hero?w:w*(w<700?.47:.57),base=hero?h*.86:h*.8,scale=Math.min(area/470,h/360),xs=[.15,.32,.5,.68,.85];
 for(const i of[0,4,1,3,2]){const depth=i===2?1.12:i===1||i===3?.94:.81;dancer(c,area*xs[i],base+(i===2?10:i===1||i===3?-5:-18),scale*depth,beat,i,look,drive,hit,holding,final);}
 if(drive&&!reduced){c.fillStyle=`rgba(197,255,74,${.018+pulse*.018})`;c.fillRect(0,0,area,h);for(let i=0;i<12;i++){const t=(beat*.11+i*.131)%1;circle(c,(i*.317%1)*area,h*(1-t),1.5,i%2?LIME:PURPLE);}}
 if(hero){c.fillStyle='#1c281188';c.fillRect(0,h-43,w,43);}
}
export function highway(canvas,notes,time,{pressed=[false,false,false,false],reduced=false,tutorial=false}={}){
 const{ctx:c,w,h}=canvasSize(canvas),laneW=w/4,target=h-87,travel=Math.max(180,(target-12)/1.85),arrowSize=Math.min(30,laneW*.42);c.clearRect(0,0,w,h);
 for(let i=0;i<4;i++){const x=i*laneW;c.fillStyle=i%2?'#ffffff02':'#ffffff05';c.fillRect(x,0,laneW,h);c.fillStyle='#acbb9220';c.fillRect(x,0,1,h);if(pressed[i]){const g=c.createLinearGradient(0,target-150,0,target);g.addColorStop(0,'#c5ff4a00');g.addColorStop(1,'#c5ff4a20');c.fillStyle=g;c.fillRect(x+1,target-150,laneW-2,170);}c.strokeStyle=pressed[i]?LIME:'#a6bb76';c.lineWidth=pressed[i]?2:1;c.strokeRect(x+laneW*.16,target-22,laneW*.68,44);c.fillStyle=pressed[i]?LIME:'#849467';c.font=`${arrowSize}px Arial`;c.textAlign='center';c.fillText(['←','↓','↑','→'][i],x+laneW/2,target+arrowSize*.32);}
 c.strokeStyle='#c5ff4a44';c.beginPath();c.moveTo(0,target);c.lineTo(w,target);c.stroke();
 for(const n of notes){if(n.status==='done')continue;let y=target-(n.time-time)*travel;if(y< -n.duration*travel-40||y>h+50)continue;const x=(n.lane+.5)*laneW,color=n.duration?PURPLE:LIME;
  if(n.duration){const endY=target-(n.time+n.duration-time)*travel,top=Math.max(-30,endY),bottom=n.status==='holding'?target:y;c.fillStyle=n.status==='holding'?'#cbbaff99':'#b7a0ff45';c.fillRect(x-laneW*.17,top,laneW*.34,Math.max(0,bottom-top));c.fillStyle=color;c.fillRect(x-laneW*.25,top,laneW*.5,5);if(n.status==='holding')y=target;}
  c.fillStyle=color;if(!reduced){c.shadowColor=color;c.shadowBlur=n.status==='holding'?12:5;}c.fillRect(x-laneW*.34,y-17,laneW*.68,34);c.shadowBlur=0;c.fillStyle='#152009';c.font=`bold ${arrowSize}px Arial`;c.textAlign='center';c.fillText(['←','↓','↑','→'][n.lane],x,y+arrowSize*.32);
 }
 const g=c.createLinearGradient(0,0,0,65);g.addColorStop(0,'#111713');g.addColorStop(1,'#11171300');c.fillStyle=g;c.fillRect(0,0,w,65);
}
