import { ethers } from 'ethers';

/**
 * Verify MetaMask signature
 * @param {string} address - The Ethereum address that supposedly signed the message
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature to verify
 * @returns {Promise<Object>} Verification result with success, isValid, and error properties
 */
export async function verifyMetaMaskSignature(address, message, signature) {
    try {
        // Validate inputs
        if (!address || !message || !signature) {
            return {
                success: false,
                isValid: false,
                error: 'Missing required parameters: address, message, or signature'
            };
        }

        // Validate Ethereum address format
        if (!ethers.isAddress(address)) {
            return {
                success: false,
                isValid: false,
                error: 'Invalid Ethereum address format'
            };
        }

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

        return {
            success: true,
            isValid: isValid,
            recoveredAddress: recoveredAddress,
            providedAddress: address,
            error: null
        };

    } catch (error) {
        console.error('MetaMask signature verification failed:', error);
        return {
            success: false,
            isValid: false,
            error: `Signature verification failed: ${error.message}`
        };
    }
}

/**
 * Middleware to validate MetaMask credentials
 * Expects the following parameters in the request body or headers:
 * - metaMaskAddress: The Ethereum address
 * - MetamaskMsg: The message that was signed
 * - MetaMaskSign: The signature
 */
export const validateMetaMaskCredentials = async (req, res, next) => {
    try {
        console.log("bosda", req.body);
        // Extract credentials from request body first, then fallback to headers
        const metaMaskAddress = req.body.metaMaskAddress || req.headers['metamask-address'];
        const MetamaskMsg = req.body.MetamaskMsg || req.headers['metamask-message'];
        const MetaMaskSign = req.body.MetaMaskSign || req.headers['metamask-signature'];

        // Check if all required parameters are present
        if (!metaMaskAddress || !MetamaskMsg || !MetaMaskSign) {
            return res.status(400).json({
                success: false,
                error: 'Missing required MetaMask credentials',
                message: 'Please provide metaMaskAddress, MetamaskMsg, and MetaMaskSign in request body or headers',
                required: ['metaMaskAddress', 'MetamaskMsg', 'MetaMaskSign']
            });
        }

        // Verify the MetaMask signature
        const verificationResult = await verifyMetaMaskSignature(metaMaskAddress, MetamaskMsg, MetaMaskSign);

        if (!verificationResult.success) {
            return res.status(500).json({
                success: false,
                error: 'MetaMask verification failed',
                message: verificationResult.error
            });
        }

        if (!verificationResult.isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid MetaMask signature',
                message: 'The provided signature does not match the address and message',
                details: {
                    providedAddress: verificationResult.providedAddress,
                    recoveredAddress: verificationResult.recoveredAddress
                }
            });
        }

        // Add verified MetaMask data to request object for use in subsequent middleware/routes
        req.metamask = {
            address: metaMaskAddress,
            message: MetamaskMsg,
            signature: MetaMaskSign,
            verified: true,
            verificationResult: verificationResult
        };

        // Continue to next middleware/route
        next();

    } catch (error) {
        console.error('MetaMask validation middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during MetaMask validation',
            message: error.message
        });
    }
};