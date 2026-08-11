import { NextResponse } from 'next/server';
import { contactMessageSchema } from '@/validations/contact-message.schema';
import { contactMessagesService } from '@/services/contact-messages.service';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = contactMessageSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid form input data';
      return NextResponse.json(
        { error: firstError, details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const messageId = await contactMessagesService.create(parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon.",
      id: messageId,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to submit contact message';
    console.error('Contact API Route Handler Error:', err);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
