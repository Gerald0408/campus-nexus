/**
 * seed.js — Campus Nexus Database Seeder
 * Usage: node seed.js
 *        npm run seed
 *
 * WARNING: This clears ALL existing users before seeding.
 *          Do NOT run on a database with real production data.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

// ── Seed data ──────────────────────────────────────────────────

const users = [
    {
        fullname:  'System Administrator',
        studentId: 'ADMIN-001',
        email:     'admin@campusnexus.edu',
        courses:   [],
        password:  'Admin@1234',
        role:      'Admin',
    },
    {
        fullname:  'Maria Santos',
        studentId: '2024-00001',
        email:     'maria.santos@student.edu',
        courses:   ['IT101', 'IT102', 'IT103'],
        password:  'Student@1234',
        role:      'Student',
    },
    {
        fullname:  'Juan dela Cruz',
        studentId: '2024-00002',
        email:     'juan.delacruz@student.edu',
        courses:   ['IT101', 'IT103'],
        password:  'Student@1234',
        role:      'Student',
    },
    {
        fullname:  'Andrea Reyes',
        studentId: '2024-00003',
        email:     'andrea.reyes@student.edu',
        courses:   ['IT102', 'IT103'],
        password:  'Student@1234',
        role:      'Student',
    },
    {
        fullname:  'Carlo Mendoza',
        studentId: '2024-00004',
        email:     'carlo.mendoza@student.edu',
        courses:   ['IT101', 'IT102'],
        password:  'Student@1234',
        role:      'Student',
    },
    {
        fullname:  'Lovely Garcia',
        studentId: '2024-00005',
        email:     'lovely.garcia@student.edu',
        courses:   ['IT101', 'IT102', 'IT103'],
        password:  'Student@1234',
        role:      'Student',
    },
];

// ── Main ───────────────────────────────────────────────────────

async function seed() {
    try {
        console.log('\n🌱 Campus Nexus — Database Seeder');
        console.log('──────────────────────────────────');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set in your .env file.');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ Connected: ${mongoose.connection.host}\n`);

        // Clear existing users
        const deleted = await User.deleteMany({});
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing user(s)`);

        // Hash passwords and insert
        const hashed = await Promise.all(
            users.map(async (u) => {
                const salt = await bcrypt.genSalt(12);
                return { ...u, password: await bcrypt.hash(u.password, salt) };
            })
        );

        await User.insertMany(hashed);
        console.log(`✅ Seeded ${hashed.length} users\n`);

        // Print summary table
        console.log('┌─────────┬───────────────┬───────────────────────┬──────────────┐');
        console.log('│ Role    │ Student ID    │ Name                  │ Password     │');
        console.log('├─────────┼───────────────┼───────────────────────┼──────────────┤');
        users.forEach((u) => {
            const role = u.role.padEnd(7);
            const id   = u.studentId.padEnd(13);
            const name = u.fullname.padEnd(21);
            const pw   = u.password.padEnd(12);
            console.log(`│ ${role} │ ${id} │ ${name} │ ${pw} │`);
        });
        console.log('└─────────┴───────────────┴───────────────────────┴──────────────┘');
        console.log('\n🚀 Login at http://localhost:5000/login\n');

    } catch (err) {
        console.error('\n❌ Seed error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
