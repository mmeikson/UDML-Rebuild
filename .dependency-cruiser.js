/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed as they make code difficult to understand and maintain',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Files without any incoming or outgoing dependencies might indicate dead code',
      from: {
        orphan: true,
        pathNot: [
          '\\.(json|d\\.ts)$',
          '(^|/)types\\.ts$',
          '(^|/)index\\.tsx?$',
          '(^|/)main\\.tsx?$'
        ]
      },
      to: {}
    },
    {
      name: 'no-ui-to-server',
      severity: 'error',
      comment: 'UI components should not directly import from server code',
      from: {
        path: '^ui/src'
      },
      to: {
        path: '^server/'
      }
    },
    {
      name: 'no-figma-to-server',
      severity: 'error',
      comment: 'Figma plugin should not directly import from server code',
      from: {
        path: '^figma-plugin/src'
      },
      to: {
        path: '^server/'
      }
    },
    {
      name: 'no-server-to-ui',
      severity: 'error',
      comment: 'Server code should not import from UI components',
      from: {
        path: '^server/src'
      },
      to: {
        path: '^ui/'
      }
    },
    {
      name: 'no-server-to-figma',
      severity: 'error',
      comment: 'Server code should not import from Figma plugin',
      from: {
        path: '^server/src'
      },
      to: {
        path: '^figma-plugin/'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm',
        'npm-dev',
        'npm-optional',
        'npm-peer',
        'npm-bundled',
        'npm-no-pkg'
      ]
    },
    exclude: {
      path: [
        '\\.d\\.ts$',
        '\\.json$',
        '\\.spec\\.(js|ts|tsx)$',
        '\\.test\\.(js|ts|tsx)$',
        '/__mocks__/',
        '/__tests__/',
        '/dist/',
        '/build/',
        '/coverage/'
      ]
    },
    includeOnly: {
      path: [
        '^figma-plugin/src',
        '^server/src',
        '^ui/src'
      ]
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['main', 'types', 'typings']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
        theme: {
          graph: { rankdir: 'TD' },
          modules: [
            {
              criteria: { source: '\\.tsx?$' },
              attributes: { fillcolor: '#ffccff' }
            },
            {
              criteria: { source: '\\.jsx?$' },
              attributes: { fillcolor: '#ccffcc' }
            }
          ],
          dependencies: [
            {
              criteria: { resolved: '\\.json$' },
              attributes: { color: '#ff0000' }
            }
          ]
        }
      },
      archi: {
        collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/(@[^/]+/[^/]+|[^/]+)'
      }
    }
  }
}; 