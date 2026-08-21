'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, ArrowLeft } from 'lucide-react';
import styles from '@/app/Components/ModalAgendamento/ModalRealizado.module.css';

export default function ModalRealizado({
  agendamento,
  vendedores = [],
  onConfirm,
  onFaltou,
  onClose,
}) {
  const [etapa, setEtapa] = useState('comparecimento');
  const [vendedorId, setVendedorId] = useState(
    agendamento?.vendedor_id ? String(agendamento.vendedor_id) : '',
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const fechar = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const handleRealizado = () => {
    setErro('');
    setEtapa('vendedor');
  };

  const handleConfirmarVendedor = async () => {
    if (!vendedorId) {
      setErro('Selecione o vendedor que atendeu a família.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const resposta = await onConfirm?.(
        agendamento.codigo,
        vendedorId,
      );

      if (resposta?.sucesso === false) {
        setErro(resposta.erro || 'Não foi possível registrar o atendimento.');
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível registrar o atendimento.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaltou = async () => {
    setLoading(true);
    setErro('');

    try {
      await onFaltou?.(agendamento.codigo);
    } catch (error) {
      setErro(error.message || 'Não foi possível registrar a falta.');
    } finally {
      setLoading(false);
    }
  };

  const nomeCliente = agendamento?.cliente?.nome || 'Família';

  return (
    <div className={styles.modalOverlay} onClick={fechar}>
      <div
        className={styles.confirmBox}
        onClick={(evento) => evento.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={fechar}
          disabled={loading}
          aria-label="Fechar"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          <X size={20} />
        </button>

        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
          }}
        >
          Agendamento #{agendamento?.codigo}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#6B7280',
            textAlign: 'center',
          }}
        >
          {nomeCliente}
        </p>

        {etapa === 'comparecimento' ? (
          <>
            <p
              style={{
                margin: '0.75rem 0',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                textAlign: 'center',
              }}
            >
              A família compareceu?
            </p>

            <div className={styles.confirmActions}>
              <button
                type="button"
                onClick={handleRealizado}
                disabled={loading}
                className={styles.btnRealizado}
              >
                <CheckCircle2 size={18} />
                Sim, realizado
              </button>

              <button
                type="button"
                onClick={handleFaltou}
                disabled={loading}
                className={styles.btnFaltou}
              >
                <XCircle size={18} />
                Não, faltou
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setErro('');
                setEtapa('comparecimento');
              }}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <p
              style={{
                margin: '0.75rem 0',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                textAlign: 'center',
              }}
            >
              Qual vendedor atendeu esta família?
            </p>

            <select
              value={vendedorId}
              onChange={(evento) => {
                setVendedorId(evento.target.value);
                setErro('');
              }}
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '0.65rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#111827',
                fontSize: '0.95rem',
              }}
            >
              <option value="">Selecione o vendedor...</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nome}
                </option>
              ))}
            </select>

            {vendedores.length === 0 && (
              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#B45309',
                  fontSize: '0.82rem',
                  textAlign: 'center',
                }}
              >
                Nenhum vendedor foi carregado para seleção.
              </p>
            )}

            {erro && (
              <p
                role="alert"
                style={{
                  margin: '0.5rem 0 0',
                  color: '#B91C1C',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}
              >
                {erro}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirmarVendedor}
              disabled={loading || !vendedorId}
              className={styles.btnRealizado}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <CheckCircle2 size={18} />
              {loading ? 'Salvando...' : 'Confirmar atendimento'}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={fechar}
          disabled={loading}
          className={styles.confirmCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
