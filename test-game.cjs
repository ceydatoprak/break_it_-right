/* RESCUE WORKSHOP — headless regression suite.
   Runs the real game script against a mocked canvas/DOM and drives it
   through __RW (deterministic stepping, no requestAnimationFrame). */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

const noop = () => {};
const ctx = new Proxy({
  createLinearGradient: () => ({addColorStop: noop}),
  createRadialGradient: () => ({addColorStop: noop})
}, {get: (t,k) => t[k] || noop});

function el(){
  return {
    children: [], style: {setProperty: noop}, textContent: '', innerHTML: '',
    classList: {add: noop, remove: noop, contains: () => false},
    appendChild(e){ this.children.push(e); return e; },
    setAttribute: noop, addEventListener: noop, getContext: () => ctx,
    getBoundingClientRect: () => ({left:0, top:0, width:400, height:620}),
    setPointerCapture: noop
  };
}
const elements = new Map();
const document = {
  getElementById(id){ if(!elements.has(id)) elements.set(id, el()); return elements.get(id); },
  createElement: el, documentElement: el(), addEventListener: noop
};
const sandbox = {
  document, navigator: {}, window: {addEventListener: noop},
  Path2D: class { moveTo(){} lineTo(){} closePath(){} },
  getComputedStyle: () => ({getPropertyValue: () => ''}),
  MutationObserver: class { observe(){} },
  performance: {now: () => 0},
  setTimeout: () => 0, clearTimeout: noop, requestAnimationFrame: noop, console
};
vm.createContext(sandbox);
const source = fs.readFileSync(__dirname + '/index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(source, sandbox);
const G = sandbox.window.__RW;

/* ---- helpers ---- */
const st = () => G.info.comps;
const comp = id => st().find(c => c.id === id);
const done = id => !!(comp(id) || {}).done;
const isLocked = id => !!(comp(id) || {}).locked;
/* join to a string: values cross a vm realm boundary, so deepStrictEqual would
   fail on prototype identity even for identical content */
const openIds = () => st().filter(c => !c.locked && !c.hidden && !c.done).map(c => c.id).join(',');

function unscrew(x, y){ G.pick('screwdriver'); G.swipe({x, y}, {x, y: y + 260}, 16); }
function suck(x, y){ G.pick('suction'); G.swipe({x, y}, {x, y: y - 82}, 10); }
function cut(x, y){ G.pick('cutter'); G.swipe({x, y: y - 28}, {x, y: y + 28}, 10); }
function magnet(x, y, frames){ G.pick('magnet'); G.hold({x, y}, frames || 80); }
function tap(x, y, px){ G.pick('hammer'); G.gesture([{x, y}, {x, y: y + px/2}, {x, y: y + px}]); G.step(1/60, 45); }
function grab(from, to){ G.pick(null); G.swipe(from, to, 14); G.step(1/60, 30); }

const MAT = [{x:332,y:424},{x:334,y:424},{x:338,y:424},{x:336,y:424},{x:338,y:424}];

function solve(i){
  G.go(i);
  if(i === 0){
    unscrew(252, 314); suck(176, 278); grab({x:176,y:392}, MAT[0]);
  } else if(i === 1){
    cut(174, 302); unscrew(106, 334); unscrew(242, 334); suck(174, 286);
    grab({x:174,y:378}, MAT[1]);
  } else if(i === 2){
    magnet(264, 316); G.pick(null); G.swipe({x:220,y:379}, {x:340,y:379}, 14);
    grab({x:154,y:400}, MAT[2]);
  } else if(i === 3){
    tap(222, 332, 34); suck(222, 332); grab({x:150,y:404}, MAT[3]);
  } else {
    cut(172, 344); unscrew(100, 306); unscrew(244, 306);
    magnet(320, 392); suck(172, 372); grab({x:172,y:414}, MAT[4]);
  }
  return G.info;
}

/* ---- run ---- */
let n = 0;
const check = (name, fn) => { fn(); n++; console.log('PASS ' + name); };

check('Her bölüm tek bir açık başlangıç adımıyla başlıyor', () => {
  const first = ['latch','tape','pin','weak','strap'];
  for(let i=0;i<5;i++){
    G.go(i);
    assert.equal(openIds(), first[i], 'bölüm ' + (i+1));
  }
});

for(let i=0;i<5;i++)
  check('Bölüm ' + (i+1) + ' doğru sırayla çözülüyor', () => {
    const r = solve(i);
    assert.equal(r.solved, true);
    assert.equal(r.failed, false);
    assert.ok(r.comps.every(c => c.done), 'tüm parçalar tamam');
  });

check('Yanlış alet hiçbir şeyi bozmuyor, sadece uyarıyor', () => {
  G.go(0);
  G.pick('hammer'); G.swipe({x:252,y:314}, {x:252,y:340}, 6);
  assert.equal(done('latch'), false);
  assert.equal(G.info.say, 'Bu burada işe yaramaz.');
  G.pick('cutter'); G.swipe({x:252,y:300}, {x:252,y:330}, 8);
  assert.equal(done('latch'), false);
  assert.equal(G.info.comps.filter(c => c.done).length, 0, 'hiçbir parça bozulmadı');
});

check('Bağımlılık kilidi kendi gerekçesini söylüyor', () => {
  G.go(0);
  suck(176, 278);
  assert.equal(done('lid'), false);
  assert.equal(G.info.say, 'Kapak hâlâ mandala takılı.');
  G.go(1);
  unscrew(106, 334);
  assert.equal(done('s1'), false);
  assert.equal(G.info.say, 'Bant vidanın üstünde.');
});

check('Bölüm 1 çekiç olmadan çözülüyor', () => {
  const r = solve(0);
  assert.equal(r.solved, true);
  assert.equal(r.objects.length, 0, 'kırılacak nesne yok');
});

check('Mıknatıs menzil dışında pimi çekmiyor', () => {
  G.go(2);
  magnet(150, 316, 90);
  assert.equal(done('pin'), false);
  assert.equal(comp('pin').prog, 0);
  magnet(264, 316, 90);
  assert.equal(done('pin'), true);
});

check('Vantuz yeterince çekilmezse panel yerinde kalıyor', () => {
  G.go(0);
  unscrew(252, 314);
  G.pick('suction'); G.swipe({x:176,y:278}, {x:176,y:258}, 6);   /* 20px < 58px eşiği */
  assert.equal(done('lid'), false);
  suck(176, 278);
  assert.equal(done('lid'), true);
});

check('Buz: hafif vuruş çatlatır, çok sert vuruş bölümü kaybettirir', () => {
  G.go(3); tap(222, 332, 10);
  assert.equal(done('weak'), false);
  assert.equal(G.info.say, 'Biraz daha güçlü vur.');

  G.go(3); tap(222, 332, 34);
  assert.equal(done('weak'), true);
  assert.equal(G.info.failed, false);
  assert.ok(G.info.objects[0].broken > 0, 'buzda görünür çatlak var');

  G.go(3); tap(222, 332, 92);
  assert.equal(G.info.failed, true);
  assert.equal(done('weak'), false);
});

check('Bölüm 5 sıra dışına çıkmaya izin vermiyor', () => {
  G.go(4);
  unscrew(100, 306);
  assert.equal(done('fs1'), false);
  assert.equal(G.info.say, 'Kayış vidaları sıkıştırıyor.');
  magnet(320, 392);
  assert.equal(done('lockpin'), false);
  suck(172, 372);
  assert.equal(done('glasslid'), false);
  assert.ok(isLocked('prize'));
});

check('Ahşap çerçeve iki vida çıkınca kendiliğinden açılıyor', () => {
  G.go(4);
  cut(172, 344); unscrew(100, 306);
  assert.equal(done('wood'), false, 'tek vida yetmez');
  unscrew(244, 306);
  assert.equal(done('wood'), true);
  assert.equal(isLocked('lockpin'), false);
});

check('Kurtarma yalnızca mindere bırakılınca tamamlanıyor', () => {
  G.go(0);
  unscrew(252, 314); suck(176, 278);
  assert.equal(isLocked('key'), false);
  grab({x:176,y:392}, {x:250,y:300});          /* minder değil */
  assert.equal(G.info.solved, false);
  assert.equal(done('key'), false);
  grab({x:176,y:392}, MAT[0]);
  assert.equal(G.info.solved, true);
});

check('Sıfırlama parçaları, aleti ve kırık durumunu temizliyor', () => {
  G.go(3);
  tap(222, 332, 34);
  assert.ok(G.info.objects[0].broken > 0);
  G.go(3);
  const r = G.info;
  assert.equal(r.objects[0].broken, 0);
  assert.equal(r.tool, null);
  assert.equal(r.solved, false);
  assert.equal(r.failed, false);
  assert.ok(r.comps.every(c => !c.done));
});

check('Aynı girdi aynı sonucu veriyor', () => {
  for(let i=0;i<5;i++){
    const a = JSON.parse(JSON.stringify(solve(i).comps));
    const b = JSON.parse(JSON.stringify(solve(i).comps));
    assert.deepEqual(a, b, 'bölüm ' + (i+1));
  }
});

console.log(n + ' checks passed.');
