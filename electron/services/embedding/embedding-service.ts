import ollama from 'ollama';

export async function embedTexts(model: string, inputs: string[]) {
  if (inputs.length === 0) {
    return [];
  }

  const response = await ollama.embed({
    model,
    input: inputs,
  });

  return response.embeddings;
}
