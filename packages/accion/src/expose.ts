import * as http from "http";
import { promiseWithResolvers } from "@accions/common/promise-with-resolvers";
import { debug } from "@accions/common/debug";
import { Manager } from "./manager.ts";
import * as handlers from "./expose-handlers/handlers.ts";

const ExposeDebug = debug("accion:expose");

const incomingMessageToUint8Array = async (
  incomingMessage: http.IncomingMessage,
) => {
  const { promise, resolve, reject } = promiseWithResolvers<Uint8Array>();

  let currentBuff: number[] = [];

  incomingMessage.on("data", (data: Uint8Array) => {
    currentBuff.push(...data);
  });

  incomingMessage.once("end", () => {
    resolve(new Uint8Array(currentBuff));
  });

  incomingMessage.once("error", (error) => {
    reject(error);
  });

  return promise;
};

class Server {
  public httpServer: http.Server;

  constructor(fetch: (request: Request) => Promise<Response>) {
    this.httpServer = http.createServer(async (req, res) => {
      try {
        const url = new URL(
          req.url ?? "",
          new URL(
            `http://${req.headers.host ?? "localhost"}`,
            "http://localhost",
          ),
        );
        const allowBody = (method: unknown) => {
          const m = `${method ?? ""}`.toLowerCase();
          if (m === "get") return false;
          if (m === "head") return false;
          return true;
        };

        const request = new Request(`${url}`, {
          headers: req.headers as any,
          method: req.method,
          body: allowBody(req.method)
            ? await incomingMessageToUint8Array(req)
            : undefined,
        });

        const response = await fetch(request);
        res.statusCode = response.status;

        for (const [k, v] of response.headers) {
          res.setHeader(k, v);
        }

        res.end(new Uint8Array(await response.arrayBuffer()));
      } catch (ex) {
        console.error(ex);
        res.statusCode = 500;
        res.end();
      }
    });
  }

  url() {
    if (this.httpServer) return serverToUrl(this.httpServer);
    return null;
  }

  async listen(port?: number, host?: string) {
    const { promise, resolve, reject } = promiseWithResolvers<void>();

    this.httpServer.addListener("error", reject);

    this.httpServer.listen(port, host, () => {
      this.httpServer.removeListener("error", reject);
      resolve();
    });

    return promise;
  }
}

const serverToUrl = (serve: http.Server) => {
  const rewriteHost = (host: string) => {
    if (host === "0.0.0.0") return `localhost`;
    return host;
  };
  const address = serve.address();
  if (typeof address === "string") return new URL(address, "http://localhost");
  if (address) {
    const url = new URL(`http://localhost`);
    url.host = rewriteHost(address.address);
    url.port = `${address.port}`;
    return url;
  }
  return address;
};

/**
 * Expose manager
 */
export class Expose {
  optionVerbose: boolean;
  debug = ExposeDebug;
  server: Server | null = null;

  constructor(
    private manager: Manager,
    options?: { verbose?: boolean },
  ) {
    this.optionVerbose = options?.verbose ?? false;

    if (this.optionVerbose) {
      this.debug = debug(ExposeDebug.namespace);
      this.debug.enabled = true;
    }
  }

  async close() {
    await new Promise<null>((resolve, reject) => {
      this.server?.httpServer.close((error) => {
        if (error) return reject(error);
        return resolve(null);
      });
    });
  }

  private async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    return (
      (await handlers.router(url, request, this.manager)) ??
      new Response("", { status: 404 })
    );
  }

  async listen(port: number = 6543, host: string = "127.0.0.1") {
    if (this.server !== null) throw new Error(`Server already listener`);

    const server = (this.server = new Server((req) => {
      let res: null | Response = null;
      return this.fetch(req)
        .then((r) => ((res = r), r))
        .finally(() => {
          this.debug(`${req.method} ${req.url} ${res?.status}`);
        });
    }));

    await server.listen(port, host);

    this.debug(`Server ready on ${this.server.url()}`);
  }
}
