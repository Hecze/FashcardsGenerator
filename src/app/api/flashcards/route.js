// app/api/flashcards/route.js

const POST = async (request) => {
  try {
    const body = await request.json();
    const { description } = body;

    const response = await fetch(process.env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error('Error fetching data from external API');
    }

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, flashcards: data.flashcards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};



export { POST };
