Bun.serve({
    port: 8765,
    fetch(request, server) {
        const url = new URL(request.url);

        const relativePath = url.pathname === '/' ? 'index.html' : url.pathname
        const file = new URL(`./dist/${relativePath}`, import.meta.url)


        return new Response(Bun.file(file), { status: 200 })
    },
})