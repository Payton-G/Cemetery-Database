// Script to fix nickname encoding issues and format names properly
// This script fixes encoding issues (â€œ and â€) and formats names correctly

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'findagrave_records_complete.json');

// Read the JSON file
let data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

console.log(`Processing ${data.length} records...`);

// Fix encoding issues and format names
let fixedCount = 0;
data = data.map(record => {
    let originalName = record.name;
    let fixedName = originalName;
    
    // Fix encoding issues: â€œ to " and â€ to "
    fixedName = fixedName.replace(/â€œ/g, '"');
    fixedName = fixedName.replace(/â€/g, '"');
    
    // Fix specific known issues:
    // "Charley" should be "Charles" (common nickname)
    if (fixedName.includes('Charley Ralph Bishop')) {
        fixedName = fixedName.replace('Charley', 'Charles');
    }
    
    // Fix names with rank prefixes that should be separated
    fixedName = fixedName.replace(/^Sp4(?=[A-Z])/g, 'Sp4 ');
    fixedName = fixedName.replace(/^EN2(?=[A-Z])/g, 'EN2 ');
    fixedName = fixedName.replace(/^Lieut(?=[A-Z])/g, 'Lieut ');
    
    // Fix names without spaces (like "AnnBieriCox")
    fixedName = fixedName.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    if (originalName !== fixedName) {
        console.log(`Fixed: "${originalName}" -> "${fixedName}"`);
        fixedCount++;
        record.name = fixedName;
    }
    
    return record;
});

console.log(`\nFixed ${fixedCount} records.`);

// Write back to file
fs.writeFileSync(jsonFile, JSON.stringify(data, null, 4) + '\n', 'utf8');
console.log(`File updated: ${jsonFile}`);

