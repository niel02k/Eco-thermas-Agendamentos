"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, TrendingUp, Award, Activity, DollarSign, BarChart3,
  Filter, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, X
} from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import styles from "./Contracts.module.css";
import ReceitaMensalChart from "@/app/Components/ReceitaMensal/ReceitaMensalChart.jsx";
import { buscarContratoPorId, listarContratos, buscarContratosPorNome, criarContrato, atualizarContrato, excluirContrato, receitaPorMes, ticketMedio } from "@/app/services/contratosServices.js";

const CONTRACT_TYPES = {
  EFV: "Vitalício",
  PM: "3 Anos",
  GD: "Gold"
};

const CONTRACT_STATUS = {
  ATIVO: "Ativo",
  PENDENTE: "Pendente",
  CANCELADO: "Cancelado",
  FINALIZADO: "Finalizado"
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Contracts() {
  const [visible, setVisible] = useState(false);

  // Estados principais
  const [contratos, setContratos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados para métricas
  const [receita8m, setReceita8m] = useState([]);
  const [ticketInfo, setTicketInfo] = useState(null);

  // Estados para modal/detalhes
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState('visualizar');

  // Efeito de animação
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Carregar contratos com filtros
  const carregarContratos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      let params = { pagina, limite };

      // Se tiver busca, usar o serviço de busca por nome
      if (busca && busca.length > 2) {
        const resultados = await buscarContratosPorNome(busca);
        setContratos(resultados || []);
        setTotal(resultados?.length || 0);
      } else {
        const resp = await listarContratos({
          pagina,
          limite,
          busca: busca || undefined
        });
        setContratos(resp.contratos || []);
        setTotal(resp.total || 0);
      }
    } catch (e) {
      setErro(e.message || "Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  }, [pagina, limite, busca]);

  // Carregar métricas
  const carregarMetricas = useCallback(async () => {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const [r8m, tm] = await Promise.all([
        receitaPorMes(),
        ticketMedio({
          inicio: inicioMes.toISOString().split('T')[0],
          fim: hoje.toISOString().split('T')[0],
          status: ['ATIVO']
        })
      ]);

      setReceita8m(r8m || []);
      setTicketInfo(tm || null);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }, []);

  // Buscar contrato específico
  const buscarContrato = useCallback(async (id) => {
    try {
      const contrato = await buscarContratoPorId(id);
      setContratoSelecionado(contrato);
      setModalAberto(true);
      setModalTipo('visualizar');
    } catch (error) {
      setErro('Erro ao buscar contrato: ' + error.message);
    }
  }, []);

  // Excluir contrato
  const handleExcluir = useCallback(async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      await excluirContrato(id);
      await carregarContratos();
      await carregarMetricas();
    } catch (error) {
      setErro('Erro ao excluir contrato: ' + error.message);
    }
  }, [carregarContratos, carregarMetricas]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  useEffect(() => {
    carregarMetricas();
  }, [carregarMetricas]);

  // Aplicar filtros ao buscar
  const aplicarFiltros = useCallback(() => {
    setPagina(1);
    carregarContratos();
  }, [carregarContratos]);

  // KPIs melhorados
  const kpis = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const hojeStr = new Date().toDateString();

    const hojeCount = contratos.filter(c =>
      c.data_criacao?.startsWith(hoje) ||
      c.data_inicio?.startsWith(hoje)
    ).length;

    const ativos = contratos.filter(c => c.status === "ATIVO").length;
    const totalPagina = contratos.length;

    // Receita total da página
    const receitaPagina = contratos.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);

    // Dados do ticket médio
    const ticketMedioGeral = ticketInfo?.ticket_medio || (totalPagina ? receitaPagina / totalPagina : 0);
    const receitaTotal = ticketInfo?.valor_total || receitaPagina;

    // Cálculo de conversão mais realista
    const conversion = totalPagina ? Math.round((ativos / totalPagina) * 100) : 0;

    return [
      {
        title: "Hoje",
        value: hojeCount,
        label: "Contratos hoje",
        icon: Activity,
        color: "blue",
        tooltip: `Contratos criados em ${hojeStr}`
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
    // Análise por vendedor
    const porVendedor = {};
    const porTipo = {};
    const porStatus = {};

    contratos.forEach((c) => {
      const nomeVend = c.vendedor?.nome || "Sem vendedor";
      const valor = Number(c.valor_total || 0);

      porVendedor[nomeVend] = {
        total: (porVendedor[nomeVend]?.total || 0) + valor,
        quantidade: (porVendedor[nomeVend]?.quantidade || 0) + 1
      };

      const tipo = c.tipo || c.plano || "EFV";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      const status = c.status || "PENDENTE";
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    // Top vendedores
    const topVendedores = Object.entries(porVendedor)
      .map(([nome, dados]) => ({
        nome,
        ...dados,
        ticket_medio: dados.total / dados.quantidade
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    // Análise de tipos
    const tipoMaisVendido = Object.entries(porTipo)
      .sort((a, b) => b[1] - a[1])[0];

    // Status distribution
    const statusDist = Object.entries(porStatus)
      .map(([status, count]) => ({
        status,
        count,
        label: CONTRACT_STATUS[status] || status
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topVendedores,
      tipoMaisVendido,
      statusDist,
      totalVendedores: Object.keys(porVendedor).length
    };
  }, [contratos]);

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  // Renderizar modal
  const renderModal = () => {
    if (!modalAberto) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setModalAberto(false)}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>
              {modalTipo === 'visualizar' && 'Detalhes do Contrato'}
              {modalTipo === 'editar' && 'Editar Contrato'}
              {modalTipo === 'novo' && 'Novo Contrato'}
            </h3>
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
                  <strong>Código:</strong> {contratoSelecionado.codigo || contratoSelecionado.id}
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
                  <strong>Tipo:</strong> {CONTRACT_TYPES[contratoSelecionado.tipo] || contratoSelecionado.tipo}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Valor:</strong> {formatCurrency(contratoSelecionado.valor_total)}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Status:</strong>
                  <span className={`${styles.status} ${styles[String(contratoSelecionado.status || "").toLowerCase()]}`}>
                    {contratoSelecionado.status}
                  </span>
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Forma Pagamento:</strong> {contratoSelecionado.forma_pagamento || 'Não definida'}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Parcelas:</strong> {contratoSelecionado.parcelas || 1}
                </div>
                <div className={styles.detalheLinha}>
                  <strong>Data Início:</strong> {new Date(contratoSelecionado.data_inicio).toLocaleDateString()}
                </div>
                {contratoSelecionado.data_fim && (
                  <div className={styles.detalheLinha}>
                    <strong>Data Fim:</strong> {new Date(contratoSelecionado.data_fim).toLocaleDateString()}
                  </div>
                )}
                <div className={styles.detalheLinha}>
                  <strong>Vendedor:</strong> {contratoSelecionado.vendedor?.nome || 'Não informado'}
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
            {modalTipo === 'visualizar' && (
              <>
                <button
                  className={styles.btnFechar}
                  onClick={() => setModalAberto(false)}
                >
                  Fechar
                </button>
              </>
            )}
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
            onAction={() => {
              setModalTipo('novo');
              setModalAberto(true);
              setContratoSelecionado(null);
            }}
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
                onChange={(e) => {
                  setFiltroStatus(e.target.value);
                }}
              >
                <option value="todos">Todos os status</option>
                <option value="ATIVO">Ativo</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="FINALIZADO">Finalizado</option>
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
          {erro && (
            <div className={styles.errorMessage}>
              {erro}
              <button onClick={() => setErro(null)}><X size={16} /></button>
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
            {/* Top Vendedores */}
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>🏆 Top Vendedores</h3>
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
                <p className={styles.semDados}>Nenhum vendedor com vendas no período</p>
              )}
            </div>

            {/* Distribuição de Status */}
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>📊 Distribuição de Status</h3>
              {insights.statusDist.map((item) => (
                <div key={item.status} className={styles.statusBar}>
                  <span className={styles.statusLabel}>{item.label}</span>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${styles[item.status.toLowerCase()]}`}
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

            {/* Tipo Mais Vendido e Métricas */}
            <div className={styles.insightCard}>
              <h3 className={styles.insightTitle}>📦 Análise de Produtos</h3>
              {insights.tipoMaisVendido && (
                <div className={styles.tipoDestaque}>
                  <p className={styles.tipoLabel}>Tipo mais vendido</p>
                  <p className={styles.tipoValor}>
                    {CONTRACT_TYPES[insights.tipoMaisVendido[0]] || insights.tipoMaisVendido[0]}
                  </p>
                  <p className={styles.tipoQuantidade}>
                    {insights.tipoMaisVendido[1]} contratos
                  </p>
                </div>
              )}
              <div className={styles.metricasRapidas}>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Total Vendedores</span>
                  <span className={styles.metricaValor}>{insights.totalVendedores}</span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Ticket Médio</span>
                  <span className={styles.metricaValor}>
                    {formatCurrency(ticketInfo?.ticket_medio || 0)}
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
                  <span>Tipo</span>
                  <span>Vendedor</span>
                  <span>Valor</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>

                {contratos.map((c) => (
                  <div key={c.id} className={styles.tableRow}>
                    <span className={styles.codigo}>{c.codigo || c.id}</span>
                    <span className={styles.cliente}>{c.titular_nome}</span>
                    <span className={styles.tipo}>
                      {CONTRACT_TYPES[c.tipo] || CONTRACT_TYPES[c.plano] || c.tipo || c.plano || "—"}
                    </span>
                    <span className={styles.vendedor}>{c.vendedor?.nome || "—"}</span>
                    <span className={styles.valor}>{formatCurrency(c.valor_total)}</span>
                    <span className={`${styles.status} ${styles[String(c.status || "").toLowerCase()]}`}>
                      {c.status}
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

          {/* Mini gráfico de receita mensal (simplificado) */}
          {receita8m.length > 0 && (
            <ReceitaMensalChart
              data={receita8m}
              height={300}
              title="Receita Mensal"
              subtitle="Últimos 8 meses"
              colors={['#1E6EBE', '#3CC83C', '#FA643C', '#991094', '#6EC8F0', '#FAD228', '#EF4444', '#8B5CF6']}
            />
          )}

          {/* Modal */}
          {renderModal()}
        </div>
      </main>
    </div>
  );
}