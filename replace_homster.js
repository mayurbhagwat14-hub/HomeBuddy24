const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const excludeDirs = ['.git', 'node_modules', 'dist', 'build', '.idea', '.vscode'];
const excludeExts = ['.jpg', '.jpeg', '.png', '.webp', '.ico', '.svg', '.mp4', '.pdf', '.zip', '.tar', '.gz'];

// Replaces occurrences inside text files
function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (excludeExts.includes(ext)) return;

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return; // might be binary or unreadable
    }

    let modified = false;

    const regexOptions = [
        { regex: /Homster/g, replacement: 'Homebuddy' },
        { regex: /homster/g, replacement: 'homebuddy' },
        { regex: /HOMSTER/g, replacement: 'HOMEBUDDY' }
    ];

    let newContent = content;
    for (const opt of regexOptions) {
        if (opt.regex.test(newContent)) {
            newContent = newContent.replace(opt.regex, opt.replacement);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated content in: ${filePath}`);
    }
}

// Renames files and directories
function processRenames(currentPath) {
    let stat;
    try {
        stat = fs.lstatSync(currentPath);
    } catch (e) {
        return;
    }

    if (stat.isDirectory()) {
        const basename = path.basename(currentPath);
        if (excludeDirs.includes(basename)) return;

        let files = fs.readdirSync(currentPath);
        
        // Process children first (bottom-up)
        for (const file of files) {
            processRenames(path.join(currentPath, file));
        }

        // Rename this directory if needed
        if (basename.toLowerCase().includes('homster')) {
            const newName = basename
                .replace(/Homster/g, 'Homebuddy')
                .replace(/homster/g, 'homebuddy')
                .replace(/HOMSTER/g, 'HOMEBUDDY');
            const newPath = path.join(path.dirname(currentPath), newName);
            fs.renameSync(currentPath, newPath);
            console.log(`Renamed dir: ${currentPath} -> ${newPath}`);
        }
    } else if (stat.isFile()) {
        processFile(currentPath);

        const basename = path.basename(currentPath);
        if (basename.toLowerCase().includes('homster')) {
            const newName = basename
                .replace(/Homster/g, 'Homebuddy')
                .replace(/homster/g, 'homebuddy')
                .replace(/HOMSTER/g, 'HOMEBUDDY');
            const newPath = path.join(path.dirname(currentPath), newName);
            fs.renameSync(currentPath, newPath);
            console.log(`Renamed file: ${currentPath} -> ${newPath}`);
        }
    }
}

console.log('Starting search and replace...');
processRenames(path.join(rootDir, 'Backend'));
processRenames(path.join(rootDir, 'Frontend'));
console.log('Finished.');
