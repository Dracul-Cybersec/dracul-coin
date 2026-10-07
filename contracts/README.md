# Production contract sources

This directory follows a strict source-integrity rule: **never publish a guessed, reconstructed or placeholder source file as if it were the deployed canonical source.**

## Canonical production contracts

The deployed v2.3 system contains:

- `DraculToken.sol`
- `DraculTimelock.sol`
- `DraculGovernor.sol`
- `DraculStaking.sol`
- `DraculVestingWallet.sol`

## Currently published exact sources

The following files were recovered from the production build/update scripts and their SHA-256 values were checked against the recorded production freeze hashes before publication:

- `DraculToken.sol`
- `DraculGovernor.sol`
- `DraculStaking.sol`

## Pending exact frozen copies

`DraculTimelock.sol` and `DraculVestingWallet.sol` are intentionally not represented by placeholders. Their exact source hashes are known, but the exact frozen file bytes must be imported from the v2.3 audit bundle before these filenames are published here.

See [SOURCE-HASHES.md](SOURCE-HASHES.md).

The DRAC token's deployed source is additionally verified on BaseScan:
https://basescan.org/address/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70#code
