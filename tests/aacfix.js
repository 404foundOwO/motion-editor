// MP4 exports with Opus sound (browser cannot encode AAC) get an AAC pass through ffmpeg.wasm. The converter is replaced by a stand-in here (the real one is a 30 MB CDN download); needs Playwright + Chromium.
// Run: node tests/aacfix.js
const path=require('path'),http=require('http'),fs=require('fs');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();p.on('dialog',d=>d.accept());const DL=[];p.on('download',async d=>{const st=await d.createReadStream();let n=0;for await(const c of st)n+=c.length;DL.push([d.suggestedFilename(),n])});
const root=path.resolve(__dirname,'..'),T={'.html':'text/html','.js':'text/javascript','.css':'text/css'},srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/\/$/,'/index.html'));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0);
await p.goto('http://localhost:'+srv.address().port+'/index.html');await p.waitForFunction(()=>typeof mp4Save=='function'&&typeof OFFC!='undefined'&&OFFC.ok,null,{timeout:15000});
const run=(code)=>p.evaluate(async(code)=>{
 window.CALLS=[];
 window.ffLoad=async()=>({on(){},off(){},writeFile:async()=>{},deleteFile:async()=>{},exec:async a=>{CALLS.push(a);return code},readFile:async()=>new Uint8Array(7)});
 const r=[];PNAME='Clip';window.SAVED=[];
 await mp4Save(new Blob([new Uint8Array(100)],{type:'video/mp4'}),true,3);r.push(CALLS.slice());CALLS.length=0;await mp4Save(new Blob([new Uint8Array(100)]),false,3);r.push(CALLS.slice());return r},code);
let r=await run(0);await p.waitForTimeout(500);
ok('AAC pass copies the video and encodes AAC',JSON.stringify(r[0][0])==JSON.stringify(['-i','in.mp4','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','out.mp4']),r[0]);
ok('the converted file is saved under the project name',DL[0]&&DL[0][0]=='Clip.mp4'&&DL[0][1]==7,DL);
ok('aac off saves the original untouched and runs no converter',r[1].length==0&&DL[1]&&DL[1][1]==100,[r[1],DL]);
DL.length=0;r=await run(1);await p.waitForTimeout(500);
ok('a converter failure saves the original MP4',DL[0]&&DL[0][1]==100,DL);
// dialog: the checkbox shows for MP4 with sound when AAC cannot be encoded
const vis=await p.evaluate(async()=>{const o={};const ac=new AudioContext(),buf=ac.createBuffer(2,48000,48000);addAudio(buf,'tone');exportMenu();await new Promise(r=>setTimeout(r,100));const d=document.querySelector('#xaa');o.has=!!d;o.webm=document.querySelector('#xar').style.display!='none';document.querySelector('#xfl button[data-f=mp4]').click();o.shown=document.querySelector('#xar').style.display!='none';o.checked=!!d&&d.checked;o.aac=OFFC.aac;return o});
ok('Sound as AAC checkbox is shown and on for MP4, hidden for WebM',vis.has&&vis.shown&&vis.checked&&!vis.webm,vis);
// both real export paths hand their MP4 to the AAC step when the sound is Opus
for(const how of ['offline','realtime']){
 const n=await p.evaluate(async how=>{window.CALLS=[];window.ffLoad=async()=>({on(){},off(){},writeFile:async()=>{},deleteFile:async()=>{},exec:async a=>{CALLS.push(a);return 0},readFile:async()=>new Uint8Array(7)});
  P.dur=2;const o={fps:30,br:2,sc:.25,mp4:true,aac:true};if(how=='offline'){await startOffline(o)}else{startExport(o)}
  for(let i=0;i<150&&!CALLS.length;i++)await new Promise(r=>setTimeout(r,100));return CALLS.length},how);
 ok(how+' MP4 with sound goes through the AAC step',n==1,n);
 await p.waitForTimeout(500);await p.evaluate(()=>{document.querySelectorAll('#exm').forEach(e=>e.remove())});
}
srv.close();await b.close();console.log('FAILS',fails);process.exit(fails?1:0)})();
