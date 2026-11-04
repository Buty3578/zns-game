import{PARK_RAMPS}from'./district.mjs';
// The four original two-sided ramps share the mesh's triangular cross section.
export const RAMPS=[{x:25,z:15,w:3.2,d:5,h:.8},{x:-25,z:28,w:3.1,d:4,h:.65},...PARK_RAMPS].map((r,i)=>({...r,id:'district-ramp-'+i}));
export function legacyRampSample(x,z){for(const r of RAMPS)if(Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2){const side=z>=r.z?1:-1,slope=(r.h-.17)*2/r.d;return{height:.17+(r.h-.17)*(1-Math.abs(z-r.z)*2/r.d),slopeX:0,slopeZ:-side*slope,ramp:r.id};}return{height:0,slopeX:0,slopeZ:0,ramp:null};}
