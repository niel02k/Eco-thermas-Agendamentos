'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/Components/Shared/FiltroPai.module.css';

function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

const inicioSelecionado = document.getElementById("filtro-data-inicio")
const fimselecionado = document.getElementById("filtro-data-fim")

function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();

  let inicio = new Date(hoje);
  inicio.setDate(
    hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1),
  );

  let fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);

  
return {
  dataInicio: dataLocalISO(inicio),
  dataFim: dataLocalISO(fim),
};
  
}




const semanaAtual = obterSemanaAtual();

const FILTROS_INICIAIS = {
  dataInicio: semanaAtual.dataInicio,
  dataFim: semanaAtual.dataFim,
  statusAgendamento: '',
  resultadoVisita: '',
  resultadoVenda: '',
};

export default function FiltroPai({
  aberto,
  filtros = FILTROS_INICIAIS,
  onAplicar,
  onLimpar,
  onFechar,
}) {
  const [filtrosLocais, setFiltrosLocais] = useState(() => ({
    ...FILTROS_INICIAIS,
    ...filtros,
  }));

  useEffect(() => {
    setFiltrosLocais({
      ...FILTROS_INICIAIS,
      ...filtros,
    });
  }, [filtros]);

  if (!aberto) return null;

  const alterarCampo = (campo, valor) => {
    setFiltrosLocais((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor ?? '',
    }));
  };

  const aplicar = () => {
    onAplicar?.({
      ...FILTROS_INICIAIS,
      ...filtrosLocais,
    });
  };

  const limpar = () => {
    const filtrosLimpos = {
      ...FILTROS_INICIAIS,
      statusAgendamento: '',
      resultadoVisita: '',
      resultadoVenda: '',
    };

    setFiltrosLocais(filtrosLimpos);
    onLimpar?.(filtrosLimpos);
  };

  return (
    <div
      className={styles.filterOverlay}
      role="presentation"
      onMouseDown={onFechar}
    >
      <section
        className={styles.filterModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filtro-pai-titulo"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className={styles.filterModalHeader}>
          <div>
            <h4 id="filtro-pai-titulo">Filtros dos indicadores</h4>
            <span>
              Os indicadores consideram a semana atual, de segunda a domingo.
            </span>
          </div>

          <button
            type="button"
            className={styles.filterCloseButton}
            onClick={onFechar}
            aria-label="Fechar filtros"
          >
            ×
          </button>
        </header>

        <div className={styles.filterRow}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filtro-data-inicio">
              Semana atual — início
            </label>
            <input
              id="filtro-data-inicio"
              className={styles.filterDateInput}
              type="date"
              value={filtrosLocais.dataInicio || ''}
              onChange={(evento) =>
                alterarCampo('dataInicio', evento.target.value)
              }
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filtro-data-fim">
              Semana atual — fim
            </label>
            <input
              id="filtro-data-fim"
              className={styles.filterDateInput}
              type="date"
              value={filtrosLocais.dataFim || ''}
              onChange={(evento) =>
                alterarCampo('dataFim', evento.target.value)
              }
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filtro-status-agendamento">
              Status do agendamento
            </label>
            <select
              id="filtro-status-agendamento"
              className={styles.filterSelect}
              value={filtrosLocais.statusAgendamento}
              onChange={(evento) =>
                alterarCampo('statusAgendamento', evento.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filtro-resultado-visita">
              Resultado da visita
            </label>
            <select
              id="filtro-resultado-visita"
              className={styles.filterSelect}
              value={filtrosLocais.resultadoVisita}
              onChange={(evento) =>
                alterarCampo('resultadoVisita', evento.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="REALIZADO">Realizado</option>
              <option value="FALTOU">Faltou</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filtro-resultado-venda">
              Resultado da venda
            </label>
            <select
              id="filtro-resultado-venda"
              className={styles.filterSelect}
              value={filtrosLocais.resultadoVenda}
              onChange={(evento) =>
                alterarCampo('resultadoVenda', evento.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="VENDA_REALIZADA">Venda realizada</option>
              <option value="VENDA_PERDIDA">Venda perdida</option>
              <option value="NAO_APLICAVEL">Não aplicável</option>
            </select>
          </div>
        </div>

        <div className={styles.filterModalActions}>
          <button
            type="button"
            className={styles.filterClearButton}
            onClick={limpar}
          >
            Limpar
          </button>

          <button
            type="button"
            className={styles.filterApplyButton}
            onClick={aplicar}
          >
            Aplicar filtros
          </button>
        </div>
      </section>
    </div>
  );
}

export { FILTROS_INICIAIS, obterSemanaAtual };
