# UDML Server

The server component of the UDML system, responsible for processing Figma design data and converting it to semantic XML.

## Overview

This server application:

- Receives raw Figma JSON and screenshots from the Figma plugin
- Cleans and simplifies the Figma data structure
- Analyzes components to detect user-defined properties and variants
- Identifies repeated patterns and converts them to components
- Extracts and exports images and vector graphics
- Transforms the processed data into semantic XML
- Exposes API endpoints for the UI component

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (optional, depending on storage requirements)

### Installation

From the repository root:

```bash
# Install all dependencies (including this workspace)
npm install

# OR, install just this workspace's dependencies
cd server
npm install
```

### Development 

```bash
# From repository root
npm run dev:server

# OR, from this directory
npm run dev
```

### Building for Production

```bash
# From repository root
npm run build:server

# OR, from this directory
npm run build
```

### Running in Production

```bash
# From repository root
npm run start:server

# OR, from this directory
npm start
```

## Server Architecture

- Built with Express.js and TypeScript
- Follows MVC architecture with controllers and services
- Uses middleware for authentication, logging, and error handling
- Implements feature flags for controlled feature rollout

## API Endpoints

- `POST /api/process`: Process raw Figma data
- `GET /api/results/:id`: Retrieve processed results
- Other endpoints documented in the API docs (see `/docs/api`)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Feature Flags

The server uses feature flags for trunk-based development and A/B testing:

```javascript
const { isEnabled, FEATURES } = require('../../scripts/shared/feature-flags');

if (isEnabled(FEATURES.ENABLE_COMPONENT_DIFF)) {
  // New feature code
}
```

---

For more information about the overall project, see the main [README.md](../README.md) in the repository root. 