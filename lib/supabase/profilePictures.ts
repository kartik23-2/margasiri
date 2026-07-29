export const PROFILE_PICTURES_BUCKET = 'profile_pictures';

export function profilePicturePath(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${userId}/profile-${Date.now()}.${extension}`;
}

export function isValidProfilePicture(file: File) {
  return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
}
