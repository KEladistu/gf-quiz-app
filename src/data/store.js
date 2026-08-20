const KEY = "gf-quiz-sets";

export function loadSets() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSets(sets) {
  localStorage.setItem(KEY, JSON.stringify(sets));
}

export function getSet(id) {
  return loadSets().find((s) => s.id === id);
}

export function upsertSet(set) {
  const sets = loadSets();
  const idx = sets.findIndex((s) => s.id === set.id);
  if (idx >= 0) sets[idx] = set;
  else sets.unshift(set);
  saveSets(sets);
}

export function deleteSet(id) {
  saveSets(loadSets().filter((s) => s.id !== id));
}

export function newId() {
  return "set_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// --- Parser: turns pasted notes into questions ---
// Supported formats (mix freely, one per line or block):
//   term :: definition
//   term - definition
//   Q: question?
//   A: answer
//   Add extra distractors with |  e.g.  term :: correct | wrong1 | wrong2
export function parseNotes(text) {
  const questions = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let pendingQ = null;
  for (const line of lines) {
    const qMatch = line.match(/^Q[:.)]\s*(.+)/i);
    const aMatch = line.match(/^A[:.)]\s*(.+)/i);
    if (qMatch) {
      pendingQ = qMatch[1].trim();
      continue;
    }
    if (aMatch && pendingQ) {
      questions.push(makeQ(pendingQ, aMatch[1].trim()));
      pendingQ = null;
      continue;
    }
    // term :: def   OR   term - def   OR   term = def
    const sep = line.match(/^(.+?)\s*(?:::|—|–|-|=)\s*(.+)$/);
    if (sep) {
      questions.push(makeQ(sep[1].trim(), sep[2].trim()));
    }
  }

  // Auto-generate distractors from other answers in the same set
  const allAnswers = questions.map((q) => q._correctText);
  for (const q of questions) {
    if (q.options.length >= 2) continue; // already has distractors from `|`
    const pool = allAnswers.filter((a) => a !== q._correctText);
    const distractors = shuffle(pool).slice(0, 3);
    const opts = shuffle([q._correctText, ...distractors]);
    q.options = opts;
    q.correct = opts.indexOf(q._correctText);
  }

  // If a question ended up with only 1 option (small set), leave as flashcard-style
  return questions.map((q, i) => ({
    id: i + 1,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }));
}

function makeQ(prompt, answerRaw) {
  const parts = answerRaw.split("|").map((s) => s.trim()).filter(Boolean);
  const correctText = parts[0];
  const distractors = parts.slice(1);
  let options = [];
  let correct = 0;
  if (distractors.length > 0) {
    options = shuffle([correctText, ...distractors]);
    correct = options.indexOf(correctText);
  }
  return {
    question: prompt.endsWith("?") ? prompt : `What is: ${prompt}?`,
    _correctText: correctText,
    options,
    correct,
    explanation: `Answer: ${correctText}`,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
