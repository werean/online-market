"use client";

import styles from "./Spinner.module.css";

export function Spinner() {
  return <div className={styles.spinner} aria-label="Carregando" role="status" />;
}
