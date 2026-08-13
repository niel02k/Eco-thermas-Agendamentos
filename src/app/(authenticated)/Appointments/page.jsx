'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

import PageHeader from '@/app/Components/PageHeader/PageHeader.jsx';
import FiltroPai, {
  FILTROS_INICIAIS,
} from '@/app/Components/Shared/FiltroPai.jsx';
import AppointmentsWeekStatus from '@/app/Components/ModalAgendamento/AppointmentsWeekStatus.jsx';
import VisualizarModal from '@/app/Components/Shared/VisualizarModal.jsx';
import ConfirmModal from '@/app/Components/ModalAgendamento/ConfirmModal.jsx';
import ModalRealizado from '@/app/Components/ModalAgendamento/ModalRealizado.jsx';
import NewAppointment from '@/app/Components/modal/Newappointment.jsx';
import ResultCard from '@/app/Components/Cards/ResultCard/ResultCard.jsx';
import MobileList from '@/app/Components/Shared/MobileList.jsx';
import DataTable from '@/app/Components/Shared/DataTable.jsx';

import { useAgendamentos } from '@/app/hooks/agendamentos/index.js';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import styles from './Appointments.module.css';

export default function AppointmentsPage() {
  const [visible, setVisible] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [abrirFiltroPai, setAbrirFiltroPai] = useState(false);
  const [filtrosPai, setFiltrosPai] = useState(FILTROS_INICIAIS);
  const [confirm, setConfirm] = useState(null);
  const [inputBusca, setInputBusca] = useState('');
  const [showModalRealizado, setShowModalRealizado] = useState(false);
  const [agendamentoParaRealizar, setAgendamentoParaRealizar] = useState(null);

  const debounceRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    agendamentos,
    total,
    pagina,
    totalPaginas,
    loadingTabela,
    erroGeral,
    handleBusca,
    setPagina,

    semanaData,
    statusCount,
    statusCountVenda,
    loadingStats,

    agendamentoSelecionado,
    modoModal,
    abrirVisualizar,
    abrirEditar,
    fecharModal,

    showResultadoVenda,
    agendamentoParaResultado,
    loadingResultado,
    abrirResultadoVenda,
    fecharResultadoVenda,
    confirmarResultadoVenda,

    confirmarAgendamento,
    confirmarRealizado,
    marcarComoFaltou,
    cancelarAgendamento,
    excluir,
    recarregar,
  } = useAgendamentos(filtrosPai);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const onChangeBusca = useCallback((evento) => {
    const valor = evento.target.value;

    setInputBusca(valor);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleBusca(valor);
    }, 350);
  }, [handleBusca]);

  const handleAplicarFiltroPai = useCallback((novosFiltros) => {
    setFiltrosPai({
      ...FILTROS_INICIAIS,
      ...novosFiltros,
    });

    setAbrirFiltroPai(false);
  }, []);

  const handleLimparFiltroPai = useCallback((filtrosLimpos) => {
    setFiltrosPai({
      ...FILTROS_INICIAIS,
      ...filtrosLimpos,
    });

    setAbrirFiltroPai(false);
  }, []);

  const handleConfirmarAgendamento = useCallback(async (codigo) => {
    await confirmarAgendamento(codigo);
  }, [confirmarAgendamento]);

  const handleAbrirModalRealizado = useCallback((agendamento) => {
    setAgendamentoParaRealizar(agendamento);
    setShowModalRealizado(true);
  }, []);

  const handleConfirmarRealizado = useCallback(async (codigo) => {
    const resposta = await confirmarRealizado(codigo);

    if (resposta?.sucesso === false) {
      return;
    }

    setShowModalRealizado(false);

    const agendamento = agendamentos.find(
      (item) => item.codigo === codigo,
    );

    if (agendamento) {
      abrirResultadoVenda({
        ...agendamento,
        resultado_visita: 'REALIZADO',
        resultado_venda: 'PENDENTE',
      });
    }
  }, [
    confirmarRealizado,
    agendamentos,
    abrirResultadoVenda,
  ]);

  const handleFaltou = useCallback(async (codigo) => {
    const resposta = await marcarComoFaltou(codigo);

    if (resposta?.sucesso === false) {
      return;
    }

    setShowModalRealizado(false);
  }, [marcarComoFaltou]);

  const handleConfirmarResultado = useCallback(async (
    codigo,
    resultado,
  ) => {
    await confirmarResultadoVenda(codigo, resultado);
  }, [confirmarResultadoVenda]);

  const handleEditar = useCallback(async (codigo) => {
    fecharModal();
    await abrirEditar(codigo);
    setAbrirModal(true);
  }, [fecharModal, abrirEditar]);

  const handleCloseModal = useCallback(async () => {
    setAbrirModal(false);
    fecharModal();
    await recarregar();
  }, [fecharModal, recarregar]);

  const pedirCancelamento = useCallback((codigo) => {
    setConfirm({
      tipo: 'cancelar',
      codigo,
    });
  }, []);

  const pedirExclusao = useCallback((codigo) => {
    setConfirm({
      tipo: 'excluir',
      codigo,
    });
  }, []);

  const confirmarAcao = useCallback(async () => {
    if (!confirm) {
      return;
    }

    if (confirm.tipo === 'cancelar') {
      await cancelarAgendamento(confirm.codigo);
    }

    if (confirm.tipo === 'excluir') {
      await excluir(confirm.codigo);
    }

    setConfirm(null);
  }, [confirm, cancelarAgendamento, excluir]);

  return (
    <>
      <FiltroPai
        aberto={abrirFiltroPai}
        filtros={filtrosPai}
        onAplicar={handleAplicarFiltroPai}
        onLimpar={handleLimparFiltroPai}
        onFechar={() => setAbrirFiltroPai(false)}
      />

      {confirm && (
        <ConfirmModal
          mensagem={
            confirm.tipo === 'cancelar'
              ? 'Deseja cancelar este agendamento?'
              : 'Deseja excluir permanentemente este agendamento?'
          }
          onConfirm={confirmarAcao}
          onCancel={() => setConfirm(null)}
        />
      )}

      {modoModal === 'visualizar' && agendamentoSelecionado && (
        <VisualizarModal
          tipo="agendamento"
          agendamento={agendamentoSelecionado}
          onClose={fecharModal}
          onEditar={handleEditar}
          onConfirmarAgendamento={handleConfirmarAgendamento}
          onConfirmarRealizado={handleAbrirModalRealizado}
          onResultadoVenda={abrirResultadoVenda}
          onCancelar={pedirCancelamento}
          onExcluir={pedirExclusao}
        />
      )}

      {showResultadoVenda && agendamentoParaResultado && (
        <ResultCard
          agendamento={agendamentoParaResultado}
          onConfirm={handleConfirmarResultado}
          onCancel={fecharResultadoVenda}
          loading={loadingResultado}
        />
      )}

      {abrirModal && (
        <NewAppointment
          onClose={handleCloseModal}
          dadosEdicao={
            modoModal === 'editar'
              ? agendamentoSelecionado
              : null
          }
        />
      )}

      {showModalRealizado && agendamentoParaRealizar && (
        <ModalRealizado
          agendamento={agendamentoParaRealizar}
          onConfirm={handleConfirmarRealizado}
          onFaltou={handleFaltou}
          onClose={() => setShowModalRealizado(false)}
        />
      )}

      <div className={styles.container}>
        <main
          className={`${styles.main} ${
            visible ? styles.mainVisible : ''
          }`}
        >
          <div className={styles.containerheader}>
            <div className={styles.pageHeaderWrapper}>
              <PageHeader
                title="Agendamentos"
                subtitle="Gestão operacional dos visitantes e reservas"
                badge={{
                  text: 'Sistema Ativo',
                  type: 'success',
                }}
                actionLabel="Novo Agendamento"
                actionIcon={Plus}
                onAction={() => {
                  fecharModal();
                  setAbrirModal(true);
                }}
              />
            </div>

            <button
              type="button"
              className={styles.filterTrigger}
              onClick={() => setAbrirFiltroPai(true)}
              aria-label="Abrir filtro pai dos indicadores"
            >
              <SlidersHorizontal size={17} />
              <span>Filtros</span>
            </button>
          </div>

          {erroGeral && (
            <div className={styles.errorBanner} role="alert">
              <AlertTriangle size={16} />
              <span>{erroGeral}</span>
            </div>
          )}

          <AppointmentsWeekStatus
            semanaData={semanaData}
            statusCount={statusCount}
            statusCountVenda={statusCountVenda}
            loading={loadingStats}
          />

          {isMobile ? (
            <MobileList
              tipo="agendamento"
              dados={agendamentos}
              loading={loadingTabela}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPageChange={setPagina}
              onCardClick={(agendamento) => {
                abrirVisualizar(agendamento.codigo);
              }}
              emptyMessage="Nenhum agendamento encontrado"
            />
          ) : (
            <DataTable
              tipo="agendamento"
              dados={agendamentos}
              loading={loadingTabela}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              busca={inputBusca}
              onBuscaChange={onChangeBusca}
              onPageChange={setPagina}
              onRowClick={(agendamento) => {
                abrirVisualizar(agendamento.codigo);
              }}
              showExport={true}
              showSearch={true}
            />
          )}
        </main>
      </div>
    </>
  );
}
