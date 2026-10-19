# DRAC — On-chain Transparency and Risk Disclosure

**Snapshot:** Base Mainnet block **52,814,301** (`0x325e1dd`), timestamp **2026-10-19 13:52:29 UTC**.  
**Status:** Public information and reproducible on-chain readings; **not a third-party audit, legal opinion, or certification**.

DRAC is an **experimental ERC-20 token** with a WETH/DRAC market on Uniswap v2. Its small pool reserves, concentrated token allocation and unaudited contracts are material risks. This document deliberately distinguishes recorded balances from legal ownership, vesting conditions, circulation, market value or LP locks.

## Canonical references

- Project: https://www.draculcybersec.com/draccoin
- Token: `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70` — [BaseScan](https://basescan.org/address/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70#code)
- Uniswap v2 pair: `0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2` — [BaseScan](https://basescan.org/address/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2)
- [Block 52,814,301](https://basescan.org/block/52814301) — use this block for reproducibility
- [Security policy](../SECURITY.md) · [Internal audit disclosure](../AUDIT.md) · [Initial allocations](TOKENOMICS.md)
- Official social accounts: [X @DraculCoinDRAC](https://x.com/DraculCoinDRAC) · [Telegram @DraculCoinDRAC](https://t.me/DraculCoinDRAC)

## Snapshot: token supply and wallet balances

A standard ERC-20 `totalSupply()` call at the snapshot block returned **100,000,000 DRAC**. The table below shows the **actual ERC-20 `balanceOf()` results** at that same block, not guaranteed locked amounts.

| Descriptive label | Address | DRAC balance at block 52,814,301 |
|---|---|---:|
| DAO / governance timelock contract | `0x78D17d3bb3Bb843462D67278622817315Faa6e76` | 50,000,000 |
| Staking contract | `0xdC5b4D7707303Cafb4308E42e3E6cB1813cC03cb` | 20,000,000 |
| Team vesting contract | `0x6Ec9881FCBf02e13374239653eaDC9573728681f` | 15,000,000 |
| Wallet designated for liquidity reserve | `0xd4F5bEdF335e90AB8d5d17702becCd1707E8F7aF` | 9,746,239.940193179667473024 |
| Wallet designated for ecosystem reserve | `0xe813cb7516feC5202c676bB05480051E20268aE6` | 5,000,000 |
| WETH/DRAC Uniswap v2 pair | `0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2` | 253,486.066446364148769490 |

The **initial allocation** to liquidity was 10,000,000 DRAC (10% of initial supply). **This is not the amount currently in the trading pool**. At the snapshot the designated liquidity reserve wallet and pair held distinct balances, as reported above. A reserve address designation **does not prove tokens are vested, legally restricted or locked**; token ownership and control must be separately assessed. The vesting contract balance similarly does not on its own prove a specific release schedule without inspecting its code and parameters.

The amount not held by these five designated reserve destinations (DAO/timelock, staking, team, liquidity reserve, ecosystem) was **253,760.059806820332526976 DRAC**. Of this, **253,486.066446364148769490 DRAC were in the pair**, leaving **273.993360456183757486 DRAC elsewhere**. This is only a **balance-based classification**, **not a verified circulating-supply calculation**. Classification may change as wallets and contracts move tokens; third-party reviewers may count liquidity differently.

## Snapshot: liquidity and market risk

The Uniswap v2 pair's `getReserves()` at the same block showed:

| Asset | Pool reserve |
|---|---:|
| WETH (`0x4200000000000000000000000000000000000006`) | **0.000930849716306881 WETH** |
| DRAC | **253,486.066446364148769490 DRAC** |

**This market is extremely shallow.** Even very small swaps may cause large price changes, significant slippage and a misleading nominal market capitalization. A quoted last trade price multiplied by 100 million tokens does not represent realizable market value. Do not market the coin as having deep liquidity or predictable exit capacity.

**Liquidity-pool ownership/lock status has not been independently validated in this document.** No claim is made that LP tokens are burned, locked or owned by a multisig. Verification requires identifying actual LP token holder(s), their control and any on-chain lock transaction or timelock.

## What is verified vs not verified

**Directly observed at the referenced block:** token `totalSupply()`, token `balanceOf()` for the addresses above, Uniswap v2 pair `token0()`, `token1()` and `getReserves()`. The token source is published as verified on BaseScan. These observations do not constitute a full security review.

**Project-documented but requiring independent review:** governance voting parameters, permissions/admin keys, multisig controls (if any), token vesting schedule, LP ownership and any lock status, use of reserves, and legal/compliance arrangements.

**No claim:** independent third-party smart contract audit, exchange listing approvals, price appreciation, a reserve lock, guaranteed income, or endorsement by Base, Coinbase, Uniswap, BaseScan or listing services. The published internal testing and Slither analysis are **not** an external audit. Depositing DRAC in staking does not automatically preserve each depositor's ERC20Votes power.

## Reproduce the readings (read-only, no wallet connection)

Using a Base JSON-RPC endpoint (for example `https://mainnet.base.org`), call `eth_call` with the block parameter `"0x325e1dd"`.

- ERC-20 `totalSupply()`: selector `0x18160ddd`
- ERC-20 `balanceOf(address)`: selector `0x70a08231` followed by the holder's 20-byte address left-padded to 32 bytes.
- Uniswap v2 pair `token0()`: `0x0dfe1681`
- Uniswap v2 pair `token1()`: `0xd21220a7`
- Uniswap v2 pair `getReserves()`: `0x0902f1ac`

Convert uint256 ERC-20 values using 18 decimals. Current balances and reserves may differ; the above is **a historical snapshot**, not a real-time price or liquidity tracker. Do not supply a private key or connect a wallet merely to check these public readings.

## Priorities to improve verifiable trust

1. **Publish independent review:** commission or obtain a credible independent audit of the token, governance, staking and vesting contracts, with a public report, issues, remediation and verified contract mapping. Sponsorship or community review is possible but cannot be called an independent audit until performed.
2. **Disclose control/permissions:** show owner/admin roles, timelock proposers/executors, signer arrangements, upgradeability (or non-upgradeability) and emergency powers, based on contract evidence.
3. **Verify LP ownership and any lock:** publish LP token ownership, locking status (if any), unlock conditions and on-chain transaction hashes; do not use a “liquidity locked” badge without proof.
4. **Explain reserves vs circulation:** maintain a reproducible wallet table and distinguish reserve-designated EOAs from genuinely constrained contracts.
5. **Document product utility and delivery:** publish a realistic roadmap, a shipped product or integration where present, and changelogs and governance proposals with verifiable progress.
6. **Keep marketing accurate:** no purchased followers, wash trades, unverified badges or promises of profit. Respect community promotional rules.

For issues or corrections, contact **support@draculcybersec.com**. Security vulnerabilities should be reported privately under [SECURITY.md](../SECURITY.md).
