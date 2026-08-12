// src/app/Components/Shared/DataTable.jsx
"use client";

<<<<<<< Updated upstream
import React from "react";
import { Search } from "lucide-react";
import DataRow from "./DataRow";
=======
import React, { useState } from "react";
import { Search, Filter, X, Calendar } from "lucide-react"; // 🔥 Adicionar Calendar
import DataRow from "@/app/Components/Shared/DataRow.jsx";
>>>>>>> Stashed changes
import Pagination from "./Pagination";
import ExportVouchersButton from "@/app/Components/ModalAgendamento/ExportVouchersButton";
import styles from "@/app/Components/Shared/Shared.module.css";

export default function DataTable({
  tipo = 'agendamento',
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
<<<<<<< Updated upstream
=======
  onFiltroDataChange,
  filtroDataAtivo = null, // 🔥 NOVA PROP
  onLimparFiltroData = null, // 🔥 NOVA PROP
>>>>>>> Stashed changes
}) {
  const isAgendamento = tipo === 'agendamento';

<<<<<<< Updated upstream
  const columns = isAgendamento 
    ? ['Código', 'Cliente', 'Data / Horário', 'Pessoas', 'Status']
    : ['#', 'Cliente', 'Consultor', 'Valor', 'Status'];
=======
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
>>>>>>> Stashed changes

  // Formatar data para exibição
  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTop}>
        <div>
          <h3>{isAgendamento ? 'Agendamentos' : 'Contratos'}</h3>
          <span className={styles.tableCount}>
            {loading ? "Carregando..." : `${total} registro${total !== 1 ? "s" : ""}`}
          </span>
          
          {/* 🔥 BADGE DE FILTRO ATIVO */}
          {filtroDataAtivo && (
            <span className={styles.filterBadge}>
              <Calendar size={12} />
              {formatarData(filtroDataAtivo)}
              {onLimparFiltroData && (
                <button 
                  onClick={onLimparFiltroData} 
                  className={styles.filterBadgeRemove}
                  title="Remover filtro"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          )}
        </div>

        <div className={styles.tableActions}>
          {showSearch && (
            <div className={styles.searchBar}>
              <Search size={16} color="#94A3B8" />
              <input type="text" placeholder="Buscar..." value={busca || ""} onChange={onBuscaChange} className={styles.searchInput} />
            </div>
          )}
<<<<<<< Updated upstream
          {showExport && <ExportVouchersButton agendamentos={dados} disabled={loading} />}
=======

          {isAgendamento && (
            <button
              type="button"
              className={`${styles.filterButton} ${filtroDataAtivo ? styles.filterButtonActive : ''}`}
              onClick={() => setModalFiltroAberto(true)}
            >
              <Filter size={16} />
              Filtro
              {filtroDataAtivo && <span className={styles.filterDot} />}
            </button>
          )}

          {showExport && (
            <ExportVouchersButton
              agendamentos={dados}
              disabled={loading}
            />
          )}
>>>>>>> Stashed changes
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}><div className={styles.spinner} /><span>Carregando...</span></div>
      ) : dados.length === 0 ? (
<<<<<<< Updated upstream
        <div className={styles.emptyBox}><p>Nenhum registro encontrado</p></div>
=======
        <div className={styles.emptyBox}>
          <p>Nenhum registro encontrado</p>
          {filtroDataAtivo && (
            <button className={styles.emptyClearFilter} onClick={onLimparFiltroData}>
              Limpar filtros
            </button>
          )}
        </div>
>>>>>>> Stashed changes
      ) : (
        <>
          <div className={styles.tableHead}>
            {columns.map(col => <span key={col}>{col}</span>)}
          </div>
          <div className={styles.tableBody}>
            {dados.map(item => (
              <DataRow key={item.codigo || item.id} tipo={tipo} dados={item} onRowClick={onRowClick} />
            ))}
          </div>
          {totalPaginas > 1 && (
            <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onPageChange={onPageChange} />
          )}
        </>
      )}
    </div>
  );
}