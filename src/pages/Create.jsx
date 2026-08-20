import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSet, upsertSet, newId, parseNotes } from "../data/store";
import { extractFromFile, generateFromProse } from "../data/extract";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./Create.module.css";

const SAMPLE = `Photosynthesis :: process plants use to make food from sunlight
Mitochondria :: powerhouse of the cell
Capital of France :: Paris | London | Berlin | Rome

Q: What year did WW2 end?
A: 1945 | 1939 | 1918 | 1963`;

export default function Create() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("notes"); // 'notes' | 'manual'
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState([]);
  const [preview, setPreview] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");

  useEffect(() => {
    if (!editing) return;
    const s = getSet(id);
    if (s) {
      setTitle(s.title);
      setDescription(s.description || "");
      setQuestions(s.questions);
      setMode("manual");
    }
  }, [id, editing]);

  const handleParse = () => {
    const parsed = parseNotes(notes);
    setPreview(parsed);
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setExtracting(true);
    setExtractMsg("");
    try {
      const texts = [];
      for (const f of files) {
        const t = await extractFromFile(f);
        texts.push(t);
        if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ""));
      }
      const combined = texts.join("\n\n");
      // Try structured parse first
      const structured = parseNotes(combined);
      let out;
      if (structured.length >= 3) {
        out = combined;
        setExtractMsg(`✓ Extracted from ${files.length} file(s) — found ${structured.length} Q&A items.`);
      } else {
        // Auto-generate fill-in-the-blank from prose
        const generated = generateFromProse(combined, 25);
        out = generated || combined;
        setExtractMsg(
          generated
            ? `✓ Extracted from ${files.length} file(s) — auto-generated fill-in-the-blank questions. Edit if you want.`
            : `✓ Extracted text. Edit into "term :: definition" lines below.`
        );
      }
      setNotes((prev) => (prev.trim() ? prev + "\n\n" + out : out));
      setPreview(parseNotes(out));
    } catch (err) {
      setExtractMsg(`❌ ${err.message || "Failed to read file"}`);
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const addManual = () => {
    setQuestions((qs) => [
      ...qs,
      { id: qs.length + 1, question: "", options: ["", "", "", ""], correct: 0, explanation: "" },
    ]);
  };

  const updateQ = (idx, patch) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };
  const updateOpt = (idx, oi, val) => {
    setQuestions((qs) => qs.map((q, i) => {
      if (i !== idx) return q;
      const options = [...q.options];
      options[oi] = val;
      return { ...q, options };
    }));
  };
  const removeQ = (idx) => setQuestions((qs) => qs.filter((_, i) => i !== idx));

  const handleSave = () => {
    const finalQs = mode === "notes" ? (preview.length ? preview : parseNotes(notes)) : questions;
    const cleaned = finalQs
      .filter((q) => q.question && q.question.trim())
      .map((q, i) => ({ ...q, id: i + 1 }));

    if (!title.trim()) return alert("Give your reviewer a title 💕");
    if (cleaned.length === 0) return alert("Add at least one question first!");

    const set = {
      id: editing ? id : newId(),
      title: title.trim(),
      description: description.trim(),
      questions: cleaned,
      createdAt: Date.now(),
    };
    upsertSet(set);
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={() => navigate("/")}>← Back</button>
        <ThemeToggle />
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>{editing ? "Edit Reviewer" : "New Reviewer"}</h1>

        <label className={styles.label}>Title</label>
        <input
          className={styles.input}
          placeholder="e.g. Biology Chapter 4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className={styles.label}>Description (optional)</label>
        <input
          className={styles.input}
          placeholder="A short note about this reviewer"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {!editing && (
          <div className={styles.tabs}>
            <button
              className={mode === "notes" ? styles.tabActive : styles.tab}
              onClick={() => setMode("notes")}
            >
              📝 Paste Notes
            </button>
            <button
              className={mode === "manual" ? styles.tabActive : styles.tab}
              onClick={() => setMode("manual")}
            >
              ✍️ Build Manually
            </button>
          </div>
        )}

        {mode === "notes" && !editing && (
          <>
            <label className={styles.label}>Upload files</label>
            <div
              className={dragOver ? styles.dropZoneActive : styles.dropZone}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className={styles.dropIcon}>📎</div>
              <p><b>Drag & drop</b> PDF, DOCX, TXT, or MD here</p>
              <label className={styles.uploadBtn}>
                Or choose files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md,text/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  style={{ display: "none" }}
                />
              </label>
              {extracting && <p className={styles.extractingMsg}>⏳ Reading files...</p>}
              {extractMsg && !extracting && <p className={styles.extractMsg}>{extractMsg}</p>}
            </div>

            <label className={styles.label}>Your notes</label>
            <p className={styles.hint}>
              One item per line. Use <code>term :: definition</code> or <code>Q: ...</code> / <code>A: ...</code>.
              Add wrong choices with <code>|</code>. Example:
            </p>
            <pre className={styles.sample}>{SAMPLE}</pre>
            <textarea
              className={styles.textarea}
              rows={12}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste or type your notes here..."
            />
            <div className={styles.row}>
              <button className={styles.secondaryBtn} onClick={handleParse}>
                🔍 Preview Questions
              </button>
              <button className={styles.secondaryBtn} onClick={() => setNotes(SAMPLE)}>
                Load sample
              </button>
            </div>
            {preview.length > 0 && (
              <div className={styles.preview}>
                <h3>Preview ({preview.length} questions)</h3>
                {preview.map((q, i) => (
                  <div key={i} className={styles.previewItem}>
                    <b>{i + 1}. {q.question}</b>
                    <ul>
                      {q.options.map((o, oi) => (
                        <li key={oi} className={oi === q.correct ? styles.correct : ""}>
                          {oi === q.correct ? "✓ " : ""}{o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === "manual" && (
          <div className={styles.manual}>
            {questions.map((q, i) => (
              <div key={i} className={styles.qCard}>
                <div className={styles.qHead}>
                  <span>Question {i + 1}</span>
                  <button className={styles.removeBtn} onClick={() => removeQ(i)}>Remove</button>
                </div>
                <input
                  className={styles.input}
                  placeholder="Question"
                  value={q.question}
                  onChange={(e) => updateQ(i, { question: e.target.value })}
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} className={styles.optRow}>
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correct === oi}
                      onChange={() => updateQ(i, { correct: oi })}
                    />
                    <input
                      className={styles.input}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      value={opt}
                      onChange={(e) => updateOpt(i, oi, e.target.value)}
                    />
                  </div>
                ))}
                <input
                  className={styles.input}
                  placeholder="Explanation (optional)"
                  value={q.explanation || ""}
                  onChange={(e) => updateQ(i, { explanation: e.target.value })}
                />
              </div>
            ))}
            <button className={styles.secondaryBtn} onClick={addManual}>+ Add Question</button>
          </div>
        )}

        <button className={styles.saveBtn} onClick={handleSave}>
          💾 Save Reviewer
        </button>
      </div>
    </div>
  );
}
