"use client";

import React, { memo } from "react";
import styles from "@/app/Components/Shared/Shared.module.css";
import {
  STATUS_AGENDAMENTO_LABELS,
  STATUS_AGENDAMENTO_COLORS,
  RESULTADO_VISITA,
  RESULTADO_VENDA,
  STATUS_CONTRATO_LABELS,
} from "@/lib/constants";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

const TIPO_CONTRATO_LABELS = {
  EFV: "EFV",
  PM: "PM",
  GD: "GD",
};

const TIPO_CONTRATO_COLORS = {
  EFV: "#1E6EBE",
  PM: "#991094",
  GD: "#FA643C",
};



function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
  if (!horario) return "—";
  return horario.slice(0, 5);
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}



function getBadgeInfo(dados, tipo) {
  if (tipo === "contrato") {
    const statusColors = {
      ATIVO: "#16A34A",
      PENDENTE: "#EAB308",
      CANCELADO: "#DC2626",
      ENCERRADO: "#6B21A8",
      BLOQUEADO: "#6B21A8",
    };

    return {
      label: STATUS_CONTRATO_LABELS[dados.status] || dados.status,
      color: statusColors[dados.status] || "#94A3B8",
    };
  }

  if (dados.resultado_visita === RESULTADO_VISITA.FALTOU) {
    return { label: "Faltou", color: "#EF4444" };
  }

  if (
    dados.resultado_visita === RESULTADO_VISITA.REALIZADO &&
    dados.resultado_venda === RESULTADO_VENDA.VENDA_REALIZADA
  ) {
    return { label: "Vendido", color: "#16A34A" };
  }

  if (
    dados.resultado_visita === RESULTADO_VISITA.REALIZADO &&
    dados.resultado_venda === RESULTADO_VENDA.VENDA_PERDIDA
  ) {
    return { label: "Perdido", color: "#DC2626" };
  }

  if (dados.resultado_visita === RESULTADO_VISITA.REALIZADO) {
    return { label: "Realizado", color: "#1E6EBE" };
  }

  return {
    label: STATUS_AGENDAMENTO_LABELS[dados.status] || dados.status,
    color: STATUS_AGENDAMENTO_COLORS[dados.status] || "#94A3B8",
  };
}

function DataRow({ tipo = "agendamento", dados, onRowClick }) {
   const isMobile = useMediaQuery("(max-width: 1600px)");
  const isAgendamento = tipo === "agendamento";
  const badge = getBadgeInfo(dados, tipo);
  const id = isAgendamento ? dados.codigo : dados.id;
  const nomeCompleto = isAgendamento
    ? dados.cliente?.nome
    : dados.titular_nome;

    function limitarNome(nome) {
    const nomeCompleto = String(nome ?? "").trim();
    if (!nomeCompleto) return "—";

    if (!isMobile) return nomeCompleto; // desktop: nome completo

    const partesNome = nomeCompleto.split(/\s+/);
    if (partesNome.length <= 2) return nomeCompleto;

    return `${partesNome.slice(0, 2).join(" ")}...`;
  }

  return (
    <div className={styles.tableRow} onClick={() => onRowClick?.(dados)}>
      <span className={styles.colCodigo} style={{ color: badge.color }}>
        #{id}
      </span>

      <span className={styles.colCliente}>
        <span
          className={styles.clienteNome}
          title={nomeCompleto || "—"}
        >
          {limitarNome(nomeCompleto)}
        </span>

        {isAgendamento && dados.cliente?.telefone && (
          <span className={styles.clienteSub}>{dados.cliente.telefone}</span>
        )}
      </span>

      {isAgendamento ? (
        <span className={styles.colData}>
          <span>{formatarData(dados.data_visita)}</span>
          <span className={styles.clienteSub}>
            {formatarHorario(dados.horario_visita)}
          </span>
        </span>
      ) : (
        <span className={styles.colConsultor}>{dados.vendedor?.nome || "—"}</span>
      )}

      {isAgendamento ? (
        <span className={styles.colPessoas}>{dados.quantidade_pessoas}</span>
      ) : (
        <span className={styles.colValor}>{formatarMoeda(dados.valor_total)}</span>
      )}

      {isAgendamento ? (
        <span>
          <span
            className={styles.statusBadge}
            style={{
              background: `${badge.color}18`,
              color: badge.color,
              border: `1px solid ${badge.color}30`,
            }}
          >
            {badge.label}
          </span>
        </span>
      ) : (
        <span>
          <span
            className={styles.statusBadge}
            style={{
              background: `${TIPO_CONTRATO_COLORS[dados.tipo_contrato] || "#94A3B8"}18`,
              color: TIPO_CONTRATO_COLORS[dados.tipo_contrato] || "#94A3B8",
              border: `1px solid ${TIPO_CONTRATO_COLORS[dados.tipo_contrato] || "#94A3B8"}30`,
            }}
          >
            {TIPO_CONTRATO_LABELS[dados.tipo_contrato] ||
              dados.tipo_contrato ||
              "—"}
          </span>
        </span>
      )}
    </div>
  );
}

export default memo(DataRow);
