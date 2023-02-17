import { getNow } from './date';

const IMAGE_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
const VIDEO_FILE_EXTENSIONS = ['.mp4'];
const THREE_DIMENSIONAL_FILE_EXTENSIONS = ['.glb'];

// A simple function if the uploaded file type is image.
// This is used in both of reactapp and nodeapp
export function isImage(filetype: string) {
  if (!filetype) {
    return false;
  }
  return filetype.toLowerCase().includes('image/');
}

/**
 * Find out if the extension of a file is image.
 */
export function isImageExtension(filepath: string) {
  if (!filepath) {
    return false;
  }

  return IMAGE_FILE_EXTENSIONS.includes(getExtension(filepath));
}

/**
 * Find out if the extension of a file is video.
 */
export function isVideoExtension(filepath: string) {
  if (!filepath) {
    return false;
  }

  return VIDEO_FILE_EXTENSIONS.includes(getExtension(filepath));
}

/**
 * Find out if the extension of a file is video.
 */
export function is3DExtension(filepath: string) {
  if (!filepath) {
    return false;
  }

  return THREE_DIMENSIONAL_FILE_EXTENSIONS.includes(getExtension(filepath));
}

/**
 * Get the extension of a file name.
 * The return value includes "." in the beginning
 */
export function getExtension(filepath: string) {
  if (!filepath) {
    return null;
  }
  const lowercasePath = filepath.toLowerCase();
  return lowercasePath.substring(lowercasePath.lastIndexOf('.'));
}

export function getProductObjectKey(productId: string, filename: string) {
  const { year, month, day } = getNow();
  const extension = getExtension(filename);
  return `${year}/${month}/${day}/${productId.slice(
    -2,
  )}/${productId}-original${extension}`;
}

export function getThumbnailObjectKey(productId: string, filename: string) {
  const { year, month, day } = getNow();
  const extension = getExtension(filename);
  return `${year}/${month}/${day}/${productId.slice(
    -2,
  )}/${productId}-thumb${extension}`;
}

export function getProfilePicObjectKey(userId: string, filename: string) {
  const { year, month, day } = getNow();
  const extension = getExtension(filename);
  return `${year}/${month}/${day}/${userId.slice(
    -2,
  )}/${userId}-profile${extension}`;
}
