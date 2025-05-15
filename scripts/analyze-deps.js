#!/usr/bin/env node

/**
 * UDML Dependency Analyzer
 * 
 * This script analyzes the project dependencies and generates visual
 * dependency graphs for easier understanding of code relationships.
 * 
 * Usage:
 *   node scripts/analyze-deps.js [workspace]
 *   node scripts/analyze-deps.js --validate
 * 
 * Arguments:
 *   workspace - Optional specific workspace to analyze (figma-plugin, server, ui)
 *   --validate - Run validation only, used in pre-commit hooks
 * 
 * Examples:
 *   node scripts/analyze-deps.js             # Analyze all workspaces
 *   node scripts/analyze-deps.js server      # Analyze only server workspace
 *   node scripts/analyze-deps.js --validate  # Validate dependencies without generating reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const workspaces = ['figma-plugin', 'server', 'ui'];
const validateOnly = process.argv.includes('--validate');
const targetWorkspace = validateOnly ? null : process.argv[2];
const validWorkspaces = targetWorkspace ? [targetWorkspace] : workspaces;

// Invalid dependency patterns to check
const INVALID_DEPENDENCIES = [
  { from: 'ui', to: 'server', message: 'UI components should not directly import from server code' },
  { from: 'figma-plugin', to: 'server', message: 'Figma plugin should not directly import from server code' },
  { from: 'server', to: 'ui', message: 'Server code should not import from UI components' },
  { from: 'server', to: 'figma-plugin', message: 'Server code should not import from Figma plugin' }
];

// Check if the specified workspace is valid
if (targetWorkspace && !workspaces.includes(targetWorkspace) && targetWorkspace !== '--validate') {
  console.error(`Invalid workspace: ${targetWorkspace}`);
  console.error(`Valid workspaces are: ${workspaces.join(', ')}`);
  process.exit(1);
}

// Create output directory if not in validate-only mode
if (!validateOnly) {
  const outputDir = path.join(__dirname, '..', 'docs', 'dependencies');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log('Analyzing project dependencies...');
}

// Function to validate dependencies
function validateDependencies() {
  console.log('Validating dependencies...');
  let hasErrors = false;

  try {
    // Run dependency cruiser in validate mode
    execSync('npx depcruise --config .dependency-cruiser.js --output-type err figma-plugin/src server/src ui/src', 
      { stdio: 'pipe' });
    console.log('✅ No invalid dependencies found!');
    return true;
  } catch (error) {
    console.error('❌ Invalid dependencies detected:');
    console.error(error.stdout.toString());
    return false;
  }
}

// If validate only, just run validation and exit
if (validateOnly) {
  const valid = validateDependencies();
  process.exit(valid ? 0 : 1);
}

// Process each workspace for analysis
validWorkspaces.forEach(workspace => {
  const srcDir = path.join(__dirname, '..', workspace, 'src');
  
  // Skip if the src directory doesn't exist
  if (!fs.existsSync(srcDir)) {
    console.warn(`Warning: Source directory for ${workspace} not found. Skipping.`);
    return;
  }
  
  console.log(`\nAnalyzing ${workspace}...`);
  
  try {
    // Generate a dependency graph image using madge
    const outputDir = path.join(__dirname, '..', 'docs', 'dependencies');
    const svgOutput = path.join(outputDir, `${workspace}-dependency-graph.svg`);
    console.log(`Generating dependency graph for ${workspace}...`);
    execSync(`npx madge --image ${svgOutput} --extensions ts,tsx ${srcDir}`, 
      { stdio: 'inherit' });
    
    // Generate a detailed dependency report using dependency-cruiser
    const jsonOutput = path.join(outputDir, `${workspace}-dependency-report.json`);
    const htmlOutput = path.join(outputDir, `${workspace}-dependency-report.html`);
    console.log(`Generating detailed dependency report for ${workspace}...`);
    execSync(
      `npx depcruise --include-only "^src" --output-type json ${srcDir} > ${jsonOutput}`,
      { stdio: 'inherit' }
    );
    execSync(
      `npx depcruise --include-only "^src" --output-type html ${srcDir} > ${htmlOutput}`,
      { stdio: 'inherit' }
    );
    
    console.log(`✅ ${workspace} analysis complete!`);
    console.log(`   - SVG Graph: ${svgOutput}`);
    console.log(`   - HTML Report: ${htmlOutput}`);
    console.log(`   - JSON Data: ${jsonOutput}`);
  } catch (error) {
    console.error(`Error analyzing ${workspace}:`, error.message);
  }
});

console.log('\nDependency analysis complete! View reports in the docs/dependencies directory.');

// Also run validation as part of the full analysis
validateDependencies(); 