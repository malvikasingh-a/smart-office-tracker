document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assetForm');
    const steps = document.querySelectorAll('.form-step');
    const stepperItems = document.querySelectorAll('.step'); 
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    let currentStep = 0;

    function updateForm() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.remove('d-none');
            } else {
                step.classList.add('d-none');
            }
            
            if (stepperItems[index]) {
                stepperItems[index].classList.toggle('active', index <= currentStep);
            }
        });

        // Toggle Buttons
        if (currentStep === 0) {
            prevBtn.classList.add('d-none');
        } else {
            prevBtn.classList.remove('d-none');
        }
        
        // Next and Submit button 
        if (currentStep === steps.length - 1) {
            nextBtn.classList.add('d-none');
            submitBtn.classList.remove('d-none');
        } else {
            nextBtn.classList.remove('d-none');
            submitBtn.classList.add('d-none');
        }
    }

    // NEXT Button Logic
    nextBtn.addEventListener('click', () => {
        const inputs = steps[currentStep].querySelectorAll('input[required], select[required]');
        let valid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (valid && currentStep < steps.length - 1) {
            currentStep++;
            updateForm();
        }
    });

    // BACK Button Logic
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateForm();
        }
    });

    // ==========================================
    // FORM SUBMIT 
    // ==========================================
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const category = document.getElementById('category').value;
        const brand = document.getElementById('brand').value; 
        const model = document.getElementById('model').value; 
        const serial_number = document.getElementById('serial_number').value;
        const purchase_price = document.getElementById('purchase_price') ? document.getElementById('purchase_price').value : null;
        const purchase_date = document.getElementById('purchase_date') ? document.getElementById('purchase_date').value : null;
        const vendor_name = document.getElementById('vendor_name') ? document.getElementById('vendor_name').value : null;
        const status = document.getElementById('status') ? document.getElementById('status').value : 'available';
        const warranty_expiry = document.getElementById('warranty_expiry') ? document.getElementById('warranty_expiry').value : null;
        const assigned_department = document.getElementById('assigned_department') ? document.getElementById('assigned_department').value : null;
        const location = document.getElementById('location') ? document.getElementById('location').value : null;

        console.log("Sending Data:", { name, category, brand, model, serial_number, status });

        fetch('/api/add-asset-custom/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                category: category,
                brand: brand,
                model: model,
                purchase_price: purchase_price,
                serial_no: serial_number,  
                qr_id: document.getElementById('qr_id') ? document.getElementById('qr_id').value : "",
                purchase_date: purchase_date,
                vendor_name: vendor_name,
                status: status,
                warranty_expiry: warranty_expiry,
                assigned_department: assigned_department,
                location: location
            })
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                form.reset();
                currentStep = 0; 
                updateForm();
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            alert("Failed to add asset. Check Console.");
        });

    })
    function updateForm() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.remove('d-none');
                step.classList.add('active-step'); 
            } else {
                step.classList.add('d-none');
                step.classList.remove('active-step'); 
            }
            
            if (stepperItems[index]) {
                stepperItems[index].classList.toggle('active', index <= currentStep);
            }
        });

        if (currentStep === 0) {
            prevBtn.classList.add('d-none');
        } else {
            prevBtn.classList.remove('d-none');
        }
    
        if (currentStep === steps.length - 1) {
            nextBtn.classList.add('d-none');
            submitBtn.classList.remove('d-none');
        } else {
            nextBtn.classList.remove('d-none');
            submitBtn.classList.add('d-none');
        }
    }
});