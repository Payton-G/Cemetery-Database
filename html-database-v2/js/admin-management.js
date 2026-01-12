// Admin Management JavaScript - Database Management Functions

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('dataEntryAuthenticated') === 'true';
    if (!isAuthenticated) {
        return; // Don't initialize if not authenticated
    }

    // Tab switching
    const dataEntryTab = document.getElementById('data-entry-tab');
    const importTab = document.getElementById('import-tab');
    const managementTab = document.getElementById('management-tab');
    const dataEntrySection = document.getElementById('data-entry-section');
    const importSection = document.getElementById('import-section');
    const managementSection = document.getElementById('management-section');

    if (dataEntryTab) {
        dataEntryTab.addEventListener('click', () => switchAdminTab('data-entry'));
    }
    if (importTab) {
        importTab.addEventListener('click', () => switchAdminTab('import'));
    }
    if (managementTab) {
        managementTab.addEventListener('click', () => switchAdminTab('management'));
    }

    function switchAdminTab(tab) {
        // Reset all tabs
        [dataEntryTab, importTab, managementTab].forEach(t => {
            if (t) t.classList.remove('active');
        });
        [dataEntrySection, importSection, managementSection].forEach(s => {
            if (s) s.style.display = 'none';
        });

        // Activate selected tab
        if (tab === 'data-entry') {
            if (dataEntryTab) dataEntryTab.classList.add('active');
            if (dataEntrySection) dataEntrySection.style.display = 'block';
        } else if (tab === 'import') {
            if (importTab) importTab.classList.add('active');
            if (importSection) importSection.style.display = 'block';
            // Defer initialization to avoid blocking UI
            requestAnimationFrame(() => {
                initializeImportTabs();
            });
        } else if (tab === 'management') {
            if (managementTab) managementTab.classList.add('active');
            if (managementSection) managementSection.style.display = 'block';
            // Defer loading to avoid blocking UI
            requestAnimationFrame(() => {
                loadManagementData();
            });
        }
    }

    // Import sub-tabs
    function initializeImportTabs() {
        const pasteTab = document.getElementById('paste-tab');
        const csvTab = document.getElementById('csv-tab');
        const jsonTab = document.getElementById('json-tab');
        const findagraveTab = document.getElementById('findagrave-tab');
        const pasteSubsection = document.getElementById('paste-subsection');
        const csvSubsection = document.getElementById('csv-subsection');
        const jsonSubsection = document.getElementById('json-subsection');
        const findagraveSubsection = document.getElementById('findagrave-subsection');

        if (pasteTab) {
            pasteTab.addEventListener('click', () => {
                [pasteTab, csvTab, jsonTab, findagraveTab].forEach(t => t?.classList.remove('active'));
                [pasteSubsection, csvSubsection, jsonSubsection, findagraveSubsection].forEach(s => s && (s.style.display = 'none'));
                pasteTab.classList.add('active');
                if (pasteSubsection) pasteSubsection.style.display = 'block';
            });
        }

        if (csvTab) {
            csvTab.addEventListener('click', () => {
                [pasteTab, csvTab, jsonTab, findagraveTab].forEach(t => t?.classList.remove('active'));
                [pasteSubsection, csvSubsection, jsonSubsection, findagraveSubsection].forEach(s => s && (s.style.display = 'none'));
                csvTab.classList.add('active');
                if (csvSubsection) csvSubsection.style.display = 'block';
            });
        }

        if (jsonTab) {
            jsonTab.addEventListener('click', () => {
                [pasteTab, csvTab, jsonTab, findagraveTab].forEach(t => t?.classList.remove('active'));
                [pasteSubsection, csvSubsection, jsonSubsection, findagraveSubsection].forEach(s => s && (s.style.display = 'none'));
                jsonTab.classList.add('active');
                if (jsonSubsection) jsonSubsection.style.display = 'block';
            });
        }

        if (findagraveTab) {
            findagraveTab.addEventListener('click', () => {
                [pasteTab, csvTab, jsonTab, findagraveTab].forEach(t => t?.classList.remove('active'));
                [pasteSubsection, csvSubsection, jsonSubsection, findagraveSubsection].forEach(s => s && (s.style.display = 'none'));
                findagraveTab.classList.add('active');
                if (findagraveSubsection) findagraveSubsection.style.display = 'block';
                updateFindAGraveCount();
            });
        }

        // JSON Import handler
        const importJsonBtn = document.getElementById('import-json-btn');
        if (importJsonBtn) {
            importJsonBtn.addEventListener('click', function() {
                const fileInput = document.getElementById('json-file');
                const enteredBy = document.getElementById('json-entered-by').value.trim();

                if (!enteredBy) {
                    alert('Please enter your name in "Entered By" field');
                    return;
                }

                if (!fileInput.files || fileInput.files.length === 0) {
                    alert('Please select a JSON file');
                    return;
                }

                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = function(e) {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        if (!Array.isArray(jsonData)) {
                            alert('JSON file must contain an array of records');
                            return;
                        }

                        const errors = [];
                        const records = jsonData.reduce((acc, record, idx) => {
                            const fullName = (record.name || record.fullName || record.FullName || '').toString().trim();
                            if (!fullName) {
                                errors.push(`Record ${idx + 1}: Missing required "name" field`);
                                return acc;
                            }

                            // Parse dates
                            let birthDate = record.birth || record.birthDate || null;
                            let deathDate = record.death || record.deathDate || null;
                            
                            if (deathDate && /^\d{4}$/.test(deathDate)) {
                                deathDate = null;
                            }
                            if (birthDate && /^\d{4}$/.test(birthDate)) {
                                birthDate = null;
                            }

                            // Parse plot info
                            let section = null;
                            let plotNumber = null;
                            if (record.plot) {
                                const location = parseLocationFromPlot(record.plot);
                                section = location.section;
                                plotNumber = location.plot;
                            }
                            
                            // Also check if section/plotNumber are already in the record
                            if (!section && record.section) section = record.section;
                            if (!plotNumber && record.plotNumber) plotNumber = record.plotNumber;
                            
                            // Calculate grid coordinates from section/plot if not provided
                            let gridX = record.gridX !== undefined ? record.gridX : null;
                            let gridY = record.gridY !== undefined ? record.gridY : null;
                            
                            if ((gridX === null || gridY === null) && (section || plotNumber)) {
                                // Parse section to grid Y coordinate
                                if (section && gridY === null) {
                                    gridY = parseSectionToGridY(section);
                                }
                                // Parse plot to grid X coordinate
                                if (plotNumber && gridX === null) {
                                    gridX = parsePlotToGridX(plotNumber);
                                }
                            }

                            const findAGraveUrl = record.findAGraveUrl || record.findagraveUrl || record.findAGraveURL || null;
                            const memorialId = record.memorialId || record.memorialID || record.memorial_id || null;
                            const gridX = record.gridX !== undefined ? record.gridX : null;
                            const gridY = record.gridY !== undefined ? record.gridY : null;

                            acc.push({
                                id: generateId(),
                                fullName: fullName,
                                birthDate: birthDate,
                                deathDate: deathDate,
                                veteranStatus: record.veteranStatus || 'yes',
                                branch: record.branch || null,
                                warEra: record.warEra || null,
                                section: section,
                                plotNumber: plotNumber,
                                gridX: gridX,
                                gridY: gridY,
                                latitude: record.latitude || null,
                                longitude: record.longitude || null,
                                markerCondition: record.markerCondition || null,
                                markerType: record.markerType || null,
                                inscription: record.inscription || null,
                                notes: record.notes || 'Imported from Find a Grave',
                                imageUrl: record.imageUrl || null,
                                findAGraveUrl: findAGraveUrl,
                                memorialId: memorialId,
                                enteredBy: enteredBy,
                                entryDate: new Date().toISOString().split('T')[0],
                                createdAt: new Date().toISOString()
                            });
                            return acc;
                        }, []);

                        // Check for duplicates and import/update
                        const existingRecords = getStoredData();
                        const indexByUrl = new Map();
                        const indexByMemorialId = new Map();
                        const indexByName = new Map();
                        existingRecords.forEach((r, i) => {
                            if (r.findAGraveUrl) indexByUrl.set(r.findAGraveUrl.toLowerCase(), i);
                            if (r.memorialId) indexByMemorialId.set(r.memorialId.toString(), i);
                            if (r.fullName) indexByName.set(r.fullName.toLowerCase(), i);
                        });
                        let imported = 0;
                        let updated = 0;
                        let skipped = 0;

                        records.forEach(record => {
                            // First try to match by Find A Grave URL or memorial ID (more reliable)
                            let existingIndex = -1;
                            if (record.findAGraveUrl) {
                                const key = record.findAGraveUrl.toLowerCase();
                                existingIndex = indexByUrl.get(key) ?? -1;
                            }
                            
                            // If no match by URL, try by memorial ID
                            if (existingIndex === -1 && record.memorialId) {
                                existingIndex = indexByMemorialId.get(record.memorialId.toString()) ?? -1;
                            }
                            
                            // Fallback to name matching if no URL/ID match
                            if (existingIndex === -1 && record.fullName) {
                                existingIndex = indexByName.get(record.fullName.toLowerCase()) ?? -1;
                            }

                            if (existingIndex !== -1) {
                                // Update existing record with new data (preserves ID and other fields)
                                const existing = existingRecords[existingIndex];
                                existingRecords[existingIndex] = {
                                    ...existing,
                                    ...record,
                                    id: existing.id, // Keep original ID
                                    enteredBy: existing.enteredBy || record.enteredBy, // Keep original enteredBy if exists
                                    entryDate: existing.entryDate || record.entryDate, // Keep original entryDate if exists
                                    createdAt: existing.createdAt || record.createdAt // Keep original createdAt if exists
                                };
                                updated++;
                            } else {
                                // New record
                                existingRecords.push(record);
                                const newIndex = existingRecords.length - 1;
                                if (record.findAGraveUrl) indexByUrl.set(record.findAGraveUrl.toLowerCase(), newIndex);
                                if (record.memorialId) indexByMemorialId.set(record.memorialId.toString(), newIndex);
                                if (record.fullName) indexByName.set(record.fullName.toLowerCase(), newIndex);
                                imported++;
                            }
                        });

                        // Render any validation errors for user visibility
                        const importErrorsEl = document.getElementById('import-errors');
                        if (importErrorsEl) {
                            if (errors.length > 0) {
                                importErrorsEl.innerHTML = `
                                    <div class="message error">
                                        <strong>Skipped ${errors.length} invalid record(s):</strong>
                                        <ul style="margin-top: 10px;">
                                            ${errors.map(e => `<li>${e}</li>`).join('')}
                                        </ul>
                                    </div>
                                `;
                                skipped = errors.length;
                            } else {
                                importErrorsEl.innerHTML = '';
                            }
                        }

                        saveStoredData(existingRecords);
                        showImportResults(imported, updated, skipped, existingRecords.length);
                        // Update management stats if on management tab
                        if (document.getElementById('management-tab') && document.getElementById('management-tab').classList.contains('active')) {
                            loadManagementData();
                        }
                    } catch (error) {
                        alert('Error reading JSON file: ' + error.message);
                        console.error('JSON import error:', error);
                    }
                };

                reader.readAsText(file);
            });
        }

        // Find a Grave import buttons
        const runFagImportBtn = document.getElementById('run-fag-import-btn');
        const checkFagDuplicatesBtn = document.getElementById('check-fag-duplicates-btn');

        if (runFagImportBtn) {
            runFagImportBtn.addEventListener('click', function() {
                const enteredBy = document.getElementById('fag-entered-by').value.trim();
                if (!enteredBy) {
                    alert('Please enter your name in "Entered By" field');
                    return;
                }

                if (typeof importFindAGraveRecords !== 'function') {
                    alert('Import function not found.');
                    return;
                }

                const result = importFindAGraveRecords(enteredBy);
                showImportResults(result.imported, 0, result.skipped, result.total);
            });
        }

        if (checkFagDuplicatesBtn) {
            checkFagDuplicatesBtn.addEventListener('click', function() {
                const existingRecords = getStoredData();
                let duplicates = 0;
                let newRecords = 0;

                if (typeof findAGraveRecords !== 'undefined') {
                    findAGraveRecords.forEach(record => {
                        const exists = existingRecords.some(r => 
                            r.fullName.toLowerCase() === record.name.toLowerCase()
                        );
                        if (exists) {
                            duplicates++;
                        } else {
                            newRecords++;
                        }
                    });
                }

                alert(`Duplicate Check Results:\n\nNew records to import: ${newRecords}\nAlready in database: ${duplicates}\nTotal Find a Grave records: ${findAGraveRecords ? findAGraveRecords.length : 0}\nCurrent database records: ${existingRecords.length}`);
            });
        }
    }

    function updateFindAGraveCount() {
        const countEl = document.getElementById('fag-record-count');
        if (countEl) {
            // Show loading state
            countEl.textContent = '...';
            // Defer count update to avoid blocking
            requestAnimationFrame(() => {
                if (typeof findAGraveRecords !== 'undefined') {
                    countEl.textContent = findAGraveRecords.length;
                } else {
                    countEl.textContent = '0';
                }
            });
        }
    }

    function showImportResults(imported, updated, skipped, total) {
        // Handle backward compatibility - if skipped is a number and updated is undefined, it's the old format
        if (typeof updated === 'number' && typeof skipped === 'number' && arguments.length === 4) {
            // New format: imported, updated, skipped, total
        } else if (typeof skipped === 'number' && arguments.length === 3) {
            // Old format: imported, skipped, total - shift parameters
            total = skipped;
            skipped = updated;
            updated = 0;
        }
        
        const importResults = document.getElementById('import-results');
        const importSummary = document.getElementById('import-summary');
        
        if (importResults && importSummary) {
            importResults.style.display = 'block';
            const updateText = updated > 0 ? `<li>Updated: ${updated} existing records</li>` : '';
            importSummary.innerHTML = `
                <div class="message success">
                    <strong>✓ Import Complete!</strong>
                    <ul style="margin-top: 10px;">
                        <li>Imported: ${imported} new records</li>
                        ${updateText}
                        ${skipped > 0 ? `<li>Skipped (duplicates): ${skipped} records</li>` : ''}
                        <li>Total records in database: ${total}</li>
                    </ul>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.2);">
                        <strong style="display: block; margin-bottom: 10px;">💾 Save Imported Data:</strong>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button id="save-import-csv" class="btn btn-secondary" style="padding: 10px 20px;">
                                📥 Download as CSV
                            </button>
                            <button id="save-import-json" class="btn btn-secondary" style="padding: 10px 20px;">
                                📥 Download as JSON
                            </button>
                        </div>
                        <small style="display: block; margin-top: 10px; color: rgba(255,255,255,0.8);">
                            Save a backup of all ${total} records in the database (including the ${imported} newly imported records)
                        </small>
                    </div>
                </div>
            `;
            
            // Add event listeners for save buttons
            const saveCsvBtn = document.getElementById('save-import-csv');
            const saveJsonBtn = document.getElementById('save-import-json');
            
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
            
            importResults.scrollIntoView({ behavior: 'smooth' });
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

    // Database Management Functions
    // Cache for records to avoid repeated localStorage reads
    let cachedRecords = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 1000; // 1 second cache

    function buildSearchString(record) {
        // Build a lowercase haystack string used for fast filtering in the UI
        return [
            record.fullName,
            record.section,
            record.plotNumber,
            record.branch,
            record.warEra,
            record.markerCondition,
            record.markerType,
            record.enteredBy,
            record.notes,
            record.inscription
        ].filter(Boolean).join(' | ').toLowerCase();
    }

    function getCachedRecords() {
        const now = Date.now();
        if (!cachedRecords || (now - cacheTimestamp) > CACHE_DURATION) {
            cachedRecords = getStoredData().map(r => ({
                ...r,
                _search: buildSearchString(r)
            }));
            cacheTimestamp = now;
        }
        return cachedRecords;
    }

    function invalidateCache() {
        cachedRecords = null;
        cacheTimestamp = 0;
    }

    // Expose cache invalidation globally so main.js can call it
    window.invalidateAdminCache = invalidateCache;
    
    // Helper functions to parse section/plot to grid coordinates
    function parseSectionToGridY(sectionStr) {
        if (!sectionStr) return null;
        
        sectionStr = String(sectionStr).trim().toUpperCase();
        sectionStr = sectionStr.replace(/^SECTION\s*/i, '');
        sectionStr = sectionStr.replace(/^SEC\s*/i, '');
        
        // Handle numeric sections like "139B"
        const match = sectionStr.match(/^(\d+)([A-Z])?$/);
        if (match) {
            const num = parseInt(match[1]);
            const letter = match[2];
            if (letter) {
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
        
        return null;
    }
    
    function parsePlotToGridX(plotStr) {
        if (!plotStr) return null;
        
        plotStr = String(plotStr).trim();
        
        // Extract numbers from plot string
        const numbers = plotStr.match(/\d+/);
        if (numbers) {
            return parseInt(numbers[0]);
        }
        
        return null;
    }
    
    // Parse location from plot string (similar to import-data.js)
    function parseLocationFromPlot(locationStr) {
        if (!locationStr) return { section: null, plot: null };
        
        let section = null;
        let plot = null;
        
        // Try "Section A, Plot 1" format
        const sectionMatch = String(locationStr).match(/section\s*([A-Z0-9]+)/i);
        if (sectionMatch) {
            section = sectionMatch[1].toUpperCase();
        }
        
        // Try "Plot 1" or "space 3" format
        const plotMatch = String(locationStr).match(/(?:plot|space)\s*([A-Z0-9]+)/i);
        if (plotMatch) {
            plot = plotMatch[1];
        }
        
        return { section: section, plot: plot };
    }

    function loadManagementData() {
        const records = getCachedRecords();
        
        // Calculate all statistics in a single pass
        let veterans = 0;
        let withGps = 0;
        let needsRepair = 0;
        
        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            if (r.veteranStatus === 'yes') veterans++;
            if (r.latitude && r.longitude) withGps++;
            if (r.markerCondition === 'poor' || r.markerCondition === 'damaged' || r.markerCondition === 'missing') {
                needsRepair++;
            }
        }
        
        // Update statistics
        const totalEl = document.getElementById('db-total-records');
        const veteransEl = document.getElementById('db-veterans');
        const gpsEl = document.getElementById('db-with-gps');
        const repairEl = document.getElementById('db-needs-repair');

        if (totalEl) totalEl.textContent = records.length;
        if (veteransEl) veteransEl.textContent = veterans;
        if (gpsEl) gpsEl.textContent = withGps;
        if (repairEl) repairEl.textContent = needsRepair;

        // Load records for deletion (with pagination)
        loadDeleteRecords();
    }

    // Pagination state for delete records
    let currentPage = 1;
    const RECORDS_PER_PAGE = 50;
    let allFilteredRecords = [];

    function loadDeleteRecords(filter = '', page = 1) {
        const container = document.getElementById('delete-records-container');
        if (!container) return;

        // Show loading indicator
        container.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 40px 20px;"><p style="font-size: 1.1em; margin-bottom: 10px;">⏳ Loading records...</p><p style="font-size: 0.9em;">Please wait</p></div>';

        // Use requestAnimationFrame to defer heavy work
        requestAnimationFrame(() => {
            const records = getCachedRecords();
            let filteredRecords = records;

            // Filter records if search term provided using precomputed search string
            if (filter.trim()) {
                const filterLower = filter.toLowerCase();
                filteredRecords = records.filter(record => {
                    if (record._search) {
                        return record._search.includes(filterLower);
                    }
                    // Fallback if _search missing (should not happen for cached records)
                    return Object.values(record).some(value => {
                        if (value === null || value === undefined) return false;
                        return value.toString().toLowerCase().includes(filterLower);
                    });
                });
            }

            allFilteredRecords = filteredRecords;
            currentPage = page;

            // Calculate pagination
            const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
            const startIndex = (page - 1) * RECORDS_PER_PAGE;
            const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, filteredRecords.length);
            const pageRecords = filteredRecords.slice(startIndex, endIndex);

            // Clear container
            container.innerHTML = '';

            if (filteredRecords.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 40px 20px;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔍 No records found</p><p style="font-size: 0.9em;">Try adjusting your search terms</p></div>';
                return;
            }

            // Use DocumentFragment for batch DOM updates
            const fragment = document.createDocumentFragment();

            pageRecords.forEach(record => {
                const card = document.createElement('div');
                card.className = 'record-card management-record-card';
                card.style.position = 'relative';
                card.style.paddingRight = '180px';
                card.style.marginBottom = '15px';

                let html = `<h3 style="margin-bottom: 12px;">${escapeHtml(record.fullName)}`;
                if (record.veteranStatus === 'yes') {
                    html += `<span class="veteran-badge">VETERAN</span>`;
                }
                html += `</h3>`;

                html += `<div class="record-details" style="margin-top: 10px;">`;
                if (record.birthDate || record.deathDate) {
                    html += `<div class="record-detail">
                        <span class="record-detail-label">📅 Dates</span>
                        <span class="record-detail-value">${formatDate(record.birthDate)} - ${formatDate(record.deathDate)}</span>
                    </div>`;
                }
                if (record.section) {
                    html += `<div class="record-detail">
                        <span class="record-detail-label">📍 Section</span>
                        <span class="record-detail-value">${escapeHtml(record.section)}</span>
                    </div>`;
                }
                if (record.plotNumber) {
                    html += `<div class="record-detail">
                        <span class="record-detail-label">🔢 Plot</span>
                        <span class="record-detail-value">${escapeHtml(record.plotNumber)}</span>
                    </div>`;
                }
                if (record.branch) {
                    html += `<div class="record-detail">
                        <span class="record-detail-label">🎖️ Branch</span>
                        <span class="record-detail-value">${escapeHtml(record.branch)}</span>
                    </div>`;
                }
                html += `</div>`;

                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = 'position: absolute; top: 15px; right: 15px; display: flex; flex-direction: column; gap: 8px;';

                const editBtn = document.createElement('button');
                editBtn.className = 'btn';
                editBtn.style.cssText = 'background: var(--primary-color); color: white; padding: 10px 18px; font-size: 0.9em; border-radius: 6px; min-width: 100px; transition: all 0.2s ease;';
                editBtn.textContent = '✏️ Edit';
                editBtn.onmouseover = function() { this.style.transform = 'scale(1.05)'; this.style.boxShadow = '0 2px 8px rgba(139, 26, 26, 0.3)'; };
                editBtn.onmouseout = function() { this.style.transform = 'scale(1)'; this.style.boxShadow = 'none'; };
                editBtn.onclick = () => editRecord(record.id);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn';
                deleteBtn.style.cssText = 'background: var(--error-color); color: white; padding: 10px 18px; font-size: 0.9em; border-radius: 6px; min-width: 100px; transition: all 0.2s ease;';
                deleteBtn.textContent = '🗑️ Delete';
                deleteBtn.onmouseover = function() { this.style.transform = 'scale(1.05)'; this.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)'; };
                deleteBtn.onmouseout = function() { this.style.transform = 'scale(1)'; this.style.boxShadow = 'none'; };
                deleteBtn.onclick = () => deleteRecord(record.id, record.fullName);

                buttonContainer.appendChild(editBtn);
                buttonContainer.appendChild(deleteBtn);

                card.innerHTML = html;
                card.appendChild(buttonContainer);
                fragment.appendChild(card);
            });

            container.appendChild(fragment);

            // Add pagination controls if needed
            if (totalPages > 1) {
                const paginationDiv = document.createElement('div');
                paginationDiv.style.cssText = 'margin-top: 20px; padding: 15px; text-align: center; border-top: 2px solid var(--border-color);';
                
                const pageInfo = document.createElement('span');
                pageInfo.style.cssText = 'margin-right: 15px; color: var(--text-light);';
                pageInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredRecords.length} records (Page ${page} of ${totalPages})`;
                paginationDiv.appendChild(pageInfo);

                if (page > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'btn btn-secondary';
                    prevBtn.style.cssText = 'margin-right: 10px; padding: 8px 16px;';
                    prevBtn.textContent = '← Previous';
                    prevBtn.onclick = () => loadDeleteRecords(filter, page - 1);
                    paginationDiv.appendChild(prevBtn);
                }

                if (page < totalPages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'btn btn-secondary';
                    nextBtn.style.cssText = 'padding: 8px 16px;';
                    nextBtn.textContent = 'Next →';
                    nextBtn.onclick = () => loadDeleteRecords(filter, page + 1);
                    paginationDiv.appendChild(nextBtn);
                }

                container.appendChild(paginationDiv);
            }
        });
    }

    // Edit a record
    function editRecord(recordId) {
        const records = getStoredData();
        const record = records.find(r => r.id === recordId);
        
        if (!record) {
            alert('Record not found.');
            return;
        }

        // Populate edit form
        document.getElementById('edit-record-id').value = record.id;
        document.getElementById('edit-full-name').value = record.fullName || '';
        document.getElementById('edit-birth-date').value = record.birthDate || '';
        document.getElementById('edit-death-date').value = record.deathDate || '';
        document.getElementById('edit-veteran-status').value = record.veteranStatus || '';
        document.getElementById('edit-branch').value = record.branch || '';
        document.getElementById('edit-war-era-select').value = record.warEra || '';
        document.getElementById('edit-section').value = record.section || '';
        document.getElementById('edit-plot-number').value = record.plotNumber || '';
        document.getElementById('edit-latitude').value = record.latitude || '';
        document.getElementById('edit-longitude').value = record.longitude || '';
        document.getElementById('edit-marker-condition').value = record.markerCondition || '';
        document.getElementById('edit-marker-type').value = record.markerType || '';
        document.getElementById('edit-inscription').value = record.inscription || '';
        document.getElementById('edit-notes').value = record.notes || '';
        document.getElementById('edit-image-url').value = record.imageUrl || '';
        document.getElementById('edit-findagrave-url').value = record.findAGraveUrl || '';
        document.getElementById('edit-entered-by').value = record.enteredBy || '';
        document.getElementById('edit-entry-date').value = record.entryDate || '';

        // Show/hide military fields
        const veteranStatus = record.veteranStatus;
        const militaryInfo = document.getElementById('edit-military-info');
        const warEra = document.getElementById('edit-war-era');
        
        if (veteranStatus === 'yes') {
            if (militaryInfo) militaryInfo.style.display = 'block';
            if (warEra) warEra.style.display = 'block';
        } else {
            if (militaryInfo) militaryInfo.style.display = 'none';
            if (warEra) warEra.style.display = 'none';
        }

        // Show modal
        const modal = document.getElementById('edit-modal');
        if (modal) modal.style.display = 'block';
    }

    // Handle edit form submission
    const editForm = document.getElementById('edit-record-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const recordId = document.getElementById('edit-record-id').value;
            const records = getStoredData();
            const recordIndex = records.findIndex(r => r.id === recordId);
            
            if (recordIndex === -1) {
                alert('Record not found.');
                return;
            }

            // Update record
            records[recordIndex] = {
                ...records[recordIndex],
                fullName: document.getElementById('edit-full-name').value.trim(),
                birthDate: document.getElementById('edit-birth-date').value || null,
                deathDate: document.getElementById('edit-death-date').value || null,
                veteranStatus: document.getElementById('edit-veteran-status').value || null,
                branch: document.getElementById('edit-branch').value || null,
                warEra: document.getElementById('edit-war-era-select').value || null,
                section: document.getElementById('edit-section').value.trim() || null,
                plotNumber: document.getElementById('edit-plot-number').value.trim() || null,
                latitude: document.getElementById('edit-latitude').value ? parseFloat(document.getElementById('edit-latitude').value) : null,
                longitude: document.getElementById('edit-longitude').value ? parseFloat(document.getElementById('edit-longitude').value) : null,
                markerCondition: document.getElementById('edit-marker-condition').value || null,
                markerType: document.getElementById('edit-marker-type').value || null,
                inscription: document.getElementById('edit-inscription').value.trim() || null,
                notes: document.getElementById('edit-notes').value.trim() || null,
                imageUrl: document.getElementById('edit-image-url').value.trim() || null,
                findAGraveUrl: document.getElementById('edit-findagrave-url').value.trim() || null,
                enteredBy: document.getElementById('edit-entered-by').value.trim(),
                entryDate: document.getElementById('edit-entry-date').value
            };

            saveStoredData(records);
            invalidateCache(); // Clear cache after update
            
            // Close modal
            const modal = document.getElementById('edit-modal');
            if (modal) modal.style.display = 'none';
            
            alert('Record updated successfully!');
            loadManagementData();
        });
    }

    // Close edit modal
    const closeEditModal = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editModal = document.getElementById('edit-modal');
    
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    // Handle veteran status change in edit form
    const editVeteranStatus = document.getElementById('edit-veteran-status');
    if (editVeteranStatus) {
        editVeteranStatus.addEventListener('change', function() {
            const militaryInfo = document.getElementById('edit-military-info');
            const warEra = document.getElementById('edit-war-era');
            
            if (this.value === 'yes') {
                if (militaryInfo) militaryInfo.style.display = 'block';
                if (warEra) warEra.style.display = 'block';
            } else {
                if (militaryInfo) militaryInfo.style.display = 'none';
                if (warEra) warEra.style.display = 'none';
            }
        });
    }

    // Delete a single record
    function deleteRecord(recordId, recordName) {
        if (!confirm(`Are you sure you want to delete the record for "${recordName}"?\n\nThis action cannot be undone!`)) {
            return;
        }

        const records = getStoredData();
        const filteredRecords = records.filter(r => r.id !== recordId);
        saveStoredData(filteredRecords);
        invalidateCache(); // Clear cache after deletion

        alert(`Record for "${recordName}" has been deleted.`);
        loadManagementData();
    }

    // Check for duplicates
    const checkDuplicatesBtn = document.getElementById('check-duplicates-btn');
    if (checkDuplicatesBtn) {
        checkDuplicatesBtn.addEventListener('click', function() {
            checkForDuplicates();
        });
    }

    function checkForDuplicates() {
        const records = getStoredData();
        const duplicates = [];
        const seen = new Map();

        records.forEach((record, index) => {
            const key = record.fullName.toLowerCase().trim();
            
            if (seen.has(key)) {
                const existingIndex = seen.get(key);
                const existingRecord = records[existingIndex];
                
                // Check if this is already in duplicates list
                let duplicateGroup = duplicates.find(d => d.name.toLowerCase() === key);
                if (!duplicateGroup) {
                    duplicateGroup = {
                        name: existingRecord.fullName,
                        records: [existingRecord]
                    };
                    duplicates.push(duplicateGroup);
                }
                
                // Add current record if not already in group
                if (!duplicateGroup.records.find(r => r.id === record.id)) {
                    duplicateGroup.records.push(record);
                }
            } else {
                seen.set(key, index);
            }
        });

        displayDuplicates(duplicates);
    }

    function displayDuplicates(duplicates) {
        const resultsDiv = document.getElementById('duplicates-results');
        const listDiv = document.getElementById('duplicates-list');
        
        if (!resultsDiv || !listDiv) return;

        if (duplicates.length === 0) {
            listDiv.innerHTML = '<p style="color: var(--success-color);">✓ No duplicates found!</p>';
            resultsDiv.style.display = 'block';
            return;
        }

        listDiv.innerHTML = ''; // Clear previous results

        const header = document.createElement('p');
        header.style.cssText = 'color: var(--error-color); font-weight: bold; margin-bottom: 15px;';
        header.textContent = `Found ${duplicates.length} duplicate group(s):`;
        listDiv.appendChild(header);
        
        duplicates.forEach((group, index) => {
            const groupDiv = document.createElement('div');
            groupDiv.style.cssText = 'margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid var(--error-color);';
            
            const groupTitle = document.createElement('h5');
            groupTitle.style.cssText = 'color: var(--error-color); margin-bottom: 10px;';
            groupTitle.textContent = `Group ${index + 1}: "${escapeHtml(group.name)}" (${group.records.length} records)`;
            groupDiv.appendChild(groupTitle);
            
            group.records.forEach((record, recIndex) => {
                const recordDiv = document.createElement('div');
                recordDiv.style.cssText = 'margin: 10px 0; padding: 10px; background: var(--bg-color); border-radius: 3px; display: flex; justify-content: space-between; align-items: center;';
                
                const recordInfo = document.createElement('span');
                recordInfo.innerHTML = `<strong>Record ${recIndex + 1}:</strong> ` +
                    `ID: ${record.id.substring(0, 8)}... | ` +
                    `Birth: ${record.birthDate || 'N/A'} | ` +
                    `Death: ${record.deathDate || 'N/A'} | ` +
                    `Section: ${record.section || 'N/A'} | ` +
                    `Entered By: ${escapeHtml(record.enteredBy || 'N/A')}`;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn';
                deleteBtn.style.cssText = 'background: var(--error-color); color: white; padding: 4px 8px; font-size: 0.8em; margin-left: 10px;';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    deleteRecord(record.id, record.fullName);
                    setTimeout(() => checkForDuplicates(), 100); // Refresh duplicates after deletion
                };
                
                recordDiv.appendChild(recordInfo);
                recordDiv.appendChild(deleteBtn);
                groupDiv.appendChild(recordDiv);
            });
            
            listDiv.appendChild(groupDiv);
        });
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Search for records to delete/edit with debouncing
    const searchDeleteInput = document.getElementById('search-delete-input');
    let searchTimeout = null;
    if (searchDeleteInput) {
        searchDeleteInput.addEventListener('input', function() {
            const filterValue = this.value;
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            // Debounce: wait 300ms after user stops typing
            searchTimeout = setTimeout(() => {
                loadDeleteRecords(filterValue, 1); // Reset to page 1 on new search
            }, 300);
        });
    }

    // Export all data
    const exportAllBtn = document.getElementById('export-all-btn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', function() {
            const records = getStoredData();
            if (records.length === 0) {
                alert('No records to export.');
                return;
            }

            const headers = ['Full Name', 'Birth Date', 'Death Date', 'Veteran Status', 'Branch', 'War/Era', 
                            'Section', 'Plot Number', 'Latitude', 'Longitude', 'Marker Condition', 'Marker Type', 'Inscription', 
                            'Notes', 'Entered By', 'Entry Date'];
            
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
            link.setAttribute('download', `cemetery_records_backup_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Export backup (JSON)
    const exportBackupBtn = document.getElementById('export-backup-btn');
    if (exportBackupBtn) {
        exportBackupBtn.addEventListener('click', function() {
            const records = getStoredData();
            if (records.length === 0) {
                alert('No records to backup.');
                return;
            }

            const jsonContent = JSON.stringify(records, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `cemetery_records_backup_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Clear all records
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            const records = getStoredData();
            if (records.length === 0) {
                alert('Database is already empty.');
                return;
            }

            const confirmMsg = `⚠️ WARNING: This will PERMANENTLY DELETE ALL ${records.length} RECORDS!\n\nThis action CANNOT be undone!\n\nType "DELETE ALL" to confirm:`;
            const userInput = prompt(confirmMsg);
            
            if (userInput === 'DELETE ALL') {
                saveStoredData([]);
                invalidateCache(); // Clear cache after deletion
                alert('All records have been deleted. The database is now empty.');
                loadManagementData();
            } else {
                alert('Clear operation cancelled.');
            }
        });
    }

    // Helper functions
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Listen for data updates to refresh management stats
    window.addEventListener('cemeteryDataUpdated', function() {
        // Invalidate cache when data is updated
        invalidateCache();
        // Only refresh if management tab is active
        const managementTab = document.getElementById('management-tab');
        if (managementTab && managementTab.classList.contains('active')) {
            loadManagementData();
        }
    });
});

