const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// replace provider
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
schema = schema.replace('url      = env("DATABASE_URL")', 'url      = "file:./dev.db"');

// remove enums
schema = schema.replace(/enum \w+ \{[\s\S]*?\}/g, '');

// replace enum types with String and quote the default values
schema = schema.replace(/role\s+UserRole\s+@default\(STUDENT\)/g, 'role String @default("STUDENT")');
schema = schema.replace(/status\s+ContentStatus\s+@default\(DRAFT\)/g, 'status String @default("DRAFT")');
schema = schema.replace(/type\s+NotificationType\s+@default\(INFO\)/g, 'type String @default("INFO")');

// remove @db.Text
schema = schema.replace(/@db\.Text/g, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Converted schema to SQLite');
