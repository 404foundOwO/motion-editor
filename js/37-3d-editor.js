/* ---- 3D animation made in 3d-editor (its own site and repo) and brought in here as a video with a transparent background.
 The pop-up is 3d-editor in a frame (address + ?embed=1); the two pages talk with postMessage. The messages are listed at the top of
 3d-editor/src/embed.js. A clip made this way keeps its editable source in MB[id].src3d: a GLB with the keyframes inside, saved with the
 media (IndexedDB and project files, see 16 and 17). "Edit in 3d-editor" (Media tab) sends it back; Save replaces the video through
 mdReplace, so the position, size, fades, keyframes and effects of the layer stay. Add menu > "3D animation" makes a new clip.
 3d-editor records the video in real time, optionally slower (slow 2/4/8 for a slow computer); a slowed video gets its Speed set to
 that number (L.spd) so it plays at the right speed. Run node tests/me3d.js after changing it (needs 3d-editor running) ---- */
const ME3D={box:null,frame:null,layer:null,origin:'',ready:false,timer:0,src:null,size:null,wait:10000};
const ME3D_URL='http://localhost:5173/';
const me3dBase=()=>{try{return localStorage.getItem('me3dUrl')||ME3D_URL}catch(e){return ME3D_URL}};
const me3dSrcOf=L=>{const m=L&&MB[L.id];return(m&&m.src3d)||null};
/* the Media tab section for a clip that has an editable source */
function me3dUI(L){return me3dSrcOf(L)?`<div class=sech>3D animation</div><div class=r><button data-me3d=1>Edit in 3d-editor…</button></div><p class=hint style="margin:6px 0 0;padding:0;border:0">This clip was made in 3d-editor. Editing opens it there; Save replaces the video here and keeps the position, fades, keyframes and effects.</p>`:''}
const me3dStatus=s=>{const e=$('#me3ds');if(e)e.textContent=s};
function me3dClose(){const S=ME3D;clearTimeout(S.timer);removeEventListener('message',me3dMsg);if(S.box)S.box.remove();S.box=S.frame=S.layer=S.src=null;S.ready=false}
/* L = the clip to edit, or null for a new animation. o.size = video size to ask for (default: the project size) */
function me3dOpen(L,o={}){
 const S=ME3D;if(S.box)return;let u;
 try{u=new URL(me3dBase(),location.href)}catch(e){alert('The address of 3d-editor is not valid: '+me3dBase());return}
 u.searchParams.set('embed','1');
 const box=document.createElement('div');box.id='me3d';box.setAttribute('role','dialog');box.setAttribute('aria-label','3D animation');
 box.innerHTML=`<div class=me3dh><b>${L?'Edit 3D animation':'New 3D animation'}</b><span id=me3ds class=me3dst>Opening 3d-editor…</span><i class=grow></i><button data-a=addr title="Where 3d-editor is running">Address…</button><button data-a=x>Close</button></div><iframe id=me3df title="3d-editor"></iframe>`;
 document.body.appendChild(box);
 S.box=box;S.frame=box.querySelector('iframe');S.layer=L||null;S.origin=u.origin;S.ready=false;S.src=me3dSrcOf(L);S.size=o.size||{w:W,h:H};
 box.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(!a)return;
  if(a.dataset.a=='x')me3dClose();
  else if(a.dataset.a=='addr'){const v=prompt('Where is 3d-editor running? Paste the address of its page (for example http://localhost:5173/)',me3dBase());if(v&&v.trim()){try{localStorage.setItem('me3dUrl',v.trim())}catch(x){}const l=S.layer;me3dClose();me3dOpen(l,o)}}});
 addEventListener('message',me3dMsg);
 S.frame.src=u.href;
 S.timer=setTimeout(()=>{if(!S.ready)me3dStatus('3d-editor did not answer at '+u.origin+'. Start it (npm run dev in its folder), or press Address… to change where it is.')},S.wait)}
/* messages from the frame: only from our own frame, and only from the address we opened */
function me3dMsg(e){const S=ME3D;if(!S.frame||e.source!==S.frame.contentWindow||e.origin!==S.origin)return;const d=e.data;if(!d||d.app!='3d-editor'||d.v!==1)return;
 if(d.type=='ready'){S.ready=true;clearTimeout(S.timer);me3dStatus('Loading…');
  (async()=>{try{const glb=S.src?await S.src.arrayBuffer():null;if(S.frame)S.frame.contentWindow.postMessage({app:'motion-editor',v:1,type:'open',glb,size:S.size},S.origin)}catch(x){me3dStatus('Could not read the saved animation: '+x.message)}})()}
 else if(d.type=='opened')me3dStatus('')
 else if(d.type=='error')me3dStatus(d.message||'3d-editor reported an error')
 else if(d.type=='cancel')me3dClose()
 else if(d.type=='save')me3dSave(d)}
/* a new clip at the playhead; a slowed video gets its Speed once its length is known (setSpeed shortens the clip to match) */
function me3dAddNew(f,slow){addMediaFile(f,t);const L=P.layers.find(l=>l.id==sel);if(!L)return;L.name='3D animation';
 const fin=()=>{if(slow>1)setSpeed(L,slow);all()};if(L.el.readyState>=1)fin();else L.el.addEventListener('loadedmetadata',fin,{once:true})}
async function me3dSave(d){
 const S=ME3D,L=S.layer;
 if(!(d.video instanceof Blob)||d.video.size<1000||!(d.glb instanceof ArrayBuffer)){me3dStatus('The video did not arrive, nothing was changed.');return}
 const slow=[1,2,4,8].includes(+d.slow)?+d.slow:1,f=new File([d.video],'3d-animation.webm',{type:'video/webm'});
 f.me3dSrc=new Blob([d.glb],{type:'model/gltf-binary'});   /* picked up by addMediaFile and mdReplaceOne, which store it as MB[id].src3d */
 me3dClose();
 try{
  if(L&&P.layers.includes(L)){
   const had=L.spd;if(slow==1)delete L.spd;else L.spd=slow;   /* set first, so the message about how the clip fits uses the right speed */
   await mdReplace(L,f,false,false);
   if(!MB[L.id]||MB[L.id].blob!==f){if(had===undefined)delete L.spd;else L.spd=had;return}   /* the replace failed and said why */
  }else me3dAddNew(f,slow);
  if(d.animationFps<12)toast('3d-editor drew only about '+Math.round(d.animationFps)+' frames per second of animation, so it looks choppy. Edit it again and choose a slower recording.')
 }catch(x){toast('Could not use the 3D animation: '+x.message)}}
$('#a3d').onclick=()=>{$('#menu').hidden=true;me3dOpen(null)};
$('#side').addEventListener('click',e=>{if(!e.target.closest('[data-me3d]'))return;const L=cur();if(L)me3dOpen(L)});
