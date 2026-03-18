import { useNavigate } from "react-router-dom";
import { quizSets } from "../data/questions";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <ThemeToggle />
      </div>
      <div className={styles.hero}>
        <div className={styles.pill}>✨ Quiz Time!</div>
        <h1 className={styles.title}>Ready to<br /><span>Test Yourself?</span></h1>
        <p className={styles.sub}>Pick a quiz set and challenge your knowledge 💕</p>
      </div>
      <div className={styles.grid}>
        {quizSets.map((set) => (
          <div key={set.id} className={styles.setCard} onClick={() => navigate(`/quiz/${set.id}`)}>
            <div className={styles.setIcon}>📚</div>
            <h2>{set.title}</h2>
            <p>{set.description}</p>
            <span className={styles.count}>{set.questions.length} questions</span>
            <button className={styles.startBtn}>Start Quiz →</button>
          </div>
        ))}
      </div>
    </div>
  );
}