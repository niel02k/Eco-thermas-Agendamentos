'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarAgendamentosStats } from '@/app/services/agendamentosServices';

const FILTROS_INICIAIS = {
  statusAgendamento: '',
  resultadoVisita: '',
  resultadoVenda: '',
};

const STATUS_INICIAIS = {
  PENDENTE: 0,
  CONFIRMADO: 0,
  CANCELADO: 0,
};

const RESULTADOS_VISITA_INICIAIS = {
  PENDENTE: 0,
  REALIZADO: 0,
  FALTOU: 0,
};

const RESULTADOS_VENDA_INICIAIS = {
  PENDENTE: 0,
  VENDA_REALIZADA: 0,
  VENDA_PERDIDA: 0,
  NAO_APLICAVEL: 0,
};

export function useAgendamentosStats(filtrosPai = FILTROS_INICIAIS) {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [totalHoje, setTotalHoje] = useState(0);
  const [semanaData, setSemanaData] = useState([]);
  const [proximosDias, setProximosDias] = useState([]);
  const [taxaConversao, setTaxaConversao] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [statusCount, setStatusCount] = useState(STATUS_INICIAIS);
  const [resultadoVisitaCount, setResultadoVisitaCount] = useState(
    RESULTADOS_VISITA_INICIAIS,
  );
  const [statusCountVenda, setStatusCountVenda] = useState(
    RESULTADOS_VENDA_INICIAIS,
  );

  const requisicaoAtual = useRef(0);

  const carregar = useCallback(async () => {
    const idRequisicao = ++requisicaoAtual.current;

    setLoading(true);
    setErro(null);

    try {
      // O serviço ignora datas externas e calcula a semana atual:
      // segunda-feira até domingo.
      const resultado = await buscarAgendamentosStats(filtrosPai);

      if (idRequisicao !== requisicaoAtual.current) return;

      setTotalHoje(Number(resultado?.totalHoje || 0));
      setSemanaData(resultado?.semanaData || []);
      setProximosDias(resultado?.proximosDias || []);
      setTaxaConversao(Number(resultado?.taxaConversao || 0));
      setTotalClientes(Number(resultado?.totalClientes || 0));

      setStatusCount({
        ...STATUS_INICIAIS,
        ...(resultado?.statusCount || {}),
      });

      setResultadoVisitaCount({
        ...RESULTADOS_VISITA_INICIAIS,
        ...(resultado?.resultadoVisitaCount || {}),
      });

      setStatusCountVenda({
        ...RESULTADOS_VENDA_INICIAIS,
        ...(resultado?.statusCountVenda || {}),
      });
    } catch (error) {
      if (idRequisicao !== requisicaoAtual.current) return;

      console.error('Erro ao carregar estatísticas:', error);
      setErro(error?.message || 'Erro ao carregar estatísticas.');
      setTotalHoje(0);
      setSemanaData([]);
      setProximosDias([]);
      setTaxaConversao(0);
      setTotalClientes(0);
      setStatusCount(STATUS_INICIAIS);
      setResultadoVisitaCount(RESULTADOS_VISITA_INICIAIS);
      setStatusCountVenda(RESULTADOS_VENDA_INICIAIS);
    } finally {
      if (idRequisicao === requisicaoAtual.current) {
        setLoading(false);
      }
    }
  }, [filtrosPai]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    loading,
    erro,
    totalHoje,
    semanaData,
    proximosDias,
    taxaConversao,
    totalClientes,
    statusCount,
    resultadoVisitaCount,
    statusCountVenda,
    carregar,
  };
}
