# Dracul Coin (DRAC)

<p align="center">
  <img src="assets/drac-coin-128.png" width="160" alt="Dracul Coin (DRAC) logo">
</p>

<p align="center">
  Official source, deployment metadata, tokenomics and public documentation for Dracul Coin on Base Mainnet.
</p>

> DRAC is an experimental digital asset and software project. Nothing in this repository is investment advice, and no market value or return is guaranteed.

## Status

- **Live on Base Mainnet** — Chain ID `8453`
- **Fixed maximum supply:** `100,000,000 DRAC`
- **No public mint function**
- **Canonical market:** Uniswap v2 WETH/DRAC
- **Contract source verified on BaseScan:** DRAC token
- Liquidity remains experimental/small

## Canonical Base Mainnet addresses

| Component | Address |
|---|---|
| DRAC Token | `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70` |
| Timelock / DAO | `0x78D17d3bb3Bb843462D67278622817315Faa6e76` |
| Governor | `0xF30d56332d575E1F37EB89841C157713C5968Ac4` |
| Staking Reserve | `0xdC5b4D7707303Cafb4308E42e3E6cB1813cC03cb` |
| Team Vesting | `0x6Ec9881FCBf02e13374239653eaDC9573728681f` |
| Uniswap v2 WETH/DRAC Pool | `0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2` |

## Token details

| Field | Value |
|---|---|
| Name | Dracul Coin |
| Symbol | DRAC |
| Standard | ERC-20 |
| Decimals | 18 |
| Network | Base Mainnet |
| Maximum supply | 100,000,000 DRAC |

## Allocation

| Allocation | Amount | Share |
|---|---:|---:|
| DAO / Timelock | 50,000,000 DRAC | 50% |
| Staking Reserve | 20,000,000 DRAC | 20% |
| Team Vesting | 15,000,000 DRAC | 15% |
| Liquidity | 10,000,000 DRAC | 10% |
| Ecosystem | 5,000,000 DRAC | 5% |
| **Total** | **100,000,000 DRAC** | **100%** |

The deployment wallet retained **0 DRAC** after initial distribution.

## Governance

- Proposal threshold: **1,000,000 DRAC**
- Quorum target: **10,000,000 DRAC**
- Voting delay: **1 day**
- Voting period: **5 days**
- Timelock minimum delay: **2 days**

The deployed staking design has a known governance caveat: tokens deposited into the staking contract do not automatically preserve each user's ERC20Votes voting power. See [AUDIT.md](AUDIT.md).

## Team vesting

- Start: **2026-10-06 08:48:07 UTC**
- Cliff: **2027-10-06 08:48:07 UTC**
- End: **2029-10-05 08:48:07 UTC**
- Allocation: **15,000,000 DRAC**

The team allocation is held in the vesting contract and should not be described as immediately liquid.

## Official liquidity

- DEX: **Uniswap v2**
- Pair: **WETH / DRAC**
- Fee: **0.30%**
- Pool: `0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2`

Liquidity is currently shallow. Quoted price/FDV can move substantially on very small trades and does not represent guaranteed realizable value.

## Source integrity

The repository publishes only contract source recovered from the frozen production workflow with a matching recorded SHA-256 hash.

Recovered canonical sources currently published:

- `DraculToken.sol`
- `DraculGovernor.sol`
- `DraculStaking.sol`

The exact frozen source files for `DraculTimelock.sol` and `DraculVestingWallet.sol` are **not replaced with guessed or reconstructed placeholders**. Their recorded production hashes are documented in [contracts/SOURCE-HASHES.md](contracts/SOURCE-HASHES.md) until the frozen bundle copy is imported.

## Verification and security

- Production v2.3 internal heavy/adversarial suite: **21/21 passing**
- Mainnet validation: **37/37 PASS**
- Static analysis: **Slither**
- Secret scanning: performed during freeze
- **No independent third-party audit is claimed**

See [AUDIT.md](AUDIT.md) and [SECURITY.md](SECURITY.md).

## Official links

- Website: https://draculcybersec.com/draccoin/
- BaseScan: https://basescan.org/token/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70
- Verified token code: https://basescan.org/address/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70#code
- Uniswap trade: https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70
- GitHub organization: https://github.com/Dracul-Cybersec
- LinkedIn: https://www.linkedin.com/in/fabio-silva-monteiro/
- Security/contact: **support@draculcybersec.com**

## License

MIT — see [LICENSE](LICENSE).
