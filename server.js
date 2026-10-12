'use strict';
/* =========================================================
   Interaktiv dars — server + Telegram bot
   Sozlamalar (Render → Environment):
     BOT_TOKEN         — @BotFather bergan token (majburiy)
     TEACHER_PASSWORD  — ustoz paroli (standart: 2026)
   ========================================================= */
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const { Server } = require('socket.io');
const { GAMES, ORDER, GROUPS, CASES, crossword } = require('./games');

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = (process.env.BOT_TOKEN || '').trim();
const TEACHER_PASSWORD = String(process.env.TEACHER_PASSWORD || '2026').trim();
const APP_URL = (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || '').trim().replace(/\/+$/, '');

const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 20000, pingTimeout: 30000 });

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));
app.get('/health', (req, res) => res.send('ok'));

/* ---------- yordamchilar ---------- */
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (n) => Array.from({ length: n }, (_, i) => i);
const clean = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);
const isTeacherName = (n) => /^(zaynab|зайнаб)(\s|$)/i.test(clean(n, 40));
const normWord = (s) => clean(s, 30).toLowerCase().replace(/[ʻʼ’‘`]/g, "'").replace(/[.,!?;:"«»()]+/g, '').trim();

/* ---------- xona holati ---------- */
const room = { phase: 'lobby', game: ORDER[0], players: {}, qs: [], qi: 0, qStart: 0, qTime: 20, answers: {}, act: null, cs: null, cloud: null };
let timer = null;
const clearTimer = () => { if (timer) clearTimeout(timer); timer = null; };
const onlineIds = () => Object.keys(room.players).filter((id) => room.players[id].online > 0);
const teacherOnline = () => { for (const s of io.sockets.sockets.values()) if (s.data.role === 'teacher') return true; return false; };

let pending = false;
function push() {
  if (pending) return; pending = true;
  setImmediate(() => {
    pending = false;
    for (const s of io.sockets.sockets.values()) if (s.data.role) s.emit('state', view(s));
  });
}

/* ---------- boshqaruv ---------- */
function startGame() {
  const g = GAMES[room.game]; if (!g) return;
  clearTimer();
  for (const id of Object.keys(room.players)) {
    if (!(room.players[id].online > 0)) { delete room.players[id]; continue; }
    room.players[id].score = 0; room.players[id].last = 0;
  }
  room.act = null; room.cs = null; room.cloud = null; room.answers = {};
  if (g.type === 'quiz') { room.qs = g.qs; room.qi = 0; return startQ(); }
  if (g.type === 'case') {
    const groups = {}; shuffle(onlineIds()).forEach((id, i) => { groups[id] = i % 3; });
    room.cs = { ci: 0, groups, ans: {}, winner: null, start: 0 }; return startCase();
  }
  if (g.type === 'cloud') { room.cloud = { pi: 0, ans: {} }; room.phase = 'cloud'; return push(); }
  startActivity(g); push();
}
function finish() { clearTimer(); room.phase = 'end'; push(); }
function toLobby() {
  clearTimer();
  room.phase = 'lobby'; room.answers = {}; room.act = null; room.cs = null; room.cloud = null;
  for (const id of Object.keys(room.players)) if (!(room.players[id].online > 0)) delete room.players[id];
  push();
}
function kick(pid) {
  if (!room.players[pid]) return;
  delete room.players[pid];
  for (const s of io.sockets.sockets.values()) if (s.data.pid === pid && s.data.role === 'student') { s.data.role = null; s.emit('kicked'); }
  push();
}

/* --- viktorina --- */
function startQ() {
  const q = room.qs[room.qi];
  room.phase = 'question'; room.qStart = Date.now(); room.qTime = q.t || 20; room.answers = {};
  clearTimer(); timer = setTimeout(reveal, room.qTime * 1000 + 600);
  push();
}
function answer(pid, qi, c) {
  if (room.phase !== 'question' || qi !== room.qi || room.answers[pid] || !room.players[pid]) return;
  const q = room.qs[room.qi]; c = Number(c);
  if (!(c >= 0 && c < q.opts.length)) return;
  const el = (Date.now() - room.qStart) / 1000;
  if (el > room.qTime + 1) return;
  const pts = c === q.a ? Math.max(500, Math.round(1000 - (el / room.qTime) * 500)) : 0;
  room.answers[pid] = { c, pts };
  const p = room.players[pid]; p.score += pts; p.last = pts;
  const on = onlineIds();
  if (on.length && on.every((id) => room.answers[id])) reveal(); else push();
}
function reveal() {
  if (room.phase !== 'question') return;
  clearTimer();
  for (const id in room.players) if (!room.answers[id]) room.players[id].last = 0;
  room.phase = 'reveal'; push();
}
function nextQ() { room.qi++; if (room.qi >= room.qs.length) finish(); else startQ(); }

/* --- individual o'yinlar --- */
function startActivity(g) {
  const a = { type: g.type, key: Date.now(), start: Date.now(), prog: {}, finished: 0 };
  if (g.type === 'cw') a.total = crossword().words.length;
  if (g.type === 'match') { a.left = shuffle(range(g.pairs.length)); a.perm = shuffle(range(g.pairs.length)); a.total = g.pairs.length; }
  if (g.type === 'sort') { a.order = shuffle(range(g.items.length)); a.total = g.items.length; }
  if (g.type === 'order') {
    a.shown = g.seqs.map((s) => { let sh; do sh = shuffle(range(s.items.length)); while (sh.every((v, i) => v === i)); return sh; });
    a.total = g.seqs.reduce((n, s) => n + s.items.length, 0);
  }
  room.act = a; room.phase = 'activity';
}
function prog(pid) {
  const a = room.act;
  return a.prog[pid] || (a.prog[pid] = { solved: 0, n: 0, done: false, mist: 0, found: [], matched: [], sorted: {}, order: {} });
}
function markDone(pid) {
  const a = room.act, pr = prog(pid); if (pr.done) return;
  pr.done = true; pr.rank = ++a.finished; pr.sec = Math.round((Date.now() - a.start) / 1000);
}
function scoreAct(pid) {
  const pr = prog(pid), p = room.players[pid]; if (!p) return;
  p.score = pr.solved * 100 + (pr.done ? Math.max(100, 600 - (pr.rank - 1) * 100) : 0);
}
const actOk = (type) => room.phase === 'activity' && room.act && room.act.type === type;

/* --- Ko'priklar va To'siqlar --- */
function assignGroup(pid) {
  const cnt = [0, 0, 0];
  for (const [id, g] of Object.entries(room.cs.groups)) if (room.players[id] && id !== pid) cnt[g]++;
  room.cs.groups[pid] = cnt.indexOf(Math.min(...cnt));
}
function startCase() { room.phase = 'case'; Object.assign(room.cs, { ans: {}, winner: null, start: Date.now() }); push(); }
function pickWinner(g) {
  if (room.phase !== 'case' || !(g >= 0 && g < 3)) return;
  const c = room.cs; c.winner = g;
  for (const [id, p] of Object.entries(room.players)) {
    const pts = c.groups[id] === g ? 1000 : (c.ans[id] ? 200 : 0);
    p.score += pts; p.last = pts;
  }
  room.phase = 'caseWin'; push();
}
function nextCase() { if (room.cs.ci + 1 >= CASES.length) finish(); else { room.cs.ci++; startCase(); } }

/* --- So'z buluti --- */
function nextCloud() {
  const g = GAMES[room.game];
  if (room.cloud.pi + 1 >= g.prompts.length) finish(); else { room.cloud.pi++; room.cloud.ans = {}; push(); }
}

/* ---------- har bir foydalanuvchi uchun ko'rinish ---------- */
function view(s) {
  const T = s.data.role === 'teacher', pid = s.data.pid, g = GAMES[room.game];
  const v = {
    phase: room.phase, role: s.data.role, me: T ? null : pid, game: room.game,
    gi: { title: g.title, icon: g.icon, type: g.type }, teacher: teacherOnline(),
    players: Object.entries(room.players).map(([id, p]) => ({ id, name: p.name, score: p.score, last: p.last, on: p.online > 0 })),
  };
  if (T) v.catalog = ORDER.map((k) => ({ k, title: GAMES[k].title, icon: GAMES[k].icon, type: GAMES[k].type, desc: GAMES[k].desc }));
  if (room.phase === 'question' || room.phase === 'reveal') {
    const q = room.qs[room.qi], rev = room.phase === 'reveal';
    v.q = { i: room.qi, n: room.qs.length, q: q.q, opts: q.opts, t: room.qTime, left: Math.max(0, room.qStart + room.qTime * 1000 - Date.now()) };
    v.answered = Object.keys(room.answers).length;
    if (rev) { v.q.a = q.a; v.counts = q.opts.map((_, i) => Object.values(room.answers).filter((x) => x.c === i).length); }
    if (pid && room.answers[pid]) v.my = rev ? room.answers[pid] : { c: room.answers[pid].c };
  }
  if (room.phase === 'activity' && room.act) v.act = actView(T, pid);
  if ((room.phase === 'case' || room.phase === 'caseWin') && room.cs) v.cs = caseView(T, pid);
  if (room.phase === 'cloud' && room.cloud) v.cloud = cloudView(pid);
  return v;
}
function actView(T, pid) {
  const a = room.act, g = GAMES[room.game];
  const v = { type: a.type, key: a.key, total: a.total, finished: a.finished };
  if (a.type === 'cw') { v.pub = crossword().pub; if (T) v.sol = crossword().sol; }
  if (a.type === 'match') {
    v.pub = { left: a.left.map((i) => ({ id: i, t: g.pairs[i][0] })), right: a.perm.map((pi, j) => ({ id: j, t: g.pairs[pi][1] })) };
    if (T) v.sol = g.pairs;
  }
  if (a.type === 'sort') { v.pub = { buckets: g.buckets, items: a.order.map((i) => g.items[i].t) }; if (T) v.sol = { buckets: g.buckets, items: g.items }; }
  if (a.type === 'order') { v.pub = { seqs: g.seqs.map((s, si) => ({ title: s.title, items: a.shown[si].map((i) => s.items[i]) })) }; if (T) v.sol = g.seqs; }
  if (T) v.prog = Object.fromEntries(Object.entries(a.prog).map(([id, p]) => [id, { solved: p.solved, n: p.n, done: p.done, rank: p.rank, sec: p.sec }]));
  if (pid && a.prog[pid]) {
    const p = a.prog[pid];
    v.mine = { solved: p.solved, n: p.n, done: p.done, rank: p.rank, sec: p.sec, mist: p.mist, matched: p.matched, sorted: p.sorted, order: p.order,
      found: a.type === 'cw' ? p.found.map((wi) => [wi, crossword().words[wi].w]) : [] };
  }
  return v;
}
function caseView(T, pid) {
  const c = room.cs, rev = room.phase === 'caseWin', ans = {};
  for (const [id, x] of Object.entries(c.ans)) {
    ans[id] = (T || id === pid || (rev && c.groups[id] === c.winner)) ? x : { hidden: true, sec: x.sec };
  }
  return { ci: c.ci, n: CASES.length, text: CASES[c.ci], groups: c.groups, ans, winner: c.winner, G: GROUPS };
}
function cloudView(pid) {
  const c = room.cloud, g = GAMES[room.game], counts = {};
  for (const w of Object.values(c.ans)) counts[w] = (counts[w] || 0) + 1;
  return { pi: c.pi, n: g.prompts.length, prompt: g.prompts[c.pi], total: Object.keys(c.ans).length,
    words: Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 60), mine: pid ? (c.ans[pid] || null) : null };
}

/* ---------- ulanishlar ---------- */
function leave(socket) {
  if (socket.data.role === 'student') {
    const p = room.players[socket.data.pid];
    if (p) { p.online = Math.max(0, p.online - 1); if (p.online === 0 && room.phase === 'lobby') delete room.players[socket.data.pid]; }
  }
  socket.data.role = null;
}

io.on('connection', (socket) => {
  socket.data.fails = 0;
  const fnAck = (ack) => (typeof ack === 'function' ? ack : () => {});
  const T = (ev, fn) => socket.on(ev, (d, ack) => {
    if (socket.data.role !== 'teacher') return;
    try { fn(d || {}, fnAck(ack)); } catch (e) { console.error(ev, e); }
  });
  const P = (ev, fn) => socket.on(ev, (d, ack) => {
    const pid = socket.data.pid;
    if (socket.data.role !== 'student' || !room.players[pid]) return fnAck(ack)({ ok: false });
    try { fn(pid, d || {}, fnAck(ack)); } catch (e) { console.error(ev, e); }
  });

  socket.on('login', (d, ack) => {
    ack = fnAck(ack); d = d || {};
    const name = clean(d.name, 24);
    if (!name) return ack({ ok: false, err: 'Ismingizni yozing' });
    if (isTeacherName(name) && !d.asStudent) {
      if (socket.data.fails >= 8) return ack({ ok: false, err: "Juda ko'p urinish. Ilovani qayta oching." });
      if (String(d.pass || '').trim() !== TEACHER_PASSWORD) {
        if (d.pass) socket.data.fails++;
        return ack({ ok: false, needPass: true, err: d.pass ? "Parol noto'g'ri" : 'Parolni kiriting' });
      }
      leave(socket);
      socket.data.role = 'teacher'; socket.data.pid = null;
      ack({ ok: true, role: 'teacher' }); return push();
    }
    leave(socket);
    const id = clean(d.id, 64) || socket.id;
    socket.data.role = 'student'; socket.data.pid = id;
    const p = room.players[id] || (room.players[id] = { name, score: 0, last: 0, online: 0 });
    p.name = name; p.online++;
    if (room.cs && (room.phase === 'case' || room.phase === 'caseWin') && room.cs.groups[id] === undefined) assignGroup(id);
    ack({ ok: true, role: 'student', id }); push();
  });
  socket.on('disconnect', () => { leave(socket); push(); });

  /* ustoz */
  T('pick', (d) => { if (room.phase === 'lobby' && GAMES[d.game]) { room.game = d.game; push(); } });
  T('start', () => { if (onlineIds().length) startGame(); });
  T('reveal', () => reveal());
  T('next', () => {
    if (room.phase === 'reveal') nextQ();
    else if (room.phase === 'caseWin') nextCase();
    else if (room.phase === 'cloud') nextCloud();
  });
  T('winner', (d) => pickWinner(Number(d.g)));
  T('end', () => finish());
  T('lobby', () => toLobby());
  T('kick', (d) => kick(String(d.pid || '')));

  /* talaba */
  P('answer', (pid, d) => answer(pid, Number(d.qi), d.c));

  P('cw', (pid, d, ack) => {
    if (!actOk('cw')) return ack({ ok: false });
    const a = room.act, wi = Number(d.wi), w = crossword().words[wi];
    if (!w) return ack({ ok: false });
    const pr = prog(pid), ok = clean(d.letters, 30).toUpperCase() === w.w;
    if (ok && !pr.found.includes(wi)) { pr.found.push(wi); pr.solved++; pr.n++; if (pr.solved >= a.total) markDone(pid); }
    else if (!ok) pr.mist++;
    scoreAct(pid); push();
    ack({ ok, solved: pr.solved, done: pr.done, rank: pr.rank });
  });

  P('match', (pid, d, ack) => {
    if (!actOk('match')) return ack({ ok: false });
    const a = room.act, l = Number(d.l), r = Number(d.r), pr = prog(pid);
    if (!(r >= 0 && r < a.perm.length) || pr.matched.some((m) => m[0] === l || m[1] === r)) return ack({ ok: false, dup: true });
    const ok = a.perm[r] === l;
    if (ok) { pr.matched.push([l, r]); pr.solved++; pr.n++; if (pr.solved >= a.total) markDone(pid); } else pr.mist++;
    scoreAct(pid); push();
    ack({ ok, solved: pr.solved, done: pr.done, rank: pr.rank });
  });

  P('sort', (pid, d, ack) => {
    if (!actOk('sort')) return ack({ ok: false });
    const a = room.act, g = GAMES[room.game], k = Number(d.k), b = Number(d.b), pr = prog(pid);
    if (!(k >= 0 && k < a.order.length) || pr.sorted[k]) return ack({ ok: false, dup: true });
    const item = g.items[a.order[k]], ok = item.b === b;
    pr.sorted[k] = { b, ok }; pr.n++; if (ok) pr.solved++; else pr.mist++;
    if (pr.n >= a.total) markDone(pid);
    scoreAct(pid); push();
    ack({ ok, correct: item.b, solved: pr.solved, done: pr.done, rank: pr.rank });
  });

  P('order', (pid, d, ack) => {
    if (!actOk('order')) return ack({ ok: false });
    const a = room.act, g = GAMES[room.game], si = Number(d.si), s = g.seqs[si], pr = prog(pid);
    if (!s) return ack({ ok: false });
    if (pr.order[si]) return ack({ ok: true, ...pr.order[si], solved: pr.solved, done: pr.done, rank: pr.rank });
    const sh = a.shown[si], ids = Array.isArray(d.ids) ? d.ids.map(Number) : [];
    if (ids.length !== sh.length || new Set(ids).size !== sh.length || ids.some((k) => !(k >= 0 && k < sh.length))) return ack({ ok: false });
    const res = ids.map((k, pos) => sh[k] === pos);
    const correct = range(sh.length).map((pos) => sh.indexOf(pos));
    const good = res.filter(Boolean).length;
    pr.order[si] = { ids, res, correct }; pr.solved += good; pr.mist += sh.length - good; pr.n += sh.length;
    if (g.seqs.every((_, i) => pr.order[i])) markDone(pid);
    scoreAct(pid); push();
    ack({ ok: true, ids, res, correct, solved: pr.solved, done: pr.done, rank: pr.rank });
  });

  P('case', (pid, d, ack) => {
    if (room.phase !== 'case' || !room.cs || room.cs.ans[pid]) return ack({ ok: false });
    const text = clean(d.text, 800); if (!text) return ack({ ok: false });
    if (room.cs.groups[pid] === undefined) assignGroup(pid);
    room.cs.ans[pid] = { text, sec: Math.round((Date.now() - room.cs.start) / 1000) };
    push(); ack({ ok: true });
  });

  P('cloud', (pid, d, ack) => {
    if (room.phase !== 'cloud' || !room.cloud || room.cloud.ans[pid]) return ack({ ok: false });
    const w = normWord(d.text); if (!w) return ack({ ok: false });
    room.cloud.ans[pid] = w;
    const p = room.players[pid]; p.score += 100; p.last = 100;
    push(); ack({ ok: true, word: w });
  });
});

/* ---------- Telegram bot (webhook) ---------- */
const SECRET = crypto.createHash('sha256').update('zd:' + BOT_TOKEN).digest('hex').slice(0, 40);
async function tgApi(method, body) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}),
    });
    const j = await r.json();
    if (!j.ok) console.error('[bot]', method, j.description);
    return j;
  } catch (e) { console.error('[bot]', method, e.message); }
}
const WELCOME = "Assalomu alaykum! 👋\n\nBu — Zaynab Jabbiyevaning interaktiv dars boti.\n\nDarsga qo'shilish uchun pastdagi «📚 Darsga kirish» tugmasini bosing va ismingizni yozing.";

if (BOT_TOKEN) {
  app.post('/tg/' + SECRET, express.json(), (req, res) => {
    res.sendStatus(200);
    if (req.get('x-telegram-bot-api-secret-token') !== SECRET) return;
    const m = req.body && req.body.message;
    if (!m || !m.chat || m.chat.type !== 'private') return;
    tgApi('sendMessage', { chat_id: m.chat.id, text: WELCOME,
      reply_markup: { inline_keyboard: [[{ text: '📚 Darsga kirish', web_app: { url: APP_URL } }]] } });
  });
}

server.listen(PORT, async () => {
  console.log(`Server ishlayapti: port ${PORT}`);
  if (!BOT_TOKEN) return console.log("BOT_TOKEN kiritilmagan — faqat sayt rejimi (bot ulanmagan).");
  if (!/^https:\/\//.test(APP_URL)) return console.log("APP_URL (https) topilmadi — bot ulanmadi. Render'da bu avtomatik bo'ladi.");
  const r = await tgApi('setWebhook', { url: `${APP_URL}/tg/${SECRET}`, secret_token: SECRET, allowed_updates: ['message'] });
  if (!r || !r.ok) return console.log("❌ Bot ulanmadi. BOT_TOKEN to'g'ri kiritilganini tekshiring.");
  await tgApi('setChatMenuButton', { menu_button: { type: 'web_app', text: '📚 Darsga kirish', web_app: { url: APP_URL } } });
  await tgApi('setMyCommands', { commands: [{ command: 'start', description: 'Darsga kirish' }] });
  console.log(`Telegram bot ulandi ✅  ${APP_URL}`);
});
