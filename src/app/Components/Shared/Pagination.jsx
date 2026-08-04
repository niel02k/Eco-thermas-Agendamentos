// src/app/Components/Shared/Pagination.jsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "@/app/Components/Shared/Shared.module.css";

export default function Pagination({ pagina, totalPaginas, total, onPageChange }) {
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled={pagina <= 1} onClick={() => onPageChange(pagina - 1)}>
        <ChevronLeft size={16} /> Anterior
      </button>
      <span className={styles.pageInfo}>Página {pagina} de {totalPaginas} · {total} registros</span>
      <button className={styles.pageBtn} disabled={pagina >= totalPaginas} onClick={() => onPageChange(pagina + 1)}>
        Próximo <ChevronRight size={16} />
      </button>
    </div>
  );
}