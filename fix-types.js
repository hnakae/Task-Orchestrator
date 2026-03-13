const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, 'lib', 'generated', 'zod', 'index.ts');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 'Prisma.NullTypes.DbNull' being used as a type instead of 'typeof Prisma.NullTypes.DbNull'
  content = content.replace(/\| Prisma\.NullTypes\.DbNull/g, '| typeof Prisma.NullTypes.DbNull');
  content = content.replace(/\| Prisma\.NullTypes\.JsonNull/g, '| typeof Prisma.NullTypes.JsonNull');
  
  fs.writeFileSync(filePath, content);
  console.log('Successfully patched zod-prisma-types error.');
} else {
  console.error('Generated zod file not found at:', filePath);
}
