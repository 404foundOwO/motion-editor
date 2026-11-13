const C0={x:0,y:0,z:0,rx:0,ry:0,d:0},OFFS=[];let dep=0,NC=null,NF=-1,gd=0;
function offBegin(){if(!OFFS[dep]){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;OFFS[dep]=c.getContext('2d')}const o=OFFS[dep++];o.setTransform(Q,0,0,Q,0,0);o.globalAlpha=1;o.globalCompositeOperation='source-over';o.filter='none';o.clearRect(0,0,W,H);const h={o,prev:cx};cx=o;return h}
const offEnd=h=>{cx=h.prev;dep--};
function noiseOver(ctx,amt,t,mode){const fr=Math.round(t*FPS);if(!NC){NC=document.createElement('canvas');NC.width=NC.height=512}if(fr!=NF){NF=fr;const g=NC.getContext('2d'),im=g.createImageData(512,512);let s=(fr*2654435761>>>0)||1;for(let i=0;i<im.data.length;i+=4){s=(s*1664525+1013904223)>>>0;im.data[i]=im.data[i+1]=im.data[i+2]=s>>>24;im.data[i+3]=255}g.putImageData(im,0,0)}
 ctx.save();ctx.setTransform(Q,0,0,Q,0,0);ctx.globalCompositeOperation=mode;ctx.globalAlpha=Math.max(0,Math.min(1,amt));ctx.fillStyle=ctx.createPattern(NC,'repeat');ctx.fillRect(0,0,W,H);ctx.restore()}
function drawPix(src,s){s=Math.max(1,Math.round(s*Q));const cw=cv.width,ch=cv.height,w=Math.ceil(cw/s),h=Math.ceil(ch/s);T[1].setTransform(1,0,0,1,0,0);T[1].clearRect(0,0,cw,ch);T[1].drawImage(src,0,0,w,h);cx.save();cx.setTransform(1,0,0,1,0,0);cx.imageSmoothingEnabled=false;cx.drawImage(T[1].canvas,0,0,w,h,0,0,w*s,h*s);cx.restore()}
const PXC=[0,1].map(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c.getContext('2d')});
function pixC(src,s){s=Math.max(1,Math.round(s*Q));const cw=cv.width,ch=cv.height,w=Math.ceil(cw/s),h=Math.ceil(ch/s);PXC[0].setTransform(1,0,0,1,0,0);PXC[0].clearRect(0,0,cw,ch);PXC[0].drawImage(src,0,0,w,h);PXC[1].setTransform(1,0,0,1,0,0);PXC[1].clearRect(0,0,cw,ch);PXC[1].imageSmoothingEnabled=false;PXC[1].drawImage(PXC[0].canvas,0,0,w,h,0,0,w*s,h*s);return PXC[1].canvas}
const fq=f=>Q==1||!f?f:f.replace(/(-?\d*\.?\d+)px/g,(m,n)=>(n*Q)+'px');
function setQ(q){Q=q;const w=Math.max(2,Math.round(W*q)),h=Math.max(2,Math.round(H*q));cv.width=w;cv.height=h;OFFS.length=0;PXC.forEach(g=>{g.canvas.width=w;g.canvas.height=h});T.forEach(g=>{g.canvas.width=w;g.canvas.height=h})}
function glFx(e,src,L,t){if(e=='tile'&&val(L,'tlf',t)>.5)return null;const ps=EP[e]||[],nums=[],cols=[];GP[e].forEach(k=>{const d=ps.find(p=>p[0]==k),v=val(L,k,t);if(d&&typeof d[2]=='string')cols.push([1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255));else nums.push(v)});if(e=='tile'&&nums[3]>.5){nums[0]=Math.max(8,nums[0])/W;nums[1]=Math.max(8,nums[1])/H;try{const E=effOf(L,t),p=proj(E.p[0],E.p[1],E.p[2],camAt(t));nums[6]=.5+(p?p.x:0)/W;nums[7]=.5-(p?p.y:0)/H}catch(er){nums[6]=.5;nums[7]=.5}}return glRun(e,src,nums,cols,t)}
function postSrc0(L,t,o){if(L.efa.includes('noise'))noiseOver(o,val(L,'noise',t),t,'source-atop');let src=o.canvas;for(const e of L.efa){if(GP[e]){const r=glFx(e,src,L,t);if(r)src=r}else if(e=='pix')src=pixC(src,val(L,'pix',t));else if(e=='gblur')src=gbCore(src,L,t);else if(e=='cblur')src=cbCore(src,L,t);else if(e=='wipe')src=wpRun(src,L,t);else if(e=='drop')src=drRun(src,L,t);else if(e=='cbg')src=cbgRun(src,L,t)}return src}
function one(L,t,c,al,X){const E=effOf(L,t),zz=X?mv(E.R,[0,0,X.zo*E.s]):[0,0,0],q=[E.p[0]+zz[0],E.p[1]+zz[1],E.p[2]+zz[2]],p=proj(q[0],q[1],q[2],c);if(!p)return;const v=k=>val(L,k,t);
 if(!X&&L.efa.includes('ext')){const d=Math.max(0,v('exd')),N=Math.min(20,Math.max(2,Math.round(d/12)));for(let i=N;i>=1;i--)one(L,t,c,al,{zo:d*i/N,sh:1-.6*i/N})}
 const bx=mv(E.R,[100*E.s,0,0]),by=mv(E.R,[0,100*E.s,0]),p1=proj(q[0]+bx[0],q[1]+bx[1],q[2]+bx[2],c),p2=proj(q[0]+by[0],q[1]+by[1],q[2]+by[2],c);if(!p1||!p2)return;
 let dofb=0,fa=1;if(mode!='3d'){const C=P.layers.find(l=>l.type=='cam');if(C){const dp=800/p.s,g=k=>val(C,k,t);if(C.efa.includes('dof'))dofb=Math.min(60,Math.max(0,g('dfa'))*Math.abs(dp-g('dff'))/dp*6);if(C.efa.includes('fog'))fa=1-Math.max(0,Math.min(1,g('fga')))*Math.max(0,Math.min(1,(dp-g('fgs'))/Math.max(1,g('fgr'))))}}
 const fl=L.efa.filter(e=>FS[e]).map(e=>FS[e](v(e)));if(dofb>.3)fl.push(`blur(${dofb.toFixed(1)}px)`);if(X)fl.push(`brightness(${X.sh.toFixed(2)})`);const fs=fl.join(' ');
 if(L.type=='emitter'&&v('p3d')>=.5){cx.save();cx.setTransform(Q,0,0,Q,0,0);cx.globalAlpha=Math.max(0,E.o)*al*fa;if(fs)cx.filter=fq(fs);const gl3=L.efa.includes('glow')?v('glow'):0;if(gl3>0){cx.shadowColor=v('c1');cx.shadowBlur=gl3*Q}drawEmitter(L,t,{c,E});cx.restore();return}
 const PS=Math.max(Math.abs(p1.s-p.s),Math.abs(p2.s-p.s))/p.s;if(PS>.004&&pone(L,t,c,E,q,p,fs,al*fa,v,PS))return;
 cx.save();cx.transform((p1.x-p.x)/100,(p1.y-p.y)/100,(p2.x-p.x)/100,(p2.y-p.y)/100,W/2+p.x,H/2+p.y);cx.globalAlpha=Math.max(0,E.o)*al*fa;
 if(fs)cx.filter=fq(fs);
 const ch=L.efa.includes('chroma')?v('chroma'):0,gl=L.efa.includes('glow')?v('glow'):0;
 if(ch>0){cx.globalCompositeOperation='screen';[['#f00',-ch],['#0f0',0],['#00f',ch]].forEach(([col,o])=>{cx.save();cx.translate(o,0);body(L,t,col);cx.restore()})}
 else{if(gl>0){cx.shadowColor=v('c1');cx.shadowBlur=gl*Q}body(L,t,L.col)}
 cx.restore()}

let TXC=null,PTW=null;
function triD(g,img,d0,d1,d2,s0,s1,s2){const den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);if(!den)return;
const a=((d1[0]-d0[0])*(s2[1]-s0[1])-(d2[0]-d0[0])*(s1[1]-s0[1]))/den,c=((s1[0]-s0[0])*(d2[0]-d0[0])-(s2[0]-s0[0])*(d1[0]-d0[0]))/den,b=((d1[1]-d0[1])*(s2[1]-s0[1])-(d2[1]-d0[1])*(s1[1]-s0[1]))/den,d=((s1[0]-s0[0])*(d2[1]-d0[1])-(s2[0]-s0[0])*(d1[1]-d0[1]))/den,e=d0[0]-a*s0[0]-c*s0[1],f=d0[1]-b*s0[0]-d*s0[1];
const mx=(d0[0]+d1[0]+d2[0])/3,my=(d0[1]+d1[1]+d2[1])/3,ex=p=>{const dx=p[0]-mx,dy=p[1]-my,l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*.7,p[1]+dy/l*.7]},e0=ex(d0),e1=ex(d1),e2=ex(d2);
const u0=Math.max(0,Math.floor(Math.min(s0[0],s1[0],s2[0]))-1),v0=Math.max(0,Math.floor(Math.min(s0[1],s1[1],s2[1]))-1),u1=Math.min(img.width,Math.ceil(Math.max(s0[0],s1[0],s2[0]))+1),v1=Math.min(img.height,Math.ceil(Math.max(s0[1],s1[1],s2[1]))+1);if(u1<=u0||v1<=v0)return;
g.save();g.beginPath();g.moveTo(e0[0],e0[1]);g.lineTo(e1[0],e1[1]);g.lineTo(e2[0],e2[1]);g.closePath();g.clip();g.transform(a,b,c,d,e,f);g.drawImage(img,u0,v0,u1-u0,v1-v0,u0,v0,u1-u0,v1-v0);g.restore()}
function pone(L,t,c,E,q,p,fs,al,v,PS){const[x0,y0,x1,y1]=lbox(L,t);if(![x0,y0,x1,y1].every(Number.isFinite)||!(x1>x0&&y1>y0))return false;
const gl=L.efa.includes('glow')?v('glow'):0,ch=L.efa.includes('chroma')?v('chroma'):0,pad=gl*2+Math.abs(ch)+6,bl=x0-pad,bt=y0-pad,bw=x1-x0+2*pad,bh=y1-y0+2*pad,k=Math.max(.3,Math.min(2,p.s*E.s)),tw=Math.max(2,Math.min(2048,Math.ceil(bw*k))),th=Math.max(2,Math.min(2048,Math.ceil(bh*k)));
if(!TXC){TXC=document.createElement('canvas');PTW=document.createElement('canvas')}
if(TXC.width!=tw||TXC.height!=th){TXC.width=tw;TXC.height=th}if(PTW.width!=W||PTW.height!=H){PTW.width=W;PTW.height=H}
const tx=TXC.getContext('2d'),sv=cx;tx.setTransform(1,0,0,1,0,0);tx.globalAlpha=1;tx.filter='none';tx.globalCompositeOperation='source-over';tx.shadowBlur=0;tx.clearRect(0,0,tw,th);tx.setTransform(tw/bw,0,0,th/bh,-bl*tw/bw,-bt*th/bh);
cx=tx;try{if(ch>0){tx.globalCompositeOperation='screen';[['#f00',-ch],['#0f0',0],['#00f',ch]].forEach(([col,o])=>{tx.save();tx.translate(o,0);body(L,t,col);tx.restore()});tx.globalCompositeOperation='source-over'}else{if(gl>0){tx.shadowColor=v('c1');tx.shadowBlur=gl*tw/bw}body(L,t,L.col)}}finally{cx=sv}
const N=Math.max(4,Math.min(14,4+Math.round(PS*50))),Vt=[];let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const lx=bl+bw*i/N,ly=bt+bh*j/N,w=mv(E.R,[lx*E.s,ly*E.s,0]),pp=proj(q[0]+w[0],q[1]+w[1],q[2]+w[2],c);if(!pp){Vt.push(null);continue}const X=W/2+pp.x,Y=H/2+pp.y;Vt.push([X,Y]);mnx=Math.min(mnx,X);mny=Math.min(mny,Y);mxx=Math.max(mxx,X);mxy=Math.max(mxy,Y)}
const X0=Math.max(0,Math.floor(mnx)-2),Y0=Math.max(0,Math.floor(mny)-2),X1=Math.min(W,Math.ceil(mxx)+2),Y1=Math.min(H,Math.ceil(mxy)+2);if(X1<=X0||Y1<=Y0)return true;
const pc=PTW.getContext('2d');pc.setTransform(1,0,0,1,0,0);pc.clearRect(X0,Y0,X1-X0,Y1-Y0);
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=Vt[j*(N+1)+i],b=Vt[j*(N+1)+i+1],d=Vt[(j+1)*(N+1)+i],e=Vt[(j+1)*(N+1)+i+1];if(!a||!b||!d||!e)continue;
const sa=[i/N*tw,j/N*th],sb=[(i+1)/N*tw,j/N*th],sd=[i/N*tw,(j+1)/N*th],se=[(i+1)/N*tw,(j+1)/N*th];triD(pc,TXC,a,b,d,sa,sb,sd);triD(pc,TXC,b,e,d,sb,se,sd)}
cx.save();cx.globalAlpha=Math.max(0,E.o)*al;if(fs)cx.filter=fq(fs);cx.drawImage(PTW,X0,Y0,X1-X0,Y1-Y0,X0,Y0,X1-X0,Y1-Y0);cx.restore();return true}
function layerDraw0(L,t,cm){const m=L.efa.includes('mb')?val(L,'mb',t):0,n=m>0?8:1,lp=()=>{for(let i=0;i<n;i++)one(L,n>1?t+(i/(n-1)-.5)*m/FPS:t,cm,1/(i+1))};
 const bl=L.bl&&L.bl!='normal'?L.bl:null;if(!bl&&!L.efa.some(k=>OFFK.includes(k)&&!(k=='tile'&&val(L,'tlf',t)>.5))){lp();return}if(L.efa.includes('cbg'))cbgSnap();const A=offBegin();lp();const src=postSrc(L,t,A.o);offEnd(A);if(bl)blendDraw(cx,src,bl);else cx.drawImage(src,0,0,W,H)}
function drawGroup0(G,t,cm,d3){const kids=P.layers.filter(l=>l.par==G.id);if(!isOff(G)){drawList(kids,t,cm,d3);return}
 const ge=effOf(G,t),A=offBegin();drawList(kids,t,cm,d3,true);const ms=kids.filter(l=>l.mask);
 if(ms.length){const B=offBegin();drawList(ms,t,cm,d3);offEnd(B);A.o.globalCompositeOperation='destination-in';A.o.drawImage(B.o.canvas,0,0,W,H);A.o.globalCompositeOperation='source-over'}
 const src=postSrc(G,t,A.o);
 offEnd(A);const fs=G.efa.filter(e=>FS[e]).map(e=>FS[e](val(G,e,t))).join(' ');cx.save();cx.globalAlpha=Math.max(0,ge.o);cx.filter=fq(fs)||'none';
 if(G.bl&&G.bl!='normal')blendDraw(cx,src,G.bl);else cx.drawImage(src,0,0,W,H);cx.restore()}
let RINST=null;
function val(L,k,t){const x=val0(L,k,t);if(RINST&&RINST.m&&RINST.fam.has(L.id)){const m=RINST.m[k];if(m!==undefined&&typeof x=='number')return x*m}return x}
const rmult=(rn,v)=>{const kw=1+rn(1)*(v('rrw')||0)/100,kh=v('rrl')>.5?kw:1+rn(2)*(v('rrh')||0)/100;return{w:kw,h:kh,sz:(kw+kh)/2}};
const RPC=new Map();
function rptTab(L,uMax){const sg=JSON.stringify([L.kf.rpb,L.kf.rpq,L.kf.rpt,L.p.rpb,L.p.rpq,L.p.rpt,L.s]);let c=RPC.get(L.id);if(!c||c.sg!==sg){c={sg,cum:[0]};RPC.set(L.id,c)}
 const need=Math.ceil(uMax*FPS)+2;while(c.cum.length<need){const j=c.cum.length-1,tt=L.s+j/FPS,rt=val(L,'rpt',tt),st=Math.max(.0005,rt>0?rt/1000:60/Math.max(1,val(L,'rpb',tt)||120)*(val(L,'rpq',tt)||1));c.cum.push(c.cum[j]+1/FPS/st)}return c.cum}
const rptC=(L,u)=>{if(u<=0)return 0;const cum=rptTab(L,u),f=Math.floor(u*FPS),fr=u*FPS-f;return cum[f]+(cum[f+1]-cum[f])*fr};
function rptOff(L,i,uMax){if(i<=0)return 0;const cum=rptTab(L,uMax);let lo=0,hi=cum.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]>=i)hi=m;else lo=m+1}if(lo<=0)return 0;const a=cum[lo-1],b=cum[lo];return(lo-1+(i-a)/Math.max(1e-12,b-a))/FPS}
function repeatDraw(L,t,cm,d3){const v=k=>val(L,k,t),nraw=Math.floor(v('rpn')||0),inf=nraw<=0,tap=L.rtap&&L.rtap.length?L.rtap:null,st=v('rpt')>0?v('rpt')/1000:60/Math.max(1,v('rpb')||120)*(v('rpq')||1);
 const fam=new Set(family(L).map(x=>x.id)),one1=(tt,cmx)=>{if(L.type=='group')drawGroup(L,tt,cmx,d3);else layerDraw(L,tt,cmx)};
 if(!tap&&!(st>.0005)){one1(t,cm);return}
 let offs=null,hi,lo;
 if(tap){offs=[0];const cap=inf?400:Math.min(400,nraw);for(let i=1;i<=cap;i++){const o=offs[i-1]+tap[(i-1)%tap.length]/1000;offs.push(o);if(o>t-L.s+1)break}hi=offs.length-1;lo=0}
 else{hi=Math.floor(rptC(L,Math.max(0,t-L.s))+1e-9);if(!inf)hi=Math.min(hi,nraw);lo=L.e<1e8?Math.max(0,Math.ceil(rptC(L,Math.max(0,t-L.e))-1e-9)):0;if(hi-lo>199)lo=hi-199}
 for(let i=hi;i>=lo;i--){const rd=v('rrd')||1,rn=c=>hn(i*7.31+c,rd)*2-1,tt=t-(offs?offs[i]:rptOff(L,i,Math.max(0,t-L.s)))-(i?rn(8)*(v('rrt')||0)/1000:0);if(tt<L.s||tt>L.e)continue;const prev=RINST;RINST=i?{id:L.id,fam,dx:i*(v('rpx')||0)+rn(3)*(v('rrx')||0),dy:i*(v('rpy')||0)+rn(4)*(v('rry')||0),sc:Math.pow(v('rps')||1,i)*(1+rn(5)*(v('rrs')||0)/100),o:Math.pow(v('rpo')===undefined?1:v('rpo'),i)*(1-Math.abs(rn(6))*(v('rro')||0)/100),rz:rn(7)*(v('rra')||0),m:rmult(rn,v),tg:t,ag:t-tt,fx:v('rmx')==2||(v('rmx')==1&&i%2==1),fy:v('rmy')==2||(v('rmy')==1&&i%2==1)}:null;try{one1(tt,cm)}finally{RINST=prev}}}
function tileDraw(L,t,cm,dr){const v=k=>val(L,k,t),sx=Math.max(24,v('tlx')),sy=Math.max(24,v('tly')),hx=v('tlh')>.5,hy=v('tlv')>.5,prev=RINST;
 const pr=(i,j)=>{RINST={id:L.id,fam:new Set(),m:null,dx:i*sx,dy:j*sy,sc:1,o:1,rz:0};let E;try{E=effOf(L,t)}finally{RINST=prev}const q=proj(E.p[0],E.p[1],E.p[2],cm);return q?[W/2+q.x,H/2+q.y]:null};
 const P0=pr(0,0),Px=pr(1,0),Py=pr(0,1);let i0=0,i1=0,j0=0,j1=0;
 if(P0&&Px&&Py){const ax=Px[0]-P0[0],ay=Px[1]-P0[1],bx=Py[0]-P0[0],by=Py[1]-P0[1],dt=ax*by-ay*bx;if(Math.abs(dt)>1e-6){const mg=Math.max(W,H)*.3;[[-mg,-mg],[W+mg,-mg],[-mg,H+mg],[W+mg,H+mg]].forEach(([X,Y],n)=>{const dx=X-P0[0],dy=Y-P0[1],i=(dx*by-dy*bx)/dt,j=(ax*dy-ay*dx)/dt;if(!n){i0=i1=i;j0=j1=j}else{i0=Math.min(i0,i);i1=Math.max(i1,i);j0=Math.min(j0,j);j1=Math.max(j1,j)}})}}
 if(i1-i0>40){const c=(i0+i1)/2;i0=c-20;i1=c+20}if(j1-j0>40){const c=(j0+j1)/2;j0=c-20;j1=c+20}
 if(![i0,i1,j0,j1].every(isFinite)){i0=i1=j0=j1=0}let ia=hx?0:Math.floor(i0),ib=hx?0:Math.ceil(i1),ja=hy?0:Math.floor(j0),jb=hy?0:Math.ceil(j1);const cap=L.efa.includes('repeat')?40:L.type=='media'?60:150;while((ib-ia+1)*(jb-ja+1)>cap){if(ib-ia>=jb-ja&&ib-ia>=2){ia++;ib--}else if(jb-ja>=2){ja++;jb--}else break}
 for(let i=ia;i<=ib;i++)for(let j=ja;j<=jb;j++){RINST={id:L.id,fam:new Set(),m:null,dx:i*sx,dy:j*sy,sc:1,o:1,rz:0};try{dr()}finally{RINST=prev}}}
function drawList(list,t,c,d3,skip){list.filter(l=>l.type!='cam'&&l.type!='fx'&&l.type!='audio'&&!fv(l,'inv',t)&&(l.efa.includes('repeat')||(t>=l.s&&t<=l.e))&&!(skip&&l.mask)).map(l=>{const cc=fv(l,'hud',t)&&!d3?C0:c,E=effOf(l,t),pp=proj(E.p[0],E.p[1],E.p[2],cc);return[l,pp?800/pp.s:1e9]}).sort((a,b)=>b[1]-a[1]).forEach(([L,dd])=>{if(GZ&&dep==0)while(GZ.i<GZ.a.length&&GZ.a[GZ.i].d>dd)GZ.a[GZ.i++].f();const cm=fv(L,'hud',t)&&!d3?C0:c;const lf=L.efa.includes('lofps')?Math.max(1,val(L,'lofps',t)):0,tz=lf?Math.floor(t*lf+1e-6)/lf:t,dr=()=>{if(L.efa.includes('repeat'))repeatDraw(L,tz,cm,d3);else if(L.type=='group')drawGroup(L,tz,cm,d3);else layerDraw(L,tz,cm)};if(L.efa.includes('tile')&&val(L,'tlf',t)>.5)tileDraw(L,t,cm,dr);else dr()})}
function gin(G,C){if(!G)return AN;if(C[G.id])return C[G.id].i;const st=G.efa.filter(k=>AUDK.includes(k)).map(k=>({k,G,s:mkStage(k)})),i=AC.createGain();let nd=i;st.forEach(x=>{nd.connect(x.s.i);nd=x.s.o});C[G.id]={i};AG.push(...st);nd.connect(gin(P.layers.find(l=>l.id==G.par&&l.type=='group'),C));return i}
function fillOf(L,t){if(!L.grad)return val(L,'c1',t);const n=L.gn||2,gv=(k,d)=>L.p[k]===undefined&&!(L.kf[k]&&L.kf[k].length)?d:val(L,k,t),st=Array.from({length:n},(_,i)=>[Math.max(0,Math.min(1,val(L,`g${i}p`,t)/100)),val(L,`g${i}c`,t)]).sort((a,b)=>a[0]-b[0]),a=val(L,'ga',t)*R,r=Math.max(1,val(L,'gsz',t)),x=val(L,'gx',t),y=val(L,'gy',t),co=Math.cos(a),si=Math.sin(a);let g;
 if(L.gt=='rad')g=cx.createRadialGradient(x,y,0,x,y,r);else if(L.gt=='pt')g=cx.createRadialGradient(x+co*r*.5,y+si*r*.5,0,x,y,r);else if(L.gt=='con'&&cx.createConicGradient)g=cx.createConicGradient(a,x,y);else g=cx.createLinearGradient(x-co*r,y-si*r,x+co*r,y+si*r);
 st.forEach(([p,c])=>g.addColorStop(p,c));return g}
