import path from 'path';
import checkLinksScript from './check-links';

const appsDir = path.join(process.cwd(), 'data', 'apps');

checkLinksScript(appsDir).catch(() => {
  // The checkLinksScript function already logs errors, so we just catch to prevent unhandled rejection
  process.exit(1); // Ensure exit with error code if checkLinksScript throws
});
