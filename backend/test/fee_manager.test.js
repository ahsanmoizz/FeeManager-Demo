const assert = require("assert");
const FeeManager = artifacts.require("FeeManager");

contract("FeeManager", (accounts) => {
  const [owner, treasury, alice] = accounts;

  beforeEach(async function () {
    this.fixedFee = web3.utils.toWei("0.01", "ether");
    this.fm = await FeeManager.new(
      treasury,
      false, // usePercent
      0,     // feePercentPpm
      this.fixedFee,
      { from: owner }
    );
  });

  it("should forward fee to treasury and emit Executed event", async function () {
    const totalSend = web3.utils.toWei("0.02", "ether"); // 0.02 ETH total
    const tx = await this.fm.payAndCall(
      "0x0000000000000000000000000000000000000000", // no target
      "0x",
      { from: alice, value: totalSend }
    );

    // Check event emitted
    assert.strictEqual(tx.logs[0].event, "Executed", "Expected Executed event");

    // Check treasury balance increased by fee
    const balTreasury = await web3.eth.getBalance(treasury);
    assert(
      web3.utils.toBN(balTreasury).gte(web3.utils.toBN(this.fixedFee)),
      "Treasury did not receive fee"
    );
  });

  it("should revert if msg.value < fee", async function () {
    try {
      await this.fm.payAndCall(
        "0x0000000000000000000000000000000000000000",
        "0x",
        { from: alice, value: web3.utils.toWei("0.001", "ether") }
      );
      assert.fail("Expected revert not received");
    } catch (err) {
      assert(
        err.message.includes("insufficient value for fee"),
        "Expected 'insufficient value for fee' error"
      );
    }
  });

  it("owner should be deployer", async function () {
    const currentOwner = await this.fm.owner();
    assert.strictEqual(currentOwner, owner, "Deployer should be contract owner");
  });
});
