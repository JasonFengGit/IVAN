import { OpenAIStream as AtomaStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req) {
  const json = await req.json();
  const { messages } = json;

  const response = await fetch('https://api.atoma.network/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ATOMASDK_BEARER_AUTH}`,
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages,
      temperature: 0.5,
      stream: true,
    }),
  });
  //console.log('atoma',response)

  if (!response.ok) {
    return new Response('Error connecting to Atoma API', { status: response.status });
  }

  const stream = AtomaStream(response);

  return new StreamingTextResponse(stream);
}