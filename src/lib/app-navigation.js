export const navigationItems = [
  "Бюджет",
  "Сбережения",
  "Доходы",
  "Аналитика",
  "Памятные даты",
  "Настройка",
]

export const mobileFooterItems = [
  { key: "budget", label: "Бюджет", icon: "📅" },
  { key: "incomes", label: "Доходы", icon: "🤑" },
  { key: "analytics", label: "Аналитика", icon: "📊" },
  { key: "cashflow", label: "Сбережения", icon: "💸" },
  { key: "settings", label: "Настройки", icon: "⚙️" },
]

export const supportedScreenNames = new Set([
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
  "cashflowAccounts",
  "cashflowFunds",
])

const budgetScreenNames = new Set([
  "months",
  "periodMonth",
  "month",
  "nextMonth",
  "regular",
])

const settingsScreenNames = new Set([
  "settings",
  "categories",
  "cashflowAccounts",
  "cashflowFunds",
])

const screenByNavigationItem = {
  Сбережения: "cashflow",
  Доходы: "incomes",
  Аналитика: "analytics",
  Настройка: "settings",
}

const screenByMobileFooterKey = {
  budget: "months",
  incomes: "incomes",
  analytics: "analytics",
  cashflow: "cashflow",
  settings: "settings",
}

export function isBudgetScreen(screen) {
  return budgetScreenNames.has(screen)
}

export function isSettingsScreen(screen) {
  return settingsScreenNames.has(screen)
}

export function readNavigationStateFromLocation({
  buildMonthContext,
  normalizeMonthName,
  isKnownMonthName = () => true,
  location = typeof window === "undefined" ? null : window.location,
}) {
  if (!location) {
    return { screen: "months", periodContext: null }
  }

  const hash = location.hash.startsWith("#") ? location.hash.slice(1) : ""
  const params = new URLSearchParams(hash)
  const requestedScreen = params.get("screen")
  const screen = supportedScreenNames.has(requestedScreen)
    ? requestedScreen
    : "months"

  if (screen === "periodMonth") {
    const year = Number(params.get("year"))
    const month = normalizeMonthName(params.get("month") ?? "")

    if (Number.isFinite(year) && isKnownMonthName(month)) {
      return {
        screen,
        periodContext: buildMonthContext(year, month),
      }
    }

    return { screen: "months", periodContext: null }
  }

  return { screen, periodContext: null }
}

export function buildNavigationHash(screen, selectedPeriodContext) {
  const params = new URLSearchParams()
  params.set("screen", screen)

  if (screen === "periodMonth" && selectedPeriodContext) {
    params.set("year", String(selectedPeriodContext.year))
    params.set("month", selectedPeriodContext.monthName)
  }

  return params.toString()
}

export function getNavigationStateForMenuItem(item, index) {
  if (index === 0) {
    return { screen: "months", periodContext: null }
  }

  const screen = screenByNavigationItem[item]
  if (!screen) {
    return null
  }

  return { screen, periodContext: null }
}

export function getNavigationStateForMobileKey(key) {
  const screen = screenByMobileFooterKey[key]
  if (!screen) {
    return null
  }

  return { screen, periodContext: null }
}

export function isNavigationItemActive(currentScreen, item, index) {
  if (index === 0) {
    return isBudgetScreen(currentScreen)
  }

  if (item === "Сбережения") {
    return currentScreen === "cashflow"
  }

  if (item === "Доходы") {
    return currentScreen === "incomes"
  }

  if (item === "Аналитика") {
    return currentScreen === "analytics"
  }

  if (item === "Настройка") {
    return isSettingsScreen(currentScreen)
  }

  return false
}

export function getMobileFooterKey(screen) {
  if (isBudgetScreen(screen)) {
    return "budget"
  }

  if (screen === "incomes") {
    return "incomes"
  }

  if (screen === "analytics") {
    return "analytics"
  }

  if (screen === "cashflow") {
    return "cashflow"
  }

  if (isSettingsScreen(screen)) {
    return "settings"
  }

  return "budget"
}
