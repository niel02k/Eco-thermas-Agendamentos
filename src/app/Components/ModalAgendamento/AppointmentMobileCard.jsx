// src/app/Components/ModalAgendamento/components/AppointmentMobileCard.jsx
"use client";

import React, { memo } from "react";
import { Eye, Pencil, CheckCircle2, CircleDollarSign, XCircle, Trash2, Clock, MapPin, Users, Phone } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";

const STATUS_MAP = {
  CONFIRMADO: { label: "Confirmado", color: "#3CC83C" },
  PENDENTE: { label: "Pendente", color: "#FAD228" },
  CANCELADO: { label: "Cancelado", color: "#FA643C" },
  REALIZADO: { label: "Realizado", color: "#1E6EBE" },
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

function AppointmentMobileCard({
  agendamento, onVisualizar, onEditar,
  onConfirmarRealizado, onResultadoVenda, onCancelar, onExcluir
}) {
  const ag = agendamento;
  const statusInfo = STATUS_MAP[ag.status] || { label: ag.status, color: "#94A3B8" };

  return (
    <div className={styles.mobileCard}>
      {/* Header: Código + Status */}
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardId} style={{ background: statusInfo.color }}>
          #{ag.codigo}
        </span>
        <span className={styles.mobileCardStatus} style={{
          color: statusInfo.color,
          background: `${statusInfo.color}15`,
          border: `1px solid ${statusInfo.color}30`
        }}>
          {statusInfo.label}
        </span>
      </div>

      {/* Nome do Cliente */}
      <h3 className={styles.mobileCardName}>{ag.cliente?.nome || "—"}</h3>
      
      {/* Telefone */}
      {ag.cliente?.telefone && (
        <div className={styles.mobileCardPhone}>
          <Phone size={14} /> {ag.cliente.telefone}
        </div>
      )}

      {/* Informações */}
      <div className={styles.mobileCardInfo}>
        <span><Clock size={14} /> {formatarData(ag.data_visita)} às {formatarHorario(ag.horario_visita)}</span>
        <span><MapPin size={14} /> {ag.cidade || "—"}</span>
        <span><Users size={14} /> {ag.quantidade_pessoas} pessoa{ag.quantidade_pessoas !== 1 ? "s" : ""}</span>
      </div>

      {/* Badge de resultado de venda (se já definido) */}
      {ag.status === 'REALIZADO' && ag.resultado_venda && ag.resultado_venda !== 'PENDENTE' && (
        <div className={`${styles.mobileCardResult} ${
          ag.resultado_venda === 'VENDA_REALIZADA' ? styles.resultSuccessBg :
          ag.resultado_venda === 'VENDA_PERDIDA' ? styles.resultDangerBg : styles.resultNeutralBg
        }`}>
          {ag.resultado_venda === 'VENDA_REALIZADA' ? '✅ Venda Realizada' : 
           ag.resultado_venda === 'VENDA_PERDIDA' ? '❌ Venda Perdida' : 'ℹ️ Não Aplicável'}
        </div>
      )}

      {/* Ações */}
      <div className={styles.mobileCardActions}>
        {/* Visualizar */}
        <button onClick={() => onVisualizar(ag.codigo)} className={styles.mobileActionBtn}>
          <Eye size={15} /> Ver
        </button>

        {/* Editar */}
        <button onClick={() => onEditar(ag.codigo)} className={styles.mobileActionBtn}>
          <Pencil size={15} /> Editar
        </button>

        {/* Confirmar Realizado - APENAS para CONFIRMADO */}
        {ag.status === 'CONFIRMADO' && (
          <button
            onClick={() => onConfirmarRealizado(ag.codigo)}
            className={`${styles.mobileActionBtn} ${styles.mobileActionSuccess}`}
          >
            <CheckCircle2 size={15} /> Realizar
          </button>
        )}

        {/* Resultado de Venda - REALIZADO com PENDENTE */}
        {ag.status === 'REALIZADO' && ag.resultado_venda === 'PENDENTE' && (
          <button
            onClick={() => onResultadoVenda(ag)}
            className={`${styles.mobileActionBtn} ${styles.mobileActionWarning}`}
          >
            <CircleDollarSign size={15} /> Venda
          </button>
        )}

        {/* Cancelar */}
        <button
          onClick={() => onCancelar(ag.codigo)}
          disabled={ag.status === "CANCELADO" || ag.status === "REALIZADO"}
          className={`${styles.mobileActionBtn} ${styles.mobileActionDanger}`}
        >
          <XCircle size={15} /> Cancelar
        </button>

        {/* Excluir */}
        <button
          onClick={() => onExcluir(ag.codigo)}
          className={`${styles.mobileActionBtn} ${styles.mobileActionDanger}`}
        >
          <Trash2 size={15} /> Excluir
        </button>
      </div>
    </div>
  );
}

export default memo(AppointmentMobileCard);