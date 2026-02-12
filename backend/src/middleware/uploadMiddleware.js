const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadBaseDir = path.join(__dirname, '../../uploads');

const createUploadMiddleware = (type = 'note') => {
    const storage = multer.diskStorage({
        destination: async (req, file, cb) => {
            const userId = req.user.id;
            const userUploadDir = path.join(uploadBaseDir, userId.toString());
            try {
                await fs.promises.mkdir(userUploadDir, { recursive: true });
                cb(null, userUploadDir);
            } catch (err) {
                cb(err);
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const prefix = type === 'avatar' ? 'avatar' : 'note';
            cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    });

    const limits = {
        fileSize: type === 'avatar' ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10mb for avatar, 5mb for notes
    };

    const fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error(`Only ${type === 'avatar' ? 'JPEG/JPG/PNG' : 'images'} are allowed`));
    };

    return multer({ storage, limits, fileFilter });
};

module.exports = {
    noteUpload: createUploadMiddleware('note'),
    avatarUpload: createUploadMiddleware('avatar'),
};
