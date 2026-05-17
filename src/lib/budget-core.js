export const monthOptions = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
]

export const fullMonthNames = [
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
]

const defaultMonthName =
  fullMonthNames[new Date().getMonth()] ?? fullMonthNames[0]

export function uiFrequencyToDb(frequency) {
  if (frequency === "Раз в год") {
    return "yearly"
  }

  if (frequency === "Единоразово") {
    return "one_time"
  }

  return "monthly"
}

export function dbFrequencyToUi(frequency) {
  if (frequency === "yearly") {
    return "Раз в год"
  }

  if (frequency === "one_time") {
    return "Единоразово"
  }

  return "Каждый месяц"
}

export function normalizeMonthName(
  value,
  fallbackMonthName = defaultMonthName
) {
  if (!value) {
    return fallbackMonthName
  }

  if (fullMonthNames.includes(value)) {
    return value
  }

  const shortIndex = monthOptions.indexOf(value)
  return shortIndex >= 0 ? fullMonthNames[shortIndex] : fallbackMonthName
}

export function getMonthIndexByValue(
  value,
  fallbackMonthName = defaultMonthName
) {
  return fullMonthNames.indexOf(normalizeMonthName(value, fallbackMonthName))
}

export function getMonthNumberFromValue(
  value,
  fallbackMonthName = defaultMonthName
) {
  return Math.max(getMonthIndexByValue(value, fallbackMonthName), 0) + 1
}

export function getMonthShortByNumber(monthNumber) {
  return monthOptions[Math.max(monthNumber - 1, 0)] ?? monthOptions[0]
}

export function getMonthNameByNumber(monthNumber) {
  return fullMonthNames[Math.max(monthNumber - 1, 0)] ?? fullMonthNames[0]
}

export function buildSqlDate(
  year,
  monthValue,
  day = 1,
  fallbackMonthName = defaultMonthName
) {
  const monthNumber =
    typeof monthValue === "number"
      ? monthValue
      : getMonthNumberFromValue(monthValue, fallbackMonthName)

  return `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function parseSqlDateParts(sqlDate) {
  const raw = String(sqlDate ?? "")
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw
  const [year, month, day] = datePart.split("-").map((item) => Number(item))

  return {
    year: Number.isFinite(year) ? year : 0,
    month: Number.isFinite(month) ? month : 0,
    day: Number.isFinite(day) ? day : 0,
  }
}

export function buildMonthContext(
  year,
  monthName,
  fallbackMonthName = defaultMonthName
) {
  const normalizedMonthName = normalizeMonthName(monthName, fallbackMonthName)
  const monthIndex = Math.max(fullMonthNames.indexOf(normalizedMonthName), 0)

  return {
    monthIndex,
    monthName: fullMonthNames[monthIndex],
    monthShort: monthOptions[monthIndex],
    year,
  }
}

export function getPeriodOrderKey(
  year,
  monthValue,
  fallbackMonthName = defaultMonthName
) {
  return (
    year * 12 + Math.max(getMonthIndexByValue(monthValue, fallbackMonthName), 0)
  )
}
