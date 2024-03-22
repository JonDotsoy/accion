const main = async () => {
    const debug = await import("@accions/common/debug");
    const exec = await import("@accions/common/exec");
    const promiseWithResolvers = await import(
        "@accions/common/promise-with-resolvers"
    );
    const styleText = await import("@accions/common/style-text");

    console.log("🚀 ~ debug:", debug);
    console.log("🚀 ~ exec:", exec);
    console.log("🚀 ~ promiseWithResolvers:", promiseWithResolvers);
    console.log("🚀 ~ styleText:", styleText);
};

main();
