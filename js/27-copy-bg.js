/* Copy background (like Alight Motion): the layer is a window onto everything drawn below it. The layer's own pixels only supply the shape (alpha);
   the colour comes from a snapshot of the canvas taken just before the layer. Effects listed after it (blur, glitch, colour...) then change what is seen through the shape.
   The snapshot is taken in layerDraw0 (06) and applied in postSrc0 as the 'cbg' effect. Amount (p.cbg, %) fades the copied background. CSS-filter effects (blur, invert, brightness...) are applied to the copied background here, since the layer's own pixels are only the shape. */
function cbgSnap(){const c=gbCv(66,cv.width,cv.height),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(cx.canvas,0,0)}
function cbgRun(src,L,t){const sn=GBP[66];if(!sn||sn.width!=src.width||sn.height!=src.height)return src;const c=gbCv(67,src.width,src.height),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,c.width,c.height);
 g.globalAlpha=Math.max(0,Math.min(1,(val(L,'cbg',t)==null?100:val(L,'cbg',t))/100));const fs=L.efa.filter(e=>FS[e]).map(e=>FS[e](val(L,e,t))).join(' ');g.filter=fs?fq(fs):'none';g.drawImage(sn,0,0);g.filter='none';g.globalAlpha=1;g.globalCompositeOperation='destination-in';g.drawImage(src,0,0);g.globalCompositeOperation='source-over';return c}

/* ---- Liquid glass: Copy background + refraction. The layer's alpha is the glass shape; the backdrop snapshot (texture B) is sampled through it.
   The alpha is sampled in rings to get an inward direction, and the distance to the edge is found by stepping outward along it; at the rim the backdrop is pulled from outside the shape (refraction),
   split per colour channel (dispersion), frosted a little, tinted, and a light-facing specular edge is added. Needs WebGL; without it falls back to plain Copy background. */
Object.assign(GLS,{lglass:`uniform sampler2D B;vec4 Bt(vec2 p){return texture2D(B,clamp(p,0.,1.));}
vec4 sm(vec2 o,vec2 px){vec4 c=Bt(v+o);if(k4>.3){vec2 d=k4*px;float w=1.;c*=2.;w=2.;for(int i=0;i<8;i++){float an=float(i)*.785398;vec2 e=vec2(cos(an),sin(an))*d;c+=Bt(v+o+e);w+=1.;}c/=w+0.;}return c;}
void main(){vec2 px=1./R;float a=T(v).a;if(a<.004){gl_FragColor=vec4(0.);return;}
float r=max(4.,k);vec2 g=vec2(0.);float n=1.;
for(int ri=1;ri<=3;ri++){float rr=r*float(ri)/3.;for(int i=0;i<8;i++){float an=float(i)*.785398+float(ri)*.3;vec2 o=vec2(cos(an),sin(an))*rr;g+=o*T(v+o*px).a;n+=1.;}}
g/=n;float gl=length(g);vec2 dir=g/(gl+1e-4);
/* distance to the shape edge, found by stepping outward along -dir (so corners get a round-ish band, not a blob) */
float x=r;for(int i=1;i<=12;i++){float t=r*float(i)/12.;if(T(v-dir*t*px).a<.5){x=t-r/24.;break;}}
float d=clamp(x/r,0.,1.);float live=smoothstep(0.,r*.04,gl)+step(r*.04,gl)*0.;live=clamp(live,0.,1.);
float rim=pow(1.-d,2.)*live;float am=k9;
vec2 off=-dir*rim*(k2/100.)*r*1.5*am*px;float ds=k3/100.*am;
vec4 c1=sm(off,px);vec4 c0=c1,c2=c1;if(ds>.01){c0=sm(off*(1.+ds),px);c2=sm(off*(1.-ds),px);}
vec4 o4=vec4(c0.r,c1.g,c2.b,c1.a)*a;o4.rgb=mix(o4.rgb,ca*o4.a,k7/100.*.5);
float ang=k6*.0174533;vec2 ld=vec2(sin(ang),cos(ang));float edge=pow(1.-d,5.)*live;float fc=dot(-dir,ld);
float sp=edge*(max(fc,0.)+max(-fc,0.)*.4+.1)*k5/100.*am;o4.rgb=min(o4.rgb+sp*a,vec3(1.));o4.a=max(o4.a,min(1.,sp*a));
gl_FragColor=o4;}`});
function lgRun(src,L,t){const sn=GBP[66];if(!sn||sn.width!=src.width||sn.height!=src.height)return src;const v=k=>val(L,k,t),am=Math.max(0,v('lglass')/100),c=v('lgc')||'#ffffff',col=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
 let r=null;try{r=glRun('lglass',src,[v('lgt'),v('lgr'),v('lgd'),v('lgb'),v('lgh'),v('lga'),v('lgn'),0,am],[col],t,sn)}catch(e){}return r||cbgRun(src,L,t)}
