import{METRO_POSTS}from'./metro.mjs';
import{CITY_ROADS,cityBlocked,cityGround}from'./new-district.mjs';
import{MOSCOW_ROADS,moskovskyBlocked,moskovskyGround}from'./moskovsky.mjs';
import{SOL_ROADS,solntsevoBlocked,solntsevoGround}from'./solntsevo.mjs';
import{CAPITAL_ROADS,capitalBlocked,capitalGround}from'./capital-districts.mjs';
import{urbanBlocked}from'./urban-infill.mjs';
import{streetBlocked,streetGround}from'./street-skate.mjs';
export function appendExplorationCoins(coins,blocked){
 const paths=[...CITY_ROADS,...MOSCOW_ROADS,...SOL_ROADS,...CAPITAL_ROADS];
 paths.forEach(([a,b],path)=>{const distance=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.floor(distance/6);
  for(let n=1;n<=steps;n++){const t=n/(steps+1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=Math.max(cityGround(x,z),moskovskyGround(x,z),solntsevoGround(x,z),capitalGround(x,z),streetGround(x,z));
   if(METRO_POSTS.some(b=>Math.abs(x-b.x)<b.w/2+.8&&Math.abs(z-b.z)<b.d/2+.8)||blocked(x,z,.8)||urbanBlocked(x,z,.8)||[cityBlocked,moskovskyBlocked,solntsevoBlocked,capitalBlocked,streetBlocked].some(f=>f(x,z,y,.8))||coins.some(c=>Math.hypot(c.x-x,c.z-z)<2.4))continue;
   // Separate stable ID range leaves every original collectible/save untouched.
   coins.push({id:10000+path*100+n,x,z,y});
  }
 });
}
