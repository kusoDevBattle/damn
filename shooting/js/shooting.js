const Barrett = Vue.extend({
    template: '<div class="barrett" :class="{ isShooting: isShooting }" :style="{ top: topPos, left: leftPos, backgroundColor: bgColor }" @animationend="removeBarrett"></div>',
    props: {
        barretAdjust: {
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
            isShooting: true,
            topPos: this.none,
            leftPos: this.none,
            bgColor: this.none,
            planePos: function(){
              return this.plane.getBoundingClientRect();
            }
        };
    },
    mounted: function() {
        this.plane = document.querySelector('#plane');
        this.setBarrettPos();
        this.setRandomColor();
    },
    methods: {
        setPos: function(pos, adjust){
          return pos + adjust + 'px';
        },
        setBarrettPos: function() {
            const { top : planeTop, left: planeLeft } = this.planePos();
            this.topPos = this.setPos(planeTop, -this.barretAdjust.top);
            this.leftPos = this.setPos(planeLeft, this.barretAdjust.left);
        },
        setRandomColor: function() {
            const rgb = this.createRandomColor();
            this.bgColor = rgb;
        },
        removeBarrett: function() {
            this.$el.remove();
        },
        getRandom: function(min, max) {
            return Math.round(Math.random() * (max - min + 1)) + min;
        },
        createRandomColor: function() {
            const R = this.getRandom(0, 255).toString(16),
                G = this.getRandom(0, 255).toString(16),
                B = this.getRandom(100, 255).toString(16);

            return `#${R}${G}${B}`;
        }
    }
});

Vue.component('shooting-plane', {
    template: '<div id="plane" class="plane" @moveLeft="move" @moveRight="move" @shoot="shoot" :style="{ left: pos }"></div>',
    mounted: function() {
        this.app = this.$el.parentNode;
        this.planeWidth = this.$el.clientWidth;
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
        }
    },
    data: function() {
        return {
            pos: '',
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
            const curPos = this.$el.getBoundingClientRect().left,
                maxPos = this.maxPos();
            let pos = curPos + this.speed * direction;

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
            const barrett = new Barrett().$mount(),
                el = barrett.$el;

            this.app.appendChild(el);
        }
    }
});

Vue.component('shooting-object', {
    template: '<div id="target" class="target" :class="{ isSlideLeft: left, isSlideRight: right, isHidden: hide }"></div>',
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
            this.$el.addEventListener('webkitTransitionEnd', this.resetTargetPos);
            this.$el.addEventListener('transitionend', this.resetTargetPos);
            this.$el.addEventListener('webkitAnimationEnd', this.resetTargetState);
            this.$el.addEventListener('animationend', this.resetTargetState);
            this.$parent.addEventListener('shoot', this.avoid, false);
        },
        avoid: function() {
            if (this.left || this.right || this.hide) {
                return;
            }

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
        slideTarget: function(val) {
            this.$el.style.left = val;
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
