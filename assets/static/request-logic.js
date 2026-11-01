document.addEventListener('DOMContentLoaded', () => {
    fetchPendingRequests();
});

function fetchPendingRequests() {
    fetch('/api/admin-pending-requests/')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const container = document.getElementById('requestContainer');
            const badge = document.getElementById('requestCountBadge');
            
            container.innerHTML = ''; 
            
            if (data.requests.length === 0) {
                badge.innerText = '0 Requests Waiting';
                container.innerHTML = '<div class="text-center text-muted mt-5 pt-5"><i class="bi bi-check-circle fs-1 text-success mb-3 d-block"></i><h5>All caught up! No pending requests.</h5></div>';
                return;
            }
            
            badge.innerText = `${data.requests.length} Requests Waiting`;
            
            data.requests.forEach(req => {
                let urgencyClass = 'bg-info-soft text-info';
                if (req.urgency === 'high') urgencyClass = 'bg-danger-soft text-danger';
                if (req.urgency === 'medium') urgencyClass = 'bg-warning-soft text-warning';
                
                const card = `
                    <div class="card request-card border-0 shadow-sm mb-4" id="req_${req.id}">
                        <div class="card-body p-4">
                            <div class="row align-items-center g-3">
                                <div class="col-md-3 border-end">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar bg-indigo text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 45px; height: 45px; font-weight: bold;">
                                            ${req.initials}
                                        </div>
                                        <div>
                                            <h6 class="fw-bold mb-1">${req.emp_name}</h6>
                                            <p class="text-muted small mb-0">Role: ${req.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-5">
                                    
                                    <h6 class="fw-bold mb-1 text-dark">Request ID: ${req.id}</h6>
                                    <p class="text-muted small mb-1">Asset Requested on ${req.date}</p>
                                    <!-- Category aur Model dono dikhayein -->
                                    <h6 class="fw-bold mb-1 text-dark">${req.category}</h6>
                                    <p class="text-primary small mb-2 fw-bold"><i class="bi bi-laptop me-1"></i> Model: ${req.specs}</p>
                                    <p class="text-secondary small mb-0">Reason: ${req.reason}</p>
                                    
                                </div>

                                <div class="col-md-2 text-center">
                                    <p class="text-muted small mb-1">Urgency</p>
                                    <span class="badge ${urgencyClass} p-2 px-3 rounded-pill text-uppercase">${req.urgency}</span>
                                </div>

                                <div class="col-md-2 text-end">
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-outline-danger btn-sm" onclick="showRejectForm(${req.id})"><i class="bi bi-x-circle me-1"></i> Reject</button>
                                        <button class="btn btn-indigo btn-sm text-white" onclick="showApproveForm(${req.id})"><i class="bi bi-check-circle me-1"></i> Approve</button>
                                    </div>
                                </div>
                            </div>

                            <div class="action-panel mt-4 p-3 border rounded bg-light d-none" id="approvePanel_${req.id}">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-bold mb-0 text-success"><i class="bi bi-check-circle me-2"></i> Approve Request</h6>
                                    <button type="button" class="btn-close btn-sm" onclick="hidePanels(${req.id})"></button>
                                </div>
                                <div class="d-flex gap-2 align-items-end">
                                    <div class="flex-grow-1">
                                        <label class="form-label small text-muted">Admin Note / Instructions</label>
                                        <input type="text" class="form-control form-control-sm" id="approveNote_${req.id}" placeholder="e.g. Approved. Collect from IT Desk.">
                                    </div>
                                    <button class="btn btn-success btn-sm px-3 text-white" onclick="submitAction(${req.id}, 'approved')">Confirm Approval</button>
                                </div>
                            </div>

                            <div class="action-panel mt-4 p-3 border rounded bg-light d-none" id="rejectPanel_${req.id}">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-bold mb-0 text-danger"><i class="bi bi-x-circle me-2"></i> Reject Request</h6>
                                    <button type="button" class="btn-close btn-sm" onclick="hidePanels(${req.id})"></button>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small text-muted">Reason for Rejection</label>
                                    <textarea class="form-control form-control-sm" id="rejectReason_${req.id}" rows="2" placeholder="Explain why this request is not approved..."></textarea>
                                </div>
                                <button class="btn btn-danger btn-sm px-3 text-white" onclick="submitAction(${req.id}, 'rejected')">Confirm Rejection</button>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += card;
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

function showApproveForm(id) {
    hidePanels(id); 
    document.getElementById(`approvePanel_${id}`).classList.remove('d-none');
}

function showRejectForm(id) {
    hidePanels(id);
    document.getElementById(`rejectPanel_${id}`).classList.remove('d-none');
}

function hidePanels(id) {
    document.getElementById(`approvePanel_${id}`).classList.add('d-none');
    document.getElementById(`rejectPanel_${id}`).classList.add('d-none');
}


function submitAction(id, action) {
    let note = "";
    if (action === 'approved') {
        note = document.getElementById(`approveNote_${id}`).value;
    } else {
        note = document.getElementById(`rejectReason_${id}`).value;
    }

    fetch(`/api/admin-handle-request/${id}/`, {
        method: 'POST',
        credentials: 'same-origin', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: action,
            admin_note: note
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message); 
            window.location.reload(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}




