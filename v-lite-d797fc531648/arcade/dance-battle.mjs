import {BattleGame} from './systems.mjs';
// Frozen accents from scripts/music-score.json, rendered into track-0.mp3 by
// produce_street_music.py. Beat zero is decoded audio start; 95 BPM, 4/4.
export const DANCE_FLOOR=Object.freeze({x:210,z:50,name:'Первый грув',radius:7.5});
export const DANCE_TRACK=Object.freeze({level:0,bpm:95,endBeat:80});
export const DANCE_CHART=Object.freeze([[8,1],[10,3],[12,1],[14,0],[16,0],[18,1],[20,2],[22,0],[24,1],[26,3],[28,1],[30,0],[32,0],[34,1],[35,3],[36,2],[38,0],[39,2],[40,1],[42,3],[43,2],[44,1],[45,0],[46,3],[47,0],[48,0],[50,1],[52,2],[54,0],[56,1],[58,3],[60,1],[61,0],[62,3],[62.5,0],[63,1],[63.5,3],[64,0],[66,1],[67,3],[68,2],[70,0],[71,2],[72,1],[74,3],[75,2]].map(note=>Object.freeze(note)));
export function battleClock(raw,{offset=0,inputOffset=0}={}){
 const audio=raw-offset/1000;
 return {audio,input:audio-inputOffset/1000};
}
export class DanceFloorBattle extends BattleGame {
 constructor(){
  super(0,0);
  this.notes=DANCE_CHART.map(([beat,lane],id)=>({id,beat,lane,time:beat*60/95,duration:0,status:'pending',quality:0}));
  this.duration=DANCE_TRACK.endBeat*60/DANCE_TRACK.bpm;
  this.required=60;this.nextDrive=Infinity;
 }
 // Fixed 100 / 65 / 0 scoring for the first round, without Drive bonuses.
 activate(){return false;}
 judge(note,quality,time){if(this.finished||note.status==='done')return;super.judge(note,quality,time);}
 press(lane,time){
  if(this.finished||!Number.isInteger(lane)||lane<0||lane>3||!Number.isFinite(time))return;
  this.update(time); // Expire older notes even when rendering was delayed.
  if(!this.finished)super.press(lane,time);
 }
 update(time){if(this.finished||!Number.isFinite(time))return;super.update(time);}
 get won(){return this.result().accuracy>=this.required;}
 get phrase(){return this.lastTime<8*60/95?'Вступление · приготовься':this.lastTime<64*60/95?'Лови стрелки у линии':'Финальный грув';}
}
