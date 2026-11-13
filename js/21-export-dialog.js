/* ---- Export dialog: pick a format on the left, set quality on the right (video and audio-only) ---- */
let EXFMT='webm';
function exportMenu(){
 const old=$('#exm');if(old){old.remove();return}
 const hasAud=P.layers.some(l=>(l.type=='audio'&&l.buf)||l.sbuf),canA=axHasAudio();
 const rtMp4=typeof MediaRecorder!='undefined'&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported('video/mp4;codecs=avc1');
 /* video: which capture methods can make this format here */
 const vm={mp4:[],webm:[]};
 if(OFFC.ok){if(OFFC.avc&&(!hasAud||OFFC.aac))vm.mp4.push('1');if(OFFC.vp9&&(!hasAud||OFFC.opus))vm.webm.push('1')}
 if(rtMp4)vm.mp4.push('0');vm.webm.push('0');
 const FM=[
  ['Video',[['mp4','MP4',vm.mp4.length?'H.264, plays everywhere':'Not encodable here, converts from WebM',true,''],['webm','WebM','VP9, small and sharp',true,'']]],
  ['Audio only',[['wav','WAV','Lossless, works everywhere',canA,'There is no audio in this project'],['ogg','Ogg Opus','Small, great quality',canA&&OFFC.opus,canA?'This browser cannot encode Opus':'There is no audio in this project'],['m4a','M4A (AAC)','Plays on Apple devices',canA&&OFFC.aac,canA?'This browser cannot encode AAC':'There is no audio in this project']]]];
 const flat=FM.flatMap(g=>g[1]);if(!flat.some(f=>f[0]==EXFMT&&f[3]))EXFMT='webm';
 const sty='background:#0d0d10;color:#ddd;border:1px solid #3a3a45;border-radius:6px;padding:5px 8px;font:inherit',row=(n,h,id)=>`<div id=${id} style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:9px 0"><span>${n}</span>${h}</div>`;
 const d=document.createElement('div');d.id='exm';d.style.cssText='position:fixed;inset:0;background:#000b;z-index:60;display:flex;align-items:center;justify-content:center;overflow:auto;padding:12px';
 const SC=[1,.75,.5,.25],Q=[['Draft',4],['Good',10],['High',25],['Max',50]];
 d.innerHTML=`<div style="background:#1b1b21;border:1px solid #3a3a45;border-radius:12px;padding:18px;width:600px;max-width:100%;color:#ddd;font:13px system-ui,sans-serif">
<h3 style="margin:0 0 12px;font-size:15px">Export</h3>
<div style="display:flex;gap:18px;flex-wrap:wrap">
<div id=xfl style="flex:1 1 210px;min-width:190px">${FM.map(([g,it])=>`<div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7d7d8a;margin:${g=='Video'?'0':'14px'} 0 6px">${g}</div>`+it.map(([k,n,s,ok,why])=>`<button data-f=${k} ${ok?'':'disabled'} title="${ok?'':why}" style="display:block;width:100%;text-align:left;margin:0 0 5px;padding:8px 10px;border-radius:8px;border:1px solid #3a3a45;background:#0d0d10;color:${ok?'#ddd':'#6a6a74'};font:inherit;cursor:${ok?'pointer':'not-allowed'}"><b style="font-weight:600">${n}</b><div style="font-size:11px;color:${ok?'#9a9aa6':'#5a5a64'}">${ok?s:why}</div></button>`).join('')).join('')}</div>
<div style="flex:1 1 260px;min-width:240px"><div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7d7d8a;margin:0 0 6px">Settings</div>
${row('Resolution',`<select id=xr style="${sty}"></select>`,'xrr')}${row('Frame rate',`<select id=xf style="${sty}"><option>24<option>30<option selected>60</select>`,'xfr')}
${row('Quality',`<select id=xq style="${sty}">${Q.map(([n,b])=>`<option value=${b} ${b==25?'selected':''}>${n}`).join('')}<option value=0>Custom</select>`,'xqr')}${row('Bitrate (Mbps)',`<input id=xb type=number min=1 max=200 step=1 value=25 style="${sty};width:80px">`,'xbr')}
${row('Method',`<select id=xt style="${sty}"></select>`,'xtr')}
${row('Bit depth',`<select id=axb style="${sty}"><option value=16>16-bit<option value=24>24-bit<option value=32>32-bit float</select>`,'axbr')}
${row('Sample rate',`<select id=axs style="${sty}"><option value=48000>48 kHz<option value=44100>44.1 kHz</select>`,'axsr')}
${row('Bitrate',`<select id=axk style="${sty}"><option value=96>96 kbps<option value=128>128 kbps<option value=192 selected>192 kbps<option value=256>256 kbps<option value=320>320 kbps</select>`,'axkr')}
${row('Prevent clipping',`<input id=axn type=checkbox checked>`,'axnr')}
<p id=xi style="margin:10px 0 0;color:#9a9aa6;font-size:12px;line-height:1.45"></p>
<div id=xcv style="display:none;margin-top:10px;padding:8px 10px;border-left:2px solid #55556a;color:#9a9aa6;font-size:11.5px;line-height:1.5"><div>This browser can't encode MP4, so this saves a high-quality <b style="font-weight:600;color:#c4c4cf">WebM</b>. Convert it to MP4 with ffmpeg:</div><code id=xcm style="display:block;margin:6px 0;padding:6px 8px;background:#0d0d10;border-radius:6px;color:#c4c4cf;font-size:11px;word-break:break-all">ffmpeg -i motion.webm -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k motion.mp4</code><div>Converting re-encodes the video once more, so expect a very small quality loss. For MP4 with no loss at all, open the editor in <b style="font-weight:600;color:#c4c4cf">Chrome, Edge or Brave</b> and export MP4 directly.</div><button id=xcp style="${sty};margin-top:6px;font-size:11px;padding:3px 8px">Copy command</button></div></div></div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button id=xc style="${sty}">Cancel</button><button id=xg style="${sty.replace('#0d0d10','#6c5ce7')}">Export</button></div></div>`;
 document.body.appendChild(d);const g=i=>d.querySelector('#'+i),show=(id,on)=>{g(id).style.display=on?'flex':'none'};
 const info=()=>{
  const f=EXFMT,vid=f=='mp4'||f=='webm',conv=f=='mp4'&&!vm.mp4.length,ms=vid?(conv?vm.webm:vm[f]):[];
  d.querySelectorAll('#xfl button[data-f]').forEach(b=>{const on=b.dataset.f==f&&!b.disabled;b.style.borderColor=on?'#8b7bff':'#3a3a45';b.style.background=on?'#2a2650':'#0d0d10'});
  ['xrr','xfr','xqr','xbr','xtr'].forEach(i=>show(i,vid));
  if(vid)['axbr','axsr','axkr','axnr'].forEach(i=>show(i,false));
  g('xcv').style.display=conv?'block':'none';g('xg').textContent=conv?'Export WebM':'Export';
  if(vid){
   const xt=g('xt'),cur=xt.value;xt.innerHTML=ms.map(m=>m=='1'?'<option value=1>Frame by frame (true fps)':'<option value=0>Real-time recording').join('');if(ms.includes(cur))xt.value=cur;
   show('xtr',ms.length>1);if(conv&&!g('xcv').dataset.q){g('xcv').dataset.q=1;g('xq').value=50;g('xb').value=50}
   const pre=xt.value=='1',keep=g('xr').value;g('xr').innerHTML=SC.map(s=>`<option value=${s}>${Math.round(W*s)}×${Math.round(H*s)}${s==1?' (full)':''}`).join('');if(keep)g('xr').value=keep;
   const mb=Math.round(+g('xb').value*P.dur/8);
   g('xi').textContent=(pre?`About ${mb} MB. Every frame is rendered exactly, so you get a true ${g('xf').value} fps however slow your graphics are. It can take longer than the video itself.`:`About ${mb} MB. Real-time recording takes as long as the video, and heavy projects at high resolution may drop frames.`)+(OFFC.ok?'':' Frame by frame export is not available in this browser (it needs WebCodecs).')+' The canvas shape comes from the aspect ratio button in the top bar.';
  }else{
   const wav=f=='wav',opus=f=='ogg';
   g('xcv').style.display='none';g('xg').textContent='Export';
   show('axbr',wav);show('axsr',!opus);show('axkr',!wav);show('axnr',true);
   const sr=opus?48000:+g('axs').value,kb=+g('axk').value,mb=wav?P.dur*sr*2*(+g('axb').value)/8/1e6:kb*P.dur/8/1e3;
   g('xi').textContent='Whole project, '+P.dur.toFixed(1)+' s, stereo. About '+(mb<1?mb.toFixed(2):mb.toFixed(1))+' MB.'+(opus?' Opus always runs at 48 kHz.':'')}};
 d.querySelectorAll('#xfl button[data-f]').forEach(b=>b.onclick=()=>{if(b.disabled)return;EXFMT=b.dataset.f;if(EXFMT!='mp4')delete g('xcv').dataset.q;info()});
 ['xt','xf','axb','axs','axk'].forEach(i=>g(i).onchange=info);
 g('xq').onchange=()=>{if(+g('xq').value)g('xb').value=g('xq').value;info()};
 g('xb').oninput=()=>{g('xq').value=[...g('xq').options].some(o=>o.value==g('xb').value)?g('xb').value:0;info()};
 g('xc').onclick=()=>d.remove();g('xcp').onclick=()=>{const t=g('xcm').textContent;try{navigator.clipboard.writeText(t).then(()=>{g('xcp').textContent='Copied'})}catch(e){const r=document.createRange();r.selectNodeContents(g('xcm'));getSelection().removeAllRanges();getSelection().addRange(r);g('xcp').textContent='Selected, press Ctrl+C'}};
 d.addEventListener('keydown',e=>{if(e.key=='Escape')d.remove()});d.tabIndex=-1;d.focus();
 g('xg').onclick=()=>{const f=EXFMT;d.remove();
  if(f=='mp4'||f=='webm'){const o={sc:+g('xr').value,fps:+g('xf').value,br:Math.max(1,+g('xb').value||25),mp4:f=='mp4'&&vm.mp4.length>0,precise:g('xt').value=='1'};o.precise?startOffline(o):startExport(o)}
  else startAudioExport({f:f=='wav'?'wav'+g('axb').value:f,sr:+g('axs').value,kb:+g('axk').value,norm:g('axn').checked})};
 info()}
$('#exv').onclick=exportMenu;
