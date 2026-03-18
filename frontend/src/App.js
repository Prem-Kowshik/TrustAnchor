import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const contractAddress = "YOUR_CONTRACT_ADDRESS";

// Replace with compiled ABI from Remix
const contractABI = [
  "function contribute() payable",
  "function vote(bool approve)",
  "function startVoting()",
  "function releaseFunds()",
  "function refund()",
  "function getContractBalance() view returns(uint)"
];

function App() {

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [amount, setAmount] = useState("");

  // Connect wallet
  const connectWallet = async () => {

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const trustAnchor = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    setAccount(address);
    setContract(trustAnchor);
  };

  // Contribute ETH
  const contribute = async () => {

    if (!contract) return;

    try {

      const tx = await contract.contribute({
        value: ethers.utils.parseEther(amount)
      });

      await tx.wait();

      alert("Contribution successful");

    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    }
  };

  // Vote approve
  const voteYes = async () => {

    try {
      const tx = await contract.vote(true);
      await tx.wait();

      alert("Vote YES recorded");

    } catch (err) {
      console.error(err);
    }
  };

  // Vote reject
  const voteNo = async () => {

    try {
      const tx = await contract.vote(false);
      await tx.wait();

      alert("Vote NO recorded");

    } catch (err) {
      console.error(err);
    }
  };

  // Start milestone voting
  const startVoting = async () => {

    try {

      const tx = await contract.startVoting();
      await tx.wait();

      alert("Voting started");

    } catch (err) {
      console.error(err);
    }
  };

  // Release milestone funds
  const releaseFunds = async () => {

    try {

      const tx = await contract.releaseFunds();
      await tx.wait();

      alert("Funds released");

    } catch (err) {
      console.error(err);
    }
  };

  // Refund
  const refund = async () => {

    try {

      const tx = await contract.refund();
      await tx.wait();

      alert("Refund processed");

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div style={{ padding: "40px", fontFamily: "Arial" }}>

      <h1>TrustAnchor Crowdfunding DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <p>Connected Wallet: {account}</p>
      )}

      <hr />

      <h3>Contribute ETH</h3>

      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={contribute}>Contribute</button>

      <hr />

      <h3>Milestone Voting</h3>

      <button onClick={voteYes}>Vote YES</button>
      <button onClick={voteNo}>Vote NO</button>

      <hr />

      <h3>Creator Controls</h3>

      <button onClick={startVoting}>Start Voting</button>
      <button onClick={releaseFunds}>Release Funds</button>

      <hr />

      <h3>Backer Options</h3>

      <button onClick={refund}>Request Refund</button>

    </div>
  );
}

export default App;
