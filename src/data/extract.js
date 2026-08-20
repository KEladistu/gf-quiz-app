import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return await file.text();
  }
  throw new Error(`Unsupported file type: ${file.name}. Use PDF, DOCX, TXT, or MD.`);
}

async function extractPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((it) => it.str).join(" "));
  }
  return parts.join("\n\n");
}

async function extractDocx(file) {
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value;
}

// Auto-generate fill-in-the-blank questions from arbitrary prose.
// Picks the most "quiz-worthy" word from each sentence (proper nouns, numbers,
// or the longest content word) and blanks it out.
const STOP = new Set([
  "the","a","an","and","or","but","of","in","on","at","to","for","with","by",
  "is","are","was","were","be","been","being","this","that","these","those",
  "it","its","as","from","which","who","whom","whose","what","when","where",
  "how","why","not","no","yes","if","then","than","so","also","can","may",
  "will","would","should","could","have","has","had","do","does","did","one",
  "two","them","they","their","there","here","he","she","we","us","you","i",
]);

export function generateFromProse(text, limit = 20) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 260 && /[a-zA-Z]/.test(s));

  const questions = [];
  const usedAnswers = new Set();

  for (const sentence of sentences) {
    if (questions.length >= limit) break;
    const words = sentence.match(/[A-Za-z][A-Za-z\-']+|\d+/g) || [];
    const candidates = words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => {
        const lw = w.toLowerCase();
        if (STOP.has(lw)) return false;
        if (w.length < 4 && !/^\d+$/.test(w)) return false;
        return true;
      });
    if (candidates.length === 0) continue;

    // Prefer numbers, then capitalized (proper noun-ish), then longest
    candidates.sort((a, b) => {
      const score = (c) => {
        if (/^\d+$/.test(c.w)) return 100 + c.w.length;
        if (/^[A-Z]/.test(c.w)) return 50 + c.w.length;
        return c.w.length;
      };
      return score(b) - score(a);
    });

    const pick = candidates[0].w;
    if (usedAnswers.has(pick.toLowerCase())) continue;
    usedAnswers.add(pick.toLowerCase());

    const blanked = sentence.replace(
      new RegExp(`\\b${escapeRegex(pick)}\\b`),
      "______"
    );
    questions.push({ prompt: blanked, answer: pick });
  }

  // Convert to notes format so the existing parser handles distractors etc.
  return questions.map((q) => `Q: ${q.prompt}\nA: ${q.answer}`).join("\n\n");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
