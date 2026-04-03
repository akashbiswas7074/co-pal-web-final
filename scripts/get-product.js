const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:admin123@91.108.110.49:27017/vibecart?authSource=admin&directConnection=true";

async function getProductImage() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({
            subProducts: Array
        }), 'products');

        const product = await Product.findOne({});
        console.log(JSON.stringify(product, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

getProductImage();
