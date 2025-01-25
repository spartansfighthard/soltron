const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const leaderboardList = document.getElementById('leaderboardList');

let player = {
    x: 50,
    y: canvas.height - 30,
    width: 20,
    height: 20,
    speed: 5,
    jumping: false,
    jumpStrength: 12,
    yVelocity: 0
};

let obstacles = [];
let score = 0;
let gameLoop;
let gameSpeed = 5;

function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    ctx.fillStyle = '#ff0000';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    if (obstacles.length > 0 && obstacles[0].x < -50) {
        obstacles.shift();
        score++;
        scoreElement.textContent = score;
    }

    if (Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 30,
            width: 20,
            height: Math.random() * 30 + 20
        });
    }
}

function checkCollision() {
    return obstacles.some(obstacle => 
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}

function updatePlayer() {
    if (player.jumping) {
        player.yVelocity += 0.8;
        player.y += player.yVelocity;
        if (player.y > canvas.height - 30) {
            player.y = canvas.height - 30;
            player.jumping = false;
        }
    }
}

function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = '#ff0000';
    ctx.font = '30px "Share Tech Mono"';
    ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
    
    const name = prompt('Enter your name for the leaderboard:');
    if (name) {
        submitScore(name, score);
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    moveObstacles();
    updatePlayer();
    
    if (checkCollision()) {
        gameOver();
    }
    
    gameSpeed += 0.001;
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !player.jumping) {
        player.jumping = true;
        player.yVelocity = -player.jumpStrength;
    }
});

function startGame() {
    player = {
        x: 50,
        y: canvas.height - 30,
        width: 20,
        height: 20,
        speed: 5,
        jumping: false,
        jumpStrength: 12,
        yVelocity: 0
    };
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    scoreElement.textContent = score;
    gameLoop = setInterval(updateGame, 20);
}

function submitScore(name, score) {
    fetch('/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateLeaderboard();
        }
    });
}

function updateLeaderboard() {
    fetch('/get-leaderboard')
    .then(response => response.json())
    .then(data => {
        leaderboardList.innerHTML = '';
        data.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    });
}

startGame();
updateLeaderboard();