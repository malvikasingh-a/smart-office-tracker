function toggleUserStatus(empId) {
    // In your Django project, this will trigger an AJAX call to update 'is_active'
    const status = event.target.checked ? "Activated" : "Deactivated";
    console.log(`User ${empId} has been ${status}`);
    
}

document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const emp_id = document.getElementById('empID').value;
    const password = document.getElementById('password').value;
    console.log("Data Sent -> Name:", name, " | Email:", email, " | Role:", role, " | EmpID:", emp_id, " | Pass:", password);
    fetch('/api/add-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
         },
        body: JSON.stringify({
            name: name,
            email: email,
            role: role,
            emp_id: emp_id,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server response with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            document.getElementById('addUserForm').reset();
            window.location.reload(); 
      } else {
            alert("Error: " + data.message);
}
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while adding the user.");
    });
});

document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();
});

function fetchUsers() {
    fetch('/api/users/')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('userTableBody');
        
        if (!tableBody) return; 

        tableBody.innerHTML = ''; 
        data.forEach(user => {
            const statusColor = user.is_active ? 'bg-success' : 'bg-danger';
            const statusText = user.is_active ? 'Active' : 'Deactivated';
            const isChecked = user.is_active ? 'checked' : '';
            
            const row = `
                <tr>
                    <td class="ps-4 fw-medium">#${user.username}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="fw-medium">${user.first_name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-secondary text-uppercase">${user.role}</span></td>
                    <td><span class="status-indicator ${statusColor}"></span> ${statusText}</td>
                    <td class="text-end pe-4">
                        <div class="form-check form-switch d-inline-block">
                            <input class="form-check-input" type="checkbox" ${isChecked} onclick="toggleUserStatus('${user.username}')">
                        </div>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error('Error loading users:', error));
}

function loadAvailableAssets() {
    fetch('/api/inventory/') 
        .then(response => response.json())
        .then(assets => {
            const assetSelect = document.getElementById('newUserAsset');
            
            assetSelect.innerHTML = '<option value="" selected>None (Assign Later)</option>';
            
            assets.forEach(asset => {
                if (asset.status.toLowerCase() === 'active') {
                    assetSelect.innerHTML += `<option value="${asset.id}">${asset.name} (ID: ${asset.asset_id})</option>`;
                }
            });
        })
        .catch(error => console.error('Assets load nahi hue:', error));
}

document.addEventListener('DOMContentLoaded', loadAvailableAssets);