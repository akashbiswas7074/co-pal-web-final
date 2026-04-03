const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:admin123@91.108.110.49:27017/vibecart?authSource=admin&directConnection=true";

async function insertSampleBanners() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        const Banner = mongoose.model('Banner', new mongoose.Schema({
            url: { type: String, required: true },
            public_id: { type: String, required: true, unique: true },
            type: { type: String, enum: ["website", "app"], required: true },
            platform: { type: String, enum: ["desktop", "mobile"], required: true },
            linkUrl: { type: String },
            altText: { type: String },
            isActive: { type: Boolean, default: true },
            priority: { type: Number, default: 10 }
        }), 'banners');

        const sampleBanners = [
            {
                url: "https://res.cloudinary.com/dlrlet9fg/image/upload/v1767451268/products/wyio2ox9kjzl7iysjelu.png",
                public_id: "sample-banner-1",
                type: "website",
                platform: "desktop",
                linkUrl: "/shop",
                altText: "Premium Fragrances Collection",
                isActive: true,
                priority: 1
            },
            {
                url: "https://res.cloudinary.com/dlrlet9fg/image/upload/v1767451268/products/wyio2ox9kjzl7iysjelu.png",
                public_id: "sample-banner-mobile-1",
                type: "website",
                platform: "mobile",
                linkUrl: "/shop",
                altText: "Premium Fragrances Collection Mobile",
                isActive: true,
                priority: 1
            }
        ];

        await Banner.deleteMany({ public_id: { $in: ["sample-banner-1", "sample-banner-mobile-1"] } });
        await Banner.insertMany(sampleBanners);
        console.log("Sample banners inserted successfully!");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

insertSampleBanners();
