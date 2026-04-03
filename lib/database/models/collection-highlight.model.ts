import { Schema, model, models, Document } from "mongoose";

export interface ICollectionHighlightItem {
    title: string;
    description?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    gridSpan: number;
    bgGradient?: string;
    titleColor?: string;
    descriptionColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export interface ICollectionHighlight extends Document {
    title: string;
    subtitle?: string;
    isActive: boolean;
    order: number;
    items: ICollectionHighlightItem[];
    titleColor?: string;
    subtitleColor?: string;
    backgroundColor?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CollectionHighlightItemSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, required: true },
    gridSpan: { type: Number, default: 1 },
    bgGradient: { type: String },
    titleColor: { type: String },
    descriptionColor: { type: String },
    buttonColor: { type: String },
    buttonTextColor: { type: String },
});

const CollectionHighlightSchema = new Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        items: [CollectionHighlightItemSchema],
        titleColor: { type: String },
        subtitleColor: { type: String },
        backgroundColor: { type: String, default: "#ffffff" },
    },
    { timestamps: true }
);

delete models.CollectionHighlight;
const CollectionHighlight = models.CollectionHighlight || model<ICollectionHighlight>('CollectionHighlight', CollectionHighlightSchema);

export default CollectionHighlight;
