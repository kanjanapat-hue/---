// Helper utilities for material image processing, compression, and presets

export const FALLBACK_MATERIAL_IMAGE =
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';

/**
 * Resizes and compresses an uploaded image file on the client-side using an offscreen canvas.
 * This guarantees images stay around 20-50KB for fast rendering and safe localStorage persistence.
 */
export const processImageFile = (
  file: File,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP, GIF, SVG)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = readerEvent => {
      const result = readerEvent.target?.result as string;
      if (!result) {
        reject(new Error('ไม่สามารถอ่านข้อมูลไฟล์ได้'));
        return;
      }

      // If SVG, return as is
      if (file.type === 'image/svg+xml') {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => {
        reject(new Error('ไม่สามารถโหลดภาพเพื่อประมวลผลได้'));
      };
      img.src = result;
    };
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    reader.readAsDataURL(file);
  });
};

/**
 * Popular presets for common office & university supplies to give admins quick 1-click choices
 */
export const MATERIAL_IMAGE_PRESETS = [
  { label: 'กระดาษ A4 / เอกสาร', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60' },
  { label: 'ปากกา / เครื่องเขียน', url: 'https://images.unsplash.com/photo-1585336261026-4182998a442e?w=400&auto=format&fit=crop&q=60' },
  { label: 'ดินสอ / ยางลบ', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&auto=format&fit=crop&q=60' },
  { label: 'กรรไกร / คัทเตอร์', url: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=400&auto=format&fit=crop&q=60' },
  { label: 'คลิปหนีบ / ลวดเสียบ', url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=400&auto=format&fit=crop&q=60' },
  { label: 'เทปใส / กาวน้ำ', url: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&auto=format&fit=crop&q=60' },
  { label: 'แฟ้มเอกสาร / แฟ้มห่วง', url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&auto=format&fit=crop&q=60' },
  { label: 'เครื่องคิดเลข', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60' },
  { label: 'ซองเอกสาร / ซองจดหมาย', url: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&auto=format&fit=crop&q=60' },
  { label: 'เมาส์ / คีย์บอร์ด', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60' },
  { label: 'หมึกพิมพ์ / โทนเนอร์', url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=60' },
  { label: 'แฟลชไดร์ฟ / USB', url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&auto=format&fit=crop&q=60' },
  { label: 'ปลั๊กไฟ / สายพ่วง', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60' },
  { label: 'ถ่านไฟฉาย AA/AAA', url: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&auto=format&fit=crop&q=60' },
  { label: 'แอลกอฮอล์ / เจลล้างมือ', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60' },
  { label: 'น้ำยาทำความสะอาด / สบู่', url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=60' },
  { label: 'ถุงขยะดำ / ถุงใส่ของ', url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400&auto=format&fit=crop&q=60' },
  { label: 'ไม้กวาด / ไม้ถูพื้น', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60' },
  { label: 'ถุงมือยาง', url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop&q=60' },
  { label: 'กระดาษชำระ / ทิชชู่', url: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&auto=format&fit=crop&q=60' }
];
