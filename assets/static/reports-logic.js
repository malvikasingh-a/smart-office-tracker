document.addEventListener('DOMContentLoaded', () => {
    fetchReportsData();
});

function fetchReportsData() {
    fetch('/api/reports/')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            
            const depBody = document.getElementById('depreciationBody');
            depBody.innerHTML = ''; 
            
            if (data.depreciation.length > 0) {
                data.depreciation.forEach(asset => {
                    const row = `
                        <tr>
                            <td class="fw-medium">${asset.name}</td>
                            <td>$${asset.cost.toLocaleString()}</td>
                            <td>${asset.purchase_date}</td>
                            <td>${asset.life}</td>
                            <td class="text-indigo fw-bold book-value">$${asset.book_value.toLocaleString()}</td>
                        </tr>
                    `;
                    depBody.innerHTML += row;
                });
            } else {
                depBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No assets found in inventory.</td></tr>';
            }

            // 2. Warranty Alerts List 
            const warList = document.getElementById('warrantyList');
            warList.innerHTML = ''; 
            
            if (data.warranty_alerts.length > 0) {
                data.warranty_alerts.forEach(alert => {
                    const li = `
                        <li class="list-group-item p-3 border-0 border-bottom">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="fw-bold mb-1">${alert.name}</h6>
                                    <p class="small text-muted mb-0">S/N: ${alert.serial_no}</p>
                                </div>
                                <span class="text-danger small fw-bold">Ends in ${alert.days_left} days</span>
                            </div>
                        </li>
                    `;
                    warList.innerHTML += li;
                });
            } else {
                warList.innerHTML = '<li class="list-group-item p-3 border-0 text-center text-muted">No upcoming warranty expirations! 🎉</li>';
            }

        } else {
            console.error("Report data load error:", data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching report stats:', error);
    });
}