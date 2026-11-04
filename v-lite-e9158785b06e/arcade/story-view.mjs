import{STORY_TOKENS,STORY_STAGE}from'./story-path.mjs';
import{drawVinyl}from'./mission-view.mjs';

// The route markers share the existing low-poly batch and disappear at distance.
export function storyActors(b,j,t,low){
 const story=j.story;if(!story.running)return;const p=j.world.player,range=low?32:52;
 if(story.step===2)for(const item of STORY_TOKENS){
  if(story.collected.has(item.id)||Math.hypot(item.x-p.x,item.z-p.z)>range)continue;
  drawVinyl(b,item,t);
 }
 const target=story.objective;
 if(target&&Math.hypot(target.x-p.x,target.z-p.z)<range){
  const y=story.step>=7?1.1:story.step===2?target.y:story.step===3?.4:1.2;
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6+t*.8;
   b.sphere([target.x+Math.cos(a)*1.5,y+1.35+Math.sin(a)*.8,target.z+Math.sin(a)*1.5],.095,'#d5ff9c');
  }
 }
 if(story.step>=7&&Math.hypot(STORY_STAGE.x-p.x,STORY_STAGE.z-p.z)<range){
  b.cylinder([STORY_STAGE.x,.09,STORY_STAGE.z],2.2,.07,'#c7e9a1',16);
  b.box([STORY_STAGE.x,2.2,STORY_STAGE.z-.5],[2.8,.12,.12],'#ddffba');
 }
}
