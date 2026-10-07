# Contributing to Dracul Coin (DRAC)

We welcome contributions to the DRAC project! Whether you're interested in
documentation, tests, contract review, tooling, or metadata, your help is
appreciated.

## What We're Looking For

- **Documentation:** Improvements to README, AUDIT, CONTRIBUTING, and other
  markdown files.
- **Tests:** Additional test suites, edge-case scenarios, and fuzzing scripts.
- **Contract Review:** Thoughtful security reviews and suggestions.
- **Tooling:** Build scripts, CI helpers, and developer tooling.
- **Metadata:** Token lists, branding assets, and community resources.

## Important Note on Mainnet Behavior

**Mainnet behavior cannot be changed merely by merging code on GitHub.** The
DRAC protocol is deployed on Base Mainnet. Any changes to deployed protocol
behavior must go through the appropriate governance process defined in
`DraculGovernor.sol`. Pull requests that touch contracts or deployment
metadata will be reviewed carefully to ensure they do not inadvertently alter
on-chain state without following governance.

## Submission Guidelines

- **Never submit secrets.** This includes private keys, seed phrases, keystores,
  passwords, recovery codes, auth tokens, cookies, private RPC credentials,
  or `.env` files.
- **Security-sensitive findings** should be reported via [SECURITY.md](./SECURITY.md).
- Fork the repository, create a feature branch, and open a pull request.

Thank you for helping make DRAC more robust and community-driven!
