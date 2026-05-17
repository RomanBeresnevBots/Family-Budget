import { requireSupabase } from "./supabase"

function getPrototypePeopleFromMembers(members, payerOptions) {
  return members
    .filter((member) => payerOptions.includes(member.name))
    .sort(
      (left, right) =>
        payerOptions.indexOf(left.name) - payerOptions.indexOf(right.name)
    )
    .map((member, index) => ({
      slug: member.id,
      name: member.name,
      emoji: member.emoji,
      sort_order: index,
    }))
}

export function createBudgetRepository({
  defaultHouseholdName,
  payerOptions,
  getAuthUserDisplayName,
  getAuthUserAvatar,
  dedupeRegularTemplates,
  isValidRegularTemplate,
  getDefaultCategoryColor,
  buildSqlDate,
  uiFrequencyToDb,
  dbFrequencyToUi,
  getMonthNumberFromValue,
  getMonthShortByNumber,
  getMonthNameByNumber,
  parseSqlDateParts,
  normalizeOwnerName,
  normalizePayerName,
  detectFrequency,
  getExpensePayer,
  getExpenseOwner,
  getExpenseDayOfMonth,
  getCurrentMonthContext,
  buildDueLabel,
}) {
  async function ensureHouseholdRecord(user) {
    const supabase = requireSupabase()
    const profilePayload = {
      id: user.id,
      email: user.email ?? "",
      full_name: getAuthUserDisplayName(user),
      avatar_url: getAuthUserAvatar(user) || null,
      updated_at: new Date().toISOString(),
    }

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "id" })

    if (profileError) {
      throw profileError
    }

    const { data: memberships, error: membershipFetchError } = await supabase
      .from("household_memberships")
      .select("household_id, role, households!inner(id, name)")
      .eq("user_id", user.id)
      .limit(1)

    if (membershipFetchError) {
      throw membershipFetchError
    }

    if (memberships?.length) {
      return memberships[0].household_id
    }

    const { data: ownedHouseholds, error: ownedHouseholdsError } =
      await supabase
        .from("households")
        .select("id, name")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

    if (ownedHouseholdsError) {
      throw ownedHouseholdsError
    }

    if (ownedHouseholds?.length) {
      const householdId = ownedHouseholds[0].id
      const { error: ownedMembershipUpsertError } = await supabase
        .from("household_memberships")
        .upsert(
          {
            household_id: householdId,
            user_id: user.id,
            role: "owner",
          },
          { onConflict: "household_id,user_id" }
        )

      if (ownedMembershipUpsertError) {
        throw ownedMembershipUpsertError
      }

      return householdId
    }

    const { data: insertedHousehold, error: householdInsertError } =
      await supabase
        .from("households")
        .insert({
          name: defaultHouseholdName,
          currency_code: "CZK",
          timezone: "Europe/Prague",
          owner_user_id: user.id,
        })
        .select("id")
        .single()

    if (householdInsertError) {
      throw householdInsertError
    }

    const { error: membershipInsertError } = await supabase
      .from("household_memberships")
      .insert({
        household_id: insertedHousehold.id,
        user_id: user.id,
        role: "owner",
      })

    if (membershipInsertError) {
      throw membershipInsertError
    }

    return insertedHousehold.id
  }

  async function persistBudgetSnapshotToSupabase({
    householdId,
    members,
    categories,
    regularExpenses,
  }) {
    const supabase = requireSupabase()
    const sanitizedRegularExpenses = dedupeRegularTemplates(
      regularExpenses.filter(isValidRegularTemplate)
    )

    await supabase
      .from("expense_occurrences")
      .delete()
      .eq("household_id", householdId)
    await supabase
      .from("expense_series")
      .delete()
      .eq("household_id", householdId)
    await supabase.from("categories").delete().eq("household_id", householdId)
    await supabase.from("people").delete().eq("household_id", householdId)

    const peoplePayload = getPrototypePeopleFromMembers(
      members,
      payerOptions
    ).map((person) => ({
      household_id: householdId,
      ...person,
    }))

    const { data: insertedPeople, error: peopleInsertError } = await supabase
      .from("people")
      .insert(peoplePayload)
      .select("id, slug, name, emoji, sort_order")

    if (peopleInsertError) {
      throw peopleInsertError
    }

    const personIdByName = new Map(
      insertedPeople.map((person) => [person.name, person.id])
    )

    const categoriesPayload = categories.map((category, index) => ({
      household_id: householdId,
      label: category.label,
      icon: category.icon,
      color: category.color ?? getDefaultCategoryColor(category.icon, index),
      sort_order: index,
    }))

    const { data: insertedCategories, error: categoriesInsertError } =
      await supabase
        .from("categories")
        .insert(categoriesPayload)
        .select("id, label, icon, color, sort_order")

    if (categoriesInsertError) {
      throw categoriesInsertError
    }

    const categoryIdByLabel = new Map(
      insertedCategories.map((category) => [category.label, category.id])
    )

    if (sanitizedRegularExpenses.length) {
      const seriesPayload = sanitizedRegularExpenses.map((template) => ({
        household_id: householdId,
        source_expense_client_id: template.sourceExpenseId ?? template.id,
        is_active: template.isActive !== false,
        stopped_from:
          template.stoppedFromYear && template.stoppedFromMonth
            ? buildSqlDate(template.stoppedFromYear, template.stoppedFromMonth)
            : null,
      }))

      const { data: insertedSeries, error: seriesInsertError } = await supabase
        .from("expense_series")
        .insert(seriesPayload)
        .select("id")

      if (seriesInsertError) {
        throw seriesInsertError
      }

      const seriesIdByIndex = new Map(
        insertedSeries.map((series, index) => [index, series.id])
      )
      const seriesIdBySourceExpenseId = new Map(
        sanitizedRegularExpenses.map((template, index) => [
          template.sourceExpenseId ?? template.id,
          seriesIdByIndex.get(index),
        ])
      )

      const versionsPayload = sanitizedRegularExpenses.flatMap(
        (template, index) => {
          const seriesId = seriesIdByIndex.get(index)
          const ownerName = normalizeOwnerName(template.owner, template.payer)
          const payerName = normalizePayerName(template.payer)
          const ownerPersonId =
            ownerName === "Общее" ? null : personIdByName.get(ownerName)
          const payerPersonId = personIdByName.get(payerName)
          const categoryId = categoryIdByLabel.get(template.category)

          return (template.history ?? []).map(
            (entry, historyIndex, historyEntries) => {
              const previousAmount =
                historyIndex > 0
                  ? historyEntries[historyIndex - 1].amount
                  : (entry.previousAmount ?? entry.amount)

              return {
                series_id: seriesId,
                effective_from: buildSqlDate(
                  entry.effectiveYear,
                  entry.effectiveMonth
                ),
                title: template.title,
                amount: entry.amount,
                cadence: template.cadence,
                frequency: uiFrequencyToDb(template.frequency),
                day_of_month: Number(template.dayOfMonth),
                month_of_year:
                  template.frequency === "Раз в год"
                    ? getMonthNumberFromValue(template.month)
                    : null,
                owner_scope: ownerName === "Общее" ? "household" : "person",
                owner_person_id: ownerPersonId ?? null,
                payer_person_id: payerPersonId,
                category_id: categoryId,
                previous_amount: previousAmount,
              }
            }
          )
        }
      )

      const { error: versionsInsertError } = await supabase
        .from("expense_series_versions")
        .insert(versionsPayload)

      if (versionsInsertError) {
        throw versionsInsertError
      }

      const occurrenceRows = members.flatMap((member) =>
        member.expenses.map((expense) => {
          const frequency = expense.frequency ?? detectFrequency(expense)
          const payer = normalizePayerName(getExpensePayer(expense))
          const owner = normalizeOwnerName(
            getExpenseOwner(expense, member),
            payer
          )
          const ownerPersonId =
            owner === "Общее" ? null : personIdByName.get(owner)
          const payerPersonId = personIdByName.get(payer)
          const categoryId = categoryIdByLabel.get(expense.category)
          const dayOfMonth = Number(
            expense.dayOfMonth ?? getExpenseDayOfMonth(expense)
          )
          const currentMonthContext = getCurrentMonthContext()
          const occurrenceYear = expense.year ?? currentMonthContext.year
          const occurrenceMonth =
            expense.month ?? currentMonthContext.monthShort
          const sourceExpenseId =
            expense.sourceExpenseId ?? expense.templateId ?? expense.id
          const seriesId =
            seriesIdBySourceExpenseId.get(sourceExpenseId) ?? null

          return {
            household_id: householdId,
            series_id: seriesId,
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
            source_type: seriesId ? "series" : "manual",
            status: expense.completed ? "completed" : "planned",
            completed_at: expense.completed ? new Date().toISOString() : null,
            note: null,
          }
        })
      )

      if (occurrenceRows.length) {
        const { error: occurrencesInsertError } = await supabase
          .from("expense_occurrences")
          .insert(occurrenceRows)

        if (occurrencesInsertError) {
          throw occurrencesInsertError
        }
      }

      return
    }

    const occurrenceRows = members.flatMap((member) =>
      member.expenses.map((expense) => {
        const frequency = expense.frequency ?? detectFrequency(expense)
        const payer = normalizePayerName(getExpensePayer(expense))
        const owner = normalizeOwnerName(
          getExpenseOwner(expense, member),
          payer
        )
        const ownerPersonId =
          owner === "Общее" ? null : personIdByName.get(owner)
        const payerPersonId = personIdByName.get(payer)
        const categoryId = categoryIdByLabel.get(expense.category)
        const dayOfMonth = Number(
          expense.dayOfMonth ?? getExpenseDayOfMonth(expense)
        )
        const currentMonthContext = getCurrentMonthContext()
        const occurrenceYear = expense.year ?? currentMonthContext.year
        const occurrenceMonth = expense.month ?? currentMonthContext.monthShort

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
        }
      })
    )

    if (occurrenceRows.length) {
      const { error: occurrencesInsertError } = await supabase
        .from("expense_occurrences")
        .insert(occurrenceRows)

      if (occurrencesInsertError) {
        throw occurrencesInsertError
      }
    }
  }

  async function loadBudgetSnapshotFromSupabase(householdId) {
    const supabase = requireSupabase()
    const [
      { data: people, error: peopleError },
      { data: categories, error: categoriesError },
      { data: occurrences, error: occurrencesError },
      { data: series, error: seriesError },
      { data: seriesVersions, error: versionsError },
    ] = await Promise.all([
      supabase
        .from("people")
        .select("id, name, slug, emoji, sort_order")
        .eq("household_id", householdId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("id, label, icon, color, sort_order")
        .eq("household_id", householdId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("expense_occurrences")
        .select(
          "id, series_id, occurrence_month, due_on, title, amount, cadence, frequency, owner_scope, owner_person_id, payer_person_id, category_id, status"
        )
        .eq("household_id", householdId)
        .order("due_on", { ascending: true }),
      supabase
        .from("expense_series")
        .select(
          "id, source_expense_client_id, is_active, stopped_from, created_at"
        )
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      supabase
        .from("expense_series_versions")
        .select(
          "id, series_id, effective_from, title, amount, cadence, frequency, day_of_month, month_of_year, owner_scope, owner_person_id, payer_person_id, category_id, previous_amount, created_at"
        )
        .order("effective_from", { ascending: true }),
    ])

    if (peopleError) throw peopleError
    if (categoriesError) throw categoriesError
    if (occurrencesError) throw occurrencesError
    if (seriesError) throw seriesError
    if (versionsError) throw versionsError

    const personById = new Map(
      (people ?? []).map((person) => [person.id, person])
    )
    const categoryById = new Map(
      (categories ?? []).map((category) => [category.id, category])
    )

    const loadedCategories = (categories ?? []).map((category) => ({
      id: category.id,
      label: category.label,
      icon: category.icon,
      color: category.color,
    }))

    const memberBase = [
      { id: "common", name: "Общее", emoji: "🏡", budget: 0, expenses: [] },
      ...(people ?? []).map((person) => ({
        id: person.slug,
        name: person.name,
        emoji: person.emoji ?? "🙂",
        budget: 0,
        expenses: [],
      })),
    ]

    const memberByName = new Map(
      memberBase.map((member) => [member.name, member])
    )
    const sourceExpenseIdBySeriesId = new Map(
      (series ?? []).map((entry) => [
        entry.id,
        entry.source_expense_client_id ?? entry.id,
      ])
    )

    ;(occurrences ?? []).forEach((occurrence) => {
      const dueOn = new Date(occurrence.due_on)
      const ownerName =
        occurrence.owner_scope === "household"
          ? "Общее"
          : (personById.get(occurrence.owner_person_id)?.name ?? "Общее")
      const payerName =
        personById.get(occurrence.payer_person_id)?.name ?? "Рома"
      const category = categoryById.get(occurrence.category_id)
      const member = memberByName.get(ownerName)

      if (!member || !category) {
        return
      }

      member.expenses.push({
        id: occurrence.id,
        templateId: occurrence.series_id
          ? (sourceExpenseIdBySeriesId.get(occurrence.series_id) ?? null)
          : null,
        sourceExpenseId: occurrence.series_id
          ? (sourceExpenseIdBySeriesId.get(occurrence.series_id) ?? null)
          : null,
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
      })
    })

    const versionsBySeriesId = new Map()
    ;(seriesVersions ?? []).forEach((version) => {
      if (!versionsBySeriesId.has(version.series_id)) {
        versionsBySeriesId.set(version.series_id, [])
      }

      versionsBySeriesId.get(version.series_id).push(version)
    })

    const loadedRegularExpenses = dedupeRegularTemplates(
      (series ?? [])
        .flatMap((entry, index) => {
          const versions = (versionsBySeriesId.get(entry.id) ?? []).sort(
            (left, right) =>
              new Date(left.effective_from).getTime() -
              new Date(right.effective_from).getTime()
          )
          const latestVersion = versions[versions.length - 1]
          if (!latestVersion) {
            return []
          }

          const category = categoryById.get(latestVersion.category_id)
          const ownerName =
            latestVersion.owner_scope === "household"
              ? "Общее"
              : (personById.get(latestVersion.owner_person_id)?.name ?? "Общее")
          const payerName =
            personById.get(latestVersion.payer_person_id)?.name ?? "Рома"

          return {
            id: entry.source_expense_client_id ?? entry.id,
            sourceExpenseId: entry.source_expense_client_id ?? undefined,
            title: latestVersion.title ?? "Без названия",
            category: category?.label ?? "",
            cadence: latestVersion.cadence ?? "manual",
            frequency: dbFrequencyToUi(latestVersion.frequency ?? "monthly"),
            dayOfMonth: String(latestVersion.day_of_month ?? 1),
            month:
              latestVersion.frequency === "yearly"
                ? getMonthShortByNumber(latestVersion.month_of_year ?? 1)
                : getMonthShortByNumber(
                    new Date(
                      latestVersion.effective_from ?? new Date()
                    ).getUTCMonth() + 1
                  ),
            owner: ownerName,
            payer: payerName,
            isActive: entry.is_active,
            stoppedFromYear: entry.stopped_from
              ? parseSqlDateParts(entry.stopped_from).year
              : null,
            stoppedFromMonth: entry.stopped_from
              ? getMonthNameByNumber(
                  parseSqlDateParts(entry.stopped_from).month
                )
              : null,
            sortOrder: index,
            history: versions.map((version, versionIndex) => {
              const effectiveDate = new Date(version.effective_from)
              return {
                effectiveYear: effectiveDate.getUTCFullYear(),
                effectiveMonth: getMonthNameByNumber(
                  effectiveDate.getUTCMonth() + 1
                ),
                amount: Number(version.amount),
                previousAmount:
                  versionIndex > 0
                    ? Number(versions[versionIndex - 1].amount)
                    : Number(version.previous_amount ?? version.amount),
                changedAt: version.created_at,
              }
            }),
          }
        })
        .filter(isValidRegularTemplate)
    )

    return {
      members: memberBase,
      categories: loadedCategories,
      regularExpenses: loadedRegularExpenses,
    }
  }

  return {
    ensureHouseholdRecord,
    persistBudgetSnapshotToSupabase,
    loadBudgetSnapshotFromSupabase,
  }
}
