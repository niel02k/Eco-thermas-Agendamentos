// src/app/Components/ModalAgendamento/components/AppointmentsWeekStatus.jsx
"use client";

import React from "react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import WeeklyAppointmentsChart from "@/app/Components/WeeklyAppointmentsChart/WeeklyAppointmentsChart.jsx";


const STATUS_MAP = {
  CONFIRMADO: { label: "Confirmado", color: "#3CC83C" },
  PENDENTE: { label: "Pendente", color: "#FAD228" },
  CANCELADO: { label: "Cancelado", color: "#FA643C" },
  REALIZADO: { label: "Realizado", color: "#1E6EBE" },
};

export default function AppointmentsWeekStatus({ semanaData, statusCount, loading }) {
  return (
    <div className={styles.weekStatusRow}>
      {/* Agenda da Semana */}
      <div className={styles.cardChart}>
        <WeeklyAppointmentsChart
          data={semanaData}
          title="Agendamentos"
          subtitle="Semana atual"
          height={200}
          barColor="#6EC8F0"
        />
        
      </div>

      {/* Status */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Status</h2>
          <p>Resumo operacional</p>
        </div>
        <div className={styles.statusList}>
          {Object.entries(STATUS_MAP).map(([key, info]) => (
            <div key={key} className={styles.statusItem}>
              <div className={styles.statusDot} style={{ background: info.color }} />
              <span>{info.label}</span>
              <strong>{loading ? "—" : (statusCount?.[key] || 0)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>



  );
}