// Choosing which part of a clip's media is used: the Used part bar (Media tab), the Start field, and Shift+drag on the clip. Needs Playwright Chromium and ffmpeg (skipped without ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
try{cp.execSync('ffmpeg -version',{stdio:'ignore'})}catch(e){console.log('SKIP: ffmpeg not installed');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'slip-')),F_=n=>path.join(dir,n);
const vid=(n,dur,freq)=>cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc2=duration=${dur}:size=640x360:rate=30 -f lavfi -i sine=frequency=${freq}:duration=${dur} -c:v libvpx -b:v 1M -g 15 -c:a libopus -shortest ${F_(n)}`);
vid('long.webm',10,440);vid('short.webm',2,330);cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i sine=frequency=500:duration=8 ${F_('tone.wav')}`);
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),pg=await (await br.newContext({viewport:{width:1400,height:1100}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.evaluate(()=>{for(const el of [document.documentElement,document.querySelector('#app')])el.style.setProperty('--th','330px')});
await pg.setInputFiles('#fm',F_('long.webm'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{P.dur=20;const L=P.layers.find(l=>l.vid);L.s=2;L.e=6;L.off=0;sel=L.id;tab='Media';all();commit()});
const info=()=>pg.evaluate(()=>{const L=P.layers.find(l=>l.vid),A=P.layers.filter(a=>a.type=='audio'),w=document.querySelector('#side .mdw');return{off:L.off||0,s:L.s,e:L.e,audioOff:A.map(a=>a.off||0),left:w&&parseFloat(w.style.left),width:w&&parseFloat(w.style.width),txt:(document.querySelector('#mdzt')||{}).textContent,input:(document.querySelector('#side input[data-mdoff]')||{}).value,vt:+L.el.currentTime.toFixed(2)}});
const i0=await info();
ok('the Media tab shows a Used part bar with a window the size of the clip ('+i0.width+'% of the media)',Math.abs(i0.width-40)<.5&&i0.left===0&&/Using 0:00\.0–0:04\.0 of 0:10\.0/.test(i0.txt));
const bar=await pg.evaluate(()=>{const r=document.querySelector('#side .mdz').getBoundingClientRect();return{x:r.left,y:r.top+r.height/2,w:r.width}});
// drag the window 30% of the bar to the right (+3 s of a 10 s clip)
await pg.mouse.move(bar.x+bar.w*.2,bar.y);await pg.mouse.down();await pg.mouse.move(bar.x+bar.w*.35,bar.y,{steps:6});await pg.mouse.move(bar.x+bar.w*.5,bar.y,{steps:6});await pg.mouse.up();await pg.waitForTimeout(400);
const i1=await info();
ok('dragging the bar moves the used part to about 3 s ('+i1.off+'), the clip keeps its place and length',Math.abs(i1.off-3)<.1&&i1.s==2&&i1.e==6);
ok('the window, the text and the Start field follow ('+i1.left+'%, "'+i1.txt+'", '+i1.input+')',Math.abs(i1.left-30)<1&&/Using 0:03\.0–0:07\.0/.test(i1.txt)&&Math.abs(+i1.input-3)<.1);
ok('the linked audio uses the same part ('+JSON.stringify(i1.audioOff)+')',i1.audioOff.length>=1&&i1.audioOff.every(o=>Math.abs(o-i1.off)<.001));
await pg.evaluate(()=>{t=2;dirty=1});await pg.waitForTimeout(1500);
ok('the preview really shows that part (the video is at '+(await info()).vt+' s for the clip start)',Math.abs((await info()).vt-i1.off)<.25);
// clamping
await pg.mouse.move(bar.x+bar.w*.4,bar.y);await pg.mouse.down();await pg.mouse.move(bar.x+bar.w+80,bar.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(300);
ok('it cannot go past the end of the media ('+(await info()).off+' of max 6)',Math.abs((await info()).off-6)<.05);
await pg.mouse.move(bar.x+bar.w*.8,bar.y);await pg.mouse.down();await pg.mouse.move(bar.x-120,bar.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(300);
ok('or before the start ('+(await info()).off+')',(await info()).off===0);
// the Start field
await pg.fill('#side input[data-mdoff]','2.5');await pg.dispatchEvent('#side input[data-mdoff]','change');await pg.waitForTimeout(300);
ok('typing a start time works ('+(await info()).off+') and the window follows ('+(await info()).left+'%)',Math.abs((await info()).off-2.5)<.05&&Math.abs((await info()).left-25)<1);
await pg.fill('#side input[data-mdoff]','99');await pg.dispatchEvent('#side input[data-mdoff]','change');await pg.waitForTimeout(300);
ok('a start past the end is limited ('+(await info()).off+')',Math.abs((await info()).off-6)<.05);
// undo
await pg.evaluate(()=>undo());await pg.waitForTimeout(200);ok('undo brings the previous part back ('+(await info()).off+')',Math.abs((await info()).off-2.5)<.05);
// Shift+drag on the clip in the timeline
await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);L.off=5;tab='Media';all();commit()});
const clip=await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid),b=document.querySelector('#tlin .row[data-id="'+L.id+'"] .bar').getBoundingClientRect(),r=document.querySelector('#ru').getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2,secPerPx:P.dur/r.width}});
await pg.keyboard.down('Shift');await pg.mouse.move(clip.x,clip.y);await pg.mouse.down();await pg.mouse.move(clip.x+30,clip.y,{steps:5});await pg.mouse.move(clip.x+60,clip.y,{steps:5});await pg.mouse.up();await pg.keyboard.up('Shift');await pg.waitForTimeout(400);
const i4=await info(),want=5-60*clip.secPerPx;
ok('Shift+drag on the clip slides the media inside it: 60 px to the right shows an earlier part ('+i4.off+' vs '+want.toFixed(2)+'), the clip stays at '+i4.s+'-'+i4.e,Math.abs(i4.off-want)<.15&&i4.s==2&&i4.e==6&&i4.audioOff.every(o=>Math.abs(o-i4.off)<.001));
await pg.evaluate(()=>undo());await pg.waitForTimeout(200);ok('and undo restores it ('+(await info()).off+')',Math.abs((await info()).off-5)<.05);
// a plain drag still moves the clip
await pg.mouse.move(clip.x,clip.y);await pg.mouse.down();await pg.mouse.move(clip.x+40,clip.y,{steps:5});await pg.mouse.move(clip.x+80,clip.y,{steps:5});await pg.mouse.up();await pg.waitForTimeout(300);
const i5=await info();ok('without Shift the same drag moves the clip in time ('+i5.s+') and leaves the media part alone ('+i5.off+')',i5.s>2.5&&Math.abs(i5.off-5)<.05);
// the filmstrip behind the bar
await pg.evaluate(()=>{const L=P.layers.find(l=>l.vid);L.s=2;L.e=6;L.off=0;tab='Media';all()});
await pg.waitForFunction(()=>document.querySelectorAll('#side .mdf img').length>=10,null,{timeout:60000}).catch(()=>{});
ok('the bar shows a filmstrip of the clip ('+await pg.evaluate(()=>document.querySelectorAll('#side .mdf img').length)+' frames)',(await pg.evaluate(()=>document.querySelectorAll('#side .mdf img').length))>=10);
// media shorter than the clip: nothing to choose
await pg.setInputFiles('#fm',F_('short.webm'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const L=cur();L.s=1;L.e=6;tab='Media';all()});
const sh=await pg.evaluate(()=>({off:document.querySelector('#side .mdz').classList.contains('off'),input:!!document.querySelector('#side input[data-mdoff]'),txt:document.querySelector('#mdzt').textContent}));
ok('media shorter than the clip: the bar is inactive and says why ('+sh.txt+')',sh.off&&!sh.input&&/shorter than/.test(sh.txt));
// audio layers: waveform bar
await pg.evaluate(()=>{P.layers.length=0;id=1;mk('cam');all()});
await pg.setInputFiles('#fm',F_('long.webm'));await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const c=new AudioContext(),b=c.createBuffer(1,48000*8,48000),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.sin(i/30)*Math.min(1,i/48000);addAudio(b,'tone');const L=cur();L.s=1;L.e=4;tab='Media';all()});
const au=await pg.evaluate(()=>({bars:document.querySelectorAll('#side .mdf i').length,w:parseFloat(document.querySelector('#side .mdw').style.width)}));
ok('an audio layer shows a waveform bar with its window ('+au.bars+' bars, '+au.w+'%)',au.bars>=50&&Math.abs(au.w-37.5)<1);
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
