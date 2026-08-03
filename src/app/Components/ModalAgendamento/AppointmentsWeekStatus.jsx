// src/app/Components/ModalAgendamento/components/AppointmentsWeekStatus.jsx
"use client";

import React from "react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import WeeklyAppointmentsChart from "@/app/Components/WeeklyAppointmentsChart/WeeklyAppointmentsChart.jsx";
import { 
  STATUS_AGENDAMENTO, 
  STATUS_AGENDAMENTO_LABELS, 
  STATUS_AGENDAMENTO_COLORS 
} from "@/lib/constants";

export default function AppointmentsWeekStatus({ semanaData, statusCount, loading }) {
  return (
    <div className={styles.weekStatusRow}>
      {/* Agenda da Semana */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Agenda da Semana</h2>
          <p>Agendamentos por dia</p>
        </div>
        <WeeklyAppointmentsChart
          data={semanaData}
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
          {Object.entries(STATUS_AGENDAMENTO).map(([key, value]) => (
            <div key={key} className={styles.statusItem}>
              <div className={styles.statusDot} style={{ background: STATUS_AGENDAMENTO_COLORS[value] }} />
              <span>{STATUS_AGENDAMENTO_LABELS[key]}</span>
              <strong>{loading ? "—" : (statusCount?.[value] || 0)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}