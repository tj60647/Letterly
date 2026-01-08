/**
 * @file e2e/README.md
 * @description Guide for running end-to-end tests with MCP browser automation
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

# End-to-End Testing with MCP Browser Automation

This directory contains E2E tests that use Model Context Protocol (MCP) browser automation tools powered by Playwright.

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   ```
   Server should be running on http://localhost:3000

2. **MCP Browser Server Enabled**
   The MCP browser tools must be active in your environment

3. **API Keys Configured**
   - `OPENROUTER_API_KEY` in `.env.local`
   - `GOOGLE_API_KEY` in `.env.local` (optional, for image generation)

## Running E2E Tests

### Option 1: Manual Execution (Recommended for now)

The tests in `custom-instructions.e2e.ts` are currently placeholders with detailed TODO comments. To execute them:

1. Start the dev server: `npm run dev`
2. Open the test file: `e2e/custom-instructions.e2e.ts`
3. Follow the implementation guide at the bottom of the file
4. Use MCP browser tools to interact with the application

### Option 2: Automated Execution (Future)

Once tests are fully implemented:

```bash
npm run test:e2e
```

## Test Coverage

### Custom Agent Instructions (`custom-instructions.e2e.ts`)

Tests the complete workflow for customizing AI agent system instructions:

✅ **Default State**
- Opens Writers' Room modal
- Verifies default instructions display
- Checks no modified indicators

✅ **Edit Workflow**
- Clicks gear icon to enter edit mode
- Modifies instruction text
- Saves changes
- Verifies visual feedback (yellow background, blue icon)

✅ **Persistence**
- Refreshes page
- Verifies custom instruction persists in localStorage
- Confirms visual indicators remain

✅ **Execution**
- Fills letter form
- Generates letter
- Validates custom instruction affects output
- Checks for custom signature ("Cheerio!")

✅ **Reset**
- Opens edit mode
- Clicks reset button
- Verifies restoration to default
- Confirms visual indicators cleared

✅ **Generation After Reset**
- Generates new letter
- Verifies custom instruction no longer affects output

## MCP Browser Tools Reference

### Navigation
```typescript
await mcp_mcp_docker_browser_navigate({ url: 'http://localhost:3000' });
```

### Get Page Structure
```typescript
const snapshot = await mcp_mcp_docker_browser_snapshot();
// Parse snapshot to find element refs
```

### Click Elements
```typescript
await mcp_mcp_docker_browser_click({
  element: "Writers' Room button",
  ref: "[ref-from-snapshot]"
});
```

### Type Text
```typescript
await mcp_mcp_docker_browser_type({
  element: "instruction textarea",
  ref: "[ref-from-snapshot]",
  text: "Custom instruction text",
  slowly: false
});
```

### Wait for Changes
```typescript
await mcp_mcp_docker_browser_wait_for({ time: 2 }); // seconds
```

### Take Screenshots
```typescript
await mcp_mcp_docker_browser_take_screenshot({
  filename: 'test-result.png'
});
```

## Writing New E2E Tests

1. Create new test file: `e2e/[feature-name].e2e.ts`
2. Import MCP browser tool types
3. Follow the test structure pattern from `custom-instructions.e2e.ts`
4. Add detailed TODO comments for implementation
5. Update this README with new test descriptions

## Troubleshooting

### Tests Fail to Start
- Verify dev server is running: `curl http://localhost:3000`
- Check MCP browser tools are available
- Ensure port 3000 is not blocked

### Element Not Found
- Take a snapshot to inspect element refs
- Verify CSS selectors match actual DOM
- Check if element is in viewport (may need to scroll)

### Timeouts
- Increase wait times for slow operations
- Check network tab for API call delays
- Verify API keys are configured

### Persistence Tests Fail
- Clear localStorage before tests: `localStorage.clear()`
- Check browser storage in DevTools
- Verify localStorage key matches: `letterly-custom-instructions`

## CI/CD Integration (Future)

Once tests are implemented, add to GitHub Actions:

```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    sleep 5
    npm run test:e2e
```
