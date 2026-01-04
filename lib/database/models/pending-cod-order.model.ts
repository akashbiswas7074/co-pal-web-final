import mongoose, { Schema, model, models, Document } from 'mongoose';
import { IOrder, IOrderItem } from './order.model';

// We're essentially reusing the Order type but with a more restrictive status
export interface IPendingCodOrder extends Omit<IOrder, 'status'> {
  codVerificationCode: string;
  codVerificationCodeExpires: Date;
}

// Create a schema for pending COD orders that mirrors the Order schema
const PendingCodOrderSchema = new Schema<IPendingCodOrder>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{ type: Schema.Types.Mixed, required: true }], // Will store IOrderItem objects
    deliveryAddress: { type: Schema.Types.Mixed, required: true }, // Will store IEmbeddedAddress objects
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod'],
      required: true,
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending'],
      default: 'pending',
    },
    codVerificationCode: {
      type: String,
      required: true,
      select: false // Hide by default for security
    },
    codVerificationCodeExpires: {
      type: Date,
      required: true,
      select: false // Hide by default for security
    },
    couponApplied: { type: String },
    discountAmount: { type: Number, default: 0 },
    itemsPrice: { type: Number },
    shippingPrice: { type: Number },
    taxPrice: { type: Number },
    total: { type: Number },
    totalOriginalItemsPrice: { type: Number },
    shippingAddress: { type: Schema.Types.Mixed },
    gstInfo: {
      gstin: String,
      businessName: String,
      businessAddress: String,
    },
    cgst: { type: Number },
    sgst: { type: Number },
    igst: { type: Number }
  },
  {
    timestamps: true,
    // Set TTL to automatically delete unverified orders after 24 hours
    // This provides cleanup of abandoned COD orders
    expires: 60 * 60 * 24,
    strict: false // Allow all fields to be saved even if not in schema (failsafe)
  }
);

PendingCodOrderSchema.index({ user: 1 });
PendingCodOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // 24 hour TTL

PendingCodOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // 24 hour TTL

// Force deletion of the model if it exists to ensure schema updates (especially strict: false) are picked up in dev
if (process.env.NODE_ENV !== 'production' && models.PendingCodOrder) {
  delete models.PendingCodOrder;
}

const PendingCodOrder = models.PendingCodOrder || model<IPendingCodOrder>('PendingCodOrder', PendingCodOrderSchema);

export default PendingCodOrder;