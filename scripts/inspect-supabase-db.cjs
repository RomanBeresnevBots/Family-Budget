const { Client } = require("pg");

const client = new Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.qlsouerrwwyqjmuicxxr",
  password: "zingom-1zamfi-wefFoc",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const queries = {
  users: "select id, email from auth.users order by created_at",
  households:
    "select id, name, owner_user_id, created_at from public.households order by created_at",
  memberships:
    "select household_id, user_id, role, created_at from public.household_memberships order by created_at",
  counts: `
    select household_id, 'categories' as src, count(*)::int as count
    from public.categories
    group by household_id
    union all
    select household_id, 'people' as src, count(*)::int as count
    from public.people
    group by household_id
    union all
    select household_id, 'series' as src, count(*)::int as count
    from public.expense_series
    group by household_id
    union all
    select household_id, 'occurrences' as src, count(*)::int as count
    from public.expense_occurrences
    group by household_id
    order by household_id, src
  `,
  occurrences: `
    select household_id, title, amount, occurrence_month, due_on, series_id, source_type, status, created_at
    from public.expense_occurrences
    order by created_at desc
    limit 20
  `,
  series: `
    select household_id, id, source_expense_client_id, is_active, created_at
    from public.expense_series
    order by created_at desc
    limit 20
  `,
};

(async () => {
  await client.connect();

  for (const [name, sql] of Object.entries(queries)) {
    const { rows } = await client.query(sql);
    console.log(`---${name}---`);
    console.log(JSON.stringify(rows, null, 2));
  }

  await client.end();
})().catch(async (error) => {
  console.error(error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
