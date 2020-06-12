
const TwoPI = Math.PI * 2;
var w = window.innerWidth;
var h = window.innerHeight;
var center_x = w / 2;
var center_y = h / 2;

var colors = ['#FF0000', '#FF0000', '#FF0000','#FF0000','#FF0000']

// I know the abs is not needed... but oh well
var max_distance = Math.abs(Math.max(center_x, center_y));
var min_distance = Math.abs(Math.min(center_x, center_y));
function Firefly(){
  this.velocity = 0;
  var random_angle = Math.random() * TwoPI;
  this.x = center_x +  Math.sin(random_angle) * ((Math.random() * (max_distance - min_distance) + min_distance));
  this.y = center_y + Math.cos(random_angle) * ((Math.random() * (max_distance - min_distance) + min_distance));



  this.angle_of_attack = Math.atan2(  this.y - center_y ,  this.x - center_x);
  this.vel =  ( Math.random() * 5 ) + 5 ;

  this.color = colors[ ~~(colors.length * Math.random()) ]


  this.xvel = this.vel * Math.cos( this.angle_of_attack );
  this.yvel = this.vel * Math.sin( this.angle_of_attack );
  this.size = 2 + Math.random() * 2;

  this.phase_diff = Math.random() * TwoPI;

}



Firefly.prototype.move = function(dt){
  if( isOnHeart(this.x, this.y)){
    this.size -= 0.001;
    return;
  }
  this.x += this.xvel * dt;
  this.y += this.yvel * dt;
}

Firefly.prototype.render = function(ctx, now){
  if( this.size < 1) {
    return;
  }
  ctx.globalAlpha = Math.max(Math.abs(Math.sin( (now + this.phase_diff) / (~~(this.size * 100)) )), 0.4);
  ctx.fillStyle = this.color;
  ctx.shadowColor = this.color;
  ctx.shadowBlur = 20 / this.size;
  ctx.beginPath();
  ctx.arc( this.x, this.y, this.size, 0, TwoPI, false);
  ctx.closePath();
  ctx.fill();
}

var max_fireflies = 500;
var canvas = document.getElementById('can');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var fireflies = [];


var last = Date.now();
var dt = 0, now = 0;
var alive_fireflies = 0;
var last_emit = 0;

function render(){
  now = Date.now();
  dt = (last - now) / 100;
  last = now;
  ctx.clearRect(0,0,w,h);
  fireflies.forEach(function(f){
    f.move(dt);
    f.render(ctx, now);
  });

  fireflies = fireflies.filter(function(f){
    return (f.size > 1);
  });

  alive_fireflies = fireflies.length;

  if( alive_fireflies < max_fireflies && last_emit - now < - 100){
    fireflies.push( new Firefly());
    last_emit = now;
  }

  requestAnimationFrame(render);
}


render();

//
function isOnHeart(x,y){
	  x = ((x - center_x) / (min_distance * 1.2)) * 1.8;
	  y = ((y - center_y) / (min_distance)) * - 1.8;

    var x2 = x * x;
  	var y2 = y * y;
    // Simplest Equation of lurve
    return (Math.pow((x2 + y2 - 1), 3) - (x2 * (y2 * y)) <= 0);
}









console.clear();

let width = window.innerWidth;
let height = window.innerHeight;
const body = document.body;

const elButton = document.querySelector(".treat-button");
const elWrapper = document.querySelector(".treat-wrapper");

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const treatmojis = ["🍬", "🍫", "🍭", "🍡", "🍩", "🍪", "🍒"];
const treats = [];
const radius = 15;

const Cd = 0.47; // Dimensionless
const rho = 1.22; // kg / m^3
const A = Math.PI * radius * radius / 10000; // m^2
const ag = 9.81; // m / s^2
const frameRate = 1 / 60;

function createTreat() /* create a treat */ {
  const vx = getRandomArbitrary(-10, 10); // x velocity
  const vy = getRandomArbitrary(-10, 1);  // y velocity

  const el = document.createElement("div");
  el.className = "treat";

  const inner = document.createElement("span");
  inner.className = "inner";
  inner.innerText = treatmojis[getRandomInt(0, treatmojis.length - 1)];
  el.appendChild(inner);

  elWrapper.appendChild(el);

  const rect = el.getBoundingClientRect();

  const lifetime = getRandomArbitrary(2000, 3000);

  el.style.setProperty("--lifetime", lifetime);

  const treat = {
    el,
    absolutePosition: { x: rect.left, y: rect.top },
    position: { x: rect.left, y: rect.top },
    velocity: { x: vx, y: vy },
    mass: 0.1, //kg
    radius: el.offsetWidth, // 1px = 1cm
    restitution: -.7,

    lifetime,
    direction: vx > 0 ? 1 : -1,

    animating: true,

    remove() {
      this.animating = false;
      this.el.parentNode.removeChild(this.el);
    },

    animate() {
      const treat = this;
      let Fx =
        -0.5 *
        Cd *
        A *
        rho *
        treat.velocity.x *
        treat.velocity.x *
        treat.velocity.x /
        Math.abs(treat.velocity.x);
      let Fy =
        -0.5 *
        Cd *
        A *
        rho *
        treat.velocity.y *
        treat.velocity.y *
        treat.velocity.y /
        Math.abs(treat.velocity.y);

      Fx = isNaN(Fx) ? 0 : Fx;
      Fy = isNaN(Fy) ? 0 : Fy;

      // Calculate acceleration ( F = ma )
      var ax = Fx / treat.mass;
      var ay = ag + Fy / treat.mass;
      // Integrate to get velocity
      treat.velocity.x += ax * frameRate;
      treat.velocity.y += ay * frameRate;

      // Integrate to get position
      treat.position.x += treat.velocity.x * frameRate * 100;
      treat.position.y += treat.velocity.y * frameRate * 100;

      treat.checkBounds();
      treat.update();
    },

    checkBounds() {

      if (treat.position.y > height - treat.radius) {
        treat.velocity.y *= treat.restitution;
        treat.position.y = height - treat.radius;
      }
      if (treat.position.x > width - treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = width - treat.radius;
        treat.direction = -1;
      }
      if (treat.position.x < treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = treat.radius;
        treat.direction = 1;
      }

    },

    update() {
      const relX = this.position.x - this.absolutePosition.x;
      const relY = this.position.y - this.absolutePosition.y;

      this.el.style.setProperty("--x", relX);
      this.el.style.setProperty("--y", relY);
      this.el.style.setProperty("--direction", this.direction);
    }
  };

  setTimeout(() => {
    treat.remove();
  }, lifetime);

  return treat;
}


function animationLoop() {
  var i = treats.length;
  while (i--) {
    treats[i].animate();

    if (!treats[i].animating) {
      treats.splice(i, 1);
    }
  }

  requestAnimationFrame(animationLoop);
}

animationLoop();

function addTreats() {
  //cancelAnimationFrame(frame);
  if (treats.length > 40) {
    return;
  }
  for (let i = 0; i < 10; i++) {
    treats.push(createTreat());
  }
}

elButton.addEventListener("click", addTreats);
elButton.click();

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
});
