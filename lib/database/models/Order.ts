import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // ... existing code ...
  
  // Delivery tracking fields
  deliveryPartner: {
    type: String,
    default: 'delhivery'
  },
  trackingNumber: {
    type: String
  },
  manifestId: {
    type: String
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'manifest_created', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryEstimate: {
    type: Date
  },
  deliveryCharge: {
    type: Number
  },
  // ... existing code ...
}, {
  timestamps: true
});

// ... existing code ...

export default mongoose.models.Order || mongoose.model('Order', orderSchema); 