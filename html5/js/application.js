/*jslint white: true, devel: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
String.prototype.format = function () {
    var pattern = /\{\d+\}/g,
        args    = arguments;

    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};
/** @TODO: refactor :) */
function Slide(node) {
    this.$el = $(node);
}
Slide.prototype = {

};
function Presentation(options) {
    this.options = $.extend(true, {
        container: '#container',
        slides: '#slides',
        slide: '.slide'
    }, options || {});
    this.slides = [];

    this.init();
}

Presentation.prototype = {
    init: function() {
        this.initElems();

        this.setState('non-active');

        this.bind();
        this.doSomeCoolAnimationAndStyleing();

        this.initSlides();
    },

    bind: function() {
        var _this = this;
        $(window).bind('resize', function() {
            _this.resizePreloaderBg();
        });
    },

    initSlides: function() {
        var _this = this;

        this.elems.slides.find(this.options.slide).each(function() {
            _this.slides.push(new Slide(this));
        });
    },

    initElems: function() {
        var _this = this;
        this.elems = {
            self: $('#presentation'),
            container: $('#container'),
            slides: $('.slides'),
            preloaderBg: $('#preloader-bg'),
            preloaderImg: $('#preloader-img')
        };
    },

    setState: function(state) {
        this.elems.container.removeClass().addClass(state);
    },

    doSomeCoolAnimationAndStyleing: function() {
        var _this = this;

        $(window).trigger('resize');

        this.elems.preloaderImg.css('opacity', 1)
        this.elems.preloaderBg.css({
            'opacity': 0,
            'visibility': 'visible'
        });

        this.elems.preloaderImg.animate({
            opacity: 0,
        }, 2000, $.noop);
        this.elems.preloaderBg.animate({
            opacity: 1,
        }, 2000, $.noop);
    },

    resizePreloaderBg: function() {
        var height = this.elems.preloaderBg.height() || 585; //magic number
        this.elems.preloaderBg.find('img').attr('height', height);
    }
};

var Application =  {
    init: function() {
        this.presentation = new Presentation();
    }
};

$(function() {
    Application.init();
});