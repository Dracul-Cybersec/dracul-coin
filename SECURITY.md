# Security Policy

## Reporting a vulnerability

Report security issues privately to:

**support@draculcybersec.com**

Do **not** open a public issue containing an unpatched vulnerability.

## In-scope Base Mainnet contracts

1. DRAC Token — `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70`
2. Timelock — `0x78D17d3bb3Bb843462D67278622817315Faa6e76`
3. Governor — `0xF30d56332d575E1F37EB89841C157713C5968Ac4`
4. Staking — `0xdC5b4D7707303Cafb4308E42e3E6cB1813cC03cb`
5. Team Vesting — `0x6Ec9881FCBf02e13374239653eaDC9573728681f`

## Never publish secrets

This public repository must never contain:

- private keys or seed phrases;
- Ethereum V3 keystores;
- passwords or recovery codes;
- API tokens or GitHub tokens;
- private RPC credentials;
- production `.env` files;
- wallet backup material.

Public contract addresses and transaction hashes are not secrets, but operational wallet labeling is intentionally minimized in public metadata when it is not required for protocol verification.

## Audit status

Internal tests and static analysis do **not** constitute an independent third-party audit. There is currently no named independent audit report for these contracts.

No bug-bounty payment is promised unless a separate public bounty program explicitly states otherwise.
