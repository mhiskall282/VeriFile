# Contracts

Primary contract: `hardhat/contracts/WorkHistory.sol`

Purpose

- Store registrations for employees and organizations.
- Provide functions to register employees/orgs and to record or reference work-history metadata.

Where to inspect

- `hardhat/contracts/WorkHistory.sol` for function signatures and events.
- `hardhat/ignition/modules/WorkHistory.ts` for deployment wiring and constructor parameters.

Best practices

- Keep storage minimal (store IPFS/hash pointers to off-chain documents rather than entire documents on-chain).
- Emit events on registration and updates for easy indexing by an off-chain indexer.
