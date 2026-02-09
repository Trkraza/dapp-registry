import path from 'path';
import checkLinksScript from './check-links';

const appsDir = path.join(process.cwd(), 'data', 'apps');

// Get command-line arguments, excluding 'node' and the script path
const slugsToProcess = process.argv.slice(2);

checkLinksScript(appsDir, slugsToProcess.length > 0 ? slugsToProcess : undefined).catch(() => {
  // The checkLinksScript function already logs errors, so we just catch to prevent unhandled rejection
  process.exit(1); // Ensure exit with error code if checkLinksScript throws
});
