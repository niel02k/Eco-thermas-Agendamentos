// src/app/hooks/useDashboardAgendamentos.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { listarAgendamentos } from '@/app/services/agendamentosServices';

export function useDashboardAgendamentos() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diasAgendamentos, setDiasAgendamentos] = useState([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);

  const carregarAgendamentosFuturos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      // Buscar próximos agendamentos (próximos 7 dias)
      const resultado = await listarAgendamentos({
        pagina: 1,
        limite: 50,
        status: 'CONFIRMADO',
        ordenarPor: 'data_visita',
        ordem: 'ASC'
      });
      
      const agendamentos = resultado?.agendamentos || [];
      
      // Agrupar por data
      const agendamentosPorData = {};
      const hoje_ts = hoje.getTime();
      
      agendamentos.forEach(agendamento => {
        const dataVisita = new Date(agendamento.data_visita);
        dataVisita.setHours(0, 0, 0, 0);
        
        // Filtrar apenas datas futuras ou hoje
        if (dataVisita.getTime() >= hoje_ts) {
          const dataKey = dataVisita.toISOString().split('T')[0];
          
          if (!agendamentosPorData[dataKey]) {
            agendamentosPorData[dataKey] = {
              data_visita: dataKey,
              total: 0,
              agendamentos: []
            };
          }
          
          agendamentosPorData[dataKey].total++;
          agendamentosPorData[dataKey].agendamentos.push(agendamento);
        }
      });
      
      // Converter para array e ordenar por data
      const diasArray = Object.values(agendamentosPorData)
        .sort((a, b) => a.data_visita.localeCompare(b.data_visita))
        .slice(0, 6); // Limitar a 6 dias para o grid
      
      // Adicionar labels formatados
      const diasFormatados = diasArray.map(dia => {
        const data = new Date(dia.data_visita + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const diffTime = data.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let label;
        if (diffDays === 0) {
          label = 'Hoje';
        } else if (diffDays === 1) {
          label = 'Amanhã';
        } else {
          label = data.toLocaleDateString('pt-BR', { 
            weekday: 'short', 
            day: '2-digit', 
            month: '2-digit' 
          });
        }
        
        return {
          ...dia,
          label
        };
      });
      
      setDiasAgendamentos(diasFormatados);
      
      // Separar próximos agendamentos (limitado a 5)
      const proximos = agendamentos
        .filter(a => {
          const dataVisita = new Date(a.data_visita);
          dataVisita.setHours(0, 0, 0, 0);
          return dataVisita.getTime() >= hoje_ts;
        })
        .slice(0, 5);
      
      setProximosAgendamentos(proximos);
      
    } catch (err) {
      console.error('Erro ao carregar agendamentos futuros:', err);
      setError(err.message || 'Erro ao carregar agendamentos');
      setDiasAgendamentos([]);
      setProximosAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAgendamentosFuturos();
  }, [carregarAgendamentosFuturos]);

  return {
    loading,
    error,
    diasAgendamentos,
    proximosAgendamentos,
    atualizar: carregarAgendamentosFuturos
  };
}