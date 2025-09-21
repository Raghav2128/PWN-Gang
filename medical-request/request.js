const medicines = [
    'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Azithromycin',
    'Lisinopril', 'Metformin', 'Amlodipine', 'Metoprolol', 'Omeprazole',
    'Simvastatin', 'Losartan', 'Albuterol', 'Gabapentin', 'Sertraline',
    'Hydrochlorothiazide', 'Atorvastatin', 'Prednisone', 'Tramadol', 'Ciprofloxacin',
    'Doxycycline', 'Fluoxetine', 'Pantoprazole', 'Warfarin', 'Insulin',
    'Levothyroxine', 'Cephalexin', 'Furosemide', 'Clonazepam', 'Oxycodone'
  ];
  
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

    const matches = medicines.filter(med =>
      med.toLowerCase().includes(query.toLowerCase())
    );

    dropdown.innerHTML = '';

    if (matches.length > 0) {
      matches.forEach(med => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = med;
        item.onclick = () => selectMedicine(med);
        dropdown.appendChild(item);
      });
      dropdown.style.display = 'block';
      medicineInput.style.borderColor = '#667eea';
      medicineInput.style.backgroundColor = 'white';
    } else {
      const noResults = document.createElement('div');
      noResults.className = 'dropdown-item';
      noResults.textContent = 'No medicines found';
      noResults.style.color = '#999';
      noResults.style.cursor = 'default';
      dropdown.appendChild(noResults);
      dropdown.style.display = 'block';
      medicineInput.style.borderColor = '#e17055';
      medicineInput.style.backgroundColor = '#fff5f5';
    }
  }
  
  function selectMedicine(med) {
    medicineInput.value = med;
    dropdown.style.display = 'none';
    medicineInput.focus();
    
    // Clear any existing search results and show selected medicine
    dropdown.innerHTML = '';
    
    // Add visual feedback that medicine was selected
    medicineInput.classList.add('selected');
    
    // Remove the selected class after a delay to show it was selected
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
  
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const originalText = submitBtn.innerHTML;

    iconSpan.textContent = '⏳';
    submitBtn.textContent = ' Processing...';
    submitBtn.prepend(iconSpan);
    submitBtn.disabled = true;

    try {
      // Get form data
      const medicineName = medicineInput.value;
      const quantity = document.getElementById('quantity').value;
      const urgency = document.getElementById('urgency').value;
      
      // Get selected preferences
      const preferences = [];
      document.querySelectorAll('input[name="preference"]:checked').forEach(checkbox => {
        preferences.push(checkbox.id);
      });

      // Create request data
      const requestData = {
        medicine_name: medicineName,
        quantity_requested: parseInt(quantity),
        message: `Urgency: ${urgency}, Preferences: ${preferences.join(', ')}`
      };

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Please login first');
      }

      // Submit request to backend
      const response = await fetch('http://localhost:8000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      
      iconSpan.textContent = '✅';
      submitBtn.textContent = ' Request Submitted!';
      submitBtn.prepend(iconSpan);

      // Reset form
      form.reset();
      medicineInput.value = '';

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error submitting request:', error);
      iconSpan.textContent = '❌';
      submitBtn.textContent = ' Error!';
      submitBtn.prepend(iconSpan);

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    }
  });