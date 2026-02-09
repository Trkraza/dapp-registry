import path from 'path';
import distill from './distill';

const appsDir = path.join(process.cwd(), 'data', 'apps');
const dataDir = path.join(process.cwd(), 'data'); // Assuming dataDir is also relative to CWD

distill(appsDir, dataDir).catch(() => {
  // The distill function already logs errors, so we just catch to prevent unhandled rejection
  process.exit(1); // Ensure exit with error code if distill throws
});
