import { parse as parseCsv } from "csv-parse/browser/esm";
import { readSheet } from "read-excel-file/browser";
import { parse, isValid } from "date-fns";
import { CSV_COL, MIN_DATA_CELLS } from "@/utils/csv-columns";

export interface PatientRecord {
  an: string;
  hn: string;
  patientName: string;
  admitDate: Date;
  admitTime: string;
  admitDateTime: Date;
  icdCode: string;
  icdDescription: string;
  attendingDoctor: string;
  chiefComplaint: string;
}

export interface ParsedData {
  records: PatientRecord[];
  doctors: string[];
  shiftDates: Date[];
}

/**
 * Composable for parsing hospital CSV/Excel files into structured data.
 * Handles row sanitization, date normalization, and doctor extraction.
 */
export function useExcelParser() {
  const parsedData = ref<ParsedData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Parse a date string in d/M/yyyy format.
   */
  function parseDate(dateStr: string): Date | null {
    if (!dateStr?.trim()) return null;
    const cleaned = dateStr.trim();

    // Try d/M/yyyy first (Thai hospital format)
    const parsed = parse(cleaned, "d/M/yyyy", new Date());
    if (isValid(parsed)) return parsed;

    // Fallback: try other common formats
    const fallback = parse(cleaned, "dd/MM/yyyy", new Date());
    if (isValid(fallback)) return fallback;

    return null;
  }

  /**
   * Parse a time string (H:mm:ss or HH:mm:ss) and combine with a date.
   */
  function parseDateTime(date: Date, timeStr: string): Date {
    if (!timeStr?.trim()) return date;
    const parts = timeStr.trim().split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);
    const seconds = parseInt(parts[2] || "0", 10);

    const combined = new Date(date);
    combined.setHours(hours, minutes, seconds, 0);
    return combined;
  }

  /**
   * Check if a row is a date header (section separator like "1/11/2025").
   */
  function isDateHeaderRow(row: unknown[]): boolean {
    const nonEmpty = row.filter((cell) => {
      const val = String(cell ?? "").trim();
      return val.length > 0;
    });

    if (nonEmpty.length !== 1) return false;
    const firstVal = String(nonEmpty[0]).trim();
    return parseDate(firstVal) !== null;
  }

  /**
   * Check if a row is a valid data row (has enough populated cells and numeric AN).
   */
  function isDataRow(row: unknown[]): boolean {
    const nonEmpty = row.filter((cell) => {
      const val = String(cell ?? "").trim();
      return val.length > 0;
    });

    if (nonEmpty.length < MIN_DATA_CELLS) return false;

    const an = String(row[CSV_COL.AN] ?? "").trim();
    return /^\d+$/.test(an);
  }

  /**
   * Extract shift dates from date header rows in the file.
   */
  function extractShiftDates(rows: unknown[][]): Date[] {
    const dates: Date[] = [];

    for (const row of rows) {
      if (isDateHeaderRow(row)) {
        const nonEmpty = row.filter(
          (cell) => String(cell ?? "").trim().length > 0,
        );
        const dateStr = String(nonEmpty[0]).trim();
        const date = parseDate(dateStr);
        if (date) dates.push(date);
      }
    }

    return dates;
  }

  /**
   * Convert a valid data row into a PatientRecord.
   */
  function rowToRecord(row: unknown[]): PatientRecord | null {
    const admitDateStr = String(row[CSV_COL.ADMIT_DATE] ?? "").trim();
    const admitDate = parseDate(admitDateStr);
    if (!admitDate) return null;

    const admitTime = String(row[CSV_COL.ADMIT_TIME] ?? "").trim();
    const admitDateTime = parseDateTime(admitDate, admitTime);

    return {
      an: String(row[CSV_COL.AN] ?? "").trim(),
      hn: String(row[CSV_COL.HN] ?? "").trim(),
      patientName: String(row[CSV_COL.PATIENT_NAME] ?? "").trim(),
      admitDate,
      admitTime,
      admitDateTime,
      icdCode: String(row[CSV_COL.ICD_CODE] ?? "").trim(),
      icdDescription: String(row[CSV_COL.ICD_DESC] ?? "").trim(),
      attendingDoctor: String(row[CSV_COL.ATTENDING_DOCTOR] ?? "").trim(),
      chiefComplaint: String(row[CSV_COL.CHIEF_COMPLAINT] ?? "").trim(),
    };
  }

  /**
   * Read file content — CSV files are read as UTF-8 text to preserve Thai characters,
   * while Excel files (.xlsx/.xls) use arrayBuffer (binary format handles encoding internally).
   */
  function isCsvFile(file: File): boolean {
    return file.name.toLowerCase().endsWith(".csv");
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
      reader.readAsText(file, "UTF-8");
    });
  }

  /**
   * Main parse function — reads a File, extracts records, doctors, and shift dates.
   */
  async function parseFile(file: File): Promise<ParsedData> {
    isLoading.value = true;
    error.value = null;

    try {
      let rows: unknown[][] = [];

      if (isCsvFile(file)) {
        // CSV: read as UTF-8 text first to preserve Thai characters
        const text = await readFileAsText(file);
        rows = await new Promise<unknown[][]>((resolve, reject) => {
          parseCsv(
            text,
            {
              skip_empty_lines: true,
              relax_column_count: true,
            },
            (err: Error | undefined, records: unknown[][]) => {
              if (err) reject(err);
              else resolve(records);
            },
          );
        });
      } else {
        // Excel (.xlsx/.xls)
        const parsedRows = await readSheet(file);
        rows = parsedRows as unknown[][];
      }

      if (!rows || rows.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์");
      }

      // Extract shift dates from date header rows
      const shiftDates = extractShiftDates(rows);

      // Parse valid data rows into PatientRecords
      const records: PatientRecord[] = [];
      const doctorSet = new Set<string>();

      for (const row of rows) {
        if (!isDataRow(row)) continue;

        const record = rowToRecord(row);
        if (!record) continue;
        if (!record.patientName) continue;

        records.push(record);

        if (record.attendingDoctor) {
          doctorSet.add(record.attendingDoctor);
        }
      }

      const result: ParsedData = {
        records,
        doctors: Array.from(doctorSet).sort(),
        shiftDates,
      };

      parsedData.value = result;
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse file";
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    parsedData.value = null;
    error.value = null;
  }

  return {
    parsedData,
    isLoading,
    error,
    parseFile,
    reset,
  };
}
