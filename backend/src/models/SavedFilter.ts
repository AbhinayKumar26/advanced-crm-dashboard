import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedFilter extends Document {
  name: string;
  filters: Record<string, any>; // Flexible object to store query params
  order: number;
  user: mongoose.Types.ObjectId;
}

const savedFilterSchema = new Schema<ISavedFilter>(
  {
    name: { type: String, required: true, trim: true },
    filters: { type: Schema.Types.Mixed, required: true },
    order: { type: Number, required: true, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISavedFilter>('SavedFilter', savedFilterSchema);