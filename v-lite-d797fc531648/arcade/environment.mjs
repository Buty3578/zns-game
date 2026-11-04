// World time is simulation time: menus, battles and pause do not advance it.
export const DAY_SECONDS=600;
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const PALETTE=[
 {at:0,sky:[.39,.48,.66],fog:[.45,.52,.66],ambient:[.45,.51,.64],sun:[.92,.69,.49]},
 {at:.1,sky:[.7,.78,.83],fog:[.68,.74,.76],ambient:[.58,.64,.68],sun:[1,.82,.61]},
 {at:.25,sky:[.57,.8,.91],fog:[.57,.77,.83],ambient:[.67,.73,.76],sun:[1,.91,.74]},
 {at:.43,sky:[.65,.78,.85],fog:[.68,.73,.73],ambient:[.59,.64,.69],sun:[1,.79,.53]},
 {at:.54,sky:[.72,.37,.31],fog:[.62,.39,.43],ambient:[.43,.39,.51],sun:[1,.49,.29]},
 {at:.64,sky:[.10,.15,.30],fog:[.13,.18,.31],ambient:[.23,.30,.46],sun:[.22,.31,.51]},
 {at:.83,sky:[.06,.10,.23],fog:[.10,.14,.27],ambient:[.19,.26,.42],sun:[.16,.24,.43]},
 {at:1,sky:[.39,.48,.66],fog:[.45,.52,.66],ambient:[.45,.51,.64],sun:[.92,.69,.49]}
];
const WEATHER=[['CLEAR',145],['CLOUDY',130],['RAIN',120],['FOG',105],['SNOW',70],['SUNSET',30]];
export const WEATHER_LABELS={CLEAR:'Солнечно',SNOW:'Снег',CLOUDY:'Облачно',RAIN:'Дождь',FOG:'Туман',SUNSET:'Тёплый свет'};
function timePalette(phase){for(let i=0;i<PALETTE.length-1;i++){const a=PALETTE[i],b=PALETTE[i+1];if(phase<=b.at){const t=smooth((phase-a.at)/(b.at-a.at));return Object.fromEntries(['sky','fog','ambient','sun'].map(k=>[k,mix(a[k],b[k],t)]));}}return PALETTE.at(-1);}
function weatherAt(seconds){let at=((seconds%DAY_SECONDS)+DAY_SECONDS)%DAY_SECONDS;for(let i=0;i<WEATHER.length;i++){const [kind,length]=WEATHER[i];if(at<length){const blend=smooth((at-(length-18))/18),next=WEATHER[(i+1)%WEATHER.length][0];return{kind,next,blend};}at-=length;}return{kind:'CLEAR',next:'CLEAR',blend:0};}
function weights(w){const values={CLEAR:{cloud:0,rain:0,fog:0},CLOUDY:{cloud:.65,rain:0,fog:.07},RAIN:{cloud:.9,rain:1,fog:.16},FOG:{cloud:.55,rain:0,fog:.72},SUNSET:{cloud:.18,rain:0,fog:0}};values.SNOW={cloud:.65,rain:0,fog:.35};for(const [kind,value]of Object.entries(values))value.snow=kind==='SNOW'?1:0;const a=values[w.kind],b=values[w.next];return Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(b[k]-a[k])*w.blend]));}
export class CityEnvironment{
 constructor(data={}){this.elapsed=Number.isFinite(data.elapsed)?clamp(data.elapsed,0,1e9):0;this.wetness=Number.isFinite(data.wetness)?clamp(data.wetness):0;}
 update(dt){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);this.elapsed+=dt;const {rain}=weights(weatherAt(this.elapsed));this.wetness=clamp(this.wetness+(rain>.15?rain*dt/25:-dt/125));}
 get state(){const phase=((this.elapsed/DAY_SECONDS+.22)%1+1)%1,p=timePalette(phase),w=weatherAt(this.elapsed),{cloud,rain,fog,snow}=weights(w),night=smooth((.25-Math.sin(phase*TAU))*1.25),sunAngle=phase*TAU;
  const sky=mix(p.sky,[.25,.31,.39],cloud*.38+fog*.25),fogColor=mix(p.fog,[.27,.32,.36],cloud*.32+fog*.35),ambient=p.ambient.map(v=>v*(1-cloud*.24-rain*.1));
  const period=phase<.12?'Утро':phase<.44?'День':phase<.58?'Закат':phase<.88?'Ночь':'Рассвет';
  return{elapsed:this.elapsed,phase,period,snow,weather:w.kind,weatherLabel:WEATHER_LABELS[w.kind],sky,fogColor,ambient,sunColor:p.sun,sunDirection:[Math.cos(sunAngle)*.52,Math.max(.12,Math.abs(Math.sin(sunAngle))*.88),Math.sin(sunAngle)*.52],sunStrength:(1-night*.72)*(1-cloud*.45-rain*.13),night,cloud,rain,fog,wetness:this.wetness,fogNear:Math.max(28,65-fog*22-rain*8),fogFar:Math.max(90,180-fog*65-rain*20)};
 }
 snapshot(){return{elapsed:this.elapsed,wetness:this.wetness};}
}
