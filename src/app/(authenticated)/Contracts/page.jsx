"use client";

import React, { useEffect, useMemo, useState } from "react";
import {Plus, TrendingUp, Award, Activity, DollarSign, BarChart3,Filter, Search, RefreshCw, ChevronLeft, ChevronRight,Eye, Edit, Trash2, X , Pencil} from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import styles from "./Contracts.module.css";
import ReceitaMensalChart from "@/app/Components/ReceitaMensal/ReceitaMensalChart.jsx";
import CriarContrato from "@/app/Components/CriarContrato/CriarContrato.jsx";
import EditarContrato from "@/app/Components/EditarContrato/EditarContrato.jsx";
import { useContratosPage } from "@/app/hooks/useContratosPage";
import { STATUS_CONTRATO, STATUS_CONTRATO_LABELS, PAGAMENTO, PAGAMENTO_LABELS } from "@/lib/constats";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Contracts() {
  const [visible, setVisible] = useState(false);

  const {
    // Dados
    contratos,
    total,
    pagina,
    busca,
    filtroStatus,
    receita8m,
    ticketInfo,
    loading,
    error,
    
    // Modal
    contratoSelecionado,
    modalAberto,
    showCriarContrato,
    showEditarContrato,
    contratoParaEditar,
    
    // Setters
    setPagina,
    setBusca,
    setFiltroStatus,
    setError,
    setModalAberto,
    setShowCriarContrato,
    setShowEditarContrato,
    setContratoParaEditar,
    
    // Ações
    carregarContratos,
    carregarMetricas,
    buscarContrato,
    handleEditar,
    handleExcluir,
    handleContratoCriado,
    handleContratoEditado
  } = useContratosPage();

  // Efeito de animação
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];

    const hojeCount = contratos.filter(c =>
      c.data_criacao?.startsWith(hoje) ||
      c.data_inicio?.startsWith(hoje)
    ).length;

    const ativos = contratos.filter(c => c.status === STATUS_CONTRATO.ATIVO).length;
    const totalPagina = contratos.length;

    const receitaPagina = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
    const ticketMedioGeral = ticketInfo?.ticket_medio || (totalPagina ? receitaPagina / totalPagina : 0);
    const receitaTotal = ticketInfo?.valor_total || receitaPagina;
    const conversion = totalPagina ? Math.round((ativos / totalPagina) * 100) : 0;

    return [
      {
        title: "Hoje",
        value: hojeCount,
        label: "Contratos hoje",
        icon: Activity,
        color: "blue",
        tooltip: `Contratos criados hoje`
      },
      {
        title: "Ativos",
        value: ativos,
        label: "Contratos ativos",
        icon: BarChart3,
        color: "green",
        tooltip: "Contratos com status ATIVO"
      },
      {
        title: "Total",
        value: total,
        label: "Total de contratos",
        icon: TrendingUp,
        color: "blue",
        tooltip: "Total de contratos encontrados"
      },
      {
        title: "Receita",
        value: formatCurrency(receitaTotal),
        label: "Total no período",
        icon: DollarSign,
        color: "green",
        tooltip: "Receita total do período"
      },
      {
        title: "Conversão",
        value: `${conversion}%`,
        label: "Taxa de conversão",
        icon: TrendingUp,
        color: conversion > 50 ? "green" : "yellow",
        tooltip: "Contratos ativos / Total"
      },
      {
        title: "Ticket Médio",
        value: formatCurrency(ticketMedioGeral),
        label: "Valor médio",
        icon: Award,
        color: "yellow",
        tooltip: "Média de valor por contrato"
      }
    ];
  }, [contratos, total, ticketInfo]);

  // Insights com dados reais
  const insights = useMemo(() => {
    const porVendedor = {};
    const porStatus = {};

    contratos.forEach((c) => {
      const nomeVend = c.vendedor?.nome || "Sem consultor";
      const valor = Number(c.valor_total || 0);

      porVendedor[nomeVend] = {
        total: (porVendedor[nomeVend]?.total || 0) + valor,
        quantidade: (porVendedor[nomeVend]?.quantidade || 0) + 1
      };

      const status = c.status || STATUS_CONTRATO.PENDENTE;
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    const topVendedores = Object.entries(porVendedor)
      .map(([nome, dados]) => ({
        nome,
        ...dados,
        ticket_medio: dados.total / dados.quantidade
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const statusDist = Object.entries(porStatus)
      .map(([status, count]) => ({
        status,
        count,
        label: STATUS_CONTRATO_LABELS[status] || status
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topVendedores,
      statusDist,
      totalVendedores: Object.keys(porVendedor).length
    };
  }, [contratos]);

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(total / 10));

  // Função para obter a classe CSS do status
  const getStatusClass = (status) => {
    const statusLower = String(status || "").toLowerCase();
    switch (statusLower) {
      case 'ativo':
        return styles.ativo;
      case 'pendente':
        return styles.pendente;
      case 'bloqueado':
        return styles.bloqueado;
      case 'encerrado':
        return styles.encerrado;
      case 'cancelado':
        return styles.cancelado;
      default:
        return styles.pendente;
    }
  };

  // Renderizar modal de detalhes
  const renderModal = () => {
    if (!modalAberto) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setModalAberto(false)}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>Detalhes do Contrato</h3>
            <button
              className={styles.modalClose}
              onClick={() => setModalAberto(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {contratoSelecionado && (
              <div className={styles.contratoDetalhes}>
                <div className={styles.detalheLinha}>
                  <strong>Código:</strong> {contratoSelecionado.id}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Titular:</strong> {contratoSelecionado.titular_nome}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>CPF:</strong> {contratoSelecionado.titular_cpf}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Email:</strong> {contratoSelecionado.titular_email || 'Não informado'}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Telefone:</strong> {contratoSelecionado.titular_telefone || 'Não informado'}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Cidade:</strong> {contratoSelecionado.cidade || 'Não informada'}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Valor:</strong> {formatCurrency(contratoSelecionado.valor_total)}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Status:</strong>
                  <span className={`${styles.status} ${getStatusClass(contratoSelecionado.status)}`}>
                    {STATUS_CONTRATO_LABELS[contratoSelecionado.status] || contratoSelecionado.status}
                  </span>
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Forma Pagamento:</strong> {PAGAMENTO_LABELS[contratoSelecionado.forma_pagamento] || contratoSelecionado.forma_pagamento}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Parcelas:</strong> {contratoSelecionado.parcelas || 1}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Data Início:</strong> {new Date(contratoSelecionado.data_inicio).toLocaleDateString('pt-BR')}
                </div>
                {contratoSelecionado.data_fim && (
                  <div className={styles.detalheLinha}>
                    <strong>Data Fim:</strong> {new Date(contratoSelecionado.data_fim).toLocaleDateString('pt-BR')}
                  </div>
                )}
                <div className={styles.detalheLinha}>
                  <strong>Consultor:</strong> {contratoSelecionado.vendedor?.nome || 'Não informado'}
                </div>
                {contratoSelecionado.observacoes && (
                  <div className={styles.detalheLinha}>
                    <strong>Observações:</strong> {contratoSelecionado.observacoes}
                  </div>
                )}

                {contratoSelecionado.dependentes && contratoSelecionado.dependentes.length > 0 && (
                  <div className={styles.dependentesSection}>
                    <h4>Dependentes</h4>
                    {contratoSelecionado.dependentes.map((dep, idx) => (
                      <div key={idx} className={styles.dependenteItem}>
                        <span>{dep.nome}</span>
                        {dep.cpf && <span> - CPF: {dep.cpf}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.btnEditar}
              onClick={() => {
                setModalAberto(false);
                handleEditar(contratoSelecionado.id);
              }}
            >
              <Pencil size={16} />
              Editar
            </button>
            <button
              className={styles.btnFechar}
              onClick={() => setModalAberto(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ""}`}>
        <div className={styles.content}>
          <PageHeader
            title="Contratos"
            subtitle="Gestão e análise de contratos emitidos"
            actionLabel="Novo Contrato"
            actionIcon={Plus}
            onAction={() => setShowCriarContrato(true)}
          />

          {/* Busca e Filtros */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por titular ou dependente..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  if (e.target.value.length === 0) {
                    setPagina(1);
                    carregarContratos();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && busca.length > 2) {
                    setPagina(1);
                    carregarContratos();
                  }
                }}
                className={styles.searchInput}
              />
              {busca && (
                <button
                  className={styles.clearSearch}
                  onClick={() => {
                    setBusca('');
                    setPagina(1);
                    carregarContratos();
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.filtersGroup}>
              <select
                className={styles.filterSelect}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_CONTRATO).map(([key, value]) => (
                  <option key={key} value={value}>
                    {STATUS_CONTRATO_LABELS[key]}
                  </option>
                ))}
              </select>

              <button
                className={styles.refreshButton}
                onClick={() => {
                  carregarContratos();
                  carregarMetricas();
                }}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                Atualizar
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button onClick={() => setError(null)}><X size={16} /></button>
            </div>
          )}

          {/* KPIs */}
          <div className={styles.statsGrid}>
            {kpis.map((k, i) => (
              <div key={k.title} className={styles.cardEntry} style={{ animationDelay: `${i * 80}ms` }}>
                <StatCard {...k} />
              </div>
            ))}
          </div>

          {/* Insights Avançados */}
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>🏆 Top Consultores</h3>
              {insights.topVendedores.map((vendedor, idx) => (
                <div key={idx} className={styles.vendedorRank}>
                  <span className={styles.rank}>{idx + 1}º</span>
                  <span className={styles.vendedorNome}>{vendedor.nome}</span>
                  <span className={styles.vendedorStats}>
                    {formatCurrency(vendedor.total)} ({vendedor.quantidade} contratos)
                  </span>
                </div>
              ))}
              {insights.topVendedores.length === 0 && (
                <p className={styles.semDados}>Nenhum consultor com vendas no período</p>
              )}
            </div>

            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>📊 Distribuição de Status</h3>
              {insights.statusDist.map((item) => (
                <div key={item.status} className={styles.statusBar}>
                  <span className={styles.statusLabel}>{item.label}</span>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${getStatusClass(item.status)}`}
                      style={{
                        width: `${(item.count / (contratos.length || 1)) * 100}%`
                      }}
                    />
                  </div>
                  <span className={styles.statusCount}>{item.count}</span>
                </div>
              ))}
              {insights.statusDist.length === 0 && (
                <p className={styles.semDados}>Nenhum contrato encontrado</p>
              )}
            </div>

            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>📦 Métricas Gerais</h3>
              <div className={styles.metricasRapidas}>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Total Consultores</span>
                  <span className={styles.metricaValor}>{insights.totalVendedores}</span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Ticket Médio</span>
                  <span className={styles.metricaValor}>
                    {formatCurrency(ticketInfo?.ticket_medio || 0)}
                  </span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Contratos Ativos</span>
                  <span className={styles.metricaValor}>
                    {contratos.filter(c => c.status === STATUS_CONTRATO.ATIVO).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Contratos */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3>Lista de Contratos</h3>
              <div className={styles.tableControls}>
                <span className={styles.totalRegistros}>
                  {total} contrato{total !== 1 ? 's' : ''}
                </span>
                <div className={styles.paginationControls}>
                  <button
                    disabled={pagina <= 1 || loading}
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    className={styles.paginationBtn}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={styles.pageInfo}>
                    {pagina} / {totalPaginas}
                  </span>
                  <button
                    disabled={pagina >= totalPaginas || loading}
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    className={styles.paginationBtn}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span>Carregando contratos...</span>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <div className={styles.tableRowHeader}>
                  <span>Código</span>
                  <span>Cliente</span>
                  <span>Cidade</span>
                  <span>Consultor</span>
                  <span>Valor</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>

                {contratos.map((c) => (
                  <div key={c.id} className={styles.tableRow}>
                    <span className={styles.codigo}>{c.id}</span>
                    <span className={`${styles.cliente} ${getStatusClass(c.status)}`}>
                      {c.titular_nome}
                    </span>
                    <span className={styles.cidade}>{c.cidade || "—"}</span>
                    <span className={styles.vendedor}>{c.vendedor?.nome || "—"}</span>
                    <span className={styles.valor}>{formatCurrency(c.valor_total)}</span>
                    <span className={`${styles.status} ${getStatusClass(c.status)}`}>
                      {STATUS_CONTRATO_LABELS[c.status] || c.status}
                    </span>
                    <span className={styles.acoes}>
                      <button
                        className={styles.btnAcao}
                        onClick={() => buscarContrato(c.id)}
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.btnAcao}
                        onClick={() => handleEditar(c.id)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`${styles.btnAcao} ${styles.btnExcluir}`}
                        onClick={() => handleExcluir(c.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </div>
                ))}

                {contratos.length === 0 && !loading && (
                  <div className={styles.emptyState}>
                    <p>Nenhum contrato encontrado</p>
                    <p className={styles.emptySubtext}>
                      {busca ? 'Tente ajustar os termos da busca' : 'Comece criando um novo contrato'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mini gráfico de receita mensal */}
          {receita8m.length > 0 && (
            <ReceitaMensalChart
              data={receita8m}
              height={300}
              title="Receita Mensal"
              subtitle="Últimos 8 meses"
              colors={['#1E6EBE', '#3CC83C', '#FA643C', '#991094', '#6EC8F0', '#FAD228', '#EF4444', '#8B5CF6']}
            />
          )}

          {/* Modal de detalhes */}
          {renderModal()}

          {/* Modal de criação de contrato */}
          {showCriarContrato && (
            <div className={styles.modalOverlay}>
              <CriarContrato
                onClose={() => setShowCriarContrato(false)}
                onSuccess={handleContratoCriado}
              />
            </div>
          )}

          {/* Modal de edição de contrato */}
          {showEditarContrato && contratoParaEditar && (
            <div className={styles.modalOverlay}>
              <EditarContrato
                contrato={contratoParaEditar}
                onClose={() => {
                  setShowEditarContrato(false);
                  setContratoParaEditar(null);
                }}
                onSuccess={handleContratoEditado}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}