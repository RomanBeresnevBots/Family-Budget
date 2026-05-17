const { Client } = require("pg")
const { loadEnvFiles, requireEnv } = require("./env.cjs")

loadEnvFiles()

function createSupabaseClient() {
  return new Client({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    database: process.env.SUPABASE_DB_NAME || "postgres",
    ssl: {
      rejectUnauthorized: process.env.SUPABASE_DB_SSL_REJECT_UNAUTHORIZED === "true",
    },
  })
}

function requireHouseholdId() {
  return requireEnv("SUPABASE_HOUSEHOLD_ID")
}

module.exports = {
  createSupabaseClient,
  requireHouseholdId,
}
