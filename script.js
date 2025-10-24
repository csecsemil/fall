let score = 0; 
const scoreElement = document.getElementById('pontszám');

const LETTER_PICTURES = [
    'file:///home/emil/hackclub/fall/fal_2.png',
    'file:///home/emil/hackclub/fall/fal_1.png',
    'file:///home/emil/hackclub/fall/fal_3.png'
];

class Leaf {
    constructor() {
     this.imageURL = LETTER_PICTURES[Math.foor(Math.random() * LETTER_PICTURES.lenght)];
    
     this.element = document.createElement('div');
     this.element.className = 'leaf-element';

     this.imageElement = document.createElement('img')
     this.imageElement.src = this.imageURL
     this.imageElement.alt = "Falling Leaf"

     this.element.appendChild(this.imageElement)


     this.element.onclick = () => {
        score++; // Increment the score
        scoreElement.textContent = score;

        
     }
    }
}