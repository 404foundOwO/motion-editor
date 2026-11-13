/* ---- timeline clips: fade dots, split preview in cut mode, compact/comfortable density ---- */
/* fade dots: drag the green (start) or red (end) dot into the clip; longer drag = longer fade */
$('#tlin').addEventListener('pointerdown',e=>{const d=e.target.closest('.fd');if(!d||e.button)return;e.stopPropagation();e.preventDefault();
 const L=P.layers.find(l=>l.id==+d.closest('.row').dataset.id);if(!L)return;if(sel!=L.id){sel=L.id;ks=[];rep=null;side()}
 const w=$('#ru').getBoundingClientRect().width,k=d.dataset.fd,v0=(k=='i'?L.fi:L.fo)||0,x0=e.clientX,len=Math.max(0,Math.min(L.e,P.dur)-L.s);
 document.body.classList.add('fddrag');const tip=document.createElement('div');tip.id='fdtip';document.body.appendChild(tip);
 const mv=ev=>{const dt=(ev.clientX-x0)/w*P.dur,other=(k=='i'?L.fo:L.fi)||0;let v=k=='i'?v0+dt:v0-dt;v=Math.max(0,Math.min(len-other,v));v=Math.round(v*FPS)/FPS;if(k=='i')L.fi=v;else L.fo=v;
  tip.textContent=(k=='i'?'Fade in ':'Fade out ')+(v?v.toFixed(2)+' s':'off');tip.style.left=ev.clientX+12+'px';tip.style.top=ev.clientY-30+'px';tl();dirty=1};
 const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);document.body.classList.remove('fddrag');tip.remove();side();tl();try{commit()}catch(_){}};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);mv(e)},true);
/* double-click a fade dot to remove that fade */
$('#tlin').addEventListener('dblclick',e=>{const d=e.target.closest('.fd');if(!d)return;e.stopPropagation();const L=P.layers.find(l=>l.id==+d.closest('.row').dataset.id);if(!L)return;if(d.dataset.fd=='i')L.fi=0;else L.fo=0;tl();dirty=1;try{commit()}catch(_){}},true);

/* cut mode: show where the clip will split */
function cutLine(e){let c=document.getElementById('cutl');const A=$('#tlin');if(tool!='cut'){if(c)c.remove();return}
 const row=e&&e.target.closest&&e.target.closest('#tlin .row[data-id]'),L=row&&P.layers.find(l=>l.id==+row.dataset.id);
 if(!row||!L||!e.target.closest('.tr')){if(c)c.hidden=true;return}
 const r=$('#ru').getBoundingClientRect(),tt=Math.max(0,Math.min(P.dur,snapT((e.clientX-r.left)/r.width*P.dur)));if(tt<=L.s||tt>=Math.min(L.e,P.dur)){if(c)c.hidden=true;return}
 if(!c||c.parentNode!==A){c=document.createElement('div');c.id='cutl';A.appendChild(c)}c.hidden=false;c.style.left=(NW+tt/P.dur*TW())+'px';c.style.top=row.offsetTop+'px';c.style.height=row.offsetHeight+'px';c.dataset.t=tt.toFixed(2)+'s'}
$('#tlin').addEventListener('pointermove',cutLine);$('#tlin').addEventListener('pointerleave',()=>{const c=document.getElementById('cutl');if(c)c.hidden=true});

/* density: comfortable (default) or compact rows */
function setTLC(on,save){app.classList.toggle('tlc',!!on);const b=$('#tld');if(b){b.classList.toggle('on',!!on);b.title=on?'Comfortable timeline (bigger clips)':'Compact timeline (more rows)'}if(save)try{localStorage.setItem('meTLC',on?'1':'0')}catch(e){}tl()}
{let on=false;try{on=localStorage.getItem('meTLC')=='1'}catch(e){}setTLC(on)}
{const b=$('#tld');if(b)b.onclick=()=>setTLC(!app.classList.contains('tlc'),true)}
