import { useState } from "react";
import styles from "./QuizCard.module.css";

export default function QuizCard({ question, questionNumber, total, onNext, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    onAnswer(idx === question.correct);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    onNext();
  };

  const getOptionClass = (idx) => {
    if (!revealed) return selected === idx ? styles.optionSelected : styles.option;
    if (idx === question.correct) return styles.optionCorrect;
    if (idx === selected && idx !== question.correct) return styles.optionWrong;
    return styles.optionDim;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>QUESTION {questionNumber} / {total}</span>
      </div>

      <p className={styles.questionText}>{question.question}</p>

      <div className={styles.options}>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            className={getOptionClass(idx)}
            onClick={() => handleSelect(idx)}
            disabled={revealed}
          >
            <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
            <span className={styles.optionText}>{opt}</span>
            {revealed && idx === question.correct && <span className={styles.tick}>✓</span>}
            {revealed && idx === selected && idx !== question.correct && <span className={styles.cross}>✗</span>}
          </button>
        ))}
      </div>

      {revealed && (
        <div className={styles.explanation}>
          <span className={styles.expIcon}>💡</span>
          <p>{question.explanation}</p>
        </div>
      )}

      {revealed && (
        <button className={styles.nextBtn} onClick={handleNext}>
          {questionNumber < total ? "Next Question →" : "See Results 🎉"}
        </button>
      )}
    </div>
  );
}