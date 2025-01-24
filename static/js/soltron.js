// Wrap in DOMContentLoaded to ensure safe execution
document.addEventListener('DOMContentLoaded', function() {
    try {
        const matrixRain = new MatrixRain(); // Initialize matrix rain first
        const soltronModel = new SoltronModel();
        const chatInterface = new ChatInterface();
        
        soltronModel.animate();
    } catch (error) {
        console.error('Error initializing components:', error);
    }
});

class SoltronModel {
    constructor() {
        try {
            this.container = document.getElementById('soltron-model');
            if (!this.container) {
                throw new Error('Model container not found');
            }

            // Set container size explicitly
            this.container.style.width = '100%';
            this.container.style.height = '100%';

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
            
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true 
            });
            
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setClearColor(0x000000, 0);
            this.container.appendChild(this.renderer.domElement);

            // Add debug logging
            console.log('Container size:', this.container.clientWidth, this.container.clientHeight);
            console.log('Renderer size:', this.renderer.domElement.width, this.renderer.domElement.height);

            this.setupLights();
            this.modelPath = '/static/models/soltron.glb';  // Update this path
            this.loadModel();
            this.setupControls();
            
            window.addEventListener('resize', () => this.onWindowResize(), false);
        } catch (error) {
            console.error('Error initializing SoltronModel:', error);
            this.showFallbackContent();
        }
    }

    setupLights() {
        const light = new THREE.PointLight(0xff0000, 1, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    }

    async loadModel() {
        try {
            const loader = new THREE.GLTFLoader();
            console.log('Loading model from:', this.modelPath);
            
            // Show loading state
            const loadingElement = document.getElementById('model-loading');
            if (loadingElement) loadingElement.style.display = 'block';
            
            const gltf = await loader.loadAsync(this.modelPath);
            console.log('Model loaded successfully:', gltf);
            
            this.model = gltf.scene;
            this.model.scale.set(2, 2, 2);
            this.scene.add(this.model);
            this.camera.position.z = 5;
            
            // Hide loading state
            if (loadingElement) loadingElement.style.display = 'none';
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.loadFallbackModel();
        }
    }

    loadFallbackModel() {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            wireframe: true,
            emissive: 0x990000
        });
        this.model = new THREE.Mesh(geometry, material);
        this.scene.add(this.model);
        this.camera.position.z = 3;
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.model) {
            this.model.rotation.y += 0.005;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    showFallbackContent() {
        if (this.container) {
            this.container.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error loading 3D model. Please refresh the page.</div>';
        }
    }
}

class ChatInterface {
    constructor() {
        this.terminal = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.isProcessing = false;
        
        this.setupEventListeners();
        this.initialize();
    }

    setupEventListeners() {
        this.input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && !this.isProcessing && this.input.value.trim()) {
                const message = this.input.value.trim();
                this.input.value = '';
                await this.processMessage(message);
            }
        });
    }

    async initialize() {
        try {
            const response = await fetch('/get-greeting');
            const data = await response.json();
            if (data && data.greeting) {
                await this.typeMessage(data.greeting, 'bot');
            }
        } catch (error) {
            console.error('Error getting greeting:', error);
            await this.typeMessage("NEURAL INTERFACE INITIALIZED... HUMAN PRESENCE DETECTED.", 'bot');
        }
    }

    async processMessage(message) {
        try {
            this.isProcessing = true;
            await this.typeMessage(message, 'user');
            
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            await this.typeMessage(data.response, 'bot');
        } catch (error) {
            console.error('Error processing message:', error);
            await this.typeMessage("ERROR: Neural interface disrupted. Please try again.", 'bot');
        } finally {
            this.isProcessing = false;
        }
    }

    async typeMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        this.terminal.appendChild(messageDiv);
        
        for (let i = 0; i < text.length; i++) {
            messageDiv.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }
}

// Matrix Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-bg');
        this.ctx = this.canvas.getContext('2d');
        this.fontSize = 16; // Increased font size
        this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()[]{}<>~`|/\\";
        this.drops = [];
        this.initialize();
    }

    initialize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = new Array(this.columns).fill(1);
        
        // Add multiple layers of drops for more intensity
        this.secondaryDrops = new Array(this.columns).fill(1);
        
        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = new Array(this.columns).fill(1);
        this.secondaryDrops = new Array(this.columns).fill(1);
    }

    animate() {
        // Darker fade for more visible trails
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Brighter primary drops
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = `bold ${this.fontSize}px 'Share Tech Mono'`;
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 5;
        
        // Render primary drops
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(char, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.95) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        
        // Render secondary drops with different opacity
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        for (let i = 0; i < this.secondaryDrops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(char, i * this.fontSize + this.fontSize/2, this.secondaryDrops[i] * this.fontSize);
            
            if (this.secondaryDrops[i] * this.fontSize > this.canvas.height && Math.random() > 0.95) {
                this.secondaryDrops[i] = 0;
            }
            this.secondaryDrops[i]++;
        }
        
        requestAnimationFrame(() => this.animate());
    }
} 