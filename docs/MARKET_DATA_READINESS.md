# DRAC — market-data listing readiness and evidence checklist

**Prepared:** 2026-10-27. This is a transparent, evolving checklist for maintainers and independent reviewers. It is **not** a CoinGecko listing, a guarantee of approval, a live price feed, or evidence of organic adoption by itself.

## Current third-party observation (dated, not live)

On **2026-10-27**, the [GeckoTerminal DRAC/WETH pool page](https://www.geckoterminal.com/base/pools/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2) reported approximately:

| Observed metric | Reading | Interpretation |
|---|---:|---|
| Uniswap v2 Base pool liquidity | **USD 4.33** | Extremely limited exit capacity, high slippage risk |
| 24h reported volume | **USD 0** | No measurable organic turnover over that reported window |
| Reported token holders | **7** | On-chain holders are not necessarily seven independent people |
| GeckoTerminal security score | **approximately 25/100** | Third-party indicator; not an audit, conclusive security assessment or listing decision |

These numbers are volatile, may reflect indexer limitations, and **must be refreshed and timestamped before citation in an application**. The source is a public third-party pool page, not a project-controlled performance claim. No numerical listing threshold is asserted here.

## What is already documented

- **Token:** [Dracul Coin, DRAC, Base Mainnet (8453)](https://basescan.org/token/0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70); ERC-20 contract `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70`, 18 decimals.
- **Supply:** initial and maximum **100,000,000 DRAC**; no public mint function. Burns can reduce total supply. **Initial allocations are not verified circulating supply**.
- **Market:** [Uniswap v2 WETH/DRAC](https://www.geckoterminal.com/base/pools/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2), Base pair `0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2`.
- **Ownership and evidence:** [official website](https://draculcybersec.com/draccoin/), [public source repository](https://github.com/Dracul-Cybersec/dracul-coin), [identity, contacts and listing evidence](LISTING_EVIDENCE.md).
- **Risks and limitations:** [on-chain transparency snapshot](TRANSPARENCY.md), [internal security disclosure](../AUDIT.md), [source reproducibility limitations](REPOSITORY-REVIEW.md), and [liquidity policy](LIQUIDITY.md).

## Priorities before a fresh listing application

The criteria below are **project readiness evidence**, not CoinGecko's published numeric acceptance thresholds. Do not treat a two-week waiting period as automatic eligibility.

- [ ] **Organic use:** demonstrate real, independently verifiable product utility or community contributions, with release links, dated changelogs or merged external pull requests. Planned integrations must stay labeled *planned* until shipped.
- [ ] **Real market activity:** verify naturally occurring transactions and trading volume **over time** on the canonical market, while disclosing shallow liquidity. Never transact with oneself or compensate others to produce volume.
- [ ] **Liquidity and its custody:** publish current reserves, LP token holders and any objectively verifiable locks. No claims of "liquidity locked" without on-chain proof.
- [ ] **Circulating-supply methodology:** date and document wallet-by-wallet reserve controls, timelock/vesting restrictions and the treatment of exchange/pool holdings. Never infer circulation from initial allocation percentages.
- [ ] **Security reproducibility:** recover missing exact deployment source files where possible, map admin roles, resolve or document staking/voting caveats, pin build dependencies, and seek an independent review without describing internal tests as external audits.
- [ ] **Authentic community:** keep public technical updates and two-way discussion on official X, Telegram and GitHub. Track substantive feedback and contributors, not bought follower counts.
- [ ] **Independent review:** link BaseScan/GeckoTerminal observations as of a named UTC time, verified changes since the last application, and any external security or community contributions.
- [ ] **Submission quality:** disclose the current experimental stage, all material risks, correct project links and artwork, and explain specifically what improved since prior review.

## Evidence log template (fill only with actual observed evidence)

| UTC observation date | Evidence type | Direct verifiable URL | What changed / limitation |
|---|---|---|---|
| 2026-10-27 | Baseline third-party pool observation | [GeckoTerminal pool](https://www.geckoterminal.com/base/pools/0xb6e16DBaA61B188Ef6ccF845E38540471854C3c2) | ~USD 4.33 liquidity, USD 0 24h volume, seven reported holders; check live values before reuse |

Future entries should record **real releases, public feedback, dated on-chain observations and independently verifiable outcomes**. Do not invent metrics or retroactively change observations. Avoid exposing private wallets, emails or internal application IDs.

## Submit only when a meaningful change is demonstrable

CoinGecko's [listing methodology](https://www.coingecko.com/pt-br/metodologia), [new token listing guide](https://support.coingecko.com/articles/9489827481-how-to-list-a-new-cryptocurrency-on-coingecko) and [rejection guidance](https://support.coingecko.com/articles/5547344066-why-is-my-token-not-listed-on-coingecko) state that actively traded supported markets, liquidity, maturity, clear project information and authentic interest matter; their assessment is discretionary. A self-service DEX market alone may not be sufficient, and **repeated applications without material changes can be treated as spam**.

The maintainers should not reapply while evidence of meaningful improvement is absent. A paid processing option does not resolve the underlying market/community gaps. When substantively ready, use the [official request form](https://partner.coingecko.com/request-form/new) and distinguish **observed facts**, **reviewed evidence**, and **future plans**.

**Integrity rule:** no wash trading, self-trading to create volume, fake holders, artificial social engagement, paid bot activity, misleading security claims, price targets or guaranteed returns.
