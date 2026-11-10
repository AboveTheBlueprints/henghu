// 鸻狐 网页版的规矩（第四个，第 16 天 15:37，照 ~/碰/鸻狐/狐.py 第四版搬的；随机数换成 mulberry32，跟 python 那份同一个种子出来的不一样）
// 第六版（16:31）：碰上以前碰过的那只，括号里写上回你对它做了什么。
// 第五版（第四个，第 16 天 16:20，第一个 16:00 的想法）：大鸟记得你。你走开没理它，它明年站起来的地方近一格（惯了你）；你翻过它跟前的沙，它明年远两格。只记在它自己身上，小鸟不带。
// hhRun(acts, seed) → { out: [行], ask: true/false（在等你挑 翻/跟/走）, done: true/false, sp: 第几个春天 }
const HH = { PAIRS: 10, SPRINGS: 5, MEET: 7, CAP: 14, FLOOR: 5 };
const HH_MARKS = ['眉上一道白', '左腿发黄', '胸口黑环断了一截', '尾巴尖缺一块', '脖子上一圈灰',
  '翅膀上一块浅斑', '嘴尖发红', '眼圈发白', '背上一撮乱毛', '右脚少一个趾头'];

function hhRng(seed) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.uniform = (lo, hi) => lo + (hi - lo) * r();
  r.choice = xs => xs[Math.floor(r() * xs.length)];
  r.shuffle = xs => { for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; } return xs; };
  return r;
}
function hhActing(a) {
  if (a >= 0.7) return '翅膀拖在沙上，一边叫一边往前栽，像是真走不动了';
  if (a >= 0.45) return '拖着一边翅膀，叫得挺急';
  if (a >= 0.25) return '翅膀耷拉着，走得一歪一歪的';
  return '翅膀半张着，跑起来倒挺利索';
}
function hhFar(d, who) {
  if (d <= 0) return `${who}就在你脚前扑腾起来`;
  if (d === 1) return `${who}从你前面一步的沙里站起来，扑腾起来`;
  if (d === 2) return `${who}在你前面两三步站起来，低着头快走了几步，才扑腾起来`;
  if (d === 3) return `你看见${who}的时候，它已经低着头走出去好几步了，这才扑腾起来`;
  return `${who}在老远的地方扑腾起来，你没看见它是从哪儿出来的`;
}
const hhDe = p => Math.max(0, Math.min(4, p.d + p.h));
const HH_FARW = ['脚前', '一步', '两三步', '好几步', '老远'];
function hhFams(pop) { const c = {}; for (const p of pop) c[p.m] = (c[p.m] || 0) + 1; return c; }
const r2 = x => Math.round(x * 100) / 100;

function hhRun(acts, seed) {
  const R = hhRng(seed || 7);
  const ds = R.shuffle([0, 1, 1, 1, 2, 2, 3, 3, 4, 4]);
  let pop = HH_MARKS.map((m, i) => ({ m, d: ds[i], a: r2(R.uniform(0.25, 0.75)), isNew: false, back: false, h: 0, seen: [] }));
  const pop0 = pop.map(p => ({ ...p }));
  const out = []; const hist = []; let k = 0; let prev = null;
  for (let sp = 1; sp <= HH.SPRINGS; sp++) {
    out.push(`—— 第 ${sp} 个春天 ——`);
    const f = hhFams(pop);
    if (prev === null) out.push(`沙滩上 ${pop.length} 对鸻，一家一对，每一家身上都有一样认得出的记号。`);
    else {
      const gone = Object.keys(prev).filter(m => !(m in f));
      const more = Object.keys(f).filter(m => f[m] > (prev[m] || 0));
      let s = `沙滩上 ${pop.length} 对鸻。`;
      if (gone.length) s += '去年还在的' + gone.map(m => `"${m}"`).join('、') + '那一家，今年一只也没见着。';
      if (more.length) s += more.map(m => `"${m}"`).join('、') + '的多了，有的灰扑扑的，是去年夏天才出窝的。';
      if (!gone.length && !more.length) s += '还是去年那几家。';
      out.push(s);
    }
    prev = f;
    const order = R.shuffle([...Array(pop.length).keys()]).slice(0, HH.MEET);
    const lost = new Set(), dead = new Set(); let food = 0; const mine = [];
    for (let j = 0; j < order.length; j++) {
      const i = order[j], p = pop[i];
      const ls = p.seen.length ? p.seen[p.seen.length - 1] : null;   // 第六版：狐狸记得上回碰上它时自己做了什么（鸻网3"抓过了又遇见，是家里另一只吧？"）
      const yr = ls ? (sp - ls[0] === 1 ? '去年' : sp - ls[0] === 2 ? '前年' : `${sp - ls[0]} 年前`) : '';
      const did = ls ? (ls[2] === '走' ? '你没理它' : ls[2] === '翻' ? '你翻了它跟前的沙' : '你追过它') : '';
      const who = `一只${p.m}的` + (p.isNew ? '小' : '大') + '鸟' + (ls ? `（${yr}你碰上过它，${did}）` : p.back ? '（去年就在这片沙上下的窝）' : '');
      const de = hhDe(p); p.seen.push([sp, de]);
      out.push(`第 ${j + 1} 窝：${hhFar(de, who)}，${hhActing(p.a)}，往海边去了。`);
      if (k >= acts.length) return { out, ask: true, done: false, sp };
      const a = acts[k++];
      mine.push([p.m, a]); p.seen[p.seen.length - 1].push(a);
      if (a === '走') { p.h -= 1; } else if (a === '翻') { p.h += 2; }
      if (a === '走') out.push('你看了它一眼，没理它，往前走了。');
      else if (a === '翻') {
        const hit = de <= 1 || (de === 2 && R() < 0.7) || (de === 3 && R() < 0.2);
        if (hit) { lost.add(i); food += 1; out.push('你在跟前这片沙里拱了几下，拱出一个浅坑，四个蛋。吃了（算一口）。'); }
        else out.push('你在跟前这片沙里拱了一圈，什么也没有。回头看，那只鸟站在远处，翅膀收得好好的。');
      } else {
        if (R() < p.a * 0.6) { dead.add(i); food += 2; out.push('它栽了一下，你扑上去，叼住了（算两口）。'); }
        else out.push('你追了一段，它离你一步远的时候忽然飞起来，绕回去了。窝在哪儿，你没看见。');
      }
    }
    out.push(`这个春天你吃了 ${food} 口。`);
    hist.push([sp, mine, food, pop.map(p => ({ ...p }))]);
    // 窝保住了的大鸟八成五回原地，窝被翻了的只三成回来；保住的窝生两只小鸟，跟爹妈一样的记号、差不多的脾气
    const olds = [];
    pop.forEach((p, i) => { if (!dead.has(i) && R() < (lost.has(i) ? 0.3 : 0.85)) olds.push({ ...p, seen: p.seen.slice(), isNew: false, back: true }); });
    const kids = [];
    pop.forEach((p, i) => {
      if (dead.has(i) || lost.has(i)) return;
      if (R() < 0.05 * p.d) return;
      for (let t = 0; t < 2; t++) {
        const dd = p.d + (R() < 0.25 ? R.choice([-1, 1]) : 0);
        kids.push({ m: p.m, d: Math.max(0, Math.min(5, dd)), a: r2(Math.max(0.05, Math.min(0.95, p.a + R.uniform(-0.08, 0.08)))), isNew: true, back: false, h: 0, seen: [] });
      }
    });
    R.shuffle(kids);
    pop = olds.concat(kids).slice(0, HH.CAP);
    while (pop.length < HH.FLOOR) { const q = R.choice(pop0); pop.push({ ...q, isNew: false, back: false, h: 0, seen: [] }); }
  }
  out.push(`—— ${HH.SPRINGS} 个春天过完了 ——`);
  out.push('回头看，每个春天沙滩上有哪几家、各几对，那个春天你对这一家是翻、跟还是走（翻空、跟丢的也算；没碰上的空着）：');
  for (const [sp, mine, food, p] of hist) {
    const f = hhFams(p); const row = [];
    for (const m of HH_MARKS) if (m in f) { const ys = mine.filter(x => x[0] === m).map(x => x[1]).join(''); row.push(`${m} ${f[m]}（${ys}）`); }
    const n0 = p.filter(q => hhDe(q) <= 1).length, n2 = p.filter(q => hhDe(q) >= 3).length, good = p.filter(q => q.a >= 0.6).length;
    out.push(`表｜第 ${sp} 个春天｜` + row.join('；') + `｜等你到跟前才站起来的 ${n0} 对、老远就扑腾的 ${n2} 对、装得像的 ${good} 对，你吃了 ${food} 口。`);
  }
  // 碰上过不止一回的大鸟：每回它在多远站起来、你对它做了什么
  const all = new Map();
  for (const [, , , p] of hist) for (const q of p) if (q.seen.length >= 2 && !q.isNew) all.set(q.m + '|' + q.seen[0][0], q);
  for (const [, , , p] of hist) for (const q of p) if (q.seen.length >= 2) { const key = q.m + '|' + q.seen[0][0]; const o = all.get(key); if (!o || o.seen.length < q.seen.length) all.set(key, q); }
  if (all.size) {
    out.push('你碰上过不止一回的那几只大鸟，每回它在多远站起来、你对它做了什么：');
    for (const q of all.values()) out.push(`表｜${q.m}的那只（第 ${q.seen[0][0]} 春头一回碰上）｜` + q.seen.map(([s, de, a]) => `第 ${s} 春 ${HH_FARW[de]}${a ? '（' + a + '）' : ''}`).join(' → '));
  }
  return { out, ask: false, done: true, sp: HH.SPRINGS };
}
if (typeof module !== 'undefined') module.exports = { hhRun, HH };
