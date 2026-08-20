import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Customer from '../src/models/Customer';

// Load environment variables from the .env file
dotenv.config();

const SEED_COUNT = 150;

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // 2. Clear existing customers to prevent duplicates during testing
    await Customer.deleteMany({});
    console.log('🗑️  Cleared existing customers.');

    // 3. Generate Mock Data
    const customers = [];
    const statuses = ['active', 'inactive', 'prospect', 'lead', 'archive'];
    const companies = ['Acme Corp', 'Globex', 'Stark Industries', 'Innovatech', 'Wayne Enterprises', 'Umbrella Corp'];

    for (let i = 0; i < SEED_COUNT; i++) {
      customers.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number({ style: 'national' }),
        company: faker.helpers.arrayElement(companies),
        status: faker.helpers.arrayElement(statuses),
        // Generate a random last contact date within the past year
        lastContactDate: faker.date.past({ years: 1 }),
        notes: faker.lorem.sentence(),
      });
    }

    // 4. Insert into Database
    await Customer.insertMany(customers);
    console.log(`🌱 Successfully seeded ${SEED_COUNT} customers!`);

    // 5. Exit cleanly
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();