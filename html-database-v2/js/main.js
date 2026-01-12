// Main JavaScript file for Memorial Park Cemetery Database

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Memorial Park Cemetery Database initialized');
    
    // Set today's date as default for entry date field if it exists
    const entryDateField = document.getElementById('entry-date');
    if (entryDateField && !entryDateField.value) {
        const today = new Date().toISOString().split('T')[0];
        entryDateField.value = today;
    }
});

// Utility function to get data from localStorage
function getStoredData() {
    const data = localStorage.getItem('cemeteryRecords');
    return data ? JSON.parse(data) : [];
}

// Utility function to save data to localStorage
function saveStoredData(data) {
    localStorage.setItem('cemeteryRecords', JSON.stringify(data));
    // Dispatch event to notify all components of data change
    window.dispatchEvent(new CustomEvent('cemeteryDataUpdated', { 
        detail: { recordCount: data.length } 
    }));
    // Invalidate any caches that might exist
    if (window.invalidateAdminCache) {
        window.invalidateAdminCache();
    }
}

// Generate unique ID for records
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format date for short display
function formatDateShort(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

