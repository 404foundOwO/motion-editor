// audio export dialog + WAV writer (browser encoders are not available in jsdom)
const h=require('./harness');(async()=>{const errs=[];const d=await h.load(process.argv[2]||'MF:'+require('path').resolve(__dirname,'../index.html'),errs);const w=d.window,ev=s=>w.eval(s),doc=w.document;
let fails=0;const ok=(n,c,x)=>{if(!c)fails++;console.log(c?'PASS':'FAIL',n,x===undefined?'':JSON.stringify(x))};
ok('Audio button next to Export',!!doc.querySelector('#exa')&&doc.querySelector('#exv').nextElementSibling.id=='exa');
let msg='';w.alert=m=>msg=m;
doc.querySelector('#exa').click();ok('no audio -> message, no dialog',/no audio/i.test(msg)&&!doc.querySelector('#axm'),msg);
const a=ev(`mk('audio')`);a.buf={duration:1};a.e=5;
doc.querySelector('#exa').click();ok('dialog opens',!!doc.querySelector('#axm'));
const opts=[...doc.querySelectorAll('#axf option')].map(o=>o.value);ok('WAV always offered',['wav16','wav24','wav32'].every(k=>opts.includes(k)),opts);
doc.querySelector('#axf').value='wav16';doc.querySelector('#axf').dispatchEvent(new w.Event('change'));
ok('bitrate hidden for WAV',doc.querySelector('#axrk').style.display=='none');
ev('OFFC.opus=true;OFFC.aac=true');doc.querySelector('#axx').click();doc.querySelector('#exa').click();
const o2=[...doc.querySelectorAll('#axf option')].map(o=>o.value);ok('compressed offered when supported',['ogg','weba','m4a'].every(k=>o2.includes(k)),o2);
doc.querySelector('#axf').value='ogg';doc.querySelector('#axf').dispatchEvent(new w.Event('change'));
ok('rate hidden and bitrate shown for Opus',doc.querySelector('#axrs').style.display=='none'&&doc.querySelector('#axrk').style.display!='none');
// WAV writer
const f=new Float32Array(480);for(let i=0;i<480;i++)f[i]=Math.sin(i/5);
const blob=ev('(c=>axWav(c,48000,16))')([f,f]);ok('WAV size = 44 + 480*2*2',blob.size==44+480*4,blob.size);
console.log('errs',errs.slice(0,3),'FAILS',fails);process.exit(fails?1:0)})()
