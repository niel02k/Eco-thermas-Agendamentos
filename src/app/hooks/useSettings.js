'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { criarUsuario } from '@/app/actions/usuarios';

const supabase = createClient();

// ── Horários padrão do parque ──────────────────────────────────
export const HORARIOS_PADRAO = ['09:30', '10:00', '10:30', '11:00', '11:30'];
export const CAPACIDADE_PADRAO = 40;

// ── Formata Date → "YYYY-MM-DD" sem timezone shift ────────────
export function dateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── "YYYY-MM-DD" → Date local (sem UTC shift) ─────────────────
export function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ═══════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════ */
export function useSettings() {

  /* ── Calendário / disponibilidade ──────────────────────────── */
  // Todas as entradas da tabela disponibilidade_parque
  const [disponibilidades, setDisponibilidades] = useState([]); // raw do banco
  // Datas selecionadas pelo ADM no calendário (apenas as ABERTAS)
  const [selectedDates, setSelectedDates]       = useState([]); // Date[]
  // Mês exibido no calendário
  const [month, setMonth]                       = useState(new Date());
  // Config do painel lateral (aplicada ao salvar)
  const [calConfig, setCalConfig] = useState({
    abertura:          '09:30',
    fechamento:        '11:30',
    capacidade:        CAPACIDADE_PADRAO,
    observacoes:       '',
  });
  const [loadingCal,  setLoadingCal]  = useState(true);
  const [savingCal,   setSavingCal]   = useState(false);
  const [calMsg,      setCalMsg]      = useState(null);

  /* ── Usuários ───────────────────────────────────────────────── */
  const [usuarios,     setUsuarios]     = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser,   setSavingUser]   = useState(false);
  const [userMsg,      setUserMsg]      = useState(null);
  const [newUser,      setNewUser]      = useState({
    name: '', email: '', password: '', role: 'CONSULTOR',
  });

  /* ── Carregar disponibilidades ────────────────────────────────
     Busca os próximos 90 dias + os últimos 30 para cobrir histórico
  ─────────────────────────────────────────────────────────────── */
  const carregarDisponibilidades = useCallback(async () => {
    setLoadingCal(true);
    try {
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - 30);
      const fim = new Date();
      fim.setDate(fim.getDate() + 90);

      const { data, error } = await supabase
        .from('disponibilidade_parque')
        .select('id, data, disponivel, capacidade_maxima, observacoes')
        .gte('data', dateToISO(inicio))
        .lte('data', dateToISO(fim))
        .order('data', { ascending: true });

      if (error) throw error;

      setDisponibilidades(data ?? []);

      // Marca no calendário as datas com disponivel = true
      const abertas = (data ?? [])
        .filter((d) => d.disponivel)
        .map((d) => isoToDate(d.data));

      setSelectedDates(abertas);
    } catch (e) {
      console.error('Erro ao carregar disponibilidades:', e);
    } finally {
      setLoadingCal(false);
    }
  }, []);

  /* ── Salvar datas selecionadas ────────────────────────────────
     Estratégia: UPSERT em todas as datas visíveis no mês atual.
     - Datas selecionadas → disponivel = true
     - Datas desmarcadas que já existiam → disponivel = false
     - Datas novas selecionadas → INSERT com disponivel = true
  ─────────────────────────────────────────────────────────────── */
  const salvarDisponibilidades = useCallback(async () => {
    setSavingCal(true);
    setCalMsg(null);
    try {
      // Gera todas as datas do mês exibido
      const ano = month.getFullYear();
      const mes = month.getMonth();
      const totalDias = new Date(ano, mes + 1, 0).getDate();

      const selectedISOs = new Set(selectedDates.map((d) => dateToISO(d)));

      const upsertPayload = [];
      for (let dia = 1; dia <= totalDias; dia++) {
        const date = new Date(ano, mes, dia);
        const iso  = dateToISO(date);
        const aberta = selectedISOs.has(iso);

        // Só salva datas futuras ou hoje
        const hoje = dateToISO(new Date());
        if (iso < hoje) continue;

        upsertPayload.push({
          data:              iso,
          disponivel:        aberta,
          capacidade_maxima: aberta ? Number(calConfig.capacidade) : CAPACIDADE_PADRAO,
          observacoes:       aberta ? calConfig.observacoes || null : null,
        });
      }

      if (upsertPayload.length === 0) {
        setCalMsg({ tipo: 'ok', texto: 'Nenhuma alteração para salvar.' });
        return;
      }

      const { error } = await supabase
        .from('disponibilidade_parque')
        .upsert(upsertPayload, { onConflict: 'data' });

      if (error) throw error;

      await carregarDisponibilidades();
      setCalMsg({ tipo: 'ok', texto: `${upsertPayload.filter(u => u.disponivel).length} data(s) salva(s) com sucesso!` });
    } catch (e) {
      console.error('Erro ao salvar disponibilidades:', e);
      setCalMsg({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSavingCal(false);
      setTimeout(() => setCalMsg(null), 5000);
    }
  }, [selectedDates, month, calConfig, carregarDisponibilidades]);

  /* ── Toggle de data no calendário ────────────────────────────── */
  const toggleDate = useCallback((date) => {
    const iso = dateToISO(date);
    setSelectedDates((prev) => {
      const exists = prev.some((d) => dateToISO(d) === iso);
      if (exists) return prev.filter((d) => dateToISO(d) !== iso);
      return [...prev, date];
    });
  }, []);

  /* ── Info de uma data específica (do banco) ───────────────────── */
  const getInfoData = useCallback((date) => {
    const iso = dateToISO(date);
    return disponibilidades.find((d) => d.data === iso) ?? null;
  }, [disponibilidades]);

  /* ── Usuários ──────────────────────────────────────────────────── */
  const carregarUsuarios = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, cargo, status, data_criacao')
        .order('data_criacao', { ascending: false });
      if (error) throw error;
      setUsuarios(data ?? []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

const handleCriarUsuario = useCallback(async () => {
  if (!newUser.name || !newUser.email || !newUser.password) {
    setUserMsg({ tipo: 'erro', texto: 'Preencha todos os campos.' });
    return;
  }

  setSavingUser(true);
  setUserMsg(null);

  try {
    await criarUsuario({
      nome: newUser.name,
      email: newUser.email,
      senha: newUser.password,
      cargo: newUser.role,
    });

    // 🔥 login do usuário recém criado
    const { error } = await supabase.auth.signInWithPassword({
      email: newUser.email,
      password: newUser.password,
    });

    if (error) throw error;

    setNewUser({ name: '', email: '', password: '', role: 'CONSULTOR' });
    setUserMsg({ tipo: 'ok', texto: 'Usuário criado e logado com sucesso!' });

    await carregarUsuarios();
  } catch (e) {
    setUserMsg({ tipo: 'erro', texto: e.message ?? 'Erro ao criar usuário.' });
  } finally {
    setSavingUser(false);
    setTimeout(() => setUserMsg(null), 4000);
  }
}, [newUser, carregarUsuarios]);

  const alterarCargo = useCallback(async (id, cargo) => {
    try {
      const { error } = await supabase.from('usuarios').update({ cargo }).eq('id', id);
      if (error) throw error;
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, cargo } : u)));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const alternarStatus = useCallback(async (id, statusAtual) => {
    const novoStatus = statusAtual === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try {
      const { error } = await supabase.from('usuarios').update({ status: novoStatus }).eq('id', id);
      if (error) throw error;
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, status: novoStatus } : u)));
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ── Init ─────────────────────────────────────────────────────── */
  useEffect(() => {
    carregarDisponibilidades();
    carregarUsuarios();
  }, [carregarDisponibilidades, carregarUsuarios]);

  return {
    // Calendário
    selectedDates, toggleDate, setSelectedDates,
    month, setMonth,
    calConfig, setCalConfig,
    disponibilidades, getInfoData,
    loadingCal, savingCal, calMsg,
    salvarDisponibilidades,

    // Usuários
    usuarios, loadingUsers,
    newUser, setNewUser,
    savingUser, userMsg,
    handleCriarUsuario,
    alterarCargo,
    alternarStatus,
  };
}
