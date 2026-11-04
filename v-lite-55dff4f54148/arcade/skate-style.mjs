import{GRIND_POINTS as GRIND_BASE}from'./skate-grind.mjs';
import{SkateManual}from'./skate-manual.mjs';
import{queueOllie}from'./skate.mjs';
export const TRICKS={hardflip:{name:'Hardflip',points:400,duration:.62,flip:1,boardSpin:-Math.PI},inwardheel:{name:'Inward Heelflip',points:425,duration:.64,flip:-1,boardSpin:Math.PI},shove360:{name:'360 Shove-it',points:300,duration:.58,boardSpin:Math.PI*2},ollie:{name:'Ollie',points:100,duration:0},kickflip:{name:'Kickflip',points:200,duration:.42},spin180:{name:'180° Spin',points:250,duration:.46,spin:Math.PI},spin360:{name:'360° Spin',points:400,duration:.72,spin:Math.PI*2},heelflip:{name:'Heelflip',points:225,duration:.42,flip:-1},shoveit:{name:'Pop Shove-it',points:175,duration:.38,boardSpin:Math.PI},varial:{name:'Varial Kickflip',points:350,duration:.5,flip:1,boardSpin:Math.PI}};

export const COMBO_WINDOW=8;
const number=x=>Number.isSafeInteger(x)&&x>=0?Math.min(x,1e9):0;
export function styleSave(data){const d=data&&typeof data==='object'?data:{};return{total:number(d.total),best:Math.max(number(d.best),number(d.total)),selected:Object.hasOwn(TRICKS,d.selected)||d.selected==='manual'?d.selected:'kickflip'};}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export class SkateStyle{
 constructor(j,data){this.j=j;Object.assign(this,styleSave(data));this.flight=null;this.queued=null;this.chain=0;this.last=null;this.window=0;this.notice='';this.noticeTime=0;this.manual=new SkateManual(this);}
 get multiplier(){return Math.max(1,this.chain);}
 get pending(){return (this.manual.active?.receipts||[]).reduce((sum,r)=>sum+r.points,0)+(this.flight?.segments||[]).reduce((sum,id)=>sum+TRICKS[id].points,0)+(this.flight?.kind?TRICKS[this.flight.kind].points:0);}
 say(message){if(this.notice===message&&this.noticeTime>1)return;this.notice=message;this.noticeTime=2.2;this.j.emit('styleNotice',{message});}
 select(id){if(!Object.hasOwn(TRICKS,id)&&id!=='manual')return false;this.selected=id;return true;}
 request(id=this.selected){if(id==='manual')return this.manual.request();if(this.manual.active){this.say('Сначала заверши Manual кнопкой N / TRICK');return false;}const v=this.j.vehicle;if(!this.j.skating||!Object.hasOwn(TRICKS,id))return false;if(v.dismount){this.say('Дождись остановки и схода со скейта');return false;}if(v.bail>0){this.say('Восстанови равновесие после падения');return false;}
  if(v.grounded){if(this.queued||this.flight)return false;if(v.crouch>0||v.jumpBuffer>0){this.queued=id;return true;}if(!queueOllie(v)){this.say('Дождись завершения прыжка или посадки');return false;}this.queued=id;return true;}
  return this.activate(id,v);
 }
 activate(id,v){const f=this.flight;if(!f||f.locked||id==='ollie'||f.failed)return false;
  const trick=TRICKS[id],height=Math.max(0,v.y-this.j.ground(v.x,v.z)),remaining=(v.vy+Math.sqrt(v.vy*v.vy+44*height))/22;
  if(remaining<trick.duration+.035){this.say('Мало времени для '+trick.name+' — нужен более высокий вылет');return false;}
  f.kind=id;f.locked=true;f.trickTime=0;this.say(trick.name+' · в полёте');return true;
 }
 canTouchRail(){const f=this.flight,t=TRICKS[f?.kind];return !!f&&(!t||f.air>=.2&&f.distance>=1.2&&f.speed>=2&&f.trickTime>=t.duration);}
 touchRail(){const f=this.flight;if(!f)return;f.segments??=[];if(f.kind)f.segments.push(f.kind);f.kind=null;f.locked=false;f.trickTime=f.air=f.distance=0;}
 leaveRail(v){const f=this.flight;if(!f)return;f.locked=false;f.kind=null;f.trickTime=f.air=f.distance=0;f.speed=v.speed;}
 abort(message='Срыв — очки полёта потеряны',announce=true){const had=!!this.flight||!!this.manual.active||this.chain>0;this.manual.reset();this.j.grind?.reset();this.flight=null;this.queued=null;this.chain=0;this.window=0;this.last=null;const v=this.j.vehicle;if(v?.id==='skate'){v.trickSpin=0;v.boardYaw=0;v.trickFlip=0;v.trickTuck=0;v.jumpBuffer=0;}if(had&&announce)this.say(message);}
 resetRun(){this.abort('',false);this.total=0;this.notice='';this.noticeTime=0;}
 idle(dt){if(this.manual.active&&this.j.vehicle!==this.manual.active.board)this.abort('Смена режима — очки связки потеряны');if(this.chain&&!this.j.skating)this.abort('Комбо завершено',false);if(this.flight&&this.j.vehicle!==this.flight.board)this.abort('Смена режима — очки полёта потеряны');this.noticeTime=Math.max(0,this.noticeTime-dt);if(this.window>0){this.window=Math.max(0,this.window-dt);if(!this.window){this.chain=0;this.last=null;}}}
 update(v,dt,result,before,input={}){
  if(this.manual.update(v,dt,result,before,input))return;
  if(v.y< -4||![v.x,v.y,v.z].every(Number.isFinite)){this.abort();return;}
  if(result.tookOff){this.flight={board:v,kind:result.ollie?'ollie':null,locked:false,trickTime:0,air:0,distance:0,speed:before.speed,failed:false};if(result.ollie)this.say('Ollie · в полёте');if(this.queued){const id=this.queued;this.queued=null;if(id!=='ollie')this.activate(id,v);}}
  const f=this.flight;if(!f)return;
  if(result.grinding)return;
  const travel=Math.hypot(v.x-before.x,v.z-before.z);if(travel>Math.max(2,before.speed*dt+1)){this.abort();return;}
  f.air+=dt;f.distance+=travel;f.trickTime+=dt;
  const t=f.kind?TRICKS[f.kind]:null,u=t?.duration?smooth(f.trickTime/t.duration):0;
  v.trickSpin=(t?.spin||0)*u;v.trickFlip=(f.kind==='kickflip'?1:t?.flip||0)*Math.PI*2*u;v.boardYaw=(t?.boardSpin||0)*u;v.trickTuck=t?.duration?Math.sin(Math.PI*u):0;
  if(result.collision||v.dismount){if(!v.grounded)v.bail=.65;this.abort();return;}
  if(!result.landed)return;
  // A landing consumes the flight exactly once. Holding/spamming input cannot add tricks.
  this.flight=null;this.queued=null;
  const valid=(!t||f.air>=.2&&f.distance>=1.2&&f.speed>=2&&f.trickTime>=t.duration)&&result.impact<18;
  if(!valid){v.bail=.65;v.speed*=.3;v.land=1;this.chain=0;this.last=null;this.window=0;this.say(f.speed<2?'Разгонись хотя бы до 8 км/ч — без скорости трюк не даёт очков':'Срыв / короткий полёт — без очков');}
  else{
   const clean=result.impact<=13&&Math.abs(v.steer)<.6&&Math.abs(v.lean)<.18;
   const receipts=(f.segments||[]).map(kind=>({kind,...TRICKS[kind]}));
   const grind=this.j.grind?.pending;
   if(grind&&grind.distance>=1.2&&grind.time>=.18)receipts.push(...(grind.receipts||[{kind:grind.kind,name:grind.kind,points:GRIND_BASE[grind.kind],grind:true}]));
   if(t)receipts.push({kind:f.kind,...t});
   if(this.manual.armed&&this.manual.begin(v,receipts)){if(grind)grind.deferred=true;}
   else this.settle(receipts,clean);

  }
  v.trickSpin=0;v.boardYaw=0;v.trickFlip=0;v.trickTuck=0;
 }
 settle(receipts,clean,deferred=false){
  const v=this.j.vehicle,grind=this.j.grind?.pending;
  receipts.forEach((receipt,index)=>{
   const points=this.award(receipt.kind,receipt.points,clean&&index===receipts.length-1,receipt.name);
   if(receipt.grind){if(grind){grind.scored=true;grind.points=(grind.points||0)+points;}if(deferred&&this.j.crew?.grind(v.x,points))this.j.emit('hint',{message:'Гринд засчитан после Manual · +репутация'});}
   if(Math.abs(receipt.boardSpin||0)===Math.PI)v.deckYaw=((v.deckYaw||0)+Math.PI)%(Math.PI*2);if(receipt.spin===Math.PI)v.stanceYaw=((v.stanceYaw||0)+Math.PI)%(Math.PI*2);
  });
 }
 award(kind,base,clean,name=kind){
  const varied=this.window>0&&this.last!==null&&this.last!==kind;this.chain=varied?Math.min(3,this.chain+1):1;
  const variety=varied?50:0,points=(base+(clean?100:0)+variety)*this.chain;
  this.total=Math.min(1e9,this.total+points);this.best=Math.max(this.best,this.total);this.last=kind;this.window=COMBO_WINDOW;
  const event={kind,points,base,clean,variety,multiplier:this.chain,total:this.total};this.j.missions?.recordStyle(event);this.j.emit('styleLanded',event);this.say(name+' +'+points+(clean?' · чисто':'')+' · ×'+this.chain);return points;
 }
 awardGrind(kind,clean){return GRIND_BASE[kind]?this.award(kind,GRIND_BASE[kind],clean):0;}

 snapshot(){return{total:this.total,best:this.best,selected:this.selected};}
}
