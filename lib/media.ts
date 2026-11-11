import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_BUCKET = 'kits-media';

const fileToDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });

const compressImageToBlob = (file: File, maxWidth = 1000): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });

export async function uploadMediaImage(
  file: File,
  folder: 'fotos' | 'comprobantes' | 'logos' | 'qr-pagos' = 'fotos'
): Promise<string> {
  const compressed = await compressImageToBlob(file);

  if (isSupabaseConfigured()) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${folder}/${Date.now()}-${safeName}.jpg`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: true });

      if (!error) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch {
      // Fallback a DataURL comprimido si el bucket aún no fue creado
    }
  }

  return fileToDataUrl(compressed);
}

export async function uploadKitImage(file: File): Promise<string> {
  return uploadMediaImage(file, 'fotos');
}

export async function uploadComprobanteFile(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return uploadMediaImage(file, 'comprobantes');
  }

  if (isSupabaseConfigured()) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `comprobantes/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          contentType: file.type || 'application/pdf',
          upsert: true,
        });
      if (!error) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch {
      // Fallback abajo
    }
  }

  return fileToDataUrl(file);
}

export async function uploadKitVideo(
  file: File
): Promise<{ url?: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `videos/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          contentType: file.type || 'video/mp4',
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) return { url: data.publicUrl };
      }
    } catch {
      // Fallback abajo si el bucket no existe todavía
    }
  }

  // Sin Supabase Storage, evitamos exceder el límite de localStorage (~4MB)
  const MAX_LOCAL_VIDEO_BYTES = 3.5 * 1024 * 1024;
  if (file.size > MAX_LOCAL_VIDEO_BYTES) {
    return {
      error:
        'El video pesa más de 3.5 MB para guardarse en modo local. Creá el bucket "kits-media" en Supabase (está en schema.sql) o pegá el link de YouTube / Reels.',
    };
  }

  const dataUrl = await fileToDataUrl(file);
  return { url: dataUrl };
}

export function getPlayableVideoInfo(rawUrl?: string): {
  type: 'video' | 'iframe' | 'placeholder';
  src: string;
} {
  const url = (rawUrl || '').trim();
  if (!url || url.includes('dQw4w9WgXcQ')) {
    return { type: 'placeholder', src: '' };
  }

  if (
    url.startsWith('data:video') ||
    url.startsWith('blob:') ||
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) ||
    url.includes('/storage/v1/object/public/')
  ) {
    return { type: 'video', src: url };
  }

  // Convertir links normales de YouTube / Shorts / youtu.be a /embed/
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (ytMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { type: 'iframe', src: url };
}
