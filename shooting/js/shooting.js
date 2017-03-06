
new Vue({
  el: '#app',
  data: {
    speed: 10,
    barrett: '<div class="barrett" />',
    planePos: 'calc(50% - 50px)',
    planeWidth: $('#plane').width()
  },
  methods: {
    controller: function(e){
      const key = e.which;

      this.$target = $('#target');

      // 13: enter, 32: space, 90: z
      if([13, 32, 90].includes(key)) {
        this.shoot();
        this.avoidTarget();
      }

      // 37: left, 39: right
      if([37, 39].includes(key)) {
        this.slide(key);
      }
    },
    avoidTarget: function() {
      const random = this.getRandom(0, 2);
      let timer;

      switch (random) {
        case 0:
          this.slideTarget('-100vw');
          break;
        case 1:
          this.slideTarget('100vw');
          break;
        case 2:
          clearTimeout(timer);
          this.$target.css('opacity', '0');
          timer = setTimeout(() => {
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
      this.planePos = $('#plane').position().left;

      if(key === 37) {
        this.planePos += -this.speed;
      } else if(key === 39) {
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

const $target = $('#target');

$target.on('transitionend webkitTransitionEnd', function(){
  $target.css({left: 'calc(50% - 167px)'});
});
