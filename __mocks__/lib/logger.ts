// This file will be automatically used by Jest when it encounters `import logger from '../lib/logger'`

// Define a type for the mock logger instance
interface MockLoggerInstance {
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  debug: jest.Mock;
  trace: jest.Mock;
  child: jest.Mock;
}

// Declare mockLogger early so mockChild can reference it
let mockLogger: MockLoggerInstance;

// Explicitly define the mock functions
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockInfo = jest.fn();
const mockDebug = jest.fn();
const mockTrace = jest.fn();

// Mock the child function - simplified type
const mockChild = jest.fn(() => mockLogger);

mockLogger = {
  error: mockError,
  warn: mockWarn,
  info: mockInfo,
  debug: mockDebug,
  trace: mockTrace,
  child: mockChild,
};

export default mockLogger;
