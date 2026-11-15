/* Media pool: floating window (like Notes) so it takes no layout space. Clicking a tile adds it to the timeline at the playhead. With 'Keep in project' on, the pool is saved per project: IndexedDB 'pool:<id>' (list) + media '<id>:pool<n>' (files), and in the exported project .json as `pool`. */
let poolReset,poolLoad,poolImport,poolBundle;
(()=>{
let items=[],seq=1,keep=true,pq=Promise.resolve();const K='mp-win';
let S={open:0,min:0,x:16,y:64,w:320,h:300};try{Object.assign(S,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const w=document.createElement('div');w.id='mp';w.hidden=true;
w.innerHTML=`<div id=mph><span>Media pool</span><label id=mpk title="Save the pool with this project (browser storage and the exported project file)"><input type=checkbox id=mpkeep checked> Keep in project</label><span><button id=mpadd title="Add files" aria-label="Add files">${IC('plus')}</button><button id=mpmin title=Minimize aria-label=Minimize>${IC('minus')}</button><button id=mpx title=Close aria-label=Close>${IC('x')}</button></span></div><div id=mpg></div><input type=file id=mpf accept="image/*,video/*,audio/*" multiple hidden>`;
document.body.appendChild(w);
const b=document.createElement('button');b.id='mpbtn';b.dataset.t='Media pool';b.title='Media pool';b.innerHTML=IC('film');b.setAttribute('data-ib','');$('#notebtn').before(b);
const kind=f=>f.type.startsWith('video')?'video':f.type.startsWith('audio')?'audio':f.type.startsWith('image')?'image':/\.(mp4|webm|mov|m4v)$/i.test(f.name)?'video':/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(f.name)?'audio':/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(f.name)?'image':null;
const clamp=()=>{S.x=Math.max(0,Math.min(innerWidth-60,S.x==null?innerWidth-S.w-16:S.x));S.y=Math.max(0,Math.min(innerHeight-30,S.y))};
const place=()=>{clamp();w.hidden=!S.open;w.style.left=S.x+'px';w.style.top=S.y+'px';w.style.width=S.w+'px';w.style.height=S.min?'':S.h+'px';w.classList.toggle('min',!!S.min);b.className=S.open?'on':''};
const doPersist=async()=>{const id=CURID;if(!id||typeof idb!='function')return;await saveNow(true);
 if(!keep){await idb('proj','readwrite',q=>q.put({keep:0,items:[]},'pool:'+id));await idb('media','readwrite',q=>q.delete(rng(id+':pool')));items.forEach(it=>it.stored=0);return}
 const old=(await idb('proj','readonly',q=>q.get('pool:'+id)))||{items:[]};
 for(const o of old.items)if(!items.some(it=>it.id==o.id))await idb('media','readwrite',q=>q.delete(id+':pool'+o.id));
 for(const it of items)if(!it.stored){await idb('media','readwrite',q=>q.put({blob:it.file,name:it.name,kind:it.kind},id+':pool'+it.id));it.stored=1}
 await idb('proj','readwrite',q=>q.put({keep:1,items:items.map(({id,name,kind})=>({id,name,kind}))},'pool:'+id))};
const persist=()=>pq=pq.then(doPersist).catch(()=>{});
const clear=()=>{items.forEach(it=>URL.revokeObjectURL(it.url));items=[];seq=1};
const mkItem=(f,k,id,stored)=>({id,file:f,kind:k,name:f.name,url:URL.createObjectURL(f),stored});
const sync=()=>{$('#mpkeep').checked=keep;render()};
const render=()=>{const g=$('#mpg');g.innerHTML=items.length?'':'<p class=m>Drop files here or press + to add images, video and audio. Click a clip to put it on the timeline at the playhead.</p>';
 items.forEach(it=>{const d=document.createElement('div');d.className='mpt';d.title='Add to timeline at playhead: '+it.name;
  const th=it.kind=='audio'?`<div class=mpa>${IC('wave')}</div>`:it.kind=='video'?`<video src="${it.url}#t=0.1" preload=metadata muted playsinline></video>`:`<img src="${it.url}" alt="">`;
  d.innerHTML=th+`<span>${it.name.replace(/[<>&]/g,'')}</span><button title=Remove aria-label=Remove>${IC('x')}</button>`;
  d.onclick=e=>{if(e.target.closest('button')){URL.revokeObjectURL(it.url);items.splice(items.indexOf(it),1);render();persist();return}
   if(it.kind=='audio')addAudioFile(it.file,t);else addMediaFile(it.file,t)};g.appendChild(d)})};
const add=fs=>{[...fs].forEach(f=>{const k=kind(f);if(k)items.push(mkItem(f,k,seq++,0))});render();persist()};
$('#mpkeep').onchange=e=>{keep=e.target.checked;persist()};
b.onclick=()=>{S.open=S.open?0:1;place();save()};$('#mpx').onclick=()=>{S.open=0;place();save()};$('#mpmin').onclick=()=>{S.min=S.min?0:1;place();save()};
$('#mpadd').onclick=()=>$('#mpf').click();$('#mpf').onchange=e=>{add(e.target.files);e.target.value=''};
w.addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
w.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length){e.preventDefault();add(e.dataTransfer.files)}});
let d=null;$('#mph').onpointerdown=e=>{if(e.target.closest('button'))return;const r=w.getBoundingClientRect();d={ox:e.clientX-r.left,oy:e.clientY-r.top}};
addEventListener('pointermove',e=>{if(!d)return;S.x=e.clientX-d.ox;S.y=e.clientY-d.oy;place()});addEventListener('pointerup',()=>{if(d){d=null;save()}});
addEventListener('resize',place);
new ResizeObserver(()=>{if(S.open&&!S.min&&w.offsetWidth>40&&(S.w!=w.offsetWidth||S.h!=w.offsetHeight)){S.w=w.offsetWidth;S.h=w.offsetHeight;save()}}).observe(w);
poolReset=()=>{clear();keep=true;sync()};
poolLoad=()=>pq=pq.then(async()=>{const id=CURID;if(!id||typeof idb!='function')return;const meta=await idb('proj','readonly',q=>q.get('pool:'+id)),L=[];let n=1;
 for(const o of(meta&&meta.items)||[]){const r=await idb('media','readonly',q=>q.get(id+':pool'+o.id));if(r&&r.blob){L.push(mkItem(new File([r.blob],r.name||o.name,{type:r.blob.type}),r.kind||o.kind,o.id,1));n=Math.max(n,o.id+1)}}
 if(id!=CURID)return;clear();items=L;seq=n;keep=!meta||meta.keep!==0;sync()}).catch(()=>{});
poolImport=async b=>{clear();keep=b.keep!==0;for(const o of b.items||[]){const bl=d2b(o.data),f=new File([bl],o.name,{type:bl.type}),k=kind(f)||o.kind;if(k)items.push(mkItem(f,k,seq++,0))}sync();await persist()};
poolBundle=async()=>keep&&items.length?{keep:1,items:await Promise.all(items.map(async it=>({name:it.name,kind:it.kind,data:await b64(it.file)})))}:null;
render();place();if(typeof CURID!='undefined'&&CURID)poolLoad();
})();
