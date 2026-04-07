---
description: Development Standards for Doctor Aek DF Helper
---

# Doctor Aek DF Helper: Development Standards

Adhere strictly to these core standards to ensure the application remains lightweight, reliable, and easy to maintain for a specialized medical tool.

## 1. Tech Stack & Reliability

- **Framework:** Nuxt 3 (Vue 3).
- **Styling:** Tailwind CSS + PrimeVue (Styled mode or Unstyled with Tailwind).
- **Processing:** `csv-parse` for CSV parsing and `read-excel-file` for Excel files, avoiding older insecure libraries.
- **Date Logic:** date-fns (Modular imports only).
- **Deployment:** Vercel (Static Site).

## 2. Clean & Concise Code (Simplicity First)

- **Minimalism:** Write clean, modular Vue components. Avoid over-engineering features that the doctor doesn't need.
- **Logic Separation:** Keep business logic (DF calculations, filtering) in `composables/` or `utils/`. Components should only handle UI and user interaction.
- **Dependencies:** Use only essential and reliable dependencies. Prefer native JS/Vue features if they are sufficient and readable.

## 3. Documentation & Naming Conventions

- **Language:** Code, variables, and technical documentation must be in **English**.
- **Smart Comments:** Follow best practices—don't explain "what" the code does (the code should be self-explanatory). Only use short English comments to explain the "why" or "complex business rules" (e.g., why we exclude the 08:00-16:00 window).

## 4. Business Logic Integrity

- **Privacy:** Never implement backend storage or external API calls for patient data. All processing must happen in the client's browser.
- **Accuracy:** Prioritize accuracy in time-window filtering (ER vs Ward overlap) as this directly impacts the doctor's income.

## 5. Communication Standards

- **Thai Summary Indicator:** At the end of every response, provide a brief, clear summary in **Thai (สรุปสั้นๆ)**. Focus on what was implemented or changed so the user can review quickly.
