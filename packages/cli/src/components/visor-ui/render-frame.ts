import { Server, pathToFileURL } from "bun"
import { exists, readFile, stat } from "fs/promises"
import mime from "mime"
import { atom } from "nanostores"
import { createHandlerJobs } from "@accions/job-run-panel/dist/esm/src/create-handler-jobs"
import { createJobStore } from "@accions/job-run-panel/dist/esm/src/create-jobs-store"

const staticDir = new URL("./static/", pathToFileURL(await import.meta.resolve('@accions/job-run-panel/package.json')))

type Options = {
    port?: number
}

export const renderFrame = (option?: Options) => {
    const port = option?.port ?? 7654;
    let server: null | Server = null;

    const store = atom({ digest: 'foo', payload: new TextEncoder().encode('ok') })
    const s = createJobStore()
    using h = createHandlerJobs(s.store);

    s.update({
        jobs: [
            { id: '1', name: 'task 1', status: 'failed', duration: 20 },
            { id: '2', name: 'task 2', status: 'failed' },
            { id: '3', name: 'task 3', status: 'pending', needs: ['1', '2'] },
        ]
    })

    const close = () => {
        h[Symbol.dispose]()
        server?.stop(true)
    }

    return {
        [Symbol.dispose]: close,
        close,
        async open() {
            server = Bun.serve({
                port,
                async fetch(request) {
                    const url = new URL(request.url);

                    if (url.pathname === '/api/jobs') return h.fetch(request)

                    const reduceAlias = (path: string) => {
                        if (path === '/') return '/index.html'
                        return path
                    }

                    const staticPath = new URL(`.${reduceAlias(pathToFileURL(url.pathname).pathname)}`, staticDir)
                    if (await exists(staticPath) && (await stat(staticPath)).isFile()) {
                        const headers = new Headers()

                        const t = staticPath.pathname.substring(staticPath.pathname.lastIndexOf('.'))
                        const type = mime.getType(t)
                        if (type) headers.set('Content-Type', type);

                        return new Response(await readFile(staticPath), {
                            headers
                        })
                    }

                    return new Response(null, { status: 404 })
                }
            })

            console.log(`🚀 View report on ${server.url}`)
        },
    }
}