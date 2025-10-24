let score = 0; 
const scoreElement = document.getElementById('pontszám');

const LETTER_PICTURES = [
    'fal_2.png',
    'fal_1.png',
    'fal_3.png'
];

class Leaf {
    constructor() {
     this.imageURL = LETTER_PICTURES[Math.floor(Math.random() * LETTER_PICTURES.length)];
    
     this.element = document.createElement('div');
     this.element.className = 'leaf-element';

     this.imageElement = document.createElement('img')
     this.imageElement.src = this.imageURL
     this.imageElement.alt = "Falling Leaf"

     this.element.appendChild(this.imageElement)

     this.element.onclick = () => {
        score++; // Increment the score
        scoreElement.textContent = score;
        
        this.element.style.transform = 'scale(0.5)';
        setTimeout(() => {
            this.reset(); // a levelet vissza a tetejére
            this.element.style.transform = 'scale(1)';
        }, 100)
     };

     document.body.appendChild(this.element); //hozza adas az oldalra

     //Inicializálja az összes paramétert
     this.reset();
    }

    reset() {
        //random meret
        this.size = Math.random() * 15 + 10;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;

        //indulás a képernyő tetején kevul
        this.x = Math.random() * window.innerWidth;
        this.y = -this.size - (Math.random() * window.innerHeight)

        this.speed = Math.random() * 1.36 + 1;

        this.updateDOM();
    }

    update() {
        //lesés
        this.y += this.speed;

        if (this.y > window.innerHeight) {
            this.reset();
        }
    }

    updateDOM() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

const leaves = [];
const LEAF_COUNT = 5;

function initialize() {
    for (let i = 0; i < LEAF_COUNT; i++) {
        if (LETTER_PICTURES.length > 0) {
            leaves.push(new Leaf());
        }
    }
}

function gameLoop() {
    leaves.forEach(leaf => {
        leaf.update();  //uj kordinata
        leaf.updateDOM();
    });

    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    initialize();
    gameLoop();
};

window.addEventListener('resize', () => {
})