import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getNotifications() {
  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .order("data_notificacao", { ascending: false });

  if (error) throw error;

  return data;
}