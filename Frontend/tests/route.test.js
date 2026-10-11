const assert = require('assert');

const vm = require('vm');
const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'js', 'app.js');
const source = fs.readFileSync(appPath, 'utf8');

const sandbox = {
  window: {
    location: { hash: '#/dashboard' },
    addEventListener: () => {},
    history: { pushState: () => {}, replaceState: () => {} }
  },
  document: {
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {},
    querySelector: () => null
  },
  console,
  setTimeout,
  clearTimeout,
  Date,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  navigator: { userAgent: 'node' }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.document.window = sandbox.window;

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

try {
  assert.strictEqual(sandbox.buildRoutePath('dashboard'), '#/dashboard');
  assert.strictEqual(sandbox.buildRoutePath('master', 'customers'), '#/master/customers');
  const masterRoute = sandbox.parseRoute('#/master/vendors');
  assert.strictEqual(masterRoute.section, 'master');
  assert.strictEqual(masterRoute.tab, 'vendors');
  const loanRoute = sandbox.parseRoute('#/loan');
  assert.strictEqual(loanRoute.section, 'loan');
  assert.strictEqual(loanRoute.tab, null);
  console.log('Route tests passed');
} catch (error) {
  console.error('Route tests failed');
  console.error(error.message);
  process.exit(1);
}
