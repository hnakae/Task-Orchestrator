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

