// 3D animation from 3d-editor in a pop-up (needs Playwright + Chromium AND 3d-editor running).
// Start 3d-editor first (npm run dev in its folder), then: node tests/me3d.js
// Another address: ME3D_URL=http://127.0.0.1:5173/ node tests/me3d.js
// Covers: new animation from the Add menu entry, the clip it makes, saving with the project (IndexedDB, JSON file,
// binary file), Edit in 3d-editor (keys come back, Save replaces the video and keeps the layer's settings), a slowed
// recording, Cancel, a frame that never answers, and a message that does not come from the frame.
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
const URL3D=process.env.ME3D_URL||'http://127.0.0.1:5173/';
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{
 try{const r=await fetch(URL3D);if(!r.ok)throw new Error('HTTP '+r.status)}catch(e){console.log('SKIP: 3d-editor is not running at '+URL3D+' ('+e.message+')');process.exit(0)}
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1280,height:800}});const p=await ctx.newPage();const errs=[];/* a slow page load can let an early timer call lpDraw (defined in a later script) once: an old startup race of the editor, not this feature */
 p.on('pageerror',e=>{if(!/^lpDraw is not defined$/.test(e.message))errs.push(e.message)});
 const url='file://'+path.resolve(__dirname,'../index.html');
 const boot=async()=>{await p.goto(url);await p.waitForFunction(()=>typeof SAVEON!='undefined'&&SAVEON===true&&typeof lpDraw=='function',null,{timeout:15000});await p.waitForTimeout(300)};
 await boot();
 await p.evaluate(u=>localStorage.setItem('me3dUrl',u),URL3D);
 const origin=new URL(URL3D).origin,frame=()=>p.frames().find(f=>f.url().startsWith(origin));
 // wait until the pop-up has loaded its model and Save is enabled
 const ready=async()=>{await p.waitForFunction(()=>!!document.querySelector('#me3d'),null,{timeout:10000});await p.waitForFunction(o=>[...document.querySelectorAll('iframe')].length>0,null,{timeout:10000});
  let fr;for(let i=0;i<100&&!(fr=frame());i++)await p.waitForTimeout(100);await fr.waitForFunction(()=>{const b=document.querySelector('#embedsave');return b&&!b.disabled},null,{timeout:120000});return fr};

 // 1. the Add menu has the entry, and it opens the pop-up
 ok('Add menu has "3D animation"',await p.evaluate(()=>!!document.querySelector('#a3d')));
 await p.evaluate(()=>{ME3D.wait=60000;$('#a3d').click()});
 ok('pop-up opens with 3d-editor inside',await p.evaluate(()=>!!document.querySelector('#me3d iframe')&&document.querySelector('#me3df').src.includes('embed=1')));
 let fr=await ready();
 // size to ask for: the project size (3d-editor gets it in the open message)
 const opts=await fr.evaluate(()=>[...document.querySelector('#tlsz').options].map(o=>o.value));
 ok('3d-editor was told the project size',opts.includes('1920x1080'),opts);
 // a short animation and a small video, to keep the test quick
 await fr.evaluate(()=>{const s=document.querySelector('#tlsz');s.add(new Option('640x360','640x360'));s.value='640x360';me3d.timeline.loadPose({duration:1,bones:{RightUpperArm:[{f:0,rot:[0,0,0]},{f:8,rot:[0,0,90]},{f:15,rot:[0,0,0]}]}})});
 await fr.click('#embedsave');
 await p.waitForFunction(()=>P.layers.some(l=>l.type=='media'&&MB[l.id]&&MB[l.id].src3d),null,{timeout:180000});
 await p.waitForFunction(()=>{const l=P.layers.find(l=>MB[l.id]&&MB[l.id].src3d);return l&&l.e<1e9},null,{timeout:20000});
 ok('pop-up closed after Save',await p.evaluate(()=>!document.querySelector('#me3d')&&!ME3D.box));
 const c1=await p.evaluate(()=>{const L=P.layers.find(l=>MB[l.id]&&MB[l.id].src3d),m=MB[L.id];return{id:L.id,n:P.layers.length,name:L.name,kind:m.kind,vid:L.vid,srcSize:m.src3d.size,videoSize:m.blob.size,dur:L.el.duration,len:L.e-L.s,w:L.p.w,h:L.p.h,spd:L.spd||1,s:L.s}});
 console.log(' ',JSON.stringify(c1));
 ok('a video layer was added, named 3D animation',c1.kind=='video'&&c1.vid&&c1.name=='3D animation',c1);
 ok('the video is as long as the animation (1 s of animation = 16 frames at 15 per second)',isFinite(c1.dur)&&Math.abs(c1.dur-16/15)<.1,c1);
 ok('the clip is as long as the video (speed 1)',Math.abs(c1.len-c1.dur)<.05&&c1.spd==1,c1);
 ok('the picture fills the project (cover fit)',c1.w==1920&&c1.h==1080,c1);
 ok('the editable GLB is stored with the media',c1.srcSize>100000,c1);
 // transparency: draw the clip's current frame, the corner must be see-through and the avatar must be there
 const al=await p.evaluate(async id=>{const L=P.layers.find(l=>l.id==id),v=L.el;v.currentTime=.3;await new Promise(r=>{v.onseeked=r;setTimeout(r,3000)});
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(v,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let opaque=0,clear=0;for(let i=3;i<d.length;i+=4){if(d[i]>240)opaque++;else if(d[i]<10)clear++}
  return{w:c.width,h:c.height,corner:d[3],opaquePct:+(100*opaque/(d.length/4)).toFixed(1),clearPct:+(100*clear/(d.length/4)).toFixed(1)}},c1.id);
 console.log(' ',JSON.stringify(al));
 ok('the video keeps its transparency (background clear, avatar opaque)',al.corner<10&&al.clearPct>60&&al.opaquePct>3,al);
 // 2. saved with the project in the browser (IndexedDB): reload the page
 await p.evaluate(()=>projFlush());await boot();
 const c2=await p.evaluate(()=>{const L=P.layers.find(l=>l.type=='media'&&MB[l.id]);const m=L&&MB[L.id];return L?{src:m.src3d&&m.src3d.size,vid:L.vid,dur:L.el&&L.el.duration,n:P.layers.length}:null});
 ok('after a reload the clip and its editable source are back',c2&&c2.src==c1.srcSize&&c2.vid&&isFinite(c2.dur),c2);

 // 3. Edit in 3d-editor
 const id=await p.evaluate(()=>P.layers.find(l=>MB[l.id]&&MB[l.id].src3d).id);
 await p.evaluate(id=>{const L=P.layers.find(l=>l.id==id);L.p.x=123;L.p.y=-45;L.name='Hero';sel=id;tab='Media';all();window.__oldBlob=MB[id].blob},id);
 ok('Media tab shows "Edit in 3d-editor"',await p.evaluate(()=>!!document.querySelector('#side [data-me3d]')));
 await p.evaluate(()=>{ME3D.wait=60000;document.querySelector('#side [data-me3d]').click()});
 fr=await ready();
 const back=await fr.evaluate(()=>({arm:(me3d.timeline.tracks.RightUpperArm||[]).length,dur:me3d.timeline.state.duration,bones:me3d.bones.length}));
 ok('your keyframes came back in 3d-editor',back.arm==3&&back.dur==1&&back.bones==15,back);
 // a message that does not come from the frame is ignored
 const layersBefore=await p.evaluate(()=>P.layers.length);
 await p.evaluate(()=>{window.postMessage({app:'3d-editor',v:1,type:'save',video:new Blob([new Uint8Array(5000)]),glb:new ArrayBuffer(10),slow:1},'*')});
 await p.waitForTimeout(500);
 ok('a message not from the frame is ignored',await p.evaluate(n=>!!document.querySelector('#me3d')&&P.layers.length==n&&MB[P.layers.find(l=>MB[l.id]&&MB[l.id].src3d).id].blob===window.__oldBlob,layersBefore));
 await fr.evaluate(()=>{me3d.timeline.state.duration=1.5;const s=document.querySelector('#tlsz');s.add(new Option('640x360','640x360'));s.value='640x360'});
 await fr.click('#embedsave');
 await p.waitForFunction(id=>MB[id]&&MB[id].blob!==window.__oldBlob&&!document.querySelector('#me3d'),id,{timeout:180000});
 await p.waitForTimeout(500);
 const c3=await p.evaluate(async id=>{const L=P.layers.find(l=>l.id==id),m=MB[id],buf=await m.src3d.arrayBuffer(),dv=new DataView(buf),jl=dv.getUint32(12,true),j=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),x=j.nodes.find(n=>n.extras&&n.extras.me3d);
  return{same:!!L,n:P.layers.length,x:L.p.x,y:L.p.y,name:L.name,kind:m.kind,srcDur:x&&x.extras.me3d.duration,spd:L.spd||1,vid:L.vid,dur:L.el&&L.el.duration,tab}},id);
 console.log(' ',JSON.stringify(c3));
 ok('Save replaced the video of the same layer (no new layer)',c3.same&&c3.n==layersBefore&&c3.kind=='video',c3);
 ok('position and name of the layer were kept',c3.x==123&&c3.y==-45&&c3.name=='Hero',c3);
 ok('the stored source now has the edited length',c3.srcDur==1.5,c3);
 ok('the new video is as long as the edited animation (1.5 s = 24 frames)',c3.vid&&Math.abs(c3.dur-24/15)<.1,c3);

 // 4. a slowed video (only the real-time fallback makes one): Speed is set so it plays at the right speed.
 // Called directly with this clip's own video, so it does not depend on how fast this computer records.
 const c4=await p.evaluate(async id=>{const m=MB[id],glb=await m.src3d.arrayBuffer(),n0=P.layers.length;ME3D.layer=null;
  await me3dSave({video:m.blob,glb,slow:2,animationFps:15});
  await new Promise(r=>setTimeout(r,1500));
  const L=P.layers.find(l=>l.id!=id&&MB[l.id]&&MB[l.id].src3d&&(l.spd||1)==2);return L?{n:P.layers.length-n0,spd:L.spd,dur:L.el.duration,len:L.e-L.s}:null},id);
 ok('slowed video: a new clip with Speed 2, half as long as the video',c4&&c4.n==1&&c4.spd==2&&c4.dur>.9&&Math.abs(c4.len-c4.dur/2)<.06,c4);

 // 5. Cancel changes nothing
 const before=await p.evaluate(()=>({n:P.layers.length}));
 await p.evaluate(()=>{ME3D.wait=60000;me3dOpen(null)});
 fr=await ready();await fr.click('#embedcancel');
 await p.waitForFunction(()=>!document.querySelector('#me3d'),null,{timeout:5000});
 ok('Cancel closes the pop-up and adds nothing',await p.evaluate(n=>P.layers.length==n,before.n));

 // 6. a frame that never answers says what to do
 await p.evaluate(()=>{localStorage.setItem('me3dUrl','http://127.0.0.1:59999/');ME3D.wait=1500;me3dOpen(null)});
 await p.waitForFunction(()=>/did not answer/.test((document.querySelector('#me3ds')||{}).textContent||''),null,{timeout:8000}).catch(()=>{});
 ok('no answer: a message explains how to fix it',await p.evaluate(()=>/did not answer at http:\/\/127\.0\.0\.1:59999/.test(document.querySelector('#me3ds').textContent)&&/Address/.test(document.querySelector('.me3dh').textContent)));
 await p.evaluate(u=>{me3dClose();localStorage.setItem('me3dUrl',u)},URL3D);
 ok('closing leaves no pop-up behind',await p.evaluate(()=>!document.querySelector('#me3d')&&!ME3D.box));

 // 7. the editable source travels with saved project files (JSON and binary)
 const srcSizes=await p.evaluate(()=>P.layers.filter(l=>MB[l.id]&&MB[l.id].src3d).map(l=>MB[l.id].src3d.size).sort());
 const j=await p.evaluate(async()=>{const o=JSON.parse(await(await projFileBlob({set(){}},()=>false)).text());await projImport(o.P,o,'json copy');return P.layers.filter(l=>MB[l.id]&&MB[l.id].src3d).map(l=>MB[l.id].src3d.size).sort()});
 ok('project JSON file keeps the editable sources',JSON.stringify(j)==JSON.stringify(srcSizes),{srcSizes,j});
 const m=await p.evaluate(async()=>{const bl=projBinBlob(),head=await bl.slice(0,4).text(),o=await projBinRead(bl);await projImport(o.P,o,'bin copy');return{head,sizes:P.layers.filter(l=>MB[l.id]&&MB[l.id].src3d).map(l=>MB[l.id].src3d.size).sort(),vid:P.layers.filter(l=>l.vid).length}});
 ok('project binary file (.mep) keeps the editable sources',m.head=='MEP1'&&JSON.stringify(m.sizes)==JSON.stringify(srcSizes),{srcSizes,m});
 ok('no page errors',errs.length==0,errs);
 await b.close();console.log('FAILS',fails);process.exit(fails?1:0)})();
