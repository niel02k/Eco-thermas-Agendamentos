// src/app/Components/Charts/ReceitaMensalChart.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ReceitaService } from '@/services/ReceitaService';
import styles from './ReceitaMensalChart.module.css';

const formatarMoeda = (valor) => 
  `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

// Mapeamento de meses
const MESES = {
  1: 'Jan',
  2: 'Fev',
  3: 'Mar',
  4: 'Abr',
  5: 'Mai',
  6: 'Jun',
  7: 'Jul',
  8: 'Ago',
  9: 'Set',
  10: 'Out',
  11: 'Nov',
  12: 'Dez'
};

export default function ReceitaMensalChart({ 
  title = "Receita Mensal", 
  subtitle = "Últimos 8 meses",
  ano = null // Se não informar, usa o ano atual
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [ano]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      // Define o ano (atual se não informado)
      const anoAtual = ano || new Date().getFullYear();

      // Busca os dados do ano
      const dados = await ReceitaService.getFaturamentoAcumuladoAno(anoAtual);
      
      // Transforma para o formato do gráfico
      const dadosGrafico = dados.map(item => ({
        mes: MESES[item.mes] || item.mes,
        mesNumero: item.mes,
        receita: Number(item.valor_total),
        quantidade: item.quantidade_contratos,
        acumulado: item.valor_acumulado,
        dataCalculo: item.data_calculo
      }));

      // Pega os últimos 8 meses ou todos se tiver menos
      const ultimosMeses = dadosGrafico.length > 8 
        ? dadosGrafico.slice(-8) 
        : dadosGrafico;

      setData(ultimosMeses);

      // Busca resumo do faturamento
      const resumoData = await ReceitaService.getResumoFaturamento(anoAtual);
      setResumo(resumoData);

    } catch (err) {
      console.error('Erro ao carregar dados do faturamento:', err);
      setError('Não foi possível carregar os dados de faturamento');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados manualmente
  const atualizarDados = async () => {
    try {
      setLoading(true);
      const anoAtual = ano || new Date().getFullYear();
      
      // Atualiza o faturamento do mês atual
      await ReceitaService.atualizarFaturamentoMesAtual();
      
      // Recarrega os dados
      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

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

  if (!data || data.length === 0) {
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
          <TrendingUp size={13} />
          {data[data.length - 1]?.quantidade || 0} contratos ativos
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
            formatter={(v, name) => {
              if (name === 'receita') return [formatarMoeda(v), 'Receita'];
              return [v, name];
            }}
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