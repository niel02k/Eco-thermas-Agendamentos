// src/app/Components/ModalAgendamento/AppointmentsWeekStatus.jsx
"use client";

import React, { useMemo } from "react";
import { CheckCircle2, TrendingUp, TrendingDown, XCircle } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import WeeklyAppointmentsChart from "@/app/Components/WeeklyAppointmentsChart/WeeklyAppointmentsChart.jsx";
import StatCard from "@/app/Components/Cards/StatCard/StatCard.jsx";

function getPeriodoSemana() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  
  const formatar = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${formatar(inicio)} - ${formatar(fim)}`;
}

export default function AppointmentsWeekStatus({ semanaData, statusCount, statusCountVenda, loading }) {
  const totalSemana = (semanaData || []).reduce((acc, d) => acc + (d.total || 0), 0);
  const vendasRealizadas = statusCountVenda?.VENDA_REALIZADA || 0;
  const vendasPerdidas = statusCountVenda?.VENDA_PERDIDA || 0;
  const faltas = statusCount?.FALTOU || 0;
  const periodo = useMemo(() => getPeriodoSemana(), []);

  return (
    <div className={styles.weekStatusRow}>
      <div className={styles.cardChart}>
        <WeeklyAppointmentsChart
          data={semanaData}
          height={220}
          barColor="#6EC8F0"
        />
      </div>

      <div className={styles.weekRightColumn}>
        <div className={styles.statCard}>
          <StatCard 
            title="Semana" 
            value={String(totalSemana)} 
            label={periodo}  // 👈 Mostra o período
            icon={TrendingUp} 
            color="blue" 
          />
        </div>
        <div className={styles.statCard}>
          <StatCard 
            title="Vendido" 
            value={String(vendasRealizadas)} 
            label="Vendas realizadas" 
            icon={CheckCircle2} 
            color="green" 
          />
        </div>
        <div className={styles.statCard}>
          <StatCard 
            title="Não Vendido" 
            value={String(vendasPerdidas)} 
            label="Vendas perdidas" 
            icon={TrendingDown} 
             color="purpl" 
          />
        </div>
        <div className={styles.statCard}>
          <StatCard 
            title="Faltou" 
            value={String(faltas)} 
            label="Faltou" 
            icon={XCircle} 
            color="yellow" 
          />
        </div>
      </div>
    </div>
  );
}