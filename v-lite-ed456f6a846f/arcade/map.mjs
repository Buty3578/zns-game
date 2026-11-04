import{METRO_ENTRANCES,METRO_STATIONS,METRO_Z}from'./metro.mjs';
import{URBAN_BUILDINGS}from'./urban-infill.mjs';
import{STREET_SPOTS}from'./street-skate.mjs';
import{CAPITAL_PLACES,CAPITAL_ROADS,CAPITAL_BUILDINGS}from'./capital-districts.mjs';
import{BUILDINGS,COINS,STAGE}from'./world.mjs';
import{BOUNDS,PARK_ROADS,PARK_PLACES}from'./district.mjs';
import{CITY_PLACES,CITY_ROADS,CITY_BUILDINGS,CITY_RAMPS,SKATE_COURSE}from'./new-district.mjs';
import{SKATE_AREA}from'./skate.mjs';
import{MOSCOW_PLACES,MOSCOW_ROADS,MOSCOW_BUILDINGS}from'./moskovsky.mjs';
import{SOL_PLACES,SOL_ROADS,SOL_BUILDINGS,SOL_RAMPS}from'./solntsevo.mjs';
import{POWERS}from'./adventure.mjs';
import{TRAIN_TRACK}from'./district-transit.mjs';
export function drawMap(canvas,world,journey,goal,full=false){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=world.player;
 const {X,Z,scale}=mapProjection(w,h,p,full),dx=w/scale,dz=h/scale;
 c.clearRect(0,0,w,h);c.fillStyle='#88b599';c.fillRect(0,0,w,h);
 c.fillStyle='#bfd8a4';c.fillRect(X(57),Z(-57),58/dx*w,119/dz*h);
 c.fillStyle='#8b9a96';c.fillRect(X(-58),Z(-95),177/dx*w,30/dz*h);c.fillRect(X(-58),Z(70),177/dx*w,25/dz*h);
 c.strokeStyle='#e5e8cf';c.lineWidth=(full?6:5)/dx*w;
 const roads=[...[-25,0,25].map(x=>[[x,-62],[x,46]]),...[40,2,-23,-56].map(z=>[[-35,z],[35,z]]),...PARK_ROADS,...CITY_ROADS];
 for(const[[x,z],[xx,zz]]of roads){c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(xx),Z(zz));c.stroke();}
 c.fillStyle='#b3c894';c.fillRect(X(119),Z(-95),120/dx*w,190/dz*h);
 for(const[[x,z],[xx,zz]]of CITY_ROADS){c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(xx),Z(zz));c.stroke();}
 c.fillStyle='#b9b4c3';c.fillRect(X(239),Z(-95),150/dx*w,190/dz*h);c.strokeStyle='#ece1cf';for(const[[x,z],[xx,zz]]of MOSCOW_ROADS){c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(xx),Z(zz));c.stroke();}c.fillStyle='#d1c59e';c.fillRect(X(389),Z(-95),160/dx*w,190/dz*h);c.strokeStyle='#f5e5b9';for(const[[x,z],[xx,zz]]of SOL_ROADS){c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(xx),Z(zz));c.stroke();}
 c.fillStyle='#8ead88';c.fillRect(X(549),Z(-95),230/dx*w,190/dz*h);c.fillStyle='#c3ad9f';c.fillRect(X(779),Z(-95),270/dx*w,190/dz*h);c.fillStyle='#51869b';c.fillRect(X(549),Z(65),920/dx*w,25/dz*h);c.fillStyle='#b8caa1';c.fillRect(X(1049),Z(-95),220/dx*w,160/dz*h);c.fillStyle='#588a9b';c.fillRect(X(1280),Z(-78),180/dx*w,143/dz*h);c.fillStyle='#c4b8ae';c.fillRect(X(1310),Z(-65),135/dx*w,125/dz*h);c.strokeStyle='#eee5d3';for(const[[x,z],[xx,zz]]of CAPITAL_ROADS){c.beginPath();c.moveTo(X(x),Z(z));c.lineTo(X(xx),Z(zz));c.stroke();}c.strokeStyle='#596c78';for(const z of[TRAIN_TRACK.z-1.1,TRAIN_TRACK.z+1.1]){c.beginPath();c.moveTo(X(TRAIN_TRACK.minX),Z(z));c.lineTo(X(TRAIN_TRACK.maxX),Z(z));c.stroke();}
 c.fillStyle='#597b91';for(const[x,z,bw,,bd]of BUILDINGS)c.fillRect(X(x-bw/2),Z(z-bd/2),bw/dx*w,bd/dz*h);
 for(const b of CITY_BUILDINGS)c.fillRect(X(b.x-b.w/2),Z(b.z-b.d/2),b.w/dx*w,b.d/dz*h);for(const b of MOSCOW_BUILDINGS)c.fillRect(X(b.x-b.w/2),Z(b.z-b.d/2),b.w/dx*w,b.d/dz*h);for(const b of [...CAPITAL_BUILDINGS,...URBAN_BUILDINGS])c.fillRect(X(b.x-b.w/2),Z(b.z-b.d/2),b.w/dx*w,b.d/dz*h);for(const b of SOL_BUILDINGS)c.fillRect(X(b.x-b.w/2),Z(b.z-b.d/2),b.w/dx*w,b.d/dz*h);
 c.fillStyle='#b29cc9';for(const r of [...CITY_RAMPS,...SOL_RAMPS])c.fillRect(X(r.x-r.w/2),Z(r.z-r.d/2),r.w/dx*w,r.d/dz*h);
 const dot=(x,z,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(X(x),Z(z),r,0,Math.PI*2);c.fill();};
 for(const coin of COINS)if(!world.coins.has(coin.id))dot(coin.x,coin.z,full?2:1.5,'#ffe29a');
 for(const place of [...PARK_PLACES,...CITY_PLACES.map(p=>({...p,color:'#bce590'})),...MOSCOW_PLACES.map(p=>({...p,color:'#e7c9f1'})),...SOL_PLACES.map(p=>({...p,color:'#ffe096'})),...CAPITAL_PLACES.map(p=>({...p,color:'#f1cc93'})),...STREET_SPOTS.map(p=>({...p,color:'#bcef8c'}))]){dot(place.x,place.z,full?8:4,place.color);}
 c.strokeStyle='#296d81';c.lineWidth=3;c.beginPath();c.moveTo(X(METRO_STATIONS[0].x),Z(METRO_Z));c.lineTo(X(METRO_STATIONS.at(-1).x),Z(METRO_Z));c.stroke();
 for(const e of METRO_ENTRANCES){dot(e.x,e.z,full?10:5,'#174b60');c.font='bold '+(full?12:8)+'px sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText('М',X(e.x),Z(e.z)+4);if(full){c.strokeStyle='#296d81';c.lineWidth=1;c.beginPath();c.moveTo(X(e.x),Z(e.z));c.lineTo(X(METRO_STATIONS[e.index].x),Z(METRO_Z));c.stroke();}}
 if(journey.metro)dot(journey.metro.x,METRO_Z,full?6:3,'#ffe57a');
 if(full){c.font='bold 9px sans-serif';c.textAlign='center';c.fillStyle='#203850';c.fillText('НОВОПЕРЕДЕЛКИНО',X(65),Z(-83));c.fillText('МОСКОВСКИЙ',X(316),Z(-83));c.fillText('СОЛНЦЕВО',X(469),Z(-83));c.fillText('ВОРОБЬЁВЫ ГОРЫ',X(660),Z(-83));c.fillText('КРАСНАЯ ПЛОЩАДЬ',X(947),Z(-83));c.fillText('ВДНХ',X(1158),Z(-83));c.fillText('ОСТРОВ МЕЧТЫ',X(1380),Z(-83));}
 c.strokeStyle='#aecb74';c.lineWidth=2;c.strokeRect(X(-3.5),Z(16),7/dx*w,24/dz*h);if(full){c.fillStyle='#21394f';c.fillText('Скейт',X(SKATE_AREA.x),Z(SKATE_AREA.z));}
 for(const f of journey.friends)dot(f.x,f.z,full?5:3,POWERS[f.id].color);
 for(const m of journey.monsters)dot(m.x,m.z,full?3.5:2.8,'#b7568e');
 for(const v of journey.vehicles){c.fillStyle='#283f60';c.fillRect(X(v.x)-3,Z(v.z)-3,6,6);}
 if(full){c.font='bold 13px sans-serif';c.textAlign='center';c.fillStyle='#21394f';c.fillText('СЦЕНА',X(STAGE.x),Z(STAGE.z)-10);}
 if(full&&journey.skateChallenge){c.strokeStyle='#f5d58a';c.lineWidth=2;c.beginPath();SKATE_COURSE.forEach((p,i)=>i?c.lineTo(X(p.x),Z(p.z)):c.moveTo(X(p.x),Z(p.z)));c.closePath();c.stroke();}
 if(goal){const gx=Math.max(5,Math.min(w-5,X(goal.x))),gz=Math.max(5,Math.min(h-5,Z(goal.z)));c.strokeStyle='#284a56';c.lineWidth=2;c.fillStyle='#e8ffad';c.beginPath();c.arc(gx,gz,full?7:4,0,Math.PI*2);c.fill();c.stroke();}
 c.save();c.translate(X(p.x),Z(p.z));c.rotate(-p.yaw);c.beginPath();c.moveTo(0,full?-10:-7);c.lineTo(full?-7:-5,full?7:5);c.lineTo(full?7:5,full?7:5);c.closePath();c.strokeStyle='#203f62';c.lineWidth=2;c.fillStyle='#fff';c.fill();c.stroke();c.restore();
}

export function mapProjection(w,h,p,full=false){const bounds=full?{minX:BOUNDS.minX-5,maxX:BOUNDS.maxX+5,minZ:Math.min(BOUNDS.minZ-5,METRO_Z-15),maxZ:BOUNDS.maxZ+5}:{minX:p.x-34,maxX:p.x+34,minZ:p.z-34,maxZ:p.z+34};const dx=bounds.maxX-bounds.minX,dz=bounds.maxZ-bounds.minZ,scale=Math.min(w/dx,h/dz),left=(w-dx*scale)/2,top=(h-dz*scale)/2;return{scale,X:x=>left+(x-bounds.minX)*scale,Z:z=>top+(z-bounds.minZ)*scale};}
