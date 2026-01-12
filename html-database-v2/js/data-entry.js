// Data Entry Form JavaScript with Password Protection

// ============================================
// PASSWORD CONFIGURATION
// ============================================
const DATA_ENTRY_PASSWORD = 'jrotc2025'; // Default password - CHANGE THIS!
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Data entry page loaded');
    
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const formSection = document.getElementById('admin-section'); // Alias for compatibility
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if user is already authenticated
    const isAuthenticated = sessionStorage.getItem('dataEntryAuthenticated') === 'true';
    
    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showLogin();
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const enteredPassword = passwordInput.value.trim();
            loginError.style.display = 'none';
            
            if (enteredPassword === DATA_ENTRY_PASSWORD) {
                sessionStorage.setItem('dataEntryAuthenticated', 'true');
                showAdminPanel();
                passwordInput.value = '';
            } else {
                loginError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('dataEntryAuthenticated');
            showLogin();
        });
    }

    function showLogin() {
        if (loginSection) loginSection.style.display = 'block';
        if (adminSection) adminSection.style.display = 'none';
        if (passwordInput) passwordInput.focus();
    }

    function showAdminPanel() {
        if (loginSection) loginSection.style.display = 'none';
        if (adminSection) adminSection.style.display = 'block';
        
        // Set today's date
        const entryDateField = document.getElementById('entry-date');
        if (entryDateField && !entryDateField.value) {
            const today = new Date().toISOString().split('T')[0];
            entryDateField.value = today;
        }
        
        // Setup handlers after form is visible
        setTimeout(function() {
            setupAllHandlers();
        }, 200);
    }

    // Show/hide military fields
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'veteran-status') {
            const militaryInfo = document.getElementById('military-info');
            const warEra = document.getElementById('war-era');
            if (e.target.value === 'yes') {
                if (militaryInfo) militaryInfo.style.display = 'block';
                if (warEra) warEra.style.display = 'block';
            } else {
                if (militaryInfo) militaryInfo.style.display = 'none';
                if (warEra) warEra.style.display = 'none';
            }
        }
    });

    // Setup all form handlers
    function setupAllHandlers() {
        console.log('Setting up all handlers...');
        
        // Setup form submission
        const form = document.getElementById('data-entry-form');
        if (form) {
            // Remove old handler by cloning
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            const freshForm = document.getElementById('data-entry-form');
            if (freshForm) {
                freshForm.addEventListener('submit', handleFormSubmit);
                console.log('Form submit handler attached');
            }
        }
        
        // Setup GPS button
        setupGpsButton();
    }

    // Form submission handler
    function handleFormSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('=== FORM SUBMISSION STARTED ===');
        
        const form = e.target;
        const formData = new FormData(form);
        
        const record = {
            id: generateId(),
            fullName: formData.get('fullName') || '',
            birthDate: formData.get('birthDate') || null,
            deathDate: formData.get('deathDate') || null,
            veteranStatus: formData.get('veteranStatus') || 'unknown',
            branch: formData.get('branch') || null,
            warEra: formData.get('warEra') || null,
            section: formData.get('section') || null,
            plotNumber: formData.get('plotNumber') || null,
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null,
            markerCondition: formData.get('markerCondition') || null,
            markerType: formData.get('markerType') || null,
            inscription: formData.get('inscription') || null,
            notes: formData.get('notes') || null,
            imageUrl: formData.get('imageUrl') || null,
            findAGraveUrl: formData.get('findAGraveUrl') || null,
            enteredBy: formData.get('enteredBy') || '',
            entryDate: formData.get('entryDate') || '',
            createdAt: new Date().toISOString()
        };

        console.log('Record data:', record);

        // Validate
        if (!record.fullName || !record.enteredBy || !record.entryDate) {
            const errorMsg = document.getElementById('error-message');
            if (errorMsg) {
                errorMsg.textContent = '✗ Please fill in all required fields.';
                errorMsg.style.display = 'block';
            }
            console.log('Validation failed');
            return;
        }

        // Save
        try {
            console.log('Getting stored data...');
            const records = getStoredData();
            console.log('Current records:', records.length);
            
            records.push(record);
            console.log('Pushing record, new count:', records.length);
            
            saveStoredData(records);
            console.log('Data saved to localStorage');
            
            // Verify
            const verify = getStoredData();
            console.log('Verification - records in storage:', verify.length);
            console.log('Last record:', verify[verify.length - 1]);
            
            // Show success
            const successMsg = document.getElementById('success-message');
            if (successMsg) {
                successMsg.style.display = 'block';
                successMsg.textContent = '✓ Record saved successfully!';
                console.log('Success message displayed');
            } else {
                alert('Record saved successfully!');
                console.log('Success message element not found, used alert');
            }
            
            // Hide error message
            const errorMsg = document.getElementById('error-message');
            if (errorMsg) errorMsg.style.display = 'none';
            
            // Reset form
            setTimeout(function() {
                form.reset();
                const militaryInfo = document.getElementById('military-info');
                const warEra = document.getElementById('war-era');
                if (militaryInfo) militaryInfo.style.display = 'none';
                if (warEra) warEra.style.display = 'none';
                
                const latInput = document.getElementById('latitude');
                const lonInput = document.getElementById('longitude');
                if (latInput) latInput.value = '';
                if (lonInput) lonInput.value = '';
                
                const entryDateField = document.getElementById('entry-date');
                if (entryDateField) {
                    const today = new Date().toISOString().split('T')[0];
                    entryDateField.value = today;
                }
                
                // Re-setup handlers
                setupAllHandlers();
            }, 2000);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('=== FORM SUBMISSION COMPLETE ===');
            
        } catch (error) {
            console.error('ERROR SAVING:', error);
            const errorMsg = document.getElementById('error-message');
            if (errorMsg) {
                errorMsg.textContent = '✗ Error: ' + error.message;
                errorMsg.style.display = 'block';
            }
            alert('Error saving record: ' + error.message);
        }
    }

    // GPS button handler
    function setupGpsButton() {
        const btn = document.getElementById('get-location-btn');
        if (!btn) {
            console.log('GPS button not found');
            return;
        }
        
        // Remove old handler
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        const freshBtn = document.getElementById('get-location-btn');
        if (freshBtn) {
            freshBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('GPS button clicked');
                
                const latInput = document.getElementById('latitude');
                const lonInput = document.getElementById('longitude');
                const gpsStatus = document.getElementById('gps-status');
                
                if (!navigator.geolocation) {
                    if (gpsStatus) {
                        gpsStatus.textContent = 'Geolocation not supported';
                        gpsStatus.className = 'gps-status error';
                        gpsStatus.style.display = 'block';
                    }
                    return;
                }

                freshBtn.disabled = true;
                freshBtn.textContent = '📍 Getting Location...';
                
                if (gpsStatus) {
                    gpsStatus.textContent = 'Getting location...';
                    gpsStatus.className = 'gps-status info';
                    gpsStatus.style.display = 'block';
                }

                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        
                        if (latInput) latInput.value = lat.toFixed(6);
                        if (lonInput) lonInput.value = lon.toFixed(6);
                        
                        if (gpsStatus) {
                            gpsStatus.textContent = `✓ Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
                            gpsStatus.className = 'gps-status success';
                            gpsStatus.style.display = 'block';
                        }
                        
                        freshBtn.disabled = false;
                        freshBtn.textContent = '📍 Get Current Location';
                    },
                    function(error) {
                        let msg = 'Unable to get location. ';
                        if (error.code === error.PERMISSION_DENIED) {
                            msg += 'Please allow location access.';
                        } else if (error.code === error.POSITION_UNAVAILABLE) {
                            msg += 'Location unavailable.';
                        } else if (error.code === error.TIMEOUT) {
                            msg += 'Request timed out.';
                        }
                        
                        if (gpsStatus) {
                            gpsStatus.textContent = msg;
                            gpsStatus.className = 'gps-status error';
                            gpsStatus.style.display = 'block';
                        }
                        
                        freshBtn.disabled = false;
                        freshBtn.textContent = '📍 Get Current Location';
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            };
            console.log('GPS button handler attached');
        }
    }

    // Initial setup if form is already visible
    if (formSection && formSection.style.display !== 'none') {
        setTimeout(setupAllHandlers, 300);
    }
});
