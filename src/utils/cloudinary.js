import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: "dghmvblkt",
    api_key: "744943472684582",
    api_secret: "jjL3PlgvSogdfMUrjSGAcwHgjYU",
});

const reelStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype?.startsWith('video/');
        return {
            folder: 'reels',
            resource_type: 'auto',
            allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm', 'mkv'] : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        };
    },
});

const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'article-images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },
});

export const uploadVideo = multer({ storage: reelStorage });
export const uploadImage = multer({ storage: imageStorage });
