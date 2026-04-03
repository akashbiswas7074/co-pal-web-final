require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
    const banners = await mongoose.connection.collection("banners").find({}).toArray();
    console.log("Total banners:", banners.length);
    for(let b of banners) {
        console.log(`- platform:${b.platform} url:${b.url.substring(0, 30)} startDate:${b.startDate} endDate:${b.endDate} isActive:${b.isActive}`);
    }
    process.exit(0);
});
