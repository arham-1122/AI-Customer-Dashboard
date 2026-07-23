/**
 * Seed script: creates a demo user and 20 sample customers with realistic notes.
 * Run with: npm run seed  (from the /server directory, after configuring .env)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');

const demoCustomers = [
  { fullName: 'Sarah Johnson', company: 'BrightPath Marketing', status: 'Active', note: 'Customer requested pricing details and wants a product demo next week. Expressed concerns about onboarding complexity.' },
  { fullName: 'Michael Chen', company: 'Vertex Logistics', status: 'Active', note: 'Attended the demo and requested a formal pricing package. Very interested in the enterprise tier.' },
  { fullName: 'Emily Rodriguez', company: 'Coastal Retail Group', status: 'Inactive', note: 'Went quiet after initial call. No response to two follow-up emails.' },
  { fullName: 'David Kim', company: 'NovaTech Solutions', status: 'Active', note: 'Loved the demo and wants to move forward with implementation next month.' },
  { fullName: 'Jessica Williams', company: 'Harbor Financial', status: 'Active', note: 'Asked detailed questions about data security and compliance certifications.' },
  { fullName: 'James Anderson', company: 'Summit Construction', status: 'Inactive', note: 'Decided to go with a competitor due to budget constraints this quarter.' },
  { fullName: 'Ashley Martinez', company: 'GreenLeaf Organics', status: 'Active', note: 'Onboarding in progress. Team is responsive and excited about the rollout.' },
  { fullName: 'Christopher Lee', company: 'Pinnacle Consulting', status: 'Active', note: 'Requested a custom integration with their existing CRM. Awaiting technical review.' },
  { fullName: 'Amanda Brown', company: 'Skyline Media', status: 'Active', note: 'Signed the contract this week. Kickoff call scheduled for Monday.' },
  { fullName: 'Matthew Taylor', company: 'Union Manufacturing', status: 'Inactive', note: 'Paused the evaluation internally. May revisit next fiscal year.' },
  { fullName: 'Olivia Davis', company: 'BlueWave Hospitality', status: 'Active', note: 'Very positive first call. Wants a proposal by end of week.' },
  { fullName: 'Daniel Wilson', company: 'Redwood Analytics', status: 'Active', note: 'Concerned about the implementation timeline given their Q4 deadline.' },
  { fullName: 'Sophia Garcia', company: 'Cascade Health Group', status: 'Active', note: 'Team completed onboarding and is actively using the platform daily.' },
  { fullName: 'Andrew Thompson', company: 'Iron Gate Security', status: 'Inactive', note: 'Unresponsive for over a month. Marked for re-engagement campaign.' },
  { fullName: 'Natalie Moore', company: 'Willow Creek Realty', status: 'Active', note: 'Requested additional training sessions for the sales team.' },
  { fullName: 'Ryan Jackson', company: 'Frontier Energy', status: 'Active', note: 'Expanded their contract to include two additional departments.' },
  { fullName: 'Lauren White', company: 'Maple Grove Education', status: 'Active', note: 'Very happy with support response times. Considering an annual upgrade.' },
  { fullName: 'Kevin Harris', company: 'Crestview Insurance', status: 'Inactive', note: 'Budget was cut mid-negotiation. Will follow up next quarter.' },
  { fullName: 'Megan Clark', company: 'Silver Oak Ventures', status: 'Active', note: 'Requested pricing details and a walkthrough of the reporting dashboard.' },
  { fullName: 'Brandon Lewis', company: 'Timberline Foods', status: 'Active', note: 'Contract renewal confirmed. Exploring add-on modules for next year.' },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing demo data...');
    await Customer.deleteMany({});
    await User.deleteOne({ email: 'demo@dashboard.com' });

    console.log('👤 Creating demo user...');
    const demoUser = await User.create({
      name: 'Admin',
      email: 'admin@dashboard.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('👥 Creating 20 demo customers...');
    const customers = demoCustomers.map((c, i) => ({
      fullName: c.fullName,
      email: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1-555-01${(10 + i).toString().padStart(2, '0')}`,
      company: c.company,
      status: c.status,
      notes: [{ text: c.note }],
      createdBy: demoUser._id,
      // Spread creation dates across the last 6 months for realistic charts
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 9),
    }));

    await Customer.insertMany(customers);

    console.log('✅ Seed complete!');
    console.log('   Demo login -> email: admin@dashboard.com | password: password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
