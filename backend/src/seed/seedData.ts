// import { PrismaClient, Prisma } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

// const TOTAL_RECORDS = 10000000; // 1 crore
// const BATCH_SIZE = 10000;

// async function seed() {
//   console.log('🌱 Seeding started...');

//   let inserted = 0;

//   while (inserted < TOTAL_RECORDS) {
//     const data: Prisma.PlaceCreateManyInput[] = [];

//     for (let i = 0; i < BATCH_SIZE; i++) {
//       data.push({
//         name: faker.company.name(),
//         description: faker.lorem.paragraph(),
//         category: faker.helpers.arrayElement([
//           'Restaurant',
//           'Hotel',
//           'Cafe',
//           'Hospital',
//           'School',
//           'Store',
//         ]),
//         status: faker.helpers.arrayElement([
//           'ACTIVE',
//           'INACTIVE',
//           'PENDING',
//         ]),
//         location: faker.location.city(),
//         tags: JSON.stringify([
//           faker.word.noun(),
//           faker.word.adjective(),
//           faker.word.verb(),
//         ]),
//         createdDate: faker.date.recent(),
//       });
//     }

//     await prisma.place.createMany({
//       data,
//     });

//     inserted += BATCH_SIZE;

//     console.log(`✅ Inserted: ${inserted.toLocaleString()} records`);
//   }

//   console.log('🎉 Seeding completed');
// }

// seed()
//   .catch((e) => {
//     console.error('❌ Error while seeding:', e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });



import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TOTAL_RECORDS = 10000000;   // 1 crore target
const BATCH_SIZE = 10000;
const ALREADY_INSERTED = 6930000; // already done — resume from here

async function seed() {
  console.log('🌱 Resuming seed from', ALREADY_INSERTED.toLocaleString(), '...');

  let inserted = ALREADY_INSERTED;

  while (inserted < TOTAL_RECORDS) {
    const remaining = TOTAL_RECORDS - inserted;
    const currentBatch = Math.min(BATCH_SIZE, remaining);

    const data: Prisma.PlaceCreateManyInput[] = [];

    for (let i = 0; i < currentBatch; i++) {
      data.push({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement([
          'Restaurant',
          'Hotel',
          'Cafe',
          'Hospital',
          'School',
          'Store',
        ]),
        status: faker.helpers.arrayElement([
          'ACTIVE',
          'INACTIVE',
          'PENDING',
        ]),
        location: faker.location.city(),
        tags: JSON.stringify([
          faker.word.noun(),
          faker.word.adjective(),
          faker.word.verb(),
        ]),
        createdDate: faker.date.recent(),
      });
    }

    await prisma.place.createMany({ data });

    inserted += currentBatch;

    const percent = ((inserted / TOTAL_RECORDS) * 100).toFixed(1);
    console.log(`✅ Inserted: ${inserted.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} (${percent}%)`);
  }

  console.log('🎉 Seeding completed — 1 crore records done!');
}

seed()
  .catch((e) => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });