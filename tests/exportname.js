// Exported files are named after the project (needs Playwright + Chromium).
// Run: node tests/exportname.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForFunction(()=>typeof fname=='function'&&typeof P!='undefined',null,{timeout:15000});
const r=await p.evaluate(()=>{const o={};PNAME='My intro: v2/final?';o.a=fname('mp4');PNAME='  ';o.b=fname('webm');PNAME='Proje çğ';o.c=fname('png');PNAME='..x';o.d=fname('wav');return o});
ok('illegal characters become spaces',r.a=='My intro v2 final.mp4',r.a);
ok('blank name falls back',r.b=='motion.webm',r.b);
ok('non-ASCII letters are kept',r.c=='Proje çğ.png',r.c);
ok('no leading dots',r.d=='x.wav',r.d);
await b.close();console.log('FAILS',fails);process.exit(fails?1:0)})();
