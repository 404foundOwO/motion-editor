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
 if(out){sv('motion.mp4',out);return}
 if(stop){if(confirm('Conversion cancelled. Save the WebM instead?'))sv('motion.webm',blob);return}
 console.error(fail);sv('motion.webm',blob);
 alert('Could not convert to MP4: '+(fail&&fail.message||fail)+'\n\nThe high-quality WebM was saved instead. You can convert it with ffmpeg (see the Export dialog).')}
