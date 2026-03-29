# Author: Hironobu Nakae <hnakae@uoregon.edu>

## Getting Started

hosted on vercel: https://task-orchestrator-peach.vercel.app/

run: ``` cd task-orchestrator
         npm install b
         npm run dev ```

The Workflow:
   1. Database: You update schema.prisma.
   2. Generate: Prisma generates the database
      client and Zod schemas.
   3. Full-Stack Safety: Your Frontend forms and
      Backend actions now "know" about the new
      database column immediately, with zero manual
      typing.

  Summary of Benefits in this Project:
   - Zero Desync: You can't accidentally send a
     string to a numeric database column.
   - Auto-Documentation: The schema tells other
     developers exactly what a "Task" requires.
   - Fail-Fast: Errors are caught at the API
     boundary (Server Actions) before they cause
     weird bugs in the database or UI.

TO UNDO GIT PUSH:
```
  git reset --hard <last-good-commit-hash>
  git push origin <branch-name> --force
```
IF THE APP ISN'T WORKING:
- **Database Status**: Check Supabase DB and ensure it's resumed if paused.
- **Syncing Schema Changes**: If you've modified `prisma/schema.prisma` or are seeing type errors, run the following commands:
  - `npm run db:sync`: **Recommended.** This runs both `db:migrate` and `db:generate` in sequence, ensuring your database and types are fully synchronized in one step.
  - `npm run db:migrate`: This uses `dotenv` and `prisma migrate dev`. It creates a new migration file based on your `schema.prisma` changes and applies it to your database. Use this when you change the database structure.
  - `npm run db:generate`: This runs `prisma generate` to update the Prisma Client and `zod-prisma-types` to update the Zod schemas in `lib/generated/zod`. It also runs `node fix-types.js` to patch a known typing issue in the generated Zod files.
- **Why Zod?**: This project uses `zod-prisma-types` to automatically generate Zod validation schemas from your Prisma models. These are located in `lib/generated/zod/index.ts`. 
  - If your Server Actions are failing due to validation, check if the Zod schema matches your expected input.
  - If you add a new field to a model, running `db:generate` ensures your frontend forms and backend validation logic are immediately aware of the change.
- **Type Errors**: If you see `ENOTFOUND` or `fetch failed` errors, verify your `.env` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
