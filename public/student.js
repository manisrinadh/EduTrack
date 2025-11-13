const coursesData = {
  FSN: {
    title: "Full Stack Development (FSN)",
    description: "Learn frontend and backend development with modern tools and frameworks.",
    duration: "6 months",
    syllabus: [
      "HTML, CSS, JavaScript basics",
      "ReactJS and Redux",
      "Node.js and Express",
      "Database Management (MongoDB, SQL)",
      "Project Work"
    ],
  },
  "AI-DS": {
    title: "Artificial Intelligence & Data Science (AI-DS)",
    description: "Master AI concepts with data science techniques, machine learning, and visualization.",
    duration: "6 months",
    syllabus: [
      "Python for AI & Data Science",
      "Machine Learning Algorithms",
      "Data Analysis and Visualization",
      "Natural Language Processing",
      "Capstone Project"
    ],
  },
  "AI-ML": {
    title: "Artificial Intelligence & Machine Learning (AI-ML)",
    description: "Deep dive into machine learning algorithms and AI applications.",
    duration: "6 months",
    syllabus: [
      "Machine Learning Fundamentals",
      "Neural Networks and Deep Learning",
      "Computer Vision",
      "Reinforcement Learning",
      "Real-world AI Projects"
    ],
  },
  CS: {
    title: "Computer Science (CS)",
    description: "Comprehensive computer science fundamentals and programming skills.",
    duration: "8 months",
    syllabus: [
      "Programming Fundamentals",
      "Data Structures and Algorithms",
      "Operating Systems",
      "Databases",
      "Software Engineering"
    ],
  },
  "GEN-AI": {
    title: "General Artificial Intelligence (GEN-AI)",
    description: "Introduction to AI concepts and emerging technologies in AI.",
    duration: "5 months",
    syllabus: [
      "AI Basics and History",
      "Machine Learning Overview",
      "Ethics in AI",
      "AI Tools and Frameworks",
      "Future Trends"
    ],
  }
};
const baseUrl = "http://localhost:5000/api/";
const studentApi = `${baseUrl}students`;
const trainerApi = `${baseUrl}trainers`;
const assignmentApi = `${baseUrl}assignments`;
const sumbitassignmentApi = `${baseUrl}submitassignments`;
const leaderboardApi = `${baseUrl}leaderboard`;
const attendanceApi = `${baseUrl}attendance`;
const materialApi = `${baseUrl}materials`;
const quizApi = `${baseUrl}quizzes`;
const quizquestionApi = `${baseUrl}quizquestions`;
const attemptApi = `${baseUrl}attempts`;
const answerApi = `${baseUrl}answers`;
let loggedInStudent = null; // Declare globally and mutable

function showMyCourseDetails() {
  const courseKey = loggedInStudent?.course;
  const courseDetailsDiv = document.getElementById('courseDetails');

  if (!courseKey || !coursesData[courseKey]) {
    courseDetailsDiv.innerHTML = "<p>No course details available for your enrolled course.</p>";
    return;
  }

  const course = coursesData[courseKey];

  courseDetailsDiv.innerHTML = `
    <h3>${course.title}</h3>
    <p><strong>Description:</strong> ${course.description}</p>
    <p><strong>Duration:</strong> ${course.duration}</p>
    <h4>Syllabus:</h4>
    <ul>
      ${course.syllabus.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('loggedInUser');
  if (!userStr) {
    alert('You are not logged in. Redirecting to login.');
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);
  if (user.ROLE !== 'student') {
    alert('Access denied. Redirecting to login.');
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
    return;
  }

  loggedInStudent = user; // ✅ Safe global assignment
  showGreeting();
  showStudentProfile();
  loadAndShowTrainers();
  loadLeaderboard();
  setupHelpForm();
  showMyCourseDetails();
  loadAssignments();
  loadMaterials();
  loadAttendance();
  loadQuizzesForLoggedInStudent();
});


function logout() {
  localStorage.removeItem('loggedInUser');
  alert('Logged out successfully!');
  window.location.href = 'login.html';
}

function showGreeting() {
  const greetingDiv = document.getElementById('student-greeting');
  if (greetingDiv) {
    greetingDiv.textContent = `Hii, ${loggedInStudent.name}!`;
  }
}

function showStudentProfile() {
  const nameSpan = document.getElementById('student-name');
  const emailSpan = document.getElementById('student-email');
  const courseSpan = document.getElementById('student-course');
  const collegeSpan = document.getElementById('student-college');
  const lastLoginSpan = document.getElementById('student-last-login');
  if (nameSpan) nameSpan.textContent = loggedInStudent.name;
  if (emailSpan) emailSpan.textContent = loggedInStudent.email;
  if (courseSpan) courseSpan.textContent = loggedInStudent.course || 'FSN';
  if (collegeSpan) collegeSpan.textContent= loggedInStudent.college ;
  if (lastLoginSpan && loggedInStudent.LAST_LOGIN) {
  const dateOnly = loggedInStudent.LAST_LOGIN.slice(0, 10); 
  lastLoginSpan.textContent = dateOnly;
}
} 

async function loadAndShowTrainers() {
  const trainerSection = document.getElementById('trainerContact');
  if (!trainerSection) return;

  try {
    const res = await fetch(trainerApi);
    if (!res.ok) throw new Error('Failed to fetch trainers');

    const trainers = await res.json();

    // Normalize course for matching
    const studentCourse = loggedInStudent?.course?.toLowerCase();

    const matchedTrainers = trainers.filter(trainer =>
      trainer.course && studentCourse &&
      trainer.course.toLowerCase() === studentCourse
    );

    const trainersToShow = matchedTrainers.length > 0 ? matchedTrainers : trainers;

    // Clear existing table
    const existingTable = trainerSection.querySelector('table');
    if (existingTable) {
      trainerSection.removeChild(existingTable);
    }

    // Create table
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>TID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Course</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    trainersToShow.forEach(trainer => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${trainer.id}</td>
        <td>${trainer.name}</td>
        <td>${trainer.email}</td>
        <td>${trainer.course}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    trainerSection.appendChild(table);

  } catch (err) {
    console.error("Error loading trainers:", err);
    trainerSection.appendChild(document.createTextNode('Error loading trainers.'));
  }
}
let currentQuizId = null;
let currentQuestions = [];

/**
 * Load available quizzes for the logged-in student based on course
 */
async function loadQuizzesForLoggedInStudent() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user?.course) {
    alert("❗ No course assigned to your profile.");
    return;
  }

  try {
    const response = await fetch(`${quizApi}?course=${encodeURIComponent(user.course)}`);
    const quizzes = await response.json();
    const quizListEl = document.getElementById("quizList");

    quizListEl.innerHTML = "";

    if (!quizzes.length) {
      quizListEl.innerHTML = "<li>No quizzes available for your course.</li>";
      return;
    }

    quizzes.forEach((quiz) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong>${quiz.title}</strong> 
        <button onclick="loadQuizQuestions(${quiz.id})">📝 Start Quiz</button>
      `;
      quizListEl.appendChild(listItem);
    });

    document.getElementById("quizzes").style.display = "block";
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    alert("Unable to load quizzes. Please try again later.");
  }
}


async function loadQuizQuestions(quizId) {
  try {
    const response = await fetch(`${quizquestionApi}/${quizId}`);
    const questions = await response.json();

    if (!questions.length) throw new Error("No questions found.");

    currentQuizId = quizId;
    currentQuestions = questions;

    renderQuizForm(questions);
    document.getElementById("takeQuizSection").style.display = "block";
  } catch (error) {
    console.error("❌ Failed to load quiz questions:", error);
    alert("Unable to load quiz questions. Please try again later.");
  }
}

/**
 * Render quiz form dynamically based on questions
 * @param {Array} questions 
 */
function renderQuizForm(questions) {
  const form = document.getElementById("takeQuizForm");

  if (!Array.isArray(questions) || questions.length === 0) {
    form.innerHTML = "<p>No questions available.</p>";
    return;
  }

  form.innerHTML = questions.map((q, idx) => `
    <div class="question-block">
      <p><strong>Q${idx + 1}:</strong> ${q.question_text}</p>
      <label><input type="radio" name="q${q.id}" value="A" required /> A. ${q.option_a}</label><br/>
      <label><input type="radio" name="q${q.id}" value="B" /> B. ${q.option_b}</label><br/>
      <label><input type="radio" name="q${q.id}" value="C" /> C. ${q.option_c}</label><br/>
      <label><input type="radio" name="q${q.id}" value="D" /> D. ${q.option_d}</label>
    </div><hr/>
  `).join("");
}

// ✅ Submit Quiz Button Listener
document.getElementById("submitQuizBtn")?.addEventListener("click", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const studentId = user?.id;

  if (!studentId || !currentQuizId) {
    alert("❗ Student details or quiz information missing.");
    return;
  }

  const form = document.getElementById("takeQuizForm");
  const formData = new FormData(form);
  let score = 0;

  const answers = currentQuestions.map((question) => {
    const selectedOption = formData.get(`q${question.id}`);
    const isCorrect = selectedOption === question.correct_option;

    if (isCorrect) score++;

    return {
      question_id: question.id,
      selected_option: selectedOption || "",
      is_correct: isCorrect
    };
  });

  try {
    // 1. Save Quiz Attempt
    const attemptResponse = await fetch(attemptApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        quiz_id: currentQuizId,
        score: score
      })
    });

    const { attemptId } = await attemptResponse.json();
    if (!attemptId) throw new Error("Attempt ID not received from server.");

    // 2. Save Answers
    await fetch(`${answerApi}/attempts/${attemptId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });

    // 3. Update Leaderboard
    await fetch(leaderboardApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        points: score * 10
      })
    });

    // 4. Show Success
    const total = currentQuestions.length;
    const scoreMsg = `✅ You scored ${score} out of ${total}`;
    document.getElementById("quizResult").textContent = scoreMsg;
    alert("🎉 Quiz submitted successfully!\n" + scoreMsg);

    // Optional: Reset state/UI
    document.getElementById("takeQuizSection").scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("❌ Error submitting quiz:", error);
    alert("Quiz submission failed. Please check your network or contact support.");
  }
});
async function loadLeaderboard() {
  const leaderboardTableBody = document.getElementById('leaderboardTableBody');
  if (!leaderboardTableBody) return;

  try {
    const res = await fetch(leaderboardApi);
    if (!res.ok) throw new Error("Failed to fetch students");

    const students = await res.json();

    // Normalize points
    students.forEach(s => {
      s.points = Number(s.points) || 0;
    });

    const currentCourse = loggedInStudent?.course?.toLowerCase();
    const filteredStudents = currentCourse
      ? students.filter(s => s.course?.toLowerCase() === currentCourse)
      : students;
    filteredStudents.sort((a, b) => b.points - a.points);
    leaderboardTableBody.innerHTML = "";

    filteredStudents.forEach((student, index) => {
      const tr = document.createElement("tr");

      const isCurrentUser = student.id === Number(loggedInStudent?.id);
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.course}</td>
        <td>${student.college}</td>
        <td>${student.points}</td>
      `;

      if (isCurrentUser) {
        tr.classList.add("highlight-current-student");
      }

      leaderboardTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed to load leaderboard:", err);
    leaderboardTableBody.innerHTML = `
      <tr><td colspan="5">Unable to load leaderboard data.</td></tr>
    `;
  }
}




async function loadAttendance() {
  const attendanceSection = document.getElementById('attendance');
  const tableBody = document.getElementById('attendanceTableBody');
  const attendanceCircle = document.getElementById('attendanceCircle');

  attendanceSection.style.display = 'block';
  tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  try {
    const res = await fetch(attendanceApi); // Replace with your real API
    if (!res.ok) throw new Error('Failed to fetch attendance');

    const records = await res.json();

    // Filter records for the logged-in student
    const studentId = loggedInStudent?.id;
    const studentRecords = records.filter(r => r.student_id === studentId);

    if (studentRecords.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4">No attendance records found.</td></tr>';
      attendanceCircle.textContent = '--%';
      attendanceCircle.style.backgroundColor = '#ccc';
      return;
    }

    // Calculate attendance %
    const presentCount = studentRecords.filter(r => r.status.toLowerCase() === 'present').length;
    const totalCount = studentRecords.length;
    const attendancePercent = Math.round((presentCount / totalCount) * 100);

    // Update attendance circle
    attendanceCircle.textContent = `${attendancePercent}%`;

     if (attendancePercent >= 75) {
    attendanceCircle.style.borderColor = 'green';
    attendanceCircle.style.background = `conic-gradient(green 0% ${attendancePercent}%, lightgray ${attendancePercent}% 100%)`;
  } else if (attendancePercent >= 60) {
    attendanceCircle.style.borderColor = 'yellow';
    attendanceCircle.style.background = `conic-gradient(yellow 0% ${attendancePercent}%, lightgray ${attendancePercent}% 100%)`;
  } else {
    attendanceCircle.style.borderColor = 'red';
    attendanceCircle.style.background = `conic-gradient(red 0% ${attendancePercent}%, lightgray ${attendancePercent}% 100%)`;
  }


    // Fill table with each record
    tableBody.innerHTML = '';
    studentRecords.forEach(record => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td>${record.status}</td>
        <td>${record.trainer_name}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    tableBody.innerHTML = '<tr><td colspan="4">Error loading attendance.</td></tr>';
    attendanceCircle.textContent = '--%';
    attendanceCircle.style.backgroundColor = '#ccc';
  }
}

function showSection(sectionId) {
  // Hide all section elements
  document.querySelectorAll('.section, .form-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show the selected section
  const sectionToShow = document.getElementById(sectionId);
  if (sectionToShow) {
    sectionToShow.style.display = 'block';
  } else {
    console.warn(`Section with ID '${sectionId}' not found.`);
  }
}

async function loadAssignments() {
  const assignmentList = document.getElementById('assignmentList');
  assignmentList.innerHTML = '<li>Loading...</li>';

  try {
    const res = await fetch(assignmentApi);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const assignments = await res.json();

    const course = loggedInStudent?.course?.toLowerCase();
    const relevant = assignments.filter(a => a.course?.toLowerCase() === course);

    if (relevant.length === 0) {
      assignmentList.innerHTML = '<li>No assignments available for your course.</li>';
      return;
    }

    // Sort by due date
    relevant.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    assignmentList.innerHTML = '';
    relevant.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${a.assignment_name}</strong><br/>
        <em>Assigned:</em> ${new Date(a.assigned_date).toLocaleDateString()}<br/>
        <em>Due:</em> ${new Date(a.due_date).toLocaleDateString()}<br/>
        <a href="${a.pdf_path}" target="_blank">📄 View Assignment PDF</a><br/><br/>
        <input type="file" id="assignmentFile-${a.id}" accept="application/pdf" />
        <button onclick="submitAssignment(${a.id})">Submit</button>
        <hr/>
      `;
      assignmentList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    assignmentList.innerHTML = '<li>Error loading assignments.</li>';
  }
}

async function submitAssignment(assignmentId) {
  const fileInput = document.getElementById(`assignmentFile-${assignmentId}`);
  const file = fileInput.files[0];

  if (!file || file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    return;
  }

  const formData = new FormData();
  formData.append('student_id', loggedInStudent.id);
  formData.append('assignment_id', assignmentId);
  formData.append('submission_file', file);

  try {
    const res = await fetch(sumbitassignmentApi , {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      alert('✅ Assignment submitted successfully!');
      fileInput.value = '';
    } else {
      alert('❌ Submission failed: ' + result.error);
    }

  } catch (err) {
    console.error('❌ Upload error:', err);
    alert('An error occurred while submitting your assignment.');
  }
};





async function loadMaterials() {
  const materialsSection = document.getElementById('materials');
  const materialsList = document.getElementById('materialsList');

  materialsList.innerHTML = '<li>Loading materials...</li>';
  materialsSection.style.display = 'block';

  try {
    const res = await fetch(materialApi); // Replace with your actual API URL
    if (!res.ok) throw new Error('Failed to fetch materials');

    const materials = await res.json();
    const course = loggedInStudent?.course?.toLowerCase();
    const relevant = materials.filter(m => m.course?.toLowerCase() === course);

    if (relevant.length === 0) {
      materialsList.innerHTML = '<li>No materials available.</li>';
      return;
    }

    materialsList.innerHTML = '';
    relevant.forEach(m => {
      const fileUrl = `http://localhost:5000/uploads/materials/${m.file_path}`;
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${m.title}</strong><br/>
        <p>${m.description}</p>
        <a href="${fileUrl}" target="_blank">📄 Download PDF</a>
      `;
      materialsList.appendChild(li);
    });

  } catch (error) {
    console.error(error);
    materialsList.innerHTML = '<li>Error loading materials.</li>';
  }
}


function setupHelpForm() {
  const helpForm = document.getElementById('helpForm');
  if (!helpForm) return;

  helpForm.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.getElementById('userEmail').value.trim();
    const reason = document.getElementById('issueReason').value.trim();

    if (!email || !reason) {
      alert('Please fill out all fields.');
      return;
    }

    alert(`Thank you for reaching out!\nWe have received your issue:\n"${reason}"\nWe will contact you at ${email}.`);

    helpForm.reset();
  });
}


function editProfile() {
  document.getElementById('editProfile').style.display = 'block';
  document.getElementById('changePassword').style.display = 'none';


  document.getElementById('editProfileName').value = document.getElementById('student-name').textContent;
  document.getElementById('editProfileEmail').value = document.getElementById('student-email').textContent;
}


function changePassword() {
  document.getElementById('changePassword').style.display = 'block';
  document.getElementById('editProfile').style.display = 'none';
}
const cancelBtn1 = document.getElementById("cancelBtn1");
if (cancelBtn1) {
  cancelBtn1.addEventListener("click", function () {
    const form1 = document.getElementById("editProfileForm");
    if (form1) form1.reset();
    document.getElementById("editProfile").style.display = "none";
  });
}


const cancelBtn2 = document.getElementById("cancelBtn2");
if (cancelBtn2) {
  cancelBtn2.addEventListener("click", function () {
    const form2 = document.getElementById("changePasswordForm");
    if (form2) form2.reset();
    document.getElementById("changePassword").style.display = "none";
  });
}

document.getElementById('editProfileForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('editProfileName').value.trim();
  const email = document.getElementById('editProfileEmail').value.trim();

  if (!name || !email) {
    alert("Please fill in all fields.");
    return;
  }

  fetch(`${studentApi}/${loggedInStudent.ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    })
    .then(data => {
      document.getElementById('student-name').textContent = name;
      document.getElementById('student-email').textContent = email;

      loggedInStudent.NAME = name;
      loggedInStudent.EMAIL = email;
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInStudent));

      alert('Profile updated successfully!');
      document.getElementById('editProfile').style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      alert('An error occurred while updating profile.');
    });
});


document.getElementById('changePasswordForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }


  fetch(studentApi, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to change password');
      return res.json();
    })
    .then(data => {
      alert('Password changed successfully!');
      document.getElementById('changePassword').style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      alert('An error occurred while changing password.');
    });
    form.reset();
    document.getElementById("changePassword").style.display = "none";

});
document.addEventListener("DOMContentLoaded", () => {
  showSection("courseDetails");
  document.getElementById("quizzes").style.display = "block";
});

