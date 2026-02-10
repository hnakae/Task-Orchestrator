# Milestone 1: CRUD + Supabase + Zod — Implementation Checklist

**Target:** Mid-Term (Week 6)  
**Focus:** Priority-Driven Task Orchestrator (PDTO) — Task management with validated CRUD

---

## App Idea (Quick Recap)

**Priority-Driven Task Orchestrator (PDTO)** — An intelligent task management app that reduces decision fatigue by dynamically ranking tasks with a **Focus Score** formula: `S = (I × W) / log₁₀(D - T + 2)`

- **I** = Importance (1–10)
- **W** = Weight/Complexity (1–10)
- **D** = Deadline (Unix timestamp)
- **T** = Current Time (Unix timestamp)

For Milestone 1, you deliver the foundation: a type-safe, CRUD-enabled task system wired to Supabase.

---

## Required Features for Milestone 1

| Feature | Description |
|---------|-------------|
| **Supabase DB** | `tasks` table with columns for title, importance, weight, deadline, and user association |
| **Zod Schemas** | Validation for task create/update payloads (client forms + server actions) |
| **CRUD** | Create, Read, Update, Delete tasks via Server Actions or API routes |
| **Auth-aware** | Tasks scoped to authenticated user (RLS) |

---

## Order of Operations (Why This Order?)

```
1. Supabase DB  →  2. Zod Schemas  →  3. CRUD
```

1. **Supabase DB first** — You need the `tasks` table and RLS before any app logic.
2. **Zod schemas second** — Define the validation layer to match your DB schema; single source of truth for types.
3. **CRUD third** — Implement operations using the DB and Zod validation.

---

## Implementation Checklist

### Phase 1: Supabase Database

- [ ] **1.1** Create `tasks` table in Supabase (Table Editor or SQL Editor)
  - `id` (uuid, primary key, default `gen_random_uuid()`)
  - `user_id` (uuid, references `auth.users`, not null)
  - `title` (text, not null)
  - `importance` (int, 1–10, default 5)
  - `weight` (int, 1–10, default 5)
  - `deadline` (timestamptz, nullable)
  - `created_at` (timestamptz, default `now()`)
  - `updated_at` (timestamptz, default `now()`)

- [ ] **1.2** Enable Row Level Security (RLS) on `tasks`

- [ ] **1.3** Create RLS policies:
  - SELECT: user can read own tasks (`auth.uid() = user_id`)
  - INSERT: user can create own tasks
  - UPDATE: user can update own tasks
  - DELETE: user can delete own tasks

- [ ] **1.4** (Optional) Add trigger to auto-update `updated_at` on row changes

---

### Phase 2: Zod Schemas

- [ ] **2.1** Create `lib/schemas/task.ts` (or `lib/validations/task.ts`)

- [ ] **2.2** Define `taskCreateSchema`:
  - `title`: string, min 1, max 255
  - `importance`: number, min 1, max 10, default 5
  - `weight`: number, min 1, max 10, default 5
  - `deadline`: optional date or Unix timestamp

- [ ] **2.3** Define `taskUpdateSchema` (partial of create — all fields optional)

- [ ] **2.4** Export inferred TypeScript types: `TaskCreate`, `TaskUpdate`, `Task`

---

### Phase 3: CRUD Implementation

- [ ] **3.1** Create Server Actions file: `app/protected/tasks/actions.ts` (or `lib/actions/tasks.ts`)

- [ ] **3.2** **Create:** `createTask(formData)` — parse with Zod, insert into Supabase, revalidate

- [ ] **3.3** **Read:** `getTasks()` — fetch tasks for `auth.uid()`, optionally order by deadline

- [ ] **3.4** **Update:** `updateTask(id, formData)` — parse with Zod, update in Supabase, revalidate

- [ ] **3.5** **Delete:** `deleteTask(id)` — delete from Supabase, revalidate

---

### Phase 4: UI & Forms

- [ ] **4.1** Create `/protected/tasks` page (or extend protected dashboard)

- [ ] **4.2** Task list component — display tasks from `getTasks()`

- [ ] **4.3** Task create form — uses `taskCreateSchema` for validation, calls `createTask`

- [ ] **4.4** Task edit form — uses `taskUpdateSchema`, calls `updateTask`

- [ ] **4.5** Delete button — calls `deleteTask` with confirmation

- [ ] **4.6** Wire form errors to Zod parsing errors for user feedback

---

### Phase 5: Polish & Integration

- [ ] **5.1** Add loading/error states for async operations

- [ ] **5.2** Ensure env vars are documented (`.env.example` or README)

- [ ] **5.3** Verify CI/CD runs `npm run build` (if using GitHub Actions)

- [ ] **5.4** Smoke test: create, read, update, delete a task end-to-end

---

## File Structure (Suggested)

```
lib/
  schemas/
    task.ts          # Zod schemas + inferred types
  supabase/
    client.ts        # (existing)
    server.ts        # (existing)

app/
  protected/
    tasks/
      page.tsx       # Tasks dashboard + list
      actions.ts     # Server Actions for CRUD
    layout.tsx       # (existing)
```

---

## Quick Reference: Focus Score Fields

| Field       | Type      | Zod Rule     | DB Column  |
|------------|-----------|--------------|------------|
| title      | string    | 1–255 chars  | `title`    |
| importance | number    | 1–10         | `importance` |
| weight     | number    | 1–10         | `weight`   |
| deadline   | date/ts   | optional     | `deadline` |

---

*Last updated: Milestone 1 planning*
