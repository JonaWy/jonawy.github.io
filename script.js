// Restaurant options with unique colors
const restaurants = [
  { name: "Vulcano", color: "#0d419d" }, // Darker blue
  { name: "Grieche", color: "#1f6feb" }, // GitHub blue
  { name: "Can", color: "#58a6ff" }, // Lighter blue
  { name: "Mr. Wasabi", color: "#388bfd" }, // Medium blue
  { name: "Mensa", color: "#79c0ff" }, // Lightest blue
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultText = document.getElementById("result");

let angle = 0; // Current rotation angle
let spinning = false; // Prevent multiple spins at once

// Function to draw the wheel
function drawWheel() {
  const sliceAngle = (2 * Math.PI) / restaurants.length;
  const radius = canvas.width / 2;

  for (let i = 0; i < restaurants.length; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 10, startAngle, endAngle);
    ctx.fillStyle = restaurants[i].color;
    ctx.fill();
    ctx.strokeStyle = "#30363d"; // GitHub border color
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Inter";
    ctx.fillText(restaurants[i].name, radius - 30, 5);
    ctx.restore();
  }

  // Draw center circle
  ctx.beginPath();
  ctx.arc(radius, radius, 20, 0, 2 * Math.PI);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.strokeStyle = "rgb(10, 41, 82)";
  ctx.stroke();
}

// Function to spin the wheel with smooth acceleration and deceleration
function spinWheel() {
  if (spinning) return;
  spinning = true;

  // Reset result text when starting spin
  resultText.textContent = "Spinning...";

  let spinTime = Math.random() * 4 + 3; // Random spin duration (3-7 seconds)
  let startTime = Date.now();
  let lastAngle = angle;
  let totalSpins = Math.random() * 10 + 5; // 5-15 full spins

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3); // Easing function (cubic ease-out)
  }

  function animate() {
    let elapsedTime = (Date.now() - startTime) / 1000;
    let progress = elapsedTime / spinTime;

    if (progress < 1) {
      let easedProgress = easeOut(progress); // Apply easing
      angle = lastAngle + easedProgress * totalSpins * 360; // Slow start and stop
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      drawWheel();
      ctx.restore();
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      determineResult();
    }
  }
  animate();
}

// Add confetti configuration
const confetti = {
  particles: [],
  colors: ["#0d419d", "#1f6feb", "#58a6ff", "#79c0ff"],

  createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * -100,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 6 - 3,
      rotation: Math.random() * 360,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
    };
  },

  startConfetti() {
    // Create confetti canvas if it doesn't exist
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "1000";
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
    }

    // Set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Create initial particles
    for (let i = 0; i < 150; i++) {
      this.particles.push(this.createParticle());
    }

    // Start animation
    if (!this.animating) {
      this.animating = true;
      this.animate();
    }

    // Stop after 3 seconds
    setTimeout(() => {
      this.particles = [];
      this.animating = false;
      this.canvas.remove();
      this.canvas = null;
    }, 3000);
  },

  animate() {
    if (!this.animating) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += 2;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      if (p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  },
};

// Function to determine the selected restaurant (Now based on the top position)
function determineResult() {
  let degrees = angle % 360;
  if (degrees < 0) degrees += 360; // Handle negative angles
  let sliceSize = 360 / restaurants.length;
  // Calculate winning angle using top position (12 o'clock corresponds to 270°)
  let adjustedDegrees = (270 - degrees + 360) % 360; // changed from (degrees + 270) % 360
  let index = Math.floor(adjustedDegrees / sliceSize);
  resultText.textContent = "The wheel chose: " + restaurants[index].name;
  confetti.startConfetti(); // Add confetti when result is shown
}

drawWheel(); // Initial wheel draw
spinButton.addEventListener("click", spinWheel);

// Add touch support
spinButton.addEventListener("touchstart", function (e) {
  e.preventDefault();
  spinWheel();
});

// Prevent zooming on double tap
document.addEventListener(
  "touchstart",
  function (e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);
