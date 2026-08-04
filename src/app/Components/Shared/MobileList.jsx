// src/app/Components/Shared/MobileList.jsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MobileCard from "./MobileCard";
import styles from "@/app/Components/Shared/Shared.module.css";

export default function MobileList({
  dados = [],
  tipo = 'agendamento',
  loading,
  total,
  pagina,
  totalPaginas,
  onPageChange,
  onCardClick,
  emptyMessage = "Nenhum registro encontrado"
}) {
  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.mobileContainer}>
      {/* Paginação no topo */}
      {totalPaginas > 1 && (
        <div className={styles.mobilePagination}>
          <button 
            className={styles.mobilePageBtn}
            disabled={pagina <= 1}
            onClick={() => onPageChange(pagina - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.mobilePageInfo}>{pagina} de {totalPaginas}</span>
          <button 
            className={styles.mobilePageBtn}
            disabled={pagina >= totalPaginas}
            onClick={() => onPageChange(pagina + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Cards */}
      <div className={styles.mobileCards}>
        {dados.map(item => (
          <MobileCard
            key={item.codigo || item.id}
            dados={item}
            tipo={tipo}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}