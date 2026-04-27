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
const occurrenceMonth = "2026-04-01";
const effectiveFrom = "2026-04-01";

const expenses = [
  { title: "Котлеты котам", category: "Питомцы", amount: 1000, day: 1, owner: "Общее", payer: "Саша", cadence: "manual" },
  { title: "Продукты", category: "Продукты", amount: 8000, day: 1, owner: "Общее", payer: "Саша", cadence: "manual" },
  { title: "Наполнитель", category: "Питомцы", amount: 600, day: 1, owner: "Общее", payer: "Рома", cadence: "manual" },
  { title: "Wi‑Fi T-mobile", category: "Дом", amount: 429, day: 3, owner: "Общее", payer: "Рома", cadence: "auto" },
  { title: "Плата за электричество", category: "Дом", amount: 1310, day: 4, owner: "Общее", payer: "Саша", cadence: "manual" },
  { title: "Аренда жилья", category: "Дом", amount: 18500, day: 7, owner: "Общее", payer: "Саша", cadence: "manual" },
  { title: "Spotify", category: "Подписки", amount: 230, day: 19, owner: "Общее", payer: "Рома", cadence: "auto" },
  { title: "Netflix", category: "Подписки", amount: 309, day: 25, owner: "Общее", payer: "Рома", cadence: "auto" },

  { title: "Карманные Саша", category: "Личные", amount: 8000, day: 1, owner: "Саша", payer: "Саша", cadence: "manual" },
  { title: "Подписки", category: "Подписки", amount: 748, day: 1, owner: "Саша", payer: "Саша", cadence: "manual" },
  { title: "Маникюр и педикюр", category: "Красота", amount: 1300, day: 1, owner: "Саша", payer: "Саша", cadence: "manual" },
  { title: "Пилон", category: "Здоровье", amount: 3200, day: 1, owner: "Саша", payer: "Саша", cadence: "manual" },
  { title: "Vodafone Сашин", category: "Связь", amount: 917, day: 4, owner: "Саша", payer: "Саша", cadence: "auto" },
  { title: "Английский", category: "Образование", amount: 3500, day: 27, owner: "Саша", payer: "Саша", cadence: "manual" },

  { title: "Карманные Revolut", category: "Личные", amount: 8000, day: 1, owner: "Рома", payer: "Рома", cadence: "manual" },
  { title: "Софье на жизнь", category: "Алименты", amount: 10000, day: 1, owner: "Рома", payer: "Рома", cadence: "manual" },
  { title: "FIGMA", category: "Подписки", amount: 518, day: 3, owner: "Рома", payer: "Рома", cadence: "auto" },
  { title: "Strava", category: "Подписки", amount: 999, day: 3, owner: "Рома", payer: "Рома", cadence: "auto" },
  { title: "Vodafone Ромин", category: "Связь", amount: 939, day: 4, owner: "Рома", payer: "Рома", cadence: "auto" },
  { title: "VZP", category: "OSVC", amount: 3306, day: 5, owner: "Рома", payer: "Рома", cadence: "manual" },
  { title: "Daň", category: "OSVC", amount: 5040, day: 6, owner: "Рома", payer: "Рома", cadence: "manual" },
  { title: "ČSSZ", category: "OSVC", amount: 7839, day: 8, owner: "Рома", payer: "Рома", cadence: "manual" },
  { title: "iCloud 2TB", category: "Подписки", amount: 249, day: 11, owner: "Рома", payer: "Рома", cadence: "auto" },
  { title: "OpenAI GPT", category: "Подписки", amount: 499, day: 14, owner: "Рома", payer: "Рома", cadence: "auto" },
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function main() {
  await client.connect();

  const { rows: people } = await client.query(
    "select id, name from public.people where household_id = $1",
    [householdId],
  );
  const { rows: categories } = await client.query(
    "select id, label from public.categories where household_id = $1",
    [householdId],
  );

  const personIdByName = new Map(people.map((person) => [person.name, person.id]));
  const categoryIdByLabel = new Map(categories.map((category) => [category.label, category.id]));

  await client.query("begin");
  await client.query("delete from public.expense_occurrences where household_id = $1", [householdId]);
  await client.query("delete from public.expense_series where household_id = $1", [householdId]);

  for (const [index, expense] of expenses.entries()) {
    const sourceExpenseId = `seed-${expense.owner}-${slugify(expense.title)}-${expense.day}`;

    const {
      rows: [series],
    } = await client.query(
      `
        insert into public.expense_series (household_id, source_expense_client_id, is_active)
        values ($1, $2, true)
        returning id
      `,
      [householdId, sourceExpenseId],
    );

    const ownerPersonId = expense.owner === "Общее" ? null : personIdByName.get(expense.owner);
    const payerPersonId = personIdByName.get(expense.payer);
    const categoryId = categoryIdByLabel.get(expense.category);

    if (!payerPersonId) {
      throw new Error(`Missing payer person for ${expense.title}: ${expense.payer}`);
    }
    if (!categoryId) {
      throw new Error(`Missing category for ${expense.title}: ${expense.category}`);
    }

    const dueOn = `2026-04-${String(expense.day).padStart(2, "0")}`;

    await client.query(
      `
        insert into public.expense_series_versions (
          series_id, effective_from, title, amount, cadence, frequency,
          day_of_month, month_of_year, owner_scope, owner_person_id, payer_person_id, category_id, previous_amount
        )
        values (
          $1, $2, $3, $4, $5, 'monthly',
          $6, null, $7, $8, $9, $10, $4
        )
      `,
      [
        series.id,
        effectiveFrom,
        expense.title,
        expense.amount,
        expense.cadence,
        expense.day,
        expense.owner === "Общее" ? "household" : "person",
        ownerPersonId,
        payerPersonId,
        categoryId,
      ],
    );

    await client.query(
      `
        insert into public.expense_occurrences (
          household_id, series_id, occurrence_month, due_on, title, amount, cadence, frequency,
          owner_scope, owner_person_id, payer_person_id, category_id, source_type, status
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, 'monthly',
          $8, $9, $10, $11, 'series', 'planned'
        )
      `,
      [
        householdId,
        series.id,
        occurrenceMonth,
        dueOn,
        expense.title,
        expense.amount,
        expense.cadence,
        expense.owner === "Общее" ? "household" : "person",
        ownerPersonId,
        payerPersonId,
        categoryId,
      ],
    );
  }

  await client.query("commit");
  console.log(JSON.stringify({ seeded: expenses.length }, null, 2));
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
