// src/app/Components/ModalAgendamento/components/ConfirmModal.jsx
"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function ConfirmModal({ mensagem, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
        <AlertTriangle size={32} color="#FA643C" />
        <p className={styles.confirmMsg}>{mensagem}</p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmCancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.confirmOk} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}  