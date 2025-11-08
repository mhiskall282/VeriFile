import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { keccak256, encodePacked } from "viem";

describe("WorkHistory Contract", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  // Test accounts
  let owner: any;
  let trustedOrg1: any;
  let trustedOrg2: any;
  let trustedOrg3: any;
  let newOrg: any;
  let employee: any;
  let fluenceBackend: any;
  let accounts: any[];

  // Contract instance
  let workHistory: any;
  
  // Sample organizations for constructor
  const constructorOrgs: Array<{
    orgName: string;
    orgWebsite: string;
    physicalAddress: string;
    orgWalletAddress: `0x${string}`;
  }> = [
    {
      orgName: "TechCorp Inc",
      orgWebsite: "https://techcorp.com",
      physicalAddress: "123 Tech Street, Silicon Valley, CA",
      orgWalletAddress: "0x0000000000000000000000000000000000000000" as `0x${string}` // Will be replaced with actual address
    },
    {
      orgName: "InnovateLabs",
      orgWebsite: "https://innovatelabs.io", 
      physicalAddress: "456 Innovation Blvd, Austin, TX",
      orgWalletAddress: "0x0000000000000000000000000000000000000000" as `0x${string}` // Will be replaced with actual address
    },
    {
      orgName: "VerifiedCorp",
      orgWebsite: "https://verifiedcorp.com", 
      physicalAddress: "789 Verified Way, Seattle, WA",
      orgWalletAddress: "0x0000000000000000000000000000000000000000" as `0x${string}` // Will be replaced with actual address
    }
  ];

  beforeEach(async function () {
    // Get test accounts
    accounts = await viem.getWalletClients();
    owner = accounts[0];
    trustedOrg1 = accounts[1];
    trustedOrg2 = accounts[2];
    trustedOrg3 = accounts[3];
    newOrg = accounts[4];
    employee = accounts[5];
    fluenceBackend = accounts[6];

    // Update constructor orgs with actual addresses
    constructorOrgs[0].orgWalletAddress = trustedOrg1.account.address;
    constructorOrgs[1].orgWalletAddress = trustedOrg2.account.address;
    constructorOrgs[2].orgWalletAddress = trustedOrg3.account.address;

    // Deploy contract
    workHistory = await viem.deployContract("WorkHistory", [constructorOrgs, fluenceBackend.account.address]);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const contractOwner = await workHistory.read.owner();
      assert.equal(contractOwner.toLowerCase(), owner.account.address.toLowerCase());
    });

    it("Should set the correct fluence backend address", async function () {
      const backendAddress = await workHistory.read.fluenceBackendAddress();
      assert.equal(backendAddress.toLowerCase(), fluenceBackend.account.address.toLowerCase());
    });

    it("Should initialize constructor organizations as trusted", async function () {
      const org1 = await workHistory.read.organizations([trustedOrg1.account.address]);
      const org2 = await workHistory.read.organizations([trustedOrg2.account.address]);
      const org3 = await workHistory.read.organizations([trustedOrg3.account.address]);
      
      assert.equal(org1[0], "TechCorp Inc"); // orgName
      assert.equal(org1[4], true); // isTrusted
      assert.equal(org1[5], true); // isFromConstructor
      
      assert.equal(org2[0], "InnovateLabs"); // orgName
      assert.equal(org2[4], true); // isTrusted
      assert.equal(org2[5], true); // isFromConstructor
      
      assert.equal(org3[0], "VerifiedCorp"); // orgName
      assert.equal(org3[4], true); // isTrusted
      assert.equal(org3[5], true); // isFromConstructor
    });

    it("Should emit OrganizationAdded and OrganizationTrusted events during deployment", async function () {
      const deploymentBlockNumber = await publicClient.getBlockNumber();
      
      const addedEvents = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationAdded",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const trustedEvents = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationTrusted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(addedEvents.length, 3);
      assert.equal(trustedEvents.length, 3);
    });
  });

  describe("Organization Management", function () {
    it("Should allow owner to add new organization", async function () {
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.addOrganization([newOrgData]);
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationAdded",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[0], "StartupXYZ");
      assert.equal(org[4], false); // not trusted yet
      assert.equal(org[5], false); // not from constructor
    });

    it("Should allow trusted organization to add new organization", async function () {
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      await workHistory.write.addOrganization([newOrgData], {
        account: trustedOrg1.account
      });

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[0], "StartupXYZ");
    });

    it("Should not allow unauthorized users to add organization", async function () {
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com", 
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      try {
        await workHistory.write.addOrganization([newOrgData], {
          account: employee.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Not authorized"));
      }
    });

    it("Should not allow adding duplicate organization", async function () {
      const newOrgData = {
        orgName: "StartupXYZ", 
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      await workHistory.write.addOrganization([newOrgData]);
      
      try {
        await workHistory.write.addOrganization([newOrgData]);
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Organization already exists"));
      }
    });
  });

  describe("Organization Verification", function () {
    beforeEach(async function () {
      // Add a new organization to verify
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY", 
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);
    });

    it("Should allow trusted organization to verify new organization", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationVerified",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const verificationCount = await workHistory.read.getVerificationCount([newOrg.account.address]);
      assert.equal(verificationCount, 1n);

      const hasVerified = await workHistory.read.hasVerified([newOrg.account.address, trustedOrg1.account.address]);
      assert.equal(hasVerified, true);
    });

    it("Should trust organization after reaching verification threshold", async function () {
      // Now we have 3 trusted organizations from constructor, so we can verify newOrg directly
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg2.account
      });
      
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg3.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationTrusted",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[4], true); // isTrusted should be true
    });

    it("Should not allow untrusted organization to verify", async function () {
      try {
        await workHistory.write.verifyOrganization([newOrg.account.address], {
          account: employee.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only trusted organizations can verify"));
      }
    });

    it("Should not allow double verification from same organization", async function () {
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });

      try {
        await workHistory.write.verifyOrganization([newOrg.account.address], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Already verified by this organization"));
      }
    });
  });

  describe("Employee Management", function () {
    it("Should allow trusted organization to register employee", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "EmployeeRegistered",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const isRegistered = await workHistory.read.registeredEmployees([employee.account.address]);
      assert.equal(isRegistered, true);
    });

    it("Should not allow untrusted organization to register employee", async function () {
      try {
        await workHistory.write.registerEmployee([employee.account.address], {
          account: newOrg.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only Fluence Backend"));
      }
    });
  });

  describe("Document Management", function () {
    const documentHash = keccak256(encodePacked(["string"], ["Sample Document Content"]));

    beforeEach(async function () {
      // Register employee first
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
    });

    it("Should allow trusted organization to add document for registered employee", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.addDocument([employee.account.address, documentHash], {
        account: trustedOrg1.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "DocumentAdded",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const documents = await workHistory.read.getUserDocuments([employee.account.address]);
      assert.equal(documents.length, 1);
      assert.equal(documents[0].documentHash, documentHash); // documentHash
      assert.equal(documents[0].addedBy.toLowerCase(), trustedOrg1.account.address.toLowerCase()); // addedBy
    });

    it("Should not allow untrusted organization to add document", async function () {
      try {
        await workHistory.write.addDocument([employee.account.address, documentHash], {
          account: newOrg.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only trusted organizations can add documents"));
      }
    });

    it("Should not allow adding document for unregistered employee", async function () {
      try {
        await workHistory.write.addDocument([accounts[7].account.address, documentHash], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Employee not registered"));
      }
    });

    it("Should return empty array for user with no documents", async function () {
      const documents = await workHistory.read.getUserDocuments([accounts[7].account.address]);
      assert.equal(documents.length, 0);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Add a pending organization
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);
    });

    it("Should return pending organizations", async function () {
      const pendingOrgs = await workHistory.read.getPendingOrganizations();
      assert.equal(pendingOrgs.length, 1);
      assert.equal(pendingOrgs[0].toLowerCase(), newOrg.account.address.toLowerCase());
    });

    it("Should return correct verification count", async function () {
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });

      const count = await workHistory.read.getVerificationCount([newOrg.account.address]);
      assert.equal(count, 1n);
    });

    it("Should return correct verification status", async function () {
      const hasVerifiedBefore = await workHistory.read.hasVerified([newOrg.account.address, trustedOrg1.account.address]);
      assert.equal(hasVerifiedBefore, false);

      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });

      const hasVerifiedAfter = await workHistory.read.hasVerified([newOrg.account.address, trustedOrg1.account.address]);
      assert.equal(hasVerifiedAfter, true);
    });
  });

  describe("Owner Functions", function () {
    beforeEach(async function () {
      // Add a non-constructor organization
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com", 
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);
    });

    it("Should allow owner to remove non-constructor organization", async function () {
      await workHistory.write.removeOrganization([newOrg.account.address]);

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[0], ""); // orgName should be empty after deletion
    });

    it("Should not allow owner to remove constructor organization", async function () {
      try {
        await workHistory.write.removeOrganization([trustedOrg1.account.address]);
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Cannot remove constructor organizations"));
      }
    });

    it("Should not allow non-owner to remove organization", async function () {
      try {
        await workHistory.write.removeOrganization([newOrg.account.address], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only owner"));
      }
    });
  });

  describe("Constants and Thresholds", function () {
    it("Should have correct verification threshold", async function () {
      const threshold = await workHistory.read.VERIFICATION_THRESHOLD();
      assert.equal(threshold, 3n);
    });
  });

  describe("Fluence Backend Functions", function () {
    beforeEach(async function () {
      // Add a new organization to verify
      const newOrgData = {
        orgName: "StartupXYZ",
        orgWebsite: "https://startupxyz.com",
        physicalAddress: "789 Startup Ave, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);
    });

    it("Should allow fluence backend to verify organization on behalf of trusted org", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.verifyOrganizationOnBehalf([trustedOrg1.account.address, newOrg.account.address], {
        account: fluenceBackend.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationVerified",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);
      assert.equal((events[0] as any).args.orgAddress.toLowerCase(), newOrg.account.address.toLowerCase());
      assert.equal((events[0] as any).args.verifiedBy.toLowerCase(), trustedOrg1.account.address.toLowerCase());

      const verificationCount = await workHistory.read.getVerificationCount([newOrg.account.address]);
      assert.equal(verificationCount, 1n);
    });

    it("Should trust organization after fluence backend verifies on behalf of enough orgs", async function () {
      // Verify with 3 organizations via fluence backend
      await workHistory.write.verifyOrganizationOnBehalf([trustedOrg1.account.address, newOrg.account.address], {
        account: fluenceBackend.account
      });
      await workHistory.write.verifyOrganizationOnBehalf([trustedOrg2.account.address, newOrg.account.address], {
        account: fluenceBackend.account
      });
      
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.verifyOrganizationOnBehalf([trustedOrg3.account.address, newOrg.account.address], {
        account: fluenceBackend.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationTrusted",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[4], true); // isTrusted should be true
    });

    it("Should not allow non-fluence backend to verify on behalf", async function () {
      try {
        await workHistory.write.verifyOrganizationOnBehalf([trustedOrg1.account.address, newOrg.account.address], {
          account: owner.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only Fluence Backend"));
      }
    });

    it("Should not allow verification on behalf if voter org is not trusted", async function () {
      try {
        await workHistory.write.verifyOrganizationOnBehalf([newOrg.account.address, trustedOrg1.account.address], {
          account: fluenceBackend.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Voter organization must be trusted"));
      }
    });

    it("Should allow fluence backend to register employee", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "EmployeeRegistered",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);

      const isRegistered = await workHistory.read.registeredEmployees([employee.account.address]);
      assert.equal(isRegistered, true);
    });

    it("Should not allow non-fluence backend to register employee", async function () {
      try {
        await workHistory.write.registerEmployee([employee.account.address], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only Fluence Backend"));
      }
    });
  });

  describe("Advanced View Functions", function () {
    const documentHash1 = keccak256(encodePacked(["string"], ["Document 1 Content"]));
    const documentHash2 = keccak256(encodePacked(["string"], ["Document 2 Content"]));
    
    beforeEach(async function () {
      // Register employees
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
      await workHistory.write.registerEmployee([accounts[7].account.address], {
        account: fluenceBackend.account
      });

      // Add documents
      await workHistory.write.addDocument([employee.account.address, documentHash1], {
        account: trustedOrg1.account
      });
      await workHistory.write.addDocument([employee.account.address, documentHash2], {
        account: trustedOrg2.account
      });
      await workHistory.write.addDocument([accounts[7].account.address, documentHash1], {
        account: trustedOrg1.account
      });
    });

    it("Should return all initial organizations", async function () {
      const initialOrgs = await workHistory.read.getAllInitialOrganizationIds();
      assert.equal(initialOrgs.length, 3);
      assert.equal(initialOrgs[0].orgName, "TechCorp Inc"); // orgName
      assert.equal(initialOrgs[1].orgName, "InnovateLabs"); // orgName
      assert.equal(initialOrgs[2].orgName, "VerifiedCorp"); // orgName
    });

    it("Should return comprehensive user data", async function () {
      const [userData, isRegistered] = await workHistory.read.getUsersData([employee.account.address]);
      
      assert.equal(isRegistered, true);
      assert.equal(userData.length, 2); // Two documents
      
      // Check first document
      assert.equal(userData[0].documents.length, 1);
      assert.equal(userData[0].documents[0].documentHash, documentHash1);
      assert.equal(userData[0].documents[0].addedBy.toLowerCase(), trustedOrg1.account.address.toLowerCase());
      assert.equal(userData[0].organizationsThatAdded.length, 1);
      assert.equal(userData[0].organizationsThatAdded[0].orgName, "TechCorp Inc"); // orgName
      
      // Check second document
      assert.equal(userData[1].documents.length, 1);
      assert.equal(userData[1].documents[0].documentHash, documentHash2);
      assert.equal(userData[1].documents[0].addedBy.toLowerCase(), trustedOrg2.account.address.toLowerCase());
      assert.equal(userData[1].organizationsThatAdded.length, 1);
      assert.equal(userData[1].organizationsThatAdded[0].orgName, "InnovateLabs"); // orgName
    });

    it("Should return empty data for unregistered user", async function () {
      const [userData, isRegistered] = await workHistory.read.getUsersData([accounts[8].account.address]);
      
      assert.equal(isRegistered, false);
      assert.equal(userData.length, 0);
    });

    it("Should return organization's past added documents", async function () {
      const [orgDocuments, correspondingUsers] = await workHistory.read.getOrganizationsPastAddedDocuments([trustedOrg1.account.address]);
      
      assert.equal(orgDocuments.length, 2); // trustedOrg1 added 2 documents
      assert.equal(correspondingUsers.length, 2);
      
      // Check both documents were added by trustedOrg1
      assert.equal(orgDocuments[0].addedBy.toLowerCase(), trustedOrg1.account.address.toLowerCase());
      assert.equal(orgDocuments[1].addedBy.toLowerCase(), trustedOrg1.account.address.toLowerCase());
      
      // One document for employee, one for accounts[7]
      const userAddresses = correspondingUsers.map((addr: any) => addr.toLowerCase());
      assert(userAddresses.includes(employee.account.address.toLowerCase()));
      assert(userAddresses.includes(accounts[7].account.address.toLowerCase()));
    });

    it("Should return empty arrays for organization with no documents", async function () {
      const [orgDocuments, correspondingUsers] = await workHistory.read.getOrganizationsPastAddedDocuments([trustedOrg3.account.address]);
      
      assert.equal(orgDocuments.length, 0);
      assert.equal(correspondingUsers.length, 0);
    });

    it("Should check if employee exists", async function () {
      const exists = await workHistory.read.checkIfEmployeeExists([employee.account.address]);
      const notExists = await workHistory.read.checkIfEmployeeExists([accounts[8].account.address]);
      
      assert.equal(exists, true);
      assert.equal(notExists, false);
    });

    it("Should check if organization exists", async function () {
      const exists = await workHistory.read.checkIfOrgExists([trustedOrg1.account.address]);
      const notExists = await workHistory.read.checkIfOrgExists([accounts[8].account.address]);
      
      assert.equal(exists, true);
      assert.equal(notExists, false);
    });

    it("Should fail to get documents for non-existent organization", async function () {
      try {
        await workHistory.read.getOrganizationsPastAddedDocuments([accounts[8].account.address]);
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Organization does not exist"));
      }
    });
  });

  describe("Advanced Owner Functions", function () {
    it("Should allow owner to add to initial organizations", async function () {
      const newInitialOrg = {
        orgName: "NewInitialOrg",
        orgWebsite: "https://newinitialorg.com",
        physicalAddress: "999 Initial St, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.addToInitialOrganizations([newInitialOrg]);
      
      const addedEvents = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationAdded",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });

      const trustedEvents = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "OrganizationTrusted",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });

      assert.equal(addedEvents.length, 1);
      assert.equal(trustedEvents.length, 1);

      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[0], "NewInitialOrg"); // orgName
      assert.equal(org[4], true); // isTrusted
      assert.equal(org[5], true); // isFromConstructor

      // Check it was added to initial organizations list
      const initialOrgs = await workHistory.read.getAllInitialOrganizationIds();
      assert.equal(initialOrgs.length, 4); // Now 4 instead of 3
    });

    it("Should not allow adding duplicate to initial organizations", async function () {
      const duplicateOrg = {
        orgName: "DuplicateOrg",
        orgWebsite: "https://duplicate.com",
        physicalAddress: "111 Duplicate St, NYC, NY",
        orgWalletAddress: trustedOrg1.account.address // Using existing address
      };

      try {
        await workHistory.write.addToInitialOrganizations([duplicateOrg]);
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Organization already exists"));
      }
    });

    it("Should allow owner to remove initial organization", async function () {
      const beforeBlockNumber = await publicClient.getBlockNumber();
      await workHistory.write.removeInitialOrganization([trustedOrg1.account.address]);
      
      const events = await publicClient.getContractEvents({
        address: workHistory.address,
        abi: workHistory.abi,
        eventName: "InitialOrganizationRemoved",
        fromBlock: beforeBlockNumber + 1n,
        strict: true,
      });
      
      assert.equal(events.length, 1);
      assert.equal((events[0] as any).args.orgAddress.toLowerCase(), trustedOrg1.account.address.toLowerCase());

      const org = await workHistory.read.organizations([trustedOrg1.account.address]);
      assert.equal(org[0], ""); // orgName should be empty after deletion

      // Check it was removed from initial organizations list
      const initialOrgs = await workHistory.read.getAllInitialOrganizationIds();
      assert.equal(initialOrgs.length, 2); // Now 2 instead of 3
    });

    it("Should not allow removing non-constructor organization via removeInitialOrganization", async function () {
      // Add a regular organization first
      const newOrgData = {
        orgName: "RegularOrg",
        orgWebsite: "https://regular.com",
        physicalAddress: "222 Regular St, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);

      try {
        await workHistory.write.removeInitialOrganization([newOrg.account.address]);
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only constructor organizations can be removed here"));
      }
    });

    it("Should not allow non-owner to add to initial organizations", async function () {
      const newInitialOrg = {
        orgName: "UnauthorizedOrg",
        orgWebsite: "https://unauthorized.com",
        physicalAddress: "333 Unauthorized St, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };

      try {
        await workHistory.write.addToInitialOrganizations([newInitialOrg], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only owner"));
      }
    });

    it("Should not allow non-owner to remove initial organization", async function () {
      try {
        await workHistory.write.removeInitialOrganization([trustedOrg1.account.address], {
          account: trustedOrg1.account
        });
        assert.fail("Should have thrown an error");
      } catch (error: any) {
        assert(error.message.includes("Only owner"));
      }
    });
  });

  describe("Edge Cases and Error Handling", function () {
    beforeEach(async function () {
      // Register employee for document tests
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
    });

    it("Should handle multiple employee registrations gracefully", async function () {
      // Register same employee multiple times
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });
      await workHistory.write.registerEmployee([employee.account.address], {
        account: fluenceBackend.account
      });

      const isRegistered = await workHistory.read.checkIfEmployeeExists([employee.account.address]);
      assert.equal(isRegistered, true);
    });

    it("Should handle getUsersData with multiple documents correctly", async function () {
      const doc1 = keccak256(encodePacked(["string"], ["Doc1"]));
      const doc2 = keccak256(encodePacked(["string"], ["Doc2"]));
      const doc3 = keccak256(encodePacked(["string"], ["Doc3"]));

      // Add multiple documents from different organizations
      await workHistory.write.addDocument([employee.account.address, doc1], {
        account: trustedOrg1.account
      });
      await workHistory.write.addDocument([employee.account.address, doc2], {
        account: trustedOrg2.account
      });
      await workHistory.write.addDocument([employee.account.address, doc3], {
        account: trustedOrg3.account
      });

      const [userData, isRegistered] = await workHistory.read.getUsersData([employee.account.address]);
      
      assert.equal(isRegistered, true);
      assert.equal(userData.length, 3);
      
      // Verify each document has correct structure
      for (let i = 0; i < userData.length; i++) {
        assert.equal(userData[i].documents.length, 1);
        assert.equal(userData[i].organizationsThatAdded.length, 1);
        assert(userData[i].documents[0].documentHash !== "0x0000000000000000000000000000000000000000000000000000000000000000");
        assert(userData[i].organizationsThatAdded[0].orgName.length > 0); // orgName should not be empty
      }
    });

    it("Should properly handle pending organization removal when verified", async function () {
      // Add organization (goes to pending)
      const newOrgData = {
        orgName: "PendingOrg",
        orgWebsite: "https://pending.com",
        physicalAddress: "444 Pending St, NYC, NY",
        orgWalletAddress: newOrg.account.address
      };
      await workHistory.write.addOrganization([newOrgData]);

      // Verify it's in pending
      let pendingOrgs = await workHistory.read.getPendingOrganizations();
      assert.equal(pendingOrgs.length, 1);

      // Verify with enough organizations to trust it
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg1.account
      });
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg2.account
      });
      await workHistory.write.verifyOrganization([newOrg.account.address], {
        account: trustedOrg3.account
      });

      // Verify it's no longer in pending
      pendingOrgs = await workHistory.read.getPendingOrganizations();
      assert.equal(pendingOrgs.length, 0);

      // Verify it's now trusted
      const org = await workHistory.read.organizations([newOrg.account.address]);
      assert.equal(org[4], true); // isTrusted
    });
  });
});
