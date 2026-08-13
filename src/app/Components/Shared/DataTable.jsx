// src/app/Components/Shared/DataTable.jsx

import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import DataRow from "./DataRow";
import Pagination from "./Pagination";
import ExportVouchersButton from "@/app/Components/ModalAgendamento/ExportVouchersButton";
import styles from "@/app/Components/Shared/Shared.module.css";

export default function DataTable({
  tipo = "agendamento",
  dados = [],
  loading,
  total,
  pagina,
  totalPaginas,
  busca,
  onBuscaChange,
  onPageChange,
  onRowClick,
  showExport = false,
  showSearch = false,

}) {


  const isAgendamento = tipo === "agendamento";

  const columns = isAgendamento
    ? ["Código", "Cliente", "Data / Horário", "Pessoas", "Status"]
    : ["#", "Cliente", "Consultor", "Valor", "Status"];


  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTop}>
        <div>
          <h3>{isAgendamento ? "Agendamentos" : "Contratos"}</h3>
          <span className={styles.tableCount}>
            {loading
              ? "Carregando..."
              : `${total} registro${total !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className={styles.tableActions}>
          {showSearch && (
            <div className={styles.searchBar}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busca || ""}
                onChange={onBuscaChange}
                className={styles.searchInput}
              />
            </div>
          )}


          {showExport && (
            <ExportVouchersButton
              agendamentos={dados}
              disabled={loading}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Carregando...</span>
        </div>
      ) : dados.length === 0 ? (
        <div className={styles.emptyBox}>
          <p>Nenhum registro encontrado</p>
        </div>
      ) : (
        <>
          <div className={styles.tableHead}>
            {columns.map((col) => (
              <span key={col}>{col}</span>
            ))}
          </div>

          <div className={styles.tableBody}>
            {dados.map((item) => (
              <DataRow
                key={item.codigo || item.id}
                tipo={tipo}
                dados={item}
                onRowClick={onRowClick}
              />
            ))}
          </div>

          {totalPaginas > 1 && (
            <Pagination
              pagina={pagina}
              totalPaginas={totalPaginas}
              total={total}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}




    </div>
  );
}