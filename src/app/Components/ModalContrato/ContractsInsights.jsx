


// src/app/(sua-rota)/contratos/components/ContractsInsights.jsx
"use client";

import React from "react";
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

export default function ContractsInsights({ 
  rankingVendedores = [], 
  statusContratos = [], 
  total = 0, 
  resumoGeral = {} 
}) {
  // Garantir que são arrays
  const vendedores = Array.isArray(rankingVendedores) ? rankingVendedores : [];
  const status = Array.isArray(statusContratos) ? statusContratos : [];

  return (
    <div className={styles.insightsGrid}>
      {/* Top Vendedores */}
      <div className={styles.insightCard}>
        <h3>🏆 Top Consultores</h3>
        {vendedores.slice(0, 5).map((v, i) => (
          <div key={i} className={styles.rankItem}>
            <span className={styles.rankPos}>{i + 1}º</span>
            <span className={styles.rankName}>{v.nome || '—'}</span>
            <span className={styles.rankValue}>
              {formatCurrency(v.receita || 0)} ({v.quantidade || 0})
            </span>
          </div>
        ))}
        {vendedores.length === 0 && (
          <p className={styles.emptyText}>Nenhum consultor com vendas no período</p>
        )}
      </div>

      {/* Status */}
      <div className={styles.insightCard}>
        <h3>📊 Status dos Contratos</h3>
        {status.map((s) => (
          <div key={s.status} className={styles.statusRow}>
            <span className={styles.statusLabel}>
              {STATUS_CONTRATO_LABELS[s.status] || s.status}
            </span>
            <div className={styles.statusBar}>
              <div
                className={styles.statusFill}
                style={{
                  width: `${total > 0 ? (s.quantidade / total) * 100 : 0}%`,
                  background: getStatusColor(s.status)
                }}
              />
            </div>
            <span className={styles.statusCount}>{s.quantidade || 0}</span>
          </div>
        ))}
        {status.length === 0 && (
          <p className={styles.emptyText}>Nenhum contrato encontrado</p>
        )}
      </div>

      {/* Métricas */}
      <div className={styles.insightCard}>
        <h3>📦 Métricas Gerais</h3>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Consultores</span>
            <span className={styles.metricValue}>{vendedores.length}</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Ticket Médio</span>
            <span className={styles.metricValue}>
              {formatCurrency(resumoGeral?.ticket_medio || 0)}
            </span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Ativos</span>
            <span className={styles.metricValue}>
              {resumoGeral?.contratos_ativos || 0}
            </span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Dependentes</span>
            <span className={styles.metricValue}>
              {resumoGeral?.total_dependentes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}