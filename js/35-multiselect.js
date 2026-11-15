/* Multi-select of clips (MS, 18): Shift+click a clip bar adds or removes it (the name column already did), Shift+drag on empty timeline space draws a rectangle that selects the clips it touches; Alt+Shift+drag selects keyframes as before. Copy, Cut, Paste, Duplicate (07) and Delete (16) work on all selected clips. Shift+drag on a video or audio clip is still the slide (33): only a click without movement toggles. */
let MSP=null;
addEventListener('pointerdown',e=>{MSP=null;if(e.button||!e.shiftKey||e.altKey||tool=='cut')return;const bar=e.target.closest&&e.target.closest('#tlin .bar'),row=bar&&bar.closest('.row');if(row&&row.dataset.id)MSP={id:+row.dataset.id,prev:sel,x:e.clientX,y:e.clientY,moved:0}},true);
addEventListener('pointermove',e=>{if(MSP&&Math.hypot(e.clientX-MSP.x,e.clientY-MSP.y)>4)MSP.moved=1});
addEventListener('pointerup',()=>{const m=MSP;MSP=null;if(!m||m.moved)return;if(!MS.size&&m.prev)MS.add(m.prev);if(MS.has(m.id)&&m.id!=m.prev)MS.delete(m.id);else MS.add(m.id);sel=m.id;if(MS.size<2)MS.clear();side();tl();ovd=1;dirty=1});
function startClipMq(e){const A=$('#tlin'),ra=A.getBoundingClientRect(),x0=e.clientX-ra.left+A.scrollLeft,y0=e.clientY-ra.top+A.scrollTop,m=document.createElement('div');m.id='mq';A.appendChild(m);let mv=0;
 const f=ev=>{const x=ev.clientX-ra.left+A.scrollLeft,y=ev.clientY-ra.top+A.scrollTop;mv=1;m.style.cssText=`display:block;left:${Math.min(x,x0)}px;top:${Math.min(y,y0)}px;width:${Math.abs(x-x0)}px;height:${Math.abs(y-y0)}px`};
 const u=ev=>{removeEventListener('pointermove',f);removeEventListener('pointerup',u);m.remove();if(!mv)return;const l=Math.min(ev.clientX,e.clientX),r=Math.max(ev.clientX,e.clientX),t0=Math.min(ev.clientY,e.clientY),b0=Math.max(ev.clientY,e.clientY),ids=[];
  A.querySelectorAll('.row[data-id]').forEach(row=>{const bar=row.querySelector('.bar'),L=P.layers.find(x=>x.id==+row.dataset.id);if(!bar||!L||L.type=='cam')return;const b=bar.getBoundingClientRect();if(b.right>=l&&b.left<=r&&b.bottom>=t0&&b.top<=b0)ids.push(L.id)});
  if(!ev.ctrlKey&&!ev.metaKey)MS.clear();ids.forEach(i=>MS.add(i));ks=[];if(ids.length)sel=ids.includes(sel)?sel:ids[0];if(MS.size<2)MS.clear();side();tl();ovd=1;dirty=1};
 addEventListener('pointermove',f);addEventListener('pointerup',u)}

/* true when a parent group of l is also selected (so it moves with that group) */
function msUp(l){for(let p=P.layers.find(x=>x.id==l.par),n=0;p&&n<50;p=P.layers.find(x=>x.id==p.par),n++)if(MS.has(p.id))return true;return false}
/* panel note: the properties below belong to the current clip only */
{const s0=side;side=function(){s0.apply(this,arguments);const S=$('#side');if(!S||MS.size<2)return;const d=document.createElement('div');d.className='msn m';d.textContent=MS.size+' clips selected. Drag, copy, duplicate, cut and delete act on all of them. The properties below are for '+LN(cur())+' only.';S.insertBefore(d,S.firstChild)}}
