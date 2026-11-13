/* Copy background (like Alight Motion): the layer is a window onto everything drawn below it. The layer's own pixels only supply the shape (alpha);
   the colour comes from a snapshot of the canvas taken just before the layer. Effects listed after it (blur, glitch, colour...) then change what is seen through the shape.
   The snapshot is taken in layerDraw0 (06) and applied in postSrc0 as the 'cbg' effect. Amount (p.cbg, %) is how much of the background shows; the rest is the layer's own fill (a tint). The layer itself is drawn without its CSS filters (see one() in 06) so the shape stays crisp. CSS-filter effects (blur, invert, brightness...) are applied to the copied background here, since the layer's own pixels are only the shape. */
function cbgSnap(){const c=gbCv(66,cv.width,cv.height),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(cx.canvas,0,0)}
function cbgRun(src,L,t){const sn=GBP[66];if(!sn||sn.width!=src.width||sn.height!=src.height)return src;const c=gbCv(67,src.width,src.height),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.filter='none';g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(src,0,0);
 /* the layer's own fill stays underneath; the (filtered) background goes on top at Amount %, only inside the shape. Below 100 the fill tints it */
 g.globalCompositeOperation='source-atop';g.globalAlpha=Math.max(0,Math.min(1,(val(L,'cbg',t)==null?100:val(L,'cbg',t))/100));const fs=L.efa.filter(e=>FS[e]).map(e=>FS[e](val(L,e,t))).join(' ');g.filter=fs?fq(fs):'none';g.drawImage(sn,0,0);g.filter='none';g.globalAlpha=1;g.globalCompositeOperation='source-over';return c}

/* ---- Liquid glass: Copy background + refraction. The layer's alpha is the glass shape; the backdrop snapshot (texture B) is sampled through it.
   A blurred silhouette (lgMask) gives a smooth inward direction and depth; at the rim the backdrop is pulled from outside the shape (refraction),
   split per colour channel (dispersion), frosted a little, tinted, and a light-facing specular edge is added. Needs WebGL; without it falls back to plain Copy background. */
Object.assign(GLS,{lglass:`uniform sampler2D B;vec4 Bt(vec2 p){return texture2D(B,clamp(p,0.,1.));}
float Hm(vec2 p){return texture2D(u,clamp(p,0.,1.)).r;}
void main(){vec2 px=1./R;vec4 m=texture2D(u,v);float a=m.g;if(a<.004){gl_FragColor=vec4(0.);return;}
float r=max(4.,k);vec2 g=vec2(0.);
for(int ri=1;ri<=2;ri++){float rr=r*(ri==1?.18:.36);for(int i=0;i<8;i++){float an=float(i)*.785398+float(ri)*.39;vec2 o=vec2(cos(an),sin(an));g+=o*Hm(v+o*rr*px)/float(ri);}}
float gl=length(g);vec2 dir=g/(gl+1e-5);
float d=clamp((m.r-.5)/.47,0.,1.);d=d*d*(3.-2.*d);float live=smoothstep(.002,.02,gl);
float rim=pow(1.-d,2.)*live;float am=k9;
vec2 off=-dir*rim*(k2/100.)*r*1.5*am*px;float ds=k3/100.*am;
vec4 c1=Bt(v+off);vec4 c0=c1,c2=c1;if(ds>.01){c0=Bt(v+off*(1.+ds));c2=Bt(v+off*(1.-ds));}
vec4 o4=vec4(c0.r,c1.g,c2.b,c1.a)*a;o4.rgb=mix(o4.rgb,ca*o4.a,k7/100.*.5);
float ang=k6*.0174533;vec2 ld=vec2(sin(ang),cos(ang));float edge=pow(1.-d,5.)*live;float fc=dot(-dir,ld);
float sp=edge*(max(fc,0.)+max(-fc,0.)*.4+.1)*k5/100.*am;o4.rgb=min(o4.rgb+sp*a,vec3(1.));o4.a=max(o4.a,min(1.,sp*a));
gl_FragColor=o4;}`});
/* the shader's first texture is not the layer itself but a height map built here: red = the layer's silhouette blurred (gaussian, sigma = depth/2), a smooth "how far inside the glass" field; green = the sharp silhouette (the glass shape) */
function lgMask(src,dep){const w=src.width,h=src.height,S=gbCv(73,w,h),A=gbCv(74,w,h),O=gbCv(75,w,h),ini=(c,op)=>{const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.filter='none';g.globalCompositeOperation=op||'source-over';return g};
 let g=ini(S,'copy');g.drawImage(src,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,w,h);
 g=ini(A);g.fillStyle='#000';g.fillRect(0,0,w,h);g.drawImage(S,0,0);g.globalCompositeOperation='multiply';g.fillStyle='#00ff00';g.fillRect(0,0,w,h);
 g=ini(O);g.fillStyle='#000';g.fillRect(0,0,w,h);g.filter=`blur(${Math.max(.5,dep*Q/2).toFixed(2)}px)`;g.drawImage(S,0,0);g.filter='none';g.globalCompositeOperation='multiply';g.fillStyle='#ff0000';g.fillRect(0,0,w,h);g.globalCompositeOperation='lighter';g.drawImage(A,0,0);g.globalCompositeOperation='source-over';return O}
function lgRun(src,L,t){const sn=GBP[66];if(!sn||sn.width!=src.width||sn.height!=src.height)return src;const v=k=>val(L,k,t),am=Math.max(0,v('lglass')/100),c=v('lgc')||'#ffffff',col=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
 /* frost: a real gaussian blur of the backdrop, done once in 2D before the shader (the sharp copy is drawn underneath so the canvas edges don't fade out) */
 let bk=sn;const fr=Math.max(0,v('lgb')||0)*am;if(fr>.2){const f=gbCv(68,sn.width,sn.height),g=f.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.filter='none';g.drawImage(sn,0,0);g.globalCompositeOperation='source-over';g.filter=`blur(${(fr*Q).toFixed(2)}px)`;g.drawImage(sn,0,0);g.filter='none';bk=f}
 let r=null;try{r=glRun('lglass',lgMask(src,Math.max(4,v('lgt'))),[v('lgt'),v('lgr'),v('lgd'),0,v('lgh'),v('lga'),v('lgn'),0,am],[col],t,bk)}catch(e){}return r||cbgRun(src,L,t)}
