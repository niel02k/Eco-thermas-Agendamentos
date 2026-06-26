"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Calendar
} from "lucide-react";

import Sidebar from "@/app/Components/Sidebar/Sidebar.jsx";
import Headers from "@/app/Components/Header/Header.jsx";
import PageHeader from "@/app/Components/PageHeader/PageHeader.jsx";
import StatCard from "@/app/Components/StatCard/StatCard.jsx";

import styles from "./Reports.module.css";

/* ───────────────── MOCK UNIFICADO ───────────────── */

const data = [
  { type: "contract", module: "Contrato", client: "Escola São José", seller: "Marcos Daniel", value: 4500, status: "ACTIVE", date: "2026-06-15" },
  { type: "reservation", module: "Reserva", client: "Empresa Alpha", seller: "Ana Paula", value: 9800, status: "ACTIVE", date: "2026-06-14" },
  { type: "contract", module: "Contrato", client: "Colégio Futuro", seller: "Marcos Daniel", value: 6200, status: "COMPLETED", date: "2026-06-13" },
  { type: "reservation", module: "Reserva", client: "Turma Kids", seller: "Bruno Leite", value: 3100, status: "ACTIVE", date: "2026-06-12" },
  { type: "contract", module: "Contrato", client: "Grupo Silva", seller: "Ana Paula", value: 12000, status: "ACTIVE", date: "2026-06-11" },
  { type: "reservation", module: "Reserva", client: "Escola Nova Era", seller: "Marcos Daniel", value: 5400, status: "CANCELLED", date: "2026-06-10" }
];

/* ───────────────── HELPERS ───────────────── */

const formatCurrency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ───────────────── COMPONENT ───────────────── */

export default function Reports() {
  const [visible, setVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ───── KPIs EXECUTIVOS ───── */

  const kpis = useMemo(() => {
    const total = data.reduce((a, b) => a + b.value, 0);

    const contracts = data.filter(d => d.type === "contract").length;
    const reservations = data.filter(d => d.type === "reservation").length;

    const conversion = Math.round((contracts / data.length) * 100);

    const avgTicket = total / data.length;

    return [
      {
        title: "Receita Total",
        value: formatCurrency(total),
        label: "Período selecionado",
        icon: DollarSign,
        color: "green"
      },
      {
        title: "Contratos",
        value: contracts,
        label: "Fechamentos",
        icon: FileText,
        color: "blue"
      },
      {
        title: "Reservas",
        value: reservations,
        label: "Operações",
        icon: Calendar,
        color: "blue"
      },
      {
        title: "Conversão",
        value: `${conversion}%`,
        label: "Eficiência comercial",
        icon: TrendingUp,
        color: "green"
      },
      {
        title: "Ticket Médio",
        value: formatCurrency(avgTicket),
        label: "Valor médio",
        icon: Activity,
        color: "yellow"
      }
    ];
  }, []);

  /* ───── INSIGHTS EXECUTIVOS ───── */

  const insights = useMemo(() => {
    const sellerMap = {};

    data.forEach(d => {
      sellerMap[d.seller] = (sellerMap[d.seller] || 0) + d.value;
    });

    const topSeller = Object.entries(sellerMap).sort((a, b) => b[1] - a[1])[0];

    return {
      topSeller
    };
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar
        activeItem="reports"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={`${styles.mainContent} ${visible ? styles.mainVisible : ""}`}>
        <Headers
          userName="Marcos Daniel"
          userRole="Administrador"
          initials="RM"
          activeItem="reports"
          onMenuOpen={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>

          {/* HEADER EXECUTIVO */}
          <PageHeader
            title="Relatórios Executivos"
            subtitle="Visão completa da operação Eco Thermas"
            actionLabel="Exportar PDF"
            actionIcon={Download}
            onAction={() => console.log("export pdf")}
          />

          {/* KPIs */}
          <div className={styles.statsGrid}>
            {kpis.map((k, i) => (
              <div key={k.title} className={styles.cardEntry}>
                <StatCard {...k} />
              </div>
            ))}
          </div>

          {/* INSIGHTS */}
          <div className={styles.insightsRow}>
            <div className={styles.insightCard}>
              <div className={styles.insightTitle}>Top Vendedor</div>
              <div className={styles.insightValue}>
                {insights.topSeller?.[0]}
              </div>
              <div className={styles.insightSub}>
                {formatCurrency(insights.topSeller?.[1] || 0)}
              </div>
            </div>

            <div className={styles.insightCard}>
              <div className={styles.insightTitle}>Status Operacional</div>
              <div className={styles.insightValue}>
                Saudável
              </div>
              <div className={styles.insightSub}>
                Fluxo dentro do esperado
              </div>
            </div>
          </div>

          {/* TABELA EXECUTIVA */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3>Base de Exportação</h3>
            </div>

            <div className={styles.table}>
              <div className={styles.tableRowHeader}>
                <span>Código</span>
                <span>Módulo</span>
                <span>Cliente</span>
                <span>Vendedor</span>
                <span>Valor</span>
                <span>Status</span>
              </div>

              {data.map((d, i) => (
                <div key={i} className={styles.tableRow}>
                  <span>{d.type.toUpperCase()}-{i + 1}</span>
                  <span>{d.module}</span>
                  <span>{d.client}</span>
                  <span>{d.seller}</span>
                  <span>{formatCurrency(d.value)}</span>
                  <span className={`${styles.status} ${styles[d.status.toLowerCase()]}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}