import mongoose from 'mongoose';

async function listOtps() {
  const uri = 'mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri);
    
    // Create a generic model for the otps collection
    // By default mongoose pluralizes models, what is the exact name in userModels.js or otpModel.js?
    // In auth.controller.js it's imported as `otpmodel` from `otpModel.js`
    
    const otpSchema = new mongoose.Schema({}, { strict: false });
    // Let's just find out what collection names exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Assuming the collection is 'otps' or 'otpmodels'
    let OtpModel;
    if (collections.find(c => c.name === 'otps')) {
        OtpModel = mongoose.model('otp', otpSchema, 'otps');
    } else if (collections.find(c => c.name === 'otpmodels')) {
        OtpModel = mongoose.model('otp', otpSchema, 'otpmodels');
    } else {
        // Fallback to Mongoose pluralization of 'otpmodel'
        OtpModel = mongoose.model('otpmodel', otpSchema);
    }
    
    const otps = await OtpModel.find({}).sort({ _id: -1 }).limit(10);
    console.log(`Found ${otps.length} recent otps.`);
    
    otps.forEach((o, i) => {
      console.log(`OTP ${i+1}: _id=${o._id}, email="${o.email}", otp="${o.otp}", isUsed=${o.isUsed}, expiresAt=${o.expiresAt}`);
    });

  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

listOtps();
