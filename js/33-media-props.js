/* Media tab for video, photo and audio layers: file details, Replace media (keeps position, size, fades, keyframes, effects and timing, so copy + paste + replace keeps a transition), and where the same media is used. Undo does not bring back the old file. */
const mdSame=(a,b)=>a===b||(a&&b&&a.blob&&b.blob&&a.name==b.name&&a.blob.size==b.blob.size);
function mediaUses(L){const m=MB[L.id];if(!m)return[L];return P.layers.filter(l=>l.type==L.type&&!l.glb&&MB[l.id]&&mdSame(MB[l.id],m))}
const mdT=s=>{const m=Math.floor(s/60);return m+':'+(s-m*60).toFixed(1).padStart(4,'0')},mdSz=n=>n>=1e9?(n/1e9).toFixed(2)+' GB':n>=1e6?(n/1e6).toFixed(1)+' MB':n>=1e3?Math.round(n/1e3)+' KB':n+' B';
function MEDUI(L){const m=MB[L.id],el=L.el,uses=mediaUses(L),au=L.type=='audio',pool=typeof poolItems=='function'?poolItems().filter(i=>au?i.kind=='audio':i.kind!='audio'):[];
 const ext=m?((m.name.match(/\.([^.]+)$/)||[])[1]||'').toUpperCase():'',dim=!au&&el?(L.vid?[el.videoWidth,el.videoHeight]:[el.naturalWidth,el.naturalHeight]):null,dur=au?(L.buf&&L.buf.duration):(L.vid&&el&&isFinite(el.duration)?el.duration:0);
 const thumb=au?`<div class=mdth>${IC('wave')}</div>`:L.vid&&el?`<video class=mdth src="${el.currentSrc||el.src}#t=0.1" preload=metadata muted playsinline></video>`:el?`<img class=mdth src="${el.src}" alt="">`:'';
 const part=(L.vid||au)&&dur?`Using ${mdT(L.off||0)}–${mdT((L.off||0)+(Math.min(L.e,P.dur)-L.s))} of the file`:'';
 return `<div class=mdi>${thumb}<b>${m?esc(m.name):esc(L.name)}</b><div class=m>${m?`${au?'Audio':L.vid?'Video':'Image'}${ext?' · '+esc(ext):''} · ${mdSz(m.blob.size)}`:'File not available'}</div>${dim&&dim[0]?`<div class=m>${dim[0]}×${dim[1]} px</div>`:''}${dur?`<div class=m>Duration ${mdT(dur)}</div>`:''}${part?`<div class=m>${part}</div>`:''}</div>`
 +`<div class=sech>Replace media</div><div class=r><button id=mrep data-mrep=1>Replace media…</button></div>`
 +(pool.length?`<div class=r><label>From pool</label><select data-mpool><option value="">Choose…${pool.map(i=>`<option value=${i.id}>${esc(i.name)}`).join('')}</select></div>`:'')
 +(uses.length>1?`<div class=r><input type=checkbox id=mall><span class=ckl>Replace in all ${uses.length} places it is used</span></div>`:'')
 +`<p class=hint id=mst style="margin:6px 0 0;padding:0;border:0">Keeps the position, size, fades, keyframes, effects and timing. To reuse a transition: copy and paste the layer, then replace the media in the copy.</p>`
 +`<div class=sech>Where it is used (${uses.length})</div>`+uses.map(u=>`<div class="mdu${u.id==L.id?' on':''}" data-mgo=${u.id} title="Select this layer and jump to its start"><span>${esc(LN(u))}</span><span class=m>${mdT(u.s)}–${mdT(Math.min(u.e,P.dur))}${u.id==L.id?' · this layer':''}</span></div>`).join('')}
function mdLoad(f){return new Promise((ok,no)=>{const vid=/^video/.test(f.type)||/\.(mp4|webm|mov|m4v|mkv)$/i.test(f.name),el=document.createElement(vid?'video':'img');
 if(vid){el.muted=true;el.playsInline=true;el.preload='auto';el.onloadedmetadata=()=>ok({el,vid:1,w:el.videoWidth,h:el.videoHeight});el.onerror=()=>no(new Error('This video cannot be opened'))}
 else{el.onload=()=>{imgPrep(el);ok({el,vid:0,w:el.naturalWidth,h:el.naturalHeight})};el.onerror=()=>no(new Error('This image cannot be opened'))}el.src=URL.createObjectURL(f)})}
async function mdAudio(f){try{return await ac().decodeAudioData(await f.arrayBuffer())}catch(e){return null}}
async function mdReplaceOne(L,f,ids){const old=MB[L.id];let note='';
 if(L.type=='audio'){const b=await mdAudio(f);if(!b)throw new Error('This audio file cannot be decoded');L.buf=b;BUF[L.id]=b;MB[L.id]={blob:f,name:f.name,kind:'audio'};STORED.delete(L.id);if(old&&L.name==String(old.name).slice(0,14))L.name=f.name.slice(0,14);return note}
 const m=await mdLoad(f);m.el.__own=L.id;L.el=m.el;ELS[L.id]=m.el;L.vid=!!m.vid;MB[L.id]={blob:f,name:f.name,kind:m.vid?'video':'image'};STORED.delete(L.id);
 if(m.w&&m.h){const s=Math.min(L.p.w/m.w,L.p.h/m.h);if(isFinite(s)&&s>0){L.p.w=Math.round(m.w*s);L.p.h=Math.round(m.h*s)}}
 if(old&&L.name==String(old.name).slice(0,14))L.name=f.name.slice(0,14);
 /* a pasted copy shares its link tag (and so its audio) with the original: it must not change the original's sound, so it detaches and gets its own */
 const lk=L.lk?P.layers.filter(a=>a.type=='audio'&&a.lk==L.lk):[],shared=!!L.lk&&P.layers.some(x=>x.id!=L.id&&x.type=='media'&&x.lk==L.lk&&!ids.has(x.id)),buf=m.vid?await mdAudio(f):null;
 if(shared)L.lk=undefined;
 if(buf&&lk.length&&!shared)lk.forEach(a=>{a.buf=buf;BUF[a.id]=buf;MB[a.id]={blob:f,name:f.name+' audio',kind:'audio'};STORED.delete(a.id)});
 else if(buf){const A=addAudio(buf,f.name+' audio',f);A.lk=L.lk='av'+A.id;A.s=L.s;A.off=L.off||0;A.e=A.s+buf.duration;sel=L.id}
 else if(lk.length&&!shared)note=m.vid?'The new video has no sound, so the old linked audio is still there.':'The old linked audio is still there.';
 return note}
async function mdReplace(L,f,everywhere){const st=m=>{const e=$('#mst');if(e)e.textContent=m},ids=everywhere?mediaUses(L).map(l=>l.id):[L.id];st('Replacing…');let note='';
 const set=new Set(ids);try{for(const id of ids){const l=P.layers.find(x=>x.id==id);if(l)note=await mdReplaceOne(l,f,set)||note}}catch(e){st('Could not replace: '+e.message);return}
 sel=L.id;dirty=1;all();commit();st('Replaced with '+f.name+(ids.length>1?' in '+ids.length+' places':'')+'.'+(note?' '+note:''))}
const mdIn=document.createElement('input');mdIn.type='file';mdIn.id='mrf';mdIn.hidden=true;document.body.appendChild(mdIn);
mdIn.onchange=()=>{const f=mdIn.files[0],L=cur();mdIn.value='';if(f&&L)mdReplace(L,f,!!($('#mall')&&$('#mall').checked))};
$('#side').addEventListener('click',e=>{const L=cur();if(e.target.closest('[data-mrep]')&&L){mdIn.accept=L.type=='audio'?'audio/*':'image/*,video/*';mdIn.click();return}
 const g=e.target.closest('[data-mgo]');if(g){const l=P.layers.find(x=>x.id==+g.dataset.mgo);if(l){sel=l.id;ks=[];t=Math.max(0,Math.min(P.dur,l.s));dirty=1;all()}}});
$('#side').addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('select[data-mpool]');if(!s||!s.value)return;const L=cur(),it=typeof poolItems=='function'?poolItems().find(i=>i.id==+s.value):null;if(L&&it)mdReplace(L,it.file,!!($('#mall')&&$('#mall').checked))});
