// Search JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchQuery = document.getElementById('search-query');
    const searchVeteran = document.getElementById('search-veteran');
    const searchCondition = document.getElementById('search-condition');
    const resultsContainer = document.getElementById('results-container');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const clearSearchBtn = document.getElementById('clear-search');

    let searchResults = [];
    let currentPage = 1;
    const recordsPerPage = 24;

    // Perform search
    function performSearch() {
        const query = searchQuery.value.toLowerCase().trim();
        const veteranFilter = searchVeteran.value;
        const conditionFilter = searchCondition.value;

        const allRecords = getStoredData();
        let results = allRecords;

        // Filter by search query
        if (query) {
            results = results.filter(record => {
                return Object.values(record).some(value => {
                    if (value === null || value === undefined) return false;
                    return value.toString().toLowerCase().includes(query);
                });
            });
        }

        // Filter by veteran status
        if (veteranFilter) {
            results = results.filter(record => record.veteranStatus === veteranFilter);
        }

        // Filter by condition
        if (conditionFilter) {
            results = results.filter(record => record.markerCondition === conditionFilter);
        }

        searchResults = results;
        currentPage = 1; // Reset to first page on new search
        displayResults();
    }

    // Display search results with pagination
    function displayResults() {
        if (searchResults.length === 0) {
            resultsContainer.innerHTML = '';
            noResults.style.display = 'block';
            resultsCount.textContent = 'No results found';
            document.getElementById('pagination-container').style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        
        // Calculate pagination
        const totalPages = Math.ceil(searchResults.length / recordsPerPage);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, searchResults.length);
        const pageResults = searchResults.slice(startIndex, endIndex);

        resultsCount.textContent = `Found ${searchResults.length} record${searchResults.length !== 1 ? 's' : ''} (Showing ${startIndex + 1}-${endIndex}, Page ${currentPage} of ${totalPages})`;
        resultsContainer.innerHTML = '';

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        pageResults.forEach(record => {
            const recordCard = createRecordCard(record);
            fragment.appendChild(recordCard);
        });
        resultsContainer.appendChild(fragment);

        updateSearchPagination();
        
        // Scroll to results section smoothly when displaying first page (new search)
        // Pagination buttons will handle scrolling for other pages
        if (currentPage === 1) {
            const searchResultsSection = document.getElementById('search-results');
            if (searchResultsSection) {
                // Use setTimeout to ensure DOM is updated before scrolling
                setTimeout(() => {
                    searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
            }
        }
    }

    // Update pagination controls for search
    function updateSearchPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(searchResults.length / recordsPerPage);
        
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
                displayResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationContainer.appendChild(prevBtn);

        // Page numbers
        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'pagination-numbers';
        
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, currentPage + 3);
        
        if (endPage - startPage < 6) {
            if (startPage === 1) {
                endPage = Math.min(7, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 6);
            }
        }

        if (startPage > 1) {
            const firstBtn = createSearchPageButton(1);
            pageNumbers.appendChild(firstBtn);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.appendChild(createSearchPageButton(i));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            const lastBtn = createSearchPageButton(totalPages);
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
                displayResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // Create a page number button for search
    function createSearchPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.className = 'pagination-page-btn';
        if (pageNum === currentPage) {
            btn.classList.add('active');
        }
        btn.textContent = pageNum;
        btn.onclick = () => {
            currentPage = pageNum;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        return btn;
    }

    // Create a record card element (reusing from view-records.js)
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

    // Clear search
    function clearSearch() {
        searchQuery.value = '';
        searchVeteran.value = '';
        searchCondition.value = '';
        resultsContainer.innerHTML = '';
        resultsCount.textContent = '';
        noResults.style.display = 'none';
        searchResults = [];
        currentPage = 1;
        document.getElementById('pagination-container').style.display = 'none';
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // Real-time search as user types
    if (searchQuery) {
        searchQuery.addEventListener('input', performSearch);
    }

    if (searchVeteran) {
        searchVeteran.addEventListener('change', performSearch);
    }

    if (searchCondition) {
        searchCondition.addEventListener('change', performSearch);
    }
    
    // Listen for data updates - refresh search if there are current results
    window.addEventListener('cemeteryDataUpdated', function() {
        // Only refresh if search has been performed
        if (searchQuery && searchQuery.value.trim() || 
            (searchVeteran && searchVeteran.value) || 
            (searchCondition && searchCondition.value)) {
            performSearch();
        }
    });
});

