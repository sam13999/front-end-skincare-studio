export const hasUsablePhotoForLaunch = (photoFace: string | null, photoProfile: string | null): boolean =>
  Boolean(photoFace || photoProfile);
