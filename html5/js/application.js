/*jslint white: true, devel: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function() {
    String.prototype.format = function () {
        var pattern = /\{\d+\}/g,
            args    = arguments;

        return this.replace(pattern, function (capture) {
            return args[capture.match(/\d+/)];
        });
    };
    var uniqId = 0,
        prefix = 'slide',
        moveStep = 0;
        

    /** @TODO: refactor :) */
    function Slide(node) {
        this.$el = $(node);
        this.id = this.getId();

        this.setPosition(this.getPosition(this.$el.index()));
    }
    Slide.prototype = {
        getId: function() {
            uniqId++;
            return [uniqId, (this.$el.attr('id') || prefix)].join('-');
        },

        setPosition: function(position) {
            this.clearPosition();
            this.$el.addClass(position)
        },

        clearPosition: function() {
            this.$el.removeClass('previous next current');
        },

        getPosition: function(index) {
            if (index === 0) {
                return 'current';
            } else if (index > 0) {
                return 'next';
            } else {
                return 'previous';
            }
        },

        
        move: function(multiplier) {
            var _this = this;

            this.$el.animate({
                'marginLeft': multiplier * (moveStep + 100)
            }, 500, function() {
                _this.clearPosition();
                _this.setPosition(_this.getPosition(multiplier));
            });
        }
    };

    function Presentation(options) {
        this.options = $.extend(true, {
            slide: '.slide',
            prefix: prefix
        }, options || {});

        this.isActive = false;
        this.slides = [];
        this.slidesIDs = [];
        this.currentSlide = null;

        this.init();
    }

    Presentation.prototype = {
        init: function() {
            var _this = this;

            this.initElems();

            this.setState('non-active');

            this.bind();
            this.initSlides();

            this.doSomeCoolAnimationAndStyleing(function() {
                _this.isActive = true;
                _this.start();
            });
        },

        bind: function() {
            var _this = this;
            $(window).bind('resize', function() {
                _this.resizePreloader();
                moveStep = document.documentElement.clientWidth;
            });

            $(document).bind('keydown', function(e) {
                if (_this.isActive) {
                    return _this.onKeyDown(e);
                }
            });

            $(window).bind('hashchange', function(e) {
                if (_this.isActive) {
                    _this.onHashChange(e);
                }
                return false;
            });
            
            this.elems.container.bind('ready', function () {
                _this.isActive = true;
                _this.start();
            });
        },

        initSlides: function() {
            var _this = this;

            this.elems.slides.find(this.options.slide).each(function() {
                var slide = new Slide(this);
                _this.slides.push(slide);
                _this.slidesIDs.push(slide.id);
            });
        },

        initElems: function() {
            var _this = this;
            this.elems = {
                self: $('#presentation'),
                container: $('#container'),
                slides: $('#slides'),
                preloaderBg: $('#preloader-bg'),
                preloaderImg: $('#preloader-img'),
                info: $('#info')
            };
        },

        setState: function(state) {
            this.elems.container.removeClass().addClass(state);
        },

        doSomeCoolAnimationAndStyleing: function(callback) {
            var _this = this,
                a1 = $.Deferred(),
                a2 = $.Deferred();

            $(window).trigger('resize');

            this.elems.preloaderImg.css('opacity', 1)
            this.elems.preloaderBg.css({
                'opacity': 0,
                'visibility': 'visible'
            });

            this.elems.preloaderImg.animate({
                opacity: 0,
            }, 1000, a1.resolve);

            this.elems.preloaderBg.animate({
                opacity: 1,
            }, 1000, a2.resolve);

            $.when(a1, a2).done(callback);
        },

        resizePreloader: function() {
            var height = this.elems.preloaderBg.height() || 585; //magic number

            this.elems.preloaderBg.find('img').attr('height', height);
        },
        
        onKeyDown: function(e) {
            switch (e.keyCode) {
            case 39:
            case 32:
                this.nextSlide();
                break;

            case 37:
                this.previousSlide();
                break;
            }
        },

        onHashChange: function(e) {
            this.showSlide(this.getHash());
        },
        
        getHash: function() {
            return window.location.hash.replace(/^#/, '');
        },

        showSlide: function(id) {
            if (!this.hasSlide(id) && !this.currentSlide) return;
            if (!this.currentSlide) this.setState('active');

            var slide = this.getSlideById(id),
                _this = this;

            //transition
            if (this.currentSlide) {
                var multiplier = (this.currentSlide.$el.index() < slide.$el.index()) ? -1 : 1;

                this.currentSlide.move(multiplier);
            
            }
            slide.move(0);
            this.currentSlide = slide;
            this.updateInfo();
        },

        updateInfo: function() {
            var index = this.currentSlide.$el.index() + 1,
                total = this.slides.length;

            this.elems.info.html([index, '/', total].join(''));
        },

        getSlideById: function(id) {
            return this.slides[this.slidesIDs.indexOf(id)] || {};
        },

        hasSlide: function(id) {
            return this.slidesIDs.indexOf(id) !== -1;
        },
        
        nextSlide: function() {
            var currentId = this.getCurrentSlideId(),
                nextId = this.slidesIDs.indexOf(currentId) + 1;

            if (nextId > this.slidesIDs.length - 1) return;

            window.location.hash = '#' + this.slidesIDs[nextId];
        },
        
        getCurrentSlideId: function() {
            return this.currentSlide ? this.currentSlide.id : null;
        },

        previousSlide: function() {
            var currentId = this.getCurrentSlideId(),
                prevId = this.slidesIDs.indexOf(currentId) - 1;

            if (prevId < 0) return;

            window.location.hash = '#' + this.slidesIDs[prevId];
        },
        
        start: function() {
            this.showSlide(this.getHash());
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
})();
