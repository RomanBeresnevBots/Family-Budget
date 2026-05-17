import { useEffect, useMemo } from "react"

function sortExpensesByDueDateAndTitle(expenses, getExpenseDayOfMonth) {
  return [...expenses].sort((left, right) => {
    const dayDifference =
      getExpenseDayOfMonth(left) - getExpenseDayOfMonth(right)
    if (dayDifference !== 0) {
      return dayDifference
    }

    return left.title.localeCompare(right.title, "ru")
  })
}

function buildPayerGroups({
  payerOptions,
  members,
  expenses,
  getExpensePayer,
  getExpenseDayOfMonth,
  createMemberId,
  mapExpense,
}) {
  const payerGroups = Object.fromEntries(
    [...payerOptions]
      .sort((left, right) => left.localeCompare(right, "ru"))
      .map((payer) => {
        const memberProfile = members.find((member) => member.name === payer)

        return [
          payer,
          {
            id: createMemberId(payer, memberProfile),
            name: payer,
            emoji: memberProfile?.emoji ?? "🙂",
            expenses: [],
          },
        ]
      })
  )

  expenses.forEach((expense) => {
    const payer = getExpensePayer(expense)
    if (!payerGroups[payer]) {
      return
    }

    payerGroups[payer].expenses.push(mapExpense(expense, payer))
  })

  return Object.values(payerGroups).map((member) => ({
    ...member,
    expenses: sortExpensesByDueDateAndTitle(
      member.expenses,
      getExpenseDayOfMonth
    ),
  }))
}

export function useBudgetInsights({
  members,
  categories,
  regularExpenses,
  trackedYears,
  analyticsYear,
  setAnalyticsYear,
  selectedPeriodContext,
  currentMonthContext,
  nextMonthContext,
  cashflowIncomeEvents,
  fullMonthNames,
  payerOptions,
  buildCombinedMonthExpenses,
  buildCategoryBreakdownFromExpenses,
  getUpcomingRegularChange,
  getPeriodOrderKey,
  getMemberExpensesForMonth,
  getExpensePayer,
  normalizeOwnerName,
  getExpenseDayOfMonth,
  buildMonthContext,
  buildOwnerBreakdownFromExpenses,
  buildRegularityBreakdownFromExpenses,
  isExpenseInPeriod,
  calculateYearIncomeSummary,
  parseSqlDateParts,
  buildIncomeMonthRow,
  buildMonthFinancialSummary,
}) {
  const currentMonthExpenses = useMemo(
    () =>
      buildCombinedMonthExpenses({
        members,
        regularExpenses,
        monthContext: currentMonthContext,
      }),
    [buildCombinedMonthExpenses, currentMonthContext, members, regularExpenses]
  )

  const currentMonthTotals = useMemo(
    () => ({
      budget: currentMonthExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
      paid: currentMonthExpenses
        .filter((expense) => expense.completed)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }),
    [currentMonthExpenses]
  )

  const categoryBreakdown = useMemo(
    () =>
      buildCategoryBreakdownFromExpenses(
        currentMonthExpenses,
        categories,
        currentMonthTotals.budget
      ),
    [
      buildCategoryBreakdownFromExpenses,
      categories,
      currentMonthExpenses,
      currentMonthTotals.budget,
    ]
  )

  const regularExpensesByFrequency = useMemo(() => {
    const monthly = []
    const yearly = []

    regularExpenses
      .filter((template) => template.isActive !== false)
      .sort((left, right) => {
        const dayDifference = Number(left.dayOfMonth) - Number(right.dayOfMonth)
        if (dayDifference !== 0) {
          return dayDifference
        }

        return left.title.localeCompare(right.title, "ru")
      })
      .forEach((template) => {
        if (template.frequency === "Раз в год") {
          yearly.push(template)
          return
        }

        monthly.push(template)
      })

    return { monthly, yearly }
  }, [regularExpenses])

  const regularSummary = useMemo(() => {
    const upcomingChanges = regularExpenses.filter((template) =>
      getUpcomingRegularChange(template, currentMonthContext)
    )

    return {
      total: regularExpenses.filter((template) => template.isActive !== false)
        .length,
      monthly: regularExpensesByFrequency.monthly.length,
      yearly: regularExpensesByFrequency.yearly.length,
      upcomingChanges: upcomingChanges.length,
    }
  }, [
    currentMonthContext,
    getUpcomingRegularChange,
    regularExpenses,
    regularExpensesByFrequency.monthly.length,
    regularExpensesByFrequency.yearly.length,
  ])

  const projectedNextMonthExpenses = useMemo(
    () =>
      buildCombinedMonthExpenses({
        members,
        regularExpenses,
        monthContext: nextMonthContext,
      }),
    [buildCombinedMonthExpenses, members, nextMonthContext, regularExpenses]
  )

  const selectedPeriodIsFuture = useMemo(() => {
    if (!selectedPeriodContext) {
      return false
    }

    return (
      getPeriodOrderKey(
        selectedPeriodContext.year,
        selectedPeriodContext.monthName
      ) >
      getPeriodOrderKey(currentMonthContext.year, currentMonthContext.monthName)
    )
  }, [currentMonthContext, getPeriodOrderKey, selectedPeriodContext])

  const selectedPeriodIsPast = useMemo(() => {
    if (!selectedPeriodContext) {
      return false
    }

    return (
      getPeriodOrderKey(
        selectedPeriodContext.year,
        selectedPeriodContext.monthName
      ) <
      getPeriodOrderKey(currentMonthContext.year, currentMonthContext.monthName)
    )
  }, [currentMonthContext, getPeriodOrderKey, selectedPeriodContext])

  const selectedPeriodExpenses = useMemo(() => {
    if (!selectedPeriodContext) {
      return []
    }

    if (selectedPeriodIsPast) {
      return getMemberExpensesForMonth(members, selectedPeriodContext)
    }

    return buildCombinedMonthExpenses({
      members,
      regularExpenses,
      monthContext: selectedPeriodContext,
    })
  }, [
    buildCombinedMonthExpenses,
    getMemberExpensesForMonth,
    members,
    regularExpenses,
    selectedPeriodContext,
    selectedPeriodIsPast,
  ])

  const nextMonthTotals = useMemo(
    () => ({
      budget: projectedNextMonthExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
      paid: 0,
    }),
    [projectedNextMonthExpenses]
  )

  const selectedPeriodTotals = useMemo(
    () => ({
      budget: selectedPeriodExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
      paid: selectedPeriodExpenses
        .filter((expense) => expense.completed)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }),
    [selectedPeriodExpenses]
  )

  const nextMonthCategoryBreakdown = useMemo(
    () =>
      buildCategoryBreakdownFromExpenses(
        projectedNextMonthExpenses,
        categories,
        nextMonthTotals.budget
      ),
    [
      buildCategoryBreakdownFromExpenses,
      categories,
      nextMonthTotals.budget,
      projectedNextMonthExpenses,
    ]
  )

  const selectedPeriodCategoryBreakdown = useMemo(
    () =>
      buildCategoryBreakdownFromExpenses(
        selectedPeriodExpenses,
        categories,
        selectedPeriodTotals.budget
      ),
    [
      buildCategoryBreakdownFromExpenses,
      categories,
      selectedPeriodExpenses,
      selectedPeriodTotals.budget,
    ]
  )

  const dashboardMembers = useMemo(
    () =>
      buildPayerGroups({
        payerOptions,
        members,
        expenses: currentMonthExpenses,
        getExpensePayer,
        getExpenseDayOfMonth,
        createMemberId: (payer, memberProfile) =>
          memberProfile?.id ?? payer.toLowerCase(),
        mapExpense: (expense, payer) => {
          const fallbackMember =
            expense.sourceMember ??
            members.find(
              (member) =>
                member.name === normalizeOwnerName(expense.owner, payer)
            ) ??
            members.find((member) => member.name === payer) ??
            null

          return {
            ...expense,
            sourceMember: fallbackMember ?? expense.sourceMember,
          }
        },
      }),
    [
      currentMonthExpenses,
      getExpenseDayOfMonth,
      getExpensePayer,
      members,
      normalizeOwnerName,
      payerOptions,
    ]
  )

  const nextMonthMembers = useMemo(
    () =>
      buildPayerGroups({
        payerOptions,
        members,
        expenses: projectedNextMonthExpenses,
        getExpensePayer,
        getExpenseDayOfMonth,
        createMemberId: (payer, memberProfile) =>
          `projected-${memberProfile?.id ?? payer.toLowerCase()}`,
        mapExpense: (expense) => expense,
      }),
    [
      getExpenseDayOfMonth,
      getExpensePayer,
      members,
      payerOptions,
      projectedNextMonthExpenses,
    ]
  )

  const selectedPeriodMembers = useMemo(() => {
    if (!selectedPeriodContext) {
      return []
    }

    return buildPayerGroups({
      payerOptions,
      members,
      expenses: selectedPeriodExpenses,
      getExpensePayer,
      getExpenseDayOfMonth,
      createMemberId: (payer, memberProfile) =>
        `period-${selectedPeriodContext.year}-${selectedPeriodContext.monthIndex}-${memberProfile?.id ?? payer.toLowerCase()}`,
      mapExpense: (expense) => expense,
    })
  }, [
    getExpenseDayOfMonth,
    getExpensePayer,
    members,
    payerOptions,
    selectedPeriodContext,
    selectedPeriodExpenses,
  ])

  const yearCards = useMemo(() => {
    const currentOrder = getPeriodOrderKey(
      currentMonthContext.year,
      currentMonthContext.monthName
    )
    const aggregates = new Map()

    trackedYears.forEach((year) => {
      aggregates.set(
        year,
        Object.fromEntries(
          fullMonthNames.map((monthName) => [
            monthName,
            {
              name: monthName,
              budget: 0,
              paid: 0,
              hasData: false,
              isCurrent:
                year === currentMonthContext.year &&
                monthName === currentMonthContext.monthName,
            },
          ])
        )
      )
    })

    trackedYears.forEach((year) => {
      fullMonthNames.forEach((monthName) => {
        const bucket = aggregates.get(year)?.[monthName]
        if (!bucket) {
          return
        }

        const monthContext = buildMonthContext(year, monthName)
        const monthOrder = getPeriodOrderKey(year, monthName)
        const monthExpenses =
          monthOrder < currentOrder
            ? getMemberExpensesForMonth(members, monthContext)
            : buildCombinedMonthExpenses({
                members,
                regularExpenses,
                monthContext,
              })

        if (!monthExpenses.length) {
          return
        }

        bucket.budget = monthExpenses.reduce(
          (sum, expense) => sum + Number(expense.amount ?? 0),
          0
        )
        bucket.paid = monthExpenses
          .filter((expense) => expense.completed)
          .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0)
        bucket.hasData = true
      })
    })

    return trackedYears.map((year) => {
      const months = [...fullMonthNames]
        .reverse()
        .map((monthName) => {
          const month = aggregates.get(year)?.[monthName]
          return month ? { ...month, year } : null
        })
        .filter(Boolean)

      return {
        year,
        budget: months.reduce((sum, month) => sum + month.budget, 0),
        paid: months.reduce((sum, month) => sum + month.paid, 0),
        months,
      }
    })
  }, [
    buildCombinedMonthExpenses,
    buildMonthContext,
    currentMonthContext.monthName,
    currentMonthContext.year,
    fullMonthNames,
    getMemberExpensesForMonth,
    getPeriodOrderKey,
    members,
    regularExpenses,
    trackedYears,
  ])

  const analyticsAvailableYears = useMemo(
    () => yearCards.map((card) => card.year),
    [yearCards]
  )

  useEffect(() => {
    if (analyticsAvailableYears.length === 0) {
      if (analyticsYear !== currentMonthContext.year) {
        setAnalyticsYear(currentMonthContext.year)
      }
      return
    }

    if (!analyticsAvailableYears.includes(analyticsYear)) {
      setAnalyticsYear(analyticsAvailableYears[0])
    }
  }, [
    analyticsAvailableYears,
    analyticsYear,
    currentMonthContext.year,
    setAnalyticsYear,
  ])

  const analyticsYearExpenses = useMemo(() => {
    if (!analyticsYear) {
      return []
    }

    const currentOrder = getPeriodOrderKey(
      currentMonthContext.year,
      currentMonthContext.monthName
    )

    return fullMonthNames.flatMap((monthName) => {
      const monthContext = buildMonthContext(analyticsYear, monthName)
      const monthOrder = getPeriodOrderKey(analyticsYear, monthName)

      if (monthOrder < currentOrder) {
        return getMemberExpensesForMonth(members, monthContext)
      }

      return buildCombinedMonthExpenses({
        members,
        regularExpenses,
        monthContext,
      })
    })
  }, [
    analyticsYear,
    buildCombinedMonthExpenses,
    buildMonthContext,
    currentMonthContext.monthName,
    currentMonthContext.year,
    fullMonthNames,
    getMemberExpensesForMonth,
    getPeriodOrderKey,
    members,
    regularExpenses,
  ])

  const analyticsYearBudgetTotal = useMemo(
    () =>
      analyticsYearExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [analyticsYearExpenses]
  )

  const analyticsYearCategoryBreakdown = useMemo(
    () =>
      buildCategoryBreakdownFromExpenses(
        analyticsYearExpenses,
        categories,
        analyticsYearBudgetTotal
      ),
    [
      analyticsYearBudgetTotal,
      analyticsYearExpenses,
      buildCategoryBreakdownFromExpenses,
      categories,
    ]
  )

  const analyticsYearOwnerBreakdown = useMemo(
    () =>
      buildOwnerBreakdownFromExpenses(
        analyticsYearExpenses,
        analyticsYearBudgetTotal
      ),
    [
      analyticsYearBudgetTotal,
      analyticsYearExpenses,
      buildOwnerBreakdownFromExpenses,
    ]
  )

  const analyticsYearRegularityBreakdown = useMemo(
    () =>
      buildRegularityBreakdownFromExpenses(
        analyticsYearExpenses,
        analyticsYearBudgetTotal
      ),
    [
      analyticsYearBudgetTotal,
      analyticsYearExpenses,
      buildRegularityBreakdownFromExpenses,
    ]
  )

  const analyticsYearMonthsWithData = useMemo(() => {
    if (!analyticsYear) {
      return 0
    }

    return fullMonthNames.reduce((count, monthName) => {
      const monthContext = buildMonthContext(analyticsYear, monthName)
      const hasAnyExpense = analyticsYearExpenses.some((expense) =>
        isExpenseInPeriod(expense, monthContext.year, monthContext.monthName)
      )

      return hasAnyExpense ? count + 1 : count
    }, 0)
  }, [
    analyticsYear,
    analyticsYearExpenses,
    buildMonthContext,
    fullMonthNames,
    isExpenseInPeriod,
  ])

  const analyticsYearIncomeSummary = useMemo(
    () =>
      calculateYearIncomeSummary({
        incomeEvents: cashflowIncomeEvents,
        selectedYear: analyticsYear,
        currentContext: currentMonthContext,
        expenseTotal: analyticsYearBudgetTotal,
      }),
    [
      analyticsYear,
      analyticsYearBudgetTotal,
      calculateYearIncomeSummary,
      cashflowIncomeEvents,
      currentMonthContext,
    ]
  )

  const incomeAvailableYears = useMemo(() => {
    const incomeYears = cashflowIncomeEvents.map(
      (event) => parseSqlDateParts(event.incomeDate).year
    )
    const years = new Set([
      ...trackedYears,
      ...incomeYears,
      currentMonthContext.year,
    ])
    return [...years].sort((left, right) => right - left)
  }, [
    cashflowIncomeEvents,
    currentMonthContext.year,
    parseSqlDateParts,
    trackedYears,
  ])

  const incomeYearSummary = analyticsYearIncomeSummary

  const incomeMonthRowsByPeriodKey = useMemo(() => {
    const rows = new Map()

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
          })
        )
      })
    })

    return rows
  }, [
    buildIncomeMonthRow,
    cashflowIncomeEvents,
    currentMonthContext,
    fullMonthNames,
    incomeAvailableYears,
  ])

  const incomeYearMonthlyRows = useMemo(
    () =>
      [...fullMonthNames].reverse().map((monthName) => {
        const monthIndex = fullMonthNames.indexOf(monthName)

        return (
          incomeMonthRowsByPeriodKey.get(`${analyticsYear}-${monthIndex}`) ??
          buildIncomeMonthRow({
            incomeEvents: [],
            selectedYear: analyticsYear,
            monthName,
            monthIndex,
            currentContext: currentMonthContext,
          })
        )
      }),
    [
      analyticsYear,
      buildIncomeMonthRow,
      currentMonthContext,
      fullMonthNames,
      incomeMonthRowsByPeriodKey,
    ]
  )

  const currentMonthIncomeSummary = useMemo(() => {
    const row =
      incomeMonthRowsByPeriodKey.get(
        `${currentMonthContext.year}-${currentMonthContext.monthIndex}`
      ) ??
      buildIncomeMonthRow({
        incomeEvents: [],
        selectedYear: currentMonthContext.year,
        monthName: currentMonthContext.monthName,
        monthIndex: currentMonthContext.monthIndex,
        currentContext: currentMonthContext,
      })

    return {
      incomeTotal: row.effectiveTotal,
      hasIncomeData: row.effectiveTotal > 0,
    }
  }, [buildIncomeMonthRow, currentMonthContext, incomeMonthRowsByPeriodKey])

  const nextMonthIncomeProjection = useMemo(() => {
    const row =
      incomeMonthRowsByPeriodKey.get(
        `${nextMonthContext.year}-${nextMonthContext.monthIndex}`
      ) ??
      buildIncomeMonthRow({
        incomeEvents: [],
        selectedYear: nextMonthContext.year,
        monthName: nextMonthContext.monthName,
        monthIndex: nextMonthContext.monthIndex,
        currentContext: currentMonthContext,
      })

    return {
      incomeTotal: row.effectiveTotal,
      hasIncomeData: row.effectiveTotal > 0,
    }
  }, [
    buildIncomeMonthRow,
    currentMonthContext,
    incomeMonthRowsByPeriodKey,
    nextMonthContext,
  ])

  const selectedPeriodIncomeProjection = useMemo(() => {
    if (!selectedPeriodContext) {
      return null
    }

    const row =
      incomeMonthRowsByPeriodKey.get(
        `${selectedPeriodContext.year}-${selectedPeriodContext.monthIndex}`
      ) ??
      buildIncomeMonthRow({
        incomeEvents: [],
        selectedYear: selectedPeriodContext.year,
        monthName: selectedPeriodContext.monthName,
        monthIndex: selectedPeriodContext.monthIndex,
        currentContext: currentMonthContext,
      })

    return {
      incomeTotal: row.effectiveTotal,
      hasIncomeData: row.effectiveTotal > 0,
    }
  }, [
    buildIncomeMonthRow,
    currentMonthContext,
    incomeMonthRowsByPeriodKey,
    selectedPeriodContext,
  ])

  const currentMonthFinancialSummary = useMemo(
    () =>
      buildMonthFinancialSummary({
        expenses: currentMonthExpenses,
        incomeTotal: currentMonthIncomeSummary.incomeTotal,
      }),
    [
      buildMonthFinancialSummary,
      currentMonthExpenses,
      currentMonthIncomeSummary.incomeTotal,
    ]
  )

  const nextMonthFinancialSummary = useMemo(
    () =>
      buildMonthFinancialSummary({
        expenses: projectedNextMonthExpenses,
        incomeTotal: nextMonthIncomeProjection.incomeTotal,
      }),
    [
      buildMonthFinancialSummary,
      nextMonthIncomeProjection.incomeTotal,
      projectedNextMonthExpenses,
    ]
  )

  const selectedPeriodFinancialSummary = useMemo(() => {
    if (!selectedPeriodContext) {
      return null
    }

    return buildMonthFinancialSummary({
      expenses: selectedPeriodExpenses,
      incomeTotal: selectedPeriodIncomeProjection?.incomeTotal ?? 0,
    })
  }, [
    buildMonthFinancialSummary,
    selectedPeriodContext,
    selectedPeriodExpenses,
    selectedPeriodIncomeProjection,
  ])

  return {
    currentMonthExpenses,
    currentMonthTotals,
    categoryBreakdown,
    regularExpensesByFrequency,
    regularSummary,
    projectedNextMonthExpenses,
    selectedPeriodIsFuture,
    selectedPeriodExpenses,
    nextMonthTotals,
    selectedPeriodTotals,
    nextMonthCategoryBreakdown,
    selectedPeriodCategoryBreakdown,
    dashboardMembers,
    nextMonthMembers,
    selectedPeriodMembers,
    yearCards,
    analyticsAvailableYears,
    analyticsYearExpenses,
    analyticsYearBudgetTotal,
    analyticsYearCategoryBreakdown,
    analyticsYearOwnerBreakdown,
    analyticsYearRegularityBreakdown,
    analyticsYearMonthsWithData,
    analyticsYearIncomeSummary,
    incomeAvailableYears,
    incomeYearSummary,
    incomeYearMonthlyRows,
    currentMonthIncomeSummary,
    nextMonthIncomeProjection,
    selectedPeriodIncomeProjection,
    currentMonthFinancialSummary,
    nextMonthFinancialSummary,
    selectedPeriodFinancialSummary,
  }
}
