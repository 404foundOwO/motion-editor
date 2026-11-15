// Clip speed (L.spd): length, media time, linked audio, split, trim, panel. Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'spd-')),F_=n=>path.join(dir,n);
cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=10:size=640x360:rate=30 -f lavfi -i sine=frequency=440:duration=10 -c:v libvpx -b:v 1M -g 15 -c:a libopus -shortest ${F_('v.webm')}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1400,height:1100}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n').slice(1,4).join('|')));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.setInputFiles('#fm',F_('v.webm'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{P.dur=20;const L=P.layers.find(l=>l.vid);L.s=2;L.e=6;L.off=1;P.layers.filter(a=>a.type=='audio').forEach(a=>{a.s=2;a.e=6;a.off=1});sel=L.id;tab='Media';all();commit()});
ok('the Media tab has a speed field',await pg.evaluate(()=>!!document.querySelector('#side [data-mspd]')));
await pg.evaluate(()=>setSpeed(P.layers.find(l=>l.vid),2));
const a=await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid),A=P.layers.filter(x=>x.type=='audio');return{s:L.s,e:L.e,spd:L.spd,off:L.off,au:A.map(x=>[x.s,x.e,x.spd])}});
ok('2x halves the clip and keeps start and used part ('+JSON.stringify(a)+')',a.s==2&&Math.abs(a.e-4)<1e-6&&a.spd==2&&a.off==1);
ok('linked audio gets the same speed and length',a.au.length>=1&&a.au.every(x=>x[0]==2&&Math.abs(x[1]-4)<1e-6&&x[2]==2));
await pg.evaluate(()=>{t=3;dirty=1});await pg.waitForTimeout(1500);
const vt=await pg.evaluate(()=>P.layers.find(l=>l.vid).el.currentTime);ok('the preview shows media time off+(t-s)*2 = 3 ('+vt.toFixed(2)+')',Math.abs(vt-3)<.25);
await pg.evaluate(()=>{t=3;$('#sp').click()});
const b=await pg.evaluate(()=>{const V=P.layers.filter(l=>l.vid);return V.map(l=>[l.s,+l.e.toFixed(3),+(l.off||0).toFixed(3),l.spd])});
ok('a split keeps the speed and continues the media ('+JSON.stringify(b)+')',b.length==2&&b[1][2]==3&&b[1][3]==2&&b[0][3]==2);
await pg.evaluate(()=>undo());await pg.evaluate(()=>setSpeed(P.layers.find(l=>l.vid),1));
const c=await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);return{e:L.e,spd:L.spd}});ok('back to 1x restores the length and drops the field ('+JSON.stringify(c)+')',Math.abs(c.e-6)<1e-6&&c.spd===undefined);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
