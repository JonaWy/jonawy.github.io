// Restaurant options with unique colors
const restaurants = [
  { name: "Vulcano", color: "#FF5733" },
  { name: "Grieche", color: "#33FF57" },
  { name: "Can", color: "#5733FF" },
  { name: "Mr. Wasabi", color: "#FFD700" },
  { name: "Mensa", color: "#FF33A6" },
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultText = document.getElementById("result");

let angle = 0; // Current rotation angle
let spinning = false; // Prevent multiple spins at once

// Function to draw the wheel
function drawWheel() {
  const sliceAngle = (2 * Math.PI) / restaurants.length; // Divide wheel into equal parts

  for (let i = 0; i < restaurants.length; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.fillStyle = restaurants[i].color; // Use restaurant's color
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      startAngle,
      endAngle
    );
    ctx.closePath();
    ctx.fill();

    // Add text
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.fillText(restaurants[i].name, canvas.width / 3, 5);
    ctx.restore();
  }
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

// Function to determine the selected restaurant (Now based on the top position)
function determineResult() {
  let degrees = angle % 360;
  if (degrees < 0) degrees += 360; // Handle negative angles
  let sliceSize = 360 / restaurants.length;
  // Calculate winning angle using top position (12 o'clock corresponds to 270°)
  let adjustedDegrees = (270 - degrees + 360) % 360; // changed from (degrees + 270) % 360
  let index = Math.floor(adjustedDegrees / sliceSize);
  resultText.textContent = "The wheel chose: " + restaurants[index].name;
}

drawWheel(); // Initial wheel draw
spinButton.addEventListener("click", spinWheel);
