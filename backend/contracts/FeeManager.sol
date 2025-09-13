// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// FeeManager
// Accepts payments and forwards a fee (fixed or percentage) to a treasury, then optionally calls a target contract with the remainder.
contract FeeManager is Ownable, ReentrancyGuard {
    address public treasury; // treasury where fees go
    bool public usePercentFee; // if true, feePercent applies (in ppm), else fixedFeeWei applies
    uint256 public feePercentPpm; // parts-per-million: e.g., 10_000 = 1%
    uint256 public fixedFeeWei;

    event Executed(address indexed sender, address indexed target, uint256 totalValue, uint256 fee, bytes result);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeConfigUpdated(bool usePercent, uint256 feePercentPpm, uint256 fixedFeeWei);

    constructor(
    address _treasury,
    bool _usePercent,
    uint256 _feePercentPpm,
    uint256 _fixedFeeWei
) Ownable(msg.sender) { // pass deployer as initial owner
    require(_treasury != address(0), "zero treasury");
    treasury = _treasury;
    usePercentFee = _usePercent;
    feePercentPpm = _feePercentPpm;
    fixedFeeWei = _fixedFeeWei;
}

    receive() external payable {
        // Accept ETH deposits (useful for owner withdrawals, etc.)
    }

    ///  compute fee based on mode
    function _computeFee(uint256 amount) internal view returns (uint256) {
        if (usePercentFee) {
            // feePercentPpm is in parts-per-million (ppm), safe multiplication
            return (amount * feePercentPpm) / 1_000_000;
        } else {
            return fixedFeeWei;
        }
    }

    // Main function to pay a transaction and optionally call `target` with remaining funds
    // target optional contract to call (address(0) to skip)
    //data calldata for target
    // msg.value must be >= fee. Remaining value (msg.value - fee) is forwarded to target (if provided) or kept.
    function payAndCall(address target, bytes calldata data) external payable nonReentrant returns (bytes memory) {
        require(msg.value > 0, "no value sent");

        uint256 fee = _computeFee(msg.value);
        require(msg.value >= fee, "insufficient value for fee");

        // 1) Transfer fee to treasury
        (bool okFee, ) = treasury.call{value: fee}("");
        require(okFee, "fee transfer failed");

        // 2) Call target with leftover (if specified)
        uint256 callValue = msg.value - fee;
        bytes memory result;
        if (target != address(0)) {
            (bool ok, bytes memory ret) = target.call{value: callValue}(data);
            require(ok, "target call failed");
            result = ret;
        } else {
            // If no target, leftover stays in contract for owner to withdraw
        }

        emit Executed(msg.sender, target, msg.value, fee, result);
        return result;
    }

                    /* ------ ADMIN ---------- */

    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "zero treasury");
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    function setFixedFee(uint256 newFixedFeeWei) external onlyOwner {
        usePercentFee = false;
        fixedFeeWei = newFixedFeeWei;
        emit FeeConfigUpdated(usePercentFee, feePercentPpm, fixedFeeWei);
    }

    function setPercentFeePpm(uint256 newFeePercentPpm) external onlyOwner {
        usePercentFee = true;
        feePercentPpm = newFeePercentPpm;
        emit FeeConfigUpdated(usePercentFee, feePercentPpm, fixedFeeWei);
    }

    // Owner can withdraw leftover ETH in contract
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero to");
        to.transfer(amount);
    }
}
