let allTickets = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetchTickets();
});

function fetchTickets() {
    fetch('/api/admin-tickets/', { credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            allTickets = data.tickets; 
            renderTicketList(); 
            
            if(allTickets.length > 0) {
                loadTicket(allTickets[0].id);
            }
        }
    })
    .catch(error => console.error('Error fetching tickets:', error));
}

function renderTicketList() {
    const listContainer = document.getElementById('ticketList');
    listContainer.innerHTML = ''; 

    allTickets.forEach(t => {
        let badgeClass = 'bg-info-soft text-info';
        let borderClass = 'border-info';
        
        if(t.priority === 'high') {
            badgeClass = 'bg-danger-soft text-danger';
            borderClass = 'border-danger';
        } else if (t.priority === 'medium') {
            badgeClass = 'bg-warning-soft text-warning';
            borderClass = 'border-warning';
        }

        const cardHTML = `
            <div class="card ticket-item mb-2 border-start border-4 ${borderClass}" id="ticket-card-${t.id}" onclick="loadTicket(${t.id})" style="cursor: pointer;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="badge ${badgeClass} text-uppercase">${t.priority}</span>
                        <small class="text-muted">${t.time}</small>
                    </div>
                    <h6 class="mb-1 fw-bold text-dark">${t.category}</h6>
                    <p class="small text-muted mb-0">Asset: ${t.asset_name} (${t.location})</p>
                </div>
            </div>
        `;
        listContainer.innerHTML += cardHTML;
    });
}

function loadTicket(id) {
    const allCards = document.querySelectorAll('.ticket-item');
    allCards.forEach(item => item.classList.remove('active'));
    
    const activeCard = document.getElementById(`ticket-card-${id}`);
    if (activeCard) activeCard.classList.add('active');

    const ticket = allTickets.find(t => t.id === id);
    if (!ticket) return;

    const detailContainer = document.getElementById('ticketDetail');
    
    let statusBadge = 'bg-primary';
    if (ticket.status === 'open') statusBadge = 'bg-danger';
    if (ticket.status === 'resolved') statusBadge = 'bg-success';
    if (ticket.status === 'in_progress') statusBadge = 'bg-warning text-dark';

    detailContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
                <span class="text-primary fw-bold">${ticket.ticket_id}</span>
                <h3 class="fw-bold mt-1">${ticket.category}</h3>
                <p class="text-muted"><i class="bi bi-geo-alt-fill me-1"></i> ${ticket.location}</p>
            </div>
            <div class="text-end">
                <span class="badge ${statusBadge} px-3 py-2 text-uppercase fs-6 shadow-sm"><i class="bi bi-activity me-1"></i> ${ticket.status.replace('_', ' ')}</span>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-7">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold border-bottom pb-2 text-indigo">Issue Description</h6>
                        <p class="text-secondary mt-3" style="line-height: 1.6;">${ticket.description}</p>
                        
                        <div class="mt-4 row p-3 bg-light rounded-3 border">
                            <div class="col-6">
                                <label class="small text-muted d-block text-uppercase fw-bold mb-1">Reported By</label>
                                <span class="fw-bold text-dark"><i class="bi bi-person-badge me-1"></i> ${ticket.reported_by}</span>
                            </div>
                            <div class="col-6">
                                <label class="small text-muted d-block text-uppercase fw-bold mb-1">Asset Name</label>
                                <span class="fw-bold text-dark"><i class="bi bi-laptop me-1"></i> ${ticket.asset_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-5">
                <!-- ACTION PANEL -->
                <div class="card border-0 shadow-sm border-top border-primary border-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3"><i class="bi bi-gear-fill me-2 text-primary"></i>Take Action</h6>
                        
                        <div class="mb-3">
                            <label class="small fw-bold text-muted text-uppercase mb-1">Update Status</label>
                            <select class="form-select border-2" id="updateStatus_${ticket.id}">
                                <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open (Pending)</option>
                                <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>Assign to Technician (In Progress)</option>
                                <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved (Close Ticket)</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="small fw-bold text-muted text-uppercase mb-1">Technician Comments / Assignee</label>
                            <textarea class="form-control border-2" id="updateComments_${ticket.id}" rows="3" placeholder="E.g. Assigned to John for motherboard repair...">${ticket.technician_comments}</textarea>
                        </div>
                        
                        <button class="btn btn-indigo w-100 fw-bold shadow-sm" onclick="submitTicketUpdate(${ticket.id})">
                            <i class="bi bi-check2-circle me-1"></i> Save Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function submitTicketUpdate(id) {
    const statusVal = document.getElementById(`updateStatus_${id}`).value;
    const commentsVal = document.getElementById(`updateComments_${id}`).value;

    fetch(`/api/admin-update-ticket/${id}/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: statusVal,
            comments: commentsVal
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("Ticket updated successfully!");
            window.location.reload(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Update Error:", error);
        alert("Something went wrong!");
    });
}