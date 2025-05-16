const { MCP } = require('task-master-ai');

const config = {
  port: 3000,
  debug: true,
  logLevel: 'debug',
  servers: {
    taskmaster: {
      command: 'npx',
      args: ['--package=task-master-ai', 'task-master-ai'],
      env: {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        MODEL: 'claude-3-7-sonnet-20250219',
        MAX_TOKENS: 64000,
        TEMPERATURE: 0.2,
        DEFAULT_SUBTASKS: 5,
        DEFAULT_PRIORITY: 'medium'
      }
    }
  }
};

const mcp = new MCP(config);
mcp.start().catch(console.error);
