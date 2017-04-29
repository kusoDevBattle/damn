Vue.component('shooting-plane', {
  template: '<div id="plane" class="plane" :style="{ left: planePos }"></div>',
  mounted: function(){
    this.$parent = this.$el.parentNode;
    this.$barrett = document.createElement('div');
    this.$barrett.classList.add('barrett');
    this.planeWidth = this.$el.clientWidth;
    this.shootEvent = new Event('shoot', {"bubbles": true, "cancelable": false});
    this.bindEvent();
    this.setBarrettRemove();
  },
  props: {
    planePos: {
      type: String,
      default: ''
    },
    speed: {
      type: Number,
      default: 20
    },
    barretAdjust: {
      type: Object,
      default: {
        top: 50,
        left: 20
      }
    }
  },
  methods: {
    bindEvent: function(){
        window.addEventListener('keydown', (e) => {
          this.controller(e.which);
        }, false);
    },
    setBarrettRemove: function($barrett){
      this.$parent.addEventListener('webkitAnimationEnd', (e) => {
        this.removeBarrett(e);
      }, true);

      this.$parent.addEventListener('animationend', (e) => {
        this.removeBarrett(e);
      }, true);
    },
    controller: function(key){
      // 13: enter, 32: space, 90: z
      if([13, 32, 90].includes(key)) {
        this.shoot();
      }

      // 37: left, 39: right, 72: h, 76: l
      if([37, 39, 72, 76].includes(key)) {
        this.move(key);
      }
    },
    move: function(key){
      const pos = this.$el.getBoundingClientRect().left;
      let movePos;

      // 37: left, 39: right
      if([37, 72].includes(key)) {
        movePos = pos - this.speed;
      } else if([39, 76].includes(key)) {
        movePos = pos + this.speed;
      }

      this.planePos = movePos + 'px';
    },
    shoot: function(){
      const $barrett = this.$barrett.cloneNode(),
          {top, left} = this.$el.getBoundingClientRect(),
          barrettTop = top - this.barretAdjust.top,
          barrettLeft = left + this.planeWidth - this.barretAdjust.left,
          [R, G, B] = this.createRandomColor(),
          bs = $barrett.style;

          bs.top = barrettTop + 'px';
          bs.left = barrettLeft + 'px';
          bs.backgroundColor = `rgb(${R}, ${G}, ${B})`;

          this.$el.parentNode.appendChild($barrett);
          this.$el.dispatchEvent(this.shootEvent);
    },
    removeBarrett: function(e){
      var target = e.target,
        list = target.classList;

      if(list.contains('barrett')){
        target.remove();
      }
    },
    getRandom: function(min, max){
      return Math.round( Math.random() * (max - min + 1) ) + min;
    },
    createRandomColor: function(){
      const R = this.getRandom(100, 255),
            G = this.getRandom(100, 255),
            B = this.getRandom(100, 255);

      return [R, G, B];
    },
  }
});

Vue.component('shooting-object',{
  template: '<div id="target" class="target"></div>',
  mounted: function(){
    this.$parent = this.$el.parentNode;
    this.targetWidth = this.$el.clientWidth;
    this.targetAdjustWidth = this.targetWidth / 2;
    this.targetDefaultPos = `calc(50% - ${this.targetAdjustWidth}px)`
    this.bindEvent();
  },
  methods: {
    bindEvent: function(){
      this.$el.addEventListener('transitionend', () => {
        this.resetTargetPos();
      });

      this.$parent.addEventListener('shoot', () => {
        this.avoidTarget();
      }, false);

    },
    avoidTarget: function() {
      const random = this.getRandom(0, 2);

      switch (random) {
        case 0:
        this.slideTarget('-100vw');
        break;
        case 1:
        this.slideTarget('100vw');
        break;
        case 2:
        clearTimeout(this.timer);
        this.$el.style.opacity = '0';
        this.timer = setTimeout(() => {
          this.$el.style.opacity = '1';
        }, 300);
        break;
      }
    },
    slideTarget: function(val){
      this.$el.style.left = val;
    },
    getRandom: function(min, max){
      return Math.round( Math.random() * (max - min + 1) ) + min;
    },
    resetTargetPos: function(){
      this.$el.style.left = this.targetDefaultPos;
    },
  }
});

new Vue({
  el: '#app'
});
