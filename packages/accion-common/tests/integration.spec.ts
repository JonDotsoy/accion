import { tmpdir } from "os";
import { test } from "bun:test";
import { useWorkspace } from "use-workspace";
import { useGit } from "use-workspace/git";
import fs from "fs/promises";
import { StringLike, readableStreamToJSON } from "bun";

namespace SourceTools {
    type Source = { location: StringLike };

    export const toSources = async function* (
        sources: StringLike[],
    ): AsyncIterable<Source> {
        for (const source of sources) {
            const location = new URL(`${source}`);

            const exists = await fs.exists(location);
            if (exists) {
                const stat = await fs.stat(location);
                if (stat.isFile())
                    yield {
                        location,
                    };

                if (stat.isDirectory()) {
                    yield* (
                        await fs.readdir(location, { recursive: true })
                    ).map((e) => ({ location: new URL(e, location) }));
                }
            }
        }
    };

    const uniqueSource = async function* (
        sources: AsyncIterable<Source>,
    ): AsyncIterable<Source> {
        const alreadyCheck = new Set<string>();

        for await (const source of sources) {
            if (alreadyCheck.has(`${source.location}`)) continue;

            yield source;

            alreadyCheck.add(`${source.location}`);
        }
    };

    const sortSource = async function* (
        sources: AsyncIterable<Source>,
    ): AsyncIterable<Source> {
        const mem = new Map(
            await Array.fromAsync(sources, (e) => [`${e.location}`, e]),
        );

        for (const key of Array.from(mem.keys()).sort()) {
            yield mem.get(key)!;
        }
    };

    const shasumSource = async function* (
        sources: AsyncIterable<Source>,
    ): AsyncIterable<Uint8Array> {
        for await (const source of sources) {
            const url = new URL(source.location);
            const exit = await fs.exists(url);
            if (!exit) continue;
            const stat = await fs.stat(url);
            if (!stat.isFile()) continue;
            yield new Uint8Array(
                await crypto.subtle.digest("SHA-256", await fs.readFile(url)),
            );
        }
    };

    const sumShasum = async (
        shasumList: AsyncIterable<Uint8Array>,
    ): Promise<Uint8Array> => {
        let sum = new Uint8Array([]);
        for await (const shasum of shasumList) {
            sum = new Uint8Array(
                await crypto.subtle.digest(
                    "SHA-256",
                    new Uint8Array([...sum, ...shasum]),
                ),
            );
        }
        return sum;
    };

    export const sourcesToShasum = (sources: StringLike[]) => {
        return sumShasum(
            shasumSource(sortSource(uniqueSource(toSources(sources)))),
        );
    };
}

const toHex = async (buff: Uint8Array) => {
    return Array.from(buff, (e) => e.toString(16).padStart(2, "0")).join("");
};

const readFileToStringSafe = async (
    target: StringLike,
): Promise<string | null> => {
    try {
        return await fs.readFile(new URL(target), "utf-8");
    } catch (ex) {
        if (
            typeof ex === "object" &&
            ex !== null &&
            Reflect.get(ex, "code") === "ENOENT"
        )
            return null;
        throw ex;
    }
};

const useNPMPack = async (): Promise<StringLike> => {
    const packsWorkspace = await useWorkspace("__npm_packs__", {
        cleanBefore: true,
    });

    const shasumFile = new URL("shasum", packsWorkspace.location);
    const packFile = new URL("pack.tgz", packsWorkspace.location);
    const detailFile = new URL("detail.json", packsWorkspace.location);
    const shasumTarget = await readFileToStringSafe(shasumFile);
    const shasumSource = await toHex(
        await SourceTools.sourcesToShasum([
            new URL("../src/", import.meta.url),
            new URL("../package.json", import.meta.url),
        ]),
    );

    if (shasumTarget === shasumSource) return packFile;

    const workspace = await useWorkspace(new URL("../", import.meta.url));

    const resultPack = await workspace.exec({
        cmd: ["npm", "pack", "-y", "--json"],
    });

    const o = await readableStreamToJSON(resultPack.stdout);
    const packDetail = o.at(0);
    if (!packDetail) throw new Error(`Missing pack`);

    const outfile = new URL(packDetail.filename, workspace.location);

    await fs.writeFile(detailFile, JSON.stringify(detailFile, null, 2));
    await fs.writeFile(shasumFile, shasumSource);
    await fs.copyFile(outfile, packFile);
    await fs.rm(outfile);

    return packFile;
};

test("", async () => {
    const packLocation = await useNPMPack();
    const workspace = await useWorkspace(
        new URL(`.workspaces/pack/`, Bun.pathToFileURL(tmpdir())).toString(),
        {
            cleanBefore: true,
            template: new URL("samples/app1/", import.meta.url).toString(),
        },
    );
    await useGit(workspace);

    await workspace.exec({ cmd: ["npm", "init", "-y"] });
    await workspace.exec({ cmd: ["npm", "install", `${packLocation}`] });
    await workspace.exec({ cmd: ["npm", "pkg", "set", "type=module"] });
    await workspace.exec({ cmd: ["node", "app.mjs"] });
    await workspace.exec({ cmd: ["node", "app.cjs"] });
});
