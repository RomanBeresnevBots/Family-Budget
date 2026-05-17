import { useEffect, useRef } from "react"

import {
  buildNavigationHash,
  readNavigationStateFromLocation,
} from "./app-navigation.js"

export function useNavigationHistory({
  currentScreen,
  selectedPeriodContext,
  setCurrentScreen,
  setSelectedPeriodContext,
  buildMonthContext,
  isKnownMonthName,
  normalizeMonthName,
}) {
  const hasInitializedHistoryRef = useRef(false)
  const skipHistorySyncRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const nextHash = buildNavigationHash(currentScreen, selectedPeriodContext)
    const currentHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : ""
    const nextUrl = `${window.location.pathname}${window.location.search}${
      nextHash ? `#${nextHash}` : ""
    }`

    if (!hasInitializedHistoryRef.current) {
      hasInitializedHistoryRef.current = true

      if (nextHash !== currentHash) {
        window.history.replaceState(null, "", nextUrl)
      }
      return
    }

    if (skipHistorySyncRef.current) {
      skipHistorySyncRef.current = false
      return
    }

    if (nextHash === currentHash) {
      return
    }

    window.history.pushState(null, "", nextUrl)
  }, [currentScreen, selectedPeriodContext])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handlePopState = () => {
      const navigationState = readNavigationStateFromLocation({
        buildMonthContext,
        isKnownMonthName,
        normalizeMonthName,
      })

      skipHistorySyncRef.current = true
      setSelectedPeriodContext(navigationState.periodContext)
      setCurrentScreen(navigationState.screen)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [
    buildMonthContext,
    isKnownMonthName,
    normalizeMonthName,
    setCurrentScreen,
    setSelectedPeriodContext,
  ])
}
