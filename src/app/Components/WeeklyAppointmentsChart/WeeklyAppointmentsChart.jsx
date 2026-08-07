"use client";

import React from "react";
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./WeeklyAppointmentsChart.module.css";

export default function WeeklyAppointmentsChart({
  data = [],
  title = "Agendamentos",
  subtitle = "Semana atual",
  height = 200,
  barColor = "#6EC8F0",
  loading = false,
}) {
  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  
  const chartData = diasSemana.map((dia, i) => {
    const encontrado = (data || []).find(d => d.day === dia);
    return { dia, total: encontrado?.total || 0 };
  });

  const temDados = chartData.some(d => d.total > 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>{title}</h2>
          <p className={styles.chartSub}>{subtitle}</p>
        </div>
        <div className={`${styles.chartBadge} ${styles.chartBadgeBlue}`}>
          <Activity size={13} />
          Agendamentos/dia
        </div>
      </div>

      {/* 👇 SKELETON DE CARREGAMENTO */}
      {loading ? (
        <div className={styles.skeletonChart} style={{ height }}>
          <div className={styles.skeletonBars}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className={styles.skeletonBarItem} style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
      ) : temDados ? (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#32383e" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#32383e" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip 
              formatter={(v) => [v, "Agendamentos"]}
              contentStyle={{
                borderRadius: "10px", border: "1px solid #536a88",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px",
              }}
            />
            <Bar dataKey="total" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className={styles.emptyChart} style={{ height }}>
          <div className={styles.emptyIcon}>📊</div>
          <p>Nenhum agendamento nesta semana</p>
        </div>
      )}
    </div>
  );
}