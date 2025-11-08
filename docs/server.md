# Server (backend)

Location: `server/src/`

Main entry points

- `server.js` / `app.js` — Express app wiring (see `src/server.js` and `src/app.js`). These files mount routes under `/api` and initialize middleware.

Routes

- `src/routes/auth.js` — `POST /api/auth`
  - Uses `validateMetaMaskCredentials` middleware.
  - Purpose: Validate a MetaMask-signed payload and query the blockchain (via `contractUtils.checkAddressTypeAsFluenceBackend`) to determine if the address exists as `employee`, `org`, or `None`.

- `src/routes/self.js` — `POST /api/self`
  - Accepts `attestationId`, `proof`, `publicSignals`, and `userContextData` (hex).
  - Decodes `userContextData` into `address:signature:message`.
  - Verifies the MetaMask signature using `verifyMetaMaskSignature` (middleware function imported in the route).
  - Uses `selfBackendVerifier.verify(...)` to validate the Self proof.
  - On success, may call `registerEmployee` in `contractUtils` to perform on-chain registration.

- `src/routes/health.js` — `GET /api/health` — simple health check.

Middleware

- `src/middleware/metamaskAuth.js` — contains:
  - `verifyMetaMaskSignature(address, message, signature)` — uses `ethers.verifyMessage` and compares recovered and provided addresses.
  - `validateMetaMaskCredentials` middleware — extracts credentials from body or headers and verifies the signature, then attaches `req.metamask`.

Config

- `src/config/selfVerifier.js` — configures `SelfBackendVerifier` from `@selfxyz/core`. Contains the backend endpoint and verifier options. Update the endpoint to your Self backend/ngrok address.

Utils

- `src/utils/contractUtils.js` — helpers to interact with the WorkHistory contract, including checking address type and registering employees.
- `src/utils/rpc.js` — RPC helper configuration for connecting to the blockchain.

Developer notes

- The server expects `userContextData` to be a hex string representing `address:signature:message`. If the client encoding changes, update decoding logic in `src/routes/self.js`.
- Make sure RPC configuration points to the desired network (local Hardhat node in dev).
