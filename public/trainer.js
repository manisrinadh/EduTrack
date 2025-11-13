function logout() {
  localStorage.removeItem("loggedInUser");
  alert("Logging out...");
  window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
  loadTrainerProfile();
  showSection("studentlist"); // This will run when DOM is fully loaded
});

const baseUrl = "http://localhost:5000/api/";
const studentApi = `${baseUrl}students`;
const trainerApi = `${baseUrl}trainers`;
const assignmentApi = `${baseUrl}assignments`;
const leaderboardApi = `${baseUrl}leaderboard`;
const attendanceApi = `${baseUrl}attendance`;
const materialApi = `${baseUrl}materials`;
const quizApi = `${baseUrl}quizzes`;
const quizquestionsApi = `${baseUrl}quizquestions`;
const courseInput = document.getElementById('studentCourse');
const studentTableBody = document.getElementById("student-table-body");
const leaderboardTableBody = document.getElementById("leaderboard-table-body");
const studentForm = document.getElementById("studentForm");
const materialForm = document.querySelector("#material form");
const materialMessage = document.querySelector("#material .success-message");
const quizMessage = document.querySelector("#quiz .success-message");
const attendanceForm = document.querySelector("#attendance form");
const attendanceMessage = document.querySelector("#attendance .success-message");
const assignmentForm = document.getElementById("assignmentForm");
const assignmentMessage = document.querySelector("#assignment .success-message");
const headerGreeting = document.querySelector("header h2");
const profileInfo = document.querySelector("#profile .profile-info");
const questionsContainer = document.getElementById('questionsContainer');
const quizForm = document.getElementById('quizForm');
const quizSuccess = document.getElementById('quizSuccess');

let trainerData = null;
let currentlyEditingId = null;

function showSection(sectionId) {
  const sections = document.querySelectorAll(".section, .form-section");
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  document.querySelectorAll(".success-message").forEach(el => el.textContent = "");

  switch (sectionId) {
    case "studentList":
      loadStudents();
      break;
    case "leaderboard":
      loadLeaderboard();
      break;
    case "profile":
      loadTrainerProfile();
      break;
    case "attendance":
      loadAttendanceForm();
    case "quiz":
      addQuestion();
      break;
  }
}


let questionCount = 0;

// 🔁 Add initial question block

function addQuestion() {
  const questionHTML = `
    <div class="question-block">
      <input type="text" placeholder="Question Text" class="question-text" required />
      <input type="text" placeholder="Option A" class="option-a" required />
      <input type="text" placeholder="Option B" class="option-b" required />
      <input type="text" placeholder="Option C" class="option-c" required />
      <input type="text" placeholder="Option D" class="option-d" required />
      <select class="correct-option" required>
        <option value="">Correct Option</option>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
        <option value="d">D</option>
      </select>
    </div>
  `;
  questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
  questionCount++;
}

// ✍️ On form submit
quizForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const loggedInTrainer = JSON.parse(localStorage.getItem("loggedInUser"));
  const title = document.getElementById('quizTitle').value.trim();
  const courseName = loggedInTrainer?.course;
  const trainerId = loggedInTrainer?.id;

  if (!title || !courseName || !trainerId || questionCount < 1) {
    return alert("Please fill in title, course, and at least one question.");
  }

  const questionBlocks = document.querySelectorAll('.question-block');
  const questions = [];

  questionBlocks.forEach(block => {
    const q = block.querySelector('.question-text').value.trim();
    const a = block.querySelector('.option-a').value.trim();
    const b = block.querySelector('.option-b').value.trim();
    const c = block.querySelector('.option-c').value.trim();
    const d = block.querySelector('.option-d').value.trim();
    const correct = block.querySelector('.correct-option').value;

    if (q && a && b && c && d && correct) {
      questions.push({
        question_text: q,
        option_a: a,
        option_b: b,
        option_c: c,
        option_d: d,
        correct_option: correct
      });
    }
  });

  if (questions.length < 1) return alert("Please complete all question fields.");

  try {
    // STEP 1: Create the quiz
    const quizRes = await fetch(quizApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, course_name: courseName, trainer_id: trainerId })
    });

    if (!quizRes.ok) throw new Error("Failed to create quiz");

    const { quizId } = await quizRes.json();

    // STEP 2: Add questions to the created quiz
    const questionRes = await fetch(`${quizquestionsApi}/${quizId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questions })
});


    if (!questionRes.ok) throw new Error("Failed to save questions");

    quizSuccess.textContent = "✅ Quiz and questions added successfully!";
    quizForm.reset();
    questionsContainer.innerHTML = '';
    addQuestion();
  } catch (err) {
    console.error(err);
    quizSuccess.textContent = "❌ Server error occurred.";
  }
});


async function loadTrainerProfile() {
  try {
    const loggedInTrainer = JSON.parse(localStorage.getItem("loggedInUser"));
    const trainerId = loggedInTrainer?.id || 1;

    const res = await fetch(`${trainerApi}/${trainerId}`);
    if (!res.ok) throw new Error("Failed to fetch trainer");

    trainerData = await res.json();
    const now = new Date();

    headerGreeting.textContent = `Hi, ${trainerData.name}!`;

    profileInfo.innerHTML = `
      <p><strong>Name:</strong> ${trainerData.name}</p>
      <p><strong>Email:</strong> ${trainerData.email}</p>
      <p><strong>Course:</strong> ${trainerData.course}</p>
      <p><strong>Last Login:</strong> ${now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
    `;

    if (courseInput) {
      courseInput.value = trainerData.course;
    }

  } catch (err) {
    console.error("Error loading trainer profile:", err);
  }
}

async function loadStudents() {
  try {
    const res = await fetch(studentApi);
    const students = await res.json();

    const course = trainerData?.course?.toLowerCase();
    const filteredStudents = students.filter(student =>
      student.course?.toLowerCase() === course
    );

    studentTableBody.innerHTML = "";
    filteredStudents.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.college || ""}</td>
        <td>${student.course}</td>
        <td>${student.attendance  || 0}</td>
        <td>
          <button class="update-btn" onclick="editStudent(${student.id})">Update</button>
          <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load students:", err);
  }
}

const attendanceData = {};

async function loadAttendanceForm() {
  try {
    const res = await fetch(studentApi); // 🔄 This should be the students API, not attendanceApi
    const students = await res.json();

    const course = trainerData?.course?.toLowerCase();
    const filteredStudents = students.filter(s => s.course?.toLowerCase() === course);

    const studentSelect = document.getElementById("studentSelect");
    studentSelect.innerHTML = '<option value="">Select Student</option>';

    filteredStudents.forEach(student => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = `${student.id} - ${student.name}`;
      studentSelect.appendChild(option);

      if (!attendanceData[student.id]) {
        attendanceData[student.id] = {
          present: 0,
          total: 0,
          ID: student.id,
          NAME: student.name,
          COLLEGE: student.college || "",
          ATTENDANCE: student.attendance || 0,
          records: []
        };
      }
    });

    updateAttendanceTable();

  } catch (err) {
    console.error("Failed to load students for attendance:", err);
  }
}

attendanceForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const studentId = document.getElementById("studentSelect").value;
  const status = document.getElementById("attendanceStatus").value;
  const date = document.getElementById("attendanceDate").value;

  if (!studentId || !attendanceData[studentId]) {
    alert("Please select a valid student.");
    return;
  }
  if (!date) {
    alert("Please select a date.");
    return;
  }

  const record = attendanceData[studentId];
const existingIndex = record.records.findIndex(r => r.date === date);

// 🔁 Update or insert attendance record for the date
if (existingIndex !== -1) {
  record.records[existingIndex].status = status;
} else {
  record.records.push({ date, status });
}

// ✅ Recalculate present and total from records to ensure accuracy
record.present = record.records.filter(r => r.status === "present").length;
record.total = record.records.length;

// 🎯 Calculate attendance percentage
record.ATTENDANCE = record.total === 0
  ? 0
  : Math.round((record.present / record.total) * 100);

console.log("📋 Records:", record.records);
console.log("✅ Present:", record.present, "Total:", record.total, "→", record.ATTENDANCE, "%");

// 🔔 Show confirmation and update UI
attendanceMessage.textContent = `Marked ${status} for ${record.NAME} on ${date}`;
updateAttendanceTable();

  try {
    // ✅ 1. Save attendance record to attendance table
    const saveRes = await fetch(attendanceApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        student_name: record.NAME,
        course: trainerData.course,
        date,
        status,
        marked_by: trainerData.id
      })
    });

    if (!saveRes.ok) throw new Error("Failed to insert attendance");

    // ✅ 2. Update student's ATTENDANCE % in students table
    const updateRes = await fetch(`${studentApi}/${studentId}/attendance`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ ATTENDANCE: record.ATTENDANCE })
});



if (!updateRes.ok) {
  const errorMsg = await updateRes.text();  // not just json
  throw new Error(`Attendance PATCH failed: ${errorMsg}`);
}

    console.log("✅ Attendance logged and updated!");

  } catch (error) {
    console.error("❌ Error saving attendance:", error);
    alert("Failed to update attendance. Try again.");
  }
});

function updateAttendanceTable() {
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";

  Object.values(attendanceData).forEach(student => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.ID}</td>
      <td>${student.NAME}</td>
      <td>${student.COLLEGE}</td>
      <td>${student.ATTENDANCE  || 0}</td>
    `;
    tbody.appendChild(tr);
  });
}


studentForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form default submission

  const newStudent = {
    name: document.getElementById("studentName").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    college: document.getElementById("studentCollege").value,
    course: document.getElementById("studentCourse").value,
    password: document.getElementById("studentPassword").value.trim(),
    attendance: 0 // Initialize attendance as 0%
  };

  try {
    const res = await fetch(studentApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });

    if (res.ok) {
      alert(`Student "${newStudent.name}" added successfully.`);
      studentForm.reset();              // Clear the form
      showSection("studentList");       // Return to list
      loadStudents();                   // Refresh student table
    } else {
      alert("Failed to add student.");  // Show error
    }
  } catch (err) {
    console.error("Error adding student:", err); // Log detailed error
  }
});


window.deleteStudent = async function (ID) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  try {
    const res = await fetch(`${studentApi}/${ID}`, { method: "DELETE" });
    if (res.ok) {
      alert("Student deleted successfully.");
      loadStudents();
    } else {
      alert("Failed to delete student.");
    }
  } catch (err) {
    alert("Error deleting student: " + err.message);
  }
};

async function loadLeaderboard() {
  if (!trainerData?.course) {
    console.error('Trainer not logged in or COURSE missing.');
    return;
  }

  const leaderboardTableBody = document.getElementById("leaderboardTableBody");
  if (!leaderboardTableBody) {
    console.error("Element with ID 'leaderboardTableBody' not found.");
    return;
  }

  try {
    const res = await fetch(leaderboardApi);
    const students = await res.json();
    console.log(res);
    
    students.forEach(s => s.points = parseInt(s.points) || 0);

    const course = trainerData.course.toLowerCase();
    const filteredStudents = students.filter(s =>
      s.course?.toLowerCase() === course
    );

    filteredStudents.sort((a, b) => b.points - a.points);

    leaderboardTableBody.innerHTML = "";
    filteredStudents.forEach((student, index) => {
      const tr = document.createElement("tr");
      if (index === 0) tr.classList.add('gold');
      else if (index === 1) tr.classList.add('silver');
      else if (index === 2) tr.classList.add('bronze');

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.college || ""}</td>
        <td>${student.course}</td>
        <td>${student.points}</td>
      `;
      leaderboardTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed to load leaderboard:", err);
    leaderboardTableBody.innerHTML = `<tr><td colspan="5">Error loading leaderboard.</td></tr>`;
  }
}

window.editStudent = async function (id) {
  if (currentlyEditingId) {
    alert("Please save or cancel the current edit first.");
    return;
  }
  currentlyEditingId = id;

  try {
    const res = await fetch(`${studentApi}/${id}`);
    const student = await res.json();

    const row = [...studentTableBody.querySelectorAll("tr")].find(row =>
      row.querySelector("button.update-btn")?.getAttribute("onclick").includes(id)
    );
    if (!row) return;

    row.innerHTML = `
      <td>${student.id}</td>
      <td><input type="text" id="editName" value="${student.name}"></td>
      <td><input type="email" id="editEmail" value="${student.email}"></td>
      <td><input type="text" id="editCollege" value="${student.college || ''}"></td>
      <td><input type="text" id="editCourse" value="${student.course}"></td>
      <td>${student.attendance}</td>
      <td>
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
      </td>
    `;

    row.querySelector(".save-btn").addEventListener("click", async () => {
      const updatedStudent = {
        name: row.querySelector("#editName").value.trim(),
        email: row.querySelector("#editEmail").value.trim(),
        college: row.querySelector("#editCollege").value.trim(),
        course: row.querySelector("#editCourse").value.trim(),
        password: row.querySelector("#editPassword").value.trim(),
      };

      try {
        const updateRes = await fetch(`${studentApi}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStudent),
        });

        if (updateRes.ok) {
          alert("Student updated successfully.");
          currentlyEditingId = null;
          loadStudents();
        } else {
          alert("Failed to update student.");
        }
      } catch (err) {
        alert("Error updating student: " + err.message);
      }
    });

    row.querySelector(".cancel-btn").addEventListener("click", () => {
      currentlyEditingId = null;
      loadStudents();
    });

  } catch (err) {
    alert("Failed to fetch student for editing: " + err.message);
    currentlyEditingId = null;
  }
};

function showSuccess(el, message) {
  el.textContent = message;
  el.style.color = "green";
  setTimeout(() => (el.textContent = ""), 3000);
}

assignmentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const trainer = JSON.parse(localStorage.getItem("loggedInUser"));
  console.log(trainer)
  if (!trainer) {
    alert("Trainer not logged in.");
    return;
  }

  const form = e.target;
  const formData = new FormData(form); // includes assignment_name, due_date, pdf

  // Append additional trainer data
  const today = new Date().toISOString().split("T")[0];
  formData.append("tid", trainer.id);
  formData.append("course", trainer.course);
  formData.append("assigned_date", today);

  try {
    const response = await fetch(assignmentApi, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById("uploadStatus").innerText = "✅ Assignment uploaded!";
      form.reset();
    } else {
      throw new Error(result.error || "Upload failed");
    }
  } catch (err) {
    document.getElementById("uploadStatus").innerText = "❌ " + err.message;
  }
});


materialForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const trainer = JSON.parse(localStorage.getItem("loggedInUser"));
  const title = document.getElementById("materialTitle").value;
  const description = document.getElementById("materialDescription").value;
  const fileInput = document.getElementById("materialFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a PDF file.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
formData.append("description", description);
formData.append("pdf", file); // ✅ Correct field name
formData.append("course", trainerData.course);
formData.append("trainer_id", trainerData.id);


  try {
    const res = await fetch(materialApi, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("materialSuccess").textContent = "✅ Material added!";
      materialForm.reset();
    } else {
      alert("❌ Failed to upload material: " + data.error);
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Server error. Try again.");
  }
});


quizForm.addEventListener("submit", function (e) {
  e.preventDefault();
  showSuccess(quizMessage, "Quiz added successfully");
  quizForm.reset();
});

function editProfile() {
  document.getElementById('editProfile').style.display = 'block';
  document.getElementById('changePassword').style.display = 'none';

  document.getElementById('editProfileName').value = trainerData.name || '';
  document.getElementById('editProfileEmail').value = trainerData.email || '';
}

function changePassword() {
  document.getElementById('changePassword').style.display = 'block';
  document.getElementById('editProfile').style.display = 'none';
}

const cancelBtn1 = document.getElementById("cancelBtn1");
if (cancelBtn1) {
  cancelBtn1.addEventListener("click", function () {
    document.getElementById("editProfileForm").reset();
    document.getElementById("editProfile").style.display = "none";
  });
}

const cancelBtn2 = document.getElementById("cancelBtn2");
if (cancelBtn2) {
  cancelBtn2.addEventListener("click", function () {
    document.getElementById("changePasswordForm").reset();
    document.getElementById("changePassword").style.display = "none";
  });
}

document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const updatedName = document.getElementById('editProfileName').value.trim();
  const updatedEmail = document.getElementById('editProfileEmail').value.trim();

  if (!updatedName || !updatedEmail) {
    alert('Please fill all fields');
    return;
  }

  try {
    const res = await fetch(`${trainerApi}/${trainerData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...trainerData, name: updatedName, email: updatedEmail }),
    });

    if (!res.ok) throw new Error('Failed to update profile');

    trainerData = await res.json();
    document.getElementById('trainer-name').innerText = trainerData.name;
    document.getElementById('trainer-email').innerText = trainerData.email;
    headerGreeting.textContent = `Hi, ${trainerData.name}!`;

    alert('Profile updated successfully!');
    document.getElementById('editProfile').style.display = 'none';

  } catch (error) {
    console.error(error);
    alert('Error updating profile. Please try again.');
  }
});

document.getElementById('changePasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!newPassword) {
    alert('Password cannot be empty!');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match!');
    return;
  }

  try {
    const res = await fetch(`${trainerApi}/${trainerData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...trainerData, password: newPassword }),
    });

    if (!res.ok) throw new Error('Failed to update password');

    alert('Password updated successfully!');
    document.getElementById('changePasswordForm').reset();
    document.getElementById('changePassword').style.display = 'none';

  } catch (error) {
    console.error(error);
    alert('Error updating password. Please try again.');
  }
});
document.addEventListener("DOMContentLoaded", () => {
  showSection("studentList");
});