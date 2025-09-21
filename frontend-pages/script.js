// Global state management
let currentPage = 'homepage';
let inventory = [];
let nextId = 1;
let isSaving = false;
let userState = 'guest'; // 'guest', 'signup', 'loggedin'

// Medicine lists
const medicines = [
    'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Azithromycin',
    'Lisinopril', 'Metformin', 'Amlodipine', 'Metoprolol', 'Omeprazole',
    'Simvastatin', 'Losartan', 'Albuterol', 'Gabapentin', 'Sertraline',
    'Hydrochlorothiazide', 'Atorvastatin', 'Prednisone', 'Tramadol', 'Ciprofloxacin',
    'Doxycycline', 'Fluoxetine', 'Pantoprazole', 'Warfarin', 'Insulin',
    'Levothyroxine', 'Cephalexin', 'Furosemide', 'Clonazepam', 'Oxycodone'
];

// Request data
const receivedRequests = [
    {id:'req1', medicine:'Paracetamol 500mg', urgency:'high', quantity: 2},
    {id:'req2', medicine:'Insulin Pen', urgency:'medium', quantity: 1}
];

const myRequests = [
    {id:'myreq3', medicine:'Vitamin D Supplements', urgency:'low', status:'Pending', quantity: 1},
    {id:'myreq4', medicine:'Blood Pressure Monitor', urgency:'medium', status:'Accepted', quantity: 1}
];

// Popup functionality
function showPopup(title, message) {
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('popupModal').style.display = 'block';
}

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

// Navigation state management
function updateNavigation() {
    const navButtons = {
        setupBtn: document.getElementById('setupBtn'),
        mainPageBtn: document.getElementById('mainPageBtn'),
        requestBtn: document.getElementById('requestBtn'),
        inventoryBtn: document.getElementById('inventoryBtn'),
        manageBtn: document.getElementById('manageBtn'),
        logoutBtn: document.getElementById('logoutBtn')
    };

    // Hide all buttons first
    Object.values(navButtons).forEach(btn => {
        if (btn) btn.classList.add('hidden');
    });

    // Show buttons based on user state
    if (userState === 'signup') {
        navButtons.setupBtn?.classList.remove('hidden');
        navButtons.logoutBtn?.classList.remove('hidden');
    } else if (userState === 'loggedin') {
        navButtons.mainPageBtn?.classList.remove('hidden');
        navButtons.logoutBtn?.classList.remove('hidden');
        // Other buttons will be shown/hidden based on current page
        updateSectionNavigation();
    }
}

// Update section navigation (hide current section from navbar)
function updateSectionNavigation() {
    const navButtons = {
        mainPageBtn: document.getElementById('mainPageBtn'),
        requestBtn: document.getElementById('requestBtn'),
        inventoryBtn: document.getElementById('inventoryBtn'),
        manageBtn: document.getElementById('manageBtn'),
    };

    // Show all section buttons first
    Object.values(navButtons).forEach(btn => {
        if (btn) btn.classList.remove('hidden');
    });

    // Hide current section from navbar
    if (currentPage === 'main-page') {
        navButtons.mainPageBtn?.classList.add('hidden');
    } else if (currentPage === 'medical-request') {
        navButtons.requestBtn?.classList.add('hidden');
    } else if (currentPage === 'medical-inventory') {
        navButtons.inventoryBtn?.classList.add('hidden');
    } else if (currentPage === 'request-page') {
        navButtons.manageBtn?.classList.add('hidden');
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages with smooth transition
    document.querySelectorAll('.page-section').forEach(page => {
        if (page.classList.contains('active')) {
            page.classList.remove('active');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                page.style.display = 'none';
            }, 400);
        }
    });
    
    // Show selected page with smooth transition
    const targetPage = document.getElementById(pageId);
    targetPage.style.display = 'block';
    
    // Force reflow to ensure display change is applied
    targetPage.offsetHeight;
    
    // Add active class for smooth transition
    setTimeout(() => {
        targetPage.classList.add('active');
    }, 10);
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const activeButton = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    currentPage = pageId;
    
    // Update section navigation for logged-in users
    if (userState === 'loggedin') {
        updateSectionNavigation();
    }
    
    // Initialize page-specific functionality
    if (pageId === 'medical-inventory') {
        initializeInventory();
    } else if (pageId === 'request-page') {
        renderRequests();
    }
}

// Homepage functionality
function initializeHomepage() {
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        resetSignupForm();
    });

    signupToggle.addEventListener('click', () => {
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showPopup('Login Error', 'Please fill in all fields!');
            return;
        }

        console.log('Login attempt:', { email, password });
        
        // Simulate login success
        userState = 'loggedin';
        updateNavigation();
        showPage('main-page');
        showPopup('Login Successful', 'Welcome back to MedShare!');
    });

    // Enhanced input interactions
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
}

function resetSignupForm() {
    document.getElementById('signupForm').reset();
}

function validateASUEmail(email) {
    return email.toLowerCase().endsWith('@asu.edu');
}

function handleSignup() {
    const email = document.getElementById('signupEmail').value;
    
    if (!email) {
        showPopup('Signup Error', 'Please enter your ASU email address');
        return;
    }
    
    if (!validateASUEmail(email)) {
        showPopup('Signup Error', 'Please use a valid ASU email address (must end with @asu.edu)');
        return;
    }
    
    console.log('Signup attempt with ASU email:', email);
    
    // Simulate signup success
    userState = 'signup';
    updateNavigation();
    showPage('setup');
    showPopup('Signup Successful', 'Please complete your account registration!');
}

// Setup functionality
function initializeSetup() {
    // Multi-select dropdown functionality
    class MultiSelectDropdown {
        constructor(dropdownId, menuId, searchId, selectedId, isMultiple = true) {
            this.dropdown = document.getElementById(dropdownId);
            this.menu = document.getElementById(menuId);
            this.search = document.getElementById(searchId);
            this.selectedContainer = selectedId ? document.getElementById(selectedId) : null;
            this.isMultiple = isMultiple;
            this.selectedItems = new Set();
            this.allItems = Array.from(this.menu.querySelectorAll('.dropdown-item:not(.search-input)'));
            
            this.init();
        }

        init() {
            this.dropdown.addEventListener('click', () => this.toggle());
            this.search.addEventListener('input', (e) => this.filterItems(e.target.value));
            
            this.allItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectItem(item);
                });
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown-container')) {
                    this.close();
                }
            });
        }

        toggle() {
            if (this.menu.classList.contains('show')) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            this.menu.classList.add('show');
            this.dropdown.classList.add('active');
            this.search.focus();
        }

        close() {
            this.menu.classList.remove('show');
            this.dropdown.classList.remove('active');
            this.search.value = '';
            this.filterItems('');
        }

        filterItems(query) {
            this.allItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query.toLowerCase())) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        selectItem(item) {
            const value = item.dataset.value;
            const text = item.textContent;

            if (!this.isMultiple) {
                this.selectedItems.clear();
                this.dropdown.textContent = text;
                this.dropdown.dataset.value = value;
                this.close();
                return;
            }

            if (value === 'none') {
                this.selectedItems.clear();
                this.updateDisplay();
                this.close();
                return;
            }

            if (this.selectedItems.has(value)) {
                this.selectedItems.delete(value);
            } else {
                this.selectedItems.add(value);
                if (this.selectedItems.has('none')) {
                    this.selectedItems.delete('none');
                }
            }

            this.updateDisplay();
            this.close();
        }

        updateDisplay() {
            if (!this.selectedContainer) return;

            this.selectedContainer.innerHTML = '';
            
            this.selectedItems.forEach(value => {
                const item = this.allItems.find(i => i.dataset.value === value);
                if (item) {
                    const tag = document.createElement('div');
                    tag.className = 'selected-tag';
                    tag.innerHTML = `
                        ${item.textContent}
                        <button type="button" class="remove-tag" onclick="this.parentElement.remove(); window.${this.selectedContainer.id.replace('selected', '').toLowerCase()}Dropdown.selectedItems.delete('${value}')">×</button>
                    `;
                    this.selectedContainer.appendChild(tag);
                }
            });

            if (this.selectedItems.size === 0) {
                this.dropdown.textContent = this.dropdown.dataset.placeholder || 'Select items...';
            } else {
                this.dropdown.textContent = `${this.selectedItems.size} item(s) selected`;
            }
        }
    }

    // Initialize dropdowns
    const dormDropdown = new MultiSelectDropdown('dormDropdown', 'dormMenu', 'dormSearch', null, false);
    window.allergiesDropdown = new MultiSelectDropdown('allergiesDropdown', 'allergiesMenu', 'allergiesSearch', 'selectedAllergies');
    window.medicalDropdown = new MultiSelectDropdown('medicalDropdown', 'medicalMenu', 'medicalSearch', 'selectedMedical');

    // Set placeholders
    document.getElementById('allergiesDropdown').dataset.placeholder = 'Select allergies...';
    document.getElementById('medicalDropdown').dataset.placeholder = 'Select conditions...';

    // Password strength checker
    const password = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');

    password.addEventListener('input', function() {
        const value = this.value;
        let strength = 0;
        
        if (value.length >= 8) strength += 25;
        if (/[a-z]/.test(value)) strength += 25;
        if (/[A-Z]/.test(value)) strength += 25;
        if (/[0-9]/.test(value)) strength += 25;
        if (/[^A-Za-z0-9]/.test(value)) strength += 25;
        
        strengthBar.style.width = Math.min(strength, 100) + '%';
        
        if (strength < 50) {
            strengthBar.style.background = '#ff4757';
        } else if (strength < 75) {
            strengthBar.style.background = '#ffa502';
        } else {
            strengthBar.style.background = '#26de81';
        }
    });

    // Password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');

    confirmPassword.addEventListener('input', function() {
        if (this.value !== password.value) {
            this.style.borderColor = '#ff4757';
        } else {
            this.style.borderColor = '#26de81';
        }
    });

    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Password validation
        if (data.password !== data.confirmPassword) {
            showPopup('Registration Error', 'Passwords do not match!');
            return;
        }
        
        if (data.password.length < 8) {
            showPopup('Registration Error', 'Password must be at least 8 characters long!');
            return;
        }
        
        if (!dormDropdown.dropdown.dataset.value) {
            showPopup('Registration Error', 'Please select a dorm!');
            return;
        }
        
        data.dorm = dormDropdown.dropdown.dataset.value;
        data.allergies = Array.from(window.allergiesDropdown.selectedItems);
        data.medical = Array.from(window.medicalDropdown.selectedItems);
        
        const button = document.querySelector('.submit-btn');
        button.style.background = 'linear-gradient(135deg, #26de81, #20bf6b)';
        button.textContent = 'Registration Successful!';
        
        console.log('Registration Data:', data);
        
        // Complete registration and move to logged in state
        setTimeout(() => {
            userState = 'loggedin';
            updateNavigation();
            showPage('main-page');
            showPopup('Registration Complete', 'Welcome to MedCare! Your account has been created successfully.');
        }, 1000);
    });

    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 10) {
            value = value.slice(0, 10);
            value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else if (value.length >= 6) {
            value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        }
        e.target.value = value;
    });
}

// Medical Request functionality
function initializeMedicalRequest() {
    const medicineInput = document.getElementById('medicine');
    const dropdown = document.getElementById('medicineDropdown');
    const form = document.getElementById('medicalRequestForm');
    const submitBtn = form.querySelector('.submit-btn');
    const iconSpan = submitBtn.querySelector('.icon');

    function searchMedicine(query) {
        if (query.length < 1) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            medicineInput.style.borderColor = '#e1e5e9';
            medicineInput.style.backgroundColor = 'white';
            return;
        }

        // More intelligent search with fuzzy matching
        const queryLower = query.toLowerCase();
        const matches = medicines
            .map(med => ({
                name: med,
                score: calculateMatchScore(med.toLowerCase(), queryLower)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8); // Limit to 8 results

        dropdown.innerHTML = '';

        if (matches.length > 0) {
            matches.forEach(({ name }) => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = name;
                item.onclick = () => selectMedicine(name);
                dropdown.appendChild(item);
            });
            dropdown.style.display = 'block';
            medicineInput.style.borderColor = '#667eea';
            medicineInput.style.backgroundColor = 'white';
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'dropdown-item';
            noResults.textContent = 'No medicines found - try a different search term';
            noResults.style.color = '#999';
            noResults.style.cursor = 'default';
            dropdown.appendChild(noResults);
            dropdown.style.display = 'block';
            medicineInput.style.borderColor = '#e17055';
            medicineInput.style.backgroundColor = '#fff5f5';
        }
    }

    function calculateMatchScore(medicine, query) {
        // Exact match gets highest score
        if (medicine === query) return 100;
        
        // Starts with query gets high score
        if (medicine.startsWith(query)) return 80;
        
        // Contains query gets medium score
        if (medicine.includes(query)) return 60;
        
        // Fuzzy matching for partial matches
        let score = 0;
        let queryIndex = 0;
        
        for (let i = 0; i < medicine.length && queryIndex < query.length; i++) {
            if (medicine[i] === query[queryIndex]) {
                score += 10;
                queryIndex++;
            }
        }
        
        // Bonus for consecutive matches
        if (queryIndex === query.length) {
            score += 20;
        }
        
        return score;
    }

    function selectMedicine(med) {
        medicineInput.value = med;
        dropdown.style.display = 'none';
        medicineInput.focus();
        
        dropdown.innerHTML = '';
        
        medicineInput.classList.add('selected');
        
        setTimeout(() => {
            medicineInput.classList.remove('selected');
        }, 2000);
    }

    function showDropdown() {
        if (medicineInput.value.length >= 1) {
            searchMedicine(medicineInput.value);
        }
    }

    function hideDropdown() {
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 150);
    }

    medicineInput.addEventListener('input', (e) => searchMedicine(e.target.value));
    medicineInput.addEventListener('focus', showDropdown);
    medicineInput.addEventListener('blur', hideDropdown);

    document.addEventListener('click', function (event) {
        const container = document.querySelector('.search-dropdown-container');
        if (!container.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const originalText = submitBtn.innerHTML;

        iconSpan.textContent = '⏳';
        submitBtn.textContent = ' Processing...';
        submitBtn.prepend(iconSpan);
        submitBtn.disabled = true;

        setTimeout(() => {
            iconSpan.textContent = '✅';
            submitBtn.textContent = ' Request Submitted!';
            submitBtn.prepend(iconSpan);

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 2000);
    });
}

// Medical Inventory functionality
function initializeInventory() {
    const medicineSelect = document.getElementById('medicine-select');
    const addBtn = document.getElementById('add-btn');
    const inventoryBody = document.getElementById('inventory-body');
    const saveBtn = document.getElementById('save-btn');
    const leaveBtn = document.getElementById('leave-btn');
    const saveStatusSpan = document.getElementById('save-status');
    const customMedicineContainer = document.getElementById('custom-medicine-container');
    const customMedicineInput = document.getElementById('custom-medicine');
    const validationMessage = document.getElementById('validation-message');

    function populateMedicineOptions() {
        medicines.forEach(med => {
            const option = document.createElement('option');
            option.value = med;
            option.textContent = med;
            medicineSelect.appendChild(option);
        });
        const otherOption = document.createElement('option');
        otherOption.value = 'Other';
        otherOption.textContent = 'Other (Custom)';
        medicineSelect.appendChild(otherOption);
    }

    function renderInventory() {
        inventoryBody.innerHTML = '';

        if (inventory.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.id = 'empty-state';
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 3;
            emptyCell.className = 'empty-state';
            emptyCell.innerHTML = '💊 No medicines in inventory<br />Select a medicine above to get started';
            emptyRow.appendChild(emptyCell);
            inventoryBody.appendChild(emptyRow);
            return;
        }

        inventory.forEach(item => {
            const row = document.createElement('tr');

            const removeCell = document.createElement('td');
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.title = 'Remove medicine';
            removeBtn.innerHTML = '✕';
            removeBtn.addEventListener('click', () => {
                removeMedicine(item.id);
            });
            removeCell.appendChild(removeBtn);
            row.appendChild(removeCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.className = 'quantity-input';
            quantityInput.title = 'Set quantity';
            quantityInput.value = item.quantity || 1;
            quantityInput.style.textAlign = 'center';
            quantityInput.addEventListener('change', e => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                updateMedicine(item.id, 'quantity', val);
                quantityInput.value = val;
            });
            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);

            inventoryBody.appendChild(row);
        });
    }

    function showValidationMessage(message, type) {
        validationMessage.textContent = message;
        validationMessage.className = `validation-message ${type}`;
        validationMessage.style.display = 'block';
        
        setTimeout(() => {
            validationMessage.style.display = 'none';
        }, 3000);
    }

    function addMedicine() {
        const selectedMedicine = medicineSelect.value;
        
        validationMessage.style.display = 'none';
        
        if (!selectedMedicine) {
            showValidationMessage('⚠️ Please select a medicine first!', 'error');
            return;
        }

        let medicineName = selectedMedicine;
        if (selectedMedicine === 'Other') {
            const customName = customMedicineInput.value.trim();
            if (!customName) {
                showValidationMessage('⚠️ Please enter a custom medicine name!', 'error');
                return;
            }
            medicineName = customName;
        }

        const newItem = {
            id: nextId,
            name: medicineName,
            quantity: 1
        };

        inventory.push(newItem);
        nextId++;
        medicineSelect.value = '';
        customMedicineContainer.style.display = 'none';
        customMedicineInput.value = '';
        showValidationMessage('✅ Medicine added successfully!', 'success');
        renderInventory();
    }

    function removeMedicine(id) {
        inventory = inventory.filter(item => item.id !== id);
        renderInventory();
    }

    function updateMedicine(id, field, value) {
        inventory = inventory.map(item => {
            if (item.id === id) {
                return {...item, [field]: value};
            }
            return item;
        });
        renderInventory();
    }

    function saveInventory() {
        if (isSaving) return;

        isSaving = true;
        saveBtn.disabled = true;
        saveStatusSpan.textContent = 'Saving...';

        setTimeout(() => {
            saveStatusSpan.textContent = '✅ Saved Successfully!';
            isSaving = false;
            saveBtn.disabled = false;
            console.log('Inventory saved:', inventory);

            setTimeout(() => {
                saveStatusSpan.textContent = '';
            }, 2000);
        }, 1500);
    }

    function leaveInventory() {
        leaveBtn.style.transform = 'scale(0.95)';
        leaveBtn.textContent = '🚪 Leaving...';
        leaveBtn.disabled = true;
        
        setTimeout(() => {
            leaveBtn.style.transform = 'scale(1)';
            leaveBtn.textContent = '🚪 Leave Inventory';
            leaveBtn.disabled = false;
            
            saveStatusSpan.textContent = '👋 Ready to leave inventory!';
            saveStatusSpan.style.color = '#ef4444';
            
            setTimeout(() => {
                saveStatusSpan.textContent = '';
                saveStatusSpan.style.color = '';
            }, 2000);
            
            console.log('Leave inventory clicked - ready for endpoint integration');
        }, 1000);
    }

    populateMedicineOptions();
    renderInventory();

    addBtn.addEventListener('click', addMedicine);
    saveBtn.addEventListener('click', saveInventory);
    leaveBtn.addEventListener('click', leaveInventory);
    
    medicineSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Other') {
            customMedicineContainer.style.display = 'block';
            customMedicineInput.focus();
        } else {
            customMedicineContainer.style.display = 'none';
            customMedicineInput.value = '';
        }
        validationMessage.style.display = 'none';
    });
}

// Request Page functionality
function renderRequests() {
    const receivedDiv = document.getElementById('received-requests');
    const myDiv = document.getElementById('my-requests');
    receivedDiv.innerHTML = '';
    myDiv.innerHTML = '';

    receivedRequests.forEach(req=>{
        const card = document.createElement('div');
        card.className = `request-card ${req.urgency}`;
        card.innerHTML = `
            <p><b>${req.medicine}</b></p>
            <p>Urgency: ${req.urgency}</p>
            <p>Quantity: ${req.quantity}</p>
            <div class="buttons">
                <button class="accept" onclick="acceptRequest('${req.id}')">Accept</button>
                <button class="decline" onclick="declineRequest('${req.id}')">Decline</button>
            </div>
        `;
        receivedDiv.appendChild(card);
    });

    myRequests.forEach(req=>{
        const card = document.createElement('div');
        card.className = `request-card ${req.urgency}`;
        card.innerHTML = `
            <p><b>${req.medicine}</b></p>
            <p>Urgency: ${req.urgency}</p>
            <p>Status: ${req.status}</p>
            <p>Quantity: ${req.quantity}</p>
            <div class="buttons">
                <button class="cancel" onclick="cancelRequest('${req.id}')">Cancel</button>
            </div>
        `;
        myDiv.appendChild(card);
    });

    checkEmptyStates();
}

function acceptRequest(id){
    showToast('Accept button clicked - placeholder functionality');
}

function declineRequest(id){
    showToast('Request declined');
    const index = receivedRequests.findIndex(r => r.id === id);
    if (index > -1) {
        receivedRequests.splice(index, 1);
        renderRequests();
    }
}

function cancelRequest(id){
    showToast('Request canceled');
    const index = myRequests.findIndex(r => r.id === id);
    if (index > -1) {
        myRequests.splice(index, 1);
        renderRequests();
    }
}

function checkEmptyStates(){
    document.getElementById('received-empty').style.display = receivedRequests.length? 'none':'block';
    document.getElementById('my-empty').style.display = myRequests.length? 'none':'block';
}

function showToast(msg){
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(()=>{toast.style.display='none';},2000);
}


// Logout functionality
function logout() {
    userState = 'guest';
    currentPage = 'homepage';
    updateNavigation();
    showPage('homepage');
    showPopup('Logged Out', 'You have been successfully logged out.');
}



// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHomepage();
    initializeSetup();
    initializeMedicalRequest();
    renderRequests();
    updateNavigation();
});