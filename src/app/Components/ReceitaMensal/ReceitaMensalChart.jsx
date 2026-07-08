// src/app/Components/Charts/ReceitaChart.jsx

"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import styles from './ReceitaMensalChart.module.css';

const formatarMoeda = (valor) => 
  `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function ReceitaChart({ data = [], title = "Receita Mensal", subtitle = "Últimos 8 meses" }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>{title}</h2>
          <p className={styles.chartSub}>{subtitle}</p>
        </div>
        <div className={styles.chartBadge}>
          <TrendingUp size={13} />
          Contratos ativos
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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