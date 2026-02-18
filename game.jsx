const { useState, useEffect, useRef, useCallback } = React;

// ==================== GAME CONSTANTS ====================
const GAME_CONFIG = {
    WIDTH: 400,
    HEIGHT: 600,
    GRAVITY: 0.5,
    JUMP_FORCE: -9,
    PIPE_SPEED: 2.5,
    PIPE_GAP: 160,
    PIPE_WIDTH: 60,
    PIPE_SPAWN_INTERVAL: 90,
    BIRD_SIZE: 34,
    BIRD_X: 100,
    GROUND_HEIGHT: 100,
    CLOUD_SPEED: 0.5,
    BUILDING_SPEED: 1
};

const COLORS = {
    SKY: '#87CEEB',
    PIPE_GREEN: '#5DBE4A',
    PIPE_DARK: '#2D8B3D',
    PIPE_BORDER: '#1a5c28',
    CLOUD_WHITE: '#FFFFFF',
    BUILDING_GRAY: '#A0B8CC',
    BUILDING_DARK: '#7A94A8',
    BIRD_YELLOW: '#FFC34D',
    BIRD_ORANGE: '#FF8C42',
    GROUND_GREEN: '#DED895',
    GROUND_DARK: '#C2B86F'
};

// ==================== BIRD CLASS ====================
class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.size = GAME_CONFIG.BIRD_SIZE;
        this.rotation = 0;
    }

    update() {
        this.velocity += GAME_CONFIG.GRAVITY;
        this.y += this.velocity;

        // Update rotation based on velocity (for visual feedback)
        this.rotation = Math.min(Math.max(this.velocity * 3, -30), 90);
    }

    jump() {
        this.velocity = GAME_CONFIG.JUMP_FORCE;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Bird body
        ctx.fillStyle = COLORS.BIRD_YELLOW;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Bird wing
        ctx.fillStyle = COLORS.BIRD_ORANGE;
        ctx.beginPath();
        ctx.ellipse(-5, 5, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye white
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(8, -5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(11, -7, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = COLORS.BIRD_ORANGE;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, -2);
        ctx.lineTo(22, 2);
        ctx.closePath();
        ctx.fill();

        // Beak outline
        ctx.strokeStyle = '#D86F32';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
}

// ==================== PIPE CLASS ====================
class Pipe {
    constructor(x, gapY) {
        this.x = x;
        this.gapY = gapY;
        this.width = GAME_CONFIG.PIPE_WIDTH;
        this.gap = GAME_CONFIG.PIPE_GAP;
        this.passed = false;
    }

    update() {
        this.x -= GAME_CONFIG.PIPE_SPEED;
    }

    draw(ctx) {
        const pipeCapHeight = 30;
        const pipeCapOverhang = 5;

        // Top pipe
        const topPipeHeight = this.gapY - this.gap / 2;
        
        // Top pipe body
        ctx.fillStyle = COLORS.PIPE_GREEN;
        ctx.fillRect(this.x, 0, this.width, topPipeHeight - pipeCapHeight);
        
        // Top pipe border
        ctx.strokeStyle = COLORS.PIPE_BORDER;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, 0, this.width, topPipeHeight - pipeCapHeight);

        // Top pipe cap
        ctx.fillStyle = COLORS.PIPE_GREEN;
        ctx.fillRect(
            this.x - pipeCapOverhang,
            topPipeHeight - pipeCapHeight,
            this.width + pipeCapOverhang * 2,
            pipeCapHeight
        );
        ctx.strokeRect(
            this.x - pipeCapOverhang,
            topPipeHeight - pipeCapHeight,
            this.width + pipeCapOverhang * 2,
            pipeCapHeight
        );

        // Pipe shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(this.x + 5, 0, 8, topPipeHeight - pipeCapHeight);

        // Bottom pipe
        const bottomPipeY = this.gapY + this.gap / 2;
        const bottomPipeHeight = GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT - bottomPipeY;

        // Bottom pipe cap
        ctx.fillStyle = COLORS.PIPE_GREEN;
        ctx.fillRect(
            this.x - pipeCapOverhang,
            bottomPipeY,
            this.width + pipeCapOverhang * 2,
            pipeCapHeight
        );
        ctx.strokeRect(
            this.x - pipeCapOverhang,
            bottomPipeY,
            this.width + pipeCapOverhang * 2,
            pipeCapHeight
        );

        // Bottom pipe body
        ctx.fillRect(this.x, bottomPipeY + pipeCapHeight, this.width, bottomPipeHeight);
        ctx.strokeRect(this.x, bottomPipeY + pipeCapHeight, this.width, bottomPipeHeight);

        // Pipe shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(this.x + 5, bottomPipeY + pipeCapHeight, 8, bottomPipeHeight);
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    hasPassedBird() {
        return !this.passed && this.x + this.width < GAME_CONFIG.BIRD_X;
    }

    getTopBounds() {
        return {
            x: this.x,
            y: 0,
            width: this.width,
            height: this.gapY - this.gap / 2
        };
    }

    getBottomBounds() {
        return {
            x: this.x,
            y: this.gapY + this.gap / 2,
            width: this.width,
            height: GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT - (this.gapY + this.gap / 2)
        };
    }
}

// ==================== BACKGROUND CLASS ====================
class Background {
    constructor() {
        this.clouds = [];
        this.buildings = [];
        this.cloudOffset = 0;
        this.buildingOffset = 0;

        // Initialize clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * GAME_CONFIG.WIDTH,
                y: 50 + Math.random() * 150,
                size: 40 + Math.random() * 30
            });
        }

        // Initialize buildings
        for (let i = 0; i < 8; i++) {
            this.buildings.push({
                x: i * 60,
                height: 80 + Math.random() * 80,
                width: 50
            });
        }
    }

    update() {
        this.cloudOffset += GAME_CONFIG.CLOUD_SPEED;
        this.buildingOffset += GAME_CONFIG.BUILDING_SPEED;

        if (this.cloudOffset > GAME_CONFIG.WIDTH) {
            this.cloudOffset = 0;
        }
        if (this.buildingOffset > 60) {
            this.buildingOffset = 0;
        }
    }

    draw(ctx) {
        // Sky
        ctx.fillStyle = COLORS.SKY;
        ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT);

        // Buildings (parallax)
        const groundY = GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
        ctx.fillStyle = COLORS.BUILDING_GRAY;
        this.buildings.forEach((building, index) => {
            const x = (building.x - this.buildingOffset + GAME_CONFIG.WIDTH) % (GAME_CONFIG.WIDTH + 60);
            const buildingY = groundY - building.height;
            
            // Building body
            ctx.fillRect(x, buildingY, building.width, building.height);
            
            // Building windows
            ctx.fillStyle = COLORS.BUILDING_DARK;
            for (let row = 0; row < Math.floor(building.height / 20); row++) {
                for (let col = 0; col < 3; col++) {
                    ctx.fillRect(x + 8 + col * 14, buildingY + 10 + row * 20, 8, 10);
                }
            }
            ctx.fillStyle = COLORS.BUILDING_GRAY;
        });

        // Clouds (parallax)
        ctx.fillStyle = COLORS.CLOUD_WHITE;
        this.clouds.forEach(cloud => {
            const x = (cloud.x - this.cloudOffset + GAME_CONFIG.WIDTH) % (GAME_CONFIG.WIDTH + 100);
            this.drawCloud(ctx, x, cloud.y, cloud.size);
        });

        // Ground
        ctx.fillStyle = COLORS.GROUND_GREEN;
        ctx.fillRect(0, groundY, GAME_CONFIG.WIDTH, GAME_CONFIG.GROUND_HEIGHT);

        // Ground detail (darker stripes)
        ctx.fillStyle = COLORS.GROUND_DARK;
        for (let i = 0; i < GAME_CONFIG.WIDTH; i += 30) {
            ctx.fillRect(i, groundY, 15, GAME_CONFIG.GROUND_HEIGHT);
        }

        // Ground top border
        ctx.strokeStyle = COLORS.GROUND_DARK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(GAME_CONFIG.WIDTH, groundY);
        ctx.stroke();
    }

    drawCloud(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.5, y, size * 0.6, 0, Math.PI * 2);
        ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== COLLISION DETECTION ====================
function checkCollision(bird, pipes) {
    const birdBounds = bird.getBounds();
    const groundY = GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT;

    // Check ground collision
    if (birdBounds.y + birdBounds.height > groundY) {
        return true;
    }

    // Check ceiling collision
    if (birdBounds.y < 0) {
        return true;
    }

    // Check pipe collisions
    for (const pipe of pipes) {
        if (intersects(birdBounds, pipe.getTopBounds()) || 
            intersects(birdBounds, pipe.getBottomBounds())) {
            return true;
        }
    }

    return false;
}

function intersects(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==================== MAIN GAME COMPONENT ====================
function FlappyBirdGame() {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const gameDataRef = useRef({
        bird: null,
        pipes: [],
        background: null,
        frameCount: 0
    });

    const initGame = useCallback(() => {
        gameDataRef.current = {
            bird: new Bird(GAME_CONFIG.BIRD_X, GAME_CONFIG.HEIGHT / 2),
            pipes: [],
            background: new Background(),
            frameCount: 0
        };
        setScore(0);
    }, []);

    const handleJump = useCallback(() => {
        if (gameState === 'start') {
            initGame();
            setGameState('playing');
        } else if (gameState === 'playing') {
            gameDataRef.current.bird.jump();
        }
    }, [gameState, initGame]);

    const handleRestart = useCallback(() => {
        initGame();
        setGameState('playing');
    }, [initGame]);

    useEffect(() => {
        initGame();

        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleJump, initGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        let animationFrameId;

        const gameLoop = () => {
            const { bird, pipes, background, frameCount } = gameDataRef.current;

            if (!bird || !background) return;

            // Clear canvas
            ctx.clearRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

            // Update and draw background
            if (gameState === 'playing') {
                background.update();
            }
            background.draw(ctx);

            // Update and draw pipes
            if (gameState === 'playing') {
                // Spawn new pipes
                if (frameCount % GAME_CONFIG.PIPE_SPAWN_INTERVAL === 0) {
                    const minY = 150;
                    const maxY = GAME_CONFIG.HEIGHT - GAME_CONFIG.GROUND_HEIGHT - 150;
                    const gapY = minY + Math.random() * (maxY - minY);
                    pipes.push(new Pipe(GAME_CONFIG.WIDTH, gapY));
                }

                // Update pipes
                pipes.forEach(pipe => pipe.update());

                // Remove offscreen pipes
                gameDataRef.current.pipes = pipes.filter(pipe => !pipe.isOffscreen());

                // Check for scored pipes
                pipes.forEach(pipe => {
                    if (pipe.hasPassedBird()) {
                        pipe.passed = true;
                        setScore(prev => {
                            const newScore = prev + 1;
                            setHighScore(current => Math.max(current, newScore));
                            return newScore;
                        });
                    }
                });

                gameDataRef.current.frameCount++;
            }

            // Draw pipes
            pipes.forEach(pipe => pipe.draw(ctx));

            // Update and draw bird
            if (gameState === 'playing') {
                bird.update();

                // Check collisions
                if (checkCollision(bird, pipes)) {
                    setGameState('gameOver');
                }
            }
            bird.draw(ctx);

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState]);

    return (
        <div className="game-container">
            <canvas
                ref={canvasRef}
                width={GAME_CONFIG.WIDTH}
                height={GAME_CONFIG.HEIGHT}
                onClick={handleJump}
                style={{ cursor: gameState === 'playing' ? 'pointer' : 'default' }}
            />
            <div className="game-overlay">
                {gameState === 'playing' && (
                    <div className="score">{score}</div>
                )}
                {gameState === 'start' && (
                    <div className="start-screen">
                        <h1>FLAPPY BIRD</h1>
                        <p>
                            Click or press SPACE<br />
                            to flap and fly!<br /><br />
                            Avoid the pipes!
                        </p>
                        <button onClick={handleJump}>START GAME</button>
                    </div>
                )}
                {gameState === 'gameOver' && (
                    <div className="game-over-screen">
                        <h1>GAME OVER</h1>
                        <p>
                            Score: {score}<br />
                            High Score: {highScore}
                        </p>
                        <button onClick={handleRestart}>PLAY AGAIN</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================== RENDER APP ====================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FlappyBirdGame />);
