document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();

            if (message !== "") {
                // Create new chat bubble for user
                const messageDiv = document.createElement('div');
                messageDiv.className = 'd-flex mb-4 justify-content-end';
                messageDiv.innerHTML = `
                    <div class="chat-bubble user bg-indigo text-white shadow">
                        <p class="mb-1">${message}</p>
                        <small class="text-white-50">Just now</small>
                    </div>
                `;
                
                chatBody.appendChild(messageDiv);
                chatInput.value = ""; 
                
                // Scroll to bottom
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        });
    }
});