// Screen, pause and pending transitions have one owner. World mechanics remain in Journey.
const SCREENS=new Set(['home','roam','battle','freestyle','result','celebrate','final','storyCelebrate','storyFinal']);
const ACTIVE=new Set(['roam','battle','freestyle','celebrate','storyCelebrate']);
export class GameState {
  screen='home'; paused=false; revision=0; pending=null;
  modals=new Set(); resumeAfterModals=false; completedQuest=null;
  get active(){return ACTIVE.has(this.screen);}
  get loading(){return this.pending!==null;}
  transition(screen){
    if(!SCREENS.has(screen))throw new Error('Unknown game screen: '+screen);
    this.screen=screen;this.revision++;this.pending=null;
    if(!this.active){this.paused=false;this.modals.clear();this.resumeAfterModals=false;}
    if(screen==='home')this.completedQuest=null;
  }
  begin(){this.pending=++this.revision;return this.pending;}
  isCurrent(ticket){return ticket===this.revision;}
  finish(ticket){if(this.pending===ticket)this.pending=null;}
  pause(manual=true){
    if(!this.active)return false;
    this.paused=true;if(manual)this.resumeAfterModals=false;return true;
  }
  resume(){if(this.modals.size)return false;this.paused=false;return true;}
  openModal(id){
    if(!this.modals.size)this.resumeAfterModals=this.active&&!this.paused;
    this.modals.add(id);this.pause(false);
  }
  closeModal(id){
    if(!this.modals.delete(id)||this.modals.size)return false;
    const resume=this.resumeAfterModals;this.resumeAfterModals=false;return resume;
  }
  get notification(){return this.completedQuest===null?null:{type:'quest-complete',index:this.completedQuest};}
  questCompleted(index){this.completedQuest=index;}
  mode(journey){
    if(this.paused)return 'pause';
    if(this.screen==='roam')return journey?.vehicle?(journey.vehicle.id==='skate'?'skate':'vehicle'):journey?.danceTime>0?'dance':'explore';
    return {home:'menu',battle:'battle',freestyle:'battle',result:'battle-result',celebrate:'celebration',final:'complete',storyCelebrate:'celebration',storyFinal:'complete'}[this.screen];
  }
}
