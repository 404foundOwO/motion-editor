const {JSDOM,VirtualConsole}=require('jsdom');const N=require('@napi-rs/canvas');const fs=require('fs');
exports.load=async function(file,errs){
 let html=file.startsWith('MF:')?'':fs.readFileSync(file,'utf8').replace(/<link[^>]*googleapis[^>]*>/g,'');
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errs&&errs.push('jsdomError '+(e.detail&&e.detail.message||e.message)));vc.on('error',m=>errs&&errs.push('console.error '+m));
 const mf=file.startsWith('MF:');const O={runScripts:'dangerously',resources:mf?'usable':undefined,pretendToBeVisual:true,virtualConsole:vc,url:mf?'file://'+file.slice(3):'http://localhost/',beforeParse(w){
  w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});
  w.EncodedVideoChunk=class{};w.MediaRecorder=class{};w.AudioContext=w.webkitAudioContext=class{constructor(){this.destination={};this.currentTime=0}createGain(){return{gain:{value:1,setValueAtTime(){}},connect(){}}}createStereoPanner(){return{pan:{value:0},connect(){}}}createAnalyser(){return{connect(){},getByteFrequencyData(){},fftSize:0,frequencyBinCount:8}}decodeAudioData(){return Promise.reject(new Error('x'))}resume(){return Promise.resolve()}};
  w.document.fonts={load:()=>Promise.resolve(),add(){},ready:Promise.resolve()};w.FontFace=class{load(){return Promise.resolve()}};const P=w.HTMLCanvasElement.prototype;
  for(const k of ['width','height']){const od=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{get(){return od.get.call(this)},set(v){od.set.call(this,v);if(this._n){this._n.width=Math.max(1,this.width);this._n.height=Math.max(1,this.height)}},configurable:true})}
P.getContext=function(t){if(t!='2d')return null;if(!this._n){this._n=N.createCanvas(Math.max(1,this.width),Math.max(1,this.height));this._c=this._n.getContext('2d');const d=this._c.drawImage.bind(this._c);this._c.drawImage=(s,...a)=>d(s&&s._n?s._n:s,...a)}
 else if(this._n.width!=this.width||this._n.height!=this.height){this._n.width=Math.max(1,this.width);this._n.height=Math.max(1,this.height)}return this._c};
  w.requestAnimationFrame=cb=>setTimeout(()=>cb(w.performance.now()),16);
  w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.releasePointerCapture=function(){};
 }};
 const dom=mf?await JSDOM.fromFile(file.slice(3),O):new JSDOM(html,O);
 await new Promise(r=>setTimeout(r,mf?2500:800));return dom;
};
