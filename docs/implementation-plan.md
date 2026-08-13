# Doctor Aek DF Helper — Implementation Plan

Automate Doctor Fee (DF) report generation for Dr. Sorawit (Aek), an intern doctor at Wiset Chai Chan Hospital. The app parses hospital CSV exports, applies ER/Ward business logic, maps ICD-10 codes to billing codes, and produces copyable report tables.

---

## Data Structure Analysis (CSV Column Mapping)

Both ER-Raw and Ward-Raw share the **same column structure** (128 columns, 0-indexed).

### Critical Columns (Constants in `utils/csv-columns.ts`)

| Constant Name          | Index | Description                 | Example Value                  |
| ---------------------- | ----- | --------------------------- | ------------------------------ |
| `COL_AN`               | 0     | Admission Number            | `680004843`                    |
| `COL_HN`               | 7     | Hospital Number (HN)        | `480002781`                    |
| `COL_CHIEF_COMPLAINT`  | 11    | Chief complaint             | `แผลถูกสัตว์ไม่ทราบชนิดกัด...` |
| `COL_ADMIT_DATE`       | 13    | Admission Date (`d/M/yyyy`) | `1/11/2025`                    |
| `COL_ADMIT_TIME`       | 14    | Admission Time (`H:mm:ss`)  | `8:50:00`                      |
| `COL_ICD_CODE`         | 107   | ICD-10 Code                 | `T6300`                        |
| `COL_ICD_DESC`         | 108   | ICD-10 Code + Description   | `T6300 - Toxic effect of...`   |
| `COL_PATIENT_NAME`     | 109   | Patient full name           | `นายพรเทพ ศรีประจันต์`         |
| `COL_ATTENDING_DOCTOR` | 113   | Attending Doctor name       | `นายแพทย์สรวิชญ์ สอาดสุด`      |

---

## Project File Structure

```text
doctor-aek-df-helper/
├── docs/
│   ├── context-handoff.txt              # Handover notes
│   ├── implementation-plan.md           # This file
│   └── project-status.md               # Progress tracker
├── assets/
│   ├── css/main.css                     # Global styles
│   └── data/
│       └── master-mapping.json          # ICD-10 → Billing Code
├── composables/
│   ├── useExcelParser.ts                # File parsing logic
│   └── useDfCalculator.ts              # ER/Ward/Smart logic
├── components/
│   ├── ResultTable.vue                  # Managed Dashboard & Reports
│   └── ...                             # Other UI components
```

---

## Business Logic Detail

### Smart ER Copy & Revenue Logic

1. **Per-Shift Evaluation**: Group ER patients into 3 shifts (08-16, 16-24, 24-08).
2. **Minimum Guarantee**: If shift subtotal < 1,200 THB, the doctor is eligible for a flat rate.
3. **Smart Copy**:
   - Consolidates "Low" shifts into a single row: `รับอัตราค่าตอบแทนปกติตามข้อ 1 จำนวน N เวร`
   - Keeps "High" shifts as individual patient rows.
4. **Smart Total**: `Grand Total = SUM(MAX(1200, shift_subtotal))` for all 3 ER shifts PER DAY.
5. **Technical Note**: Excel 1899/1900 epoch dates handled via UTC component extraction to avoid historical timezone shifts (e.g., Bangkok's GMT+6:42 in 1899).

### Ward Shift Logic (Critical Rule)

1. User selects shift dates.
2. **EXCLUDE** patients where admission date = shift date AND admission time is 08:00:00–15:59:59.
3. Auto-assign billing code = `"213"` for all remaining patients.

---

## Executive Dashboard (Set Summary)

A 3-card summary section at the bottom of the results page:

1. **Total Patients**: All cases in the current dataset.
2. **Working Days**: Count of unique dates worked.
3. **Estimated Real Income**: Total revenue using Smart Logic (accounting for 1,200 THB minimums).

---

## Open Tasks

1. **Full ICD-10 Mapping**: Replace placeholders in `master-mapping.json` with real data.
2. **User Testing**: Dry run with complex real-world files.
