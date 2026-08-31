import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAMES = Array.from({ length: 12 }, (_, i) => `Manager ${i + 1}`);

async function main() {
  const count = await prisma.member.count();
  if (count === 0) {
    await prisma.member.createMany({
      data: NAMES.map((displayName, sortOrder) => ({ displayName, sortOrder })),
    });
    console.log("Seeded 12 league members (rename them in /admin).");
  } else {
    console.log(`Already have ${count} members, nothing to seed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
