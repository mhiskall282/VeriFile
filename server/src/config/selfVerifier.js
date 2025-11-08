import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core';
import dotenv from 'dotenv';

dotenv.config();

// Read configuration from environment with sensible defaults
const SELF_SCOPE = process.env.SELF_APP_SCOPE || 'verifile-app';
const SELF_ENDPOINT = process.env.SELF_VERIFIER_ENDPOINT || 'https://crystallographic-unpendulously-teri.ngrok-free.dev/api/self';
const SELF_MOCK_PASSPORT = (process.env.SELF_MOCK_PASSPORT || 'true') === 'true';
const USER_ID_TYPE = process.env.SELF_USER_ID_TYPE || 'hex';

// Initialize SelfBackendVerifier with configuration matching the frontend
export const selfBackendVerifier = new SelfBackendVerifier(
  SELF_SCOPE,
  SELF_ENDPOINT,
  SELF_MOCK_PASSPORT,
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false,
  }),
  USER_ID_TYPE
);