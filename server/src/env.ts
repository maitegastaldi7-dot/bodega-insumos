import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisá server/.env (copiá .env.example).`);
  }
  return value;
}

export const env = {
  supabaseUrl: required("SUPABASE_URL"),
  supabasePublishableKey: required("SUPABASE_PUBLISHABLE_KEY"),
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
};
