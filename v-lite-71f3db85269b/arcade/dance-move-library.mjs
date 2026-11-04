// Names are vocabulary labels, not claims about authorship. Animation is null until a distinct pose exists.
const groups={
 FOUNDATION:[['bounce','Bounce'],['rock','Rock'],['two-step','Two Step'],['running-man','Running Man'],['step-touch','Step Touch'],['roger-rabbit','Roger Rabbit'],['cabbage-patch','Cabbage Patch'],['reebok','Reebok'],['steve-martin','Steve Martin'],['biz-markie','Biz Markie'],['bart-simpson','Bart Simpson'],['smurf','Smurf'],['wop','Wop'],['prep','Prep'],['skate','Skate'],['monastery','Monastery'],['pepperseed','Pepperseed']],
 OLD_SCHOOL:[['robocop','Robocop'],['humpty-dance','Humpty Dance'],['kid-n-play',"Kid 'n Play"],['fila-rambo','Fila / Rambo'],['harlem-shake','Harlem Shake']],
 PARTY:[['cat-daddy','Cat Daddy'],['chicken-noodle-soup','Chicken Noodle Soup'],['jerk','Jerk'],['walk-it-out','Walk It Out'],['tone-wop','Tone Wop'],['rooftop','Rooftop'],['funky-4-corners','Funky 4 Corners'],['party-machine','Party Machine'],['atl-stomp','ATL Stomp']],
 FOOTWORK:[['heel-toe','Heel Toe'],['charleston','Charleston'],['spongebob','SpongeBob'],['typewriter','Typewriter'],['gucci','Gucci'],['popcorn','Popcorn'],['shamrock','Shamrock'],['baseball-step','Baseball Step']],
 POWER:[['mike-tyson','Mike Tyson'],['alf','ALF']]
};
const animated=new Set(['bounce','two-step','running-man','roger-rabbit','cabbage-patch','reebok','steve-martin','biz-markie','bart-simpson','smurf','wop','prep','skate','monastery','pepperseed','rock','step-touch','heel-toe','charleston','robocop']);
const tier=id=>['bounce','two-step','running-man','rock','step-touch','cabbage-patch','heel-toe','charleston'].includes(id)?1:['roger-rabbit','cabbage-patch','reebok'].includes(id)?2:['steve-martin','biz-markie','bart-simpson'].includes(id)?3:['smurf','wop','prep'].includes(id)?4:5;
export const DANCE_MOVES=Object.freeze(Object.entries(groups).flatMap(([category,items])=>items.map(([id,name],index)=>Object.freeze({
 id,name,category,difficulty:Math.min(5,1+Math.floor(index/3)),energy:1+index%4,groove:category==='FOUNDATION'?2:category==='POWER'?4:3,duration:index%3===0?2:1.5,
 animation:animated.has(id)?id:null,transitionIn:.18,transitionOut:.22,scoreValue:100+Math.min(5,1+Math.floor(index/3))*35,unlockLevel:tier(id)
}))));
export const DANCE_MOVE_BY_ID=new Map(DANCE_MOVES.map(m=>[m.id,m]));
export const STARTER_MOVES=['bounce','rock','two-step','running-man','step-touch','cabbage-patch','heel-toe','charleston'];
export class DanceMoveLibrary{
 constructor(data={}){const ids=Array.isArray(data.unlocked)?data.unlocked:STARTER_MOVES;this.unlocked=new Set([...STARTER_MOVES,...ids.filter(id=>DANCE_MOVE_BY_ID.has(id)&&animated.has(id))]);this.level=Math.max(1,Math.min(5,Number.isSafeInteger(data.level)?data.level:1));}
 get(id){return DANCE_MOVE_BY_ID.get(id)||null;}
 canPerform(id){return this.unlocked.has(id)&&!!this.get(id)?.animation;}
 available(category=null){return [...STARTER_MOVES.map(id=>this.get(id)),...DANCE_MOVES.filter(m=>!STARTER_MOVES.includes(m.id))].filter(m=>this.canPerform(m.id)&&(!category||m.category===category));}
 unlock(id){const move=this.get(id);if(!move?.animation||this.unlocked.has(id))return false;this.unlocked.add(id);this.level=Math.max(this.level,move.unlockLevel);return true;}
 learnLevel(level){const target=Math.max(1,Math.min(5,Math.floor(level))),added=[];for(const move of DANCE_MOVES)if(move.animation&&move.unlockLevel<=target&&!this.unlocked.has(move.id)){this.unlocked.add(move.id);added.push(move.id);}this.level=Math.max(this.level,target);return added;}
 snapshot(){return{unlocked:[...this.unlocked],level:this.level};}
}
