/**
 * Client-side thumbnail + duration extraction.
 * Draws a frame ~10% into the clip onto a canvas → JPEG blob.
 * Runs entirely in the browser so the server never touches video bytes.
 */
export async function extractThumbnail(
  file: File,
): Promise<{ thumb: Blob | null; duration: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = url;

    const bail = (duration: number | null = null) => {
      URL.revokeObjectURL(url);
      resolve({ thumb: null, duration });
    };
    const timer = setTimeout(() => bail(), 10_000);

    video.onerror = () => {
      clearTimeout(timer);
      bail();
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      // seek a bit in — frame 0 is often black
      video.currentTime = duration ? Math.min(duration * 0.1, 3) : 0.1;

      video.onseeked = () => {
        clearTimeout(timer);
        try {
          const scale = Math.min(1, 640 / (video.videoWidth || 640));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round((video.videoWidth || 640) * scale);
          canvas.height = Math.round((video.videoHeight || 360) * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return bail(duration);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              resolve({ thumb: blob, duration });
            },
            "image/jpeg",
            0.82,
          );
        } catch {
          bail(duration);
        }
      };
    };
  });
}
