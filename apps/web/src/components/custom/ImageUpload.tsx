'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';

export interface UploadedImage {
    id: string;
    file: File;
    url: string;
    fileName: string;
    fileSize: number;
    type: 'inspiration' | 'sketch' | 'reference';
    uploadedAt: string;
    isUploading?: boolean;
    uploadProgress?: number;
    error?: string;
}

interface ImageUploadProps {
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptedTypes?: string[];
    onImagesChange: (images: UploadedImage[]) => void;
    existingImages?: UploadedImage[];
    showCategories?: boolean;
    showCamera?: boolean;
    className?: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
const DEFAULT_MAX_FILES = 8;
const DEFAULT_MAX_FILE_SIZE = 10; // 10MB

export function ImageUpload({
    maxFiles = DEFAULT_MAX_FILES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
    onImagesChange,
    existingImages = [],
    showCategories = true,
    showCamera = true,
    className = ''
}: ImageUploadProps) {
    const [images, setImages] = useState<UploadedImage[]>(existingImages);
    const [dragActive, setDragActive] = useState(false);
    const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Update parent when images change
    const updateImages = useCallback((newImages: UploadedImage[]) => {
        setImages(newImages);
        onImagesChange(newImages);
    }, [onImagesChange]);

    // Validate file
    const validateFile = (file: File): string | null => {
        if (!acceptedTypes.includes(file.type)) {
            return `File type ${file.type} is not supported. Please use JPG, PNG, or HEIC.`;
        }

        if (file.size > maxFileSize * 1024 * 1024) {
            return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the ${maxFileSize}MB limit.`;
        }

        if (images.length >= maxFiles) {
            return `Maximum ${maxFiles} images allowed. Please remove some images first.`;
        }

        return null;
    };

    // Process and upload files
    const processFiles = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const newImages: UploadedImage[] = [];

        for (const file of fileArray) {
            const validationError = validateFile(file);

            if (validationError) {
                toast.error(validationError);
                continue;
            }

            // Create image object
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const imageUrl = URL.createObjectURL(file);

            const newImage: UploadedImage = {
                id: imageId,
                file,
                url: imageUrl,
                fileName: file.name,
                fileSize: file.size,
                type: 'inspiration', // Default type
                uploadedAt: new Date().toISOString(),
                isUploading: true,
                uploadProgress: 0
            };

            newImages.push(newImage);
        }

        if (newImages.length > 0) {
            const updatedImages = [...images, ...newImages];
            updateImages(updatedImages);

            // Simulate upload process (replace with actual upload logic)
            for (const image of newImages) {
                await simulateUpload(image);
            }
        }
    };

    // Simulate upload process (replace with actual S3 upload)
    const simulateUpload = async (image: UploadedImage) => {
        const updateProgress = (progress: number) => {
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, uploadProgress: progress }
                    : img
            ));
        };

        try {
            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 20) {
                updateProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Mark as complete
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, isUploading: false, uploadProgress: 100 }
                    : img
            ));

            toast.success(`${image.fileName} uploaded successfully`);
        } catch {
            // Handle upload error
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, isUploading: false, error: 'Upload failed' }
                    : img
            ));

            toast.error(`Failed to upload ${image.fileName}`);
        }
    };

    // Handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFiles(e.dataTransfer.files);
        }
    };

    // Handle file input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFiles(e.target.files);
        }
    };

    // Remove image
    const removeImage = (imageId: string) => {
        const updatedImages = images.filter(img => img.id !== imageId);
        updateImages(updatedImages);
    };

    // Update image type/category
    const updateImageType = (imageId: string, type: UploadedImage['type']) => {
        const updatedImages = images.map(img =>
            img.id === imageId ? { ...img, type } : img
        );
        updateImages(updatedImages);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gold'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleChange}
                    className="hidden"
                />

                {showCamera && (
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleChange}
                        className="hidden"
                    />
                )}

                <div className="space-y-4">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />

                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Drop images here, or click to select
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Up to {maxFiles} images, max {maxFileSize}MB each
                        </p>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:border-gold transition-colors"
                        >
                            <Upload size={16} />
                            Choose Files
                        </button>

                        {showCamera && (
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:border-gold transition-colors"
                            >
                                <Camera size={16} />
                                Take Photo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={image.url}
                                    alt={image.fileName}
                                    className="w-full h-full object-cover"
                                    onClick={() => setPreviewImage(image)}
                                />

                                {/* Upload Progress */}
                                {image.isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                            <div className="text-sm font-medium text-black">
                                                {image.uploadProgress}%
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {image.error && (
                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                            Error
                                        </div>
                                    </div>
                                )}

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeImage(image.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            {/* Image Category */}
                            {showCategories && (
                                <select
                                    value={image.type}
                                    onChange={(e) => updateImageType(image.id, e.target.value as UploadedImage['type'])}
                                    className="mt-2 w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                                >
                                    <option value="inspiration">Inspiration</option>
                                    <option value="sketch">Sketch</option>
                                    <option value="reference">Reference</option>
                                </select>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="max-w-4xl max-h-4xl p-4">
                        <img
                            src={previewImage.url}
                            alt={previewImage.fileName}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}