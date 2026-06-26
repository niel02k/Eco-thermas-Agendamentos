"use client";

import React, { useEffect, useMemo, useState } from "react";
import {Plus,TrendingUp,TrendingDown,Award,Activity,DollarSign,BarChart3} from "lucide-react";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";
import styles from "./Contracts.module.css";



const CONTRACT_TYPES = {
  EFV: "Vitalício",
  PM: "3 Anos",
  GD: "Gold"
};

const mockContracts = [
  { id: 1, code: "EFV-050589", client: "Escola São José", type: "EFV", seller: "Marcos Daniel", date: "2026-06-15", value: 4500, status: "ACTIVE" },
  { id: 2, code: "CTR-0002", client: "Empresa Alpha", type: "GD", seller: "Ana Paula", date: "2026-06-14", value: 9800, status: "ACTIVE" },
  { id: 3, code: "CTR-0003", client: "Colégio Futuro", type: "PM", seller: "Marcos Daniel", date: "2026-06-13", value: 6200, status: "COMPLETED" },
  { id: 4, code: "CTR-0004", client: "Turma Kids", type: "EFV", seller: "Bruno Leite", date: "2026-06-12", value: 3100, status: "ACTIVE" },
  { id: 5, code: "CTR-0005", client: "Grupo Família Silva", type: "GD", seller: "Ana Paula", date: "2026-06-11", value: 12000, status: "ACTIVE" },
  { id: 6, code: "CTR-0006", client: "Escola Nova Era", type: "PM", seller: "Marcos Daniel", date: "2026-06-10", value: 5400, status: "CANCELLED" }
];

/* ───────────────────────── HELPERS ───────────────────────── */

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ───────────────────────── MAIN ───────────────────────── */

export default function Contracts() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ───── KPIs ───── */

  const kpis = useMemo(() => {
    const today = "2026-06-15";

    const todayCount = mockContracts.filter(c => c.date === today).length;

    const weekCount = mockContracts.length; // simplificado mock

    const monthCount = mockContracts.length;

    const totalRevenue = mockContracts.reduce((acc, c) => acc + c.value, 0);

    const avgTicket = totalRevenue / mockContracts.length;

    const conversion = 68; // mock fixado (já definido por você)

    return [
      {
        title: "Hoje",
        value: todayCount,
        label: "Contratos hoje",
        icon: Activity,
        color: "blue"
      },
      {
        title: "Semana",
        value: weekCount,
        label: "Contratos semana",
        icon: BarChart3,
        color: "green"
      },
      {
        title: "Mês",
        value: monthCount,
        label: "Contratos mês",
        icon: TrendingUp,
        color: "blue"
      },
      {
        title: "Receita",
        value: formatCurrency(totalRevenue),
        label: "Total acumulado",
        icon: DollarSign,
        color: "green"
      },
      {
        title: "Conversão",
        value: `${conversion}%`,
        label: "Taxa de conversão",
        icon: TrendingUp,
        color: conversion > 50 ? "green" : "yellow"
      },
      {
        title: "Ticket Médio",
        value: formatCurrency(avgTicket),
        label: "Valor médio",
        icon: Award,
        color: "yellow"
      }
    ];
  }, []);

  /* ───── INSIGHTS ───── */

  const topSeller = useMemo(() => {
    const map = {};

    mockContracts.forEach(c => {
      map[c.seller] = (map[c.seller] || 0) + c.value;
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, []);

  const topType = useMemo(() => {
    const map = {};

    mockContracts.forEach(c => {
      map[c.type] = (map[c.type] || 0) + 1;
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, []);

  return (
    <div className={styles.container}>
    

      <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ""}`}>
        

        <div className={styles.content}>
          <PageHeader
            title="Contratos"
            subtitle="Gestão e análise de contratos emitidos"
            actionLabel="Novo Contrato"
            actionIcon={Plus}
            onAction={() => console.log("novo contrato")}
          />

          {/* KPIs */}
          <div className={styles.statsGrid}>
            {kpis.map((k, i) => (
              <div
                key={k.title}
                className={styles.cardEntry}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <StatCard {...k} />
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className={styles.insightsRow}>
            <div className={styles.insightCard}>
              <h3 className={styles.topseller}>Top Vendedor</h3>
              <p className={styles.bigValue}>{topSeller?.[0]}</p>
              <span>{formatCurrency(topSeller?.[1] || 0)}</span>
            </div>

            <div className={styles.insightCard}>
              <h3 className={styles.topseller} >Tipo Mais Vendido</h3>
              <p className={styles.bigValue}>
                {CONTRACT_TYPES[topType?.[0]]}
              </p>
              
              <span>{topType?.[1]} contratos</span>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3>Contratos Recentes</h3>
            </div>

            <div className={styles.table}>
              <div className={styles.tableRowHeader}>
                <span>Código</span>
                <span>Cliente</span>
                <span>Tipo</span>
                <span>Vendedor</span>
                <span>Valor</span>
                <span>Status</span>
              </div>

              {mockContracts.map(c => (
                <div key={c.id} className={styles.tableRow}>
                  <p className={styles.tableRowcode}>{c.code}</p>
                  <p className={styles.tableRowclient}>{c.client}</p>
                  <p className={styles.tableRowtype}>{CONTRACT_TYPES[c.type]}</p>
                  <p className={styles.tableRowseller}>{c.seller}</p>
                  <p className={styles.tableRowbravery}>{formatCurrency(c.value)}</p>
                  <p className={`${styles.status} ${styles[c.status.toLowerCase()]}`}>
                    {c.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}