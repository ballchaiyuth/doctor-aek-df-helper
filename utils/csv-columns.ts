/**
 * CSV Column Index Constants
 *
 * Hospital CSV exports have NO headers and use a fixed 128-column structure.
 * These indices were reverse-engineered from real fixture data.
 * See: docs/implementation-plan.md for full mapping documentation.
 */
export const CSV_COL = {
  AN: 0,
  HN: 7,
  CHIEF_COMPLAINT: 11,
  ADMIT_DATE: 13,
  ADMIT_TIME: 14,
  ICD_CODE: 107,
  ICD_DESC: 108,
  PATIENT_NAME: 109,
  ATTENDING_DOCTOR: 113,
} as const

/**
 * Minimum number of non-empty cells for a row to be considered valid data.
 * Date headers have 1 cell, empty separators have 0.
 */
export const MIN_DATA_CELLS = 2

/**
 * Ward billing code — all ward patients auto-assigned this code.
 */
export const WARD_BILLING_CODE = '213'

/**
 * Ward exclusion time window (minutes from midnight).
 * Patients admitted during this window on the shift day belong to ER doctor.
 */
export const WARD_EXCLUDE_START_MINUTES = 8 * 60 // 08:00
export const WARD_EXCLUDE_END_MINUTES = 16 * 60 // 16:00

/**
 * ER flat rate per round when case count is low.
 */
export const ER_FLAT_RATE_PER_ROUND = 1200
