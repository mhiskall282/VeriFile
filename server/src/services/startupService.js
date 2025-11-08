import { registerEmployee } from '../utils/contractUtils.js';

// Startup function to register employee
export async function startupTasks() {
    console.log('Running startup tasks...');
    
    // Employee address to register on startup
    const employeeAddress = '0x5f191149e519B7536E68D178Ff1F07037bbC9F93';
    
    try {
        // Register the employee using fluence backend
        const result = await registerEmployee(employeeAddress);
        
        if (result.success) {
            console.log(`✅ Successfully registered employee ${employeeAddress} on startup`);
        } else {
            console.log(`⚠️ Failed to register employee on startup: ${result.error}`);
            // Note: This might fail if employee is already registered, which is expected
        }
    } catch (error) {
        console.error('❌ Error during startup employee registration:', error);
    }
    
    console.log('Startup tasks completed.');
}