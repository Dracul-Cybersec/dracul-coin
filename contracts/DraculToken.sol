// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title Dracul Coin (DRAC)
/// @notice Fixed-supply ERC-20 with burn, permit and timestamp-based governance votes.
/// @dev Production v2 deliberately has no global transfer pause. This avoids an
///      administrative action trapping holders or preventing staking withdrawals.
contract DraculToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 ether;

    constructor(address initialOwner, address initialHolder)
        ERC20("Dracul Coin", "DRAC")
        ERC20Permit("Dracul Coin")
        Ownable(initialOwner)
    {
        require(initialHolder != address(0), "DRAC: zero holder");
        _mint(initialHolder, MAX_SUPPLY);
    }

    /// @dev Timestamp clock is supported by OpenZeppelin ERC20Votes/GovernorVotes.
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // ERC-6372 requires this exact uppercase function name.
    // slither-disable-next-line naming-convention
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address account)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(account);
    }
}
