# Governance

## Governance Parameters

| Parameter | Value |
|---|---|
| Proposal Threshold | 1,000,000 DRAC |
| Quorum | 10% |
| Voting Delay | 1 day |
| Voting Period | 5 days |
| Timelock Delay | 2 days |

## Governance Contracts

- **Governor:** `0xF30d56332d575E1F37EB89841C157713C5968Ac4`
- **Timelock:** `0x78D17d3bb3Bb843462DT67278622817315Faa6e76`

## Staking and Voting Power

- DRAC deposited into the staking contract (`0xdC5b4D7707303Cafb4308E42e3E6cB1813cC03cb`) **does not automatically preserve each staker's ERC20Votes voting power**.
- Voting power is based on the ERC20Votes delegation mechanism on Base Mainnet.
- Stakers should verify whether their voting power is affected by their staking position and take appropriate action if needed.
