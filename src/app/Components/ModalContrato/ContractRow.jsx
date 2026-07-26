// src/app/(sua-rota)/contratos/components/ContractRow.jsx
"use client";

import React, { memo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import styles from "@/app/Components/ModalContrato/Contracts.module.css";
import { STATUS_CONTRATO_LABELS } from "@/lib/constats";

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function getStatusColor(status) {
  switch (String(status || "").toLowerCase()) {
    case 'ativo': return '#16A34A';
    case 'pendente': return '#EAB308';
    case 'cancelado': return '#DC2626';
    case 'encerrado': return '#6B21A8';
    case 'bloqueado': return '#6B21A8';
    default: return '#94A3B8';
  }
}

function ContractRow({ contrato, onVisualizar, onEditar, onExcluir }) {
  return (
    <div className={styles.tableRow}>
      <span className={styles.colId} style={{ color: getStatusColor(contrato.status) }}>
        #{contrato.id}
      </span>
      <span className={styles.colCliente}>{contrato.titular_nome}</span>
      <span className={styles.colCidade}>{contrato.cidade || "—"}</span>
      <span className={styles.colConsultor}>{contrato.vendedor?.nome || "—"}</span>
      <span className={styles.colValor}>{formatCurrency(contrato.valor_total)}</span>
      <span>
        <span
          className={styles.statusBadge}
          style={{
            background: `${getStatusColor(contrato.status)}18`,
            color: getStatusColor(contrato.status)
          }}
        >
          {STATUS_CONTRATO_LABELS[contrato.status] || contrato.status}
        </span>
      </span>
      <span className={styles.colActions}>
        <button onClick={() => onVisualizar(contrato.id)} title="Visualizar" className={styles.actionBtn}>
          <Eye size={16} />
        </button>
        <button onClick={() => onEditar(contrato.id)} title="Editar" className={styles.actionBtn}>
          <Pencil size={16} />
        </button>
        <button onClick={() => onExcluir(contrato.id)} title="Excluir" className={`${styles.actionBtn} ${styles.actionDanger}`}>
          <Trash2 size={16} />
        </button>
      </span>
    </div>
  );
}

export default memo(ContractRow);