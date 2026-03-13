const { PrismaClient } = require("./lib/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Updating existing tasks with type 'GENERAL' to 'ASSIGNMENT'...");
    // We use a raw query because the generated client might already be in the "new" state
    // where 'GENERAL' is not in the type definition, causing TS/runtime errors if used normally.
    const result = await prisma.$executeRaw`UPDATE tasks SET type = 'ASSIGNMENT' WHERE type::text = 'GENERAL'`;
    console.log(`Successfully updated ${result} tasks.`);
  } catch (e) {
    console.error("Error updating tasks:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
