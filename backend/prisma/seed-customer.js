import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dummy customer and orders...');

  // 1. Create a dummy customer
  const email = 'dummy@allc.in';
  const passwordText = 'Password123';
  const passwordHash = await bcrypt.hash(passwordText, 12);

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      name: 'Priya Sharma (Dummy)',
      email,
      phone: '9876543210',
      passwordHash,
    },
  });

  console.log(`✅ Customer created/updated: ${customer.email} / ${passwordText}`);

  // Fetch some services/pathways to create orders
  const services = await prisma.service.findMany({ include: { pathways: true } });
  
  if (services.length === 0) {
    console.log('⚠️ No services found, please seed services first.');
    return;
  }

  // Clear existing dummy orders if any
  await prisma.serviceOrder.deleteMany({ where: { patientEmail: email } });

  // 2. Create a PAID order (will show up in My Programs & History)
  const service1 = services.find(s => s.id === '01') || services[0]; // 90-Day Lifestyle Program
  const pathway1 = service1.pathways[0];

  if (service1 && pathway1) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 15); // Started 15 days ago

    await prisma.serviceOrder.create({
      data: {
        txnid: `ALLC-${Date.now()}-PAID`,
        patientName: customer.name,
        patientEmail: customer.email,
        patientPhone: customer.phone || '',
        totalAmountRs: pathway1.priceRs,
        status: 'PAID',
        customerId: customer.id,
        createdAt: pastDate,
        updatedAt: pastDate,
        items: {
          create: [
            {
              serviceId: service1.id,
              pathwayId: pathway1.id,
              priceRs: pathway1.priceRs,
            }
          ]
        }
      }
    });
    console.log(`✅ Created PAID order for: ${service1.title}`);
  }

  // 3. Create a FAILED order (will show up in History only)
  const service2 = services.find(s => s.id === '05') || services[0]; // Liver Renewal
  const pathway2 = service2.pathways[0];

  if (service2 && pathway2) {
    const failedDate = new Date();
    failedDate.setDate(failedDate.getDate() - 2); 

    await prisma.serviceOrder.create({
      data: {
        txnid: `ALLC-${Date.now()}-FAILED`,
        patientName: customer.name,
        patientEmail: customer.email,
        patientPhone: customer.phone || '',
        totalAmountRs: pathway2.priceRs,
        status: 'FAILED',
        customerId: customer.id,
        createdAt: failedDate,
        updatedAt: failedDate,
        items: {
          create: [
            {
              serviceId: service2.id,
              pathwayId: pathway2.id,
              priceRs: pathway2.priceRs,
            }
          ]
        }
      }
    });
    console.log(`✅ Created FAILED order for: ${service2.title}`);
  }

  console.log('✅ Seeding complete!');
  console.log('\n----------------------------------------');
  console.log('Login Credentials for Dashboard Testing:');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${passwordText}`);
  console.log('----------------------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
