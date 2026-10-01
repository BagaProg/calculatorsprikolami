const SansBattle = (() => {
	const state = {
		loaded: false,
		active: false,
		dead: false,
		overlay: null,
		canvas: null,
		ctx: null,
		elements: {},
		heart: { x: 125, y: 80, size: 15, speed: 150 },
		bones: [],
		hp: 100,
		kr: 20,
		endTime: 0,
		lastFrame: 0,
		move: { left: false, right: false, up: false, down: false },
		animationId: null,
		spawnInterval: null,
	};

	const assets = {
		heart: null,
		bone: null,
		loaded: false,
	};

	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	function loadImage(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	async function loadAssets() {
		if (assets.loaded) return;
		try {
			[assets.heart, assets.bone] = await Promise.all([
				loadImage('assets/heart.png'),
				loadImage('assets/bone.png'),
			]);
		} catch {
			// Sprites missing — battle still runs with blank heart/bones
		}
		assets.loaded = true;
	}

	function stopMusic() {
		const music = state.elements.music;
		if (!music) return;
		music.pause();
		music.currentTime = 0;
	}

	function playMusic() {
		const music = state.elements.music;
		if (!music) return;
		music.currentTime = 0;
		music.play().catch(() => {});
	}

	async function loadMarkup() {
		if (state.loaded) return;
		state.overlay = document.getElementById('sans-battle-screen');
		state.elements = {
			calculator: document.getElementById('calculatorContainer'),
			introHeart: document.getElementById('sansIntroHeart'),
			battleBox: document.getElementById('sansBattleBox'),
			timer: document.getElementById('sansBattleTimer'),
			message: document.getElementById('sansBattleMessage'),
			hpFill: document.getElementById('sansBattleHp'),
			krCounter: document.getElementById('sansBattleKr'),
			canvas: document.getElementById('sansBattleCanvas'),
			hud: document.querySelector('.sans-hud'),
			music: document.getElementById('sansBattleMusic'),
		};
		state.canvas = state.elements.canvas;
		state.ctx = state.canvas.getContext('2d');
		state.ctx.imageSmoothingEnabled = false;
		bindKeys();
		state.loaded = true;
	}

	function bindKeys() {
		window.addEventListener('keydown', event => {
			if (!state.active) return;
			switch (event.code) {
				case 'ArrowLeft': state.move.left = true; event.preventDefault(); break;
				case 'ArrowRight': state.move.right = true; event.preventDefault(); break;
				case 'ArrowUp': state.move.up = true; event.preventDefault(); break;
				case 'ArrowDown': state.move.down = true; event.preventDefault(); break;
			}
		});

		window.addEventListener('keyup', event => {
			if (!state.active) return;
			switch (event.code) {
				case 'ArrowLeft': state.move.left = false; event.preventDefault(); break;
				case 'ArrowRight': state.move.right = false; event.preventDefault(); break;
				case 'ArrowUp': state.move.up = false; event.preventDefault(); break;
				case 'ArrowDown': state.move.down = false; event.preventDefault(); break;
			}
		});
	}

	function resetBattle() {
		state.active = false;
		state.dead = false;
		state.bones = [];
		state.hp = 100;
		state.kr = 20;
		state.heart.x = state.canvas.width / 2;
		state.heart.y = state.canvas.height / 2;
		state.lastFrame = 0;
		state.elements.hpFill.style.width = '100%';
		state.elements.krCounter.textContent = '20';
		state.elements.timer.textContent = '20';
		state.elements.message.textContent = '';
		state.overlay.classList.remove('flash-red', 'fade-out', 'flicker');
		state.elements.battleBox.classList.remove('visible');
		state.elements.hud.classList.remove('visible');
		state.elements.introHeart.classList.remove('visible', 'heart-pulse');
		stopMusic();
	}

	function spawnBone() {
		const edge = Math.floor(Math.random() * 4);
		const size = (10 + Math.random() * 4) * 1.5;
		const speed = 90;
		let vx = 0;
		let vy = 0;

		const variation = Math.random() * 0.45 + 0.8;
		if (edge === 0) {
			x = -size;
			y = 20 + Math.random() * (state.canvas.height - 40);
			vx = speed * variation;
			vy = (Math.random() - 0.5) * 30;
		} else if (edge === 1) {
			x = state.canvas.width + size;
			y = 20 + Math.random() * (state.canvas.height - 40);
			vx = -speed * variation;
			vy = (Math.random() - 0.5) * 30;
		} else if (edge === 2) {
			x = 20 + Math.random() * (state.canvas.width - 40);
			y = -size;
			vy = speed * variation;
			vx = (Math.random() - 0.5) * 30;
		} else {
			x = 20 + Math.random() * (state.canvas.width - 40);
			y = state.canvas.height + size;
			vy = -speed * variation;
			vx = (Math.random() - 0.5) * 30;
		}

		state.bones.push({ x, y, vx, vy, size });
	}

	function drawBattle() {
		const ctx = state.ctx;
		ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

		state.bones.forEach(bone => {
			if (!assets.bone) return;
			const isHorizontal = bone.vx !== 0;
			const w = isHorizontal ? bone.size * 2.4 : bone.size * 0.55;
			const h = isHorizontal ? bone.size * 0.55 : bone.size * 2.4;

			ctx.save();
			ctx.translate(bone.x, bone.y);
			if (isHorizontal) {
				ctx.rotate(Math.PI / 2);
			}
			ctx.drawImage(assets.bone, -w / 2, -h / 2, w, h);
			ctx.restore();
		});

		if (assets.heart) {
			const size = state.heart.size * 2;
			ctx.drawImage(
				assets.heart,
				state.heart.x - size / 2,
				state.heart.y - size / 2,
				size,
				size
			);
		}
	}

	function applyMovement(dt) {
		if (!dt) return;
		if (state.move.left) state.heart.x -= state.heart.speed * dt;
		if (state.move.right) state.heart.x += state.heart.speed * dt;
		if (state.move.up) state.heart.y -= state.heart.speed * dt;
		if (state.move.down) state.heart.y += state.heart.speed * dt;
		state.heart.x = clamp(state.heart.x, 14, state.canvas.width - 14);
		state.heart.y = clamp(state.heart.y, 14, state.canvas.height - 14);
	}

	function checkCollision(bone) {
		const dx = bone.x - state.heart.x;
		const dy = bone.y - state.heart.y;
		return Math.hypot(dx, dy) < bone.size * 0.55 + 12;
	}

	function takeHit() {
		if (state.dead) return;
		state.hp = Math.max(0, state.hp - 18);
		state.elements.hpFill.style.width = `${state.hp}%`;
		state.elements.krCounter.textContent = Math.max(0, Math.round(state.hp * 20 / 100));
		state.overlay.classList.add('flash-red');
		window.setTimeout(() => state.overlay.classList.remove('flash-red'), 140);
		if (state.hp <= 0) {
			loseBattle();
		}
	}

	function loseBattle() {
		if (state.dead) return;
		state.dead = true;
		state.active = false;
		clearInterval(state.spawnInterval);
		state.spawnInterval = null;
		stopMusic();
		if (state.animationId) {
			cancelAnimationFrame(state.animationId);
			state.animationId = null;
		}
		state.bones = [];
		state.elements.message.textContent = 'YOU DIED';
		state.elements.message.classList.add('visible', 'died');
	}

	function updateBones(dt) {
		if (state.dead) return;
		state.bones = state.bones.filter(bone => {
			bone.x += bone.vx * dt;
			bone.y += bone.vy * dt;

			if (checkCollision(bone)) {
				takeHit();
				return false;
			}

			if (bone.x < -40 || bone.x > state.canvas.width + 40 || bone.y < -40 || bone.y > state.canvas.height + 40) {
				return false;
			}
			return true;
		});
	}

	function updateFrame(time) {
		if (!state.active) return;
		const dt = state.lastFrame ? Math.min((time - state.lastFrame) / 1000, 0.033) : 0;
		state.lastFrame = time;

		applyMovement(dt);
		updateBones(dt);
		drawBattle();

		const remaining = Math.max(0, Math.ceil((state.endTime - time) / 1000));
		state.elements.timer.textContent = remaining.toString();

		if (state.hp <= 0) {
			return;
		}

		if (time >= state.endTime) {
			return finishBattle();
		}

		state.animationId = requestAnimationFrame(updateFrame);
	}

	function finishBattle() {
		state.active = false;
		clearInterval(state.spawnInterval);
		state.spawnInterval = null;
		stopMusic();
		state.elements.message.textContent = 'YOU SURVIVED';
		state.elements.message.classList.add('visible');

		window.setTimeout(() => {
			if (!state.overlay) return;
			state.overlay.classList.add('fade-out');
			state.overlay.classList.remove('fade-in');
			window.setTimeout(() => {
				state.overlay.style.display = 'none';
				if (state.elements.calculator) {
					state.elements.calculator.style.display = '';
				}
				state.elements.message.classList.remove('visible');
				state.elements.timer.textContent = '20';
				if (window.calculatorInstance) {
					window.calculatorInstance.currentValue = '0';
					window.calculatorInstance.previousValue = '';
					window.calculatorInstance.operation = null;
					window.calculatorInstance.resultDisplay.style.fontSize = '2.2em';
					window.calculatorInstance.updateDisplay();
				} else {
					const display = document.getElementById('display');
					if (display) display.value = '0';
				}
				resetBattle();
			}, 300);
		}, 1500);
	}

	async function startSansBattle() {
		if (state.active) return;
		await loadMarkup();
		await loadAssets();
		resetBattle();
		if (state.elements.calculator) {
			state.elements.calculator.style.display = 'none';
		}
		state.overlay.style.display = 'flex';
		state.overlay.classList.add('visible', 'fade-in');

		await delay(300);
		state.overlay.classList.add('flicker');
		await delay(600);
		state.overlay.classList.remove('flicker');

		state.elements.introHeart.classList.add('visible', 'heart-pulse');
		await delay(750);
		state.elements.introHeart.classList.remove('visible', 'heart-pulse');

		state.elements.battleBox.classList.add('visible');
		state.elements.hud.classList.add('visible');

		state.active = true;
		state.dead = false;
		state.endTime = performance.now() + 20000;
		state.lastFrame = 0;
		playMusic();
		state.spawnInterval = window.setInterval(spawnBone, 1040);
		state.animationId = requestAnimationFrame(updateFrame);
	}

	return { startSansBattle };
})();
window.startSansBattle = SansBattle.startSansBattle;
