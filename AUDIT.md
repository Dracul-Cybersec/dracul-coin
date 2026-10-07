# DRAC Audit Disclosure

## Internal Validation Summary

- **Mainnet validation run:** 37 / 37 PASS
- **Heavy / adversarial suite:** 21 / 21 PASS
- **Static analysis:** Slither
- **Secret scanning:** Enabled

## Scope

All above scores reflect **internal** validation only.

> **This is NOT an independent third-party audit.** The DRAC project has not
> been audited by any external security firm or independent auditor.

## Known Design Caveat

DRAC in the staking contract does **not** automatically preserve each user's
ERC20Votes voting power after staking. Users who stake their tokens may find
their voting power reduced or reset in the on-chain governance system. This is
a known limitation of the current staking contract design.

## Compiler & Verification

- **Solidity compiler version:** 0.8.34
- **Token source:** Verified on BaseScan
  ([0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70](https://basescan.org/token/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70))
