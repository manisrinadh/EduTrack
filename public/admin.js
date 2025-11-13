const baseUrl = "http://localhost:5000/api/";
const studentApi = `${baseUrl}students`;
const trainerApi = `${baseUrl}trainers`;
const leaderboardApi = `${baseUrl}leaderboard`;
let currentlyEditingId = null;

const sections = document.querySelectorAll(".section");
const studentTableBody = document.getElementById("student-table-body");
const trainerTableBody = document.getElementById("trainer-table-body");
const collegeTableBody = document.getElementById("college-table-body");
const courseTableBody = document.getElementById("course-table-body");
const leaderboardTableBody = document.getElementById("leaderboard-table-body");

const studentForm = document.getElementById("studentForm");
const trainerForm = document.getElementById("trainerForm");

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function showSection(sectionId) {
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  if (sectionId === "studentList") loadStudents();
  else if (sectionId === "trainerList") loadTrainers();
  else if (sectionId === "collegeList") loadColleges();
  else if (sectionId === "courseList") loadCourses();
  else if (sectionId === "leaderboard") loadLeaderboard();
}

function logout() {
  localStorage.removeItem("token");
  alert("Logging out...");
  window.location.href = "login.html";
}

function showAddStudentForm() {
  showSection("addStudentForm");
}
function showAddTrainerForm() {
  showSection("addTrainerForm");
}

async function loadStudents() {
  try {
    const res = await fetch(studentApi, { headers: authHeaders() });
    const students = await res.json();
    studentTableBody.innerHTML = "";

    students.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.college || ""}</td>
        <td>${student.course}</td>
        <td>${student.attendance}</td>
        <td>
          <button class="update-btn" onclick="editStudent('${student.id}')">Update</button>
          <button class="delete-btn" onclick="deleteStudent('${student.id}')">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load students:", err);
  }
}

async function loadTrainers() {
  try {
    const res = await fetch(trainerApi, { headers: authHeaders() });
    const trainers = await res.json();
    trainerTableBody.innerHTML = "";

    trainers.forEach(trainer => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${trainer.id}</td>
        <td>${trainer.name}</td>
        <td>${trainer.email}</td>
        <td>${trainer.course}</td>
        <td>
          <button class="update-btn" onclick="editTrainer('${trainer.id}')">Update</button>
          <button class="delete-btn" onclick="deleteTrainer('${trainer.id}')">Delete</button>
        </td>
      `;
      trainerTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load trainers:", err);
  }
}

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newStudent = {
    NAME: document.getElementById("studentName").value.trim(),
    EMAIL: document.getElementById("studentEmail").value.trim(),
    COLLEGE: document.getElementById("studentCollege").value,
    COURSE: document.getElementById("studentCourse").value,
    PASSWORD: document.getElementById("studentPassword").value.trim(),
    ATTENDANCE: 0,
  };

  try {
    const res = await fetch(studentApi, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(newStudent),
    });

    if (res.ok) {
      alert(`Student "${newStudent.NAME}" added successfully.`);
      studentForm.reset();
      showSection("studentList");
      loadStudents();
    } else {
      alert("Failed to add student.");
    }
  } catch (err) {
    console.error("Error adding student:", err);
  }
});

trainerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newTrainer = {
    NAME: document.getElementById("trainerName").value.trim(),
    EMAIL: document.getElementById("trainerEmail").value.trim(),
    COURSE: document.getElementById("trainerCourse").value,
    PASSWORD: document.getElementById("trainerPassword").value.trim(),
  };

  try {
    const res = await fetch(trainerApi, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(newTrainer),
    });

    if (res.ok) {
      alert(`Trainer "${newTrainer.name}" added successfully.`);
      trainerForm.reset();
      showSection("trainerList");
      loadTrainers();
    } else {
      alert("Failed to add trainer.");
    }
  } catch (err) {
    console.error("Error adding trainer:", err);
  }
});

window.editStudent = async function (id) {
  if (currentlyEditingId) return alert("Please finish editing another row first.");
  currentlyEditingId = id;

  const res = await fetch(`${studentApi}/${id}`, { headers: authHeaders() });
  const student = await res.json();

  const row = [...studentTableBody.querySelectorAll("tr")].find(tr =>
    tr.querySelector("button.update-btn").getAttribute("onclick").includes(id)
  );

  row.innerHTML = `
    <td>${student.id}</td>
    <td><input type="text" id="editName" value="${student.name}"></td>
    <td><input type="email" id="editEmail" value="${student.email}"></td>
    <td><input type="text" id="editCollege" value="${student.college}"></td>
    <td><input type="text" id="editCourse" value="${student.course}"></td>
    <td>${student.attendance}</td>
    <td>
      <button class="save-btn">Save</button>
      <button class="cancel-btn">Cancel</button>
    </td>
  `;

  row.querySelector(".save-btn").addEventListener("click", async () => {
    const updatedStudent = {
      NAME: row.querySelector("#editName").value.trim(),
      EMAIL: row.querySelector("#editEmail").value.trim(),
      COLLEGE: row.querySelector("#editCollege").value.trim(),
      COURSE: row.querySelector("#editCourse").value.trim(),
      ATTENDANCE: student.attendance,
      PASSWORD: student.password
    };

    await fetch(`${studentApi}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedStudent),
    });

    currentlyEditingId = null;
    loadStudents();
  });

  row.querySelector(".cancel-btn").addEventListener("click", () => {
    currentlyEditingId = null;
    loadStudents();
  });
};

window.editTrainer = async function (id) {
  if (currentlyEditingId) return alert("Finish editing the current row first.");
  currentlyEditingId = id;

  const res = await fetch(`${trainerApi}/${id}`, { headers: authHeaders() });
  const trainer = await res.json();

  const row = [...trainerTableBody.querySelectorAll("tr")].find(tr =>
    tr.querySelector("button.update-btn").getAttribute("onclick").includes(id)
  );

  row.innerHTML = `
    <td>${trainer.id}</td>
    <td><input class="edit-name" value="${trainer.name}"></td>
    <td><input class="edit-email" value="${trainer.email}"></td>
    <td><input class="edit-course" value="${trainer.course}"></td>
    <td>
      <button class="save-btn">Save</button>
      <button class="cancel-btn">Cancel</button>
    </td>
  `;

  row.querySelector(".save-btn").addEventListener("click", async () => {
    const updatedTrainer = {
      NAME: row.querySelector(".edit-name").value.trim(),
      EMAIL: row.querySelector(".edit-email").value.trim(),
      COURSE: row.querySelector(".edit-course").value.trim(),
      PASSWORD: trainer.PASSWORD, // Keep existing password
    };

    await fetch(`${trainerApi}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updatedTrainer),
    });

    currentlyEditingId = null;
    loadTrainers();
  });

  row.querySelector(".cancel-btn").addEventListener("click", () => {
    currentlyEditingId = null;
    loadTrainers();
  });
};

window.deleteStudent = async function (id) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  await fetch(`${studentApi}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  loadStudents();
};

window.deleteTrainer = async function (id) {
  if (!confirm("Are you sure you want to delete this trainer?")) return;
  await fetch(`${trainerApi}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  loadTrainers();
};

async function loadColleges() {
  const colleges = (collegeTableBody.getAttribute("data-colleges") || "").split(",");
  const students = await (await fetch(studentApi, { headers: authHeaders() })).json();
  collegeTableBody.innerHTML = "";
  colleges.forEach(college => {
    const count = students.filter(s => s.college === college).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${college}</td><td>${count}</td>`;
    collegeTableBody.appendChild(tr);
  });
}

async function loadCourses() {
  const courses = (courseTableBody.getAttribute("data-courses") || "").split(",");
  const students = await (await fetch(studentApi, { headers: authHeaders() })).json();
  courseTableBody.innerHTML = "";
  courses.forEach(course => {
    const count = students.filter(s => s.course === course).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${course}</td><td>${count}</td>`;
    courseTableBody.appendChild(tr);
  });
}

async function loadLeaderboard() {
  const students = await (await fetch(leaderboardApi, { headers: authHeaders() })).json();
  leaderboardTableBody.innerHTML = "";
  students.sort((a, b) => a.name.localeCompare(b.name));
  students.forEach(student => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.college || ""}</td>
      <td>${student.course}</td>
      <td>${student.points}</td>
    `;
    leaderboardTableBody.appendChild(tr);
  });
}

window.editProfile = function () {
  alert("Edit profile feature coming soon!");
};
window.changePassword = function () {
  alert("Change password feature coming soon!");
};

document.addEventListener("DOMContentLoaded", () => {
  showSection("studentList");
});
