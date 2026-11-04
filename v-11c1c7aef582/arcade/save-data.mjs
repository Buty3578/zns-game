import{STREET_JAMS}from'./street-events.mjs';
import{capitalContractSave}from'./capital-contracts.mjs';
import{styleSave}from'./skate-style.mjs';
import{missionSave}from'./missions.mjs';
import{storySave}from'./story-path.mjs';
import{artifactSave}from'./artifact-adventure.mjs';
import{PLAYLIST}from'./playlist.mjs';
import{qualityPreference}from'./quality.mjs';
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const finite=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const list=(value,test)=>Array.isArray(value)?value.filter(test):[];
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const string=x=>typeof x==='string';
// Repair individual malformed fields without discarding intact progress or changing the save key.
export function normalizeSave(value,low=false){
  const s=record(value),w=record(s.world),j=record(s.journey),p=record(j.park),k=record(s.skills);
  const choice=[0,1,2,...PLAYLIST.map(t=>t.id)].includes(s.musicChoice)?s.musicChoice:0;
  return {...s,mirrorBest:Object.fromEntries(Object.entries(record(s.mirrorBest)).filter(([k,v])=>[...STREET_JAMS.map(j=>j.id),'moskovsky','solntsevo','story','spot','podium','final','rival0','rival1','rival2'].includes(k)&&Number.isFinite(v)&&v>=0).map(([k,v])=>[k,Math.floor(Math.min(v,1e9))])),freestyleBest:Object.fromEntries(Object.entries(record(s.freestyleBest)).filter(([k,v])=>[...STREET_JAMS.map(j=>j.id),'moskovsky','solntsevo','story','spot','podium','final','rival0','rival1','rival2'].includes(k)&&Number.isFinite(v)&&v>=0).map(([k,v])=>[k,Math.floor(Math.min(v,1e9))])),look:Math.floor(finite(s.look,0,0,2)),volume:finite(s.volume,55,0,100),offset:finite(s.offset,0,-250,250),inputOffset:finite(s.inputOffset,0,-250,250),danceBest:Math.floor(finite(s.danceBest,0,0,100000)),low:typeof s.low==='boolean'?s.low:low,quality:qualityPreference(s.quality,s.low),showFps:s.showFps===true,environment:{elapsed:finite(record(s.environment).elapsed,0,0,1e9),wetness:finite(record(s.environment).wetness,0,0,1)},effects:s.effects!==false,musicEnabled:s.musicEnabled!==false,musicChoice:choice,
    world:{...w,coins:list(w.coins,integer),won:list(w.won,x=>integer(x)&&x<3),finished:w.finished===true,elapsed:finite(w.elapsed)},
    journey:{...j,capitalContracts:capitalContractSave(j.capitalContracts),style:styleSave(j.style),missions:missionSave(j.missions),story:storySave(j.story),artifactQuest:artifactSave(j.artifactQuest),quest:Math.floor(finite(j.quest,0,0,5)),questCoins:finite(j.questCoins,Math.min(10,list(w.coins,integer).length)),secrets:list(j.secrets,string),achievements:list(j.achievements,string),score:finite(j.score),bonusCoins:finite(j.bonusCoins),gateOpen:j.gateOpen===true,celebrated:j.celebrated===true,bestRace:finite(j.bestRace)||null,vehicleCourseBest:finite(j.vehicleCourseBest)||null,vehicleCourseWins:Math.floor(finite(j.vehicleCourseWins,0,0,100000)),skateBest:finite(j.skateBest)||null,
      park:{...p,wins:list(p.wins,string),visited:list(p.visited,string),best:Object.fromEntries(Object.entries(record(p.best)).filter(([,v])=>typeof v==='number'&&Number.isFinite(v)&&v>=0))}},
    skills:{...k,caches:list(k.caches,x=>integer(x)&&x<3),raceWon:k.raceWon===true,bestTime:finite(k.bestTime)||null},
    bestBattle:Array.isArray(s.bestBattle)?s.bestBattle.map(v=>typeof record(v).score==='number'&&Number.isFinite(v.score)?v:null):[]};
}
export function readSave(storage,low=false){
  try{return normalizeSave(JSON.parse(storage.getItem('zns-district-v1')||'{}'),low);}catch{return normalizeSave(null,low);}
}
