import masterMapping from "@/assets/data/master-mapping.json";
import type { PatientRecord } from "@/composables/useExcelParser";
import {
  WARD_BILLING_CODE,
  WARD_EXCLUDE_END_MINUTES,
  WARD_EXCLUDE_START_MINUTES,
} from "@/utils/csv-columns";
import { isSameDay } from "date-fns";

export interface DfReportRow {
  an: string; // Sequential Admission Number for correct sorting
  patientName: string;
  hn: string;
  admitDate: string; // The actual admit date from CSV (e.g., 8/10/2025)
  roundingDate: string; // The shift date from section header (e.g., 2/11/2025)
  billingCode: string;
  icdCode: string;
  icdDescription: string;
}

/**
 * Composable for DF (Doctor Fee) calculation logic.
 * Handles ER filtering by doctor/shift and Ward exclusion by time window.
 */
export function useDfCalculator() {
  /**
   * Look up ER billing code from ICD-10 code via master mapping.
   * Returns the code if found, or "214" (ER Fallback) if not found.
   */
  function lookupERBillingCode(icdCode: string): string {
    const mapping = masterMapping as Record<string, string>;
    return mapping[icdCode] || "214";
  }

  /**
   * Format a Date to d/M/yyyy string for display.
   */
  function formatDate(date: Date): string {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  /**
   * ER Logic: Filter records by doctor name and shift dates (matched against roundingDate),
   * then map ICD-10 to billing codes. Fallback to "214" if not mapped.
   */
  function calculateER(
    records: PatientRecord[],
    doctorName: string,
    shiftDates: Date[],
  ): DfReportRow[] {
    return records
      .filter((r) => r.attendingDoctor === doctorName)
      .filter((r) => shiftDates.some((sd) => isSameDay(r.roundingDate, sd)))
      .map((r) => ({
        an: r.an,
        patientName: r.patientName,
        hn: r.hn,
        admitDate: formatDate(r.admitDate),
        roundingDate: formatDate(r.roundingDate),
        billingCode: lookupERBillingCode(r.icdCode),
        icdCode: r.icdCode,
        icdDescription: r.icdDescription,
      }));
  }

  /**
   * Check if a patient should be EXCLUDED from Ward DF.
   * Patients admitted on the shift day between 08:00-16:00 belong to ER doctor.
   */
  function isExcludedFromWard(record: PatientRecord, shiftDate: Date): boolean {
    // Check if admitted on the SAME DAY as the rounding shift
    if (!isSameDay(record.admitDate, shiftDate)) return false;

    const hours = record.admitDateTime.getHours();
    const minutes = record.admitDateTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    return (
      totalMinutes >= WARD_EXCLUDE_START_MINUTES &&
      totalMinutes < WARD_EXCLUDE_END_MINUTES
    );
  }

  /**
   * Ward Logic: Get all patients for the shift dates,
   * EXCLUDE those admitted 08:00-16:00 on the same day,
   * then auto-assign billing code "213".
   */
  function calculateWard(
    records: PatientRecord[],
    shiftDates: Date[],
  ): DfReportRow[] {
    const results: DfReportRow[] = [];

    // We iterate by shift dates to group data by the day Dr. Aek rounded the ward
    for (const shiftDate of shiftDates) {
      // Find all records that belong to this shift section in the CSV
      const dayRecords = records.filter((r) =>
        isSameDay(r.roundingDate, shiftDate),
      );

      for (const record of dayRecords) {
        // EXCLUDE if admitted on this shiftDate between 08:00-16:00
        if (isExcludedFromWard(record, shiftDate)) continue;

        results.push({
          an: record.an,
          patientName: record.patientName,
          hn: record.hn,
          admitDate: formatDate(record.admitDate),
          roundingDate: formatDate(record.roundingDate),
          billingCode: WARD_BILLING_CODE,
          icdCode: record.icdCode,
          icdDescription: record.icdDescription,
        });
      }
    }

    return results;
  }

  /**
   * Generate a tab-separated string for clipboard copy.
   * Format: PatientName \t HN \t Date \t BillingCode
   */
  function toClipboardText(rows: DfReportRow[]): string {
    return rows
      .map((r) => `${r.patientName}\t${r.hn}\t${r.admitDate}\t${r.billingCode}`)
      .join("\n");
  }

  return {
    calculateER,
    calculateWard,
    lookupERBillingCode,
    isExcludedFromWard,
    toClipboardText,
    formatDate,
  };
}
