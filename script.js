const $ = s => document.querySelector(s), app = $('#app');
const DB = {}, INDEX = [];
let hl = '';
const esc = t => t.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const norm = s => [...s].map(c => { const b = c.normalize('NFD')[0].toLowerCase(); return b === 'đ' ? 'd' : b; }).join('');
const drive = id => `https://drive.google.com/file/d/${id}/view`;
const HEAD = /^\s*(\d+\.\d+(\.\d+)?)\.?\s+([^\d\s.].{2,90})$/;

async function xml(url) {
  const r = await fetch(url); if (!r.ok) throw new Error(url);
  return new DOMParser().parseFromString(await r.text(), 'application/xml');
}
async function loadIndex() {
  const d = await xml('data/monhoc.xml');
  [...d.querySelectorAll('mon')].forEach(m => INDEX.push({ id: m.getAttribute('id'), ten: m.getAttribute('ten'), nhom: m.getAttribute('nhom'),
    drive: m.getAttribute('drive'), sochuong: +m.getAttribute('sochuong'), mota: m.querySelector('mota').textContent }));
}
async function loadSubject(id) {
  if (DB[id]) return DB[id];
  const d = await xml(`data/${id}.xml`), m = d.querySelector('mon'), meta = INDEX.find(x => x.id === id);
  const bai = [...m.querySelectorAll('baihoc')].map(b => ({ stt: +b.getAttribute('stt'), tieude: b.getAttribute('tieude'), nd: b.textContent,
    pdf: b.getAttribute('pdf'), trang: b.getAttribute('trang'), den: b.getAttribute('den'), bt: [] }));
  [...m.querySelectorAll('baitap')].forEach(t => bai[+t.getAttribute('bai') - 1].bt.push({ de: t.getAttribute('de'), da: t.getAttribute('dapan'), loai: t.getAttribute('loai') }));
  return DB[id] = { ...meta, nguon: m.getAttribute('nguon'), bai };
}

function home() {
  const groups = [...new Set(INDEX.map(m => m.nhom))];
  app.innerHTML = groups.map(g => `<h2>${g}</h2><div class="grid">` + INDEX.filter(m => m.nhom === g).map(m =>
    `<a class="card" href="#/mon/${m.id}"><span class="tag">${g}</span><h3>${m.ten}</h3><div class="muted">${m.sochuong} bài học · có bài tập từng bài</div></a>`).join('') + '</div>').join('');
}

async function subject(id, n) {
  const m = await loadSubject(id);
  if (!n) {
    app.innerHTML = `<a class="back" href="#/">← Tất cả môn học</a><div class="box"><h2>${m.ten}</h2><p>${m.mota}</p>
      <a href="${drive(m.drive)}" target="_blank" rel="noopener">Tài liệu gốc (Google Drive)</a></div><h3>Danh sách bài học (${m.bai.length})</h3><div class="grid">` +
      m.bai.map(b => `<a class="card" href="#/mon/${id}/${b.stt}"><h4>${b.tieude}</h4><div class="muted">${b.bt.length} bài tập</div></a>`).join('') + '</div>';
    return scrollTo(0, 0);
  }
  const b = m.bai[n - 1]; if (!b) return subject(id);
  const side = `<div class="box side"><a href="#/mon/${id}"><b>${m.ten}</b></a>` + m.bai.map(x => `<a class="${x.stt == n ? 'on' : ''}" href="#/mon/${id}/${x.stt}">${x.tieude}</a>`).join('') + '</div>';
  const hs = [], body = b.nd.split('\n').map((l, i) => { if (HEAD.test(l) && !l.includes('....')) { hs.push([i, l.trim()]); return `<h4 id="h${i}">${esc(l.trim())}</h4>`; } return esc(l); }).join('\n');
  let content;
  if (b.pdf) content = `<p class="muted">File PDF gốc của môn này bị lỗi font tiếng Việt nên không trích chữ được; bài học được hiển thị trực tiếp từ PDF (trang ${b.trang}–${b.den}).</p><iframe src="${b.pdf}#page=${b.trang}"></iframe>`;
  else content = (hs.length ? `<details><summary>Mục lục bài học (${hs.length} mục)</summary>${hs.map(h => `<a href="javascript:document.getElementById('h${h[0]}').scrollIntoView()">${esc(h[1])}</a>`).join('')}</details>` : '') + `<pre class="txt">${body}</pre>`;
  const ex = b.bt.length ? `<div class="box"><h3>Bài tập (${b.bt.length})</h3>` + b.bt.map((t, i) => `<div style="margin:12px 0"><span class="tag">${t.loai == 'goc' ? 'Bài tập trong bài giảng' : 'Câu hỏi tự luyện'} ${i + 1}</span><p style="margin:4px 0">${esc(t.de)}</p>
    <button onclick="this.nextElementSibling.style.display='block'">Xem gợi ý</button><div class="ans">${esc(t.da)}</div></div>`).join('') + '</div>' : '';
  const prev = m.bai[n - 2], next = m.bai[n];
  app.innerHTML = `<a class="back" href="#/">← Tất cả môn học</a><div class="layout">${side}<div><div class="box"><h2>${b.tieude}</h2>${content}</div>${ex}
    <div class="nav">${prev ? `<a class="btn" href="#/mon/${id}/${prev.stt}">← ${prev.tieude}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/mon/${id}/${next.stt}">${next.tieude} →</a>` : ''}</div></div></div>`;
  if (hl) { const nb = norm(hl), pre = $('.txt'); if (pre) markIn(pre, nb); const f = $('mark'); f ? f.scrollIntoView({ block: 'center' }) : scrollTo(0, 0); } else scrollTo(0, 0);
  hl = '';
}
function markIn(root, nb) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => { const nt = norm(n.nodeValue); let i = nt.indexOf(nb); if (i < 0) return; const fr = document.createDocumentFragment(); let last = 0;
    while (i >= 0) { fr.append(n.nodeValue.slice(last, i)); const mk = document.createElement('mark'); mk.textContent = n.nodeValue.slice(i, i + nb.length); fr.append(mk); last = i + nb.length; i = nt.indexOf(nb, last); }
    fr.append(n.nodeValue.slice(last)); n.replaceWith(fr); });
}

async function search(kw) {
  app.innerHTML = '<p>Đang tìm...</p>';
  const all = await Promise.all(INDEX.map(m => loadSubject(m.id))), nk = norm(kw), hits = [];
  all.forEach(m => {
    if (norm(m.ten).includes(nk)) hits.push({ m, loai: 'Môn học', t: m.ten, href: `#/mon/${m.id}` });
    m.bai.forEach(b => {
      const nt = norm(b.tieude), nd = norm(b.nd), i = nd.indexOf(nk);
      if (nt.includes(nk) || i >= 0) hits.push({ m, loai: 'Bài học', t: b.tieude, href: `#/mon/${m.id}/${b.stt}`, s: i >= 0 ? b.nd.slice(Math.max(0, i - 60), i + 120).replace(/\s+/g, ' ') : '' });
      b.bt.forEach((t, k) => { if (norm(t.de).includes(nk)) hits.push({ m, loai: 'Bài tập', t: t.de.slice(0, 160), href: `#/mon/${m.id}/${b.stt}`, s: b.tieude }); });
    });
  });
  const mk = s => { const ns = norm(s), i = ns.indexOf(nk); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + nk.length)) + '</mark>' + esc(s.slice(i + nk.length)); };
  app.innerHTML = `<h2>Kết quả cho "${esc(kw)}": ${hits.length}${hits.length > 100 ? ' (hiển thị 100 đầu)' : ''}</h2>` + (hits.slice(0, 100).map(h =>
    `<a class="hit" href="${h.href}" data-kw="${kw.replace(/"/g, '&quot;')}"><span class="tag">${h.m.ten} · ${h.loai}</span><br><b>${mk(h.t)}</b>${h.s ? `<div class="muted">…${mk(h.s)}…</div>` : ''}</a>`).join('') || '<p>Không tìm thấy.</p>');
}

document.addEventListener('click', e => {
  const a = e.target.closest('a.hit'); if (!a) return;
  e.preventDefault(); hl = a.dataset.kw; $('#q').value = '';
  const h = a.getAttribute('href');
  if (location.hash === h) route(); else location.hash = h;
});

function route() {
  const q = $('#q').value.trim();
  if (q.length >= 2) return search(q);
  const p = location.hash.split('/');
  p[1] === 'mon' ? subject(p[2], +p[3] || 0) : home();
}
let tm; $('#q').addEventListener('input', () => { clearTimeout(tm); hl = ''; tm = setTimeout(route, 250); });
window.addEventListener('hashchange', () => { $('#q').value = ''; route(); });
loadIndex().then(route).catch(() => app.innerHTML = '<p>Không tải được dữ liệu. Hãy chạy <b>python -m http.server 8080</b> trong thư mục KIENTHUCCNTT rồi mở http://localhost:8080</p>');
