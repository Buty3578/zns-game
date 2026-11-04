export const STAGES = [
 {name:'Наш зал',tag:'ПЕРВЫЙ ШАГ',bpm:95,bars:32,root:41,color:'#c5ff4a',description:'Почувствуй бит. Найди свой стиль.'},
 {name:'Уличный джем',tag:'ГОРОД СЛУШАЕТ',bpm:110,bars:36,root:38,color:'#b7a0ff',description:'Держи грув. Покажи характер.'},
 {name:'Большая сцена',tag:'ТВОЙ МОМЕНТ',bpm:125,bars:40,root:40,color:'#c5ff4a',description:'Пять танцоров. Один ритм. Весь зал.'}
];
export const ARROWS=['←','↓','↑','→'];
export function section(bar,total){return bar<4?'Вступление':bar<12?'Разгон':bar<16?'Перед дропом':bar<total-4?'Дроп':'Финал';}
export function makeChart(level){
 const stage=STAGES[level],q=60/stage.bpm,notes=[],route=[0,1,3,2,0,2,1,3,2,1,0,3];
 for(let bar=2;bar<stage.bars-2;bar++){
  let beats=level===0?(bar<8?[0,2]:bar%4===3?[0,1,2,3]:[0,2,3]):level===1?(bar%4===3?[0,1,1.5,2,3]:[0,1,2,3]):(bar%2?[0,.5,1,2,2.5,3]:[0,1,1.5,2,3,3.5]);
  if(bar>=12&&bar<16)beats=bar===15?[0,1,2,2.5,3,3.5]:[0,2];
  for(let i=0;i<beats.length;i++){
   const beat=bar*4+beats[i],lane=route[(bar*3+i+level*2)%route.length];
   let dur=level>0&&bar%4===2&&i===0?1.5*q:level===2&&bar%8===4&&i===0?2*q:0;
   // Keep each lane free through the tail of a hold.
   if(notes.some(n=>n.lane===lane&&n.time+n.duration>beat*q-.2))continue;
   notes.push({id:notes.length,lane,beat,time:beat*q,duration:dur,status:'pending',quality:0});
  }
 }
 return notes;
}
export class RhythmGame{
 constructor(level=0){this.level=level;this.stage=STAGES[level];this.notes=makeChart(level);this.duration=this.stage.bars*4*60/this.stage.bpm+1.8;this.score=0;this.combo=0;this.maxCombo=0;this.quality=0;this.judged=0;this.driveUntil=-1;this.nextDrive=10;this.events=[];this.finished=false;this.perfect=0;this.good=0;this.missed=0;}
 get drive(){return this.lastTime<this.driveUntil;}
 emit(type,data={}){this.events.push({type,...data});}
 judge(n,quality,time){n.status='done';n.quality=quality;this.judged++;this.quality+=quality;
  if(quality){this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);if(quality===1)this.perfect++;else this.good++;
   if(this.combo>=this.nextDrive&&time>=this.driveUntil){this.driveUntil=time+8*60/this.stage.bpm;this.nextDrive=this.combo+10;this.emit('drive');}
   this.score+=Math.round((n.duration?180:100)*quality*(time<this.driveUntil?2:1));
  }else{this.combo=0;this.nextDrive=10;this.missed++;}
  this.emit('judge',{lane:n.lane,quality,hold:!!n.duration});
 }
 press(lane,time){this.lastTime=time;const n=this.notes.find(n=>n.status==='pending'&&n.lane===lane&&Math.abs(n.time-time)<=.16+1e-9);if(!n){if(this.notes.some(n=>n.status==='holding'&&n.lane===lane))return;this.combo=0;this.nextDrive=10;this.emit('empty',{lane});return;}
  const quality=Math.abs(n.time-time)<=.075+1e-9?1:.65;
  if(n.duration){n.status='holding';n.quality=quality;this.emit('hold',{lane});}else this.judge(n,quality,time);
 }
 release(lane,time){for(const n of this.notes)if(n.lane===lane&&n.status==='holding'){this.judge(n,time>=n.time+n.duration-.12?n.quality:0,time);}}
 update(time){this.lastTime=time;for(const n of this.notes){if(n.status==='pending'&&time>n.time+.16+1e-9)this.judge(n,0,time);else if(n.status==='holding'&&time>=n.time+n.duration)this.judge(n,n.quality,time);}if(time>=this.duration&&!this.finished){this.finished=true;this.emit('finish');}}
 drain(){return this.events.splice(0);}
 result(){const accuracy=this.notes.length?Math.round(this.quality/this.notes.length*100):0;return{score:this.score,accuracy,maxCombo:this.maxCombo,stars:accuracy>=90?3:accuracy>=65?2:1,perfect:this.perfect,good:this.good,missed:this.missed};}
}
