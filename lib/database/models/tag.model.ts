import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["MANDATORY_UNIVERSAL", "UNIVERSAL_OPTIONAL", "DEPENDENT_SUBCAT"],
            default: "UNIVERSAL_OPTIONAL",
        },
        isMandatory: {
            type: Boolean,
            default: false,
            required: true,
        },
        subCategory: {
            type: ObjectId,
            ref: "SubCategory",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
tagSchema.index({ subCategory: 1 });
tagSchema.index({ name: 1 });
tagSchema.index({ isMandatory: 1 });

// Force deletion of the model if it exists to ensure schema updates
if (process.env.NODE_ENV !== 'production' && mongoose.models.Tag) {
    delete mongoose.models.Tag;
}

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);
export default Tag;
