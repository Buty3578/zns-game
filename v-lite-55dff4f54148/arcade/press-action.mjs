// Fire on contact, including a second finger while the joystick owns the first.
// The subsequent browser click must not execute the command again.
export function bindImmediatePress(button,action){
 button.onpointerdown=event=>{
  if(button.disabled||(event.button!==undefined&&event.button!==0))return;
  event.preventDefault();button.setPointerCapture?.(event.pointerId);return action();
 };
 button.onclick=event=>{
  if(button.disabled||event?.detail>0||event?.pointerType)return;
  return action(); // Keyboard/assistive activation; no preceding pointer contact.
 };
}
