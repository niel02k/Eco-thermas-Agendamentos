'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function criarUsuario({ nome, email, senha, cargo }) {
  const supabase = await createClient()

  // Verifica permissão
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuarioLogado } = await supabase
    .from('usuarios')
    .select('cargo')
    .eq('id', user.id)
    .single()

  if (usuarioLogado?.cargo !== 'SDR') {
    throw new Error('Sem permissão para criar usuários.')
  }

  // Cria o usuário com metadados (trigger insere em `usuarios` automaticamente)
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, cargo },
  })

  if (error) throw new Error(error.message)

  return data.user
}