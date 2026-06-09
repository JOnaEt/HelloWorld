import { storage } from './config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export type UploadProgress = (progress: number) => void;

// Upload any file from a local URI (from expo-image-picker or expo-document-picker)
export async function uploadFile(
  localUri: string,
  storagePath: string,
  onProgress?: UploadProgress
): Promise<string> {
  // Fetch the local file as a blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob);

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function uploadDevotionalCover(
  localUri: string,
  devotionalId: string,
  onProgress?: UploadProgress
): Promise<string> {
  return uploadFile(localUri, `devotionals/${devotionalId}/cover.jpg`, onProgress);
}

export async function uploadDevotionalAudio(
  localUri: string,
  devotionalId: string,
  onProgress?: UploadProgress
): Promise<string> {
  return uploadFile(localUri, `devotionals/${devotionalId}/audio.m4a`, onProgress);
}

export async function uploadAnnouncementImage(
  localUri: string,
  announcementId: string,
  onProgress?: UploadProgress
): Promise<string> {
  return uploadFile(localUri, `announcements/${announcementId}/image.jpg`, onProgress);
}

export async function uploadProfilePhoto(
  localUri: string,
  userId: string,
  onProgress?: UploadProgress
): Promise<string> {
  return uploadFile(localUri, `profiles/${userId}/photo.jpg`, onProgress);
}

export async function deleteFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // File may not exist — ignore
  }
}
