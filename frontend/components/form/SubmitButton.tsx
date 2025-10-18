import { ButtonHTMLAttributes } from "react";
import styles from "./SubmitButton.module.css";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const SubmitButton = ({ loading, children, ...rest }: SubmitButtonProps) => {
  return (
    <button type="submit" className={styles.button} disabled={loading} {...rest}>
      {loading ? "Carregando..." : children}
    </button>
  );
};
