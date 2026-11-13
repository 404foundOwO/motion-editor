/* ---- small UX helpers: version label, empty-canvas hint ---- */
(()=>{const v=document.getElementById('ver');if(v){v.textContent='v'+APPV;v.title='Motion Editor v'+APPV+' · '+APPDATE}})();
const EMPTY=(()=>{const e=document.createElement('div');e.id='empty';e.hidden=true;e.innerHTML='<b>Your canvas is empty</b><span>Add text, shapes, images, video, audio or particles to start animating.</span><button type=button>'+IC('plus')+'Add layer</button>';e.querySelector('button').onclick=()=>{const f=$('#fab');if(f)f.click()};$('#stage').appendChild(e);return e})();
function updEmpty(){EMPTY.hidden=!(mode!='3d'&&P.layers.every(l=>l.type=='cam'))}
{const _tl=tl;tl=function(){const r=_tl.apply(this,arguments);try{updEmpty()}catch(e){}return r}}
updEmpty();
/* while playing, update the side panel's numbers in place instead of rebuilding it, so hovering and clicking keep working */
function sideLive(){const L=cur(),S=$('#side');if(!L||!S)return;const ae=document.activeElement;
 S.querySelectorAll('input[data-k]').forEach(i=>{if(i===ae)return;const k=i.dataset.k;let v;try{v=val(L,k,t)}catch(e){return}if(v===undefined||v===null)return;
  if(i.type=='color'){if(typeof v=='string'&&i.value!=v)i.value=v}else if(i.type=='number'||i.type=='range'){const s=String(+(+v).toFixed(3));if(i.value!==s)i.value=s}});
 S.querySelectorAll('button[data-kf]').forEach(b=>{const a=L.kf[b.dataset.kf]||[];b.classList.toggle('on',a.some(f=>Math.abs(f.t-t)<.008))})}
/* timeline name column: resizable by dragging the handle in the header, double-click to fit the longest name */
function setNW(w,save){NW=Math.round(Math.max(90,Math.min(360,w)));app.style.setProperty('--nw',NW+'px');tl();if(save)saveUI()}
setNW(NW);
$('#tlin').addEventListener('pointerdown',e=>{const h=e.target.closest('.nwr');if(!h)return;e.stopPropagation();e.preventDefault();const x0=e.clientX,w0=NW;document.body.classList.add('nwdrag');
 const mv=ev=>setNW(w0+ev.clientX-x0),up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);document.body.classList.remove('nwdrag');saveUI()};addEventListener('pointermove',mv);addEventListener('pointerup',up)},true);
$('#tlin').addEventListener('dblclick',e=>{if(!e.target.closest('.nwr'))return;e.stopPropagation();let m=0;const c=document.createElement('canvas').getContext('2d');c.font='12px Inter,sans-serif';
 for(const[L,dp]of treeOrder())m=Math.max(m,c.measureText(LN(L)).width+8+dp*14+ (L.type=='group'?14:0)+22+(L.efx.length?34:0)+28);setNW(m+12,true)},true);
