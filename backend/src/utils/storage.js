import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 client using fetch API
class R2Client {
  constructor(config) {
    this.endpoint = config.endpoint;
    this.credentials = config.credentials;
  }

  async send(command) {
    return command.execute(this.endpoint, this.credentials);
  }
}

class PutObjectCommand {
  constructor({ Bucket, Key, Body, ContentType }) {
    this.bucket = Bucket;
    this.key = Key;
    this.body = Body;
    this.contentType = ContentType;
  }

  async execute(endpoint, credentials) {
    const url = `${endpoint}/${this.bucket}/${this.key}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${credentials.secretAccessKey}`,
        'Content-Type': this.contentType,
      },
      body: this.body,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response;
  }
}

class DeleteObjectCommand {
  constructor({ Bucket, Key }) {
    this.bucket = Bucket;
    this.key = Key;
  }

  async execute(endpoint, credentials) {
    const url = `${endpoint}/${this.bucket}/${this.key}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${credentials.secretAccessKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    return response;
  }
}

// Cloudflare R2 client
const r2Client = new R2Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Upload a file to R2 storage
 * @param {string} key - File path in bucket (e.g., "drawings/user123/image.png")
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type (e.g., "image/png")
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadFile(key, buffer, contentType) {
  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

/**
 * Upload user drawing
 */
export async function uploadDrawing(userId, gameId, imageBuffer) {
  const key = `drawings/${gameId}/${userId}-${Date.now()}.png`;
  return uploadFile(key, imageBuffer, 'image/png');
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId, imageBuffer, ext = 'jpg') {
  const key = `avatars/${userId}.${ext}`;
  return uploadFile(key, imageBuffer, `image/${ext}`);
}

/**
 * Upload physical challenge proof
 */
export async function uploadChallengeProof(userId, gameId, fileBuffer, contentType) {
  const ext = contentType.split('/')[1];
  const key = `challenges/${gameId}/${userId}-${Date.now()}.${ext}`;
  return uploadFile(key, fileBuffer, contentType);
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFile(key) {
  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw error;
  }
}

export default {
  uploadFile,
  uploadDrawing,
  uploadAvatar,
  uploadChallengeProof,
  deleteFile
};
