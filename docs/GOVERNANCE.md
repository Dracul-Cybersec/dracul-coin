# Governance

## Governance contracts

- **Governor:** `0xF30d56332d575E1F37EB89841C157713C5968Ac4`
- **Timelock:** `0x78D17d3bb3Bb843462D67278622817315Faa6e76`
- **Voting token:** `0xb193cFE2E4A807Ff3dF920139bfA3785F8094c70`

## Parameters

| Parameter | Value |
|---|---|
| Proposal Threshold | 1,000,000 DRAC |
| Quorum | 10% of total supply at the proposal snapshot (10,000,000 DRAC at initial supply) |
| Voting Delay | 1 day |
| Voting Period | 5 days |
| Timelock Delay | 2 days |

During the production deployment, ownership/control of the token and staking system was handed to the Timelock and the bootstrap Timelock admin role was renounced.

## ERC20Votes caveat

DRAC uses timestamp-based ERC20Votes checkpoints. DRAC deposited into the staking contract does **not** automatically preserve each staker's individual ERC20Votes voting power. This is a known design limitation of the current staking architecture and should be considered before governance participation.
