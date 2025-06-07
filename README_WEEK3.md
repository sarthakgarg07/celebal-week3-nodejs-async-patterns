# Week 3: Node.js Async Patterns Evolution

Demonstrates the evolution of Node.js asynchronous patterns through three implementations of a file manager.

## Quick Overview

**File:** `src/week3_async_patterns_evolution.js`

**What's Inside:**
- Callback-based implementation (Original Node.js pattern)
- Promise-based implementation (ES6 pattern)
- Async/Await implementation (Modern pattern)

## Key Implementations

### 1. Callbacks (Traditional)
```javascript
createFile(filename, content, callback) {
    fs.writeFile(filePath, content, 'utf8', (error) => {
        if (error) callback(error);
        else callback(null, result);
    });
}
```

### 2. Promises (ES6)
```javascript
createFile(filename, content) {
    return fs.writeFile(filePath, content, 'utf8')
        .then(() => result)
        .catch(error => { throw error; });
}
```

### 3. Async/Await (Modern)
```javascript
async createFile(filename, content) {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        return result;
    } catch (error) { throw error; }
}
```

## Why This Matters

1. **Learning Value:**
   - Shows evolution of Node.js async patterns
   - Demonstrates same functionality in different styles
   - Highlights modern best practices

2. **Practical Applications:**
   - Callbacks: Still found in legacy code
   - Promises: Common in many libraries
   - Async/Await: Current best practice

## How to Test

```bash
# Test all implementations
npm test

# Test specific pattern
npm test -- --grep "Callback"  # For callback version
npm test -- --grep "Promise"   # For promise version
npm test -- --grep "Async"     # For async/await version
```

## Key Features Implemented
- File operations (create, read, delete, list)
- Error handling for each pattern
- Input validation
- Security measures
- Logging system
