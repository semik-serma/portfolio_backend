const { MongoClient } = require('mongodb');

async function getReplicaSetName() {
    const uri = "mongodb://semikserma:semikserma@ac-f6trjha-shard-00-00.dmkxhjw.mongodb.net:27017/website?ssl=true&authSource=admin";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('admin');
        const result = await db.command({ hello: 1 });
        console.log("Replica Set Name:", result.setName);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

getReplicaSetName();
