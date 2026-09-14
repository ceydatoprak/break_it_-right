const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{};
const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(t,k)=>t[k]||noop});
const elements=new Map();
function el(){return {children:[],style:{},classList:{add:noop,remove:noop},textContent:'',innerHTML:'',appendChild(e){this.children.push(e);return e;},setAttribute:noop,addEventListener:noop,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:400,height:620}),setPointerCapture:noop};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id);},createElement:el,documentElement:el(),addEventListener:noop};
const sandbox={document,navigator:{},window:{addEventListener:noop},Path2D:class {moveTo(){}lineTo(){}closePath(){}},getComputedStyle:()=>({getPropertyValue:()=>''}),MutationObserver:class{observe(){}},performance:{now:()=>0},setTimeout:()=>0,clearTimeout:noop,requestAnimationFrame:noop,console};
vm.createContext(sandbox);
let source=fs.readFileSync(__dirname+'/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
source=source.replace('window.__BIR = {','window.__BIR = { input:{onDown,onMove,onUp,cancelAim}, render,');
vm.runInContext(source,sandbox);
const game=sandbox.window.__BIR;
function settle(){for(let i=0;i<1800&&['flying','settling'].includes(game.info.state);i++)game.step(1/120);}
function run(level,hits){game.go(level);for(const [power,angle=0,x=200] of hits){game.fire(power,angle,x);settle();}return JSON.parse(JSON.stringify(game.info));}
if(process.argv.includes('--explore')){
 for(let l=0;l<5;l++)for(const p of [.25,.4,.55,.75,.95]){const r=run(l,Array.from({length:l===4?1:3},()=>[p,0,l===3?135:200]));console.log(l,p,r.state,r.verdict,r.objs.map(o=>[o.open,o.pieces]),r.rescue);}
}else if(require.main===module){
 let count=0;
 const check=(name,fn)=>{fn();count++;console.log('PASS '+name);};
 const safe=[[[.55]],[[.4,0,145]],[[.5],[.5]],[[.55,0,135],[.55,0,135]],[[.95],[.4]]];
 for(let i=0;i<5;i++)check('Level '+(i+1)+' has a safe physical rescue',()=>{const r=run(i,safe[i]);assert.equal(r.verdict,'Güvende!');assert.equal(r.rescue.dead,false);assert.equal(r.rescue.free,true);assert.equal(r.rescue.rest,true);assert.ok(r.rescue.y>400);game.render();});
 check('Gentle hit cracks ceramic without releasing key',()=>{const r=run(0,[[.2]]);assert.equal(r.objs[0].open,false);assert.equal(r.rescue.free,false);assert.ok(r.objs[0].weak>0);});
 check('Extreme beginner hit fails with a reason',()=>{const r=run(0,[[1]]);assert.equal(r.rescue.dead,true);assert.ok(r.rescue.reason.length>20);});
 check('Glass center hit is riskier than same power at edge',()=>{assert.equal(run(1,[[.75]]).rescue.dead,true);assert.equal(run(1,[[.75,0,140]]).rescue.dead,false);});
 check('Ice cracks before breaking',()=>{const r=run(2,[[.5]]);assert.equal(r.objs[0].open,false);assert.ok(r.objs[0].weak>0);});
 check('Angled ice release misses safe zone',()=>{const r=run(2,[[.5,20,170],[.5,20,170]]);assert.equal(r.rescue.dead,true);assert.match(r.rescue.reason,/Minder/);});
 check('Wood needs repeated controlled hits',()=>{assert.equal(run(3,[[.55,0,135]]).rescue.free,false);assert.equal(run(3,safe[3]).verdict,'Güvende!');});
 check('Wrong crate side is dangerous',()=>{const r=run(3,[[.55,0,260]]);assert.equal(r.rescue.dead,true);assert.match(r.rescue.reason,/destek/);});
 check('Stone protects capsule until a separate hit',()=>{const r=run(4,[[.95]]);assert.equal(r.layer,2);assert.equal(r.rescue.free,false);assert.equal(r.objs[1].open,false);});
 check('Strong final glass hit fails',()=>{assert.equal(run(4,[[.95],[.95]]).rescue.dead,true);});
 check('Repeated hits reproduce physics exactly',()=>{for(let i=0;i<5;i++){const a=run(i,safe[i]),b=run(i,safe[i]);assert.deepEqual(a.rescue,b.rescue);assert.deepEqual(a.objs,b.objs);}});
 check('Retry clears damage, debris, tool and level state',()=>{run(1,[[1]]);game.go(1);const r=game.info;assert.equal(r.particles,0);assert.equal(r.rescue.damage,0);assert.equal(r.rescue.free,false);assert.equal(r.state,'ready');assert.equal(r.hitsUsed,0);assert.equal(r.maxPower,0);assert.equal(r.tool.power,0);assert.equal(r.tool.y,510);assert.equal(r.resultShown,false);assert.equal(r.objs[0].broken,0);});
 const event=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,pointerType:'touch',isPrimary:id===1,preventDefault:noop});
 check('Touch drag controls power and releases exactly once',()=>{game.go(0);game.input.onDown(event(200,510));game.input.onMove(event(200,569.4));assert.ok(Math.abs(game.info.tool.power-.55)<.001);game.input.onUp(event(200,569.4));game.input.onUp(event(200,569.4));assert.equal(game.info.hitsUsed,1);settle();assert.equal(game.info.verdict,'Güvende!');});
 check('Touch cancellation and second finger never strike',()=>{game.go(0);game.input.onDown(event(200,510));game.input.onMove(event(200,560));game.input.onDown(event(200,610,2));game.input.onUp(event(200,610,2));assert.equal(game.info.hitsUsed,0);game.input.cancelAim(event(200,560));game.input.onUp(event(200,560));assert.equal(game.info.hitsUsed,0);assert.equal(game.info.state,'ready');});
 check('Retry during drag discards the old touch',()=>{game.go(0);game.input.onDown(event(200,510));game.input.onMove(event(200,580));game.go(0);game.input.onUp(event(200,580));assert.equal(game.info.hitsUsed,0);assert.equal(game.info.state,'ready');});
 check('Too many weak hits produces a retryable closed-shell failure',()=>{const r=run(0,Array.from({length:5},()=>[.13]));assert.equal(r.state,'result');assert.equal(r.rescue.free,false);assert.notEqual(r.verdict,'Güvende!');});
 console.log(count+' checks passed.');
}
module.exports={game,run,assert};

