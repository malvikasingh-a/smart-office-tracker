let allAssets = []; // Global dabba taaki modals data padh sakein

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('assetSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const tableBody = document.getElementById('inventoryBody');

    function fetchAssets() {
        fetch('/api/inventory/', { credentials: 'same-origin' })
            .then(response => response.json())
            .then(data => {
                allAssets = data; 
                displayAssets(data); 
            })
            .catch(error => console.error('Error fetching assets:', error));
    }

    function displayAssets(assets) {
        tableBody.innerHTML = ""; 
        if (assets.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No assets found.</td></tr>`;
            return;
        }

        assets.forEach(asset => {
            let badgeClass = 'bg-secondary-soft text-secondary';
            let statusText = asset.status.replace('_', ' ').toUpperCase(); 

            if (asset.status.toLowerCase() === 'active') badgeClass = 'bg-success-soft text-success'; 
            else if (asset.status.toLowerCase() === 'assigned') badgeClass = 'bg-primary-soft text-primary'; 
            else if (asset.status.toLowerCase() === 'maintenance') badgeClass = 'bg-warning-soft text-warning'; 
            else if (asset.status.toLowerCase() === 'out_of_order') badgeClass = 'bg-danger-soft text-danger';   

            let assignedText = asset.assigned_to_name ? `<span class="fw-bold text-dark">${asset.assigned_to_name}</span>` : `<span class="text-muted">Available</span>`;

            // PYTHON QR image URL generation
            let qrImageUrl = `/api/asset-qr/${asset.id}/`;

            const row = `
                <tr>
                    <td class="ps-4 fw-medium text-indigo">${asset.asset_id}</td>
                    <td>
                        <img src="${qrImageUrl}" class="rounded border p-1 bg-white shadow-sm" width="50" height="50" alt="QR">
                    </td>
                    <td class="fw-bold">${asset.name}</td>
                    <td><code class="text-muted">${asset.serial_no}</code></td>
                    <td>${assignedText}</td>
                    <td>${asset.purchase_date}</td>
                    <td><span class="badge rounded-pill ${badgeClass}">${statusText}</span></td>
                    <td class="text-end pe-4">
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm border" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                <li><a class="dropdown-item" href="#" onclick="viewAsset(${asset.id})"><i class="bi bi-eye me-2 text-info"></i> View Details</a></li>
                                <li><a class="dropdown-item" href="#" onclick="editAsset(${asset.id})"><i class="bi bi-pencil me-2 text-warning"></i> Edit Asset</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <!-- Naye Tab mein Asli Image khulegi Print ke liye -->
                                <li><a class="dropdown-item fw-bold text-dark" href="${qrImageUrl}" target="_blank"><i class="bi bi-printer me-2"></i> Print QR</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // 1. VIEW ACTION (Modal Pop-up)
    window.viewAsset = function(id) {
        const asset = allAssets.find(a => a.id === id);
        if(!asset) return;
        
        const modalBody = document.getElementById('viewModalBody');
        modalBody.innerHTML = `
            <div class="text-center mb-4">
                <img src="/api/asset-qr/${asset.id}/" width="120" class="border p-2 rounded shadow-sm">
                <h5 class="fw-bold mt-3 mb-0">${asset.name}</h5>
                <p class="text-muted small">${asset.asset_id}</p>
            </div>
            <ul class="list-group list-group-flush border-top">
                <li class="list-group-item d-flex justify-content-between px-0"><strong>Category:</strong> <span class="text-capitalize">${asset.category}</span></li>
                <li class="list-group-item d-flex justify-content-between px-0"><strong>Serial No:</strong> <code>${asset.serial_no}</code></li>
                <li class="list-group-item d-flex justify-content-between px-0"><strong>Cost:</strong> <span>₹${asset.purchase_price}</span></li>
                <li class="list-group-item d-flex justify-content-between px-0"><strong>Assigned To:</strong> <span class="text-primary fw-bold">${asset.assigned_to_name || 'Not Assigned'}</span></li>
            </ul>
        `;
        new bootstrap.Modal(document.getElementById('viewAssetModal')).show();
    }

    window.editAsset = function(id) {
        const asset = allAssets.find(a => a.id === id);
        if(!asset) return;

        document.getElementById('editAssetId').value = asset.id;
        document.getElementById('editAssetName').value = asset.name;
        document.getElementById('editAssetSerial').value = asset.serial_no;
        document.getElementById('editAssetPrice').value = asset.purchase_price;
        document.getElementById('editAssetStatus').value = asset.status;
        
        new bootstrap.Modal(document.getElementById('editAssetModal')).show();
    }

    document.getElementById('editAssetForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editAssetId').value;
        
        const updatedData = {
            name: document.getElementById('editAssetName').value,
            serial_no: document.getElementById('editAssetSerial').value,
            purchase_price: document.getElementById('editAssetPrice').value,
            status: document.getElementById('editAssetStatus').value
        };

        fetch(`/api/inventory/${id}/`, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if(response.ok) {
                alert("Asset details updated successfully!");
                window.location.reload();
            } else {
                alert("Failed to update asset. Check console for details.");
            }
        })
        .catch(error => console.error("Update Error:", error));
    });
    fetchAssets();
});