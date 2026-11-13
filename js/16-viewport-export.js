$('#side').onchange=e=>{const L=cur(),d=e.target.dataset;if(d.mir&&L){L.p[d.mir]=+e.target.value;dirty=1;all();return}if('addfx' in d&&e.target.value&&L){const k=e.target.value;addFx(L,k);all();return}if(d.e&&L){const f=L.kf[d.e].find(f=>Math.abs(f.t-t)<.008);const prev={e:f.e,b:f.b?[...f.b]:null};f.e=e.target.value;if(f.e=='bez'){if(!f.b)f.b=[...EASEB.ease];all();openGraph(f,LBL[d.e]||d.e,prev)}else all()}else if(d.k)all()};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const ty=b.dataset.add;if(ty=='cam'){const ex=P.layers.find(l=>l.type=='cam');if(ex)sel=ex.id;else{const C=mk('cam');C.name='Camera';P.layers.unshift(P.layers.pop());sel=C.id}}else if(ty.indexOf('ms:')==0){const m=mk('mshape');m.mk=ty.slice(3);m.name=MSH[m.mk]?MSH[m.mk][0]:'Shape';const ar=msPts(m.mk).ar;m.p.w=ar>=1?340:Math.round(340*ar);m.p.h=ar>=1?Math.round(340/ar):340;sel=m.id}else sel=mk(ty).id;$('#menu').hidden=1;all()});$('#fab').onclick=()=>{$('[data-add=cam]').style.display=P.layers.some(l=>l.type=='cam')?'none':'';$('#menu').hidden=!$('#menu').hidden;if(!$('#menu').hidden){const i=$('#msr');i.value='';i.dispatchEvent(new Event('input'));if(!matchMedia('(pointer:coarse)').matches)setTimeout(()=>i.focus(),0)}};
$('#del').onclick=()=>{const L=cur();if(ks.length&&L){Object.keys(L.kf).forEach(k=>{const a=L.kf[k],v0=val(L,k,t),r=a.filter(f=>!ks.includes(f));if(r.length!=a.length){if(r.length)L.kf[k]=r;else{(FK.includes(k)?L:L.p)[k]=v0;delete L.kf[k]}}});ks=[];all();return}if(L){const dd=[L,...lkOf(L)];dd.forEach(D=>P.layers.forEach(c=>{if(c.par==D.id)c.par=D.par}));P.layers=P.layers.filter(l=>!dd.includes(l));sel=null;all()}};
$('#sp').onclick=()=>{const L=cur();if(!L||t<=L.s||t>=L.e)return;if(!SPG){SPG=1;SPLK='lk'+Date.now();try{lkOf(L).filter(o=>t>o.s&&t<o.e).forEach(o=>{sel=o.id;$('#sp').onclick()});sel=L.id}finally{SPG=0}}const C=JSON.parse(JSON.stringify(L,(k,v)=>k=='el'||k=='buf'||k=='sbuf'||k=='efa'?undefined:v));C.el=L.el;C.buf=L.buf;C.sbuf=L.sbuf;C.vid=L.vid;C.off=(L.off||0)+t-L.s;C.id=id++;if(L.el)ELS[C.id]=L.el;if(L.buf)BUF[C.id]=L.buf;if(L.sbuf)BUF['b'+C.id]=L.sbuf;if(MB[L.id])MB[C.id]=MB[L.id];C.name=L.name+' b';if(L.lk&&SPLK)C.lk=SPLK;C.s=t;L.e=t;P.layers.splice(P.layers.indexOf(L)+1,0,C);sel=C.id;all();if(!SPG)SPLK=null};
$('#mv').onclick=()=>{const L=cur();if(!L)return;const d=t-L.s;shift(L,d);lkOf(L).forEach(o=>shift(o,d));all()};
const kts=()=>{const L=cur();return L?[...new Set(Object.entries(L.kf).filter(([k])=>!fp||k==fp).flatMap(([k,a])=>a.map(f=>+f.t.toFixed(4))))].sort((a,b)=>a-b):[]};
$('#pk').onclick=()=>{const a=kts().filter(x=>x<t-.01);if(a.length){t=a[a.length-1];all();dirty=1}};
$('#nk').onclick=()=>{const a=kts().filter(x=>x>t+.01);if(a.length){t=a[0];all();dirty=1}};
$('#tlin').ondblclick=e=>{const kk=e.target.closest('.kf'),Lc=cur();if(kk&&Lc){const a=Lc.kf[kk.dataset.k],f=a&&a[+kk.dataset.i];if(f&&!FK.includes(kk.dataset.k))openGraph(f,LBL[kk.dataset.k]||kk.dataset.k);return}if(e.target.closest('[data-chev]'))return;const n=e.target.closest('.nm'),r=n&&n.closest('.row');if(r&&r.dataset.id){const L=P.layers.find(l=>l.id==r.dataset.id),s=prompt('Rename',L.name);if(s){L.name=s;tl();side()}}};
let rec,exp=0;document.fonts.load('700 40px "Roboto Flex"').then(()=>dirty=1);
const sv=(n,d)=>{try{const b=d instanceof Blob?d:new Blob([d]),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=n;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),6e4)}catch(e){alert('Save failed: '+e.message)}};
const ASP={'16:9':[1920,1080],'9:16':[1080,1920],'1:1':[1080,1080],'4:5':[1080,1350],'5:4':[1350,1080],'4:3':[1440,1080],'3:4':[1080,1440],'3:2':[1620,1080],'2:3':[1080,1620],'2:1':[2160,1080],'21:9':[2520,1080]};
function applyFmt(k){const a=ASP[k]||(k=='custom'&&P.cw>=2&&P.ch>=2?[P.cw,P.ch]:ASP['16:9']);P.fmt=ASP[k]||k=='custom'?k:'16:9';arUi();if(a[0]==W&&a[1]==H)return;try{W=a[0];H=a[1];cv.width=W;cv.height=H;ov.width=W;ov.height=H;OFFS.length=0;PXC.forEach(g=>{g.canvas.width=W;g.canvas.height=H});T.forEach(g=>{g.canvas.width=W;g.canvas.height=H});setQ(Q);dirty=1;arUi();pvApplyLite()}catch(e){setTimeout(()=>applyFmt(k),50)}}
const OFFC={ok:false,avc:false,vp9:false,aac:false,opus:false};
(async()=>{try{if(!window.VideoEncoder||!window.VideoFrame||!window.Mp4Muxer||!window.WebMMuxer)return;const v=(c,w,h)=>VideoEncoder.isConfigSupported({codec:c,width:w,height:h,bitrate:2e7,framerate:60}).then(r=>!!r.supported,()=>false);
OFFC.avc=await v('avc1.640034',1920,1080)||await v('avc1.4d0034',1920,1080);OFFC.vp9=await v('vp09.00.50.08',1920,1080)||await v('vp09.00.41.08',1920,1080);
if(window.AudioEncoder&&window.AudioData){const a=(c)=>AudioEncoder.isConfigSupported({codec:c,sampleRate:48000,numberOfChannels:2,bitrate:192000}).then(r=>!!r.supported,()=>false);OFFC.aac=await a('mp4a.40.2');OFFC.opus=await a('opus')}
OFFC.ok=OFFC.avc||OFFC.vp9}catch(e){}})();
async function renderAudioOffline(dur,SR,onP){
 const auds=P.layers.filter(l=>l.type=='audio'&&l.buf&&l.e>0),blips=P.layers.filter(l=>l.sbuf&&l.efx&&l.efx.includes('reveal')&&!(l.efo||[]).includes('reveal'));
 if(!auds.length&&!blips.length)return null;
 const n=Math.ceil(dur*SR),oc=new OfflineAudioContext(2,n,SR),sv={AC,AN,MO,AG,AM,IRB};let out=null;
 try{
  AC=oc;AN=oc.createGain();MO=oc.createGain();MO.connect(oc.destination);IRB=null;AG=[];refx();
  const GC={},C=P.layers.find(l=>l.type=='cam');
  {let nd=AN;AM=(C?C.efa.filter(k=>AUDK.includes(k)):[]).map(k=>({k,s:mkStage(k)}));AM.forEach(x=>{nd.connect(x.s.i);nd=x.s.o});nd.connect(MO)}
  const AS2=[];
  auds.forEach(L=>{const g=oc.createGain(),pn=oc.createStereoPanner();g.connect(pn);let node=pn;
   const st=L.efa.filter(k=>AUDK.includes(k)).map(k=>({k,s:mkStage(k)}));st.forEach(x=>{node.connect(x.s.i);node=x.s.o});
   node.connect(gin(P.layers.find(l=>l.id==L.par&&l.type=='group'),GC));
   const src=oc.createBufferSource();src.buffer=L.buf;src.connect(g);const into=Math.max(0,-L.s),off=into+(L.off||0);
   if(off<L.buf.duration)src.start(Math.max(0,L.s),off,Math.max(.001,Math.min(L.buf.duration-off,L.e-L.s-into)));
   AS2.push({L,g,pn,st})});
  const step=1/60,nS=Math.ceil(dur/step);
  for(let f=0;f<=nS;f++){const tt=Math.min(dur,f*step);SMO=tt;
   AG.forEach(x=>x.s.u(val(x.G,x.k,tt)));if(C)AM.forEach(x=>x.s.u(val(C,x.k,tt)));
   AS2.forEach(a=>{const vo=Math.max(0,val(a.L,'vol',tt)),pa=Math.max(-1,Math.min(1,val(a.L,'pan',tt)));
    if(f==0){a.g.gain.setValueAtTime(vo,0);a.pn.pan.setValueAtTime(pa,0)}else{a.g.gain.setTargetAtTime(vo,tt,.02);a.pn.pan.setTargetAtTime(pa,tt,.02)}
    a.st.forEach(x=>x.s.u(val(a.L,x.k,tt)))})}
  SMO=0;
  blips.forEach(L=>{const chars=[...String(L.text)],nC=chars.length;let c=null,last=-1e9;
   for(let f=0;f<=nS;f++){const tt=Math.min(dur,f*step),rp=(val(L,'rvp',tt)||0)/100*nC,tc=Math.max(0,Math.min(nC,Math.ceil(rp-1e-9)));
    if(c===null){c=tc;continue}
    if(tc>c){const vol=val(L,'rvv',tt)??.7,pv=(val(L,'rvq',tt)??15)/100,base=(val(L,'rvb',tt)??100)/100,gap=(val(L,'rvg',tt)??45)/1000;
     for(let i=c;i<tc;i++){const ch=chars[i];if(ch===undefined||/\s/.test(ch))continue;if(tt-last<gap)continue;last=tt;
      const src=oc.createBufferSource(),g=oc.createGain();src.buffer=L.sbuf;src.playbackRate.value=Math.max(.25,base*(1+(hn(i*1.7,3)*2-1)*pv));g.gain.value=vol;src.connect(g);g.connect(AN);src.start(tt)}}
    c=tc}});
  if(onP)onP();
  out=await oc.startRendering();
 }finally{AC=sv.AC;AN=sv.AN;MO=sv.MO;AG=sv.AG;AM=sv.AM;IRB=sv.IRB;SMO=0}
 return out}
async function startOffline(o){
 const fps=o.fps,N=Math.max(1,Math.round(P.dur*fps)),ev=x=>x+(x&1),ow=ev(Math.round(W*o.sc)),oh=ev(Math.round(H*o.sc)),SR=48000,mp4=!!o.mp4;
 let cancel=0,err=null,note='';
 const ovl=document.createElement('div');ovl.style.cssText='position:fixed;inset:0;z-index:70;background:#000c;display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif;color:#ddd';
 ovl.innerHTML='<div style="background:#1b1b21;border:1px solid #3a3a45;border-radius:12px;padding:20px;width:340px"><h3 style="margin:0 0 10px;font-size:15px">Exporting video</h3><div id=xpt style="margin-bottom:10px;color:#9a9aa6">Preparing…</div><div style="height:8px;border-radius:4px;background:#0d0d10;overflow:hidden"><div id=xpb style="height:100%;width:0;background:#8b7bff;transition:width .1s"></div></div><p style="margin:12px 0;font-size:12px;color:#9a9aa6">Every frame is rendered exactly, so the result is a true '+fps+' fps. Keep this tab open and in front.</p><div style="text-align:right"><button id=xpc style="background:#24242c;color:#ddd;border:1px solid #3a3a45;border-radius:7px;padding:6px 14px;font:inherit;cursor:pointer">Cancel</button></div></div>';
 document.body.appendChild(ovl);const pt=$('#xpt'),pb=$('#xpb');$('#xpc').onclick=()=>{cancel=1;pt.textContent='Cancelling…'};
 const setP=(txt,f)=>{pt.textContent=txt;pb.style.width=Math.round(f*100)+'%'},yld=()=>new Promise(r=>setTimeout(r,0));
 const m0=mode,t0=t,p0=play;OFFX=1;exp=1;play=0;mode='comp';if(AON)aStop();
 let venc=null,aenc=null;
 try{
  await yld();
  const hasAud=P.layers.some(l=>(l.type=='audio'&&l.buf)||l.sbuf);let aOK=false;
  if(hasAud){aOK=mp4?OFFC.aac:OFFC.opus;if(!aOK)note='This browser cannot encode this audio format, so the video has no sound.'}
  const aq=[];let mux=null;
  const cands=mp4?['avc1.640034','avc1.4d0034','avc1.64002a','avc1.42e034']:['vp09.00.50.08','vp09.00.41.08','vp09.00.40.08'];let vcfg=null;
  for(const c of cands){const cfg={codec:c,width:ow,height:oh,bitrate:Math.round(o.br*1e6),framerate:fps};if(mp4)cfg.avc={format:'avc'};try{const r=await VideoEncoder.isConfigSupported(cfg);if(r&&r.supported){vcfg=r.config||cfg;if(mp4)vcfg.avc={format:'avc'};break}}catch(e){}}
  if(!vcfg)throw new Error('This browser cannot encode '+(mp4?'H.264':'VP9')+' video at '+ow+'×'+oh+'. Try WebM, a lower resolution, or real-time recording.');
  mux=mp4?new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:'avc',width:ow,height:oh},audio:aOK?{codec:'aac',numberOfChannels:2,sampleRate:SR}:undefined,fastStart:'in-memory',firstTimestampBehavior:'offset'}):new WebMMuxer.Muxer({target:new WebMMuxer.ArrayBufferTarget(),video:{codec:'V_VP9',width:ow,height:oh,frameRate:fps},audio:aOK?{codec:'A_OPUS',numberOfChannels:2,sampleRate:SR}:undefined,firstTimestampBehavior:'offset'});
  const flushA=ts=>{while(aq.length&&aq[0].c.timestamp<=ts){const a=aq.shift();mux.addAudioChunk(a.c,a.m)}};
  if(aOK){
   setP('Rendering audio…',0);await yld();
   const ab=await renderAudioOffline(P.dur,SR);
   if(ab){aenc=new AudioEncoder({output:(c,m)=>aq.push({c,m}),error:e=>{err=e}});aenc.configure({codec:mp4?'mp4a.40.2':'opus',sampleRate:SR,numberOfChannels:2,bitrate:192000});
    const c0=ab.getChannelData(0),c1=ab.numberOfChannels>1?ab.getChannelData(1):c0,CH=48000;
    for(let i=0;i<ab.length&&!cancel;i+=CH){const nn=Math.min(CH,ab.length-i),d=new Float32Array(nn*2);d.set(c0.subarray(i,i+nn),0);d.set(c1.subarray(i,i+nn),nn);
     const ad=new AudioData({format:'f32-planar',sampleRate:SR,numberOfFrames:nn,numberOfChannels:2,timestamp:Math.round(i/SR*1e6),data:d});aenc.encode(ad);ad.close();if(err)throw err}
    await aenc.flush();aenc.close();aenc=null}}
  venc=new VideoEncoder({output:(c,m)=>{flushA(c.timestamp);mux.addVideoChunk(c,m)},error:e=>{err=e}});venc.configure(vcfg);
  const ec=(ow!=W||oh!=H)?document.createElement('canvas'):null,eg=ec?(ec.width=ow,ec.height=oh,ec.getContext('2d')):null;
  const vids=P.layers.filter(l=>l.vid&&l.el);
  const seekV=tt=>Promise.all(vids.map(L=>{if(tt<L.s||tt>L.e)return;const v=L.el,d=(L.off||0)+tt-L.s;if(!v.paused)v.pause();v.__q=d;if(Math.abs(v.currentTime-d)<.0005&&!v.seeking)return;
   return new Promise(res=>{const done=()=>{v.removeEventListener('seeked',done);res()};v.addEventListener('seeked',done);setTimeout(done,2000);v.currentTime=d})}));
  const t1=performance.now();
  for(let i=0;i<N;i++){
   if(cancel)break;if(err)throw err;
   const tt=i/fps;t=tt;await seekV(tt);draw(tt);
   let src=cv;if(ec){eg.drawImage(cv,0,0,ow,oh);src=ec}
   const fr=new VideoFrame(src,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});
   venc.encode(fr,{keyFrame:i%(fps*2)==0});fr.close();
   while(venc.encodeQueueSize>8){await new Promise(r=>setTimeout(r,2));if(err)throw err}
   if(i%3==0||i==N-1){const el=(performance.now()-t1)/1000,rem=i>0?el/i*(N-i):0;setP('Frame '+(i+1)+' / '+N+(i>3?'  ·  about '+(rem>90?Math.ceil(rem/60)+' min':Math.ceil(rem)+' s')+' left':''),(i+1)/N);await yld()}}
  if(cancel){try{venc.close()}catch(e){}venc=null;return}
  setP('Finishing…',1);await venc.flush();venc.close();venc=null;if(err)throw err;
  flushA(Infinity);mux.finalize();
  sv(mp4?'motion.mp4':'motion.webm',new Blob([mux.target.buffer],{type:mp4?'video/mp4':'video/webm'}));
  if(note)alert(note);
 }catch(e){console.error(e);alert('Export failed: '+(e&&e.message||e)+'\n\nTry real-time recording in the export dialog instead.')}
 finally{try{venc&&venc.state!='closed'&&venc.close()}catch(e){}try{aenc&&aenc.state!='closed'&&aenc.close()}catch(e){}ovl.remove();OFFX=0;exp=0;mode=m0;t=t0;play=p0;dirty=1;ph&&ph()}
}
function startExport(o){const ec=document.createElement('canvas'),sc=o.sc;ec.width=Math.round(W*sc);ec.height=Math.round(H*sc);const eg=ec.getContext('2d'),src=sc==1?cv:ec;let raf=0;const copy=()=>{eg.drawImage(cv,0,0,ec.width,ec.height);raf=requestAnimationFrame(copy)};
const mt=o.mp4?'video/mp4;codecs=avc1':(MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm'),ch=[],r=new MediaRecorder(new MediaStream([...src.captureStream(o.fps).getVideoTracks(),...(P.layers.some(l=>l.type=='audio'||l.sbuf)?(ac(),AD.stream.getAudioTracks()):[])]),{mimeType:mt,videoBitsPerSecond:o.br*1e6}),m=mode;
mode='comp';r.ondataavailable=e=>e.data.size&&ch.push(e.data);r.onstop=()=>{cancelAnimationFrame(raf);play=0;mode=m;dirty=1;setIc($('#pl'),'play','Play / pause (Space)',1);$('#exs').textContent='';sv(o.mp4?'motion.mp4':'motion.webm',new Blob(ch,{type:o.mp4?'video/mp4':'video/webm'}))};
rec=r;t=0;dirty=1;exp=1;play=1;setIc($('#pl'),'pause','Play / pause (Space)',1);$('#exs').textContent='Recording in real time…';if(sc!=1)copy();r.start()}
function exportMenu(){const old=$('#exm');if(old)old.remove();
const mp4=MediaRecorder.isTypeSupported('video/mp4;codecs=avc1'),Q=[['Draft',4],['Good',10],['High',25],['Max',50]],row=(n,h)=>`<div style="display:flex;justify-content:space-between;align-items:center;margin:9px 0"><span>${n}</span>${h}</div>`,sty='style="background:#0d0d10;color:#ddd;border:1px solid #3a3a45;border-radius:6px;padding:5px 8px;font:inherit"';
const d=document.createElement('div');d.id='exm';d.style.cssText='position:fixed;inset:0;background:#000b;z-index:60;display:flex;align-items:center;justify-content:center';
d.innerHTML=`<div style="background:#1b1b21;border:1px solid #3a3a45;border-radius:10px;padding:18px;width:360px;color:#ddd;font:13px system-ui,sans-serif"><h3 style="margin:0 0 6px">Export video</h3>`+
row('Aspect ratio',`<select id=xa ${sty}>${Object.keys(ASP).map(k=>`<option ${k==(P.fmt||'16:9')?'selected':''}>${k}`).join('')}${P.fmt=='custom'?`<option value=custom selected>${W}×${H} (custom)</option>`:''}</select>`)+
row('Resolution',`<select id=xr ${sty}></select>`)+row('Frame rate',`<select id=xf ${sty}><option>24<option>30<option selected>60</select>`)+
row('Quality',`<select id=xq ${sty}>${Q.map(([n,b])=>`<option value=${b} ${b==25?'selected':''}>${n}`).join('')}<option value=0>Custom</select>`)+row('Bitrate (Mbps)',`<input id=xb type=number min=1 max=200 step=1 value=25 ${sty} style="width:80px">`)+
row('Method',`<select id=xt ${sty}></select>`)+row('Format',`<select id=xm ${sty}></select>`)+
`<p id=xi style="margin:10px 0;color:#9a9aa6;font-size:12px"></p><div style="display:flex;gap:8px;justify-content:flex-end"><button id=xc ${sty}>Cancel</button><button id=xg ${sty.replace('#0d0d10','#6c5ce7')}>Export</button></div></div>`;
document.body.appendChild(d);const g=i=>$('#'+i),SC=[1,.75,.5,.25],fmtSync=()=>{const hasAud=P.layers.some(l=>(l.type=='audio'&&l.buf)||l.sbuf),xt=g('xt');if(!xt.options.length)xt.innerHTML=(OFFC.ok?'<option value=1>Frame by frame (true fps, recommended)':'')+'<option value=0>Real-time recording';const pre=xt.value=='1',fo=[];if(pre){if(OFFC.vp9&&(!hasAud||OFFC.opus))fo.push([0,'WebM (VP9)']);if(OFFC.avc&&(!hasAud||OFFC.aac))fo.push([1,'MP4 (H.264)']);if(!fo.length)fo.push([0,'WebM (VP9)'])}else{fo.push([0,'WebM (VP9)']);if(mp4)fo.push([1,'MP4 (H.264)'])}const cur=g('xm').value;g('xm').innerHTML=fo.map(([v,n])=>`<option value=${v}>${n}`).join('');if(fo.some(f=>f[0]==cur))g('xm').value=cur},info=()=>{fmtSync();g('xr').innerHTML=SC.map((s,i)=>`<option value=${s} ${g('xr').value==s?'selected':''}>${Math.round(W*s)}×${Math.round(H*s)}${s==1?' (full)':''}`).join('');if(g('xr').dataset.k)g('xr').value=g('xr').dataset.k;
 const mb=Math.round(+g('xb').value*P.dur/8);g('xi').textContent=g('xt').value=='1'?`Estimated size about ${mb} MB. Every frame is rendered exactly, so you get a true ${g('xf').value} fps no matter how slow your graphics are. It may take longer than the video itself.`:`Estimated size about ${mb} MB. Real-time recording takes as long as the video, and heavy projects at high resolution may drop frames.${OFFC.ok?'':' Frame by frame export needs Chrome, Edge or another Chromium browser.'}`};g('xt').onchange=info;g('xf').onchange=info;
g('xr').onchange=()=>{g('xr').dataset.k=g('xr').value;info()};g('xa').onchange=()=>{applyFmt(g('xa').value);info()};g('xq').onchange=()=>{if(+g('xq').value)g('xb').value=g('xq').value;info()};g('xb').oninput=()=>{g('xq').value=[...g('xq').options].some(o=>o.value==g('xb').value)?g('xb').value:0;info()};
g('xc').onclick=()=>d.remove();g('xg').onclick=()=>{const o={sc:+g('xr').value,fps:+g('xf').value,br:Math.max(1,+g('xb').value||25),mp4:g('xm').value=='1',precise:g('xt').value=='1'};d.remove();o.precise?startOffline(o):startExport(o)};info()}
$('#exv').onclick=exportMenu;
$('#exp').onclick=()=>{const m=mode,e0=exp;mode='comp';exp=1;draw(t);cv.toBlob(b=>{mode=m;dirty=1;sv('frame.png',b)});exp=e0;dirty=1};
const MB={},STORED=new Set(),FB=[];let SAVEON=false,sTimer=0;
const DB=new Promise(res=>{try{const r=indexedDB.open('motion-editor',1);r.onupgradeneeded=()=>{['proj','media','fonts'].forEach(n=>r.result.createObjectStore(n))};r.onsuccess=()=>res(r.result);r.onerror=r.onblocked=()=>res(null)}catch(e){res(null)}});
const idb=(st,mode,fn)=>DB.then(d=>d?new Promise(res=>{try{const tx=d.transaction(st,mode);let q;try{q=fn(tx.objectStore(st))}catch(e){res(null);return}tx.oncomplete=()=>res(q&&q.result!==undefined?q.result:null);tx.onerror=tx.onabort=()=>res(null)}catch(e){res(null)}}):null);
const setSv=m=>{const e=$('#sv');if(e)e.textContent=m};
async function saveNow(){if(!SAVEON)return;try{await idb('proj','readwrite',q=>q.put({json:ser(),t:Date.now()},'cur'));for(const l of P.layers){const m=MB[l.id];if(m&&!STORED.has(l.id)){STORED.add(l.id);await idb('media','readwrite',q=>q.put(m,String(l.id)))}}setSv('Saved')}catch(e){setSv('Autosave unavailable')}}
const saveSoon=()=>{if(!SAVEON)return;clearTimeout(sTimer);setSv('Saving\u2026');sTimer=setTimeout(saveNow,1200)};
addEventListener('pagehide',()=>{if(SAVEON)saveNow()});
const d2b=u=>{const[h,b]=u.split(','),m=/:(.*?);/.exec(h)[1],bin=atob(b),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:m})};
const b64=blob=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob)});
async function attach(l,m){MB[l.id]=m;STORED.add(l.id);const u=URL.createObjectURL(m.blob);
 if(m.kind=='glb'){await glbAttach(l,m.blob)}
 else if(m.kind=='image'){const el=new Image();el.src=u;try{await el.decode()}catch(e){}l.el=el;ELS[l.id]=el}
 else if(m.kind=='video'){const el=document.createElement('video');el.muted=true;el.playsInline=true;el.preload='auto';el.src=u;await new Promise(r=>{el.onloadedmetadata=r;el.onerror=r;setTimeout(r,4000)});l.el=el;l.vid=true;ELS[l.id]=el}
 else if(m.kind=='audio'){try{const b=await ac().decodeAudioData(await m.blob.arrayBuffer());l.buf=b;BUF[l.id]=b}catch(e){}}else if(m.kind=='blip'){try{const b=await ac().decodeAudioData(await m.blob.arrayBuffer());l.sbuf=b;BUF['b'+l.id]=b}catch(e){}}}
async function regFont(n,blob){try{const ff=new FontFace(n,await blob.arrayBuffer(),{weight:'1 1000',stretch:'25% 200%',style:'oblique -90deg 90deg'});await ff.load();document.fonts.add(ff);if(!FONTS.includes(n))FONTS.push(n);if(!FB.some(f=>f.name==n))FB.push({name:n,blob})}catch(e){}}
const fixP=()=>{P.layers.forEach(l=>{l.efx=l.efx||[];l.efa=[];l.efo=l.efo||[];l.font=l.font||'Roboto Flex'});P.bpm=P.bpm||120;P.bpb=P.bpb||4;P.sub=P.sub||1;id=Math.max(0,...P.layers.map(l=>l.id))+1;sel=null;ks=[];rep=null;$('#du').value=P.dur};
async function restore(){let rec=null;try{rec=await idb('proj','readonly',q=>q.get('cur'))}catch(e){}
 if(!rec||!rec.json){SAVEON=true;setSv('Autosave on');return}
 try{const fl=await idb('fonts','readonly',q=>q.get('all'));for(const f of fl||[])await regFont(f.name,f.blob);P=JSON.parse(rec.json);fixP();for(const l of P.layers)if(l.type=='media'||l.type=='audio'||l.hasBlip){const m=await idb('media','readonly',q=>q.get(String(l.id)));if(m)await attach(l,m)}
  HS=[];RD=[];c0=ser();all();setSv('Restored your last session')}catch(e){console.warn(e)}SAVEON=true}
