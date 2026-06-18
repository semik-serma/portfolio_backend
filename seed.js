import { connectdb } from './src/config/db.js';
import User from './src/models/userModels.js';
import { hashthepassword } from './src/utils/bcrypt.js';

async function seedAdmin() {
    await connectdb();
    const email = 'admin@semikdev.com';
    const existing = await User.findOne({ email });
    if (existing) {
        console.log('Admin user already exists:', email);
        process.exit(0);
    }
    const hash = await hashthepassword('Admin@123');
    await User.create({
        firstname: 'Admin',
        lastname: 'SemikDev',
        email,
        password: hash,
        role: 'ADMIN',
    });
    console.log('Admin user created successfully');
    console.log('Email:', email);
    console.log('Password: Admin@123');
    process.exit(0);
}

seedAdmin();
