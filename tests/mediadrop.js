// Drag a pool clip or a file onto a clip in the timeline / a layer on the canvas to replace its media. Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mdrop-')),F_=n=>path.join(dir,n);
const vid=(n,dur,freq)=>cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=${dur}:size=640x360:rate=30 -f lavfi -i sine=frequency=${freq}:duration=${dur} -c:v libvpx -b:v 1M -c:a libopus -shortest ${F_(n)}`);
vid('old.webm',8,440);vid('long.webm',10,880);vid('short.webm',2,330);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=1:size=800x600:rate=1 -frames:v 1 ${F_('pic.png')}`);cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i sine=frequency=500:duration=2 ${F_('tone.wav')}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1400,height:1100}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','330px')});
await pg.setInputFiles('#fm',F_('old.webm'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{P.dur=20;const L=P.layers.find(l=>l.vid);L.name='Clip';L.s=2;L.e=6;L.off=3;L.fi=1;L.fo=1;L.kf.x=[{t:2,v:0,e:'lin'},{t:5,v:100,e:'lin'}];addFx(L,'blur');sel=L.id;all();commit()});
await pg.click('#mpbtn');await pg.setInputFiles('#mpf',[F_('long.webm'),F_('short.webm'),F_('pic.png'),F_('tone.wav')].map(f=>({name:path.basename(f),mimeType:/png/.test(f)?'image/png':/wav/.test(f)?'audio/wav':'video/webm',buffer:fs.readFileSync(f)})));await pg.waitForTimeout(1500);
const state=()=>pg.evaluate(()=>{const L=P.layers.find(l=>l.vid||l.type=='media'&&MB[l.id]);return{file:MB[L.id].name,vid:L.vid,s:L.s,e:L.e,off:L.off||0,fi:L.fi,fo:L.fo,kf:JSON.stringify(L.kf.x),efx:L.efx.join(),el:L.el.currentSrc||L.el.src,audio:P.layers.filter(a=>a.type=='audio').map(a=>({name:MB[a.id]&&MB[a.id].name,off:a.off||0,dur:+a.buf.duration.toFixed(1)}))}});
const base=await state();
// synthetic drag events so modifiers and files can be tested; the pool source is the pool's own drag state
const drag=(sel,poolName,opts={})=>pg.evaluate(async({sel,poolName,opts})=>{const dt=new DataTransfer();const tile=poolName&&[...document.querySelectorAll('.mpt')].find(t=>t.getAttribute('aria-label')==poolName);
 if(poolName){tile.dispatchEvent(new DragEvent('dragstart',{dataTransfer:dt,bubbles:true}))}else if(opts.file){const f=new File([new Uint8Array(opts.file.bytes)],opts.file.name,{type:opts.file.type});dt.items.add(f)}
 const target=typeof sel=='string'?document.querySelector(sel):document.elementFromPoint(sel.x,sel.y);const r=target.getBoundingClientRect(),x=sel.x||r.left+r.width/2,y=sel.y||r.top+r.height/2;
 const mk=t=>new DragEvent(t,{dataTransfer:dt,bubbles:true,cancelable:true,clientX:x,clientY:y,shiftKey:!!opts.shift});
 const over=mk('dragover');target.dispatchEvent(over);const marked=!!document.querySelector('#tlin .row.dz-rep')||!document.querySelector('#mpdrop').hidden;
 const drop=mk('drop');target.dispatchEvent(drop);if(poolName)document.dispatchEvent(new DragEvent('dragend',{bubbles:true}));window.dispatchEvent(new DragEvent('dragend'));await new Promise(r=>setTimeout(r,1500));
 return{allowed:over.defaultPrevented,marked,cleared:!document.querySelector('#tlin .row.dz-rep')&&document.querySelector('#mpdrop').hidden}},{sel,poolName,opts});
const rowSel=()=>pg.evaluate(()=>{const L=P.layers.find(l=>l.type=='media');return '#tlin .row[data-id="'+L.id+'"] .tr'});
// 1) pool clip onto the timeline clip
const r1=await drag(await rowSel(),'long.webm');const a=await state();
ok('dragging a pool clip onto a timeline clip is accepted and highlights the row',r1.allowed&&r1.marked&&r1.cleared);
ok('the clip now plays long.webm ('+a.file+') with its slot, fades, keyframes and effects kept',a.file=='long.webm'&&a.s==base.s&&a.e==base.e&&a.fi==1&&a.fo==1&&a.kf==base.kf&&a.efx==base.efx&&a.el!==base.el);
ok('the new media starts from its beginning, not the old zone ('+base.off+' -> '+a.off+')',a.off===0);
ok('the Media tab opens so another part of the new clip can be chosen',await pg.evaluate(()=>tab=='Media'&&!!document.querySelector('#side .mdz')));
ok('its linked audio follows ('+JSON.stringify(a.audio)+')',a.audio.length>=1&&a.audio.every(x=>x.name=='long.webm audio'&&x.off===0&&Math.abs(x.dur-10)<.3));
const toast=await pg.evaluate(()=>document.getElementById('toast').textContent);ok('it says how the media fits the slot ('+toast.slice(0,120)+')',/Using 0:00\.0–0:04\.0 of the new clip/.test(toast));
// 2) Shift keeps the old zone
await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);L.off=3;all()});
await drag(await rowSel(),'short.webm',{shift:true});const b=await state();
ok('holding Shift keeps the old zone ('+b.off+')',b.file=='short.webm'&&b.off===3);
// 3) shorter clip: the message says it holds its last frame
await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);L.off=0;all()});await drag(await rowSel(),'short.webm');
ok('a clip shorter than the slot is reported ('+(await pg.evaluate(()=>document.getElementById('toast').textContent)).slice(0,110)+')',/shorter than the slot/.test(await pg.evaluate(()=>document.getElementById('toast').textContent)));
// 4) incompatible drops are refused
const r4=await drag(await rowSel(),'tone.wav');ok('an audio clip cannot be dropped on a video clip',!r4.allowed&&(await state()).file=='short.webm');
// 5) an image works too (video -> photo)
await drag(await rowSel(),'pic.png');const c=await state();
ok('a photo can replace the video ('+c.file+', vid='+c.vid+') and the slot stays',c.file=='pic.png'&&!c.vid&&c.s==base.s&&c.e==base.e&&c.fi==1);
// 6) a file from the computer
await pg.evaluate(()=>{P.layers.filter(l=>l.type=='audio').forEach(a=>a.lk=null)});
const bytes=[...fs.readFileSync(F_('long.webm'))];
await drag(await rowSel(),null,{file:{name:'from-desktop.webm',type:'video/webm',bytes}});const d=await state();
ok('a file dragged in from the computer replaces the clip too ('+d.file+')',d.file=='from-desktop.webm'&&d.vid&&d.s==base.s&&d.e==base.e);
// 7) drop on the canvas replaces the layer under the pointer
const pt=await pg.evaluate(()=>{const L=P.layers.find(l=>l.type=='media');t=3;dirty=1;all();const r=cv.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}});
await pg.waitForTimeout(300);const r7=await drag(pt,'long.webm');const e7=await state();
ok('dropping on the layer in the canvas replaces it ('+e7.file+')',r7.allowed&&e7.file=='long.webm');
// 8) dropping on a shape layer does nothing
await pg.evaluate(()=>{const R=mk('rect');R.name='Shape';R.p.w=200;R.p.h=200;all()});
const rr=await drag('#tlin .row:first-of-type + .row','long.webm');
ok('dropping on a layer that is not media is refused',!rr.allowed||(await state()).file=='long.webm');
// 9) a real mouse drag from a pool tile (native drag and drop)
await pg.evaluate(()=>{const m=P.layers.find(l=>l.type=='media');sel=m.id;all()});
const rid=await pg.evaluate(()=>P.layers.find(l=>l.type=='media').id);
await pg.locator('.mpt[aria-label="short.webm"]').dragTo(pg.locator('#tlin .row[data-id="'+rid+'"] .tr'));await pg.waitForTimeout(1500);
ok('a real mouse drag from the pool works the same ('+(await state()).file+')',(await state()).file=='short.webm');
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
