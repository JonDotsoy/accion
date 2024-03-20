const main = async () => {
    const debug = require("@accions/common/debug")
    const exec = require("@accions/common/exec")
    const promiseWithResolvers = require("@accions/common/promise-with-resolvers")
    const styleText = require("@accions/common/style-text")

    console.log("🚀 ~ debug:", debug)
    console.log("🚀 ~ exec:", exec)
    console.log("🚀 ~ promiseWithResolvers:", promiseWithResolvers)
    console.log("🚀 ~ styleText:", styleText)
}

main()