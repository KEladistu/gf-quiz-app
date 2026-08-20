import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSets, deleteSet } from "../data/store";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);

  useEffect(() => {
    setSets(loadSets());
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this reviewer? This can't be undone 💔")) return;
    deleteSet(id);
    setSets(loadSets());
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <ThemeToggle />
      </div>
      <div className={styles.hero}>
        <div className={styles.pill}>✨ Your Reviewer</div>
        <h1 className={styles.title}>Study<br /><span>Smarter, Bebe 💕</span></h1>
        <p className={styles.sub}>Paste your notes, we'll turn them into quizzes.</p>
        <button className={styles.createBtn} onClick={() => navigate("/create")}>
          + Create New Reviewer
        </button>
      </div>

      {sets.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📝</div>
          <p>No reviewers yet. Tap <b>Create New Reviewer</b> to add your first one!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {sets.map((set) => (
            <div key={set.id} className={styles.setCard} onClick={() => navigate(`/quiz/${set.id}`)}>
              <div className={styles.setIcon}>📚</div>
              <h2>{set.title}</h2>
              <p>{set.description || "Tap to start reviewing"}</p>
              <span className={styles.count}>{set.questions.length} questions</span>
              <div className={styles.cardActions}>
                <button className={styles.startBtn}>Start →</button>
                <button
                  className={styles.editBtn}
                  onClick={(e) => { e.stopPropagation(); navigate(`/edit/${set.id}`); }}
                >
                  Edit
                </button>
                <button className={styles.delBtn} onClick={(e) => handleDelete(e, set.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
