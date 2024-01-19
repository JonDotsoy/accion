import { serve, ServerWebSocket, type Server } from "bun"
// import { readFile, watch } from "fs/promises"
// import { init } from "./render-frame/build-main.ts"
// import { HRServer } from "./render-frame/hr.ts"

import { build } from "astro"
import pageConfigs from "../../../../job-run-panel/astro.config.ts"

export const renderFrame = () => {
    let server: null | Server = null;

    return {
        close() {
            server?.stop()
        },
        async open() {
            await build(pageConfigs)
            // const buildRenderFrame = await init()
            // const hrServer = new HRServer()

            // buildRenderFrame.subscribeChanges(() => { hrServer.dispatch(buildRenderFrame.sumHash()) })

            // server = Bun.serve({
            //     port: 8765,
            //     async fetch(request, server) {
            //         const url = new URL(request.url);

            //         if (request.headers.get('upgrade') === 'websocket') {
            //             if (server.upgrade(request)) {
            //                 return undefined
            //             } else {
            //                 return new Response(null, { status: 400 })
            //             }
            //         };

            //         const response = await buildRenderFrame.matchRequest(request)
            //         if (response) return response;

            //         return new Response(null, { status: 404 })
            //     },
            //     websocket: {
            //         message(ws, message) {
            //         }, // a message is received
            //         open(ws) {
            //             hrServer.subWS(ws)
            //             hrServer.dispatch(buildRenderFrame.sumHash())
            //         },
            //         close(ws, code, message) {
            //             hrServer.deleteSubWS(ws)
            //         },
            //         drain(ws) { }, // the socket is ready to receive more data
            //     },
            // })

            // const initUrl = new URL('http://localhost:8765')
            // initUrl.port = `${server.port}`

            // console.log("🚀 ~ open ~ initUrl:", `${initUrl}`)
            // // execSync(`open ${initUrl}`)
        },
        [Symbol.dispose]: () => { },
    }
}