"use client";

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
  onFiltroDataChange,
}) {
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState("");

  const isAgendamento = tipo === "agendamento";

  const columns = isAgendamento
    ? ["Código", "Cliente", "Data / Horário", "Pessoas", "Status"]
    : ["#", "Cliente", "Consultor", "Valor", "Status"];

  const aplicarFiltro = () => {
    if (!dataSelecionada) return;

    onFiltroDataChange?.(dataSelecionada);
    setModalFiltroAberto(false);
  };

  const limparFiltro = () => {
    setDataSelecionada("");
    onFiltroDataChange?.(null);
    setModalFiltroAberto(false);
  };

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

          {isAgendamento && (
            <button
              type="button"
              className={styles.filterButton}
              onClick={() => setModalFiltroAberto(true)}
            >
              <Filter size={16} />
              Filtro
            </button>
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

      {modalFiltroAberto && (
        <div
          className={styles.filterOverlay}
          onClick={() => setModalFiltroAberto(false)}
        >
          <div
            className={styles.filterModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.filterModalHeader}>
              <div>
                <h4>Filtrar agendamentos</h4>
                <span>Selecione uma data específica</span>
              </div>

              <button
                type="button"
                className={styles.filterCloseButton}
                onClick={() => setModalFiltroAberto(false)}
                aria-label="Fechar filtro"
              >
                <X size={18} />
              </button>
            </div>

            <label className={styles.filterLabel} htmlFor="data-filtro">
              Data da visita
            </label>

            <input
              id="data-filtro"
              type="date"
              value={dataSelecionada}
              onChange={(event) => setDataSelecionada(event.target.value)}
              className={styles.filterDateInput}
            />

            <div className={styles.filterModalActions}>
              <button
                type="button"
                className={styles.filterClearButton}
                onClick={limparFiltro}
              >
                Limpar
              </button>

              <button
                type="button"
                className={styles.filterApplyButton}
                onClick={aplicarFiltro}
                disabled={!dataSelecionada}
              >
                Aplicar filtro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
