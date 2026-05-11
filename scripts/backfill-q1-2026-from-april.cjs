const { Client } = require("pg");

const client = new Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.qlsouerrwwyqjmuicxxr",
  password: "zingom-1zamfi-wefFoc",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const householdId = "59591296-6d8b-44e1-ab20-5242247bce9c";
const aprilMonth = "2026-04-01";
const targetMonths = ["2026-01-01", "2026-02-01", "2026-03-01"];
const emptyUuid = "00000000-0000-0000-0000-000000000000";

function monthLabel(sqlDate) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${sqlDate}T00:00:00Z`));
}

function buildDueDate(monthStart, dayOfMonth) {
  const [year, month] = monthStart.split("-").map(Number);
  return `${year}-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
}

async function main() {
  await client.connect();

  const countsRes = await client.query(
    `
      select occurrence_month, count(*)::int as count
      from public.expense_occurrences
      where household_id = $1
        and occurrence_month = any($2::date[])
      group by occurrence_month
      order by occurrence_month
    `,
    [householdId, targetMonths],
  );

  if (countsRes.rows.some((row) => row.count > 0)) {
    const details = countsRes.rows
      .map((row) => `${row.occurrence_month.toISOString().slice(0, 10)} => ${row.count}`)
      .join(", ");
    throw new Error(`Q1 2026 already contains rows, aborting backfill: ${details}`);
  }

  const aprilRegularRes = await client.query(
    `
      with matched_series as (
        select
          es.id as series_id,
          es.household_id,
          esv.title,
          esv.cadence,
          esv.frequency,
          esv.day_of_month,
          esv.owner_scope,
          esv.owner_person_id,
          esv.payer_person_id,
          esv.category_id,
          row_number() over (
            partition by es.id
            order by esv.effective_from desc, esv.created_at desc
          ) as rn
        from public.expense_series es
        join public.expense_series_versions esv on esv.series_id = es.id
        where es.household_id = $1
      )
      select
        coalesce(o.series_id, ms.series_id) as resolved_series_id,
        o.title,
        o.amount,
        o.cadence,
        o.frequency,
        o.owner_scope,
        o.owner_person_id,
        o.payer_person_id,
        o.category_id,
        extract(day from o.due_on)::int as due_day,
        o.note
      from public.expense_occurrences o
      left join matched_series ms
        on ms.rn = 1
       and ms.household_id = o.household_id
       and ms.title = o.title
       and ms.cadence = o.cadence
       and ms.frequency = o.frequency
       and ms.owner_scope = o.owner_scope
       and coalesce(ms.owner_person_id, $3::uuid) = coalesce(o.owner_person_id, $3::uuid)
       and ms.payer_person_id = o.payer_person_id
       and ms.category_id = o.category_id
       and ms.day_of_month = extract(day from o.due_on)::int
      where o.household_id = $1
        and o.occurrence_month = $2::date
        and (o.series_id is not null or ms.series_id is not null)
      order by due_day, title
    `,
    [householdId, aprilMonth, emptyUuid],
  );

  const byKey = new Map();
  for (const row of aprilRegularRes.rows) {
    const key =
      row.resolved_series_id ??
      [
        row.title,
        row.amount,
        row.cadence,
        row.frequency,
        row.owner_scope,
        row.owner_person_id ?? emptyUuid,
        row.payer_person_id,
        row.category_id,
        row.due_day,
      ].join("|");

    if (!byKey.has(key)) {
      byKey.set(key, row);
    }
  }

  const sourceRows = Array.from(byKey.values());
  if (!sourceRows.length) {
    throw new Error("Could not resolve April regular expenses to backfill.");
  }

  await client.query("begin");

  let inserted = 0;
  for (const targetMonth of targetMonths) {
    for (const row of sourceRows) {
      const dueOn = buildDueDate(targetMonth, row.due_day);

      const insertRes = await client.query(
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
            $1, $2, $3::date, $4::date, $5, $6, $7, $8,
            $9, $10, $11, $12, 'series', 'completed', timezone('utc', now()), $13
          )
          on conflict (series_id, occurrence_month) where series_id is not null do nothing
          returning id
        `,
        [
          householdId,
          row.resolved_series_id,
          targetMonth,
          dueOn,
          row.title,
          row.amount,
          row.cadence,
          row.frequency,
          row.owner_scope,
          row.owner_person_id,
          row.payer_person_id,
          row.category_id,
          row.note,
        ],
      );

      inserted += insertRes.rowCount;
    }
  }

  await client.query("commit");

  console.log(
    JSON.stringify(
      {
        sourceMonth: monthLabel(aprilMonth),
        targetMonths: targetMonths.map(monthLabel),
        sourceRegularRows: sourceRows.length,
        inserted,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(async (error) => {
    try {
      await client.query("rollback");
    } catch {}
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await client.end();
    } catch {}
  });
