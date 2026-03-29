const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

let mainWindow;
let serverProcess;
const PORT = 3456;

// Get the path to the bundled FFmpeg binary
function getBundledFFmpegDir() {
  // In packaged app, extra resources are in the resources directory
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'ffmpeg');
  }
  // In dev, use the system FFmpeg
  return null;
}

// Set up environment with FFmpeg in PATH
function getEnv() {
  const env = { ...process.env, PORT: String(PORT) };
  const ffmpegDir = getBundledFFmpegDir();
  if (ffmpegDir && fs.existsSync(ffmpegDir)) {
    // Prepend bundled FFmpeg to PATH
    const sep = process.platform === 'win32' ? ';' : ':';
    env.PATH = ffmpegDir + sep + (env.PATH || '');
  }
  return env;
}

// Get the path to the Next.js standalone server
function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', 'server.js');
  }
  // In dev, run next dev
  return null;
}

// Ensure storage directories exist
function ensureStorageDirs() {
  const base = app.isPackaged
    ? path.join(app.getPath('userData'), 'storage')
    : path.join(__dirname, '..', 'storage');

  const dirs = [
    path.join(base, 'backgrounds'),
    path.join(base, 'output'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return base;
}

// Check if a port is available
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Wait for the server to be ready
function waitForServer(port, maxWait = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = net.createConnection({ port }, () => {
        req.end();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > maxWait) {
          reject(new Error('Server failed to start within 30 seconds'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function startServer() {
  const storageDir = ensureStorageDirs();
  const env = getEnv();
  env.STORAGE_DIR = storageDir;

  // Load .env from userData if it exists (for API keys)
  const envPath = path.join(app.getPath('userData'), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        env[key] = val;
      }
    }
  }

  // Check if required env vars are set
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_URL) {
    // First launch — ask user for setup
    await showSetupDialog();
    return startServer(); // retry after setup
  }

  const serverPath = getServerPath();

  if (serverPath) {
    // Production: run the standalone server
    serverProcess = spawn('node', [serverPath], {
      env,
      cwd: path.dirname(serverPath),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } else {
    // Dev: run next dev
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    serverProcess = spawn(npx, ['next', 'dev', '-p', String(PORT)], {
      env,
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }

  serverProcess.stdout?.on('data', (data) => {
    console.log('[server]', data.toString());
  });
  serverProcess.stderr?.on('data', (data) => {
    console.error('[server]', data.toString());
  });
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  await waitForServer(PORT);
}

async function showSetupDialog() {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'LyricVision — First Time Setup',
    message: 'Welcome to LyricVision!\n\nYou need to configure your API keys before first use.\n\nA config file will be created at:\n' + path.join(app.getPath('userData'), '.env'),
    buttons: ['Create Config File', 'Quit'],
  });

  if (result.response === 1) {
    app.quit();
    return;
  }

  // Create a template .env file
  const envPath = path.join(app.getPath('userData'), '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `# LyricVision Configuration
# Get a free Pexels API key at https://www.pexels.com/api/
PEXELS_API_KEY=

# Supabase credentials (create a free project at https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
`, 'utf-8');
  }

  // Open the file in the default editor
  const { shell } = require('electron');
  await shell.openPath(envPath);

  await dialog.showMessageBox({
    type: 'info',
    title: 'Edit Your Config',
    message: 'Fill in your API keys in the config file that just opened.\n\nSave it, then click OK to continue.',
    buttons: ['OK'],
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'LyricVision',
    backgroundColor: '#09090b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox(
      'LyricVision Error',
      `Failed to start: ${err.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
