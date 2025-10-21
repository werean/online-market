"use client";
import { useState, useRef } from "react";
import styles from "./CSVUploader.module.css";
import { peekCSVHeader, hasRequiredColumns } from "@/lib/csv";

type CSVUploaderProps = {
  action: string; // ex: '/products/upload'
  fieldName?: string; // default: 'file'
  accept?: string; // default: '.csv'
  maxSizeMB?: number; // default: 10
  requiredColumns?: string[]; // ex: ['name', 'description', 'price']
  onResult?: (data: any) => void; // callback com JSON do backend
  className?: string;
};

type UploadState = "idle" | "validating" | "uploading" | "processing" | "done" | "error";

export function CSVUploader({
  action,
  fieldName = "file",
  accept = ".csv",
  maxSizeMB = 10,
  requiredColumns = [],
  onResult,
  className = "",
}: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    setError("");
    setResult(null);

    // Validar tipo
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Por favor, selecione um arquivo CSV válido.");
      setFile(null);
      return;
    }

    // Validar tamanho
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB.`);
      setFile(null);
      return;
    }

    // Validar cabeçalho (se houver colunas obrigatórias)
    if (requiredColumns.length > 0) {
      try {
        setState("validating");
        const header = await peekCSVHeader(selectedFile);
        if (!hasRequiredColumns(header, requiredColumns)) {
          setError(`Cabeçalho inválido. Colunas obrigatórias: ${requiredColumns.join(", ")}`);
          setFile(null);
          setState("idle");
          return;
        }
      } catch (err) {
        setError("Erro ao validar arquivo.");
        setFile(null);
        setState("idle");
        return;
      }
    }

    setFile(selectedFile);
    setState("idle");
  };

  const handleUpload = () => {
    if (!file) {
      setError("Selecione um arquivo CSV.");
      return;
    }

    setState("uploading");
    setProgress(0);
    setError("");
    setResult(null);

    const xhr = new XMLHttpRequest();
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    xhr.open("POST", `${base}${action}`, true);
    xhr.withCredentials = true;

    // Progresso de upload
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    };

    // Upload completo, aguardando resposta
    xhr.upload.onload = () => {
      setState("processing");
      setProgress(100);
    };

    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setResult(data);
          setState("done");
          onResult?.(data);
        } else {
          const errData = JSON.parse(xhr.responseText);
          setError(errData.message || `Erro ${xhr.status}`);
          setState("error");
        }
      } catch {
        setError("Resposta inválida do servidor.");
        setState("error");
      }
    };

    xhr.onerror = () => {
      setError("Erro de rede ao fazer upload.");
      setState("error");
    };

    const formData = new FormData();
    formData.append(fieldName, file);
    xhr.send(formData);
  };

  const handleReset = () => {
    setFile(null);
    setState("idle");
    setProgress(0);
    setError("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isUploading = state === "uploading" || state === "processing" || state === "validating";

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Input de arquivo */}
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.input}
          disabled={isUploading}
        />
        {file && <span className={styles.fileName}>{file.name}</span>}
      </div>

      {/* Barra de progresso */}
      {isUploading && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressText}>
            {state === "validating" && "Validando..."}
            {state === "uploading" && `${progress}%`}
            {state === "processing" && "Processando..."}
          </span>
        </div>
      )}

      {/* Erro */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Resultado */}
      {state === "done" && result && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Resultado do Upload</h3>
          <div className={styles.resultStats}>
            <div className={styles.stat}>
              <strong>Sucesso:</strong>{" "}
              <span className={styles.success}>{result.success || 0}</span>
            </div>
            <div className={styles.stat}>
              <strong>Falhas:</strong> <span className={styles.failed}>{result.failed || 0}</span>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <details className={styles.errors}>
              <summary>Erros ({result.errors.length})</summary>
              <ul>
                {result.errors.slice(0, 20).map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
                {result.errors.length > 20 && (
                  <li className={styles.more}>... e mais {result.errors.length - 20} erros</li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Botões */}
      <div className={styles.actions}>
        {state !== "done" && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={styles.button}
          >
            {isUploading ? "Enviando..." : "Enviar CSV"}
          </button>
        )}
        {(state === "done" || state === "error") && (
          <button type="button" onClick={handleReset} className={styles.buttonSecondary}>
            Enviar outro arquivo
          </button>
        )}
      </div>
    </div>
  );
}
