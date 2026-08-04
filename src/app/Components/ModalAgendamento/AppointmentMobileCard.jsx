// src/app/Components/ModalAgendamento/AppointmentMobileCard.jsx
"use client";

import React, { memo } from "react";
import { Clock, MapPin, Users, Phone, ChevronRight } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import { 
  STATUS_AGENDAMENTO_LABELS, 
  STATUS_AGENDAMENTO_COLORS,
  RESULTADO_VISITA,
  RESULTADO_VISITA_LABELS,
  RESULTADO_VISITA_COLORS,
  RESULTADO_VENDA 
} from "@/lib/constants";

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

function getBadgeInfo(ag) {
  if (ag.resultado_visita === RESULTADO_VISITA.FALTOU) {
    return { label: 'Faltou', color: '#EF4444' };
  }
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA) {
    return { label: 'Vendido', color: '#16A34A' };
  }
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA) {
    return { label: 'Perdido', color: '#DC2626' };
  }
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO) {
    return { label: 'Realizado', color: '#1E6EBE' };
  }
  return {
    label: STATUS_AGENDAMENTO_LABELS[ag.status] || ag.status,
    color: STATUS_AGENDAMENTO_COLORS[ag.status] || '#94A3B8'
  };
}

function AppointmentMobileCard({ agendamento, onClick }) {
  const ag = agendamento;
  const badge = getBadgeInfo(ag);

  return (
    <div className={styles.mobileCard} onClick={() => onClick?.(ag)}>
      {/* Header: Código + Status */}
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardId} style={{ background: badge.color }}>
          #{ag.codigo}
        </span>
        <span className={styles.mobileCardStatus} style={{
          color: badge.color,
          background: `${badge.color}15`,
          border: `1px solid ${badge.color}30`
        }}>
          {badge.label}
        </span>
      </div>

      {/* Nome */}
      <h3 className={styles.mobileCardName}>{ag.cliente?.nome || "—"}</h3>

      {/* Data/Horário */}
      <div className={styles.mobileCardInfo}>
        <span><Clock size={14} /> {formatarData(ag.data_visita)} às {formatarHorario(ag.horario_visita)}</span>
        <span><MapPin size={14} /> {ag.cidade || "—"}</span>
        <span><Users size={14} /> {ag.quantidade_pessoas} pessoa{ag.quantidade_pessoas !== 1 ? "s" : ""}</span>
      </div>

      {/* Seta indicando que é clicável */}
      <div className={styles.mobileCardArrow}>
        <ChevronRight size={18} />
      </div>
    </div>
  );
}

export default memo(AppointmentMobileCard);