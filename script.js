let score = 0; 
const scoreElement = document.getElementById('score');

// --- LEGJOBB EREDMÉNY LOGIKA ---
let highScore = parseInt(localStorage.getItem('fallingLetterHighScore')) || 0; 
const HIGH_SCORE_KEY = 'fallingLetterHighScore'; 
const highScoreElement = document.getElementById('high-score'); 

const DIFFICULTY_SCORE_THRESHOLD = 15;
const DIFFICULTY_SPEED_INCREMENT = 0.2; 
let difficultyMultiplier = 1.0;

const LEAF_PICTURES = [ 
    'fal_2.png',
    'fal_1.png',
    'fal_3.png'
];
const STONE_PICTURE_URL = 'stikpng.webp'; 
const STONE_SCORE_DECREMENT = 5; // javítva: komment hozzáadás

if (highScoreElement) {
    highScoreElement.textContent = highScore;
}

// Életpontok inicializálása
let lives = 3;
const livesElement = document.getElementById('lives');
if (livesElement) {
    livesElement.textContent = lives;
}

// Visszajelzés 
function showScoreFeedback(amount) {
    const feedback = document.createElement('div');
    feedback.textContent = amount > 0 ? `+${amount}` : `${amount}`;
    feedback.className = 'score-feedback';

    // Stílus beállítása
    feedback.style.position = 'fixed';
    feedback.style.color = amount > 0 ? '#4CAF50' : '#FF4D4D';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '2.5rem';
    feedback.style.zIndex = '200';
    feedback.style.pointerEvents = 'none';

    const scoreRect = scoreElement.parentElement.getBoundingClientRect();
    feedback.style.left = `${scoreRect.right + 10}px`; 
    feedback.style.top = `${scoreRect.top + scoreRect.height / 2 - 20}px`;

    document.body.appendChild(feedback);

    let start = null;
    const duration = 1000;

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = progress / duration;

        if (percentage < 1) {
            const newY = parseFloat(feedback.style.top) - (percentage * 50); 
            feedback.style.opacity = 1 - percentage;
            feedback.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        } else {
            feedback.remove();
        }
    }
    requestAnimationFrame(animate);
}

class Leaf {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'leaf-element';

        this.imageElement = document.createElement('img');
        
        this.element.appendChild(this.imageElement); // javítva: ű eltávolítás

        // javítva: gépelési hibák
        this.swayStartTime = performance.now();

        this.element.onclick = () => {
            let isHighScoreCheckNeeded = true;
            
            if (this.type === 'leaf') {
                score++; 
                showScoreFeedback(1);
            } else {
                score = Math.max(0, score - STONE_SCORE_DECREMENT); 
                isHighScoreCheckNeeded = false;
                showScoreFeedback(-STONE_SCORE_DECREMENT);
            }
            
            scoreElement.textContent = score;
            
            if (isHighScoreCheckNeeded && score > highScore) {
                highScore = score;
                localStorage.setItem(HIGH_SCORE_KEY, highScore);
                if (highScoreElement) {
                    highScoreElement.textContent = highScore;
                }
            }

            this.element.style.transform = 'scale(0.5)';
            setTimeout(() => {
                this.reset();
                this.element.style.transform = 'scale(1)';
            }, 100);
        };

        document.body.appendChild(this.element);
        this.element.ondragstart = function() { return false; };
        
        this.reset();
    }

            reset() {
                // Típus és kép véletlenszerű kiválasztása
                this.type = Math.random() < 0.20 ? 'stone' : 'leaf';
                
                // Kisebb, reálisabb méret
                this.size = this.type === 'stone' ? 
                    Math.random() * 100 + 130 : 
                    Math.random() * 100 + 130;   
                
                if (this.type === 'stone') {
                    this.imageURL = STONE_PICTURE_URL;
                    this.imageElement.alt = "Falling Stone";
                    this.speed = Math.random() * 2.5 + 2.0;
                } else {
                    this.imageURL = LEAF_PICTURES[Math.floor(Math.random() * LEAF_PICTURES.length)];
                    this.imageElement.alt = "Falling Leaf";
                    this.speed = Math.random() * 3 + 1; // LEVÉL SEBESSÉG
                }
                
                this.imageElement.src = this.imageURL;
                
                // Elemek méretének beállítása
                this.imageElement.style.width = `${this.size}px`;
                this.imageElement.style.height = `${this.size}px`;

                // Indulás a képernyő tetején kívül
                this.x = Math.random() * (window.innerWidth - this.size);
                this.y = -this.size - (Math.random() * window.innerHeight);

                // Lengés beállítások csak levelekhez
                if (this.type === 'leaf') {
                    this.initialX = this.x;
                    this.swayAmplitude = Math.random() * 40 + 30;
                    this.swaySpeed = Math.random() * 0.003 + 0.002;
                    this.swayStartTime = performance.now();
                }

                this.updateDOM();
            }

            update() {
                // Lesés, a nehézségi szorzóval együtt
                this.y += this.speed * difficultyMultiplier;
                
                // Lengés effekt hozzáadása
                const currentTime = performance.now();
                const elapsed = currentTime - this.swayStartTime;
                this.x = this.initialX + Math.sin(elapsed * this.swaySpeed) * this.swayAmplitude;
                
                // Képernyő határok ellenőrzése
                if (this.x < 0) this.x = 0;
                if (this.x > window.innerWidth - this.size) this.x = window.innerWidth - this.size;
            
                
                // Képernyő aljára érkezés 
                if (this.y > window.innerHeight) {
                    if (this.type === 'leaf') {
                        score = 0; // Pont nullázása
                        scoreElement.textContent = score; // Kijelző frissítés
                    }
                    
                    this.reset();
                }
            } // update() függvény vége (javítva)

            updateDOM() {
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }
        }

        // --- Játék Beállítás ---
        const leaves = [];
        const LEAF_COUNT = 5;

        function initialize() {
            for (let i = 0; i < LEAF_COUNT; i++) {
                if (LEAF_PICTURES.length > 0) { // Ellenőrzés, most már a LEAF_PICTURES-t nézzük
                    leaves.push(new Leaf());
                }
            }
        }

        function gameLoop() {
            // Frissíti a nehézségi szorzót a pontszám alapján (Nehézségi szint emelése)
            const level = Math.floor(score / DIFFICULTY_SCORE_THRESHOLD);
            const newMultiplier = 1.0 + (level * DIFFICULTY_SPEED_INCREMENT);

            if (newMultiplier !== difficultyMultiplier) {
                difficultyMultiplier = newMultiplier;
                // A konzol log is angolul szól
                console.log(`Difficulty level increased: ${level + 1}. level. Multiplier: ${difficultyMultiplier.toFixed(2)}`); 
            }

            leaves.forEach(leaf => {
                leaf.update();  // Új koordináta számítása
                leaf.updateDOM(); // DOM frissítése
            });

            requestAnimationFrame(gameLoop);
        }

        window.onload = () => {
            initialize();
            gameLoop();
        };

        window.addEventListener('resize', () => {
           // a levelek ne ugorjanak ki a képernyőről
           leaves.forEach(leaf => {
                if (leaf.x > window.innerWidth - leaf.size) {
                    leaf.x = window.innerWidth - leaf.size;
                }
                leaf.initialX = leaf.x; // Lengés középpont frissítése
            });
        });



