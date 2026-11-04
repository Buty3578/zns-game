import{RhythmGame,STAGES}from'../core.mjs';
export const REQUIREMENTS=[60,68,75];
export class BattleGame extends RhythmGame{
 constructor(level=0,bonus=0){super(level);this.notes=this.notes.filter(n=>n.beat<76).map((n,i)=>({...n,id:i}));if(level===0)for(const n of this.notes)n.duration=0;
  if(level===2){const doubles=[];for(const n of this.notes){if(n.beat%8!==0||n.duration)continue;const lane=(n.lane+2)%4;if(!this.notes.some(x=>x.lane===lane&&Math.abs(x.time-n.time)<.21||x.lane===lane&&x.time<n.time&&x.time+x.duration>n.time))doubles.push({...n,id:1000+n.id,lane});}this.notes.push(...doubles);this.notes.sort((a,b)=>a.time-b.time||a.lane-b.lane);}
  this.duration=78*60/this.stage.bpm;this.nextDrive=Infinity;this.charge=Math.min(45,Math.max(0,bonus));this.crowd=50;this.activations=0;this.required=REQUIREMENTS[level];this.spam=0;
 }
 judge(n,quality,time){this.nextDrive=Infinity;super.judge(n,quality,time);this.nextDrive=Infinity;if(quality){this.charge=Math.min(100,this.charge+(quality===1?12:7));this.crowd=Math.min(100,this.crowd+(quality===1?2.4:1.5));}else{this.crowd=Math.max(0,this.crowd-5);this.charge=Math.max(0,this.charge-9);}}
 press(lane,time){const count=this.events.length;super.press(lane,time);if(this.events.slice(count).some(e=>e.type==='empty')){this.spam++;this.crowd=Math.max(0,this.crowd-2);this.charge=Math.max(0,this.charge-3);}}
 activate(time){if(this.charge<100||time<this.driveUntil)return false;this.charge=0;this.driveUntil=time+8*60/this.stage.bpm;this.activations++;this.emit('drive');return true;}
 get won(){return this.result().accuracy>=this.required&&this.crowd>=25;}
 get phrase(){const beat=(this.lastTime||0)*this.stage.bpm/60;return beat<8?'Разогрев':beat<32?'Твоя связка':beat<48?'Держи характер':beat<64?'Сложнее ритм':'Финальный дроп';}
}
export const CACHES=[{id:0,x:-34,z:8,height:1.4,name:'Кассета «Флоу»'},{id:1,x:35,z:-19,height:1.4,name:'Кассета «Фанк»'},{id:2,x:8,z:-34,height:1.4,name:'Кассета «Брейк»'}];
export const PLATFORMS=CACHES.flatMap(c=>[0,1,2].map((n)=>({x:c.id===0?c.x:c.x+(n-2)*2.1,z:c.id===0?c.z+(2-n)*2.1:c.z,w:c.id===0?2.2:1.9,d:c.id===0?1.9:2.2,h:(n+1)*.47})));
export const RACE={x:-6,z:38,limit:33,points:[{x:-14,z:40},{x:-25,z:31},{x:-25,z:17},{x:-25,z:2},{x:-9,z:2},{x:3,z:2}]};
export function surfaceAt(x,z){let top=0;for(const p of PLATFORMS)if(Math.abs(x-p.x)<p.w/2&&Math.abs(z-p.z)<p.d/2)top=Math.max(top,p.h);return top;}
export function platformBlocked(x,z,y){return PLATFORMS.some(p=>Math.abs(x-p.x)<p.w/2+.32&&Math.abs(z-p.z)<p.d/2+.32&&y<p.h-.08);}
export class DistrictSkills{
 constructor(data={}){this.caches=new Set((data.caches||[]).filter(x=>[0,1,2].includes(x)));this.raceWon=!!data.raceWon;this.bestTime=Number(data.bestTime)||null;this.stamina=100;this.dashTime=0;this.race=null;this.events=[];}
 dash(){if(this.stamina<38||this.dashTime>0)return false;this.stamina-=38;this.dashTime=.33;return true;}
 startRace(){this.race={elapsed:0,index:0};this.events.push({type:'raceStart'});}
 update(dt,player){this.dashTime=Math.max(0,this.dashTime-dt);this.stamina=Math.min(100,this.stamina+dt*17);
  for(const c of CACHES)if(!this.caches.has(c.id)&&Math.hypot(player.x-c.x,player.z-c.z)<1.1&&player.y>c.height-.25){this.caches.add(c.id);this.events.push({type:'cache',name:c.name});}
  if(this.race){this.race.elapsed+=dt;const p=RACE.points[this.race.index];if(p&&Math.hypot(player.x-p.x,player.z-p.z)<2.2){this.race.index++;this.events.push({type:'checkpoint'});}if(this.race.index===RACE.points.length){this.raceWon=true;this.bestTime=Math.min(this.bestTime||Infinity,this.race.elapsed);this.events.push({type:'raceWin',time:this.race.elapsed});this.race=null;}else if(this.race.elapsed>RACE.limit){this.events.push({type:'raceFail'});this.race=null;}}
 }
 get battleBonus(){return this.caches.size*10+(this.raceWon?15:0);}
 drain(){return this.events.splice(0);}
 snapshot(){return{caches:[...this.caches],raceWon:this.raceWon,bestTime:this.bestTime};}
}
export class StoryBattle extends BattleGame{
 constructor(bonus=0){super(0,bonus);this.required=50;this.notes=this.notes.filter(n=>n.beat%2===0);this.duration=78*60/95;this.crowd=65;}
 press(lane,time){this.lastTime=time;const n=this.notes.find(n=>n.status==='pending'&&n.lane===lane&&Math.abs(n.time-time)<=.25);if(!n){this.emit('empty',{lane});return;}this.judge(n,Math.abs(n.time-time)<=.13?1:.8,time);}
 update(time){this.lastTime=time;for(const n of this.notes)if(n.status==='pending'&&time>n.time+.25)this.judge(n,0,time);if(time>=this.duration&&!this.finished){this.finished=true;this.emit('finish');}}
 get won(){return this.result().accuracy>=50;}
}
