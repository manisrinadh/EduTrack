
const baseUrl = "http://localhost:5000/api/";
const studentApi = `${baseUrl}students`;
const trainerApi = `${baseUrl}trainers`;
document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('userRole').value;

  if (!email || !password || !role) {
    alert("Please fill in all fields.");
    return;
  }


  if (role === 'admin') {
    if (email === 'admin@gradious.com' && password === 'admin123') {
      const adminUser = {
        EMAIL: email,
        ROLE: 'admin',
        NAME: 'Administrator',
        LAST_LOGIN: new Date().toISOString()
      };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      showSuccessAndRedirect('Admin', 'admin.html');
    } else {
      alert('Invalid admin credentials!');
    }
    return;
  }


  const apiUrl = role === 'trainer' ? trainerApi : studentApi;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    const user = users.find(u => u.email === email && u.password === password);
    console.log(user)
    if (user) {
      user.ROLE = role;
      user.LAST_LOGIN = new Date().toISOString();
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      showSuccessAndRedirect(role.charAt(0).toUpperCase() + role.slice(1), `${role}.html`);
    } else {
      alert("Invalid email or password.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed. Please try again later.");
  }
});

function showSuccessAndRedirect(role, redirectUrl) {
  const msg = document.getElementById('success-message');
  msg.style.display = 'block';
  msg.innerText = `Logged in as ${role} successfully!`;
  msg.style.color = 'green';

  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
}
