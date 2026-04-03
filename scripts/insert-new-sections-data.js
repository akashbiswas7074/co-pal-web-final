const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually load environment variables from .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const equalsIndex = trimmedLine.indexOf('=');
        if (equalsIndex !== -1) {
            const key = trimmedLine.substring(0, equalsIndex).trim();
            let value = trimmedLine.substring(equalsIndex + 1).trim();

            // Remove trailing comments
            const hashIndex = value.indexOf(' #');
            if (hashIndex !== -1) {
                value = value.substring(0, hashIndex).trim();
            } else if (value.includes('#') && !value.includes('mongodb')) {
                // Careful with # in connection strings
                const simpleHashIndex = value.indexOf('#');
                if (simpleHashIndex !== -1) {
                    value = value.substring(0, simpleHashIndex).trim();
                }
            }

            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');

            process.env[key] = value;
            if (key === 'MONGODB_URI' || key === 'DATABASE_URL') {
                console.log(`Loaded ${key}`);
            }
        }
    });
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI or DATABASE_URL environment variable');
    process.exit(1);
}

// Define Schemas directly in script to avoid ESM/CJS issues with models
async function insertSampleData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // 1. Featured Review
        const FeaturedReviewSchema = new mongoose.Schema({
            quote: String,
            reviewerName: String,
            reviewerSubtext: String,
            stars: Number,
            isVerified: Boolean,
            totalReviewsText: String,
            averageRatingText: String,
            isActive: Boolean,
            order: Number,
            backgroundImage: String
        }, { timestamps: true });

        const FeaturedReview = mongoose.models.FeaturedReview || mongoose.model('FeaturedReview', FeaturedReviewSchema);

        await FeaturedReview.deleteMany({});
        await FeaturedReview.create({
            quote: "The name says it all!!! Beautiful princess vibes. Leaves a soft, comforting scent.",
            reviewerName: "Victoria J.",
            reviewerSubtext: "Verified Buyer",
            stars: 5,
            isVerified: true,
            totalReviewsText: "40K+",
            averageRatingText: "4.9",
            isActive: true,
            order: 1,
            backgroundImage: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-7h7LqCfmOA4_zzc6ag.webp"
        });
        console.log('Inserted Featured Review sample');

        // 2. Blogs
        const BlogSchema = new mongoose.Schema({
            title: String,
            slug: String,
            author: String,
            date: Date,
            excerpt: String,
            content: String,
            mainImage: String,
            isActive: Boolean
        }, { timestamps: true });

        const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

        await Blog.deleteMany({});
        await Blog.create([
            {
                title: "10 Best Women's Perfume Picks That Celebrate Her Strength",
                slug: "10-best-womens-perfume-picks",
                author: "Cressida Winslow",
                date: new Date(),
                excerpt: "Discover the scents that empower and inspire. From bold florals to deep musks...",
                content: "Full content here...",
                mainImage: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-eaR53vgJ96I_gtzu3q.webp",
                isActive: true
            },
            {
                title: "Romantic DUA Scents For Valentine's Day: Fragrance Picks For A Special Date Night",
                slug: "romantic-dua-scents-valentines-day",
                author: "Cressida Winslow",
                date: new Date(),
                excerpt: "Make your date night unforgettable with these romantic fragrance selections...",
                content: "Full content here...",
                mainImage: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-FU1Hh0Pcp5M_p4h6t0.webp",
                isActive: true
            },
            {
                title: "10 Must-Have Valentine's Day Fragrances To Set the Mood",
                slug: "10-must-have-valentines-fragrances",
                author: "Cressida Winslow",
                date: new Date(),
                excerpt: "The perfect atmosphere starts with the perfect scent. Explore our top picks...",
                content: "Full content here...",
                mainImage: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-Nu9uZKnnq1s_yy3pnh.webp",
                isActive: true
            }
        ]);
        console.log('Inserted Blog samples');

        // 3. Influencers
        const InfluencerSchema = new mongoose.Schema({
            name: String,
            handle: String,
            platform: String,
            mediaUrl: String,
            thumbnailUrl: String,
            productName: String,
            isActive: Boolean,
            order: Number
        }, { timestamps: true });

        const Influencer = mongoose.models.InfluencerSpotlight || mongoose.model('InfluencerSpotlight', InfluencerSchema);

        await Influencer.deleteMany({});
        await Influencer.create([
            {
                name: "Influencer One",
                handle: "@perfumelover",
                platform: "TikTok",
                mediaUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-pKRDz-P6Nt8_gvgvgn.webp",
                thumbnailUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-pKRDz-P6Nt8_gvgvgn.webp",
                productName: "Cola Cream Dream",
                isActive: true,
                order: 1
            },
            {
                name: "Influencer Two",
                handle: "@scentexpert",
                platform: "Instagram",
                mediaUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-7h7LqCfmOA4_zzc6ag.webp",
                thumbnailUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-7h7LqCfmOA4_zzc6ag.webp",
                productName: "Heart Of Rome",
                isActive: true,
                order: 2
            },
            {
                name: "Influencer Three",
                handle: "@duafragrances",
                platform: "TikTok",
                mediaUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-eaR53vgJ96I_gtzu3q.webp",
                thumbnailUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-eaR53vgJ96I_gtzu3q.webp",
                productName: "Her Rose Journey",
                isActive: true,
                order: 3
            },
            {
                name: "Influencer Four",
                handle: "@stylewithscent",
                platform: "TikTok",
                mediaUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-FU1Hh0Pcp5M_p4h6t0.webp",
                thumbnailUrl: "https://res.cloudinary.com/dtxh3ew7s/image/upload/v1727319639/800w-FU1Hh0Pcp5M_p4h6t0.webp",
                productName: "Cherry Blossom Journey",
                isActive: true,
                order: 4
            }
        ]);
        console.log('Inserted Influencer samples');

        // 4. Initialize Website Sections to ensure order
        const WebsiteSectionSchema = new mongoose.Schema({
            name: String,
            sectionId: String,
            isVisible: Boolean,
            order: Number,
            description: String
        });
        const WebsiteSection = mongoose.models.WebsiteSection || mongoose.model('WebsiteSection', WebsiteSectionSchema);

        const sections = [
            { name: "Featured Review Hero", sectionId: "featured-review-hero", isVisible: true, order: 115 },
            { name: "Recent Blogs", sectionId: "recent-blogs", isVisible: true, order: 125 },
            { name: "Influencer Spotlight", sectionId: "influencer-spotlight", isVisible: true, order: 135 }
        ];

        for (const section of sections) {
            await WebsiteSection.findOneAndUpdate(
                { sectionId: section.sectionId },
                section,
                { upsert: true }
            );
        }
        console.log('Updated Website Sections order');

        console.log('Sample data insertion complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error inserting sample data:', error);
        process.exit(1);
    }
}

insertSampleData();
