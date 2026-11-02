document.addEventListener('DOMContentLoaded', () => {
    
    fetchDashboardData();

    function fetchDashboardData() {
        fetch('/api/admin-dashboard-stats/')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server response with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const empElement = document.getElementById('dashTotalEmployees');
                if (empElement) empElement.innerText = data.total_employees;
                
                const maintenanceElement = document.getElementById('dashActiveMaintenance');
                if (maintenanceElement) maintenanceElement.innerText = data.active_maintenance;
                
                const assetElement = document.getElementById('dashTotalAssets');
                if (assetElement) assetElement.innerText = data.total_assets;
                
                const reqElement = document.getElementById('dashPendingRequests');
                if (reqElement) reqElement.innerText = data.pending_requests;
                
                const ticketElement = document.getElementById('dashOpenTickets');
                if (ticketElement) ticketElement.innerText = data.open_tickets;
                
                const assetValueElement = document.getElementById('dashTotalAssetValue');
                if (assetValueElement) assetValueElement.innerText = `₹${data.total_asset_value.toLocaleString()}`;
                
             
                const ctx = document.getElementById('assetChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.chart_labels,
                        datasets: [{
                            label: 'Total Assets',
                            data: data.chart_counts, 
                            backgroundColor: '#007bff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });

                const activityBody = document.getElementById('activity-table');
                
                if (data.recent_activities && data.recent_activities.length > 0) {
                    activityBody.innerHTML = data.recent_activities.map(act => `
                        <tr>
                            <td>
                                <div class="fw-bold text-dark">${act.item}</div>
                                <small class="text-muted">${act.action}</small>
                            </td>
                            <td class="text-end">
                                <span class="badge bg-${act.status} rounded-pill">${act.time}</span>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    
                    activityBody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No recent activity</td></tr>';
                }
                
            } else {
                console.error("Dashboard data load error:", data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
        });
    }
});