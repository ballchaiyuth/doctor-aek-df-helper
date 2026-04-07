import { isSameDay } from "date-fns";
import type { PatientRecord } from "./useExcelParser";
import {
  WARD_BILLING_CODE,
  WARD_EXCLUDE_START_MINUTES,
  WARD_EXCLUDE_END_MINUTES,
} from "@/utils/csv-columns";
import masterMapping from "@/assets/data/master-mapping.json";

export interface DfReportRow {
  patientName: string;
  hn: string;
  admitDate: string;
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
   * Look up billing code from ICD-10 code via master mapping.
   * Returns the code if found, or the raw ICD code as fallback.
   */
  function lookupBillingCode(icdCode: string): string {
    const mapping = masterMapping as Record<string, string>;
    return mapping[icdCode] || icdCode;
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
   * ER Logic: Filter records by doctor name and shift dates,
   * then map ICD-10 to billing codes.
   */
  function calculateER(
    records: PatientRecord[],
    doctorName: string,
    shiftDates: Date[],
  ): DfReportRow[] {
    return records
      .filter((r) => r.attendingDoctor === doctorName)
      .filter((r) => shiftDates.some((sd) => isSameDay(r.admitDate, sd)))
      .map((r) => ({
        patientName: r.patientName,
        hn: r.hn,
        admitDate: formatDate(r.admitDate),
        billingCode: lookupBillingCode(r.icdCode),
        icdCode: r.icdCode,
        icdDescription: r.icdDescription,
      }));
  }

  /**
   * Check if a patient should be EXCLUDED from Ward DF.
   * Patients admitted on the shift day between 08:00-16:00 belong to ER doctor.
   */
  function isExcludedFromWard(record: PatientRecord, shiftDate: Date): boolean {
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

    for (const shiftDate of shiftDates) {
      const dayRecords = records.filter((r) =>
        shiftDates.some((sd) => isSameDay(r.admitDate, sd)),
      );

      for (const record of dayRecords) {
        if (isExcludedFromWard(record, shiftDate)) continue;

        // Avoid duplicates from multiple shift date iterations
        const exists = results.some(
          (r) =>
            r.hn === record.hn && r.admitDate === formatDate(record.admitDate),
        );
        if (exists) continue;

        results.push({
          patientName: record.patientName,
          hn: record.hn,
          admitDate: formatDate(record.admitDate),
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
    lookupBillingCode,
    isExcludedFromWard,
    toClipboardText,
    formatDate,
  };
}
