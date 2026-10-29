# Changelog

## 1.0.31

### Fixed

- Ink Velodrome v3 uses the self-hosted Amplifi subgraph instead of the deleted Graph Studio endpoint. Consumers need `AMPLIFI_SUBGRAPH_API_KEY` to access it.
- Monad Atlantis uses the ICHI Vaults Goldsky subgraph instead of the deleted Studio endpoint and obsolete gateway URL.

## 1.0.30

### Fixed

- `getVaultsByTokens` now normalizes V2 subgraph fields (`token0`/`token1` and `allowToken0`/`allowToken1`) before filtering. Before this, it returned no vaults for any V2 deployment (since 1.0.1), including `ThenaV5Rewards`.

## 1.0.29

### Fixed

- `sendUserBalancesQueryRequest` accepts the pre-1.0.28 positional form `(url, account, query, vaultAddress?, isAmplifiHosted?)` again, as well as the 1.0.28 form `(url, account, query, isAmplifiHosted?)`. In the original form `vaultAddress` is still sent as a lowercase query variable.
- Formatted amounts are exact fixed-point decimal strings: tiny (dust) and very large values no longer render in exponential notation or lose precision.

### Added

- BSC `ThenaV5Rewards` deployment configuration: ICHI vault factory, v2 deposit guard, Algebra Integral/MFD settings and subgraph endpoints.
- `getAllUserRewardsDetailed` (and the `UserRewardsDetailed` / `UserRewardsDetailedBN` types): the same read as `getAllUserRewards`, returning `{ rewards, failedVaultAddresses }` so callers can detect vaults omitted because a reward token's decimals could not be resolved. `getAllUserRewards` is unchanged.

## 1.0.28

### Behavior changes

- `getAllRewardInfo` now returns only vaults with a farming contract (matching `getAllRewardVaults`). Do not use it as a complete vault list.
- `getAllRewardInfo` / `getAllRewardVaults` read the full catalog with id-cursor pagination (previously capped at the subgraph default of 100). Malformed, unordered or incomplete catalogs reject instead of being cached.
- `getAllUserBalances`: on MFD-enabled vaults, `shares` is wallet plus staked shares summed exactly, and formatted `stakedShares` uses the same formatting as `shares` (a missing stake is now `'0'` instead of `undefined`).
- `getAllUserAmounts`: on MFD-enabled vaults, amounts now include staked shares.
- `getAllUserRewards`: a vault with nothing claimable returns `{ vaultAddress, rewardTokens: [] }` instead of a bare `[]`.
- `getAllUserRewards` / `getUserRewards`: decimals for reward tokens missing from subgraph metadata are read on-chain instead of reporting `undefined` decimals and formatting with an assumed 18. If that fails, `getAllUserRewards` omits only the affected vault and `getUserRewards` rejects.
- Malformed user balance responses reject instead of resolving to an empty portfolio.
- `sendUserBalancesQueryRequest`: the unused `vaultAddress` parameter was removed; `isAmplifiHosted` is now the 4th argument.
