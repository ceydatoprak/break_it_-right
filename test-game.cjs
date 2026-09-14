/* RESCUE WORKSHOP — headless regression suite.
   Runs the real game script against a mocked canvas/DOM and drives it through
   __RW (deterministic stepping, no requestAnimationFrame). */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');

const noop = () => {};
const ctx = new Proxy({
  createLinearGradient: () => ({addColorStop: noop}),
  createRadialGradient: () => ({addColorStop: noop})
}, {get: (t,k) => t[k] || noop});

function el(){
  return {
    children: [], style: {setProperty: noop}, textContent: '', innerHTML: '',
    classList: {add: noop, remove: noop, toggle: noop, contains: () => false},
    appendChild(e){ this.children.push(e); return e; },
    querySelector: () => null, setAttribute: noop, addEventListener: noop,
    getContext: () => ctx,
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
  getComputedStyle: () => ({getPropertyValue: () => ''}),
  MutationObserver: class { observe(){} },
  performance: {now: () => 0},
  setTimeout: () => 0, clearTimeout: noop, requestAnimationFrame: noop, console
};
vm.createContext(sandbox);
const src = fs.readFileSync(__dirname + '/index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(src, sandbox);
const G = sandbox.window.__RW;
const PI = Math.PI;

/* ---- helpers ---- */
const comp = id => G.info.comps.find(c => c.id === id) || {};
const done = id => !!comp(id).done;
const state = () => G.info.comps.map(c => c.id + (c.done ? '+' : (c.locked ? '-' : '.'))).join(' ');
/* what the player can actually act on right now: unlocked AND facing them */
const openIds = () => G.info.comps
  .filter(c => !c.locked && !c.done && c.front && c.type !== 'chip')
  .map(c => c.id).join(',');
const cool = () => G.step(1/60, 70);           /* let the penalty cooldown lapse */

const unscrew = (x,y) => { G.pick('screwdriver'); G.swipe({x,y},{x,y:y+300},18); };
const suck    = (x,y) => { G.pick('suction');    G.swipe({x,y},{x,y:y-80},10); };
const slice   = (x,y) => { G.pick('cutter');     G.swipe({x:x-40,y},{x:x+40,y},9); };
const magnet  = (x,y,f)=>{ G.pick('magnet');     G.hold({x,y}, f||80); };
const grab    = (a,b) => { G.pick(null);         G.swipe(a,b,14); G.step(1/60,30); };

const MAT = [{x:328,y:452},{x:330,y:452},{x:330,y:452},{x:332,y:452},{x:332,y:452}];

function solve(i){
  G.go(i);
  if(i === 0){
    unscrew(172,356); G.setRot(PI); unscrew(172,356); G.setRot(0);
    suck(172,212); grab({x:172,y:308}, MAT[0]);
  } else if(i === 1){
    G.setRot(PI); G.pick(null); G.tap({x:172,y:276}); G.setRot(0);
    slice(172,268); suck(172,214); grab({x:172,y:336}, MAT[1]);
  } else if(i === 2){
    G.setRot(-PI/2); G.pick(null); G.swipe({x:172,y:330},{x:172,y:640},18); G.setRot(0);
    suck(172,210); grab({x:172,y:322}, MAT[2]);
  } else if(i === 3){
    magnet(172,304,90);
    G.pick(null); G.swipe({x:150,y:320},{x:290,y:320},14);
    grab({x:172,y:330}, MAT[3]);
  } else {
    slice(172,378); cool();
    unscrew(172,238); unscrew(172,314);
    G.setRot(PI); G.pick(null); G.tap({x:172,y:274}); G.setRot(0);
    magnet(172,296,90);
    suck(172,326); grab({x:172,y:352}, MAT[4]);
  }
  return G.info;
}

/* ---- run ---- */
let n = 0;
const check = (name, fn) => { fn(); n++; console.log('PASS ' + name); };

check('Her bölüm öne bakan tek bir eylemle başlıyor', () => {
  const first = ['s1','wire','lid','pin','strap'];
  for(let i=0;i<5;i++){ G.go(i); assert.equal(openIds(), first[i], 'bölüm '+(i+1)); }
});

check('Obje çevrilmeden arkadaki parça ne görünür ne kullanılabilir', () => {
  G.go(0);
  assert.equal(G.at('s1').front, true);
  assert.equal(G.at('s2').front, false);
  unscrew(172,356);                       /* önden bakarken arka vida sökülemez */
  assert.equal(done('s1'), true);
  assert.equal(done('s2'), false);
  G.setRot(PI);
  assert.equal(G.at('s2').front, true);
  unscrew(172,356);
  assert.equal(done('s2'), true);
});

for(let i=0;i<5;i++)
  check('Bölüm ' + (i+1) + ' doğru sırayla çözülüyor', () => {
    const r = solve(i);
    assert.equal(r.solved, true);
    assert.equal(r.failed, false);
  });

check('Yumuşak hata can götürmüyor ve hiçbir şeyi bozmuyor', () => {
  G.go(0);
  G.pick('cutter'); G.swipe({x:172,y:356},{x:172,y:391},6);
  assert.equal(G.info.say, 'Bu burada işe yaramaz.');
  assert.equal(G.info.strikes, 3);
  assert.equal(done('s1'), false);
});

check('Bağımlılık kilidi kendi gerekçesini söylüyor', () => {
  G.go(4);
  unscrew(172,238);
  assert.equal(done('s1'), false);
  assert.equal(G.info.say, 'Kayış vidaların üstünde.');
});

check('Kritik hata: çekiç kırılgan parçayı yok ediyor', () => {
  G.go(0);
  G.pick('hammer'); G.tap({x:172,y:212});
  assert.equal(G.info.failed, true);
  assert.equal(G.info.strikes, 3, 'kritik hata can değil bölüm götürür');
});

check('Canlı kabloyu kesmek çarpar, kabloyu kesmez', () => {
  G.go(1);
  assert.equal(comp('pwr').on, true);
  slice(172,268); cool();
  assert.equal(done('wire'), false);
  assert.equal(G.info.strikes, 2);
  assert.match(G.info.say, /elektrik/i);
  assert.equal(G.info.failed, false, 'anında bölüm kaybı değil');
});

check('Tek hareket tek ceza (kare başına değil)', () => {
  G.go(1);
  G.pick('cutter'); G.swipe({x:130,y:268},{x:215,y:268}, 30);   /* 29 ara olay */
  assert.equal(G.info.strikes, 2, 'bir sürükleme bir can götürmeli');
});

check('Üç ceza bölümü bitiriyor', () => {
  G.go(1);
  slice(172,268); cool(); assert.equal(G.info.strikes, 2);
  slice(172,268); cool(); assert.equal(G.info.strikes, 1);
  slice(172,268); cool();
  assert.equal(G.info.strikes, 0);
  assert.equal(G.info.failed, true);
});

check('Güç kesilince kablo güvenle kesiliyor', () => {
  G.go(1);
  G.setRot(PI); G.pick(null); G.tap({x:172,y:276});
  assert.equal(comp('pwr').on, false);
  G.setRot(0); slice(172,268);
  assert.equal(done('wire'), true);
  assert.equal(G.info.strikes, 3);
});

check('Basınç varken kapağı çekmek cezalı, kapak yerinde kalıyor', () => {
  G.go(2);
  suck(172,210); cool();
  assert.equal(done('lid'), false);
  assert.equal(G.info.strikes, 2);
  assert.match(G.info.say, /Basınç/);
  G.setRot(-PI/2); G.pick(null); G.swipe({x:172,y:330},{x:172,y:640},18);
  assert.equal(done('valve'), true);
  G.setRot(0); suck(172,210);
  assert.equal(done('lid'), true);
});

check('Mıknatıs pimi yuvaya taşıyor, uzaktan etkisiz', () => {
  G.go(3);
  magnet(40, 200, 40);                       /* menzil dışı */
  assert.equal(done('pin'), false);
  assert.equal(comp('pin').slide, 0);
  magnet(172, 304, 90);
  assert.equal(done('pin'), true);
});

check('Mıknatıs hassas devreye yaklaşınca ceza', () => {
  G.go(3);
  magnet(84, 360, 30);
  assert.equal(G.info.strikes, 2);
  assert.equal(comp('chip').fried, true);
  assert.match(G.info.say, /devre/i);
});

check('Bölüm 5: güç açıkken mıknatıs pimi kilitliyor', () => {
  G.go(4);
  slice(172,378); cool();
  unscrew(172,238); unscrew(172,314);
  assert.equal(done('cover'), true, 'iki vida çıkınca kapak kendiliğinden açılır');
  magnet(172,296,40);
  assert.equal(done('pin'), false);
  assert.equal(G.info.strikes, 2);
  assert.match(G.info.say, /güc[üu]/i);
});

check('Kurtarma yalnızca mindere bırakılınca tamamlanıyor', () => {
  G.go(0);
  unscrew(172,356); G.setRot(PI); unscrew(172,356); G.setRot(0); suck(172,212);
  grab({x:172,y:308}, {x:250,y:308});        /* minder değil: orada kalır */
  assert.equal(G.info.solved, false);
  assert.equal(done('gem'), false);
  grab({x:250,y:308}, MAT[0]);               /* bırakıldığı yerden alıp mindere taşı */
  assert.equal(G.info.solved, true);
});

check('Sıfırlama can, alet, dönüş ve parçaları temizliyor', () => {
  G.go(1);
  slice(172,268); cool(); G.setRot(2);
  assert.equal(G.info.strikes, 2);
  G.go(1);
  const r = G.info;
  assert.equal(r.strikes, 3);
  assert.equal(r.tool, null);
  assert.equal(r.rot, 0);
  assert.equal(r.solved, false);
  assert.equal(r.failed, false);
  assert.ok(r.comps.every(c => !c.done));
});

check('Aynı girdi aynı sonucu veriyor', () => {
  for(let i=0;i<5;i++){
    const a = JSON.stringify(solve(i).comps);
    const b = JSON.stringify(solve(i).comps);
    assert.equal(a, b, 'bölüm '+(i+1));
  }
});

console.log(n + ' checks passed.');
