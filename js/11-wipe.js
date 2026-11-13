/* ---- wipe (reveal) : linear + radial, hard / gradient / wavy / zigzag / scallop ---- */
const wpWave=(st,ph)=>st==2?Math.sin(ph):st==3?(2/Math.PI)*Math.asin(Math.sin(ph)):st==4?2*Math.abs(Math.sin(ph/2))-1:0;
function wpGeom(L,tt){
 const g={rad:val(L,'wpm',tt)>=.5,x1:val(L,'wpx1',tt)*W,y1:val(L,'wpy1',tt)*H,x2:val(L,'wpx2',tt)*W,y2:val(L,'wpy2',tt)*H,p:Math.max(0,Math.min(100,val(L,'wpp',tt)))/100,st:Math.round(val(L,'wps',tt)),f:Math.max(0,val(L,'wpf',tt)),a:Math.max(0,val(L,'wpa',tt)),wl:Math.max(8,val(L,'wpw',tt)),lw:Math.max(0,val(L,'wpl',tt)),inv:val(L,'wpv',tt)>=.5};
 g.len=Math.max(1,Math.hypot(g.x2-g.x1,g.y2-g.y1));g.ux=(g.x2-g.x1)/g.len;g.uy=(g.y2-g.y1)/g.len;g.ph=val(L,'wpt',tt)*tt*6.2832;
 g.amp=g.st>=2?g.a:0;g.fe=g.st==0?0:g.f;g.m=(g.st==1?g.fe/2:g.fe*1.6)+g.amp+g.lw/2;g.pos=-g.m+g.p*(g.len+2*g.m);return g}
function wpEdge(g){
 const P=[];
 if(!g.rad){const Lh=Math.hypot(W,H)*1.5+g.len,N=Math.max(2,Math.ceil(2*Lh/Math.max(4,Math.min(g.wl/12,16)))),nx=-g.uy,ny=g.ux;
  for(let i=0;i<=N;i++){const u=-Lh+2*Lh*i/N,pp=g.pos+(g.amp?g.amp*wpWave(g.st,6.2832*u/g.wl+g.ph):0);P.push([g.x1+g.ux*pp+nx*u,g.y1+g.uy*pp+ny*u])}}
 else{const r0=Math.max(0,g.pos),N=Math.max(72,Math.min(720,Math.ceil(r0*6.2832/6))),lobes=Math.max(3,Math.round(6.2832*Math.max(r0,1)/g.wl));
  for(let i=0;i<=N;i++){const th=i/N*6.2832,r=Math.max(0,g.pos+(g.amp?g.amp*wpWave(g.st,lobes*th+g.ph):0));P.push([g.x1+Math.cos(th)*r,g.y1+Math.sin(th)*r])}}
 return P}
function wpRun(src,L,tt){
 const w=src.width,h=src.height,g=wpGeom(L,tt);if(!isFinite(g.x1+g.y1+g.x2+g.y2+g.p+g.pos+g.fe+g.amp))return src;const M=gbCv(60,w,h),mc=M.getContext('2d');
 mc.setTransform(Q,0,0,Q,0,0);mc.filter='none';mc.globalAlpha=1;mc.globalCompositeOperation='source-over';mc.clearRect(0,0,W,H);
 const stops=gr=>{gr.addColorStop(0,'#fff');gr.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=gr;mc.fillRect(0,0,W,H)};
 let P=null;
 if(g.st==1){const f=Math.max(1,g.fe);
  if(!g.rad)stops(mc.createLinearGradient(g.x1+g.ux*(g.pos-f/2),g.y1+g.uy*(g.pos-f/2),g.x1+g.ux*(g.pos+f/2),g.y1+g.uy*(g.pos+f/2)));
  else if(g.pos+f/2>.5){const r0=Math.max(0,g.pos-f/2);stops(mc.createRadialGradient(g.x1,g.y1,r0,g.x1,g.y1,Math.max(r0+.5,g.pos+f/2)))}}
 else{P=wpEdge(g);if(g.fe>.5)mc.filter=`blur(${g.fe/2*Q}px)`;mc.fillStyle='#fff';mc.beginPath();
  if(!g.rad){const Lh=Math.hypot(W,H)*1.5+g.len,k=6*Lh;P.forEach((q,i)=>i?mc.lineTo(q[0],q[1]):mc.moveTo(q[0],q[1]));const a=P[P.length-1],b=P[0];mc.lineTo(a[0]-g.ux*k,a[1]-g.uy*k);mc.lineTo(b[0]-g.ux*k,b[1]-g.uy*k)}
  else P.forEach((q,i)=>i?mc.lineTo(q[0],q[1]):mc.moveTo(q[0],q[1]));
  mc.closePath();mc.fill();mc.filter='none'}
 const R=gbCv(61,w,h),rg=R.getContext('2d');rg.setTransform(1,0,0,1,0,0);rg.filter='none';rg.globalAlpha=1;rg.globalCompositeOperation='source-over';rg.clearRect(0,0,w,h);rg.drawImage(src,0,0,w,h);
 rg.globalCompositeOperation=g.inv?'destination-out':'destination-in';rg.drawImage(M,0,0);rg.globalCompositeOperation='source-over';
 if(g.lw>.4){const E=P||wpEdge(g),N2=gbCv(62,w,h),lc=N2.getContext('2d');lc.setTransform(Q,0,0,Q,0,0);lc.filter='none';lc.globalAlpha=1;lc.globalCompositeOperation='source-over';lc.clearRect(0,0,W,H);
  lc.beginPath();E.forEach((q,i)=>i?lc.lineTo(q[0],q[1]):lc.moveTo(q[0],q[1]));lc.lineWidth=g.lw;lc.lineJoin='round';lc.lineCap='round';const c=val(L,'wpc',tt);lc.strokeStyle=typeof c=='string'?c:'#fff';lc.stroke();
  lc.setTransform(1,0,0,1,0,0);lc.globalCompositeOperation='destination-in';lc.drawImage(src,0,0,w,h);rg.drawImage(N2,0,0)}
 return R}
function wpOv(L,u){
 if(!L||!L.efa||!L.efa.includes('wipe'))return;const g=wpGeom(L,t),P=wpEdge(g);ox.save();ox.lineCap='round';ox.lineJoin='round';
 const path=pts=>{ox.beginPath();pts.forEach((q,i)=>i?ox.lineTo(q[0],q[1]):ox.moveTo(q[0],q[1]))};
 ox.setLineDash([]);path(P);ox.lineWidth=5*u;ox.strokeStyle='#0008';ox.stroke();ox.lineWidth=2.4*u;ox.strokeStyle='#ffcf4a';ox.stroke();
 if(g.fe>2&&!g.rad){[-1,1].forEach(sd=>{const q=g.pos+sd*g.fe/2,nx=-g.uy*W,ny=g.ux*W;ox.beginPath();ox.moveTo(g.x1+g.ux*q+nx,g.y1+g.uy*q+ny);ox.lineTo(g.x1+g.ux*q-nx,g.y1+g.uy*q-ny);ox.lineWidth=1.2*u;ox.strokeStyle='#ffffff88';ox.setLineDash([4*u,5*u]);ox.stroke()})}
 else if(g.fe>2&&g.rad){[-1,1].forEach(sd=>{const r=Math.max(0,g.pos+sd*g.fe/2);ox.beginPath();ox.arc(g.x1,g.y1,r,0,6.2832);ox.lineWidth=1.2*u;ox.strokeStyle='#ffffff88';ox.setLineDash([4*u,5*u]);ox.stroke()})}
 ox.setLineDash([6*u,5*u]);ox.beginPath();ox.moveTo(g.x1,g.y1);ox.lineTo(g.x2,g.y2);ox.lineWidth=4*u;ox.strokeStyle='#0007';ox.setLineDash([]);ox.stroke();ox.lineWidth=2*u;ox.strokeStyle='#fff';ox.setLineDash([6*u,5*u]);ox.stroke();ox.setLineDash([]);
 const kp=Math.max(0,Math.min(g.len,g.pos)),kx=g.x1+g.ux*kp,ky=g.y1+g.uy*kp;
 [[g.x1,g.y1,'#8b7bff','0%'],[g.x2,g.y2,'#3ecf8e','100%']].forEach(([x,y,c,lb])=>{ox.beginPath();ox.arc(x,y,8*u,0,6.2832);ox.fillStyle='#fff';ox.fill();ox.lineWidth=2.5*u;ox.strokeStyle=c;ox.stroke();ox.font=`600 ${11*u}px system-ui,sans-serif`;ox.textBaseline='middle';const tw=ox.measureText(lb).width+12*u;ox.beginPath();ox.roundRect?ox.roundRect(x+12*u,y-26*u,tw,19*u,5*u):ox.rect(x+12*u,y-26*u,tw,19*u);ox.fillStyle='#1a1a20ee';ox.fill();ox.fillStyle='#fff';ox.fillText(lb,x+18*u,y-16.5*u)});
 ox.save();ox.translate(kx,ky);ox.rotate(.7854);ox.beginPath();ox.rect(-7*u,-7*u,14*u,14*u);ox.fillStyle='#ffcf4a';ox.fill();ox.lineWidth=2*u;ox.strokeStyle='#1a1a20';ox.stroke();ox.restore();
 ox.font=`600 ${11*u}px system-ui,sans-serif`;const pl=Math.round(g.p*100)+'%',pw=ox.measureText(pl).width+12*u;ox.beginPath();ox.roundRect?ox.roundRect(kx+12*u,ky+8*u,pw,19*u,5*u):ox.rect(kx+12*u,ky+8*u,pw,19*u);ox.fillStyle='#1a1a20ee';ox.fill();ox.fillStyle='#ffcf4a';ox.fillText(pl,kx+18*u,ky+17.5*u);
 ox.restore()}
function wpHit(L,c){
 const g=wpGeom(L,t),u=1/Math.max(.05,c.s),th=14*u,d=(x,y)=>Math.hypot(x-c.x,y-c.y),kp=Math.max(0,Math.min(g.len,g.pos));
 if(d(g.x1+g.ux*kp,g.y1+g.uy*kp)<th)return'knob';if(d(g.x2,g.y2)<th)return'p2';if(d(g.x1,g.y1)<th)return'p1';
 const P=wpEdge(g);for(let i=0;i<P.length;i+=2)if(Math.abs(P[i][0]-c.x)<9*u&&Math.abs(P[i][1]-c.y)<9*u&&d(P[i][0],P[i][1])<9*u)return'edge';return null}
function startWp(L,h,c){
 const g0=wpGeom(L,t);GBD={k:h};cv.style.cursor='grabbing';
 const setP=(k,x,y)=>{setV(L,'wpx'+k,+(x/W).toFixed(4));setV(L,'wpy'+k,+(y/H).toFixed(4))};
 cv.onpointermove=m=>{const p=cpos(m),dx=p.x-c.x,dy=p.y-c.y;
  if(h=='knob'||h=='edge'){const g=wpGeom(L,t),pos=g.rad?Math.hypot(p.x-g.x1,p.y-g.y1):(p.x-g.x1)*g.ux+(p.y-g.y1)*g.uy;setV(L,'wpp',+Math.max(0,Math.min(100,(pos+g.m)/(g.len+2*g.m)*100)).toFixed(1))}
  else if(h=='p1'){if(g0.rad){setP(1,g0.x1+dx,g0.y1+dy);setP(2,g0.x2+dx,g0.y2+dy)}else{let nx=p.x,ny=p.y;if(m.shiftKey){const a=Math.round(Math.atan2(g0.y2-ny,g0.x2-nx)/.2618)*.2618,r=Math.hypot(g0.x2-nx,g0.y2-ny);nx=g0.x2-Math.cos(a)*r;ny=g0.y2-Math.sin(a)*r}setP(1,nx,ny)}}
  else if(h=='p2'){let nx=p.x,ny=p.y;if(m.shiftKey){const a=Math.round(Math.atan2(ny-g0.y1,nx-g0.x1)/.2618)*.2618,r=Math.hypot(nx-g0.x1,ny-g0.y1);nx=g0.x1+Math.cos(a)*r;ny=g0.y1+Math.sin(a)*r}setP(2,nx,ny)}
  dirty=1;ovd=1};
 cv.onpointerup=()=>{cv.onpointermove=hoverMove;GBD=null;cv.style.cursor='';all();ovd=1}}
const WPST=[['Hard','<path d="M14 2V18" stroke-width="2.4"/>'],['Gradient','<path d="M8 2V18" opacity=".2"/><path d="M12 2V18" opacity=".45"/><path d="M16 2V18" opacity=".75"/><path d="M20 2V18"/>'],['Wavy','<path d="M14 1C8 4.5 20 6.5 14 10C8 13.5 20 15.5 14 19" stroke-width="2.2"/>'],['Zigzag','<path d="M14 1L8.5 5.5L19.5 10L8.5 14.5L14 19" stroke-width="2.2"/>'],['Scallop','<path d="M14 1a5.5 4.5 0 0 1 0 9a5.5 4.5 0 0 1 0 9" stroke-width="2.2"/>']];
const WPUI=L=>{const m=(L.p.wpm||0)>=.5?1:0,st=Math.round(L.p.wps===undefined?1:L.p.wps),hd=(L.p.wpv||0)>=.5?1:0,sg=(a,b,l1,l2,key,v)=>`<div class=seg2><button data-${key}=0 class="${v?'':'on'}">${l1}</button><button data-${key}=1 class="${v?'on':''}">${l2}</button></div>`;
 return sg(0,0,IC('gline')+'Linear',IC('gradial')+'Radial','wpm',m)
 +`<div class=wst>${WPST.map(([n,ic],i)=>`<button data-wps=${i} class="${st==i?'on':''}" title="${n}"><svg viewBox="0 0 28 20" class=eg>${ic}</svg><span>${n}</span></button>`).join('')}</div>`
 +row(L,'wpp','Progress %')+(st?row(L,'wpf','Softness (px)'):'')+(st>=2?row(L,'wpa','Wave height (px)')+row(L,'wpw','Wavelength (px)')+row(L,'wpt','Wave speed (cycles/s)'):'')
 +row(L,'wpl','Edge line (px, 0 = off)')+((L.p.wpl||0)>0?row(L,'wpc','Edge line color'):'')
 +sg(0,0,'Reveal','Hide','wpv',hd)
 +`<p class=m style="margin:6px 2px 0;font-size:11.5px;line-height:1.5">Drag the purple and green handles on the canvas. Drag the yellow diamond or the edge to scrub progress. 0% is fully hidden at the purple handle, 100% is fully shown at the green one. Hold Shift to snap the angle.</p>`
 +`<p class=m style="margin:14px 0 0"><b>Handles</b></p>`+row(L,'wpx1','Start X (0–1)')+row(L,'wpy1','Start Y (0–1)')+row(L,'wpx2','End X (0–1)')+row(L,'wpy2','End Y (0–1)')};

