import { NextRequest, NextResponse } from 'next/server';
import { diarizeAudio } from '@/ai/flows/speaker-diarization';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const MAX_SIZE = 20 * 1024 * 1024;
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      return NextResponse.json({ error: 'Invalid content type', details: contentType }, { status: 400 });
    }

    // Read the multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File too large', details: file.size }, { status: 413 });
    }

    // Read file as ArrayBuffer and convert to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'audio/wav';
    const audioDataUri = `data:${mimeType};base64,${base64}`;

    // Call diarizeAudio server-side to avoid sending large payloads to client
    try {
      const diarizationResult = await diarizeAudio({ audioDataUri });
      return NextResponse.json({ diarizationResult });
    } catch (diarizeError) {
      console.error('Diarization failed:', diarizeError);
      return NextResponse.json({ error: 'Diarization failed', details: diarizeError?.toString() }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed', details: error?.toString() }, { status: 500 });
  }
}
