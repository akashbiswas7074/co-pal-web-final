const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: String,
  _id: mongoose.Schema.Types.ObjectId,
  slug: String,
  subProducts: [
    {
      sku: String,
      sizes: [
        {
          size: String,
          qty: Number,
          price: Number
        }
      ]
    }
  ]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');

async function inspectProduct() {
  try {
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return;
    }

    console.log('Connecting to MongoDB (dbName: vibecart)...');
    await mongoose.connect(MONGODB_URI, { dbName: 'vibecart' });
    console.log('Connected.');

    const productName = 'SCENT-RIX Golden Aoud Extrait X';
    console.log(`Searching for product: "${productName}"`);

    const products = await Product.find({ name: new RegExp(productName, 'i') }).lean();

    if (products.length === 0) {
      console.log('No products found with that name.');
      const anyProduct = await Product.findOne().lean();
      console.log('Example product in DB:', JSON.stringify(anyProduct, null, 2));
    } else {
      console.log(`Found ${products.length} products:`, JSON.stringify(products, null, 2));
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectProduct();
