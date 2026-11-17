/* ---- WebM -> MP4 conversion with ffmpeg.wasm, downloaded only when asked (about 30 MB).
   Never bundled: the core contains x264, which is GPL. Loaded from a CDN at run time. ---- */
const FFC={ff:'0.12.10',core:'0.12.6',wasmBytes:32129114};
let FFM=null,FFP=null;
const ffBase=()=>window.FFBASE||'https://cdn.jsdelivr.net/npm/';
async function ffGet(url,type,onP,total){
 const r=await fetch(url);if(!r.ok)throw new Error('Could not download the converter ('+r.status+')');
 if(!r.body||!onP)return URL.createObjectURL(new Blob([await r.arrayBuffer()],{type}));
 const rd=r.body.getReader(),parts=[],len=total||+r.headers.get('content-length')||0;let got=0;
 for(;;){const x=await rd.read();if(x.done)break;parts.push(x.value);got+=x.value.length;onP(len?Math.min(1,got/len):null)}
 return URL.createObjectURL(new Blob(parts,{type}))}
function ffLoad(onP){
 if(FFM)return Promise.resolve(FFM);
 if(FFP)return FFP;
 FFP=(async()=>{
  const b=ffBase(),u=b+'@ffmpeg/ffmpeg@'+FFC.ff+'/dist/umd/',c=b+'@ffmpeg/core@'+FFC.core+'/dist/esm/',mb=FFC.wasmBytes/1e6;
  onP(null,'Downloading the converter…');
  const [wrapper,worker,core]=await Promise.all([ffGet(u+'ffmpeg.js','text/javascript'),ffGet(u+'814.ffmpeg.js','text/javascript'),ffGet(c+'ffmpeg-core.js','text/javascript')]);
  const wasm=await ffGet(c+'ffmpeg-core.wasm','application/wasm',f=>onP(f,'Downloading the converter… '+(f==null?'':Math.round(f*mb)+' of '+Math.round(mb)+' MB')),FFC.wasmBytes);
  onP(null,'Starting the converter…');
  if(!window.FFmpegWASM)await new Promise((ok,no)=>{const s=document.createElement('script');s.src=wrapper;s.onload=ok;s.onerror=()=>no(new Error('Could not load the converter'));document.head.appendChild(s)});
  const ff=new FFmpegWASM.FFmpeg();await ff.load({coreURL:core,wasmURL:wasm,classWorkerURL:worker});
  FFM=ff;return ff})();
 FFP.catch(()=>{FFP=null});return FFP}
function ffKill(){try{FFM&&FFM.terminate()}catch(e){}FFM=null;FFP=null}

/* returns after saving motion.mp4 (or the WebM if the conversion fails or is cancelled) */
async function webmToMp4(blob){
 let stop=0;const L=loadingShow(FFM?'Converting to MP4':'Getting the converter ready','Preparing…',{cancel:()=>{stop=1;ffKill()}});
 let out=null,fail=null;
 try{
  const ff=await ffLoad((f,t)=>L.set(f,t));if(stop)throw new Error('cancelled');
  L.title('Converting to MP4');L.set(0,'Converting… 0%');
  const cb=({progress,time})=>{const f=Math.max(isFinite(progress)?progress:0,time>0?time/(P.dur*1e6):0);L.set(Math.min(.99,f),'Converting… '+Math.round(Math.min(.99,f)*100)+'%')};
  ff.on('progress',cb);
  try{
   await ff.writeFile('in.webm',new Uint8Array(await blob.arrayBuffer()));
   const code=await ff.exec(['-i','in.webm','-c:v','libx264','-preset','veryfast','-crf','15','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','out.mp4']);
   if(code!==0)throw new Error('The converter stopped with an error ('+code+')');
   L.set(1,'Saving…');out=new Blob([await ff.readFile('out.mp4')],{type:'video/mp4'})
  }finally{try{ff.off('progress',cb);await ff.deleteFile('in.webm');await ff.deleteFile('out.mp4')}catch(e){}}
 }catch(e){fail=e}
 L.done();
 if(out){sv(fname('mp4'),out);return}
 if(stop){if(confirm('Conversion cancelled. Save the WebM instead?'))sv(fname('webm'),blob);return}
 console.error(fail);sv(fname('webm'),blob);
 alert('Could not convert to MP4: '+(fail&&fail.message||fail)+'\n\nThe high-quality WebM was saved instead. You can convert it with ffmpeg (see the Export dialog).')}

/* Chrome's real-time MP4 recording writes each track's mdhd duration in milliseconds while its timescale is 30000, so players that read the track header (phones, galleries) show a tiny length like 0:01 although the whole video plays. Set every track's duration from the movie duration. Only the small moov box is read and rewritten */
async function mp4FixDur(bl){try{const n=bl.size;let o=0;while(o+8<=n){const h=new DataView(await bl.slice(o,o+16).arrayBuffer());let sz=h.getUint32(0);const ty=h.getUint32(4);if(sz==1)sz=Number(h.getBigUint64(8));if(!sz)sz=n-o;if(sz<8)break;
 if(ty==0x6d6f6f76){const mb=new Uint8Array(await bl.slice(o,o+sz).arrayBuffer()),dv=new DataView(mb.buffer),walk=(a,e,f)=>{while(a+8<=e){const s=dv.getUint32(a),t=dv.getUint32(a+4);if(s<8)return;f(a,s,t);a+=s}};let mvTs=0,mvDu=0;const tr=[];
  walk(8,mb.length,(a,s,t)=>{if(t==0x6d766864){const v=mb[a+8];mvTs=dv.getUint32(a+8+(v?20:12));mvDu=v?Number(dv.getBigUint64(a+8+24)):dv.getUint32(a+8+16)}else if(t==0x7472616b)walk(a+8,a+s,(b,s2,t2)=>{if(t2==0x6d646961)walk(b+8,b+s2,(c,s3,t3)=>{if(t3==0x6d646864)tr.push(c)})})});
  if(!mvTs||!mvDu||mvDu>=2**32)return bl;
  for(const c of tr){const v=mb[c+8],ts=dv.getUint32(c+8+(v?20:12)),du=Math.round(mvDu/mvTs*ts);if(v)dv.setBigUint64(c+8+24,BigInt(du));else dv.setUint32(c+8+16,du)}
  return new Blob([bl.slice(0,o),mb,bl.slice(o+sz)],{type:bl.type})}
 o+=sz}}catch(e){}return bl}
