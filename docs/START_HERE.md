# Start here — Dracul Coin (DRAC)

This guide is for people who want to **verify the project, understand the risks, and contribute** before considering any on-chain interaction. DRAC is an experimental ERC-20 token on Base Mainnet associated with Dracul Cybersec. It is **not** an investment offer or a promise of future utility or returns.

## Verify DRAC without connecting a wallet

1. Read the [official project page](https://draculcybersec.com/draccoin/), [tokenomics](TOKENOMICS.md) and [transparency disclosures](TRANSPARENCY.md).
2. Select **Base Mainnet** (chain ID **8453**). Do not rely on a token name or ticker by itself: unrelated projects may use **DRAC**.
3. Independently inspect the token on [BaseScan](https://basescan.org/token/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70). The canonical address is `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70`, with **18 decimals**.
4. Review the documented [WETH/DRAC Uniswap v2 pool](https://www.geckoterminal.com/base/pools/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2). This is a **third-party, changing market view**, not proof of deep liquidity, an independently audited contract, or a guaranteed price.
5. Review [internal security disclosures](../AUDIT.md) and [known gaps in independent verification](REPOSITORY-REVIEW.md). **No independent third-party audit is claimed.**

You can do all of the above **without** sharing wallet credentials, connecting a wallet, signing a transaction, or buying anything.

## Wallet and transaction safety

- If your wallet supports custom ERC-20 tokens, choose **Base Mainnet** and import the **full canonical DRAC contract address**; compare it with the project's official page and BaseScan first.
- Base network transactions require **ETH on Base for gas**. Holding a token does not remove network fees.
- Before any voluntary transaction, review the exact network, token addresses, wallet permissions, exchange route, current liquidity, slippage and transaction preview. Approvals can authorize later spending: limit allowances and revoke unused approvals when appropriate.
- This pool has **extremely shallow liquidity**. A displayed quote, market capitalization or theoretical fully diluted valuation cannot be assumed realizable. No one should trade merely to improve reported volume.
- Never share seed phrases, private keys, recovery codes or authentication credentials with project representatives, bots or reviewers. Avoid links supplied by impersonators.

## What exists today, and what does not

**Documented today:** ERC-20 token and transfers on Base; governance, timelock, staking and team-vesting architecture; public technical documentation; a small experimental WETH/DRAC Uniswap v2 pool.

**Do not infer:** an externally audited protocol, an LP lock, verified circulating supply, significant trading liquidity, an approved CoinGecko listing, guaranteed staking returns, or delivered integrations that remain on the [roadmap](ROADMAP.md). Depositing DRAC into the current staking contract **does not automatically preserve individual voting power**; see [AUDIT.md](../AUDIT.md).

## Join the project constructively

- Read the [roadmap](ROADMAP.md), [code and contract references](CONTRACTS.md), and [contribution guidelines](../CONTRIBUTING.md).
- Share verifiable technical feedback or documentation improvements through [GitHub Issues](https://github.com/Dracul-Cybersec/dracul-coin/issues); see the [open community review checklist](https://github.com/Dracul-Cybersec/dracul-coin/issues/6).
- For private vulnerability reports, follow [SECURITY.md](../SECURITY.md) and contact **support@draculcybersec.com**, not a public thread.
- For project news: [official X](https://x.com/DraculCoinDRAC) and [Telegram](https://t.me/DraculCoinDRAC). Participate voluntarily; no trading, purchases, recruitment or token holding is required to provide feedback.

**No paid engagement, fake holders, wash trading, bot traffic, spam, or promotional price/return promises.** Interest and on-chain activity must arise organically.

## Sources

- [Official project page](https://draculcybersec.com/draccoin/)
- [Canonical contracts](CONTRACTS.md) · [token information for third parties](LISTING_EVIDENCE.md)
- [Live third-party pool view](https://www.geckoterminal.com/base/pools/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2) · [historical reproducible transparency snapshot](TRANSPARENCY.md)
