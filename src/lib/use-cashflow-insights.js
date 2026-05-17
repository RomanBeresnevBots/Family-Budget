import { useMemo } from "react"

export function useCashflowInsights({
  regularExpenses,
  currentMonthContext,
  projectedNextMonthExpenses,
  cashflowFunds,
  cashflowSnapshots,
  cashflowIncomeEvents,
  cashflowSettings,
  calculateRegularMonthlyReserveBase,
  calculateFundCurrentBalance,
  calculateBudgetReserveTarget,
  calculateEmergencyReserveTarget,
  calculateNextMonthBudgetTotal,
  calculatePayerAllocationFromBudgetItems,
  calculateBudgetReserveReplenishment,
  calculateIncomeWaterfall,
  calculateCashflowWarnings,
  calculateTotalCapitalCzk,
}) {
  const cashflowRegularMonthlyReserveBase = useMemo(
    () =>
      calculateRegularMonthlyReserveBase({
        regularExpenses,
        currentContext: currentMonthContext,
      }),
    [calculateRegularMonthlyReserveBase, currentMonthContext, regularExpenses]
  )

  const budgetReserveFund = useMemo(
    () =>
      cashflowFunds.find((fund) => fund.fundType === "budget_reserve") ?? null,
    [cashflowFunds]
  )

  const emergencyReserveFund = useMemo(
    () =>
      cashflowFunds.find((fund) => fund.fundType === "emergency_reserve") ??
      null,
    [cashflowFunds]
  )

  const budgetReserveCurrent = useMemo(
    () =>
      budgetReserveFund
        ? calculateFundCurrentBalance({
            fundId: budgetReserveFund.id,
            snapshots: cashflowSnapshots,
          })
        : 0,
    [budgetReserveFund, calculateFundCurrentBalance, cashflowSnapshots]
  )

  const emergencyReserveCurrent = useMemo(
    () =>
      emergencyReserveFund
        ? calculateFundCurrentBalance({
            fundId: emergencyReserveFund.id,
            snapshots: cashflowSnapshots,
          })
        : 0,
    [calculateFundCurrentBalance, cashflowSnapshots, emergencyReserveFund]
  )

  const budgetReserveTarget = useMemo(
    () =>
      calculateBudgetReserveTarget({
        settings: cashflowSettings,
        funds: cashflowFunds,
        regularMonthlyReserveBase: cashflowRegularMonthlyReserveBase,
      }),
    [
      calculateBudgetReserveTarget,
      cashflowFunds,
      cashflowRegularMonthlyReserveBase,
      cashflowSettings,
    ]
  )

  const emergencyReserveTarget = useMemo(
    () =>
      calculateEmergencyReserveTarget({
        settings: cashflowSettings,
        funds: cashflowFunds,
        regularMonthlyReserveBase: cashflowRegularMonthlyReserveBase,
      }),
    [
      calculateEmergencyReserveTarget,
      cashflowFunds,
      cashflowRegularMonthlyReserveBase,
      cashflowSettings,
    ]
  )

  const nextMonthBudgetTotalForCashflow = useMemo(
    () => calculateNextMonthBudgetTotal(projectedNextMonthExpenses),
    [calculateNextMonthBudgetTotal, projectedNextMonthExpenses]
  )

  const nextMonthPayerAllocation = useMemo(
    () => calculatePayerAllocationFromBudgetItems(projectedNextMonthExpenses),
    [calculatePayerAllocationFromBudgetItems, projectedNextMonthExpenses]
  )

  const budgetReserveReplenishment = useMemo(
    () =>
      calculateBudgetReserveReplenishment({
        nextMonthBudgetTotal: nextMonthBudgetTotalForCashflow,
        budgetReserveCurrent,
      }),
    [
      budgetReserveCurrent,
      calculateBudgetReserveReplenishment,
      nextMonthBudgetTotalForCashflow,
    ]
  )

  const incomeWaterfall = useMemo(
    () =>
      calculateIncomeWaterfall({
        incomeEvents: cashflowIncomeEvents,
        currentContext: currentMonthContext,
        budgetReserveReplenishmentRequired:
          budgetReserveReplenishment.replenishmentRequired,
        budgetReserveCurrent,
        budgetReserveTarget,
        emergencyReserveCurrent,
        emergencyReserveTarget,
      }),
    [
      budgetReserveCurrent,
      budgetReserveReplenishment.replenishmentRequired,
      budgetReserveTarget,
      calculateIncomeWaterfall,
      cashflowIncomeEvents,
      currentMonthContext,
      emergencyReserveCurrent,
      emergencyReserveTarget,
    ]
  )

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
      calculateCashflowWarnings,
      cashflowSnapshots,
      emergencyReserveCurrent,
      emergencyReserveTarget,
      nextMonthBudgetTotalForCashflow,
      nextMonthPayerAllocation,
    ]
  )

  const cashflowTotalCapital = useMemo(
    () => calculateTotalCapitalCzk({ snapshots: cashflowSnapshots }),
    [calculateTotalCapitalCzk, cashflowSnapshots]
  )

  return {
    cashflowRegularMonthlyReserveBase,
    budgetReserveFund,
    emergencyReserveFund,
    budgetReserveCurrent,
    emergencyReserveCurrent,
    budgetReserveTarget,
    emergencyReserveTarget,
    nextMonthBudgetTotalForCashflow,
    nextMonthPayerAllocation,
    budgetReserveReplenishment,
    incomeWaterfall,
    cashflowWarnings,
    cashflowTotalCapital,
  }
}
