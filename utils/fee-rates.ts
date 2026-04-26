import { parse as parseCsv } from "csv-parse/browser/esm";

export interface FeeRate {
  code: string;
  name: string;
  rate: number;
}

const feeMap: Record<string, number> = {
  "213": 50,
  "214": 100,
  "215": 200,
};

let feeList: FeeRate[] = [];

/**
 * Initialize the fee map and list from the CSV data.
 * @param csvContent The raw CSV content string.
 */
export async function initFeeRates(csvContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    parseCsv(
      csvContent,
      {
        from_line: 6, // Skip headers
        skip_empty_lines: true,
      },
      (err, records: string[][]) => {
        if (err) {
          reject(err);
          return;
        }

        feeList = [];
        for (const row of records) {
          const code = (row[0] || "").trim();
          const name = (row[1] || "").trim();
          const rateStr = (row[2] || "0").replace(/,/g, "");
          const rate = parseInt(rateStr, 10);

          if (code && !isNaN(rate)) {
            feeMap[code] = rate;
            feeList.push({ code, name, rate });
          }
        }
        resolve();
      },
    );
  });
}

/**
 * Get all fee rates (for displaying in the dialog).
 */
export function getAllFees(): FeeRate[] {
  return feeList;
}

/**
 * Get fee for a given billing code.
 */
export function getFee(code: string): number {
  return feeMap[code] || 0;
}
