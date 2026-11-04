import{DANCE_MOVE_BY_ID}from'./dance-move-library.mjs';
import{CREWS}from'./crew-progression.mjs';

const COUNTERS={'running-man':['roger-rabbit','two-step'],'two-step':['running-man','cabbage-patch'],bounce:['two-step','running-man'],'cabbage-patch':['reebok','biz-markie'],'roger-rabbit':['running-man','steve-martin']};
const ROUND_MOVES={story:Array.from({length:3},()=>['running-man','two-step','bounce']),moskovsky:[['running-man','two-step','bounce'],['cabbage-patch','reebok','roger-rabbit'],['steve-martin','biz-markie','bart-simpson']],solntsevo:[['reebok','roger-rabbit','two-step'],['biz-markie','running-man','cabbage-patch'],['bart-simpson','steve-martin','smurf']]};
export const FREESTYLE_BEAT=60/95;
const BEAT=FREESTYLE_BEAT,OPPONENT=8,PLAYER=11,ROUNDS=3,COOLDOWN=BEAT*2-.2;
export class FreestyleBattle{
 constructor(library,crewId='moskovsky'){
  this.library=library;this.crewId=ROUND_MOVES[crewId]?crewId:'moskovsky';this.required=this.crewId==='story'?900:CREWS[this.crewId].required;
  this.duration=(OPPONENT+PLAYER)*ROUNDS;this.time=0;this.phase='opponent';this.round=0;this.score=0;this.hype=35;this.moves=[];this.combo=0;this.maxCombo=0;this.judged=0;this.quality=0;this.perfect=0;this.good=0;this.missed=0;this.queue=null;this.lastMoveAt=-Infinity;this.lastInputAt=-Infinity;this.lastMove=null;this.currentMove=null;this.previousMove=null;this.currentMoveAt=0;this.finished=false;this.events=[];this.closedRounds=new Set();this.usedBeats=new Set();
 }
 get roundStart(){return this.round*(OPPONENT+PLAYER);}
 get playerStart(){return this.roundStart+OPPONENT;}
 get opponentMoves(){return ROUND_MOVES[this.crewId][this.round]||ROUND_MOVES[this.crewId][2];}
 get opponentMove(){return this.opponentMoves[Math.max(0,Math.min(2,Math.floor((this.time-this.roundStart)/(4*BEAT))))];}
 get responseTarget(){return this.opponentMoves[this.moves.filter(m=>m.round===this.round&&m.timing>0).length%3];}
 get responseOptions(){const target=this.responseTarget;return [target,...COUNTERS[target]||[]].filter(id=>this.library.canPerform(id));}
 get displayMove(){return this.phase==='opponent'?this.opponentMove:this.currentMove;}
 drain(){return this.events.splice(0);}
 update(time){
  if(this.finished||!Number.isFinite(time))return;
  this.time=Math.max(this.time,Math.min(this.duration,time));
  for(let round=0;round<ROUNDS;round++)if(this.time>=(round+1)*(OPPONENT+PLAYER)&&!this.closedRounds.has(round)){
   this.closedRounds.add(round);
   if(this.moves.filter(m=>m.round===round&&m.timing>0).length<2){this.missed++;this.combo=0;this.hype=Math.max(0,this.hype-7);}
  }
  const nextRound=Math.min(ROUNDS-1,Math.floor(this.time/(OPPONENT+PLAYER))),nextPhase=this.time>=this.duration?'done':this.time-nextRound*(OPPONENT+PLAYER)<OPPONENT?'opponent':'player';
  if(nextRound!==this.round||nextPhase!==this.phase){
   this.round=nextRound;this.phase=nextPhase;this.queue=null;
   if(nextPhase==='player'){this.previousMove=null;this.currentMove=null;}
   this.events.push({type:'turn',round:this.round,phase:this.phase});
  }
  if(nextPhase==='done'){this.finished=true;this.events.push({type:'finish'});}
  // A queued selection is a preview, never an automatically scored input.
 }
 choose(id,time){
  if(!Number.isFinite(time)||time<this.time-.05)return{ok:false,reason:'time'};
  this.update(time);
  if(this.phase!=='player'||!this.library.canPerform(id))return{ok:false,reason:'unavailable'};
  const interval=this.time-this.lastInputAt;this.lastInputAt=this.time;
  if(interval<.18)return{ok:false,reason:'rapid'};
  if(this.time-this.lastMoveAt<COOLDOWN){this.queue=id;return{ok:true,queued:true};}
  return this.perform(id,this.time);
 }
 perform(id,time){
  if(this.finished||this.phase!=='player'||time!==this.time||time-this.lastMoveAt<COOLDOWN)return{ok:false,reason:'cooldown'};
  const move=DANCE_MOVE_BY_ID.get(id);if(!move||!this.library.canPerform(id))return{ok:false,reason:'locked'};
  // Absolute track grid. Input/audio calibration is applied once by battleClock.
  const beat=Math.round(time/BEAT),drift=Math.abs(time-beat*BEAT),timing=drift<=.13?1:drift<=.24?.75:0;
  if(this.usedBeats.has(beat))return{ok:false,reason:'duplicate'};
  this.usedBeats.add(beat);
  const recent=this.moves.filter(m=>m.timing>0).slice(-3),repetitions=recent.filter(m=>m.id===id).length;
  const variety=recent.some(m=>m.id!==id)?1.15:1,opponent=this.responseTarget;
  const response=id===opponent?1.14:(COUNTERS[opponent]||[]).includes(id)?1.3:1;
  const flow=recent.length&&time-recent.at(-1).time<3?1.12:1,penalty=Math.max(.2,1-repetitions*.32);
  const points=Math.round(move.scoreValue*timing*variety*response*flow*penalty);
  this.score+=points;this.quality+=timing;this.judged++;
  if(timing===1)this.perfect++;else if(timing>0)this.good++;else this.missed++;
  this.combo=!timing||repetitions>=2?0:this.combo+1;this.maxCombo=Math.max(this.maxCombo,this.combo);
  this.hype=Math.max(0,Math.min(100,this.hype+(timing?Math.round((timing+response+variety-2.5)*10)-repetitions*4:-8)));
  this.moves.push({id,time,round:this.round,points,timing,response,repetitions});
  this.lastMove=id;this.lastMoveAt=time;this.previousMove=this.currentMove;this.currentMove=id;this.currentMoveAt=time;this.queue=null;
  const event={type:'move',id,name:move.name,points,timing,response,repetitions,hype:this.hype};this.events.push(event);return{ok:true,event};
 }
 result(){
  const valid=this.moves.filter(m=>m.timing>0),accuracy=this.judged?Math.round(this.quality/this.judged*100):0;
  const responses=valid.filter(m=>m.response>1).length,won=valid.length>=6&&this.score>=this.required&&accuracy>=60&&responses>=2;
  return{score:this.score,accuracy,maxCombo:this.maxCombo,perfect:this.perfect,good:this.good,missed:this.missed,stars:won?(this.score>=3000?3:this.score>=1700?2:1):0,won,hype:this.hype,moves:valid.length,responses};
 }
}
