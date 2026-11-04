import{danceFamily}from'./dance-info.mjs';
import{DANCE_MOVE_BY_ID}from'./dance-move-library.mjs';
import{CREWS}from'./crew-progression.mjs';
export const MIRROR_BEAT=60/95,MOVE_TIME=4*MIRROR_BEAT,MIRROR_ROUNDS=2;
export const MIRROR_TURNS=['opponent_show','player_repeat','player_show','opponent_repeat'];
export const MIRROR_TITLES=['СОПЕРНИК ПОКАЗЫВАЕТ','ПОВТОРИ ЗА СОПЕРНИКОМ','ПОКАЖИ СВОЮ СВЯЗКУ','СОПЕРНИК ПОВТОРЯЕТ ТЕБЯ'];
export class MirrorBattle{
 constructor(library,crewId='story',context={}){
  this.library=library;this.crewId=crewId;this.required=CREWS[crewId]?.required||600;
  this.level=Math.min(4,1+Math.floor(library.battleWins/2)+(context.storyComplete?1:0));
  this.moveCount=this.level===1?3:Math.min(5,this.level+2);
  this.minUnique=Math.min(this.moveCount,this.level+1);this.goalsMet=0;this.recorded=false;
  this.unlocked=library.learnLevel(Math.min(5,3+Math.floor(library.battleWins/2)));
  const known=library.available().map(m=>m.id);
  let seed=[...crewId].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17)+library.battleWins*7919;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const shuffled=()=>{const row=[...known];for(let i=row.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[row[i],row[j]]=[row[j],row[i]];}return row;};
  this.examples=Array.from({length:MIRROR_ROUNDS},()=>shuffled().slice(0,this.moveCount));
  this.targets=Array.from({length:MIRROR_ROUNDS},()=>this.level>1?shuffled()[0]:null);
  this.rounds=Array.from({length:MIRROR_ROUNDS},()=>({repeat:[],show:[]}));
  this.previewState=null;this.replayState=null;this.replayed=new Set();this.goalBonus=0;this.duration=MOVE_TIME*this.moveCount*8;this.time=0;this.round=0;this.turn=0;this.turnStart=0;this.end=this.moveCount*MOVE_TIME;this.phase='opponent';this.finished=false;this.events=[];this.score=0;this.hype=35;this.combo=0;this.maxCombo=0;this.correct=0;this.created=0;this.echoed=0;this.missed=0;this.currentMove=null;this.previousMove=null;this.currentMoveAt=0;this.opponentMove=null;this.opponentMoveAt=0;this.lastCreated=null;this.createdIds=new Set();
 }
 waitForShow(){this.watchMode=true;this.end=null;this.refresh();}
 get canWatch(){return !this.finished&&this.turn===0&&this.end===null;}
 watch(time){if(!Number.isFinite(time))return false;time=Math.max(0,time);if(time<this.time-1e-8||!this.canWatch)return false;this.time=Math.max(this.time,time);this.turnStart=(Math.ceil(time/MIRROR_BEAT)+2)*MIRROR_BEAT;this.end=this.turnStart+this.opponentMoves.length*MOVE_TIME;this.events.push({type:'watch'});return true;}
 present(time){if(this.watchMode&&this.phase==='opponent'&&this.end!==null&&time-this.time>.5){const delay=Math.ceil((time-this.time)/MIRROR_BEAT)*MIRROR_BEAT;this.turnStart+=delay;this.end+=delay;}this.update(time);}
 get answerCount(){return this.opponentMoves.length;}
 get task(){return 'Связка: '+this.answerCount+' · разных: '+this.minUnique+(this.targets[this.round]?' · включи '+DANCE_MOVE_BY_ID.get(this.targets[this.round]).name:'');}
 get minimumCreated(){return Math.ceil(this.copyTotal*2/3);}
 recordWin(){if(this.recorded||!this.result().won)return false;this.recorded=true;this.library.battleWins=Math.min(100000,this.library.battleWins+1);return true;}
 get copyTotal(){return this.examples.reduce((n,row)=>n+row.length,0);}
 get turnKind(){return MIRROR_TURNS[this.turn];}
 get turnTitle(){return MIRROR_TITLES[this.turn];}
 get turnEnd(){return this.end??Infinity;}
 get opponentMoves(){return this.examples[this.round];}
 get selection(){return this.turn===1?this.rounds[this.round].repeat:this.rounds[this.round].show;}
 get canChoose(){return !this.finished&&this.phase==='player'&&this.end===null&&!this.replayState&&this.selection.length<this.answerCount;}
 get canUndo(){return this.canSkip&&this.selection.length>0;}
 get canPerform(){return this.canSkip&&this.selection.length===this.answerCount;}
 get canReplay(){return this.canSkip&&this.turn===1&&!this.replayed.has(this.round);}
 get motionRate(){return this.previewState ? .6 : 1;}
 get opponentRate(){return this.replayState ? .75 : 1;}
 get canSkip(){return !this.finished&&this.phase==='player'&&this.end===null&&!this.replayState;}
 get slot(){if(this.canWatch)return 0;if(this.replayState)return Math.min(this.answerCount,Math.floor((this.time-this.replayState.start)/(MOVE_TIME/.75))+1);if(this.phase==='player'&&this.end===null)return Math.min(this.answerCount,this.selection.length+1);const start=this.phase==='player'?this.selection[0]?.start:this.turnStart;return Math.min(this.answerCount,Math.max(1,Math.floor((this.time-start)/MOVE_TIME)+1));}
 get progress(){const local=this.end===null?this.selection.length/(this.answerCount*4):Math.max(0,Math.min(1,(this.time-this.turnStart)/(this.end-this.turnStart||1)));return (this.round*4+this.turn+local)/8;}
 drain(){return this.events.splice(0);}
 choose(id,time){
  if(!Number.isFinite(time)||time<this.time-1e-8)return{ok:false,reason:'time'};this.update(time);
  if(!this.library.canPerform(id))return{ok:false,reason:'unavailable'};
  if(!this.canChoose)return{ok:false,reason:this.phase==='player'?'full':'unavailable'};
  this.previewState=null;this.selection.push({id,start:null,end:null,done:false});
  this.events.push({type:'selected',id,index:this.selection.length-1});return{ok:true,queued:true};
 }
 perform(time){if(!Number.isFinite(time)||time<this.time-1e-8)return false;this.update(time);if(!this.canPerform)return false;this.previewState=null;const start=Math.ceil((this.time+MIRROR_BEAT*.5)/MIRROR_BEAT-1e-8)*MIRROR_BEAT;this.selection.forEach((m,i)=>{m.start=start+i*MOVE_TIME;m.end=m.start+MOVE_TIME;});this.end=this.selection.at(-1).end;this.events.push({type:'perform'});return true;}
 preview(id,time){if(!Number.isFinite(time)||time<this.time-1e-8)return false;this.update(time);if(!this.canSkip||!this.library.canPerform(id))return false;this.previewState={id,start:this.time,end:this.time+2*MOVE_TIME/.6};this.events.push({type:'preview',id});return true;}
 stopPreview(){this.previewState=null;this.refresh();}
 replay(time){if(!Number.isFinite(time)||time<this.time-1e-8)return false;this.update(time);if(!this.canReplay)return false;this.previewState=null;this.replayed.add(this.round);this.replayState={start:this.time,end:this.time+this.opponentMoves.length*MOVE_TIME/.75};this.events.push({type:'replay'});return true;}
 undo(){if(!this.canUndo)return false;this.selection.pop();return true;}
 skip(time){if(!Number.isFinite(time)||time<this.time-1e-8)return false;this.update(time);if(!this.canSkip)return false;this.selection.length=0;this.advance(this.time);this.refresh();return true;}
 settle(){
  if(this.phase!=='player')return;
  for(let index=0;index<this.selection.length;index++){
   const m=this.selection[index];if(m.done||m.end===null||this.time+1e-8<m.end)continue;m.done=true;
   let points=0,correct=true;const kind=this.turn===1?'repeat':'show';
   if(kind==='repeat'){correct=m.id===this.opponentMoves[index];if(correct){this.correct++;points=150;}else this.missed++;}
   else{points=this.lastCreated!==m.id?150:35;this.created++;this.createdIds.add(m.id);this.lastCreated=m.id;}
   m.correct=correct;this.combo=correct?this.combo+1:0;this.maxCombo=Math.max(this.maxCombo,this.combo);this.score+=points;this.hype=Math.max(0,Math.min(100,this.hype+(correct?6:-8)));
   this.events.push({type:'move',id:m.id,name:DANCE_MOVE_BY_ID.get(m.id).name,points,correct,kind,expected:this.opponentMoves[index]});
  }
 }
 advance(at){
  this.previewState=null;this.replayState=null;
  if(this.turn===1&&this.selection.length===this.answerCount&&this.selection.every(m=>m.correct)&&!this.replayed.has(this.round)){this.score+=50;this.events.push({type:'bonus',message:'Связка по памяти +50'});}
  if(this.turn===2){const shown=this.selection.filter(m=>m.done),unique=new Set(shown.map(m=>m.id)).size,families=new Set(shown.map(m=>danceFamily(m.id))).size,goal=unique>=this.minUnique&&(!this.targets[this.round]||shown.some(m=>m.id===this.targets[this.round])),bonus=(unique===this.answerCount?50:0)+(families>1?50:0);if(goal)this.goalsMet++;this.events.push({type:'bonus',message:goal?'Задание связки выполнено!':'Задание связки не выполнено: '+this.task});this.score+=bonus;this.goalBonus+=bonus;if(bonus)this.events.push({type:'bonus',message:'Разнообразие и смена характера +'+bonus});}
  if(this.turn===1)this.missed+=this.opponentMoves.length-this.selection.filter(m=>m.done).length;
  if(this.turn===3)this.echoed+=this.rounds[this.round].show.filter(m=>m.done).length;
  this.turn++;if(this.turn===4){this.turn=0;this.round++;}
  if(this.round===MIRROR_ROUNDS){this.round=MIRROR_ROUNDS-1;this.turn=3;this.finished=true;this.phase='done';this.duration=at;this.events.push({type:'finish'});return;}
  this.turnStart=at;this.phase=this.turn===1||this.turn===2?'player':'opponent';
  this.end=this.phase==='player'||this.turn===0&&this.watchMode?null:at+(this.turn===0?this.opponentMoves.length:this.rounds[this.round].show.length)*MOVE_TIME;
  this.events.push({type:'turn',round:this.round,turn:this.turn,title:this.turnTitle});
 }
 refresh(){
  const active=this.previewState||(!this.finished&&this.phase==='player'?this.selection.find(m=>m.start!==null&&this.time>=m.start&&this.time<m.end):null);
  if(active?.id!==this.currentMove||active&&active.start!==this.currentMoveAt){this.previousMove=this.currentMove;this.currentMove=active?.id||null;this.currentMoveAt=active?.start||this.time;}
  const list=this.canWatch?[]:this.replayState?this.opponentMoves:this.turn===0?this.opponentMoves:this.turn===3?this.rounds[this.round].show.filter(m=>m.done).map(m=>m.id):[];
  const start=this.replayState?.start??this.turnStart,length=MOVE_TIME/this.opponentRate,slot=Math.floor((this.time-start)/length);this.opponentMove=!this.finished?list[slot]||null:null;this.opponentMoveAt=start+slot*length;
 }
 update(time){
  if(this.finished||!Number.isFinite(time)||time<this.time-1e-8)return;this.time=Math.max(this.time,0,time);if(this.previewState&&this.time>=this.previewState.end)this.previewState=null;if(this.replayState&&this.time>=this.replayState.end)this.replayState=null;
  // Planning waits for the player; music time never grades a button press.
  for(let guard=0;guard<8&&!this.finished;guard++){
   this.settle();if(this.end===null||this.time+1e-8<this.end)break;this.advance(this.end);
  }
  this.refresh();
 }
 result(){const accuracy=Math.round(this.correct/this.copyTotal*100),won=this.finished&&accuracy>=67&&this.created>=this.minimumCreated&&this.createdIds.size>=this.minUnique&&(this.level===1||this.goalsMet===MIRROR_ROUNDS)&&this.score>=this.required;
  return{level:this.level,goalsMet:this.goalsMet,score:this.score,accuracy,maxCombo:this.maxCombo,perfect:this.correct,good:0,missed:this.missed,stars:won?(this.correct===this.copyTotal&&this.created===this.copyTotal?3:2):0,won,hype:this.hype,moves:this.correct+this.created,copied:this.correct,copyTotal:this.copyTotal,created:this.created,echoed:this.echoed,unique:this.createdIds.size,goalBonus:this.goalBonus,replays:this.replayed.size};
 }
}
