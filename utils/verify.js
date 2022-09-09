const { run } = require("hardhat");

const verify = async (contractAddress, contract ,args) => {
    console.log("Verifying contract....");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
            contract: `contracts/${contract}.sol:${contract}`
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log("Unknown exception");
            console.log(e);
        }
    }
}

module.exports = { verify };