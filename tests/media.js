// Video clips must start and keep playing without a pause/resume, even when seeking is slow (long keyframe gaps, trimmed start, a jump while playing).
// Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'media-'));const vid=path.join(dir,'longgop.webm');
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=14:size=2560x1440:rate=30 -c:v libvpx-vp9 -b:v 20M -g 9999 -deadline realtime -cpu-used 8 ${vid}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.setInputFiles('#fm',vid);await pg.waitForTimeout(2000);
await pg.evaluate(()=>{P.dur=30;const L=cur();L.s=2;L.e=20;L.off=6;t=0;dirty=1;all();window.__seeks=0;L.el.addEventListener('seeking',()=>window.__seeks++)});
const snap=()=>pg.evaluate(()=>{const L=cur(),v=L.el;return{t,vt:v.currentTime,want:(L.off||0)+t-L.s,paused:v.paused,seeking:v.seeking}});
await pg.waitForTimeout(1800);// let it park
await pg.click('#pl');
// wait for the clip to appear (t=2), then sample
await pg.waitForFunction(()=>t>2.1,null,{timeout:10000});await pg.waitForTimeout(500);
const a=[];for(let i=0;i<8;i++){a.push(await snap());await pg.waitForTimeout(250)}
ok('a trimmed clip that appears during playback plays (drift '+a.map(s=>(s.vt-s.want).toFixed(2)).join(' ')+')',a.every(s=>!s.paused&&Math.abs(s.vt-s.want)<.4)&&a[7].vt>a[0].vt+1.2);
// jump the playhead while playing (like clicking the timeline)
await pg.evaluate(()=>{t=2.2});await pg.waitForTimeout(300);
const b=[];for(let i=0;i<26;i++){b.push(await snap());await pg.waitForTimeout(250)}
if(process.env.DEBUG)console.log(b.map(s=>'t='+s.t.toFixed(2)+' v='+s.vt.toFixed(2)+' want='+s.want.toFixed(2)+(s.paused?' PAUSED':'')+(s.seeking?' SEEKING':'')).join('\n'));
const last=b[b.length-1],moved=b[b.length-1].vt-b[b.length-5].vt;
ok('after a jump while playing it catches up and keeps playing (drift '+(last.vt-last.want).toFixed(2)+', moved '+moved.toFixed(2)+'s in the last second)',!last.seeking&&Math.abs(last.vt-last.want)<.45&&moved>.8);
ok('no seek storm ('+await pg.evaluate(()=>window.__seeks)+' seeks in total)',(await pg.evaluate(()=>window.__seeks))<=8);
await pg.evaluate(()=>{cur().e=Math.max(P.layers.length?t+.5:0,t+.5)});await pg.waitForFunction(()=>t>cur().e+.3,null,{timeout:20000});await pg.waitForTimeout(400);
const e=await snap();ok('video is paused once its clip has ended',e.paused);
await pg.click('#pl');
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
