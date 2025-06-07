const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class FileManager {
    constructor(baseDir = path.join(__dirname, '..', 'files')) {
        this.baseDir = baseDir;
        this.initializeDirectory();
    }

    async initializeDirectory() {
        try {
            await fs.mkdir(this.baseDir, { recursive: true });
            logger.info(`Initialized file directory at ${this.baseDir}`);
        } catch (error) {
            logger.error('Failed to initialize file directory:', error);
            throw new Error('Failed to initialize file system');
        }
    }

    async createFile(filename, content) {
        try {
            // Validate filename
            if (!this.isValidFilename(filename)) {
                throw new Error('Invalid filename');
            }

            const filePath = path.join(this.baseDir, filename);
            
            // Check if file already exists
            try {
                await fs.access(filePath);
                throw new Error('File already exists');
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            // Write file
            await fs.writeFile(filePath, content, 'utf8');
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
            const content = await fs.readFile(filePath, 'utf8');
            const stats = await fs.stat(filePath);

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
            
            // Check if file exists before deletion
            try {
                await fs.access(filePath);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    throw new Error('File not found');
                }
                throw error;
            }

            await fs.unlink(filePath);
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
            const files = await fs.readdir(this.baseDir);
            const fileDetails = await Promise.all(
                files.map(async (filename) => {
                    const filePath = path.join(this.baseDir, filename);
                    const stats = await fs.stat(filePath);
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
        // Basic filename validation
        const validFilenameRegex = /^[a-zA-Z0-9-_\.]+$/;
        return validFilenameRegex.test(filename) && 
               filename.length > 0 && 
               filename.length <= 255 &&
               !filename.includes('..') && // Prevent directory traversal
               !filename.startsWith('.') && // Prevent hidden files
               !filename.includes('/') && // Prevent path manipulation
               !filename.includes('\\');
    }
}

module.exports = new FileManager(); 