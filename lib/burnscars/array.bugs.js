// XXX Awaiting pull request to be accepted

// @patch IE7
if ([].unshift('test') === undefined)
  (function() {
    'use strict';
    var nat = Array.prototype.unshift;
    Array.prototype.unshift = function() {
      nat.apply(this, arguments);
      return this.length;
    };
  })();
