# Hardhat & Contracts

Location: `hardhat/`

Quick commands

```powershell
cd hardhat
npm install
npm run node     # start Hardhat node for local dev
npm run compile  # compile contracts
npm run test     # run tests
npm run deploy   # ignition deploy module for WorkHistory
```

What to look for

- `contracts/WorkHistory.sol` — main contract that defines how organizations and employees are registered and how work-history is referenced/stored.
- `ignition/modules/WorkHistory.ts` — ignition module used by the `deploy` script to deploy contract(s) and record deployment metadata.
- `ignition/deployments/chain-31337/` — deployment artifacts generated locally (addresses, build-info, etc.).

Testing

- Unit tests are in `hardhat/test/` — run via `npm run test`.

Notes

- The project uses Hardhat with the ignition plugin and viem/toolbox dependencies. If you change Solidity compiler settings, re-run compile and check `ignition` build-info.
