import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request) {
  try {
    const { flashcards } = await request.json();
    const zip = new JSZip();

    // Añadir tarjetas
    flashcards.forEach((card, index) => {
      zip.file(`card_${index + 1}.txt`, `${card.question}\n${card.answer}`);
    });

    // Guardar el archivo ZIP
    const content = await zip.generateAsync({ type: 'nodebuffer' });

    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=flashcards.apkg',
    };

    return new NextResponse(content, { headers });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}
