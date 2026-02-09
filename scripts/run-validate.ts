import path from 'path';
import validate from './validate';

const appsDir = path.join(process.cwd(), 'data', 'apps');
validate(appsDir).catch(() => {
  // The validate function already logs errors, so we just catch to prevent unhandled rejection
  process.exit(1); // Ensure exit with error code if validate throws
});
