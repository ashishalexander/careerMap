
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminModel, { AdminDocument } from '../models/adminModel'; 

const createAdminUser = async () => {
    const uri = 'mongodb://127.0.0.1:27017/careerMap'; 
    await mongoose.connect(uri);

    const email = "ashishalex29@gmail.com";
    const password = "Ashishalex662600@";

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser: AdminDocument = new AdminModel({
        email,
        password: hashedPassword, 
    });

    try {
        await adminUser.save();
        console.log('Admin user created successfully:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createAdminUser();
