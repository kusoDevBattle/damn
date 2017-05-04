class Weapon {
	constructor() {
		this.NormalShot = this._normalShot;
	}
	get _normalShot() {
		return Vue.extend({
			template: '<div class="normalShot isShooting" \
          :style="{ top: topPos, left: leftPos, backgroundColor: bgColor }" \
          @animationend="eraseShot"></div>',
			props: {
				adjust: {
					type: Object,
					default: function() {
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
			data: function() {
				return {
					topPos: this.none,
					leftPos: this.none,
					bgColor: this.none,
					planePos: function() {
						return this.plane.getBoundingClientRect();
					},
					pos: function() {
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
			mounted: function() {
				this.setPosition();
				this.setRandomColor();
			},
			methods: {
				getPos: function(pos, adjust) {
					return pos + adjust + 'px';
				},
				getRandomHex: function(min, max) {
					return (Math.round(Math.random() * (max - min + 1)) + min)
						.toString(16);
				},
				createRandomColor: function() {
					const R = this.getRandomHex(0, 255),
						G = this.getRandomHex(0, 255),
						B = this.getRandomHex(100, 255);

					return `#${R}${G}${B}`;
				},
				setPosition: function() {
					const {
						top,
						left
					} = this.pos();
					this.topPos = top;
					this.leftPos = left;
				},
				setRandomColor: function() {
					const rgb = this.createRandomColor();
					this.bgColor = rgb;
				},
				eraseShot: function() {
					this.$el.remove();
				}
			}
		});
	}
}

Vue.component('shooting-plane', {
	template: '<div id="plane" class="plane" \
      :style="{ left: pos }" \
      @moveLeft="move" @moveRight="move" @shoot="shoot"></div>',
	mounted: function() {
		this.app = this.$el.parentNode;
		this.planeWidth = this.$el.clientWidth;
		this.weapon = new Weapon();
		this.shootEvent = new Event('shoot', {
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
	data: function() {
		return {
			pos: this.defaultPos,
			curPos: function() {
				return this.$el.getBoundingClientRect()
					.left;
			},
			maxPos: function() {
				return window.innerWidth - this.planeWidth;
			},
			direction: function(eventName) {
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
		bindEvent: function() {
			window.addEventListener('keydown', this.controller, false);
			window.addEventListener('resize', this.move, false);
		},
		triggerEvent: function(e) {
			this.$el.dispatchEvent(e);
		},
		controller: function(e) {
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
		getMovePos: function(direction) {
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
		move: function(e) {
			const direction = this.direction(e.type);
			this.pos = this.getMovePos(direction);
		},
		shoot: function() {
			const shot = new this.weapon.NormalShot();
			shot.plane = this.$el;
			shot.$mount();
			this.app.appendChild(shot.$el);
		}
	}
});

Vue.component('shooting-object', {
	template: '<div id="target" class="target" \
      :class="{ isSlideLeft: left, isSlideRight: right, isHidden: hide }" \
      @transitionend="resetTargetPos" @animationend="resetTargetState"></div>',
	mounted: function() {
		this.$parent = this.$el.parentNode;
		this.bindEvent();
	},
	data: function() {
		return {
			left: false,
			right: false,
			hide: false
		};
	},
	methods: {
		bindEvent: function() {
			this.$parent.addEventListener('shoot', this.avoid, false);
		},
		avoid: function() {
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
		getRandom: function(min, max) {
			return Math.round(Math.random() * (max - min + 1)) + min;
		},
		resetTargetPos: function() {
			this.left = this.right = false;
		},
		resetTargetState: function() {
			this.hide = false;
		}
	}
});

new Vue({
	el: '#app'
});
