const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const allJsFiles = walk(path.resolve(__dirname, '..'));

allJsFiles.forEach(file => {
    if (file === __filename) return;
    let content = fs.readFileSync(file, 'utf8');

    const newContent = content
        .replace(/require\(['"]\.\.\/mongoose\.models\//g, "require('../models/")
        .replace(/require\(['"]\.\/mongoose\.models\//g, "require('./models/")
        .replace(/require\(['"]\.\.\/routers\//g, "require('../routes/")
        .replace(/require\(['"]\.\/routers\//g, "require('./routes/")
        .replace(/require\(['"]\.\.\/mongoose\.models['"]/g, "require('../models')")
        .replace(/require\(['"]\.\/mongoose\.models['"]/g, "require('./models')")
        .replace(/require\(['"]\.\.\/routers['"]/g, "require('../routes')")
        .replace(/require\(['"]\.\/routers['"]/g, "require('./routes')');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated imports in ${file}`);
    }
});
