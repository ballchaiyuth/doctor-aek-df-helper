# Doctor Aek DF Helper — Implementation Plan

Automate Doctor Fee (DF) report generation for Dr. Sorawit (Aek), an intern doctor at Wiset Chai Chan Hospital. The app parses hospital CSV exports, applies ER/Ward business logic, maps ICD-10 codes to billing codes, and produces copyable report tables.

---

## Data Structure Analysis (CSV Column Mapping)

Both ER-Raw and Ward-Raw share the **same column structure** (128 columns, 0-indexed).

> **Note:** ER fixture data was pre-filtered by the doctor — real-world data will contain **many doctors mixed together** (as seen in Ward-Raw with 8+ doctors). The app MUST support doctor selection/filtering from mixed data.

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

### Row Types & Sanitization Strategy

| Row Type            | Detection Logic                                        | Action                               |
| ------------------- | ------------------------------------------------------ | ------------------------------------ |
| **Date Header**     | Only 1 non-empty cell, matches date pattern `d/M/yyyy` | Extract as shift-date section marker |
| **Empty Separator** | All cells empty                                        | Skip                                 |
| **Data Row**        | `Col[0]` is a numeric AN (e.g., `680004843`)           | Parse as patient record              |
| **Multi-line Cell** | Cell contains `\n` (embedded newline)                  | Preserve — CSV reader handles it     |

### Data Statistics from Fixtures

| File                   | Data Rows | Separator Rows | Unique Doctors                    |
| ---------------------- | --------- | -------------- | --------------------------------- |
| `2025-11-ER-Raw.csv`   | 29        | 8              | 2 (Dr. Sorawit + 1 test row)      |
| `2025-11-Ward-Raw.csv` | 91        | 3              | 8 doctors (real-world mixed data) |

---

## Project File Structure

```text
doctor-aek-df-helper/
├── .agents/workflows/standards.md       # Dev standards (context anchor)
├── docs/
│   ├── implementation-plan.md           # This file
│   └── project-status.md               # Progress tracker
├── assets/
│   ├── css/main.css                     # Global styles
│   └── data/
│       └── master-mapping.json          # ICD-10 → Billing Code
├── composables/
│   ├── useExcelParser.ts                # File parsing logic
│   └── useDfCalculator.ts              # ER/Ward business logic
├── utils/
│   └── csv-columns.ts                   # Column index constants
├── pages/
│   └── index.vue                        # Main app page
├── components/
│   ├── FileUploadZone.vue               # Drag & drop file upload
│   ├── DoctorSelector.vue               # Doctor name dropdown
│   ├── ShiftDateSelector.vue            # Date multi-select
│   ├── ResultTable.vue                  # Copyable result table
│   └── AppHeader.vue                    # App header/branding
├── tests/
│   └── fixtures/
│       ├── 2025-11-ER-Raw.csv
│       └── 2025-11-Ward-Raw.csv
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Business Logic Detail

### ER Shift Logic

1. Parse uploaded file → extract all patient records
2. Extract unique doctor names → user selects their name
3. Filter records by selected doctor
4. User selects shift dates
5. Group records by admission date
6. Map `icdCode` → billing code via `master-mapping.json`
7. Output: `[Patient Name, HN, Date, Billing Code]`

### Ward Shift Logic (Critical Rule)

1. Parse uploaded file → extract all patient records
2. User selects shift dates (no doctor filter needed)
3. **EXCLUDE** patients where admission date = shift date AND admission time is 08:00:00–15:59:59
4. Auto-assign billing code = `"213"` for all remaining patients
5. Output: `[Patient Name, HN, Date, "213"]`

### Ward Exclusion Logic (Most Critical Business Rule)

```text
IF admitDate == shiftDate
  AND admitTime >= 08:00:00
  AND admitTime < 16:00:00
THEN EXCLUDE (this patient belongs to ER doctor)
```

---

## Open Questions (Pending User Input)

1. **Master Mapping Data**: Need full ICD-10 → Billing Code table for `master-mapping.json`
2. **ER Time Rounds**: Display results grouped by 3 rounds or flat per shift date?
3. **Flat Rate 1,200 THB**: Calculate and display, or informational only?
4. **HN Column**: Confirmed Col[7] as HN (Hospital Number)?
