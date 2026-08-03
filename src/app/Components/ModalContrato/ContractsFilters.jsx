// src/app/(sua-rota)/contratos/components/ContractsFilters.jsx
"use client";

import React from "react";
import { Search, RefreshCw, X } from "lucide-react";
import styles from "@/app/Components/ModalContrato/Contracts.module.css";
import { STATUS_CONTRATO, STATUS_CONTRATO_LABELS } from "@/lib/constants";

export default function ContractsFilters({
  busca, filtroStatus, loading,
  onBuscaChange, onBuscaSubmit, onStatusChange, onRefresh
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar por titular..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && busca.length > 2 && onBuscaSubmit()}
          className={styles.searchInput}
        />
        {busca && (
          <button className={styles.clearBtn} onClick={() => onBuscaChange("")}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className={styles.filtersRight}>
        <select
          value={filtroStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={styles.statusSelect}
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_CONTRATO).map(([key, value]) => (
            <option key={key} value={value}>{STATUS_CONTRATO_LABELS[key]}</option>
          ))}
        </select>

        <button onClick={onRefresh} disabled={loading} className={styles.refreshBtn}>
          <RefreshCw size={16} className={loading ? styles.spinning : ""} />
          Atualizar
        </button>
      </div>
    </div>
  );
}