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
  onFiltroDataChange,
}) {
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

  const isAgendamento = tipo === "agendamento";

  const columns = isAgendamento
    ? ["Código", "Cliente", "Data / Horário", "Pessoas", "Status"]
    : ["#", "Cliente", "Consultor", "Valor", "Status"];

  // Gerar opções de dias (1-31)
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Gerar opções de meses
  const meses = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  // Gerar opções de anos (últimos 5 anos)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => (anoAtual - i).toString());

  const aplicarFiltro = () => {
    if (!diaSelecionado || !mesSelecionado) {
      alert("Selecione o dia e o mês");
      return;
    }

    // Formata para YYYY-MM-DD
    const dataFormatada = `${anoSelecionado}-${mesSelecionado}-${diaSelecionado.padStart(2, '0')}`;
    onFiltroDataChange?.(dataFormatada);
    setModalFiltroAberto(false);
  };

  const limparFiltro = () => {
    setDiaSelecionado("");
    setMesSelecionado("");
    setAnoSelecionado(anoAtual.toString());
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

      {/* MODAL DE FILTRO */}
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
                <span>Selecione o dia e o mês</span>
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

            <div className={styles.filterRow}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="dia-filtro">
                  Dia
                </label>
                <select
                  id="dia-filtro"
                  value={diaSelecionado}
                  onChange={(event) => setDiaSelecionado(event.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Dia</option>
                  {dias.map((dia) => (
                    <option key={dia} value={dia.toString().padStart(2, '0')}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="mes-filtro">
                  Mês
                </label>
                <select
                  id="mes-filtro"
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(event.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Mês</option>
                  {meses.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="ano-filtro">
                  Ano
                </label>
                <select
                  id="ano-filtro"
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(event.target.value)}
                  className={styles.filterSelect}
                >
                  {anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                disabled={!diaSelecionado || !mesSelecionado}
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