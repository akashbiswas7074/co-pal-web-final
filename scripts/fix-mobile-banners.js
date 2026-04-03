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
    url: String,
    public_id: String,
    type: String,
    platform: String,
    isActive: Boolean,
    startDate: Date,
    endDate: Date,
    priority: Number
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

async function fixMobileBanners() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Ensure all existing mobile banners are active and have no end date
        const result = await Banner.updateMany(
            { platform: 'mobile', type: 'website' },
            {
                $set: {
                    isActive: true,
                    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                },
                $unset: { endDate: "" }
            }
        );

        console.log(`Updated ${result.modifiedCount} mobile banners.`);

        // If no mobile banners exist, create one
        const count = await Banner.countDocuments({ platform: 'mobile', type: 'website' });
        if (count === 0) {
            console.log("No mobile banners found. Creating a sample one...");
            await Banner.create({
                url: "https://res.cloudinary.com/dl767451268/image/upload/v1767451268/products/wyio2ox9kjzl7iysjelu.png",
                public_id: "sample-mobile-banner-fixed",
                type: "website",
                platform: "mobile",
                isActive: true,
                priority: 1,
                startDate: new Date(),
                impressions: 0,
                clicks: 0
            });
            console.log("Sample mobile banner created.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

fixMobileBanners();
