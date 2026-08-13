'use client';

import { useCallback, useRef, useState } from 'react';
import { listarAgendamentos } from '@/app/services/agendamentosServices';

const LIMITE = 10;

// Objeto estável para evitar recriação a cada render.
const FILTROS_PAI_VAZIOS = Object.freeze({
  dataInicio: null,
  dataFim: null,
  statusAgendamento: '',
  resultadoVisita: '',
  resultadoVenda: '',
});

export function useAgendamentosList(
  filtrosPai = FILTROS_PAI_VAZIOS,
) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const requisicaoAtual = useRef(0);

  const carregar = useCallback(async (
    paginaAtual,
    buscaAtual,
    dataFiltroTabela,
  ) => {
    const idRequisicao = ++requisicaoAtual.current;

    setLoading(true);
    setErro(null);

    try {
      const parametros = {
        pagina: paginaAtual,
        limite: LIMITE,
        busca: String(buscaAtual || '').trim(),
      };

      // Filtros gerais vindos do FiltroPai.
      const filtrosAtivos = Object.fromEntries(
        Object.entries(filtrosPai).filter(([, valor]) => {
          return valor !== '' && valor !== null && valor !== undefined;
        }),
      );

      Object.assign(parametros, filtrosAtivos);

      // O filtro da tabela tem prioridade apenas sobre as datas.
      if (dataFiltroTabela) {
        parametros.dataInicio = dataFiltroTabela;
        parametros.dataFim = dataFiltroTabela;
      }

      const resultado = await listarAgendamentos(parametros);

      if (idRequisicao !== requisicaoAtual.current) {
        return;
      }

      setAgendamentos(resultado?.agendamentos || []);
      setTotal(Number(resultado?.total || 0));
    } catch (error) {
      if (idRequisicao !== requisicaoAtual.current) {
        return;
      }

      const mensagem =
        error?.message ||
        error?.details ||
        'Erro ao carregar agendamentos.';

      console.error('Erro ao carregar agendamentos:', error);
      setErro(mensagem);
      setAgendamentos([]);
      setTotal(0);
    } finally {
      if (idRequisicao === requisicaoAtual.current) {
        setLoading(false);
      }
    }
  }, [filtrosPai]);

  const handleBusca = useCallback((termo) => {
    const novoTermo = String(termo || '');

    setBusca((valorAtual) => {
      if (valorAtual === novoTermo) {
        return valorAtual;
      }

      return novoTermo;
    });

    setPagina((paginaAtual) => {
      return paginaAtual === 1 ? paginaAtual : 1;
    });
  }, []);

  const alterarPagina = useCallback((novaPagina) => {
    setPagina((valorAtual) => {
      const paginaSolicitada = Number(novaPagina);

      if (
        !Number.isInteger(paginaSolicitada) ||
        paginaSolicitada < 1
      ) {
        return valorAtual;
      }

      return paginaSolicitada;
    });
  }, []);

  const totalPaginas = Math.max(
    1,
    Math.ceil(total / LIMITE),
  );

  return {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    busca,
    loading,
    erro,
    setPagina: alterarPagina,
    handleBusca,
    carregar,
  };
}
