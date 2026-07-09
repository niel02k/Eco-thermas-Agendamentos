// src/app/hooks/useConsultores.js
"use client";

import { useState, useCallback, useEffect } from "react";
import { listarConsultores } from "@/app/services/usuarioServices.js";

export function useConsultores() {
  const [consultores, setConsultores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listarConsultores({ status: "ATIVO" });
      
      // Garantir que sempre seja um array
      if (Array.isArray(resp)) {
        setConsultores(resp);
      } else if (resp?.data) {
        setConsultores(resp.data);
      } else if (resp?.consultores) {
        setConsultores(resp.consultores);
      } else {
        console.warn("Formato inesperado de consultores:", resp);
        setConsultores([]);
      }
    } catch (error) {
      console.error("Erro ao carregar consultores:", error);
      setError(error.message || "Erro ao carregar consultores");
      setConsultores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultores();
  }, [fetchConsultores]);

  return {
    consultores,
    loading,
    error,
    refetch: fetchConsultores
  };
}