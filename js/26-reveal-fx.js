/* ---- reveal effects: the Shape reveal shader (srev) and Droplets (drop). The effect list, params and UI are in 04, 05 and 07. ---- */
/* srev is added to GLS here because glRun reads GLS at call time */
Object.assign(GLS,{
srev:'void main(){float s=max(6.,k2),a=-k8*.017453,cs=cos(a),sn=sin(a);vec2 p=v*R-R*.5;p=vec2(cs*p.x+sn*p.y,-sn*p.x+cs*p.y);vec2 g=p/s,c=floor(g),f=fract(g)-.5,cc=(c+.5)*s;vec2 o=vec2(cs*cc.x-sn*cc.y,sn*cc.x+cs*cc.y)+R*.5,u0=clamp(o/R,0.,1.);float od=k4,d=0.;if(od>4.5)d=h(c+7.);else if(od>3.5)d=clamp(length((u0-.5)*vec2(asp,1.))/(.5*length(vec2(asp,1.))),0.,1.);else if(od>2.5)d=(u0.x+1.-u0.y)*.5;else if(od>1.5)d=1.-u0.y;else if(od>.5)d=u0.x;float sp=max(0.,k5),lp=clamp(k*.01*(1.+sp)-d*sp,0.,1.);lp=lp*lp*(3.-2.*lp);float ew=max(k6,1./q)/s,b=.7072,l=length(f),sd;if(k3>2.5)b=1.18;else if(k3>1.5)b=1.;else if(k3>.5)b=.5;float sz=lp*(b+ew)-ew*(1.-lp)*(k3>2.5?1.:.5);if(k3>2.5)sd=l-sz*(1.+.4*cos(5.*atan(f.y,f.x)));else if(k3>1.5)sd=abs(f.x)+abs(f.y)-sz;else if(k3>.5)sd=max(abs(f.x),abs(f.y))-sz;else sd=l-sz;float m=1.-smoothstep(-ew*.5,ew*.5,sd);if(k7>.5)m=1.-m;gl_FragColor=T(v)*m;}'
});
/* Droplets: a few big circles start one after another on the layer and each keeps growing until the whole layer is covered.
   The circles live on a jittered grid in the layer's own space (anchored at its projected position, scaled and rotated with it), so they stay attached while it moves or zooms.
   Start order is normalised inside the layer's visible bounding box, so the first circle starts at 0% and the last gap closes near 100% whatever the layer's size or place.
   Drawn with Canvas 2D (no WebGL): mask of circles, then composited by mode. */
const drH=(i,j,s,k)=>{let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s,1274126177)+Math.imul(k,974711))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296};
let DRA=null;
function drBox(src){const aw=192,ah=Math.max(8,Math.round(192*src.height/src.width));if(!DRA||DRA.width!=aw||DRA.height!=ah){DRA=document.createElement('canvas');DRA.width=aw;DRA.height=ah}
 const g=DRA.getContext('2d',{willReadFrequently:true});g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,aw,ah);g.drawImage(src,0,0,aw,ah);const d=g.getImageData(0,0,aw,ah).data;let x0=aw,y0=ah,x1=-1,y1=-1;
 for(let y=0;y<ah;y++)for(let x=0;x<aw;x++)if(d[(y*aw+x)*4+3]>6){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<0)return null;const bb=[x0/aw*W,y0/ah*H,(x1+1)/aw*W,(y1+1)/ah*H];bb.has=(X,Y)=>{const x=Math.floor(X/W*aw),y=Math.floor(Y/H*ah);return x>=0&&y>=0&&x<aw&&y<ah&&d[(y*aw+x)*4+3]>6};return bb}
/* inverse of each growth curve: how far through its own growth (0-1) a circle is when it reaches fraction y of its final radius */
const DRBK=(()=>{const a=[];for(let k=0;k<=64;k++){const y=k/64;let x=1;for(let i=0;i<=256;i++){const u=i/256-1;if(1+2.70158*u*u*u+1.70158*u*u>=y){x=i/256;break}}a.push(x)}return a})();
const drInv=(g,y)=>{y=Math.max(0,Math.min(1,y));if(g==1){const k=y*64,i=Math.min(63,Math.floor(k));return DRBK[i]+(DRBK[i+1]-DRBK[i])*(k-i)}return g==2?1-Math.sqrt(1-y):g==3?1-Math.pow(1-y,1/1.35):1-Math.sqrt(1-y*y)};
const DRC=new WeakMap();
function drList(L,tt,bb,p){
 let ax=W/2,ay=H/2,sc=1,rot=0;
 if(L.type!='cam'){try{const E=effOf(L,tt),q=proj(E.p[0],E.p[1],E.p[2],camAt(tt));if(q){ax=W/2+q.x;ay=H/2+q.y;sc=Math.max(.01,Math.abs(E.s*q.s))}rot=(val(L,'rz',tt)||0)*Math.PI/180}catch(e){}}
 const vary=Math.max(0,Math.min(1,val(L,'dpv',tt)||0)),sp=Math.max(0,val(L,'dpd',tt)||0),st=sp/(1+sp),seed=Math.round(val(L,'dpz',tt)||0),grow=Math.round(val(L,'dpg',tt)||0),ord=Math.round(val(L,'dpo',tt)||0),soft=Math.max(0,val(L,'dpf',tt)||0);
 let s=Math.max(24,val(L,'dps',tt)||260)*sc;const key=[bb[0],bb[1],bb[2],bb[3],ax.toFixed(2),ay.toFixed(2),s.toFixed(3),rot.toFixed(4),vary,sp,seed,grow,ord,W,H].join(),hit=DRC.get(L),fin2=(D,T)=>{const pe=p*T;D.forEach(o=>{const x=Math.max(0,Math.min(1,(pe-o.d*st)/(1-st))),u=x-1,y=grow==1?1+2.70158*u*u*u+1.70158*u*u:grow==2?1-u*u:grow==3?1-Math.pow(1-x,1.35):Math.sqrt(Math.max(0,1-u*u));o.r=x<=0?0:y*o.rc*s+soft});return{D,soft}};
 if(hit&&hit.key==key)return fin2(hit.D,hit.T);const cs=Math.cos(rot),sn=Math.sin(rot),bw=Math.max(1,bb[2]-bb[0]),bh=Math.max(1,bb[3]-bb[1]);
 let i0,i1,j0,j1,a,b,c,d;for(let k=0;k<8;k++){a=1e9;b=-1e9;c=1e9;d=-1e9;[[bb[0],bb[1]],[bb[2],bb[1]],[bb[0],bb[3]],[bb[2],bb[3]]].forEach(([x,y])=>{const dx=x-ax,dy=y-ay,lx=(dx*cs+dy*sn)/s,ly=(-dx*sn+dy*cs)/s;a=Math.min(a,lx);b=Math.max(b,lx);c=Math.min(c,ly);d=Math.max(d,ly)});
  i0=Math.round(a);i1=Math.round(b);j0=Math.round(c);j1=Math.round(d);if((i1-i0+1)*(j1-j0+1)<=600)break;s*=1.5}
 const D=[],nx=i1-i0+1,at=(i,j)=>i<i0||i>i1||j<j0||j>j1?null:D[(j-j0)*nx+i-i0];
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const jx=(drH(i,j,seed,1)-.5)*.5,jy=(drH(i,j,seed,2)-.5)*.5,h3=drH(i,j,seed,3),h4=drH(i,j,seed,4),lx=i+jx,ly=j+jy,X=ax+(lx*cs-ly*sn)*s,Y=ay+(lx*sn+ly*cs)*s,ux=(X-bb[0])/bw,uy=(Y-bb[1])/bh;
  let dl=h3;if(ord==1)dl=ux;else if(ord==2)dl=uy;else if(ord==3)dl=(ux+uy)/2;else if(ord==4)dl=Math.hypot((ux-.5)*bw,(uy-.5)*bh)/(.5*Math.hypot(bw,bh));if(ord)dl=dl*.9+h3*.1;
  D.push({X,Y,lx,ly,d:dl,ins:bb.has(X,Y),rc:Math.hypot(.5+Math.abs(jx),.5+Math.abs(jy))*(1+vary*h4*.6)})}
 const I=D.filter(o=>o.ins),U=I.length?I:D;
 if(!ord){U.slice().sort((x,y)=>x.d-y.d).forEach((o,k,l)=>{o.d=l.length>1?k/(l.length-1):0})}
 else{let lo=1e9,hi=-1e9;U.forEach(o=>{lo=Math.min(lo,o.d);hi=Math.max(hi,o.d)});const w=hi-lo||1;D.forEach(o=>{o.d=(o.d-lo)/w})}
 D.forEach(o=>{o.d=Math.max(0,Math.min(1,o.d))});
 /* when does the last gap inside the layer's box close? sample a lattice in layer space, take the earliest circle to reach each point, and stretch time so the latest of those lands on 100% */
 const area=(b-a+1)*(d-c+1),stp=Math.max(.04,Math.min(.5,32/s),Math.sqrt(area/3000)),fin=stp/4,mg=(fin*.75*s+1)/s,all=D.length<=120;let T=0,n=0;const cand=[],pts=[],
  scr=(px,py)=>bb.has(ax+(px*cs-py*sn)*s,ay+(px*sn+py*cs)*s);
 for(let py=Math.ceil(c/stp)*stp;py<=d;py+=stp)for(let px=Math.ceil(a/stp)*stp;px<=b;px+=stp)if(scr(px,py))pts.push([px,py]);
 /* the circles that sit on the layer must be able to cover it on their own (otherwise a corner sliver waits for a far-away circle that starts last): grow their final size until they do */
 if(U.length<=80&&pts.length){const need=(px,py)=>{let m=1e9;U.forEach(o=>{const y=(Math.hypot(px-o.lx,py-o.ly)+mg)/o.rc;if(y<m)m=y});return m},w=pts.map(([px,py])=>[need(px,py),px,py]).sort((x,y)=>y[0]-x[0]);let F=w[0][0];
  w.slice(0,6).forEach(([v,px,py])=>{for(let fy=py-stp;fy<=py+stp;fy+=fin)for(let fx=px-stp;fx<=px+stp;fx+=fin)if(scr(fx,fy)){const m=need(fx,fy);if(m>F)F=m}});if(F>1)U.forEach(o=>{o.rc*=F*1.002})}
 const cov=(px,py)=>{let best=2;const f=o=>{const y=(Math.hypot(px-o.lx,py-o.ly)+mg)/o.rc;if(y>1)return;const tm=o.d*st+(1-st)*drInv(grow,y);if(tm<best)best=tm};
  if(all)D.forEach(f);else{const ci=Math.round(px),cj=Math.round(py);for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const o=at(ci+di,cj+dj);if(o)f(o)}}return best};
 pts.forEach(([px,py])=>{const v=cov(px,py);if(v<=1){n++;if(v>T)T=v;cand.push([v,px,py])}});
 cand.sort((x,y)=>y[0]-x[0]);cand.slice(0,8).forEach(([v,px,py])=>{for(let fy=py-stp;fy<=py+stp;fy+=fin)for(let fx=px-stp;fx<=px+stp;fx+=fin){if(!scr(fx,fy))continue;const w=cov(fx,fy);if(w<=1&&w>T)T=w}});
 const TT=n?Math.min(1,T):1;DRC.set(L,{key,D,T:TT});return fin2(D,TT)}
function drRun(src,L,tt){
 const w=src.width,h=src.height,p=Math.max(0,Math.min(100,val(L,'dpp',tt)))/100,mode=Math.round(val(L,'dpm',tt)||0);if(!isFinite(p))return src;
 if((p<=0&&(mode==1||mode==2))||(p>=1&&(mode==0||mode==3)))return src;
 const bb=drBox(src);if(!bb)return src;const{D,soft}=drList(L,tt,bb,p),rs=c=>{const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.filter='none';g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);return g};
 const M=gbCv(63,w,h),mc=rs(M);mc.setTransform(Q,0,0,Q,0,0);if(soft>.5)mc.filter=`blur(${soft/2*Q}px)`;mc.fillStyle='#fff';mc.beginPath();D.forEach(o=>{if(o.r>.05){mc.moveTo(o.X+o.r,o.Y);mc.arc(o.X,o.Y,o.r,0,6.2832)}});mc.fill();mc.filter='none';mc.setTransform(1,0,0,1,0,0);
 const R=gbCv(64,w,h),rg=rs(R);
 if(mode<2){rg.drawImage(src,0,0,w,h);rg.globalCompositeOperation=mode?'destination-out':'destination-in';rg.drawImage(M,0,0);rg.globalCompositeOperation='source-over';return R}
 const C=gbCv(65,w,h),cg=rs(C),col=val(L,'dpc',tt);cg.fillStyle=typeof col=='string'?col:'#000';cg.fillRect(0,0,w,h);cg.globalCompositeOperation='destination-in';cg.drawImage(src,0,0,w,h);cg.globalCompositeOperation='source-over';
 mc.globalCompositeOperation='source-in';mc.drawImage(mode==2?C:src,0,0,w,h);mc.globalCompositeOperation='source-over';
 rg.drawImage(mode==2?src:C,0,0,w,h);rg.drawImage(M,0,0);return R}
