
document.querySelectorAll('nav .nav-links a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();


  const successMsg = document.getElementById("formSuccess");
  successMsg.style.display = "block";


  this.reset();

  
  setTimeout(() => {
    successMsg.style.display = "none";
  }, 5000);
});
