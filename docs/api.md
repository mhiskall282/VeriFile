# API Reference (high-level)

Base path: `/api`

1) POST /api/auth

- Purpose: Quick MetaMask-based authentication check + backend address type lookup.
- Middleware: `validateMetaMaskCredentials` — expects `metaMaskAddress`, `MetamaskMsg`, `MetaMaskSign` in the request body or headers.
- Response: JSON object indicating address type, for example:

```json
{ "whatExists": "employee" }
```

or

```json
{ "whatExists": "None" }
```

2) POST /api/self

- Purpose: Accepts a Self.xyz proof and user context, verifies the proof and MetaMask signature, and attempts to register the user as an employee.
- Expected payload (JSON):

```json
{
  "attestationId": "<number>",
  "proof": { /* zk proof object from Self */ },
  "publicSignals": [ /* array */ ],
  "userContextData": "0x..." // hex encoding of `address:signature:message`
}
```

- Behavior:
  - Decodes `userContextData` to extract `walletAddress`, `signature`, and `message`.
  - Verifies MetaMask signature server-side using `ethers.verifyMessage`.
  - Verifies Self proof using `selfBackendVerifier.verify(...)`.
  - If all checks pass, will check on-chain if the address already exists and will call `registerEmployee()` when appropriate.

- Response: Detailed JSON indicating verification result, credential subject, metamask verification status, and employee registration result.

3) GET /api/health

- Purpose: Simple health check.
- Response:

```json
{ "status": "OK", "timestamp": "..." }
```

Errors & status codes

- `400` — missing required parameters (e.g., missing MetaMask fields)
- `401` — invalid signature
- `500` — server verification error or exception

Security notes

- The server treats the MetaMask signature verification as the authentication mechanism; ensure TLS/HTTPS in production and validate message formats strictly.
