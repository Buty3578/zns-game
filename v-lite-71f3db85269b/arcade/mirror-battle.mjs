import{danceFamily}from'./dance-info.mjs';
import{DANCE_MOVE_BY_ID}from'./dance-move-library.mjs';
import{CREWS}from'./crew-progression.mjs';
export const MIRROR_BEAT=60/95,MOVE_TIME=4*MIRROR_BEAT,MIRROR_ROUNDS=2;
export const MIRROR_TURNS=['opponent_show','player_repeat','player_show','opponent_repeat'];
export const MIRROR_TITLES=['СОПЕРНИК ПОКАЗЫВАЕТ','ПОВТОРИ ЗА СОПЕРНИКОМ','ПОКАЖИ СВОЮ СВЯЗКУ','СОПЕРНИК ПОВТОРЯЕТ ТЕБЯ'];
export class MirrorBattle{
 constructor(library,crewId='story'){
  this.library=library;this.crewId=crewId;this.required=CREWS[crewId]?.required||600;
  const known=library.available().map(m=>m.id),offset=crewId==='solntsevo'?1:0;
  const patterns=[['two-step','cabbage-patch','running-man'],['heel-toe','charleston','rock']];this.examples=patterns.map((row,r)=>row.map((id,i)=>offset?known[(known.indexOf(id)+offset+known.length)%known.length]:library.canPerform(id)?id:known[(i+r)%known.length]));
  this.rounds=Array.from({length:MIRROR_ROUNDS},()=>({repeat:[],show:[]}));
  this.previewState=null;this.replayState=null;this.replayed=new Set();this.goalBonus=0;this.duration=MOVE_TIME*3*8;this.time=0;this.round=0;this.turn=0;this.turnStart=0;this.end=3*MOVE_TIME;this.phase='opponent';this.finished=false;this.events=[];this.score=0;this.hype=35;this.combo=0;this.maxCombo=0;this.correct=0;this.created=0;this.echoed=0;this.missed=0;this.currentMove=null;this.previousMove=null;this.currentMoveAt=0;this.opponentMove=null;this.opponentMoveAt=0;this.lastCreated=null;this.createdIds=new Set();
 }
 waitForShow(){this.watchMode=true;this.end=null;this.refresh();}
 get canWatch(){return !this.finished&&this.turn===0&&this.end===null;}
 watch(time){if(!Number.isFinite(time))return false;time=Math.max(0,time);if(time<this.time-1e-8||!this.canWatch)return false;this.time=Math.max(this.time,time);this.turnStart=(Math.ceil(time/MIRROR_BEAT)+2)*MIRROR_BEAT;this.end=this.turnStart+this.opponentMoves.length*MOVE_TIME;this.events.push({type:'watch'});return true;}
 present(time){if(this.watchMode&&this.phase==='opponent'&&this.end!==null&&time-this.time>.5){const delay=Math.ceil((time-this.time)/MIRROR_BEAT)*MIRROR_BEAT;this.turnStart+=delay;this.end+=delay;}this.update(time);}
 get answerCount(){return this.turn===1?this.opponentMoves.length:3;}
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
 get slot(){if(this.canWatch)return 0;if(this.replayState)return Math.min(3,Math.floor((this.time-this.replayState.start)/(MOVE_TIME/.75))+1);if(this.phase==='player'&&this.end===null)return Math.min(3,this.selection.length+1);const start=this.phase==='player'?this.selection[0]?.start:this.turnStart;return Math.min(3,Math.max(1,Math.floor((this.time-start)/MOVE_TIME)+1));}
 get progress(){const local=this.end===null?this.selection.length/12:Math.max(0,Math.min(1,(this.time-this.turnStart)/(this.end-this.turnStart||1)));return (this.round*4+this.turn+local)/8;}
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
  if(this.turn===2){const shown=this.selection.filter(m=>m.done),unique=new Set(shown.map(m=>m.id)).size,families=new Set(shown.map(m=>danceFamily(m.id))).size,bonus=(unique===3?50:0)+(families>1?50:0);this.score+=bonus;this.goalBonus+=bonus;if(bonus)this.events.push({type:'bonus',message:'Разнообразие и смена характера +'+bonus});}
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
 result(){const accuracy=Math.round(this.correct/this.copyTotal*100),won=this.finished&&accuracy>=67&&this.created>=4&&this.createdIds.size>=2&&this.score>=this.required;
  return{score:this.score,accuracy,maxCombo:this.maxCombo,perfect:this.correct,good:0,missed:this.missed,stars:won?(this.correct===this.copyTotal&&this.created===6?3:2):0,won,hype:this.hype,moves:this.correct+this.created,copied:this.correct,copyTotal:this.copyTotal,created:this.created,echoed:this.echoed,unique:this.createdIds.size,goalBonus:this.goalBonus,replays:this.replayed.size};
 }
}
