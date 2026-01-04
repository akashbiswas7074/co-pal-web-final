import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;
const reviewSchema = new mongoose.Schema({
  reviewBy: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  review: {
    type: String,
    required: true,
  },
  reviewCreatedAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
});
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: ObjectId,
      required: false,
      ref: "Category",
    },
    subCategories: {
      type: [
        {
          type: ObjectId,
          ref: "SubCategory",
        },
      ],
      required: false,
    },
    details: [
      {
        name: String,
        value: String,
      },
    ],
    benefits: [{ name: String }],
    ingredients: [{ name: String }],
    // Tag values for the product
    tagValues: [
      {
        tag: {
          type: ObjectId,
          ref: "Tag",
        },
        value: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    vendor: {
      type: Object,
    },
    vendorId: {
      type: ObjectId,
      ref: "Vendor",
      required: false,
    },
    subProducts: [
      {
        sku: String,
        images: [],
        description_images: [],
        sizes: [
          {
            size: String,
            qty: Number,
            price: Number, // This should be the FINAL price after discount
            originalPrice: Number, // Add original price field
            sold: {
              type: Number,
              default: 0,
            },
          },
        ],
        // Direct price/quantity fields for products without sizes
        price: {
          type: Number,
          required: false, // Optional for products with sizes
        },
        qty: {
          type: Number,
          required: false, // Optional for products with sizes
        },
        stock: {
          type: Number,
          required: false, // Optional for products with sizes
        },
        discount: {
          type: Number,
          default: 0,
        },
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Product-level direct fields for products without sizes
    price: {
      type: Number,
      required: false,
    },
    qty: {
      type: Number,
      required: false,
    },
    stock: {
      type: Number,
      required: false,
    },
    shippingDimensions: {
      length: {
        type: Number,
        default: 0,
      },
      breadth: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      weight: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        default: 'cm/kg', // cm for dimensions, kg for weight
      },
    },
    featured: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Force deletion of the model if it exists to ensure schema updates
if (process.env.NODE_ENV !== 'production' && mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
