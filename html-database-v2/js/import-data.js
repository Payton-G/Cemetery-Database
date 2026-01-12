// Import Data JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const pasteTab = document.getElementById('paste-tab');
    const csvTab = document.getElementById('csv-tab');
    const manualTab = document.getElementById('manual-tab');
    const coordinatesTab = document.getElementById('coordinates-tab');
    const pasteSection = document.getElementById('paste-section');
    const csvSection = document.getElementById('csv-section');
    const manualSection = document.getElementById('manual-section');
    const coordinatesSection = document.getElementById('coordinates-section');
    const parsePasteBtn = document.getElementById('parse-paste-btn');
    const importCsvBtn = document.getElementById('import-csv-btn');
    const importManualBtn = document.getElementById('import-manual-btn');
    const addRecordBtn = document.getElementById('add-record-btn');
    const importResults = document.getElementById('import-results');
    const importSummary = document.getElementById('import-summary');
    const importErrors = document.getElementById('import-errors');

    let recordCounter = 1;

    // Tab switching
    if (pasteTab) {
        pasteTab.addEventListener('click', () => switchTab('paste'));
    }
    if (csvTab) {
        csvTab.addEventListener('click', () => switchTab('csv'));
    }
    if (manualTab) {
        manualTab.addEventListener('click', () => switchTab('manual'));
    }
    if (coordinatesTab) {
        coordinatesTab.addEventListener('click', () => switchTab('coordinates'));
    }

    function switchTab(tab) {
        // Reset tabs
        pasteTab.classList.remove('active');
        csvTab.classList.remove('active');
        manualTab.classList.remove('active');
        if (coordinatesTab) coordinatesTab.classList.remove('active');
        pasteSection.style.display = 'none';
        csvSection.style.display = 'none';
        manualSection.style.display = 'none';
        if (coordinatesSection) coordinatesSection.style.display = 'none';

        // Activate selected tab
        if (tab === 'paste') {
            pasteTab.classList.add('active');
            pasteSection.style.display = 'block';
        } else if (tab === 'csv') {
            csvTab.classList.add('active');
            csvSection.style.display = 'block';
        } else if (tab === 'manual') {
            manualTab.classList.add('active');
            manualSection.style.display = 'block';
        } else if (tab === 'coordinates') {
            if (coordinatesTab) coordinatesTab.classList.add('active');
            if (coordinatesSection) coordinatesSection.style.display = 'block';
        }
    }

    // Parse and import pasted records
    if (parsePasteBtn) {
        parsePasteBtn.addEventListener('click', function() {
            const pasteData = document.getElementById('paste-data').value.trim();
            const enteredBy = document.getElementById('import-entered-by').value.trim();

            if (!enteredBy) {
                alert('Please enter your name in "Entered By" field');
                return;
            }

            if (!pasteData) {
                alert('Please paste some records to import');
                return;
            }

            // Try to parse as Find a Grave format first
            const records = parseFindAGraveText(pasteData, enteredBy);
            
            if (records.length > 0) {
                importRecords(records, []);
            } else {
                // Fallback to line-by-line parsing
                const lines = pasteData.split('\n').filter(line => line.trim());
                const parsedRecords = [];
                const errors = [];

                lines.forEach((line, index) => {
                    try {
                        const record = parseFindAGraveLine(line.trim(), enteredBy);
                        if (record) {
                            parsedRecords.push(record);
                        } else {
                            errors.push(`Line ${index + 1}: Could not parse - "${line.substring(0, 50)}..."`);
                        }
                    } catch (error) {
                        errors.push(`Line ${index + 1}: Error - ${error.message}`);
                    }
                });

                if (parsedRecords.length > 0) {
                    importRecords(parsedRecords, errors);
                } else {
                    alert('No valid records found to import. Please check the format.');
                }
            }
        });
    }

    // Parse Find a Grave text format (handles the actual page format)
    function parseFindAGraveText(text, enteredBy) {
        const records = [];
        
        // Split by double newlines or look for patterns that indicate new records
        // Find a Grave format is typically:
        // Name
        // Veteran (optional)
        // Birth Date – Death Date
        // Plot info: ... (optional)
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        let currentRecord = null;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
            
            // Skip "Veteran" lines
            if (line.toLowerCase() === 'veteran' || line.toLowerCase() === 'vveteran') {
                continue;
            }
            
            // Skip "Flowers have been left" lines
            if (line.toLowerCase().includes('flowers have been left')) {
                continue;
            }
            
            // Look for name pattern (starts with capital, has multiple words, not a date)
            // Names typically: "First Last" or "First Middle Last" or "First M. Last"
            const namePattern = /^[A-Z][a-z]+(\s+[A-Z][a-z]*\.?)*(\s+[A-Z][a-z]+)+$/;
            const isDateLine = line.match(/\d{1,2}\s+[A-Z][a-z]+\s+\d{4}/) || line.match(/\d{4}\s*–\s*\d{4}/);
            const isPlotLine = line.toLowerCase().includes('plot') || line.toLowerCase().includes('section') || line.toLowerCase().includes('space');
            
            if (namePattern.test(line) && !isDateLine && !isPlotLine && line.length > 3) {
                // This looks like a name - save previous record if exists
                if (currentRecord && currentRecord.fullName) {
                    records.push(currentRecord);
                }
                
                // Start new record
                currentRecord = {
                    id: generateId(),
                    fullName: line,
                    birthDate: null,
                    deathDate: null,
                    veteranStatus: 'yes',
                    branch: null,
                    warEra: null,
                    section: null,
                    plotNumber: null,
                    latitude: null,
                    longitude: null,
                    markerCondition: null,
                    markerType: null,
                    inscription: null,
                    notes: 'Imported from Find a Grave',
                    enteredBy: enteredBy,
                    entryDate: today,
                    createdAt: new Date().toISOString()
                };
            }
            // Look for date range: "5 Jan 1908 – 7 Feb 1990" or "23 Aug 1925 – 1994"
            else if (isDateLine && currentRecord) {
                const dates = parseDateRange(line);
                if (dates) {
                    currentRecord.birthDate = dates.birth;
                    currentRecord.deathDate = dates.death;
                }
            }
            // Look for plot info
            else if (isPlotLine && currentRecord) {
                const location = parseLocation(line);
                if (location.section || location.plot) {
                    currentRecord.section = location.section;
                    currentRecord.plotNumber = location.plot;
                }
            }
        }
        
        // Don't forget the last record
        if (currentRecord && currentRecord.fullName) {
            records.push(currentRecord);
        }
        
        return records;
    }

    // Parse date range like "5 Jan 1908 – 7 Feb 1990" or "23 Aug 1925 – 1994"
    function parseDateRange(dateStr) {
        if (!dateStr) return null;
        
        const parts = dateStr.split('–').map(p => p.trim());
        if (parts.length !== 2) return null;
        
        return {
            birth: parseDate(parts[0]),
            death: parseDate(parts[1])
        };
    }

    // Parse a line from Find a Grave format
    function parseFindAGraveLine(line, enteredBy) {
        // Format examples:
        // "Paul William Addie | 5 Jan 1908 | 7 Feb 1990 | Section A, Plot 1"
        // "Thomas H. Alsbury | 23 Aug 1925 | 1994"
        // "Floyd Turner Alverson | 14 Feb 1918 | 29 Jan 2020 | section 139B space 3"

        if (!line || line.length < 5) return null;

        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 2) return null;

        const fullName = parts[0].trim();
        if (!fullName) return null;

        let birthDate = null;
        let deathDate = null;
        let section = null;
        let plotNumber = null;
        let veteranStatus = 'yes'; // Assume veteran from Find a Grave veteran search

        // Parse dates
        if (parts.length >= 2 && parts[1]) {
            birthDate = parseDate(parts[1]);
        }
        if (parts.length >= 3 && parts[2]) {
            deathDate = parseDate(parts[2]);
        }

        // Parse location info
        if (parts.length >= 4 && parts[3]) {
            const location = parseLocation(parts[3]);
            section = location.section;
            plotNumber = location.plot;
        }

        const today = new Date().toISOString().split('T')[0];

        return {
            id: generateId(),
            fullName: fullName,
            birthDate: birthDate,
            deathDate: deathDate,
            veteranStatus: veteranStatus,
            branch: null,
            warEra: null,
            section: section,
            plotNumber: plotNumber,
            latitude: null,
            longitude: null,
            markerCondition: null,
            markerType: null,
            inscription: null,
            notes: `Imported from Find a Grave`,
            enteredBy: enteredBy,
            entryDate: today,
            createdAt: new Date().toISOString()
        };
    }

    // Parse date from various formats
    function parseDate(dateStr) {
        if (!dateStr) return null;
        
        dateStr = dateStr.trim();
        
        // Handle year only (e.g., "1994")
        if (/^\d{4}$/.test(dateStr)) {
            return null; // Can't create a full date from just year
        }

        // Try to parse common date formats
        // "5 Jan 1908", "23 Aug 1925", "14 Feb 1918"
        const months = {
            'jan': '01', 'january': '01',
            'feb': '02', 'february': '02',
            'mar': '03', 'march': '03',
            'apr': '04', 'april': '04',
            'may': '05',
            'jun': '06', 'june': '06',
            'jul': '07', 'july': '07',
            'aug': '08', 'august': '08',
            'sep': '09', 'september': '09',
            'oct': '10', 'october': '10',
            'nov': '11', 'november': '11',
            'dec': '12', 'december': '12'
        };

        // Try format: "5 Jan 1908" or "14 Feb 1918"
        const dateMatch = dateStr.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthName = dateMatch[2].toLowerCase();
            const year = dateMatch[3];
            const month = months[monthName];
            if (month) {
                return `${year}-${month}-${day}`;
            }
        }

        // Try ISO format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }

        return null;
    }

    // Parse location from text like "Section A, Plot 1" or "section 139B space 3"
    function parseLocation(locationStr) {
        if (!locationStr) return { section: null, plot: null };

        let section = null;
        let plot = null;

        // Try "Section A, Plot 1" format
        const sectionMatch = locationStr.match(/section\s*([A-Z0-9]+)/i);
        if (sectionMatch) {
            section = sectionMatch[1].toUpperCase();
        }

        // Try "Plot 1" or "space 3" format
        const plotMatch = locationStr.match(/(?:plot|space)\s*([A-Z0-9]+)/i);
        if (plotMatch) {
            plot = plotMatch[1];
        }

        return { section: section, plot: plot };
    }

    // CSV Import
    if (importCsvBtn) {
        importCsvBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('csv-file');
            const enteredBy = document.getElementById('csv-entered-by').value.trim();

            if (!enteredBy) {
                alert('Please enter your name in "Entered By" field');
                return;
            }

            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select a CSV file');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const csv = e.target.result;
                    const records = parseCSV(csv, enteredBy);
                    if (records.length > 0) {
                        importRecords(records, []);
                    } else {
                        alert('No valid records found in CSV file');
                    }
                } catch (error) {
                    alert('Error reading CSV file: ' + error.message);
                }
            };

            reader.readAsText(file);
        });
    }

    // Parse CSV file
    function parseCSV(csv, enteredBy) {
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        // Parse header
        const headers = parseCSVLine(lines[0]);
        const records = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const record = {
                id: generateId(),
                fullName: getCSVValue(values, headers, 'Full Name') || getCSVValue(values, headers, 'Name') || '',
                birthDate: getCSVValue(values, headers, 'Birth Date') || null,
                deathDate: getCSVValue(values, headers, 'Death Date') || null,
                veteranStatus: getCSVValue(values, headers, 'Veteran Status') || 'unknown',
                branch: getCSVValue(values, headers, 'Branch') || null,
                warEra: getCSVValue(values, headers, 'War/Era') || null,
                section: getCSVValue(values, headers, 'Section') || null,
                plotNumber: getCSVValue(values, headers, 'Plot Number') || null,
                latitude: getCSVValue(values, headers, 'Latitude') ? parseFloat(getCSVValue(values, headers, 'Latitude')) : null,
                longitude: getCSVValue(values, headers, 'Longitude') ? parseFloat(getCSVValue(values, headers, 'Longitude')) : null,
                markerCondition: getCSVValue(values, headers, 'Marker Condition') || null,
                markerType: getCSVValue(values, headers, 'Marker Type') || null,
                inscription: getCSVValue(values, headers, 'Inscription') || null,
                notes: getCSVValue(values, headers, 'Notes') || null,
                enteredBy: enteredBy,
                entryDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };

            if (record.fullName) {
                records.push(record);
            }
        }

        return records;
    }

    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    }

    function getCSVValue(values, headers, headerName) {
        const index = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
        return index >= 0 && values[index] ? values[index] : null;
    }

    // Manual entry
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', function() {
            recordCounter++;
            const container = document.getElementById('manual-records-container');
            const newRecord = document.createElement('div');
            newRecord.className = 'manual-record-entry';
            newRecord.innerHTML = `
                <h4>Record ${recordCounter}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name <span class="required">*</span></label>
                        <input type="text" class="manual-name" required>
                    </div>
                    <div class="form-group">
                        <label>Entered By <span class="required">*</span></label>
                        <input type="text" class="manual-entered-by" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Birth Date</label>
                        <input type="date" class="manual-birth">
                    </div>
                    <div class="form-group">
                        <label>Death Date</label>
                        <input type="date" class="manual-death">
                    </div>
                </div>
                <div class="form-group">
                    <label>Veteran Status</label>
                    <select class="manual-veteran">
                        <option value="">Select...</option>
                        <option value="yes">Yes - Veteran</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Section</label>
                        <input type="text" class="manual-section" placeholder="e.g., Section A">
                    </div>
                    <div class="form-group">
                        <label>Plot Number</label>
                        <input type="text" class="manual-plot" placeholder="Plot number">
                    </div>
                </div>
            `;
            container.appendChild(newRecord);
        });
    }

    if (importManualBtn) {
        importManualBtn.addEventListener('click', function() {
            const entries = document.querySelectorAll('.manual-record-entry');
            const records = [];
            const errors = [];

            entries.forEach((entry, index) => {
                const name = entry.querySelector('.manual-name').value.trim();
                const enteredBy = entry.querySelector('.manual-entered-by').value.trim();

                if (!name || !enteredBy) {
                    errors.push(`Record ${index + 1}: Missing required fields (Name or Entered By)`);
                    return;
                }

                const record = {
                    id: generateId(),
                    fullName: name,
                    birthDate: entry.querySelector('.manual-birth').value || null,
                    deathDate: entry.querySelector('.manual-death').value || null,
                    veteranStatus: entry.querySelector('.manual-veteran').value || 'unknown',
                    branch: null,
                    warEra: null,
                    section: entry.querySelector('.manual-section').value.trim() || null,
                    plotNumber: entry.querySelector('.manual-plot').value.trim() || null,
                    latitude: null,
                    longitude: null,
                    markerCondition: null,
                    markerType: null,
                    inscription: null,
                    notes: null,
                    enteredBy: enteredBy,
                    entryDate: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                };

                records.push(record);
            });

            if (records.length > 0) {
                importRecords(records, errors);
            } else {
                alert('No valid records to import. Please fill in at least Name and Entered By for each record.');
            }
        });
    }

    // Import records to storage
    function importRecords(records, errors) {
        try {
            const existingRecords = getStoredData();
            const newRecords = [...existingRecords, ...records];
            saveStoredData(newRecords);

            // Show results
            importResults.style.display = 'block';
            importSummary.innerHTML = `
                <div class="message success">
                    <strong>✓ Successfully imported ${records.length} record(s)!</strong>
                    <br>Total records in database: ${newRecords.length}
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; margin-bottom: 10px;">💾 Save Imported Data:</strong>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button id="save-import-csv-paste" class="btn btn-secondary" style="padding: 10px 20px;">
                                📥 Download as CSV
                            </button>
                            <button id="save-import-json-paste" class="btn btn-secondary" style="padding: 10px 20px;">
                                📥 Download as JSON
                            </button>
                        </div>
                        <small style="display: block; margin-top: 10px; color: rgba(255,255,255,0.8);">
                            Save a backup of all ${newRecords.length} records in the database (including the ${records.length} newly imported records)
                        </small>
                    </div>
                </div>
            `;

            // Add event listeners for save buttons
            const saveCsvBtn = document.getElementById('save-import-csv-paste');
            const saveJsonBtn = document.getElementById('save-import-json-paste');
            
            if (saveCsvBtn) {
                saveCsvBtn.addEventListener('click', function() {
                    exportAllToCSV();
                });
            }
            
            if (saveJsonBtn) {
                saveJsonBtn.addEventListener('click', function() {
                    exportAllToJSON();
                });
            }

            if (errors.length > 0) {
                importErrors.innerHTML = `
                    <div class="message error">
                        <strong>Errors/Warnings (${errors.length}):</strong>
                        <ul style="margin-top: 10px;">
                            ${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else {
                importErrors.innerHTML = '';
            }

            // Scroll to results
            importResults.scrollIntoView({ behavior: 'smooth' });

            // Clear forms
            const pasteDataEl = document.getElementById('paste-data');
            const importEnteredByEl = document.getElementById('import-entered-by');
            const csvEnteredByEl = document.getElementById('csv-entered-by');
            
            if (pasteDataEl) pasteDataEl.value = '';
            if (importEnteredByEl) importEnteredByEl.value = '';
            if (csvEnteredByEl) csvEnteredByEl.value = '';

        } catch (error) {
            alert('Error importing records: ' + error.message);
            console.error('Import error:', error);
        }
    }
    
    // Export all records to CSV
    function exportAllToCSV() {
        const records = getStoredData();
        if (records.length === 0) {
            alert('No records to export.');
            return;
        }

        const headers = [
            'Full Name', 'Birth Date', 'Death Date', 'Veteran Status', 'Branch', 'War/Era',
            'Section', 'Plot Number', 'Latitude', 'Longitude', 'Marker Condition', 'Marker Type',
            'Inscription', 'Notes', 'Image URL', 'Find a Grave URL', 'Entered By', 'Entry Date'
        ];

        const csvRows = [headers.join(',')];

        records.forEach(record => {
            const row = [
                `"${(record.fullName || '').replace(/"/g, '""')}"`,
                record.birthDate || '',
                record.deathDate || '',
                record.veteranStatus || '',
                record.branch || '',
                record.warEra || '',
                record.section || '',
                record.plotNumber || '',
                record.latitude || '',
                record.longitude || '',
                record.markerCondition || '',
                record.markerType || '',
                `"${(record.inscription || '').replace(/"/g, '""')}"`,
                `"${(record.notes || '').replace(/"/g, '""')}"`,
                `"${(record.imageUrl || '').replace(/"/g, '""')}"`,
                `"${(record.findAGraveUrl || '').replace(/"/g, '""')}"`,
                record.enteredBy || '',
                record.entryDate || ''
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `cemetery_records_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show confirmation
        setTimeout(() => {
            alert(`✓ Successfully downloaded ${records.length} records as CSV file!`);
        }, 100);
    }
    
    // Export all records to JSON
    function exportAllToJSON() {
        const records = getStoredData();
        if (records.length === 0) {
            alert('No records to export.');
            return;
        }

        const jsonContent = JSON.stringify(records, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `cemetery_records_${timestamp}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show confirmation
        setTimeout(() => {
            alert(`✓ Successfully downloaded ${records.length} records as JSON file!`);
        }, 100);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Map Coordinates Import Functionality
    const coordMethod = document.getElementById('coord-method');
    const coordCsvSection = document.getElementById('coord-csv-section');
    const coordPasteSection = document.getElementById('coord-paste-section');
    const coordCsvFile = document.getElementById('coord-csv-file');
    const coordPasteData = document.getElementById('coord-paste-data');
    const coordMatchById = document.getElementById('coord-match-by-id');
    const importCoordinatesBtn = document.getElementById('import-coordinates-btn');
    const coordImportResults = document.getElementById('coord-import-results');
    const coordImportSummary = document.getElementById('coord-import-summary');
    const coordImportErrors = document.getElementById('coord-import-errors');

    // Switch between CSV and Paste methods
    if (coordMethod) {
        coordMethod.addEventListener('change', function() {
            if (this.value === 'csv') {
                if (coordCsvSection) coordCsvSection.style.display = 'block';
                if (coordPasteSection) coordPasteSection.style.display = 'none';
            } else {
                if (coordCsvSection) coordCsvSection.style.display = 'none';
                if (coordPasteSection) coordPasteSection.style.display = 'block';
            }
        });
    }

    // Import coordinates button
    if (importCoordinatesBtn) {
        importCoordinatesBtn.addEventListener('click', function() {
            const method = coordMethod ? coordMethod.value : 'csv';
            const matchById = coordMatchById ? coordMatchById.checked : false;

            if (method === 'csv') {
                if (!coordCsvFile || !coordCsvFile.files || coordCsvFile.files.length === 0) {
                    alert('Please select a CSV file');
                    return;
                }

                const file = coordCsvFile.files[0];
                const reader = new FileReader();

                reader.onload = function(e) {
                    try {
                        const csv = e.target.result;
                        const coordinateData = parseCoordinatesCSV(csv);
                        importMapCoordinates(coordinateData, matchById);
                    } catch (error) {
                        alert('Error reading CSV file: ' + error.message);
                        console.error('CSV read error:', error);
                    }
                };

                reader.readAsText(file);
            } else {
                // Paste method
                if (!coordPasteData || !coordPasteData.value.trim()) {
                    alert('Please paste coordinate data');
                    return;
                }

                const coordinateData = parseCoordinatesPaste(coordPasteData.value);
                importMapCoordinates(coordinateData, matchById);
            }
        });
    }

    // Parse CSV for coordinates
    function parseCoordinatesCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const coordinates = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const nameOrId = getCSVValue(values, headers, 'Full Name') || 
                           getCSVValue(values, headers, 'Name') || 
                           getCSVValue(values, headers, 'ID') || 
                           getCSVValue(values, headers, 'Id') || '';
            const gridX = getCSVValue(values, headers, 'Grid X') || 
                         getCSVValue(values, headers, 'gridX') || 
                         getCSVValue(values, headers, 'GridX') || 
                         getCSVValue(values, headers, 'X') || '';
            const gridY = getCSVValue(values, headers, 'Grid Y') || 
                         getCSVValue(values, headers, 'gridY') || 
                         getCSVValue(values, headers, 'GridY') || 
                         getCSVValue(values, headers, 'Y') || '';

            if (nameOrId && gridX && gridY) {
                const x = parseInt(gridX);
                const y = parseInt(gridY);
                if (!isNaN(x) && !isNaN(y)) {
                    coordinates.push({
                        identifier: nameOrId.trim(),
                        gridX: x,
                        gridY: y
                    });
                }
            }
        }

        return coordinates;
    }

    // Parse pasted data for coordinates
    function parseCoordinatesPaste(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const coordinates = [];

        lines.forEach((line, index) => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3) {
                const nameOrId = parts[0];
                const gridX = parseInt(parts[1]);
                const gridY = parseInt(parts[2]);

                if (nameOrId && !isNaN(gridX) && !isNaN(gridY)) {
                    coordinates.push({
                        identifier: nameOrId,
                        gridX: gridX,
                        gridY: gridY
                    });
                }
            }
        });

        return coordinates;
    }

    // Import map coordinates into existing records
    function importMapCoordinates(coordinateData, matchById) {
        if (coordinateData.length === 0) {
            alert('No valid coordinate data found');
            return;
        }

        const existingRecords = getStoredData();
        let updated = 0;
        let notFound = 0;
        const errors = [];

        coordinateData.forEach(coord => {
            let record = null;

            if (matchById) {
                // Match by ID
                record = existingRecords.find(r => r.id === coord.identifier);
            } else {
                // Match by name (case-insensitive)
                record = existingRecords.find(r => 
                    r.fullName && r.fullName.toLowerCase().trim() === coord.identifier.toLowerCase().trim()
                );
            }

            if (record) {
                record.gridX = coord.gridX;
                record.gridY = coord.gridY;
                updated++;
            } else {
                notFound++;
                errors.push(`Not found: ${coord.identifier}`);
            }
        });

        // Save updated records
        saveStoredData(existingRecords);

        // Show results
        if (coordImportResults) coordImportResults.style.display = 'block';
        if (coordImportSummary) {
            coordImportSummary.innerHTML = `
                <div class="message success">
                    <strong>✓ Successfully updated ${updated} record(s) with map coordinates!</strong>
                    ${notFound > 0 ? `<br><span style="color: var(--warning-color);">⚠ ${notFound} record(s) not found</span>` : ''}
                </div>
            `;
        }

        if (coordImportErrors && errors.length > 0) {
            coordImportErrors.innerHTML = `
                <div class="message error" style="margin-top: 15px;">
                    <strong>Records Not Found (${errors.length}):</strong>
                    <ul style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                        ${errors.slice(0, 50).map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                        ${errors.length > 50 ? `<li>... and ${errors.length - 50} more</li>` : ''}
                    </ul>
                </div>
            `;
        } else if (coordImportErrors) {
            coordImportErrors.innerHTML = '';
        }

        // Scroll to results
        if (coordImportResults) {
            coordImportResults.scrollIntoView({ behavior: 'smooth' });
        }

        // Clear inputs
        if (coordCsvFile) coordCsvFile.value = '';
        if (coordPasteData) coordPasteData.value = '';

        // Dispatch event to update map
        window.dispatchEvent(new CustomEvent('cemeteryDataUpdated'));
    }
});

