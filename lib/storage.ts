// Upload/assinatura de arquivos no bucket privado "roteiros" (Supabase Storage).
// Via REST direto — sem SDK, mesma filosofia do resto do projeto.

const BUCKET = "roteiros";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} não configurada`);
  return v;
}

export async function uploadScriptFile(path: string, file: File): Promise<void> {
  const res = await fetch(`${env("SUPABASE_URL")}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar arquivo (${res.status}): ${await res.text()}`);
  }
}

export async function deleteScriptFile(path: string): Promise<void> {
  await fetch(`${env("SUPABASE_URL")}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
    },
  });
}

export async function signScriptFileUrl(path: string, expiresIn = 300): Promise<string> {
  const res = await fetch(`${env("SUPABASE_URL")}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      apikey: env("SUPABASE_SERVICE_ROLE_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao assinar URL (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { signedURL: string };
  return `${env("SUPABASE_URL")}/storage/v1${data.signedURL}`;
}
