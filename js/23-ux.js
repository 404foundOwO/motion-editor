/* ---- small UX helpers: version label, empty-canvas hint ---- */
(()=>{const v=document.getElementById('ver');if(v){v.textContent='v'+APPV;v.title='Motion Editor v'+APPV+' · '+APPDATE}})();
const EMPTY=(()=>{const e=document.createElement('div');e.id='empty';e.hidden=true;e.innerHTML='<b>Your canvas is empty</b><span>Add text, shapes, images, video, audio or particles to start animating.</span><button type=button>'+IC('plus')+'Add layer</button>';e.querySelector('button').onclick=()=>{const f=$('#fab');if(f)f.click()};$('#stage').appendChild(e);return e})();
function updEmpty(){EMPTY.hidden=!(mode!='3d'&&P.layers.every(l=>l.type=='cam'))}
{const _tl=tl;tl=function(){const r=_tl.apply(this,arguments);try{updEmpty()}catch(e){}return r}}
updEmpty();
