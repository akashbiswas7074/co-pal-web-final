'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Play, Image as ImageIcon } from 'lucide-react';
import { convertToWebP } from '@/lib/image-utils';

interface MediaFile {
    url: string;
    public_id: string;
    resource_type: 'image' | 'video';
}

interface ReviewMediaUploaderProps {
    onMediaChange: (images: MediaFile[], videos: MediaFile[]) => void;
    maxFiles?: number;
}

const ReviewMediaUploader: React.FC<ReviewMediaUploaderProps> = ({
    onMediaChange,
    maxFiles = 5
}) => {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (media.length + files.length > maxFiles) {
            setUploadError(`You can only upload up to ${maxFiles} files.`);
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const newMedia = [...media];

        for (const file of files) {
            // Check file size (limit to 10MB for video/image)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError(`${file.name} is too large. Max size is 10MB.`);
                continue;
            }

            try {
                let fileToUpload = file;
                if (file.type.startsWith('image/')) {
                    try {
                        const webpBlob = await convertToWebP(file);
                        fileToUpload = new File([webpBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
                    } catch (webpError) {
                        console.error('WebP conversion failed:', webpError);
                    }
                }

                const formData = new FormData();
                formData.append('file', fileToUpload);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success && data.url) {
                    const mediaItem: MediaFile = {
                        url: data.url,
                        public_id: data.public_id,
                        resource_type: data.resource_type === 'video' ? 'video' : 'image'
                    };
                    newMedia.push(mediaItem);
                }
            } catch (error: any) {
                console.error('Error uploading media:', error);
                setUploadError(`Failed to upload ${file.name}`);
            }
        }

        setMedia(newMedia);
        updateParent(newMedia);
        setIsUploading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveMedia = (index: number) => {
        const newMedia = media.filter((_, i) => i !== index);
        setMedia(newMedia);
        updateParent(newMedia);
    };

    const updateParent = (currentMedia: MediaFile[]) => {
        const images = currentMedia.filter(m => m.resource_type === 'image');
        const videos = currentMedia.filter(m => m.resource_type === 'video');
        onMediaChange(images, videos);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {media.map((item, index) => (
                    <div key={item.public_id} className="relative w-20 h-20 border rounded-lg overflow-hidden group bg-gray-50">
                        {item.resource_type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                <Play className="w-6 h-6 text-white" />
                            </div>
                        ) : (
                            <img
                                src={item.url}
                                alt="Review media"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {media.length < maxFiles && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">Add Media</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
            />

            {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
            )}

            <p className="text-[11px] text-gray-500">
                You can upload up to {maxFiles} images or videos (max 10MB each).
            </p>
        </div>
    );
};

export default ReviewMediaUploader;
