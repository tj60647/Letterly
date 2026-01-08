/**
 * @file jest.setup.ts
 * @description Jest setup file for configuring test environment
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.GOOGLE_API_KEY = 'test-google-key';
