// version label, empty-canvas hint, friendly default layer names
const h=require('./harness');(async()=>{const errs=[];const d=await h.load(process.argv[2]||'MF:'+require('path').resolve(__dirname,'../index.html'),errs);const w=d.window,ev=s=>w.eval(s),q=s=>w.document.querySelector(s);
let fails=0;const ok=(n,c,x)=>{if(!c)fails++;console.log(c?'PASS':'FAIL',n,x===undefined?'':JSON.stringify(x))};
ok('version label shows APPV',q('#ver')&&q('#ver').textContent=='v'+ev('APPV'),q('#ver')&&q('#ver').textContent);
ok('empty hint visible in a new project',q('#empty')&&!q('#empty').hidden);
const a=ev("mk('rect')"),b=ev("mk('rect')"),tx=ev("mk('text')");ev('all()');
ok('empty hint hides once a layer exists',q('#empty').hidden);
ok('friendly names',a.name=='Rectangle'&&b.name=='Rectangle 2',[a.name,b.name]);
ok('default text layer still shows its content',ev('LN')(tx)=='TEXT'&&ev('isDefName')(tx));
ok('old-style names still count as default',ev('isDefName')({type:'rect',name:'rect4'}));
ok('renamed layer is not default',!ev('isDefName')({type:'rect',name:'Hero box'}));
const fk=ev('fadeK'),FL={s:1,e:5,fi:1,fo:2};ok('fade in/out factor',fk(FL,1)==0&&fk(FL,1.5)==.5&&fk(FL,3)==1&&fk(FL,4)==.5&&fk(FL,5)==0&&fk({s:0,e:4},2)==1);
ev('P.layers.splice(1);all()');ok('hint returns when layers are removed',!q('#empty').hidden);
console.log('errs',errs.slice(0,3),'FAILS',fails);process.exit(fails?1:0)})()
