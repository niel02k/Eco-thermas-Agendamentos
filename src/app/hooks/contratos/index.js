// src/app/hooks/contratos/index.js
"use client";

<<<<<<< HEAD
import { useEffect, useMemo } from 'react';
import { useContratosList } from '@/app/hooks/contratos/useContratosList';
import { useContratoDetalhe } from '@/app/hooks/contratos/useContratoDetalhe';
import { useContratosActions } from '@/app/hooks/contratos/useContratosActions';
import { useContratosAnalytics } from '@/app/hooks/contratos/useContratosAnalytics';
=======
import { useContratosList } from './useContratosList';
import { useContratoDetalhe } from './useContratoDetalhe';
import { useContratosActions } from './useContratosActions';
import { useContratosAnalytics } from './useContratosAnalytics';
>>>>>>> parent of ec0cc7f (Amém)

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