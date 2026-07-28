// src/app/Components/ModalAgendamento/components/AppointmentsMobile.jsx
"use client";

import React from "react";
import AppointmentMobileCard from "./AppointmentMobileCard";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

export default function AppointmentsMobile({
  agendamentos, loading,
  onVisualizar, onEditar, onConfirmarRealizado,
  onResultadoVenda, onCancelar, onExcluir
}) {
  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Carregando...</span>
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <p>Nenhum agendamento encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.mobileCards}>
      {agendamentos.map(ag => (
        <AppointmentMobileCard
          key={ag.codigo}
          agendamento={ag}
          onVisualizar={onVisualizar}
          onEditar={onEditar}
          onConfirmarRealizado={onConfirmarRealizado}
          onResultadoVenda={onResultadoVenda}
          onCancelar={onCancelar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  );
}