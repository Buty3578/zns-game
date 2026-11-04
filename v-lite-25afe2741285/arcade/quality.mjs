export const QUALITY_LEVELS=['low','medium','high'];
export const QUALITY_NAMES={low:'Низкое',medium:'Среднее',high:'Высокое'};
export function qualityPreference(value,legacyLow){
 return ['auto',...QUALITY_LEVELS].includes(value)?value:legacyLow===true?'low':legacyLow===false?'high':'auto';
}
// Only the automatic setting changes during play. One-way changes avoid a visible
// resolution oscillation while the player moves between dense and empty streets.
export class AdaptiveQuality{
 constructor(preference='auto',coarse=false){this.coarse=coarse;this.preference=null;this.level='high';this.previous=0;this.samples=[];this.changedAt=0;this.setPreference(preference);}
 setPreference(preference){preference=qualityPreference(preference);if(this.preference===preference)return false;this.preference=preference;this.level=preference==='auto'?(this.coarse?'medium':'high'):preference;this.samples=[];this.previous=0;this.changedAt=0;return true;}
 sample(now){
  const dt=now-this.previous;this.previous=now;
  if(this.preference!=='auto'||this.level==='low'||dt<=0||dt>1000)return false;
  this.samples.push(Math.min(dt,250));if(this.samples.length>120)this.samples.shift();
  if(this.samples.length<120||now-this.changedAt<12000)return false;
  const mean=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;
  if(mean<(this.level==='high'?25:29))return false;
  this.level=this.level==='high'?'medium':'low';this.changedAt=now;this.samples=[];return true;
 }
}
