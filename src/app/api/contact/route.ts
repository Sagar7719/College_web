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
        { success: false, error: firstError, details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const messageId = await contactMessagesService.create(parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon.",
      id: messageId,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact message. Please try again later.' },
      { status: 500 }
    );
  }
}
