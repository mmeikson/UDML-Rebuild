# UDML - User Design Markup Language

A system that converts raw Figma designs into semantic XML for AI coding assistants.

## Project Overview

UDML extracts design information from Figma and transforms it into a structured XML format that can be easily interpreted by AI coding assistants. This bridge between design and development helps streamline the implementation process.

The system consists of three main components:

1. **Figma Plugin**: Allows designers to select a frame and extract its complete data structure including components, styles, and variables.
2. **Server Application**: Processes the raw Figma JSON, removes unnecessary data, detects components and patterns, and transforms it into semantic XML.
3. **Display UI**: Shows the generated XML alongside the original design for reference and validation.

## Repository Structure

```
udml/
├── figma-plugin/    # Figma plugin code
├── server/          # Backend processing application
└── ui/              # Results display interface
```

## Getting Started

### Prerequisites

- Node.js 18+
- Figma Desktop app (for plugin development)
- Figma Developer account

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/udml.git
   cd udml
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For Figma plugin development, follow the [Figma Plugin Development Guide](https://www.figma.com/plugin-docs/).

## Key Features

- Extract complete JSON node hierarchy from Figma frames
- Clean and simplify Figma's verbose JSON structure
- Detect component instances and their relationships
- Identify repeated patterns and convert them to components
- Generate data arrays for component instances
- Export images and vector graphics with proper references
- Replace direct values with variable references
- Transform processed data into clean, semantic XML
- Display results with side-by-side comparison

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 