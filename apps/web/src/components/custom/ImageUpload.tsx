'use client';

import { useState, useRef, useCallback } from 'react';

import { toast } from 'react-hot-toast';

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
        } catch (error) {
            // Handle upload error
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, isUploading: false, error: 'Upload failed' }
                    : img
            ));

            toast.error(`Failed to upload ${image.fileName}`);
        }
    }
}