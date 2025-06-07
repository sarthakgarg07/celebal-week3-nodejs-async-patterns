const fs = require('fs');  // For callback version
const fsPromises = require('fs').promises;  // For Promise/async version
const path = require('path');
const logger = require('./logger');

// =============================================
// Version 1: Callback-based Implementation
// =============================================
class FileManagerCallback {
    constructor(baseDir = path.join(__dirname, '..', 'files')) {
        this.baseDir = baseDir;
        this.initializeDirectory();
    }

    initializeDirectory(callback) {
        fs.mkdir(this.baseDir, { recursive: true }, (error) => {
            if (error) {
                logger.error('Failed to initialize file directory:', error);
                callback(new Error('Failed to initialize file system'));
                return;
            }
            logger.info(`Initialized file directory at ${this.baseDir}`);
            callback(null);
        });
    }

    createFile(filename, content, callback) {
        // Validate filename
        if (!this.isValidFilename(filename)) {
            callback(new Error('Invalid filename'));
            return;
        }

        const filePath = path.join(this.baseDir, filename);
        
        // Check if file exists
        fs.access(filePath, (error) => {
            if (!error) {
                callback(new Error('File already exists'));
                return;
            }
            if (error.code !== 'ENOENT') {
                callback(error);
                return;
            }

            // Write file
            fs.writeFile(filePath, content, 'utf8', (error) => {
                if (error) {
                    logger.error(`Error creating file ${filename}:`, error);
                    callback(error);
                    return;
                }
                logger.info(`Created file: ${filename}`);
                callback(null, {
                    filename,
                    path: filePath,
                    size: content.length,
                    created: new Date()
                });
            });
        });
    }

    readFile(filename, callback) {
        if (!this.isValidFilename(filename)) {
            callback(new Error('Invalid filename'));
            return;
        }

        const filePath = path.join(this.baseDir, filename);
        
        fs.readFile(filePath, 'utf8', (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    logger.warn(`File not found: ${filename}`);
                    callback(new Error('File not found'));
                    return;
                }
                logger.error(`Error reading file ${filename}:`, error);
                callback(error);
                return;
            }

            fs.stat(filePath, (error, stats) => {
                if (error) {
                    callback(error);
                    return;
                }
                logger.info(`Read file: ${filename}`);
                callback(null, {
                    filename,
                    content,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            });
        });
    }

    deleteFile(filename, callback) {
        if (!this.isValidFilename(filename)) {
            callback(new Error('Invalid filename'));
            return;
        }

        const filePath = path.join(this.baseDir, filename);
        
        // Check if file exists
        fs.access(filePath, (error) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    callback(new Error('File not found'));
                    return;
                }
                callback(error);
                return;
            }

            fs.unlink(filePath, (error) => {
                if (error) {
                    logger.error(`Error deleting file ${filename}:`, error);
                    callback(error);
                    return;
                }
                logger.info(`Deleted file: ${filename}`);
                callback(null, {
                    filename,
                    deleted: true,
                    timestamp: new Date()
                });
            });
        });
    }

    listFiles(callback) {
        fs.readdir(this.baseDir, (error, files) => {
            if (error) {
                logger.error('Error listing files:', error);
                callback(error);
                return;
            }

            // Need to get stats for each file
            let completed = 0;
            const fileDetails = [];
            let hasError = false;

            files.forEach(filename => {
                const filePath = path.join(this.baseDir, filename);
                fs.stat(filePath, (error, stats) => {
                    if (hasError) return;

                    if (error) {
                        hasError = true;
                        callback(error);
                        return;
                    }

                    fileDetails.push({
                        filename,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    });

                    completed++;
                    if (completed === files.length) {
                        logger.info('Listed all files');
                        callback(null, fileDetails);
                    }
                });
            });
        });
    }

    isValidFilename(filename) {
        const validFilenameRegex = /^[a-zA-Z0-9-_\.]+$/;
        return validFilenameRegex.test(filename) && 
               filename.length > 0 && 
               filename.length <= 255 &&
               !filename.includes('..') &&
               !filename.startsWith('.') &&
               !filename.includes('/') &&
               !filename.includes('\\');
    }
}

// =============================================
// Version 2: Promise-based Implementation
// =============================================
class FileManagerPromise {
    constructor(baseDir = path.join(__dirname, '..', 'files')) {
        this.baseDir = baseDir;
        this.initializeDirectory();
    }

    initializeDirectory() {
        return new Promise((resolve, reject) => {
            fs.mkdir(this.baseDir, { recursive: true }, (error) => {
                if (error) {
                    logger.error('Failed to initialize file directory:', error);
                    reject(new Error('Failed to initialize file system'));
                    return;
                }
                logger.info(`Initialized file directory at ${this.baseDir}`);
                resolve();
            });
        });
    }

    createFile(filename, content) {
        return new Promise((resolve, reject) => {
            if (!this.isValidFilename(filename)) {
                reject(new Error('Invalid filename'));
                return;
            }

            const filePath = path.join(this.baseDir, filename);
            
            fs.access(filePath, (error) => {
                if (!error) {
                    reject(new Error('File already exists'));
                    return;
                }
                if (error.code !== 'ENOENT') {
                    reject(error);
                    return;
                }

                fs.writeFile(filePath, content, 'utf8', (error) => {
                    if (error) {
                        logger.error(`Error creating file ${filename}:`, error);
                        reject(error);
                        return;
                    }
                    logger.info(`Created file: ${filename}`);
                    resolve({
                        filename,
                        path: filePath,
                        size: content.length,
                        created: new Date()
                    });
                });
            });
        });
    }

    readFile(filename) {
        return new Promise((resolve, reject) => {
            if (!this.isValidFilename(filename)) {
                reject(new Error('Invalid filename'));
                return;
            }

            const filePath = path.join(this.baseDir, filename);
            
            fs.readFile(filePath, 'utf8', (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        logger.warn(`File not found: ${filename}`);
                        reject(new Error('File not found'));
                        return;
                    }
                    logger.error(`Error reading file ${filename}:`, error);
                    reject(error);
                    return;
                }

                fs.stat(filePath, (error, stats) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    logger.info(`Read file: ${filename}`);
                    resolve({
                        filename,
                        content,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    });
                });
            });
        });
    }

    deleteFile(filename) {
        return new Promise((resolve, reject) => {
            if (!this.isValidFilename(filename)) {
                reject(new Error('Invalid filename'));
                return;
            }

            const filePath = path.join(this.baseDir, filename);
            
            fs.access(filePath, (error) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        reject(new Error('File not found'));
                        return;
                    }
                    reject(error);
                    return;
                }

                fs.unlink(filePath, (error) => {
                    if (error) {
                        logger.error(`Error deleting file ${filename}:`, error);
                        reject(error);
                        return;
                    }
                    logger.info(`Deleted file: ${filename}`);
                    resolve({
                        filename,
                        deleted: true,
                        timestamp: new Date()
                    });
                });
            });
        });
    }

    listFiles() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.baseDir, (error, files) => {
                if (error) {
                    logger.error('Error listing files:', error);
                    reject(error);
                    return;
                }

                const promises = files.map(filename => {
                    const filePath = path.join(this.baseDir, filename);
                    return new Promise((resolve, reject) => {
                        fs.stat(filePath, (error, stats) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve({
                                filename,
                                size: stats.size,
                                created: stats.birthtime,
                                modified: stats.mtime
                            });
                        });
                    });
                });

                Promise.all(promises)
                    .then(fileDetails => {
                        logger.info('Listed all files');
                        resolve(fileDetails);
                    })
                    .catch(reject);
            });
        });
    }

    isValidFilename(filename) {
        const validFilenameRegex = /^[a-zA-Z0-9-_\.]+$/;
        return validFilenameRegex.test(filename) && 
               filename.length > 0 && 
               filename.length <= 255 &&
               !filename.includes('..') &&
               !filename.startsWith('.') &&
               !filename.includes('/') &&
               !filename.includes('\\');
    }
}

// =============================================
// Version 3: Async/Await Implementation (Current)
// =============================================
class FileManagerAsync {
    constructor(baseDir = path.join(__dirname, '..', 'files')) {
        this.baseDir = baseDir;
        this.initializeDirectory();
    }

    async initializeDirectory() {
        try {
            await fsPromises.mkdir(this.baseDir, { recursive: true });
            logger.info(`Initialized file directory at ${this.baseDir}`);
        } catch (error) {
            logger.error('Failed to initialize file directory:', error);
            throw new Error('Failed to initialize file system');
        }
    }

    async createFile(filename, content) {
        try {
            if (!this.isValidFilename(filename)) {
                throw new Error('Invalid filename');
            }

            const filePath = path.join(this.baseDir, filename);
            
            try {
                await fsPromises.access(filePath);
                throw new Error('File already exists');
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            await fsPromises.writeFile(filePath, content, 'utf8');
            logger.info(`Created file: ${filename}`);
            
            return {
                filename,
                path: filePath,
                size: content.length,
                created: new Date()
            };
        } catch (error) {
            logger.error(`Error creating file ${filename}:`, error);
            throw error;
        }
    }

    async readFile(filename) {
        try {
            if (!this.isValidFilename(filename)) {
                throw new Error('Invalid filename');
            }

            const filePath = path.join(this.baseDir, filename);
            const content = await fsPromises.readFile(filePath, 'utf8');
            const stats = await fsPromises.stat(filePath);

            logger.info(`Read file: ${filename}`);
            
            return {
                filename,
                content,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            if (error.code === 'ENOENT') {
                logger.warn(`File not found: ${filename}`);
                throw new Error('File not found');
            }
            logger.error(`Error reading file ${filename}:`, error);
            throw error;
        }
    }

    async deleteFile(filename) {
        try {
            if (!this.isValidFilename(filename)) {
                throw new Error('Invalid filename');
            }

            const filePath = path.join(this.baseDir, filename);
            
            try {
                await fsPromises.access(filePath);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    throw new Error('File not found');
                }
                throw error;
            }

            await fsPromises.unlink(filePath);
            logger.info(`Deleted file: ${filename}`);
            
            return {
                filename,
                deleted: true,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error(`Error deleting file ${filename}:`, error);
            throw error;
        }
    }

    async listFiles() {
        try {
            const files = await fsPromises.readdir(this.baseDir);
            const fileDetails = await Promise.all(
                files.map(async (filename) => {
                    const filePath = path.join(this.baseDir, filename);
                    const stats = await fsPromises.stat(filePath);
                    return {
                        filename,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
            );

            logger.info('Listed all files');
            return fileDetails;
        } catch (error) {
            logger.error('Error listing files:', error);
            throw error;
        }
    }

    isValidFilename(filename) {
        const validFilenameRegex = /^[a-zA-Z0-9-_\.]+$/;
        return validFilenameRegex.test(filename) && 
               filename.length > 0 && 
               filename.length <= 255 &&
               !filename.includes('..') &&
               !filename.startsWith('.') &&
               !filename.includes('/') &&
               !filename.includes('\\');
    }
}

// Export all three versions
module.exports = {
    FileManagerCallback,
    FileManagerPromise,
    FileManagerAsync
}; 