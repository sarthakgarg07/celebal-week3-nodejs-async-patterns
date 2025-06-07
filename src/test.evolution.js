const { FileManagerCallback, FileManagerPromise, FileManagerAsync } = require('./fileManager.evolution');
const logger = require('./logger');

// =============================================
// Test Callback Version
// =============================================
function testCallbackVersion() {
    console.log('\n=== Testing Callback Version ===\n');
    const fileManager = new FileManagerCallback();

    // Create a file
    fileManager.createFile('test1.txt', 'Hello from callback version!', (error, result) => {
        if (error) {
            console.error('Callback Create Error:', error.message);
            return;
        }
        console.log('Callback Create Success:', result);

        // Read the file
        fileManager.readFile('test1.txt', (error, result) => {
            if (error) {
                console.error('Callback Read Error:', error.message);
                return;
            }
            console.log('Callback Read Success:', result);

            // List files
            fileManager.listFiles((error, files) => {
                if (error) {
                    console.error('Callback List Error:', error.message);
                    return;
                }
                console.log('Callback List Success:', files);

                // Delete the file
                fileManager.deleteFile('test1.txt', (error, result) => {
                    if (error) {
                        console.error('Callback Delete Error:', error.message);
                        return;
                    }
                    console.log('Callback Delete Success:', result);
                });
            });
        });
    });
}

// =============================================
// Test Promise Version
// =============================================
function testPromiseVersion() {
    console.log('\n=== Testing Promise Version ===\n');
    const fileManager = new FileManagerPromise();

    // Create a file
    fileManager.createFile('test2.txt', 'Hello from promise version!')
        .then(result => {
            console.log('Promise Create Success:', result);
            return fileManager.readFile('test2.txt');
        })
        .then(result => {
            console.log('Promise Read Success:', result);
            return fileManager.listFiles();
        })
        .then(files => {
            console.log('Promise List Success:', files);
            return fileManager.deleteFile('test2.txt');
        })
        .then(result => {
            console.log('Promise Delete Success:', result);
        })
        .catch(error => {
            console.error('Promise Error:', error.message);
        });
}

// =============================================
// Test Async/Await Version
// =============================================
async function testAsyncVersion() {
    console.log('\n=== Testing Async/Await Version ===\n');
    const fileManager = new FileManagerAsync();

    try {
        // Create a file
        const createResult = await fileManager.createFile('test3.txt', 'Hello from async/await version!');
        console.log('Async Create Success:', createResult);

        // Read the file
        const readResult = await fileManager.readFile('test3.txt');
        console.log('Async Read Success:', readResult);

        // List files
        const files = await fileManager.listFiles();
        console.log('Async List Success:', files);

        // Delete the file
        const deleteResult = await fileManager.deleteFile('test3.txt');
        console.log('Async Delete Success:', deleteResult);
    } catch (error) {
        console.error('Async Error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    // Test callback version
    testCallbackVersion();

    // Wait a bit before starting promise version
    await new Promise(resolve => setTimeout(resolve, 2000));
    testPromiseVersion();

    // Wait a bit before starting async version
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testAsyncVersion();
}

// Run the tests
runAllTests().catch(error => {
    console.error('Test Error:', error);
}); 