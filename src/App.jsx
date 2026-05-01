import { useEffect, useRef, useMemo, useState } from "react";
import { getAuthRedirectUrl, isSupabaseConfigured, requireSupabase } from "./lib/supabase";

const navigationItems = [
  "Бюджет",
  "Денежный поток",
  "Доходы",
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
  "cashflow",
  "incomes",
  "analytics",
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
const CASHFLOW_STORAGE_KEY = "family-budget-prototype-cashflow-v1";
const STORAGE_RESET_KEY = "family-budget-prototype-storage-reset-v1";
const TRACKED_YEARS_STORAGE_KEY = "family-budget-prototype-tracked-years-v1";
const EXPANDED_YEARS_STORAGE_KEY = "family-budget-prototype-expanded-years-v1";
const DEFAULT_HOUSEHOLD_NAME = "Family Budget";
const DEFAULT_CASHFLOW_CURRENCY = "CZK";
const cashflowCurrencyOptions = ["CZK", "EUR", "USD", "RUB"];
const cashflowAccountTypeOptions = [
  { value: "bank", label: "Банк" },
  { value: "cash", label: "Наличные" },
  { value: "broker", label: "Брокер" },
  { value: "other", label: "Другое" },
];
const cashflowAssetTypeOptions = [
  { value: "cash", label: "Наличные" },
  { value: "bank_account", label: "Банковский счёт" },
  { value: "stocks", label: "Акции" },
  { value: "sber_account", label: "Сбер. счет" },
  { value: "crypto", label: "Крипто" },
  { value: "metals", label: "Металлы" },
  { value: "other", label: "Другое" },
];
const cashflowIncomeOwnerOptions = [
  { value: "roma", label: "Рома" },
  { value: "sasha", label: "Саша" },
  { value: "shared", label: "Общее" },
];
const cashflowIncomeTypeOptions = [
  { value: "salary", label: "Зарплата" },
  { value: "bonus", label: "Бонус" },
  { value: "refund", label: "Возврат" },
  { value: "gift", label: "Подарок" },
  { value: "other", label: "Другое" },
];
const cashflowIncomeStatusOptions = [
  { value: "expected", label: "Ожидается" },
  { value: "received", label: "Получено" },
];
const cashflowTargetModeOptions = [
  { value: "manual", label: "Вручную" },
  { value: "auto_average_mandatory_budget", label: "Авто от регулярных трат" },
];
const cashflowFundTypeMeta = {
  budget_reserve: { label: "Бюджетная кубышка", icon: "🪙" },
  emergency_reserve: { label: "Сейф безопасности", icon: "🛟" },
  investments: { label: "Инвестиции", icon: "📈" },
  savings_goal: { label: "Накопления", icon: "🎯" },
  free_balance: { label: "Свободный остаток", icon: "💵" },
};
const cashflowSystemFundTypes = [
  "budget_reserve",
  "emergency_reserve",
  "investments",
  "savings_goal",
  "free_balance",
];

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

function parseSqlDateParts(sqlDate) {
  const raw = String(sqlDate ?? "");
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const [year, month, day] = datePart.split("-").map((item) => Number(item));

  return {
    year: Number.isFinite(year) ? year : 0,
    month: Number.isFinite(month) ? month : 0,
    day: Number.isFinite(day) ? day : 0,
  };
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
  const initialEffectiveContext = getInitialRegularEffectiveContext({
    seedYear: expenseYear,
    seedMonthName: monthName,
    dayOfMonth: getExpenseDayOfMonth(expense),
    frequency: detectFrequency(expense),
  });

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
        effectiveYear: initialEffectiveContext.year,
        effectiveMonth: initialEffectiveContext.monthName,
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

function shiftMonthContext(context, monthOffset) {
  const monthIndex = context.monthIndex + monthOffset;
  const yearOffset = Math.floor(monthIndex / 12);
  const normalizedMonthIndex = ((monthIndex % 12) + 12) % 12;

  return {
    monthIndex: normalizedMonthIndex,
    monthName: fullMonthNames[normalizedMonthIndex],
    monthShort: monthOptions[normalizedMonthIndex],
    year: context.year + yearOffset,
  };
}

function getTodaySqlDate() {
  const now = new Date();
  return buildSqlDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function getCashflowSystemFundLabel(fundType) {
  return cashflowFundTypeMeta[fundType]?.label ?? fundType;
}

function getCashflowFundIcon(fundType) {
  return cashflowFundTypeMeta[fundType]?.icon ?? "💼";
}

function getCashflowOwnerLabel(owner) {
  return cashflowIncomeOwnerOptions.find((option) => option.value === owner)?.label ?? owner;
}

function getCashflowIncomeTypeLabel(type) {
  return cashflowIncomeTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function createDefaultCashflowFunds(baseCurrency = DEFAULT_CASHFLOW_CURRENCY) {
  return cashflowSystemFundTypes.map((fundType) => ({
    id: `system-${fundType}`,
    name: getCashflowSystemFundLabel(fundType),
    fundType,
    targetMode:
      fundType === "budget_reserve" || fundType === "emergency_reserve"
        ? "auto_average_mandatory_budget"
        : "manual",
    targetMultiplier: fundType === "budget_reserve" ? 2 : fundType === "emergency_reserve" ? 3 : 0,
    manualTargetAmount: null,
    currency: baseCurrency,
    isSystem: true,
    isActive: true,
  }));
}

function createDefaultCashflowSettings(baseCurrency = DEFAULT_CASHFLOW_CURRENCY) {
  return {
    id: "cashflow-settings-default",
    budgetReserveMonthsMultiplier: 2,
    emergencyReserveMonthsMultiplier: 3,
    mandatoryBudgetAverageMonths: 6,
    budgetReserveManualTarget: null,
    emergencyReserveManualTarget: null,
    baseCurrency,
    receivedIncomeLabel: "Получено доходов",
    budgetReservePriorityLabel: "Перевести в бюджетную кубышку",
    emergencyReservePriorityLabel: "Пополнить сейф безопасности",
    investmentsPriorityLabel: "Можно направить в инвестиции и цели",
  };
}

function normalizeCashflowAccount(account, index = 0) {
  if (!account) {
    return null;
  }

  return {
    id: account.id ?? `cashflow-account-${index}`,
    name: String(account.name ?? "").trim(),
    owner: account.owner ?? "shared",
    accountType: account.accountType ?? account.account_type ?? "bank",
    defaultCurrency: account.defaultCurrency ?? account.default_currency ?? DEFAULT_CASHFLOW_CURRENCY,
    isActive: account.isActive ?? account.is_active ?? true,
    createdAt: account.createdAt ?? account.created_at ?? null,
  };
}

function normalizeCashflowFund(fund, index = 0) {
  if (!fund) {
    return null;
  }

  return {
    id: fund.id ?? `cashflow-fund-${index}`,
    name: String(fund.name ?? "").trim(),
    fundType: fund.fundType ?? fund.fund_type ?? "free_balance",
    targetMode: fund.targetMode ?? fund.target_mode ?? "manual",
    targetMultiplier: Number(fund.targetMultiplier ?? fund.target_multiplier ?? 0),
    manualTargetAmount:
      fund.manualTargetAmount === null || fund.manualTargetAmount === undefined
        ? null
        : Number(fund.manualTargetAmount ?? fund.manual_target_amount),
    currency: fund.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    isSystem: fund.isSystem ?? fund.is_system ?? false,
    isActive: fund.isActive ?? fund.is_active ?? true,
    createdAt: fund.createdAt ?? fund.created_at ?? null,
  };
}

function normalizeCashflowSnapshot(snapshot, index = 0) {
  if (!snapshot) {
    return null;
  }

  return {
    id: snapshot.id ?? `cashflow-snapshot-${index}`,
    accountId: snapshot.accountId ?? snapshot.account_id ?? "",
    fundId: snapshot.fundId ?? snapshot.fund_id ?? "",
    snapshotDate: snapshot.snapshotDate ?? snapshot.snapshot_date ?? getTodaySqlDate(),
    amount: Number(snapshot.amount ?? 0),
    currency: snapshot.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    amountCzk: Number(snapshot.amountCzk ?? snapshot.amount_czk ?? 0),
    exchangeRateToCzk: Number(snapshot.exchangeRateToCzk ?? snapshot.exchange_rate_to_czk ?? 1),
    assetType: snapshot.assetType ?? snapshot.asset_type ?? "bank_account",
    owner: snapshot.owner ?? "shared",
    createdAt: snapshot.createdAt ?? snapshot.created_at ?? null,
  };
}

function normalizeCashflowIncomeEvent(event, index = 0) {
  if (!event) {
    return null;
  }

  return {
    id: event.id ?? `cashflow-income-${index}`,
    incomeDate: event.incomeDate ?? event.income_date ?? getTodaySqlDate(),
    owner: event.owner ?? "shared",
    incomeType: event.incomeType ?? event.income_type ?? "salary",
    status: event.status ?? "expected",
    expectedAmount: Number(event.expectedAmount ?? event.expected_amount ?? 0),
    actualAmount: Number(event.actualAmount ?? event.actual_amount ?? 0),
    currency: event.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    amountCzk: Number(event.amountCzk ?? event.amount_czk ?? 0),
    exchangeRateToCzk: Number(event.exchangeRateToCzk ?? event.exchange_rate_to_czk ?? 1),
    note: event.note ?? "",
    createdAt: event.createdAt ?? event.created_at ?? null,
  };
}

function normalizeCashflowSettings(settings) {
  if (!settings) {
    return createDefaultCashflowSettings();
  }

  return {
    id: settings.id ?? "cashflow-settings-default",
    budgetReserveMonthsMultiplier: Number(
      settings.budgetReserveMonthsMultiplier ?? settings.budget_reserve_months_multiplier ?? 2,
    ),
    emergencyReserveMonthsMultiplier: Number(
      settings.emergencyReserveMonthsMultiplier ?? settings.emergency_reserve_months_multiplier ?? 3,
    ),
    mandatoryBudgetAverageMonths: Number(
      settings.mandatoryBudgetAverageMonths ?? settings.mandatory_budget_average_months ?? 6,
    ),
    budgetReserveManualTarget:
      settings.budgetReserveManualTarget === null || settings.budgetReserveManualTarget === undefined
        ? null
        : Number(settings.budgetReserveManualTarget ?? settings.budget_reserve_manual_target),
    emergencyReserveManualTarget:
      settings.emergencyReserveManualTarget === null || settings.emergencyReserveManualTarget === undefined
        ? null
        : Number(settings.emergencyReserveManualTarget ?? settings.emergency_reserve_manual_target),
    baseCurrency: settings.baseCurrency ?? settings.base_currency ?? DEFAULT_CASHFLOW_CURRENCY,
    receivedIncomeLabel:
      settings.receivedIncomeLabel ?? settings.received_income_label ?? "Получено доходов",
    budgetReservePriorityLabel:
      settings.budgetReservePriorityLabel ??
      settings.budget_reserve_priority_label ??
      "Перевести в бюджетную кубышку",
    emergencyReservePriorityLabel:
      settings.emergencyReservePriorityLabel ??
      settings.emergency_reserve_priority_label ??
      "Пополнить сейф безопасности",
    investmentsPriorityLabel:
      settings.investmentsPriorityLabel ??
      settings.investments_priority_label ??
      "Можно направить в инвестиции и цели",
  };
}

function normalizeCashflowState(state) {
  const settings = normalizeCashflowSettings(state?.settings);
  const funds = (state?.funds ?? createDefaultCashflowFunds(settings.baseCurrency))
    .map(normalizeCashflowFund)
    .filter(Boolean);

  cashflowSystemFundTypes.forEach((fundType) => {
    if (!funds.some((fund) => fund.fundType === fundType)) {
      funds.push(
        normalizeCashflowFund(
          createDefaultCashflowFunds(settings.baseCurrency).find((fund) => fund.fundType === fundType),
        ),
      );
    }
  });

  return {
    accounts: (state?.accounts ?? []).map(normalizeCashflowAccount).filter(Boolean),
    funds,
    snapshots: (state?.snapshots ?? []).map(normalizeCashflowSnapshot).filter(Boolean),
    incomeEvents: (state?.incomeEvents ?? []).map(normalizeCashflowIncomeEvent).filter(Boolean),
    settings,
  };
}

function getInitialCashflowState() {
  if (typeof window === "undefined" || isSupabaseConfigured) {
    return normalizeCashflowState({
      accounts: [],
      funds: createDefaultCashflowFunds(),
      snapshots: [],
      incomeEvents: [],
      settings: createDefaultCashflowSettings(),
    });
  }

  try {
    const saved = window.localStorage.getItem(CASHFLOW_STORAGE_KEY);
    if (saved) {
      return normalizeCashflowState(JSON.parse(saved));
    }
  } catch {
    // ignore
  }

  return normalizeCashflowState({
    accounts: [],
    funds: createDefaultCashflowFunds(),
    snapshots: [],
    incomeEvents: [],
    settings: createDefaultCashflowSettings(),
  });
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

async function ensureCashflowDefaultsInSupabase(householdId) {
  const supabase = requireSupabase();
  const { data: existingFunds, error: existingFundsError } = await supabase
    .from("cashflow_funds")
    .select("id, fund_type")
    .eq("household_id", householdId);

  if (existingFundsError) {
    throw existingFundsError;
  }

  const existingFundTypes = new Set((existingFunds ?? []).map((fund) => fund.fund_type));
  const defaultFunds = createDefaultCashflowFunds()
    .filter((fund) => !existingFundTypes.has(fund.fundType))
    .map((fund) => ({
      household_id: householdId,
      name: fund.name,
      fund_type: fund.fundType,
      target_mode: fund.targetMode,
      target_multiplier: fund.targetMultiplier,
      manual_target_amount: fund.manualTargetAmount,
      currency: fund.currency,
      is_system: fund.isSystem,
      is_active: fund.isActive,
    }));

  if (defaultFunds.length) {
    const { error: insertFundsError } = await supabase.from("cashflow_funds").insert(defaultFunds);
    if (insertFundsError) {
      throw insertFundsError;
    }
  }

  const { data: existingSettings, error: settingsError } = await supabase
    .from("cashflow_settings")
    .select("id")
    .eq("household_id", householdId)
    .maybeSingle();

  if (settingsError) {
    throw settingsError;
  }

  if (!existingSettings) {
    const settings = createDefaultCashflowSettings();
    const { error: insertSettingsError } = await supabase.from("cashflow_settings").insert({
      household_id: householdId,
      budget_reserve_months_multiplier: settings.budgetReserveMonthsMultiplier,
      emergency_reserve_months_multiplier: settings.emergencyReserveMonthsMultiplier,
      mandatory_budget_average_months: settings.mandatoryBudgetAverageMonths,
      budget_reserve_manual_target: settings.budgetReserveManualTarget,
      emergency_reserve_manual_target: settings.emergencyReserveManualTarget,
      base_currency: settings.baseCurrency,
      received_income_label: settings.receivedIncomeLabel,
      budget_reserve_priority_label: settings.budgetReservePriorityLabel,
      emergency_reserve_priority_label: settings.emergencyReservePriorityLabel,
      investments_priority_label: settings.investmentsPriorityLabel,
    });

    if (insertSettingsError) {
      throw insertSettingsError;
    }
  }
}

async function loadCashflowStateFromSupabase(householdId) {
  const supabase = requireSupabase();
  await ensureCashflowDefaultsInSupabase(householdId);

  const [
    { data: accounts, error: accountsError },
    { data: funds, error: fundsError },
    { data: snapshots, error: snapshotsError },
    { data: incomeEvents, error: incomeEventsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase.from("cashflow_accounts").select("*").eq("household_id", householdId).order("created_at", { ascending: true }),
    supabase.from("cashflow_funds").select("*").eq("household_id", householdId).order("created_at", { ascending: true }),
    supabase
      .from("cashflow_balance_snapshots")
      .select("*")
      .eq("household_id", householdId)
      .order("snapshot_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("cashflow_income_events")
      .select("*")
      .eq("household_id", householdId)
      .order("income_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("cashflow_settings").select("*").eq("household_id", householdId).maybeSingle(),
  ]);

  if (accountsError) throw accountsError;
  if (fundsError) throw fundsError;
  if (snapshotsError) throw snapshotsError;
  if (incomeEventsError) throw incomeEventsError;
  if (settingsError) throw settingsError;

  return normalizeCashflowState({
    accounts,
    funds,
    snapshots,
    incomeEvents,
    settings,
  });
}

async function saveCashflowSettingsToSupabase({ householdId, settings, funds }) {
  const supabase = requireSupabase();
  const normalizedSettings = normalizeCashflowSettings(settings);

  const { error: settingsError } = await supabase.from("cashflow_settings").upsert(
    {
      household_id: householdId,
      budget_reserve_months_multiplier: normalizedSettings.budgetReserveMonthsMultiplier,
      emergency_reserve_months_multiplier: normalizedSettings.emergencyReserveMonthsMultiplier,
      mandatory_budget_average_months: normalizedSettings.mandatoryBudgetAverageMonths,
      budget_reserve_manual_target: normalizedSettings.budgetReserveManualTarget,
      emergency_reserve_manual_target: normalizedSettings.emergencyReserveManualTarget,
      base_currency: normalizedSettings.baseCurrency,
      received_income_label: normalizedSettings.receivedIncomeLabel,
      budget_reserve_priority_label: normalizedSettings.budgetReservePriorityLabel,
      emergency_reserve_priority_label: normalizedSettings.emergencyReservePriorityLabel,
      investments_priority_label: normalizedSettings.investmentsPriorityLabel,
    },
    { onConflict: "household_id" },
  );

  if (settingsError) {
    throw settingsError;
  }

  for (const fund of funds) {
    const { error: fundError } = await supabase.from("cashflow_funds").update({
      target_mode: fund.targetMode,
      target_multiplier: fund.targetMultiplier,
      manual_target_amount: fund.manualTargetAmount,
      currency: fund.currency,
      is_active: fund.isActive,
      name: fund.name,
    }).eq("id", fund.id);

    if (fundError) {
      throw fundError;
    }
  }
}

async function saveCashflowIncomeEventToSupabase({ householdId, event }) {
  const supabase = requireSupabase();
  const normalizedEvent = normalizeCashflowIncomeEvent(event);

  const payload = {
    household_id: householdId,
    income_date: normalizedEvent.incomeDate,
    owner: normalizedEvent.owner,
    income_type: normalizedEvent.incomeType,
    status: normalizedEvent.status,
    expected_amount: normalizedEvent.expectedAmount,
    actual_amount: normalizedEvent.actualAmount,
    currency: normalizedEvent.currency,
    amount_czk: normalizedEvent.amountCzk,
    exchange_rate_to_czk: normalizedEvent.exchangeRateToCzk,
    note: normalizedEvent.note,
  };

  if (normalizedEvent.id && !String(normalizedEvent.id).startsWith("cashflow-income-")) {
    const { error } = await supabase.from("cashflow_income_events").update(payload).eq("id", normalizedEvent.id);
    if (error) {
      throw error;
    }

    return normalizedEvent.id;
  }

  const { data, error } = await supabase
    .from("cashflow_income_events")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function deleteCashflowIncomeEventFromSupabase(incomeEventId) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("cashflow_income_events").delete().eq("id", incomeEventId);
  if (error) {
    throw error;
  }
}

async function saveCashflowSnapshotToSupabase({ householdId, snapshot, accountDraft, existingAccounts }) {
  const supabase = requireSupabase();
  let accountId = snapshot.accountId;

  if (accountDraft?.name?.trim()) {
    const payload = {
      household_id: householdId,
      name: accountDraft.name.trim(),
      owner: accountDraft.owner,
      account_type: accountDraft.accountType,
      default_currency: accountDraft.defaultCurrency,
      is_active: true,
    };

    if (!accountId) {
      const { data, error } = await supabase
        .from("cashflow_accounts")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      accountId = data.id;
    } else {
      const existingAccount = existingAccounts.find((account) => account.id === accountId);
      const needsAccountUpdate =
        !existingAccount ||
        existingAccount.name !== accountDraft.name.trim() ||
        existingAccount.owner !== accountDraft.owner ||
        existingAccount.accountType !== accountDraft.accountType ||
        existingAccount.defaultCurrency !== accountDraft.defaultCurrency;

      if (needsAccountUpdate) {
        const { error } = await supabase
          .from("cashflow_accounts")
          .update({
            name: accountDraft.name.trim(),
            owner: accountDraft.owner,
            account_type: accountDraft.accountType,
            default_currency: accountDraft.defaultCurrency,
          })
          .eq("id", accountId);

        if (error) {
          throw error;
        }
      }
    }
  }

  const normalizedSnapshot = normalizeCashflowSnapshot({ ...snapshot, accountId });
  const payload = {
    household_id: householdId,
    account_id: normalizedSnapshot.accountId,
    fund_id: normalizedSnapshot.fundId,
    snapshot_date: normalizedSnapshot.snapshotDate,
    amount: normalizedSnapshot.amount,
    currency: normalizedSnapshot.currency,
    amount_czk: normalizedSnapshot.amountCzk,
    exchange_rate_to_czk: normalizedSnapshot.exchangeRateToCzk,
    asset_type: normalizedSnapshot.assetType,
    owner: normalizedSnapshot.owner,
  };

  if (normalizedSnapshot.id && !String(normalizedSnapshot.id).startsWith("cashflow-snapshot-")) {
    const { error } = await supabase
      .from("cashflow_balance_snapshots")
      .update(payload)
      .eq("id", normalizedSnapshot.id);

    if (error) {
      throw error;
    }

    return { snapshotId: normalizedSnapshot.id, accountId };
  }

  const { data, error } = await supabase
    .from("cashflow_balance_snapshots")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { snapshotId: data.id, accountId };
}

async function deleteCashflowSnapshotFromSupabase(snapshotId) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("cashflow_balance_snapshots").delete().eq("id", snapshotId);
  if (error) {
    throw error;
  }
}

async function saveCashflowAccountToSupabase({ householdId, account }) {
  const supabase = requireSupabase();
  const normalizedAccount = normalizeCashflowAccount(account);
  const payload = {
    household_id: householdId,
    name: normalizedAccount.name,
    owner: normalizedAccount.owner,
    account_type: normalizedAccount.accountType,
    default_currency: normalizedAccount.defaultCurrency,
    is_active: normalizedAccount.isActive,
  };

  if (normalizedAccount.id && !String(normalizedAccount.id).startsWith("cashflow-account-")) {
    const { error } = await supabase.from("cashflow_accounts").update(payload).eq("id", normalizedAccount.id);
    if (error) {
      throw error;
    }
    return normalizedAccount.id;
  }

  const { data, error } = await supabase.from("cashflow_accounts").insert(payload).select("id").single();
  if (error) {
    throw error;
  }
  return data.id;
}

async function deleteCashflowAccountFromSupabase(accountId) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("cashflow_accounts").delete().eq("id", accountId);
  if (error) {
    throw error;
  }
}

async function saveCashflowFundToSupabase({ householdId, fund }) {
  const supabase = requireSupabase();
  const normalizedFund = normalizeCashflowFund(fund);
  const payload = {
    household_id: householdId,
    name: normalizedFund.name,
    fund_type: normalizedFund.fundType,
    target_mode: normalizedFund.targetMode,
    target_multiplier: normalizedFund.targetMultiplier,
    manual_target_amount: normalizedFund.manualTargetAmount,
    currency: normalizedFund.currency,
    is_system: normalizedFund.isSystem,
    is_active: normalizedFund.isActive,
  };

  if (normalizedFund.id && !String(normalizedFund.id).startsWith("cashflow-fund-")) {
    const { error } = await supabase.from("cashflow_funds").update(payload).eq("id", normalizedFund.id);
    if (error) {
      throw error;
    }
    return normalizedFund.id;
  }

  const { data, error } = await supabase.from("cashflow_funds").insert(payload).select("id").single();
  if (error) {
    throw error;
  }
  return data.id;
}

async function deleteCashflowFundFromSupabase(fundId) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("cashflow_funds").delete().eq("id", fundId);
  if (error) {
    throw error;
  }
}

function getRegularAmountForPeriod(template, year, monthValue) {
  const targetOrder = getPeriodOrderKey(year, monthValue);
  const sortedHistory = [...(template.history ?? [])].sort(
    (left, right) =>
      getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
      getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
  );

  const firstHistoryOrder = sortedHistory[0]
    ? getPeriodOrderKey(sortedHistory[0].effectiveYear, sortedHistory[0].effectiveMonth)
    : null;

  if (firstHistoryOrder === null || targetOrder < firstHistoryOrder) {
    return 0;
  }

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

  const firstHistory = [...(template.history ?? [])].sort(
    (left, right) =>
      getPeriodOrderKey(left.effectiveYear, left.effectiveMonth) -
      getPeriodOrderKey(right.effectiveYear, right.effectiveMonth),
  )[0];
  const startOrder = firstHistory
    ? getPeriodOrderKey(firstHistory.effectiveYear, firstHistory.effectiveMonth)
    : null;
  const targetOrder = getPeriodOrderKey(monthContext.year, monthContext.monthName);

  if (startOrder !== null && targetOrder < startOrder) {
    return false;
  }

  if (template.frequency === "Раз в год") {
    return normalizeMonthName(template.month) === monthContext.monthName;
  }

  return true;
}

function getInitialRegularEffectiveContext({ seedYear, seedMonthName, dayOfMonth, frequency }) {
  const seedContext = buildMonthContext(seedYear, seedMonthName);
  const currentContext = getCurrentMonthContext();
  const normalizedDay = Number(dayOfMonth || 1);
  const today = new Date();
  const todayDay = today.getDate();
  const isCurrentMonthSeed =
    seedContext.year === currentContext.year && seedContext.monthName === currentContext.monthName;

  if (!isCurrentMonthSeed) {
    return seedContext;
  }

  if (frequency === "Каждый месяц" && normalizedDay < todayDay) {
    return getNextMonthContext(seedContext);
  }

  if (frequency === "Раз в год" && normalizedDay < todayDay) {
    return buildMonthContext(seedContext.year + 1, seedContext.monthName);
  }

  return seedContext;
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

function buildRegularIdentityKey({
  title,
  category,
  owner,
  payer,
  frequency,
  dayOfMonth,
  month,
}) {
  const normalizedFrequency = frequency === "Раз в год" ? "yearly" : "monthly";

  return [
    String(title ?? "").trim().toLowerCase(),
    String(category ?? "").trim().toLowerCase(),
    String(normalizeOwnerName(owner, payer) ?? "").trim().toLowerCase(),
    String(normalizePayerName(payer) ?? "").trim().toLowerCase(),
    normalizedFrequency,
    String(dayOfMonth ?? ""),
    normalizedFrequency === "yearly" ? normalizeMonthName(month) : "",
  ].join("|");
}

function getExpenseRegularIdentityKey(expense) {
  const frequency = expense.frequency ?? detectFrequency(expense);
  if (frequency !== "Каждый месяц" && frequency !== "Раз в год" && !expense.templateId) {
    return null;
  }

  return buildRegularIdentityKey({
    title: expense.title,
    category: expense.category,
    owner: expense.owner,
    payer: getExpensePayer(expense),
    frequency,
    dayOfMonth: getExpenseDayOfMonth(expense),
    month: expense.month,
  });
}

function getTemplateRegularIdentityKey(template) {
  return buildRegularIdentityKey({
    title: template.title,
    category: template.category,
    owner: template.owner,
    payer: template.payer,
    frequency: template.frequency,
    dayOfMonth: template.dayOfMonth,
    month: template.month,
  });
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
  const explicitRegularTemplateIds = new Set(
    actualExpenses
      .map((expense) => expense.templateId)
      .filter(Boolean),
  );
  const explicitRegularIdentityKeys = new Set(
    actualExpenses
      .map((expense) => getExpenseRegularIdentityKey(expense))
      .filter(Boolean),
  );

  return regularExpenses
    .filter((template) => doesRegularTemplateApplyToMonth(template, monthContext))
    .filter((template) => !explicitRegularSourceIds.has(template.sourceExpenseId))
    .filter((template) => !explicitRegularTemplateIds.has(template.id))
    .filter((template) => !explicitRegularIdentityKeys.has(getTemplateRegularIdentityKey(template)))
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
          title: linkedTemplate.title,
          cadence: linkedTemplate.cadence,
          category: linkedTemplate.category,
          owner: linkedTemplate.owner,
          payer: linkedTemplate.payer,
          frequency: linkedTemplate.frequency,
          dayOfMonth: linkedTemplate.dayOfMonth,
          month: linkedTemplate.month,
          dueLabel: buildDueLabel({
            frequency: linkedTemplate.frequency,
            dayOfMonth: linkedTemplate.dayOfMonth,
            month: monthOptions[monthContext.monthIndex],
            urgent: expense.urgent,
            completed: expense.completed,
          }),
          templateId: linkedTemplate.id,
        }
      : expense;
  });
  const projectedRegularExpenses = getProjectedRegularExpensesForMonth({
    regularExpenses,
    monthContext,
    actualExpenses,
  });

  const dedupedExpenses = [];
  const seenRegularKeys = new Set();

  [...actualExpenses, ...projectedRegularExpenses].forEach((expense) => {
    const regularKey =
      expense.templateId
        ? `template:${expense.templateId}`
        : getExpenseRegularIdentityKey(expense);

    if (regularKey) {
      if (seenRegularKeys.has(regularKey)) {
        return;
      }

      seenRegularKeys.add(regularKey);
    }

    dedupedExpenses.push(expense);
  });

  return dedupedExpenses.sort((left, right) => {
    const dayDifference = getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right);
    if (dayDifference !== 0) {
      return dayDifference;
    }

    return left.title.localeCompare(right.title, "ru");
  });
}

function calculateRegularMonthlyReserveBase({ regularExpenses, currentContext }) {
  return Math.round(
    regularExpenses
      .filter((template) => template.isActive !== false)
      .reduce((sum, template) => {
        const amount = Number(getRegularAmountForPeriod(template, currentContext.year, currentContext.monthName) ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
          return sum;
        }

        if (template.frequency === "Раз в год") {
          return sum + amount / 12;
        }

        return sum + amount;
      }, 0),
  );
}

function calculateBudgetReserveTarget({ settings, funds, regularMonthlyReserveBase }) {
  const reserveFund = funds.find((fund) => fund.fundType === "budget_reserve");
  if (!reserveFund) {
    return 0;
  }

  const manualTarget = reserveFund.manualTargetAmount ?? settings.budgetReserveManualTarget;
  if (reserveFund.targetMode === "manual" && manualTarget) {
    return Number(manualTarget);
  }

  const multiplier = reserveFund.targetMultiplier || settings.budgetReserveMonthsMultiplier || 2;
  return Math.round(regularMonthlyReserveBase * multiplier);
}

function calculateEmergencyReserveTarget({ settings, funds, regularMonthlyReserveBase }) {
  const reserveFund = funds.find((fund) => fund.fundType === "emergency_reserve");
  if (!reserveFund) {
    return 0;
  }

  const manualTarget = reserveFund.manualTargetAmount ?? settings.emergencyReserveManualTarget;
  if (reserveFund.targetMode === "manual" && manualTarget) {
    return Number(manualTarget);
  }

  const multiplier = reserveFund.targetMultiplier || settings.emergencyReserveMonthsMultiplier || 3;
  return Math.round(regularMonthlyReserveBase * multiplier);
}

function isSnapshotNewer(candidate, existing) {
  if (!existing) {
    return true;
  }

  const candidateDate = new Date(candidate.snapshotDate).getTime();
  const existingDate = new Date(existing.snapshotDate).getTime();
  if (candidateDate !== existingDate) {
    return candidateDate > existingDate;
  }

  const candidateCreatedAt = candidate.createdAt ? new Date(candidate.createdAt).getTime() : 0;
  const existingCreatedAt = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
  if (candidateCreatedAt !== existingCreatedAt) {
    return candidateCreatedAt > existingCreatedAt;
  }

  return String(candidate.id) > String(existing.id);
}

function getCurrentBalanceEntries({ snapshots, fundId = null }) {
  const latestByBalance = new Map();

  snapshots
    .filter((snapshot) => (fundId ? snapshot.fundId === fundId : true))
    .forEach((snapshot) => {
      const key = `${snapshot.accountId}|${snapshot.fundId}|${snapshot.assetType}`;
      const existing = latestByBalance.get(key);
      if (isSnapshotNewer(snapshot, existing)) {
        latestByBalance.set(key, snapshot);
      }
    });

  return [...latestByBalance.values()].sort((left, right) => {
    const rightDate = new Date(right.snapshotDate).getTime();
    const leftDate = new Date(left.snapshotDate).getTime();
    if (rightDate !== leftDate) {
      return rightDate - leftDate;
    }

    return Number(right.amountCzk ?? 0) - Number(left.amountCzk ?? 0);
  });
}

function formatBalanceEntryCount(count) {
  const remainder10 = count % 10;
  const remainder100 = count % 100;

  if (remainder10 === 1 && remainder100 !== 11) {
    return `${count} баланс`;
  }

  if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 12 || remainder100 > 14)) {
    return `${count} баланса`;
  }

  return `${count} балансов`;
}

function calculateFundCurrentBalance({ fundId, snapshots }) {
  return getCurrentBalanceEntries({ snapshots, fundId }).reduce((sum, snapshot) => sum + Number(snapshot.amountCzk ?? 0), 0);
}

function calculateTotalCapitalCzk({ snapshots }) {
  return getCurrentBalanceEntries({ snapshots }).reduce((sum, snapshot) => sum + Number(snapshot.amountCzk ?? 0), 0);
}

function calculateNextMonthBudgetTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
}

function calculatePayerAllocationFromBudgetItems(expenses) {
  return expenses.reduce(
    (result, expense) => {
      const amount = Number(expense.amount ?? 0);
      if (expense.payer === "Рома") {
        result.roma += amount;
      } else if (expense.payer === "Саша") {
        result.sasha += amount;
      } else {
        result.unassigned += amount;
      }

      return result;
    },
    { roma: 0, sasha: 0, unassigned: 0 },
  );
}

function calculateBudgetReserveReplenishment({ nextMonthBudgetTotal, budgetReserveCurrent }) {
  const fundingAmount = Math.min(budgetReserveCurrent, nextMonthBudgetTotal);
  const deficit = Math.max(nextMonthBudgetTotal - budgetReserveCurrent, 0);

  return {
    fundingAmount,
    replenishmentRequired: fundingAmount,
    deficit,
  };
}

function calculateYearIncomeSummary({ incomeEvents, selectedYear, currentContext, expenseTotal = 0 }) {
  const monthlyMap = new Map();

  incomeEvents.forEach((event) => {
    const eventDate = parseSqlDateParts(event.incomeDate);
    if (eventDate.year !== selectedYear) {
      return;
    }

    if (event.incomeType === "salary" && event.owner === "shared") {
      return;
    }

    const monthIndex = Math.max(eventDate.month - 1, 0);
    const monthName = fullMonthNames[monthIndex];
    const key = `${selectedYear}-${monthIndex}`;
    const bucket = monthlyMap.get(key) ?? {
      monthIndex,
      monthName,
      order: getPeriodOrderKey(selectedYear, monthName),
      expectedRoma: 0,
      expectedSasha: 0,
      expectedShared: 0,
      receivedRoma: 0,
      receivedSasha: 0,
      receivedShared: 0,
    };

    if (event.status === "received") {
      const amount = Number(event.actualAmount ?? event.amountCzk ?? 0);
      if (event.owner === "roma") {
        bucket.receivedRoma += amount;
      } else if (event.owner === "sasha") {
        bucket.receivedSasha += amount;
      } else {
        bucket.receivedShared += amount;
      }
    } else {
      const amount = Number(event.expectedAmount ?? event.amountCzk ?? 0);
      if (event.owner === "roma") {
        bucket.expectedRoma += amount;
      } else if (event.owner === "sasha") {
        bucket.expectedSasha += amount;
      } else {
        bucket.expectedShared += amount;
      }
    }

    monthlyMap.set(key, bucket);
  });

  const summary = [...monthlyMap.values()].reduce(
    (acc, bucket) => {
      const receivedTotal = bucket.receivedRoma + bucket.receivedSasha + bucket.receivedShared;
      const expectedTotal = bucket.expectedRoma + bucket.expectedSasha + bucket.expectedShared;
      const effectiveTotal =
        (bucket.receivedRoma > 0 ? bucket.receivedRoma : bucket.expectedRoma) +
        (bucket.receivedSasha > 0 ? bucket.receivedSasha : bucket.expectedSasha) +
        (bucket.receivedShared > 0 ? bucket.receivedShared : bucket.expectedShared);

      acc.received += receivedTotal;
      acc.totalMixed += effectiveTotal;
      acc.expectedFuture += Math.max(expectedTotal - receivedTotal, 0);

      return acc;
    },
    { received: 0, expectedFuture: 0, totalMixed: 0 },
  );

  const totalIncome = summary.totalMixed;
  const totalExpenses = expenseTotal;
  const result = totalIncome - totalExpenses;

  return {
    ...summary,
    totalIncome,
    totalExpenses,
    result,
    afterBudget: result,
  };
}

function buildIncomeMonthRow({ incomeEvents, selectedYear, monthName, monthIndex, currentContext }) {
  const monthEvents = incomeEvents.filter((event) => {
    const eventDate = parseSqlDateParts(event.incomeDate);
    if (eventDate.year !== selectedYear || Math.max(eventDate.month - 1, 0) !== monthIndex) {
      return false;
    }

    if (event.incomeType === "salary" && event.owner === "shared") {
      return false;
    }

    return true;
  });

  const expectedRoma = monthEvents
    .filter((event) => event.status === "expected" && event.owner === "roma")
    .reduce((sum, event) => sum + Number(event.expectedAmount ?? event.amountCzk ?? 0), 0);
  const expectedSasha = monthEvents
    .filter((event) => event.status === "expected" && event.owner === "sasha")
    .reduce((sum, event) => sum + Number(event.expectedAmount ?? event.amountCzk ?? 0), 0);
  const receivedRoma = monthEvents
    .filter((event) => event.status === "received" && event.owner === "roma")
    .reduce((sum, event) => sum + Number(event.actualAmount ?? event.amountCzk ?? 0), 0);
  const receivedSasha = monthEvents
    .filter((event) => event.status === "received" && event.owner === "sasha")
    .reduce((sum, event) => sum + Number(event.actualAmount ?? event.amountCzk ?? 0), 0);
  const receivedShared = monthEvents
    .filter((event) => event.status === "received" && event.owner === "shared")
    .reduce((sum, event) => sum + Number(event.actualAmount ?? event.amountCzk ?? 0), 0);

  const monthOrder = getPeriodOrderKey(selectedYear, monthName);
  const currentOrder = getPeriodOrderKey(currentContext.year, currentContext.monthName);
  const expectedTotal = expectedRoma + expectedSasha;
  const receivedTotal = receivedRoma + receivedSasha + receivedShared;
  const effectiveTotal =
    (receivedRoma > 0 ? receivedRoma : expectedRoma) +
    (receivedSasha > 0 ? receivedSasha : expectedSasha) +
    receivedShared;

  return {
    monthName,
    monthIndex,
    year: selectedYear,
    expectedRoma,
    expectedSasha,
    receivedRoma,
    receivedSasha,
    receivedShared,
    expectedTotal,
    received: receivedTotal,
    effectiveTotal,
    isFutureOrCurrent: monthOrder >= currentOrder,
  };
}

function calculateIncomeWaterfall({
  incomeEvents,
  currentContext,
  budgetReserveReplenishmentRequired,
  budgetReserveCurrent,
  budgetReserveTarget,
  emergencyReserveCurrent,
  emergencyReserveTarget,
}) {
  const currentMonthOrder = getPeriodOrderKey(currentContext.year, currentContext.monthName);
  const receivedIncome = incomeEvents
    .filter((event) => {
      if (event.status !== "received") {
        return false;
      }

      const eventDate = parseSqlDateParts(event.incomeDate);
      return getPeriodOrderKey(eventDate.year, getMonthNameByNumber(eventDate.month)) === currentMonthOrder;
    })
    .reduce((sum, event) => sum + Number(event.amountCzk ?? 0), 0);

  const budgetReserveShortfallToTarget = Math.max(budgetReserveTarget - budgetReserveCurrent, 0);
  const budgetReserveNeed = Math.max(budgetReserveReplenishmentRequired, budgetReserveShortfallToTarget);
  const budgetReserveCovered = Math.min(receivedIncome, budgetReserveNeed);
  const remainingAfterBudgetReserve = Math.max(receivedIncome - budgetReserveCovered, 0);
  const emergencyReserveNeed = Math.max(emergencyReserveTarget - emergencyReserveCurrent, 0);
  const emergencyReserveCovered = Math.min(remainingAfterBudgetReserve, emergencyReserveNeed);
  const availableForInvestments = Math.max(remainingAfterBudgetReserve - emergencyReserveCovered, 0);

  return {
    receivedIncome,
    budgetReserveCovered,
    budgetReserveNeed,
    emergencyReserveCovered,
    emergencyReserveNeed,
    availableForInvestments,
  };
}

function calculateCashflowWarnings({
  nextMonthBudgetTotal,
  budgetReserveCurrent,
  budgetReserveTarget,
  emergencyReserveCurrent,
  emergencyReserveTarget,
  payerAllocation,
  snapshots,
}) {
  const warnings = [];

  if (!nextMonthBudgetTotal) {
    warnings.push("Нет бюджета следующего месяца.");
  }

  if (budgetReserveCurrent < budgetReserveTarget) {
    warnings.push("Бюджетная кубышка ниже целевого уровня.");
  }

  if (budgetReserveCurrent < nextMonthBudgetTotal) {
    warnings.push(
      `Бюджетной кубышки не хватает на следующий месяц. Дефицит: ${formatCurrency(
        nextMonthBudgetTotal - budgetReserveCurrent,
      )} Kč.`,
    );
  }

  if (emergencyReserveCurrent < emergencyReserveTarget) {
    warnings.push("Сейф безопасности ниже целевого уровня.");
  }

  if (payerAllocation.unassigned > 0) {
    warnings.push("Есть строки бюджета без плательщика.");
  }

  const latestSnapshotTimestamp = snapshots.length
    ? Math.max(...snapshots.map((snapshot) => new Date(snapshot.snapshotDate).getTime()))
    : 0;
  const freshnessLimit = 1000 * 60 * 60 * 24 * 30;

  if (!latestSnapshotTimestamp || Date.now() - latestSnapshotTimestamp > freshnessLimit) {
    warnings.push("Нет свежих снимков баланса.");
  }

  return warnings;
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

function formatSqlDateHuman(sqlDate) {
  if (!sqlDate) {
    return "";
  }

  const [year, month, day] = String(sqlDate).split("-").map((item) => Number(item));
  if (!year || !month || !day) {
    return String(sqlDate);
  }

  const monthName = monthNamesGenitive[month - 1] ?? "";
  return `${day} ${monthName} ${year}`;
}

function formatAmountProgress(current, target, suffix = "Kč") {
  return `${formatCurrency(current)} из ${formatCurrency(target)} ${suffix}`;
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

function MonthProjectionCard({ monthLabel, monthMeta, budget, expectedIncome }) {
  const safeIncome = Math.max(Number(expectedIncome) || 0, 0);
  const safeExpenses = Math.max(Number(budget) || 0, 0);
  const hasIncomeData = safeIncome > 0;
  const netForecast = safeIncome - safeExpenses;
  const deficit = Math.max(safeExpenses - safeIncome, 0);
  const surplus = Math.max(safeIncome - safeExpenses, 0);
  const coveragePercent = safeExpenses > 0 ? Math.min((safeIncome / safeExpenses) * 100, 100) : 100;
  const roundedCoveragePercent = Math.round(coveragePercent);
  const expenseShareOfIncome = safeIncome > 0 ? Math.min((safeExpenses / safeIncome) * 100, 100) : 0;
  const surplusShareOfIncome = safeIncome > 0 ? Math.min((surplus / safeIncome) * 100, 100) : 0;

  let resultLabel = "В ноль";
  let resultValue = "0 Kč";
  let hint = "Доходы полностью покрывают план месяца без свободного остатка.";

  if (surplus > 0) {
    resultLabel = "Остаток";
    resultValue = `+${formatCurrency(surplus)} Kč`;
    hint = "Можно направить в бюджетную кубышку, сейф безопасности или инвестиции.";
  } else if (deficit > 0) {
    resultLabel = "Дефицит";
    resultValue = `-${formatCurrency(deficit)} Kč`;
    hint = "Нужно покрыть из бюджетной кубышки или пересмотреть расходы.";
  }

  return (
    <section className="card month-card month-hero-card month-projection-card">
      <div className="month-hero-header">
        <div
          className="month-icon month-icon-large"
          style={{ background: monthMeta.bg, color: monthMeta.tone }}
        >
          {monthMeta.icon}
        </div>
        <div className="month-hero-copy">
          <div className="month-name">{monthLabel}</div>
          <div className="month-budget">Покрытие месяца</div>
        </div>
      </div>

      {hasIncomeData ? (
        <>
          <div className="projection-summary-grid">
            <div className="projection-summary-row">
              <span className="projection-summary-label">Ожидаемый доход месяца</span>
              <strong className="projection-summary-value">{formatCurrency(safeIncome)} Kč</strong>
            </div>
            <div className="projection-summary-row">
              <span className="projection-summary-label">Плановый расход месяца</span>
              <strong className="projection-summary-value">{formatCurrency(safeExpenses)} Kč</strong>
            </div>
            <div className="projection-summary-row projection-summary-row-accent">
              <span className="projection-summary-label">Прогноз месяца</span>
              <strong className={deficit > 0 ? "projection-result-value danger" : "projection-result-value"}>
                {resultLabel}: {resultValue}
              </strong>
            </div>
          </div>

          <div className="projection-volume-card" aria-label="Шкала покрытия расходов доходом">
            <div className="projection-volume-track">
              {safeIncome > 0 ? (
                <>
                  <div className="projection-volume-income" style={{ width: "100%" }} />
                  <div className="projection-volume-expenses" style={{ width: `${expenseShareOfIncome}%` }} />
                  {surplus > 0 ? (
                    <div
                      className="projection-volume-profit"
                      style={{ left: `${expenseShareOfIncome}%`, width: `${surplusShareOfIncome}%` }}
                    />
                  ) : null}
                </>
              ) : (
                <div className="projection-volume-empty" />
              )}
            </div>
          </div>

          <div className="projection-result-block">
            <div className="projection-result-row">
              <span className="projection-result-label">Покрыто</span>
              <strong className="projection-result-value">{roundedCoveragePercent}%</strong>
            </div>
            <p className={deficit > 0 ? "projection-note danger" : "projection-note"}>{hint}</p>
          </div>
        </>
      ) : (
        <div className="projection-empty-state">
          <strong>Доходы месяца ещё не добавлены.</strong>
          <span>Добавь ожидаемые или фактические доходы, чтобы увидеть покрытие бюджета.</span>
        </div>
      )}
    </section>
  );
}

function buildCategoryBreakdownFromExpenses(expenses, categories, totalBudget = null) {
  const totalsByCategory = new Map();

  expenses.forEach((expense) => {
    const currentTotal = totalsByCategory.get(expense.category) ?? 0;
    totalsByCategory.set(expense.category, currentTotal + expense.amount);
  });

  const resolvedTotal =
    totalBudget ?? expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return [...totalsByCategory.entries()]
    .map(([label, amount]) => {
      const category = categories.find((item) => item.label === label);
      const share = resolvedTotal > 0 ? (amount / resolvedTotal) * 100 : 0;

      return {
        label,
        amount,
        share,
        color: getCategoryColor(label, categories),
        icon: category?.icon ?? "•",
      };
    })
    .sort((left, right) => right.amount - left.amount);
}

function CategoryBreakdownCard({
  items,
  total,
  eyebrow = "Категории месяца",
  title = "Структура бюджета",
  barLabel = "Распределение бюджета по категориям",
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  return (
    <section className={showAllCategories ? "card category-breakdown-card expanded" : "card category-breakdown-card"}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="category-breakdown-head">
        <h2>{title}</h2>
        <div className="category-breakdown-total">{formatCurrency(total)} Kč</div>
      </div>

      <div className="category-breakdown-bar-wrap">
        <div className="category-breakdown-bar" aria-label={barLabel}>
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
  showRecurringBadge = false,
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
            {compactDueLabel ? (
              <span className="budget-data-mobile-due">
                <span
                  className={showRecurringBadge ? "budget-data-repeat-slot active" : "budget-data-repeat-slot"}
                  title={showRecurringBadge ? "Регулярная статья" : undefined}
                  aria-label={showRecurringBadge ? "Регулярная статья" : undefined}
                >
                  {showRecurringBadge ? <span className="budget-data-repeat" aria-hidden="true">↻</span> : null}
                </span>
                {compactDueLabel}
              </span>
            ) : null}
          </span>
        </span>
        {dueLabel ? (
          <span className={isPastDue ? "budget-data-due overdue" : "budget-data-due"}>
            <span
              className={showRecurringBadge ? "budget-data-repeat-slot active" : "budget-data-repeat-slot"}
              title={showRecurringBadge ? "Регулярная статья" : undefined}
              aria-label={showRecurringBadge ? "Регулярная статья" : undefined}
            >
              {showRecurringBadge ? <span className="budget-data-repeat" aria-hidden="true">↻</span> : null}
            </span>
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
  const isRecurring =
    expense.frequency === "Каждый месяц" ||
    expense.frequency === "Раз в год" ||
    Boolean(expense.templateId);
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
      showRecurringBadge={isRecurring}
      isCompleted={isCompleted}
      isPastDue={isPastDue}
      leading={(
        <button
          className={expense.completed ? "checkbox-button checked" : "checkbox-button"}
          type="button"
          aria-label={expense.completed ? "Отметить как не оплаченное" : "Отметить как оплаченное"}
          onClick={() => onToggle(expense)}
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
              onToggle={(selectedExpense) => onToggleExpense(expense.sourceMember?.id ?? member.id, selectedExpense)}
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

function SettingsScreen({ onOpenCategories, onOpenCashflowAccounts, onOpenCashflowFunds, onRequestReset }) {
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
          <button className="settings-action-card" type="button" onClick={onOpenCashflowAccounts}>
            <span className="settings-action-title">Счета для потоков денег</span>
            <span className="settings-action-note">
              Добавлять, переименовывать и удалять места хранения денег: банки, наличные, брокеры и другие счета.
            </span>
          </button>
          <button className="settings-action-card" type="button" onClick={onOpenCashflowFunds}>
            <span className="settings-action-title">Фонды для потоков денег</span>
            <span className="settings-action-note">
              Управлять фондами вроде кубышки, сейфа безопасности, инвестиций и накоплений.
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

function CashflowAccountsSettingsScreen({ accounts, snapshots, onBackToSettings, onOpenCreate, onOpenEdit, onRequestDelete }) {
  const usageCountByAccountId = useMemo(() => {
    const counts = new Map();
    snapshots.forEach((snapshot) => {
      counts.set(snapshot.accountId, (counts.get(snapshot.accountId) ?? 0) + 1);
    });
    return counts;
  }, [snapshots]);

  return (
    <>
      <header className="page-header">
        <Breadcrumbs
          items={[
            { label: "Настройки", onClick: onBackToSettings },
            { label: "Счета cashflow", current: true },
          ]}
        />
        <p className="eyebrow">Потоки денег</p>
        <h1>Счета cashflow</h1>
        <p className="page-note">Здесь живут места хранения денег, которые потом выбираются в снимках баланса.</p>
      </header>

      <section className="card settings-screen-card">
        <div className="settings-section-head">
          <div>
            <h2>Счета</h2>
            <p>Банки, наличные, брокеры и другие места, где фактически лежат деньги.</p>
          </div>
          <button className="primary-action-button" type="button" onClick={onOpenCreate}>Добавить счёт</button>
        </div>
        <div className="settings-entity-list">
          {accounts.length ? (
            accounts.map((account) => (
              <div key={account.id} className="settings-entity-row">
                <div className="settings-entity-copy">
                  <strong>{account.name}</strong>
                  <span>{getCashflowOwnerLabel(account.owner)} · {cashflowAccountTypeOptions.find((item) => item.value === account.accountType)?.label ?? account.accountType}</span>
                  <span>{usageCountByAccountId.get(account.id) ?? 0} снимков</span>
                </div>
                <div className="settings-entity-actions">
                  <button className="secondary-action-button" type="button" onClick={() => onOpenEdit(account)}>Изменить</button>
                  <button className="secondary-action-button danger" type="button" onClick={() => onRequestDelete(account)}>Удалить</button>
                </div>
              </div>
            ))
          ) : (
            <div className="cashflow-empty">Пока счетов нет.</div>
          )}
        </div>
      </section>
    </>
  );
}

function CashflowFundsSettingsScreen({ funds, snapshots, onBackToSettings, onOpenCreate, onOpenEdit, onRequestDelete }) {
  const usageCountByFundId = useMemo(() => {
    const counts = new Map();
    snapshots.forEach((snapshot) => {
      counts.set(snapshot.fundId, (counts.get(snapshot.fundId) ?? 0) + 1);
    });
    return counts;
  }, [snapshots]);

  return (
    <>
      <header className="page-header">
        <Breadcrumbs
          items={[
            { label: "Настройки", onClick: onBackToSettings },
            { label: "Фонды cashflow", current: true },
          ]}
        />
        <p className="eyebrow">Потоки денег</p>
        <h1>Фонды cashflow</h1>
        <p className="page-note">Здесь живут назначения денег: кубышка, сейф, инвестиции, накопления и свободный остаток.</p>
      </header>

      <section className="card settings-screen-card">
        <div className="settings-section-head">
          <div>
            <h2>Фонды</h2>
            <p>Системные фонды можно переименовывать, а пользовательские — добавлять и удалять.</p>
          </div>
          <button className="primary-action-button" type="button" onClick={onOpenCreate}>Добавить фонд</button>
        </div>
        <div className="settings-entity-list">
          {funds.length ? (
            funds.map((fund) => (
              <div key={fund.id} className="settings-entity-row">
                <div className="settings-entity-copy">
                  <strong>{fund.name}</strong>
                  <span>{getCashflowSystemFundLabel(fund.fundType)}</span>
                  <span>{usageCountByFundId.get(fund.id) ?? 0} снимков{fund.isSystem ? " · системный" : ""}</span>
                </div>
                <div className="settings-entity-actions">
                  <button className="secondary-action-button" type="button" onClick={() => onOpenEdit(fund)}>Изменить</button>
                  {!fund.isSystem ? (
                    <button className="secondary-action-button danger" type="button" onClick={() => onRequestDelete(fund)}>Удалить</button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="cashflow-empty">Пока фондов нет.</div>
          )}
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

  if (screen === "cashflow") {
    return "Денежный поток";
  }

  if (screen === "incomes") {
    return "Доходы";
  }

  if (screen === "analytics") {
    return "Аналитика";
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

  if (screen === "cashflowAccounts") {
    return "Счета cashflow";
  }

  if (screen === "cashflowFunds") {
    return "Фонды cashflow";
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
            (currentScreen === "cashflow" && item === "Денежный поток") ||
            (currentScreen === "incomes" && item === "Доходы") ||
            (currentScreen === "analytics" && item === "Аналитика") ||
            ((currentScreen === "settings" || currentScreen === "categories" || currentScreen === "cashflowAccounts" || currentScreen === "cashflowFunds") && item === "Настройка")
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

function YearDeleteConfirmModal({ year, onClose, onConfirm }) {
  const [value, setValue] = useState("");
  const expected = `DELETE ${year}`;
  const isValid = value.trim() === expected;

  return (
    <ModalShell title="Удалить год" onClose={onClose} compact>
      <div className="confirm-dialog standalone-confirm-dialog">
        <p className="inline-confirm-title">Удалить {year} год?</p>
        <p className="inline-confirm-text">
          Это действие лучше защищено от случайного удаления. Введи <strong>{expected}</strong>, чтобы продолжить.
        </p>
        <label className="field">
          <span className="field-head"><span>Подтверждение *</span></span>
          <input value={value} placeholder={expected} onChange={(event) => setValue(event.target.value)} />
        </label>
        <div className="inline-confirm-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="secondary-action-button danger solid" type="button" disabled={!isValid} onClick={onConfirm}>
            Да, удалить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function YearAddModal({ trackedYears, onClose, onConfirm }) {
  const currentYear = getCurrentMonthContext().year;
  const candidateYears = Array.from({ length: 11 }, (_, index) => currentYear - 2 + index).filter(
    (year) => !trackedYears.includes(year),
  );
  const [selectedYear, setSelectedYear] = useState(candidateYears[0] ? String(candidateYears[0]) : "");

  return (
    <ModalShell title="Добавить учетный год" onClose={onClose} compact>
      <div className="confirm-dialog standalone-confirm-dialog">
        <p className="inline-confirm-title">Какой год добавить?</p>
        <p className="inline-confirm-text">
          Выбери год, который нужно показать в разделе бюджета.
        </p>
        {candidateYears.length ? (
          <label className="field">
            <span className="field-head"><span>Год *</span></span>
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              {candidateYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        ) : (
          <p className="cashflow-empty">Доступных новых лет для добавления сейчас нет.</p>
        )}
        <div className="inline-confirm-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button
            className="primary-action-button"
            type="button"
            disabled={!selectedYear}
            onClick={() => onConfirm(Number(selectedYear))}
          >
            Добавить
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
  const currentYear = getCurrentMonthContext().year;
  const canDeleteYear = yearData.year > currentYear;

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
            {canDeleteYear ? (
              <button className="year-delete-button" type="button" onClick={() => onDelete(yearData.year)}>
                Удалить год
              </button>
            ) : null}
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

function AnalyticsScreen({
  selectedYear,
  availableYears,
  onSelectYear,
  totalBudget,
  categoryBreakdown,
  monthsWithData,
  incomeOutcome,
}) {
  const topCategory = categoryBreakdown[0] ?? null;
  const averageMonthBudget = monthsWithData > 0 ? Math.round(totalBudget / monthsWithData) : 0;
  const totalIncome = incomeOutcome.totalIncome;
  const totalExpenses = incomeOutcome.totalExpenses;
  const result = incomeOutcome.result;
  const expenseShare = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const positiveResultShare = totalIncome > 0 && result > 0 ? Math.max((result / totalIncome) * 100, 0) : 0;

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Обзор бюджета</p>
        <h1>Аналитика</h1>
        <p className="page-note">
          Смотри структуру трат по категориям за весь год и быстро замечай, какие направления съедают
          больше всего бюджета.
        </p>
      </header>

      <section className="card analytics-summary-card">
        <div className="analytics-summary-head">
          <div>
            <h2>Годовой анализ</h2>
            <p>Выбери год, за который хочешь посмотреть общую структуру расходов.</p>
          </div>
          <div className="analytics-year-switcher" role="tablist" aria-label="Выбор года для аналитики">
            {availableYears.map((year) => (
              <button
                key={year}
                type="button"
                className={year === selectedYear ? "analytics-year-chip active" : "analytics-year-chip"}
                onClick={() => onSelectYear(year)}
                aria-pressed={year === selectedYear}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">Бюджет за {selectedYear} год</span>
            <strong className="analytics-kpi-value">{formatCurrency(totalBudget)} Kč</strong>
          </div>
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">Категорий с тратами</span>
            <strong className="analytics-kpi-value">{categoryBreakdown.length}</strong>
          </div>
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">Средний активный месяц</span>
            <strong className="analytics-kpi-value">{formatCurrency(averageMonthBudget)} Kč</strong>
          </div>
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">Самая крупная категория</span>
            <strong className="analytics-kpi-value">
              {topCategory ? `${topCategory.icon} ${topCategory.label}` : "Нет данных"}
            </strong>
          </div>
        </div>
      </section>

      {categoryBreakdown.length > 0 || totalIncome > 0 ? (
        <div className="analytics-grid">
          {categoryBreakdown.length > 0 ? (
            <CategoryBreakdownCard
              items={categoryBreakdown}
              total={totalBudget}
              eyebrow="Категории года"
              title={`Структура трат за ${selectedYear} год`}
              barLabel={`Распределение трат за ${selectedYear} год по категориям`}
            />
          ) : (
            <section className="card analytics-empty-card">
              <h2>Пока нет расходов за {selectedYear} год</h2>
              <p>Как только в выбранном году появятся траты или планы по месяцам, здесь появится структура по категориям.</p>
            </section>
          )}

          <section className="card annual-outcome-card">
            <p className="eyebrow">Доходы и результат</p>
            <div className="category-breakdown-head">
              <h2>{`Доходы, расходы и результат за ${selectedYear} год`}</h2>
              <div className="category-breakdown-total">{formatCurrency(totalIncome)} Kč</div>
            </div>

            <div className="category-breakdown-bar-wrap">
              <div className="category-breakdown-bar" aria-label={`Доходы и расходы за ${selectedYear} год`}>
                <div
                  className="category-breakdown-segment static"
                  style={{ width: `${Math.max(expenseShare, 6)}%`, background: "#d7b26d" }}
                />
                {positiveResultShare > 0 ? (
                  <div
                    className="category-breakdown-segment static"
                    style={{ width: `${Math.max(positiveResultShare, 6)}%`, background: "#5da274" }}
                  />
                ) : null}
                {result < 0 ? (
                  <div
                    className="category-breakdown-segment static"
                    style={{ width: "100%", background: "#e57f72", opacity: 0.22 }}
                  />
                ) : null}
              </div>
            </div>

            <div className="category-breakdown-list">
              <div className="category-breakdown-row">
                <div className="category-breakdown-main">
                  <span className="category-breakdown-swatch" style={{ background: "#d7b26d" }} />
                  <span className="category-breakdown-label">Ожидаемые расходы на год</span>
                </div>
                <div className="category-breakdown-values annual-outcome-values">
                  <strong className="category-breakdown-amount">{formatCurrency(totalExpenses)} Kč</strong>
                </div>
              </div>
              <div className="category-breakdown-row">
                <div className="category-breakdown-main">
                  <span
                    className="category-breakdown-swatch"
                    style={{ background: result >= 0 ? "#5da274" : "#e57f72" }}
                  />
                  <span className="category-breakdown-label">
                    {result >= 0 ? "Ожидаемая прибыль на год" : "Ожидаемый дефицит на год"}
                  </span>
                </div>
                <div className="category-breakdown-values annual-outcome-values">
                  <strong className="category-breakdown-amount">{formatCurrency(Math.abs(result))} Kč</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="card analytics-empty-card">
          <h2>Пока нет данных за {selectedYear} год</h2>
          <p>Как только в выбранном году появятся траты или планы по месяцам, здесь появится диаграмма.</p>
        </section>
      )}
    </>
  );
}

function IncomeScreen({
  selectedYear,
  availableYears,
  onSelectYear,
  summary,
  monthlyRows,
  onEditMonth,
}) {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">План и факт доходов</p>
        <h1>Доходы</h1>
        <p className="page-note">
          Здесь можно вести ожидаемые и фактические доходы Ромы, Саши и общие поступления на любой месяц.
        </p>
      </header>

      <section className="card analytics-summary-card">
        <div className="analytics-summary-head">
          <div>
            <h2>Доходы по году</h2>
            <p>Для каждого месяца можно отдельно задать ожидаемый доход Ромы, Саши и фактический семейный доход.</p>
          </div>
          <div className="analytics-year-switcher" role="tablist" aria-label="Выбор года для доходов">
            {availableYears.map((year) => (
              <button
                key={year}
                type="button"
                className={year === selectedYear ? "analytics-year-chip active" : "analytics-year-chip"}
                onClick={() => onSelectYear(year)}
                aria-pressed={year === selectedYear}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-kpi-grid income-kpi-grid compact">
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">Факт за год</span>
            <strong className="analytics-kpi-value">{formatCurrency(summary.received)} Kč</strong>
          </div>
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">По плану без факта</span>
            <strong className="analytics-kpi-value">{formatCurrency(summary.expectedFuture)} Kč</strong>
          </div>
          <div className="analytics-kpi-card">
            <span className="analytics-kpi-label">План на год</span>
            <strong className="analytics-kpi-value">{formatCurrency(summary.totalMixed)} Kč</strong>
          </div>
        </div>
      </section>

      <section className="card income-months-card">
        <div className="cashflow-panel-head">
          <h2>Доходы по месяцам</h2>
          <span>{selectedYear}</span>
        </div>

        <div className="income-month-columns" aria-hidden="true">
          <span>Месяц</span>
          <span>Ожидается</span>
          <span>Факт</span>
        </div>

        <div className="income-month-list">
          {monthlyRows.map((row) => (
            <button
              key={`${selectedYear}-${row.monthName}`}
              type="button"
              className="income-month-row clickable"
              onClick={() => onEditMonth(row)}
            >
              <div className="income-month-main">
                <strong>{row.monthName}</strong>
              </div>
              <div className="income-month-values">
                <div>
                  <strong>{formatCurrency(row.expectedTotal)} Kč</strong>
                </div>
                <div>
                  <strong>{formatCurrency(row.received)} Kč</strong>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
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
  const isRecurring = expense.frequency === "Каждый месяц" || expense.frequency === "Раз в год" || isTemplateExpense;
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
      showRecurringBadge={isRecurring}
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
  projection = null,
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
        {projection ? (
          <MonthProjectionCard
            monthLabel={monthLabel}
            monthMeta={monthMeta}
            budget={totals.budget}
            expectedIncome={projection.expectedIncome}
            hasIncomeData={projection.hasIncomeData}
          />
        ) : (
          <MonthOverviewCard monthLabel={monthLabel} monthMeta={monthMeta} budget={totals.budget} paid={0} />
        )}
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

function CashflowMetricCard({ label, value, accent = false, note = "" }) {
  return (
    <section className={accent ? "card cashflow-metric-card accent" : "card cashflow-metric-card"}>
      <span className="cashflow-metric-label">{label}</span>
      <strong className="cashflow-metric-value">{value}</strong>
      {note ? <span className="cashflow-metric-note">{note}</span> : null}
    </section>
  );
}

function CashflowDetailRow({ label, value, hint = "", danger = false, onClick = null }) {
  return (
    <div
      className={[
        "cashflow-detail-row",
        danger ? "danger" : "",
        onClick ? "clickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick ?? undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="cashflow-detail-copy">
        <strong>{label}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
      <div className="cashflow-detail-value">{value}</div>
    </div>
  );
}

function CashflowSnapshotRow({ snapshot, onClick }) {
  return (
    <div
      className="cashflow-detail-row clickable cashflow-snapshot-row"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="cashflow-detail-copy">
        <strong>{snapshot.accountName}</strong>
        <span>{snapshot.fundName}</span>
      </div>
      <div className="cashflow-detail-value cashflow-snapshot-value">
        <strong>{formatCurrency(snapshot.amountCzk)} Kč</strong>
        <span>{formatSqlDateHuman(snapshot.snapshotDate)}</span>
      </div>
    </div>
  );
}

function CashflowIncomeEditorModal({ incomeEvent, onClose, onSave }) {
  const isCreateMode = !incomeEvent;
  const [form, setForm] = useState(() => ({
    incomeDate: incomeEvent?.incomeDate ?? getTodaySqlDate(),
    owner: incomeEvent?.owner ?? "shared",
    incomeType: incomeEvent?.incomeType ?? "salary",
    status: incomeEvent?.status ?? "received",
    expectedAmount: incomeEvent ? String(incomeEvent.expectedAmount || "") : "",
    actualAmount: incomeEvent ? String(incomeEvent.actualAmount || "") : "",
    currency: incomeEvent?.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    exchangeRateToCzk:
      incomeEvent?.exchangeRateToCzk && incomeEvent.exchangeRateToCzk !== 1
        ? String(incomeEvent.exchangeRateToCzk)
        : "",
    note: incomeEvent?.note ?? "",
  }));

  const isReceived = form.status === "received";
  const rawAmount = Number(isReceived ? form.actualAmount || 0 : form.expectedAmount || 0);
  const rate = form.currency === "CZK" ? 1 : Number(form.exchangeRateToCzk || 0);
  const isValid = form.incomeDate && rawAmount > 0 && (form.currency === "CZK" || rate > 0);

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    onSave({
      ...(incomeEvent ?? {}),
      incomeDate: form.incomeDate,
      owner: form.owner,
      incomeType: form.incomeType,
      status: form.status,
      expectedAmount: Number(form.expectedAmount || 0),
      actualAmount: Number(form.actualAmount || 0),
      currency: form.currency,
      exchangeRateToCzk: form.currency === "CZK" ? 1 : rate,
      amountCzk: Math.round(rawAmount * (form.currency === "CZK" ? 1 : rate)),
      note: form.note.trim(),
    });
  };

  return (
    <ModalShell title={isCreateMode ? "Добавить доход" : "Изменить доход"} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить доход" : "Изменить доход"}</h2>
      </div>
      <div className="modal-form">
        <label className="field">
          <span className="field-head"><span>Дата *</span></span>
          <input type="date" value={form.incomeDate} onChange={(event) => setForm((current) => ({ ...current, incomeDate: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Чей доход *</span></span>
          <select value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}>
            {cashflowIncomeOwnerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Тип дохода *</span></span>
          <select value={form.incomeType} onChange={(event) => setForm((current) => ({ ...current, incomeType: event.target.value }))}>
            {cashflowIncomeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Статус *</span></span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            {cashflowIncomeStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Ожидаемая сумма</span></span>
          <div className="input-with-suffix">
            <input value={formatNumberInput(form.expectedAmount)} onChange={(event) => setForm((current) => ({ ...current, expectedAmount: parseDigits(event.target.value) }))} />
            <span>{form.currency}</span>
          </div>
        </label>
        <label className="field">
          <span className="field-head"><span>Фактическая сумма</span></span>
          <div className="input-with-suffix">
            <input value={formatNumberInput(form.actualAmount)} onChange={(event) => setForm((current) => ({ ...current, actualAmount: parseDigits(event.target.value) }))} />
            <span>{form.currency}</span>
          </div>
        </label>
        <label className="field">
          <span className="field-head"><span>Валюта *</span></span>
          <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
            {cashflowCurrencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </label>
        {form.currency !== "CZK" ? (
          <label className="field">
            <span className="field-head"><span>Курс к CZK *</span></span>
            <input value={form.exchangeRateToCzk} onChange={(event) => setForm((current) => ({ ...current, exchangeRateToCzk: event.target.value.replace(/[^0-9.,]/g, "").replace(",", ".") }))} />
          </label>
        ) : null}
        <label className="field">
          <span className="field-head"><span>Комментарий</span></span>
          <textarea rows={3} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
        </label>
      </div>
      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-action-button" type="button" disabled={!isValid} onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowMonthlyIncomeModal({ monthRow, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    expectedRoma: String(monthRow.expectedRoma || ""),
    expectedSasha: String(monthRow.expectedSasha || ""),
    actualRoma: String(monthRow.receivedRoma || ""),
    actualSasha: String(monthRow.receivedSasha || ""),
  }));

  const handleSave = () => {
    onSave({
      ...monthRow,
      expectedRoma: Number(form.expectedRoma || 0),
      expectedSasha: Number(form.expectedSasha || 0),
      actualRoma: Number(form.actualRoma || 0),
      actualSasha: Number(form.actualSasha || 0),
    });
  };

  return (
    <ModalShell title={`Доходы · ${monthRow.monthName} ${monthRow.year}`} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{`${monthRow.monthName} ${monthRow.year}`}</h2>
      </div>
      <div className="modal-form">
        <div className="cashflow-income-month-grid">
          <label className="field">
            <span className="field-head"><span>Ожидаемый доход Ромы</span></span>
            <div className="input-with-suffix">
              <input
                value={formatNumberInput(form.expectedRoma)}
                disabled={Number(form.actualRoma || 0) > 0}
                onChange={(event) => setForm((current) => ({ ...current, expectedRoma: parseDigits(event.target.value) }))}
              />
              <span>CZK</span>
            </div>
          </label>

          <label className="field">
            <span className="field-head"><span>Фактический доход Ромы</span></span>
            <div className="input-with-suffix">
              <input
                value={formatNumberInput(form.actualRoma)}
                onChange={(event) => setForm((current) => ({ ...current, actualRoma: parseDigits(event.target.value) }))}
              />
              <span>CZK</span>
            </div>
          </label>

          <label className="field">
            <span className="field-head"><span>Ожидаемый доход Саши</span></span>
            <div className="input-with-suffix">
              <input
                value={formatNumberInput(form.expectedSasha)}
                disabled={Number(form.actualSasha || 0) > 0}
                onChange={(event) => setForm((current) => ({ ...current, expectedSasha: parseDigits(event.target.value) }))}
              />
              <span>CZK</span>
            </div>
          </label>

          <label className="field">
            <span className="field-head"><span>Фактический доход Саши</span></span>
            <div className="input-with-suffix">
              <input
                value={formatNumberInput(form.actualSasha)}
                onChange={(event) => setForm((current) => ({ ...current, actualSasha: parseDigits(event.target.value) }))}
              />
              <span>CZK</span>
            </div>
          </label>
        </div>

        <p className="regular-editor-note">
          Если справа внесён фактический доход, ожидаемое значение для этого человека перестаёт учитываться в аналитике месяца.
        </p>
      </div>

      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-action-button" type="button" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowSnapshotEditorModal({ snapshot, accounts, funds, onClose, onSave }) {
  const isCreateMode = !snapshot;
  const [form, setForm] = useState(() => ({
    accountId: snapshot?.accountId ?? "",
    fundId: snapshot?.fundId ?? funds.find((item) => item.fundType === "budget_reserve")?.id ?? "",
    snapshotDate: snapshot?.snapshotDate ?? getTodaySqlDate(),
    amount: snapshot ? String(snapshot.amount) : "",
    currency: snapshot?.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    exchangeRateToCzk:
      snapshot?.exchangeRateToCzk && snapshot.exchangeRateToCzk !== 1
        ? String(snapshot.exchangeRateToCzk)
        : "",
    assetType: snapshot?.assetType ?? "bank_account",
    owner: snapshot?.owner ?? "shared",
  }));
  const rate = form.currency === "CZK" ? 1 : Number(form.exchangeRateToCzk || 0);
  const amount = Number(form.amount || 0);
  const isValid =
    form.accountId &&
    form.snapshotDate &&
    amount > 0 &&
    form.fundId &&
    (form.currency === "CZK" || rate > 0);

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    onSave(
      {
        ...(snapshot ?? {}),
        accountId: form.accountId,
        fundId: form.fundId,
        snapshotDate: form.snapshotDate,
        amount,
        currency: form.currency,
        amountCzk: Math.round(amount * (form.currency === "CZK" ? 1 : rate)),
        exchangeRateToCzk: form.currency === "CZK" ? 1 : rate,
        assetType: form.assetType,
        owner: form.owner,
      },
      null,
    );
  };

  return (
    <ModalShell title={isCreateMode ? "Снимок баланса" : "Изменить снимок баланса"} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить или обновить баланс" : "Изменить снимок"}</h2>
      </div>
      <div className="modal-form">
        <label className="field">
          <span className="field-head"><span>Счёт / место хранения *</span></span>
          <select
            value={form.accountId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                accountId: event.target.value,
              }))
            }
          >
            <option value="">Выбери счёт</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </label>
        <p className="regular-editor-note">
          Счета и фонды теперь редактируются отдельно в разделе «Настройки».
        </p>
        <label className="field">
          <span className="field-head"><span>Фонд *</span></span>
          <select value={form.fundId} onChange={(event) => setForm((current) => ({ ...current, fundId: event.target.value }))}>
            {funds.filter((fund) => fund.isActive).map((fund) => (
              <option key={fund.id} value={fund.id}>{fund.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Дата снимка *</span></span>
          <input type="date" value={form.snapshotDate} onChange={(event) => setForm((current) => ({ ...current, snapshotDate: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Сумма *</span></span>
          <div className="input-with-suffix">
            <input value={formatNumberInput(form.amount)} onChange={(event) => setForm((current) => ({ ...current, amount: parseDigits(event.target.value) }))} />
            <span>{form.currency}</span>
          </div>
        </label>
        <label className="field">
          <span className="field-head"><span>Валюта *</span></span>
          <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
            {cashflowCurrencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </label>
        {form.currency !== "CZK" ? (
          <label className="field">
            <span className="field-head"><span>Курс к CZK *</span></span>
            <input value={form.exchangeRateToCzk} onChange={(event) => setForm((current) => ({ ...current, exchangeRateToCzk: event.target.value.replace(/[^0-9.,]/g, "").replace(",", ".") }))} />
          </label>
        ) : null}
        <label className="field">
          <span className="field-head"><span>Тип актива</span></span>
          <select value={form.assetType} onChange={(event) => setForm((current) => ({ ...current, assetType: event.target.value }))}>
            {cashflowAssetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-action-button" type="button" disabled={!isValid} onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowReserveEditorModal({ settings, funds, onClose, onSave }) {
  const budgetFund = funds.find((fund) => fund.fundType === "budget_reserve");
  const emergencyFund = funds.find((fund) => fund.fundType === "emergency_reserve");
  const [form, setForm] = useState(() => ({
    baseCurrency: settings.baseCurrency,
    mandatoryBudgetAverageMonths: String(settings.mandatoryBudgetAverageMonths),
    budgetReserveTargetMode: budgetFund?.targetMode ?? "auto_average_mandatory_budget",
    budgetReserveMonthsMultiplier: String(budgetFund?.targetMultiplier ?? settings.budgetReserveMonthsMultiplier),
    budgetReserveManualTarget: budgetFund?.manualTargetAmount ? String(budgetFund.manualTargetAmount) : "",
    emergencyReserveTargetMode: emergencyFund?.targetMode ?? "auto_average_mandatory_budget",
    emergencyReserveMonthsMultiplier: String(emergencyFund?.targetMultiplier ?? settings.emergencyReserveMonthsMultiplier),
    emergencyReserveManualTarget: emergencyFund?.manualTargetAmount ? String(emergencyFund.manualTargetAmount) : "",
    receivedIncomeLabel: settings.receivedIncomeLabel,
    budgetReservePriorityLabel: settings.budgetReservePriorityLabel,
    emergencyReservePriorityLabel: settings.emergencyReservePriorityLabel,
    investmentsPriorityLabel: settings.investmentsPriorityLabel,
  }));

  const handleSave = () => {
    const nextSettings = normalizeCashflowSettings({
      ...settings,
      baseCurrency: form.baseCurrency,
      mandatoryBudgetAverageMonths: Number(form.mandatoryBudgetAverageMonths || 6),
      budgetReserveMonthsMultiplier: Number(form.budgetReserveMonthsMultiplier || 2),
      emergencyReserveMonthsMultiplier: Number(form.emergencyReserveMonthsMultiplier || 3),
      budgetReserveManualTarget: form.budgetReserveManualTarget ? Number(form.budgetReserveManualTarget) : null,
      emergencyReserveManualTarget: form.emergencyReserveManualTarget ? Number(form.emergencyReserveManualTarget) : null,
      receivedIncomeLabel: form.receivedIncomeLabel.trim() || "Получено доходов",
      budgetReservePriorityLabel: form.budgetReservePriorityLabel.trim() || "Перевести в бюджетную кубышку",
      emergencyReservePriorityLabel: form.emergencyReservePriorityLabel.trim() || "Пополнить сейф безопасности",
      investmentsPriorityLabel: form.investmentsPriorityLabel.trim() || "Можно направить в инвестиции и цели",
    });

    const nextFunds = funds.map((fund) => {
      if (fund.fundType === "budget_reserve") {
        return {
          ...fund,
          targetMode: form.budgetReserveTargetMode,
          targetMultiplier: Number(form.budgetReserveMonthsMultiplier || 2),
          manualTargetAmount: form.budgetReserveManualTarget ? Number(form.budgetReserveManualTarget) : null,
          currency: form.baseCurrency,
        };
      }

      if (fund.fundType === "emergency_reserve") {
        return {
          ...fund,
          targetMode: form.emergencyReserveTargetMode,
          targetMultiplier: Number(form.emergencyReserveMonthsMultiplier || 3),
          manualTargetAmount: form.emergencyReserveManualTarget ? Number(form.emergencyReserveManualTarget) : null,
          currency: form.baseCurrency,
        };
      }

      return fund;
    });

    onSave(nextSettings, nextFunds);
  };

  return (
    <ModalShell title="Настройка резервов" onClose={onClose} compact>
      <div className="modal-header">
        <h2>Настроить резервы</h2>
      </div>
      <div className="modal-form">
        <label className="field">
          <span className="field-head"><span>Базовая валюта</span></span>
          <select value={form.baseCurrency} onChange={(event) => setForm((current) => ({ ...current, baseCurrency: event.target.value }))}>
            {cashflowCurrencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <div className="cashflow-settings-note">
          Цель резервов считается от регулярных трат: ежемесячные берутся целиком, а ежегодные делятся на 12.
        </div>
        <div className="field">
          <span className="field-head"><span>Бюджетная кубышка</span></span>
          <select value={form.budgetReserveTargetMode} onChange={(event) => setForm((current) => ({ ...current, budgetReserveTargetMode: event.target.value }))}>
            {cashflowTargetModeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {form.budgetReserveTargetMode === "manual" ? (
            <input value={formatNumberInput(form.budgetReserveManualTarget)} placeholder="160000" onChange={(event) => setForm((current) => ({ ...current, budgetReserveManualTarget: parseDigits(event.target.value) }))} />
          ) : (
            <input value={form.budgetReserveMonthsMultiplier} placeholder="2" onChange={(event) => setForm((current) => ({ ...current, budgetReserveMonthsMultiplier: parseDigits(event.target.value) }))} />
          )}
        </div>
        <div className="field">
          <span className="field-head"><span>Сейф безопасности</span></span>
          <select value={form.emergencyReserveTargetMode} onChange={(event) => setForm((current) => ({ ...current, emergencyReserveTargetMode: event.target.value }))}>
            {cashflowTargetModeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {form.emergencyReserveTargetMode === "manual" ? (
            <input value={formatNumberInput(form.emergencyReserveManualTarget)} placeholder="240000" onChange={(event) => setForm((current) => ({ ...current, emergencyReserveManualTarget: parseDigits(event.target.value) }))} />
          ) : (
            <input value={form.emergencyReserveMonthsMultiplier} placeholder="3" onChange={(event) => setForm((current) => ({ ...current, emergencyReserveMonthsMultiplier: parseDigits(event.target.value) }))} />
          )}
        </div>
        <label className="field">
          <span className="field-head"><span>Подпись: получено доходов</span></span>
          <input value={form.receivedIncomeLabel} onChange={(event) => setForm((current) => ({ ...current, receivedIncomeLabel: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Подпись: приоритет 1</span></span>
          <input value={form.budgetReservePriorityLabel} onChange={(event) => setForm((current) => ({ ...current, budgetReservePriorityLabel: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Подпись: приоритет 2</span></span>
          <input value={form.emergencyReservePriorityLabel} onChange={(event) => setForm((current) => ({ ...current, emergencyReservePriorityLabel: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Подпись: приоритет 3</span></span>
          <input value={form.investmentsPriorityLabel} onChange={(event) => setForm((current) => ({ ...current, investmentsPriorityLabel: event.target.value }))} />
        </label>
      </div>
      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-action-button" type="button" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowSnapshotDetailsModal({ snapshot, accounts, funds, onClose, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const account = accounts.find((item) => item.id === snapshot.accountId);
  const fund = funds.find((item) => item.id === snapshot.fundId);
  const accountName = account?.name ?? "Счёт";
  const fundName = fund?.name ?? getCashflowSystemFundLabel(fund?.fundType);
  const assetTypeLabel =
    cashflowAssetTypeOptions.find((option) => option.value === snapshot.assetType)?.label ?? snapshot.assetType;
  const ownerLabel = getCashflowOwnerLabel(snapshot.owner);

  return (
    <ModalShell title="Детали снимка баланса" onClose={onClose} compact>
      <div className="modal-header">
        <div>
          <h2>{`${accountName} · ${fundName}`}</h2>
          <div className="details-amount inline">{formatCurrency(snapshot.amountCzk)} Kč</div>
        </div>
      </div>

      <div className="details-stack">
        <div className="details-grid">
          <DetailRow label="Счёт / место хранения" value={accountName} />
          <DetailRow label="Фонд" value={fundName} />
          <DetailRow label="Дата обновления" value={formatSqlDateHuman(snapshot.snapshotDate)} />
          <DetailRow label="Тип актива" value={assetTypeLabel} />
          <DetailRow label="Владелец" value={ownerLabel} />
          <DetailRow label="Сумма в валюте" value={`${formatCurrency(snapshot.amount)} ${snapshot.currency}`} />
          <DetailRow
            label="Курс к CZK"
            value={snapshot.currency === "CZK" ? "1" : String(snapshot.exchangeRateToCzk)}
          />
          <DetailRow label="Сумма в CZK" value={`${formatCurrency(snapshot.amountCzk)} Kč`} />
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
            <p className="inline-confirm-title">Удалить снимок баланса?</p>
            <p className="inline-confirm-text">"{accountName} · {fundName}" будет удалён из списка балансов.</p>
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

function CashflowAccountEditorModal({ account, onClose, onSave }) {
  const isCreateMode = !account;
  const [form, setForm] = useState(() => ({
    name: account?.name ?? "",
    owner: account?.owner ?? "shared",
    accountType: account?.accountType ?? "bank",
    defaultCurrency: account?.defaultCurrency ?? DEFAULT_CASHFLOW_CURRENCY,
    isActive: account?.isActive ?? true,
  }));
  const isValid = form.name.trim().length > 0;

  return (
    <ModalShell title={isCreateMode ? "Новый счёт" : "Изменить счёт"} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить счёт" : "Изменить счёт"}</h2>
      </div>
      <div className="modal-form">
        <label className="field">
          <span className="field-head"><span>Название счёта *</span></span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Владелец счёта</span></span>
          <select value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}>
            {cashflowIncomeOwnerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Тип счёта</span></span>
          <select value={form.accountType} onChange={(event) => setForm((current) => ({ ...current, accountType: event.target.value }))}>
            {cashflowAccountTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Валюта по умолчанию</span></span>
          <select value={form.defaultCurrency} onChange={(event) => setForm((current) => ({ ...current, defaultCurrency: event.target.value }))}>
            {cashflowCurrencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
          <span>Показывать в списках</span>
        </label>
      </div>
      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button
            className="primary-action-button"
            type="button"
            disabled={!isValid}
            onClick={() => onSave({ ...(account ?? {}), ...form, name: form.name.trim() })}
          >
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowFundEditorModal({ fund, onClose, onSave }) {
  const isCreateMode = !fund;
  const [form, setForm] = useState(() => ({
    name: fund?.name ?? "",
    fundType: fund?.fundType ?? "savings_goal",
    currency: fund?.currency ?? DEFAULT_CASHFLOW_CURRENCY,
    isActive: fund?.isActive ?? true,
  }));
  const isValid = form.name.trim().length > 0;
  const typeOptions = [
    { value: "investments", label: "Инвестиции" },
    { value: "savings_goal", label: "Накопления / цели" },
    { value: "free_balance", label: "Свободный остаток" },
  ];

  return (
    <ModalShell title={isCreateMode ? "Новый фонд" : "Изменить фонд"} onClose={onClose} compact>
      <div className="modal-header">
        <h2>{isCreateMode ? "Добавить фонд" : "Изменить фонд"}</h2>
      </div>
      <div className="modal-form">
        <label className="field">
          <span className="field-head"><span>Название фонда *</span></span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className="field">
          <span className="field-head"><span>Тип фонда</span></span>
          <select
            value={form.fundType}
            disabled={Boolean(fund?.isSystem)}
            onChange={(event) => setForm((current) => ({ ...current, fundType: event.target.value }))}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-head"><span>Валюта</span></span>
          <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>
            {cashflowCurrencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
          <span>Показывать в списках</span>
        </label>
      </div>
      <div className="editor-footer">
        <div className="editor-actions">
          <button className="secondary-action-button" type="button" onClick={onClose}>Отмена</button>
          <button
            className="primary-action-button"
            type="button"
            disabled={!isValid}
            onClick={() =>
              onSave({
                ...(fund ?? {}),
                ...form,
                name: form.name.trim(),
                isSystem: fund?.isSystem ?? false,
                targetMode: fund?.targetMode ?? "manual",
                targetMultiplier: fund?.targetMultiplier ?? null,
                manualTargetAmount: fund?.manualTargetAmount ?? null,
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CashflowScreen({
  currentMonthLabel,
  currentMonthLabelGenitive,
  nextMonthLabel,
  nextMonthLabelGenitive,
  settings,
  totalCapitalCzk,
  budgetReserveCurrent,
  budgetReserveTarget,
  emergencyReserveCurrent,
  emergencyReserveTarget,
  nextMonthBudgetTotal,
  payerAllocation,
  budgetReserveReplenishment,
  incomeWaterfall,
  warnings,
  accounts,
  funds,
  snapshots,
  incomeEvents,
  errorMessage = "",
  onAddIncome,
  onAddSnapshot,
  onOpenSnapshot,
  onConfigureReserves,
  onRecalculate,
}) {
  const currentBalanceEntries = getCurrentBalanceEntries({ snapshots }).map((snapshot) => {
    const account = accounts.find((item) => item.id === snapshot.accountId);
    const fund = funds.find((item) => item.id === snapshot.fundId);
    return {
      ...snapshot,
      accountName: account?.name ?? "Счёт",
      fundName: fund?.name ?? getCashflowSystemFundLabel(fund?.fundType),
    };
  });
  const budgetReserveEntryCount = budgetReserveCurrent > 0
    ? getCurrentBalanceEntries({
        snapshots,
        fundId: funds.find((fund) => fund.fundType === "budget_reserve")?.id ?? null,
      }).length
    : 0;
  const emergencyReserveEntryCount = emergencyReserveCurrent > 0
    ? getCurrentBalanceEntries({
        snapshots,
        fundId: funds.find((fund) => fund.fundType === "emergency_reserve")?.id ?? null,
      }).length
    : 0;

  const currentMonthIncomeRows = [...incomeEvents]
    .sort((left, right) => new Date(right.incomeDate).getTime() - new Date(left.incomeDate).getTime())
    .slice(0, 5);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Потоки денег</p>
        <h1>Денежный поток</h1>
        <p className="page-note">
          Планируй, где лежат деньги, как финансируется следующий месяц и сколько нужно восстановить в резервы.
        </p>
      </header>

      {errorMessage ? (
        <section className="card cashflow-panel">
          <div className="cashflow-warning-list">
            <div className="cashflow-warning-chip">{errorMessage}</div>
          </div>
        </section>
      ) : null}

      <section className="cashflow-header-strip card">
        <div>
          <strong>Текущий месяц</strong>
          <span>{currentMonthLabel}</span>
        </div>
        <div>
          <strong>Следующий бюджетный месяц</strong>
          <span>{nextMonthLabel}</span>
        </div>
        <div className="cashflow-header-actions">
          <button className="secondary-action-button" type="button" onClick={onAddIncome}>Добавить доход</button>
          <button className="secondary-action-button" type="button" onClick={onAddSnapshot}>Обновить баланс</button>
          <button className="secondary-action-button" type="button" onClick={onConfigureReserves}>Настроить резервы</button>
          <button className="primary-action-button" type="button" onClick={onRecalculate}>Пересчитать</button>
        </div>
      </section>

      <div className="cashflow-summary-grid">
        <CashflowMetricCard label="Всего капитала" value={`${formatCurrency(totalCapitalCzk)} Kč`} />
        <CashflowMetricCard
          label="Бюджетная кубышка"
          value={formatAmountProgress(budgetReserveCurrent, budgetReserveTarget)}
          note={budgetReserveEntryCount ? `сейчас и цель · ${formatBalanceEntryCount(budgetReserveEntryCount)}` : "сейчас и цель"}
          accent={budgetReserveCurrent < budgetReserveTarget}
        />
        <CashflowMetricCard
          label="Сейф безопасности"
          value={formatAmountProgress(emergencyReserveCurrent, emergencyReserveTarget)}
          note={emergencyReserveEntryCount ? `сейчас и цель · ${formatBalanceEntryCount(emergencyReserveEntryCount)}` : "сейчас и цель"}
          accent={emergencyReserveCurrent < emergencyReserveTarget}
        />
        <CashflowMetricCard
          label="Нужно вернуть в кубышку"
          value={`${formatCurrency(budgetReserveReplenishment.replenishmentRequired)} Kč`}
          note={
            budgetReserveReplenishment.deficit
              ? `дефицит ${formatCurrency(budgetReserveReplenishment.deficit)} Kč`
              : `после бюджета ${nextMonthLabelGenitive}`
          }
        />
        <CashflowMetricCard
          label="Останется после резервов"
          value={`${formatCurrency(incomeWaterfall.availableForInvestments)} Kč`}
          note="на инвестиции, цели и свободный остаток"
        />
      </div>

      <div className="cashflow-layout">
        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Следующий бюджетный месяц</h2>
            <span>{nextMonthLabel}</span>
          </div>
          <div className="cashflow-details">
            <CashflowDetailRow label="Бюджет месяца" value={`${formatCurrency(nextMonthBudgetTotal)} Kč`} />
            <CashflowDetailRow
              label="Выделить из кубышки"
              value={`${formatCurrency(budgetReserveReplenishment.fundingAmount)} Kč`}
              hint={
                budgetReserveReplenishment.deficit
                  ? `Не хватает ${formatCurrency(budgetReserveReplenishment.deficit)} Kč`
                  : `Хватает на весь бюджет ${nextMonthLabelGenitive}`
              }
              danger={budgetReserveReplenishment.deficit > 0}
            />
          </div>
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Кому сколько перевести</h2>
            <span>по плательщику</span>
          </div>
          <div className="cashflow-details">
            <CashflowDetailRow label="Роме" value={`${formatCurrency(payerAllocation.roma)} Kč`} />
            <CashflowDetailRow label="Саше" value={`${formatCurrency(payerAllocation.sasha)} Kč`} />
            <CashflowDetailRow
              label="Без payer"
              value={`${formatCurrency(payerAllocation.unassigned)} Kč`}
              danger={payerAllocation.unassigned > 0}
            />
          </div>
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Возврат денег в кубышку</h2>
            <span>после оплаты {nextMonthLabelGenitive}</span>
          </div>
          <div className="cashflow-details">
            <CashflowDetailRow
              label={`На ${nextMonthLabelGenitive} уйдёт из кубышки`}
              value={`${formatCurrency(budgetReserveReplenishment.fundingAmount)} Kč`}
            />
            <CashflowDetailRow
              label={`Из доходов ${currentMonthLabelGenitive} уже можно вернуть`}
              value={`${formatCurrency(incomeWaterfall.budgetReserveCovered)} Kč`}
            />
            <CashflowDetailRow
              label="Осталось вернуть в кубышку"
              value={`${formatCurrency(Math.max(incomeWaterfall.budgetReserveNeed - incomeWaterfall.budgetReserveCovered, 0))} Kč`}
              hint="Чтобы кубышка вернулась к прежнему уровню после финансирования следующего месяца."
              danger={incomeWaterfall.budgetReserveCovered < incomeWaterfall.budgetReserveNeed}
            />
          </div>
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Распределение доходов</h2>
            <span>после получения доходов {currentMonthLabelGenitive}</span>
          </div>
          <div className="cashflow-details">
            <CashflowDetailRow
              label={`${settings.receivedIncomeLabel} в ${currentMonthLabelGenitive}`}
              value={`${formatCurrency(incomeWaterfall.receivedIncome)} Kč`}
            />
            <CashflowDetailRow
              label={`Приоритет 1 — ${settings.budgetReservePriorityLabel}`}
              value={formatAmountProgress(incomeWaterfall.budgetReserveCovered, incomeWaterfall.budgetReserveNeed)}
            />
            <CashflowDetailRow
              label={`Приоритет 2 — ${settings.emergencyReservePriorityLabel}`}
              value={formatAmountProgress(incomeWaterfall.emergencyReserveCovered, incomeWaterfall.emergencyReserveNeed)}
            />
            <CashflowDetailRow
              label={`Приоритет 3 — ${settings.investmentsPriorityLabel}`}
              value={`${formatCurrency(incomeWaterfall.availableForInvestments)} Kč`}
            />
          </div>
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Предупреждения</h2>
            <span>{warnings.length}</span>
          </div>
          {warnings.length ? (
            <div className="cashflow-warning-list">
              {warnings.map((warning) => (
                <div key={warning} className="cashflow-warning-chip">{warning}</div>
              ))}
            </div>
          ) : (
            <div className="cashflow-empty">Пока предупреждений нет.</div>
          )}
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Где сейчас лежат деньги</h2>
            <span>{formatBalanceEntryCount(currentBalanceEntries.length)}</span>
          </div>
          {currentBalanceEntries.length ? (
            <div className="cashflow-mini-list">
              {currentBalanceEntries.map((snapshot) => (
                <CashflowSnapshotRow
                  key={snapshot.id}
                  snapshot={snapshot}
                  onClick={() => onOpenSnapshot(snapshot)}
                />
              ))}
            </div>
          ) : (
            <div className="cashflow-empty">Пока нет актуальных балансов.</div>
          )}
        </section>

        <section className="card cashflow-panel">
          <div className="cashflow-panel-head">
            <h2>Доходы</h2>
            <span>{incomeEvents.length}</span>
          </div>
          {currentMonthIncomeRows.length ? (
            <div className="cashflow-mini-list">
              {currentMonthIncomeRows.map((event) => (
                <CashflowDetailRow
                  key={event.id}
                  label={`${getCashflowIncomeTypeLabel(event.incomeType)} · ${getCashflowOwnerLabel(event.owner)}`}
                  hint={`${event.incomeDate} · ${event.status === "received" ? "получено" : "ожидается"}`}
                  value={`${formatCurrency(event.amountCzk)} Kč`}
                />
              ))}
            </div>
          ) : (
            <div className="cashflow-empty">Пока нет доходов для текущего месяца.</div>
          )}
        </section>
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
  const currentMonthLabelGenitive = formatMonthYearGenitive(currentMonthContext.monthName, currentMonthContext.year);
  const nextMonthContext = getNextMonthContext(currentMonthContext);
  const nextMonthMeta = getMonthMetaByName(nextMonthContext.monthName);
  const nextMonthLabel = `${nextMonthContext.monthName} ${nextMonthContext.year}`;
  const nextMonthLabelGenitive = formatMonthYearGenitive(nextMonthContext.monthName, nextMonthContext.year);
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
  const [analyticsYear, setAnalyticsYear] = useState(() => getCurrentMonthContext().year);
  const [categoryEditorState, setCategoryEditorState] = useState(null);
  const [categoryConfirmState, setCategoryConfirmState] = useState(null);
  const [yearConfirmState, setYearConfirmState] = useState(null);
  const [yearAddModalOpen, setYearAddModalOpen] = useState(false);
  const [regularEditorState, setRegularEditorState] = useState(null);
  const [regularConfirmState, setRegularConfirmState] = useState(null);
  const [resetConfirmState, setResetConfirmState] = useState(null);
  const [cashflowState, setCashflowState] = useState(getInitialCashflowState);
  const [cashflowHydrated, setCashflowHydrated] = useState(!isSupabaseConfigured);
  const [cashflowError, setCashflowError] = useState("");
  const [incomeEditorState, setIncomeEditorState] = useState(null);
  const [incomeMonthEditorState, setIncomeMonthEditorState] = useState(null);
  const [snapshotEditorState, setSnapshotEditorState] = useState(null);
  const [selectedCashflowSnapshot, setSelectedCashflowSnapshot] = useState(null);
  const [cashflowReserveEditorOpen, setCashflowReserveEditorOpen] = useState(false);
  const [cashflowAccountEditorState, setCashflowAccountEditorState] = useState(null);
  const [cashflowFundEditorState, setCashflowFundEditorState] = useState(null);
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
  const cashflowAccounts = cashflowState.accounts;
  const cashflowFunds = cashflowState.funds;
  const cashflowSnapshots = cashflowState.snapshots;
  const cashflowIncomeEvents = cashflowState.incomeEvents;
  const cashflowSettings = cashflowState.settings;

  const handleNavigate = (item, index) => {
    setMobileNavOpen(false);

    if (index === 0) {
      setSelectedPeriodContext(null);
      setCurrentScreen("months");
      return;
    }
    if (item === "Денежный поток") {
      setSelectedPeriodContext(null);
      setCurrentScreen("cashflow");
      return;
    }
    if (item === "Доходы") {
      setSelectedPeriodContext(null);
      setCurrentScreen("incomes");
      return;
    }
    if (item === "Аналитика") {
      setSelectedPeriodContext(null);
      setCurrentScreen("analytics");
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
    if (isSupabaseConfigured) {
      return;
    }

    window.localStorage.setItem(CASHFLOW_STORAGE_KEY, JSON.stringify(cashflowState));
  }, [cashflowState]);

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
      yearAddModalOpen ||
      regularEditorState ||
      regularConfirmState ||
      resetConfirmState ||
      incomeEditorState ||
      incomeMonthEditorState ||
      selectedCashflowSnapshot ||
      snapshotEditorState ||
      cashflowReserveEditorOpen
    ) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [selectedExpense, selectedRegularTemplate, categoryEditorState, categoryConfirmState, yearConfirmState, yearAddModalOpen, regularEditorState, regularConfirmState, resetConfirmState, incomeEditorState, incomeMonthEditorState, selectedCashflowSnapshot, snapshotEditorState, cashflowReserveEditorOpen]);

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
    if (!isSupabaseConfigured) {
      setCashflowHydrated(true);
      return;
    }

    if (!authReady || !authUser || !supabaseHouseholdId) {
      return;
    }

    let isCancelled = false;

    const loadCashflow = async () => {
      try {
        setCashflowHydrated(false);
        setCashflowError("");
        const loadedState = await loadCashflowStateFromSupabase(supabaseHouseholdId);
        if (isCancelled) {
          return;
        }
        setCashflowState(loadedState);
        setCashflowHydrated(true);
      } catch (error) {
        console.error("Cashflow load failed:", error);
        if (isCancelled) {
          return;
        }
        setCashflowError("Не удалось загрузить данные Cashflow.");
        setCashflowHydrated(true);
      }
    };

    loadCashflow();

    return () => {
      isCancelled = true;
    };
  }, [authReady, authUser, supabaseHouseholdId]);

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
    return buildCombinedMonthExpenses({
      members,
      regularExpenses,
      monthContext: currentMonthContext,
    });
  }, [currentMonthContext, members, regularExpenses]);

  const currentMonthTotals = useMemo(() => {
    return {
      budget: currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      paid: currentMonthExpenses
        .filter((expense) => expense.completed)
        .reduce((sum, expense) => sum + expense.amount, 0),
    };
  }, [currentMonthExpenses]);

  const categoryBreakdown = useMemo(() => {
    return buildCategoryBreakdownFromExpenses(currentMonthExpenses, categories, currentMonthTotals.budget);
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
    return buildCategoryBreakdownFromExpenses(projectedNextMonthExpenses, categories, nextMonthTotals.budget);
  }, [categories, nextMonthTotals.budget, projectedNextMonthExpenses]);

  const selectedPeriodCategoryBreakdown = useMemo(() => {
    return buildCategoryBreakdownFromExpenses(selectedPeriodExpenses, categories, selectedPeriodTotals.budget);
  }, [categories, selectedPeriodExpenses, selectedPeriodTotals.budget]);

  const cashflowRegularMonthlyReserveBase = useMemo(
    () =>
      calculateRegularMonthlyReserveBase({
        regularExpenses,
        currentContext: currentMonthContext,
      }),
    [currentMonthContext, regularExpenses],
  );

  const budgetReserveFund = useMemo(
    () => cashflowFunds.find((fund) => fund.fundType === "budget_reserve") ?? null,
    [cashflowFunds],
  );
  const emergencyReserveFund = useMemo(
    () => cashflowFunds.find((fund) => fund.fundType === "emergency_reserve") ?? null,
    [cashflowFunds],
  );
  const budgetReserveCurrent = useMemo(
    () => (budgetReserveFund ? calculateFundCurrentBalance({ fundId: budgetReserveFund.id, snapshots: cashflowSnapshots }) : 0),
    [budgetReserveFund, cashflowSnapshots],
  );
  const emergencyReserveCurrent = useMemo(
    () => (emergencyReserveFund ? calculateFundCurrentBalance({ fundId: emergencyReserveFund.id, snapshots: cashflowSnapshots }) : 0),
    [cashflowSnapshots, emergencyReserveFund],
  );
  const budgetReserveTarget = useMemo(
    () => calculateBudgetReserveTarget({ settings: cashflowSettings, funds: cashflowFunds, regularMonthlyReserveBase: cashflowRegularMonthlyReserveBase }),
    [cashflowFunds, cashflowRegularMonthlyReserveBase, cashflowSettings],
  );
  const emergencyReserveTarget = useMemo(
    () => calculateEmergencyReserveTarget({ settings: cashflowSettings, funds: cashflowFunds, regularMonthlyReserveBase: cashflowRegularMonthlyReserveBase }),
    [cashflowFunds, cashflowRegularMonthlyReserveBase, cashflowSettings],
  );
  const nextMonthBudgetTotalForCashflow = useMemo(
    () => calculateNextMonthBudgetTotal(projectedNextMonthExpenses),
    [projectedNextMonthExpenses],
  );
  const nextMonthPayerAllocation = useMemo(
    () => calculatePayerAllocationFromBudgetItems(projectedNextMonthExpenses),
    [projectedNextMonthExpenses],
  );
  const budgetReserveReplenishment = useMemo(
    () =>
      calculateBudgetReserveReplenishment({
        nextMonthBudgetTotal: nextMonthBudgetTotalForCashflow,
        budgetReserveCurrent,
      }),
    [budgetReserveCurrent, nextMonthBudgetTotalForCashflow],
  );
  const incomeWaterfall = useMemo(
    () =>
      calculateIncomeWaterfall({
        incomeEvents: cashflowIncomeEvents,
        currentContext: currentMonthContext,
        budgetReserveReplenishmentRequired: budgetReserveReplenishment.replenishmentRequired,
        budgetReserveCurrent,
        budgetReserveTarget,
        emergencyReserveCurrent,
        emergencyReserveTarget,
      }),
    [
      budgetReserveCurrent,
      budgetReserveReplenishment.replenishmentRequired,
      budgetReserveTarget,
      cashflowIncomeEvents,
      currentMonthContext,
      emergencyReserveCurrent,
      emergencyReserveTarget,
    ],
  );
  const cashflowWarnings = useMemo(
    () =>
      calculateCashflowWarnings({
        nextMonthBudgetTotal: nextMonthBudgetTotalForCashflow,
        budgetReserveCurrent,
        budgetReserveTarget,
        emergencyReserveCurrent,
        emergencyReserveTarget,
        payerAllocation: nextMonthPayerAllocation,
        snapshots: cashflowSnapshots,
      }),
    [
      budgetReserveCurrent,
      budgetReserveTarget,
      cashflowSnapshots,
      emergencyReserveCurrent,
      emergencyReserveTarget,
      nextMonthBudgetTotalForCashflow,
      nextMonthPayerAllocation,
    ],
  );
  const cashflowTotalCapital = useMemo(
    () => calculateTotalCapitalCzk({ snapshots: cashflowSnapshots }),
    [cashflowSnapshots],
  );

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

    currentMonthExpenses.forEach((expense) => {
      const payer = getExpensePayer(expense);
      if (!payerGroups[payer]) {
        return;
      }

      const fallbackMember =
        expense.sourceMember ??
        members.find((member) => member.name === normalizeOwnerName(expense.owner, payer)) ??
        members.find((member) => member.name === payer) ??
        null;

      payerGroups[payer].expenses.push({
        ...expense,
        sourceMember: fallbackMember ?? expense.sourceMember,
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
  }, [currentMonthExpenses, members]);

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

  const analyticsAvailableYears = useMemo(() => yearCards.map((card) => card.year), [yearCards]);

  useEffect(() => {
    if (analyticsAvailableYears.length === 0) {
      if (analyticsYear !== currentMonthContext.year) {
        setAnalyticsYear(currentMonthContext.year);
      }
      return;
    }

    if (!analyticsAvailableYears.includes(analyticsYear)) {
      setAnalyticsYear(analyticsAvailableYears[0]);
    }
  }, [analyticsAvailableYears, analyticsYear, currentMonthContext.year]);

  const analyticsYearExpenses = useMemo(() => {
    if (!analyticsYear) {
      return [];
    }

    const currentOrder = getPeriodOrderKey(currentMonthContext.year, currentMonthContext.monthName);

    return fullMonthNames.flatMap((monthName) => {
      const monthContext = buildMonthContext(analyticsYear, monthName);
      const monthOrder = getPeriodOrderKey(analyticsYear, monthName);

      if (monthOrder > currentOrder) {
        return buildCombinedMonthExpenses({
          members,
          regularExpenses,
          monthContext,
        });
      }

      return getMemberExpensesForMonth(members, monthContext);
    });
  }, [analyticsYear, currentMonthContext.monthName, currentMonthContext.year, members, regularExpenses]);

  const analyticsYearBudgetTotal = useMemo(
    () => analyticsYearExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [analyticsYearExpenses],
  );

  const analyticsYearCategoryBreakdown = useMemo(
    () => buildCategoryBreakdownFromExpenses(analyticsYearExpenses, categories, analyticsYearBudgetTotal),
    [analyticsYearBudgetTotal, analyticsYearExpenses, categories],
  );

  const analyticsYearMonthsWithData = useMemo(() => {
    if (!analyticsYear) {
      return 0;
    }

    return fullMonthNames.reduce((count, monthName) => {
      const monthContext = buildMonthContext(analyticsYear, monthName);
      const hasAnyExpense = analyticsYearExpenses.some(
        (expense) => isExpenseInPeriod(expense, monthContext.year, monthContext.monthName),
      );

      return hasAnyExpense ? count + 1 : count;
    }, 0);
  }, [analyticsYear, analyticsYearExpenses]);

  const analyticsYearIncomeSummary = useMemo(
    () =>
      calculateYearIncomeSummary({
        incomeEvents: cashflowIncomeEvents,
        selectedYear: analyticsYear,
        currentContext: currentMonthContext,
        expenseTotal: analyticsYearBudgetTotal,
      }),
    [analyticsYear, analyticsYearBudgetTotal, cashflowIncomeEvents, currentMonthContext],
  );

  const incomeAvailableYears = useMemo(() => {
    const incomeYears = cashflowIncomeEvents.map((event) => parseSqlDateParts(event.incomeDate).year);
    const years = new Set([...trackedYears, ...incomeYears, currentMonthContext.year]);
    return [...years].sort((left, right) => right - left);
  }, [cashflowIncomeEvents, currentMonthContext.year, trackedYears]);

  const incomeYearSummary = useMemo(
    () =>
      calculateYearIncomeSummary({
        incomeEvents: cashflowIncomeEvents,
        selectedYear: analyticsYear,
        currentContext: currentMonthContext,
        expenseTotal: analyticsYearBudgetTotal,
      }),
    [analyticsYear, analyticsYearBudgetTotal, cashflowIncomeEvents, currentMonthContext],
  );

  const incomeMonthRowsByPeriodKey = useMemo(() => {
    const rows = new Map();

    incomeAvailableYears.forEach((year) => {
      fullMonthNames.forEach((monthName, monthIndex) => {
        rows.set(
          `${year}-${monthIndex}`,
          buildIncomeMonthRow({
            incomeEvents: cashflowIncomeEvents,
            selectedYear: year,
            monthName,
            monthIndex,
            currentContext: currentMonthContext,
          }),
        );
      });
    });

    return rows;
  }, [cashflowIncomeEvents, currentMonthContext, incomeAvailableYears]);

  const incomeYearMonthlyRows = useMemo(() => {
    return [...fullMonthNames].reverse().map((monthName) => {
      const monthIndex = fullMonthNames.findIndex((item) => item === monthName);
      return (
        incomeMonthRowsByPeriodKey.get(`${analyticsYear}-${monthIndex}`) ??
        buildIncomeMonthRow({
          incomeEvents: [],
          selectedYear: analyticsYear,
          monthName,
          monthIndex,
          currentContext: currentMonthContext,
        })
      );
    });
  }, [analyticsYear, currentMonthContext, incomeMonthRowsByPeriodKey]);

  const nextMonthIncomeProjection = useMemo(() => {
    const row =
      incomeMonthRowsByPeriodKey.get(`${nextMonthContext.year}-${nextMonthContext.monthIndex}`) ??
      buildIncomeMonthRow({
        incomeEvents: [],
        selectedYear: nextMonthContext.year,
        monthName: nextMonthContext.monthName,
        monthIndex: nextMonthContext.monthIndex,
        currentContext: currentMonthContext,
      });

    return {
      expectedIncome: row.expectedTotal,
      hasIncomeData: row.expectedTotal > 0 || row.received > 0,
    };
  }, [currentMonthContext, incomeMonthRowsByPeriodKey, nextMonthContext]);

  const selectedPeriodIncomeProjection = useMemo(() => {
    if (!selectedPeriodContext || !selectedPeriodIsFuture) {
      return null;
    }

    const row =
      incomeMonthRowsByPeriodKey.get(`${selectedPeriodContext.year}-${selectedPeriodContext.monthIndex}`) ??
      buildIncomeMonthRow({
        incomeEvents: [],
        selectedYear: selectedPeriodContext.year,
        monthName: selectedPeriodContext.monthName,
        monthIndex: selectedPeriodContext.monthIndex,
        currentContext: currentMonthContext,
      });

    return {
      expectedIncome: row.expectedTotal,
      hasIncomeData: row.expectedTotal > 0 || row.received > 0,
    };
  }, [currentMonthContext, incomeMonthRowsByPeriodKey, selectedPeriodContext, selectedPeriodIsFuture]);

  const handleToggleExpense = async (memberId, expenseOrId) => {
    const snapshot = latestSnapshotRef.current;
    const toggledExpense = typeof expenseOrId === "string" ? null : expenseOrId;
    const toggledExpenseId = typeof expenseOrId === "string" ? expenseOrId : expenseOrId?.id;
    const targetMemberId = toggledExpense?.sourceMember?.id ?? memberId;

    const nextMembers = snapshot.members.map((member) => {
      if (member.id !== targetMemberId) {
        return member;
      }

      const existingIndex = member.expenses.findIndex((expense) => expense.id === toggledExpenseId);
      if (existingIndex >= 0) {
        return {
          ...member,
          expenses: member.expenses.map((expense, index) =>
            index !== existingIndex
              ? expense
              : { ...expense, completed: !expense.completed },
          ),
        };
      }

      if (!toggledExpense?.templateId) {
        return member;
      }

      const matchedTemplate = snapshot.regularExpenses.find((template) => template.id === toggledExpense.templateId);
      if (!matchedTemplate) {
        return member;
      }

      const materializedExpense = {
        id: matchedTemplate.sourceExpenseId || toggledExpenseId || `series-expense-${Date.now()}`,
        title: matchedTemplate.title,
        amount: Number(getRegularAmountForPeriod(matchedTemplate, currentMonthContext.year, currentMonthContext.monthName) ?? toggledExpense.amount ?? 0),
        cadence: matchedTemplate.cadence,
        category: matchedTemplate.category,
        owner: matchedTemplate.owner,
        payer: matchedTemplate.payer,
        month: monthOptions[currentMonthContext.monthIndex],
        year: currentMonthContext.year,
        frequency: matchedTemplate.frequency,
        dayOfMonth: matchedTemplate.dayOfMonth,
        completed: true,
        urgent: false,
        dueLabel: buildDueLabel({
          frequency: matchedTemplate.frequency,
          dayOfMonth: matchedTemplate.dayOfMonth,
          month: monthOptions[currentMonthContext.monthIndex],
          urgent: false,
          completed: true,
        }),
      };

      return {
        ...member,
        expenses: [...member.expenses, materializedExpense],
      };
    });

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

  const reloadCashflowState = async () => {
    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      return;
    }

    try {
      setCashflowHydrated(false);
      setCashflowError("");
      const loadedState = await loadCashflowStateFromSupabase(supabaseHouseholdId);
      setCashflowState(loadedState);
    } catch (error) {
      console.error("Cashflow reload failed:", error);
      setCashflowError("Не удалось пересчитать или загрузить данные Cashflow.");
    } finally {
      setCashflowHydrated(true);
    }
  };

  const handleSaveCashflowIncome = async (eventDraft) => {
    const normalizedEvent = normalizeCashflowIncomeEvent(eventDraft);

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          incomeEvents: [normalizedEvent, ...current.incomeEvents.filter((item) => item.id !== normalizedEvent.id)],
        }),
      );
      setIncomeEditorState(null);
      return;
    }

    const savedId = await saveCashflowIncomeEventToSupabase({
      householdId: supabaseHouseholdId,
      event: normalizedEvent,
    });
    await reloadCashflowState();
    setIncomeEditorState(null);
    return savedId;
  };

  const handleSaveIncomeMonthPlan = async (monthDraft) => {
    const incomeDate = buildSqlDate(monthDraft.year, monthDraft.monthIndex + 1, 1);
    const planEvents = cashflowIncomeEvents.filter((event) => {
      const eventDate = parseSqlDateParts(event.incomeDate);
      return (
        eventDate.year === monthDraft.year &&
        Math.max(eventDate.month - 1, 0) === monthDraft.monthIndex &&
        event.incomeType === "salary"
      );
    });

    const existingRoma = planEvents.find((event) => event.status === "expected" && event.owner === "roma");
    const existingSasha = planEvents.find((event) => event.status === "expected" && event.owner === "sasha");
    const existingActualRoma = planEvents.find((event) => event.status === "received" && event.owner === "roma");
    const existingActualSasha = planEvents.find((event) => event.status === "received" && event.owner === "sasha");
    const legacySharedSalaryEvents = planEvents.filter((event) => event.owner === "shared");

    const operations = [
      {
        existing: existingRoma,
        amount: monthDraft.expectedRoma,
        payload: {
          ...(existingRoma ?? {}),
          incomeDate,
          owner: "roma",
          incomeType: "salary",
          status: "expected",
          expectedAmount: monthDraft.expectedRoma,
          actualAmount: 0,
          currency: "CZK",
          exchangeRateToCzk: 1,
          amountCzk: monthDraft.expectedRoma,
          note: "План дохода Ромы",
        },
      },
      {
        existing: existingSasha,
        amount: monthDraft.expectedSasha,
        payload: {
          ...(existingSasha ?? {}),
          incomeDate,
          owner: "sasha",
          incomeType: "salary",
          status: "expected",
          expectedAmount: monthDraft.expectedSasha,
          actualAmount: 0,
          currency: "CZK",
          exchangeRateToCzk: 1,
          amountCzk: monthDraft.expectedSasha,
          note: "План дохода Саши",
        },
      },
      {
        existing: existingActualRoma,
        amount: monthDraft.actualRoma,
        payload: {
          ...(existingActualRoma ?? {}),
          incomeDate,
          owner: "roma",
          incomeType: "salary",
          status: "received",
          expectedAmount: 0,
          actualAmount: monthDraft.actualRoma,
          currency: "CZK",
          exchangeRateToCzk: 1,
          amountCzk: monthDraft.actualRoma,
          note: "Фактический доход Ромы",
        },
      },
      {
        existing: existingActualSasha,
        amount: monthDraft.actualSasha,
        payload: {
          ...(existingActualSasha ?? {}),
          incomeDate,
          owner: "sasha",
          incomeType: "salary",
          status: "received",
          expectedAmount: 0,
          actualAmount: monthDraft.actualSasha,
          currency: "CZK",
          exchangeRateToCzk: 1,
          amountCzk: monthDraft.actualSasha,
          note: "Фактический доход Саши",
        },
      },
    ];

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) => {
        let nextEvents = current.incomeEvents.filter(
          (item) => !legacySharedSalaryEvents.some((legacyEvent) => legacyEvent.id === item.id),
        );

        operations.forEach(({ existing, amount, payload }) => {
          if (amount > 0) {
            const normalizedPayload = normalizeCashflowIncomeEvent({
              ...payload,
              id: existing?.id ?? `cashflow-income-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            });
            nextEvents = [
              normalizedPayload,
              ...nextEvents.filter((item) => item.id !== normalizedPayload.id),
            ];
          } else if (existing) {
            nextEvents = nextEvents.filter((item) => item.id !== existing.id);
          }
        });

        return normalizeCashflowState({
          ...current,
          incomeEvents: nextEvents,
        });
      });
      setIncomeMonthEditorState(null);
      return;
    }

    for (const { existing, amount, payload } of operations) {
      if (amount > 0) {
        await saveCashflowIncomeEventToSupabase({
          householdId: supabaseHouseholdId,
          event: payload,
        });
      } else if (existing?.id && !String(existing.id).startsWith("cashflow-income-")) {
        await deleteCashflowIncomeEventFromSupabase(existing.id);
      }
    }

    for (const legacyEvent of legacySharedSalaryEvents) {
      if (legacyEvent?.id && !String(legacyEvent.id).startsWith("cashflow-income-")) {
        await deleteCashflowIncomeEventFromSupabase(legacyEvent.id);
      }
    }

    await reloadCashflowState();
    setIncomeMonthEditorState(null);
  };

  const handleSaveCashflowSnapshot = async (snapshotDraft, accountDraft) => {
    const normalizedSnapshot = normalizeCashflowSnapshot(snapshotDraft);

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      const nextAccount =
        accountDraft?.name?.trim()
          ? normalizeCashflowAccount({
              id: normalizedSnapshot.accountId || `cashflow-account-${Date.now()}`,
              name: accountDraft.name.trim(),
              owner: accountDraft.owner,
              accountType: accountDraft.accountType,
              defaultCurrency: accountDraft.defaultCurrency,
            })
          : null;
      const accountId = nextAccount?.id || normalizedSnapshot.accountId || "";
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          accounts: nextAccount
            ? current.accounts.some((account) => account.id === nextAccount.id)
              ? current.accounts.map((account) => (account.id === nextAccount.id ? nextAccount : account))
              : [...current.accounts, nextAccount]
            : current.accounts,
          snapshots: [
            { ...normalizedSnapshot, id: normalizedSnapshot.id || `cashflow-snapshot-${Date.now()}`, accountId },
            ...current.snapshots.filter((item) => item.id !== normalizedSnapshot.id),
          ],
        }),
      );
      setSnapshotEditorState(null);
      return;
    }

    await saveCashflowSnapshotToSupabase({
      householdId: supabaseHouseholdId,
      snapshot: normalizedSnapshot,
      accountDraft,
      existingAccounts: cashflowAccounts,
    });
    await reloadCashflowState();
    setSnapshotEditorState(null);
  };

  const handleDeleteCashflowSnapshot = async (snapshot) => {
    if (!snapshot) {
      return;
    }

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          snapshots: current.snapshots.filter((item) => item.id !== snapshot.id),
        }),
      );
      setSelectedCashflowSnapshot(null);
      return;
    }

    if (snapshot.id && !String(snapshot.id).startsWith("cashflow-snapshot-")) {
      await deleteCashflowSnapshotFromSupabase(snapshot.id);
    }

    await reloadCashflowState();
    setSelectedCashflowSnapshot(null);
  };

  const handleSaveCashflowReserves = async (nextSettings, nextFunds) => {
    const normalizedState = normalizeCashflowState({
      accounts: cashflowAccounts,
      funds: nextFunds,
      snapshots: cashflowSnapshots,
      incomeEvents: cashflowIncomeEvents,
      settings: nextSettings,
    });

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState(normalizedState);
      setCashflowReserveEditorOpen(false);
      return;
    }

    await saveCashflowSettingsToSupabase({
      householdId: supabaseHouseholdId,
      settings: normalizedState.settings,
      funds: normalizedState.funds.filter((fund) =>
        fund.fundType === "budget_reserve" || fund.fundType === "emergency_reserve",
      ),
    });
    await reloadCashflowState();
    setCashflowReserveEditorOpen(false);
  };

  const handleSaveCashflowAccount = async (accountDraft) => {
    const normalizedAccount = normalizeCashflowAccount(accountDraft);

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          accounts: current.accounts.some((account) => account.id === normalizedAccount.id)
            ? current.accounts.map((account) => (account.id === normalizedAccount.id ? normalizedAccount : account))
            : [...current.accounts, { ...normalizedAccount, id: normalizedAccount.id || `cashflow-account-${Date.now()}` }],
        }),
      );
      setCashflowAccountEditorState(null);
      return;
    }

    await saveCashflowAccountToSupabase({ householdId: supabaseHouseholdId, account: normalizedAccount });
    await reloadCashflowState();
    setCashflowAccountEditorState(null);
  };

  const handleDeleteCashflowAccount = async (account) => {
    if (!account) {
      return;
    }

    if (cashflowSnapshots.some((snapshot) => snapshot.accountId === account.id)) {
      setCategoryConfirmState({
        title: "Нельзя удалить счёт",
        description: `Счёт "${account.name}" уже используется в снимках баланса. Сначала измени или удали эти снимки.`,
        onConfirm: () => setCategoryConfirmState(null),
      });
      return;
    }

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          accounts: current.accounts.filter((item) => item.id !== account.id),
        }),
      );
      return;
    }

    await deleteCashflowAccountFromSupabase(account.id);
    await reloadCashflowState();
  };

  const handleSaveCashflowFund = async (fundDraft) => {
    const normalizedFund = normalizeCashflowFund(fundDraft);

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          funds: current.funds.some((fund) => fund.id === normalizedFund.id)
            ? current.funds.map((fund) => (fund.id === normalizedFund.id ? normalizedFund : fund))
            : [...current.funds, { ...normalizedFund, id: normalizedFund.id || `cashflow-fund-${Date.now()}` }],
        }),
      );
      setCashflowFundEditorState(null);
      return;
    }

    await saveCashflowFundToSupabase({ householdId: supabaseHouseholdId, fund: normalizedFund });
    await reloadCashflowState();
    setCashflowFundEditorState(null);
  };

  const handleDeleteCashflowFund = async (fund) => {
    if (!fund) {
      return;
    }

    if (fund.isSystem) {
      setCategoryConfirmState({
        title: "Нельзя удалить системный фонд",
        description: `Фонд "${fund.name}" системный. Его можно переименовать, но не удалить.`,
        onConfirm: () => setCategoryConfirmState(null),
      });
      return;
    }

    if (cashflowSnapshots.some((snapshot) => snapshot.fundId === fund.id)) {
      setCategoryConfirmState({
        title: "Нельзя удалить фонд",
        description: `Фонд "${fund.name}" уже используется в снимках баланса. Сначала измени или удали эти снимки.`,
        onConfirm: () => setCategoryConfirmState(null),
      });
      return;
    }

    if (!isSupabaseConfigured || !supabaseHouseholdId) {
      setCashflowState((current) =>
        normalizeCashflowState({
          ...current,
          funds: current.funds.filter((item) => item.id !== fund.id),
        }),
      );
      return;
    }

    await deleteCashflowFundFromSupabase(fund.id);
    await reloadCashflowState();
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

  if (currentScreen === "cashflow" && !cashflowHydrated) {
    return (
      <main className="app-shell app-loading-shell">
        <section className="app-loading-card" aria-live="polite">
          <div className="app-loading-badge">
            <span className="brand-accent" />
            Family Budget
          </div>
          <h1>Собираем денежный поток</h1>
          <p>Подтягиваем счета, резервы, снимки баланса и доходы из Supabase.</p>
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
    const isRecurring = updates.frequency === "Каждый месяц" || updates.frequency === "Раз в год";
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

    const initialEffectiveContext = isRecurring
      ? getInitialRegularEffectiveContext({
          seedYear: nextExpense.year ?? currentMonthContext.year,
          seedMonthName: normalizeMonthName(nextExpense.month),
          dayOfMonth: updates.dayOfMonth,
          frequency: updates.frequency,
        })
      : null;
    const expenseOrder = getPeriodOrderKey(nextExpense.year ?? currentMonthContext.year, normalizeMonthName(nextExpense.month));
    const initialEffectiveOrder = initialEffectiveContext
      ? getPeriodOrderKey(initialEffectiveContext.year, initialEffectiveContext.monthName)
      : expenseOrder;
    const shouldMaterializeDraftExpense = !isDraft || !isRecurring || initialEffectiveOrder <= expenseOrder;

    const nextMembers = snapshot.members.map((currentMember) =>
      currentMember.id !== member.id
        ? currentMember
        : {
            ...currentMember,
            expenses: isDraft
              ? shouldMaterializeDraftExpense
                ? [...currentMember.expenses, nextExpense]
                : currentMember.expenses
              : currentMember.expenses.map((currentExpense) => {
                  if (currentExpense.id !== expense.id) {
                    return currentExpense;
                  }

                  return nextExpense;
                }),
          },
    );

    const nextRegularExpenses = (() => {
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
    setYearAddModalOpen(true);
  };

  const handleConfirmAddYear = (selectedYear) => {
    if (!Number.isFinite(selectedYear)) {
      return;
    }

    setTrackedYears((current) => {
      if (current.includes(selectedYear)) {
        return current;
      }

      return [...current, selectedYear].sort((left, right) => right - left);
    });
    setExpandedYears((current) => ({ ...current, [selectedYear]: true }));
    setYearAddModalOpen(false);
  };

  const handleDeleteYear = (year) => {
    const currentYear = getCurrentMonthContext().year;
    if (year <= currentYear) {
      return;
    }

    setYearConfirmState({
      year,
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
      const initialEffectiveContext = getInitialRegularEffectiveContext({
        seedYear: currentMonthContext.year,
        seedMonthName: currentMonthContext.monthName,
        dayOfMonth: updates.dayOfMonth,
        frequency: updates.frequency,
      });
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
            effectiveYear: initialEffectiveContext.year,
            effectiveMonth: initialEffectiveContext.monthName,
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
              onOpenCashflowAccounts={() => setCurrentScreen("cashflowAccounts")}
              onOpenCashflowFunds={() => setCurrentScreen("cashflowFunds")}
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

          {currentScreen === "cashflowAccounts" ? (
            <CashflowAccountsSettingsScreen
              accounts={cashflowAccounts}
              snapshots={cashflowSnapshots}
              onBackToSettings={() => setCurrentScreen("settings")}
              onOpenCreate={() => setCashflowAccountEditorState({})}
              onOpenEdit={(account) => setCashflowAccountEditorState(account)}
              onRequestDelete={(account) =>
                setCategoryConfirmState({
                  title: `Удалить счёт "${account.name}"?`,
                  description: "Счёт будет удалён из справочника потоков денег, если он нигде не используется.",
                  onConfirm: async () => {
                    await handleDeleteCashflowAccount(account);
                    setCategoryConfirmState(null);
                  },
                })
              }
            />
          ) : null}

          {currentScreen === "cashflowFunds" ? (
            <CashflowFundsSettingsScreen
              funds={cashflowFunds}
              snapshots={cashflowSnapshots}
              onBackToSettings={() => setCurrentScreen("settings")}
              onOpenCreate={() => setCashflowFundEditorState({})}
              onOpenEdit={(fund) => setCashflowFundEditorState(fund)}
              onRequestDelete={(fund) =>
                setCategoryConfirmState({
                  title: `Удалить фонд "${fund.name}"?`,
                  description: "Фонд будет удалён из справочника потоков денег, если он нигде не используется.",
                  onConfirm: async () => {
                    await handleDeleteCashflowFund(fund);
                    setCategoryConfirmState(null);
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
              projection={nextMonthIncomeProjection}
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
              projection={selectedPeriodIsFuture ? selectedPeriodIncomeProjection : null}
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

          {currentScreen === "incomes" ? (
            <IncomeScreen
              selectedYear={analyticsYear}
              availableYears={incomeAvailableYears}
              onSelectYear={setAnalyticsYear}
              summary={incomeYearSummary}
              monthlyRows={incomeYearMonthlyRows}
              onEditMonth={(row) => setIncomeMonthEditorState(row)}
            />
          ) : null}

          {currentScreen === "analytics" ? (
            <AnalyticsScreen
              selectedYear={analyticsYear}
              availableYears={analyticsAvailableYears}
              onSelectYear={setAnalyticsYear}
              totalBudget={analyticsYearBudgetTotal}
              categoryBreakdown={analyticsYearCategoryBreakdown}
              monthsWithData={analyticsYearMonthsWithData}
              incomeOutcome={analyticsYearIncomeSummary}
            />
          ) : null}

          {currentScreen === "cashflow" ? (
            <CashflowScreen
              currentMonthLabel={currentMonthLabel}
              currentMonthLabelGenitive={currentMonthLabelGenitive}
              nextMonthLabel={nextMonthLabel}
              nextMonthLabelGenitive={nextMonthLabelGenitive}
              settings={cashflowSettings}
              totalCapitalCzk={cashflowTotalCapital}
              budgetReserveCurrent={budgetReserveCurrent}
              budgetReserveTarget={budgetReserveTarget}
              emergencyReserveCurrent={emergencyReserveCurrent}
              emergencyReserveTarget={emergencyReserveTarget}
              nextMonthBudgetTotal={nextMonthBudgetTotalForCashflow}
              payerAllocation={nextMonthPayerAllocation}
              budgetReserveReplenishment={budgetReserveReplenishment}
              incomeWaterfall={incomeWaterfall}
              warnings={cashflowWarnings}
              accounts={cashflowAccounts}
              funds={cashflowFunds}
              snapshots={cashflowSnapshots}
              incomeEvents={cashflowIncomeEvents}
              errorMessage={cashflowError}
              onAddIncome={() => setIncomeEditorState({})}
              onAddSnapshot={() => setSnapshotEditorState({})}
              onOpenSnapshot={(snapshot) => setSelectedCashflowSnapshot(snapshot)}
              onConfigureReserves={() => setCashflowReserveEditorOpen(true)}
              onRecalculate={reloadCashflowState}
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
        <YearDeleteConfirmModal
          year={yearConfirmState.year}
          onClose={() => setYearConfirmState(null)}
          onConfirm={yearConfirmState.onConfirm}
        />
      ) : null}

      {yearAddModalOpen ? (
        <YearAddModal
          trackedYears={trackedYears}
          onClose={() => setYearAddModalOpen(false)}
          onConfirm={handleConfirmAddYear}
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

      {incomeEditorState ? (
        <CashflowIncomeEditorModal
          incomeEvent={incomeEditorState}
          onClose={() => setIncomeEditorState(null)}
          onSave={handleSaveCashflowIncome}
        />
      ) : null}

      {incomeMonthEditorState ? (
        <CashflowMonthlyIncomeModal
          monthRow={incomeMonthEditorState}
          onClose={() => setIncomeMonthEditorState(null)}
          onSave={handleSaveIncomeMonthPlan}
        />
      ) : null}

      {selectedCashflowSnapshot ? (
        <CashflowSnapshotDetailsModal
          snapshot={selectedCashflowSnapshot}
          accounts={cashflowAccounts}
          funds={cashflowFunds}
          onClose={() => setSelectedCashflowSnapshot(null)}
          onEdit={() => {
            setSnapshotEditorState(selectedCashflowSnapshot);
            setSelectedCashflowSnapshot(null);
          }}
          onDelete={() => handleDeleteCashflowSnapshot(selectedCashflowSnapshot)}
        />
      ) : null}

      {snapshotEditorState ? (
        <CashflowSnapshotEditorModal
          snapshot={snapshotEditorState}
          accounts={cashflowAccounts}
          funds={cashflowFunds}
          onClose={() => setSnapshotEditorState(null)}
          onSave={handleSaveCashflowSnapshot}
        />
      ) : null}

      {cashflowAccountEditorState ? (
        <CashflowAccountEditorModal
          account={cashflowAccountEditorState.id ? cashflowAccountEditorState : null}
          onClose={() => setCashflowAccountEditorState(null)}
          onSave={handleSaveCashflowAccount}
        />
      ) : null}

      {cashflowFundEditorState ? (
        <CashflowFundEditorModal
          fund={cashflowFundEditorState.id ? cashflowFundEditorState : null}
          onClose={() => setCashflowFundEditorState(null)}
          onSave={handleSaveCashflowFund}
        />
      ) : null}

      {cashflowReserveEditorOpen ? (
        <CashflowReserveEditorModal
          settings={cashflowSettings}
          funds={cashflowFunds}
          onClose={() => setCashflowReserveEditorOpen(false)}
          onSave={handleSaveCashflowReserves}
        />
      ) : null}
    </>
  );
}
