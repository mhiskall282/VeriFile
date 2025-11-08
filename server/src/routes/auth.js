import express from 'express';
import { validateMetaMaskCredentials } from '../middleware/metamaskAuth.js';
import { checkAddressTypeAsFluenceBackend } from '../utils/contractUtils.js';

const router = express.Router();

// Authentication route for protected routes
router.post("/", validateMetaMaskCredentials, async (req, res) => {
  console.log("Received authentication request:", req.body);
  console.log("Verified MetaMask data:", req.metamask);

  try {
    // Make signed RPC call as fluence backend to check if org or employee exists
    const addressType = await checkAddressTypeAsFluenceBackend(
      req.metamask.address
    );

    console.log("Address type check result:", addressType);

    // Return the required JSON format
    console.log("Sending response javda:", addressType);
    res.json(addressType);
  } catch (error) {
    console.error("Error during blockchain address check:", error);

    // Return None in case of error to maintain consistent response format
    res.json({ whatExists: "None" });
  }
});

export default router;