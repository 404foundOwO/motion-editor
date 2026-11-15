/* Impact shake (camera effect 'impact'): an explosion-style hit. The camera is kicked hard, then rings like a head on a spring: a damped wobble on both axes, a roll and a zoom punch, settling over a few tenths of a second. camAt() (03) adds impactAt(). Depends only on time, so paused = playing. */
EF.impact=['Impact shake (explosion)',0];
EP.impact=[['ixt','Hit time (s)',0],['ixs','Strength (px)',60],['ixd','Settle time (s)',1.2],['ixf','Spring speed (Hz)',7],['ixr','Roll (°)',4],['ixz','Zoom punch (px)',80],['ix3','3D tilt (°) (pitch and yaw, gives depth)',3],['ixa','Direction (°) (90 = up and down, 0 = left and right)',90],['ixw','Direction wander (°) (random per hit)',35],['ixp','Repeat every (s) (0 = a single hit)',0],['ixn','Number of hits (0 = endless)',0],['ixe','Seed',1]];
Object.assign(KA,{ix3:.5,ixt:.1,ixs:5,ixd:.1,ixf:.5,ixr:.5,ixz:10,ixa:5,ixw:5,ixp:.1,ixn:1,ixe:1});
function impactAt(C,t){const v=k=>val(C,k,t),S=v('ixs')||0,T0=v('ixt')||0,per=Math.max(0,v('ixp')||0),nh=Math.round(v('ixn')||0),dec=3/Math.max(.05,v('ixd')||1.2),f=Math.max(.1,v('ixf')||9),roll=v('ixr')||0,zm=v('ixz')||0,t3=v('ix3')||0,an=(v('ixa')===undefined?90:v('ixa')),wd=v('ixw')||0,sd=v('ixe')||1;
 const o={x:0,y:0,z:0,rz:0,rx:0,ry:0};if(t<T0||(!S&&!roll&&!zm&&!t3))return o;
 const last=per>0?Math.floor((t-T0)/per):0,jmax=nh>0?Math.min(last,nh-1):last,span=per>0?Math.ceil(3/dec/per)+1:1;
 for(let j=Math.max(0,jmax-Math.min(span,24));j<=jmax;j++){const tau=t-T0-j*per;if(tau<0)continue;const e=Math.max(0,(Math.exp(-dec*tau)-.01)/.99),at=Math.min(1,tau/.02),th=(an+(hn(j*3.1,sd)*2-1)*wd)*Math.PI/180,w=6.2832*f*tau,c=Math.cos(th),s=Math.sin(th),sgn=hn(j*7.7+1,sd)>.5?1:-1;
  const pa=e*at*Math.cos(w),pb=.45*e*at*Math.sin(w*1.31+.6),hx=pa*c-pb*s,hy=pa*s+pb*c;
  o.x+=S*hx;o.y+=S*hy;o.ry+=t3*hx;o.rx+=t3*hy;o.rz+=sgn*roll*e*at*Math.cos(w*.8+.6);o.z+=zm*Math.max(0,(Math.exp(-dec*1.3*tau)-.01)/.99)*at*Math.cos(w*1.15)}
 return o}
