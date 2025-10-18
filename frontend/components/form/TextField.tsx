import { InputHTMLAttributes, forwardRef } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <label className={styles.label}>
        <span className={styles.labelText}>{label}</span>
        <input ref={ref} className={styles.input} {...rest} />
        {error && <span className={styles.error}>{error}</span>}
      </label>
    );
  }
);

TextField.displayName = "TextField";
