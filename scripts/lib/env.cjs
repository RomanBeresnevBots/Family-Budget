const fs = require("fs")
const path = require("path")

const projectRoot = path.resolve(__dirname, "..", "..")
const defaultEnvFilenames = [".env.local", ".env"]

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function parseEnvFile(contents) {
  const parsed = {}

  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }

    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim())

    if (key) {
      parsed[key] = value
    }
  }

  return parsed
}

function loadEnvFiles(filenames = defaultEnvFilenames) {
  for (const filename of filenames) {
    const filePath = path.join(projectRoot, filename)
    if (!fs.existsSync(filePath)) {
      continue
    }

    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"))
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Add it to .env.local or export it before running the script.`
    )
  }

  return value
}

module.exports = {
  loadEnvFiles,
  projectRoot,
  requireEnv,
}
