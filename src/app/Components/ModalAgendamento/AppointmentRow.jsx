// src/app/Components/ModalAgendamento/AppointmentRow.jsx
"use client";

import React, { memo } from "react";
import { Eye, Pencil, CheckCircle2, CircleDollarSign, XCircle, Trash2 } from "lucide-react";
import styles from "@/app/(authenticated)/Appointments/Appointments.module.css";
import { 
  STATUS_AGENDAMENTO, 
  STATUS_AGENDAMENTO_LABELS, 
  STATUS_AGENDAMENTO_COLORS,
  RESULTADO_VISITA,
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

// Único badge que muda conforme o estado
function getBadgeInfo(ag) {
  // FALTOU
  if (ag.resultado_visita === RESULTADO_VISITA.FALTOU) {
    return { label: 'Faltou', color: '#EF4444' };
  }
  // REALIZADO + VENDA_REALIZADA
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA) {
    return { label: 'Vendido', color: '#16A34A' };
  }
  // REALIZADO + VENDA_PERDIDA
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA) {
    return { label: 'Perdido', color: '#DC2626' };
  }
  // REALIZADO + PENDENTE ou NAO_APLICAVEL
  if (ag.resultado_visita === RESULTADO_VISITA.REALIZADO) {
    return { label: 'Realizado', color: '#1E6EBE' };
  }
  // Status normal (PENDENTE, CONFIRMADO, CANCELADO)
  return {
    label: STATUS_AGENDAMENTO_LABELS[ag.status] || ag.status,
    color: STATUS_AGENDAMENTO_COLORS[ag.status] || '#94A3B8'
  };
}

function AppointmentRow({
  agendamento, onSelecionar, onVisualizar, onEditar,
  onConfirmarAgendamento, onConfirmarRealizado, onResultadoVenda, onCancelar, onExcluir
}) {
  const ag = agendamento;
  const badge = getBadgeInfo(ag);

  return (
    <div 
      className={styles.tableRow} 
      onClick={() => onSelecionar?.(ag.codigo)}
      style={{ cursor: 'pointer' }}
    >
      <span className={styles.colCodigo}>#{ag.codigo}</span>
      
      <span className={styles.colCliente}>
        <span className={styles.clienteNome}>{ag.cliente?.nome || "—"}</span>
        {ag.cliente?.telefone && <span className={styles.clienteSub}>{ag.cliente.telefone}</span>}
      </span>
      
      <span className={styles.colData}>
        <span>{formatarData(ag.data_visita)}</span>
        <span className={styles.clienteSub}>{formatarHorario(ag.horario_visita)}</span>
      </span>
      
      <span className={styles.colPessoas}>{ag.quantidade_pessoas}</span>
      <span className={styles.colCidade}>{ag.cidade || "—"}</span>
      
      {/* Único badge que muda */}
      <span>
        <span className={styles.statusBadge} style={{
          background: `${badge.color}18`,
          color: badge.color,
          border: `1px solid ${badge.color}30`
        }}>
          {badge.label}
        </span>
      </span>

      {/* Ações */}
      <span className={styles.colActions} onClick={e => e.stopPropagation()}>
        <button className={styles.actionBtn} title="Visualizar" onClick={() => onVisualizar(ag.codigo)}>
          <Eye size={15} />
        </button>
        <button className={styles.actionBtn} title="Editar" onClick={() => onEditar(ag.codigo)}>
          <Pencil size={15} />
        </button>

        {/* PENDENTE → CONFIRMADO */}
        {ag.status === STATUS_AGENDAMENTO.PENDENTE && (
          <button className={`${styles.actionBtn} ${styles.actionSuccess}`} title="Confirmar"
            onClick={() => onConfirmarAgendamento(ag.codigo)}>
            <CheckCircle2 size={15} />
          </button>
        )}

        {/* CONFIRMADO → Realizado/Faltou (se ainda não tiver resultado_visita) */}
        {ag.status === STATUS_AGENDAMENTO.CONFIRMADO && !ag.resultado_visita && (
          <button className={`${styles.actionBtn} ${styles.actionWarning}`} title="Realizar"
            onClick={() => onConfirmarRealizado(ag)}>
            <CircleDollarSign size={15} />
          </button>
        )}

        {/* REALIZADO + venda PENDENTE → Definir Venda */}
        {ag.resultado_visita === RESULTADO_VISITA.REALIZADO && ag.resultado_venda === RESULTADO_VENDA.PENDENTE && (
          <button className={`${styles.actionBtn} ${styles.actionWarning}`} title="Resultado Venda"
            onClick={() => onResultadoVenda(ag)}>
            <CircleDollarSign size={15} />
          </button>
        )}

        {/* Cancelar */}
        <button className={`${styles.actionBtn} ${styles.actionDanger}`} title="Cancelar"
          disabled={ag.status === STATUS_AGENDAMENTO.CANCELADO || ag.resultado_visita === RESULTADO_VISITA.REALIZADO || ag.resultado_visita === RESULTADO_VISITA.FALTOU}
          onClick={() => onCancelar(ag.codigo)}>
          <XCircle size={15} />
        </button>

        {/* Excluir */}
        <button className={`${styles.actionBtn} ${styles.actionDanger}`} title="Excluir"
          onClick={() => onExcluir(ag.codigo)}>
          <Trash2 size={15} />
        </button>
      </span>
    </div>
  );
}

export default memo(AppointmentRow);