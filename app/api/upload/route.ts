import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        let uploadResult;
        try {
            uploadResult = await cloudinary.uploader.upload(base64File, {
                folder: 'vibecart/reviews', // Dedicated folder for reviews
                resource_type: 'auto', // Automatically detect if it's an image or video
            });

            console.log("Cloudinary upload success for review:", uploadResult.public_id);
        } catch (cloudinaryError) {
            console.error("Cloudinary upload error:", cloudinaryError);
            return NextResponse.json(
                { success: false, message: "Media upload failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            resource_type: uploadResult.resource_type,
            message: "Media uploaded successfully"
        });

    } catch (error) {
        console.error("Media upload error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to upload media" },
            { status: 500 }
        );
    }
}
