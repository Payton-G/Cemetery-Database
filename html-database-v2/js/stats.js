// Statistics JavaScript for Home Page

document.addEventListener('DOMContentLoaded', function() {
    const totalRecordsEl = document.getElementById('total-records');
    const veteransCountEl = document.getElementById('veterans-count');
    const recentEntriesEl = document.getElementById('recent-entries');

    function updateStats() {
        const records = getStoredData();
        
        // Total records
        if (totalRecordsEl) {
            totalRecordsEl.textContent = records.length;
        }

        // Veterans count
        if (veteransCountEl) {
            const veterans = records.filter(r => r.veteranStatus === 'yes');
            veteransCountEl.textContent = veterans.length;
        }

        // Recent entries (this week)
        if (recentEntriesEl) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recent = records.filter(r => {
                if (!r.createdAt) return false;
                const entryDate = new Date(r.createdAt);
                return entryDate >= oneWeekAgo;
            });
            
            recentEntriesEl.textContent = recent.length;
        }
    }

    updateStats();
    
    // Listen for data updates
    window.addEventListener('cemeteryDataUpdated', function() {
        updateStats();
    });
});

