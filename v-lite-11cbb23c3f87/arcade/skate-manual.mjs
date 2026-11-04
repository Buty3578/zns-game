// Arcade two-wheel balance. Points remain in escrow until both wheels return safely.
export class SkateManual{
 constructor(style){this.style=style;this.active=null;this.armed=0;this.finishRequested=false;}
 reset(){this.active=null;this.armed=0;this.finishRequested=false;const v=this.style.j.vehicle;if(v?.id==='skate'){v.manual=false;v.manualBalance=0;}}
 request(){const j=this.style.j,v=j.vehicle;if(!j.skating||v.bail||v.dismount||j.grind?.active)return false;
  if(this.active){this.finishRequested=true;return true;}
  if(!v.grounded){this.armed=1.5;this.style.say('Manual подготовлен · приземлись на ровный участок');return true;}
  if(v.speed<3||Math.abs(v.pitch)>.08||Math.abs(v.slopeRoll||0)>.08){this.style.say('Manual: разгонись до 11 км/ч на ровном участке');return false;}
  return this.begin(v,[]);
 }
 begin(v,receipts){if(v.speed<3||Math.abs(v.pitch)>.08||Math.abs(v.slopeRoll||0)>.08){this.armed=0;return false;}
  this.armed=0;this.finishRequested=false;this.active={board:v,time:0,distance:0,balance:.05,receipts};v.manual=true;v.push=0;this.style.say('Manual · ← → баланс · N / TRICK завершить');return true;
 }
 update(v,dt,result,before,input){this.armed=Math.max(0,this.armed-dt);const a=this.active;if(!a)return false;
  a.time+=dt;a.distance+=Math.hypot(v.x-before.x,v.z-before.z);
  a.balance+=dt*(.16+.32*a.balance+Math.sin(a.time*2)*.07+(input.x||0)*.7);v.manualBalance=a.balance;v.push=0;
  if(result.collision||v.bail||v.dismount||!v.grounded||v.speed<2||Math.abs(a.balance)>1||Math.abs(v.pitch)>.12||Math.abs(v.slopeRoll||0)>.12){this.style.abort('Manual сорван — очки связки потеряны');v.bail=.45;v.speed*=.6;return true;}
  if(this.finishRequested||a.time>=6){const good=a.time>=1.2&&a.distance>=5,receipts=a.receipts;this.reset();
   if(good){receipts.push({kind:'manual',name:'Manual',points:150});this.style.settle(receipts,true,true);}
   else this.style.abort('Короткий Manual — без очков');
  }
  return true;
 }
}
