// src/app/Components/ModalAgendamento/components/AppointmentsStats.jsx
"use client";

import React from "react";
import { CalendarCheck, CalendarDays, CheckCircle2, CircleDollarSign } from "lucide-react";
import StatCard from "@/app/Components/Cards/StatCard/StatCard.jsx";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";


export default function AppointmentsStats({ totalHoje, semanaData, statusCount, loading }) {
  const totalSemana = (semanaData || []).reduce((acc, d) => acc + (d.total || 0), 0);

  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonStat} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <StatCard title="Hoje" value={String(totalHoje)} label="Agendamentos hoje" icon={CalendarCheck} color="blue" />
      </div>
      <div className={styles.statCard}>
        <StatCard title="Semana" value={String(totalSemana)} label="Total na semana" icon={CalendarDays} color="green" />
      </div>
      <div className={styles.statCard}>
        <StatCard title="Confirmados" value={String(statusCount?.CONFIRMADO || 0)} label="Aguardando visita" icon={CheckCircle2} color="green" />
      </div>
      <div className={styles.statCard}>
        <StatCard title="Pendentes" value={String(statusCount?.PENDENTE || 0)} label="Aguardando confirmação" icon={CircleDollarSign} color="yellow" />
      </div>
    </div>
  );
}