/* ---- loading screen: const L=loadingShow(title,msg,{cancel:fn}); L.set(fraction|null,msg); L.title(t); L.done() ---- */
function loadingShow(title,msg,o){
 o=o||{};const el=document.createElement('div');el.className='ldov';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 el.innerHTML='<div class=ldbox><h3></h3><div class=ldmsg></div><div class=ldbar><i></i></div><div class=ldbtn></div></div>';
 const h=el.querySelector('h3'),m=el.querySelector('.ldmsg'),bar=el.querySelector('.ldbar'),fill=bar.firstChild,bt=el.querySelector('.ldbtn');
 h.textContent=title||'Loading';m.textContent=msg||'';bar.classList.add('ind');
 if(o.cancel){const b=document.createElement('button');b.textContent='Cancel';b.onclick=()=>{b.disabled=true;m.textContent='Cancelling…';try{o.cancel()}catch(e){}};bt.appendChild(b)}
 document.body.appendChild(el);
 return{el,
  set(f,t){if(t!=null)m.textContent=t;if(f==null||!isFinite(f)){bar.classList.add('ind');fill.style.width=''}else{bar.classList.remove('ind');fill.style.width=Math.round(Math.max(0,Math.min(1,f))*100)+'%'}},
  title(t){h.textContent=t},
  done(){el.remove()}}}
