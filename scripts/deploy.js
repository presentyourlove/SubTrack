const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distDir = path.resolve(__dirname, '../dist');
const repoUrl = 'https://github.com/Presentyourlove/SubTrack.git';

console.log(`Deploying to ${repoUrl} from ${distDir}...`);

try {
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run predeploy" first.');
  }

  // Copy canvaskit.wasm to dist root to fix 404s
  const wasmSource = path.resolve(__dirname, '../node_modules/canvaskit-wasm/bin/canvaskit.wasm');
  const wasmDest = path.join(distDir, 'canvaskit.wasm');

  if (fs.existsSync(wasmSource)) {
    console.log(`Copying canvaskit.wasm from ${wasmSource} to ${wasmDest}...`);
    fs.copyFileSync(wasmSource, wasmDest);
  } else {
    console.warn(
      `Warning: canvaskit.wasm not found at ${wasmSource}. Skia Web might fail to load.`,
    );
  }

  const exec = (cmd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: distDir });
  };

  // Initialize git repo in dist
  const gitDir = path.join(distDir, '.git');
  if (fs.existsSync(gitDir)) {
    console.log('Cleaning existing .git directory...');
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
  exec('git init');

  // Verify .git exists
  if (fs.existsSync(gitDir)) {
    console.log('.git directory created successfully at ' + gitDir);
  } else {
    throw new Error('.git directory NOT created!');
  }

  // Helper for running git commands with explicit paths
  const runGit = (args) => {
    console.log(`> git ${args}`);
    execSync(`git --git-dir=.git --work-tree=. ${args}`, { stdio: 'inherit', cwd: distDir });
  };

  // Set git user identity (required for commit)
  runGit('config user.name "jasonwth"');
  runGit('config user.email "jasonwth0928@gmail.com"');

  // Configure remote
  try {
    runGit('remote remove origin');
  } catch (e) {
    // Ignore error if remote doesn't exist
  }
  runGit(`remote add origin ${repoUrl}`);

  // Switch to gh-pages branch (orphan to avoid history issues)
  runGit('checkout -B gh-pages');

  // Add and commit
  runGit('add -A');
  runGit('commit -m "Deploy website"');

  // Push
  console.log('Pushing to GitHub...');
  runGit('push -f origin gh-pages');

  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout.toString());
  if (error.stderr) console.error('stderr:', error.stderr.toString());
  process.exit(1);
}
