/* Expressions: a property can hold a formula (L.xp = {key:'formula'}) that replaces its keyframed value. Parsed by a small hand-written parser, never eval, so a shared project file cannot run code. Depends only on time, so paused and playing render identically. Hooked into val() in 06. */
const XC=new Map();let XD=0;
const xn=(x,s)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f),h=n=>{const v=Math.sin(n*127.1+s*311.7)*43758.5453;return(v-Math.floor(v))*2-1};return h(i)*(1-u)+h(i+1)*u},
 xcl=(x,a,b)=>Math.max(a,Math.min(b,x)),
 xbn=x=>{x=xcl(x,0,1);const n=7.5625,d=2.75;return x<1/d?n*x*x:x<2/d?n*(x-=1.5/d)*x+.75:x<2.5/d?n*(x-=2.25/d)*x+.9375:n*(x-=2.625/d)*x+.984375};
const XF={sin:(c,x)=>Math.sin(x),cos:(c,x)=>Math.cos(x),tan:(c,x)=>Math.tan(x),abs:(c,x)=>Math.abs(x),sqrt:(c,x)=>Math.sqrt(x),floor:(c,x)=>Math.floor(x),ceil:(c,x)=>Math.ceil(x),round:(c,x)=>Math.round(x),sign:(c,x)=>Math.sign(x),fract:(c,x)=>x-Math.floor(x),
 min:(c,a,b)=>Math.min(a,b),max:(c,a,b)=>Math.max(a,b),pow:(c,a,b)=>Math.pow(a,b),clamp:(c,x,a,b)=>xcl(x,a,b),lerp:(c,a,b,x)=>a+(b-a)*x,
 ease:(c,x)=>{x=xcl(x,0,1);return x*x*(3-2*x)},bounce:(c,x)=>xbn(x),elastic:(c,x)=>{x=xcl(x,0,1);return x==0||x==1?x:Math.pow(2,-10*x)*Math.sin((x*10-.75)*2*Math.PI/3)+1},
 linear:(c,x,a,b,v,w)=>v+(w-v)*xcl((x-a)/(b-a),0,1),noise:(c,x,s)=>xn(x,s||0),
 wiggle:(c,f,a,s)=>c.b+xn(c.t*f,s||0)*a,
 loop:(c,p)=>{const a=c.L.kf[c.k]||[],a0=a.length?a[0].t:0;p=+p>0?+p:1;return val0(c.L,c.k,a0+(((c.t-a0)%p)+p)%p)},
 link:(c,n,k)=>{const o=typeof n=='number'?P.layers.find(l=>l.id==n):P.layers.find(l=>l.name==n||LN(l)==n);return!o||o===c.L?c.b:val(o,String(k||c.k),c.t)}};
const XV={t:c=>c.t,time:c=>c.t,value:c=>c.b,pi:()=>Math.PI,dur:()=>P.dur,bpm:()=>P.bpm||120,beat:c=>(c.t-(P.boff||0))*(P.bpm||120)/60,index:c=>P.layers.indexOf(c.L)};
function xpParse(src){
 const tk=[],re=/\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_]\w*)|('[^']*'|"[^"]*")|(<=|>=|==|!=|&&|\|\||[-+*\/%^(),?:<>!]))/y;let i=0;src=String(src);
 while(src.slice(i).trim()!==''){re.lastIndex=i;const m=re.exec(src);if(!m)throw new Error('Unexpected character at '+(src.length-src.slice(i).trimStart().length+1));i=re.lastIndex;tk.push(m[1]!==undefined?{n:+m[1]}:m[2]!==undefined?{id:m[2]}:m[3]!==undefined?{s:m[3].slice(1,-1)}:{o:m[4]})}
 if(!tk.length)throw new Error('Empty formula');
 let p=0;const isO=o=>tk[p]&&tk[p].o===o,eat=o=>{if(!isO(o))throw new Error('Expected '+o);p++};
 const lvl=(sub,ops)=>()=>{let a=sub();while(tk[p]&&ops[tk[p].o]){const f=ops[tk[p++].o],l=a,r=sub();a=c=>f(l(c),r(c))}return a};
 const prim=()=>{const k=tk[p++];if(!k)throw new Error('Unexpected end');
  if(k.n!==undefined)return()=>k.n;if(k.s!==undefined)return()=>k.s;
  if(k.o=='('){const e=top();eat(')');return e}
  if(k.id){if(isO('(')){p++;const f=Object.hasOwn(XF,k.id)&&XF[k.id];if(!f)throw new Error('Unknown function '+k.id);const A=[];if(!isO(')')){do A.push(top());while(isO(',')&&p++)}eat(')');return c=>f(c,...A.map(a=>a(c)))}
   const v=Object.hasOwn(XV,k.id)&&XV[k.id];if(!v)throw new Error('Unknown name '+k.id);return v}
  throw new Error('Unexpected '+k.o)};
 const pow=()=>{const b=prim();if(isO('^')){p++;const e=unary();return c=>Math.pow(b(c),e(c))}return b};
 const unary=()=>{if(isO('-')){p++;const e=unary();return c=>-e(c)}if(isO('!')){p++;const e=unary();return c=>+!e(c)}if(isO('+')){p++;return unary()}return pow()};
 const mul=lvl(unary,{'*':(a,b)=>a*b,'/':(a,b)=>a/b,'%':(a,b)=>a%b}),add=lvl(mul,{'+':(a,b)=>a+b,'-':(a,b)=>a-b}),
  cmp=lvl(add,{'<':(a,b)=>+(a<b),'>':(a,b)=>+(a>b),'<=':(a,b)=>+(a<=b),'>=':(a,b)=>+(a>=b),'==':(a,b)=>+(a==b),'!=':(a,b)=>+(a!=b)}),
  and=lvl(cmp,{'&&':(a,b)=>+(a&&b)}),or=lvl(and,{'||':(a,b)=>+(a||b)});
 function top(){const c=or();if(isO('?')){p++;const a=top();eat(':');const b=top();return x=>c(x)?a(x):b(x)}return c}
 const f=top();if(p<tk.length)throw new Error('Unexpected '+(tk[p].o||tk[p].id||tk[p].n));return f}
function exprEval(L,k,t){const b=val0(L,k,t),s=L.xp[k];if(typeof b!='number'||XD>4)return b;let f=XC.get(s);if(f===undefined){try{f=xpParse(s)}catch(e){f=null}XC.set(s,f)}if(!f)return b;XD++;try{const r=f({L,k,t,b});return typeof r=='number'&&isFinite(r)?r:b}catch(e){return b}finally{XD--}}
function xpSet(L,k,formula){if(!formula||!String(formula).trim()){if(L.xp){delete L.xp[k];if(!Object.keys(L.xp).length)delete L.xp}return null}try{xpParse(formula)}catch(e){return e.message}(L.xp=L.xp||{})[k]=String(formula).trim();return null}
function XPUI(L){const lines=Object.entries(L.xp||{}).map(([k,f])=>k+' = '+f).join('\n');return`<div class=r style="display:block"><label>Expressions</label><textarea data-xp rows=3 spellcheck=false placeholder="sc = 1 + 0.1*sin(t*6)" style="width:100%;box-sizing:border-box;margin-top:4px">${esc(lines)}</textarea><p class=hint id=xperr style="margin:4px 0 0;padding:0;border:0"></p><details style="margin-top:6px"><summary class=hint style="cursor:pointer;margin:0;padding:0;border:0">Help</summary><p class=hint style="margin-top:6px">One per line: <b>key = formula</b>. Names: t, value, beat, bpm, dur, index, pi. Functions: wiggle(freq,amp), loop(period), link('Layer','key'), ease, bounce, elastic, linear(x,a,b,v,w), noise, sin, cos, abs, min, max, clamp, lerp, floor, round, pow, sqrt, fract. Also ? : &lt; &gt; &amp;&amp; ||.</p></details></div>`}
$('#side').addEventListener('change',e=>{const el=e.target;if(!el.matches||!el.matches('textarea[data-xp]'))return;const L=cur();if(!L)return;const errs=[];L.xp=undefined;el.value.split('\n').forEach((ln,i)=>{ln=ln.trim();if(!ln)return;const m=/^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(ln);if(!m){errs.push('Line '+(i+1)+': use key = formula');return}const r=xpSet(L,m[1],m[2]);if(r)errs.push('Line '+(i+1)+': '+r)});if(!L.xp)delete L.xp;dirty=1;commit();const x=$('#xperr');if(x)x.textContent=errs.join(' · ')});
