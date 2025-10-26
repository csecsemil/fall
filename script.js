let score = 0; 
        const scoreElement = document.getElementById('score');

        // --- LEGJOBB EREDMÉNY LOGIKA ---
        // A legmagasabb pontszám betöltése a localStorage-ból 
        let highScore = parseInt(localStorage.getItem('fallingLetterHighScore')) || 0; 
        const HIGH_SCORE_KEY = 'fallingLetterHighScore'; 
        const highScoreElement = document.getElementById('high-score'); 

        // --- NEHÉZSÉGI SZINT LOGIKA ---
        const DIFFICULTY_SCORE_THRESHOLD = 15; // Ennyi pontonként nő a nehézség.
        const DIFFICULTY_SPEED_INCREMENT = 0.2; // Ennyivel gyorsul minden szintlépésnél.
        let difficultyMultiplier = 1.0; // Jelenlegi sebesség szorzó.

        // --- Kép Beállítások (ÚJ KŐ ELEM) ---
        // Képfájlok elérési útvonalai (ezeket a fájlokat mellé kell helyezni)
        const LEAF_PICTURES = [ // Átnevezve LEAF_PICTURES-re, hogy megkülönböztessük a kőtől
            'fal_2.png',
            'fal_1.png',
            'fal_3.png'
        ];
        // Kő kép URL-je (placeholder)
        const STONE_PICTURE_URL = 'rockk.png'; 
        const STONE_SCORE_DECREMENT = 5; // Ennyi pontot von le a kő

        // Legjobb eredmény kijelzése induláskor
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }

        // --- Visszajelzés Animáció Funkció ---
        function showScoreFeedback(amount) {
            // Létrehozza az animált szöveges visszajelzést
            const feedback = document.createElement('div');
            feedback.textContent = amount > 0 ? `+${amount}` : `${amount}`;
            feedback.className = 'score-feedback';

            // Stílus beállítása
            feedback.style.position = 'fixed';
            feedback.style.color = amount > 0 ? '#4CAF50' : '#FF4D4D'; // Zöld/Piros
            feedback.style.fontWeight = 'bold';
            feedback.style.fontSize = '2.5rem';
            feedback.style.zIndex = '200';
            feedback.style.pointerEvents = 'none'; // Ne blokkolja a kattintásokat

            // Pozicionálás a pontszám kijelző mellé (jobb oldala)
            const scoreRect = scoreElement.parentElement.getBoundingClientRect();
            feedback.style.left = `${scoreRect.right + 10}px`; 
            feedback.style.top = `${scoreRect.top + scoreRect.height / 2 - 20}px`;

            document.body.appendChild(feedback);

            // Animáció: felúszás és eltűnés
            let start = null;
            const duration = 1000; // 1 másodperces animáció

            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentage = progress / duration;

                if (percentage < 1) {
                    // Pozíció módosítása (felúszik 50px-t)
                    const newY = parseFloat(feedback.style.top) - (percentage * 50); 
                    // Átlátszóság csökkentése (halványul)
                    feedback.style.opacity = 1 - percentage;
                    feedback.style.top = `${newY}px`;
                    requestAnimationFrame(animate);
                } else {
                    // Animáció vége, elem eltávolítása
                    feedback.remove();
                }
            }
            requestAnimationFrame(animate);
        }

        // --- Leaf (Levél/Betű) Osztály ---
        class Leaf {
            constructor() {
                // Külső DIV konténer létrehozása
                this.element = document.createElement('div');
                this.element.className = 'leaf-element';

                // Image tag létrehozása
                this.imageElement = document.createElement('img');
                
                this.element.appendChild(this.imageElement);

                // Kattintás kezelő (Levél elkapása)
                this.element.onclick = () => {
                    let isHighScoreCheckNeeded = true;
                    
                    if (this.type === 'leaf') {
                        // Levél: +1 pont
                        score++; 
                        showScoreFeedback(1);
                    } else {
                        // Kő: -5 pont (nem mehet 0 alá)
                        score = Math.max(0, score - STONE_SCORE_DECREMENT); 
                        isHighScoreCheckNeeded = false; // Negatív pontnál nem kell HighScore-t ellenőrizni
                        showScoreFeedback(-STONE_SCORE_DECREMENT);
                    }
                    
                    scoreElement.textContent = score;
                    
                    // Legjobb eredmény frissítése és mentése
                    if (isHighScoreCheckNeeded && score > highScore) {
                        highScore = score;
                        localStorage.setItem(HIGH_SCORE_KEY, highScore);
                        if (highScoreElement) {
                            highScoreElement.textContent = highScore;
                        }
                    }

                    this.element.style.transform = 'scale(0.5)';
                    setTimeout(() => {
                        this.reset(); // Vissza a képernyő tetejére
                        this.element.style.transform = 'scale(1)';
                    }, 100);
                };

                document.body.appendChild(this.element); // Hozzáadás az oldalhoz
                this.element.ondragstart = function() { return false; }; // Megakadályozza a húzást
                
                this.reset(); // Alaphelyzetbe állítás
            }

            reset() {
                // Típus és kép véletlenszerű kiválasztása
                this.type = Math.random() < 0.25 ? 'stone' : 'leaf'; // 25% esély kőre (könnyű beállítani)
                
                // Véletlenszerű méret
                this.size = Math.random() * 60 + 90; 
                
                if (this.type === 'stone') {
                    this.imageURL = STONE_PICTURE_URL;
                    this.imageElement.alt = "Falling Stone";
                    // A kő lehet kicsit lassabb, vagy más sebességű
                    this.speed = Math.random() * 2.5 + 2.0; // GYORSABB KŐ SEBESSÉG
                } else {
                    this.imageURL = LEAF_PICTURES[Math.floor(Math.random() * LEAF_PICTURES.length)];
                    this.imageElement.alt = "Falling Leaf";
                    this.speed = Math.random() * 3 + 1; // LEVÉL SEBESSÉG
                }
                
                this.imageElement.src = this.imageURL;
                
                // Elemek méretének beállítása
                this.element.style.width = `${this.size}px`;
                this.element.style.height = `${this.size}px`;
                this.imageElement.style.width = `${this.size}px`;
                this.imageElement.style.height = `${this.size}px`;

                // Indulás a képernyő tetején kívül
                this.x = Math.random() * (window.innerWidth - this.size);
                this.y = -this.size - (Math.random() * window.innerHeight);

                this.updateDOM();
            }

            update() {
                // Lesés, a nehézségi szorzóval együtt
                this.y += this.speed * difficultyMultiplier;
                
                // Képernyő aljára érkezés 
                if (this.y > window.innerHeight) {
                    //  Csak a levelek nullázzák a pontszámo
                    if (this.type === 'leaf') {
                        score = 0; // Pont nullázása
                        scoreElement.textContent = score; // Kijelző frissítés
                    }
                    
                    this.reset();
                }
            }

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
            // Ablak átméretezés kezelése (pl. a levelek ne ugorjanak ki a képernyőről)
        })


