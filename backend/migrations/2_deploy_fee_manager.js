require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FeeManager = artifacts.require("FeeManager");

module.exports = async function (deployer, network, accounts) {
  // Load treasury address from .env (fallback to accounts[1] if not set)
  const treasury = process.env.TREASURY_ADDRESS 

  const usePercent = false;
  const feePercentPpm = 0;
  const fixedFeeWei = web3.utils.toWei("0.01", "ether"); // 0.01 ETH fee

  // Deploy FeeManager
  await deployer.deploy(FeeManager, treasury, usePercent, feePercentPpm, fixedFeeWei);
  const instance = await FeeManager.deployed();

  // Console logs
  console.log("------------------------------------------------------");
  console.log(` FeeManager deployed on ${network}`);
  console.log(` Contract Address: ${instance.address}`);
  console.log(` Treasury Address: ${treasury}`);
  console.log("------------------------------------------------------");

  // Save contract address for frontend
  const outputDir = path.resolve(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "FeeManager-address.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ address: instance.address, network }, null, 2)
  );

  console.log(` Contract address written to: ${outputPath}`);
};
