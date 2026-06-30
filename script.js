class DestructiveCalculator {
	constructor() {
		this.display = document.getElementById('display');
		this.calculator = document.getElementById('calculatorContainer');
		this.physicsContainer = document.getElementById('physicsContainer');
		this.crackCanvas = document.getElementById('crackCanvas');
		this.crackCtx = this.crackCanvas.getContext('2d');
		this.resultDisplay = document.querySelector('.display');
		this.psxlkoImage = document.querySelector('.psxlko');

		this.currentValue = '0';
		this.previousValue = '';
		this.operation = null;
		this.isDestroyed = false;
		this.fragments = [];
		this.animationRunning = false;
		this.operationCount = 0;
		this.subscriptionShown = false;
		this.subscriptionOverlay = document.getElementById('subscriptionOverlay');
		this.subscriptionSheet = document.getElementById('subscriptionSheet');
		this.subscribeBtn = document.getElementById('subscribeBtn');
		this.laterBtn = document.getElementById('laterBtn');

		this.initializeCanvasSize();
		this.attachEventListeners();
		this.updateDisplay();
	}

	initializeCanvasSize() {
		this.crackCanvas.width = window.innerWidth;
		this.crackCanvas.height = window.innerHeight;

		window.addEventListener('resize', () => {
			this.crackCanvas.width = window.innerWidth;
			this.crackCanvas.height = window.innerHeight;
		});
	}

	attachEventListeners() {
		// Number buttons
		document.querySelectorAll('.number-btn').forEach(btn => {
			btn.addEventListener('click', () => this.handleNumber(btn.dataset.number));
		});

		// Operator buttons
		document.querySelectorAll('.operator-btn').forEach(btn => {
			btn.addEventListener('click', () => this.handleOperator(btn.dataset.operator));
		});

		// Equals button
		document.getElementById('equalsBtn').addEventListener('click', () => this.handleEquals());

		// Clear button
		document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());

		// Delete button
		document.getElementById('deleteBtn').addEventListener('click', () => this.handleDelete());

		// Subscription popup actions
		this.laterBtn.addEventListener('click', () => this.closeSubscriptionPopup());
		this.subscribeBtn.addEventListener('click', () => this.handleSubscriptionSubmit());
	}

	handleNumber(num) {
		if (this.isDestroyed) return;

		if (this.currentValue === '0' && num !== '.') {
			this.currentValue = num;
		} else if (num === '.' && this.currentValue.includes('.')) {
			return;
		} else {
			this.currentValue += num;
		}
		this.updateDisplay();
	}

	handleOperator(op) {
		if (this.isDestroyed) return;

		if (this.operation && this.previousValue && this.currentValue) {
			this.performCalculation();
		}

		this.previousValue = this.currentValue;
		this.operation = op;
		this.currentValue = '0';
		this.updateDisplay();
	}

	handleEquals() {
		if (this.isDestroyed) return;

		this.operationCount += 1;

		if (this.operation && this.previousValue) {
			this.performCalculation();
		}

		if (this.operationCount > 5) {
			this.showSubscriptionPopup();
		}

		// Check if result is exactly 15092015, start Sans battle
		if (parseFloat(this.currentValue) === 15092015) {
			window.startSansBattle?.();
		}

		// Check if result is exactly 67 or 52
		if (parseFloat(this.currentValue) === 67 || parseFloat(this.currentValue) === 52) {
			this.triggerDestruction();
		}
		if (parseFloat(this.currentValue) === 1488) {
			this.psxlkoImage.hidden = false;
			this.psxlkoImage.style.transform = "scale(1)";
			this.resultDisplay.style.height = "140px";
			setTimeout(() => {
				this.psxlkoImage.style.transform = "scale(0)";
				this.psxlkoImage.hidden = true;
				this.resultDisplay.style.height = "80px";
			}, 3000);
		}
		if (parseFloat(this.currentValue) >= 1000 && parseFloat(this.currentValue) !== 1488 && parseFloat(this.currentValue) !== 15092015) {
			this.resultDisplay.value = "Мне лень считать, сам посчитай";
			this.resultDisplay.style.fontSize = "10px";
		}
	}

	handleClear() {
		if (this.isDestroyed) return;
		this.currentValue = '0';
		this.previousValue = '';
		this.operation = null;
		this.resultDisplay.style.fontSize = "2.2em";
		this.updateDisplay();
	}

	handleDelete() {
		if (this.isDestroyed) return;
		if (this.currentValue.length > 1) {
			this.currentValue = this.currentValue.slice(0, -1);
			this.resultDisplay.style.fontSize = "2.2em";
		} else {
			this.currentValue = '0';
		}
		this.updateDisplay();
	}

	performCalculation() {
		const prev = parseFloat(this.previousValue);
		const current = parseFloat(this.currentValue);
		let result = 0;

		switch (this.operation) {
			case '+':
				result = prev + current;
				break;
			case '-':
				result = prev - current;
				break;
			case '*':
				result = prev * current;
				break;
			case '/':
				result = current !== 0 ? prev / current : 0;
				break;
		}

		this.currentValue = result.toString();
		this.previousValue = '';
		this.operation = null;
		this.updateDisplay();
	}

	updateDisplay() {
		this.display.value = this.currentValue;
	}

	showSubscriptionPopup() {
		if (this.subscriptionShown) return;
		this.subscriptionOverlay.classList.add('visible');
		this.subscriptionSheet.classList.add('visible');
		this.subscriptionOverlay.setAttribute('aria-hidden', 'false');
		document.body.classList.add('popup-open');
	}

	closeSubscriptionPopup() {
		if (!this.subscriptionOverlay.classList.contains('visible')) return;
		this.subscriptionOverlay.classList.remove('visible');
		this.subscriptionSheet.classList.remove('visible');
		this.subscriptionOverlay.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('popup-open');
	}

	handleSubscriptionSubmit() {
		if (this.subscribeBtn.disabled) return;
		this.subscriptionShown = true;
		this.subscribeBtn.disabled = true;
		this.laterBtn.disabled = true;
		this.subscribeBtn.classList.add('loading');
		this.subscribeBtn.textContent = 'Preparing...';

		setTimeout(() => {
			this.subscribeBtn.textContent = 'Subscribed';
			this.subscribeBtn.classList.remove('loading');
			this.subscribeBtn.classList.add('success');
			setTimeout(() => this.closeSubscriptionPopup(), 800);
		}, 1400);
	}

	triggerDestruction() {
		if (this.isDestroyed || this.animationRunning) return;
		this.isDestroyed = true;
		this.animationRunning = true;

		// Stage 1: Show cracks (300ms)
		this.showCracks();

		// Stage 2: Shatter (after 500ms)
		setTimeout(() => {
			this.shatterCalculator();
		}, 500);
	}

	showCracks() {
		this.crackCanvas.classList.add('active');
		this.crackCanvas.classList.add('crack-animation');

		const calculatorRect = this.calculator.getBoundingClientRect();
		this.drawGlassCracks(
			calculatorRect.left,
			calculatorRect.top,
			calculatorRect.width,
			calculatorRect.height
		);
	}

	drawGlassCracks(x, y, width, height) {
		const ctx = this.crackCtx;
		ctx.clearRect(0, 0, this.crackCanvas.width, this.crackCanvas.height);

		// Draw semi-transparent dark overlay with glow
		ctx.fillStyle = 'rgba(10, 14, 39, 0.15)';
		ctx.fillRect(x, y, width, height);

		// Draw glowing impact point
		const centerX = x + width / 2;
		const centerY = y + height / 2;

		// Glow effect
		const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width);
		gradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
		gradient.addColorStop(1, 'rgba(100, 200, 255, 0.0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(x, y, width, height);

		// Draw main cracks with enhanced visuals
		ctx.strokeStyle = 'rgba(150, 200, 255, 0.9)';
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		// Draw primary radiating cracks
		const crackCount = 16;
		for (let i = 0; i < crackCount; i++) {
			const angle = (i / crackCount) * Math.PI * 2;
			const length = Math.sqrt(width * width + height * height) * 0.7;

			ctx.beginPath();
			ctx.moveTo(centerX, centerY);

			// Create highly jagged crack path
			let currentX = centerX;
			let currentY = centerY;
			const segments = 20;

			for (let j = 0; j < segments; j++) {
				const distance = (length / segments) * j;
				const offsetAngle = angle + (Math.random() - 0.5) * 0.5;
				const nextX = centerX + Math.cos(offsetAngle) * distance;
				const nextY = centerY + Math.sin(offsetAngle) * distance;

				const randomOffsetX = (Math.random() - 0.5) * 6;
				const randomOffsetY = (Math.random() - 0.5) * 6;
				ctx.lineTo(nextX + randomOffsetX, nextY + randomOffsetY);
			}

			ctx.stroke();
		}

		// Draw secondary branching cracks
		ctx.strokeStyle = 'rgba(120, 180, 255, 0.6)';
		ctx.lineWidth = 1.5;

		for (let i = 0; i < 30; i++) {
			const randomX = x + Math.random() * width;
			const randomY = y + Math.random() * height;
			const randomAngle = Math.random() * Math.PI * 2;
			const randomLength = Math.random() * 120 + 40;

			ctx.beginPath();
			ctx.moveTo(randomX, randomY);

			for (let j = 0; j < 8; j++) {
				const distance = (randomLength / 8) * j;
				const nextX = randomX + Math.cos(randomAngle) * distance;
				const nextY = randomY + Math.sin(randomAngle) * distance;
				ctx.lineTo(nextX + (Math.random() - 0.5) * 4, nextY + (Math.random() - 0.5) * 4);
			}

			ctx.stroke();
		}

		// Draw micro cracks for extra detail
		ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
		ctx.lineWidth = 0.8;

		for (let i = 0; i < 50; i++) {
			const randomX = x + Math.random() * width;
			const randomY = y + Math.random() * height;
			const randomAngle = Math.random() * Math.PI * 2;
			const randomLength = Math.random() * 40 + 10;

			ctx.beginPath();
			ctx.moveTo(randomX, randomY);
			ctx.lineTo(
				randomX + Math.cos(randomAngle) * randomLength,
				randomY + Math.sin(randomAngle) * randomLength
			);
			ctx.stroke();
		}
		this.calculator.classList.add('destroyed');

		const calculatorRect = this.calculator.getBoundingClientRect();
		const buttons = this.calculator.querySelectorAll('.btn');
		const sections = this.calculator.querySelectorAll('.calculator-section');

		// Create fragments from buttons
		buttons.forEach(btn => {
			this.createFragmentFromElement(btn, calculatorRect);
		});

		// Create fragments from screen
		const screenFragment = this.createScreenFragments(calculatorRect);

		// Create fragments from body/background
		this.createBodyFragments(calculatorRect);

		// Disable all buttons
		buttons.forEach(btn => {
			btn.classList.add('destroyed-btn');
			btn.disabled = true;
			btn.style.opacity = '0';
		});

		// Hide calculator container
		setTimeout(() => {
			this.calculator.style.opacity = '0';
			this.startPhysicsSimulation();
		}, 50);
	}

	createFragmentFromElement(element, calculatorRect) {
		const elementRect = element.getBoundingClientRect();

		const fragment = {
			x: elementRect.left,
			y: elementRect.top,
			width: elementRect.width,
			height: elementRect.height,
			vx: (Math.random() - 0.5) * 22,
			vy: -Math.random() * 12 - 6,
			rotation: Math.random() * 360,
			rotationVelocity: (Math.random() - 0.5) * 0.6,
			element: this.createFragmentElement(element),
			type: this.getFragmentType(element),
			fallen: false
		};

		this.physicsContainer.appendChild(fragment.element);
		this.fragments.push(fragment);
	}

	createScreenFragments(calculatorRect) {
		const screenSection = document.getElementById('screenSection');
		if (!screenSection) return;

		const screenRect = screenSection.getBoundingClientRect();
		const fragmentsPerAxis = 4;
		const fragWidth = screenRect.width / fragmentsPerAxis;
		const fragHeight = screenRect.height / fragmentsPerAxis;

		for (let i = 0; i < fragmentsPerAxis; i++) {
			for (let j = 0; j < fragmentsPerAxis; j++) {
				const fragment = {
					x: screenRect.left + i * fragWidth,
					y: screenRect.top + j * fragHeight,
					width: fragWidth,
					height: fragHeight,
					vx: (Math.random() - 0.5) * 18,
					vy: -Math.random() * 10 - 4,
					rotation: Math.random() * 360,
					rotationVelocity: (Math.random() - 0.5) * 0.5,
					element: null,
					type: 'screen-fragment',
					fallen: false
				};

				const el = document.createElement('div');
				el.className = 'fragment screen-fragment';
				el.style.left = fragment.x + 'px';
				el.style.top = fragment.y + 'px';
				el.style.width = fragWidth + 'px';
				el.style.height = fragHeight + 'px';
				el.style.display = this.display.value.substring(i * 3 + j, i * 3 + j + 1);
				el.textContent = this.display.value.substring(i * 3 + j, i * 3 + j + 1);

				this.physicsContainer.appendChild(el);
				fragment.element = el;
				this.fragments.push(fragment);
			}
		}
	}

	createBodyFragments(calculatorRect) {
		// Create large background/body fragments
		const fragmentCount = 15;
		for (let i = 0; i < fragmentCount; i++) {
			const width = calculatorRect.width / (2 + Math.random() * 2);
			const height = calculatorRect.height / (2.5 + Math.random());

			const fragment = {
				x: calculatorRect.left + (Math.random() * calculatorRect.width - width / 2),
				y: calculatorRect.top + (Math.random() * calculatorRect.height - height / 2),
				width: width,
				height: height,
				vx: (Math.random() - 0.5) * 20,
				vy: -Math.random() * 10 - 3,
				rotation: Math.random() * 360,
				rotationVelocity: (Math.random() - 0.5) * 0.5,
				element: null,
				type: 'body-fragment',
				fallen: false
			};

			const el = document.createElement('div');
			el.className = 'fragment body-fragment';
			el.style.left = fragment.x + 'px';
			el.style.top = fragment.y + 'px';
			el.style.width = width + 'px';
			el.style.height = height + 'px';
			el.style.borderRadius = (Math.random() * 20) + 'px';

			this.physicsContainer.appendChild(el);
			fragment.element = el;
			this.fragments.push(fragment);
		}
	}

	createFragmentElement(sourceElement) {
		const fragment = document.createElement('div');
		fragment.className = 'fragment button-fragment ' + this.getFragmentType(sourceElement);
		fragment.textContent = sourceElement.textContent;
		fragment.style.backgroundColor = window.getComputedStyle(sourceElement).backgroundColor;
		return fragment;
	}

	getFragmentType(element) {
		if (element.classList.contains('operator-btn')) return 'operator-fragment';
		if (element.classList.contains('equals-btn')) return 'equals-fragment';
		if (element.classList.contains('clear-btn')) return 'clear-fragment';
		return '';
	}

	startPhysicsSimulation() {
		const gravity = 0.6;
		const damping = 0.97;
		const friction = 0.92;
		const groundLevel = window.innerHeight - 5;
		let lastTime = Date.now();

		const animate = () => {
			const now = Date.now();
			const deltaTime = Math.min((now - lastTime) / 1000, 0.016);
			lastTime = now;

			let allSettled = true;

			this.fragments.forEach(fragment => {
				if (fragment.vy === 0 && fragment.vx === 0 && fragment.fallen) {
					return;
				}

				allSettled = false;

				// Apply gravity
				fragment.vy += gravity;

				// Terminal velocity
				if (fragment.vy > 25) fragment.vy = 25;

				// Apply air resistance
				fragment.vx *= damping;
				fragment.vy *= damping;

				// Update position
				fragment.x += fragment.vx;
				fragment.y += fragment.vy;

				// Update rotation with varying speeds
				fragment.rotation += fragment.rotationVelocity;
				if (Math.abs(fragment.rotationVelocity) > 0.001) {
					fragment.rotationVelocity *= 0.98;
				}

				// Bottom collision with bouncing
				if (fragment.y + fragment.height >= groundLevel) {
					fragment.y = groundLevel - fragment.height;
					fragment.vy *= -0.35;
					fragment.vx *= friction;
					fragment.rotationVelocity *= 0.85;
					fragment.fallen = true;

					if (Math.abs(fragment.vy) < 0.3) {
						fragment.vy = 0;
					}
					if (Math.abs(fragment.vx) < 0.1) {
						fragment.vx = 0;
						fragment.rotationVelocity = 0;
					}
				}

				// Top collision
				if (fragment.y < 0) {
					fragment.y = 0;
					fragment.vy *= -0.4;
				}

				// Left/right collision with friction
				if (fragment.x < 0) {
					fragment.x = 0;
					fragment.vx *= -0.5;
				} else if (fragment.x + fragment.width > window.innerWidth) {
					fragment.x = window.innerWidth - fragment.width;
					fragment.vx *= -0.5;
				}

				// Update element
				fragment.element.style.left = fragment.x + 'px';
				fragment.element.style.top = fragment.y + 'px';
				fragment.element.style.transform = `rotate(${fragment.rotation}deg)`;
			});

			if (!allSettled) {
				requestAnimationFrame(animate);
			} else {
				this.animationRunning = false;
				setTimeout(() => {
					this.crackCanvas.classList.remove('active');
				}, 500);
			}
		};

		animate();
	}
}



// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.calculatorInstance = new DestructiveCalculator();
});
