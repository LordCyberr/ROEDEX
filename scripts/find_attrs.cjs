const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/components');
const attrs = ['title', 'placeholder', 'content'];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    attrs.forEach(attr => {
        const regex = new RegExp(attr + '="([A-Z][^"]+)"', 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            console.log(file + ' --- ' + attr + ' --- ' + match[1]);
        }
    });
});
