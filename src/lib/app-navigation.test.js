import assert from "node:assert/strict"
import test from "node:test"

import {
  buildNavigationHash,
  getMobileFooterKey,
  getNavigationStateForMenuItem,
  getNavigationStateForMobileKey,
  isNavigationItemActive,
  readNavigationStateFromLocation,
} from "./app-navigation.js"

function buildMonthContext(year, monthName) {
  return {
    year,
    monthName,
    monthShort: monthName.slice(0, 3),
    monthIndex: 0,
  }
}

function normalizeMonthName(value) {
  if (value === "Мар") {
    return "Март"
  }

  return value || "Январь"
}

function isKnownMonthName(month) {
  return month === "Март"
}

test("readNavigationStateFromLocation supports cashflow settings screens", () => {
  const state = readNavigationStateFromLocation({
    buildMonthContext,
    isKnownMonthName,
    normalizeMonthName,
    location: { hash: "#screen=cashflowAccounts" },
  })

  assert.deepEqual(state, {
    screen: "cashflowAccounts",
    periodContext: null,
  })
})

test("readNavigationStateFromLocation restores periodMonth context from hash", () => {
  const state = readNavigationStateFromLocation({
    buildMonthContext,
    isKnownMonthName,
    normalizeMonthName,
    location: {
      hash: "#screen=periodMonth&year=2027&month=%D0%9C%D0%B0%D1%80",
    },
  })

  assert.deepEqual(state, {
    screen: "periodMonth",
    periodContext: {
      year: 2027,
      monthName: "Март",
      monthShort: "Мар",
      monthIndex: 0,
    },
  })
})

test("readNavigationStateFromLocation falls back for invalid periodMonth payload", () => {
  const state = readNavigationStateFromLocation({
    buildMonthContext,
    isKnownMonthName,
    normalizeMonthName,
    location: { hash: "#screen=periodMonth&year=oops&month=bad" },
  })

  assert.deepEqual(state, {
    screen: "months",
    periodContext: null,
  })
})

test("buildNavigationHash serializes periodMonth state", () => {
  assert.equal(
    buildNavigationHash("periodMonth", {
      year: 2028,
      monthName: "Июль",
    }),
    "screen=periodMonth&year=2028&month=%D0%98%D1%8E%D0%BB%D1%8C"
  )
})

test("menu and footer navigation map to target screens", () => {
  assert.deepEqual(getNavigationStateForMenuItem("Бюджет", 0), {
    screen: "months",
    periodContext: null,
  })
  assert.deepEqual(getNavigationStateForMenuItem("Настройка", 5), {
    screen: "settings",
    periodContext: null,
  })
  assert.deepEqual(getNavigationStateForMobileKey("cashflow"), {
    screen: "cashflow",
    periodContext: null,
  })
})

test("navigation highlighting groups related screens", () => {
  assert.equal(isNavigationItemActive("regular", "Бюджет", 0), true)
  assert.equal(isNavigationItemActive("cashflowFunds", "Настройка", 5), true)
  assert.equal(getMobileFooterKey("cashflow"), "cashflow")
  assert.equal(getMobileFooterKey("categories"), "settings")
})
