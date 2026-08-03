// src/app/Components/ModalAgendamento/components/AppointmentsStats.jsx
"use client";

import React from "react";
import { CalendarCheck, CalendarDays, CheckCircle2, CircleDollarSign, XCircle } from "lucide-react";
import StatCard from "@/app/Components/Cards/StatCard/StatCard.jsx";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import { STATUS_AGENDAMENTO, STATUS_AGENDAMENTO_LABELS } from "@/lib/constants.js";

export default function AppointmentsStats({ totalHoje, semanaData, statusCount, loading }) {
  const totalSemana = (semanaData || []).reduce((acc, d) => acc + (d.total || 0), 0);

  // Mapeamento de ícones por status
  const statusIcons = {
    [STATUS_AGENDAMENTO.CONFIRMADO]: CheckCircle2,
    [STATUS_AGENDAMENTO.PENDENTE]: CircleDollarSign,
    [STATUS_AGENDAMENTO.CANCELADO]: XCircle,
    [STATUS_AGENDAMENTO.REALIZADO]: CalendarCheck,
    [STATUS_AGENDAMENTO.FALTOU]: XCircle,
  };

  const statusColors = {
    [STATUS_AGENDAMENTO.CONFIRMADO]: "green",
    [STATUS_AGENDAMENTO.PENDENTE]: "yellow",
    [STATUS_AGENDAMENTO.CANCELADO]: "red",
    [STATUS_AGENDAMENTO.REALIZADO]: "blue",
    [STATUS_AGENDAMENTO.FALTOU]: "red",
  };

  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonStat} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <StatCard 
          title="Hoje" 
          value={String(totalHoje)} 
          label="Agendamentos hoje" 
          icon={CalendarCheck} 
          color="blue" 
        />
      </div>
      <div className={styles.statCard}>
        <StatCard 
          title="Semana" 
          value={String(totalSemana)} 
          label="Total na semana" 
          icon={CalendarDays} 
          color="green" 
        />
      </div>
      
      {/* Cards dinâmicos por status */}
      {Object.entries(STATUS_AGENDAMENTO).map(([key, value]) => {
        const Icon = statusIcons[value];
        if (!Icon) return null;
        
        return (
          <div key={key} className={styles.statCard}>
            <StatCard 
              title={STATUS_AGENDAMENTO_LABELS[key]} 
              value={String(statusCount?.[value] || 0)} 
              label={`Agendamentos ${STATUS_AGENDAMENTO_LABELS[key].toLowerCase()}s`}
              icon={Icon} 
              color={statusColors[value] || "gray"} 
            />
          </div>
        );
      })}
    </div>
  );
}