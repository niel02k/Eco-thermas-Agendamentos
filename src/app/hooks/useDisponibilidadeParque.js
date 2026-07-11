"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ── Formata Date → "YYYY-MM-DD" ────────────────────────────────
function dateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useDisponibilidadeParque() {
  const [diasAbertos, setDiasAbertos] = useState([]); // Array de "YYYY-MM-DD"
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ═══════════════════════════════════════════════════════════════
  // CARREGAR DIAS ABERTOS
  // ═══════════════════════════════════════════════════════════════
  const carregarDiasAbertos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const hoje = new Date();
      const inicio = dateToISO(hoje);
      
      const fim = new Date();
      fim.setDate(fim.getDate() + 90);
      const fimISO = dateToISO(fim);

      const { data, error } = await supabase
        .from('disponibilidade_parque')
        .select('data')
        .eq('disponivel', true)
        .gte('data', inicio)
        .lte('data', fimISO)
        .order('data', { ascending: true });

      if (error) throw error;

      // Extrai só as datas
      const datas = (data ?? []).map(d => d.data);
      setDiasAbertos(datas);
    } catch (e) {
      console.error('Erro ao carregar dias abertos:', e);
      setErro('Erro ao carregar disponibilidade do parque.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // VERIFICAR SE UMA DATA ESTÁ ABERTA
  // ═══════════════════════════════════════════════════════════════
  const isDataAberta = useCallback((dataISO) => {
    return diasAbertos.includes(dataISO);
  }, [diasAbertos]);

  // ═══════════════════════════════════════════════════════════════
  // FORMATAR DATAS PARA EXIBIÇÃO
  // ═══════════════════════════════════════════════════════════════
  const formatarDataDisponivel = useCallback((dataISO) => {
    const [ano, mes, dia] = dataISO.split('-');
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    carregarDiasAbertos();
  }, [carregarDiasAbertos]);

  return {
    diasAbertos,           // ["2026-07-11", "2026-07-12", ...]
    loading,
    erro,
    isDataAberta,          // (dataISO) => boolean
    formatarDataDisponivel, // (dataISO) => "Sábado, 11/07"
    recarregar: carregarDiasAbertos,
  };
}