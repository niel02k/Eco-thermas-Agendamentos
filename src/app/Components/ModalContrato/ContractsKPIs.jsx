// src/app/(sua-rota)/contratos/components/ContractsKPIs.jsx
"use client";

import React, { useMemo } from "react";
import { Activity, BarChart3, TrendingUp, DollarSign, Award } from "lucide-react";
import StatCard from "@/app/Components/Cards/StatCard/StatCard.jsx";
import styles from "@/app/Components/ModalContrato/Contracts.module.css";
import { STATUS_CONTRATO } from "@/lib/constants";

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ContractsKPIs({ contratos, total, resumoGeral, ticketInfo }) {
  const kpis = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const hojeCount = contratos.filter(c =>
      c.data_criacao?.startsWith(hoje) || c.data_inicio?.startsWith(hoje)
    ).length;
    const ativos = resumoGeral?.contratos_ativos || contratos.filter(c => c.status === STATUS_CONTRATO.ATIVO).length;
    const receitaTotal = resumoGeral?.receita_total || ticketInfo?.valor_total || 0;
    const ticketMedio = resumoGeral?.ticket_medio || ticketInfo?.ticket_medio || 0;
    const conversion = total > 0 ? Math.round((ativos / total) * 100) : 0;

    return [
      { title: "Hoje", value: hojeCount, label: "Contratos hoje", icon: Activity, color: "blue" },
      { title: "Ativos", value: ativos, label: "Contratos ativos", icon: BarChart3, color: "green" },
      { title: "Total", value: total, label: "Total de contratos", icon: TrendingUp, color: "blue" },
      { title: "Receita", value: formatCurrency(receitaTotal), label: "Receita total", icon: DollarSign, color: "green" },
      { title: "Conversão", value: `${conversion}%`, label: "Taxa de ativos", icon: TrendingUp, color: conversion > 50 ? "green" : "yellow" },
      { title: "Ticket Médio", value: formatCurrency(ticketMedio), label: "Valor médio", icon: Award, color: "yellow" },
    ];
  }, [contratos, total, resumoGeral, ticketInfo]);

  return (
    <div className={styles.kpisGrid}>
      {kpis.map((kpi, i) => (
        <div key={kpi.title} className={styles.kpiCard} style={{ animationDelay: `${i * 80}ms` }}>
          <StatCard {...kpi} />
        </div>
      ))}
    </div>
  );
}