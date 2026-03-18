const Web3 = require("web3");

// connect to Ganache
const web3 = new Web3("http://127.0.0.1:7545");

// Replace with deployed contract address
const contractAddress = "YOUR_CONTRACT_ADDRESS";

// Replace with ABI from TrustAnchorABI.json
const contractABI = require("../frontend/src/TrustAnchorABI.json");

async function runTest() {

    const accounts = await web3.eth.getAccounts();

    const creator = accounts[0];
    const backer1 = accounts[1];
    const backer2 = accounts[2];
    const backer3 = accounts[3];

    console.log("Creator:", creator);
    console.log("Backers:", backer1, backer2, backer3);

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    console.log("\n--- Adding Milestones ---");

    await contract.methods.addMilestone(
        "Prototype Development",
        web3.utils.toWei("2", "ether")
    ).send({ from: creator });

    await contract.methods.addMilestone(
        "Product Manufacturing",
        web3.utils.toWei("3", "ether")
    ).send({ from: creator });

    console.log("Milestones added.");

    console.log("\n--- Contributions ---");

    await contract.methods.contribute().send({
        from: backer1,
        value: web3.utils.toWei("1", "ether")
    });

    await contract.methods.contribute().send({
        from: backer2,
        value: web3.utils.toWei("2", "ether")
    });

    await contract.methods.contribute().send({
        from: backer3,
        value: web3.utils.toWei("1", "ether")
    });

    console.log("Backers contributed.");

    console.log("\n--- Start Voting ---");

    await contract.methods.startVoting().send({
        from: creator
    });

    console.log("Voting started.");

    console.log("\n--- Backers Voting ---");

    await contract.methods.vote(true).send({ from: backer1 });
    await contract.methods.vote(true).send({ from: backer2 });
    await contract.methods.vote(false).send({ from: backer3 });

    console.log("Votes recorded.");

    console.log("\n--- Releasing Milestone Funds ---");

    await contract.methods.releaseFunds().send({
        from: creator
    });

    console.log("Funds released to creator.");

    const balance = await web3.eth.getBalance(contractAddress);

    console.log("\nContract Remaining Balance:", web3.utils.fromWei(balance, "ether"), "ETH");
}

runTest().catch(console.error);
