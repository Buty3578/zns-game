import{OLD_BOUNDS}from'./new-district.mjs';
import{Batch}from'./engine.mjs';
import{initMotion,stepMotion}from'./motion.mjs';
import{districtDetail,detailedCharacter}from'./detail.mjs';
import{surfaceAt,platformBlocked}from'./systems.mjs';
import{BOUNDS,NEW_BUILDINGS,PARK_COIN_PATHS}from'./district.mjs';
export const SCHOOL_URL='https://znsdance.ru/?utm_source=zns_game&utm_medium=game&utm_campaign=novoperedelkino';
export const RIVALS=[{x:-25,z:18,name:'Дворовый чемпион',track:'Уличный напор · Boom Bap',coins:8,color:'#bd9cf3'},{x:25,z:-10,name:'Король джема',track:'Движение квартала · Hip-Hop',coins:18,color:'#f3ac64'},{x:-24,z:-39,name:'Мастер района',track:'Район на битах · Hip-Hop',coins:30,color:'#a2d8d2'}];
export const STAGE={x:4,z:-57};
export const BUILDINGS=[[-47,30,16,18,17],[-48,3,17,25,20],[-47,-24,18,30,18],[-44,-53,14,21,14],[45,34,17,23,19],[48,4,16,28,17],[49,-24,18,19,18],[43,-51,16,27,16],[-16,52,17,15,14],[18,53,17,23,14],[-12,-13,12,17,11],[14,19,11,13,10],[-8,-43,10,11,9],[20,-34,10,13,10]];
const PARKS=[[-25,34],[28,6],[-28,-12],[11,-48],[31,-49],[-32,-53],[-33,4],[32,37],[-34,-27],[32,-25],[-11,36],[14,38],[1,-21],[-3,8],[34,17]];
BUILDINGS.push(...NEW_BUILDINGS);
export const COLLIDERS=BUILDINGS.map(([x,z,w,h,d])=>({x,z,w:w+.6,d:d+.6}));
export const COINS=[];
const paths=[[[0,40],[-14,40],[-25,32],[-25,18]],[[-25,18],[-25,2],[0,2],[25,2],[25,-10]],[[25,-10],[25,-23],[0,-23],[-25,-23],[-25,-39]],[[-25,-39],[-25,-51],[-15,-56],[4,-57]]];
for(const path of [...paths,...PARK_COIN_PATHS])for(let i=1;i<path.length;i++){const[a,b]=[path[i-1],path[i]],length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.floor(length/3);for(let j=1;j<=steps;j++){const x=a[0]+(b[0]-a[0])*j/(steps+1),z=a[1]+(b[1]-a[1])*j/(steps+1);if(!COINS.some(c=>Math.hypot(c.x-x,c.z-z)<1.7))COINS.push({id:COINS.length,x,z});}}
export function blocked(x,z,r=.55){return (x<OLD_BOUNDS.maxX&&(z<OLD_BOUNDS.minZ||z>OLD_BOUNDS.maxZ))||x<BOUNDS.minX||x>BOUNDS.maxX||z<BOUNDS.minZ||z>BOUNDS.maxZ||COLLIDERS.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);}
export function movePlayer(player,dx,dz){if(!blocked(player.x+dx,player.z)&&!platformBlocked(player.x+dx,player.z,player.y))player.x+=dx;if(!blocked(player.x,player.z+dz)&&!platformBlocked(player.x,player.z+dz,player.y))player.z+=dz;}
export function staticWorld(){const b=new Batch();b.box([30.5,-.4,2.5],[197,.7,155],'#93bd87');b.box([0,-.015,-8],[72,.12,129],'#d6d5bb');
 for(const x of[-25,0,25]){b.box([x,.06,-7],[8,.13,114],'#718994');for(let z=-60;z<46;z+=7)b.box([x,.14,z],[.12,.02,2.5],'#b5bbaa');b.box([x-4.4,.12,-7],[.7,.22,114],'#e4dfc6');b.box([x+4.4,.12,-7],[.7,.22,114],'#e4dfc6');}
 for(const z of[40,2,-23,-56]){b.box([0,.075,z],[70,.14,7],'#718994');for(let x=-33;x<35;x+=8)b.box([x,.16,z],[2.5,.02,.12],'#bfc2b1');}
 for(let i=0;i<BUILDINGS.length;i++){const[x,z,w,h,d]=BUILDINGS[i],col=['#efc896','#a3cdd4','#e6b9b9','#b8bde3'][i%4];b.box([x,h/2,z],[w,h,d],col);b.box([x,h+.25,z],[w+.5,.5,d+.5],'#666f70');b.box([x,h*.12,z],[w+.15,h*.2,d+.15],'#7e9fb1');
  const floors=Math.floor(h/3),cols=Math.floor(w/2.7);for(let floor=1;floor<floors;floor++)for(let k=0;k<cols;k++){const xx=x-w/2+1.6+k*(w-2)/cols,yy=floor*3+.5,col=(floor+k+i)%4===0?'#e7cca2':'#4d8298';for(const side of[-1,1]){const zz=z+side*(d/2+.015);b.quad([xx-.65,yy-.9,zz],[xx+.65,yy-.9,zz],[xx+.65,yy+.9,zz],[xx-.65,yy+.9,zz],col);}}
  for(let floor=1;floor<floors;floor++)for(const side of[-1,1]){const xx=x+side*(w/2+.015);for(let k=-1;k<=1;k++){const zz=z+k*d*.25,yy=floor*3+.5;b.quad([xx,yy-.9,zz-.6],[xx,yy+.9,zz-.6],[xx,yy+.9,zz+.6],[xx,yy-.9,zz+.6],'#6a9faf');}}
 }
 for(const[x,z]of PARKS){b.cylinder([x,1.2,z],.2,2.4,'#6e6954',6);b.sphere([x,3,z],1.8,'#5aab7b');b.sphere([x+.35,4,z],1.3,'#9cca6c');b.cylinder([x,.08,z],1.65,.15,'#96bc82',10);}
 for(let z=-50;z<=40;z+=18)for(const x of[-31,31]){b.cylinder([x,2.4,z],.08,4.8,'#546467',6);b.box([x+.65,4.85,z],[1.5,.16,.25],'#4c585e');b.box([x+1.2,4.71,z],[.5,.12,.35],'#eee3bd');}
 for(const z of[26,-9,-43])for(const x of[-5.4,5.4]){b.cylinder([x,2.4,z],.075,4.8,'#546467',6);b.box([x,4.82,z],[.55,.16,.4],'#4c585e');b.box([x,4.72,z],[.38,.12,.35],'#eee3bd');}
 for(let i=0;i<3;i++){const r=RIVALS[i];b.cylinder([r.x,.18,r.z],4.6,.18,'#343c4a',32);b.cylinder([r.x,.28,r.z],3.95,.06,r.color,32);b.cylinder([r.x,.32,r.z],3.7,.07,'#4b525e',32);for(const s of[-1,1]){b.box([r.x+s*3.5,.9,r.z-2],[.75,1.5,.75],'#252d39');b.cylinder([r.x+s*3.5,1.7,r.z-2],.15,.08,r.color,8);}}
 // Playground and recognisable neighbourhood details.
 b.box([-13,.16,27],[8,.2,9],'#718b8e');for(const x of[-16,-10]){b.cylinder([x,1.5,27],.08,3,'#f2ad7b',6);}b.limb([-16,3,27],[-10,3,27],.09,'#f2ad7b');for(const x of[-14,-12]){b.limb([x,2.9,27],[x,1,27],.025,'#606767');b.box([x,.95,27],[.8,.1,.7],'#baa9d3');}
 for(const[x,z]of[[-32,20],[32,-9],[-32,-39],[8,33]]){b.box([x,.6,z],[2,.16,.65],'#b5987b');b.box([x,1,z+.25],[2,.55,.13],'#ae8a6c');b.box([x-.7,.3,z],[.12,.6,.5],'#4d6563');b.box([x+.7,.3,z],[.12,.6,.5],'#4d6563');}
 b.cylinder([-30,1.5,34],.08,3,'#586a70',6);b.box([-30,2.85,34],[3,.6,.12],'#344c54');
 b.box([32,1.5,27],[4,3,4],'#798689');b.box([32,3.12,27],[4.6,.24,4.6],'#b7a6d7');b.box([32,1.5,24.96],[3,2.2,.1],'#435260');
 // Finish: real school represented by a small neighbourhood stage.
 b.box([4,.35,-58],[19,.7,10],'#454559');b.box([4,.12,-51.8],[14,.25,2.5],'#767c85');b.box([4,3.3,-62],[19,6,.5],'#292e42');for(const x of[-5,13]){b.box([x,3,-58],[.32,6,.32],'#b9ff4d');}b.box([4,6,-58],[18,.28,.28],'#b9ff4d');for(let i=0;i<7;i++)b.box([-3.5+i*2.5,2.8,-61.6],[1.65,4.5,.12],i%2?'#76609c':'#728b67');for(const x of[-4,12]){b.box([x,1.5,-60],[1.5,2.2,1.1],'#242c36');}
 districtDetail(b,BUILDINGS);return b;}
export const character=detailedCharacter;
export class Adventure{
 constructor(data={}){this.player=initMotion({x:0,z:40,y:0,vy:0,yaw:0});const pos=data.position;if(pos&&[pos.x,pos.z,pos.yaw].every(Number.isFinite)&&!blocked(pos.x,pos.z))Object.assign(this.player,{x:pos.x,z:pos.z,yaw:pos.yaw});this.coins=new Set((data.coins||[]).filter(id=>COINS.some(c=>c.id===id)));this.won=new Set((data.won||[]).filter(i=>i>=0&&i<3));this.finished=!!data.finished;this.steps=0;this.elapsed=Number(data.elapsed)||0;}
 get count(){return this.coins.size;}
 update(dt,dx,dz,facingYaw){const p=this.player;this.lastMotion=stepMotion(p,dt,dx,dz,{facingYaw,solid:this.isBlocked||((x,z,y)=>blocked(x,z)||platformBlocked(x,z,y)),ground:this.groundAt||surfaceAt,jumpSpeed:this.jumpSpeed||7.6});this.steps+=this.lastMotion.travelled;this.elapsed+=dt;return this.collect();}
 collect(){const picked=[];for(const c of COINS)if(!this.coins.has(c.id)&&Math.hypot(c.x-this.player.x,c.z-this.player.z)<1.45&&this.player.y<2.5){this.coins.add(c.id);picked.push(c);}return picked;}
 jump(){this.player.jumpBuffer=.18;}
 get nextRival(){return[0,1,2].find(i=>!this.won.has(i));}
 get objective(){const i=this.nextRival;if(i===undefined)return{...STAGE,type:'finish',label:'Выход на сцену Заметь наш стиль'};const r=RIVALS[i];if(this.count<r.coins){let near=null,d=Infinity;for(const c of COINS)if(!this.coins.has(c.id)){const dist=Math.hypot(c.x-this.player.x,c.z-this.player.z);if(dist<d){d=dist;near=c;}}return{...near,type:'coin',label:`Собери монеты: ${this.count} / ${r.coins}`};}return{...r,type:'rival',index:i,label:`Баттл: ${r.name}`};}
 get interaction(){const p=this.player,i=this.nextRival;if(i===undefined)return Math.hypot(p.x-STAGE.x,p.z-STAGE.z)<6?{type:'finish',label:'На сцену'}:null;const r=RIVALS[i];if(Math.hypot(p.x-r.x,p.z-r.z)<5.5)return{type:'rival',index:i,locked:this.count<r.coins,label:this.count<r.coins?`Нужно ${r.coins} монет`:'Начать баттл'};return null;}
 snapshot(){return{position:{x:this.player.x,z:this.player.z,yaw:this.player.yaw},coins:[...this.coins],won:[...this.won],finished:this.finished,elapsed:this.elapsed};}
}
