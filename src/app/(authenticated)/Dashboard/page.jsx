"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Users, CalendarCheck, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import StatCard from '@/app/Components/StatCard/StatCard.jsx';
import styles from './Dashboard.module.css';
import { agendamentosHoje, proximosDiasComAgendamentos, totalClientesAtendidos, agendamentosPorDiaSemana, taxaDeConversao } from '@/app/services/agendamentosServices.js';
import { receitaPorMes, ticketMedio} from '@/app/services/contratosServices.js';

/* ── Dashboard ── */
const Dashboard = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalHoje, setTotalHoje] = useState(0);
  const [diasAgendamentos, setDiasAgendamentos] = useState([]);

  // Gráficos
  const [dadosReceita, setDadosReceita] = useState([]);
  const [dadosSemana, setDadosSemana] = useState([]);

  // Activity feed

  const [ticketMedioValor, setTicketMedioValor] = useState(null);
  const [taxaConversao, setTaxaConversao] = useState(0);



  useEffect(() => {
    async function carregarDados() {
      try {
        const [clientes, hoje, dias, receita, semana, ticket , taxa] = await Promise.all([
          totalClientesAtendidos(),
          agendamentosHoje(),
          proximosDiasComAgendamentos(2),
          receitaPorMes(),
          agendamentosPorDiaSemana(),
          ticketMedio(),
          taxaDeConversao()
        ]);

        setTotalClientes(clientes);
        setTotalHoje(hoje);
        setDiasAgendamentos(dias);
        setDadosReceita(receita);
        setDadosSemana(semana);
        setTicketMedioValor(ticket);
        setTaxaConversao(taxa);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);


  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(valor);
  const formatarMoeda = (valor) => `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
// Transforma o array para o Recharts
   const dadosSemanaFormatado = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((dia, i) => ({
    dia,
    total: dadosSemana[i] ?? 0
  }))

  
  return (
    <div className={styles.container}>
      <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ''}`}>
        <div className={styles.content}>

          <PageHeader
            title="Dashboard"
            subtitle="Visão geral operacional — ECO-THERMAS TUPÃ"
            badge={{ text: "Parque Aberto", type: "success" }}
            actionLabel="Novo Agendamento"
            actionIcon={Plus}
            onAction={() => console.log('clicado')}
          />

          {/* Stats Grid */}
          <div className={styles.statsGrid}>

            <div className={styles.cardEntry}>
              <StatCard
                title="Atendidos"
                value={loading ? '...' : formatarNumero(totalClientes)}
                label="Atendimento totais "
                trend={12}
                icon={Users}
                color="green"
              />
            </div>

            <div className={styles.cardEntry}>
              <StatCard
                title="Hoje"
                value={loading ? '...' : totalHoje.toString()}
                label={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                trend={0}
                icon={CalendarCheck}
                color="yellow"
              />
            </div>

            {diasAgendamentos.map((dia, i) => (
              <div key={dia.data_visita} className={styles.cardEntry}>
                <StatCard
                  value={dia.total.toString()}
                  label={dia.label}
                  trend={0}
                  icon={CalendarCheck}
                  color={i === 0 ? 'purple' : 'blue'}
                />
              </div>
            ))}

          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>

            {/* Gráfico de Receita */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h2 className={styles.chartTitle}>Receita Mensal</h2>
                  <p className={styles.chartSub}>Últimos 8 meses</p>
                </div>
                <div className={styles.chartBadge}>
                  <TrendingUp size={13} />
                  Contratos ativos
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dadosReceita} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E6EBE" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1E6EBE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatarMoeda(v), 'Receita']} />
                  <Area type="monotone" dataKey="receita" stroke="#1E6EBE" strokeWidth={2.5} fill="url(#gradReceita)" dot={{ r: 4, fill: '#fff', stroke: '#1E6EBE', strokeWidth: 2.5 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Agendamentos por Dia */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h2 className={styles.chartTitle}>Agendamentos</h2>
                  <p className={styles.chartSub}>Semana atual</p>
                </div>
                <div className={`${styles.chartBadge} ${styles.chartBadgeBlue}`}>
                  <Activity size={13} />
                  Agendamentos/dia
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dadosSemanaFormatado} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#000000' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, 'Agendamentos']}
                    labelStyle={{ color: '#252424' }}
                   itemStyle={{ color: '#56f3aa' }}
                    />
                   <Bar dataKey="total" fill="#6EC8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Feed */}
          

          </div>

          {/* Quick Strip */}
          <div className={styles.quickStrip}>
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Taxa de Conversão</span>
              <span className={styles.stripValue}>{loading ? '...' : taxaConversao ? `${taxaConversao.toFixed(2)} % ` : ' 0 %'}</span>
              <span className={`${styles.stripSub} ${styles.stripGood}`}>
              </span>
            
            </div>
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Ticket Médio</span>
              <span className={styles.stripValue}>
                {loading ? '...' : ticketMedioValor ? `R$ ${ticketMedioValor.ticket_medio.toFixed(2)}` : 'R$ 0,00'}
              </span>

              <span className={`${styles.stripSub} ${styles.stripGood}`}>
              </span>
            </div>
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Contratos Vendidos</span>
               <span className={`${styles.stripValue} `}>
                {ticketMedioValor ? `${ticketMedioValor.total_contratos} contratos` : ' 0' }
              </span>
            </div>
            
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;