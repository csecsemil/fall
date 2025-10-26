let score = 0; 
const scoreElement = document.getElementById('score');

//legjobb eredmény
let highScore = parseInt(localStorage.getItem('fallingLetterHighScore')) || 0;
const HIGH_SCORE_KEY = 'fallingLetterHighScore'; 
const highScoreElement = document.getElementById('high-score');

// Nehézségi konstansok hozzáadása
const DIFFICULTY_SCORE_THRESHOLD = 10;
const DIFFICULTY_SPEED_INCREMENT = 0.2;
let difficultyMultiplier = 1.0;

const LEAF_PICTURES = [
    'fal_2.png',
    'fal_1.png',
    'fal_3.png'
];

const STONE_PICTURE_URL = 'file:///home/emil/hackclub/fall/rockk.png'
const STONE_SCORE_DECREMENT = 5; // ennyit von le

// magas pontszám kijelzése kezdéskor
if (highScoreElement) {
    highScoreElement.textContent = highScore;
}

//visszajelzés
function showScoreFeedback(amount){
    //animált visszajelzes
    const feedback = document.createElement('div');
    feedback.textContent = amount > 0 ? `+${amount}` : `${amount}`;
    feedback.className = 'score-feedback';

    //stilus
    feedback.style.position = 'fixed'
    feedback.style.color = amount > 0 ? '#4CAF50' : '#FF4D4D' //zoldpiiros
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '2.5rem';
    feedback.style.zIndex = '200';
    feedback.style.pointerEvents = 'none'; // blkkolja a kattintast

    //pozicionálás 
    const scoreRect = scoreElement.parentElement.getBoundingClientRect();
    feedback.style.left = `${scoreRect.right + 10}px`;
    feedback.style.top = `${scoreRect.top + scoreRect.height / 2 - 20}px`;

    document.body.appendChild(feedback);

    //felhuzas animacio
    let start = null;
    const duration = 1000; //1 masodperces animacio

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = progress / duration;

        if (percentage < 1) {
            //hely modositas
            const newY = parseFloat(feedback.style.top) - (percentage * 50);
            // halványulas
            feedback.style.opacity = 1 - percentage;
            feedback.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        } else {
            // vege
            feedback.remove();
        }

    }
    requestAnimationFrame(animate);

}

class Leaf {
    constructor() {
     this.imageURL = LEAF_PICTURES[Math.floor(Math.random() * LEAF_PICTURES.length)];
    
     this.element = document.createElement('div');
     this.element.className = 'leaf-element';

     this.imageElement = document.createElement('img')
     this.imageElement.src = this.imageURL
     this.imageElement.alt = "Falling Leaf"

     this.element.appendChild(this.imageElement)

     this.element.onclick = () => {
        score++; 
        scoreElement.textContent = score;
        
        // Animáció meghívása
        showScoreFeedback(1); // +1 pont animáció
        
        // frissítés a leg magasabb 
        if (score > highScore) {
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
        }, 100)
     };

     document.body.appendChild(this.element);
     this.element.ondragstart = function() { return false; };
     this.reset();
    }

    reset() {
        //random meret - kisebb levelek
        this.size = Math.random() * 60 + 90; 
        this.imageElement.style.width = `${this.size}px`;
        this.imageElement.style.height = `${this.size}px`;

        //indulás a képernyő tetején kevul
        this.x = Math.random() * window.innerWidth;
        this.y = -this.size - (Math.random() * window.innerHeight)

        this.speed = Math.random() * 3 + 1;

        this.updateDOM();
    }

    update() {
        //lesés
        this.y += this.speed * difficultyMultiplier; // Nehézség alkalmazása

        if (this.y > window.innerHeight) {
            score = 0;
            scoreElement.textContent = score;
            this.reset();
        }
    }

    updateDOM() {
        this.element.style.left = `${this.x}px`; // javítva: this.element
        this.element.style.top = `${this.y}px`;
    }
}

const leaves = [];
const LEAF_COUNT = 5;

function initialize() {
    for (let i = 0; i < LEAF_COUNT; i++) {
        if (LEAF_PICTURES.length > 0) { 
            leaves.push(new Leaf());
        }
    }
}

function gameLoop() {
    // nehézségi szorzó
    const level = Math.floor(score / DIFFICULTY_SCORE_THRESHOLD);
    const newMultiplier = 1.0 + (level * DIFFICULTY_SPEED_INCREMENT);

    if (newMultiplier !== difficultyMultiplier) {
        difficultyMultiplier = newMultiplier;
        console.log(`Difficulty level increased: ${level + 1}. level. Multiplier: ${difficultyMultiplier.toFixed(2)}`); // javítva
    }

    leaves.forEach(leaf => {
        leaf.update();
        leaf.updateDOM();
    });

    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    initialize();
    gameLoop();
};

window.addEventListener('resize', () => {
    //levelek ne mennyenek ki a képernyőről
})


