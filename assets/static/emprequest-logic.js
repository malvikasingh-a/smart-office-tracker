// Function to get the CSRF token from Django's cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newRequestForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const category = document.getElementById('assetCategory').value;
            const specs = document.getElementById('specs').value;
            const reason = document.getElementById('reason').value;
            const urgencyElements = document.getElementsByName('urgency');
            let urgency = 'low';
            for (let radio of urgencyElements) {
                if (radio.checked) {
                    urgency = radio.value;
                    break;
                }
            }
            if (!category) {
                alert("Please select an Asset Category.");
                return;
            }
            if (!reason) {
                alert("Please provide a reason for this request.");
                return;
            }

            const csrftoken = getCookie('csrftoken');

            // 3. Data send to api
            fetch('/api/emp-submit-request/', {   
                method: 'POST',
                credentials: 'same-origin',      
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken      
                },
                body: JSON.stringify({
                    category: category,
                    specs: specs,
                    reason: reason,
                    urgency: urgency
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    form.reset(); 
                    
                    window.location.href = '/employee-dash/';
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error submitting request:", error);
                alert("Failed to submit request. Check console.");
            });
        });
    }
});