// src/app/Components/ModalAgendamento/components/AppointmentsRecent.jsx
"use client";

import React from "react";
import { Clock3 } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";


const STATUS_COLORS = {
  CONFIRMADO: "#3CC83C",
  PENDENTE: "#FAD228",
  CANCELADO: "#FA643C",
  REALIZADO: "#1E6EBE",
};

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

export default function AppointmentsRecent({ agendamentos, loading }) {
  return (
    <div className={styles.recentCard}>
      <div className={styles.cardHeader}>
        <h2>Últimas Entradas</h2>
        <p>Registros mais recentes</p>
      </div>

      <div className={styles.recentList}>
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className={styles.skeletonActivity} />)
          : agendamentos.slice(0, 5).map(ag => {
              const color = STATUS_COLORS[ag.status] || "#94a3b8";
              return (
                <div key={ag.codigo} className={styles.recentItem}>
                  <div className={styles.recentAvatar} style={{ backgroundColor: color }}>
                    <Clock3 size={16} color="white" />
                  </div>
                  <div className={styles.recentInfo}>
                    <span className={styles.recentName}>{ag.cliente?.nome || ag.codigo}</span>
                    <span className={styles.recentDetail}>
                      {ag.cidade} · {ag.quantidade_pessoas} pessoa{ag.quantidade_pessoas !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className={styles.recentTime}>
                    {formatarData(ag.data_visita)} {formatarHorario(ag.horario_visita)}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}