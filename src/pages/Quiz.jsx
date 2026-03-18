import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizSets } from "../data/questions";
import QuizCard from "../components/QuizCard";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./Quiz.module.css";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const set = quizSets.find((s) => s.id === id);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [done, setDone] = useState(false);

  if (!set) return (
    <div style={{padding:"2rem",textAlign:"center"}}>
      Quiz not found. <button onClick={() => navigate("/")}>Go Home</button>
    </div>
  );

  const handleAnswer = (isCorrect) => {
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }));
  };

  const handleNext = () => {
    if (current + 1 >= set.questions.length) setDone(true);
    else setCurrent((c) => c + 1);
  };

  if (done) return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={() => navigate("/")}>← Back</button>
        <ThemeToggle />
      </div>
      <div className={styles.result}>
        <div className={styles.resultEmoji}>
          {score.correct === set.questions.length ? "🎉" : score.correct > set.questions.length / 2 ? "😊" : "💪"}
        </div>
        <h2>Quiz Complete!</h2>
        <p className={styles.resultScore}>{score.correct} / {set.questions.length}</p>
        <p className={styles.resultSub}>
          {score.correct === set.questions.length ? "Perfect score! Amazing! 💕" : "Keep practicing, you've got this!"}
        </p>
        <div className={styles.resultStats}>
          <span className={styles.correct}>✓ {score.correct} Correct</span>
          <span className={styles.wrong}>✗ {score.wrong} Wrong</span>
        </div>
        <button className={styles.homeBtn} onClick={() => navigate("/")}>← Back to Quizzes</button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={() => navigate("/")}>← Back</button>
        <div className={styles.scorePill}>
          ✓ {score.correct} &nbsp;|&nbsp; ✗ {score.wrong} &nbsp;|&nbsp; Q: {current + 1}/{set.questions.length}
        </div>
        <ThemeToggle />
      </div>
      <div className={styles.progress}>
        <div className={styles.progressFill} style={{ width: `${((current) / set.questions.length) * 100}%` }} />
      </div>
      <QuizCard
        key={current}
        question={set.questions[current]}
        questionNumber={current + 1}
        total={set.questions.length}
        onNext={handleNext}
        onAnswer={handleAnswer}
      />
    </div>
  );
}