// "Selected zone export": exports only the in/out zone (I and O), and "Forget selected zone" clears it. Needs Playwright Chromium.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),ctx=await br.newContext({viewport:{width:1300,height:800},acceptDownloads:true}),pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
pg.on('dialog',d=>{errs.push('dialog: '+d.message());d.dismiss()});
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
// scene: a white screen that appears at t=1, 6 s long, with a tone
await pg.evaluate(()=>{P.layers.length=0;id=1;P.dur=6;mk('cam');const R=mk('rect');R.p.c1='#ffffff';R.p.w=4000;R.p.h=4000;R.kf.op=[{t:0.99,v:0,e:'hold'},{t:1,v:1,e:'hold'}];
 const c=new AudioContext(),b=c.createBuffer(1,48000*6,48000),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.sin(i/20)*.5;addAudio(b,'tone');P.lp=null;all()});
// dialog without a zone
await pg.click('#exv');await pg.waitForSelector('#exm');
ok('no zone: the checkbox is there but disabled, and no forget button',await pg.evaluate(()=>{const x=document.querySelector('#xz'),b=document.querySelector('#xzb');return !!x&&x.disabled&&!x.checked&&b.style.display=='none'}));
await pg.click('#xc');
// set a zone like I / O do
await pg.evaluate(()=>{P.lp={on:0,a:1,b:3};lpUi();lpDraw()});
await pg.click('#exv');await pg.waitForSelector('#exm');
const lab=await pg.textContent('#xzt');ok('zone set: checkbox enabled, off by default, shows the range ('+lab+')',await pg.evaluate(()=>{const x=document.querySelector('#xz');return !x.disabled&&!x.checked&&document.querySelector('#xzb').style.display!='none'})&&/1\.00–3\.00/.test(lab));
await pg.click('#xz');const info=await pg.textContent('#xi');ok('the estimate uses the zone length ('+info.slice(0,70)+'...)',/About \d+ MB/.test(info));
await pg.click('#xfl button[data-f=wav]');ok('audio info says selected zone: '+(await pg.textContent('#xi')).slice(0,40),/Selected zone, 2\.0 s/.test(await pg.textContent('#xi')));
await pg.click('#xz');ok('unchecked: whole project again',/Whole project, 6\.0 s/.test(await pg.textContent('#xi')));
// forget
await pg.click('#xz');await pg.click('#xzb');
const gone=await pg.evaluate(()=>({lp:P.lp,dis:document.querySelector('#xz').disabled,chk:document.querySelector('#xz').checked,btn:document.querySelector('#xzb').style.display,z:zoneGet()}));
ok('forget clears the zone, unchecks and disables the box',gone.z===null&&gone.lp.on==0&&gone.lp.a==0&&gone.lp.b==6&&gone.dis&&!gone.chk&&gone.btn=='none');
await pg.click('#xc');
await pg.evaluate(()=>{P.lp={on:0,a:1,b:3};lpUi();lpDraw()});
// ---- real exports
const vidInfo=zone=>pg.evaluate(async zone=>{window.__b=null;await startOffline({sc:.25,fps:24,br:2,mp4:false,precise:true,zone,onBlob:b=>{window.__b=b}});
 if(!window.__b)return null;const v=document.createElement('video');v.muted=true;v.src=URL.createObjectURL(window.__b);await new Promise(r=>{v.onloadedmetadata=r;v.onerror=r});
 let d=v.duration;if(!isFinite(d)){v.currentTime=1e9;await new Promise(r=>v.onseeked=r);d=v.currentTime}
 v.currentTime=0.02;await new Promise(r=>v.onseeked=r);const c=document.createElement('canvas');c.width=64;c.height=36;const x=c.getContext('2d');x.drawImage(v,0,0,64,36);return{dur:d,first:x.getImageData(32,18,1,1).data[0]}},zone);
const whole=await vidInfo(null),zon=await vidInfo({a:1,b:3});
ok('frame-by-frame export without a zone is the whole 6 s and starts dark ('+JSON.stringify(whole)+')',whole&&Math.abs(whole.dur-6)<.2&&whole.first<60);
ok('frame-by-frame export of the zone is 2 s and starts at the zone start, already bright ('+JSON.stringify(zon)+')',zon&&Math.abs(zon.dur-2)<.2&&zon.first>200);
// real-time recording of a zone ends at the zone end, not the project end
const rt=await pg.evaluate(async()=>{const t0=performance.now();let got=0;await new Promise(res=>{startExport({sc:.25,fps:30,br:2,mp4:false,zone:{a:1,b:2},onBlob:b=>{got=b.size;res()}})});return{ms:performance.now()-t0,size:got,t:+t.toFixed(2),exp,EXZ}});
ok('real-time export of the zone takes about its 1 s, not 6 s ('+Math.round(rt.ms)+' ms, blob '+rt.size+' B, playhead back at '+rt.t+')',rt.size>0&&rt.ms<3500&&Math.abs(rt.t-1)<.05&&!rt.exp&&rt.EXZ===null);
// audio only
const dl=async zone=>{const p=pg.waitForEvent('download',{timeout:60000});await pg.evaluate(z=>{startAudioExport({f:'wav16',sr:48000,kb:192,norm:false,zone:z})},zone);const d=await p,f=await d.path();return fs.statSync(f).size};
const sw=await dl(null),sz=await dl({a:1,b:3});
ok('WAV of the zone is a third of the whole ('+sz+' vs '+sw+' bytes)',Math.abs(sw-(48000*6*2*2+44))<2000&&Math.abs(sz-(48000*2*2*2+44))<2000);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();process.exit(F||errs.length?1:0)})();
