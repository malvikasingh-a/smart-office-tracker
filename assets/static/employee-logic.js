document.addEventListener('DOMContentLoaded', () => {
    fetchEmployeeData();
});

function fetchEmployeeData() {
    fetch('/api/emp-dashboard/', { credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            
            // 1. Welcome Message 
            const welcome = document.getElementById('welcomeName');
            if (welcome) welcome.innerText = `Welcome back, ${data.emp_name}!`;
            
            const countBox = document.getElementById('assetCount');
            if (countBox) countBox.innerText = data.asset_count.toString().padStart(2, '0'); 
            
            // 2. Asset Cards 
            const grid = document.getElementById('assetGrid');
            grid.innerHTML = ''; 
            
            if (data.assets.length > 0) {
                data.assets.forEach(asset => {
                    let currentStatus = asset.status.toLowerCase().replace('_', ' ');
                    
                    let badgeClass = 'bg-success-soft text-success';
                    let displayStatus = asset.status;
                    let actionHTML = '';
                    
                    // ==========================================
                    // NAYA LOGIC: PENDING ACCEPTANCE CHECK
                    // ==========================================
                    if (currentStatus === 'pending acceptance') {
                        badgeClass = 'bg-warning text-dark';
                        displayStatus = 'Action Required';
                        
                        actionHTML = `
                            <div class="mt-3 p-3 bg-warning-subtle border border-warning rounded">
                                <p class="small text-dark fw-bold mb-2">IT has assigned this to you. Please confirm receipt.</p>
                                <button class="btn btn-success w-100 py-2 rounded-3 fw-bold shadow-sm" onclick="acceptAsset(${asset.id})">
                                    <i class="bi bi-check-circle me-2"></i>Accept Asset
                                </button>
                            </div>
                        `;
                    } else {
                        // Normal Assigned Asset 
                        badgeClass = currentStatus === 'active' ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary';
                        
                        actionHTML = `
                            <button class="btn btn-outline-danger w-100 py-2 rounded-3 mt-3" onclick="reportIssue('${asset.serial_no}')">
                                <i class="bi bi-exclamation-triangle me-2"></i>Report Issue
                            </button>
                        `;
                    }
                    
                    let imageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400";
                    
                    const cardHTML = `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card asset-card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
                                <img src="${imageUrl}" class="card-img-top rounded-top-4" alt="Asset Image" style="height: 180px; object-fit: cover;">
                                <div class="card-body p-4 d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="fw-bold mb-0">${asset.name}</h5>
                                        <span class="badge ${badgeClass}">${displayStatus}</span>
                                    </div>
                                    <p class="text-muted small mb-2">S/N: <code class="text-primary fw-bold">${asset.serial_no}</code></p>
                                    
                                    <div class="mt-auto">
                                        ${actionHTML}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += cardHTML;
                });
            } else {
                grid.innerHTML = `
                    <div class="col-12 text-center py-5 text-muted">
                        <i class="bi bi-box-seam fs-1 d-block mb-3"></i>
                        <h5>No assets assigned to you yet!</h5>
                        <p>If you need equipment, please use the "Request New" tab.</p>
                    </div>
                `;
            }

        } else {
            console.error("Error loading dashboard:", data.message);
            if (data.message === "Please login first!") {
                window.location.href = '/login/';
            }
        }
    })
    .catch(error => console.error('Fetch error:', error));
}

function reportIssue(serialNumber) {
    alert(`Reporting issue for Asset S/N: ${serialNumber}`);
    // Ise aage chal kar hum emp-report-issue page par redirect kar sakte hain
}

// ==========================================
//  ASSET ACCEPTANCE
// ==========================================
window.acceptAsset = function(assetId) {
    if(!confirm("I confirm that I have physically received this asset in working condition.")) return;

    fetch(`/api/emp-accept-asset/${assetId}/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("Asset Accepted Successfully!");
            window.location.reload(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Accept Error:", error));
}