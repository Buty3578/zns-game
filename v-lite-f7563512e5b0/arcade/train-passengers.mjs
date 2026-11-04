// Original low-poly seated poses: bent hips/knees, feet on floor, hands on lap.
export function seatedPassenger(b,{x=0,z=.86,color='#b4c8a0',skin='#c79576',hero=false}={}){const side=z>0?-1:1;
 b.box([x,1.25,z],[.42,.57,.28],color);b.sphere([x,1.76,z],.19,skin);b.box([x,1.94,z],[.4,.08,.34],hero?'#37414c':'#4e535c');
 for(const k of[-1,1]){const hip=[x+k*.12,.95,z],knee=[x+k*.14,.9,z+side*.39],foot=[x+k*.14,.66,z+side*.42];b.limb(hip,knee,.1,'#405268');b.limb(knee,foot,.085,'#405268');b.box([foot[0],.62,foot[2]+side*.08],[.2,.18,.32],'#ece6d4');b.limb([x+k*.25,1.48,z],[x+k*.3,1.13,z+side*.17],.065,color);b.limb([x+k*.3,1.13,z+side*.17],[x+k*.16,1.05,z+side*.28],.06,skin);}}
export function trainPassengers(b,low=false){for(const x of low?[-2.2,2.2]:[-2.2,2.2])for(const side of[-1,1])seatedPassenger(b,{x,z:side*.88,color:x<0?'#bc94b3':'#8eafa6'});}
export function exitingPassengers(b,{x,z,y,progress}){if(progress<=0||progress>=1)return;for(const dx of[-8,8]){const zz=z+progress*6;b.box([x+dx,y+1.1,zz],[.4,.6,.28],'#a4b5a6');b.sphere([x+dx,y+1.65,zz],.18,'#c79576');for(const k of[-1,1])b.limb([x+dx+k*.12,y+.8,zz],[x+dx+k*.14,y+.1,zz+k*Math.sin(progress*18)*.15],.09,'#405268');}}
