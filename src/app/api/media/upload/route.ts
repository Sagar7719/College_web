import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

    const mimeType = file.type || '';
    const rawName = file.name || 'uploaded_file';
    const safeFileName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const rawExtension = safeFileName.split('.').pop()?.toLowerCase() || '';

    // Validate extension
    if (!ALLOWED_EXTENSIONS.includes(rawExtension)) {
      return NextResponse.json(
        { error: `Unsupported file extension: .${rawExtension}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine type
    const isImage =
      ALLOWED_IMAGE_TYPES.includes(mimeType) ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(rawExtension);
    const isDoc =
      ALLOWED_DOC_TYPES.includes(mimeType) ||
      ['pdf', 'doc', 'docx'].includes(rawExtension);

    if (!isImage && !isDoc) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: JPG, PNG, WebP, SVG, PDF, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Validate size limit
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      const limitMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds maximum allowed limit of ${limitMb} MB.` },
        { status: 400 }
      );
    }

    // Cloudinary credentials check
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'demo' || cloudName === 'your_cloud_name') {
      return NextResponse.json(
        {
          error:
            'Cloudinary object storage configuration is missing. Local file upload requires configured Cloudinary credentials in .env.local.',
        },
        { status: 500 }
      );
    }

    // Convert file to base64 Data URL for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Str = buffer.toString('base64');
    const dataUrl = `data:${mimeType || (isImage ? 'image/jpeg' : 'application/pdf')};base64,${base64Str}`;

    // Cryptographic signed upload to Cloudinary
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'college-cms';
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const cloudFormData = new FormData();
    cloudFormData.append('file', dataUrl);
    cloudFormData.append('api_key', apiKey);
    cloudFormData.append('timestamp', String(timestamp));
    cloudFormData.append('signature', signature);
    cloudFormData.append('folder', folder);

    const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const cloudRes = await fetch(cloudUrl, {
      method: 'POST',
      body: cloudFormData,
    });

    if (!cloudRes.ok) {
      const cloudErr = await cloudRes.json().catch(() => ({}));
      const cloudMsg = cloudErr.error?.message || cloudRes.statusText || 'Cloudinary upload failed';
      return NextResponse.json(
        { error: `Cloudinary storage upload error: ${cloudMsg}` },
        { status: 502 }
      );
    }

    const cloudData = await cloudRes.json();
    const persistentUrl = cloudData.secure_url || cloudData.url;
    const publicId = cloudData.public_id || `college-cms/${Date.now()}`;

    // Return the verified remote Cloudinary asset details
    return NextResponse.json({
      success: true,
      publicId,
      url: persistentUrl,
      secureUrl: persistentUrl,
      format: cloudData.format || rawExtension,
      bytes: cloudData.bytes || file.size,
      width: cloudData.width,
      height: cloudData.height,
      fileName: safeFileName,
      originalName: safeFileName,
      resourceType: isImage ? 'image' : 'document',
      altText,
      caption,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Media upload handler error';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
