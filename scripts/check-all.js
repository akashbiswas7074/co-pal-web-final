const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:admin123@91.108.110.49:27017/vibecart?authSource=admin&directConnection=true";

async function checkAllCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections in database:");
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);

            if (col.name.toLowerCase().includes('banner')) {
                const docs = await db.collection(col.name).find({}).limit(5).toArray();
                console.log(`  Sample data from ${col.name}:`, JSON.stringify(docs, null, 2));
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkAllCollections();
