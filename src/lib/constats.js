// src/app/lib/constants.js
export const CARGO = {
  ADM: 'ADM',
  CONSULTOR: 'CONSULTOR',
}

export const STATUS_USUARIO = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
}

export const ORIGEM = {
  LEADS_SDR: 'Leads SDR',
  DIRETO: 'Direto',
  ORGANICO: 'Orgânico',
  DAY_USE: 'Day use',
  OUTRO: 'OUTRO',
}

export const STATUS_AGENDAMENTO = {
  PENDENTE: 'PENDENTE',
  CONFIRMADO: 'CONFIRMADO',
  CANCELADO: 'CANCELADO',
  REALIZADO: 'REALIZADO',
}

export const RESULTADO_VENDA = {
  PENDENTE: 'PENDENTE',
  VENDA_REALIZADA: 'VENDA_REALIZADA',
  VENDA_PERDIDA: 'VENDA_PERDIDA',
  NAO_APLICAVEL: 'NAO_APLICAVEL',
}

export const STATUS_CONTRATO = {
  PENDENTE: 'PENDENTE',
  ATIVO: 'ATIVO',
  BLOQUEADO: 'BLOQUEADO',
  ENCERRADO: 'ENCERRADO',
  CANCELADO: 'CANCELADO',
}

export const PAGAMENTO = {
  PIX: 'PIX',
  DINHEIRO: 'DINHEIRO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
}

export const COBRANCA = {
  UNICO: 'UNICO',
  RECORRENTE: 'RECORRENTE',
}

export const ACAO = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
}

export const TIPO_REGRA = {
  FUNCIONAMENTO: 'FUNCIONAMENTO',
  CAPACIDADE: 'CAPACIDADE',
  RESERVA: 'RESERVA',
  HORARIO: 'HORARIO',
  FERIADO: 'FERIADO',
  GERAL: 'GERAL',
}

// Labels para exibição
export const CARGO_LABELS = {
  ADM: 'Administrador',
  CONSULTOR: 'Consultor',
}

export const STATUS_CONTRATO_LABELS = {
  PENDENTE: 'Pendente',
  ATIVO: 'Ativo',
  BLOQUEADO: 'Bloqueado',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
}

export const PAGAMENTO_LABELS = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
}

export const COBRANCA_LABELS = {
  UNICO: 'Único',
  RECORRENTE: 'Recorrente',
}