const canvas  = document.getElementById('bgCanvas');
const ctx     = canvas.getContext('2d');

let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;

const mouse = { x: W / 2, y: H / 2, radius: 150 };

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('touchmove', e => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('resize', () => {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  init();
});

/* ==========================================
   CONFIGURAÇÕES — mexa aqui para ajustar
   ========================================== */
const CONFIG = {
  count:          60,    // quantidade de bolhas
  minRadius:       4,    // tamanho mínimo
  maxRadius:       6,    // tamanho máximo
  speed:         0.4,    // velocidade base
  connectionDist: 180,   // distância para desenhar linha entre bolhas
  mouseRepel:     120,   // raio de repulsão do mouse
  colors: [
    'rgba(88,  166, 255, ALPHA)',  // azul accent
    'rgba(63,  185,  80, ALPHA)',  // verde accent
    'rgba(56,  189, 248, ALPHA)',  // ciano
    'rgba(139, 148, 158, ALPHA)',  // cinza muted
  ],
};

/* ==========================================
   CLASSE BOLHA
   ========================================== */
class Bubble {
  constructor() {
    this.reset(true);
  }

  reset(randomY = false) {
    this.radius = random(CONFIG.minRadius, CONFIG.maxRadius);
    this.x      = random(this.radius, W - this.radius);
    this.y      = randomY
                    ? random(0, H)
                    : H + this.radius + 10;

    this.vx     = random(-CONFIG.speed, CONFIG.speed);
    this.vy     = random(-CONFIG.speed * 0.8, -CONFIG.speed * 0.3);

    this.baseAlpha = random(0.3, 0.75);
    this.alpha     = this.baseAlpha;

    // pulso
    this.pulseSpeed = random(0.008, 0.022);
    this.pulsePhase = random(0, Math.PI * 2);
    this.tick       = 0;

    // cor aleatória
    const raw = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    this.colorTemplate = raw;
  }

  getColor(alpha) {
    return this.colorTemplate.replace('ALPHA', alpha.toFixed(2));
  }

  update() {
    this.tick++;

    // pulso na opacidade
    const pulse = Math.sin(this.tick * this.pulseSpeed + this.pulsePhase);
    this.alpha  = this.baseAlpha + pulse * 0.15;

    // movimento
    this.x += this.vx;
    this.y += this.vy;

    // repulsão suave do mouse
    const dx   = this.x - mouse.x;
    const dy   = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CONFIG.mouseRepel) {
      const force  = (CONFIG.mouseRepel - dist) / CONFIG.mouseRepel;
      const angle  = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * force * 2.5;
      this.y += Math.sin(angle) * force * 2.5;
    }

    // bouncing lateral
    if (this.x < this.radius || this.x > W - this.radius) {
      this.vx *= -1;
      this.x   = clamp(this.x, this.radius, W - this.radius);
    }

    // reseta quando sai pelo topo
    if (this.y < -this.radius * 2) {
      this.reset(false);
    }

    // reseta se sair muito pelos lados (edge case de repulsão)
    if (this.x < -50 || this.x > W + 50) {
      this.reset(false);
    }
  }

  draw() {
    // Gradiente radial na bolha (efeito bolha real)
    const grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius
    );

    grad.addColorStop(0,   this.getColor(Math.min(this.alpha + 0.3, 1)));
    grad.addColorStop(0.6, this.getColor(this.alpha));
    grad.addColorStop(1,   this.getColor(0));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // anel externo (borda fina)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.getColor(this.alpha * 0.4);
    ctx.lineWidth   = 0.5;
    ctx.stroke();
  }
}

/* ==========================================
   CONEXÕES ENTRE BOLHAS
   ========================================== */
function drawConnections(bubbles) {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a  = bubbles[i];
      const b  = bubbles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < CONFIG.connectionDist) {
        const alpha = (1 - d / CONFIG.connectionDist) * 0.25;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(88, 166, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }
}

/* ==========================================
   CONEXÕES COM O MOUSE
   ========================================== */
function drawMouseConnections(bubbles) {
  bubbles.forEach(b => {
    const dx = b.x - mouse.x;
    const dy = b.y - mouse.y;
    const d  = Math.sqrt(dx * dx + dy * dy);

    if (d < CONFIG.mouseRepel * 1.5) {
      const alpha = (1 - d / (CONFIG.mouseRepel * 1.5)) * 0.35;

      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(63, 185, 80, ${alpha.toFixed(2)})`;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
    }
  });
}

/* ==========================================
   CURSOR GLOW
   ========================================== */
function drawMouseGlow() {
  const grad = ctx.createRadialGradient(
    mouse.x, mouse.y, 0,
    mouse.x, mouse.y, CONFIG.mouseRepel
  );

  grad.addColorStop(0,   'rgba(88, 166, 255, 0.06)');
  grad.addColorStop(0.5, 'rgba(88, 166, 255, 0.02)');
  grad.addColorStop(1,   'rgba(88, 166, 255, 0)');

  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, CONFIG.mouseRepel, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

/* ==========================================
   UTILITÁRIOS
   ========================================== */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/* ==========================================
   INIT & LOOP
   ========================================== */
let bubbles = [];

function init() {
  bubbles = Array.from({ length: CONFIG.count }, () => new Bubble());
}

function animate() {
  // Limpa com fade (rastro suave)
  ctx.fillStyle = 'rgba(13, 17, 23, 0.18)';
  ctx.fillRect(0, 0, W, H);

  drawMouseGlow();
  drawConnections(bubbles);
  drawMouseConnections(bubbles);

  bubbles.forEach(b => {
    b.update();
    b.draw();
  });

  requestAnimationFrame(animate);
}

init();
animate();