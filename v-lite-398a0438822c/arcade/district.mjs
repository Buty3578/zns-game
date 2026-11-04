// The old neighbourhood stays intact; two passages lead into the new park.
export const BOUNDS={minX:-58,maxX:1469,minZ:-95,maxZ:95};
export const NEW_BUILDINGS=[[112,-37,10,14,16],[112,-17,10,11,12],[114,8,7,16,15],[115,33,6,10,16],[94,66,17,12,7],[73,66,13,15,7],[59,-53,12,18,12]];
export const PARK_ROADS=[[[25,-9],[104,-9]],[[25,18],[104,18]],[[70,-48],[70,58]],[[104,-48],[104,58]],[[70,-48],[104,-48]],[[70,58],[104,58]]];
export const PARK_RAMPS=[{x:104,z:32,w:3.4,d:6,h:1},{x:70,z:38,w:3.4,d:5,h:.8}];
export const PARK_PLACES=[
 {id:'hunt',x:79,z:9,name:'Парк золотых нот',short:'Парк',hint:'Восемь золотых нот за 60 секунд. Берегись Пружиков!',limit:60,color:'#ffd16d'},
 {id:'ride',x:104,z:46,name:'Большой веломаршрут',short:'Велотрасса',hint:'Приедь на транспорте. Десять колец, два трамплина и 80 секунд.',limit:80,color:'#8edaf2'},
 {id:'dance',x:87,z:-32,name:'Площадь флешмобов',short:'Флешмоб',hint:'Дойди до трёх цветных кругов и станцуй в каждом: ♫ или R.',limit:50,color:'#d1a7ff'}
];
export const HUNT_NOTES=[{x:78,z:6},{x:83,z:2},{x:89,z:4},{x:96,z:9},{x:96,z:24},{x:89,z:29},{x:82,z:26},{x:77,z:22}];
export const PARK_COURSE=[{x:104,z:36},{x:104,z:22},{x:104,z:-2},{x:88,z:-9},{x:70,z:-9},{x:70,z:18},{x:70,z:42},{x:86,z:58},{x:104,z:58},{x:104,z:46}];
export const DANCE_SPOTS=[{x:81,z:-34},{x:88,z:-41},{x:97,z:-34}];
export const PARK_COIN_PATHS=[[[28,-9],[69,-9]],[[28,18],[69,18]],[[70,-46],[70,-12]],[[70,23],[70,56],[100,58]],[[104,41],[104,-43]],[[76,-31],[88,-39],[98,-31]]];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export class ParkAdventures{
 constructor(journey,data={}){this.j=journey;this.active=null;this.wins=new Set((data.wins||[]).filter(x=>PARK_PLACES.some(p=>p.id===x)));this.best=data.best||{};this.visited=new Set(data.visited||[]);}
 get place(){return this.active&&PARK_PLACES.find(p=>p.id===this.active.id);}
 get objective(){const a=this.active;if(!a)return null;const place=this.place,p=this.j.world.player;let target;
  if(a.id==='hunt')target=HUNT_NOTES.filter((_,i)=>!a.picked.has(i)).sort((x,y)=>dist(x,p)-dist(y,p))[0];
  else target=(a.id==='ride'?PARK_COURSE:DANCE_SPOTS)[a.index];
  return{...(target||place),type:'park',label:a.id==='hunt'?`Золотые ноты: ${a.picked.size} / 8`:a.id==='ride'?`Веломаршрут: ${a.index} / 10`:`Флешмоб: ${a.index} / 3`,hint:place.hint};
 }
 get interaction(){if(this.active||this.j.race||this.j.chase)return null;const p=this.j.world.player,place=PARK_PLACES.find(x=>dist(x,p)<3.6);if(!place)return null;
  if(place.id==='ride'&&(!this.j.vehicle||this.j.skating))return{type:'parkHint',id:place.id,label:'Нужен транспорт',key:'E'};
  if(place.id!=='ride'&&this.j.vehicle)return null;
  return{type:'parkStart',id:place.id,label:this.wins.has(place.id)?'Повторить испытание':'Начать: '+place.short,key:'E'};
 }
 start(id){const place=PARK_PLACES.find(p=>p.id===id);if(!place||this.j.story?.running||this.j.crew?.running||this.j.missions?.running||this.j.skateChallenge||this.j.artifactQuest?.running||this.j.race||this.j.chase)return false;if(id==='ride'&&(!this.j.vehicle||this.j.skating))return false;if(id!=='ride'&&this.j.vehicle)return false;
  this.active={id,index:0,time:0,hits:0,picked:new Set()};this.j.eventTimer=35;this.j.emit('parkStart',{id,message:place.hint});return true;
 }
 cancel(){if(!this.active)return;this.active=null;this.j.emit('hint',{message:'Испытание остановлено. Награды сохранены.'});}
 fail(){const id=this.active.id;this.active=null;this.j.emit('parkFail',{id,message:'Попробуй ещё раз у стартового круга. Все награды сохранены.'});}
 bump(){if(this.active?.id==='hunt'&&++this.active.hits>=3)this.fail();}
 dance(){const a=this.active;if(a?.id!=='dance'||dist(this.j.world.player,DANCE_SPOTS[a.index])>3)return;this.checkpoint(DANCE_SPOTS[a.index]);if(a.index===3)this.finish();}
 checkpoint(at){this.active.index++;this.j.score+=50;this.j.sparkle(at.x,1,at.z,'#e7baff',10);this.j.emit('checkpoint',{index:this.active.index});}
 finish(){const a=this.active,place=this.place,first=!this.wins.has(a.id);this.wins.add(a.id);this.best[a.id]=Math.min(this.best[a.id]??Infinity,a.time);this.j.score+=first?600:200;this.j.bonusCoins+=first?10:3;this.j.award({hunt:'Слухач золотых нот',ride:'Большой маршрут',dance:'Весь парк танцует'}[a.id],150);this.active=null;this.j.emit('parkWin',{id:a.id,message:place.name+' пройден! +'+(first?10:3)+' монет. Новая награда — в журнале.'});}
 update(dt){const p=this.j.world.player;
  if(p.x>62&&!this.visited.has('park')){this.visited.add('park');this.j.emit('hint',{message:'Новый район! Открой карту: парк, велотрасса и площадь флешмобов.'});}
  const a=this.active;if(!a)return;a.time+=dt;
  if(a.id==='hunt'){for(let i=0;i<HUNT_NOTES.length;i++)if(!a.picked.has(i)&&dist(p,HUNT_NOTES[i])<1.7&&p.y<2.5){a.picked.add(i);this.j.score+=40;this.j.emit('bonusCoin');}if(a.picked.size===8){this.finish();return;}}
  if(a.id==='ride'&&this.j.vehicle&&!this.j.skating&&dist(p,PARK_COURSE[a.index])<3.6){this.checkpoint(PARK_COURSE[a.index]);if(a.index===PARK_COURSE.length){this.finish();return;}}
  if(a.time>this.place.limit)this.fail();
 }
 snapshot(){return{wins:[...this.wins],best:this.best,visited:[...this.visited]};}
}
