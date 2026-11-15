// Split a video, overlap the halves (crossfade into a different zone of the same clip): each half must play its own zone at the same time.
// Needs Playwright Chromium and ffmpeg (skipped without ffmpeg). Optional arg: path of an index.html to test (default: this repo).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'split-'));const vid=path.join(dir,'clip.webm');
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=10:size=640x360:rate=30 -c:v libvpx -b:v 1M -g 15 ${vid}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(process.argv[2]||path.join(__dirname,'../index.html')));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.setInputFiles('#fm',vid);await pg.waitForTimeout(1500);
// split at 3 s: first half 0-3, second half 3-10 (continues the footage)
await pg.evaluate(()=>{P.dur=20;const L=cur();L.s=0;L.e=10;t=3;dirty=1;all()});
await pg.click('#sp');await pg.waitForTimeout(300);
const ids=await pg.evaluate(()=>{const v=P.layers.filter(l=>l.vid);return v.map(l=>l.id)});
ok('the split made two video layers',ids.length==2);
// the second half should use a different zone (starts at 6 s of the video) and fade in while the first half is still going
await pg.evaluate(([a,b])=>{const A=P.layers.find(l=>l.id==a),B=P.layers.find(l=>l.id==b);A.s=0;A.e=5;A.off=0;B.s=3;B.e=8;B.off=6;t=0;dirty=1;all();window.__A=A;window.__B=B},ids);
ok('the two halves have separate video elements',await pg.evaluate(()=>window.__A.el!==window.__B.el));
await pg.evaluate(()=>{window.__s={A:0,B:0};['A','B'].forEach(k=>window['__'+k].el.addEventListener('seeking',()=>window.__s[k]++))});
await pg.click('#pl');
await pg.waitForFunction(()=>t>3.3,null,{timeout:15000});await pg.waitForTimeout(400);
const rows=[];for(let i=0;i<10;i++){rows.push(await pg.evaluate(()=>{const g=(L)=>({vt:L.el.currentTime,want:(L.off||0)+t-L.s,paused:L.el.paused});return{t:+t.toFixed(2),A:g(window.__A),B:g(window.__B)}}));await pg.waitForTimeout(150)}
await pg.click('#pl');
const bad=rows.filter(r=>r.t<4.8).filter(r=>Math.abs(r.A.vt-r.A.want)>.45||Math.abs(r.B.vt-r.B.want)>.45||r.A.paused||r.B.paused);
const seeks=await pg.evaluate(()=>window.__s);
ok('during the overlap both halves play their own zone ('+rows.map(r=>`A${(r.A.vt-r.A.want).toFixed(1)}/B${(r.B.vt-r.B.want).toFixed(1)}`).join(' ')+')',bad.length==0);
ok('no seek thrashing ('+JSON.stringify(seeks)+')',seeks.A<=3&&seeks.B<=3);
// paste/duplicate also gives its own element
const dup=await pg.evaluate(()=>{sel=window.__A.id;copyAny();pasteAny();const c=cur();return{vid:c.vid,own:c.el!==window.__A.el&&c.el!==window.__B.el}});
ok('a pasted copy of a video layer also gets its own element',dup.vid&&dup.own);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
