# Repository review — 2026-10-07

## Scope

Reviewed the tracked files and locally fetched Git history of the public repository, including the proposed logo and metadata changes. This review covers repository content, not GitHub account permissions, server configuration, live balances or all reachable refs on GitHub.

## Results

- Gitleaks v8.30.1 with default rules flagged the canonical public DRAC token address as a generic API key. Manual inspection confirmed a false positive; `.gitleaks.toml` narrowly excludes that exact public address.
- Gitleaks reported no remaining findings after that narrow exclusion in both history and working files. TruffleHog scanning of local Git history with credential verification disabled returned zero findings. No confirmed credentials were found; this is not a guarantee that no secret exists.
- Earlier deployment metadata labeled operational wallets. Those labels are absent from current metadata but remain recoverable from Git history. They are public on-chain addresses, not private keys; removal from the latest file does not undo the historical disclosure.
- Git commit authors expose email addresses. Contributors should configure an appropriate GitHub noreply address before publishing commits if they want to minimize this exposure.
- The old 128 px logo failed full PNG decoding. The replacement master and 256/512 px files decode successfully; the master hash matches the production record. README and token metadata reference the valid 512 px file.

## Contract review limits

The three published Solidity files match their recorded production hashes. A manual review considered token minting, governance parameters, staking reserve accounting, privileged functions and external token calls. The staking/governance limitation already disclosed in `AUDIT.md` remains relevant.

The exact Timelock and Vesting source files are still missing. The repository also does not contain a dependency lockfile, a reproducible build configuration or the reported internal test suite. Consequently, this review does not reproduce the claimed 21/21 or 37/37 results, execute Slither against a reproducible build, verify current deployed bytecode or establish that the full protocol is free of vulnerabilities.

## Follow-up for maintainers

1. Recover the exact missing source files and verify their recorded hashes.
2. Publish pinned dependency versions and a reproducible build/test setup before claiming independently reproducible validation.
3. Consider private vulnerability reporting and GitHub secret scanning / push protection where available. These repository settings were not inspected or changed by this review.
4. Assess whether historical operational labels require cleanup. History rewriting must be coordinated with maintainers and existing clones; it does not erase already downloaded copies or on-chain data.
