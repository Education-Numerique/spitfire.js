'use strict';

/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com
*/
(function(doc) {

    var html = doc.documentElement,
         conf = {
            screens: [320, 480, 640, 768, 1024, 1280, 1440, 1680, 1920],
            section: "-section",
            page: "-page",
            head: "head"
         },
         klass = [];


    if (window.head_conf) {
        for (var key in head_conf) {
            if (head_conf[key] !== undefined) {
                conf[key] = head_conf[key];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        var re = new RegExp("\\b" + name + "\\b");
        html.className = html.className.replace(re, '');
    }

    function each(arr, fn) {
        for (var i = 0, arr_length = arr.length; i < arr_length; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = window[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += ' ' + klass.join( ' ' );
            klass = [];
            return;
        }

        if (Object.prototype.toString.call(enabled) == '[object Function]') {
            enabled = enabled.call();
        }

        pushClass((enabled ? '' : 'no-') + key);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass('no-' + key);
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // browser type & version
    var ua = navigator.userAgent.toLowerCase();

    ua = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        !/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) || [];


    if (ua[1] == 'msie') {
        ua[1] = 'ie';
        ua[2] = document.documentMode || ua[2];
    }

    pushClass(ua[1]);

    api.browser = { version: ua[2] };
    api.browser[ua[1]] = true;

    // IE specific
    if (api.browser.ie) {

        pushClass("ie" + parseFloat(ua[2]));

        // IE versions
        for (var ver = 3; ver < 11; ver++) {
            if (parseFloat(ua[2]) < ver) { pushClass("lt-ie" + ver); }
        }

        // HTML5 support
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
                
    }
    

    // CSS "router"
    each(location.pathname.split("/"), function(el, i) {

        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) { pushClass(this.slice(1, i+1).join("-") + conf.section); }

        } else {

            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) { id = id.substring(0, index); }
            html.id = id + conf.page;

            // on root?
            if (!i) { pushClass("root" + conf.section); }
      }
    });


    // screen resolution: w-100, lt-480, lt-1024 ...
    function screenSize() {
        var w = window.outerWidth || html.clientWidth;

        // remove earlier widths
        html.className = html.className.replace(/ (w|lt)-\d+/g, "");

        // add new ones
        pushClass("w-" + Math.round(w / 100) * 100);

        each(conf.screens, function(width) {
            if (w <= width) { pushClass("lt-" + width); }
        });

        api.feature();
    }

    screenSize();
    window.onresize = screenSize;

    api.feature("js", true).feature();

})(document);


/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com
*/
(function() {
    /*
        To add a new test:

        head.feature("video", function() {
            var tag = document.createElement('video');
            return !!tag.canPlayType;
        });

        Good place to grab more tests

        https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
    */


    /* CSS modernizer */
    var el = document.createElement("i"),
         style = el.style,
         prefs = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
         domPrefs = 'Webkit Moz O ms Khtml'.split(' '),

         head_var = window.head_conf && head_conf.head || "head",
         api = window[head_var];


     // Thanks Paul Irish!
    function testProps(props) {
        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }
    }


    function testAll(prop) {
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
             props   = (prop + ' ' + domPrefs.join(camel + ' ') + camel).split(' ');

        return !!testProps(props);
    }

    var tests = {

        gradient: function() {
            var s1 = 'background-image:',
                 s2 = 'gradient(linear,left top,right bottom,from(#9f9),to(#fff));',
                 s3 = 'linear-gradient(left top,#eee,#fff);';

            style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0,-s1.length);
            return !!style.backgroundImage;
        },

        rgba: function() {
            style.cssText = "background-color:rgba(0,0,0,0.5)";
            return !!style.backgroundColor;
        },

        opacity: function() {
            return el.style.opacity === "";
        },

        textshadow: function() {
            return style.textShadow === '';
        },

        multiplebgs: function() {
            style.cssText = "background:url(//:),url(//:),red url(//:)";
            return new RegExp("(url\\s*\\(.*?){3}").test(style.background);
        },

        boxshadow: function() {
            return testAll("boxShadow");
        },

        borderimage: function() {
            return testAll("borderImage");
        },

        borderradius: function() {
            return testAll("borderRadius");
        },

        cssreflections: function() {
            return testAll("boxReflect");
        },

        csstransforms: function() {
            return testAll("transform");
        },

        csstransitions: function() {
            return testAll("transition");
        },

        /*
            font-face support. Uses browser sniffing but is synchronous.

            http://paulirish.com/2009/font-face-feature-detection/
        */
        fontface: function() {
            var ua = navigator.userAgent, parsed;

            if (/*@cc_on@if(@_jscript_version>=5)!@end@*/0)
                return true;
                
            if (parsed = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/))
                return parsed[1] >= '4.0.249.4' || 1 * parsed[1].split(".")[0] > 5;
            if ((parsed = ua.match(/Safari\/(\d+\.\d+)/)) && !/iPhone/.test(ua))
                return parsed[1] >= '525.13';
            if (/Opera/.test({}.toString.call(window.opera)))
                return opera.version() >= '10.00';
            if (parsed = ua.match(/rv:(\d+\.\d+\.\d+)[^b].*Gecko\//))
                return parsed[1] >= '1.9.1';

            return false;
        }
    };

    // queue features
    for (var key in tests) {
        if (tests[key]) {
            api.feature(key, tests[key].call(), true);
        }
    }

    // enable features at once
    api.feature();

})();


/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com
*/
(function(doc) {

    var head = doc.documentElement,
        isHeadReady,
        isDomReady,
        domWaiters = [],
        queue = [],        // waiters for the "head ready" event
        handlers = {},     // user functions waiting for events
        scripts = {},      // loadable scripts in different states
        isAsync = doc.createElement("script").async === true || "MozAppearance" in doc.documentElement.style || window.opera;


    /*** public API ***/
    var head_var = window.head_conf && head_conf.head || "head",
         api = window[head_var] = (window[head_var] || function() { api.ready.apply(null, arguments); });

    // states
    var PRELOADED = 1,
        PRELOADING = 2,
        LOADING = 3,
        LOADED = 4;


    // Method 1: simply load and let browser take care of ordering
    if (isAsync) {

        api.js = function() {

            var args = arguments,
                 fn = args[args.length -1],
                 els = {};

            if (!isFunc(fn)) { fn = null; }

            each(args, function(el, i) {

                if (el != fn) {
                    el = getScript(el);
                    els[el.name] = el;

                    load(el, fn && i == args.length -2 ? function() {
                        if (allLoaded(els)) { one(fn); }

                    } : null);
                }
            });

            return api;
        };


    // Method 2: preload with text/cache hack
    } else {

        api.js = function() {

            var args = arguments,
                rest = [].slice.call(args, 1),
                next = rest[0];

            // wait for a while. immediate execution causes some browsers to ignore caching
            if (!isHeadReady) {
                queue.push(function()  {
                    api.js.apply(null, args);
                });
                return api;
            }

            // multiple arguments
            if (next) {

                // load
                each(rest, function(el) {
                    if (!isFunc(el)) {
                        preload(getScript(el));
                    }
                });

                // execute
                load(getScript(args[0]), isFunc(next) ? next : function() {
                    api.js.apply(null, rest);
                });


            // single script
            } else {
                load(getScript(args[0]));
            }

            return api;
        };
    }

    api.ready = function(key, fn) {

        // DOM ready check: head.ready(document, function() { });
        if (key == doc) {
            if (isDomReady) { one(fn);  }
            else { domWaiters.push(fn); }
            return api;
        }

        // shift arguments
        if (isFunc(key)) {
            fn = key;
            key = "ALL";
        }    

        // make sure arguments are sane
        if (typeof key != 'string' || !isFunc(fn)) { return api; }

        var script = scripts[key];
        
        // script already loaded --> execute and return
        if (script && script.state == LOADED || key == 'ALL' && allLoaded() && isDomReady) {
            one(fn);
            return api;
        }

        var arr = handlers[key];
        if (!arr) { arr = handlers[key] = [fn]; }
        else { arr.push(fn); }
        return api;
    };


    // perform this when DOM is ready
    api.ready(doc, function() {

        if (allLoaded()) {
            each(handlers.ALL, function(fn) {
                one(fn);
            });
        }

        if (api.feature) {
            api.feature("domloaded", true);
        }
    });


    /*** private functions ***/
    
    
    // call function once
    function one(fn) {
        if (fn._done) { return; }
        fn();
        fn._done = 1;
    }


    function toLabel(url) {
        var els = url.split("/"),
             name = els[els.length -1],
             i = name.indexOf("?");

        return i != -1 ? name.substring(0, i) : name;
    }


    function getScript(url) {

        var script;

        if (typeof url == 'object') {
            for (var key in url) {
                if (url[key]) {
                    script = { name: key, url: url[key] };
                }
            }
        } else {
            script = { name: toLabel(url),  url: url };
        }

        var existing = scripts[script.name];
        if (existing && existing.url === script.url) { return existing; }

        scripts[script.name] = script;
        return script;
    }


    function each(arr, fn) {
        if (!arr) { return; }

        // arguments special type
        if (typeof arr == 'object') { arr = [].slice.call(arr); }

        // do the job
        for (var i = 0; i < arr.length; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    function isFunc(el) {
        return Object.prototype.toString.call(el) == '[object Function]';
    }

    function allLoaded(els) {

        els = els || scripts;

        var loaded;
        
        for (var name in els) {
            if (els.hasOwnProperty(name) && els[name].state != LOADED) { return false; }
            loaded = true;
        }
        
        return loaded;
    }


    function onPreload(script) {
        script.state = PRELOADED;

        each(script.onpreload, function(el) {
            el.call();
        });
    }

    function preload(script, callback) {

        if (script.state === undefined) {

            script.state = PRELOADING;
            script.onpreload = [];

            scriptTag({ src: script.url, type: 'cache'}, function()  {
                onPreload(script);
            });
        }
    }

    function load(script, callback) {

        if (script.state == LOADED) {
            return callback && callback();
        }

        if (script.state == LOADING) {
            return api.ready(script.name, callback);
        }

        if (script.state == PRELOADING) {
            return script.onpreload.push(function() {
                load(script, callback);
            });
        }

        script.state = LOADING;

        scriptTag(script.url, function() {

            script.state = LOADED;

            if (callback) { callback(); }

            // handlers for this script
            each(handlers[script.name], function(fn) {
                one(fn);
            });

            // everything ready
            if (allLoaded() && isDomReady) {
                each(handlers.ALL, function(fn) {
                    one(fn);
                });
            }
        });
    }


    function scriptTag(src, callback) {

        var s = doc.createElement('script');
        s.type = 'text/' + (src.type || 'javascript');
        s.src = src.src || src;
        s.async = false;

        s.onreadystatechange = s.onload = function() {

            var state = s.readyState;

            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };

        // use body if available. more safe in IE
        (doc.body || head).appendChild(s);
    }

    /*
        The much desired DOM ready check
        Thanks to jQuery and http://javascript.nwbox.com/IEContentLoaded/
    */

    function fireReady() {
        if (!isDomReady) {
            isDomReady = true;
            each(domWaiters, function(fn) {
                one(fn);
            });
        }
    }

    // W3C
    if (window.addEventListener) {
        doc.addEventListener("DOMContentLoaded", fireReady, false);

        // fallback. this is always called
        window.addEventListener("load", fireReady, false);

    // IE
    } else if (window.attachEvent) {

        // for iframes
        doc.attachEvent("onreadystatechange", function()  {
            if (doc.readyState === "complete" ) {
                fireReady();
            }
        });


        // avoid frames with different domains issue
        var frameElement = 1;

        try {
            frameElement = window.frameElement;

        } catch(e) {}


        if (!frameElement && head.doScroll) {

            (function() {
                try {
                    head.doScroll("left");
                    fireReady();

                } catch(e) {
                    setTimeout(arguments.callee, 1);
                    return;
                }
            })();
        }

        // fallback
        window.attachEvent("onload", fireReady);
    }


    // enable document.readyState for Firefox <= 3.5
    if (!doc.readyState && doc.addEventListener) {
        doc.readyState = "loading";
        doc.addEventListener("DOMContentLoaded", handler = function () {
            doc.removeEventListener("DOMContentLoaded", handler, false);
            doc.readyState = "complete";
        }, false);
    }

    /*
        We wait for 300 ms before script loading starts. for some reason this is needed
        to make sure scripts are cached. Not sure why this happens yet. A case study:

        https://github.com/headjs/headjs/issues/closed#issue/83
    */
    setTimeout(function() {
        isHeadReady = true;
        each(queue, function(fn) { fn(); });

    }, 300);

})(document);


/**
 * The sole purpose of this file is to wrap any "loader" library
 * behind a unified interface.
 * See links for approaches to embeded loader.
 * This must work without any shim support, in most browsers.
 *
 * @file
 * @summary "Any" script loader wrapper.
 * @see https://gist.github.com/603980
 * @see http://www.dustindiaz.com/scriptjs/
 *
 * @author <a href="mailto:dev@webitup.fr">Mangled Deutz & Raildecom</a>
 * @version 1.0.0-rc1
 *
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">MIT</a>.
 * @copyright All rights reserved <a href="http://www.webitup.fr">© Web It Up</a>
 * @name https://github.com/jsBoot/spitfire.js/blob/master/src/loader.js#43-88a0411a8b50372c707cf56cbe40d13d775c6e74
 */

/**
 * Provides a crude "script loader" abstraction on top of whatever
 * loader library is detected.
 * Currently supports labjs and requirejs (headjs and yahoo are provided as well,
 * with fewer test and possibly degraded performance / functionality).
 * The API itself ressembles a lot that of LABJS.
 *
 * @module Spitfire/loader
 * @summary Wrapper script "loader" singleton.
 * @todo implement http://yepnopejs.com/
 * @todo implement http://code.google.com/p/jsload/
 */

(function() {
  /*jshint browser:true */
  /*global define:true, exports:true, head:true, YUI:true, yepnope:true, requirejs:true, $LAB:true*/
  'use strict';

  // Get a backend
  var backend;

  // http://headjs.com/#api
  if (typeof head != 'undefined')
    backend = function() {
      // Head has no "fork" feature
      return function(uris, callback) {
        uris.push(callback);
        return head.js.apply(head.js, uris);
        // head.js(file1 … fileN, [callback])
      };
    };

  // http://yuilibrary.com/yui/docs/get/index.html
  if (typeof YUI != 'undefined')
    backend = function() {
      var Y;
      YUI().use('get', function(o) {
        Y = o;
      });
      Y.Get.options.async = true;
      return function() {
        Y.Get.js.apply(Y.Get, arguments);
      };
    };

  if (typeof yepnope != 'undefined')
    backend = function() {
      return function(uris, callback) {
        var stamp = uris[uris.length - 1];
        yepnope({load: uris, callback: function(url) {
          if (stamp == url)
            callback();
        }});
      };
    };

  // http://requirejs.org/
  if (typeof requirejs != 'undefined')
    backend = function() {
      return function(uris, callback) {
        requirejs(uris, callback);
      };
    };

  var PvLoader;
  // http://labjs.com/documentation.php
  // LAB override entirely the PvLoader itself - not a backend per-se
  if (typeof $LAB != 'undefined')
    PvLoader = function() {
      var q = $LAB.sandbox();
      this.script = function(uri) {
        q = q.script(uri);
        return this;
      };
      this.wait = function(cbk) {
        // Lab has an irritable anus
        if (cbk)
          q = q.wait(cbk);
        else
          q = q.wait();
        return this;
      };
    };

  /*    backend = function(){
    var q = $LAB.sandbox();
    q.mark = Math.random(1);
    return function(uris, callback) {
      var mark = q.mark;
      for(var x = 0; x < uris.length; x++)
        q = q.script(uris[x]);
      // while (uris.length)
      //   q = q.script(uris.shift());
      q = q.wait(callback);
      q.mark = mark;
    };
  };*/

  if (!PvLoader)
    PvLoader = function() {
      var linger = null;
      var toLoad = [];
      var currentLoading = false;
      var bck = backend();

      var lingerEnd = function() {
        if (currentLoading)
          return;

        currentLoading = toLoad.shift();

        if (!currentLoading)
          return;

        if (!currentLoading.uris.length) {
          var cl = currentLoading.callback;
          currentLoading = false;
          if (cl)
            cl();
          lingerEnd();
          return;
        }

        bck(currentLoading.uris, function(err) {
          var cl = currentLoading.callback;
          currentLoading = false;
          if (cl)
            cl(err);
          lingerEnd();
        });
      };

      /**
       * Allows to request the loading of a given script specified by an uri.
       * The loading is always parallelized (if the underlying library supports it)
       * though the evaluation is parallelized between calls to wait.
       * Only javascript files can be loaded this way.
       *
       * @function module:Spitfire/loader.script
       * @summary Main loader function.
       * @see module:Spitfire/loader.wait
       * @example
       *   loader.script("someuri.js");
       *   loader.script("otheruri.js");
       * @example
       *   loader.script("someuri.js").script("otheruri.js");
       *
       * @param   {String} uri [description].
       * @returns {module:Spitfire/loader} Returns the loader so that calls can be chained.
       */
      this.script = function(uri) {
        if (linger)
          clearTimeout(linger);

        if (!toLoad.length)
          toLoad.push({uris: [], callback: false});
        toLoad[toLoad.length - 1].uris.push(uri);

        linger = setTimeout(lingerEnd, 1);
        return this;
      };

      /**
       * This method allows to specify "groups" of scripts that will be evaluated
       * after each other.
       * There is no guarantee of any sort on the evaluation order inside a group.
       * Note that some backend libraries don't support this properly and instead
       * this blocks *loading* to guarantee the execution order (which is bad).
       *
       * @function module:Spitfire/loader.wait
       * @summary Wait for previous scripts to evaluate.
       * @see module:Spitfire/loader.script
       * @example
       *   loader.script("someuri.js");
       *   loader.script("otheruri.js");
       *   loader.wait(function(){
       *   // both scripts have been executed
       *   });
       * @example
       *   loader.script("uri.js")
       *     .wait()
       *     .script("another.js")// when another executes, uri has been executed
       *     .wait(function(){
       *       // both have been executed
       *   });
       * @param   {Function} [callback] Function to be called when all previous scripts
       * have evaluated.
       * @returns {module:Spitfire/loader} Returns the loader so that calls can be chained.
       */
      this.wait = function(callback) {
        // Grab the last waiting stack, if any
        var me = toLoad.length ? toLoad[toLoad.length - 1] : false;
        // If currently loading, that's our client
        if (currentLoading)
          me = currentLoading;
        // If we have no stack and still a calback, call it now
        if (!me) {
          if (callback)
            callback();
          return this;
        }
        // If the stack doesn't have a callback, that's us
        if (!me.callback) {
          me.callback = callback;
          toLoad.push({uris: [], callback: false});
        }else {
          // Otherwise, it's just a chained callback - add it to a blank stack
          toLoad.push({uris: [], callback: callback});
        }
        return this;
      };
    };

  /**
   * Allows to get a new, separate loader instance
   *
   * @example
   * // Two different, unrelated loading queues.
   *   var ld2 = loader.fork();
   *   loader.script('some.js').wait();
   *   ld2.script('some2.js').wait();
   * @function module:Spitfire/loader.fork
   * @summary Provides a new loading stack
   * @returns {module:Spitfire/loader} Returns a new loader instance
   */
  PvLoader.prototype.fork = function() {
    return new PvLoader();
  };

  /**
  * This is meant as a helper to resolve an uri against that of another script.
  *
  * @todo Note this is NOT guaranteed to work - the document may NOT be ready at the time this is used...
  * Correct approach would be to timeout and repeat this in case it returns false.
  *
  * @function module:Spitfire/loader.base
  * @summary Resolve uris relatively to a name matching another script
  * @param   {String} currentName Name of the script to use as a basis.
  * @returns {String} resolved uri
  */
  PvLoader.prototype.base = function(currentName) {
    var c = document.getElementsByTagName('script');
    var m;
    var re = new RegExp(currentName);
    // for(var x = 0, it; (x < c.length) && (it = c[x].src); x++){
    for (var x = 0, it; x < c.length; (it = c[x].getAttribute('src')), x++) {
      if (it && re.test(it)) {
        m = it.split('/');
        m.pop();
        m = m.join('/');
        break;
      }
    }
    return m;
  };

  var idx = 1;
  var hook = null;
  /**
   * This allows to load stylesheets.
   * It works by embedding additional link rel into the document head.
   * Note that the order will be respected, and that they will be appended
   * AFTER anything already present in the head.
   *
   * @function module:Spitfire/loader.style
   * @todo See gulliver - this may fail in subtle ways
   * @summary A simple stylesheet loader.
   * @param   {String} url   Url of the stylesheet.
   * @param   {String} [media] Optional media that the stylesheet applies for.
   * @returns {undefined}
   */
  PvLoader.prototype.style = function(url, media) {
    var h = document.getElementsByTagName('head')[0];
    var s = document.createElement('link');
    s.setAttribute('type', 'text/css');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('data-spitfire-index', idx);
    if (media)
      s.setAttribute('media', media);
    s.setAttribute('href', url);

    if (!hook)
      hook = h.lastChild;
    // && h.firstChild.nextSibling;
    if (!hook || !hook.nextSibling)
      h.appendChild(s);
    else
      h.insertBefore(s, hook.nextSibling);
    hook = s;
    idx++;
  };

  /*
   * =========================
   * AMD / noAMD dummy pattern
   * Asynchronous module loaders, CommonJS environments, web
   * browsers, and JavaScript engines. Credits: Oyvind Sean Kinsey.
   * =========================
   */
  // Pattern from JSON3
  // Export for asynchronous module loaders, CommonJS environments, web browsers, and JavaScript engines.
  var isLoader = typeof define === 'function' && define.amd;
  var root = typeof exports == 'object' && exports;

  if (isLoader || root) {
    if (isLoader) {
      // Export for asynchronous module loaders. The namespace is
      // redefined because module loaders do not provide the "exports" object.
      define('Spitfire/loader', new PvLoader());
    }
  } else {
    if (!('Spitfire' in this))
      this.Spitfire = {};
    this.Spitfire.loader = new PvLoader();
  }
  /**
   * =========================
   * End of dummy pattern
   * =========================
   */

}).apply(this);



/**
 * @file
 * @summary Set of browser features tests, shims, and minimalistic testing API.
 *
 * @see http://afarkas.github.com/webshim/demos/demos/json-storage.html
 * @see http://code.google.com/p/html5-shims/wiki/LinksandResources
 * @see https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills
 * @see https://github.com/bestiejs/
 * @see http://es5.github.com/#x15.4.4.13
 *
 * @author <a href="mailto:dev@webitup.fr">Mangled Deutz & Raildecom</a>
 * @version 1.0.0-rc1
 *
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">MIT</a>.
 * @copyright All rights reserved <a href="http://www.webitup.fr">© Web It Up</a>
 * @name https://github.com/jsBoot/spitfire.js/blob/master/src/shimer.js#43-88a0411a8b50372c707cf56cbe40d13d775c6e74
 */

(function() {
  /*jshint browser:true */
  /*global define:true, exports:true*/
  'use strict';

  /**
   * The idea here is to provide tests to detect browsers missing features
   * and bugs, and propose "shims" uris to be loaded.
   * To some extent, this ressembles modernizr - except it focuses on core
   * features (eg: ES5 language features), and does provide accompanying shims.
   * Currently provided are large parts of ES5, JSON, XHR, geolocation, console
   * and localStorage.
   *
   * @module Spitfire
   * @summary Provides shiming test/patching environment.
   */

  /*
   * =========================
   * AMD / noAMD dummy pattern
   * Asynchronous module loaders, CommonJS environments, web
   * browsers, and JavaScript engines. Credits: Oyvind Sean Kinsey.
   * =========================
   */
  var isLoader = typeof define === 'function' && define.amd;
  var root = typeof exports == 'object' && exports;

  // Pattern from JSON3
  // Export for asynchronous module loaders, CommonJS environments, web browsers, and JavaScript engines.
  if (isLoader || root) {
    if (isLoader) {
      // Export for asynchronous module loaders. The namespace is
      // redefined because module loaders do not provide the "exports" object.
      define('Spitfire', (root = {}));
    }
  } else {
    // Export for browsers and JavaScript engines.
    root = this.Spitfire || (this.Spitfire = {});
  }
  /*
   * =========================
   * End of dummy pattern
   * =========================
   */

  var shimsTest = {};
  var toBeLoaded = [];

  /**
   * This describes what a test object should look like.
   * This is NOT an actual, instanciable class.
   * @todo Tests should be functions instead of booleans
   * @class module:Spitfire.Test
   * @abstract
   * @extends {Object}
   */

  /**
   * Whether or not the environment needs to shim that functionality.
   * @member module:Spitfire.Test.test
   * @type {Boolean}
   */

  /**
   * Optional uri to the file providing the actual shim.
   * This can be left undefined if a functional patch is provided.
   * @see module:Spitfire.Test.patch
   * @member module:Spitfire.Test.uri
   * @type {String}
   */

  /**
   * An optional function providing the actual shim.
   * If specified, will be favored over the uri.
   * @member module:Spitfire.Test.patch
   * @type {Function}
   */


  /**
   * Adds a newly created test to a shim category.
   * Said category can then be "use"-d to request this to be shimed.
   * Predefined categories are specified by this.SAFE (always loaded) and this.UNSAFE.
   *
   * @function module:Spitfire.add
   * @summary Adds a test.
   * @see module:Spitfire.use
   * @see module:Spitfire.Test
   * @see module:Spitfire.SAFE
   * @see module:Spitfire.UNSAFE
   * @example
   * // Provide a conditional shim to be loaded as part of the SAFE batch
   *  Spitfire.add({
   *    test: !Function.prototype.bind,
   *    uri: 'relative_shim_uri_to_bind.js'
   *  }, Spitfire.SAFE);
   * @example
   * // Provide an always-loaded shim, in its own category
   *  Spitfire.add({
   *    test: true,
   *    uri: 'json3.js'
   *  }, Spitfire.JSON);
   * @summary Allows to add a test in a category
   * @param   {module:Spitfire.Test} testObject The test object.
   * @param   {String} category The category to which this shim belong.
   * @returns {undefined}
   */
  root.add = function(testObject, category) {
    if (!(category in shimsTest))
      shimsTest[category] = [];
    shimsTest[category].push(testObject);
  };

  /**
   * For a given category, request that patchable shims are executed
   * and that loadable shims uris be returned once "boot" is called.
   * Note that the SAFE category is ALWAYS requested.
   * Predefined categories consist of UNSAFE, XHR, and JSON
   *
   * @function module:Spitfire.use
   * @example
   *   Spitfire.use(Spitfire.UNSAFE);
   *   var uris = Spitfire.boot();
   * @see module:Spitfire.boot
   * @see module:Spitfire.UNSAFE
   * @see module:Spitfire.XHR
   * @see module:Spitfire.JSON
   * @summary Requests a category of shims
   * @throws INVALID_CATEGORY if the requested category does not have any associated
   * tests.
   * @param   {String} cat Category to load.
   * @returns {undefined}
   */
  root.use = function(cat) {
    if (!cat || !(cat in shimsTest))
      throw 'INVALID_CATEGORY';
    for (var x = 0; x < shimsTest[cat].length; x++)
      toBeLoaded.push(shimsTest[cat][x]);
  };

  /**
   * Once categories have been requested via the "use" method, calling boot
   * evaluate every test and returns the list of uris to load.
   * Shims directly providing functionality via "patch" are executed before this
   * returns.
   * Note that the SAFE category is ALWAYS loaded.
   *
   * @function module:Spitfire.boot
   * @example
   *   Spitfire.use(Spitfire.UNSAFE);
   * // Just do it...
   *   var uris = Spitfire.boot();
   * @summary Give uris to shims.
   * @see module:Spitfire.use
   * @param   {Boolean} [useFull=false] If true, request non-minified versions of the shims.
   * Useful for debugging only.
   * @returns Array<String> An array of uris to load in order to obtain the shims.
   */
  root.boot = function(useFull) {
    var uris = [];
    for (var x = 0, shim; (x < toBeLoaded.length) && (shim = toBeLoaded[x]); x++) {
      if (shim.test) {
        if (shim.patch)
          shim.patch();
        else
          uris.push('burnscars/' + shim.uri + (useFull ? '.js' : '-min.js'));
      }
    }
    return uris;
  };


  /**
   * Enforces the loading of a shimed XHR, enforcing identical functionality
   * in any browser, regardless of the current support.
   * This is useful if you want to be DEAD SURE it will behave the same.
   * Know that XHR is very buggy and present numerous and wide discrepancies
   * between browsers, or even browsers versions - not only in IE.
   *
   * @member module:Spitfire.XHR
   * @constant
   * @type {String}
   */
  root.XHR = 'xhr';
  root.add({test: true, uri: 'xmlhttprequest'}, root.XHR);

  /**
   * Enforces the loading of a shimed JSON, enforcing identical functionality
   * in any browser, regardless of the current support.
   * This is useful if you want to be DEAD SURE it will behave the same.
   * JSON and related functions are very buggy and have wide discrepancies between browsers.
   *
   * @member module:Spitfire.JSON
   * @constant
   * @type {String}
   */
  root.JSON = 'json';
  root.add({test: true, uri: 'json3'}, root.JSON);

  /**
   * Requests that "unsafe" shims are loaded.
   * These are shims that don't actually provide real functionality, just create named methods
   * to allow for ES5 code to actually *run* without errors.
   * The drawback is that it will break feature detection in third-party libraries without
   * actually providing functionality... Careful with that.
   * @member module:Spitfire.UNSAFE
   * @constant
   * @type {String}
   */
  root.UNSAFE = 'unsafe';
  root.add({
    test: !Function.isGenerator,
    uri: 'function.isgenerator'
  }, root.UNSAFE);
  root.add({
    test:
        !Object.preventExtensions ||
        !Object.isSealed ||
        !Object.isFrozen ||
        !Object.seal ||
        !Object.freeze,
    uri: 'es5-sham'
  }, root.UNSAFE);

  /**
   * This is the safe category, that should be used for any shim that is slick, does provide
   * complete functionality for a given section.
   * @member module:Spitfire.SAFE
   * @constant
   * @type {String}
   */
  root.SAFE = 'safe';
  // ==========
  // Arrays
  // ==========
  // XXX Awaiting pull request to be accepted into es5
  root.add({
    test: ([].unshift('test') === undefined),
    uri: 'array.bugs'
  }, root.SAFE);

  /**
   * ES5 provided shims
   */
  var arrayTests =
      ([1, 2].splice(0).length != 2) ||
      !Array.isArray ||
      !Array.prototype.forEach ||
      !Array.prototype.map ||
      !Array.prototype.filter ||
      !Array.prototype.every ||
      !Array.prototype.some ||
      !Array.prototype.reduce ||
      !Array.prototype.reduceRight ||
      !Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1) ||
      !Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1);

  var functionTests = !Function.prototype.bind;
  var objectTests = !Object.keys;
  var dateTests = !Date.now ||
      !Date.prototype.toISOString || !Date.parse ||
      /*      isNaN(Date.parse("2000-01-01T00:00:00.000Z")) ||
      (Date.parse('+275760-09-13T00:00:00.000Z') !== 8.64e15) ||*/
      (new Date(-62198755200000).toISOString().indexOf('-000001') === -1) ||
      (function() {
        var dateToJSONIsSupported = false;
        try {
          dateToJSONIsSupported = (
              Date.prototype.toJSON &&
              new Date(NaN).toJSON() === null &&
              new Date(-62198755200000).toJSON().indexOf('-000001') !== -1 &&
              Date.prototype.toJSON.call({ // generic
                toISOString: function() {
                  return true;
                }
              })
              );
        } catch (e) {
        }
        return !dateToJSONIsSupported;
      })();

  var stringTests = !!'0'.split(void 0, 0).length ||
      (''.substr && '0b'.substr(-1) !== 'b') ||
      !String.prototype.trim ||
          '\x09\x0A\x0B\x0C\x0D \xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
          '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
          '\u2029\uFEFF'.trim();

  var es5Tests = arrayTests || functionTests || objectTests || dateTests || stringTests;

  // Although in ES5-SHIM, most modern browsers unfortunately want this
  /*  root.add({
      test: !es5Tests && (!String.prototype.trim ||
          '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
          '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
          '\u2029\uFEFF'.trim()),
      patch: function(){
        var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
            '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
            '\u2029\uFEFF';
        ws = '[' + ws + ']';
        var trimBeginRegexp = new RegExp('^' + ws + ws + '*'),
            trimEndRegexp = new RegExp(ws + ws + '*$');
        String.prototype.trim = function trim() {
          if (this === undefined || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
          }
          return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
        };
      }
  }, root.SAFE);
  */
  // WebKit modern bugs... patched by ES5-shim, but we want it in there to avoid it
  /*  root.add({
    test: !!'0'.split(void 0, 0).length,
    patch: function(){
      var string_split = String.prototype.split;
      String.prototype.split = function(separator, limit) {
          if(separator === void 0 && limit === 0)return [];
          return string_split.apply(this, arguments);
      }
    }
  }, root.SAFE);
 */

  // Present in ES5-SHAM, which we don't always want while this is useful
  root.add({
    test: Object.freeze && (function() {
      try {
        Object.freeze(function() {});
      } catch (exception) {
        return true;
      }
      return false;
    })(),
    patch: function() {
      Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
          if (typeof object == 'function') {
            return object;
          } else {
            return freezeObject(object);
          }
        };
      })(Object.freeze);
    }
  }, root.SAFE);

  // Needed about everywhere
  root.add({
    test: (typeof TypeError == 'undefined'),
    patch: function() {
      window.TypeError = Error || function() {};
    }
  }, root.SAFE);

  /**
   * Standalone, other tests
   */

  // ==========
  // Objects - although these are available in es5-sham,
  // they are bundled with other, riskier shams, so let's keep it
  // separate for now
  // ==========
  root.add({
    test: !Object.getPrototypeOf,
    uri: 'object.getprototypeof'
  }, root.SAFE);

  root.add({
    test: !Object.getOwnPropertyDescriptor,
    uri: 'object.getownpropertydescriptor'
  }, root.SAFE);

  root.add({
    test: !Object.getOwnPropertyNames,
    uri: 'object.getownpropertynames'
  }, root.SAFE);

  root.add({
    test: !Object.create,
    uri: 'object.create'
  }, root.SAFE);

  root.add({
    test: !Object.defineProperty,
    uri: 'object.defineproperty'
  }, root.SAFE);

  root.add({
    test: !Object.defineProperties,
    uri: 'object.defineproperties'
  }, root.SAFE);

  root.add({
    test: !Object.isExtensible,
    uri: 'object.isextensible'
  }, root.SAFE);

  // ==========
  // Events
  // ==========
  root.add({
    test: !window.addEventListener,
    uri: 'events'
  }, root.SAFE);

  // ==========
  // Localstorage
  // ==========
  root.add({
    test: !window.localStorage,
    uri: 'localstorage'
  }, root.SAFE);

  // ==========
  // Geolocation
  // ==========
  root.add({
    test: !navigator.geolocation,
    uri: 'geolocation'
  }, root.SAFE);

  /**
   * Provided by third-party
   */

  // ==========
  // ES5
  // ==========
  root.add({
    test: es5Tests,
    uri: 'es5-shim'
  }, root.SAFE);


  // ==========
  // JSON
  // ==========
  root.add({
    test: !window.JSON,
    uri: 'json3'
  }, root.SAFE);

  // ==========
  // XHR
  // ==========

  root.add({
    test: !window.XMLHttpRequest,
    uri: 'xmlhttprequest'
  }, root.SAFE);

  // ==========
  // Console
  // ==========
  root.add({
    test: !window.console /*@cc_on || @_jscript_version <= 9 @*/ || !(function() {
      var ok = true;
      var props = [
        'log', 'debug', 'info', 'warn', 'error', 'assert' /*, 'dir', 'dirxml', 'exception', 'time',
          'timeEnd', 'table',
          'clear', 'trace', 'group', 'groupCollapsed', 'groupEnd', 'timeStamp', 'profile', 'profileEnd',
          'count'*/
      ];
      for (var x = 0; x < props.length; x++)
        ok &= !!window.console[props[x]];
      return ok;
    })(),
    uri: 'console'
  }, root.SAFE);

  // Use all safe shims by default
  root.use(root.SAFE);


  // IE at large doesn't support additional arguments on settimeout.
  // This can't be shimed independtly considering we work synchronously for now with loader
  // AND XXX BEWARE - this means that setTimeout can't be used in following code
  // BEFORE this specific setTimeout runs out
  setTimeout(function(a) {
    if (!a) {
      var deref = window.setTimeout;
      window.setTimeout = function(callback, delay) {
        var a = Array.prototype.slice.call(arguments);
        a.shift();
        a.shift();
        var cl = function() {
          callback.apply(this, a);
        };
        deref(cl, delay);
      };
    }
  }, 1, true);

}).apply(this);


// http://www.calormen.com/polyfill/
// https://github.com/mozilla/shumway
// Check for modernizr once again as well
// https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills

/**#nocode-*/

