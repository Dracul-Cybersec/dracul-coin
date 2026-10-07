# DRAC Audit and Validation Disclosure

## Internal validation

- **Base Mainnet validation:** 37 / 37 PASS
- **Heavy/adversarial production suite:** 21 / 21 PASS
- **Static analysis:** Slither
- **Secret scanning:** performed during the production freeze

These results are internal validation only.

> **This is NOT an independent third-party audit.**

## Known design caveat

DRAC deposited into the staking contract does **not** automatically preserve each user's ERC20Votes voting power. This is a known limitation of the current design.

## Recorded production source hashes

The v2.2/v2.3 freeze records include:

- `DraculToken.sol` — `863cdb8699188b44d150a6e21b7cf555ad965ddcfebbacff9a00d9b6a07bb0b2`
- `DraculGovernor.sol` — `d477aca8df1ff9816ce6e447aee0d7bcc6c4f7ccb6392178b1ed17121419caac`
- `DraculStaking.sol` — `76c5bb457e691dd4d62ed08b0630b3e2ceb679a2e0fa3878f710e6756ac422dd`
- `DraculTimelock.sol` — `4ac12783736d3759f9b81bd36c5f286acbd214c08d63a676db68d74957eb5b53`
- `DraculVestingWallet.sol` — `6fc4e505e42baad11e5fb7dfb0c1bc4a69c7a68cc3b024b0ff8bf634e8c6817c`

The first three source files in this repository were recovered from the production build scripts and re-hashed to the recorded values before publication.

## Compiler / token verification

The DRAC token is verified on BaseScan with Solidity 0.8.34, optimizer enabled with 200 runs, EVM version Osaka.

https://basescan.org/address/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70#code

## Freeze artifacts

- Official master logo SHA-256: `4a0712e7832c1e93896a79ef16c02c31ac8c153b3f12b588a7f74b8a8a36e7b0`
- Frozen v2.3 audit-bundle SHA-256: `81578b2e610591bba8c261cf300c4215f812b2f782aa3cb959ee503b91d7ed6a`

A non-zero Slither exit code was recorded for known findings/categories and should not be presented as a clean independent audit.
