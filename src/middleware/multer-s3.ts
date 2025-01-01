import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/s3config';

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME || 'careermap-bucket',
        // acl: 'public-read', // Uncomment if you want to set ACL for public access
        
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            console.log(file);

            // Determine the folder based on the file type
            let folder = 'Others';
            if (file.mimetype.startsWith('image/')) {
                folder = 'Images';
            } else if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword') {
                folder = 'Resumes';
            }

            const fileName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, `${folder}/${fileName}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Restrict allowed file types
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and resumes are allowed.'));
        }
    },
});

export default upload;
