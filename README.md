# Node.js File Management Tool

A robust and efficient file management tool built using Node.js core modules. This application provides a RESTful API for managing files on the server, demonstrating best practices in Node.js development.

## Important Note About Dependencies

The `node_modules` directory has been excluded from the repository due to its large size. This is a common practice in Node.js projects. To get started, you'll need to install the dependencies first.

## Features

- Create new files with custom content
- Read file contents
- Delete files
- Secure file operations with proper error handling
- Comprehensive logging system
- RESTful API endpoints
- Input validation and sanitization

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies (this will create the node_modules directory):
   ```bash
   npm install
   ```
   This step is necessary because the `node_modules` directory is not included in the repository. The installation process will:
   - Read the dependencies from package.json
   - Create a new `node_modules` directory
   - Install all required packages
   - Generate package-lock.json (if it doesn't exist)

3. Start the server:
   ```bash
   npm start
   ```
   
For development with auto-reload:
```bash
npm run dev
```

## Why node_modules is Excluded

The `node_modules` directory is excluded from the repository because:
- It can be very large (often hundreds of MB)
- It can be recreated using package.json
- It may contain platform-specific binaries
- It's considered a best practice to exclude it from version control

If you need to share this project:
1. Share the code without `node_modules`
2. Include package.json and package-lock.json
3. Recipients can run `npm install` to get all dependencies

## API Endpoints

### Create File
- **POST** `/api/files`
- **Body**: 
  ```json
  {
    "filename": "example.txt",
    "content": "File content here"
  }
  ```
- **Response**: 201 Created with file details

### Read File
- **GET** `/api/files/:filename`
- **Response**: 200 OK with file content

### Delete File
- **DELETE** `/api/files/:filename`
- **Response**: 200 OK on successful deletion

## Error Handling

The application implements comprehensive error handling for:
- File not found (404)
- Invalid input (400)
- Server errors (500)
- File system errors
- Permission issues

## Logging

All operations are logged using Winston logger, providing:
- Operation timestamps
- Request details
- Error tracking
- Success confirmations

## Security Features

- Input sanitization
- Path traversal prevention
- File size limits
- Proper error messages without sensitive information

## Testing

Run tests using:
```bash
npm test
```

## Project Structure

```
├── src/
│   ├── server.js          # Main server file
│   ├── fileManager.js     # File operations module
│   ├── logger.js          # Logging configuration
│   └── utils/
│       └── validators.js  # Input validation utilities
├── tests/                 # Test files
├── logs/                  # Application logs
├── package.json
└── README.md
```
