import { rpcClient, createRPCClient } from './rpc.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the contract ABI
const contractArtifactPath = path.resolve(__dirname, './WorkHistory.json');
let contractABI;
let contractAddress;

try {
    const artifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
    contractABI = artifact.abi;
    
    // Use the contract address from environment variables
    contractAddress = process.env.CONTRACT_ADDRESS || "0x768ff64701c5f9b9033d93d49501bb4a3aafc310";
} catch (error) {
    console.error('Error loading contract artifact:', error);
    contractABI = [];
}

// Create a dedicated RPC client for fluence backend operations
// The PRIVATE_KEY in .env should correspond to the FLUENCE_BACKEND_ADDRESS
const fluenceBackendClient = createRPCClient(
    process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com', // RPC URL
    process.env.PRIVATE_KEY // This should be the private key for FLUENCE_BACKEND_ADDRESS
);

/**
 * Check if an address exists as an organization or employee on the blockchain
 * @param {string} address - The wallet address to check
 * @returns {Promise<{whatExists: 'None' | 'employee' | 'org'}>}
 */
export async function checkAddressType(address) {
    try {
        // Check if address exists as an organization
        const orgCheckResult = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'checkIfOrgExists',
            [address]
        );

        if (orgCheckResult.success && orgCheckResult.data === true) {
            return { whatExists: 'org' };
        }

        // Check if address exists as an employee
        const employeeCheckResult = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'checkIfEmployeeExists',
            [address]
        );

        if (employeeCheckResult.success && employeeCheckResult.data === true) {
            return { whatExists: 'employee' };
        }

        // If neither exists, return None
        return { whatExists: 'None' };

    } catch (error) {
        console.error('Error checking address type:', error);
        // Return None in case of error to maintain consistent response format
        return { whatExists: 'None' };
    }
}

/**
 * Make a signed call to the blockchain as the fluence backend
 * This simulates the fluence backend making the call
 * @param {string} address - The wallet address to check
 * @returns {Promise<{whatExists: 'None' | 'employee' | 'org'}>}
 */
export async function checkAddressTypeAsFluenceBackend(address) {
    try {
        // Use the private key from environment to sign the call
        // This simulates the fluence backend making a signed call
        const signedClient = rpcClient;
        
        console.log(`Fluence backend checking address: ${address}`);
        console.log(`Using contract at: ${contractAddress}`);
        
        // Check if address exists as an organization first
        const orgCheckResult = await signedClient.callContract(
            contractAddress,
            contractABI,
            'checkIfOrgExists',
            [address]
        );

        console.log('Organization check result:', orgCheckResult);

        if (orgCheckResult.success && orgCheckResult.data === true) {
            return { whatExists: 'org' };
        }

        // Check if address exists as an employee
        const employeeCheckResult = await signedClient.callContract(
            contractAddress,
            contractABI,
            'checkIfEmployeeExists',
            [address]
        );

        console.log('Employee check result:', employeeCheckResult);

        if (employeeCheckResult.success && employeeCheckResult.data === true) {
            return { whatExists: 'employee' };
        }

        // If neither exists, return None
        return { whatExists: 'None' };

    } catch (error) {
        console.error('Error in fluence backend address check:', error);
        // Return None in case of error to maintain consistent response format
        return { whatExists: 'None' };
    }
}

/**
 * Register an employee on the blockchain using the fluence backend address
 * @param {string} employeeAddress - The wallet address of the employee to register
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function registerEmployee(employeeAddress) {
    try {
        console.log(`Registering employee: ${employeeAddress}`);
        console.log(`Using contract at: ${contractAddress}`);
        console.log(`Fluence backend address: ${process.env.FLUENCE_BACKEND_ADDRESS || 'using default from contract'}`);
        
        // Execute the registerEmployee function using the fluence backend's private key
        const result = await fluenceBackendClient.executeContract(
            contractAddress,
            contractABI,
            'registerEmployee',
            [employeeAddress]
        );

        if (result.success) {
            console.log(`Employee ${employeeAddress} registered successfully`);
            console.log(`Transaction hash: ${result.data.hash}`);
            
            // Wait for transaction confirmation
            const receipt = await fluenceBackendClient.waitForTransaction(result.data.hash, 1);
            if (receipt.success) {
                console.log(`Transaction confirmed: ${result.data.hash}`);
                return {
                    success: true,
                    data: {
                        transactionHash: result.data.hash,
                        receipt: receipt.data
                    }
                };
            } else {
                console.error('Transaction failed to confirm:', receipt.error);
                return {
                    success: false,
                    error: `Transaction failed to confirm: ${receipt.error}`
                };
            }
        } else {
            console.error('Failed to register employee:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error registering employee:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Add an organization to the waiting list using fluence backend
 * @param {Object} orgData - Organization data
 * @param {string} orgData.orgName - Organization name
 * @param {string} orgData.orgWebsite - Organization website
 * @param {string} orgData.physicalAddress - Organization physical address
 * @param {string} orgData.orgWalletAddress - Organization wallet address
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addOrganizationToWaitingList(orgData) {
    try {
        console.log('Adding organization to waiting list:', orgData);
        console.log(`Using contract at: ${contractAddress}`);
        
        // Create the organization object that matches the contract structure
        const orgStruct = {
            orgName: orgData.orgName,
            orgWebsite: orgData.orgWebsite,
            physicalAddress: orgData.physicalAddress,
            orgWalletAddress: orgData.orgWalletAddress
        };

        // Execute the addOrganization function using the fluence backend's private key
        const result = await fluenceBackendClient.executeContract(
            contractAddress,
            contractABI,
            'addOrganization',
            [orgStruct]
        );

        if (result.success) {
            console.log(`Organization ${orgData.orgName} added to waiting list successfully`);
            console.log(`Transaction hash: ${result.data.hash}`);
            
            // Wait for transaction confirmation
            const receipt = await fluenceBackendClient.waitForTransaction(result.data.hash, 1);
            if (receipt.success) {
                console.log(`Transaction confirmed: ${result.data.hash}`);
                return {
                    success: true,
                    data: {
                        transactionHash: result.data.hash,
                        receipt: receipt.data
                    }
                };
            } else {
                console.error('Transaction failed to confirm:', receipt.error);
                return {
                    success: false,
                    error: `Transaction failed to confirm: ${receipt.error}`
                };
            }
        } else {
            console.error('Failed to add organization:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error adding organization to waiting list:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all initial organizations (created with constructor)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getAllInitialOrganizations() {
    try {
        console.log('Getting all initial organizations');
        
        const result = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'getAllInitialOrganizationIds',
            []
        );

        if (result.success) {
            console.log('Initial organizations retrieved successfully');
            return {
                success: true,
                data: result.data
            };
        } else {
            console.error('Failed to get initial organizations:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error getting initial organizations:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if an organization is one of the powerful/initial organizations
 * @param {string} orgAddress - The organization address to check
 * @returns {Promise<{success: boolean, isPowerful?: boolean, error?: string}>}
 */
export async function checkOrgsPowerfulOrNot(orgAddress) {
    try {
        console.log(`Checking if organization ${orgAddress} is powerful/initial`);
        
        // Get all initial organizations
        const initialOrgsResult = await getAllInitialOrganizations();
        
        if (!initialOrgsResult.success) {
            return {
                success: false,
                error: initialOrgsResult.error
            };
        }

        // Check if the provided address is in the initial organizations
        const initialOrgs = initialOrgsResult.data;
        const isPowerful = initialOrgs.some(org => 
            org.orgWalletAddress.toLowerCase() === orgAddress.toLowerCase()
        );

        console.log(`Organization ${orgAddress} is ${isPowerful ? 'powerful' : 'not powerful'}`);
        
        return {
            success: true,
            isPowerful: isPowerful
        };

    } catch (error) {
        console.error('Error checking if organization is powerful:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verify an organization (vote for it) using fluence backend on behalf of a trusted organization
 * @param {string} voterAddress - Address of the organization that is voting
 * @param {string} orgToVerifyAddress - Address of the organization being verified
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function verifyOrganization(voterAddress, orgToVerifyAddress) {
    try {
        console.log(`Organization ${voterAddress} is verifying ${orgToVerifyAddress}`);
        console.log(`Using contract at: ${contractAddress}`);
        
        // Use the new verifyOrganizationOnBehalf function that allows fluence backend 
        // to verify on behalf of a trusted organization
        const result = await fluenceBackendClient.executeContract(
            contractAddress,
            contractABI,
            'verifyOrganizationOnBehalf',
            [voterAddress, orgToVerifyAddress]
        );

        if (result.success) {
            console.log(`Organization ${orgToVerifyAddress} verified successfully by ${voterAddress}`);
            console.log(`Transaction hash: ${result.data.hash}`);
            
            // Wait for transaction confirmation
            const receipt = await fluenceBackendClient.waitForTransaction(result.data.hash, 1);
            if (receipt.success) {
                console.log(`Transaction confirmed: ${result.data.hash}`);
                return {
                    success: true,
                    data: {
                        transactionHash: result.data.hash,
                        receipt: receipt.data
                    }
                };
            } else {
                console.error('Transaction failed to confirm:', receipt.error);
                return {
                    success: false,
                    error: `Transaction failed to confirm: ${receipt.error}`
                };
            }
        } else {
            console.error('Failed to verify organization:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error verifying organization:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get user documents data for employee dashboard
 * @param {string} userAddress - The employee address to get documents for
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getUserDocuments(userAddress) {
    try {
        console.log(`Getting documents for user: ${userAddress}`);
        
        const result = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'getUserDocuments',
            [userAddress]
        );

        if (result.success) {
            console.log('User documents retrieved successfully');
            return {
                success: true,
                data: result.data
            };
        } else {
            console.error('Failed to get user documents:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error getting user documents:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get comprehensive user data including documents and organizations
 * @param {string} userAddress - The employee address to get data for
 * @returns {Promise<{success: boolean, data?: any, isRegistered?: boolean, error?: string}>}
 */
export async function getUsersData(userAddress) {
    try {
        console.log(`Getting comprehensive data for user: ${userAddress}`);
        
        const result = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'getUsersData',
            [userAddress]
        );

        if (result.success) {
            console.log('User data retrieved successfully');
            const [userData, isRegistered] = result.data;
            return {
                success: true,
                data: userData,
                isRegistered: isRegistered
            };
        } else {
            console.error('Failed to get user data:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error getting user data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Add a document to the blockchain for an employee using fluence backend
 * @param {string} employeeAddress - The employee address to add document for
 * @param {string} documentHash - The hash of the document content
 * @param {string} orgAddress - The organization address that is adding the document
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addDocumentToBlockchain(employeeAddress, documentHash, orgAddress) {
    try {
        console.log(`Adding document for employee: ${employeeAddress}`);
        console.log(`Document hash: ${documentHash}`);
        console.log(`Organization: ${orgAddress}`);
        console.log(`Using contract at: ${contractAddress}`);
        
        // First check if the employee is registered
        const employeeExists = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'checkIfEmployeeExists',
            [employeeAddress]
        );

        if (!employeeExists.success || !employeeExists.data) {
            return {
                success: false,
                error: "Employee is not registered"
            };
        }

        // Check if the organization exists and is trusted
        const orgExists = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'checkIfOrgExists',
            [orgAddress]
        );

        if (!orgExists.success || !orgExists.data) {
            return {
                success: false,
                error: "Organization does not exist"
            };
        }

        // Get organization details to check if it's trusted
        const orgDetails = await rpcClient.callContract(
            contractAddress,
            contractABI,
            'organizations',
            [orgAddress]
        );

        if (!orgDetails.success || !orgDetails.data[4]) { // index 4 is isTrusted
            return {
                success: false,
                error: "Organization is not trusted"
            };
        }

        // Execute the addDocument function using the fluence backend's private key
        // Note: The fluence backend needs to be set as a trusted organization for this to work
        const result = await fluenceBackendClient.executeContract(
            contractAddress,
            contractABI,
            'addDocument',
            [employeeAddress, documentHash]
        );

        if (result.success) {
            console.log(`Document added successfully for employee ${employeeAddress}`);
            console.log(`Transaction hash: ${result.data.hash}`);
            
            // Wait for transaction confirmation
            const receipt = await fluenceBackendClient.waitForTransaction(result.data.hash, 1);
            if (receipt.success) {
                console.log(`Transaction confirmed: ${result.data.hash}`);
                return {
                    success: true,
                    data: {
                        transactionHash: result.data.hash,
                        documentHash: documentHash,
                        employeeAddress: employeeAddress,
                        addedBy: process.env.FLUENCE_BACKEND_ADDRESS,
                        receipt: receipt.data
                    }
                };
            } else {
                console.error('Transaction failed to confirm:', receipt.error);
                return {
                    success: false,
                    error: `Transaction failed to confirm: ${receipt.error}`
                };
            }
        } else {
            console.error('Failed to add document:', result.error);
            return {
                success: false,
                error: result.error
            };
        }

    } catch (error) {
        console.error('Error adding document to blockchain:', error);
        return {
            success: false,
            error: error.message
        };
    }
}