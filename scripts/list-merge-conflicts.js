const { execSync } = require('node:child_process');

const [branchA, branchB] = process.argv.slice(2);

if (!branchA || !branchB) {
  console.error('Usage: node scripts/list-merge-conflicts.js <branch-a> <branch-b>');
  process.exit(1);
}

function runGit(command, errorMessage) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(errorMessage);
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    process.exit(error.status ?? 1);
  }
}

const base = runGit(`git merge-base ${branchA} ${branchB}`, `Unable to find merge base between "${branchA}" and "${branchB}".`);

const mergeTreeOutput = runGit(`git merge-tree ${base} ${branchA} ${branchB}`, 'Failed to compute merge-tree output.');

const conflicts = new Set();
let currentPath = null;

const basePathPattern = /^\s+base\s+\d+\s+[0-9a-f]{40}\s+(.+)$/i;
const conflictStartPattern = /^[+ ]*<<<<<<< \.our/;
const separatorPattern = /^\s*[-]{10,}\s*$/;

for (const line of mergeTreeOutput.split(/\r?\n/)) {
  if (basePathPattern.test(line)) {
    const match = line.match(basePathPattern);
    currentPath = match ? match[1].trim() : null;
    continue;
  }

  if (conflictStartPattern.test(line) && currentPath) {
    conflicts.add(currentPath);
    continue;
  }

  if (separatorPattern.test(line) || line.startsWith('changed in')) {
    currentPath = null;
  }
}

if (conflicts.size === 0) {
  console.log(`No textual merge conflicts detected between "${branchA}" and "${branchB}".`);
  process.exit(0);
}

console.log(`Textual merge conflicts between "${branchA}" and "${branchB}":`);
for (const filePath of Array.from(conflicts).sort()) {
  console.log(` - ${filePath}`);
}
