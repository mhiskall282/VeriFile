// Configuration exports
export { corsConfig } from './config/cors.js';
export { selfBackendVerifier } from './config/selfVerifier.js';

// Route exports
export { default as authRoutes } from './routes/auth.js';
export { default as selfRoutes } from './routes/self.js';
export { default as healthRoutes } from './routes/health.js';

// Service exports
export { startupTasks } from './services/startupService.js';

// Main app export
export { default as app } from './app.js';