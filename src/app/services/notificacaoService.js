import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getNotifications() {
  console.log("SERVICE EXECUTOU");

  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .order("data_notificacao", { ascending: false });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) throw error;

  return data;
}