import { createClient } from '@/lib/supabase/client';


const supabase = createClient();


// ============ GERAR CÓDIGO ============
async function gerarCodigoAgendamento() {
  const hoje = new Date();
  const ano = String(hoje.getFullYear()).slice(-2);
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const prefixo = `${ano}.${mes}.`;


  const { data, error } = await supabase
    .from('agendamentos')
    .select('codigo')
    .like('codigo', `${prefixo}%`)
    .order('codigo', { ascending: false })
    .limit(1);


  if (error) throw error;


  let sequencial = 100;
  if (data && data.length > 0) {
    const ultimoNumero = parseInt(data[0].codigo.split('.').pop());
    sequencial = ultimoNumero + 1;
  }


  return `${prefixo}${sequencial}`;
}


export async function totalClientesAtendidos() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('quantidade_pessoas')
    .eq('status', 'REALIZADO')

  if (error) throw error

  return data?.reduce((acc, a) => acc + (a.quantidade_pessoas || 1), 0) ?? 0
}

// AGENDAMENTOS DE HOJE (CONFIRMADO)
export async function agendamentosHoje() {
  const hoje = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('data_visita', hoje)
    .in('status', ['PENDENTE', 'CONFIRMADO'])

  if (error) throw error
  return count ?? 0
}



export async function atualizarResultadoVenda(codigo, resultadoVenda) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      status: 'REALIZADO',
      resultado_venda: resultadoVenda
    })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function marcarComoRealizado(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      status: 'REALIZADO',
      resultado_venda: 'PENDENTE'
    })
    .eq('codigo', codigo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// PRÓXIMOS DIAS COM AGENDAMENTOS (agrupado por data, excluindo hoje)
export async function proximosDiasComAgendamentos(quantidade = 2) {
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita')
    .gte('data_visita', amanha.toISOString().split('T')[0])
    .in('status', ['PENDENTE', 'CONFIRMADO'])
    .order('data_visita', { ascending: true })

  if (error) throw error

  const agrupado = {}
  data.forEach(a => {
    agrupado[a.data_visita] = (agrupado[a.data_visita] || 0) + 1
  })

  return Object.entries(agrupado)
    .slice(0, quantidade)
    .map(([data_visita, total]) => ({
      data_visita,
      total,
      label: new Date(data_visita + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      })
    }))
}

// LISTAR com busca por nome do titular ou dependente
export async function listarAgendamentos({ pagina = 1, limite = 10, busca = '' } = {}) {
  const inicio = (pagina - 1) * limite;
  const fim = inicio + limite - 1;


  let query = supabase
    .from('agendamentos')
    .select(`
      *,
      cliente:cliente_id (nome, cpf, telefone),
      dependentes:agendamento_dependentes (nome, idade)
    `, { count: 'exact' });


  // Busca por nome do titular OU nome do dependente
  if (busca) {
    query = query.or(
      `cliente_id.in.(SELECT id FROM clientes WHERE nome.ilike.%${busca}%),` +
      `codigo.in.(SELECT agendamento_id FROM agendamento_dependentes WHERE nome.ilike.%${busca}%)`
    );
  }


  const { data, count, error } = await query
    .order('data_visita', { ascending: false })
    .range(inicio, fim);


  if (error) throw error;


  return {
    agendamentos: data,
    total: count,
    pagina,
    totalPaginas: Math.ceil(count / limite)
  };
}


// BUSCAR por código (ID)
export async function buscarAgendamentoPorCodigo(codigo) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      *,
      cliente:cliente_id (*),
      dependentes:agendamento_dependentes (*)
    `)
    .eq('codigo', codigo)
    .single();


  if (error) throw error;
  return data;
}


// BUSCAR por nome do titular ou dependente (sem paginação)
export async function buscarAgendamentosPorNome(busca) {
  const { data, error } = await supabase
    .from('agendamentos').select(`*,cliente:cliente_id (nome, cpf, telefone),dependentes:agendamento_dependentes (nome, idade)`)
    .or(
      `cliente_id.in.(SELECT id FROM clientes WHERE nome.ilike.%${busca}%),` +
      `codigo.in.(SELECT agendamento_id FROM agendamento_dependentes WHERE nome.ilike.%${busca}%)`
    )
    .order('data_visita', { ascending: false })
    .limit(20);


  if (error) throw error;
  return data;
}


// CRIAR
export async function criarAgendamento(dados) {


  const codigo = await gerarCodigoAgendamento();


  const { data, error } = await supabase
    .from('agendamentos')
    .insert([{
      codigo,
      cliente_id: dados.cliente_id,
      vendedor_id: dados.vendedor_id || null,
      data_visita: dados.data_visita,
      horario_visita: dados.horario_visita,
      quantidade_pessoas: dados.quantidade_pessoas || 1,
      status: 'PENDENTE',
      resultado_venda: 'PENDENTE',
      observacoes: dados.observacoes || null
    }])
    .select()
    .single();


  if (error) throw error;


  // Dependentes
  if (dados.dependentes && dados.dependentes.length > 0) {
    const deps = dados.dependentes.map(d => ({
      agendamento_id: codigo,
      nome: d.nome,
      idade: d.idade,
      cpf: d.cpf || null
    }));


    const { error: depError } = await supabase.from('agendamento_dependentes')
      .insert(deps);


    if (depError) throw depError;
  }


  return data;
}


// ATUALIZAR
export async function atualizarAgendamento(codigo, dados) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      cliente_id: dados.cliente_id,
      vendedor_id: dados.vendedor_id,
      data_visita: dados.data_visita,
      horario_visita: dados.horario_visita,
      quantidade_pessoas: dados.quantidade_pessoas,
      status: dados.status,
      resultado_venda: dados.resultado_venda,
      observacoes: dados.observacoes
    })
    .eq('codigo', codigo)
    .select()
    .single();


  if (error) throw error;
  return data;
}


// EXCLUIR
export async function excluirAgendamento(codigo) {
  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('codigo', codigo);


  if (error) throw error;
  return true;
}

// AGENDAMENTOS POR DIA DA SEMANA ATUAL
export async function agendamentosPorDiaSemana() {
  const hoje = new Date()
  const diaSemana = hoje.getDay()

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1))
  inicioSemana.setHours(0, 0, 0, 0)

  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 6)
  fimSemana.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('agendamentos')
    .select('data_visita, quantidade_pessoas')
    .gte('data_visita', inicioSemana.toISOString().split('T')[0])
    .lte('data_visita', fimSemana.toISOString().split('T')[0])

  if (error) throw error

  // Inicializa os 7 dias da semana com 0
  const contagem = [0, 0, 0, 0, 0, 0, 0] // [Seg, Ter, Qua, Qui, Sex, Sáb, Dom]

  data.forEach(a => {
    const d = new Date(a.data_visita + 'T12:00:00')
    const idx = d.getDay()
    const posicao = idx === 0 ? 6 : idx - 1
    contagem[posicao] += 1
  })

  return contagem
}

export async function taxaDeConversao({
  inicio,
  fim,
} = {}) {
  const hoje = new Date();
  const dataInicio = inicio || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const dataFim = fim || hoje.toISOString().split('T')[0];

  const { count: vendasrealizada , error } = await supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REALIZADO')
    .eq('resultado_venda', 'VENDA_REALIZADA')
    .gte('data_visita', dataInicio)
    .lte('data_visita', dataFim);

  if (error) throw error;

   const { count: atendidos, error: totalError } = await supabase
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REALIZADO')
    .gte('data_visita', dataInicio)
    .lte('data_visita', dataFim);

    const resultado = atendidos > 0
    ? Number(((vendasrealizada / atendidos) * 100).toFixed(2))
    : 0;

  if (totalError) throw totalError;

  return resultado ?? 0;
}
