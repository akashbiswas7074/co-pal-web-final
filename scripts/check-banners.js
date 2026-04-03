const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path to .env in co-pal-web-final
const envPath = path.join(__dirname, '../.env');

const loadEnv = () => {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split(/\r?\n/);
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const parts = trimmedLine.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            }
        });
    }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

// Minimal Schema
const BannerSchema = new mongoose.Schema({
    type: String,
    platform: String,
    isActive: Boolean,
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

async function checkBanners() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const bannerCounts = await Banner.aggregate([
            { $group: { _id: { type: "$type", platform: "$platform", isActive: "$isActive" }, count: { $sum: 1 } } }
        ]);

        console.log("Banner statistics:");
        console.log(JSON.stringify(bannerCounts, null, 2));

        const mobileBanners = await Banner.find({ platform: 'mobile' }).lean();
        console.log(`Found ${mobileBanners.length} mobile banners.`);
        if (mobileBanners.length > 0) {
            console.log("Sample mobile banner:", JSON.stringify(mobileBanners[0], null, 2));
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkBanners();
