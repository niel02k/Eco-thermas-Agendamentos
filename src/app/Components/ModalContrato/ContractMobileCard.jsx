// src/app/(sua-rota)/contratos/components/ContractMobileCard.jsx
"use client";

import React, { memo } from "react";
import { Eye, Pencil, Trash2, MapPin, User, Calendar } from "lucide-react";
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

function ContractMobileCard({ contrato, onVisualizar, onEditar, onExcluir }) {
  const statusColor = getStatusColor(contrato.status);

  return (
    <div className={styles.mobileCard}>
      {/* Header */}
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardId} style={{ background: statusColor }}>
          #{contrato.id}
        </span>
        <span className={styles.mobileCardStatus} style={{ color: statusColor }}>
          {STATUS_CONTRATO_LABELS[contrato.status] || contrato.status}
        </span>
      </div>

      {/* Nome */}
      <h3 className={styles.mobileCardName}>{contrato.titular_nome}</h3>

      {/* Info */}
      <div className={styles.mobileCardInfo}>
        <span><MapPin size={14} /> {contrato.cidade || "—"}</span>
        <span><User size={14} /> {contrato.vendedor?.nome || "—"}</span>
      </div>

      {/* Valor */}
      <div className={styles.mobileCardValor}>
        {formatCurrency(contrato.valor_total)}
      </div>

      {/* Data */}
      <div className={styles.mobileCardDate}>
        <Calendar size={14} />
        {contrato.data_inicio
          ? new Date(contrato.data_inicio + "T00:00:00").toLocaleDateString("pt-BR")
          : "—"}
      </div>

      {/* Ações */}
      <div className={styles.mobileCardActions}>
        <button onClick={() => onVisualizar(contrato.id)} className={styles.mobileActionBtn}>
          <Eye size={16} /> Visualizar
        </button>
        <button onClick={() => onEditar(contrato.id)} className={`${styles.mobileActionBtn} ${styles.mobileActionEdit}`}>
          <Pencil size={16} /> Editar
        </button>
        <button onClick={() => onExcluir(contrato.id)} className={`${styles.mobileActionBtn} ${styles.mobileActionDelete}`}>
          <Trash2 size={16} /> Excluir
        </button>
      </div>
    </div>
  );
}

export default memo(ContractMobileCard);