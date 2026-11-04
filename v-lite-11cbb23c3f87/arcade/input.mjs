// Ignore resting-finger jitter, retaining proportional walking outside the dead zone.
export function stickInput(dx,dz,radius,deadZone=.12){
 const length=Math.hypot(dx,dz);if(radius<=0||length<=radius*deadZone)return{x:0,z:0};
 const magnitude=Math.min(1,(length/radius-deadZone)/(1-deadZone));
 return{x:dx/length*magnitude,z:dz/length*magnitude};
}

// Touch is camera-relative translation. Physical A/D retains the desktop turn scheme.
export function movementInput(touch,keyX,keyZ,yaw,dt,vehicle=false){
 const turning=!vehicle&&Math.abs(keyX)>.06;
 if(turning)yaw-=keyX*dt*2.15;
 let x=(touch.x||0)+(vehicle?keyX:0),z=(touch.z||0)+keyZ;
 const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
 return{x,z,yaw,turning,length:Math.hypot(x,z),facingYaw:turning&&Math.hypot(touch.x||0,touch.z||0)<.05?yaw:undefined};
}
