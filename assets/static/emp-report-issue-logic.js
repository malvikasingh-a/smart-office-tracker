document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportIssueForm');

    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Form validation check
            if (!reportForm.checkValidity()) {
                e.stopPropagation();
                reportForm.classList.add('was-validated');
                return;
            }

            // Collection of Data
            const asset = document.getElementById('assetSelect').value;
            const category = document.getElementById('problemCategory').value;

            // Success Notification
            alert(`SUCCESS! \n\nYour maintenance ticket for Asset ID: ${asset} has been created. \nOur technician will review the ${category} issue shortly.`);

            // Redirect to dashboard
            window.location.href = 'employee-dash.html';
        });
    }
});