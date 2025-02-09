const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Process and save base64 image to file system
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} uploadDir - Directory to save the image (e.g., 'avatars')
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Filename of saved image
 */
const saveBase64Image = async (base64Image, uploadDir = 'avatars', options = {}) => {
  try {
    // Extract base64 data and mime type
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Validate mime type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Unsupported image format. Allowed: JPEG, PNG, GIF, WebP');
    }

    // Generate unique filename
    const fileExtension = mimeType.split('/')[1];
    const filename = `${uuidv4()}.${fileExtension}`;
    
    // Create full path
    const uploadPath = path.join(__dirname, '../../uploads', uploadDir);
    const filePath = path.join(uploadPath, filename);
    
    // Ensure upload directory exists
    await fs.mkdir(uploadPath, { recursive: true });
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp if options provided
    let processedBuffer = imageBuffer;
    
    if (options.resize) {
      processedBuffer = await sharp(imageBuffer)
        .resize(options.resize.width || 300, options.resize.height || 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: options.quality || 80 })
        .toBuffer();
    } else if (options.quality) {
      processedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: options.quality })
        .toBuffer();
    }
    
    // Save to file system
    await fs.writeFile(filePath, processedBuffer);
    
    // Return the filename (this will be stored in database)
    return filename;
    
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

/**
 * Delete image file from file system
 * @param {string} filename - Name of the file to delete
 * @param {string} uploadDir - Directory where the file is located
 */
const deleteImage = async (filename, uploadDir = 'avatars') => {
  try {
    if (!filename) return;
    
    const filePath = path.join(__dirname, '../../uploads', uploadDir, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures
  }
};

/**
 * Get full URL for an image
 * @param {string} filename - Name of the image file
 * @param {string} uploadDir - Directory where the image is located
 * @param {string} baseUrl - Base URL of your API
 * @returns {string} - Full URL to the image
 */
const getImageUrl = (filename, uploadDir = 'avatars', baseUrl = '') => {
  if (!filename) return null;
  return `${baseUrl}/uploads/${uploadDir}/${filename}`;
};

/**
 * Add full avatar URLs to child data
 * @param {Object|Array} childData - Child data object or array of children
 * @param {string} baseUrl - Base URL of your API
 * @returns {Object|Array} - Child data with full avatar URLs
 */
const addAvatarUrls = (childData, baseUrl = '') => {
  if (Array.isArray(childData)) {
    return childData.map(child => {
      if (child.avatar) {
        return {
          ...child.toObject ? child.toObject() : child,
          avatarUrl: getImageUrl(child.avatar, 'avatars', baseUrl)
        };
      }
      return child.toObject ? child.toObject() : child;
    });
  } else {
    if (childData.avatar) {
      return {
        ...childData.toObject ? childData.toObject() : childData,
        avatarUrl: getImageUrl(childData.avatar, 'avatars', baseUrl)
      };
    }
    return childData.toObject ? childData.toObject() : childData;
  }
};

module.exports = {
  saveBase64Image,
  deleteImage,
  getImageUrl,
  addAvatarUrls
};
