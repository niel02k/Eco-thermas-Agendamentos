'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Cria um novo usuário no Supabase Auth + tabela `usuarios`.
 * Requer que o chamador seja ADM.
 */
export async function criarUsuario({ nome, email, senha, cargo }) {

  // ── 1. Valida os campos ──────────────────────────────────────
  if (!nome?.trim())    throw new Error('Nome é obrigatório.')
  if (!email?.trim())   throw new Error('E-mail é obrigatório.')
  if (!senha?.trim())   throw new Error('Senha é obrigatória.')
  if (senha.length < 8) throw new Error('A senha deve ter no mínimo 8 caracteres.')

  const cargosValidos = ['ADM', 'CONSULTOR']
  if (!cargosValidos.includes(cargo)) {
    throw new Error(`Cargo inválido. Use: ${cargosValidos.join(', ')}.`)
  }

  // ── 2. Verifica se o chamador é ADM ──────────────────────────
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Sessão inválida. Faça login novamente.')

  const { data: usuarioLogado, error: dbError } = await supabase
    .from('usuarios')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (dbError || !usuarioLogado) throw new Error('Não foi possível verificar seu perfil.')
  if (usuarioLogado.cargo !== 'ADM') throw new Error('Acesso negado. Apenas ADMs podem criar usuários.')

  // ── 3. Cria no Supabase Auth via admin client ─────────────────
  const admin = createAdminClient()

  console.log('[criarUsuario] Iniciando criação no Auth para:', email);

  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email:         email.trim().toLowerCase(),
    password:      senha,
    email_confirm: true, // Força a confirmação para evitar que o Supabase tente enviar e-mail e falhe
    user_metadata: { nome: nome.trim(), cargo },
  })

  if (createError) {
    // Log detalhado para diagnóstico
    console.error('[criarUsuario] Erro detalhado:', createError);

    // Tratamento de erros específicos
    if (createError.message?.includes('already registered')) {
      throw new Error('Este e-mail já está cadastrado no sistema.');
    }
    
    // Erro 500/Retryable geralmente é problema de rede ou config de e-mail no Supabase
    if (createError.status === 500 || createError.name === 'AuthRetryableFetchError') {
      throw new Error('O servidor de autenticação falhou. Verifique se a "Service Role Key" está correta e se o e-mail de confirmação está desativado no painel do Supabase.');
    }

    throw new Error(createError.message || 'Erro ao criar conta de autenticação.');
  }

  console.log('[criarUsuario] Auth criado com sucesso. ID:', authData.user.id);

  // ── 4. Upsert na tabela `usuarios` ────────────────────────────
  const { error: upsertError } = await admin
    .from('usuarios')
    .upsert(
      {
        id:     authData.user.id,
        nome:   nome.trim(),
        email:  email.trim().toLowerCase(),
        cargo,
        status: 'ATIVO',
      },
      { onConflict: 'id' }
    )

  if (upsertError) {
    console.error('[criarUsuario] Erro no banco de dados:', upsertError);
    // Rollback: deleta o usuário do Auth se falhar no banco
    await admin.auth.admin.deleteUser(authData.user.id);
    throw new Error('Usuário criado no Auth, mas falhou ao salvar dados adicionais. Operação cancelada.');
  }

  console.log('[criarUsuario] Processo concluído com sucesso.');

  return {
    id:    authData.user.id,
    nome:  nome.trim(),
    email: email.trim().toLowerCase(),
    cargo,
  }
}

/**
 * Altera o cargo de um usuário.
 */
export async function alterarCargoUsuario(targetId, novoCargo) {
  const cargosValidos = ['ADM', 'CONSULTOR']
  if (!cargosValidos.includes(novoCargo)) throw new Error('Cargo inválido.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  if (user.id === targetId) throw new Error('Você não pode alterar seu próprio cargo.')

  const { data: usuarioLogado } = await supabase
    .from('usuarios').select('cargo').eq('id', user.id).single()

  if (usuarioLogado?.cargo !== 'ADM') throw new Error('Acesso negado.')

  const admin = createAdminClient()
  const { error } = await admin.from('usuarios').update({ cargo: novoCargo }).eq('id', targetId)
  if (error) throw new Error(error.message)
  return true
}

/**
 * Ativa ou desativa um usuário.
 */
export async function alterarStatusUsuario(targetId, novoStatus) {
  const statusValidos = ['ATIVO', 'INATIVO']
  if (!statusValidos.includes(novoStatus)) throw new Error('Status inválido.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  if (user.id === targetId) throw new Error('Você não pode alterar seu próprio status.')

  const { data: usuarioLogado } = await supabase
    .from('usuarios').select('cargo').eq('id', user.id).single()

  if (usuarioLogado?.cargo !== 'ADM') throw new Error('Acesso negado.')

  const admin = createAdminClient()
  const { error } = await admin.from('usuarios').update({ status: novoStatus }).eq('id', targetId)
  if (error) throw new Error(error.message)
  return true
}
