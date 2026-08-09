import { NextResponse } from 'next/server';
import { mediaService } from '@/services/media.service';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type;
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isDoc = ALLOWED_DOC_TYPES.includes(mimeType);

    if (!isImage && !isDoc) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: JPG, PNG, WebP, SVG, PDF, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Sanitize filename and validate extension
    const rawName = file.name || (isImage ? 'image.jpg' : 'document.pdf');
    const safeFileName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const rawExtension = safeFileName.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(rawExtension)) {
      return NextResponse.json(
        { error: 'Invalid or dangerous file extension.' },
        { status: 400 }
      );
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      const limitMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds the limit of ${limitMb} MB.` },
        { status: 400 }
      );
    }

    // Convert file buffer to base64 Data URL for demo fallback or Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Str = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Str}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let finalUrl = dataUrl;
    let publicId = `media_${Date.now()}`;

    // If Cloudinary credentials exist, upload to Cloudinary
    if (cloudName && apiKey && apiSecret && cloudName !== 'demo') {
      try {
        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${isImage ? 'image' : 'raw'}/upload`;
        const cloudFormData = new FormData();
        cloudFormData.append('file', dataUrl);
        cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'college_cms_preset');

        const cloudRes = await fetch(cloudUrl, {
          method: 'POST',
          body: cloudFormData,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          finalUrl = cloudData.secure_url || cloudData.url;
          publicId = cloudData.public_id;
        }
      } catch (err) {
        console.warn('Cloudinary upload warning, falling back to stored data asset:', err);
      }
    }

    // Save metadata to Firestore
    const assetId = await mediaService.saveMediaAsset({
      publicId,
      resourceType: isImage ? 'image' : 'document',
      url: finalUrl,
      secureUrl: finalUrl,
      format: rawExtension,
      bytes: file.size,
      fileName: safeFileName,
      originalName: safeFileName,
      altText,
      caption,
    });

    return NextResponse.json({
      success: true,
      assetId,
      url: finalUrl,
      fileName: safeFileName,
      resourceType: isImage ? 'image' : 'document',
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Media upload failed';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
