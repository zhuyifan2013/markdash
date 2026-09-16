function summarize(documents, config) {
  const valid = documents.filter((d) => d.data && !d._skip);
  const tasks = valid.filter((d) => d.data.type === 'task');
  const risks = valid.filter((d) => d.data.type === 'risk');
  const decisions = valid.filter((d) => d.data.type === 'decision');
  const tests = valid.filter((d) => d.data.type === 'test');
  const today = new Date();

  const isOverdue = (d) =>
    d.data.due &&
    !['done', 'cancelled'].includes(d.data.status) &&
    new Date(d.data.due + 'T23:59:59') < today;

  const ageDays = (d) =>
    Math.floor((today - new Date(d.data.updated_at + 'T00:00:00')) / 86400000);

  const stale = valid
    .filter((d) => ['in_progress', 'active'].includes(d.data.status) && ageDays(d) > config.staleDays)
    .map((d) => ({ id: d.data.id, path: d.path, updated_at: d.data.updated_at, age_days: ageDays(d) }));

  return {
    totals: {
      documents: valid.length,
      tasks: tasks.length,
      risks: risks.length,
      decisions: decisions.length,
      tests: tests.length,
    },
    tasks: {
      by_status: groupCount(tasks, (d) => d.data.status),
      blocked: tasks.filter((d) => d.data.status === 'blocked').map(ref),
      in_progress: tasks.filter((d) => d.data.status === 'in_progress').map(ref),
      overdue: tasks.filter(isOverdue).map((d) => ({ ...ref(d), due: d.data.due })),
    },
    risks: {
      open: risks.filter((d) => d.data.status === 'open').map(ref),
      high: risks
        .filter((d) => d.data.status === 'open' && (d.data.probability === 'high' || d.data.impact === 'high'))
        .map(ref),
    },
    tests: {
      by_status: groupCount(tests, (d) => d.data.status),
    },
    stale,
    recent: [...valid]
      .sort((a, b) => (a.data.updated_at < b.data.updated_at ? 1 : -1))
      .slice(0, 10)
      .map(ref),
    generated_at: new Date().toISOString(),
  };
}

function groupCount(docs, fn) {
  const out = {};
  for (const d of docs) {
    const k = fn(d) || 'unknown';
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function ref(d) {
  return { id: d.data.id, title: d.data.title, type: d.data.type, status: d.data.status, path: d.path, updated_at: d.data.updated_at };
}

module.exports = { summarize };
