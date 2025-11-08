# Architecture

Overview

Verifile connects three layers:

1. Frontend (client) — React + Vite UI. Responsible for collecting user input, initiating MetaMask signatures, and driving Self.xyz verification flows.
2. Backend (server) — Express app. Verifies Self proofs, validates MetaMask signatures, and acts as a trusted backend to interact with the blockchain on behalf of the application.
3. Blockchain (contracts/hardhat) — `WorkHistory.sol` stores registrations and references to verified records.

Data flow (high level)

- User opens the frontend and initiates Self.xyz flow (via the SelfComponent).
- Frontend obtains a ZK proof and encodes `userContextData` (wallet address, signature, message) as a hex string.
- Frontend sends the proof + `userContextData` to the server endpoint `POST /api/self`.
- Server decodes `userContextData`, verifies the MetaMask signature (middleware), and verifies the Self proof using `SelfBackendVerifier`.
- On success, the server can call blockchain helper functions (`contractUtils.registerEmployee`) to register the address on-chain.

Authentication & trust

- Authentication is handled via MetaMask signatures (server-side verification with ethers.verifyMessage).
- The server holds the Self.xyz backend verifier (see `server/src/config/selfVerifier.js`), which communicates with the Self backend to validate proofs.

Deployment notes

- For local development, run a Hardhat node and point server RPC config to that node.
- If the Self backend is hosted behind ngrok (or similar), ensure `selfVerifier.js` points to the correct public URL.
