import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://erzzekopjyszljxougia.supabase.co";
const supabaseKey = "sb_publishable_3HHlZg1nJdp9pI6FszEDZA_UsyDmMDW";

export const supabase = createClient(supabaseUrl, supabaseKey);
export const uploadImagem = async (file, bucket = "imagens") => {
  const nomeArquivo = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(nomeArquivo, file);

  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(nomeArquivo);
  return data.publicUrl;
};