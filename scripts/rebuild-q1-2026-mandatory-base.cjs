const { createSupabaseClient, requireHouseholdId } = require("./lib/db.cjs")

const client = createSupabaseClient()

const householdId = requireHouseholdId()
const targetMonths = ["2026-01-01", "2026-02-01", "2026-03-01"]
const sourceMonth = "2026-04-01"

const requiredTitles = [
  "Карманные Саша",
  "Котлеты котам",
  "Маникюр и педикюр",
  "Пилон",
  "Подписки",
  "Продукты",
  "Плата за электричество",
  "Vodafone Сашин",
  "Аренда жилья",
  "iCloud",
  "GPT",
  "Английский",
  "Карманные Revolut",
  "Наполнитель",
  "Софье на жизнь",
  "FIGMA",
  "Strava",
  "Wi‑Fi T-mobile",
  "Grok",
  "Vodafone Ромин",
  "VZP",
  "Daň",
  "ČSSZ",
  "iCloud 2TB",
  "OpenAI GPT",
  "Spotify",
  "Netflix",
]

function buildDueDate(monthStart, dayOfMonth) {
  const [year, month] = monthStart.split("-").map(Number)
  return `${year}-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`
}

function monthLabel(sqlDate) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${sqlDate}T00:00:00Z`))
}

async function main() {
  await client.connect()

  const sourceRes = await client.query(
    `
      select
        title,
        amount,
        cadence,
        frequency,
        owner_scope,
        owner_person_id,
        payer_person_id,
        category_id,
        extract(day from due_on)::int as day_of_month
      from public.expense_occurrences
      where household_id = $1
        and occurrence_month = $2::date
        and title = any($3::text[])
      order by title, amount desc
    `,
    [householdId, sourceMonth, requiredTitles]
  )

  const byTitle = new Map()
  for (const row of sourceRes.rows) {
    if (!byTitle.has(row.title)) {
      byTitle.set(row.title, row)
    }
  }

  const missing = requiredTitles.filter((title) => !byTitle.has(title))
  if (missing.length) {
    throw new Error(`Missing required April titles: ${missing.join(", ")}`)
  }

  const rowsToCopy = requiredTitles.map((title) => byTitle.get(title))

  await client.query("begin")

  await client.query(
    `
      delete from public.expense_occurrences
      where household_id = $1
        and occurrence_month = any($2::date[])
    `,
    [householdId, targetMonths]
  )

  let inserted = 0
  for (const monthStart of targetMonths) {
    for (const row of rowsToCopy) {
      const dueOn = buildDueDate(monthStart, row.day_of_month)
      await client.query(
        `
          insert into public.expense_occurrences (
            household_id,
            series_id,
            occurrence_month,
            due_on,
            title,
            amount,
            cadence,
            frequency,
            owner_scope,
            owner_person_id,
            payer_person_id,
            category_id,
            source_type,
            status,
            completed_at,
            note
          )
          values (
            $1,
            null,
            $2::date,
            $3::date,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            'manual',
            'completed',
            timezone('utc', now()),
            'Backfilled from April 2026 mandatory base'
          )
        `,
        [
          householdId,
          monthStart,
          dueOn,
          row.title,
          row.amount,
          row.cadence,
          row.frequency,
          row.owner_scope,
          row.owner_person_id,
          row.payer_person_id,
          row.category_id,
        ]
      )
      inserted += 1
    }
  }

  await client.query("commit")

  const total = rowsToCopy.reduce((sum, row) => sum + Number(row.amount), 0)

  console.log(
    JSON.stringify(
      {
        sourceMonth: monthLabel(sourceMonth),
        targetMonths: targetMonths.map(monthLabel),
        titles: rowsToCopy.length,
        totalPerMonth: total,
        inserted,
      },
      null,
      2
    )
  )
}

main()
  .catch(async (error) => {
    try {
      await client.query("rollback")
    } catch {}
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    try {
      await client.end()
    } catch {}
  })
