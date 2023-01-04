//imports
//main function
//calling of main funciton

//async function deployFunc(hre) {
//     console.log("Hi")
//      hre.NamedAccounts()
// }
// module.exports.default = deployFunc  --- this function is the same as below

// modeule.exports = async (hre) => {
//     const{ getNamedAccoutns, deployments } = hre --- this function is the same as below
//this syntax uses a nameless arrow function, hre - hardhat runtime enviroment

const { networkConfig, developmentChains } = require("../helper-hardhat-config") //this{ ___ } pulls out just the network config from the "../" file
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //if chainId is X use address Y
    //if chainId is Z use address A
    //const ethUsdPriceeFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceeFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceeFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceeFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    //when going for localhost or hardhat networks we want to use a mock
    const args = [ethUsdPriceeFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address here
        //to do this for the correct chain we need code to say
        //if chainId is X use address Y
        //if chainId is Z use address A

        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "fundme"]
