// Import Find a Grave Records - Run this script to import records directly

// Find a Grave Veteran Records from Memorial Park Cemetery
// Source: https://www.findagrave.com/cemetery/635639/memorial-search?isVeteran=true
// Total: 335+ veteran records parsed from search results

// Find a Grave Records Structure:
// { name, birth, death, plot, imageUrl, findAGraveUrl, memorialId }
// Note: To import all 335 records, use the bulk JSON import feature in the Admin panel

const findAGraveRecords = [
    { name: "Paul William Addie", birth: "1908-01-05", death: "1990-02-07", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Thomas H. Alsbury", birth: "1925-08-23", death: "1994", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Floyd Turner Alverson", birth: "1918-02-14", death: "2020-01-29", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Ezral Richard Ancell", birth: "1896-03-11", death: "1980-02-05", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Raymond Leonard Ancell", birth: "1920-06-11", death: "1996-07-10", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Thomas A. Ancell Jr.", birth: "1929-12-13", death: "1996-05-15", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Edward Eugene Anderson Sr.", birth: "1944-11-03", death: "2003-03-05", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Billy Joe Apel", birth: "1944-03-16", death: "1987-01-05", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Happy Lee Arment", birth: "1931-01-23", death: "1986-11-11", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Donald Lionel Arthur", birth: "1931-12-08", death: "1983-06-03", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Donald Latrell Axt", birth: "1920-07-09", death: "1988-11-26", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Charles Luther Baker", birth: "1929-01-15", death: "1993-07-29", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Cecil Leroy Bales", birth: "1915-09-24", death: "1987-02-03", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "George Granby Ballew", birth: "1923-09-09", death: "1999-11-17", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "David Gordon Ballow", birth: "1911-01-24", death: "1978-10", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Donald Eugene Barnes", birth: "1919-09-02", death: "1999-03-13", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Norman David Barrett", birth: "1920-11-27", death: "2006-05-17", plot: "section 139B space 3", imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Everett Marion Basham", birth: "1922-12-21", death: "1987-03-10", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "Robert Hayes Basnett", birth: "1919-04-03", death: "1970-09-26", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null },
    { name: "James Edward Benedict", birth: "1921-10-12", death: "1973-03-31", plot: null, imageUrl: null, findAGraveUrl: null, memorialId: null }
];

// Function to import all records
function importFindAGraveRecords(enteredBy = "Find a Grave Import") {
    const existingRecords = getStoredData();
    const today = new Date().toISOString().split('T')[0];
    let imported = 0;
    let skipped = 0;

    findAGraveRecords.forEach(record => {
        // Check if record already exists (by name)
        const exists = existingRecords.some(r => 
            r.fullName.toLowerCase() === record.name.toLowerCase()
        );

        if (exists) {
            skipped++;
            return;
        }

        // Parse plot info if available
        let section = null;
        let plotNumber = null;
        if (record.plot) {
            const location = parseLocation(record.plot);
            section = location.section;
            plotNumber = location.plot;
        }

        // Handle partial dates (year only or year-month)
        let birthDate = record.birth;
        let deathDate = record.death;
        
        // If death is just a year, set to null (can't create valid date)
        if (deathDate && deathDate.match(/^\d{4}$/)) {
            deathDate = null;
        }
        if (birthDate && birthDate.match(/^\d{4}$/)) {
            birthDate = null;
        }

        const newRecord = {
            id: generateId(),
            fullName: record.name,
            birthDate: birthDate || null,
            deathDate: deathDate || null,
            veteranStatus: 'yes',
            branch: null,
            warEra: null,
            section: section,
            plotNumber: plotNumber,
            latitude: null,
            longitude: null,
            markerCondition: null,
            markerType: null,
            inscription: null,
            notes: 'Imported from Find a Grave',
            imageUrl: record.imageUrl || null,
            findAGraveUrl: record.findAGraveUrl || null,
            enteredBy: enteredBy,
            entryDate: today,
            createdAt: new Date().toISOString()
        };

        existingRecords.push(newRecord);
        imported++;
    });

    saveStoredData(existingRecords);
    
    console.log(`Import complete!`);
    console.log(`- Imported: ${imported} records`);
    console.log(`- Skipped (duplicates): ${skipped} records`);
    console.log(`- Total records in database: ${existingRecords.length}`);
    
    alert(`Import complete!\n\nImported: ${imported} new records\nSkipped: ${skipped} duplicates\nTotal records: ${existingRecords.length}`);
    
    return { imported, skipped, total: existingRecords.length };
}

// Helper function to parse location
function parseLocation(locationStr) {
    if (!locationStr) return { section: null, plot: null };
    
    let section = null;
    let plot = null;
    
    const sectionMatch = locationStr.match(/section\s*([A-Z0-9]+)/i);
    if (sectionMatch) {
        section = sectionMatch[1].toUpperCase();
    }
    
    const plotMatch = locationStr.match(/(?:plot|space)\s*([A-Z0-9]+)/i);
    if (plotMatch) {
        plot = plotMatch[1];
    }
    
    return { section, plot };
}
