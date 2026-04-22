const BASE_URL = 'http://localhost:3000/api';

// Handle Donor Registration (STF2.html)
const donorForm = document.getElementById('donorForm');
if (donorForm) {
    donorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            bloodGroup: document.getElementById('regBloodGroup').value,
            fullName: document.getElementById('regFullName').value,
            phone: document.getElementById('regPhone').value,
            password: document.getElementById('regPassword').value,
            city: document.getElementById('regCity').value,
            state: document.getElementById('regState').value
        };

        const msgEl = document.getElementById('regMessage');
        msgEl.innerText = 'Registering...';

        try {
            const response = await fetch(`${BASE_URL}/donors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                msgEl.innerText = 'Registration successful!';
                donorForm.reset();
            } else {
                msgEl.innerText = 'Error registering donor.';
            }
        } catch (error) {
            msgEl.innerText = 'Network error.';
        }
    });
}

// Handle Login (STF login.html)
const loginForm = document.querySelector('form');
if (loginForm && window.location.pathname.includes('login')) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('donorInfo', JSON.stringify(result.donor));
                window.location.href = 'donor-dashboard.html';
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            alert('Server error');
        }
    });
}

// Handle Blood Search (STF3.html)
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bloodGroup = document.getElementById('searchBloodGroup').value;
        const city = document.getElementById('searchCity').value;
        const state = document.getElementById('searchState').value;

        const resultsEl = document.getElementById('searchResults');
        resultsEl.innerHTML = '<p>Searching...</p>';

        try {
            const query = new URLSearchParams({ bloodGroup, city, state }).toString();
            const response = await fetch(`${BASE_URL}/donors/search?${query}`);
            const donors = await response.json();

            if (response.ok) {
                if (donors.length === 0) {
                    resultsEl.innerHTML = '<p style="color:red;">No matching donors found.</p>';
                    return;
                }

                let html = '<h3>Matching Donors:</h3><div style="display:flex; flex-direction:column; gap:10px;">';
                donors.forEach(donor => {
                    html += `
                        <div style="background:#f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${donor.fullName}</strong> (${donor.bloodGroup})<br>
                                <small>📍 ${donor.city}, ${donor.state}</small>
                            </div>
                            <button onclick="window.open('call.html?phone=${donor.phone}&name=${donor.fullName}', '_blank', 'width=400,height=600')" 
                                style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">
                                📞 Call
                            </button>
                        </div>
                    `;
                });
                html += '</div>';
                resultsEl.innerHTML = html;
            } else {
                resultsEl.innerHTML = '<p style="color:red;">Error searching donors.</p>';
            }
        } catch (error) {
            resultsEl.innerHTML = '<p style="color:red;">Network error.</p>';
        }
    });
}
