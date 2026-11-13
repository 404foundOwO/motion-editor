// Projects manager (needs Playwright + Chromium): create, switch, duplicate, rename, delete, reload, and the move from the old single-project autosave.
// Run: node tests/projects.js
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: playwright not installed');process.exit(0)}
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+JSON.stringify(x)));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const url='file://'+path.resolve(__dirname,'../index.html'),boot=async()=>{await p.goto(url);await p.waitForFunction(()=>typeof SAVEON!='undefined'&&SAVEON===true,null,{timeout:15000});await p.waitForTimeout(300)};
await boot();
// 1. a fresh browser starts with one project named Untitled 1
ok('first project is named',await p.evaluate(()=>PNAME)=='Untitled 1');
// 2. add a layer, name the project, save
await p.evaluate(async()=>{const r=mk('rect');r.name='Alpha';await projRename(CURID,'Alpha project');commit();await projFlush()});
const idA=await p.evaluate(()=>CURID);
// 3. new project does not touch the first one
await p.evaluate(()=>projNew());
const idB=await p.evaluate(()=>CURID);
ok('new project has its own id',idA!=idB);
ok('new project holds only the camera',await p.evaluate(()=>P.layers.length)==1);
ok('new project gets the first free name',await p.evaluate(()=>PNAME)=='Untitled 1');
await p.evaluate(async()=>{mk('circle').name='Beta';commit();await projFlush()});
// 4. switching restores each project's own layers
await p.evaluate(id=>projSwitch(id),idA);
ok('switch back restores layers',await p.evaluate(()=>P.layers.map(l=>l.name).join())=='Camera,Alpha');
ok('top button shows the name',(await p.textContent('#prj .lbl'))=='Alpha project');
await p.evaluate(id=>projSwitch(id),idB);
ok('other project has its own layers',await p.evaluate(()=>P.layers.map(l=>l.name).join())=='Camera,Beta');
// 5. duplicate, rename, list
const idC=await p.evaluate(id=>projDup(id),idA);
let list=await p.evaluate(()=>projList().then(a=>a.map(m=>[m.id,m.name,m.n])));
ok('three projects listed',list.length==3,list);
ok('duplicate is named copy',list.find(m=>m[0]==idC)[1]=='Alpha project copy');
await p.evaluate(id=>projRename(id,'Renamed'),idC);
ok('rename sticks',await p.evaluate(id=>idb('proj','readonly',q=>q.get('m:'+id)).then(m=>m.name),idC)=='Renamed');
// 6. the dialog renders cards and buttons work
await p.click('#prj');await p.waitForSelector('#prm .prmc');
ok('dialog shows a card per project',await p.locator('#prm .prmc').count()==3);
ok('current project is marked',await p.locator('#prm .prmc.cur').count()==1);
await p.locator('#prm .prmc[data-id="'+idC+'"] [data-a=open]').first().click();
await p.waitForFunction(id=>CURID==id,idC,{timeout:8000});
ok('clicking a card opens it',await p.evaluate(()=>P.layers.map(l=>l.name).join())=='Camera,Alpha');
// 7. reload reopens the last project
await boot();
ok('reload reopens the last project',await p.evaluate(()=>CURID)==idC&&await p.evaluate(()=>P.layers.length)==2);
// 8. delete the open project: another one opens, the media and records are gone
p.on('dialog',d=>d.accept());
await p.evaluate(id=>projDel(id),idC);
list=await p.evaluate(()=>projList().then(a=>a.map(m=>m.id)));
ok('deleted project is gone',!list.includes(idC)&&list.length==2,list);
ok('an existing project opened instead',await p.evaluate(()=>CURID)!=idC&&list.includes(await p.evaluate(()=>CURID)));
// 9. deleting everything leaves one fresh project
for(const id of list)await p.evaluate(i=>projDel(i),id);
list=await p.evaluate(()=>projList().then(a=>a.length));
ok('always at least one project',list==1,list);
// 10. old single-project autosave is moved over
await p.evaluate(async()=>{const o=JSON.parse(ser());o.layers.push({...mk('rect'),name:'Legacy'});P.layers.pop();await idb('proj','readwrite',q=>{q.clear();return q.put({json:JSON.stringify({dur:4,layers:[{id:1,name:'Legacy',type:'rect',p:{},kf:{},efx:[],s:0,e:1e9}]}),t:Date.now()},'cur')});await idb('media','readwrite',q=>q.clear())});
await boot();
ok('old autosave becomes a project',await p.evaluate(()=>PNAME)=='My project'&&await p.evaluate(()=>P.layers[0].name)=='Legacy');
ok('old key is removed',await p.evaluate(()=>idb('proj','readonly',q=>q.get('cur')))==null);
ok('no page errors',errs.length==0,errs.slice(0,3));
console.log('FAILS',fails);await b.close();process.exit(fails?1:0)})()
