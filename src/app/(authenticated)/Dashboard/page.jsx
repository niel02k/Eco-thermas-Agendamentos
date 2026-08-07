"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Users, CalendarCheck, TrendingUp, Activity, LayoutDashboard } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import StatCard from '@/app/Components/Cards/StatCard/StatCard.jsx';
import styles from './Dashboard.module.css';
import { useDashboardStats } from '@/app/hooks/dashboard/useDashboardStats';
import NewAppointment from "@/app/Components/modal/Newappointment";
import WeeklyAppointmentsChart from "@/app/Components/WeeklyAppointmentsChart/WeeklyAppointmentsChart.jsx";
import ReceitaMensalChart from '@/app/Components/ReceitaMensal/ReceitaMensalChart';

const Dashboard = () => {
  const [visible, setVisible] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Usar o hook de estatísticas
  const {
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
    const t = setTimeout(() => setVisible(true), 20);
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
            {/* Gráfico de Receita - USANDO O COMPONENTE RECEITAMENSALCHART */}
            <div className={styles.chartCardWrapper}>
              <ReceitaMensalChart 
                title="Receita Mensal" 
                subtitle="Últimos 8 meses"
              />
            </div>

            {/* Gráfico de Agendamentos por Dia */}
            <div className={styles.chartCardWrapper}>
              {dadosSemanaFormatado.length > 0 ? (
                <WeeklyAppointmentsChart
                  data={semanaData}
                  title="Agendamentos"
                  subtitle="Semana atual"
                  height={200}
                  barColor="#6EC8F0"
                />
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