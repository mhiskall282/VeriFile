# Verifile

Verifile is a proof-of-concept project for verifiable work history using Ethereum smart contracts, a React/Vite frontend, and a Node.js backend. It integrates Self.xyz verification and MetaMask-based signature checks to link verified identities to on-chain employee registrations.

This repository contains three main parts:

- `client/` — React + Vite app (TypeScript) for users and organizations to interact with the system.
- `hardhat/` — Smart contract code (Solidity) and ignition scripts for deployment and testing.
- `server/` — Express backend providing API endpoints, MetaMask verification middleware, and helpers to interact with the contracts.

## Quick index (what's where)

- client/
  - `src/page/` — UI pages: `Home`, `Employee`, `Organization`, `RegisterChoice`, `UploadDocuments`, `VerifyDocuments`.
  - `src/components/auth/SelfComponent.tsx` — Self.xyz integration UI component.
  - `src/utils/metamask.ts` — MetaMask helpers.
  - `src/utils/ProtectedRoute.tsx` — Route guard for authenticated pages.

- hardhat/
  - `contracts/WorkHistory.sol` — Main smart contract for registering employees/orgs and storing work-history references.
  - `ignition/` — Ignition deployments and modules (used by `npx hardhat ignition deploy`).
  - `scripts/` and `test/` — helper scripts and tests.

- server/
  - `src/routes/` — API endpoints: `auth.js`, `self.js`, `health.js`.
  - `src/middleware/metamaskAuth.js` — Signature verification and MetaMask validation middleware.
  - `src/config/selfVerifier.js` — Self.xyz backend verifier setup used by the server.
  - `src/utils/contractUtils.js` — Contract interaction helpers.

## Requirements

- Node.js (recommended >= 18)
- npm (or yarn)
- For local contract testing: `npx hardhat` (installed in `hardhat/` devDependencies)

## Setup & Run (PowerShell)

Open separate terminals for each service.

1) Client (frontend)

```powershell
cd client
npm install
npm run dev
```

This runs the Vite dev server. The `client/package.json` exposes `dev`, `build`, and `preview` scripts.

2) Server (backend)

```powershell
cd server
npm install
npm run dev   # starts nodemon on src/server.js for development
```

For production: `npm start` will run `node src/server.js`.

3) Hardhat (contracts)

```powershell
cd hardhat
npm install
npm run node     # starts a local Hardhat node
npm run compile  # compile contracts
npm run test     # run tests
# to deploy with ignition
npm run deploy
```

Notes:
- The hardhat package has `node`, `compile`, `test`, and `deploy` scripts. `deploy` runs the ignition deployment module for the WorkHistory contract.
- The server uses environment configuration and a Self.xyz backend endpoint (see `server/src/config/selfVerifier.js`) — you may need to update the ngrok URL or endpoint to your Self backend.

## API (high level)

- `POST /api/auth` — MetaMask authentication check. Uses `validateMetaMaskCredentials` middleware. Returns a JSON with `whatExists` to indicate whether the address is `employee`, `org`, or `None`.
- `POST /api/self` — Accepts Self.xyz verification payload (proof, publicSignals, attestationId, userContextData). The server verifies Self proof, validates the MetaMask signature embedded in `userContextData`, and may attempt to register the user as an employee on-chain.
- `GET /api/health` — Simple health check returning `{ status: 'OK', timestamp: ... }`.

See `docs/api.md` for payload shapes, example requests and further notes.

## How verification & registration flows work (summary)

1. Frontend collects identity verification via Self.xyz (ZK proof flow). As part of the flow, it encodes a `userContextData` string that includes the wallet address, a signature and message.
2. Frontend posts the Self proof to `POST /api/self` along with that `userContextData`.
3. Server decodes `userContextData`, verifies the MetaMask signature with `verifyMetaMaskSignature` (in `server/src/middleware/metamaskAuth.js`).
4. If Self proof and MetaMask check both succeed, the server uses `contractUtils.registerEmployee()` to register the address on-chain via the WorkHistory contract.

## Where to look next (developer pointers)

- Frontend UI: `client/src/page/` and `client/src/components/auth/SelfComponent.tsx`.
- Server flow: `server/src/routes/self.js` (verification & registration logic), `server/src/middleware/metamaskAuth.js` (signature verification), `server/src/utils/contractUtils.js` (blockchain helpers).
- Contract logic: `hardhat/contracts/WorkHistory.sol` and ignition modules in `hardhat/ignition/modules/WorkHistory.ts`.

## Troubleshooting

- If Self.xyz verification endpoint is unreachable, update `server/src/config/selfVerifier.js` with the correct endpoint or run a local proxy/ngrok.
- If MetaMask signature checks fail, ensure the frontend signs the exact `message` that the server expects and that `userContextData` is encoded as `address:signature:message` and hex-encoded.
- If on-chain registration fails, start a local Hardhat node (`npx hardhat node`) and point the server to the correct RPC (see `server/src/utils/rpc.js`).

## Contributing & Next steps

- Add tests for the server endpoints (happy path + edge cases).
- Add CI to run `hardhat test` and `client` lint/build.
- Improve docs with sequence diagrams and swagger/openapi for the API.

---

For more details see `docs/INDEX.md` and other files in the `docs/` directory.
