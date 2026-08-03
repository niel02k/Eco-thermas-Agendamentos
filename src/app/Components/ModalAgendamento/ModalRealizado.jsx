// src/app/Components/ModalAgendamento/ModalRealizado.jsx
"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function ModalRealizado({ agendamento, onConfirm, onFaltou, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleRealizado = async () => {
    setLoading(true);
    await onConfirm(agendamento.codigo);
    setLoading(false);
  };

  const handleFaltou = async () => {
    setLoading(true);
    await onFaltou(agendamento.codigo);
    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.confirmBox} onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        
        <button className={styles.closeBtn} onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>

        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827', textAlign: 'center' }}>
          Agendamento #{agendamento?.codigo}
        </h3>
        
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6B7280', textAlign: 'center' }}>
          {agendamento?.cliente?.nome}
        </p>

        <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
          O cliente compareceu?
        </p>

        <div className={styles.confirmActions}>
          <button
            onClick={handleRealizado}
            disabled={loading}
            className={styles.btnRealizado}
          >
            <CheckCircle2 size={18} />
            Sim, realizado
          </button>

          <button
            onClick={handleFaltou}
            disabled={loading}
            className={styles.btnFaltou}
          >
            <XCircle size={18} />
            Não, faltou
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          className={styles.confirmCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}