
import axios from 'axios';

export type UploadProgressCallback = (progress: number) => void;

export const processImageForUpload = (file: File): Promise<{ image: string; fileName: string; contentType: string }> => {
  // ... (previous logic remains same, but wrapping for clarity)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed context'));
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/webp', 0.8);
        // 6. Return standard format
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const safeName = `img_${timestamp}_${randomStr}.webp`;

        resolve({
          image: base64, // The API expects 'image'
          fileName: safeName,
          contentType: 'image/webp'
        });
      };
    };
  });
};

export const uploadImage = async (file: File, onProgress?: UploadProgressCallback, signal?: AbortSignal): Promise<string> => {
  const processed = await processImageForUpload(file);
  const adminPass = localStorage.getItem('admin_pass') || '';

  const response = await axios.post('/api/upload', processed, {
    headers: { 'Authorization': adminPass },
    signal,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });

  return response.data.url;
};
