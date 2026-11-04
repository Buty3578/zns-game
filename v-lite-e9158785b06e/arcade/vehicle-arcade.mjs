import{vehicleKind,DISTRICT_VEHICLES,vehiclePlaces}from'./district-vehicles.mjs';
import{approach,angleDelta}from'./motion.mjs';
// Arcade grip and a finite boost reserve; collisions and floor contact stay in Journey.
export function stepVehicleArcade(v,dt,input){
 const throttle=-(input.z||0),steer=input.x||0,brake=!!input.brake||!!v.dismount,grounded=v.grounded!==false;
 v.nitro=Number.isFinite(v.nitro)?Math.max(0,Math.min(100,v.nitro)):60;
 if(!input.nitro&&v.nitro>=15)v.nitroLocked=false;
 v.drifting=vehicleKind(v)==='car'&&grounded&&brake&&!v.dismount&&Math.abs(steer)>.25&&v.speed>6;
 v.boosting=!!input.nitro&&!v.nitroLocked&&!brake&&grounded&&throttle>.05&&v.speed>3&&v.nitro>0;
 v.nitro=Math.max(0,Math.min(100,v.nitro+dt*(v.boosting?-26:v.drifting?7:3)));
 if(v.nitro===0){v.nitroLocked=true;v.boosting=false;}
 const top=(vehicleKind(v)==='bike'?(input.sprint?22:18):(input.sprint?18:14))+(v.boosting?7:0),accel=(vehicleKind(v)==='bike'?12:10)+(v.boosting?14:0);
 if(v.drifting)v.speed=approach(v.speed,0,.28,dt);else if(brake)v.speed=approach(v.speed,0,9,dt);else if(throttle>.05)v.speed=v.speed>top?approach(v.speed,top,1.1,dt):Math.min(top,v.speed+throttle*accel*dt);else if(throttle<-.05)v.speed=Math.max(-5.5,v.speed+throttle*(v.speed>0?20:7)*dt);else v.speed=approach(v.speed,0,1.5,dt);
 if(Math.abs(v.speed)<.025)v.speed=0;
 v.steer=approach(v.steer||0,steer,9,dt);v.lean=approach(v.lean||0,vehicleKind(v)==='bike'?-v.steer*Math.min(1,Math.abs(v.speed)/8)*.16:0,5,dt);
 v.yaw-=v.steer*(vehicleKind(v)==='bike'?2.25:1.95)*(v.drifting?1.3:1)*Math.min(1,Math.abs(v.speed)/3)*(v.speed>=0?1:-1)*dt;
 if(!Number.isFinite(v.travelYaw)||Math.abs(v.speed)<1||!v.drifting&&!v.slipping)v.travelYaw=v.yaw;
 else v.travelYaw+=angleDelta(v.travelYaw,v.yaw)*(1-Math.exp(-dt*(v.drifting?2.6:10)));
 v.slipping=v.drifting||Math.abs(angleDelta(v.travelYaw,v.yaw))>.012;
 return{dx:-Math.sin(v.travelYaw)*v.speed*dt,dz:-Math.cos(v.travelYaw)*v.speed*dt};
}
