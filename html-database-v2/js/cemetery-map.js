// Cemetery Grid Map JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map-container');
    const mapSearch = document.getElementById('map-search');
    const sectionFilter = document.getElementById('section-filter');
    const resetMapBtn = document.getElementById('reset-map');
    const mapInfo = document.getElementById('map-info');
    const selectedLocation = document.getElementById('selected-location');
    const locationTitle = document.getElementById('location-title');
    const locationGraves = document.getElementById('location-graves');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const gpsMapBtn = document.getElementById('gps-map-btn');
    const gridView = document.getElementById('grid-view');
    const gpsMapView = document.getElementById('gps-map-view');
    const googleMapContainer = document.getElementById('google-map');
    const gpsCount = document.getElementById('gps-count');

    let allRecords = [];
    let gridData = {};
    let selectedCell = null;
    let searchTerm = '';
    let filteredSection = '';
    let leafletMap = null;

    // Initialize map
    function initMap() {
        allRecords = getStoredData();
        buildGridData();
        populateSectionFilter();
        renderMap();
    }

    // Build grid data structure from records
    function buildGridData() {
        gridData = {};
        
        allRecords.forEach(record => {
            // Prefer grid coordinates if available, otherwise use section/plot
            let gridX = record.gridX;
            let gridY = record.gridY;
            let section = record.section;
            let plot = record.plotNumber;
            
            // If grid coordinates exist, use them
            if (gridX !== null && gridX !== undefined && gridY !== null && gridY !== undefined) {
                const key = `${gridX},${gridY}`;
                
                if (!gridData[key]) {
                    gridData[key] = {
                        gridX: gridX,
                        gridY: gridY,
                        section: section || `Row ${gridY}`,
                        plot: plot || `Col ${gridX}`,
                        graves: [],
                        hasVeterans: false
                    };
                }
                
                gridData[key].graves.push(record);
                if (record.veteranStatus === 'yes') {
                    gridData[key].hasVeterans = true;
                }
            } else if (section) {
                // Fallback to section/plot method
                const normalizedSection = normalizeSection(section);
                const plotNum = plot || 'Unknown';
                
                const key = `${normalizedSection}-${plotNum}`;
                
                if (!gridData[key]) {
                    gridData[key] = {
                        section: normalizedSection,
                        plot: plotNum,
                        graves: [],
                        hasVeterans: false
                    };
                }
                
                gridData[key].graves.push(record);
                if (record.veteranStatus === 'yes') {
                    gridData[key].hasVeterans = true;
                }
            }
        });
    }

    // Normalize section names for consistency
    function normalizeSection(section) {
        if (!section) return 'Unknown';
        
        // Remove "Section" prefix, trim, uppercase
        let normalized = section.toString().toUpperCase().trim();
        normalized = normalized.replace(/^SECTION\s*/i, '');
        normalized = normalized.replace(/^SEC\s*/i, '');
        
        return normalized || 'Unknown';
    }

    // Get unique sections for filter
    function populateSectionFilter() {
        const sections = new Set();
        Object.values(gridData).forEach(cell => {
            if (cell.section && cell.section !== 'Unknown') {
                sections.add(cell.section);
            }
        });
        
        const sortedSections = Array.from(sections).sort();
        sortedSections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = `Section ${section}`;
            sectionFilter.appendChild(option);
        });
    }

    // Render the grid map
    function renderMap() {
        if (!mapContainer) return;
        
        mapContainer.innerHTML = '';
        
        // Check if we have any data
        if (Object.keys(gridData).length === 0) {
            mapContainer.innerHTML = '<div class="no-records"><p>No cemetery location data available.</p><p>To see the grid map, enter records with <strong>Section</strong> and <strong>Plot Number</strong> or <strong>Grid Coordinates</strong> information.</p><p><a href="data-entry.html">Go to Data Entry</a> to add records with location data.</p></div>';
            return;
        }
        
        // Check if we have grid coordinates (gridX, gridY) or section/plot data
        const hasGridCoords = Object.values(gridData).some(cell => 
            cell.gridX !== undefined && cell.gridY !== undefined
        );
        
        if (hasGridCoords) {
            renderGridCoordinateMap();
        } else {
            renderSectionPlotMap();
        }
    }
    
    // Render map using grid coordinates (gridX, gridY)
    function renderGridCoordinateMap() {
        // Find min/max coordinates to determine grid size
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        Object.values(gridData).forEach(cell => {
            if (cell.gridX !== undefined && cell.gridY !== undefined) {
                minX = Math.min(minX, cell.gridX);
                maxX = Math.max(maxX, cell.gridX);
                minY = Math.min(minY, cell.gridY);
                maxY = Math.max(maxY, cell.gridY);
            }
        });
        
        const gridWidth = maxX - minX + 1;
        const gridHeight = maxY - minY + 1;
        
        // Create grid container
        const grid = document.createElement('div');
        grid.className = 'cemetery-grid coordinate-grid';
        grid.style.gridTemplateColumns = `60px repeat(${gridWidth}, 1fr)`;
        grid.style.gridTemplateRows = `40px repeat(${gridHeight}, 1fr)`;
        
        // Create header row with column numbers
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'grid-header-cell';
        grid.appendChild(emptyHeader);
        
        for (let x = minX; x <= maxX; x++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-header-cell';
            headerCell.textContent = x;
            grid.appendChild(headerCell);
        }
        
        // Create data rows
        for (let y = minY; y <= maxY; y++) {
            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'grid-section-label';
            rowLabel.textContent = y;
            grid.appendChild(rowLabel);
            
            // Cells for this row
            for (let x = minX; x <= maxX; x++) {
                const key = `${x},${y}`;
                const cellData = gridData[key];
                
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.gridX = x;
                cell.dataset.gridY = y;
                
                if (cellData && cellData.graves.length > 0) {
                    const graveCount = cellData.graves.length;
                    const names = cellData.graves.map(g => g.fullName).join(', ');
                    
                    cell.classList.add('has-graves');
                    if (cellData.hasVeterans) {
                        cell.classList.add('has-veteran');
                    }
                    
                    // Show name count and first name on cell
                    cell.innerHTML = `<div class="cell-content"><div class="grave-count">${graveCount}</div><div class="grave-name">${escapeHtml(cellData.graves[0].fullName)}</div></div>`;
                    cell.title = `Grid (${x}, ${y}): ${names}`;
                    
                    if (matchesSearch(cellData)) {
                        cell.classList.add('highlighted');
                    }
                    
                    cell.addEventListener('click', () => selectGridCell(x, y));
                } else {
                    cell.classList.add('empty');
                    cell.title = `Grid (${x}, ${y}): No data`;
                }
                
                grid.appendChild(cell);
            }
        }
        
        mapContainer.appendChild(grid);
    }
    
    // Render map using section/plot (original method)
    function renderSectionPlotMap() {
        // Get all unique sections and plots
        const sections = new Set();
        const plots = new Set();
        
        Object.values(gridData).forEach(cell => {
            if (cell.section && cell.section !== 'Unknown') sections.add(cell.section);
            if (cell.plot && cell.plot !== 'Unknown') plots.add(cell.plot);
        });
        
        if (sections.size === 0 || plots.size === 0) {
            mapContainer.innerHTML = '<div class="no-records"><p>No complete location data found.</p><p>Records need both <strong>Section</strong> and <strong>Plot Number</strong> to appear on the grid.</p></div>';
            return;
        }
        
        const sortedSections = Array.from(sections).sort();
        const sortedPlots = Array.from(plots).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });
        
        // Create grid
        const grid = document.createElement('div');
        grid.className = 'cemetery-grid';
        
        // Create header row
        const headerRow = document.createElement('div');
        headerRow.className = 'grid-row grid-header';
        
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'grid-header-cell';
        headerRow.appendChild(emptyHeader);
        
        sortedPlots.forEach(plot => {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-header-cell';
            headerCell.textContent = plot;
            headerRow.appendChild(headerCell);
        });
        grid.appendChild(headerRow);
        
        // Create data rows
        sortedSections.forEach(section => {
            const row = document.createElement('div');
            row.className = 'grid-row';
            
            // Section label
            const sectionLabel = document.createElement('div');
            sectionLabel.className = 'grid-section-label';
            sectionLabel.textContent = section;
            row.appendChild(sectionLabel);
            
            // Plot cells
            sortedPlots.forEach(plot => {
                const cell = document.createElement('div');
                const key = `${section}-${plot}`;
                const cellData = gridData[key];
                
                cell.className = 'grid-cell';
                cell.dataset.section = section;
                cell.dataset.plot = plot;
                
                if (cellData) {
                    const graveCount = cellData.graves.length;
                    cell.classList.add('has-graves');
                    if (cellData.hasVeterans) {
                        cell.classList.add('has-veteran');
                    }
                    cell.title = `Section ${section}, Plot ${plot}: ${graveCount} grave(s)`;
                    
                    if (matchesSearch(cellData)) {
                        cell.classList.add('highlighted');
                    }
                } else {
                    cell.classList.add('empty');
                    cell.title = `Section ${section}, Plot ${plot}: No data`;
                }
                
                cell.addEventListener('click', () => selectCell(section, plot));
                row.appendChild(cell);
            });
            
            grid.appendChild(row);
        });
        
        mapContainer.appendChild(grid);
    }
    
    // Select a grid cell by coordinates
    function selectGridCell(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        const cellData = gridData[key];
        
        if (cellData && cellData.graves.length > 0) {
            displayLocationGraves(
                `Grid (${gridX}, ${gridY})`,
                cellData.section || `Row ${gridY}`,
                cellData.graves
            );
        } else {
            locationTitle.textContent = `Grid (${gridX}, ${gridY})`;
            locationGraves.innerHTML = '<p>No graves recorded in this location.</p>';
            selectedLocation.style.display = 'block';
        }
        
        selectedLocation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Check if cell data matches search criteria
    function matchesSearch(cellData) {
        if (!searchTerm && !filteredSection) return false;
        
        if (filteredSection && cellData.section !== filteredSection) {
            return false;
        }
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return cellData.graves.some(grave => {
                return grave.fullName.toLowerCase().includes(searchLower) ||
                       (grave.section && grave.section.toLowerCase().includes(searchLower)) ||
                       (grave.plotNumber && grave.plotNumber.toLowerCase().includes(searchLower));
            });
        }
        
        return false;
    }

    // Select a cell and show its graves (section/plot method)
    function selectCell(section, plot) {
        selectedCell = { section, plot };
        const key = `${section}-${plot}`;
        const cellData = gridData[key];
        
        if (cellData && cellData.graves.length > 0) {
            displayLocationGraves(section, plot, cellData.graves);
        } else {
            locationTitle.textContent = `Section ${section}, Plot ${plot}`;
            locationGraves.innerHTML = '<p>No graves recorded in this location.</p>';
            selectedLocation.style.display = 'block';
        }
        
        // Scroll to location details
        selectedLocation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Display graves for selected location
    function displayLocationGraves(locationLabel, section, graves) {
        locationTitle.textContent = `${locationLabel} (${graves.length} grave${graves.length !== 1 ? 's' : ''})`;
        
        locationGraves.innerHTML = '';
        
        graves.forEach(grave => {
            const graveCard = document.createElement('div');
            graveCard.className = 'grave-card';
            
            let html = `<h4>${escapeHtml(grave.fullName)}`;
            if (grave.veteranStatus === 'yes') {
                html += ` <span class="veteran-badge">VETERAN</span>`;
            }
            html += `</h4>`;
            
            html += `<div class="grave-details">`;
            
            if (grave.gridX !== undefined && grave.gridY !== undefined) {
                html += `<p><strong>Grid Coordinates:</strong> (${grave.gridX}, ${grave.gridY})</p>`;
            }
            
            if (grave.birthDate || grave.deathDate) {
                html += `<p><strong>Dates:</strong> ${formatDate(grave.birthDate)} - ${formatDate(grave.deathDate)}</p>`;
            }
            
            if (grave.veteranStatus === 'yes') {
                if (grave.branch) {
                    html += `<p><strong>Branch:</strong> ${escapeHtml(grave.branch)}</p>`;
                }
                if (grave.warEra) {
                    html += `<p><strong>War/Era:</strong> ${escapeHtml(grave.warEra)}</p>`;
                }
            }
            
            if (grave.markerCondition) {
                html += `<p><strong>Condition:</strong> ${escapeHtml(grave.markerCondition)}</p>`;
            }
            
            if (grave.markerType) {
                html += `<p><strong>Type:</strong> ${escapeHtml(grave.markerType)}</p>`;
            }
            
            if (grave.latitude && grave.longitude) {
                html += `<p><strong>GPS:</strong> ${grave.latitude.toFixed(6)}, ${grave.longitude.toFixed(6)}`;
                html += ` <a href="https://www.google.com/maps?q=${grave.latitude},${grave.longitude}" target="_blank" style="color: var(--primary-color); text-decoration: none;">📍 View on Map</a></p>`;
            }
            
            html += `</div>`;
            
            graveCard.innerHTML = html;
            locationGraves.appendChild(graveCard);
        });
        
        selectedLocation.style.display = 'block';
    }

    // Event listeners
    if (mapSearch) {
        mapSearch.addEventListener('input', function() {
            searchTerm = this.value.toLowerCase().trim();
            renderMap();
        });
    }

    if (sectionFilter) {
        sectionFilter.addEventListener('change', function() {
            filteredSection = this.value;
            renderMap();
        });
    }

    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', function() {
            searchTerm = '';
            filteredSection = '';
            if (mapSearch) mapSearch.value = '';
            if (sectionFilter) sectionFilter.value = '';
            selectedCell = null;
            selectedLocation.style.display = 'none';
            renderMap();
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // View switching
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            gpsMapBtn.classList.remove('active');
            if (gridView) gridView.style.display = 'block';
            if (gpsMapView) gpsMapView.style.display = 'none';
        });
    }

    if (gpsMapBtn) {
        gpsMapBtn.addEventListener('click', function() {
            gpsMapBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            if (gridView) gridView.style.display = 'none';
            if (gpsMapView) gpsMapView.style.display = 'block';
            initGpsMap();
        });
    }

    // Initialize GPS Map with Leaflet
    function initGpsMap() {
        if (leafletMap) {
            leafletMap.remove();
        }

        const recordsWithGps = allRecords.filter(r => r.latitude && r.longitude);
        
        if (gpsCount) {
            gpsCount.textContent = `${recordsWithGps.length} grave${recordsWithGps.length !== 1 ? 's' : ''} with GPS coordinates`;
        }

        if (recordsWithGps.length === 0) {
            if (googleMapContainer) {
                googleMapContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-light);"><p>No graves with GPS coordinates found.</p><p>Use the "Get Current Location" button when entering data to add GPS coordinates.</p></div>';
            }
            return;
        }

        // Calculate center point (average of all coordinates)
        let avgLat = 0, avgLon = 0;
        recordsWithGps.forEach(r => {
            avgLat += r.latitude;
            avgLon += r.longitude;
        });
        avgLat /= recordsWithGps.length;
        avgLon /= recordsWithGps.length;

        // Initialize Leaflet map
        if (googleMapContainer && typeof L !== 'undefined') {
            leafletMap = L.map('google-map').setView([avgLat, avgLon], 16);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(leafletMap);

            // Add markers for each grave
            recordsWithGps.forEach(record => {
                const markerColor = record.veteranStatus === 'yes' ? 'red' : 'blue';
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const marker = L.marker([record.latitude, record.longitude], { icon: icon }).addTo(leafletMap);
                
                let popupContent = `<strong>${escapeHtml(record.fullName)}</strong>`;
                if (record.veteranStatus === 'yes') {
                    popupContent += ' <span style="color: red;">[VETERAN]</span>';
                }
                popupContent += `<br>${escapeHtml(record.section || 'Unknown Section')}`;
                if (record.plotNumber) {
                    popupContent += `, Plot ${escapeHtml(record.plotNumber)}`;
                }
                popupContent += `<br><small>${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}</small>`;
                popupContent += `<br><a href="https://www.google.com/maps?q=${record.latitude},${record.longitude}" target="_blank" style="color: var(--primary-color);">Open in Google Maps</a>`;
                
                marker.bindPopup(popupContent);
            });
        } else {
            if (googleMapContainer) {
                googleMapContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-light);"><p>Map library loading...</p></div>';
            }
        }
    }

    // Initialize
    initMap();
    
    // Listen for data updates
    window.addEventListener('cemeteryDataUpdated', function() {
        initMap(); // Reinitialize map with new data
    });
});

