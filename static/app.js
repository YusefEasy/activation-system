document.addEventListener('DOMContentLoaded', () => {
    const adminKey = new URLSearchParams(window.location.search).get('admin_key');
    if (!adminKey) {
        alert("Admin key required in URL parameters!");
        return;
    }

    // Load keys on startup
    fetchKeys();

    // Generate key button
    document.getElementById('generate-btn').addEventListener('click', () => {
        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_key: adminKey })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`New key: ${data.key}`);
                fetchKeys();
            } else {
                alert(`Error: ${data.message}`);
            }
        });
    });
});

function fetchKeys() {
    fetch('/api/list?admin_key=' + adminKey)
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('#keys-table tbody');
        tableBody.innerHTML = '';
        
        data.keys.forEach(key => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key.key.substring(0, 8)}...</td>
                <td>${new Date(key.created_at).toLocaleString()}</td>
                <td class="status">${key.is_active ? 'Active' : 'Disabled'}</td>
                <td>
                    <button class="${key.is_active ? 'disable' : 'enable'}"
                            onclick="toggleKey('${key.key}', ${!key.is_active})">
                        ${key.is_active ? 'Disable' : 'Enable'}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

function toggleKey(keyHash, enable) {
    const endpoint = enable ? '/api/enable' : '/api/disable';
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            admin_key: adminKey,
            activation_key: keyHash 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchKeys();
        } else {
            alert("Error: " + data.message);
        }
    });
}