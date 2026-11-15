// Media tab: details, Replace media (keeps transitions/effects/timing), where it is used, linked audio, pool, reload. Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mprops-')),F_=n=>path.join(dir,n);
const vid=(n,size,dur,freq)=>cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=${dur}:size=${size}:rate=30 -f lavfi -i sine=frequency=${freq}:duration=${dur} -c:v libvpx -b:v 1M -c:a libopus -shortest ${F_(n)}`);
vid('A.webm','640x360',6,440);vid('B.webm','1280x720',3,880);vid('C.webm','640x360',4,330);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=1:size=800x600:rate=1 -frames:v 1 ${F_('p1.png')}`);cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=1:size=1000x1000:rate=1 -frames:v 1 ${F_('p2.png')}`);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i sine=frequency=500:duration=2 ${F_('tone.wav')}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1400,height:900}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
// import a video (it also creates a linked audio layer)
await pg.setInputFiles('#fm',F_('A.webm'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{P.dur=20;const L=P.layers.find(l=>l.vid);L.s=1;L.e=5;L.off=2;L.fi=1;L.fo=1;L.kf.x=[{t:1,v:0,e:'lin'},{t:3,v:200,e:'lin'}];addFx(L,'blur');sel=L.id;tab='Media';all()});
const tabs=await pg.evaluate(()=>[...document.querySelectorAll('#side [data-tab]')].map(b=>b.dataset.tab));ok('video layers have a Media tab ('+tabs.join(',')+')',tabs.includes('Media'));
const txt=await pg.evaluate(()=>document.querySelector('#side').innerText);
ok('it shows the file name, type, size, dimensions and duration',/A\.webm/.test(txt)&&/Video\s*·\s*WEBM/.test(txt)&&/640×360 px/.test(txt)&&/Duration 0:06\.0/.test(txt));
ok('and which part of the media is used ('+(txt.match(/Using [^\n]*/)||[''])[0]+')',/Using 0:02\.0–0:06\.0 of 0:06\.0/.test(txt));
ok('"Where it is used" lists this layer once',/Where it is used \(1\)/i.test(txt)&&/this layer/.test(txt));
// copy + paste, then replace the media in the copy
const snap=()=>pg.evaluate(()=>{const o=P.layers.filter(l=>l.vid).map(l=>({id:l.id,name:l.name,s:l.s,e:l.e,off:l.off,fi:l.fi,fo:l.fo,kf:JSON.stringify(l.kf.x),efx:l.efx.join(),w:l.p.w,h:l.p.h,file:MB[l.id]&&MB[l.id].name,lk:l.lk||null,el:l.el.currentSrc||l.el.src}));return{video:o,audio:P.layers.filter(l=>l.type=='audio').map(l=>({id:l.id,lk:l.lk||null,dur:+l.buf.duration.toFixed(1),name:MB[l.id]&&MB[l.id].name}))}});
const before=await snap();
await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);sel=L.id;copyAny();pasteAny()});
const pasted=await pg.evaluate(()=>cur().id);
const pastedBefore=(await snap()).video.find(v=>v.id==pasted);
await pg.evaluate(()=>{tab='Media';all()});
ok('after pasting, the media is used in 2 places',/Where it is used \(2\)/i.test(await pg.evaluate(()=>document.querySelector('#side').innerText)));
await pg.setInputFiles('#mrf',F_('B.webm'));await pg.waitForFunction(()=>/Replaced .+ with /.test(document.querySelector('#mst')?.textContent||''),null,{timeout:15000});
const after=await snap();const orig=after.video.find(v=>v.id==before.video[0].id),copy=after.video.find(v=>v.id==pasted),b0=before.video[0];
ok('the copy now plays B.webm, the original still plays A.webm ('+copy.file+' / '+orig.file+')',copy.file=='B.webm'&&orig.file=='A.webm'&&copy.el!==orig.el);
ok('the copy keeps its fades, keyframes, effects and in/out points, and the new media starts from its beginning',copy.fi==1&&copy.fo==1&&copy.kf==pastedBefore.kf&&copy.efx==b0.efx&&copy.s==pastedBefore.s&&copy.e==pastedBefore.e&&copy.off===0&&copy.e-copy.s==b0.e-b0.s);
ok('the new 16:9 video fits the old box ('+copy.w+'x'+copy.h+' vs '+b0.w+'x'+b0.h+')',Math.abs(copy.w-b0.w)<=1&&Math.abs(copy.h-b0.h)<=1);
ok('the original is untouched',orig.s==b0.s&&orig.e==b0.e&&orig.fi==1&&orig.w==b0.w);
const ca=after.audio,origAudio=ca.find(a=>a.lk==b0.lk&&a.id==before.audio[0].id);
ok('the original keeps its own audio ('+JSON.stringify(origAudio)+') and the copy got its own, from B ('+JSON.stringify(ca.filter(a=>a.id!=before.audio[0].id).map(a=>[a.name,a.dur]))+')',origAudio&&origAudio.dur==6&&origAudio.name=='A.webm audio'&&ca.some(a=>a.name=='B.webm audio'&&Math.abs(a.dur-3)<.2)&&copy.lk&&copy.lk!==orig.lk);
const uses2=await pg.evaluate(id=>{const L=P.layers.find(l=>l.id==id);return mediaUses(L).length},pasted);ok('afterwards each is used in exactly 1 place',uses2==1);
// where used: click jumps to the layer
await pg.evaluate(()=>{const o=P.layers.find(l=>l.vid&&MB[l.id].name=='A.webm');sel=o.id;tab='Media';all()});
await pg.evaluate(()=>{const G=P.layers.find(l=>l.vid&&MB[l.id].name=='A.webm');const x=P.layers.find(l=>l.vid&&MB[l.id].name=='B.webm');x.s=9;x.e=12;x.p.op=1;sel=G.id;copyAny();pasteAny();const c=cur();c.s=14;c.e=18;sel=G.id;tab='Media';all()});
ok('the list has a row per place with its time range',await pg.evaluate(()=>document.querySelectorAll('#side [data-mgo]').length)==2);
await pg.click('#side [data-mgo]:not(.on)');const jumped=await pg.evaluate(()=>({t,sel,s:cur().s}));ok('clicking a row selects that layer and jumps to its start ('+JSON.stringify(jumped)+')',jumped.s==14&&Math.abs(jumped.t-14)<.01);
// replace in all places
await pg.evaluate(()=>{const G=P.layers.find(l=>l.vid&&MB[l.id].name=='A.webm');sel=G.id;tab='Media';all()});
await pg.check('#mall');await pg.setInputFiles('#mrf',F_('C.webm'));await pg.waitForFunction(()=>/Replaced .+ with C\.webm/.test(document.querySelector('#mst')?.textContent||''),null,{timeout:15000});
const all2=await snap();const cs=all2.video.filter(v=>v.file=='C.webm');
ok('"Replace in all places" changed both ('+cs.length+' clips now use C.webm)',cs.length==2&&!all2.video.some(v=>v.file=='A.webm'));
ok('and their shared audio was swapped in place, not duplicated',all2.audio.filter(a=>a.name=='C.webm audio').length==1&&all2.audio.find(a=>a.name=='C.webm audio').dur==4);
// photo with a different shape
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',F_('p1.png'));await pg.waitForTimeout(1500);
const p0=await pg.evaluate(()=>{const L=cur();L.p.w=800;L.p.h=600;L.fi=.5;tab='Media';all();return{w:L.p.w,h:L.p.h}});
await pg.setInputFiles('#mrf',F_('p2.png'));await pg.waitForFunction(()=>/Replaced .+ with /.test(document.querySelector('#mst')?.textContent||''),null,{timeout:10000});
const p1=await pg.evaluate(()=>{const L=cur();return{w:L.p.w,h:L.p.h,fi:L.fi,file:MB[L.id].name,nat:L.el.naturalWidth}});
ok('a photo swapped for a square one fits inside the old box without stretching ('+p1.w+'x'+p1.h+') and keeps its fade',p1.file=='p2.png'&&p1.w==p1.h&&p1.w<=800&&p1.h<=600&&p1.fi==.5&&p1.nat==1000);
// replace from the media pool
await pg.click('#mpbtn');await pg.setInputFiles('#mpf',F_('p1.png'));await pg.waitForTimeout(800);
await pg.evaluate(()=>{tab='Media';all()});await pg.selectOption('select[data-mpool]',{index:1});await pg.waitForFunction(()=>/Replaced .+ with p1\.png/.test(document.querySelector('#mst')?.textContent||''),null,{timeout:10000});
ok('a clip can be chosen from the media pool',(await pg.evaluate(()=>MB[cur().id].name))=='p1.png');
// audio layer
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.evaluate(async()=>{const c=new AudioContext(),b=c.createBuffer(1,48000*3,48000);addAudio(b,'old tone');const L=cur();L.p.vol=.5;L.s=2;tab='Media';all()});
await pg.setInputFiles('#mrf',F_('tone.wav'));await pg.waitForFunction(()=>/Replaced .+ with /.test(document.querySelector('#mst')?.textContent||''),null,{timeout:10000});
const au=await pg.evaluate(()=>{const L=cur();return{name:MB[L.id].name,dur:+L.buf.duration.toFixed(1),vol:L.p.vol,s:L.s,tabs:[...document.querySelectorAll('#side [data-tab]')].map(b=>b.dataset.tab).join()}});
ok('an audio layer can be replaced too and keeps its volume and start ('+JSON.stringify(au)+')',au.name=='tone.wav'&&au.dur==2&&au.vol==.5&&au.s==2&&/Media/.test(au.tabs));
// it is saved with the project
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',F_('p1.png'));await pg.waitForTimeout(1500);
await pg.evaluate(()=>{tab='Media';all()});await pg.setInputFiles('#mrf',F_('p2.png'));await pg.waitForFunction(()=>/Replaced .+ with /.test(document.querySelector('#mst')?.textContent||''),null,{timeout:10000});
await pg.evaluate(()=>saveNow(true));await pg.waitForTimeout(800);await pg.reload();await pg.waitForTimeout(2500);
const re=await pg.evaluate(()=>{const L=P.layers.find(l=>l.type=='media');return L?{file:MB[L.id]&&MB[L.id].name,nat:L.el&&L.el.naturalWidth}:null});
ok('the replacement survives a reload ('+JSON.stringify(re)+')',re&&re.file=='p2.png'&&re.nat==1000);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
