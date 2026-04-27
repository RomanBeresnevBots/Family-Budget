const { Client } = require("pg");

const client = new Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.qlsouerrwwyqjmuicxxr",
  password: "zingom-1zamfi-wefFoc",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const {
    rows: [user],
  } = await client.query(
    "select id, email from auth.users order by created_at desc limit 1",
  );

  if (!user) {
    throw new Error("No auth users found in Supabase.");
  }

  const { rows: stats } = await client.query(`
    with counts as (
      select household_id, count(*)::int as count from public.categories group by household_id
      union all
      select household_id, count(*)::int as count from public.people group by household_id
      union all
      select household_id, count(*)::int as count from public.expense_series group by household_id
      union all
      select household_id, count(*)::int as count from public.expense_occurrences group by household_id
    )
    select
      h.id,
      h.name,
      h.owner_user_id,
      h.created_at,
      coalesce(sum(c.count), 0)::int as total_rows
    from public.households h
    left join counts c on c.household_id = h.id
    group by h.id, h.name, h.owner_user_id, h.created_at
    order by total_rows desc, h.created_at desc
  `);

  if (!stats.length) {
    throw new Error("No households found in Supabase.");
  }

  const primaryHousehold = stats[0];

  await client.query("begin");

  await client.query(
    `
      update public.households
      set owner_user_id = $2
      where id = $1
    `,
    [primaryHousehold.id, user.id],
  );

  await client.query(
    `
      insert into public.household_memberships (household_id, user_id, role)
      values ($1, $2, 'owner')
      on conflict (household_id, user_id)
      do update set role = excluded.role
    `,
    [primaryHousehold.id, user.id],
  );

  const removableHouseholds = stats
    .filter((household) => household.id !== primaryHousehold.id && household.total_rows === 0)
    .map((household) => household.id);

  if (removableHouseholds.length) {
    await client.query(
      `
        delete from public.households
        where id = any($1::uuid[])
          and owner_user_id is null
      `,
      [removableHouseholds],
    );
  }

  await client.query("commit");

  console.log(
    JSON.stringify(
      {
        user,
        claimedHousehold: primaryHousehold,
        removedEmptyHouseholds: removableHouseholds,
      },
      null,
      2,
    ),
  );
}

main().catch(async (error) => {
  try {
    await client.query("rollback");
  } catch {}
  console.error(error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
}).finally(async () => {
  try {
    await client.end();
  } catch {}
});
