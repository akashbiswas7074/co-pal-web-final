const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:admin123@91.108.110.49:27017/vibecart?authSource=admin&directConnection=true";

async function checkBanners() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        const Banner = mongoose.model('Banner', new mongoose.Schema({
            type: String,
            platform: String,
            isActive: { type: Boolean, default: true },
            startDate: Date,
            endDate: Date,
            url: String
        }), 'banners');

        const WebsiteSection = mongoose.model('WebsiteSection', new mongoose.Schema({
            name: String,
            sectionId: String,
            isVisible: Boolean,
            order: Number
        }), 'websitesections');

        const allBanners = await Banner.find({});
        console.log(`Total banners in DB: ${allBanners.length}`);
        allBanners.forEach(b => {
            console.log(`- ID: ${b._id}, Type: ${b.type}, Platform: ${b.platform}, Active: ${b.isActive}, URL: ${b.url}`);
        });

        const sections = await WebsiteSection.find({ isVisible: true }).sort({ order: 1 });
        console.log(`\nVisible Website Sections:`);
        sections.forEach(s => {
            console.log(`${s.order}. ${s.name} (${s.sectionId})`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkBanners();
