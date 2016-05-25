var riot = require('riot');

(function(global, riot) {
    var flux = { config: {} };
    var utils =  {
        extend: function(src, obj) {
            for (var key in obj) {
                if (!src[key]) {
                    src[key] = obj[key];
                }
            }
        },

        isType: function (type) {
            return function (obj) {
                return Object.prototype.toString.call(obj) === '[object ' + type + ']';
            }
        },

        clone: function (parent, child) {
            var defaultWrapper = (toString.call(parent) === '[object Array]') ? [] : {};
            var child = child || defaultWrapper;
            for (var i in parent) {
                if (toString.call(parent[i]) === '[object Object]') {
                    child[i] = {};
                    this.clone(parent[i], child[i]);
                }
                else if (toString.call(parent[i]) === '[object Array]') {
                    child[i] = [];
                    this.clone(parent[i], child[i]);
                } 
                else {
                    child[i] = parent[i];
                }
            }
            return child;
        }
    };

    utils.extend(utils, {
        isArray: utils.isType('Array'),
        isString: utils.isType('String'),
        isObject: utils.isType('Object'),
        isFunction: utils.isType('Function'),
        isElement: function (obj) {
            return Object.prototype.toString.call(obj).indexOf('Element') !== -1;
        }
    });

    flux.createStore = function(obj) {
        if (utils.isObject(obj)) {
            return riot.observable(obj);
        }
        else {
            throw('createStore参数格式错误');
        }
    };

    flux.bind = flux.connect = function(options) {

        var self = this;
        var store = options.store;
        var property = options.name || options.property;
        
        var params = options.params;
        var refresh, clone;

        if (flux.config.refresh) {
            refresh = options.refresh === undefined ? true : options.refresh;
        }
        else {
            refresh = options.refresh;
        }

        if (flux.config.noClone) {
            clone = options.clone
        }
        else {
            clone = options.clone === undefined ? true : options.clone;
        }

        var judgeBinded = function(result) {
            if (!store.judge) {
                options.success && options.success(result);
                store.judge = [];
                store.judge.push(self);
            }
            else if (store.judge || store.judge.indexOf(self) === -1 ) {
                options.success && options.success(result);
                store.judge.push(self);
            }
        };

        var onComplete = function(result) {
            store.status = 'complete';
            if (clone) {
                if (utils.isObject(store.data)) {
                    self[property] = utils.clone(store.data);
                }
                else if (utils.isArray(store.data)) {
                    self[property] = store.data.concat([]);
                }
                else {
                    self[property] = store.data;
                }
            }
            else {
                self[property] = store.data;
            }
            judgeBinded(result);
            self.update();
        };

        var onError = function(err) {
            options.error && options.error(err);
        };

        store.on('complete', onComplete);
        store.on('error', onError);
        self.on('unmount', function(){
            store.off('complete', onComplete);
        });

        if (store.data && store.status === 'complete') {
            if (refresh !== true) {
                self[property] = store.data;
                judgeBinded();
                self.update();
            }
            else {
                flux.update(store, params);
            }
        }
        else {
            if (store.status !== 'getting') {
                flux.update(store, params);
            }
        }
    };

    flux.update = function(store, params) {
        if (store.get && utils.isFunction(store.get)) {
            store.status = 'getting';
            store.get(params);
        }
    };

    if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports) {
        module.exports = flux;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function() { return (global.flux = flux) });
    }
    else {
        global.flux = flux;
    }

})(window, riot);

