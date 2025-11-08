import express from 'express';
import multer from 'multer';
import crypto from 'crypto-js';

import { validateMetaMaskCredentials } from './middleware/metamaskAuth.js';
import { 
    checkAddressTypeAsFluenceBackend, 
    registerEmployee, 
    addOrganizationToWaitingList,
    checkOrgsPowerfulOrNot,
    verifyOrganization,
    getUsersData,
    getUserDocuments,
    addDocumentToBlockchain
} from './utils/contractUtils.js';

import cors from 'cors';

// Import configurations
import { corsConfig } from './config/cors.js';

// Import routes
import authRoutes from './routes/auth.js';
import selfRoutes from './routes/self.js';
import healthRoutes from './routes/health.js';

const app = express();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and images are allowed.'), false);
    }
  }
});

// Call startup tasks (commented out for now)
// startupTasks();  // dont call only for checking employee seeding

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

// Route handlers
app.use("/api/auth", authRoutes);
app.use("/api/self", selfRoutes);
app.use("/api/health", healthRoutes);

app.post("/api/get-employee-dashboard-data", validateMetaMaskCredentials, async (req, res) => {
  console.log("Received employee dashboard request");
  console.log("Verified MetaMask data:", req.metamask);

  try {
    // Get the employee address from the validated MetaMask request
    const employeeAddress = req.metamask.address;

    // First check if the address exists as an employee
    const addressType = await checkAddressTypeAsFluenceBackend(employeeAddress);
    
    if (addressType.whatExists !== 'employee') {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "Address is not registered as an employee"
      });
    }

    console.log(`✅ Employee ${employeeAddress} verified, fetching dashboard data`);

    // Get comprehensive user data including documents and organizations
    const userDataResult = await getUsersData(employeeAddress);
    
    if (!userDataResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employee data",
        message: userDataResult.error
      });
    }

    // Format the response data
    const dashboardData = {
      employeeAddress: employeeAddress,
      isRegistered: userDataResult.isRegistered,
      documentsCount: userDataResult.data.length,
      documents: userDataResult.data.map((item, index) => ({
        id: index,
        documentHash: item.documents[0].documentHash,
        timestamp: parseInt(item.documents[0].timestamp),
        addedBy: {
          address: item.documents[0].addedBy,
          orgName: item.organizationsThatAdded[0].orgName,
          orgWebsite: item.organizationsThatAdded[0].orgWebsite,
          physicalAddress: item.organizationsThatAdded[0].physicalAddress,
          isTrusted: item.organizationsThatAdded[0].isTrusted
        }
      }))
    };

    console.log(`✅ Successfully retrieved dashboard data for employee ${employeeAddress}`);
    console.log(`Found ${dashboardData.documentsCount} documents`);

    res.json({
      success: true,
      message: "Employee dashboard data retrieved successfully",
      data: dashboardData
    });

  } catch (error) {
    console.error("❌ Error during employee dashboard data retrieval:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

app.post("/api/add-org-to-waiting-list", async (req, res) => {
  const { orgName, orgWebsite, physicalAddress, orgWalletAddress } = req.body;
  
  console.log("Received organisation waitlist request:", req.body);

  try {
    // Validate required fields
    if (!orgName || !orgWebsite || !physicalAddress || !orgWalletAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Please provide orgName, orgWebsite, physicalAddress, and orgWalletAddress"
      });
    }

    // Add organization to waiting list using fluence backend private key
    const result = await addOrganizationToWaitingList({
      orgName,
      orgWebsite,
      physicalAddress,
      orgWalletAddress
    });

    if (result.success) {
      console.log(`✅ Successfully added organization ${orgName} to waiting list`);
      res.json({
        success: true,
        message: "Organization added to waiting list successfully",
        data: {
          transactionHash: result.data.transactionHash,
          orgName: orgName,
          orgWalletAddress: orgWalletAddress
        }
      });
    } else {
      console.log(`⚠️ Failed to add organization to waiting list: ${result.error}`);
      res.status(500).json({
        success: false,
        error: "Failed to add organization to waiting list",
        message: result.error
      });
    }

  } catch (error) {
    console.error("❌ Error during organization waitlist addition:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

app.post("/api/vote", validateMetaMaskCredentials, async (req, res) => {
  const { orgToVerifyAddress } = req.body;
  
  console.log("Received voting request:", req.body);
  console.log("Verified MetaMask data:", req.metamask);

  try {
    // Validate required fields
    if (!orgToVerifyAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required field",
        message: "Please provide orgToVerifyAddress"
      });
    }

    // Get the MetaMask address from the validated request
    const voterAddress = req.metamask.address;

    // Check if the voter address is one of the initial/powerful organizations
    const powerfulCheckResult = await checkOrgsPowerfulOrNot(voterAddress);

    if (!powerfulCheckResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to check organization power status",
        message: powerfulCheckResult.error
      });
    }

    if (!powerfulCheckResult.isPowerful) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Only initial/powerful organizations can vote"
      });
    }

    console.log(`✅ Organization ${voterAddress} is authorized to vote`);

    // Register the vote by calling verifyOrganization
    const voteResult = await verifyOrganization(voterAddress, orgToVerifyAddress);

    if (voteResult.success) {
      console.log(`✅ Vote registered successfully: ${voterAddress} voted for ${orgToVerifyAddress}`);
      res.json({
        success: true,
        message: "Vote registered successfully",
        data: {
          voterAddress: voterAddress,
          orgToVerifyAddress: orgToVerifyAddress,
          transactionHash: voteResult.data.transactionHash
        }
      });
    } else {
      console.log(`⚠️ Failed to register vote: ${voteResult.error}`);
      res.status(500).json({
        success: false,
        error: "Failed to register vote",
        message: voteResult.error
      });
    }

  } catch (error) {
    console.error("❌ Error during voting process:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
})

app.post("/api/register-employee", validateMetaMaskCredentials, async (req, res) => {
  console.log("Received employee registration request");
  console.log("Verified MetaMask data:", req.metamask);

  try {
    // Get the employee address from the validated MetaMask request
    const employeeAddress = req.metamask.address;

    // First check if the address already exists as an employee or organization
    const addressType = await checkAddressTypeAsFluenceBackend(employeeAddress);
    
    if (addressType.whatExists === 'employee') {
      return res.status(400).json({
        success: false,
        error: "Already registered",
        message: "Address is already registered as an employee"
      });
    }

    if (addressType.whatExists === 'org') {
      return res.status(400).json({
        success: false,
        error: "Invalid address",
        message: "Address is already registered as an organization"
      });
    }

    console.log(`📝 Registering new employee: ${employeeAddress}`);

    // Register the employee using the fluence backend private key
    const registerResult = await registerEmployee(employeeAddress);

    if (registerResult.success) {
      console.log(`✅ Employee ${employeeAddress} registered successfully`);
      res.json({
        success: true,
        message: "Employee registered successfully",
        data: {
          employeeAddress: employeeAddress,
          transactionHash: registerResult.data.transactionHash
        }
      });
    } else {
      console.log(`⚠️ Failed to register employee: ${registerResult.error}`);
      res.status(500).json({
        success: false,
        error: "Failed to register employee",
        message: registerResult.error
      });
    }

  } catch (error) {
    console.error("❌ Error during employee registration:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

app.post("/api/upload-documents", validateMetaMaskCredentials, upload.array('documents'), async (req, res) => {
  console.log("Received document upload request");
  console.log("Verified MetaMask data:", req.metamask);
  console.log("Number of files received:", req.files ? req.files.length : 0);

  try {
    // Validate that files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
        message: "Please select at least one file to upload"
      });
    }

    // Get the organization address from the validated MetaMask request
    const orgAddress = req.metamask.address;
    
    // Get employee address from request body
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Missing employee address",
        message: "Please provide the employee address"
      });
    }

    console.log(`📄 Processing ${req.files.length} files for employee ${address} by organization ${orgAddress}`);

    // First check if the organization address is one of the initial/powerful organizations
    const powerfulCheckResult = await checkOrgsPowerfulOrNot(orgAddress);

    if (!powerfulCheckResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to check organization power status",
        message: powerfulCheckResult.error
      });
    }

    if (!powerfulCheckResult.isPowerful) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Only initial/powerful organizations can upload documents"
      });
    }

    console.log(`✅ Organization ${orgAddress} is authorized to upload documents`);

    // Process each file
    const processedFiles = [];
    const failedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        console.log(`Processing file ${i + 1}: ${file.originalname}`);
        
        // Generate hash of file content
        const fileBuffer = file.buffer;
        const contentHash = crypto.SHA256(fileBuffer.toString('base64')).toString();
        
        // Create a bytes32 hash for the blockchain (take first 32 bytes)
        const blockchainHash = '0x' + contentHash.substring(0, 64);
        
        console.log(`Generated hash for ${file.originalname}: ${blockchainHash}`);
        
        // Add document to blockchain
        const blockchainResult = await addDocumentToBlockchain(
          address,
          blockchainHash,
          orgAddress
        );

        if (blockchainResult.success) {
          processedFiles.push({
            fileName: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            contentHash: contentHash,
            blockchainHash: blockchainHash,
            transactionHash: blockchainResult.data.transactionHash,
            addedBy: orgAddress,
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ Successfully processed file: ${file.originalname}`);
        } else {
          failedFiles.push({
            fileName: file.originalname,
            error: blockchainResult.error
          });
          
          console.log(`❌ Failed to process file ${file.originalname}: ${blockchainResult.error}`);
        }
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        failedFiles.push({
          fileName: file.originalname,
          error: fileError.message
        });
      }
    }

    // Prepare response
    const response = {
      success: processedFiles.length > 0,
      message: `Processed ${processedFiles.length} files successfully, ${failedFiles.length} failed`,
      data: {
        employeeAddress: address,
        organizationAddress: orgAddress,
        processedFiles: processedFiles,
        totalProcessed: processedFiles.length,
        totalFailed: failedFiles.length
      }
    };

    if (failedFiles.length > 0) {
      response.data.failedFiles = failedFiles;
    }

    console.log(`📋 Upload summary: ${processedFiles.length} successful, ${failedFiles.length} failed`);

    // Return success if at least one file was processed
    if (processedFiles.length > 0) {
      res.json(response);
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to process any files",
        message: "All file uploads failed",
        data: {
          failedFiles: failedFiles
        }
      });
    }

  } catch (error) {
    console.error("❌ Error during document upload:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

app.post("/api/verify-documents", upload.array('documents'), async (req, res) => {
  console.log("Received document verification request");
  console.log("Number of files received:", req.files ? req.files.length : 0);

  try {
    // Validate that files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
        message: "Please select at least one file to verify"
      });
    }

    // Get employee address from request body
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Missing employee address",
        message: "Please provide the employee address to verify documents against"
      });
    }

    console.log(`📄 Verifying ${req.files.length} files against blockchain records for employee ${address}`);

    // Get all documents for this employee from blockchain
    const userDataResult = await getUsersData(address);
    
    if (!userDataResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch employee documents from blockchain",
        message: userDataResult.error
      });
    }

    if (!userDataResult.isRegistered) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
        message: "The provided address is not registered as an employee"
      });
    }

    const blockchainDocuments = userDataResult.data || [];
    console.log(`📋 Found ${blockchainDocuments.length} documents on blockchain for employee ${address}`);

    // Extract all blockchain hashes for comparison
    const blockchainHashes = blockchainDocuments.map(item => ({
      hash: item.documents[0].documentHash,
      timestamp: parseInt(item.documents[0].timestamp),
      addedBy: {
        address: item.documents[0].addedBy,
        orgName: item.organizationsThatAdded[0].orgName,
        orgWebsite: item.organizationsThatAdded[0].orgWebsite,
        physicalAddress: item.organizationsThatAdded[0].physicalAddress,
        isTrusted: item.organizationsThatAdded[0].isTrusted
      }
    }));

    // Process each uploaded file
    const verificationResults = [];
    const unverifiedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        console.log(`Verifying file ${i + 1}: ${file.originalname}`);
        
        // Generate hash of file content using the same method as upload
        const fileBuffer = file.buffer;
        const contentHash = crypto.SHA256(fileBuffer.toString('base64')).toString();
        
        // Create a bytes32 hash for comparison (take first 32 bytes)
        const blockchainHash = '0x' + contentHash.substring(0, 64);
        
        console.log(`Generated hash for ${file.originalname}: ${blockchainHash}`);
        
        // Find matching document on blockchain
        const matchingDocument = blockchainHashes.find(doc => 
          doc.hash.toLowerCase() === blockchainHash.toLowerCase()
        );

        if (matchingDocument) {
          verificationResults.push({
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            computedHash: blockchainHash,
            blockchainHash: matchingDocument.hash,
            isVerified: true,
            status: "VERIFIED",
            message: "Document hash matches blockchain record",
            blockchainRecord: {
              timestamp: matchingDocument.timestamp,
              timestampFormatted: new Date(matchingDocument.timestamp * 1000).toISOString(),
              addedBy: matchingDocument.addedBy
            }
          });
          
          console.log(`✅ Document ${file.originalname} verified successfully`);
        } else {
          unverifiedFiles.push({
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            computedHash: blockchainHash,
            isVerified: false,
            status: "NOT_FOUND",
            message: "Document hash not found in blockchain records"
          });
          
          console.log(`❌ Document ${file.originalname} not found on blockchain`);
        }
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        unverifiedFiles.push({
          fileName: file.originalname,
          isVerified: false,
          status: "ERROR",
          message: `Error processing file: ${fileError.message}`
        });
      }
    }

    // Prepare comprehensive response
    const totalFiles = req.files.length;
    const verifiedCount = verificationResults.length;
    const unverifiedCount = unverifiedFiles.length;

    const response = {
      success: true,
      message: `Verification complete: ${verifiedCount} verified, ${unverifiedCount} unverified out of ${totalFiles} files`,
      data: {
        employeeAddress: address,
        totalFilesSubmitted: totalFiles,
        totalBlockchainDocuments: blockchainDocuments.length,
        verificationSummary: {
          totalVerified: verifiedCount,
          totalUnverified: unverifiedCount,
          verificationRate: totalFiles > 0 ? ((verifiedCount / totalFiles) * 100).toFixed(1) + '%' : '0%'
        },
        verifiedDocuments: verificationResults,
        unverifiedDocuments: unverifiedFiles,
        blockchainDocuments: blockchainHashes
      }
    };

    console.log(`📊 Verification summary: ${verifiedCount}/${totalFiles} documents verified`);

    res.json(response);

  } catch (error) {
    console.error("❌ Error during document verification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

export default app;
