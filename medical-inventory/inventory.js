// Medicine list (same as React component)
const medicines = [
    'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Azithromycin',
    'Lisinopril', 'Metformin', 'Amlodipine', 'Metoprolol', 'Omeprazole',
    'Simvastatin', 'Losartan', 'Albuterol', 'Gabapentin', 'Sertraline'
  ];
  
  // State variables (not React - simulated by plain JS)
  let inventory = [];
  let nextId = 1;
  let isSaving = false;
  
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
    // Add "Other" option at the end
    const otherOption = document.createElement('option');
    otherOption.value = 'Other';
    otherOption.textContent = 'Other (Custom)';
    medicineSelect.appendChild(otherOption);
  }
  
  
  function renderInventory() {
    // Clear existing content
    inventoryBody.innerHTML = '';
  
    if (inventory.length === 0) {
      // Render empty state row
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
  
      // Remove button cell
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
  
      // Medicine Name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = item.name;
      row.appendChild(nameCell);
  
      // Quantity cell
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
        quantityInput.value = val; // normalize display
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
    
    // Hide message after 3 seconds
    setTimeout(() => {
      validationMessage.style.display = 'none';
    }, 3000);
  }
  
  function addMedicine() {
    const selectedMedicine = medicineSelect.value;
    
    // Clear any existing validation messages
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

    // Simulate save delay
    setTimeout(() => {
      saveStatusSpan.textContent = '✅ Saved Successfully!';
      isSaving = false;
      saveBtn.disabled = false;
      console.log('Inventory saved:', inventory);

      // Clear status after 2 seconds
      setTimeout(() => {
        saveStatusSpan.textContent = '';
      }, 2000);
    }, 1500);
  }
  
  function leaveInventory() {
    // Add visual feedback
    leaveBtn.style.transform = 'scale(0.95)';
    leaveBtn.textContent = '🚪 Leaving...';
    leaveBtn.disabled = true;
    
    // Simulate leaving delay
    setTimeout(() => {
      leaveBtn.style.transform = 'scale(1)';
      leaveBtn.textContent = '🚪 Leave Inventory';
      leaveBtn.disabled = false;
      
      // Show confirmation message
      saveStatusSpan.textContent = '👋 Ready to leave inventory!';
      saveStatusSpan.style.color = '#ef4444';
      
      // Clear message after 2 seconds
      setTimeout(() => {
        saveStatusSpan.textContent = '';
        saveStatusSpan.style.color = '';
      }, 2000);
      
      console.log('Leave inventory clicked - ready for endpoint integration');
    }, 1000);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    populateMedicineOptions();
    renderInventory();

    addBtn.addEventListener('click', addMedicine);
    saveBtn.addEventListener('click', saveInventory);
    leaveBtn.addEventListener('click', leaveInventory);
    
    // Show/hide custom medicine input based on selection
    medicineSelect.addEventListener('change', (e) => {
      if (e.target.value === 'Other') {
        customMedicineContainer.style.display = 'block';
        customMedicineInput.focus();
      } else {
        customMedicineContainer.style.display = 'none';
        customMedicineInput.value = '';
      }
      // Clear validation messages when selection changes
      validationMessage.style.display = 'none';
    });
  });