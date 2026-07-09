import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const TIMEOUT_MS = parseInt(process.env.CODE_EXEC_TIMEOUT_MS || '5000', 10);

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTimeMs: number;
}

/**
 * Safely executes JavaScript code in an isolated child process.
 * - Runs with restricted permissions (no file system, no network access via VM)
 * - Hard timeout kills the process if it exceeds TIMEOUT_MS
 * - Captures stdout and stderr separately
 */
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = Date.now();

  // Wrap user code in a sandboxed VM context
  const sandboxedCode = `
const vm = require('vm');
const context = {
  console: {
    log: (...args) => process.stdout.write(args.map(a => String(a)).join(' ') + '\\n'),
    error: (...args) => process.stderr.write(args.map(a => String(a)).join(' ') + '\\n'),
    warn: (...args) => process.stdout.write('[WARN] ' + args.map(a => String(a)).join(' ') + '\\n'),
  },
  Math, JSON, parseInt, parseFloat, isNaN, isFinite,
  Array, Object, String, Number, Boolean, Date, RegExp,
  setTimeout: undefined, setInterval: undefined, setImmediate: undefined,
  require: undefined, process: undefined, global: undefined,
};
vm.createContext(context);
try {
  const result = vm.runInContext(${JSON.stringify(code)}, context, {
    timeout: ${TIMEOUT_MS - 500},
    filename: 'usercode.js',
  });
  if (result !== undefined) process.stdout.write(String(result) + '\\n');
} catch(e) {
  process.stderr.write(e.message + '\\n');
  process.exit(1);
}
`;

  // Write to temp file
  const tmpFile = path.join(os.tmpdir(), `nri_exec_${Date.now()}.js`);
  fs.writeFileSync(tmpFile, sandboxedCode, 'utf8');

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(process.execPath, [tmpFile], {
      timeout: TIMEOUT_MS,
      env: {}, // Empty env — no access to system env vars
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > 100_000) child.kill('SIGKILL'); // Output limit: 100KB
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      // Cleanup temp file
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }

      resolve({
        stdout: stdout.slice(0, 50_000),  // Trim output
        stderr: stderr.slice(0, 10_000),
        exitCode: exitCode ?? 1,
        timedOut,
        executionTimeMs: Date.now() - startTime,
      });
    });
  });
}
