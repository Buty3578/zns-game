// Round polygon corners inside the paved junction; cache arc-length samples once.
const cache=new WeakMap();
export function trafficRoute(points,radius=2.6){if(cache.has(points))return cache.get(points);const samples=[];
 for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length],ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,ab*.23,bc*.23),entry=b.map((v,k)=>v+(a[k]-v)*r/ab),exit=b.map((v,k)=>v+(c[k]-v)*r/bc);for(let k=0;k<=8;k++){const t=k/8;samples.push(entry.map((v,j)=>(1-t)**2*v+2*(1-t)*t*b[j]+t*t*exit[j]));}}
 const lengths=samples.map((p,i)=>Math.hypot(p[0]-samples[(i+1)%samples.length][0],p[1]-samples[(i+1)%samples.length][1])),length=lengths.reduce((a,b)=>a+b,0),route={points:samples,lengths,length};cache.set(points,route);return route;
}
export function trafficAt(points,distance){const route=trafficRoute(points);let left=((distance%route.length)+route.length)%route.length;for(let i=0;i<route.points.length;i++){const a=route.points[i],b=route.points[(i+1)%route.points.length],d=route.lengths[i];if(left<=d){const t=d?left/d:0;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,yaw:Math.atan2(a[0]-b[0],a[1]-b[1])};}left-=d;}return{x:points[0][0],z:points[0][1],yaw:0};}
