const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const cartSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  products: [
    {
      product: mongoose.Schema.Types.ObjectId,
      name: String,
      qty: Number,
      size: String
    }
  ]
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema, 'carts');

async function inspectCarts() {
  try {
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return;
    }

    console.log('Connecting to MongoDB (dbName: vibecart)...');
    await mongoose.connect(MONGODB_URI, { dbName: 'vibecart' });
    console.log('Connected.');

    const nameToFind = 'SCENT-RIX Golden Aoud Extrait X';
    console.log(`Searching for carts containing: "${nameToFind}"`);

    const carts = await Cart.find({ 'products.name': new RegExp(nameToFind, 'i') }).lean();

    console.log(`Found ${carts.length} carts match.`);

    for (const cart of carts) {
      console.log(`Cart for user: ${cart.user}`);
      const items = cart.products.filter(p => new RegExp(nameToFind, 'i').test(p.name));
      console.log('Matching items in this cart:', JSON.stringify(items, null, 2));
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectCarts();
