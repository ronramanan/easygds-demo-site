
export async function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = `https://demo.apps.easygds.com${url.pathname}${url.search}`;

    // Clone headers
    const newHeaders = new Headers(context.request.headers);
    newHeaders.set('Origin', 'https://demo.apps.easygds.com');
    newHeaders.set('Referer', 'https://demo.apps.easygds.com/');
    newHeaders.set('Host', 'demo.apps.easygds.com');

    const init = {
        method: context.request.method,
        headers: newHeaders,
        body: context.request.body,
        redirect: 'follow'
    };

    try {
        const response = await fetch(targetUrl, init);
        return response;
    } catch (e) {
        return new Response(`Proxy Error: ${e.message}`, { status: 500 });
    }
}
