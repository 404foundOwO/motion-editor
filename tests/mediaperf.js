// Media preview stability/performance: refresh after a seek, cheap fallback-frame cache, large photos decoded ahead and shown from a capped bitmap (originals still used for export).
// Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'perf-'));const vid=path.join(dir,'clip.webm'),img=path.join(dir,'big.jpg'),small=path.join(dir,'small.jpg');
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=8:size=1280x720:rate=30 -c:v libvpx -b:v 2M -g 10 ${vid}`);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=1:size=5600x3600:rate=1 -frames:v 1 ${img}`);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=1:size=1600x900:rate=1 -frames:v 1 ${small}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
// ---- video: the preview must refresh by itself when a seek finishes
await pg.setInputFiles('#fm',vid);await pg.waitForTimeout(1500);
const stale=await pg.evaluate(async()=>{const L=cur();P.dur=8;L.s=0;L.e=8;L.p.w=1280;L.p.h=720;t=.2;dirty=1;all();await new Promise(r=>setTimeout(r,500));
 const px=()=>{const d=MAINCX.getImageData(0,0,W,H).data;let s=0;for(let i=0;i<d.length;i+=4*503)s+=d[i]*3+d[i+1]*5+d[i+2];return s};const bad=[];
 for(const tt of [5,2,6.5,.8]){t=tt;dirty=1;await new Promise(r=>requestAnimationFrame(r));await new Promise(r=>setTimeout(r,900));const settled=px();dirty=1;await new Promise(r=>requestAnimationFrame(r));await new Promise(r=>requestAnimationFrame(r));if(px()!==settled)bad.push(tt)}return bad});
ok('after a paused scrub the preview shows the new frame without any further nudge'+(stale.length?' (stale at '+stale+')':''),stale.length==0);
// ---- video: the fallback copy is refreshed a few times a second, not every frame
const copies=await pg.evaluate(async()=>{const L=cur();t=.1;dirty=1;await new Promise(r=>setTimeout(r,600));document.querySelector('#pl').click();const seen=new Set();let frames=0;
 await new Promise(res=>{const t0=performance.now(),f=()=>{if(L.el.__c&&L.el.__c.__tm)seen.add(L.el.__c.__tm);frames++;if(performance.now()-t0<2000)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});document.querySelector('#pl').click();return{copies:seen.size,frames}});
ok('while playing the fallback frame is refreshed about 5 times a second, not every frame ('+copies.copies+' refreshes in '+copies.frames+' frames)',copies.copies>=3&&copies.copies<=14);
ok('the video itself keeps playing in sync',await pg.evaluate(()=>{const L=cur();return Math.abs(L.el.currentTime-((L.off||0)+t-L.s))<.5||t<.3}));
// ---- large photo
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',img);await pg.waitForTimeout(3000);
const big=await pg.evaluate(()=>{const L=cur(),el=L.el;return{nat:Math.max(el.naturalWidth,el.naturalHeight),bm:el.__bm?Math.max(el.__bm.width,el.__bm.height):0}});
ok('a large photo is decoded ahead and kept as a bitmap capped at 4096 px ('+big.nat+' px original, '+big.bm+' px preview)',big.nat>4096&&big.bm==4096);
const src=await pg.evaluate(()=>{const L=cur();L.p.w=1920;L.p.h=1234;const seen=[],od=MAINCX.drawImage;MAINCX.drawImage=function(s){seen.push(s&&s.constructor&&s.constructor.name);return od.apply(this,arguments)};
 exp=0;dirty=1;draw(0);const prev=seen.slice();seen.length=0;exp=1;draw(0);const exported=seen.slice();exp=0;MAINCX.drawImage=od;return{prev:prev.includes('ImageBitmap')&&!prev.includes('HTMLImageElement'),exported:exported.includes('HTMLImageElement')&&!exported.includes('ImageBitmap')}});
ok('the preview draws the bitmap, an export draws the original',src.prev&&src.exported);
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',small);await pg.waitForTimeout(1500);
ok('a normal-sized photo is left alone (no bitmap)',await pg.evaluate(()=>!cur().el.__bm));
// ---- a photo that has been imported but not yet drawn does not cost a hitch when it first appears
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',img);await pg.waitForTimeout(3500);
const first=await pg.evaluate(async()=>{const L=cur();P.dur=30;L.s=2;L.e=30;L.p.w=1920;L.p.h=1234;t=0;dirty=1;all();await new Promise(r=>setTimeout(r,200));const rows=[],od=window.draw;window.draw=function(tt){const a=performance.now(),r=od.apply(this,arguments);rows.push([tt,performance.now()-a]);return r};
 document.querySelector('#pl').click();await new Promise(r=>setTimeout(r,2800));document.querySelector('#pl').click();window.draw=od;const at=rows.filter(r=>r[0]>=2&&r[0]<2.15).map(r=>r[1]),st=rows.filter(r=>r[0]>2.6).map(r=>r[1]).sort((a,b)=>a-b);return{at:Math.max(...at),steady:st[st.length>>1]}});
ok('the frame where the photo first appears costs about the same as any other ('+first.at.toFixed(1)+' ms vs '+first.steady.toFixed(1)+' ms)',first.at<Math.max(25,first.steady*2.5));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
