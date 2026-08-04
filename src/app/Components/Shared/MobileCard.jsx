// src/app/Components/Shared/MobileCard.jsx
"use client";

import React, { memo } from "react";
import { Clock, MapPin, Users, User, Calendar, DollarSign, ChevronRight } from "lucide-react";
import styles from "@/app/Components/Shared/Shared.module.css";
import { 
  STATUS_AGENDAMENTO_LABELS, 
  STATUS_AGENDAMENTO_COLORS,
  RESULTADO_VISITA,
  RESULTADO_VENDA,
  STATUS_CONTRATO_LABELS 
} from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getBadgeInfo(dados, tipo) {
  if (tipo === 'contrato') {
    const statusColors = {
      ATIVO: '#16A34A', PENDENTE: '#EAB308', CANCELADO: '#DC2626',
      ENCERRADO: '#6B21A8', BLOQUEADO: '#6B21A8',
    };
    return {
      label: STATUS_CONTRATO_LABELS[dados.status] || dados.status,
      color: statusColors[dados.status] || '#94A3B8'
    };
  }

  // Agendamento
  if (dados.resultado_visita === RESULTADO_VISITA.FALTOU) {
    return { label: 'Faltou', color: '#EF4444' };
  }
  if (dados.resultado_visita === RESULTADO_VISITA.REALIZADO && dados.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA) {
    return { label: 'Vendido', color: '#16A34A' };
  }
  if (dados.resultado_visita === RESULTADO_VISITA.REALIZADO && dados.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA) {
    return { label: 'Perdido', color: '#DC2626' };
  }
  if (dados.resultado_visita === RESULTADO_VISITA.REALIZADO) {
    return { label: 'Realizado', color: '#1E6EBE' };
  }
  return {
    label: STATUS_AGENDAMENTO_LABELS[dados.status] || dados.status,
    color: STATUS_AGENDAMENTO_COLORS[dados.status] || '#94A3B8'
  };
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE                                                                  */
/* -------------------------------------------------------------------------- */

function MobileCard({ dados, tipo = 'agendamento', onClick }) {
  const badge = getBadgeInfo(dados, tipo);
  const isAgendamento = tipo === 'agendamento';
  const isContrato = tipo === 'contrato';

  return (
    <div className={styles.mobileCard} onClick={() => onClick?.(dados)}>
      {/* Header: Código + Status */}
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardId} style={{ background: badge.color }}>
          #{isContrato ? dados.id : dados.codigo}
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
      <h3 className={styles.mobileCardName}>
        {isContrato ? dados.titular_nome : (dados.cliente?.nome || "—")}
      </h3>

      {/* Informações */}
      <div className={styles.mobileCardInfo}>
        {isAgendamento && (
          <>
            <span><Clock size={14} /> {formatarData(dados.data_visita)} às {formatarHorario(dados.horario_visita)}</span>
            <span><MapPin size={14} /> {dados.cidade || "—"}</span>
            <span><Users size={14} /> {dados.quantidade_pessoas} pessoa{dados.quantidade_pessoas !== 1 ? "s" : ""}</span>
          </>
        )}
        {isContrato && (
          <>
            <span><MapPin size={14} /> {dados.cidade || "—"}</span>
            <span><User size={14} /> {dados.vendedor?.nome || "—"}</span>
            <span><DollarSign size={14} /> {formatarMoeda(dados.valor_total)}</span>
            <span><Calendar size={14} /> {formatarData(dados.data_inicio)}</span>
          </>
        )}
      </div>

      {/* Seta indicando que é clicável */}
      <div className={styles.mobileCardArrow}>
        <ChevronRight size={18} />
      </div>
    </div>
  );
}

export default memo(MobileCard);    