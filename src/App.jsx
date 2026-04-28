import { useEffect, useRef, useMemo, useState } from "react";
import { getAuthRedirectUrl, isSupabaseConfigured, requireSupabase } from "./lib/supabase";

const navigationItems = [
  "Бюджет",
  "Аналитика",
  "Памятные даты",
  "Настройка",
];

const supportedScreenNames = new Set([
  "month",
  "nextMonth",
  "regular",
  "months",
  "periodMonth",
  "settings",
  "categories",
]);

const seededCurrentYear = new Date().getFullYear();

function createSeedExpense({
  id,
  title,
  category,
  amount,
  day,
  payer,
  owner,
  cadence = "manual",
  completed = false,
  urgent = false,
  month = "Апр",
  year = seededCurrentYear,
}) {
  return {
    id,
    title,
    category,
    amount,
    dueLabel: `Оплата ${day} числа`,
    cadence,
    completed,
    urgent,
    owner,
    payer,
    month,
    year,
  };
}

const initialMembers = [
  {
    id: "common",
    name: "Общее",
    emoji: "🏡",
    budget: 0,
    expenses: [
      createSeedExpense({
        id: "common-cats-cutlets",
        title: "Котлеты котам",
        category: "Питомцы",
        amount: 1000,
        day: 1,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-groceries",
        title: "Продукты",
        category: "Продукты",
        amount: 8000,
        day: 1,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-cat-litter",
        title: "Наполнитель",
        category: "Питомцы",
        amount: 600,
        day: 1,
        payer: "Рома",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-nox-gift",
        title: "Подарок Ноксу",
        category: "Питомцы",
        amount: 1000,
        day: 1,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-wifi",
        title: "Wi‑Fi T‑mobile",
        category: "Дом",
        amount: 429,
        day: 3,
        payer: "Рома",
        owner: "Общее",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "common-electricity",
        title: "Плата за электричество",
        category: "Дом",
        amount: 1310,
        day: 4,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-rent",
        title: "Аренда жилья",
        category: "Дом",
        amount: 18500,
        day: 7,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-berlin-hotel",
        title: "Отель в Берлине",
        category: "Развлечения",
        amount: 9500,
        day: 15,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-berlin-trip",
        title: "Берлин на три дня",
        category: "Развлечения",
        amount: 10000,
        day: 16,
        payer: "Рома",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-berlin-transport",
        title: "Транспорт до Берлина",
        category: "Развлечения",
        amount: 1900,
        day: 16,
        payer: "Саша",
        owner: "Общее",
      }),
      createSeedExpense({
        id: "common-spotify",
        title: "Spotify",
        category: "Подписки",
        amount: 230,
        day: 19,
        payer: "Рома",
        owner: "Общее",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "common-netflix",
        title: "Netflix",
        category: "Подписки",
        amount: 309,
        day: 25,
        payer: "Рома",
        owner: "Общее",
        cadence: "auto",
      }),
    ],
  },
  {
    id: "sasha",
    name: "Саша",
    emoji: "👧🏻",
    budget: 0,
    expenses: [
      createSeedExpense({
        id: "sasha-pocket",
        title: "Карманные Саша",
        category: "Личные",
        amount: 8000,
        day: 1,
        payer: "Саша",
        owner: "Саша",
      }),
      createSeedExpense({
        id: "sasha-subscriptions",
        title: "Подписки",
        category: "Подписки",
        amount: 748,
        day: 1,
        payer: "Саша",
        owner: "Саша",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "sasha-beauty",
        title: "Маникюр и педикюр",
        category: "Красота",
        amount: 1300,
        day: 1,
        payer: "Саша",
        owner: "Саша",
      }),
      createSeedExpense({
        id: "sasha-pole",
        title: "Пилон",
        category: "Здоровье",
        amount: 3200,
        day: 1,
        payer: "Саша",
        owner: "Саша",
      }),
      createSeedExpense({
        id: "sasha-cosmetology",
        title: "Косметолог",
        category: "Красота",
        amount: 2000,
        day: 3,
        payer: "Саша",
        owner: "Саша",
      }),
      createSeedExpense({
        id: "sasha-vodafone",
        title: "Vodafone Сашин",
        category: "Связь",
        amount: 917,
        day: 4,
        payer: "Саша",
        owner: "Саша",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "sasha-sneakers",
        title: "Кроссовки",
        category: "Одежда",
        amount: 2500,
        day: 5,
        payer: "Саша",
        owner: "Саша",
      }),
      createSeedExpense({
        id: "sasha-english",
        title: "Английский",
        category: "Образование",
        amount: 3500,
        day: 27,
        payer: "Саша",
        owner: "Саша",
      }),
    ],
  },
  {
    id: "roma",
    name: "Рома",
    emoji: "👨🏻",
    budget: 0,
    expenses: [
      createSeedExpense({
        id: "roma-revolut",
        title: "Карманные Revolut",
        category: "Личные",
        amount: 8000,
        day: 1,
        payer: "Рома",
        owner: "Рома",
      }),
      createSeedExpense({
        id: "roma-sonya",
        title: "Софье на жизнь",
        category: "Алименты",
        amount: 10000,
        day: 1,
        payer: "Рома",
        owner: "Рома",
      }),
      createSeedExpense({
        id: "roma-figma",
        title: "FIGMA",
        category: "Подписки",
        amount: 518,
        day: 3,
        payer: "Рома",
        owner: "Рома",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "roma-strava",
        title: "Strava",
        category: "Подписки",
        amount: 999,
        day: 3,
        payer: "Рома",
        owner: "Рома",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "roma-vodafone",
        title: "Vodafone Ромин",
        category: "Связь",
        amount: 939,
        day: 4,
        payer: "Рома",
        owner: "Рома",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "roma-vzp",
        title: "VZP",
        category: "OSVC",
        amount: 3306,
        day: 5,
        payer: "Рома",
        owner: "Рома",
      }),
      createSeedExpense({
        id: "roma-tax",
        title: "Daň",
        category: "OSVC",
        amount: 5040,
        day: 6,
        payer: "Рома",
        owner: "Рома",
      }),
      createSeedExpense({
        id: "roma-cssz",
        title: "ČSSZ",
        category: "OSVC",
        amount: 7839,
        day: 8,
        payer: "Рома",
        owner: "Рома",
      }),
      createSeedExpense({
        id: "roma-icloud",
        title: "iCloud 2TB",
        category: "Подписки",
        amount: 249,
        day: 11,
        payer: "Рома",
        owner: "Рома",
        cadence: "auto",
      }),
      createSeedExpense({
        id: "roma-openai",
        title: "OpenAI GPT",
        category: "Подписки",
        amount: 499,
        day: 14,
        payer: "Рома",
        owner: "Рома",
        cadence: "auto",
      }),
    ],
  },
];

const monthOptions = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const fullMonthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const monthNamesGenitive = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const monthMeta = [
  { name: "Январь", short: "Янв", icon: "❄️", tone: "#6aa8d8", bg: "#eef8ff" },
  { name: "Февраль", short: "Фев", icon: "🧤", tone: "#8e86d8", bg: "#f1efff" },
  { name: "Март", short: "Мар", icon: "🌤️", tone: "#d49a54", bg: "#fff6ea" },
  { name: "Апрель", short: "Апр", icon: "🌷", tone: "#d57186", bg: "#fff0f3" },
  { name: "Май", short: "Май", icon: "🌿", tone: "#5b9d6e", bg: "#eef9f0" },
  { name: "Июнь", short: "Июн", icon: "🌼", tone: "#d3a24a", bg: "#fff7e9" },
  { name: "Июль", short: "Июл", icon: "🌞", tone: "#e0923d", bg: "#fff4e2" },
  { name: "Август", short: "Авг", icon: "🌾", tone: "#b98f43", bg: "#fbf4e4" },
  { name: "Сентябрь", short: "Сен", icon: "🍎", tone: "#c66554", bg: "#fff0ec" },
  { name: "Октябрь", short: "Окт", icon: "🎃", tone: "#da7a39", bg: "#fff3e8" },
  { name: "Ноябрь", short: "Ноя", icon: "🍂", tone: "#a07a53", bg: "#f7f0e7" },
  { name: "Декабрь", short: "Дек", icon: "🎄", tone: "#4f9b73", bg: "#ebf8f0" },
];
const ownerOptions = ["Общее", "Рома", "Саша"];
const payerOptions = ["Рома", "Саша"];
const categoryColorPalette = [
  "#b87373",
  "#72b28f",
  "#96d96d",
  "#7f74da",
  "#d7a45a",
  "#e28383",
  "#74b9c8",
  "#c48ad6",
  "#8cb26f",
  "#d08f5f",
];
const initialCategories = [
  { id: "products", icon: "🥖", label: "Продукты" },
  { id: "restaurants", icon: "🍔", label: "Рестораны" },
  { id: "subscriptions", icon: "🎵", label: "Подписки" },
  { id: "connection", icon: "📱", label: "Связь" },
  { id: "personal", icon: "💸", label: "Личные" },
  { id: "clothes", icon: "👕", label: "Одежда" },
  { id: "home", icon: "🏡", label: "Дом" },
  { id: "pets", icon: "🐾", label: "Питомцы" },
  { id: "housing", icon: "🏠", label: "Жильё" },
  { id: "utilities", icon: "💡", label: "Коммуналка" },
  { id: "health", icon: "❤️", label: "Здоровье" },
  { id: "beauty", icon: "💄", label: "Красота" },
  { id: "gifts", icon: "🎁", label: "Подарки" },
  { id: "travel", icon: "🌴", label: "Отдых" },
  { id: "fun", icon: "🎭", label: "Развлечения" },
  { id: "education", icon: "📖", label: "Образование" },
  { id: "osvc", icon: "💼", label: "OSVC" },
  { id: "help", icon: "🤝", label: "Помощь" },
  { id: "alimony", icon: "👱", label: "Алименты" },
  { id: "investments", icon: "💰", label: "Инвестиции" },
];

const STORAGE_KEY = "family-budget-prototype-members-v2";
const CATEGORY_STORAGE_KEY = "family-budget-prototype-categories-v2";
const CATEGORY_ICON_COLOR_MIGRATION_KEY = "family-budget-prototype-category-icon-colors-v2";
const REGULAR_EXPENSES_STORAGE_KEY = "family-budget-prototype-regular-expenses-v2";
const STORAGE_RESET_KEY = "family-budget-prototype-storage-reset-v1";
const TRACKED_YEARS_STORAGE_KEY = "family-budget-prototype-tracked-years-v1";
const EXPANDED_YEARS_STORAGE_KEY = "family-budget-prototype-expanded-years-v1";
const DEFAULT_HOUSEHOLD_NAME = "Family Budget";

let prototypeStoragePrepared = false;

function preparePrototypeStorage() {
  if (typeof window === "undefined" || prototypeStoragePrepared) {
    return;
  }

  prototypeStoragePrepared = true;

  try {
    if (window.localStorage.getItem(STORAGE_RESET_KEY) === "done") {
      return;
    }

    [
      "family-budget-prototype-members-april-seed-v1",
      "family-budget-prototype-members-v2",
      "family-budget-prototype-categories",
      "family-budget-prototype-categories-v2",
      "family-budget-prototype-category-icon-colors-v1",
      "family-budget-prototype-category-icon-colors-v2",
      "family-budget-prototype-regular-expenses-v1",
      "family-budget-prototype-regular-expenses-v2",
    ].forEach((key) => window.localStorage.removeItem(key));

    window.localStorage.setItem(STORAGE_RESET_KEY, "done");
  } catch {
    // ignore storage reset failures
  }
}

function formatNumberInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? formatCurrency(Number(digits)) : "";
}

function parseDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU").format(value).replaceAll(",", " ");
}

function formatCategoryOption(category) {
  return `${category.icon} ${category.label}`;
}

function getCategoryColor(categoryLabel, categories) {
  const matchedCategory = categories.find((item) => item.label === categoryLabel);
  return matchedCategory?.color ?? categoryColorPalette[0];
}

function uiFrequencyToDb(frequency) {
  if (frequency === "Раз в год") {
    return "yearly";
  }

  if (frequency === "Единоразово") {
    return "one_time";
  }

  return "monthly";
}

function dbFrequencyToUi(frequency) {
  if (frequency === "yearly") {
    return "Раз в год";
  }

  if (frequency === "one_time") {
    return "Единоразово";
  }

  return "Каждый месяц";
}

function getMonthNumberFromValue(value) {
  return Math.max(getMonthIndexByValue(value), 0) + 1;
}

function getMonthShortByNumber(monthNumber) {
  return monthOptions[Math.max(monthNumber - 1, 0)] ?? monthOptions[0];
}

function getMonthNameByNumber(monthNumber) {
  return fullMonthNames[Math.max(monthNumber - 1, 0)] ?? fullMonthNames[0];
}

function buildSqlDate(year, monthValue, day = 1) {
  const monthNumber = typeof monthValue === "number" ? monthValue : getMonthNumberFromValue(monthValue);
  return `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function clampColorChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue]
    .map((value) => clampColorChannel(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColorWithWhite(hexColor, ratio = 0.18) {
  const sanitized = hexColor.replace("#", "");
  const red = Number.parseInt(sanitized.slice(0, 2), 16);
  const green = Number.parseInt(sanitized.slice(2, 4), 16);
  const blue = Number.parseInt(sanitized.slice(4, 6), 16);

  return rgbToHex(
    red + (255 - red) * ratio,
    green + (255 - green) * ratio,
    blue + (255 - blue) * ratio,
  );
}

function inferColorFromEmoji(icon) {
  if (typeof window === "undefined" || typeof document === "undefined" || !icon?.trim()) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = '48px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  context.fillText(icon, canvas.width / 2, canvas.height / 2 + 2);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let red = 0;
  let green = 0;
  let blue = 0;
  let pixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 24) {
      continue;
    }

    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    pixels += 1;
  }

  if (!pixels) {
    return null;
  }

  return mixColorWithWhite(
    rgbToHex(red / pixels, green / pixels, blue / pixels),
    0.2,
  );
}

function getDefaultCategoryColor(icon, index = 0) {
  return inferColorFromEmoji(icon) ?? categoryColorPalette[index % categoryColorPalette.length];
}

function ensureCategoryColor(category, index = 0) {
  return {
    ...category,
    color: category.color ?? getDefaultCategoryColor(category.icon, index),
  };
}

function createRegularTemplateFromExpense(member, expense, index = 0) {
  const monthName = normalizeMonthName(expense.month);
  const monthIndex = fullMonthNames.findIndex((item) => item === monthName);
  const expenseYear = expense.year ?? seededCurrentYear;

  return {
    id: `regular-${expense.id}`,
    sourceExpenseId: expense.id,
    title: expense.title,
    category: expense.category,
    cadence: expense.cadence,
    frequency: detectFrequency(expense),
    dayOfMonth: String(getExpenseDayOfMonth(expense)),
    month: expense.month ?? monthOptions[Math.max(monthIndex, 0)],
    owner: getExpenseOwner(expense, member),
    payer: getExpensePayer(expense),
    isActive: true,
    history: [
      {
        effectiveYear: expenseYear,
        effectiveMonth: monthName,
        amount: expense.amount,
        previousAmount: expense.amount,
        changedAt: null,
      },
    ],
    sortOrder: index,
  };
}

function buildRegularTemplateFromExpense(member, expense, index = 0) {
  return createRegularTemplateFromExpense(member, expense, index);
}

function normalizeBudgetSnapshot(snapshot) {
  return {
    ...snapshot,
    regularExpenses: dedupeRegularTemplates(snapshot.regularExpenses ?? []),
  };
}

function createEmptyMembers() {
  return initialMembers.map((member) => ({
    ...member,
    expenses: [],
  }));
}

function createPrototypeRegularExpenses(seedMembers = initialMembers) {
  return seedMembers.flatMap((member, memberIndex) =>
    member.expenses.map((expense, expenseIndex) =>
      createRegularTemplateFromExpense(member, expense, memberIndex * 1000 + expenseIndex),
    ),
  );
}

function hasMeaningfulMemberData(memberList = []) {
  return memberList.some((member) => Array.isArray(member.expenses) && member.expenses.length > 0);
}

function hasMeaningfulSnapshotData({ members = [], categories = [], regularExpenses = [] }) {
  return hasMeaningfulMemberData(members) || categories.length > 0 || regularExpenses.length > 0;
}

function isExpenseInPeriod(expense, year, monthName) {
  const expenseYear = expense.year ?? year;
  const expenseMonth = normalizeMonthName(expense.month);

  return expenseYear === year && expenseMonth === monthName;
}

function getInitialRegularExpenses(seedMembers) {
  if (typeof window === "undefined") {
    return hasMeaningfulMemberData(seedMembers) ? createPrototypeRegularExpenses(seedMembers) : [];
  }

  if (isSupabaseConfigured) {
    return [];
  }

  preparePrototypeStorage();

  try {
    const savedTemplates = window.localStorage.getItem(REGULAR_EXPENSES_STORAGE_KEY);
    if (savedTemplates) {
      return JSON.parse(savedTemplates);
    }
  } catch {
    // fall through to seeded generation
  }

  return hasMeaningfulMemberData(seedMembers) ? createPrototypeRegularExpenses(seedMembers) : [];
}

function createDefaultCategories() {
  return initialCategories.map((category, index) => ensureCategoryColor(category, index));
}

function getDefaultTrackedYears(currentYear = getCurrentMonthContext().year) {
  return [currentYear, currentYear - 1, currentYear - 2];
}

function getDefaultExpandedYears(currentYear = getCurrentMonthContext().year) {
  return {
    [currentYear]: true,
    [currentYear - 1]: false,
    [currentYear - 2]: false,
  };
}

function getInitialTrackedYears() {
  const currentYear = getCurrentMonthContext().year;

  if (typeof window === "undefined") {
    return getDefaultTrackedYears(currentYear);
  }

  try {
    const savedValue = window.localStorage.getItem(TRACKED_YEARS_STORAGE_KEY);
    if (!savedValue) {
      return getDefaultTrackedYears(currentYear);
    }

    const parsed = JSON.parse(savedValue);
    if (!Array.isArray(parsed)) {
      return getDefaultTrackedYears(currentYear);
    }

    const normalized = [...new Set(parsed.map((value) => Number(value)).filter(Number.isFinite))].sort((left, right) => right - left);
    return normalized.length ? normalized : [currentYear];
  } catch {
    return getDefaultTrackedYears(currentYear);
  }
}

function getInitialExpandedYears(trackedYears) {
  const currentYear = getCurrentMonthContext().year;
  const fallbackYears = trackedYears.length ? trackedYears : [currentYear];

  if (typeof window === "undefined") {
    return getDefaultExpandedYears(currentYear);
  }

  try {
    const savedValue = window.localStorage.getItem(EXPANDED_YEARS_STORAGE_KEY);
    if (!savedValue) {
      return Object.fromEntries(
        fallbackYears.map((year, index) => [year, index === 0]),
      );
    }

    const parsed = JSON.parse(savedValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Object.fromEntries(
        fallbackYears.map((year, index) => [year, index === 0]),
      );
    }

    return Object.fromEntries(
      fallbackYears.map((year, index) => [year, Boolean(parsed[year]) || (!Object.prototype.hasOwnProperty.call(parsed, year) && index === 0)]),
    );
  } catch {
    return Object.fromEntries(
      fallbackYears.map((year, index) => [year, index === 0]),
    );
  }
}

function getAuthUserDisplayName(user) {
  return (
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Пользователь"
  );
}

function getAuthUserAvatar(user) {
  return user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "";
}

async function ensureHouseholdRecord(user) {
  const supabase = requireSupabase();
  const profilePayload = {
    id: user.id,
    email: user.email ?? "",
    full_name: getAuthUserDisplayName(user),
    avatar_url: getAuthUserAvatar(user) || null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from("user_profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  const { data: memberships, error: membershipFetchError } = await supabase
    .from("household_memberships")
    .select("household_id, role, households!inner(id, name)")
    .eq("user_id", user.id)
    .limit(1);

  if (membershipFetchError) {
    throw membershipFetchError;
  }

  if (memberships?.length) {
    return memberships[0].household_id;
  }

  const { data: ownedHouseholds, error: ownedHouseholdsError } = await supabase
    .from("households")
    .select("id, name")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (ownedHouseholdsError) {
    throw ownedHouseholdsError;
  }

  if (ownedHouseholds?.length) {
    const householdId = ownedHouseholds[0].id;
    const { error: ownedMembershipUpsertError } = await supabase
      .from("household_memberships")
      .upsert(
        {
          household_id: householdId,
          user_id: user.id,
          role: "owner",
        },
        { onConflict: "household_id,user_id" },
      );

    if (ownedMembershipUpsertError) {
      throw ownedMembershipUpsertError;
    }

    return householdId;
  }

  const { data: insertedHousehold, error: householdInsertError } = await supabase
    .from("households")
    .insert({
      name: DEFAULT_HOUSEHOLD_NAME,
      currency_code: "CZK",
      timezone: "Europe/Prague",
      owner_user_id: user.id,
    })
    .select("id")
    .single();

  if (householdInsertError) {
    throw householdInsertError;
  }

  const { error: membershipInsertError } = await supabase
    .from("household_memberships")
    .insert({
      household_id: insertedHousehold.id,
      user_id: user.id,
      role: "owner",
    });

  if (membershipInsertError) {
    throw membershipInsertError;
  }

  return insertedHousehold.id;
}

function getPrototypePeopleFromMembers(members) {
  return members
    .filter((member) => payerOptions.includes(member.name))
    .sort((left, right) => payerOptions.indexOf(left.name) - payerOptions.indexOf(right.name))
    .map((member, index) => ({
      slug: member.id,
      name: member.name,
      emoji: member.emoji,
      sort_order: index,
    }));
}

async function persistBudgetSnapshotToSupabase({ householdId, members, categories, regularExpenses }) {
  const supabase = requireSupabase();
  const sanitizedRegularExpenses = dedupeRegularTemplates(
    regularExpenses.filter(isValidRegularTemplate),
  );

  await supabase.from("expense_occurrences").delete().eq("household_id", householdId);
  await supabase.from("expense_series").delete().eq("household_id", householdId);
  await supabase.from("categories").delete().eq("household_id", householdId);
  await supabase.from("people").delete().eq("household_id", householdId);

  const peoplePayload = getPrototypePeopleFromMembers(members).map((person) => ({
    household_id: householdId,
    ...person,
  }));

  const { data: insertedPeople, error: peopleInsertError } = await supabase
    .from("people")
    .insert(peoplePayload)
    .select("id, slug, name, emoji, sort_order");

  if (peopleInsertError) {
    throw peopleInsertError;
  }

  const personIdByName = new Map(insertedPeople.map((person) => [person.name, person.id]));

  const categoriesPayload = categories.map((category, index) => ({
    household_id: householdId,
    label: category.label,
    icon: category.icon,
    color: category.color ?? getDefaultCategoryColor(category.icon, index),
    sort_order: index,
  }));

  const { data: insertedCategories, error: categoriesInsertError } = await supabase
    .from("categories")
    .insert(categoriesPayload)
    .select("id, label, icon, color, sort_order");

  if (categoriesInsertError) {
    throw categoriesInsertError;
  }

  const categoryIdByLabel = new Map(insertedCategories.map((category) => [category.label, category.id]));

  if (sanitizedRegularExpenses.length) {
    const seriesPayload = sanitizedRegularExpenses.map((template) => ({
      household_id: householdId,
      source_expense_client_id: template.sourceExpenseId ?? template.id,
      is_active: template.isActive !== false,
    }));

    const { data: insertedSeries, error: seriesInsertError } = await supabase
      .from("expense_series")
      .insert(seriesPayload)
      .select("id");

    if (seriesInsertError) {
      throw seriesInsertError;
    }

    const seriesIdByIndex = new Map(insertedSeries.map((series, index) => [index, series.id]));
    const seriesIdBySourceExpenseId = new Map(
      sanitizedRegularExpenses.map((template, index) => [template.sourceExpenseId ?? template.id, seriesIdByIndex.get(index)]),
    );

    const versionsPayload = sanitizedRegularExpenses.flatMap((template, index) => {
      const seriesId = seriesIdByIndex.get(index);
      const ownerName = normalizeOwnerName(template.owner, template.payer);
      const payerName = normalizePayerName(template.payer);
      const ownerPersonId = ownerName === "Общее" ? null : personIdByName.get(ownerName);
      const payerPersonId = personIdByName.get(payerName);
      const categoryId = categoryIdByLabel.get(template.category);

      return (template.history ?? []).map((entry, historyIndex, historyEntries) => {
        const previousAmount =
          historyIndex > 0 ? historyEntries[historyIndex - 1].amount : entry.previousAmount ?? entry.amount;

        return {
          series_id: seriesId,
          effective_from: buildSqlDate(entry.effectiveYear, entry.effectiveMonth),
          title: template.title,
          amount: entry.amount,
          cadence: template.cadence,
          frequency: uiFrequencyToDb(template.frequency),
          day_of_month: Number(template.dayOfMonth),
          month_of_year: template.frequency === "Раз в год" ? getMonthNumberFromValue(template.month) : null,
          owner_scope: ownerName === "Общее" ? "household" : "person",
          owner_person_id: ownerPersonId ?? null,
          payer_person_id: payerPersonId,
          category_id: categoryId,
          previous_amount: previousAmount,
        };
      });
    });

    const { error: versionsInsertError } = await supabase
      .from("expense_series_versions")
      .insert(versionsPayload);

    if (versionsInsertError) {
      throw versionsInsertError;
    }

    const occurrenceRows = members.flatMap((member) =>
      member.expenses.map((expense) => {
        const frequency = expense.frequency ?? detectFrequency(expense);
        const payer = normalizePayerName(getExpensePayer(expense));
        const owner = normalizeOwnerName(getExpenseOwner(expense, member), payer);
        const ownerPersonId = owner === "Общее" ? null : personIdByName.get(owner);
        const payerPersonId = personIdByName.get(payer);
        const categoryId = categoryIdByLabel.get(expense.category);
        const dayOfMonth = Number(expense.dayOfMonth ?? getExpenseDayOfMonth(expense));
        const occurrenceYear = expense.year ?? getCurrentMonthContext().year;
        const occurrenceMonth = expense.month ?? getCurrentMonthContext().monthShort;

        return {
          household_id: householdId,
          series_id: seriesIdBySourceExpenseId.get(expense.id) ?? null,
          occurrence_month: buildSqlDate(occurrenceYear, occurrenceMonth),
          due_on: buildSqlDate(occurrenceYear, occurrenceMonth, dayOfMonth),
          title: expense.title,
          amount: expense.amount,
          cadence: expense.cadence,
          frequency: uiFrequencyToDb(frequency),
          owner_scope: owner === "Общее" ? "household" : "person",
          owner_person_id: ownerPersonId ?? null,
          payer_person_id: payerPersonId,
          category_id: categoryId,
          source_type: seriesIdBySourceExpenseId.get(expense.id) ? "series" : "manual",
          status: expense.completed ? "completed" : "planned",
          completed_at: expense.completed ? new Date().toISOString() : null,
          note: null,
        };
      }),
    );

    if (occurrenceRows.length) {
      const { error: occurrencesInsertError } = await supabase
        .from("expense_occurrences")
        .insert(occurrenceRows);

      if (occurrencesInsertError) {
        throw occurrencesInsertError;
      }
    }

    return;
  }

  const occurrenceRows = members.flatMap((member) =>
    member.expenses.map((expense) => {
    const frequency = expense.frequency ?? detectFrequency(expense);
      const payer = normalizePayerName(getExpensePayer(expense));
      const owner = normalizeOwnerName(getExpenseOwner(expense, member), payer);
      const ownerPersonId = owner === "Общее" ? null : personIdByName.get(owner);
      const payerPersonId = personIdByName.get(payer);
      const categoryId = categoryIdByLabel.get(expense.category);
      const dayOfMonth = Number(expense.dayOfMonth ?? getExpenseDayOfMonth(expense));
      const occurrenceYear = expense.year ?? getCurrentMonthContext().year;
      const occurrenceMonth = expense.month ?? getCurrentMonthContext().monthShort;

      return {
        household_id: householdId,
        series_id: null,
        occurrence_month: buildSqlDate(occurrenceYear, occurrenceMonth),
        due_on: buildSqlDate(occurrenceYear, occurrenceMonth, dayOfMonth),
        title: expense.title,
        amount: expense.amount,
        cadence: expense.cadence,
        frequency: uiFrequencyToDb(frequency),
        owner_scope: owner === "Общее" ? "household" : "person",
        owner_person_id: ownerPersonId ?? null,
        payer_person_id: payerPersonId,
        category_id: categoryId,
        source_type: "manual",
        status: expense.completed ? "completed" : "planned",
        completed_at: expense.completed ? new Date().toISOString() : null,
        note: null,
      };
    }),
  );

  if (occurrenceRows.length) {
    const { error: occurrencesInsertError } = await supabase
      .from("expense_occurrences")
      .insert(occurrenceRows);

    if (occurrencesInsertError) {
      throw occurrencesInsertError;
    }
  }
}

async function loadBudgetSnapshotFromSupabase(householdId) {
  const supabase = requireSupabase();
  const [{ data: people, error: peopleError }, { data: categories, error: categoriesError }, { data: occurrences, error: occurrencesError }, { data: series, error: seriesError }, { data: seriesVersions, error: versionsError }] =
    await Promise.all([
      supabase.from("people").select("id, name, slug, emoji, sort_order").eq("household_id", householdId).order("sort_order", { ascending: true }),
      supabase.from("categories").select("id, label, icon, color, sort_order").eq("household_id", householdId).order("sort_order", { ascending: true }),
      supabase
        .from("expense_occurrences")
        .select("id, series_id, occurrence_month, due_on, title, amount, cadence, frequency, owner_scope, owner_person_id, payer_person_id, category_id, status")
        .eq("household_id", householdId)
        .order("due_on", { ascending: true }),
      supabase.from("expense_series").select("id, source_expense_client_id, is_active, created_at").eq("household_id", householdId).order("created_at", { ascending: true }),
      supabase
        .from("expense_series_versions")
        .select("id, series_id, effective_from, title, amount, cadence, frequency, day_of_month, month_of_year, owner_scope, owner_person_id, payer_person_id, category_id, previous_amount, created_at")
        .order("effective_from", { ascending: true }),
    ]);

  if (peopleError) throw peopleError;
  if (categoriesError) throw categoriesError;
  if (occurrencesError) throw occurrencesError;
  if (seriesError) throw seriesError;
  if (versionsError) throw versionsError;

  const personById = new Map((people ?? []).map((person) => [person.id, person]));
  const categoryById = new Map((categories ?? []).map((category) => [category.id, category]));

  const loadedCategories = (categories ?? []).map((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    color: category.color,
  }));

  const memberBase = [
    { id: "common", name: "Общее", emoji: "🏡", budget: 0, expenses: [] },
    ...(people ?? []).map((person) => ({
      id: person.slug,
      name: person.name,
      emoji: person.emoji ?? "🙂",
      budget: 0,
      expenses: [],
    })),
  ];

  const memberByName = new Map(memberBase.map((member) => [member.name, member]));

  (occurrences ?? []).forEach((occurrence) => {
    const dueOn = new Date(occurrence.due_on);
    const ownerName =
      occurrence.owner_scope === "household"
        ? "Общее"
        : personById.get(occurrence.owner_person_id)?.name ?? "Общее";
    const payerName = personById.get(occurrence.payer_person_id)?.name ?? "Рома";
    const category = categoryById.get(occurrence.category_id);
    const member = memberByName.get(ownerName);

    if (!member || !category) {
      return;
    }

    member.expenses.push({
      id: occurrence.id,
      title: occurrence.title,
      category: category.label,
      amount: Number(occurrence.amount),
      dueLabel: buildDueLabel({
        frequency: dbFrequencyToUi(occurrence.frequency),
        dayOfMonth: String(dueOn.getUTCDate()),
        month: getMonthShortByNumber(dueOn.getUTCMonth() + 1),
        urgent: false,
        completed: occurrence.status === "completed",
      }),
      cadence: occurrence.cadence,
      completed: occurrence.status === "completed",
      urgent: false,
      owner: ownerName,
      payer: payerName,
      month: getMonthShortByNumber(dueOn.getUTCMonth() + 1),
      year: dueOn.getUTCFullYear(),
      frequency: dbFrequencyToUi(occurrence.frequency),
      dayOfMonth: String(dueOn.getUTCDate()),
    });
  });

  const versionsBySeriesId = new Map();
  (seriesVersions ?? []).forEach((version) => {
    if (!versionsBySeriesId.has(version.series_id)) {
      versionsBySeriesId.set(version.series_id, []);
    }

    versionsBySeriesId.get(version.series_id).push(version);
  });

  const loadedRegularExpenses = dedupeRegularTemplates((series ?? []).flatMap((entry, index) => {
    const versions = (versionsBySeriesId.get(entry.id) ?? []).sort(
      (left, right) => new Date(left.effective_from).getTime() - new Date(right.effective_from).getTime(),
    );
    const latestVersion = versions[versions.length - 1];
    if (!latestVersion) {
      return [];
    }
    const category = categoryById.get(latestVersion?.category_id);
    const ownerName =
      latestVersion?.owner_scope === "household"
        ? "Общее"
        : personById.get(latestVersion?.owner_person_id)?.name ?? "Общее";
    const payerName = personById.get(latestVersion?.payer_person_id)?.name ?? "Рома";

    return {
      id: entry.source_expense_client_id ?? entry.id,
      sourceExpenseId: entry.source_expense_client_id ?? undefined,
      title: latestVersion?.title ?? "Без названия",
      category: category?.label ?? "",
      cadence: latestVersion?.cadence ?? "manual",
      frequency: dbFrequencyToUi(latestVersion?.frequency ?? "monthly"),
      dayOfMonth: String(latestVersion?.day_of_month ?? 1),
      month:
        latestVersion?.frequency === "yearly"
          ? getMonthShortByNumber(latestVersion.month_of_year ?? 1)
          : getMonthShortByNumber(new Date(latestVersion?.effective_from ?? new Date()).getUTCMonth() + 1),
      owner: ownerName,
      payer: payerName,
      isActive: entry.is_active,
      sortOrder: index,
      history: versions.map((version, versionIndex) => {
        const effectiveDate = new Date(version.effective_from);
        return {
          effectiveYear: effectiveDate.getUTCFullYear(),
          effectiveMonth: getMonthNameByNumber(effectiveDate.getUTCMonth() + 1),
          amount: Number(version.amount),
          previousAmount:
            versionIndex > 0
              ? Number(versions[versionIndex - 1].amount)
              : Number(version.previous_amount ?? version.amount),
          changedAt: version.created_at,
        };
      }),
    };
  })
    .filter(isValidRegularTemplate));

  return {
    members: memberBase,
    categories: loadedCategories,
    regularExpenses: loadedRegularExpenses,
  };
}

function getRegularAmountForPeriod(template, year, monthValue) {
  const targetOrder = getPeriodOrderKey(year, monthValue);
  const sortedHistory = [...(template.history ?? [])].sort(
    (left, right) =>
      getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
      getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
  );

  let activeAmount = sortedHistory[0]?.amount ?? 0;

  sortedHistory.forEach((entry) => {
    if (getPeriodOrderKey(entry.effectiveYear, entry.effectiveMonth) <= targetOrder) {
      activeAmount = entry.amount;
    }
  });

  return activeAmount;
}

function getRegularHistoryEntryForPeriod(template, year, monthValue) {
  return (template.history ?? []).find(
    (entry) =>
      entry.effectiveYear === year && normalizeMonthName(entry.effectiveMonth) === normalizeMonthName(monthValue),
  );
}

function getUpcomingRegularChange(template, currentContext) {
  const currentOrder = getPeriodOrderKey(currentContext.year, currentContext.monthName);

  return [...(template.history ?? [])]
    .filter((entry) => getPeriodOrderKey(entry.effectiveYear, entry.effectiveMonth) > currentOrder)
    .sort(
      (left, right) =>
        getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
        getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
    )[0] ?? null;
}

function doesRegularTemplateApplyToMonth(template, monthContext) {
  if (template.isActive === false) {
    return false;
  }

  if (template.frequency === "Раз в год") {
    return normalizeMonthName(template.month) === monthContext.monthName;
  }

  return true;
}

function buildRegularDueLabel(template, monthContext) {
  const dayPart = `Оплата ${template.dayOfMonth} числа`;

  if (template.frequency === "Раз в год") {
    return `Раз в год - ${monthContext.monthShort}, ${dayPart}`;
  }

  return dayPart;
}

function buildProjectedExpenseFromTemplate(template, monthContext) {
  const amount = getRegularAmountForPeriod(template, monthContext.year, monthContext.monthName);
  const effectiveChange = getRegularHistoryEntryForPeriod(template, monthContext.year, monthContext.monthName);
  const changeNote =
    effectiveChange && effectiveChange.previousAmount !== effectiveChange.amount
      ? `Изменение с ${formatMonthYearGenitive(monthContext.monthName, monthContext.year)}: было ${formatCurrency(
          effectiveChange.previousAmount,
        )} Kč`
      : null;

  return {
    id: `projected-${template.id}-${monthContext.year}-${monthContext.monthIndex}`,
    templateId: template.id,
    title: template.title,
    category: template.category,
    amount,
    dueLabel: buildDueLabel({
      frequency: template.frequency,
      dayOfMonth: template.dayOfMonth,
      month: monthContext.monthShort,
      urgent: false,
      completed: false,
    }),
    cadence: template.cadence,
    completed: false,
    urgent: false,
    owner: template.owner,
    payer: template.payer,
    month: monthContext.monthShort,
    year: monthContext.year,
    effectiveNote: changeNote,
  };
}

function getMemberExpensesForMonth(members, monthContext) {
  return members.flatMap((member) =>
    member.expenses
      .filter((expense) => isExpenseInPeriod(expense, monthContext.year, monthContext.monthName))
      .map((expense) => ({ ...expense, sourceMember: member })),
  );
}

function getProjectedRegularExpensesForMonth({ regularExpenses, monthContext, actualExpenses = [] }) {
  const explicitRegularSourceIds = new Set(
    actualExpenses
      .filter((expense) => {
        const frequency = expense.frequency ?? detectFrequency(expense);
        return frequency === "Каждый месяц" || frequency === "Раз в год";
      })
      .map((expense) => expense.id),
  );

  return regularExpenses
    .filter((template) => doesRegularTemplateApplyToMonth(template, monthContext))
    .filter((template) => !explicitRegularSourceIds.has(template.sourceExpenseId))
    .map((template) => buildProjectedExpenseFromTemplate(template, monthContext));
}

function buildCombinedMonthExpenses({ members, regularExpenses, monthContext }) {
  const templateBySourceExpenseId = new Map(
    regularExpenses
      .filter((template) => template.sourceExpenseId)
      .map((template) => [template.sourceExpenseId, template]),
  );
  const actualExpenses = getMemberExpensesForMonth(members, monthContext).map((expense) => {
    const frequency = expense.frequency ?? detectFrequency(expense);
    const linkedTemplate =
      (frequency === "Каждый месяц" || frequency === "Раз в год")
        ? templateBySourceExpenseId.get(expense.id)
        : null;

    return linkedTemplate
      ? {
          ...expense,
          templateId: linkedTemplate.id,
        }
      : expense;
  });
  const projectedRegularExpenses = getProjectedRegularExpensesForMonth({
    regularExpenses,
    monthContext,
    actualExpenses,
  });

  return [...actualExpenses, ...projectedRegularExpenses].sort((left, right) => {
    const dayDifference = getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right);
    if (dayDifference !== 0) {
      return dayDifference;
    }

    return left.title.localeCompare(right.title, "ru");
  });
}

function getCategoryOption(category, categories) {
  const matchedCategory = categories.find((item) => item.label === category);
  return matchedCategory ? formatCategoryOption(matchedCategory) : "";
}

function getCategoryMeta(categoryLabel, categories) {
  const matchedCategory = categories.find((item) => item.label === categoryLabel);
  return {
    icon: matchedCategory?.icon ?? "•",
    label: matchedCategory?.label ?? categoryLabel,
  };
}

function getCategoryDisplay(categoryLabel, categories) {
  const matchedCategory = categories.find((item) => item.label === categoryLabel);
  return matchedCategory ? formatCategoryOption(matchedCategory) : categoryLabel;
}

function stripCategoryLabel(value) {
  return value.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim();
}

function getExpenseOwner(expense, member) {
  return expense.owner ?? member.name;
}

function getExpensePayer(expense) {
  return expense.payer ?? "Рома";
}

function normalizeOwnerName(owner, payer = "Рома") {
  if (ownerOptions.includes(owner)) {
    return owner;
  }

  if (payerOptions.includes(payer)) {
    return payer;
  }

  return "Общее";
}

function normalizePayerName(payer) {
  return payerOptions.includes(payer) ? payer : "Рома";
}

function isValidRegularTemplate(template) {
  return Boolean(
    template &&
    String(template.title ?? "").trim() &&
    String(template.category ?? "").trim() &&
    String(template.dayOfMonth ?? "").trim() &&
    payerOptions.includes(normalizePayerName(template.payer)) &&
    ownerOptions.includes(normalizeOwnerName(template.owner, template.payer)) &&
    (template.frequency === "Каждый месяц" || template.frequency === "Раз в год") &&
    Array.isArray(template.history) &&
    template.history.length > 0,
  );
}

function getRegularTemplateDedupKey(template) {
  return [
    template.sourceExpenseId ?? "",
    String(template.title ?? "").trim().toLowerCase(),
    normalizeOwnerName(template.owner, template.payer),
    normalizePayerName(template.payer),
    template.frequency ?? "",
    template.dayOfMonth ?? "",
    normalizeMonthName(template.month),
    template.cadence ?? "",
  ].join("|");
}

function getRegularTemplateSemanticKey(template) {
  return [
    String(template.title ?? "").trim().toLowerCase(),
    String(template.category ?? "").trim().toLowerCase(),
    normalizeOwnerName(template.owner, template.payer),
    normalizePayerName(template.payer),
    template.frequency ?? "",
    template.dayOfMonth ?? "",
    normalizeMonthName(template.month),
    template.cadence ?? "",
  ].join("|");
}

function getRegularHistoryEntryKey(entry) {
  return `${entry.effectiveYear}|${normalizeMonthName(entry.effectiveMonth)}`;
}

function mergeRegularTemplateHistory(...historyCollections) {
  const mergedEntries = new Map();

  historyCollections.flat().forEach((entry) => {
    if (!entry) {
      return;
    }

    const key = getRegularHistoryEntryKey(entry);
    const existing = mergedEntries.get(key);

    if (!existing) {
      mergedEntries.set(key, entry);
      return;
    }

    const existingChangedAt = existing.changedAt ? new Date(existing.changedAt).getTime() : 0;
    const nextChangedAt = entry.changedAt ? new Date(entry.changedAt).getTime() : 0;

    if (nextChangedAt >= existingChangedAt) {
      mergedEntries.set(key, {
        ...existing,
        ...entry,
      });
    }
  });

  return [...mergedEntries.values()].sort(
    (left, right) =>
      getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
      getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
  );
}

function choosePreferredRegularTemplate(left, right) {
  const leftHistoryLength = left.history?.length ?? 0;
  const rightHistoryLength = right.history?.length ?? 0;

  if (rightHistoryLength !== leftHistoryLength) {
    return rightHistoryLength > leftHistoryLength ? right : left;
  }

  const leftChangedAt = leftHistoryLength
    ? new Date(left.history[leftHistoryLength - 1].changedAt ?? 0).getTime()
    : 0;
  const rightChangedAt = rightHistoryLength
    ? new Date(right.history[rightHistoryLength - 1].changedAt ?? 0).getTime()
    : 0;

  if (rightChangedAt !== leftChangedAt) {
    return rightChangedAt > leftChangedAt ? right : left;
  }

  if (!left.sourceExpenseId && right.sourceExpenseId) {
    return right;
  }

  return left;
}

function dedupeRegularTemplates(templates = []) {
  const grouped = new Map();

  templates.filter(isValidRegularTemplate).forEach((template, index) => {
    const key = getRegularTemplateSemanticKey(template);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...template,
        sortOrder: template.sortOrder ?? index,
        history: mergeRegularTemplateHistory(template.history ?? []),
      });
      return;
    }

    const preferred = choosePreferredRegularTemplate(existing, template);
    grouped.set(key, {
      ...preferred,
      sortOrder: Math.min(existing.sortOrder ?? index, template.sortOrder ?? index),
      history: mergeRegularTemplateHistory(existing.history ?? [], template.history ?? []),
      sourceExpenseId: preferred.sourceExpenseId ?? existing.sourceExpenseId ?? template.sourceExpenseId,
    });
  });

  return [...grouped.values()].sort((left, right) => {
    const sortDifference = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortDifference !== 0) {
      return sortDifference;
    }

    return String(left.title ?? "").localeCompare(String(right.title ?? ""), "ru");
  });
}

function buildMonthContext(year, monthName) {
  const normalizedMonthName = normalizeMonthName(monthName);
  const monthIndex = Math.max(fullMonthNames.findIndex((item) => item === normalizedMonthName), 0);

  return {
    monthIndex,
    monthName: fullMonthNames[monthIndex],
    monthShort: monthOptions[monthIndex],
    year,
  };
}

function readNavigationStateFromLocation() {
  if (typeof window === "undefined") {
    return { screen: "months", periodContext: null };
  }

  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const params = new URLSearchParams(hash);
  const requestedScreen = params.get("screen");
  const screen = supportedScreenNames.has(requestedScreen) ? requestedScreen : "months";

  if (screen === "periodMonth") {
    const year = Number(params.get("year"));
    const month = normalizeMonthName(params.get("month") ?? "");

    if (Number.isFinite(year) && fullMonthNames.includes(month)) {
      return {
        screen,
        periodContext: buildMonthContext(year, month),
      };
    }

    return { screen: "months", periodContext: null };
  }

  return { screen, periodContext: null };
}

function buildNavigationHash(screen, selectedPeriodContext) {
  const params = new URLSearchParams();
  params.set("screen", screen);

  if (screen === "periodMonth" && selectedPeriodContext) {
    params.set("year", String(selectedPeriodContext.year));
    params.set("month", selectedPeriodContext.monthName);
  }

  return params.toString();
}

function getExpenseMonth(expense) {
  return expense.month ?? "Фев";
}

function getExpenseDayOfMonth(expense) {
  return Number(expense.dueLabel.match(/\d+/)?.[0] ?? 99);
}

function getExpensePaymentDateLabel(expense) {
  const day = getExpenseDayOfMonth(expense);
  const normalizedMonthName = normalizeMonthName(expense.month);
  const monthIndex = fullMonthNames.findIndex((monthName) => monthName === normalizedMonthName);
  const monthLabel = monthNamesGenitive[monthIndex] ?? monthNamesGenitive[getCurrentMonthContext().monthIndex];

  return `Оплата ${day} ${monthLabel}`;
}

function isExpensePastDue(expense) {
  if (expense.completed) {
    return false;
  }

  const normalizedMonthName = normalizeMonthName(expense.month);
  const monthIndex = fullMonthNames.findIndex((monthName) => monthName === normalizedMonthName);
  const year = expense.year ?? getCurrentMonthContext().year;
  const dueDate = new Date(year, monthIndex === -1 ? getCurrentMonthContext().monthIndex : monthIndex, getExpenseDayOfMonth(expense));
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return dueDate < todayStart;
}

function buildDueLabel({ frequency, dayOfMonth, month, urgent, completed }) {
  const dayPart = `Оплата ${dayOfMonth} числа`;
  const baseLabel =
    frequency === "Раз в год"
      ? `Раз в год - ${month}, ${dayPart}`
      : frequency === "Единоразово"
        ? `Единоразово - ${month}, ${dayPart}`
        : dayPart;

  if (completed || !urgent) {
    return baseLabel;
  }

  return `Проверь! - ${baseLabel}`;
}

function getCurrentMonthContext() {
  const now = new Date();
  return buildMonthContext(now.getFullYear(), fullMonthNames[now.getMonth()]);
}

function getNextMonthContext(context) {
  const nextMonthIndex = (context.monthIndex + 1) % 12;

  return {
    monthIndex: nextMonthIndex,
    monthName: fullMonthNames[nextMonthIndex],
    monthShort: monthOptions[nextMonthIndex],
    year: context.year + (context.monthIndex === 11 ? 1 : 0),
  };
}

function getMonthIndexByValue(value) {
  return fullMonthNames.findIndex((monthName) => monthName === normalizeMonthName(value));
}

function getPeriodOrderKey(year, monthValue) {
  return year * 12 + Math.max(getMonthIndexByValue(monthValue), 0);
}

function formatMonthYearLabel(monthName, year) {
  return `${monthName} ${year}`;
}

function formatMonthYearGenitive(monthName, year) {
  const monthIndex = fullMonthNames.findIndex((item) => item === monthName);
  return `${monthNamesGenitive[monthIndex] ?? monthName.toLowerCase()} ${year}`;
}

function normalizeMonthName(value) {
  if (!value) {
    return getCurrentMonthContext().monthName;
  }

  const directMatch = monthMeta.find((month) => month.name === value || month.short === value);
  return directMatch ? directMatch.name : getCurrentMonthContext().monthName;
}

function getMonthMetaByName(name) {
  return monthMeta.find((month) => month.name === name) ?? monthMeta[0];
}

function getInitialMembers() {
  if (typeof window === "undefined") {
    return createEmptyMembers();
  }

  if (isSupabaseConfigured) {
    return createEmptyMembers();
  }

  preparePrototypeStorage();

  try {
    const savedMembers = window.localStorage.getItem(STORAGE_KEY);
    return savedMembers ? JSON.parse(savedMembers) : createEmptyMembers();
  } catch {
    return createEmptyMembers();
  }
}

function getInitialCategories() {
  if (typeof window === "undefined") {
    return initialCategories;
  }

  if (isSupabaseConfigured) {
    return initialCategories.map((category, index) => ensureCategoryColor(category, index));
  }

  preparePrototypeStorage();

  try {
    const savedCategories = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    const parsedCategories = savedCategories ? JSON.parse(savedCategories) : initialCategories;
    const needsColorReset = window.localStorage.getItem(CATEGORY_ICON_COLOR_MIGRATION_KEY) !== "done";

    if (needsColorReset) {
      const recoloredCategories = parsedCategories.map((category, index) => ({
        ...category,
        color: getDefaultCategoryColor(category.icon, index),
      }));

      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(recoloredCategories));
      window.localStorage.setItem(CATEGORY_ICON_COLOR_MIGRATION_KEY, "done");

      return recoloredCategories;
    }

    return parsedCategories.map((category, index) => ensureCategoryColor(category, index));
  } catch {
    return initialCategories.map((category, index) => ensureCategoryColor(category, index));
  }
}

function SegmentGroup({ options, value, onChange, variant = "default" }) {
  return (
    <div className={variant === "category" ? "segment-group category-group" : "segment-group"}>
      {options.map((option) => (
        <button
          key={option}
          className={
            option === value
              ? variant === "category"
                ? "segment category active"
                : "segment active"
              : variant === "category"
                ? "segment category"
                : "segment"
          }
          type="button"
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ paid, budget }) {
  const progress = Math.min((paid / budget) * 100, 100);

  return (
    <div className="progress-block">
      <div className="progress-labels">
        <span>Оплачено {formatCurrency(paid)} Kč</span>
        <span>Осталось {formatCurrency(Math.max(budget - paid, 0))} Kč</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function MonthOverviewCard({ monthLabel, monthMeta, budget, paid }) {
  const percent = budget > 0 ? Math.round((paid / budget) * 100) : 0;
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const remaining = Math.max(budget - paid, 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <section className="card month-card month-hero-card">
      <div className="month-hero-header">
        <div
          className="month-icon month-icon-large"
          style={{ background: monthMeta.bg, color: monthMeta.tone }}
        >
          {monthMeta.icon}
        </div>
        <div className="month-hero-copy">
          <div className="month-name">{monthLabel}</div>
          <div className="month-budget">Бюджет {formatCurrency(budget)} Kč</div>
        </div>
      </div>

      <div className="month-hero-center">
        <div className="month-ring-card" aria-label={`Оплачено ${safePercent}% бюджета`}>
          <svg className="month-ring" viewBox="0 0 140 140" aria-hidden="true">
            <defs>
              <linearGradient id="month-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0aa5d" />
                <stop offset="52%" stopColor="#58a274" />
                <stop offset="100%" stopColor="#397b58" />
              </linearGradient>
            </defs>
            <circle className="month-ring-track" cx="70" cy="70" r={radius} />
            <circle
              className="month-ring-fill"
              cx="70"
              cy="70"
              r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <div className="month-ring-center">
            <strong>{safePercent}%</strong>
            <span>оплачено</span>
          </div>
        </div>
      </div>

      <div className="month-kpis">
        <div className="month-kpi">
          <span className="month-kpi-label">Оплачено</span>
          <strong className="month-kpi-value">{formatCurrency(paid)} Kč</strong>
        </div>
        <div className="month-kpi">
          <span className="month-kpi-label">Осталось</span>
          <strong className="month-kpi-value">{formatCurrency(remaining)} Kč</strong>
        </div>
        <div className="month-kpi">
          <span className="month-kpi-label">Бюджет</span>
          <strong className="month-kpi-value">{formatCurrency(budget)} Kč</strong>
        </div>
      </div>
    </section>
  );
}

function CategoryBreakdownCard({ items, total }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  return (
    <section className={showAllCategories ? "card category-breakdown-card expanded" : "card category-breakdown-card"}>
      <p className="eyebrow">Категории месяца</p>
      <div className="category-breakdown-head">
        <h2>Структура бюджета</h2>
        <div className="category-breakdown-total">{formatCurrency(total)} Kč</div>
      </div>

      <div className="category-breakdown-bar-wrap">
        <div className="category-breakdown-bar" aria-label="Распределение бюджета по категориям">
          {items.map((item) => (
            <button
              key={item.label}
              className="category-breakdown-segment"
              type="button"
              style={{ width: `${item.share}%`, background: item.color }}
              onMouseEnter={() => setActiveTooltip(item.label)}
              onMouseLeave={() => setActiveTooltip((current) => (current === item.label ? null : current))}
              onFocus={() => setActiveTooltip(item.label)}
              onBlur={() => setActiveTooltip((current) => (current === item.label ? null : current))}
              onClick={() => setActiveTooltip((current) => (current === item.label ? null : item.label))}
              aria-label={`${item.label}: ${Math.round(item.share)}%, ${formatCurrency(item.amount)} Kč`}
            />
          ))}
        </div>
        {activeTooltip ? (
          <div className="category-breakdown-tooltip" role="status">
            {(() => {
              const item = items.find((entry) => entry.label === activeTooltip);
              if (!item) {
                return null;
              }

              return (
                <>
                  <strong>
                    {item.icon} {item.label}
                  </strong>
                  <span>{Math.round(item.share)}%</span>
                  <span>{formatCurrency(item.amount)} Kč</span>
                </>
              );
            })()}
          </div>
        ) : null}
      </div>

      <div className="category-breakdown-list">
        {items.map((item) => (
          <div key={item.label} className="category-breakdown-row">
            <div className="category-breakdown-main">
              <span className="category-breakdown-swatch" style={{ background: item.color }} />
              <span className="category-breakdown-label">
                {item.icon} {item.label}
              </span>
            </div>
            <div className="category-breakdown-values">
              <span className="category-breakdown-percent">{Math.round(item.share)}%</span>
              <strong className="category-breakdown-amount">{formatCurrency(item.amount)} Kč</strong>
            </div>
          </div>
        ))}
      </div>

      {items.length > 5 ? (
        <button
          className="category-breakdown-toggle"
          type="button"
          onClick={() => setShowAllCategories((current) => !current)}
        >
          {showAllCategories ? "Скрыть категории" : `Показать ещё ${items.length - 5}`}
        </button>
      ) : null}
    </section>
  );
}

function formatCadenceLabel(cadence) {
  return cadence === "auto" ? "Автоматическая" : "Ручная";
}

function detectFrequency(expense) {
  if (expense.dueLabel.includes("Раз в год")) {
    return "Раз в год";
  }

  if (expense.dueLabel.includes("Единоразово")) {
    return "Единоразово";
  }

  return "Каждый месяц";
}

function getCompactDueLabel(label) {
  if (!label) {
    return "";
  }

  return label.replace(/^Оплата\s+/i, "");
}

function BudgetDataRow({
  title,
  categoryIcon = "•",
  categoryLabel = "",
  note = null,
  amount,
  dueLabel = "",
  secondaryLabel = "",
  secondaryTone = "default",
  isCompleted = false,
  isPastDue = false,
  leading = null,
  onOpen,
  actions = null,
  titleClassName = "",
  rowClassName = "",
}) {
  const compactDueLabel = getCompactDueLabel(dueLabel);

  return (
    <div className={leading ? `budget-data-row has-leading ${rowClassName}` : `budget-data-row ${rowClassName}`}>
      {leading ? <div className="budget-data-leading">{leading}</div> : null}
      <button
        className={isCompleted ? "budget-data-button completed" : "budget-data-button"}
        type="button"
        onClick={onOpen}
      >
        <span className="budget-data-main">
          <span className="budget-data-category-icon" aria-hidden="true" title={categoryLabel}>
            {categoryIcon}
          </span>
          <span className="budget-data-copy">
            <span className={titleClassName ? `budget-data-title ${titleClassName}` : "budget-data-title"}>{title}</span>
            {compactDueLabel ? <span className="budget-data-mobile-due">{compactDueLabel}</span> : null}
          </span>
        </span>
        {dueLabel ? (
          <span className={isPastDue ? "budget-data-due overdue" : "budget-data-due"}>
            {dueLabel}
          </span>
        ) : null}
        {secondaryLabel ? (
          <span className={secondaryTone === "muted" ? "budget-data-kind auto" : "budget-data-kind"}>
            {secondaryLabel}
          </span>
        ) : null}
        <span className="budget-data-side">
          <span className="budget-data-amount">{formatCurrency(amount)} Kč</span>
        </span>
      </button>
      {note ? <div className="budget-data-note">{note}</div> : null}
      {actions ? <div className="budget-data-actions">{actions}</div> : null}
    </div>
  );
}

function ExpenseRow({ expense, categories, onToggle, onOpen, onEdit }) {
  const categoryMeta = getCategoryMeta(expense.category, categories);
  const isAutoPayment = expense.cadence === "auto";
  const isCompleted = expense.completed;
  const isPastDue = isExpensePastDue(expense);
  const transactionTypeLabel = isAutoPayment ? "Автоплатеж" : "Ручной платеж";
  const paymentDateLabel = getExpensePaymentDateLabel(expense);

  return (
    <BudgetDataRow
      title={expense.title}
      categoryIcon={categoryMeta.icon}
      categoryLabel={categoryMeta.label}
      amount={expense.amount}
      dueLabel={paymentDateLabel}
      secondaryLabel={transactionTypeLabel}
      secondaryTone={isAutoPayment ? "muted" : "default"}
      isCompleted={isCompleted}
      isPastDue={isPastDue}
      leading={(
        <button
          className={expense.completed ? "checkbox-button checked" : "checkbox-button"}
          type="button"
          aria-label={expense.completed ? "Отметить как не оплаченное" : "Отметить как оплаченное"}
          onClick={() => onToggle(expense.id)}
        >
          <span className="checkbox-ui" aria-hidden="true" />
        </button>
      )}
      onOpen={() => onOpen(expense)}
      rowClassName="expense-row"
    />
  );
}

function MemberCard({ member, categories, onToggleExpense, onAddExpense, onOpenExpense, onEditExpense }) {
  const memberBudget = member.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paid = member.expenses
    .filter((expense) => expense.completed)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="card member-card">
      <div className="member-header">
        <div className="member-title">
          <div className="member-avatar">{member.emoji}</div>
          <div>
            <div className="member-name">{member.name}</div>
            <div className="member-budget">Бюджет {formatCurrency(memberBudget)} Kč</div>
          </div>
        </div>
        <ProgressBar paid={paid} budget={memberBudget} />
      </div>

      <div className="expenses-list">
        {member.expenses.length ? (
          member.expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              categories={categories}
              onToggle={(expenseId) => onToggleExpense(expense.sourceMember?.id ?? member.id, expenseId)}
              onOpen={(selectedExpense) => onOpenExpense(expense.sourceMember ?? member, selectedExpense)}
              onEdit={(selectedExpense) => onEditExpense(expense.sourceMember ?? member, selectedExpense)}
            />
          ))
        ) : (
          <div className="budget-empty-state">Пока нет трат в этом месяце.</div>
        )}
      </div>

      <button className="add-expense-button" type="button" onClick={() => onAddExpense(member.id)}>
        Добавить
      </button>
    </section>
  );
}

function createEmptyExpenseDraft(member, defaults = {}) {
  return {
    member,
    expense: {
      id: `draft-${member.id}-${Date.now()}`,
      title: defaults.title ?? "",
      category: defaults.category ?? "",
      amount: defaults.amount ?? "",
      dueLabel: "",
      cadence: defaults.cadence ?? "",
      completed: false,
      urgent: false,
      owner: defaults.owner ?? "",
      payer: defaults.payer ?? "",
      month: defaults.month ?? "",
      year: defaults.year,
      isDraft: true,
    },
  };
}

function ModalShell({ title, onClose, children, compact = false }) {
  const backdropMouseDownRef = useRef(false);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        backdropMouseDownRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (backdropMouseDownRef.current && event.target === event.currentTarget) {
          onClose();
        }
        backdropMouseDownRef.current = false;
      }}
    >
      <div
        className={compact ? "modal-card compact" : "modal-card"}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={() => {
          backdropMouseDownRef.current = false;
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-inline-close" type="button" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>
        <button className="mobile-modal-close" type="button" onClick={onClose}>
          Назад
        </button>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, tone = "default" }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={tone === "muted" ? "detail-value muted" : "detail-value"}>{value}</span>
    </div>
  );
}

function ExpenseDetailsModal({ item, categories, onClose, onEdit, onDelete }) {
  const { member, expense } = item;
  const frequency = detectFrequency(expense);
  const dayOfMonth = expense.dueLabel.match(/\d+/)?.[0] ?? "Не указано";
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  return (
    <ModalShell title="Детали траты" onClose={onClose} compact>
      <div className="modal-header">
        <div>
          <h2>{expense.title}</h2>
          <div className="details-amount inline">{formatCurrency(expense.amount)} Kč</div>
        </div>
      </div>

      <div className="details-stack">
        <div className="details-grid">
          <DetailRow label="Категория" value={getCategoryDisplay(expense.category, categories)} />
          <DetailRow label="Тип транзакции" value={formatCadenceLabel(expense.cadence)} />
          <DetailRow label="Периодичность" value={frequency} />
          <DetailRow label="Число месяца" value={dayOfMonth} />
          <DetailRow label="Чья трата" value={getExpenseOwner(expense, member)} />
          <DetailRow label="Кто платит" value={getExpensePayer(expense)} />
          <DetailRow label="Статус" value={expense.completed ? "Оплачено" : "Ожидает оплаты"} />
          <DetailRow label="Напоминание" value={expense.dueLabel} tone={expense.urgent ? "default" : "muted"} />
        </div>

        <div className="details-actions">
          <button className="secondary-action-button danger" type="button" onClick={handleDelete}>
            Удалить
          </button>
          <button className="primary-action-button" type="button" onClick={onEdit}>
            Изменить
          </button>
        </div>
      </div>

      {confirmDelete ? (
        <div className="confirm-overlay" role="presentation" onClick={() => setConfirmDelete(false)}>
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-label="Подтверждение удаления"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="inline-confirm-title">Удалить трату?</p>
            <p className="inline-confirm-text">"{expense.title}" будет удалена из списка.</p>
            <div className="inline-confirm-actions">
              <button
                className="secondary-action-button"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                Отмена
              </button>
              <button
                className="secondary-action-button danger solid"
                type="button"
                onClick={() => onDelete(item)}
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function RegularExpenseDetailsModal({ template, categories, onClose, onEdit, onDelete }) {
  const currentMonthContext = getCurrentMonthContext();
  const currentAmount = getRegularAmountForPeriod(
    template,
    currentMonthContext.year,
    currentMonthContext.monthName,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <ModalShell title="Детали регулярной траты" onClose={onClose} compact>
      <div className="modal-header">
        <div>
          <h2>{template.title}</h2>
          <div className="details-amount inline">{formatCurrency(currentAmount)} Kč</div>
        </div>
      </div>

      <div className="details-stack">
        <div className="details-grid">
          <DetailRow label="Категория" value={getCategoryDisplay(template.category, categories)} />
          <DetailRow label="Тип транзакции" value={formatCadenceLabel(template.cadence)} />
          <DetailRow label="Периодичность" value={template.frequency} />
          <DetailRow label="Число месяца" value={template.dayOfMonth} />
          {template.frequency === "Раз в год" ? <DetailRow label="Месяц" value={template.month} /> : null}
          <DetailRow label="Чья трата" value={template.owner} />
          <DetailRow label="Кто платит" value={template.payer} />
          <DetailRow label="Статус" value="Шаблон регулярной траты" />
          <DetailRow label="Напоминание" value={formatRegularSchedule(template)} tone="muted" />
        </div>

        <div className="details-actions">
          <button className="secondary-action-button danger" type="button" onClick={() => setConfirmDelete(true)}>
            Удалить
          </button>
          <button className="primary-action-button" type="button" onClick={onEdit}>
            Изменить
          </button>
        </div>
      </div>

      {confirmDelete ? (
        <div className="confirm-overlay" role="presentation" onClick={() => setConfirmDelete(false)}>
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-label="Подтверждение удаления"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="inline-confirm-title">Удалить регулярную трату?</p>
            <p className="inline-confirm-text">"{template.title}" будет удалена из шаблонов и будущих месяцев.</p>
            <div className="inline-confirm-actions">
              <button className="secondary-action-button" type="button" onClick={() => setConfirmDelete(false)}>
                Отмена
              </button>
              <button className="secondary-action-button danger solid" type="button" onClick={onDelete}>
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function ExpenseEditorModal({ item, onClose, onSave, categories }) {
  const isCreateMode = Boolean(item.expense.isDraft);
  const detectedFrequency = detectFrequency(item.expense);
  const [showValidation, setShowValidation] = useState(false);
  const [form, setForm] = useState(() => ({
    title: item.expense.title,
    amount: parseDigits(item.expense.amount),
    transactionType: isCreateMode
      ? item.expense.cadence === "auto"
        ? "Автоматическая"
        : item.expense.cadence === "manual"
          ? "Ручная"
          : ""
      : item.expense.cadence === "auto"
        ? "Автоматическая"
        : "Ручная",
    frequency: isCreateMode ? item.expense.frequency ?? "" : detectedFrequency,
    dayOfMonth: isCreateMode ? item.expense.dayOfMonth ?? "" : item.expense.dueLabel.match(/\d+/)?.[0] ?? "8",
    month: isCreateMode ? item.expense.month ?? "" : getExpenseMonth(item.expense),
    owner: isCreateMode ? getExpenseOwner(item.expense, item.member) ?? "" : getExpenseOwner(item.expense, item.member),
    payer: isCreateMode ? getExpensePayer(item.expense) ?? "" : getExpensePayer(item.expense),
    category: isCreateMode ? getCategoryOption(item.expense.category, categories) : getCategoryOption(item.expense.category, categories),
  }));

  const dayValue = Number(form.dayOfMonth || 0);
  const isInvalidDay = form.dayOfMonth !== "" && (dayValue < 1 || dayValue > 28);
  const dayHint =
    form.dayOfMonth === ""
      ? "Выберите число от 1 до 28"
      : isInvalidDay
        ? "29-е число недоступно. Выберите день от 1 до 28"
        : "Выберите число от 1 до 28";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAmountChange = (event) => {
    updateField("amount", parseDigits(event.target.value));
  };

  const handleDayChange = (event) => {
    const digits = parseDigits(event.target.value).slice(0, 2);

    if (!digits) {
      updateField("dayOfMonth", "");
      return;
    }

    const numericValue = Number(digits);
    updateField("dayOfMonth", String(Math.min(numericValue, 29)));
  };

  const hasChanges =
    form.title !== item.expense.title ||
    form.amount !== parseDigits(item.expense.amount) ||
    form.transactionType !== formatCadenceLabel(item.expense.cadence) ||
    form.frequency !== detectedFrequency ||
    form.dayOfMonth !== (item.expense.dueLabel.match(/\d+/)?.[0] ?? "8") ||
    form.month !== getExpenseMonth(item.expense) ||
    form.owner !== getExpenseOwner(item.expense, item.member) ||
    form.payer !== getExpensePayer(item.expense) ||
    form.category !== getCategoryOption(item.expense.category, categories);

  const fieldErrors = {
    title: showValidation && form.title.trim() === "",
    amount: showValidation && form.amount === "",
    transactionType: showValidation && form.transactionType === "",
    frequency: showValidation && form.frequency === "",
    dayOfMonth: showValidation && (form.dayOfMonth === "" || isInvalidDay),
    month: showValidation && form.month === "",
    owner: showValidation && form.owner === "",
    payer: showValidation && form.payer === "",
    category: showValidation && form.category === "",
  };

  const errorTexts = {
    title: "Требуется заполнить",
    amount: "Требуется заполнить",
    transactionType: "Требуется выбрать",
    frequency: "Требуется выбрать",
    dayOfMonth: "Требуется заполнить",
    month: "Требуется выбрать",
    owner: "Требуется выбрать",
    payer: "Требуется выбрать",
    category: "Требуется выбрать",
  };

  const isReadyToSave =
    form.title.trim() !== "" &&
    form.amount !== "" &&
    form.transactionType !== "" &&
    form.frequency !== "" &&
    form.dayOfMonth !== "" &&
    !isInvalidDay &&
    form.month !== "" &&
    form.owner !== "" &&
    form.payer !== "" &&
    form.category !== "";

  const handleSave = () => {
    if (!isReadyToSave) {
      setShowValidation(true);
      return;
    }

    if (!hasChanges) {
      return;
    }

    onSave(item, {
      title: form.title.trim() || item.expense.title,
      amount: Number(form.amount || item.expense.amount),
      cadence: form.transactionType === "Автоматическая" ? "auto" : "manual",
      frequency: form.frequency,
      dayOfMonth: form.dayOfMonth || "1",
      month: form.month,
      year: item.expense.year,
      owner: form.owner,
      payer: form.payer,
      category: stripCategoryLabel(form.category),
    });
  };

  return (
    <ModalShell title={isCreateMode ? "Добавить трату" : "Изменить трату"} onClose={onClose}>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить трату" : "Изменить"}</h2>
      </div>

      <div className="modal-form">
        <label className={fieldErrors.title ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Название *</span>
            {fieldErrors.title ? <span className="field-inline-error">{errorTexts.title}</span> : null}
          </span>
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>

        <label className={fieldErrors.amount ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Сумма *</span>
            {fieldErrors.amount ? <span className="field-inline-error">{errorTexts.amount}</span> : null}
          </span>
          <div className="input-with-suffix">
            <input value={formatNumberInput(form.amount)} onChange={handleAmountChange} />
            <span>Kč</span>
          </div>
        </label>

        <div className={fieldErrors.transactionType ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Тип транзакции *</span>
            {fieldErrors.transactionType ? (
              <span className="field-inline-error">{errorTexts.transactionType}</span>
            ) : null}
          </span>
          <SegmentGroup
            options={["Ручная", "Автоматическая"]}
            value={form.transactionType}
            onChange={(value) => updateField("transactionType", value)}
          />
        </div>

        <div className={fieldErrors.frequency ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Периодичность *</span>
            {fieldErrors.frequency ? <span className="field-inline-error">{errorTexts.frequency}</span> : null}
          </span>
          <SegmentGroup
            options={["Каждый месяц", "Раз в год", "Единоразово"]}
            value={form.frequency}
            onChange={(value) => updateField("frequency", value)}
          />
        </div>

        <label className={fieldErrors.dayOfMonth ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Число в месяце (1-28) *</span>
            {fieldErrors.dayOfMonth && form.dayOfMonth === "" ? (
              <span className="field-inline-error">{errorTexts.dayOfMonth}</span>
            ) : null}
          </span>
          <input
            value={form.dayOfMonth}
            placeholder="Выберите число от 1 до 28"
            onChange={handleDayChange}
          />
          <span className={fieldErrors.dayOfMonth ? "field-hint error" : "field-hint"}>
            {form.dayOfMonth === "" ? "Требуется заполнить" : dayHint}
          </span>
        </label>

        <div className={fieldErrors.month ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Месяц *</span>
            {fieldErrors.month ? <span className="field-inline-error">{errorTexts.month}</span> : null}
          </span>
          <SegmentGroup options={monthOptions} value={form.month} onChange={(value) => updateField("month", value)} />
        </div>

        <div className={fieldErrors.owner ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Чья это трата? *</span>
            {fieldErrors.owner ? <span className="field-inline-error">{errorTexts.owner}</span> : null}
          </span>
          <SegmentGroup options={ownerOptions} value={form.owner} onChange={(value) => updateField("owner", value)} />
        </div>

        <div className={fieldErrors.payer ? "field invalid" : "field"}>
          <span className="field-head">
            <span>А кто платит? *</span>
            {fieldErrors.payer ? <span className="field-inline-error">{errorTexts.payer}</span> : null}
          </span>
          <SegmentGroup options={payerOptions} value={form.payer} onChange={(value) => updateField("payer", value)} />
        </div>

        <div className={fieldErrors.category ? "field invalid" : "field"}>
          <span className="field-head">
            <span>Категория *</span>
            {fieldErrors.category ? <span className="field-inline-error">{errorTexts.category}</span> : null}
          </span>
          <SegmentGroup
            options={categories.map((category) => formatCategoryOption(category))}
            value={form.category}
            variant="category"
            onChange={(value) => updateField("category", value)}
          />
        </div>
      </div>

      <div className="editor-footer">
        <p className="modal-footnote">* — обязательно</p>
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button
            className="primary-action-button"
            type="button"
            disabled={!isCreateMode && !hasChanges}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      {items.map((item, index) => (
        <button
          key={item.label}
          className={item.current ? "breadcrumb current" : "breadcrumb"}
          type="button"
          onClick={item.onClick}
          disabled={item.current}
        >
          {item.label}
          {index < items.length - 1 ? <span className="breadcrumb-separator">/</span> : null}
        </button>
      ))}
    </nav>
  );
}

function SettingsScreen({ onOpenCategories, onRequestReset }) {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Настройка приложения</p>
        <h1>Настройки</h1>
        <p className="page-note">Здесь будем собирать все управляемые параметры приложения.</p>
      </header>

      <section className="card settings-screen-card">
        <div className="settings-stack">
          <button className="settings-action-card" type="button" onClick={onOpenCategories}>
            <span className="settings-action-title">Настройки категорий</span>
            <span className="settings-action-note">
              Добавлять, изменять и удалять категории для всех попапов приложения.
            </span>
          </button>
          <button className="settings-action-card settings-action-card-danger" type="button" onClick={onRequestReset}>
            <span className="settings-action-title settings-action-title-danger">Очистить тестовые данные</span>
            <span className="settings-action-note settings-action-note-danger">
              Удалить все текущие траты, будущие планы и регулярные шаблоны, чтобы начать тестирование с чистого состояния.
            </span>
          </button>
        </div>
      </section>
    </>
  );
}

function AuthScreen({ onSignIn, isPending, errorMessage }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-accent" />
          Family Budget
        </div>
        <div className="auth-copy">
          <p className="eyebrow">Личный вход</p>
          <h1>Войди через Google, чтобы открыть семейный бюджет</h1>
          <p>
            После входа приложение загрузит твои категории, текущий месяц, будущие траты и регулярные
            шаблоны из Supabase.
          </p>
        </div>

        <button
          className="google-auth-button"
          type="button"
          onClick={onSignIn}
          disabled={isPending}
        >
          <span className="google-auth-icon" aria-hidden="true">
            G
          </span>
          {isPending ? "Перенаправляем в Google..." : "Войти через Google"}
        </button>

        <p className="auth-footnote">
          Доступ будет открыт только после авторизации. Публичная ссылка без входа бюджет не покажет.
        </p>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
      </section>
    </main>
  );
}

function SessionCard({ user, onSignOut, isPending }) {
  return (
    <section className="session-card">
      <div className="session-main">
        {getAuthUserAvatar(user) ? (
          <img
            className="session-avatar"
            src={getAuthUserAvatar(user)}
            alt={getAuthUserDisplayName(user)}
          />
        ) : (
          <div className="session-avatar session-avatar-fallback" aria-hidden="true">
            {getAuthUserDisplayName(user).slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="session-copy">
          <strong>{getAuthUserDisplayName(user)}</strong>
          <span>{user?.email ?? "Google account"}</span>
        </div>
      </div>

      <button
        className="session-signout"
        type="button"
        onClick={onSignOut}
        disabled={isPending}
      >
        Выйти
      </button>
    </section>
  );
}

function getScreenNavigationLabel(screen, selectedPeriodContext) {
  if (screen === "months") {
    return "Бюджет";
  }

  if (screen === "nextMonth") {
    return "Бюджет грядущего месяца";
  }

  if (screen === "regular") {
    return "Регулярные траты";
  }

  if (screen === "periodMonth" && selectedPeriodContext) {
    return `${selectedPeriodContext.monthName} ${selectedPeriodContext.year}`;
  }

  if (screen === "categories") {
    return "Настройки категорий";
  }

  if (screen === "settings") {
    return "Настройка";
  }

  return "Бюджет текущего месяца";
}

function NavigationMenu({ currentScreen, onNavigate, selectedPeriodContext }) {
  return (
    <nav className="nav-list" aria-label="Основное меню">
      {navigationItems.map((item, index) => (
        <button
          key={item}
          className={
            ((currentScreen === "months" || currentScreen === "periodMonth" || currentScreen === "month" || currentScreen === "nextMonth" || currentScreen === "regular") && index === 0) ||
            ((currentScreen === "settings" || currentScreen === "categories") && item === "Настройка")
              ? "nav-item active"
              : "nav-item"
          }
          type="button"
          onClick={() => onNavigate(item, index, selectedPeriodContext)}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

function CategorySettingsScreen({
  categories,
  members,
  regularExpenses,
  onBackToSettings,
  onOpenCreate,
  onOpenEdit,
  onRequestDelete,
}) {
  const usageCountByLabel = useMemo(() => {
    const counts = new Map();
    members.forEach((member) => {
      member.expenses.forEach((expense) => {
        counts.set(expense.category, (counts.get(expense.category) ?? 0) + 1);
      });
    });
    regularExpenses.forEach((template) => {
      counts.set(template.category, (counts.get(template.category) ?? 0) + 1);
    });
    return counts;
  }, [members, regularExpenses]);

  return (
    <>
      <header className="page-header">
        <Breadcrumbs
          items={[
            { label: "Настройки", onClick: onBackToSettings },
            { label: "Категории", current: true },
          ]}
        />
        <p className="eyebrow">Настройка приложения</p>
        <h1>Настройки категорий</h1>
        <p className="page-note">
          Управляй категориями, которые потом используются в попапах создания и изменения трат.
        </p>
      </header>

      <section className="card category-settings-screen-card">
        <div className="category-settings-toolbar">
          <button className="primary-action-button" type="button" onClick={onOpenCreate}>
            Добавить категорию
          </button>
        </div>

        <div className="category-admin-list">
          {categories.map((category) => {
            const usageCount = usageCountByLabel.get(category.label) ?? 0;

            return (
              <div key={category.id} className="category-admin-item">
                <div className="category-admin-main">
                  <div className="category-admin-visual" style={{ background: category.color }} />
                  <div className="category-admin-content">
                    <div className="category-admin-chip-row">
                      <span className="category-admin-icon">{category.icon}</span>
                      <div className="category-admin-chip">{category.label}</div>
                    </div>
                    <div className="category-admin-usage">
                      Используется: {usageCount} {usageCount === 1 ? "раз" : "мест"}
                    </div>
                  </div>
                </div>
                <div className="category-admin-buttons">
                  <button className="secondary-action-button" type="button" onClick={() => onOpenEdit(category)}>
                    Изменить
                  </button>
                  <button
                    className="secondary-action-button danger"
                    type="button"
                    onClick={() => onRequestDelete(category, usageCount)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function CategoryEditorModal({ category, members, categoriesCount, onClose, onSave }) {
  const isCreateMode = !category;
  const colorInputRef = useRef(null);
  const [isColorManuallyEdited, setIsColorManuallyEdited] = useState(Boolean(category?.color));
  const [draft, setDraft] = useState(
    category ?? {
      id: null,
      icon: "",
      label: "",
      color: getDefaultCategoryColor("", categoriesCount),
    },
  );
  const usageCount = useMemo(() => {
    if (!category) {
      return 0;
    }
    return members.reduce(
      (sum, member) => sum + member.expenses.filter((expense) => expense.category === category.label).length,
      0,
    );
  }, [category, members]);

  const handleSubmit = () => {
    const icon = draft.icon.trim();
    const label = draft.label.trim();
    if (!icon || !label) {
      return;
    }
    onSave(
      category,
      { ...(category ?? {}), id: draft.id ?? `category-${Date.now()}`, icon, label, color: draft.color },
      usageCount,
    );
  };

  return (
    <ModalShell title={isCreateMode ? "Добавить категорию" : "Изменить категорию"} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить категорию" : "Изменить категорию"}</h2>
      </div>

      <div className="category-settings-form">
        <div className="field">
          <span className="field-head">
            <span>Иконка</span>
          </span>
          <input
            placeholder="Например, 🏠"
            value={draft.icon}
            onChange={(event) =>
              setDraft((current) => {
                const nextIcon = event.target.value;
                const nextColor =
                  isCreateMode && !isColorManuallyEdited
                    ? getDefaultCategoryColor(nextIcon, categoriesCount)
                    : current.color;

                return { ...current, icon: nextIcon, color: nextColor };
              })
            }
          />
        </div>

        <div className="field">
          <span className="field-head">
            <span>Название категории</span>
          </span>
          <input
            placeholder="Например, Жильё"
            value={draft.label}
            onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
          />
        </div>

        <div className="field">
          <span className="field-head">
            <span>Цвет категории</span>
          </span>
          <div className="category-color-field">
            <div className="category-color-preview-row">
              <div className="category-color-preview" style={{ background: draft.color }} />
              <button
                className="secondary-action-button"
                type="button"
                onClick={() => colorInputRef.current?.click()}
              >
                Изменить цвет
              </button>
            </div>
            <input
              ref={colorInputRef}
              className="category-color-input"
              type="color"
              value={draft.color}
              onChange={(event) => {
                setIsColorManuallyEdited(true);
                setDraft((current) => ({ ...current, color: event.target.value }));
              }}
            />
          </div>
        </div>

        {usageCount > 0 && !isCreateMode ? (
          <p className="category-editor-note">
            Категория используется в {usageCount} местах. Изменение повлияет на существующие траты и аналитику.
          </p>
        ) : null}

        <div className="category-settings-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary-action-button" type="button" onClick={handleSubmit}>
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CategoryConfirmModal({ title, description, onClose, onConfirm }) {
  return (
    <ModalShell title={title} onClose={onClose} compact>
      <div className="confirm-dialog standalone-confirm-dialog">
        <p className="inline-confirm-title">{title}</p>
        <p className="inline-confirm-text">{description}</p>
        <div className="inline-confirm-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="secondary-action-button danger solid" type="button" onClick={onConfirm}>
            Да, продолжить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function MonthRow({ month, onOpenCurrentMonth, onOpenMonth }) {
  const meta = getMonthMetaByName(month.name);
  const handleOpen = () => {
    if (month.isCurrent) {
      onOpenCurrentMonth();
      return;
    }

    onOpenMonth(month);
  };

  return (
    <button className={month.isCurrent ? "month-row current" : "month-row"} type="button" onClick={handleOpen}>
      <div className="month-row-main">
        <div className="month-row-icon" style={{ background: meta.bg, color: meta.tone }}>
          {meta.icon}
        </div>
        <div className="month-row-copy">
          <div className="month-row-name">{month.name}</div>
        </div>
      </div>

      <div className="month-row-actions">
        <span className="month-budget-label">Бюджет</span>
        <strong className="month-budget-value">
          {formatCurrency(month.budget)} Kč
        </strong>
      </div>
    </button>
  );
}

function YearCard({ yearData, expanded, onToggle, onDelete, onOpenCurrentMonth, onOpenMonth }) {
  return (
    <section className="card year-card">
      <div className="year-card-head">
        <div className="year-card-title">
          <h2>{yearData.year}</h2>
          <div className="year-card-stats">
            <span>Бюджет: {formatCurrency(yearData.budget)} Kč</span>
          </div>
        </div>
        <div className="year-card-actions">
          <button className="year-toggle-button" type="button" onClick={() => onToggle(yearData.year)}>
            {expanded ? "Свернуть" : "Развернуть"}
          </button>
        </div>
      </div>

      {expanded ? (
        <>
          <div className="year-months">
            {yearData.months.map((month) => (
              <MonthRow
                key={`${yearData.year}-${month.name}`}
                month={month}
                onOpenCurrentMonth={onOpenCurrentMonth}
                onOpenMonth={onOpenMonth}
              />
            ))}
          </div>
          <div className="year-card-footer">
            <button className="year-delete-button" type="button" onClick={() => onDelete(yearData.year)}>
              Удалить год
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function MonthsScreen({
  yearCards,
  expandedYears,
  onToggleYear,
  onDeleteYear,
  onAddYear,
  onCreateExpense,
  onOpenCurrentMonth,
  onOpenNextMonth,
  onOpenRegular,
  onOpenMonth,
}) {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Вход в бюджет</p>
        <h1>Бюджет</h1>
        <p className="page-note">
          Отсюда можно быстро перейти в текущий месяц, в грядущий месяц и в любой другой период для
          просмотра и планирования бюджета.
        </p>
      </header>

      <section className="card months-summary-card">
        <div className="months-summary-copy">
          <h2>Быстрый вход</h2>
          <p>
            Выбирай рабочий сценарий сверху, а ниже открывай нужные месяцы по годам.
          </p>
        </div>
        <div className="budget-entry-actions">
          <button className="primary-action-button" type="button" onClick={onCreateExpense}>
            Добавить трату
          </button>
          <button className="primary-action-button" type="button" onClick={onOpenCurrentMonth}>
            Бюджет текущего месяца
          </button>
          <button className="secondary-action-button" type="button" onClick={onOpenNextMonth}>
            Бюджет грядущего месяца
          </button>
          <button className="secondary-action-button" type="button" onClick={onOpenRegular}>
            Регулярные траты
          </button>
        </div>
      </section>

      <div className="months-utility-bar">
        <button className="secondary-action-button" type="button" onClick={onAddYear}>
          Добавить новый учетный год
        </button>
      </div>

      <div className="years-stack">
        {yearCards.map((yearData) => (
          <YearCard
            key={yearData.year}
            yearData={yearData}
            expanded={Boolean(expandedYears[yearData.year])}
            onToggle={onToggleYear}
            onDelete={onDeleteYear}
            onOpenCurrentMonth={onOpenCurrentMonth}
            onOpenMonth={onOpenMonth}
          />
        ))}
      </div>
    </>
  );
}

function formatRegularSchedule(template) {
  if (template.frequency === "Раз в год") {
    return `${template.month} · ${template.dayOfMonth} число`;
  }

  return `Каждый месяц · ${template.dayOfMonth} число`;
}

function RegularExpenseTemplateCard({ template, categories, currentMonthContext, onOpen }) {
  const currentAmount = getRegularAmountForPeriod(template, currentMonthContext.year, currentMonthContext.monthName);
  const upcomingChange = getUpcomingRegularChange(template, currentMonthContext);
  const categoryMeta = getCategoryMeta(template.category, categories);

  return (
    <BudgetDataRow
      title={template.title}
      categoryIcon={categoryMeta.icon}
      categoryLabel={categoryMeta.label}
      note={
        upcomingChange
          ? `С ${formatMonthYearGenitive(upcomingChange.effectiveMonth, upcomingChange.effectiveYear)}: ${formatCurrency(upcomingChange.amount)} Kč вместо ${formatCurrency(upcomingChange.previousAmount)} Kč`
          : null
      }
      amount={currentAmount}
      dueLabel={formatRegularSchedule(template)}
      onOpen={onOpen}
      rowClassName="regular-template-row"
    />
  );
}

function RegularExpensesScreen({
  regularExpenses,
  categories,
  currentMonthContext,
  summary,
  onCreate,
  onCreateInGroup,
  onOpen,
  onEdit,
  onDelete,
}) {
  const ownerGroups = ownerOptions.map((owner) => {
    const ownerTemplates = regularExpenses.filter(
      (template) => template.isActive !== false && template.owner === owner,
    );

    return {
      owner,
      monthly: ownerTemplates.filter((template) => template.frequency !== "Раз в год"),
      yearly: ownerTemplates.filter((template) => template.frequency === "Раз в год"),
    };
  });

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Шаблоны бюджета</p>
        <h1>Регулярные траты</h1>
        <p className="page-note">
          Здесь живут регулярные шаблоны ежемесячных и ежегодных трат. Изменения суммы применяются
          только к следующим периодам и не переписывают текущий месяц задним числом.
        </p>
      </header>

      <section className="card regular-summary-card">
        <div className="regular-summary-metrics">
          <div className="regular-summary-metric">
            <span>Всего шаблонов</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="regular-summary-metric">
            <span>Ежемесячные</span>
            <strong>{summary.monthly}</strong>
          </div>
          <div className="regular-summary-metric">
            <span>Ежегодные</span>
            <strong>{summary.yearly}</strong>
          </div>
          <div className="regular-summary-metric accent">
            <span>Изменения впереди</span>
            <strong>{summary.upcomingChanges}</strong>
          </div>
        </div>
        <button className="primary-action-button" type="button" onClick={onCreate}>
          Добавить регулярную трату
        </button>
      </section>

      {ownerGroups.map((group) => (
        <section key={group.owner} className="card regular-group-card">
          <div className="regular-owner-head">
            <h2>{group.owner}</h2>
          </div>

          <div className="regular-subgroup">
          <div className="regular-group-head">
              <div>
                <h3>Ежемесячное</h3>
                <p>Шаблоны, которые повторяются каждый месяц.</p>
              </div>
            </div>
            <div className="regular-template-list">
              {group.monthly.length ? (
                group.monthly.map((template) => (
                  <RegularExpenseTemplateCard
                    key={template.id}
                    template={template}
                    categories={categories}
                    currentMonthContext={currentMonthContext}
                    onOpen={() => onOpen(template)}
                  />
                ))
              ) : (
                <div className="regular-empty-state">Пока нет ежемесячных шаблонов.</div>
              )}
            </div>
            <button
              className="add-expense-button"
              type="button"
              onClick={() => onCreateInGroup(group.owner, "Каждый месяц")}
            >
              Добавить
            </button>
          </div>

          <div className="regular-subgroup">
          <div className="regular-group-head">
              <div>
                <h3>Ежегодное</h3>
                <p>Шаблоны, которые срабатывают только в одном месяце года.</p>
              </div>
            </div>
            <div className="regular-template-list">
              {group.yearly.length ? (
                group.yearly.map((template) => (
                  <RegularExpenseTemplateCard
                    key={template.id}
                    template={template}
                    categories={categories}
                    currentMonthContext={currentMonthContext}
                    onEdit={() => onEdit(template)}
                    onDelete={() => onDelete(template)}
                  />
                ))
              ) : (
                <div className="regular-empty-state">Пока нет ежегодных шаблонов.</div>
              )}
            </div>
            <button
              className="add-expense-button"
              type="button"
              onClick={() => onCreateInGroup(group.owner, "Раз в год")}
            >
              Добавить
            </button>
          </div>
        </section>
      ))}
    </>
  );
}

function ProjectedExpenseRow({ expense, categories, onOpenTemplate, onOpenExpense, onEditExpense }) {
  const isAutoPayment = expense.cadence === "auto";
  const isTemplateExpense = Boolean(expense.templateId);
  const transactionTypeLabel = isAutoPayment ? "Автоплатеж" : "Ручной платеж";
  const categoryMeta = getCategoryMeta(expense.category, categories);

  return (
    <BudgetDataRow
      title={expense.title}
      titleClassName="projected-expense-title"
      categoryIcon={categoryMeta.icon}
      categoryLabel={categoryMeta.label}
      note={expense.effectiveNote ?? null}
      amount={expense.amount}
      dueLabel={getExpensePaymentDateLabel(expense)}
      secondaryLabel={transactionTypeLabel}
      secondaryTone={isAutoPayment ? "muted" : "default"}
      onOpen={() => (isTemplateExpense ? onOpenTemplate?.() : onOpenExpense?.(expense))}
      rowClassName="projected-expense-row"
    />
  );
}

function ProjectedMemberCard({ member, categories, onOpenTemplate, onOpenExpense, onEditExpense, onAddExpense }) {
  const budget = member.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="card member-card projected-member-card">
      <div className="member-header">
        <div className="member-title">
          <div className="member-avatar">{member.emoji}</div>
          <div>
            <div className="member-name">{member.name}</div>
            <div className="member-budget">Прогноз {formatCurrency(budget)} Kč</div>
          </div>
        </div>
      </div>

      <div className="projected-expenses-list">
        {member.expenses.length ? (
          member.expenses.map((expense) => (
            <ProjectedExpenseRow
              key={expense.id}
              expense={expense}
              categories={categories}
              onOpenTemplate={() => onOpenTemplate(expense.templateId)}
              onOpenExpense={onOpenExpense}
              onEditExpense={onEditExpense}
            />
          ))
        ) : (
          <div className="budget-empty-state">Пока нет трат в грядущем месяце.</div>
        )}
      </div>

      <button className="add-expense-button" type="button" onClick={() => onAddExpense(member)}>
        Добавить
      </button>
    </section>
  );
}

function NextMonthBudgetScreen({
  title = "Бюджет грядущего месяца",
  note = "Этот экран собирается из регулярных шаблонов. Изменения суммы применяются здесь уже с нового периода, а текущий месяц остается без переписывания.",
  breadcrumbs = null,
  monthLabel,
  monthMeta,
  totals,
  categoryBreakdown,
  members,
  categories,
  onOpenTemplate,
  onOpenExpense,
  onEditExpense,
  onAddExpense,
}) {
  return (
    <>
      <header className="page-header">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <p className="eyebrow">Проекция бюджета</p>
        <h1>{title}</h1>
        <p className="page-note">{note}</p>
      </header>

      <div className="dashboard-grid">
        <MonthOverviewCard monthLabel={monthLabel} monthMeta={monthMeta} budget={totals.budget} paid={0} />
        <CategoryBreakdownCard items={categoryBreakdown} total={totals.budget} />
      </div>

      <div className="members-grid">
        {members.map((member) => (
          <ProjectedMemberCard
            key={member.id}
            member={member}
            categories={categories}
            onOpenTemplate={onOpenTemplate}
            onOpenExpense={onOpenExpense}
            onEditExpense={onEditExpense}
            onAddExpense={onAddExpense}
          />
        ))}
      </div>
    </>
  );
}

function RegularExpenseEditorModal({ template, defaults, categories, currentMonthContext, onClose, onSave }) {
  const isCreateMode = !template;
  const nextMonthContext = getNextMonthContext(currentMonthContext);
  const currentAmount = template
    ? getRegularAmountForPeriod(template, currentMonthContext.year, currentMonthContext.monthName)
    : null;
  const [showValidation, setShowValidation] = useState(false);
  const [form, setForm] = useState(() => ({
    title: template?.title ?? "",
    amount: template ? String(currentAmount) : "",
    transactionType: template ? (template.cadence === "auto" ? "Автоматическая" : "Ручная") : "",
    frequency: template?.frequency ?? defaults?.frequency ?? "Каждый месяц",
    dayOfMonth: template?.dayOfMonth ?? defaults?.dayOfMonth ?? "",
    month: template?.month ?? defaults?.month ?? nextMonthContext.monthShort,
    owner: template?.owner ?? defaults?.owner ?? "",
    payer: template?.payer ?? defaults?.payer ?? "",
    category: template ? getCategoryOption(template.category, categories) : defaults?.category ?? "",
  }));

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const dayValue = Number(form.dayOfMonth || 0);
  const isInvalidDay = form.dayOfMonth !== "" && (dayValue < 1 || dayValue > 28);
  const requiresMonth = form.frequency === "Раз в год";

  const isReadyToSave =
    form.title.trim() !== "" &&
    form.amount !== "" &&
    form.transactionType !== "" &&
    form.dayOfMonth !== "" &&
    !isInvalidDay &&
    form.owner !== "" &&
    form.payer !== "" &&
    form.category !== "" &&
    (!requiresMonth || form.month !== "");

  const amountWillChange =
    template && Number(form.amount || 0) !== currentAmount;

  const handleSave = () => {
    if (!isReadyToSave) {
      setShowValidation(true);
      return;
    }

    onSave(template, {
      title: form.title.trim(),
      amount: Number(form.amount),
      cadence: form.transactionType === "Автоматическая" ? "auto" : "manual",
      frequency: form.frequency,
      dayOfMonth: form.dayOfMonth,
      month: requiresMonth ? form.month : nextMonthContext.monthShort,
      owner: form.owner,
      payer: form.payer,
      category: stripCategoryLabel(form.category),
    });
  };

  return (
    <ModalShell title={isCreateMode ? "Добавить регулярную трату" : "Изменить регулярную трату"} onClose={onClose}>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить регулярную трату" : "Изменить регулярную трату"}</h2>
      </div>

      <div className="modal-form">
        <label className={showValidation && form.title.trim() === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Название *</span></span>
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>

        <label className={showValidation && form.amount === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Сумма *</span></span>
          <div className="input-with-suffix">
            <input value={formatNumberInput(form.amount)} onChange={(event) => updateField("amount", parseDigits(event.target.value))} />
            <span>Kč</span>
          </div>
        </label>

        <div className={showValidation && form.transactionType === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Тип транзакции *</span></span>
          <SegmentGroup options={["Ручная", "Автоматическая"]} value={form.transactionType} onChange={(value) => updateField("transactionType", value)} />
        </div>

        <div className="field">
          <span className="field-head"><span>Периодичность *</span></span>
          <SegmentGroup options={["Каждый месяц", "Раз в год"]} value={form.frequency} onChange={(value) => updateField("frequency", value)} />
        </div>

        <label className={showValidation && (form.dayOfMonth === "" || isInvalidDay) ? "field invalid" : "field"}>
          <span className="field-head"><span>Число в месяце (1-28) *</span></span>
          <input
            value={form.dayOfMonth}
            placeholder="Например, 12"
            onChange={(event) => updateField("dayOfMonth", parseDigits(event.target.value).slice(0, 2))}
          />
        </label>

        {requiresMonth ? (
          <div className={showValidation && form.month === "" ? "field invalid" : "field"}>
            <span className="field-head"><span>Месяц применения *</span></span>
            <SegmentGroup options={monthOptions} value={form.month} onChange={(value) => updateField("month", value)} />
          </div>
        ) : null}

        <div className={showValidation && form.owner === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Чья это трата? *</span></span>
          <SegmentGroup options={ownerOptions} value={form.owner} onChange={(value) => updateField("owner", value)} />
        </div>

        <div className={showValidation && form.payer === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Кто платит? *</span></span>
          <SegmentGroup options={payerOptions} value={form.payer} onChange={(value) => updateField("payer", value)} />
        </div>

        <div className={showValidation && form.category === "" ? "field invalid" : "field"}>
          <span className="field-head"><span>Категория *</span></span>
          <SegmentGroup
            options={categories.map((category) => formatCategoryOption(category))}
            value={form.category}
            variant="category"
            onChange={(value) => updateField("category", value)}
          />
        </div>

        {amountWillChange ? (
          <p className="regular-editor-note">
            Новая сумма начнет действовать с {formatMonthYearGenitive(nextMonthContext.monthName, nextMonthContext.year)}.
            Текущий месяц останется без изменений.
          </p>
        ) : (
          <p className="regular-editor-note">
            Этот шаблон влияет только на будущие платежные периоды и не переписывает уже созданный текущий месяц.
          </p>
        )}

        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary-action-button" type="button" onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default function App() {
  const currentMonthContext = getCurrentMonthContext();
  const currentMonthMeta = getMonthMetaByName(currentMonthContext.monthName);
  const currentMonthLabel = `${currentMonthContext.monthName} ${currentMonthContext.year}`;
  const nextMonthContext = getNextMonthContext(currentMonthContext);
  const nextMonthMeta = getMonthMetaByName(nextMonthContext.monthName);
  const nextMonthLabel = `${nextMonthContext.monthName} ${nextMonthContext.year}`;
  const initialNavigationState = readNavigationStateFromLocation();
  const contentRef = useRef(null);
  const hasInitializedHistoryRef = useRef(false);
  const skipHistorySyncRef = useRef(false);
  const [members, setMembers] = useState(getInitialMembers);
  const [categories, setCategories] = useState(getInitialCategories);
  const [regularExpenses, setRegularExpenses] = useState(() => getInitialRegularExpenses(getInitialMembers()));
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedRegularTemplate, setSelectedRegularTemplate] = useState(null);
  const [modalMode, setModalMode] = useState("details");
  const [currentScreen, setCurrentScreen] = useState(initialNavigationState.screen);
  const [authSession, setAuthSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [authPending, setAuthPending] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [dbInitError, setDbInitError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [trackedYears, setTrackedYears] = useState(getInitialTrackedYears);
  const [expandedYears, setExpandedYears] = useState(() => getInitialExpandedYears(getInitialTrackedYears()));
  const [categoryEditorState, setCategoryEditorState] = useState(null);
  const [categoryConfirmState, setCategoryConfirmState] = useState(null);
  const [yearConfirmState, setYearConfirmState] = useState(null);
  const [regularEditorState, setRegularEditorState] = useState(null);
  const [regularConfirmState, setRegularConfirmState] = useState(null);
  const [resetConfirmState, setResetConfirmState] = useState(null);
  const [selectedPeriodContext, setSelectedPeriodContext] = useState(initialNavigationState.periodContext);
  const [supabaseHouseholdId, setSupabaseHouseholdId] = useState(null);
  const [dbHydrated, setDbHydrated] = useState(!isSupabaseConfigured);
  const skipNextDbSyncRef = useRef(false);
  const latestSnapshotRef = useRef({ members, categories, regularExpenses });
  const persistInFlightRef = useRef(false);
  const persistQueuedRef = useRef(false);
  const persistPromiseRef = useRef(Promise.resolve());

  const applyRemoteSnapshot = (snapshot) => {
    const normalizedSnapshot = normalizeBudgetSnapshot(snapshot);
    skipNextDbSyncRef.current = true;
    setMembers(normalizedSnapshot.members);
    setCategories(normalizedSnapshot.categories);
    setRegularExpenses(normalizedSnapshot.regularExpenses);
  };

  latestSnapshotRef.current = normalizeBudgetSnapshot({ members, categories, regularExpenses });

  const currentNavigationLabel = getScreenNavigationLabel(currentScreen, selectedPeriodContext);

  const handleNavigate = (item, index) => {
    setMobileNavOpen(false);

    if (index === 0) {
      setSelectedPeriodContext(null);
      setCurrentScreen("months");
      return;
    }
    if (item === "Настройка") {
      setCurrentScreen("settings");
    }
  };

  const scheduleSupabaseSync = () => {
    if (!isSupabaseConfigured || !authUser || !supabaseHouseholdId) {
      return;
    }

    if (persistInFlightRef.current) {
      persistQueuedRef.current = true;
      return;
    }

    persistInFlightRef.current = true;

    void (async () => {
      try {
        do {
          persistQueuedRef.current = false;
          const snapshot = latestSnapshotRef.current;

          await persistBudgetSnapshotToSupabase({
            householdId: supabaseHouseholdId,
            members: snapshot.members,
            categories: snapshot.categories,
            regularExpenses: snapshot.regularExpenses,
          });
        } while (persistQueuedRef.current);
      } catch (error) {
        console.error("Supabase snapshot sync failed:", error);
      } finally {
        persistInFlightRef.current = false;
      }
    })();
  };

  const enqueueSnapshotPersist = (snapshot) => {
    if (!isSupabaseConfigured || !authUser || !supabaseHouseholdId) {
      return Promise.resolve();
    }

    persistPromiseRef.current = persistPromiseRef.current
      .catch(() => {})
      .then(() =>
        persistBudgetSnapshotToSupabase({
          householdId: supabaseHouseholdId,
          members: snapshot.members,
          categories: snapshot.categories,
          regularExpenses: snapshot.regularExpenses,
        }),
      );

    return persistPromiseRef.current;
  };

  const commitSnapshot = async (snapshot) => {
    if (isSupabaseConfigured && authUser && !supabaseHouseholdId) {
      throw new Error("Supabase household is not ready");
    }

    const normalizedSnapshot = normalizeBudgetSnapshot(snapshot);
    latestSnapshotRef.current = normalizedSnapshot;
    skipNextDbSyncRef.current = true;
    setMembers(normalizedSnapshot.members);
    setCategories(normalizedSnapshot.categories);
    setRegularExpenses(normalizedSnapshot.regularExpenses);
    await enqueueSnapshotPersist(normalizedSnapshot);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    let isCancelled = false;
    const supabase = requireSupabase();

    supabase.auth.getSession().then(({ data, error }) => {
      if (isCancelled) {
        return;
      }

      if (error) {
        console.error("Supabase auth session fetch failed:", error);
        setAuthErrorMessage("Не удалось проверить текущую сессию Google.");
      }

      setAuthSession(data.session ?? null);
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
      setAuthPending(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) {
        return;
      }

      setAuthSession(session ?? null);
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
      setAuthPending(false);
      setAuthErrorMessage("");
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    window.localStorage.setItem(REGULAR_EXPENSES_STORAGE_KEY, JSON.stringify(regularExpenses));
  }, [regularExpenses]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(TRACKED_YEARS_STORAGE_KEY, JSON.stringify(trackedYears));
    } catch {
      // ignore storage write errors
    }
  }, [trackedYears]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const normalized = Object.fromEntries(
        trackedYears.map((year, index) => [year, Boolean(expandedYears[year]) || (!Object.prototype.hasOwnProperty.call(expandedYears, year) && index === 0)]),
      );
      window.localStorage.setItem(EXPANDED_YEARS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // ignore storage write errors
    }
  }, [expandedYears, trackedYears]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (
      selectedExpense ||
      selectedRegularTemplate ||
      categoryEditorState ||
      categoryConfirmState ||
      yearConfirmState ||
      regularEditorState ||
      regularConfirmState ||
      resetConfirmState
    ) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [selectedExpense, selectedRegularTemplate, categoryEditorState, categoryConfirmState, yearConfirmState, regularEditorState, regularConfirmState, resetConfirmState]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    contentRef.current?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  }, [currentScreen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentScreen, selectedPeriodContext]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextHash = buildNavigationHash(currentScreen, selectedPeriodContext);
    const currentHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ""}`;

    if (!hasInitializedHistoryRef.current) {
      hasInitializedHistoryRef.current = true;

      if (nextHash !== currentHash) {
        window.history.replaceState(null, "", nextUrl);
      }
      return;
    }

    if (skipHistorySyncRef.current) {
      skipHistorySyncRef.current = false;
      return;
    }

    if (nextHash === currentHash) {
      return;
    }

    window.history.pushState(null, "", nextUrl);
  }, [currentScreen, selectedPeriodContext]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      const navigationState = readNavigationStateFromLocation();
      skipHistorySyncRef.current = true;
      setSelectedPeriodContext(navigationState.periodContext);
      setCurrentScreen(navigationState.screen);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDbHydrated(true);
      return;
    }

    if (!authReady) {
      return;
    }

    if (!authUser) {
      setSupabaseHouseholdId(null);
      setDbHydrated(false);
      return;
    }

    let isCancelled = false;

    const initializeSupabaseState = async () => {
      try {
        setDbHydrated(false);
        setDbInitError("");
        const householdId = await ensureHouseholdRecord(authUser);
        if (isCancelled) {
          return;
        }

        setSupabaseHouseholdId(householdId);

        const snapshot = await loadBudgetSnapshotFromSupabase(householdId);
        if (isCancelled) {
          return;
        }

        const hasRemoteData = hasMeaningfulSnapshotData(snapshot);

        if (hasRemoteData) {
          applyRemoteSnapshot(snapshot);
        } else {
          const fallbackSnapshot = {
            members: createEmptyMembers(),
            categories: initialCategories.map((category, index) => ensureCategoryColor(category, index)),
            regularExpenses: [],
          };

          applyRemoteSnapshot(fallbackSnapshot);

          await persistBudgetSnapshotToSupabase({
            householdId,
            members: fallbackSnapshot.members,
            categories: fallbackSnapshot.categories,
            regularExpenses: fallbackSnapshot.regularExpenses,
          });
        }

        setDbHydrated(true);
      } catch (error) {
        console.error("Supabase initialization failed:", error);
        setSupabaseHouseholdId(null);
        setDbInitError("Не удалось подключить серверное хранилище бюджета. Редактирование временно отключено, чтобы изменения не пропадали после обновления.");
        setDbHydrated(true);
      }
    };

    initializeSupabaseState();

    return () => {
      isCancelled = true;
    };
  }, [authReady, authUser]);

  useEffect(() => {
    if (!isSupabaseConfigured || !authUser || !dbHydrated || !supabaseHouseholdId) {
      return;
    }

    if (skipNextDbSyncRef.current) {
      skipNextDbSyncRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scheduleSupabaseSync();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [categories, dbHydrated, members, regularExpenses, supabaseHouseholdId]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }

    setRegularExpenses((currentTemplates) => {
      const missingTemplates = [];
      const knownSourceIds = new Set(currentTemplates.map((template) => template.sourceExpenseId).filter(Boolean));
      const knownTemplateKeys = new Set(currentTemplates.map(getRegularTemplateSemanticKey));

      members.forEach((member, memberIndex) => {
        member.expenses.forEach((expense, expenseIndex) => {
          const frequency = expense.frequency ?? detectFrequency(expense);
          const isRecurring = frequency === "Каждый месяц" || frequency === "Раз в год";
          const templateCandidate = buildRegularTemplateFromExpense(
            member,
            {
              ...expense,
              frequency,
              dayOfMonth: expense.dayOfMonth ?? String(getExpenseDayOfMonth(expense)),
            },
            currentTemplates.length + memberIndex * 1000 + expenseIndex,
          );
          const dedupKey = getRegularTemplateSemanticKey(templateCandidate);

          if (!isRecurring || knownSourceIds.has(expense.id) || knownTemplateKeys.has(dedupKey)) {
            return;
          }

          missingTemplates.push(templateCandidate);
          knownTemplateKeys.add(dedupKey);
        });
      });

      return missingTemplates.length ? [...currentTemplates, ...missingTemplates] : currentTemplates;
    });
  }, [members]);

  useEffect(() => {
    setRegularExpenses((currentTemplates) => {
      const dedupedTemplates = dedupeRegularTemplates(currentTemplates);

      return JSON.stringify(dedupedTemplates) === JSON.stringify(currentTemplates)
        ? currentTemplates
        : dedupedTemplates;
    });
  }, []);

  const currentMonthExpenses = useMemo(() => {
    return members.flatMap((member) =>
      member.expenses.filter((expense) => isExpenseInPeriod(expense, currentMonthContext.year, currentMonthContext.monthName)),
    );
  }, [currentMonthContext.monthName, currentMonthContext.year, members]);

  const currentMonthTotals = useMemo(() => {
    return {
      budget: currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      paid: currentMonthExpenses
        .filter((expense) => expense.completed)
        .reduce((sum, expense) => sum + expense.amount, 0),
    };
  }, [currentMonthExpenses]);

  const categoryBreakdown = useMemo(() => {
    const totalsByCategory = new Map();

    currentMonthExpenses.forEach((expense) => {
      const currentTotal = totalsByCategory.get(expense.category) ?? 0;
      totalsByCategory.set(expense.category, currentTotal + expense.amount);
    });

    return [...totalsByCategory.entries()]
      .map(([label, amount]) => {
        const category = categories.find((item) => item.label === label);
        const share = currentMonthTotals.budget > 0 ? (amount / currentMonthTotals.budget) * 100 : 0;

        return {
          label,
          amount,
          share,
          color: getCategoryColor(label, categories),
          icon: category?.icon ?? "•",
        };
      })
      .sort((left, right) => right.amount - left.amount);
  }, [categories, currentMonthExpenses, currentMonthTotals.budget]);

  const regularExpensesByFrequency = useMemo(() => {
    const monthly = [];
    const yearly = [];

    regularExpenses
      .filter((template) => template.isActive !== false)
      .sort((left, right) => {
        const dayDifference = Number(left.dayOfMonth) - Number(right.dayOfMonth);
        if (dayDifference !== 0) {
          return dayDifference;
        }

        return left.title.localeCompare(right.title, "ru");
      })
      .forEach((template) => {
        if (template.frequency === "Раз в год") {
          yearly.push(template);
          return;
        }

        monthly.push(template);
      });

    return { monthly, yearly };
  }, [regularExpenses]);

  const regularSummary = useMemo(() => {
    const upcomingChanges = regularExpenses.filter((template) => getUpcomingRegularChange(template, currentMonthContext));
    return {
      total: regularExpenses.filter((template) => template.isActive !== false).length,
      monthly: regularExpensesByFrequency.monthly.length,
      yearly: regularExpensesByFrequency.yearly.length,
      upcomingChanges: upcomingChanges.length,
    };
  }, [currentMonthContext, regularExpenses, regularExpensesByFrequency.monthly.length, regularExpensesByFrequency.yearly.length]);

  const projectedNextMonthExpenses = useMemo(() => {
    return buildCombinedMonthExpenses({
      members,
      regularExpenses,
      monthContext: nextMonthContext,
    });
  }, [members, nextMonthContext, regularExpenses]);

  const selectedPeriodIsFuture = useMemo(() => {
    if (!selectedPeriodContext) {
      return false;
    }

    return getPeriodOrderKey(selectedPeriodContext.year, selectedPeriodContext.monthName) >
      getPeriodOrderKey(currentMonthContext.year, currentMonthContext.monthName);
  }, [currentMonthContext.monthName, currentMonthContext.year, selectedPeriodContext]);

  const selectedPeriodExpenses = useMemo(() => {
    if (!selectedPeriodContext) {
      return [];
    }

    if (!selectedPeriodIsFuture) {
      return getMemberExpensesForMonth(members, selectedPeriodContext);
    }

    return buildCombinedMonthExpenses({
      members,
      regularExpenses,
      monthContext: selectedPeriodContext,
    });
  }, [members, regularExpenses, selectedPeriodContext, selectedPeriodIsFuture]);

  const nextMonthTotals = useMemo(() => {
    return {
      budget: projectedNextMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      paid: 0,
    };
  }, [projectedNextMonthExpenses]);

  const selectedPeriodTotals = useMemo(() => {
    return {
      budget: selectedPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      paid: selectedPeriodExpenses
        .filter((expense) => expense.completed)
        .reduce((sum, expense) => sum + expense.amount, 0),
    };
  }, [selectedPeriodExpenses]);

  const nextMonthCategoryBreakdown = useMemo(() => {
    const totalsByCategory = new Map();

    projectedNextMonthExpenses.forEach((expense) => {
      totalsByCategory.set(expense.category, (totalsByCategory.get(expense.category) ?? 0) + expense.amount);
    });

    return [...totalsByCategory.entries()]
      .map(([label, amount]) => {
        const category = categories.find((item) => item.label === label);
        const share = nextMonthTotals.budget > 0 ? (amount / nextMonthTotals.budget) * 100 : 0;

        return {
          label,
          amount,
          share,
          color: getCategoryColor(label, categories),
          icon: category?.icon ?? "•",
        };
      })
      .sort((left, right) => right.amount - left.amount);
  }, [categories, nextMonthTotals.budget, projectedNextMonthExpenses]);

  const selectedPeriodCategoryBreakdown = useMemo(() => {
    const totalsByCategory = new Map();

    selectedPeriodExpenses.forEach((expense) => {
      const currentTotal = totalsByCategory.get(expense.category) ?? 0;
      totalsByCategory.set(expense.category, currentTotal + expense.amount);
    });

    return [...totalsByCategory.entries()]
      .map(([label, amount]) => {
        const category = categories.find((item) => item.label === label);
        const share = selectedPeriodTotals.budget > 0 ? (amount / selectedPeriodTotals.budget) * 100 : 0;

        return {
          label,
          amount,
          share,
          color: getCategoryColor(label, categories),
          icon: category?.icon ?? "•",
        };
      })
      .sort((left, right) => right.amount - left.amount);
  }, [categories, selectedPeriodExpenses, selectedPeriodTotals.budget]);

  const dashboardMembers = useMemo(() => {
    const payerGroups = Object.fromEntries(
      [...payerOptions]
        .sort((left, right) => left.localeCompare(right, "ru"))
        .map((payer) => {
          const memberProfile = members.find((member) => member.name === payer);

          return [
            payer,
            {
              id: memberProfile?.id ?? payer.toLowerCase(),
              name: payer,
              emoji: memberProfile?.emoji ?? "🙂",
              expenses: [],
            },
          ];
        }),
    );

    members.forEach((sourceMember) => {
      sourceMember.expenses.forEach((expense) => {
        if (!isExpenseInPeriod(expense, currentMonthContext.year, currentMonthContext.monthName)) {
          return;
        }

        const payer = getExpensePayer(expense);
        if (!payerGroups[payer]) {
          return;
        }

        payerGroups[payer].expenses.push({
          ...expense,
          sourceMember,
        });
      });
    });

    return Object.values(payerGroups)
      .map((member) => ({
        ...member,
        expenses: [...member.expenses].sort((left, right) => {
          const dayDifference = getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right);
          if (dayDifference !== 0) {
            return dayDifference;
          }

          return left.title.localeCompare(right.title, "ru");
        }),
      }));
  }, [currentMonthContext.monthName, currentMonthContext.year, members]);

  const nextMonthMembers = useMemo(() => {
    const payerGroups = Object.fromEntries(
      [...payerOptions]
        .sort((left, right) => left.localeCompare(right, "ru"))
        .map((payer) => {
          const memberProfile = members.find((member) => member.name === payer);

          return [
            payer,
            {
              id: `projected-${memberProfile?.id ?? payer.toLowerCase()}`,
              name: payer,
              emoji: memberProfile?.emoji ?? "🙂",
              expenses: [],
            },
          ];
        }),
    );

    projectedNextMonthExpenses.forEach((expense) => {
      const payer = getExpensePayer(expense);
      if (!payerGroups[payer]) {
        return;
      }

      payerGroups[payer].expenses.push(expense);
    });

    return Object.values(payerGroups)
      .map((member) => ({
        ...member,
        expenses: [...member.expenses].sort((left, right) => {
          const dayDifference = getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right);
          if (dayDifference !== 0) {
            return dayDifference;
          }

          return left.title.localeCompare(right.title, "ru");
        }),
      }));
  }, [members, projectedNextMonthExpenses]);

  const selectedPeriodMembers = useMemo(() => {
    if (!selectedPeriodContext) {
      return [];
    }

    const payerGroups = Object.fromEntries(
      [...payerOptions]
        .sort((left, right) => left.localeCompare(right, "ru"))
        .map((payer) => {
          const memberProfile = members.find((member) => member.name === payer);

          return [
            payer,
            {
              id: `period-${selectedPeriodContext.year}-${selectedPeriodContext.monthIndex}-${memberProfile?.id ?? payer.toLowerCase()}`,
              name: payer,
              emoji: memberProfile?.emoji ?? "🙂",
              expenses: [],
            },
          ];
        }),
    );

    selectedPeriodExpenses.forEach((expense) => {
      const payer = getExpensePayer(expense);
      if (!payerGroups[payer]) {
        return;
      }

      payerGroups[payer].expenses.push(expense);
    });

    return Object.values(payerGroups)
      .map((member) => ({
        ...member,
        expenses: [...member.expenses].sort((left, right) => {
          const dayDifference = getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right);
          if (dayDifference !== 0) {
            return dayDifference;
          }

          return left.title.localeCompare(right.title, "ru");
        }),
      }));
  }, [members, selectedPeriodContext, selectedPeriodExpenses]);

  const yearCards = useMemo(() => {
    const { year: currentYear, monthName: currentMonthName } = getCurrentMonthContext();
    const currentOrder = getPeriodOrderKey(currentYear, currentMonthName);
    const aggregates = new Map();

    trackedYears.forEach((year) => {
      aggregates.set(
        year,
        Object.fromEntries(
          fullMonthNames.map((monthName) => [
            monthName,
            { name: monthName, budget: 0, paid: 0, hasData: false, isCurrent: year === currentYear && monthName === currentMonthName },
          ]),
        ),
      );
    });

    members.forEach((member) => {
      member.expenses.forEach((expense) => {
        const expenseYear = expense.year ?? currentYear;
        if (!aggregates.has(expenseYear)) {
          return;
        }

        const monthName = normalizeMonthName(expense.month);
        const bucket = aggregates.get(expenseYear)?.[monthName];
        if (!bucket) {
          return;
        }

        bucket.budget += expense.amount;
        bucket.hasData = true;
        if (expense.completed) {
          bucket.paid += expense.amount;
        }
      });
    });

    trackedYears.forEach((year) => {
      fullMonthNames.forEach((monthName) => {
        const bucket = aggregates.get(year)?.[monthName];
        if (!bucket) {
          return;
        }

        if (getPeriodOrderKey(year, monthName) <= currentOrder) {
          return;
        }

        const monthContext = buildMonthContext(year, monthName);
        const actualExpenses = getMemberExpensesForMonth(members, monthContext);
        const projectedBudget = getProjectedRegularExpensesForMonth({
          regularExpenses,
          monthContext,
          actualExpenses,
        }).reduce((sum, expense) => sum + expense.amount, 0);

        if (projectedBudget > 0) {
          bucket.budget += projectedBudget;
          bucket.hasData = true;
        }
      });
    });

    return trackedYears.map((year) => {
      const months = [...fullMonthNames]
        .reverse()
        .map((monthName) => {
          const month = aggregates.get(year)?.[monthName];
          return month ? { ...month, year } : null;
        })
        .filter(Boolean);

      return {
        year,
        budget: months.reduce((sum, month) => sum + month.budget, 0),
        paid: months.reduce((sum, month) => sum + month.paid, 0),
        months,
      };
    });
  }, [members, regularExpenses, trackedYears]);

  const handleToggleExpense = async (memberId, expenseId) => {
    const snapshot = latestSnapshotRef.current;
    const nextMembers = snapshot.members.map((member) =>
      member.id !== memberId
        ? member
        : {
            ...member,
            expenses: member.expenses.map((expense) =>
              expense.id !== expenseId
                ? expense
                : { ...expense, completed: !expense.completed },
            ),
          },
    );

    await commitSnapshot({
      members: nextMembers,
      categories: snapshot.categories,
      regularExpenses: snapshot.regularExpenses,
    });
  };

  const handleAddExpense = (memberId) => {
    const member = members.find((item) => item.id === memberId);
    if (!member) {
      return;
    }

    setSelectedExpense(
      createEmptyExpenseDraft(member, {
        month: monthOptions[currentMonthContext.monthIndex],
        year: currentMonthContext.year,
        owner: member.name,
        payer: member.name === "Общее" ? "" : member.name,
      }),
    );
    setModalMode("edit");
  };

  const handleAddProjectedExpense = (projectedMember) => {
    const member = members.find((item) => item.name === projectedMember.name);
    if (!member) {
      return;
    }

    const targetMonthContext = currentScreen === "periodMonth" && selectedPeriodContext
      ? selectedPeriodContext
      : nextMonthContext;

    setSelectedExpense(
      createEmptyExpenseDraft(member, {
        month: targetMonthContext.monthShort,
        year: targetMonthContext.year,
        owner: projectedMember.name,
        payer: projectedMember.name,
      }),
    );
    setModalMode("edit");
  };

  const handleCreateExpenseFromBudgetHub = () => {
    const commonMember = members.find((item) => item.id === "common") ?? members[0];
    if (!commonMember) {
      return;
    }

    setSelectedExpense(
      createEmptyExpenseDraft(commonMember, {
        month: monthOptions[currentMonthContext.monthIndex],
        year: currentMonthContext.year,
        owner: "",
        payer: "",
      }),
    );
    setModalMode("edit");
  };

  const handleSignInWithGoogle = async () => {
    try {
      setAuthPending(true);
      setAuthErrorMessage("");
      const supabase = requireSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setAuthPending(false);
      setAuthErrorMessage("Не удалось открыть вход через Google. Проверь настройку провайдера в Supabase.");
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthPending(true);
      const supabase = requireSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSupabaseHouseholdId(null);
      setDbHydrated(false);
    } catch (error) {
      console.error("Google sign-out failed:", error);
      setAuthPending(false);
      setAuthErrorMessage("Не удалось завершить сессию. Попробуй ещё раз.");
    }
  };

  if (!authReady) {
    return (
      <main className="app-shell app-loading-shell">
        <section className="app-loading-card" aria-live="polite">
          <div className="app-loading-badge">
            <span className="brand-accent" />
            Family Budget
          </div>
          <h1>Проверяем вход</h1>
          <p>Сейчас убедимся, что сессия Google активна, и только потом откроем бюджет.</p>
        </section>
      </main>
    );
  }

  if (isSupabaseConfigured && !authUser) {
    return (
      <AuthScreen
        onSignIn={handleSignInWithGoogle}
        isPending={authPending}
        errorMessage={authErrorMessage}
      />
    );
  }

  if (!dbHydrated) {
    return (
      <main className="app-shell app-loading-shell">
        <section className="app-loading-card" aria-live="polite">
          <div className="app-loading-badge">
            <span className="brand-accent" />
            Family Budget
          </div>
          <h1>Подключаем данные бюджета</h1>
          <p>Сейчас загрузим категории, траты и шаблоны из Supabase.</p>
        </section>
      </main>
    );
  }

  if (isSupabaseConfigured && authUser && (dbInitError || !supabaseHouseholdId)) {
    return (
      <main className="app-shell app-loading-shell">
        <section className="app-loading-card" aria-live="polite">
          <div className="app-loading-badge">
            <span className="brand-accent" />
            Family Budget
          </div>
          <h1>Серверное хранилище не подключилось</h1>
          <p>{dbInitError || "Не удалось определить household для этой сессии."}</p>
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={() => window.location.reload()}>
              Повторить
            </button>
            <button type="button" className="button button-primary" onClick={handleSignOut}>
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  const handleDeleteExpense = async ({ member, expense }) => {
    const snapshot = latestSnapshotRef.current;
    const nextMembers = snapshot.members.map((currentMember) =>
      currentMember.id !== member.id
        ? currentMember
        : {
            ...currentMember,
            expenses: currentMember.expenses.filter((item) => item.id !== expense.id),
          },
    );

    const nextRegularExpenses = snapshot.regularExpenses.filter(
      (template) => template.sourceExpenseId !== expense.id,
    );

    await commitSnapshot({
      members: nextMembers,
      categories: snapshot.categories,
      regularExpenses: nextRegularExpenses,
    });
    setSelectedExpense(null);
    setModalMode("details");
  };

  const handleSaveExpense = async ({ member, expense }, updates) => {
    const snapshot = latestSnapshotRef.current;
    const isDraft = Boolean(expense.isDraft);
    const nextExpenseId = isDraft ? `${member.id}-${Date.now()}` : expense.id;
    const normalizedPayer = normalizePayerName(updates.payer);
    const normalizedOwner = normalizeOwnerName(updates.owner, normalizedPayer);
    const nextExpense = {
      id: nextExpenseId,
      title: updates.title,
      amount: updates.amount,
      cadence: updates.cadence,
      category: updates.category,
      owner: normalizedOwner,
      payer: normalizedPayer,
      month: updates.month,
      year: updates.year ?? expense.year,
      frequency: updates.frequency,
      dayOfMonth: updates.dayOfMonth,
      completed: isDraft ? false : expense.completed,
      urgent: isDraft ? false : expense.urgent,
      dueLabel: buildDueLabel({
        frequency: updates.frequency,
        dayOfMonth: updates.dayOfMonth,
        month: updates.month,
        urgent: isDraft ? false : expense.urgent,
        completed: isDraft ? false : expense.completed,
      }),
    };

    const nextMembers = snapshot.members.map((currentMember) =>
      currentMember.id !== member.id
        ? currentMember
        : {
            ...currentMember,
            expenses: isDraft
              ? [...currentMember.expenses, nextExpense]
              : currentMember.expenses.map((currentExpense) => {
                  if (currentExpense.id !== expense.id) {
                    return currentExpense;
                  }

                  return nextExpense;
                }),
          },
    );

    const nextRegularExpenses = (() => {
      const isRecurring = updates.frequency === "Каждый месяц" || updates.frequency === "Раз в год";
      const existingTemplateIndex = snapshot.regularExpenses.findIndex(
        (template) => template.sourceExpenseId === nextExpenseId,
      );

      if (!isRecurring) {
        if (existingTemplateIndex === -1) {
          return snapshot.regularExpenses;
        }

        return snapshot.regularExpenses.filter((template) => template.sourceExpenseId !== nextExpenseId);
      }

      const templateExpense = {
        ...nextExpense,
        completed: false,
        urgent: false,
        dueLabel: buildDueLabel({
          frequency: updates.frequency,
          dayOfMonth: updates.dayOfMonth,
          month: updates.month,
          urgent: false,
          completed: false,
        }),
      };

      if (existingTemplateIndex === -1) {
        return [
          ...snapshot.regularExpenses,
          buildRegularTemplateFromExpense(member, templateExpense, snapshot.regularExpenses.length),
        ];
      }

      return snapshot.regularExpenses.map((template, index) => {
        if (index !== existingTemplateIndex) {
          return template;
        }

        const effectiveYear = templateExpense.year ?? currentMonthContext.year;
        const effectiveMonth = normalizeMonthName(templateExpense.month);
        const previousAmount = getRegularAmountForPeriod(template, effectiveYear, effectiveMonth);
        const nextEntry = {
          effectiveYear,
          effectiveMonth,
          amount: templateExpense.amount,
          previousAmount,
          changedAt: new Date().toISOString(),
        };

        const nextHistory = (template.history ?? []).filter(
          (entry) =>
            !(
              entry.effectiveYear === effectiveYear &&
              normalizeMonthName(entry.effectiveMonth) === effectiveMonth
            ),
        );

        return {
          ...template,
          title: templateExpense.title,
          category: templateExpense.category,
          cadence: templateExpense.cadence,
          frequency: updates.frequency,
          dayOfMonth: String(updates.dayOfMonth),
          month: updates.month,
          owner: normalizedOwner,
          payer: normalizedPayer,
          history: [...nextHistory, nextEntry].sort(
            (left, right) =>
              getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
              getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
          ),
        };
      });
    })();

    await commitSnapshot({
      members: nextMembers,
      categories: snapshot.categories,
      regularExpenses: nextRegularExpenses,
    });

    setSelectedExpense(null);
    setModalMode("details");
  };

  const handleCreateCategory = async (category) => {
    const snapshot = latestSnapshotRef.current;
    await commitSnapshot({
      members: snapshot.members,
      categories: [...snapshot.categories, category],
      regularExpenses: snapshot.regularExpenses,
    });
  };

  const handleUpdateCategory = async (previousCategory, nextCategory) => {
    const snapshot = latestSnapshotRef.current;
    const nextCategories = snapshot.categories.map((category) =>
      category.id === previousCategory.id ? nextCategory : category,
    );
    const nextMembers = snapshot.members.map((member) => ({
        ...member,
        expenses: member.expenses.map((expense) =>
          expense.category !== previousCategory.label
            ? expense
            : {
                ...expense,
                category: nextCategory.label,
              },
        ),
      }));
    const nextRegularExpenses = snapshot.regularExpenses.map((template) =>
        template.category !== previousCategory.label
          ? template
          : {
              ...template,
              category: nextCategory.label,
            },
      );

    await commitSnapshot({
      members: nextMembers,
      categories: nextCategories,
      regularExpenses: nextRegularExpenses,
    });
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const snapshot = latestSnapshotRef.current;
    await commitSnapshot({
      members: snapshot.members,
      categories: snapshot.categories.filter((category) => category.id !== categoryToDelete.id),
      regularExpenses: snapshot.regularExpenses,
    });
  };

  const handleSaveCategory = async (previousCategory, nextCategory, usageCount) => {
    if (!previousCategory) {
      await handleCreateCategory(nextCategory);
      setCategoryEditorState(null);
      return;
    }

    if (usageCount > 0 && (previousCategory.icon !== nextCategory.icon || previousCategory.label !== nextCategory.label)) {
      setCategoryConfirmState({
        title: "Изменить категорию?",
        description: `Категория используется в ${usageCount} местах. Изменение повлияет на существующие траты и аналитику.`,
        onConfirm: async () => {
          await handleUpdateCategory(previousCategory, nextCategory);
          setCategoryConfirmState(null);
          setCategoryEditorState(null);
        },
      });
      return;
    }

    await handleUpdateCategory(previousCategory, nextCategory);
    setCategoryEditorState(null);
  };

  const handleRequestDeleteCategory = (category, usageCount) => {
    if (usageCount > 0) {
      setCategoryConfirmState({
        title: "Удалить категорию?",
        description: `Категория используется в ${usageCount} местах. Удаление может повредить подсчётам в аналитике.`,
        onConfirm: async () => {
          await handleDeleteCategory(category);
          setCategoryConfirmState(null);
        },
      });
      return;
    }

    void handleDeleteCategory(category);
  };

  const handleToggleYear = (year) => {
    setExpandedYears((current) => ({ ...current, [year]: !current[year] }));
  };

  const handleAddYear = () => {
    const fallbackCurrentYear = getCurrentMonthContext().year;
    const nextYear = trackedYears.length ? Math.max(...trackedYears) + 1 : fallbackCurrentYear;
    setTrackedYears((current) => {
      return current.includes(nextYear) ? current : [nextYear, ...current];
    });
    setExpandedYears((current) => ({ ...current, [nextYear]: true }));
  };

  const handleDeleteYear = (year) => {
    setYearConfirmState({
      title: "Удалить год?",
      description: `Вы уверены, что хотите удалить ${year} год из списка месяцев?`,
      onConfirm: () => {
        setTrackedYears((current) => current.filter((item) => item !== year));
        setExpandedYears((current) => {
          const next = { ...current };
          delete next[year];
          return next;
        });
        setYearConfirmState(null);
      },
    });
  };

  const handleResetBudgetData = async () => {
    const nextCurrentYear = getCurrentMonthContext().year;
    await commitSnapshot({
      members: createEmptyMembers(),
      categories: createDefaultCategories(),
      regularExpenses: [],
    });
    setTrackedYears(getDefaultTrackedYears(nextCurrentYear));
    setExpandedYears(getDefaultExpandedYears(nextCurrentYear));
    setSelectedPeriodContext(null);
    setCurrentScreen("months");
  };

  const handleSaveRegularExpense = async (previousTemplate, updates) => {
    const snapshot = latestSnapshotRef.current;
    const changedAt = new Date().toISOString();
    const nextEffectiveContext = getNextMonthContext(currentMonthContext);
    const normalizedPayer = normalizePayerName(updates.payer);
    const normalizedOwner = normalizeOwnerName(updates.owner, normalizedPayer);

    if (!previousTemplate) {
      const nextSourceExpenseId = `series-expense-${Date.now()}`;
      const nextTemplateId = `regular-${Date.now()}`;
      const nextTemplate = {
        id: nextTemplateId,
        sourceExpenseId: nextSourceExpenseId,
        title: updates.title,
        category: updates.category,
        cadence: updates.cadence,
        frequency: updates.frequency,
        dayOfMonth: updates.dayOfMonth,
        month: updates.month,
        owner: normalizedOwner,
        payer: normalizedPayer,
        isActive: true,
        sortOrder: snapshot.regularExpenses.length,
        history: [
          {
            effectiveYear: currentMonthContext.year,
            effectiveMonth: currentMonthContext.monthName,
            amount: updates.amount,
            previousAmount: updates.amount,
            changedAt,
          },
        ],
      };

      const nextRegularExpenses = [...snapshot.regularExpenses, nextTemplate];
      let nextMembers = snapshot.members;

      if (doesRegularTemplateApplyToMonth(nextTemplate, currentMonthContext)) {
        const ownerName = normalizedOwner;
        const currentMonthExpense = {
          id: nextSourceExpenseId,
          title: updates.title,
          amount: updates.amount,
          cadence: updates.cadence,
          category: updates.category,
          owner: ownerName,
          payer: normalizedPayer,
          month: monthOptions[currentMonthContext.monthIndex],
          year: currentMonthContext.year,
          frequency: updates.frequency,
          dayOfMonth: updates.dayOfMonth,
          completed: false,
          urgent: false,
          dueLabel: buildDueLabel({
            frequency: updates.frequency,
            dayOfMonth: updates.dayOfMonth,
            month: monthOptions[currentMonthContext.monthIndex],
            urgent: false,
            completed: false,
          }),
        };

        nextMembers = snapshot.members.map((member) =>
            member.name !== ownerName
              ? member
              : {
                  ...member,
                  expenses: [...member.expenses, currentMonthExpense],
                },
          );
      }

      await commitSnapshot({
        members: nextMembers,
        categories: snapshot.categories,
        regularExpenses: nextRegularExpenses,
      });

      setRegularEditorState(null);
      return;
    }

    const nextRegularExpenses = snapshot.regularExpenses.map((template) => {
        if (template.id !== previousTemplate.id) {
          return template;
        }

        const currentAmount = getRegularAmountForPeriod(
          previousTemplate,
          currentMonthContext.year,
          currentMonthContext.monthName,
        );

        let nextHistory = [...(template.history ?? [])];
        if (updates.amount !== currentAmount) {
          const nextPeriodKey = getPeriodOrderKey(nextEffectiveContext.year, nextEffectiveContext.monthName);
          const existingIndex = nextHistory.findIndex(
            (entry) => getPeriodOrderKey(entry.effectiveYear, entry.effectiveMonth) === nextPeriodKey,
          );
          const nextEntry = {
            effectiveYear: nextEffectiveContext.year,
            effectiveMonth: nextEffectiveContext.monthName,
            amount: updates.amount,
            previousAmount: currentAmount,
            changedAt,
          };

          if (existingIndex >= 0) {
            nextHistory[existingIndex] = nextEntry;
          } else {
            nextHistory.push(nextEntry);
          }
        }

        return {
          ...template,
          title: updates.title,
          category: updates.category,
          cadence: updates.cadence,
          frequency: updates.frequency,
          dayOfMonth: updates.dayOfMonth,
          month: updates.month,
          owner: normalizedOwner,
          payer: normalizedPayer,
          history: nextHistory,
        };
      });

    await commitSnapshot({
      members: snapshot.members,
      categories: snapshot.categories,
      regularExpenses: nextRegularExpenses,
    });

    setRegularEditorState(null);
  };

  const handleRequestDeleteRegularExpense = (template) => {
    setRegularConfirmState({
      title: "Удалить шаблон регулярной траты?",
      description: `Шаблон "${template.title}" исчезнет из будущих месяцев. Уже созданный текущий месяц при этом не изменится.`,
      onConfirm: async () => {
        const snapshot = latestSnapshotRef.current;
        await commitSnapshot({
          members: snapshot.members,
          categories: snapshot.categories,
          regularExpenses: snapshot.regularExpenses.filter((item) => item.id !== template.id),
        });
        setRegularConfirmState(null);
      },
    });
  };

  const handleCreateRegularExpense = (defaults = null) => {
    setRegularEditorState({
      template: null,
      defaults,
    });
  };

  const handleOpenRegularTemplateDetails = (template) => {
    setSelectedRegularTemplate(template);
  };

  const handleOpenTemplateFromProjected = (templateId) => {
    const matchedTemplate = regularExpenses.find((template) => template.id === templateId);
    if (!matchedTemplate) {
      return;
    }

    setSelectedRegularTemplate(matchedTemplate);
  };

  const handleOpenProjectedExpenseDetails = (expense) => {
    if (!expense?.sourceMember) {
      return;
    }

    setSelectedExpense({ member: expense.sourceMember, expense });
    setModalMode("details");
  };

  const handleEditProjectedExpense = (expense) => {
    if (!expense?.sourceMember) {
      return;
    }

    setSelectedExpense({ member: expense.sourceMember, expense });
    setModalMode("edit");
  };

  const handleCreateRegularExpenseFromGroup = (owner, frequency) => {
    handleCreateRegularExpense({
      owner,
      payer: owner === "Общее" ? "" : owner,
      frequency,
      month: nextMonthContext.monthShort,
    });
  };

  const handleOpenPeriodMonth = (month) => {
    const monthContext = buildMonthContext(month.year, month.name);

    if (month.isCurrent) {
      setSelectedPeriodContext(null);
      setCurrentScreen("month");
      return;
    }

    setSelectedPeriodContext(monthContext);
    setCurrentScreen("periodMonth");
  };

  return (
    <>
      <main
        className={
          selectedExpense ||
          selectedRegularTemplate ||
          categoryEditorState ||
          categoryConfirmState ||
          yearConfirmState ||
          regularEditorState ||
          regularConfirmState ||
          resetConfirmState
            ? "app-shell modal-open"
            : "app-shell"
        }
      >
        <div className="mobile-topbar">
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label={mobileNavOpen ? "Закрыть навигацию" : "Открыть навигацию"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="mobile-topbar-title">{currentNavigationLabel}</div>
          <div className="mobile-topbar-brand" aria-hidden="true">
            <span className="brand-accent" />
          </div>
        </div>

        <aside className="sidebar">
          <div className="brand-mark">
            <span className="brand-accent" />
            Family Budget
          </div>
          <NavigationMenu
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            selectedPeriodContext={selectedPeriodContext}
          />
          {authSession ? (
            <SessionCard
              user={authUser}
              onSignOut={handleSignOut}
              isPending={authPending}
            />
          ) : null}
        </aside>

        <section ref={contentRef} className="content">
          {currentScreen === "month" ? (
            <>
              <header className="page-header">
                <p className="eyebrow">Семейный бюджет</p>
                <h1>Выполнение текущего месяца</h1>
                <p className="page-note">
                  Отмечайте обязательные траты чекбоксами, чтобы ничего не забыть и видеть реальный
                  прогресс месяца.
                </p>
              </header>

              <div className="dashboard-grid">
                <MonthOverviewCard
                  monthLabel={currentMonthLabel}
                  monthMeta={currentMonthMeta}
                  budget={currentMonthTotals.budget}
                  paid={currentMonthTotals.paid}
                />

                <CategoryBreakdownCard items={categoryBreakdown} total={currentMonthTotals.budget} />
              </div>

              <div className="members-grid">
                {dashboardMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    categories={categories}
                    onToggleExpense={handleToggleExpense}
                    onAddExpense={handleAddExpense}
                    onOpenExpense={(selectedMember, expense) => {
                      setSelectedExpense({ member: selectedMember, expense });
                      setModalMode("details");
                    }}
                    onEditExpense={(selectedMember, expense) => {
                      setSelectedExpense({ member: selectedMember, expense });
                      setModalMode("edit");
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          {currentScreen === "settings" ? (
            <SettingsScreen
              onOpenCategories={() => setCurrentScreen("categories")}
              onRequestReset={() =>
                setResetConfirmState({
                  title: "Очистить тестовые данные?",
                  description:
                    "Мы удалим все текущие траты, будущие планы и регулярные шаблоны этого household. Категории вернутся к базовому набору, чтобы можно было сразу продолжать тестирование.",
                  onConfirm: async () => {
                    await handleResetBudgetData();
                    setResetConfirmState(null);
                  },
                })
              }
            />
          ) : null}

          {currentScreen === "nextMonth" ? (
            <NextMonthBudgetScreen
              monthLabel={nextMonthLabel}
              monthMeta={nextMonthMeta}
              totals={nextMonthTotals}
              categoryBreakdown={nextMonthCategoryBreakdown}
              members={nextMonthMembers}
              categories={categories}
              onOpenTemplate={handleOpenTemplateFromProjected}
              onOpenExpense={handleOpenProjectedExpenseDetails}
              onEditExpense={handleEditProjectedExpense}
              onAddExpense={handleAddProjectedExpense}
            />
          ) : null}

          {currentScreen === "periodMonth" && selectedPeriodContext ? (
            <NextMonthBudgetScreen
              title={`Бюджет ${selectedPeriodContext.monthName.toLowerCase()} ${selectedPeriodContext.year}`}
              note={
                selectedPeriodIsFuture
                  ? "Этот экран показывает, как выбранный месяц собирается из регулярных шаблонов. Здесь можно заранее увидеть будущую нагрузку по бюджету."
                  : "Этот экран показывает фактическое наполнение выбранного месяца и позволяет вернуться к уже созданным тратам."
              }
              breadcrumbs={[
                {
                  label: "Бюджет",
                  onClick: () => {
                    setSelectedPeriodContext(null);
                    setCurrentScreen("months");
                  },
                },
                {
                  label: formatMonthYearLabel(selectedPeriodContext.monthName, selectedPeriodContext.year),
                  current: true,
                },
              ]}
              monthLabel={formatMonthYearLabel(selectedPeriodContext.monthName, selectedPeriodContext.year)}
              monthMeta={getMonthMetaByName(selectedPeriodContext.monthName)}
              totals={selectedPeriodTotals}
              categoryBreakdown={selectedPeriodCategoryBreakdown}
              members={selectedPeriodMembers}
              categories={categories}
              onOpenTemplate={handleOpenTemplateFromProjected}
              onOpenExpense={handleOpenProjectedExpenseDetails}
              onEditExpense={handleEditProjectedExpense}
              onAddExpense={handleAddProjectedExpense}
            />
          ) : null}

          {currentScreen === "regular" ? (
            <RegularExpensesScreen
              regularExpenses={regularExpenses}
              categories={categories}
              currentMonthContext={currentMonthContext}
              summary={regularSummary}
              onCreate={() => handleCreateRegularExpense()}
              onCreateInGroup={handleCreateRegularExpenseFromGroup}
              onOpen={handleOpenRegularTemplateDetails}
              onEdit={(template) => setRegularEditorState({ template })}
              onDelete={handleRequestDeleteRegularExpense}
            />
          ) : null}

          {currentScreen === "months" ? (
            <MonthsScreen
              yearCards={yearCards}
              expandedYears={expandedYears}
              onToggleYear={handleToggleYear}
              onDeleteYear={handleDeleteYear}
              onAddYear={handleAddYear}
              onCreateExpense={handleCreateExpenseFromBudgetHub}
              onOpenCurrentMonth={() => setCurrentScreen("month")}
              onOpenNextMonth={() => {
                setSelectedPeriodContext(null);
                setCurrentScreen("nextMonth");
              }}
              onOpenRegular={() => setCurrentScreen("regular")}
              onOpenMonth={handleOpenPeriodMonth}
            />
          ) : null}

          {currentScreen === "categories" ? (
            <CategorySettingsScreen
              categories={categories}
              members={members}
              regularExpenses={regularExpenses}
              onBackToSettings={() => setCurrentScreen("settings")}
              onOpenCreate={() => setCategoryEditorState({ mode: "create", category: null })}
              onOpenEdit={(category) => setCategoryEditorState({ mode: "edit", category })}
              onRequestDelete={handleRequestDeleteCategory}
            />
          ) : null}
        </section>
      </main>

      <div
        className={mobileNavOpen ? "mobile-nav-overlay open" : "mobile-nav-overlay"}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={mobileNavOpen ? "false" : "true"}
      >
        <div
          className="mobile-nav-sheet"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mobile-nav-head">
            <div className="brand-mark mobile-nav-brand">
              <span className="brand-accent" />
              Family Budget
            </div>
            <button
              className="mobile-nav-close"
              type="button"
              aria-label="Закрыть навигацию"
              onClick={() => setMobileNavOpen(false)}
            >
              ×
            </button>
          </div>
          <NavigationMenu
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            selectedPeriodContext={selectedPeriodContext}
          />
          {authSession ? (
            <SessionCard
              user={authUser}
              onSignOut={handleSignOut}
              isPending={authPending}
            />
          ) : null}
        </div>
      </div>

      {selectedExpense ? (
        modalMode === "details" ? (
          <ExpenseDetailsModal
            item={selectedExpense}
            categories={categories}
            onClose={() => setSelectedExpense(null)}
            onEdit={() => setModalMode("edit")}
            onDelete={handleDeleteExpense}
          />
        ) : (
          <ExpenseEditorModal
            item={selectedExpense}
            categories={categories}
            onSave={handleSaveExpense}
            onClose={() => {
              setSelectedExpense(null);
              setModalMode("details");
            }}
          />
        )
      ) : null}

      {selectedRegularTemplate ? (
        <RegularExpenseDetailsModal
          template={selectedRegularTemplate}
          categories={categories}
          onClose={() => setSelectedRegularTemplate(null)}
          onEdit={() => {
            setRegularEditorState({ template: selectedRegularTemplate });
            setSelectedRegularTemplate(null);
          }}
          onDelete={() => {
            handleRequestDeleteRegularExpense(selectedRegularTemplate);
            setSelectedRegularTemplate(null);
          }}
        />
      ) : null}

      {categoryEditorState ? (
        <CategoryEditorModal
          category={categoryEditorState.category}
          members={members}
          categoriesCount={categories.length}
          onClose={() => setCategoryEditorState(null)}
          onSave={handleSaveCategory}
        />
      ) : null}

      {categoryConfirmState ? (
        <CategoryConfirmModal
          title={categoryConfirmState.title}
          description={categoryConfirmState.description}
          onClose={() => setCategoryConfirmState(null)}
          onConfirm={categoryConfirmState.onConfirm}
        />
      ) : null}

      {yearConfirmState ? (
        <CategoryConfirmModal
          title={yearConfirmState.title}
          description={yearConfirmState.description}
          onClose={() => setYearConfirmState(null)}
          onConfirm={yearConfirmState.onConfirm}
        />
      ) : null}

      {regularEditorState ? (
        <RegularExpenseEditorModal
          template={regularEditorState.template}
          defaults={regularEditorState.defaults}
          categories={categories}
          currentMonthContext={currentMonthContext}
          onClose={() => setRegularEditorState(null)}
          onSave={handleSaveRegularExpense}
        />
      ) : null}

      {regularConfirmState ? (
        <CategoryConfirmModal
          title={regularConfirmState.title}
          description={regularConfirmState.description}
          onClose={() => setRegularConfirmState(null)}
          onConfirm={regularConfirmState.onConfirm}
        />
      ) : null}

      {resetConfirmState ? (
        <CategoryConfirmModal
          title={resetConfirmState.title}
          description={resetConfirmState.description}
          onClose={() => setResetConfirmState(null)}
          onConfirm={resetConfirmState.onConfirm}
        />
      ) : null}
    </>
  );
}
