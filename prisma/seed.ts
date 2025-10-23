// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "dnebiou@gmail.com";
  const password = "neba123123";
  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUserId = "usr_admin_default";

  console.log(`🌱 Seeding admin user and linked account...`);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      hashedPassword,
    },
    create: {
      id: adminUserId,
      email: adminEmail,
      name: "Site Administrator",
      role: Role.ADMIN,
      hashedPassword,
      accounts: {
        create: {
          // Use correct field names for NextAuth
          provider: "credentials",               // instead of providerId
          providerAccountId: adminEmail,         // instead of accountId
          type: "credentials",                   // required field
        },
      },
    },
  });

  console.log(`✅ Admin user ready!`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${adminUserId}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
