import { PrismaClient, SeatType, Role, Batch } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  // Create seats: D01-D40 (DESIGNATED) and F01-F10 (FLOATING)
  const seats = [];
  for (let i = 1; i <= 40; i++) {
    seats.push({ seatNumber: `D${String(i).padStart(2, '0')}`, type: SeatType.DESIGNATED });
  }
  for (let i = 1; i <= 10; i++) {
    seats.push({ seatNumber: `F${String(i).padStart(2, '0')}`, type: SeatType.FLOATING });
  }
  await prisma.seat.createMany({ data: seats });
  console.log(`✅ Created ${seats.length} seats`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@wissen.com',
      password: adminPassword,
      role: Role.ADMIN,
      batch: Batch.NONE,
      squad: 'Admin',
    },
  });

  // Create sample employees
  const empPassword = await bcrypt.hash('emp123', 10);
  const employees = [
    { name: 'Alice Johnson', email: 'alice@wissen.com', batch: Batch.A, squad: 'Alpha' },
    { name: 'Bob Smith', email: 'bob@wissen.com', batch: Batch.B, squad: 'Beta' },
    { name: 'Carol Davis', email: 'carol@wissen.com', batch: Batch.A, squad: 'Alpha' },
    { name: 'David Wilson', email: 'david@wissen.com', batch: Batch.B, squad: 'Gamma' },
  ];
  for (const emp of employees) {
    await prisma.user.create({
      data: { ...emp, password: empPassword, role: Role.EMPLOYEE },
    });
  }
  console.log(`✅ Created 1 admin + ${employees.length} employees`);

  // Set cycle start to last Monday
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() + diffToMonday);
  lastMonday.setHours(0, 0, 0, 0);

  await prisma.systemConfig.create({
    data: { cycleStartDate: lastMonday },
  });
  console.log(`✅ Set cycle start date to ${lastMonday.toDateString()}`);

  console.log('\n🎉 Seeding complete!');
  console.log('Admin login: admin@wissen.com / admin123');
  console.log('Employee login: alice@wissen.com / emp123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
