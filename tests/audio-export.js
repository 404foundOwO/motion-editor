// loading screen helper
// export dialog (format list + settings) and the WAV writer; browser encoders are not available in jsdom
const h=require('./harness');(async()=>{const errs=[];const d=await h.load(process.argv[2]||'MF:'+require('path').resolve(__dirname,'../index.html'),errs);const w=d.window,ev=s=>w.eval(s),doc=w.document;
let fails=0;const ok=(n,c,x)=>{if(!c)fails++;console.log(c?'PASS':'FAIL',n,x===undefined?'':JSON.stringify(x))};
const q=s=>doc.querySelector(s),vis=id=>q('#'+id).style.display!='none';
ok('no separate Audio button',!q('#exa'));
q('#exv').click();ok('export dialog opens',!!q('#exm'));
ok('no aspect ratio row',!q('#xa'));
ok('video formats listed',!!q('[data-f=mp4]')&&!!q('[data-f=webm]'));
ok('audio formats disabled with no audio',q('[data-f=wav]').disabled&&q('[data-f=ogg]').disabled&&q('[data-f=m4a]').disabled);
ok('video settings visible, audio ones hidden',vis('xrr')&&vis('xqr')&&!vis('axbr')&&!vis('axkr'));
q('#xc').click();
const a=ev(`mk('audio')`);a.buf={duration:1};a.e=5;ev('OFFC.opus=true;OFFC.aac=true');
q('#exv').click();ok('audio formats enabled when project has audio',!q('[data-f=wav]').disabled&&!q('[data-f=ogg]').disabled&&!q('[data-f=m4a]').disabled);
q('[data-f=wav]').click();ok('WAV shows bit depth, hides quality',vis('axbr')&&!vis('xqr')&&!vis('axkr')&&vis('axsr'));
q('[data-f=ogg]').click();ok('Ogg shows bitrate, hides sample rate',vis('axkr')&&!vis('axsr')&&!vis('axbr'));
q('[data-f=mp4]').click();const conv=w.location.protocol!='file:';ok('mp4 unsupported -> convert note, Max quality, right buttons',vis('xrr')&&q('#xcv').style.display=='block'&&q('#xb').value=='50'&&q('#xg').textContent==(conv?'Export as MP4':'Export WebM')&&(q('#xgw').style.display!='none')==conv,[q('#xcv').style.display,q('#xg').textContent,q('#xgw').style.display,q('#xb').value]);
ok('note mentions Chromium',/Chrome, Edge or Brave/.test(q('#xcv').textContent)&&/ffmpeg -i motion.webm/.test(q('#xcm').textContent));
q('[data-f=wav]').click();ok('note hidden for audio',q('#xcv').style.display=='none'&&q('#xg').textContent=='Export'&&q('#xgw').style.display=='none');
q('[data-f=webm]').click();ok('note hidden for WebM',q('#xcv').style.display=='none');
q('#xc').click();ok('cancel closes',!q('#exm'));
const L=ev('loadingShow("T","m",{cancel(){}})');L.set(.5,'half');ok('loading screen renders',/half/.test(doc.querySelector('.ldov').textContent)&&doc.querySelector('.ldbar i').style.width=='50%'&&!!doc.querySelector('.ldbtn button'));L.set(null);ok('indeterminate state',doc.querySelector('.ldbar').classList.contains('ind'));L.done();ok('loading screen removed',!doc.querySelector('.ldov'));
const f=new Float32Array(480);for(let i=0;i<480;i++)f[i]=Math.sin(i/5);
const blob=ev('(c=>axWav(c,48000,16))')([f,f]);ok('WAV size = 44 + 480*2*2',blob.size==44+480*4,blob.size);
console.log('errs',errs.slice(0,3),'FAILS',fails);process.exit(fails?1:0)})()
