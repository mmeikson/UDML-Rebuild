# UDML UI

The UI component of the UDML system, responsible for displaying the generated XML and design screenshots.

## Overview

This UI application:

- Displays the XML generated from Figma designs
- Shows the original design screenshot for reference
- Provides a download option for the XML
- Implements syntax highlighting for easier readability
- Offers controls for viewing different sections of the XML

## Development Setup

### Prerequisites

- Node.js 18+

### Installation

From the repository root:

```bash
# Install all dependencies (including this workspace)
npm install

# OR, install just this workspace's dependencies
cd ui
npm install
```

### Development 

```bash
# From repository root
npm run dev:ui

# OR, from this directory
npm run dev
```

### Building for Production

```bash
# From repository root
npm run build:ui

# OR, from this directory
npm run build
```

## UI Architecture

- Built with React and TypeScript using Vite
- Uses CSS modules for styling
- Implements feature flags for controlled feature rollout
- Communicates with the server API to fetch XML and image data

## Component Structure

- `src/App.tsx`: Main application component
- `src/components/`: UI components (XML viewer, image preview, etc.)
- `src/hooks/`: Custom React hooks
- `src/services/`: API communication services

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Feature Flags

The UI uses feature flags for trunk-based development and A/B testing:

```javascript
import { isEnabled, FEATURES } from '../../scripts/shared/feature-flags';

function MyComponent() {
  return (
    <div>
      {isEnabled(FEATURES.ENABLE_AI_SUGGESTIONS) && (
        <AISuggestions />
      )}
    </div>
  );
}
```

---

For more information about the overall project, see the main [README.md](../README.md) in the repository root. 