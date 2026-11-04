export function installGameViewport({win=window,doc=document,hint=()=>{}}={}){
 const root=doc.documentElement,viewport=win.visualViewport;
 const resize=()=>{if(!viewport||Math.abs(viewport.scale-1)<.02)root?.style?.setProperty('--game-height',Math.round(viewport?.height||win.innerHeight)+'px');};
 resize();win.addEventListener('resize',resize);win.addEventListener('orientationchange',resize);viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);
 // Safari's proprietary pinch events can bypass touch-action on older iPhones.
 const guard=e=>{if(!doc.querySelector('dialog[open]')&&e.cancelable)e.preventDefault();};
 doc.addEventListener('gesturestart',guard,{passive:false});doc.addEventListener('gesturechange',guard,{passive:false});
 doc.addEventListener('touchmove',e=>{if(e.touches?.length>1)guard(e);},{passive:false});
 for(const id of['fullscreenButton','pauseFullscreen']){const button=doc.getElementById(id);if(button)button.onclick=async()=>{try{if(doc.fullscreenElement){await doc.exitFullscreen();return;}if(root?.requestFullscreen){await root.requestFullscreen();resize();}else hint('iPhone: Safari → Поделиться → На экран «Домой». Запусти игру с этой иконки для полного экрана.');}catch{hint('Для полного экрана на iPhone: Поделиться → На экран «Домой».');}};
 }
 return{resize};
}
