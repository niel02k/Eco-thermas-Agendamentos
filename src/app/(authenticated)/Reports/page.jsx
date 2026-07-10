"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {FileText,Download,TrendingUp,TrendingDown,DollarSign,Users,Activity,Calendar,Filter,Search,X,FileSpreadsheet,File,Printer,RefreshCw,ChevronLeft,ChevronRight,Eye,AlertCircle} from "lucide-react";

import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import styles from "./Reports.module.css";

// Services
import { listarContratos, buscarContratosPorNome, ticketMedio } from "@/app/services/contratosServices.js";
import { listarAgendamentos, buscarAgendamentosPorNome } from "@/app/services/agendamentosServices.js";
import { listarUsuarios } from "@/app/services/usuarioServices.js";
import { exportToExcel, exportToPDF, formatDataForExport } from "@/app/services/exportServices.js";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_COLORS = {
  ATIVO: '#3CC83C',
  PENDENTE: '#FAD228',
  CANCELADO: '#EF4444',
  FINALIZADO: '#1E6EBE',
  REALIZADO: '#3CC83C',
  CONFIRMADO: '#1E6EBE'
};
const formatDate =(date) =>{
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");

};

export default function Reports() {
  const [visible, setVisible] = useState(false);
  
  // Estados de dados
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [dadosExibicao, setDadosExibicao] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipo: 'contratos',
    busca: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    consultor: '', // Mudado de vendedor para consultor
    valorMin: '',
    valorMax: ''
  });
  
  // Estado de consultores
  const [consultores, setConsultores] = useState([]);
  const [carregandoConsultores, setCarregandoConsultores] = useState(false);
  
  // Estado de métricas
  const [metricas, setMetricas] = useState({
    totalValor: 0,
    totalRegistros: 0,
    mediaValor: 0,
    conversao: 0
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Carregar consultores (corrigido para CONSULTOR)
  const carregarConsultores = useCallback(async () => {
    setCarregandoConsultores(true);
    try {
      const response = await listarUsuarios({ 
        status: 'ATIVO',
        cargo: 'CONSULTOR' // Mudado de VENDEDOR para CONSULTOR
      });
      
      if (response && response.usuarios) {
        setConsultores(response.usuarios);
      } else {
        // Se não encontrar consultores, tenta buscar todos os usuários ativos
        const allUsers = await listarUsuarios({ status: 'ATIVO' });
        if (allUsers && allUsers.usuarios) {
          setConsultores(allUsers.usuarios);
        } else {
          setConsultores([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar consultores:', error);
      setConsultores([]);
    } finally {
      setCarregandoConsultores(false);
    }
  }, []);

  // Carregar dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    
    try {
      let dados = [];
      let total = 0;
      
      // Busca por nome se tiver busca
      if (filtros.busca && filtros.busca.length > 2) {
        if (filtros.tipo === 'contratos' || filtros.tipo === 'todos') {
          const contratos = await buscarContratosPorNome(filtros.busca);
          if (contratos && contratos.length > 0) {
            const contratosComTipo = contratos.map(c => ({
              ...c,
              module: 'Contrato',
              cliente: c.titular_nome,
              seller: c.vendedor?.nome,
              value: c.valor_total,
              date: c.data_criacao
            }));
            dados = [...dados, ...contratosComTipo];
          }
        }
        if (filtros.tipo === 'agendamentos' || filtros.tipo === 'todos') {
          const agendamentos = await buscarAgendamentosPorNome(filtros.busca);
          if (agendamentos && agendamentos.length > 0) {
            const agendamentosComTipo = agendamentos.map(a => ({
              ...a,
              module: 'Agendamento',
              cliente: a.cliente?.nome,
              seller: a.vendedor_id,
              value: 0,
              date: a.data_visita,
              codigo: a.codigo
            }));
            dados = [...dados, ...agendamentosComTipo];
          }
        }
        total = dados.length;
      } else {
        // Busca com paginação
        if (filtros.tipo === 'contratos' || filtros.tipo === 'todos') {
          try {
            const response = await listarContratos({
              pagina,
              limite,
              busca: filtros.busca
            });
            
            if (response && response.contratos) {
              const contratosComTipo = response.contratos.map(c => ({
                ...c,
                module: 'Contrato',
                cliente: c.titular_nome,
                seller: c.vendedor?.nome,
                value: c.valor_total,
                date: c.data_criacao
              }));
              dados = [...dados, ...contratosComTipo];
              total = response.total || 0;
            }
          } catch (error) {
            console.error('Erro ao carregar contratos:', error);
          }
        }
        
        if (filtros.tipo === 'agendamentos' || filtros.tipo === 'todos') {
          try {
            const response = await listarAgendamentos({
              pagina,
              limite,
              busca: filtros.busca
            });
            
            if (response && response.agendamentos) {
              const agendamentosComTipo = response.agendamentos.map(a => ({
                ...a,
                module: 'Agendamento',
                cliente: a.cliente?.nome,
                seller: a.vendedor_id,
                value: 0,
                date: a.data_visita,
                codigo: a.codigo
              }));
              
              if (filtros.tipo === 'todos') {
                dados = [...dados, ...agendamentosComTipo];
                total = total + (response.total || 0);
              } else {
                dados = agendamentosComTipo;
                total = response.total || 0;
              }
            }
          } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
          }
        }
      }
      
      // Aplicar filtros adicionais em memória
      let dadosFiltrados = dados;
      
      // Filtrar por status
      if (filtros.status) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.status === filtros.status
        );
      }
      
      // Filtrar por consultor (mudado de vendedor)
      if (filtros.consultor) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.vendedor_id === filtros.consultor || 
          item.vendedor?.id === filtros.consultor ||
          item.seller === filtros.consultor
        );
      }
      
      // Filtrar por valor
      if (filtros.valorMin) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          Number(item.value || item.valor_total || 0) >= Number(filtros.valorMin)
        );
      }
      if (filtros.valorMax) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          Number(item.value || item.valor_total || 0) <= Number(filtros.valorMax)
        );
      }
      
      // Filtrar por data
      if (filtros.dataInicio) {
        dadosFiltrados = dadosFiltrados.filter(item => {
          const data = item.data_inicio || item.data_visita || item.date;
          return data && data >= filtros.dataInicio;
        });
      }
      if (filtros.dataFim) {
        dadosFiltrados = dadosFiltrados.filter(item => {
          const data = item.data_inicio || item.data_visita || item.date;
          return data && data <= filtros.dataFim;
        });
      }
      
      setDadosExibicao(dadosFiltrados);
      setTotalRegistros(dadosFiltrados.length);
      
      // Calcular métricas
      const valores = dadosFiltrados
        .map(item => Number(item.value || item.valor_total || 0))
        .filter(v => v > 0);
      
      const totalValor = valores.reduce((acc, v) => acc + v, 0);
      const mediaValor = valores.length > 0 ? totalValor / valores.length : 0;
      
      // Calcular conversão (apenas para contratos)
      const contratosFiltrados = dadosFiltrados.filter(item => item.module === 'Contrato');
      const ativos = contratosFiltrados.filter(item => item.status === 'ATIVO').length;
      const conversao = contratosFiltrados.length > 0 ? (ativos / contratosFiltrados.length) * 100 : 0;
      
      setMetricas({
        totalValor,
        totalRegistros: dadosFiltrados.length,
        mediaValor,
        conversao
      });
      
    } catch (error) {
      setErro(error.message || 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagina, limite]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarConsultores();
  }, [carregarConsultores]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      tipo: 'contratos',
      busca: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      consultor: '', // Mudado de vendedor
      valorMin: '',
      valorMax: ''
    });
    setPagina(1);
  };

 const handleExportExcel = () => {
  if (dadosExibicao.length === 0) {
    alert('Não há dados para exportar!');
    return;
  }

  // Preparar dados para exportação
  const dadosExport = dadosExibicao.map(item => ({
    'Código': item.codigo || item.id || '-',
    'Módulo': item.module || 'Contrato',
    'Cliente': item.titular_nome || item.cliente?.nome || item.cliente || '-',
    'Consultor': item.vendedor?.nome || item.seller || '-', // Nome do consultor
    'Valor': formatCurrency(item.valor_total || item.value || 0),
    'Status': item.status || '-',
    'Data': item.data_criacao || item.data_inicio || item.data_visita || item.date || '-'
  }));

  exportToExcel(dadosExport, `relatorio_${filtros.tipo}_${new Date().toISOString().split('T')[0]}`);
};

const handleExportPDF = () => {
  if (dadosExibicao.length === 0) {
    alert('Não há dados para exportar!');
    return;
  }

  // Preparar dados para exportação
  const dadosExport = dadosExibicao.map(item => ({
    'Código': item.codigo || item.id || '-',
    'Módulo': item.module || 'Contrato',
    'Cliente': item.titular_nome || item.cliente?.nome || item.cliente || '-',
    'Consultor': item.vendedor?.nome || item.seller || '-', // Nome do consultor
    'Valor': formatCurrency(item.valor_total || item.value || 0),
    'Status': item.status || '-',
    'Data': item.data_criacao || item.data_inicio || item.data_visita || item.date || '-'
  }));

  const columns = ['Código', 'Módulo', 'Cliente', 'Consultor', 'Valor', 'Status', 'Data'];
  exportToPDF(dadosExport, `Relatório ${filtros.tipo.charAt(0).toUpperCase() + filtros.tipo.slice(1)}`, columns);
};

  // KPIs
  const kpis = useMemo(() => [
    {
      title: "Total Registros",
      value: metricas.totalRegistros,
      label: "Itens encontrados",
      icon: FileText,
      color: "blue"
    },
    {
      title: "Valor Total",
      value: formatCurrency(metricas.totalValor),
      label: "Soma dos valores",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(metricas.mediaValor),
      label: "Valor médio",
      icon: TrendingUp,
      color: "yellow"
    },
    {
      title: "Conversão",
      value: `${metricas.conversao.toFixed(1)}%`,
      label: "Contratos ativos",
      icon: Activity,
      color: metricas.conversao > 50 ? "green" : "yellow"
    }
  ], [metricas]);

  return (
    <div className={styles.container}>
      <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ""}`}>
        <div className={styles.content}>
          
          {/* Header */}
          <PageHeader
            title="Relatórios"
            subtitle="Análise completa de contratos e agendamentos"
          />

          {/* Filtros */}
          <div className={styles.filtersSection}>
            <div className={styles.filtersGrid}>
              {/* Tipo */}
              <div className={styles.filterGroup}>
                <label>Tipo</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="contratos">Contratos</option>
                  <option value="agendamentos">Agendamentos</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              {/* Busca */}
              <div className={styles.filterGroup}>
                <label>Busca</label>
                <div className={styles.searchWrapper}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente..."
                    value={filtros.busca}
                    onChange={(e) => handleFiltroChange('busca', e.target.value)}
                    className={styles.filterInput}
                  />
                  {filtros.busca && (
                    <button
                      className={styles.clearButton}
                      onClick={() => handleFiltroChange('busca', '')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className={styles.filterGroup}>
                <label>Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="REALIZADO">Realizado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                </select>
              </div>

              {/* Consultor (mudado de Vendedor) */}
              <div className={styles.filterGroup}>
                <label>Consultor</label>
                <select
                  value={filtros.consultor}
                  onChange={(e) => handleFiltroChange('consultor', e.target.value)}
                  className={styles.filterSelect}
                  disabled={carregandoConsultores}
                >
                  <option value="">{carregandoConsultores ? 'Carregando...' : 'Todos'}</option>
                  {consultores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div className={styles.filterGroup}>
                <label>Data Início</label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              {/* Data Fim */}
              <div className={styles.filterGroup}>
                <label>Data Fim</label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              {/* Valor Mínimo */}
              <div className={styles.filterGroup}>
                <label>Valor Mín.</label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={filtros.valorMin}
                  onChange={(e) => handleFiltroChange('valorMin', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              {/* Valor Máximo */}
              <div className={styles.filterGroup}>
                <label>Valor Máx.</label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={filtros.valorMax}
                  onChange={(e) => handleFiltroChange('valorMax', e.target.value)}
                  className={styles.filterInput}
                />
              </div>
            </div>

            {/* Ações dos filtros */}
            <div className={styles.filterActions}>
              <button
                className={styles.btnFilter}
                onClick={carregarDados}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                Aplicar Filtros
              </button>
              <button
                className={styles.btnClear}
                onClick={handleLimparFiltros}
              >
                <X size={16} />
                Limpar
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className={styles.errorMessage}>
              <AlertCircle size={18} />
              {erro}
              <button onClick={() => setErro(null)}><X size={16} /></button>
            </div>
          )}

          {/* KPIs */}
          <div className={styles.statsGrid}>
            {kpis.map((k, i) => (
              <div key={k.title} className={styles.cardEntry}>
                <StatCard {...k} />
              </div>
            ))}
          </div>

          {/* Ações de Exportação */}
          <div className={styles.exportActions}>
            <button
              className={styles.btnExport}
              onClick={handleExportExcel}
              disabled={dadosExibicao.length === 0}
            >
              <FileSpreadsheet size={18} />
              Exportar Excel
            </button>
            <button
              className={`${styles.btnExport} ${styles.btnExportPdf}`}
              onClick={handleExportPDF}
              disabled={dadosExibicao.length === 0}
            >
              <File size={18} />
              Exportar PDF
            </button>
          </div>

          {/* Tabela */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3>
                Resultados 
                <span className={styles.totalCount}>
                  {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''}
                </span>
              </h3>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span>Carregando dados...</span>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <div className={styles.tableRowHeader}>
                  <span>Código</span>
                  <span>Módulo</span>
                  <span>Cliente</span>
                  <span>Consultor</span> {/* Mudado de Vendedor para Consultor */}
                  <span>Valor</span>
                  <span>Status</span>
                  <span>Data</span>
                </div>

                {dadosExibicao.length > 0 ? (
                  dadosExibicao.map((item, index) => (
                    <div key={index} className={styles.tableRow}>
                      <span>{item.codigo || item.id || '-'}</span>
                      <span>
                        <span className={styles.moduleBadge}>
                          {item.module || 'Contrato'}
                        </span>
                      </span>
                      <span>{item.titular_nome || item.cliente?.nome || item.cliente || '-'}</span>
                      <span>{item.vendedor?.nome || item.seller || '-'}</span>
                      <span className={styles.valorCell}>
                        {formatCurrency(item.valor_total || item.value || 0)}
                      </span>
                      <span>
                        <span 
                          className={styles.statusBadge}
                          style={{ 
                            backgroundColor: STATUS_COLORS[item.status] ? `${STATUS_COLORS[item.status]}20` : '#E2E8F0',
                            color: STATUS_COLORS[item.status] || '#475569'
                          }}
                        >
                          {item.status || 'PENDENTE'}
                        </span>
                      </span>
                      <span>
                        {formatDate(
                            item.data_criacao ||
                            item.data_inicio ||
                            item.data_visita ||
                            item.date
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>Nenhum dado encontrado com os filtros aplicados</p>
                    <p className={styles.emptySubtext}>
                      Tente ajustar os filtros ou limpar a busca
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}