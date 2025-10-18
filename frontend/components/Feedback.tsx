import styles from "./Feedback.module.css";

interface FeedbackProps {
  message?: string;
  type?: "error" | "success";
}

export const Feedback = ({ message, type = "error" }: FeedbackProps) => {
  if (!message) return null;

  return (
    <div className={`${styles.box} ${type === "error" ? styles.error : styles.success}`}>
      {message}
    </div>
  );
};
