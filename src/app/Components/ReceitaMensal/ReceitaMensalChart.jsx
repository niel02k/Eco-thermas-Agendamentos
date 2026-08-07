// src/app/Components/ReceitaMensal/ReceitaMensalChart.jsx
"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useReceitaStats } from '@/app/hooks/receita/useReceitaStats';
import styles from './ReceitaMensalChart.module.css';

export default function ReceitaMensalChart({ 
  title = "Receita Mensal", 
  subtitle = "Últimos 8 meses",
  ano = null
}) {
  const {
    dadosGrafico,
    resumo,
    loading,
    error,
    atualizando,
    totalReceita,
    atualizarDados,
    formatarMoeda
  } = useReceitaStats(ano);

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>{title}</h2>
            <p className={styles.chartSub}>Carregando dados...</p>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={atualizarDados} className={styles.retryButton}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dadosGrafico || dadosGrafico.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>{title}</h2>
            <p className={styles.chartSub}>Nenhum dado disponível</p>
          </div>
        </div>
        <div className={styles.emptyState}>
          <p>Nenhum dado de faturamento encontrado para este período</p>
          <button onClick={atualizarDados} className={styles.updateButton}>
            Atualizar dados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>{title}</h2>
          <p className={styles.chartSub}>
            {subtitle}
            {resumo && (
              <span className={styles.resumoInfo}>
                {' • '}
                <strong>Total: {formatarMoeda(resumo.total_ano)}</strong>
                {' • '}
                Média: {formatarMoeda(resumo.media_mensal)}
              </span>
            )}
          </p>
        </div>
        <div className={styles.chartBadge} onClick={atualizarDados} style={{ cursor: 'pointer' }}>
          {atualizando ? (
            <RefreshCw size={13} className={styles.spinning} />
          ) : (
            <TrendingUp size={13} />
          )}
          {totalReceita > 0 ? formatarMoeda(totalReceita) : 'Sem dados'}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E6EBE" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1E6EBE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} 
          />
          <Tooltip 
            formatter={(v) => [formatarMoeda(v), 'Receita']}
            labelFormatter={(label) => `Mês: ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              borderColor: '#E2E8F0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="receita" 
            stroke="#1E6EBE" 
            strokeWidth={2.5} 
            fill="url(#gradReceita)" 
            dot={{ 
              r: 4, 
              fill: '#fff', 
              stroke: '#1E6EBE', 
              strokeWidth: 2.5 
            }} 
            activeDot={{ r: 6 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}