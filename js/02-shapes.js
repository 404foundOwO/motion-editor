/* ---- Material 3 expressive shapes (original vector approximations) ---- */
const MS_TAU=Math.PI*2;
function msPolar(f,n=480){const P=[];for(let i=0;i<n;i++){const t=i/n*MS_TAU,r=f(t);P.push([Math.sin(t)*r,-Math.cos(t)*r])}return P}
function msRound(V,r,seg=12){const n=V.length,out=[];for(let i=0;i<n;i++){const A=V[(i+n-1)%n],B=V[i],C=V[(i+1)%n];let ux=A[0]-B[0],uy=A[1]-B[1],vx=C[0]-B[0],vy=C[1]-B[1];const lu=Math.hypot(ux,uy),lv=Math.hypot(vx,vy);if(lu<1e-9||lv<1e-9)continue;ux/=lu;uy/=lu;vx/=lv;vy/=lv;const ang=Math.acos(Math.max(-1,Math.min(1,ux*vx+uy*vy))),rr=Array.isArray(r)?r[i%r.length]:r;if(ang<.02||Math.PI-ang<.02||rr<=0){out.push(B);continue}let d=rr/Math.tan(ang/2),rad=rr;const dm=Math.min(lu,lv)*.5;if(d>dm){d=dm;rad=d*Math.tan(ang/2)}const T1=[B[0]+ux*d,B[1]+uy*d],T2=[B[0]+vx*d,B[1]+vy*d];let bx=ux+vx,by=uy+vy;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;const cd=rad/Math.sin(ang/2),Cc=[B[0]+bx*cd,B[1]+by*cd];const a1=Math.atan2(T1[1]-Cc[1],T1[0]-Cc[0]);let da=Math.atan2(T2[1]-Cc[1],T2[0]-Cc[0])-a1;while(da>Math.PI)da-=MS_TAU;while(da<-Math.PI)da+=MS_TAU;for(let k=0;k<=seg;k++){const a=a1+da*k/seg;out.push([Cc[0]+Math.cos(a)*rad,Cc[1]+Math.sin(a)*rad])}}return out}
const msStar=(n,inn,ro,ri,rot=0)=>{const V=[];for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,r=i%2?inn:1;V.push([Math.sin(a)*r,-Math.cos(a)*r])}return msRound(V,V.map((_,i)=>i%2?ri:ro))};
const msClover=(n,d,rho,rot=0)=>msPolar(t=>{let m=0;for(let k=0;k<n;k++){const dl=t-rot-k*MS_TAU/n,c=d*Math.cos(dl),s=d*Math.sin(dl),q=rho*rho-s*s;if(q>0)m=Math.max(m,c+Math.sqrt(q))}return m||.2});
const msCookie=(n,a)=>msPolar(t=>1-a*Math.pow(.5-.5*Math.cos(n*t),.8),540);
const msArc=(cx0,cy0,r,a0,a1,k=48)=>{const P=[];for(let i=0;i<=k;i++){const a=a0+(a1-a0)*i/k;P.push([cx0+Math.cos(a)*r,cy0+Math.sin(a)*r])}return P};
function msPixel(rowsHW,N){const c=2/N,R=[],L=[];for(let k=0;k<N;k++){const y0=-1+k*c,y1=y0+c,hw=rowsHW(k,(y0+y1)/2,c);R.push([hw,y0],[hw,y1]);L.push([-hw,y0],[-hw,y1])}return R.concat(L.reverse())}
const MSH={
circle:['Circle',()=>msPolar(()=>1)],
square:['Square',()=>msRound([[-1,-1],[1,-1],[1,1],[-1,1]],.42)],
slanted:['Slanted',()=>msRound([[-.72,-1],[1,-1],[.72,1],[-1,1]],.4)],
arch:['Arch',()=>[...msArc(0,0,1,Math.PI,MS_TAU,72),...msArc(.74,.74,.26,0,Math.PI/2,12),...msArc(-.74,.74,.26,Math.PI/2,Math.PI,12)]],
fan:['Fan',()=>msRound([[0,.95],...msArc(0,.95,1.75,-Math.PI/2-.95,-Math.PI/2+.95,60).map(p=>[p[0],p[1]])],.12,8)],
arrow:['Arrow',()=>msRound([[0,-1],[1,.1],[.5,.1],[.5,1],[-.5,1],[-.5,.1],[-1,.1]],[.3,.18,.1,.16,.16,.1,.18])],
semicircle:['Semicircle',()=>msRound([...msArc(0,.5,1,Math.PI,MS_TAU,90),[1,.5],[-1,.5]],.14)],
oval:['Oval',()=>msPolar(t=>1,480).map(([x,y])=>{const X=x*1,Y=y*.64,a=-.5;return[X*Math.cos(a)-Y*Math.sin(a),X*Math.sin(a)+Y*Math.cos(a)]})],
pill:['Pill',()=>msRound([[-1,-.5],[1,-.5],[1,.5],[-1,.5]],.5,24)],
triangle:['Triangle',()=>msRound([[0,-1],[.95,.72],[-.95,.72]],.3)],
diamond:['Diamond',()=>msRound([[0,-1],[1,0],[0,1],[-1,0]],.34)],
clamshell:['Clam shell',()=>{const P=[[0,.95]];for(let k=0;k<=120;k++){const u=k/120,a=-Math.PI/2-1.0+2.0*u,s=(u*3)%1,r=1.55*(.9+.1*Math.sin(Math.PI*s));P.push([Math.cos(a)*r,.95+Math.sin(a)*r])}return msRound(P,.1,6)}],
pentagon:['Pentagon',()=>msRound([0,1,2,3,4].map(i=>{const a=i*MS_TAU/5;return[Math.sin(a),-Math.cos(a)]}),.3)],
gem:['Gem',()=>msRound([[-.55,-1],[.55,-1],[1,-.25],[0,1],[-1,-.25]],.14)],
verysunny:['Very sunny',()=>msStar(8,.62,.1,.1)],
sunny:['Sunny',()=>msStar(8,.8,.12,.16)],
cookie4:['Cookie 4',()=>msCookie(4,.3)],cookie6:['Cookie 6',()=>msCookie(6,.17)],cookie7:['Cookie 7',()=>msCookie(7,.14)],cookie9:['Cookie 9',()=>msCookie(9,.1)],cookie12:['Cookie 12',()=>msCookie(12,.075)],
ghost:['Ghost',()=>{const P=msArc(0,-.05,1,Math.PI,MS_TAU,72);for(let k=0;k<=60;k++){const u=k/60;P.push([1-2*u,.78+.2*(.5-.5*Math.cos(MS_TAU*3*u+Math.PI))*-1+.0])}return P}],
clover4:['Clover 4',()=>msClover(4,.5,.52)],clover8:['Clover 8',()=>msClover(8,.66,.34)],
burst:['Burst',()=>msStar(12,.74,.04,.04)],softburst:['Soft burst',()=>msStar(12,.8,.22,.22)],
boom:['Boom',()=>{const V=[];for(let i=0;i<30;i++){const a=i*Math.PI/15,r=i%2?.6:1-.14*(((i>>1)*7)%3)/2;V.push([Math.sin(a)*r,-Math.cos(a)*r])}return msRound(V,.04,4)}],
softboom:['Soft boom',()=>{const V=[];for(let i=0;i<30;i++){const a=i*Math.PI/15,r=i%2?.64:1-.14*(((i>>1)*7)%3)/2;V.push([Math.sin(a)*r,-Math.cos(a)*r])}return msRound(V,.16,8)}],
flower:['Flower',()=>msClover(8,.52,.5)],
puffy:['Puffy',()=>msClover(6,.62,.44).map(([x,y])=>[x,y*.84])],
puffydiamond:['Puffy diamond',()=>msClover(4,.58,.5,Math.PI/4)],
pixelcircle:['Pixel circle',()=>msPixel((k,y,c)=>Math.round(Math.sqrt(Math.max(0,1-y*y))/c)*c||c,9)],
pixeltriangle:['Pixel triangle',()=>msPixel((k,y,c)=>Math.max(c,Math.round(((y+1)/2)*1/c)*c),8)],
bun:['Bun',()=>[...msArc(0,0,1,Math.PI,MS_TAU,72).map(p=>[p[0],p[1]*.62]),...msArc(.72,.0,.28,0,Math.PI/2,10).map(p=>[p[0],p[1]+.25]).filter((_,i)=>i>=0),...msArc(-.72,.0,.28,Math.PI/2,Math.PI,10).map(p=>[p[0],p[1]+.25])]],
heart:['Heart',()=>{const P=[];for(let i=0;i<240;i++){const t=i/240*MS_TAU;P.push([16*Math.pow(Math.sin(t),3),-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))])}return P}]
};
const MSC={};
function msPts(k){if(MSC[k])return MSC[k];const d=MSH[k]||MSH.circle,P=d[1]();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(([x,y])=>{if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y});const w=x1-x0||1,h=y1-y0||1,N=P.map(([x,y])=>[(x-x0)/w*2-1,(y-y0)/h*2-1]);return MSC[k]={p:N,ar:w/h}}
function msThumb(k,s=22){const {p,ar}=msPts(k),sx=ar>=1?1:ar,sy=ar>=1?1/ar:1;return `<svg class=ms viewBox="-1.1 -1.1 2.2 2.2" width=${s} height=${s}><path d="M${p.filter((_,i)=>p.length<200||i%2==0).map(q=>(q[0]*sx).toFixed(2)+' '+(q[1]*sy).toFixed(2)).join('L')}Z"/></svg>`}

