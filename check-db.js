import mongoose from 'mongoose';

async function checkDbs() {
  const uriWebsite = 'mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/website?ssl=true&authSource=admin&retryWrites=true&w=majority';
  const uriTest = 'mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';
  
  const userSchema = new mongoose.Schema({ email: String });

  try {
    const conn1 = await mongoose.createConnection(uriWebsite).asPromise();
    const UserWeb = conn1.model('User', userSchema);
    const countWeb = await UserWeb.countDocuments();
    console.log(`Users in 'website' DB: ${countWeb}`);
    await conn1.close();

    const conn2 = await mongoose.createConnection(uriTest).asPromise();
    const UserTest = conn2.model('User', userSchema);
    const countTest = await UserTest.countDocuments();
    console.log(`Users in 'test' DB: ${countTest}`);
    await conn2.close();
  } catch (e) {
    console.error(e);
  }
}
checkDbs();
