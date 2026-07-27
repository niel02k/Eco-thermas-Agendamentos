// src/app/hooks/contratos/index.js
"use client";

import { useContratosList } from './useContratosList';
import { useContratoDetalhe } from './useContratoDetalhe';
import { useContratosActions } from './useContratosActions';
import { useContratosAnalytics } from './useContratosAnalytics';

export function useContratos() {
  const listagem = useContratosList();
  const detalhe = useContratoDetalhe();
  const analytics = useContratosAnalytics();
  const actions = useContratosActions(async () => {
    await listagem.carregar();
    await analytics.recarregar();
  });

  return {
    ...listagem,
    ...detalhe,
    ...actions,
    ...analytics,
    recarregarTudo: async () => {
      await listagem.carregar();
      await analytics.recarregar();
    },
  };
}