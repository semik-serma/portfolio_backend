import mongoose from "mongoose";
import dns from "dns";
import 'dotenv/config';

// Force IPv4 for DNS resolution to avoid ECONNREFUSED with SRV records in Node 18+
dns.setDefaultResultOrder('ipv4first');

const uri = process.env.MONGODB_URI;

async function testConnection() {
  console.log("Testing connection to", uri);
  try {
    await mongoose.connect(uri, { family: 4 });
    console.log("Connection successful with IPv4 first!");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed with IPv4 first:", error.message);
    
    // Try fallback URI without SRV
    console.log("Trying fallback without SRV...");
    const fallbackUri = "mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-01.dmkxhjw.mongodb.net:27017,ac-f6trjha-shard-00-02.dmkxhjw.mongodb.net:27017/website?ssl=true&replicaSet=atlas-f6trjha-shard-0&authSource=admin&retryWrites=true&w=majority";
    try {
        await mongoose.connect(fallbackUri, { family: 4 });
        console.log("Connection successful with Fallback URI!");
        process.exit(0);
    } catch (fallbackError) {
        console.error("Fallback connection failed:", fallbackError.message);
        process.exit(1);
    }
  }
}

testConnection();
