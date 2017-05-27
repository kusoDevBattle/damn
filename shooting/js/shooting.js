class Weapon {
	constructor() {
		this.NormalShot = this._normalShot;
		this.Laser = this._laserShot;
	}
	get _normalShot() {
		return Vue.extend({
			template: `<div class="normalShot isShooting" data-shot="normal"
          :style="{ top: topPos, left: leftPos, backgroundColor: bgColor }"
          @animationend="eraseShot"></div>`,
			props: {
				adjust: {
					type: Object,
					default() {
						return {
							top: 50,
							left: 80
						};
					}
				},
				none: {
					type: String,
					default: ''
				}
			},
			data() {
				return {
					topPos: this.none,
					leftPos: this.none,
					bgColor: this.none,
					planePos() {
						return this.plane.getBoundingClientRect();
					},
					pos() {
						const {
							top: planeTop,
							left: planeLeft
						} = this.planePos();
						return {
							top: this.getPos(planeTop, -this.adjust.top),
							left: this.getPos(planeLeft, this.adjust.left)
						};
					}
				};
			},
			mounted() {
				this.setPosition();
				this.setRandomColor();
			},
			methods: {
				getPos(pos, adjust) {
					return pos + adjust + 'px';
				},
				getRandomHex(min, max) {
					return (Math.round(Math.random() * (max - min + 1)) + min)
						.toString(16);
				},
				createRandomColor() {
					const R = this.getRandomHex(0, 255),
						G = this.getRandomHex(0, 255),
						B = this.getRandomHex(100, 255);

					return `#${R}${G}${B}`;
				},
				setPosition() {
					const {
						top,
						left
					} = this.pos();
					this.topPos = top;
					this.leftPos = left;
				},
				setRandomColor() {
					const rgb = this.createRandomColor();
					this.bgColor = rgb;
				},
				eraseShot() {
					this.$el.remove();
				}
			}
		});
	}
	get _laserShot(){
		return Vue.extend({
			template: `<div class="laserShot isShooting" data-shot="laser"
			:class="{ isShootEnd: shootEnd }"
          :style="{ top: topPos, left: leftPos }"
		  @animationend="eraseShot"></div>`,
			props: {
			adjust: {
				type: Object,
				default() {
					return {
						top: 0,
						left: 60
					};
				}
			},
			none: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				topPos: this.none,
				leftPos: this.none,
				shootEnd: false,
				planePos() {
					return this.plane.getBoundingClientRect();
				},
				pos() {
					const {
						top: planeTop,
						left: planeLeft
					} = this.planePos();

					return {
						top: this.getPos(planeTop),
						left: this.getPos(planeLeft + this.adjust.left)
					};
				}
			};
		},
		mounted() {
			this.setPosition();
		},
		methods: {
			getPos(pos) {
				return pos + 'px';
			},
			setPosition() {
				const {
					top,
					left
				} = this.pos();

				this.topPos = top;
				this.leftPos = left;
			},
			eraseShot() {
				this.$el.remove();
			}
		}
		});
	}
}

Vue.component('shooting-plane', {
	template: `<div id="plane" class="plane"
      :style="{ left: pos }"
      @moveLeft="move" @moveRight="move" @shoot="shoot" @shootEnd="shootEnd"></div>`,
	mounted() {
		this.app = this.$el.parentNode;
		this.planeWidth = this.$el.clientWidth;
		this.weapon = new Weapon();
		this.shootEvent = new Event('shoot', {
			bubbles: true
		});
		this.shootEndEvent = new Event('shootEnd', {
			bubbles: true
		});
		this.createBarrettEvent = new Event('createBarrett', {
			bubbles: true
		});
		this.moveLeftEvent = new Event('moveLeft', {
			bubbles: true
		});
		this.moveRightEvent = new Event('moveRight', {
			bubbles: true
		});
		this.bindEvent();
	},
	props: {
		speed: {
			type: Number,
			default: 20
		},
		defaultPos: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			pos: this.defaultPos,
			curPos() {
				return this.$el.getBoundingClientRect()
					.left;
			},
			maxPos() {
				return window.innerWidth - this.planeWidth;
			},
			direction(eventName) {
				if (eventName === 'moveLeft') {
					return -1;
				}

				if (eventName === 'moveRight') {
					return 1;
				}

				return 0;
			}
		};
	},
	methods: {
		bindEvent() {
			window.addEventListener('keydown', this.controller, false);
			window.addEventListener('resize', this.move, false);
			window.addEventListener('keyup', this.endController, false);
		},
		triggerEvent(e) {
			this.$el.dispatchEvent(e);
		},
		controller(e) {
			const key = e.which;
			// 13: enter, 32: space, 90: z
			if ([13, 32, 90].includes(key)) {
				this.triggerEvent(this.shootEvent);
			}

			// 37: left, 72: h
			if ([37, 72].includes(key)) {
				this.triggerEvent(this.moveLeftEvent);
			}

			// 39: right, 76: l
			if ([39, 76].includes(key)) {
				this.triggerEvent(this.moveRightEvent);
			}
		},
		endController(e) {
			const key = e.which;

			if ([13, 32, 90].includes(key)) {
				this.triggerEvent(this.shootEndEvent);
			}
		},
		getMovePos(direction) {
			const maxPos = this.maxPos();
			let pos = this.curPos() + this.speed * direction;

			if (pos < 0) {
				pos = 0;
			}

			if (pos > maxPos) {
				pos = maxPos;
			}

			if (direction === 0 && this.pos === '') {
				return '';
			}

			return pos + 'px';
		},
		move(e) {
			const direction = this.direction(e.type);
			this.pos = this.getMovePos(direction);
		},
		shoot() {
			const shot = new this.weapon.NormalShot();
			shot.plane = this.$el;
			shot.$mount();
			this.app.appendChild(shot.$el);
		},
		shootEnd() {
			const target = document.querySelectorAll('[data-shot="laser"]');

			if(target.length === 0) {
				return;
			}

			Array.prototype.forEach.call (target, (item) => {
				item.classList.add('isShootEnd');
			});
		}
	}
});

Vue.component('shooting-object', {
	template: `<div id="target" class="target"
      :class="{ isSlideLeft: left, isSlideRight: right, isHidden: hide }"
      @transitionend="resetTargetPos" @animationend="resetTargetState"></div>`,
	mounted() {
		this.$parent = this.$el.parentNode;
		this.bindEvent();
	},
	data() {
		return {
			left: false,
			right: false,
			hide: false
		};
	},
	methods: {
		bindEvent() {
			this.$parent.addEventListener('shoot', this.avoid, false);
		},
		avoid() {
			if (this.left || this.right) {
				return;
			}

			this.resetTargetState();

			const random = this.getRandom(0, 4);

			switch (random) {
				case 0:
					this.left = true;
					break;
				case 1:
					this.right = true;
					break;
				case 2:
					this.hide = true;
					break;
				case 3:
					this.left = true;
					this.hide = true;
					break;
				case 4:
					this.right = true;
					this.hide = true;
					break;
			}
		},
		getRandom(min, max) {
			return Math.round(Math.random() * (max - min + 1)) + min;
		},
		resetTargetPos() {
			this.left = this.right = false;
		},
		resetTargetState() {
			this.hide = false;
		}
	}
});

new Vue({
	el: '#app'
});
