// Add grid coordinates to Find a Grave records JSON file
// Run with: node add_grid_coordinates.js

const fs = require('fs');
const path = require('path');

function parseSectionToGrid(sectionStr) {
    if (!sectionStr) return null;
    
    sectionStr = String(sectionStr).trim().toUpperCase();
    
    // Remove "Section" prefix
    sectionStr = sectionStr.replace(/^SECTION\s*/i, '');
    sectionStr = sectionStr.replace(/^SEC\s*/i, '');
    
    // Handle numeric sections like "139B" -> row 139, sub-row B
    const match = sectionStr.match(/^(\d+)([A-Z])?$/);
    if (match) {
        const num = parseInt(match[1]);
        const letter = match[2];
        if (letter) {
            // Convert letter to number (A=1, B=2, etc.)
            const letterNum = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
            return num * 100 + letterNum;
        }
        return num * 100;
    }
    
    // Handle pure letter sections (A, B, C, etc.)
    if (sectionStr.length === 1 && /[A-Z]/.test(sectionStr)) {
        return sectionStr.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }
    
    // Handle numeric only
    if (/^\d+$/.test(sectionStr)) {
        return parseInt(sectionStr) * 100;
    }
    
    // Default: use hash for unknown formats
    let hash = 0;
    for (let i = 0; i < sectionStr.length; i++) {
        hash = ((hash << 5) - hash) + sectionStr.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % 1000;
}

function parsePlotToGrid(plotStr) {
    if (!plotStr) return null;
    
    plotStr = String(plotStr).trim();
    
    // Extract numbers from plot string
    const numbers = plotStr.match(/\d+/);
    if (numbers) {
        return parseInt(numbers[0]);
    }
    
    // If no numbers, use hash
    let hash = 0;
    for (let i = 0; i < plotStr.length; i++) {
        hash = ((hash << 5) - hash) + plotStr.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash) % 100;
}

function addGridCoordinates(inputFile, outputFile) {
    if (!outputFile) outputFile = inputFile;
    
    console.log(`Reading ${inputFile}...`);
    const data = fs.readFileSync(inputFile, 'utf8');
    const records = JSON.parse(data);
    
    console.log(`Processing ${records.length} records...`);
    let updated = 0;
    
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Parse plot info if available
        const plotInfo = record.plot || null;
        let section = null;
        let plotNumber = null;
        
        if (plotInfo) {
            // Try to extract section and plot from plot string
            const sectionMatch = String(plotInfo).match(/section\s*([A-Z0-9]+)/i);
            if (sectionMatch) {
                section = sectionMatch[1];
            }
            
            const plotMatch = String(plotInfo).match(/(?:plot|space)\s*([A-Z0-9]+)/i);
            if (plotMatch) {
                plotNumber = plotMatch[1];
            }
        }
        
        // Calculate grid coordinates
        const gridY = section ? parseSectionToGrid(section) : null;
        const gridX = plotNumber ? parsePlotToGrid(plotNumber) : null;
        
        // Add grid coordinates to record
        if (gridX !== null || gridY !== null) {
            record.gridX = gridX;
            record.gridY = gridY;
            updated++;
        }
        
        // Also store parsed section and plot for reference
        if (section) {
            record.section = section;
        }
        if (plotNumber) {
            record.plotNumber = plotNumber;
        }
    }
    
    console.log(`Added grid coordinates to ${updated} records`);
    
    console.log(`Writing to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(records, null, 4), 'utf8');
    
    console.log('Done!');
    return updated;
}

// Run if called directly
if (require.main === module) {
    const scriptDir = __dirname;
    const inputFile = path.join(scriptDir, 'findagrave_records_complete.json');
    
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: ${inputFile} not found!`);
        process.exit(1);
    }
    
    addGridCoordinates(inputFile);
}

module.exports = { addGridCoordinates, parseSectionToGrid, parsePlotToGrid };

