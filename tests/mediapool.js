// Media pool hover details: type, size, dimensions, duration, how often it is on the timeline. Needs Playwright Chromium (video part also needs ffmpeg).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),cp=require('child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mp-'));let video=null;
try{video=path.join(dir,'clip.webm');cp.execSync(`ffmpeg -y -loglevel error -f lavfi -i testsrc=duration=3:size=640x360:rate=30 -c:v libvpx -b:v 1M ${video}`)}catch(e){video=null}
const wav=(sec,rate=8000)=>{const n=Math.round(sec*rate),b=Buffer.alloc(44+n*2);b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.sin(i/8)*8000),44+i*2);return b};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC','base64');
(async()=>{const br=await chromium.launch(),pg=await (await br.newContext({viewport:{width:1300,height:800}})).newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+path.resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);let F=0;const ok=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)F++};
await pg.click('#mpbtn');
const files=[{name:'photo.png',mimeType:'image/png',buffer:png},{name:'tone.wav',mimeType:'audio/wav',buffer:wav(0.5)}];
if(video)files.push({name:'clip.webm',mimeType:'video/webm',buffer:fs.readFileSync(video)});
await pg.setInputFiles('#mpf',files);await pg.waitForTimeout(1200);
const tipText=async i=>{await pg.mouse.move(5,5);await pg.waitForTimeout(100);await pg.hover(`.mpt:nth-child(${i})`);await pg.waitForSelector('#mptip:not([hidden])',{timeout:3000});await pg.waitForTimeout(250);return pg.evaluate(()=>document.querySelector('#mptip').innerText)};
const a=await tipText(1);ok('image: name, type, size, dimensions, ratio: '+JSON.stringify(a.split('\n').slice(0,4)),/photo\.png/.test(a)&&/Image\s*·\s*PNG\s*·\s*\d+ (B|KB)/.test(a)&&/10×10 px\s*·\s*1:1/.test(a));
ok('image: says it is not on the timeline yet',/Not on the timeline yet/.test(a));
const b=await tipText(2);ok('audio: type, size and duration: '+JSON.stringify(b.split('\n').slice(0,3)),/Audio\s*·\s*WAV/.test(b)&&/Duration 0:00\.5/.test(b));
if(video){const c=await tipText(3);ok('video: dimensions, ratio and duration: '+JSON.stringify(c.split('\n').slice(0,4)),/Video\s*·\s*WEBM/.test(c)&&/640×360 px\s*·\s*16:9/.test(c)&&/Duration 0:03\.0/.test(c))}
// placed on the timeline -> count
await pg.click('.mpt:nth-child(1)');await pg.waitForTimeout(400);
ok('the details hide on click',await pg.evaluate(()=>document.querySelector('#mptip').hidden));
const d=await tipText(1);ok('after adding it to the timeline: '+JSON.stringify(d.split('\n').slice(3,4)),/On the timeline 1×/.test(d));
await pg.mouse.move(700,500);await pg.waitForTimeout(150);
ok('the details hide when the pointer leaves',await pg.evaluate(()=>document.querySelector('#mptip').hidden));
const box=await pg.evaluate(()=>{const r=document.querySelector('#mptip');r.hidden=false;const b=r.getBoundingClientRect();r.hidden=true;return{ok:b.left>=0&&b.right<=innerWidth}}).catch(()=>({ok:true}));
await pg.reload();await pg.waitForTimeout(2200);
if(await pg.locator('#mp').isHidden())await pg.click('#mpbtn');
const e=await tipText(1);ok('details also show after a reload (pool saved with the project): '+JSON.stringify(e.split('\n').slice(0,3)),/photo\.png/.test(e)&&/10×10 px/.test(e));
console.log('errs',errs,'FAILS',F+errs.length);await br.close();fs.rmSync(dir,{recursive:true,force:true});process.exit(F||errs.length?1:0)})();
