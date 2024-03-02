let isMouseDown = false;
const overlay = document.getElementById("overlay");

window.onload = function () {
    const celebration = document.querySelector('#celebration')
    const netflix = document.querySelector('#container')
    celebration.style.display = 'none';
    netflix.style.display = 'none';

    setTimeout(function() {
        netflix.style.display = 'flex';
    }, 1000);
    setTimeout(function() {
        celebration.style.display = 'flex';
    }, 6000);
}

document.addEventListener("mousedown", function (event) {
  if (overlay.style.opacity !== "0") {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 500);
  }
  isMouseDown = true;
  spawnConfetti(event.clientX, event.clientY);
});

document.addEventListener("mouseup", function () {
  isMouseDown = false;
});

document.addEventListener("mousemove", function (event) {
  if (isMouseDown) {
    spawnConfetti(event.clientX, event.clientY);
  }
});

function spawnConfetti(x, y) {
  for (let i = 0; i < 6; i++) {
    createConfetti(x, y);
  }
}

function createConfetti(x, y) {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#e67e22",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const confetti = document.createElement("div");
  confetti.className = "confetti";
  confetti.style.backgroundColor = randomColor;
  confetti.style.left = x + "px";
  confetti.style.top = y + "px";

  document.body.appendChild(confetti);

  const angle = Math.random() * Math.PI * 2;
  const velocity = 2 + Math.random() * 2;
  const rotationSpeed = (Math.random() - 0.5) * 10;

  let xVelocity = velocity * Math.cos(angle);
  let yVelocity = velocity * Math.sin(angle);
  const gravity = 0.1;

  function animateConfetti() {
    xVelocity *= 0.99;
    yVelocity += gravity;
    x += xVelocity;
    y += yVelocity;

    const currentRotation =
      parseFloat(
        confetti.style.transform.replace("rotate(", "").replace("deg)", ""),
      ) || 0;
    confetti.style.transform = `rotate(${currentRotation + rotationSpeed}deg)`;

    confetti.style.left = x + "px";
    confetti.style.top = y + "px";

    if (y < window.innerHeight) {
      requestAnimationFrame(animateConfetti);
    } else {
      confetti.remove();
    }
  }

  requestAnimationFrame(animateConfetti);
}

//01000001 01010011
// helper functions
const PI2 = Math.PI * 2;
const random = (min, max) => (Math.random() * (max - min + 1) + min) | 0;
const timestamp = (_) => new Date().getTime();

// container
class Birthday {
  constructor() {
    this.resize();

    // create a lovely place to store the firework
    this.fireworks = [];
    this.counter = 0;
  }

  resize() {
    this.width = canvas.width = window.innerWidth;
    let center = (this.width / 2) | 0;
    this.spawnA = (center - center / 4) | 0;
    this.spawnB = (center + center / 4) | 0;

    this.height = canvas.height = window.innerHeight;
    this.spawnC = this.height * 0.1;
    this.spawnD = this.height * 0.5;
  }

  onClick(evt) {
    let x = evt.clientX || (evt.touches && evt.touches[0].pageX);
    let y = evt.clientY || (evt.touches && evt.touches[0].pageY);

    let count = random(3, 10);
    for (let i = 0; i < count; i++)
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          x,
          y,
          random(0, 260),
          random(30, 110),
        ),
      );

    this.counter = -1;
  }

  update(delta) {
    ctx.globalCompositeOperation = "hard-light";
    ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = "lighter";
    for (let firework of this.fireworks) firework.update(delta);

    // if enough time passed... create new new firework
    this.counter += delta * 3; // each second
    if (this.counter >= 1) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          random(0, this.width),
          random(this.spawnC, this.spawnD),
          random(0, 360),
          random(30, 110),
        ),
      );
      this.counter = 0;
    }

    // remove the dead fireworks
    if (this.fireworks.length > 1000)
      this.fireworks = this.fireworks.filter((firework) => !firework.dead);
  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false;
    this.offsprings = offsprings;

    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;

    this.shade = shade;
    this.history = [];
  }
  update(delta) {
    if (this.dead) return;

    let xDiff = this.targetX - this.x;
    let yDiff = this.targetY - this.y;
    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
      // is still moving
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;

      this.history.push({
        x: this.x,
        y: this.y,
      });

      if (this.history.length > 20) this.history.shift();
    } else {
      if (this.offsprings && !this.madeChilds) {
        let babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          let targetX =
            (this.x + this.offsprings * Math.cos((PI2 * i) / babies)) | 0;
          let targetY =
            (this.y + this.offsprings * Math.sin((PI2 * i) / babies)) | 0;

          birthday.fireworks.push(
            new Firework(this.x, this.y, targetX, targetY, this.shade, 0),
          );
        }
      }
      this.madeChilds = true;
      this.history.shift();
    }

    if (this.history.length === 0) this.dead = true;
    else if (this.offsprings) {
      for (let i = 0; this.history.length > i; i++) {
        let point = this.history[i];
        ctx.beginPath();
        ctx.fillStyle = "hsl(" + this.shade + ",100%," + i + "%)";
        ctx.arc(point.x, point.y, 1, 0, PI2, false);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.fillStyle = "hsl(" + this.shade + ",100%,50%)";
      ctx.arc(this.x, this.y, 1, 0, PI2, false);
      ctx.fill();
    }
  }
}

let canvas = document.getElementById("birthday");
let ctx = canvas.getContext("2d");
//01000001 01010011
let then = timestamp();

let birthday = new Birthday();
window.onresize = () => birthday.resize();
document.onclick = (evt) => birthday.onClick(evt);
document.ontouchstart = (evt) => birthday.onClick(evt);
(function loop() {
  requestAnimationFrame(loop);

  let now = timestamp();
  let delta = now - then;

  then = now;
  birthday.update(delta / 1000);
})();
