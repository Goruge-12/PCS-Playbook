const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

function getKeyFromUrl(imageUrl) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    return decodeURIComponent(url.pathname.substring(1));
  } catch {
    return null;
  }
}

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded.'
      });
    }

    const folder = req.body.folder || 'Uploads';
    const oldImageUrl = req.body.oldImageUrl || '';

    const cleanFileName = req.file.originalname.replace(/\s+/g, '-');
    const fileName = `${folder}/${Date.now()}-${cleanFileName}`;

    console.log('UPLOAD FOLDER:', folder);
    console.log('S3 FILE NAME:', fileName);
    console.log('OLD IMAGE URL:', oldImageUrl);
    console.log('BUCKET:', process.env.AWS_BUCKET_NAME);
    console.log('REGION:', process.env.AWS_REGION);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    const imageUrl =
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    const oldKey = getKeyFromUrl(oldImageUrl);

    if (oldKey && oldKey !== fileName) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldKey
        })
      );

      console.log('OLD IMAGE DELETED:', oldKey);
    }

    res.json({
      message: 'Image uploaded successfully.',
      imageUrl
    });
  } catch (error) {
    console.error('S3 UPLOAD ERROR:', error);

    res.status(500).json({
      message: 'Upload failed.',
      error: error.message
    });
  }
};