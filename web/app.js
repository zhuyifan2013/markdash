const state = { data: null, view: 'overview', query: '', filters: { priority: '', tag: '' } };

const TYPE_META = {
  project:  { label: 'Project',  color: 'var(--yellow)' },
  task:     { label: 'Task',     color: 'var(--accent)' },
  decision: { label: 'Decision', color: 'var(--purple)' },
  risk:     { label: 'Risk',     color: 'var(--red)' },
  test:     { label: 'Test',     color: 'var(--green)' },
  note:     { label: 'Note',     color: 'var(--muted)' },
  doc:      { label: 'Doc',      color: 'var(--muted)' },
};

const STATUS_LABELS = {
  backlog: 'Backlog', todo: 'To do', in_progress: 'In progress', blocked: 'Blocked',
  review: 'In review', done: 'Done', cancelled: 'Cancelled',
  active: 'Active', on_hold: 'On hold', archived: 'Archived', stale: 'Stale',
  proposed: 'Proposed', accepted: 'Accepted', deprecated: 'Deprecated', superseded: 'Superseded',
  open: 'Open', mitigated: 'Mitigated', closed: 'Closed',
  planned: 'Planned', passing: 'Passing', failing: 'Failing', skipped: 'Skipped',
};

const PRIORITY_META = {
  urgent: { label: 'P0 Urgent', color: 'var(--red)' },
  high:   { label: 'P1 High',   color: 'var(--red)' },
  medium: { label: 'P2 Medium', color: 'var(--yellow)' },
  low:    { label: 'P3 Low',    color: 'var(--muted)' },
};

const TASK_COLUMNS = [
  ['backlog', 'Backlog'],
  ['todo', 'To do'],
  ['in_progress', 'In progress'],
  ['blocked', 'Blocked'],
  ['review', 'In review'],
  ['done', 'Done'],
  ['cancelled', 'Cancelled'],
];

async function loadData() {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) { state.data = await res.json(); render(); return; }
    throw new Error('api unavailable');
  } catch (_) {
    const staticRes = await fetch('data.json');
    if (!staticRes.ok) throw new Error('failed to load data (run markdash serve or markdash build)');
    state.data = await staticRes.json();
    render();
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
function markdown(md) {
  const lines = md.split('\n');
  let html = '', inUl = false, inCode = false, inTable = false;
  const closeUl = () => { if (inUl) { html += '</ul>'; inUl = false; } };
  const closeTable = () => { if (inTable) { html += '</tbody></table>'; inTable = false; } };
  for (const line of lines) {
    if (line.startsWith('```')) { closeUl(); closeTable(); html += inCode ? '</code></pre>' : '<pre><code>'; inCode = !inCode; continue; }
    if (inCode) { html += esc(line) + '\n'; continue; }
    if (/^\|.*\|\s*$/.test(line)) {
      if (/^\|[\s:|-]+\|\s*$/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (!inTable) { html += '<table><tbody>'; inTable = true; }
      html += '<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      continue;
    }
    closeTable();
    if (!line.trim()) { closeUl(); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) { closeUl(); html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; continue; }
    if (line.startsWith('> ')) { closeUl(); html += `<blockquote>${inline(line.slice(2))}</blockquote>`; continue; }
    const li = line.match(/^[-*]\s+(.*)/);
    if (li) { if (!inUl) { html += '<ul>'; inUl = true; } html += `<li>${inline(li[1])}</li>`; continue; }
    closeUl();
    html += `<p>${inline(line)}</p>`;
  }
  closeUl(); closeTable();
  if (inCode) html += '</code></pre>';
  return html;
}

function docById(id) { return state.data.documents.find((d) => d.id === id); }
function statusLabel(s) { return STATUS_LABELS[s] || s; }

function alertHtml(a) {
  const html = itemHtml(a.doc);
  return html
    .replace('class="item ', 'class="item alert alert-' + a.tone + ' ')
    .replace('<div class="item-top">', '<div class="item-top"><span class="alert-kind alert-' + a.tone + '">' + esc(a.kind) + '</span>');
}

function itemHtml(d) {
  const type = TYPE_META[d.type] || { label: d.type, color: 'var(--muted)' };
  const pri = PRIORITY_META[d.priority];
  const tags = (d.tags || []).map((t) => `<span class="tag" data-tag="${esc(t)}">#${esc(t)}</span>`).join(' ');
  return `<div class="item type-${esc(d.type)}" data-id="${esc(d.id)}" style="border-left:3px solid ${type.color}">
    <div class="item-top">
      <span class="type-chip" style="color:${type.color}">${type.label}</span>
      <span class="status-dot status-${esc(d.status)}"></span>
      <span class="status-text status-${esc(d.status)}">${esc(statusLabel(d.status))}</span>
      ${pri ? `<span class="pri-chip" style="color:${pri.color};border-color:${pri.color}">${pri.label}</span>` : ''}
    </div>
    <div class="t">${esc(d.title)}</div>
    <div class="meta">
      ${d.owner ? `<span class="owner">@${esc(d.owner)}</span>` : ''}
      ${tags}
      <span class="date">${esc(d.updated_at || '')}</span>
    </div>
  </div>`;
}

function matchQuery(d, q) {
  if (!q) return true;
  return [d.title, d.id, d.owner, d.path, ...(d.tags || [])].join(' ').toLowerCase().includes(q);
}
function matchFilters(d) {
  if (state.filters.priority && d.priority !== state.filters.priority) return false;
  if (state.filters.tag && !(d.tags || []).includes(state.filters.tag)) return false;
  return true;
}

function filterBar(types) {
  const docs = state.data.documents.filter((d) => !types || types.includes(d.type));
  const tags = [...new Set(docs.flatMap((d) => d.tags || []))].sort();
  return `<div class="filters">
    <select id="f-priority">
      <option value="">All priorities</option>
      ${Object.entries(PRIORITY_META).map(([k, v]) => `<option value="${k}" ${state.filters.priority === k ? 'selected' : ''}>${v.label}</option>`).join('')}
    </select>
    <select id="f-tag">
      <option value="">All tags</option>
      ${tags.map((t) => `<option value="${esc(t)}" ${state.filters.tag === t ? 'selected' : ''}>#${esc(t)}</option>`).join('')}
    </select>
  </div>`;
}

const VIEWS = {
  overview() {
    const s = state.data.summary, t = s.totals, bs = s.tasks.by_status;
    const project = state.data.documents.find((d) => d.type === 'project' && d.status === 'active');
    const todoCount = (bs.todo || 0) + (bs.backlog || 0);
    const inProgress = bs.in_progress || 0;

    const alerts = [
      ...s.tasks.blocked.map((x) => ({ doc: docById(x.id), kind: 'Blocked', tone: 'red' })),
      ...s.tasks.overdue.map((x) => ({ doc: docById(x.id), kind: 'Overdue', tone: 'red' })),
      ...s.risks.high.map((x) => ({ doc: docById(x.id), kind: 'High risk', tone: 'red' })),
      ...s.stale.map((x) => ({ doc: docById(x.id), kind: `Stale ${x.age_days}d`, tone: 'yellow' })),
    ].filter((a) => a.doc);

    const rank = { urgent: 0, high: 1, medium: 2, low: 3 };
    const todos = state.data.documents
      .filter((d) => d.type === 'task' && ['todo', 'backlog'].includes(d.status))
      .sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9));
    const nextUp = todos[0];

    const health = alerts.some((a) => a.tone === 'red')
      ? { label: 'Needs attention', color: 'var(--red)' }
      : inProgress
        ? { label: 'On track', color: 'var(--green)' }
        : todoCount
          ? { label: 'Ready to start', color: 'var(--yellow)' }
          : { label: 'All clear', color: 'var(--green)' };

    const headline = alerts.length
      ? (alerts.some((a) => a.tone === 'red') ? `${alerts.length} item(s) need immediate action` : `${alerts.length} item(s) to review`)
      : nextUp
        ? 'Next up: ' + nextUp.title
        : 'Nothing pending right now';

    const stats = [
      [todoCount, 'To do'], [inProgress, 'In progress'], [bs.done || 0, 'Done'],
      [t.decisions, 'Decisions'], [t.risks, 'Risks'], [t.documents, 'All docs'],
    ];

    return `
      <div class="hero">
        <div>
          <div class="hero-project">${project ? esc(project.title) : 'Project overview'}</div>
          <div class="hero-headline">
            <span class="status-dot" style="background:${health.color}"></span>
            <span>${esc(headline)}</span>
          </div>
        </div>
        <div class="hero-health" style="color:${health.color};border-color:${health.color}">${health.label}</div>
      </div>

      ${alerts.length ? `<section class="block"><h2 style="color:var(--red)">Needs attention</h2><div class="list">
        ${alerts.map(alertHtml).join('')}
      </div></section>` : ''}

      <div class="grid2">
        <section class="block">
          <h2>${nextUp ? 'Suggested next step' : 'Open tasks'}</h2>
          <div class="list">
            ${nextUp ? itemHtml(nextUp) : '<div class="muted">No open tasks</div>'}
            ${todos.slice(1, 5).map(itemHtml).join('')}
            ${todos.length > 5 ? `<div class="more-hint">${todos.length - 5} more in the task board</div>` : ''}
          </div>
        </section>
        <section class="block">
          <h2>Recently updated</h2>
          <div class="list">${s.recent.slice(0, 6).map((x) => itemHtml(docById(x.id))).join('')}</div>
        </section>
      </div>

      <section class="block">
        <h2>Stats</h2>
        <div class="stat-strip">
          ${stats.map(([n, l]) => `<div class="stat"><span class="stat-n">${n}</span><span class="stat-l">${l}</span></div>`).join('')}
        </div>
      </section>`;
  },

  tasks() {
    const q = state.query.toLowerCase();
    const tasks = state.data.documents.filter((d) => d.type === 'task' && matchQuery(d, q) && matchFilters(d));
    return `<h1>Task board</h1>
      ${filterBar(['task'])}
      <div class="board">${TASK_COLUMNS.map(([st, label]) => {
        const list = tasks.filter((d) => d.status === st);
        return `<div class="column"><h3>${label}<span>${list.length}</span></h3><div class="list">${list.map(itemHtml).join('')}</div></div>`;
      }).join('')}</div>`;
  },

  decisions() {
    const decisions = state.data.documents.filter((d) => d.type === 'decision').sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const risks = state.data.documents.filter((d) => d.type === 'risk' && d.status !== 'closed');
    const levels = ['low', 'medium', 'high'];
    const cellLabel = { low: 'Low', medium: 'Med', high: 'High' };
    return `<h1>Decisions &amp; risks</h1>
    <div class="grid2">
      <section><h2>Decision log (${decisions.length})</h2><div class="list">${decisions.map(itemHtml).join('') || '<div class="muted">None yet</div>'}</div></section>
      <section><h2>Risk matrix (probability x impact)</h2>
        <div class="risk-matrix">
          <div></div>${levels.map((i) => `<div class="head">Prob. ${cellLabel[i]}</div>`).join('')}
          ${['high', 'medium', 'low'].map((impact) =>
            `<div class="head">Impact ${cellLabel[impact]}</div>` + levels.map((prob) => {
              const cell = risks.filter((r) => r.impact === impact && r.probability === prob);
              return `<div class="cell">${cell.map((r) => `<div class="item" data-id="${esc(r.id)}" style="padding:6px 8px;margin-bottom:4px;border-left:3px solid var(--red)">${esc(r.title)}</div>`).join('')}</div>`;
            }).join('')).join('')}
        </div>
        <h2>All risks</h2><div class="list">${risks.map(itemHtml).join('') || '<div class="muted">No open risks</div>'}</div>
      </section>
    </div>`;
  },

  tests() {
    const tests = state.data.documents.filter((d) => d.type === 'test');
    const by = {};
    for (const d of tests) by[d.status] = (by[d.status] || 0) + 1;
    return `<h1>Tests &amp; quality</h1>
      <div class="cards">${Object.entries(by).map(([k, v]) => `<div class="card"><div class="num">${v}</div><div class="label">${esc(statusLabel(k))}</div></div>`).join('') || '<div class="muted">No test documents yet</div>'}</div>
      <div class="list" style="margin-top:16px">${tests.map(itemHtml).join('')}</div>`;
  },

  docs() {
    const q = state.query.toLowerCase();
    const docs = state.data.documents
      .filter((d) => matchQuery(d, q) && matchFilters(d))
      .sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
    return `<h1>All documents (${docs.length})</h1>
      ${filterBar()}
      <div class="list">${docs.map(itemHtml).join('')}</div>`;
  },
};

function render() {
  document.getElementById('main').innerHTML = (VIEWS[state.view] || VIEWS.overview)();
  const at = state.data.summary.generated_at ? new Date(state.data.summary.generated_at).toLocaleString() : '';
  document.getElementById('updated-at').textContent = at ? `Updated ${at}` : '';
  const fp = document.getElementById('f-priority');
  const ft = document.getElementById('f-tag');
  if (fp) fp.addEventListener('change', (e) => { state.filters.priority = e.target.value; render(); });
  if (ft) ft.addEventListener('change', (e) => { state.filters.tag = e.target.value; render(); });
}

async function openDoc(id) {
  const panel = document.getElementById('doc-panel');
  const content = document.getElementById('doc-content');
  panel.classList.remove('hidden');
  content.innerHTML = '<div class="muted">Loading…</div>';
  let doc;
  try {
    const res = await fetch(`/api/document?id=${encodeURIComponent(id)}`);
    if (res.ok) doc = await res.json();
  } catch {}
  if (!doc) doc = docById(id);
  const type = TYPE_META[doc.type] || { label: doc.type };
  const pri = PRIORITY_META[doc.priority];
  const related = (doc.related || []).map((r) => {
    const target = docById(r);
    return target ? `<a href="#" data-related="${esc(r)}">${esc(target.title)}</a>` : `<span class="muted">${esc(r)} (broken link)</span>`;
  }).join(' · ');
  content.innerHTML = `
    <div class="muted" style="font-size:12px">${esc(doc.path)}</div>
    <h1>${esc(doc.title)}</h1>
    <div class="doc-meta">
      <span class="type-chip" style="color:${type.color}">${type.label}</span>
      <span class="status-dot status-${esc(doc.status)}"></span>
      <span class="status-text status-${esc(doc.status)}">${esc(statusLabel(doc.status))}</span>
      ${pri ? `<span class="pri-chip" style="color:${pri.color};border-color:${pri.color}">${pri.label}</span>` : ''}
      ${doc.owner ? `<span class="owner">@${esc(doc.owner)}</span>` : ''}
      <span class="date">Updated ${esc(doc.updated_at)}</span>
    </div>
    <div class="doc-content">${markdown(doc.body || '')}</div>
    ${related ? `<h2>Related documents</h2><p>${related}</p>` : ''}`;
}

document.addEventListener('click', (e) => {
  const tag = e.target.dataset && e.target.dataset.tag;
  if (tag) {
    state.view = 'docs';
    state.filters.tag = tag;
    document.querySelectorAll('.nav-item').forEach((x) => x.classList.toggle('active', x.dataset.view === 'docs'));
    render();
    return;
  }
  const related = e.target.dataset && e.target.dataset.related;
  if (related) { e.preventDefault(); openDoc(related); return; }
  const item = e.target.closest('.item');
  if (item) openDoc(item.dataset.id);
});

document.querySelectorAll('.nav-item').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    state.view = a.dataset.view;
    document.querySelectorAll('.nav-item').forEach((x) => x.classList.remove('active'));
    a.classList.add('active');
    render();
  });
});
document.getElementById('doc-close').addEventListener('click', () => {
  document.getElementById('doc-panel').classList.add('hidden');
});
document.getElementById('search').addEventListener('input', (e) => {
  state.query = e.target.value;
  if (state.view === 'overview') {
    state.view = 'docs';
    document.querySelectorAll('.nav-item').forEach((x) => x.classList.toggle('active', x.dataset.view === 'docs'));
  }
  render();
});
if (window.EventSource) {
  const es = new EventSource('/events');
  es.addEventListener('update', () => loadData());
}
loadData().catch((err) => {
  document.getElementById('main').innerHTML =
    `<h1>Cannot load data</h1><p class="muted">${esc(err.message)}</p><p>Run <code>markdash serve</code>; a static build reads from <code>data.json</code>.</p>`;
});
