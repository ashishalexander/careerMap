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
            console.log(file)
            const fileName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, `Images/${fileName}`); 
        },
    }),
});

export default upload;

