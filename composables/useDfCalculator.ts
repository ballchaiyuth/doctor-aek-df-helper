import masterMapping from "@/assets/data/master-mapping.json";
import type { PatientRecord } from "@/composables/useExcelParser";
import {
  WARD_BILLING_CODE,
  WARD_EXCLUDE_END_MINUTES,
  WARD_EXCLUDE_START_MINUTES,
} from "@/utils/csv-columns";
import { getFee } from "@/utils/fee-rates";
import { isSameDay } from "date-fns";

export interface DfReportRow {
  an: string;
  patientName: string;
  hn: string;
  admitDate: string;
  admitTime: string;
  roundingDate: string;
  billingCode: string;
  icdCode: string;
  icdDescription: string;
  chiefComplaint: string;
  attendingDoctor: string;
  fee: number;
  isExcluded?: boolean;
  isIncorrect?: boolean;
  manualBillingCode?: string;
}

export interface ShiftRevenue {
  label: string; // "08:00 - 15:59", etc.
  count: number;
  subtotal: number;
  isBelowMinimum: boolean;
  claimText: string;
  startMin: number;
  endMin: number;
}

export interface RevenueSummary {
  total: number;
  smartTotal: number;
  shifts: ShiftRevenue[];
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
        admitTime: r.admitTime,
        roundingDate: formatDate(r.roundingDate),
        billingCode: lookupERBillingCode(r.icdCode),
        icdCode: r.icdCode,
        icdDescription: r.icdDescription,
        chiefComplaint: r.chiefComplaint,
        attendingDoctor: r.attendingDoctor,
        fee: getFee(lookupERBillingCode(r.icdCode)),
      }));
  }

  /**
   * Ward Logic: Get all patients for the shift dates, excluding certain admits.
   */
  function calculateWard(
    records: PatientRecord[],
    shiftDates: Date[],
  ): DfReportRow[] {
    const results: DfReportRow[] = [];

    for (const shiftDate of shiftDates) {
      const dayRecords = records.filter((r) =>
        isSameDay(r.roundingDate, shiftDate),
      );

      for (const record of dayRecords) {
        const isExcluded = isExcludedFromWard(record, shiftDate);
        if (isExcluded) continue;

        results.push({
          an: record.an,
          patientName: record.patientName,
          hn: record.hn,
          admitDate: formatDate(record.admitDate),
          admitTime: record.admitTime,
          roundingDate: formatDate(record.roundingDate),
          billingCode: WARD_BILLING_CODE,
          icdCode: record.icdCode,
          icdDescription: record.icdDescription,
          chiefComplaint: record.chiefComplaint,
          attendingDoctor: record.attendingDoctor,
          fee: 50,
        });
      }
    }

    return results;
  }

  /**
   * Check if a patient should be EXCLUDED from Ward DF.
   */
  function isExcludedFromWard(record: PatientRecord, shiftDate: Date): boolean {
    if (!isSameDay(record.admitDate, shiftDate)) return false;

    const timeParts = (record.admitTime || "0:0").split(":");
    const h = parseInt(timeParts[0] || "0", 10);
    const m = parseInt(timeParts[1] || "0", 10);
    const totalMinutes = h * 60 + m;

    return (
      totalMinutes >= WARD_EXCLUDE_START_MINUTES &&
      totalMinutes < WARD_EXCLUDE_END_MINUTES
    );
  }

  /**
   * Calculate summary and ER shift-based minimums.
   */
  function calculateRevenueSummary(
    rows: DfReportRow[],
    mode: "er" | "ward",
  ): RevenueSummary {
    if (mode === "ward") {
      const total = rows.reduce((sum, r) => sum + r.fee, 0);
      return { total, smartTotal: total, shifts: [] };
    }

    // Group rows by date for more accurate daily shift calculation
    const rowsByDate: Record<string, DfReportRow[]> = {};
    for (const row of rows) {
      let group = rowsByDate[row.roundingDate];
      if (!group) {
        group = [];
        rowsByDate[row.roundingDate] = group;
      }
      group.push(row);
    }

    let globalTotal = 0;
    let globalSmartTotal = 0;

    // To maintain compatibility with the "shifts" display (if ever needed globally),
    // we'll still keep track of shift-level stats for the whole set.
    const globalShifts: ShiftRevenue[] = [
      {
        label: "08:00 - 15:59",
        count: 0,
        subtotal: 0,
        isBelowMinimum: false,
        claimText: "",
        startMin: 8 * 60,
        endMin: 16 * 60,
      },
      {
        label: "16:00 - 23:59",
        count: 0,
        subtotal: 0,
        isBelowMinimum: false,
        claimText: "",
        startMin: 16 * 60,
        endMin: 24 * 60,
      },
      {
        label: "00:00 - 07:59",
        count: 0,
        subtotal: 0,
        isBelowMinimum: false,
        claimText: "",
        startMin: 0,
        endMin: 8 * 60,
      },
    ];

    for (const date in rowsByDate) {
      const dayRows = rowsByDate[date];
      if (!dayRows) continue;

      // Calculate 3 shifts for THIS day
      const dayShifts = [
        { subtotal: 0, startMin: 8 * 60, endMin: 16 * 60 },
        { subtotal: 0, startMin: 16 * 60, endMin: 24 * 60 },
        { subtotal: 0, startMin: 0, endMin: 8 * 60 },
      ];

      for (const row of dayRows) {
        const timeParts = (row.admitTime || "0:0").split(":");
        const h = parseInt(timeParts[0] || "0", 10);
        const m = parseInt(timeParts[1] || "0", 10);
        const t = h * 60 + m;

        // Add to global buckets for reference
        const gShift = globalShifts.find(
          (s) => t >= s.startMin && t < s.endMin,
        );
        if (gShift) {
          gShift.count++;
          gShift.subtotal += row.fee;
        }

        // Add to day-specific buckets for smart calculation
        const dShift = dayShifts.find((s) => t >= s.startMin && t < s.endMin);
        if (dShift) dShift.subtotal += row.fee;
      }

      // Add each day's smart revenue to the global total
      for (const s of dayShifts) {
        globalTotal += s.subtotal;
        globalSmartTotal += Math.max(1200, s.subtotal);
      }
    }

    const dayCount = Object.keys(rowsByDate).length;
    return {
      total: globalTotal,
      smartTotal: globalSmartTotal,
      shifts: globalShifts.map((s) => ({
        ...s,
        isBelowMinimum: s.subtotal < 1200 * dayCount,
        claimText:
          s.subtotal < 1200 * dayCount
            ? `รับอัตราค่าตอบแทนปกติตามข้อ 1 จำนวน ${dayCount} เวร`
            : "",
      })),
    };
  }

  /**
   * Convert rows to a string suitable for copying to clipboard.
   */
  function toClipboardText(
    rows: DfReportRow[],
    options: { includeDetails?: boolean } = {},
  ): string {
    return rows
      .map((row) => {
        const parts = [
          row.patientName,
          row.hn,
          row.admitDate,
          row.manualBillingCode || row.billingCode,
        ];

        if (options.includeDetails) {
          if (row.chiefComplaint) parts.push(`CC: ${row.chiefComplaint}`);
          parts.push(`${row.icdCode} - ${row.icdDescription}`);
        }

        return parts.join("\t");
      })
      .join("\n");
  }

  return {
    calculateER,
    calculateWard,
    calculateRevenueSummary,
    toClipboardText,
    formatDate,
  };
}
