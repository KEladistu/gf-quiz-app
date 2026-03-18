import { useTheme } from "../ThemeContext";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={styles.toggle} onClick={toggleTheme} title="Toggle dark/light mode">
      <span className={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</span>
      <span className={styles.label}>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}