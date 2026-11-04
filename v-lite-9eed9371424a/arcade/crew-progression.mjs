// Optional crew route. It does not alter the main story or lock existing districts.
export const CREW_TRAINER={x:8,z:-49};
export const CREWS=Object.freeze({
 school:{name:'Заметь наш стиль',leader:'Тренер школы',color:'#b9ff7a',favorite:['bounce','two-step','running-man'],difficulty:1,required:900},
 moskovsky:{name:'Команда Московского',leader:'Лидер площади',color:'#aa9aef',favorite:['running-man','two-step','cabbage-patch'],difficulty:2,required:900},
 solntsevo:{name:'Команда Солнцево',leader:'Лидер уличной сцены',color:'#f7ac87',favorite:['reebok','roger-rabbit','biz-markie'],difficulty:3,required:1100}
});
export const CREW_ROUTE=[
 {stage:'train',x:CREW_TRAINER.x,z:CREW_TRAINER.z,label:'Выучи движение в «Заметь наш стиль»',hint:'Подойди к тренеру у школы и нажми L.'},
 {stage:'ride',x:262,z:48,label:'Доедь на скейте до Московского',hint:'Достань скейт (B), затем следуй на восток. Дорога связана с районом.'},
 {stage:'grind',x:298,z:19,label:'Выполни 3 гринда в Московском',hint:'Разгонись, прыгни на перила и приземлись чисто. Учитываются только законченные скольжения.'},
 {stage:'battle',x:326,z:36,label:'Вызови команду Московского',hint:'Подойди пешком или на скейте и нажми G. Во время своего хода выбирай разные движения.'},
 {stage:'return',x:4,z:-57,label:'Вернись в «Заметь наш стиль»',hint:'После победы возвращайся к сцене школы. Награда ждёт там.'}
];
const validStage=new Set(['idle','train','ride','grind','battle','return','complete']);
const safeNumber=(n,max=1e7)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
export class CrewProgress{
 constructor(data={}){this.street=safeNumber(data.street);this.dance=safeNumber(data.dance);this.visited=new Set(Array.isArray(data.visited)?data.visited.filter(x=>['moskovsky','solntsevo'].includes(x)):[]);this.won=new Set(Array.isArray(data.won)?data.won.filter(x=>['moskovsky','solntsevo'].includes(x)):[]);this.awards=new Set(Array.isArray(data.awards)?data.awards.filter(x=>x==='skate-ring'):[]);this.trained=data.trained===true;this.styleLevel=safeNumber(data.styleLevel,1000);this.stage=validStage.has(data.stage)?data.stage:'idle';this.grinds=safeNumber(data.grinds,3);this.routeWins=safeNumber(data.routeWins,1000);}
 get running(){return !['idle','complete'].includes(this.stage);}
 get objective(){const item=CREW_ROUTE.find(x=>x.stage===this.stage);return item?{...item,type:'crew',label:item.stage==='grind'?`Выполни гринды · ${this.grinds} / 3`:item.label}:null;}
 start(){if(this.running)return false;this.stage='train';this.grinds=0;return true;}
 cancel(){if(!this.running)return false;this.stage='idle';this.grinds=0;return true;}
 train(){if(this.stage!=='train')return false;this.stage='ride';if(!this.trained){this.dance+=10;this.trained=true;}return true;}
 visit(id){if(!['moskovsky','solntsevo'].includes(id)||this.visited.has(id))return false;this.visited.add(id);this.street+=20;return true;}
 award(id,points){if(this.awards.has(id)||!Number.isFinite(points)||points<=0)return false;this.awards.add(id);this.street+=Math.floor(points);return true;}
 style(total){const level=Math.min(1000,Math.floor(safeNumber(total)/1000));if(level<=this.styleLevel)return false;this.street+=(level-this.styleLevel)*4;this.styleLevel=level;return true;}
 update(player,skating){if(this.stage==='ride'&&skating&&player.x>=255&&player.x<390){this.stage='grind';return 'Московский достигнут! Сделай три чистых гринда.';}if(this.stage==='return'&&Math.hypot(player.x-4,player.z+57)<9){this.stage='complete';if(this.routeWins===0){this.street+=30;this.dance+=30;}this.routeWins++;return 'Маршрут команды пройден! Улица и школа признают твой стиль.';}return null;}
 grind(x,points){if(points<=0)return false;this.street+=Math.min(8,Math.max(1,Math.floor(points/100)));if(this.stage!=='grind'||x<250||x>390)return false;this.grinds=Math.min(3,this.grinds+1);if(this.grinds===3)this.stage='battle';return true;}
 battle(id,score){if(!['moskovsky','solntsevo'].includes(id)||score<=0)return false;const first=!this.won.has(id);this.won.add(id);if(first)this.dance+=40;if(this.stage==='battle'&&id==='moskovsky'){this.stage='return';return true;}return first;}
 snapshot(){return{street:this.street,dance:this.dance,visited:[...this.visited],won:[...this.won],awards:[...this.awards],trained:this.trained,styleLevel:this.styleLevel,stage:this.stage,grinds:this.grinds,routeWins:this.routeWins};}
}
