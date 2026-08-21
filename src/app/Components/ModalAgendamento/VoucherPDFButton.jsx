"use client";

import React from "react";
import { Check, Image as ImageIcon } from "lucide-react";
import { copiarVoucherComoImagem } from "@/app/services/voucherPDFService";
import styles from "@/app/Components/ModalAgendamento/VoucherPDFButton.module.css"; 

export default function VoucherPDFButton({ agendamento, disabled = false }) {
  const [copyState, setCopyState] = React.useState("idle"); // idle, copying, success, error

  if (!agendamento) return null;

  const handleCopyImage = async () => {
    setCopyState("copying");
    const success = await copiarVoucherComoImagem(agendamento);

    if (success) {
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 2000);
    } else {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  };

  const buttonStateClass =
    copyState === "success"
      ? styles.voucherButtonSuccess
      : copyState === "error"
        ? styles.voucherButtonError
        : "";

  return (
    <div className={styles.voucherActions}>
      <button
        onClick={handleCopyImage}
        disabled={disabled || copyState === "copying"}
        className={`${styles.voucherButton} ${buttonStateClass}`}
        title="Copiar Voucher como Imagem para o WhatsApp"
        type="button"
      >
        {copyState === "copying" ? (
          <span className={styles.spinner} />
        ) : copyState === "success" ? (
          <Check size={16} />
        ) : (
          <ImageIcon size={16} />
        )}

        {copyState === "copying"
          ? "Gerando..."
          : copyState === "success"
            ? "Voucher Copiado!"
            : copyState === "error"
              ? "Erro ao copiar"
              : ""}
      </button>
    </div>
  );
}
