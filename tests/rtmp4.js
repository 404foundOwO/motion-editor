// Real-time MP4 recording has a correct length in every header (phones read the track header). Needs Playwright + Chromium with H.264 MediaRecorder.
// Run: node tests/rtmp4.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForFunction(()=>typeof startExport=='function'&&typeof mp4FixDur=='function',null,{timeout:15000});
if(!await p.evaluate(()=>MediaRecorder.isTypeSupported('video/mp4;codecs=avc1'))){console.log('SKIP: no MP4 MediaRecorder');await b.close();process.exit(0)}
const b64=await p.evaluate(()=>{mk('rect');P.dur=2;return new Promise(res=>startExport({fps:30,br:2,sc:.25,mp4:true,onBlob:async bl=>{const a=new Uint8Array(await bl.arrayBuffer());let s='';for(let i=0;i<a.length;i+=8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+8000));res(btoa(s))}}))});
const d=Buffer.from(b64,'base64'),hd=(n)=>{const i=d.indexOf(n),v=d[i+4],o=i+4+(v?20:12);return{ts:d.readUInt32BE(o),du:v?Number(d.readBigUInt64BE(o+4)):d.readUInt32BE(o+4)}};
const mv=hd('mvhd'),md=hd('mdhd'),mvS=mv.du/mv.ts,mdS=md.du/md.ts;
ok('movie length is about the recording',mvS>1.5&&mvS<3,mvS);
ok('track length matches the movie length',Math.abs(mdS-mvS)<.05,[mvS,mdS]);
await b.close();console.log('FAILS',fails);process.exit(fails?1:0)})();
