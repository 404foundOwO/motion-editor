function openGraph(f,title,prev){
 if(document.getElementById('gex'))return;
 const was={e:prev?prev.e:f.e,b:prev?(prev.b?[...prev.b]:null):(f.b?[...f.b]:null)};
 let b=f.e=='bez'&&f.b?[...f.b]:[...(EASEB[f.e]||EASEB.ease)];
 const X=u=>20+u*220,Y=v=>10+(1.5-v)*160,R=v=>Math.round(v*100)/100;
 const ov=document.createElement('div');ov.id='gex';
 let grid='';for(let i=0;i<=4;i++)grid+=`<line class=${i%4?'gl':'gl2'} x1=${X(i/4)} x2=${X(i/4)} y1=${Y(1.5)} y2=${Y(-.5)} />`;for(let v=-.5;v<=1.5;v+=.25)grid+=`<line class=${v==0||v==1?'gl2':'gl'} x1=${X(0)} x2=${X(1)} y1=${Y(v)} y2=${Y(v)} />`;
 ov.innerHTML=`<div class=gbox role=dialog aria-label="Easing graph"><div class=gh><b>Easing graph</b><span>${esc(title||'')}</span></div>
 <svg class=gsv viewBox="0 0 260 340">${grid}<line class=gdiag x1=${X(0)} y1=${Y(0)} x2=${X(1)} y2=${Y(1)} /><line class=gar id=ga1 /><line class=gar id=ga2 /><path id=gcv class=gcv /><circle id=gpt class=gpt r=4 />
 <circle class=ghit id=gh1 r=18 /><circle class="gk gk1" id=gk1 r=8 /><circle class=ghit id=gh2 r=18 /><circle class="gk gk2" id=gk2 r=8 />
 <circle class=gend cx=${X(0)} cy=${Y(0)} r=4 /><circle class=gend cx=${X(1)} cy=${Y(1)} r=4 /></svg>
 <div class=gtrack><span>Preview</span><div class=gtl><i id=gdot></i></div></div>
 <div class=gnum>${['x1','y1','x2','y2'].map((n,i)=>`<label>${n}<input type=number step=0.01 data-gi=${i}></label>`).join('')}</div>
 <div class=gpre>${GPRE.map(([n,v],i)=>`<button data-gp=${i} title="${n}"><svg viewBox="0 0 28 20" class=eg><path d="M3 17H25M3 3V17" class=eax /><path d="${easeD(x=>bez(v,x),3,3,22,14,-.25,1.25,24)}" class=ecv /></svg><span>${n}</span></button>`).join('')}</div>
 <div class=gact><button data-g=cancel>Cancel</button><button class=pri data-g=ok>Apply</button></div></div>`;
 document.body.appendChild(ov);
 const q=s=>ov.querySelector(s),svg=q('.gsv'),ins=[...ov.querySelectorAll('[data-gi]')];let raf=0;
 const upd=(live=1)=>{
  q('#ga1').setAttribute('x1',X(0));q('#ga1').setAttribute('y1',Y(0));q('#ga1').setAttribute('x2',X(b[0]));q('#ga1').setAttribute('y2',Y(b[1]));
  q('#ga2').setAttribute('x1',X(1));q('#ga2').setAttribute('y1',Y(1));q('#ga2').setAttribute('x2',X(b[2]));q('#ga2').setAttribute('y2',Y(b[3]));
  [['#gh1','#gk1',0],['#gh2','#gk2',2]].forEach(([h,k,i])=>{[h,k].forEach(s=>{q(s).setAttribute('cx',X(b[i]));q(s).setAttribute('cy',Y(b[i+1]))})});
  q('#gcv').setAttribute('d',easeD(x=>bez(b,x),X(0),Y(1.5),220,320,-.5,1.5,80));
  ins.forEach((el,i)=>{if(document.activeElement!==el)el.value=b[i]});
  if(live){f.e='bez';f.b=[...b];dirty=1}};
 [['#gh1',0],['#gh2',2]].forEach(([sel,i])=>{const h=q(sel);h.addEventListener('pointerdown',e=>{e.preventDefault();try{h.setPointerCapture(e.pointerId)}catch(_){}const mv=ev=>{const r=svg.getBoundingClientRect(),px=(ev.clientX-r.left)*260/r.width,py=(ev.clientY-r.top)*340/r.height;b[i]=R(Math.max(0,Math.min(1,(px-20)/220)));b[i+1]=R(Math.max(-.5,Math.min(1.5,1.5-(py-10)/160)));upd()};const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up)};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);mv(e)})});
 ins.forEach((el,i)=>el.oninput=()=>{const v=parseFloat(el.value);if(isNaN(v))return;b[i]=R(i%2?Math.max(-.5,Math.min(1.5,v)):Math.max(0,Math.min(1,v)));upd()});
 ov.querySelectorAll('[data-gp]').forEach(btn=>btn.onclick=()=>{b=[...GPRE[+btn.dataset.gp][1]];upd()});
 const done=ok=>{cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);ov.remove();if(!ok){f.e=was.e;if(was.b)f.b=was.b;else if(was.e!='bez')delete f.b;dirty=1}all()};
 const kd=e=>{if(e.key=='Escape'){e.preventDefault();e.stopPropagation();done(0)}else if(e.key=='Enter'&&e.target.tagName!='BUTTON'){e.preventDefault();e.stopPropagation();done(1)}};
 addEventListener('keydown',kd,true);
 q('[data-g=cancel]').onclick=()=>done(0);q('[data-g=ok]').onclick=()=>done(1);ov.addEventListener('pointerdown',e=>{if(e.target===ov)done(0)});
 const dot=q('#gdot'),pt=q('#gpt'),loop=ts=>{const p=(ts%2200)/2200,u=Math.min(1,Math.max(0,(p-.1)/.7)),v=bez(b,u);dot.style.left=Math.max(-12,Math.min(112,v*100))+'%';pt.setAttribute('cx',X(u));pt.setAttribute('cy',Y(Math.max(-.5,Math.min(1.5,v))));raf=requestAnimationFrame(loop)};
 upd();raf=requestAnimationFrame(loop)}

/* ---- gradient blur (linear + radial progressive blur) ---- */
const GBP=[];
function gbCv(i,w,h){let c=GBP[i];if(!c||c.width!=w||c.height!=h){c=GBP[i]=document.createElement('canvas');c.width=w;c.height=h}return c}
function blurC(src,r,j){
 const w=src.width,h=src.height,rp=r*Q,kd=rp>=24?4:rp>=10?2:1,iw=Math.max(2,Math.ceil(w/kd)),ih=Math.max(2,Math.ceil(h/kd)),pad=Math.min(160,Math.ceil(rp/kd*2.5)+2);
 const A=gbCv(40+(kd==1?0:kd==2?1:2),iw+330,ih+330),ag=A.getContext('2d');ag.setTransform(1,0,0,1,0,0);ag.filter='none';ag.globalAlpha=1;ag.globalCompositeOperation='source-over';ag.clearRect(0,0,iw+pad*2,ih+pad*2);
 ag.drawImage(src,0,0,w,h,pad,pad,iw,ih);
 ag.drawImage(src,0,0,1,h,0,pad,pad,ih);ag.drawImage(src,w-1,0,1,h,pad+iw,pad,pad,ih);ag.drawImage(src,0,0,w,1,pad,0,iw,pad);ag.drawImage(src,0,h-1,w,1,pad,pad+ih,iw,pad);
 ag.drawImage(src,0,0,1,1,0,0,pad,pad);ag.drawImage(src,w-1,0,1,1,pad+iw,0,pad,pad);ag.drawImage(src,0,h-1,1,1,0,pad+ih,pad,pad);ag.drawImage(src,w-1,h-1,1,1,pad+iw,pad+ih,pad,pad);
 const B=gbCv(11+j,iw,ih),bg=B.getContext('2d');bg.setTransform(1,0,0,1,0,0);bg.globalAlpha=1;bg.globalCompositeOperation='source-over';bg.clearRect(0,0,iw,ih);bg.filter=`blur(${rp/kd}px)`;bg.drawImage(A,0,0,iw+pad*2,ih+pad*2,-pad,-pad,iw+pad*2,ih+pad*2);bg.filter='none';
 return B}
const GBL=[0,1.5,3,5,8,12,17,24,34,48,68,96,136,192,272,384];
function gbRadii(lo,hi,cap){const rs=[lo];if(hi-lo>=.5){GBL.forEach(x=>{if(x>lo+.5&&x<hi-.5)rs.push(x)})}rs.push(hi);if(rs.length<=cap)return rs;const o=[];for(let i=0;i<cap;i++){const k=Math.round(i*(rs.length-1)/(cap-1));if(!o.length||o[o.length-1]!==rs[k])o.push(rs[k])}return o}
function gbRun(src,c){
 const w=src.width,h=src.height,lo=Math.min(c.b1,c.b2),hi=Math.max(c.b1,c.b2);if(!isFinite(lo+hi+c.x1+c.y1+c.x2+c.y2)||hi*Q<.3)return src;
 const x1=c.x1*Q,y1=c.y1*Q;let x2=c.x2*Q,y2=c.y2*Q;if(Math.hypot(x2-x1,y2-y1)<1)x2=x1+1;
 const r0=(c.r0||0)*Q,rr=Math.hypot(x2-x1,y2-y1),rs=gbRadii(lo,hi,PV&&!exp?6:12),n=rs.length,inc=c.b2>=c.b1,span=Math.max(1e-6,hi-lo);
 const R=gbCv(0,w,h),rg=R.getContext('2d');rg.setTransform(1,0,0,1,0,0);rg.filter='none';rg.globalAlpha=1;rg.globalCompositeOperation='source-over';rg.clearRect(0,0,w,h);
 const lv=j=>rs[j]*Q<.3?src:blurC(src,rs[j],j);
 rg.drawImage(lv(0),0,0,w,h);
 const M=gbCv(1,w,h),mg=M.getContext('2d');
 for(let j=1;j<n;j++){
  const ua=(rs[j-1]-lo)/span,ub=(rs[j]-lo)/span,o0=inc?ua:1-ub,o1=inc?ub:1-ua,a0=inc?0:1,a1=inc?1:0;
  const g=c.rad?mg.createRadialGradient(x1,y1,r0,x1,y1,Math.max(r0+1,rr)):mg.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(Math.max(0,Math.min(1,o0)),`rgba(0,0,0,${a0})`);g.addColorStop(Math.max(0,Math.min(1,o1)),`rgba(0,0,0,${a1})`);
  mg.setTransform(1,0,0,1,0,0);mg.globalAlpha=1;mg.globalCompositeOperation='copy';mg.fillStyle=g;mg.fillRect(0,0,w,h);
  rg.globalCompositeOperation='destination-out';rg.drawImage(M,0,0);
  mg.globalCompositeOperation='source-in';mg.drawImage(lv(j),0,0,w,h);
  rg.globalCompositeOperation='lighter';rg.drawImage(M,0,0)}
 rg.globalCompositeOperation='source-over';
 return R}
const gbCore=(src,L,t)=>gbRun(src,{rad:val(L,'gbm',t)>=.5,b1:Math.max(0,val(L,'gb1',t)),b2:Math.max(0,val(L,'gb2',t)),x1:val(L,'gbx1',t)*W,y1:val(L,'gby1',t)*H,x2:val(L,'gbx2',t)*W,y2:val(L,'gby2',t)*H});
function cbCore(src,L,t){const x0=val(L,'cbx',t)*W,y0=val(L,'cby',t)*H,R=Math.max(Math.hypot(x0,y0),Math.hypot(W-x0,y0),Math.hypot(x0,H-y0),Math.hypot(W-x0,H-y0));return gbRun(src,{rad:true,b1:0,b2:Math.max(0,val(L,'cbb',t)),x1:x0,y1:y0,x2:x0+R,y2:y0,r0:R*Math.max(0,Math.min(95,val(L,'cbs',t)))/100})}
function gbCam(fn,L,t){const R=fn(cv,L,t);if(R===cv)return;cx.save();cx.setTransform(1,0,0,1,0,0);cx.filter='none';cx.globalAlpha=1;cx.globalCompositeOperation='copy';cx.drawImage(R,0,0);cx.restore()}
const gbPts=(L,tt)=>({x1:val(L,'gbx1',tt)*W,y1:val(L,'gby1',tt)*H,x2:val(L,'gbx2',tt)*W,y2:val(L,'gby2',tt)*H,rad:val(L,'gbm',tt)>=.5,b1:val(L,'gb1',tt),b2:val(L,'gb2',tt)});
const gbPill=(g,k,u)=>{const x=k=='v1'?g.x1:g.x2,y=k=='v1'?g.y1:g.y2,v=Math.round(k=='v1'?g.b1:g.b2),w=(String(v).length*8+22)*u,h=22*u,off=g.rad&&k=='v2'?{x:14*u,y:-h-10*u}:{x:16*u,y:-h-6*u};return{x:x+off.x,y:y+off.y,w,h,v}};
function gbOv(L,u){
 if(!L||!L.efa||!L.efa.includes('gblur'))return;const g=gbPts(L,t),ang=Math.atan2(g.y2-g.y1,g.x2-g.x1),R=Math.hypot(g.x2-g.x1,g.y2-g.y1);
 ox.save();ox.lineCap='round';
 const stroke=(w,c,dash)=>{ox.setLineDash(dash||[]);ox.lineWidth=w*u;ox.strokeStyle=c;ox.stroke()};
 const path=()=>{ox.beginPath();if(g.rad)ox.arc(g.x1,g.y1,R,0,6.2832);else{const nx=-Math.sin(ang)*W*2,ny=Math.cos(ang)*W*2;ox.moveTo(g.x1+nx,g.y1+ny);ox.lineTo(g.x1-nx,g.y1-ny);ox.moveTo(g.x2+nx,g.y2+ny);ox.lineTo(g.x2-nx,g.y2-ny)}};
 path();stroke(3,'#0006',[8,6]);path();stroke(1.5,'#ffffffcc',[8,6]);
 ox.beginPath();ox.moveTo(g.x1,g.y1);ox.lineTo(g.x2,g.y2);stroke(4,'#0007');ox.beginPath();ox.moveTo(g.x1,g.y1);ox.lineTo(g.x2,g.y2);stroke(2,'#fff');
 [[g.x1,g.y1],[g.x2,g.y2]].forEach(([x,y],i)=>{ox.beginPath();ox.arc(x,y,8*u,0,6.2832);ox.fillStyle='#fff';ox.fill();ox.lineWidth=2.5*u;ox.strokeStyle=i?'#3ecf8e':'#8b7bff';ox.setLineDash([]);ox.stroke()});
 ox.font=`600 ${12*u}px system-ui,sans-serif`;ox.textBaseline='middle';
 ['v1','v2'].forEach(k=>{const q=gbPill(g,k,u);ox.beginPath();ox.roundRect?ox.roundRect(q.x,q.y,q.w,q.h,6*u):ox.rect(q.x,q.y,q.w,q.h);ox.fillStyle='#1a1a20ee';ox.fill();ox.lineWidth=1*u;ox.strokeStyle=k=='v1'?'#8b7bff':'#3ecf8e';ox.stroke();ox.fillStyle='#fff';ox.fillText(q.v+' px',q.x+8*u,q.y+q.h/2+.5*u)});
 ox.restore()}
function gbHit(L,c){
 const g=gbPts(L,t),u=1/Math.max(.05,c.s),th=14*u,d=(x,y)=>Math.hypot(x-c.x,y-c.y);
 for(const k of ['v1','v2']){const q=gbPill(g,k,u);if(c.x>=q.x&&c.x<=q.x+q.w&&c.y>=q.y&&c.y<=q.y+q.h)return k}
 if(d(g.x2,g.y2)<th)return'p2';if(d(g.x1,g.y1)<th)return'p1';
 if(g.rad){if(Math.abs(d(g.x1,g.y1)-Math.hypot(g.x2-g.x1,g.y2-g.y1))<8*u)return'ring'}
 else{const dx=g.x2-g.x1,dy=g.y2-g.y1,l2=dx*dx+dy*dy||1,s=Math.max(0,Math.min(1,((c.x-g.x1)*dx+(c.y-g.y1)*dy)/l2));if(d(g.x1+dx*s,g.y1+dy*s)<8*u)return'line'}
 return null}
function startGb(L,h,c){
 const g0=gbPts(L,t),sx=c.x,sy=c.y;GBD={k:h};cv.style.cursor='grabbing';
 const setP=(k,x,y)=>{setV(L,'gbx'+k,+(x/W).toFixed(4));setV(L,'gby'+k,+(y/H).toFixed(4))};
 cv.onpointermove=m=>{const p=cpos(m),dx=p.x-sx,dy=p.y-sy;
  if(h=='v1'||h=='v2'){const k=h=='v1'?'gb1':'gb2',v0=h=='v1'?g0.b1:g0.b2;setV(L,k,Math.max(0,Math.min(300,+(v0+(p.x-sx)*p.s*.5).toFixed(1))))}
  else if(h=='p1'){if(g0.rad){setP(1,g0.x1+dx,g0.y1+dy);setP(2,g0.x2+dx,g0.y2+dy)}else{let nx=p.x,ny=p.y;if(m.shiftKey){const a=Math.round(Math.atan2(g0.y2-ny,g0.x2-nx)/.2618)*.2618,r=Math.hypot(g0.x2-nx,g0.y2-ny);nx=g0.x2-Math.cos(a)*r;ny=g0.y2-Math.sin(a)*r}setP(1,nx,ny)}}
  else if(h=='p2'||h=='ring'){let nx=p.x,ny=p.y;if(m.shiftKey){const a=Math.round(Math.atan2(ny-g0.y1,nx-g0.x1)/.2618)*.2618,r=Math.hypot(nx-g0.x1,ny-g0.y1);nx=g0.x1+Math.cos(a)*r;ny=g0.y1+Math.sin(a)*r}setP(2,nx,ny)}
  else if(h=='line'){setP(1,g0.x1+dx,g0.y1+dy);setP(2,g0.x2+dx,g0.y2+dy)}
  dirty=1;ovd=1};
 cv.onpointerup=()=>{cv.onpointermove=hoverMove;GBD=null;cv.style.cursor='';all();ovd=1}}
const GBUI=L=>{const m=(L.p.gbm||0)>=.5?1:0;
 return `<div class=seg2><button data-gbm=0 class="${m?'':'on'}">${IC('gline')}Linear</button><button data-gbm=1 class="${m?'on':''}">${IC('gradial')}Radial</button></div>`
 +row(L,'gb1','Blur at start')+row(L,'gb2','Blur at end')
 +`<div class=r><button data-gbswap=1>${IC('swap')}Swap blur</button><button data-gbreset=1>${IC('crosshair')}Reset handles</button></div>`
 +`<p class=m style="margin:6px 2px 0;font-size:11.5px;line-height:1.5">Drag the two handles on the canvas. Drag a blur pill to scrub it. Hold Shift to snap the angle. The effect works on the whole frame, so the handles stay put when the layer moves.</p>`
 +`<p class=m style="margin:14px 0 0"><b>Handles</b></p>`+row(L,'gbx1','Start X (0–1)')+row(L,'gby1','Start Y (0–1)')+row(L,'gbx2','End X (0–1)')+row(L,'gby2','End Y (0–1)')};
let GBD=null;

const FXPK='meFxPresets',FXB={wipe:[{name:'Soft left → right',p:{wpm:0,wps:1,wpf:220,wpl:0,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5}},{name:'Wavy reveal',p:{wpm:0,wps:2,wpf:0,wpa:44,wpw:190,wpt:.5,wpl:0,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5}},{name:'Wavy with line',p:{wpm:0,wps:2,wpf:0,wpa:40,wpw:170,wpt:.6,wpl:8,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5}},{name:'Zigzag top → down',p:{wpm:0,wps:3,wpf:0,wpa:34,wpw:130,wpt:0,wpl:0,wpx1:.5,wpy1:0,wpx2:.5,wpy2:1}},{name:'Scallop',p:{wpm:0,wps:4,wpf:0,wpa:30,wpw:150,wpt:.3,wpl:0,wpx1:0,wpy1:.5,wpx2:1,wpy2:.5}},{name:'Iris open',p:{wpm:1,wps:1,wpf:160,wpl:0,wpx1:.5,wpy1:.5,wpx2:1,wpy2:1}},{name:'Wavy iris',p:{wpm:1,wps:2,wpf:0,wpa:40,wpw:200,wpt:.4,wpl:6,wpx1:.5,wpy1:.5,wpx2:1,wpy2:1}}],gblur:[{name:'Bottom fade',p:{gbm:0,gb1:0,gb2:36,gbx1:.5,gby1:.55,gbx2:.5,gby2:.95}},{name:'Top fade',p:{gbm:0,gb1:0,gb2:36,gbx1:.5,gby1:.45,gbx2:.5,gby2:.05}},{name:'Spotlight',p:{gbm:1,gb1:0,gb2:40,gbx1:.5,gby1:.5,gbx2:.5,gby2:.95}}],cblur:[{name:'Soft lens',p:{cbb:12,cbs:55}},{name:'Strong lens',p:{cbb:40,cbs:30}}],fmove:[{name:'Scroll left',p:{fmm:1,fmx:-300,fmy:0,fmz:0}},{name:'Rain down',p:{fmm:0,fmx:0,fmy:500,fmz:0}},{name:'Fly toward',p:{fmm:0,fmx:0,fmy:0,fmz:-600}}]};
const fxpLoad=()=>{try{return JSON.parse(localStorage.getItem(FXPK)||'{}')}catch(e){return{}}},fxpSave=o=>{try{localStorage.setItem(FXPK,JSON.stringify(o))}catch(e){}};
const fxKeys=k=>k=='vfx'?['vs','ve','rw','rsz']:EP[k]?EP[k].filter(a=>a[0]).map(a=>a[0]):[k];
function closeFxPre(){const m=document.getElementById('fxpm');if(m)m.remove();removeEventListener('pointerdown',fxpOut,true)}
function fxpOut(e){const m=document.getElementById('fxpm');if(m&&!m.contains(e.target))closeFxPre()}
function openFxPre(L,k,btn){closeFxPre();const all0=fxpLoad(),user=all0[k]||[],built=FXB[k]||[],m=document.createElement('div');m.id='fxpm';const r=btn.getBoundingClientRect();m.style.left=Math.max(8,Math.min(innerWidth-232,r.right-224))+'px';m.style.top=Math.min(innerHeight-60,r.bottom+6)+'px';
 m.innerHTML=`<div class=pmh>Presets · ${esc(EF[k][0])}</div>${built.map((p,i)=>`<button data-pi=b${i}>${esc(p.name)}</button>`).join('')}${user.map((p,i)=>`<div class=pmr><button data-pi=u${i}>${esc(p.name)}</button><button data-ib data-pd=${i} title=Delete>${IC('x')}</button></div>`).join('')}${built.length||user.length?'':'<p class=m style="margin:4px 8px 8px">No presets yet.</p>'}<div class=pms><input placeholder="Save current as…" maxlength=28><button class=pri data-ps=1>Save</button></div>`;
 document.body.appendChild(m);
 const apply=p=>{fxKeys(k).forEach(pk=>{if(p[pk]!==undefined)setV(L,pk,p[pk])});closeFxPre();all()};
 const save=()=>{const nm=m.querySelector('input').value.trim();if(!nm)return m.querySelector('input').focus();const o={};fxKeys(k).forEach(pk=>{const v=val(L,pk,t);if(typeof v=='number')o[pk]=+(+v).toFixed(4)});const a=fxpLoad();(a[k]=a[k]||[]).push({name:nm,p:o});fxpSave(a);closeFxPre();openFxPre(L,k,btn)};
 m.onclick=e=>{const d=e.target.dataset;if(d.pi){const i=+d.pi.slice(1);apply(d.pi[0]=='b'?built[i].p:user[i].p)}else if(d.pd!==undefined){const a=fxpLoad();a[k].splice(+d.pd,1);fxpSave(a);closeFxPre();openFxPre(L,k,btn)}else if(d.ps)save()};
 m.querySelector('input').onkeydown=e=>{if(e.key=='Enter')save();if(e.key=='Escape')closeFxPre();e.stopPropagation()};
 setTimeout(()=>addEventListener('pointerdown',fxpOut,true),0)}

