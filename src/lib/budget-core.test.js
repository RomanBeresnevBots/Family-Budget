import assert from "node:assert/strict"
import test from "node:test"

import {
  buildMonthContext,
  buildSqlDate,
  dbFrequencyToUi,
  getPeriodOrderKey,
  normalizeMonthName,
  parseSqlDateParts,
  uiFrequencyToDb,
} from "./budget-core.js"

test("frequency helpers convert between UI and storage values", () => {
  assert.equal(uiFrequencyToDb("Каждый месяц"), "monthly")
  assert.equal(uiFrequencyToDb("Раз в год"), "yearly")
  assert.equal(uiFrequencyToDb("Единоразово"), "one_time")

  assert.equal(dbFrequencyToUi("monthly"), "Каждый месяц")
  assert.equal(dbFrequencyToUi("yearly"), "Раз в год")
  assert.equal(dbFrequencyToUi("one_time"), "Единоразово")
})

test("normalizeMonthName accepts short labels and uses explicit fallback", () => {
  assert.equal(normalizeMonthName("Сен", "Январь"), "Сентябрь")
  assert.equal(normalizeMonthName("Сентябрь", "Январь"), "Сентябрь")
  assert.equal(normalizeMonthName("not-a-month", "Май"), "Май")
})

test("buildSqlDate accepts both month names and month numbers", () => {
  assert.equal(buildSqlDate(2026, "Апрель", 7, "Январь"), "2026-04-07")
  assert.equal(buildSqlDate(2026, "Апр", 7, "Январь"), "2026-04-07")
  assert.equal(buildSqlDate(2026, 11, 2), "2026-11-02")
})

test("parseSqlDateParts handles raw SQL dates and timestamps", () => {
  assert.deepEqual(parseSqlDateParts("2026-05-14"), {
    year: 2026,
    month: 5,
    day: 14,
  })
  assert.deepEqual(parseSqlDateParts("2026-05-14T10:20:30.000Z"), {
    year: 2026,
    month: 5,
    day: 14,
  })
})

test("month context and period keys stay aligned", () => {
  const context = buildMonthContext(2027, "Дек", "Январь")

  assert.deepEqual(context, {
    monthIndex: 11,
    monthName: "Декабрь",
    monthShort: "Дек",
    year: 2027,
  })
  assert.equal(getPeriodOrderKey(2027, "Январь", "Январь"), 2027 * 12)
  assert.equal(getPeriodOrderKey(2027, "Декабрь", "Январь"), 2027 * 12 + 11)
})
