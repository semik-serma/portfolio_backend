import mongoose from 'mongoose';

async function listUsers() {
  const uri = 'mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri);
    
    // Create a generic model for the users collection
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    
    users.forEach((u, i) => {
      console.log(`User ${i+1}: _id=${u._id}, email="${u.email}", firstname="${u.firstname}"`);
    });

  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
