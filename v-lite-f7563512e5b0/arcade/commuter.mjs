export const COMMUTER_STOPS=[{x:401,z:-78,name:'Солнцево · Западная'},{x:484,z:-78,name:'Солнцево · Центральная'},{x:537,z:-78,name:'Солнцево · Восточная'}];
// One timetable for rendering, boarding and riding. Stop for six seconds at each platform.
const order=[0,1,2,1,0],legs=order.slice(1).map((stop,i)=>({from:order[i],to:stop,travel:Math.abs(COMMUTER_STOPS[stop].x-COMMUTER_STOPS[order[i]].x)/10}));
export const COMMUTER_PERIOD=legs.reduce((n,l)=>n+6+l.travel,0);
export function commuterAtTime(time){let t=((time%COMMUTER_PERIOD)+COMMUTER_PERIOD)%COMMUTER_PERIOD;for(const l of legs){const a=COMMUTER_STOPS[l.from],b=COMMUTER_STOPS[l.to],direction=Math.sign(b.x-a.x);if(t<6)return{x:a.x,z:-86,stop:l.from,doors:t>1&&t<5,speed:0,direction};t-=6;if(t<l.travel)return{x:a.x+direction*t*10,z:-86,stop:l.from,doors:false,speed:10,direction};t-=l.travel;}return{x:401,z:-86,stop:0,doors:false,speed:0,direction:1};}
export function commuterEntrance(p){return p.grounded&&p.y<.5?COMMUTER_STOPS.findIndex(s=>Math.abs(p.x-s.x)<10&&p.z>=-81&&p.z<=-74):-1;}
