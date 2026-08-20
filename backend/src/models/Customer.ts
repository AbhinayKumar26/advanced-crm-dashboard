import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead' | 'archive';
  lastContactDate: Date;
  notes?: string;
  accountOwner?: mongoose.Types.ObjectId;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'prospect', 'lead', 'archive'],
      default: 'prospect',
      required: true,
    },
    lastContactDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    accountOwner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for optimized searching and filtering
customerSchema.index({ email: 1 });
customerSchema.index({ company: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ lastContactDate: -1 });

export default mongoose.model<ICustomer>('Customer', customerSchema);