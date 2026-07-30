// src/app/Components/ModalAgendamento/components/AppointmentRow.jsx
"use client";

import React, { memo, useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  CircleDollarSign,
  XCircle,
  Trash2,
} from "lucide-react";
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

function AppointmentRow({
  agendamento,
  onSelecionar,
  onVisualizar,
  onEditar,
  onConfirmarRealizado,
  onResultadoVenda,
  onCancelar,
  onExcluir
}) {
  const ag = agendamento;
  const statusInfo = STATUS_MAP[ag.status] || { label: ag.status, color: "#94A3B8" };
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className={styles.tableRow}
         onClick={() => onSelecionar(ag)}>
      {/* Código */}
      <span className={styles.colCodigo}>#{ag.codigo}</span>
      
      {/* Cliente */}
      <span className={styles.colCliente}>
        <span className={styles.clienteNome}>{ag.cliente?.nome || "—"}</span>
        {ag.cliente?.telefone && <span className={styles.clienteSub}>{ag.cliente.telefone}</span>}
      </span>
      
      {/* Data / Horário */}
      <span className={styles.colData}>
        <span>{formatarData(ag.data_visita)}</span>
        <span className={styles.clienteSub}>{formatarHorario(ag.horario_visita)}</span>
      </span>
      
      {/* Pessoas */}
      <span className={styles.colPessoas}>{ag.quantidade_pessoas}</span>
      
      {/* Cidade */}
      <span className={styles.colCidade}>{ag.cidade || "—"}</span>
      
      {/* Status */}
      <span>
        <span className={styles.statusBadge} style={{
          background: `${statusInfo.color}18`,
          color: statusInfo.color,
          border: `1px solid ${statusInfo.color}30`
        }}>
          {statusInfo.label}
        </span>
      </span>

      {/* Ações */}
      <span className={styles.colActions}>
        {/* Visualizar - sempre */}
        <button className={styles.actionBtn} title="Visualizar" onClick={() => onVisualizar(ag.codigo)}>
          <Eye size={15} />
        </button>

        {/* Editar - sempre */}
        <button className={styles.actionBtn} title="Editar" onClick={() => onEditar(ag.codigo)}>
          <Pencil size={15} />
        </button>

        {/* Confirmar Realizado - APENAS para CONFIRMADO */}
        {ag.status === 'CONFIRMADO' && (
          <button
            className={`${styles.actionBtn} ${styles.actionSuccess}`}
            title="Confirmar Realização"
            onClick={() => onConfirmarRealizado(ag.codigo)}
          >
            <CheckCircle2 size={15} />
          </button>
        )}

        {/* Resultado de Venda - apenas para REALIZADO com resultado PENDENTE */}
        {ag.status === 'REALIZADO' && ag.resultado_venda === 'PENDENTE' && (
          <button
            className={`${styles.actionBtn} ${styles.actionWarning}`}
            title="Definir Resultado da Venda"
            onClick={() => onResultadoVenda(ag)}
          >
            <CircleDollarSign size={15} />
          </button>
        )}

        {/* Badge de resultado já definido */}
        {ag.status === 'REALIZADO' && ag.resultado_venda && ag.resultado_venda !== 'PENDENTE' && (
          <span className={`${styles.resultBadge} ${
            ag.resultado_venda === 'VENDA_REALIZADA' ? styles.resultSuccess :
            ag.resultado_venda === 'VENDA_PERDIDA' ? styles.resultDanger : styles.resultNeutral
          }`}>
            {ag.resultado_venda === 'VENDA_REALIZADA' ? '✓ Vendido' :
             ag.resultado_venda === 'VENDA_PERDIDA' ? '✗ Perdido' : 'N/A'}
          </span>
        )}

        {/* Cancelar - não aparece para CANCELADO nem REALIZADO */}
        <button
          className={`${styles.actionBtn} ${styles.actionDanger}`}
          title="Cancelar"
          disabled={ag.status === "CANCELADO" || ag.status === "REALIZADO"}
          onClick={() => onCancelar(ag.codigo)}
        >
          <XCircle size={15} />
        </button>

        {/* Excluir - sempre */}
        <button
          className={`${styles.actionBtn} ${styles.actionDanger}`}
          title="Excluir"
          onClick={() => onExcluir(ag.codigo)}
        >
          <Trash2 size={15} />
        </button>
      </span>
    </div>
  );
}

export default memo(AppointmentRow);