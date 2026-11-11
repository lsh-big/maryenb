const { PrismaClient } = require("@prisma/client");
const products = require("../src/data/products.json");

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: {
      slug: {
        in: [
          "daily-glow-serum",
          "calm-barrier-cream",
          "soft-cleanser",
          "daily-sun-fluid",
          "nourishing-lip-balm",
          "hydration-mask",
        ],
      },
    },
    data: { isActive: false },
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} MaryenB products.`);
}

main()
  .catch((error) => {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
