"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Users, CalendarCheck, TrendingUp, Activity, LayoutDashboard } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import StatCard from '@/app/Components/Cards/StatCard/StatCard.jsx';
import styles from './Dashboard.module.css';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';
import NewAppointment from "@/app/Components/modal/Newappointment";
import Loading from '@/app/Components/loading/page.jsx';

const Dashboard = () => {
  const [visible, setVisible] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Usar o hook de estatísticas
  const {
    loading,
    error,
    totalHoje,
    semanaData,
    dadosReceita,
    ticketMedioData,
    taxaConversaoData,
    proximosDiasComAgendamento,
    totalClientesSemana,
    atualizarStats
  } = useDashboardStats();

  // Animação de entrada
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Formatações
  const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(valor || 0);
  const formatarMoeda = (valor) => {
    const num = Number(valor) || 0;
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Dados para gráfico de semana
  const dadosSemanaFormatado = Array.isArray(semanaData) 
    ? semanaData.map(item => ({
        dia: item.day,
        total: item.total || 0
      }))
    : [];

  if (loading) {
    return (
      <Loading 
        icon={LayoutDashboard}
        text="Carregando Dashboard....." 
      />
    );
  }

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
            onAction={() => setShowAppointmentModal(true)}
          />

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {/* Card: Total de clientes atendidos na semana */}
            <div className={styles.cardEntry}>
              <StatCard
                title="Atendidos"
                value={formatarNumero(totalClientesSemana)}
                label="Total da semana"
                trend={0}
                icon={Users}
                color="green"
              />
            </div>

            {/* Card: Agendamentos de Hoje */}
            <div className={styles.cardEntry}>
              <StatCard
                title="Hoje"
                value={totalHoje.toString()}
                label={new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
                trend={0}
                icon={CalendarCheck}
                color="yellow"
              />
            </div>

            {/* Cards: Próximos dias com agendamento */}
            {proximosDiasComAgendamento.map((dia, i) => (
              <div key={dia.data_visita || i} className={styles.cardEntry}>
                <StatCard
                  title={i === 0 ? "Próximo" : "Seguinte"}
                  value={dia.total.toString()}
                  label={dia.label || `Dia ${i + 2}`}
                  trend={0}
                  icon={CalendarCheck}
                  color={i === 0 ? 'purple' : 'blue'}
                />
              </div>
            ))}

            {/* Se não houver próximos dias, mostrar cards vazios */}
            {proximosDiasComAgendamento.length === 0 && (
              <>
                <div className={styles.cardEntry}>
                  <StatCard
                    title="Amanhã"
                    value="0"
                    label="Sem agendamentos"
                    trend={0}
                    icon={CalendarCheck}
                    color="purple"
                  />
                </div>
                <div className={styles.cardEntry}>
                  <StatCard
                    title="Em breve"
                    value="0"
                    label="Sem agendamentos"
                    trend={0}
                    icon={CalendarCheck}
                    color="blue"
                  />
                </div>
              </>
            )}
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
              {dadosReceita.length > 0 ? (
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
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip formatter={(v) => [formatarMoeda(v), 'Receita']} />
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#1E6EBE" 
                      strokeWidth={2.5} 
                      fill="url(#gradReceita)" 
                      dot={{ r: 4, fill: '#fff', stroke: '#1E6EBE', strokeWidth: 2.5 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>
                  <p>Nenhum dado de receita disponível</p>
                </div>
              )}
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
              {dadosSemanaFormatado.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dadosSemanaFormatado} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#000000' }} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false} 
                    />
                    <Tooltip formatter={(v) => [v, 'Agendamentos']} />
                    <Bar dataKey="total" fill="#6EC8F0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>
                  <p>Nenhum agendamento nesta semana</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Strip - Indicadores */}
          <div className={styles.quickStrip}>
            {/* Taxa de Conversão */}
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Taxa de Conversão</span>
              <span className={styles.stripValue}>
                {taxaConversaoData > 0 ? `${taxaConversaoData}%` : '0%'}
              </span>
            </div>

            {/* Ticket Médio */}
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Ticket Médio</span>
              <span className={styles.stripValue}>
                {ticketMedioData?.ticket_medio > 0 
                  ? formatarMoeda(ticketMedioData.ticket_medio) 
                  : 'R$ 0,00'}
              </span>
            </div>

            {/* Contratos Vendidos */}
            <div className={styles.stripCard}>
              <span className={styles.stripLabel}>Contratos Vendidos</span>
              <span className={styles.stripValue}>
                {ticketMedioData?.total_contratos || 0}
              </span>
            </div>

            {/* Valor Total */}
           
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>⚠️ Erro: {error}</p>
              <button onClick={atualizarStats}>Tentar novamente</button>
            </div>
          )}
        </div>
      </main>
      
      {showAppointmentModal && (
        <NewAppointment
          onClose={() => {
            setShowAppointmentModal(false);
            atualizarStats(); // Recarregar dados após criar agendamento
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;