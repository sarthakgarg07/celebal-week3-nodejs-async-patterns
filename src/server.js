const http = require('http');
const url = require('url');
const logger = require('./logger');
const fileManager = require('./fileManager');

const PORT = process.env.PORT || 3000;

// Helper function to parse request body
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}

// Helper function to handle errors
function handleError(res, error) {
    logger.error('Request error:', error);
    
    const statusCode = error.message === 'File not found' ? 404 :
                      error.message === 'Invalid filename' ? 400 :
                      error.message === 'File already exists' ? 409 :
                      error.message === 'Invalid JSON' ? 400 : 500;
    
    sendJsonResponse(res, statusCode, {
        error: error.message || 'Internal Server Error',
        status: statusCode
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    
    // Log request
    logger.info(`${req.method} ${path}`);

    try {
        // API Routes
        if (path.startsWith('/api/files')) {
            // Handle file operations
            if (req.method === 'POST' && path === '/api/files') {
                // Create file
                const body = await parseBody(req);
                if (!body.filename || !body.content) {
                    throw new Error('Filename and content are required');
                }
                const result = await fileManager.createFile(body.filename, body.content);
                sendJsonResponse(res, 201, result);
            }
            else if (req.method === 'GET' && path === '/api/files') {
                // List all files
                const files = await fileManager.listFiles();
                sendJsonResponse(res, 200, { files });
            }
            else if (req.method === 'GET' && path.startsWith('/api/files/')) {
                // Read file
                const filename = path.split('/').pop();
                const file = await fileManager.readFile(filename);
                sendJsonResponse(res, 200, file);
            }
            else if (req.method === 'DELETE' && path.startsWith('/api/files/')) {
                // Delete file
                const filename = path.split('/').pop();
                const result = await fileManager.deleteFile(filename);
                sendJsonResponse(res, 200, result);
            }
            else {
                throw new Error('Method not allowed');
            }
        }
        else if (path === '/health') {
            // Health check endpoint
            sendJsonResponse(res, 200, { status: 'healthy' });
        }
        else {
            throw new Error('Not found');
        }
    } catch (error) {
        handleError(res, error);
    }
});

// Error handling for the server
server.on('error', (error) => {
    logger.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

// Start server
server.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
    logger.info('Available endpoints:');
    logger.info('  POST   /api/files     - Create a new file');
    logger.info('  GET    /api/files     - List all files');
    logger.info('  GET    /api/files/:id - Read a file');
    logger.info('  DELETE /api/files/:id - Delete a file');
    logger.info('  GET    /health        - Health check');
}); 