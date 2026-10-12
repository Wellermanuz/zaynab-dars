'use strict';
/* =========================================================
   O'YINLAR VA SAVOLLAR
   Savollarni o'zgartirish yoki qo'shish uchun shu faylni tahrirlang.
   =========================================================
   a — to'g'ri javob raqami: 0 = A, 1 = B, 2 = C, 3 = D
   t — savol uchun vaqt (soniya)
*/

const TEST = [
  { q: "Ijtimoiy moslashuv (adaptatsiya) nima?", opts: ["Shaxsning biologik o'sishi va rivojlanishi", "Insonning yangi ijtimoiy muhitga, shart-sharoitlarga ko'nikishi va moslashishi", "Faqat fanlarni o'zlashtirish darajasi", "Ota-onaning kasbiy faoliyati"], a: 1 },
  { q: "Bolaning hayotidagi ilk ijtimoiy institut va tarbiya o'chog'i nima deb ataladi?", opts: ["Maktab", "Bog'cha", "Oila", "Mahalla"], a: 2 },
  { q: "Bolaning ijtimoiy moslashuvida ota-onaning qaysi tarbiya uslubi eng maqbul hisoblanadi?", opts: ["Avtoritar (qattiqqo'l)", "Demokratik (o'zaro hurmat va qo'llab-quvvatlash)", "Gipoopeka (e'tiborsizlik)", "Giperopeka (haddan tashqari erkalatish)"], a: 1 },
  { q: "Ta'lim muassasasida o'quvchining yangi muhitga moslashishida asosiy ko'prik vazifasini bajaruvchi shaxs kim?", opts: ["Direktor", "Maktab qo'riqchisi", "Pedagog (o'qituvchi)", "Kutubxonachi"], a: 2 },
  { q: "Haddan tashqari qattiqqo'l yoki g'amxo'r oilada voyaga yetayotgan bolalarda ko'pincha qanday holat kuzatiladi?", opts: ["Jamoada tez yetakchi bo'lish", "Ijtimoiy qo'rquv va mustaqil qaror qabul qilolmaslik", "Barcha fanlarni a'lo bahoga o'qish", "Boshqalar bilan muloqotga juda tez kirishish"], a: 1 },
  { q: "Pedagogning har bir o'quvchining temperamenti va xarakterini inobatga olib yondashishi qanday ataladi?", opts: ["Frontal yondashuv", "Individual yondashuv", "Umumiy talab", "Majburiy ta'sir"], a: 1 },
  { q: "Oila va maktab hamkorligining buzilishi bolada qanday salbiy oqibatni keltirib chiqarishi mumkin?", opts: ["Yuqori o'zlashtirish", "Stress, ikkilanish va moslashishning qiyinlashishi", "Jismoniy baquvvat bo'lish", "Mustaqillikning oshishi"], a: 1 },
  { q: "Bolaning tengdoshlari bilan muloqotga kirishishida quyidagilardan qaysi biri eng muhim omil hisoblanadi?", opts: ["Oila va maktab tomonidan yaratilgan do'stona muhit", "Maktabning joylashgan o'rni", "Darsliklarning rangi", "Sinf xonasining kattaligi"], a: 0 },
  { q: "Moslashuv davrida o'quvchida uchraydigan xavotirlik, chekinish yoki agressiya belgilarini kim birinchi bo'lib aniqlashi va oldini olishi kerak?", opts: ["Faqat o'quvchining o'zi", "Faqat sinfdoshlari", "Pedagog va ota-ona hamkorlikda", "Maktab ta'minot bo'limi"], a: 2 },
  { q: "Ota-onalar majlislari va ochiq muloqotlarning asosiy vazifasi nimadan iborat?", opts: ["O'quvchilarni jazolash usullarini muhokama qilish", "Oila va ta'lim muassasasi o'rtasidagi aloqani mustahkamlash", "Faqat moliyaviy masalalarni hal etish", "O'qituvchilarning ish vaqtini belgilash"], a: 1 },
  { q: "Bolada o'ziga bo'lgan ishonch va psixologik xavfsizlik tuyg'usi dastlab qayerda shakllanadi?", opts: ["Ko'chada", "Oila bag'rida", "Televizor qarshisida", "Do'konda"], a: 1 },
  { q: "Agar ota-ona maktab talablarini doimiy ravishda kamsitib, o'qituvchining obro'siga putur yetkaza boshlasa, bolaning moslashuviga qanday ta'sir qiladi?", opts: ["Bola o'qituvchini hurmat qilmay qo'yadi va moslashuvi buziladi", "Bola yanada aqlli bo'ladi", "Hech qanday ta'sir qilmaydi", "Bola o'qishni tezroq tugatishni xohlaydi"], a: 0 },
  { q: "Pedagogning sinfda sog'lom raqobat va do'stona muhit yaratishi nimaga xizmat qiladi?", opts: ["Bolalarning o'zaro nizo chiqarishiga", "Bolalarning jamoaga tez va og'riqsiz singib ketishiga", "O'qituvchining dars o'tishini qiyinlashtirishga", "Dars vaqtini qisqartirishga"], a: 1 },
  { q: "Ijtimoiy moslashuv jarayoni asosan qaysi yosh davrlarida eng faol kechadi?", opts: ["Faqat keksayganda", "Bolalik va o'smirlik davrida", "Faqat pensiya yoshida", "Faqat talabalikdan keyin"], a: 1 },
  { q: "Ota-ona va pedagog hamkorligining samaradorligi nimada namoyon bo'ladi?", opts: ["Bolaning jamiyatda o'z o'rnini topishi, o'qishga qiziqishi va ruhiy xotirjamligida", "Faqat yuqori baholar olishida", "Ota-onaning maktabga kamroq borishida", "O'qituvchining vazifasi kamayishida"], a: 0 },
].map(q => ({ ...q, t: 30 }));

const TF_OPTS = ["To'g'ri", "Noto'g'ri"];
const TF = [
  { q: "Oila — bolaning ilk ijtimoiy instituti va tarbiya o'chog'i.", a: 0 },
  { q: "Avtoritar (qattiqqo'l) tarbiya uslubi bolaning mustaqilligini eng yaxshi rivojlantiradi.", a: 1 },
  { q: "Pedagog va ota-ona hamkorligi bolaning yangi muhitga moslashishini yengillashtiradi.", a: 0 },
  { q: "Giperopeka — bolani haddan tashqari erkalatish va ortiqcha nazorat qilish.", a: 0 },
  { q: "Moslashuv davridagi xavotirlik belgilarini faqat bolaning o'zi yengishi kerak.", a: 1 },
  { q: "Individual yondashuv har bir bolaning temperamenti va xarakterini hisobga oladi.", a: 0 },
  { q: "Ota-ona o'qituvchining obro'sini kamsitsa, bu bolaning moslashuviga ta'sir qilmaydi.", a: 1 },
  { q: "Ijtimoiy moslashuv bolalik va o'smirlik davrida eng faol kechadi.", a: 0 },
].map(q => ({ ...q, opts: TF_OPTS, t: 20 }));

/* ---- Ko'priklar va To'siqlar ---- */
const GROUPS = [
  { n: "Ota-onalar", i: "👨‍👩‍👧", c: "#E5484D", task: "O'z xatolaringizni tan oling va bolaning moslashishi uchun uyda qanday o'zgarishlar qilishingizni ayting (masalan: kechqurun daldalash, birga o'yin o'ynash)." },
  { n: "Pedagoglar", i: "👩‍🏫", c: "#2F7CF6", task: "Bolani sinf/guruh jamoasiga qanday jalb qilish rejasini tuzing (masalan: guruhli o'yinlarga qo'shish, kichik muvaffaqiyatlarini maqtash)." },
  { n: "Ekspertlar (Psixologlar)", i: "🧠", c: "#1F9D55", task: "Oila va ta'lim muassasasi hamkorligini mustahkamlash uchun aniq tavsiyalar bering." },
];
const CASES = [
  "1-sinfga kelgan Aziz ismli bola hech kim bilan gaplashmayapti, tanaffusda bir chetda o'tirmoqda. Uyda esa ota-onasi uning faqat baholari bilan qiziqib, boshqa muammolariga vaqt ajratmayapti.",
  "Bog'chaga yangi kelgan 4 yoshli Madina har kuni ertalab onasidan ajralayotganda yig'laydi, guruhda o'yinchoqlarini hech kim bilan bo'lishmaydi. Ota-onasi esa «o'zi o'rganib ketadi» deb tarbiyachi bilan gaplashmaydi.",
  "5 yoshli Sardor uyda haddan tashqari erkalatiladi — hamma ishini buvisi qiladi. Bog'chada u o'zi kiyina olmaydi, tengdoshlari bilan tez-tez janjallashadi va tarbiyachining gapiga quloq solmaydi.",
];

const GAMES = {
  test: { type: 'quiz', title: "Test: Ijtimoiy moslashuv", icon: "📝", desc: "15 ta savol · 30 soniyadan", qs: TEST },
  kopriklar: { type: 'case', title: "Ko'priklar va To'siqlar", icon: "🌉", desc: "3 guruh · hayotiy keyslar" },
  krossvord: { type: 'cw', title: "Krossvord: Moslashuv", icon: "🧩", desc: "10 ta atama", words: [
    { w: "MOSLASHUV", c: "Insonning yangi ijtimoiy muhitga ko'nikish jarayoni" },
    { w: "HAMKORLIK", c: "Oila va ta'lim muassasasining birgalikdagi faoliyati" },
    { w: "DEMOKRATIK", c: "O'zaro hurmatga asoslangan eng maqbul tarbiya uslubi" },
    { w: "INDIVIDUAL", c: "Har bir bolaning xarakterini hisobga oluvchi ... yondashuv" },
    { w: "PSIXOLOG", c: "Bolaning ruhiy holatini o'rganuvchi mutaxassis" },
    { w: "PEDAGOG", c: "Bola uchun yangi muhitga «ko'prik» bo'luvchi shaxs" },
    { w: "TARBIYA", c: "Bolani har tomonlama shakllantirish jarayoni" },
    { w: "STRESS", c: "Hamkorlik buzilganda bolada yuzaga keladigan ruhiy zo'riqish" },
    { w: "MAJLIS", c: "Ota-onalar ... — oila va muassasa aloqasini mustahkamlaydi" },
    { w: "OILA", c: "Bolaning ilk ijtimoiy instituti va tarbiya o'chog'i" }] },
  juftlik: { type: 'match', title: "Atamani ta'rifga moslang", icon: "🔗", desc: "6 ta juftlik", pairs: [
    ["Ijtimoiy moslashuv", "Yangi muhitga ko'nikish va moslashish"],
    ["Oila", "Bolaning ilk ijtimoiy instituti"],
    ["Demokratik uslub", "O'zaro hurmat va qo'llab-quvvatlash"],
    ["Avtoritar uslub", "Qattiqqo'l, buyruqqa asoslangan tarbiya"],
    ["Giperopeka", "Haddan tashqari erkalatish va nazorat"],
    ["Individual yondashuv", "Har bir bolaning xarakteriga mos yondashish"]] },
  vazifa: { type: 'sort', title: "Kimning vazifasi?", icon: "⚖️", desc: "Ota-ona yoki pedagog · 8 ta",
    buckets: [{ t: "Ota-ona", i: "👨‍👩‍👧" }, { t: "Pedagog", i: "👩‍🏫" }],
    items: [
      { t: "Kechqurun bolani daldalash va kuni haqida so'rash", b: 0 },
      { t: "Bolani guruhli o'yinlarga jalb qilish", b: 1 },
      { t: "Uyda xotirjam va iliq muhit yaratish", b: 0 },
      { t: "Kichik yutuqlarini guruh oldida maqtash", b: 1 },
      { t: "Bola bilan birga o'yin o'ynash", b: 0 },
      { t: "Har bir bolaga individual yondashish", b: 1 },
      { t: "Bola oldida tarbiyachi obro'sini hurmat qilish", b: 0 },
      { t: "Ota-onalar majlisini tashkil etish", b: 1 }] },
  tartib: { type: 'order', title: "Ketma-ketlikni tiklang", icon: "🔢", desc: "2 ta jarayon · to'g'ri tartib", seqs: [
    { title: "Bolaning bog'chaga bosqichma-bosqich moslashuvi", items: [
      "Ota-ona bilan dastlabki suhbat va tanishuv",
      "Bola ota-onasi bilan guruhga qisqa tashrif buyuradi",
      "Bola guruhda 1–2 soat ota-onasiz qoladi",
      "Bola nonushta va sayrda qatnashadi (yarim kun)",
      "Bola kunduzgi uyquda qoladi — to'liq kun"] },
    { title: "Moslashuvda muammo sezilganda pedagogning harakatlari", items: [
      "Bolani kuzatish va muammoni aniqlash",
      "Ota-ona bilan suhbatlashish",
      "Psixolog bilan maslahatlashish",
      "Birgalikdagi yordam rejasini tuzish",
      "Natijani kuzatib borish va rejani tuzatish"] }] },
  tf: { type: 'quiz', title: "To'g'ri yoki noto'g'ri", icon: "✅", desc: "8 ta fikr · 20 soniyadan", qs: TF },
  bulut: { type: 'cloud', title: "So'z buluti", icon: "☁️", desc: "Fikrlar · 2 ta savol", prompts: [
    "Bolaning yangi muhitga moslashishi uchun eng muhim narsa nima? (1–2 so'z)",
    "Yaxshi pedagog qanday bo'lishi kerak? (1–2 so'z)"] },
};
// Ustoz panelidagi tartib
const ORDER = ['test', 'kopriklar', 'krossvord', 'juftlik', 'vazifa', 'tartib', 'tf', 'bulut'];

/* ---------- Krossvord generatori ---------- */
function build1(items, firstDir) {
  const cells = new Map(); const placed = [];
  const K = (r, c) => r + ',' + c, get = (r, c) => cells.get(K(r, c));
  const bbox = () => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (const k of cells.keys()) { const [r, cc] = k.split(',').map(Number); a = Math.min(a, r); b = Math.max(b, r); c = Math.min(c, cc); d = Math.max(d, cc); } return [a, b, c, d]; };
  function check(w, r, c, dir) {
    const dr = dir === 'd' ? 1 : 0, dc = dir === 'a' ? 1 : 0;
    if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
    let inter = 0;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, cell = get(rr, cc);
      if (cell) { if (cell.ch !== w[i] || cell[dir]) return -1; inter++; }
      else if (dir === 'a' ? (get(rr - 1, cc) || get(rr + 1, cc)) : (get(rr, cc - 1) || get(rr, cc + 1))) return -1;
    }
    return inter;
  }
  function put(it, r, c, dir) {
    const dr = dir === 'd' ? 1 : 0, dc = dir === 'a' ? 1 : 0;
    for (let i = 0; i < it.w.length; i++) { const k = K(r + dr * i, c + dc * i); const cell = cells.get(k) || { ch: it.w[i] }; cell[dir] = true; cells.set(k, cell); }
    placed.push({ w: it.w, c: it.c, r, col: c, dir });
  }
  put(items[0], 0, 0, firstDir);
  let rest = items.slice(1);
  for (let pass = 0; pass < 3 && rest.length; pass++) {
    const left = [];
    for (const it of rest) {
      let best = null; const [r0, r1, c0, c1] = bbox();
      for (const [k, cell] of cells) {
        const [cr, cc] = k.split(',').map(Number);
        for (let i = 0; i < it.w.length; i++) {
          if (it.w[i] !== cell.ch) continue;
          for (const dir of ['a', 'd']) {
            if (cell[dir]) continue;
            const r = dir === 'd' ? cr - i : cr, c = dir === 'a' ? cc - i : cc;
            const inter = check(it.w, r, c, dir); if (inter < 1) continue;
            const er = dir === 'd' ? r + it.w.length - 1 : r, ec = dir === 'a' ? c + it.w.length - 1 : c;
            const h = Math.max(r1, er) - Math.min(r0, r) + 1, wd = Math.max(c1, ec) - Math.min(c0, c) + 1;
            const score = inter * 60 - Math.max(h, wd) * 12 - h * wd * 0.4 - Math.max(0, wd - 13) * 80;
            if (!best || score > best.score) best = { r, c, dir, score };
          }
        }
      }
      if (best) put(it, best.r, best.c, best.dir); else left.push(it);
    }
    rest = left;
  }
  const [r0, r1, c0, c1] = bbox();
  const rows = r1 - r0 + 1, cols = c1 - c0 + 1;
  const letters = {};
  for (const [k, cell] of cells) { const [r, c] = k.split(',').map(Number); letters[(r - r0) + ',' + (c - c0)] = cell.ch; }
  placed.forEach(p => { p.r -= r0; p.col -= c0; });
  placed.sort((a, b) => a.r - b.r || a.col - b.col);
  const nums = {}; let n = 0;
  placed.forEach(p => {
    const sk = K(p.r, p.col); if (!nums[sk]) nums[sk] = ++n; p.n = nums[sk];
    p.cells = []; for (let i = 0; i < p.w.length; i++) p.cells.push(p.dir === 'a' ? K(p.r, p.col + i) : K(p.r + i, p.col));
  });
  return { rows, cols, letters, words: placed, nums };
}
function buildCW(list) {
  const base = list.slice().sort((a, b) => b.w.length - a.w.length);
  let best = null;
  for (let s = 0; s < base.length; s++) for (const fd of ['a', 'd']) {
    const order = [base[s], ...base.filter((_, i) => i !== s)];
    const cw = build1(order, fd);
    const sc = (cw.words.length === list.length ? 0 : 1e6) + Math.max(cw.rows, cw.cols) * 100 + cw.cols * 10 + cw.rows * cw.cols / 10;
    if (!best || sc < best.sc) best = { sc, cw };
  }
  return best.cw;
}
let CW = null;
function crossword() {
  if (CW) return CW;
  const b = buildCW(GAMES.krossvord.words);
  CW = {
    words: b.words,
    pub: { rows: b.rows, cols: b.cols, cells: Object.keys(b.letters), nums: b.nums,
      words: b.words.map(w => ({ n: w.n, dir: w.dir, c: w.c, len: w.w.length, cells: w.cells })) },
    sol: { letters: b.letters, words: b.words.map(w => w.w) },
  };
  return CW;
}

module.exports = { GAMES, ORDER, GROUPS, CASES, crossword };
