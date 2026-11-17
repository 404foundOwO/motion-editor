// Real-time recording can be cancelled: the Cancel button and Esc stop it and nothing is saved (needs Playwright + Chromium).
// Run: node tests/reccancel.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForFunction(()=>typeof startExport=='function'&&typeof P!='undefined',null,{timeout:15000});
for(const how of ['button','escape']){
 await p.evaluate(()=>{window.SAVED=0;window.sv=()=>{window.SAVED++};mk('rect');startExport({fps:30,br:2,sc:.25,mp4:false})});
 ok(how+': recording starts with a Cancel button',await p.evaluate(()=>exp==1&&!!document.querySelector('#exs button')));
 await p.waitForTimeout(400);
 if(how=='button')await p.click('#exs button');else await p.keyboard.press('Escape');
 await p.waitForTimeout(800);
 ok(how+': stopped, nothing saved',await p.evaluate(()=>exp==0&&play==0&&SAVED==0&&$('#exs').textContent==''),await p.evaluate(()=>[exp,play,SAVED,$('#exs').textContent]));
}
await b.close();console.log('FAILS',fails);process.exit(fails?1:0)})();
