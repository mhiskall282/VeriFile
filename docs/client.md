# Client (frontend)

Location: `client/`

Key files and responsibilities

- `src/main.tsx` — app bootstrap and router.
- `src/App.tsx` — top-level app shell and route mounting.
- `src/page/` — application pages:
  - `Home.tsx` — landing page
  - `Employee.tsx` — employee dashboard/profile
  - `Organization.tsx` — organization view
  - `RegisterChoice.tsx` — select employee/org registration
  - `UploadDocuments.tsx` — upload UI for supporting documents
  - `VerifyDocuments.tsx` — verification UI driven by SelfComponent
- `src/components/auth/SelfComponent.tsx` — Self.xyz integration component. Initiates the Self flow and receives proof/publicSignals and `userContextData` which is then posted to server.
- `src/utils/metamask.ts` — helper functions for connecting to MetaMask, requesting accounts, preparing signatures/messages.
- `src/utils/ProtectedRoute.tsx` — route guard that can be used to protect pages that require authentication.

How verification is initiated

1. Frontend calls Self.xyz flow (via `SelfComponent`).
2. Frontend creates `userContextData` containing `address:signature:message` and hex-encodes it.
3. Frontend posts the proof, publicSignals and `userContextData` to server `POST /api/self`.

Tips

- Ensure the message you sign in MetaMask is deterministic and matches the server's expectations.
- If you change `userContextData` structure, update the server decoding logic in `server/src/routes/self.js`.
