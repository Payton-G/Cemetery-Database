// View Records JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const recordsContainer = document.getElementById('records-container');
    const noRecordsDiv = document.getElementById('no-records');
    const recordsCountDiv = document.getElementById('records-count');
    const filterInput = document.getElementById('filter-input');
    const sortSelect = document.getElementById('sort-select');
    const exportBtn = document.getElementById('export-btn');

    let allRecords = [];
    let filteredRecords = [];
    let currentPage = 1;
    const recordsPerPage = 24;

    // Load and display records
    function loadRecords() {
        allRecords = getStoredData();
        filteredRecords = [...allRecords];
        currentPage = 1; // Reset to first page when loading
        sortRecords();
        displayRecords();
        updateRecordsCount();
        updatePagination();
    }

    // Display records for current page
    function displayRecords() {
        if (filteredRecords.length === 0) {
            recordsContainer.innerHTML = '';
            noRecordsDiv.style.display = 'block';
            document.getElementById('pagination-container').style.display = 'none';
            return;
        }

        noRecordsDiv.style.display = 'none';
        recordsContainer.innerHTML = '';

        // Calculate pagination
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredRecords.length);
        const pageRecords = filteredRecords.slice(startIndex, endIndex);

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        pageRecords.forEach(record => {
            const recordCard = createRecordCard(record);
            fragment.appendChild(recordCard);
        });
        recordsContainer.appendChild(fragment);
        
        // Scroll to records section smoothly when displaying first page (new filter/search)
        // Pagination buttons will handle scrolling for other pages
        if (currentPage === 1) {
            const recordsSection = document.querySelector('.records-section');
            if (recordsSection) {
                // Use setTimeout to ensure DOM is updated before scrolling
                setTimeout(() => {
                    recordsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
            }
        }
    }

    // Create a record card element
    function createRecordCard(record) {
        const card = document.createElement('div');
        card.className = 'record-card';

        let html = `<h3>${escapeHtml(record.fullName)}`;
        if (record.veteranStatus === 'yes') {
            html += `<span class="veteran-badge">VETERAN</span>`;
        }
        html += `</h3>`;

        // Display image if available
        if (record.imageUrl) {
            html += `<div class="record-image-container">
                <img src="${escapeHtml(record.imageUrl)}" alt="Memorial for ${escapeHtml(record.fullName)}" class="record-image" onerror="this.style.display='none'">
            </div>`;
        }

        html += `<div class="record-details">`;

        if (record.birthDate || record.deathDate) {
            html += `<div class="record-detail">
                <span class="record-detail-label">Dates</span>
                <span class="record-detail-value">${formatDate(record.birthDate)} - ${formatDate(record.deathDate)}</span>
            </div>`;
        }

        if (record.veteranStatus === 'yes') {
            if (record.branch) {
                html += `<div class="record-detail">
                    <span class="record-detail-label">Branch</span>
                    <span class="record-detail-value">${escapeHtml(record.branch)}</span>
                </div>`;
            }
            if (record.warEra) {
                html += `<div class="record-detail">
                    <span class="record-detail-label">War/Era</span>
                    <span class="record-detail-value">${escapeHtml(record.warEra)}</span>
                </div>`;
            }
        }

        if (record.section) {
            html += `<div class="record-detail">
                <span class="record-detail-label">Section</span>
                <span class="record-detail-value">${escapeHtml(record.section)}</span>
            </div>`;
        }

        if (record.plotNumber) {
            html += `<div class="record-detail">
                <span class="record-detail-label">Plot Number</span>
                <span class="record-detail-value">${escapeHtml(record.plotNumber)}</span>
            </div>`;
        }

        if (record.latitude && record.longitude) {
            html += `<div class="record-detail" style="grid-column: 1 / -1;">
                <span class="record-detail-label">GPS Coordinates</span>
                <span class="record-detail-value">
                    ${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}
                    <a href="https://www.google.com/maps?q=${record.latitude},${record.longitude}" target="_blank" style="color: var(--primary-color); text-decoration: none; margin-left: 10px;">📍 View on Map</a>
                </span>
            </div>`;
        }

        if (record.markerCondition) {
            html += `<div class="record-detail">
                <span class="record-detail-label">Marker Condition</span>
                <span class="record-detail-value">${escapeHtml(record.markerCondition)}</span>
            </div>`;
        }

        if (record.markerType) {
            html += `<div class="record-detail">
                <span class="record-detail-label">Marker Type</span>
                <span class="record-detail-value">${escapeHtml(record.markerType)}</span>
            </div>`;
        }

        if (record.inscription) {
            html += `<div class="record-detail" style="grid-column: 1 / -1;">
                <span class="record-detail-label">Inscription</span>
                <span class="record-detail-value">${escapeHtml(record.inscription)}</span>
            </div>`;
        }

        if (record.notes) {
            html += `<div class="record-detail" style="grid-column: 1 / -1;">
                <span class="record-detail-label">Notes</span>
                <span class="record-detail-value">${escapeHtml(record.notes)}</span>
            </div>`;
        }

        html += `<div class="record-detail">
            <span class="record-detail-label">Entered By</span>
            <span class="record-detail-value">${escapeHtml(record.enteredBy)}</span>
        </div>`;

        html += `<div class="record-detail">
            <span class="record-detail-label">Entry Date</span>
            <span class="record-detail-value">${formatDateShort(record.entryDate)}</span>
        </div>`;

        if (record.findAGraveUrl) {
            html += `<div class="record-detail" style="grid-column: 1 / -1;">
                <span class="record-detail-label">Find a Grave</span>
                <span class="record-detail-value">
                    <a href="${escapeHtml(record.findAGraveUrl)}" target="_blank" style="color: var(--primary-color); text-decoration: none;">View on Find a Grave →</a>
                </span>
            </div>`;
        }

        html += `</div>`;

        card.innerHTML = html;
        return card;
    }

    // Update records count
    function updateRecordsCount() {
        const total = allRecords.length;
        const showing = filteredRecords.length;
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, showing);
        const totalPages = Math.ceil(showing / recordsPerPage);
        
        if (showing === 0) {
            recordsCountDiv.textContent = 'No records found';
        } else if (showing === total && totalPages === 1) {
            recordsCountDiv.textContent = `Showing ${total} record${total !== 1 ? 's' : ''}`;
        } else {
            recordsCountDiv.textContent = `Showing ${startIndex + 1}-${endIndex} of ${showing} record${showing !== 1 ? 's' : ''} (Page ${currentPage} of ${totalPages})`;
        }
    }

    // Update pagination controls
    function updatePagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        paginationContainer.innerHTML = '';

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '← Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayRecords();
                updateRecordsCount();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationContainer.appendChild(prevBtn);

        // Page numbers
        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'pagination-numbers';
        
        // Show page numbers (max 7 visible)
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, currentPage + 3);
        
        // Adjust if near start or end
        if (endPage - startPage < 6) {
            if (startPage === 1) {
                endPage = Math.min(7, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 6);
            }
        }

        // First page
        if (startPage > 1) {
            const firstBtn = createPageButton(1);
            pageNumbers.appendChild(firstBtn);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }

        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.appendChild(createPageButton(i));
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            const lastBtn = createPageButton(totalPages);
            pageNumbers.appendChild(lastBtn);
        }

        paginationContainer.appendChild(pageNumbers);

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Next →';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayRecords();
                updateRecordsCount();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // Create a page number button
    function createPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.className = 'pagination-page-btn';
        if (pageNum === currentPage) {
            btn.classList.add('active');
        }
        btn.textContent = pageNum;
        btn.onclick = () => {
            currentPage = pageNum;
            displayRecords();
            updateRecordsCount();
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        return btn;
    }

    // Filter records
    function filterRecords() {
        const filterValue = filterInput.value.toLowerCase().trim();
        
        if (!filterValue) {
            filteredRecords = [...allRecords];
        } else {
            filteredRecords = allRecords.filter(record => {
                return Object.values(record).some(value => {
                    if (value === null || value === undefined) return false;
                    return value.toString().toLowerCase().includes(filterValue);
                });
            });
        }

        currentPage = 1; // Reset to first page when filtering
        sortRecords();
        displayRecords();
        updateRecordsCount();
        updatePagination();
    }

    // Sort records
    function sortRecords() {
        const sortValue = sortSelect.value;

        filteredRecords.sort((a, b) => {
            switch (sortValue) {
                case 'name':
                    return a.fullName.localeCompare(b.fullName);
                case 'date':
                    return new Date(b.entryDate) - new Date(a.entryDate);
                case 'veteran':
                    if (a.veteranStatus === 'yes' && b.veteranStatus !== 'yes') return -1;
                    if (a.veteranStatus !== 'yes' && b.veteranStatus === 'yes') return 1;
                    return a.fullName.localeCompare(b.fullName);
                case 'condition':
                    const conditionOrder = ['excellent', 'good', 'fair', 'poor', 'missing', 'damaged'];
                    const aIndex = conditionOrder.indexOf(a.markerCondition || '');
                    const bIndex = conditionOrder.indexOf(b.markerCondition || '');
                    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
                default:
                    return 0;
            }
        });
    }

    // Export data to CSV
    function exportToCSV() {
        if (filteredRecords.length === 0) {
            alert('No records to export.');
            return;
        }

        const headers = ['Full Name', 'Birth Date', 'Death Date', 'Veteran Status', 'Branch', 'War/Era', 
                        'Section', 'Plot Number', 'Latitude', 'Longitude', 'Marker Condition', 'Marker Type', 'Inscription', 
                        'Notes', 'Entered By', 'Entry Date'];
        
        const csvRows = [headers.join(',')];

        filteredRecords.forEach(record => {
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
        link.setAttribute('download', `cemetery_records_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Event listeners
    if (filterInput) {
        filterInput.addEventListener('input', filterRecords);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentPage = 1; // Reset to first page when sorting
            sortRecords();
            displayRecords();
            updateRecordsCount();
            updatePagination();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial load
    loadRecords();
    
    // Listen for data updates
    window.addEventListener('cemeteryDataUpdated', function() {
        loadRecords();
    });
});

