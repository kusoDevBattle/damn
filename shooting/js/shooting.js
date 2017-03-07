
new Vue({
  el: '#app',
  data: {
    speed: 10,
    barrett: '<div class="barrett" />',
    planePos: '',
    barrettAdjust: {
      top: 50,
      left: 20
    }
  },
  mounted: function(){
    this.setParameters();
    this.bindEvent();
  },
  methods: {
    setParameters: function(){
      this.$plane = $('#plane');
      this.$target = $('#target');
      this.planeWidth = this.$plane.width();
      this.targetWidth = this.$target.width();
      this.targetAdjustWidth = this.targetWidth / 2;
      this.targetDefaultPos = `calc(50% - ${this.targetAdjustWidth}px)`
    },
    bindEvent: function(){
      this.$target.on('transitionend webkitTransitionEnd', () => {
        this.resetTargetPos();
      });
    },
    resetTargetPos: function(){
      this.$target.css('left', this.targetDefaultPos);
    },
    controller: function(e){
      const key = e.which;

      // 13: enter, 32: space, 90: z
      if([13, 32, 90].includes(key)) {
        this.shoot();
        this.avoidTarget();
      }

      // 37: left, 39: right, 72: h, 76: l
      if([37, 39, 72, 76].includes(key)) {
        this.slide(key);
      }
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
          this.$target.css('opacity', '0');
          this.timer = setTimeout(() => {
              this.$target.css('opacity', '1');
          }, 300);
          break;
       }
    },
    slideTarget: function(val){
      this.$target.css('left', val);
    },
    shoot: function(){
      const $plane = $('#plane'),
            $app = $('#app'),
          $b = $(this.barrett),
          {top, left} = $plane.position(),
          barretTop = top - 50,
          barrettLeft = left + this.planeWidth - 20,
          [R, G, B] = this.createRandomColor();

        $b.css({
          top: barretTop,
          left: barrettLeft,
          backgroundColor: `rgb(${R}, ${G}, ${B})`
        });

      $b.on('animationend webkitAnimationEnd', function(){
          $b.remove();
      });

      $app.append($b);
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
    slide: function(key) {
      this.planePos = this.$plane.position().left;

      if([37, 72].includes(key)) {
        this.planePos += -this.speed;
      } else if([39, 76].includes(key)) {
        this.planePos += this.speed;
      }

      if(this.planePos < 0) {
        this.planePos = 0;
        return;
      }

      const {innerWidth} = window,
            maxPos = innerWidth - this.planeWidth;

      if(this.planePos > maxPos){
        this.planePos = maxPos;
      }
    }
  }
});
