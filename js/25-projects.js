/* ---- Projects manager: a dialog to switch between the projects kept in this browser, and to create, rename, duplicate and delete them. Storage is in 16-viewport-export.js ---- */
const prjEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const prjAgo=t=>{const s=(Date.now()-t)/1000;return s<60?'just now':s<3600?Math.round(s/60)+' min ago':s<86400?Math.round(s/3600)+' h ago':Math.round(s/86400)+' d ago'};
async function projectsMenu(){
 const old=$('#prm');if(old){old.remove();return}
 await projFlush();
 const d=document.createElement('div');d.id='prm';d.setAttribute('role','dialog');d.setAttribute('aria-label','Projects');d.tabIndex=-1;
 d.innerHTML='<div class=prmb><div class=prmh><h3>Projects</h3><span class=prmu id=prmu></span><i class=grow></i><button data-a=file>Open file…</button><button data-a=new class=pri>New project</button><button data-a=x aria-label=Close>Close</button></div><div class=prmg id=prmg></div><p class=prmf>Projects are kept in this browser on this device and save automatically. Use Save in the top bar to download a backup or move a project to another device.</p></div>';
 document.body.appendChild(d);d.focus();
 const g=d.querySelector('#prmg'),close=()=>d.remove();
 const render=async()=>{const list=await projList();
  g.innerHTML=list.length?list.map(m=>`<div class="prmc${m.id==CURID?' cur':''}" data-id="${prjEsc(m.id)}"><button class=prmt data-a=open title="Open this project">${m.thumb?`<img alt="" src="${m.thumb}">`:'<span>No preview yet</span>'}</button><div class=prmn data-a=open title="${prjEsc(m.name)}">${prjEsc(m.name)}${m.id==CURID?' <em>open now</em>':''}</div><div class=prmm>${Math.round(m.dur||0)} s · ${m.n||0} layer${m.n==1?'':'s'} · ${prjAgo(m.t)}</div><div class=prma><button data-a=ren>Rename</button><button data-a=dup>Duplicate</button><button data-a=del>Delete</button></div></div>`).join(''):'<p class=prmf>No projects yet.</p>';
  try{navigator.storage.estimate().then(e=>{const u=$('#prmu');if(u&&e&&e.usage!=null)u.textContent='Using '+(e.usage>1e8?Math.round(e.usage/1e6)+' MB':(e.usage/1e6).toFixed(1)+' MB')+' here'})}catch(e){}};
 d.addEventListener('click',async e=>{
  if(e.target===d){close();return}
  const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,c=b.closest('.prmc'),id=c&&c.dataset.id;
  if(a=='x')close();
  else if(a=='new'){close();await projNew()}
  else if(a=='file'){close();$('#fj').click()}
  else if(a=='open'){close();if(id!=CURID)await projSwitch(id)}
  else if(a=='dup'){b.disabled=true;await projDup(id);await render()}
  else if(a=='del'){const nm=c.querySelector('.prmn').title;if(confirm('Delete "'+nm+'"? This cannot be undone.')){b.disabled=true;await projDel(id);await render()}}
  else if(a=='ren'){const n=c.querySelector('.prmn'),nm=n.title,i=document.createElement('input');i.value=nm;i.maxLength=60;i.setAttribute('aria-label','Project name');n.replaceWith(i);i.focus();i.select();
   let done=0;const fin=async ok=>{if(done)return;done=1;if(ok&&i.value.trim()&&i.value.trim()!=nm)await projRename(id,i.value);await render()};
   i.onkeydown=k=>{k.stopPropagation();if(k.key=='Enter')fin(true);else if(k.key=='Escape')fin(false)};i.onblur=()=>fin(true)}});
 d.addEventListener('keydown',e=>{if(e.key=='Escape')close()});
 await render()}
$('#prj').onclick=projectsMenu;
