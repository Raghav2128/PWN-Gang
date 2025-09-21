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
            // Remove "none" if other items are selected
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
    
    // Validation
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    if (data.password !== data.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (!dormDropdown.dropdown.dataset.value) {
        alert('Please select a dorm!');
        return;
    }
    
    // Add selected items to form data
    data.dorm = dormDropdown.dropdown.dataset.value;
    data.allergies = Array.from(window.allergiesDropdown.selectedItems);
    data.medical = Array.from(window.medicalDropdown.selectedItems);
    
    // Success animation
    const button = document.querySelector('.submit-btn');
    button.style.background = 'linear-gradient(135deg, #26de81, #20bf6b)';
    button.textContent = 'Registration Successful!';
    
    console.log('Registration Data:', data);
    
    setTimeout(() => {
        alert('Registration completed successfully! Welcome to ASU Housing.');
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