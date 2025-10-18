"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import styles from "./OTPInput.module.css";

interface OTPInputProps {
  length?: number;
  onChange: (code: string) => void;
  disabled?: boolean;
  value?: string;
}

export default function OTPInput({
  length = 6,
  onChange,
  disabled = false,
  value: externalValue = "",
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar com valor externo
  useEffect(() => {
    if (externalValue === "" && values.some((v) => v !== "")) {
      // Limpar campos quando valor externo é resetado
      setValues(Array(length).fill(""));
    }
  }, [externalValue, length, values]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Always call onChange with current code
    onChange(newValues.join(""));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current and move to previous
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow left
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow right
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only accept numeric paste
    if (!/^\d+$/.test(pastedData)) return;

    const pastedValues = pastedData.slice(0, length).split("");
    const newValues = [...values];

    pastedValues.forEach((char, i) => {
      newValues[i] = char;
    });

    setValues(newValues);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newValues.findIndex((v) => v === "");
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Always call onChange with current code
    onChange(newValues.join(""));
  };

  return (
    <div className={styles.container}>
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={styles.input}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
