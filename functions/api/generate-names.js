// Cloudflare Pages Function for LLM-based name generation

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { gender, language, prompt, familyName } = body;

        if (!gender || !prompt) {
            return new Response(JSON.stringify({ error: 'gender and prompt are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const genderWord = gender === 'boy' ? 'boy' : 'girl';
        const languageContext = language === 'vietnamese'
            ? 'Vietnamese names (using Vietnamese naming conventions)'
            : 'English names';

        const systemPrompt = `You are a baby name expert. Generate a list of unique, beautiful baby names based on the parent's vision for their child. Return ONLY a JSON array of name strings, nothing else. Generate 30 names.`;

        const familyNameContext = familyName
            ? `The family name is "${familyName}", so generate first names that sound good with this family name.`
            : '';

        const userPrompt = `Generate ${languageContext} for a ${genderWord} based on this description of what the parents imagine their child to be like:

"${prompt}"

${familyNameContext}

Return only a JSON array of first names, like: ["Name1", "Name2", "Name3"]`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                system: systemPrompt
            })
        });
        console.log('systemPrompt', systemPrompt);
        console.log('userPrompt', userPrompt);
        console.log('response', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to generate names' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await response.json();
        const content = result.content[0].text;

        // Parse the JSON array from the response
        let names;
        try {
            // Try to extract JSON array from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                names = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON array found');
            }
        } catch (parseError) {
            console.error('Failed to parse names:', content);
            return new Response(JSON.stringify({ error: 'Failed to parse generated names' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, names }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error generating names:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate names' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
