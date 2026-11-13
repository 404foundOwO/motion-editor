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
