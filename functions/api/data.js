// Cloudflare Pages Function for user data storage

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await env.BABY_NAMES_KV.get(`user_${userId}`, 'json');

        if (!data) {
            return new Response(JSON.stringify({ exists: false }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ exists: true, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { user_id, names, comparisonCount } = body;

        if (!user_id) {
            return new Response(JSON.stringify({ error: 'user_id is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!names || !Array.isArray(names)) {
            return new Response(JSON.stringify({ error: 'names array is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = {
            names,
            comparisonCount: comparisonCount || 0,
            lastUpdated: new Date().toISOString()
        };

        await env.BABY_NAMES_KV.put(`user_${user_id}`, JSON.stringify(data));

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await env.BABY_NAMES_KV.delete(`user_${userId}`);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
