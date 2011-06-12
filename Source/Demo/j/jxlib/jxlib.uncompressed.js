/******************************************************************************
 * MooTools 1.2.2
 * Copyright (c) 2006-2007 [Valerio Proietti](http://mad4milk.net/).
 * MooTools is distributed under an MIT-style license.
 ******************************************************************************
 * reset.css - Copyright (c) 2006, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License: http://developer.yahoo.net/yui/license.txt
 ******************************************************************************
 * Jx UI Library, 2.0.1
 * Copyright (c) 2006-2008, DM Solutions Group Inc. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *****************************************************************************/
/*
Script: Core.js
	MooTools - My Object Oriented JavaScript Tools.

License:
	MIT-style license.

Copyright:
	Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).

Code & Documentation:
	[The MooTools production team](http://mootools.net/developers/).

Inspiration:
	- Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
	- Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)
*/

var MooTools = {
	'version': '1.2.2',
	'build': 'f0491d62fbb7e906789aa3733d6a67d43e5af7c9'
};

var Native = function(options){
	options = options || {};
	var name = options.name;
	var legacy = options.legacy;
	var protect = options.protect;
	var methods = options.implement;
	var generics = options.generics;
	var initialize = options.initialize;
	var afterImplement = options.afterImplement || function(){};
	var object = initialize || legacy;
	generics = generics !== false;

	object.constructor = Native;
	object.$family = {name: 'native'};
	if (legacy && initialize) object.prototype = legacy.prototype;
	object.prototype.constructor = object;

	if (name){
		var family = name.toLowerCase();
		object.prototype.$family = {name: family};
		Native.typize(object, family);
	}

	var add = function(obj, name, method, force){
		if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
		if (generics) Native.genericize(obj, name, protect);
		afterImplement.call(obj, name, method);
		return obj;
	};

	object.alias = function(a1, a2, a3){
		if (typeof a1 == 'string'){
			if ((a1 = this.prototype[a1])) return add(this, a2, a1, a3);
		}
		for (var a in a1) this.alias(a, a1[a], a2);
		return this;
	};

	object.implement = function(a1, a2, a3){
		if (typeof a1 == 'string') return add(this, a1, a2, a3);
		for (var p in a1) add(this, p, a1[p], a2);
		return this;
	};

	if (methods) object.implement(methods);

	return object;
};

Native.genericize = function(object, property, check){
	if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
		var args = Array.prototype.slice.call(arguments);
		return object.prototype[property].apply(args.shift(), args);
	};
};

Native.implement = function(objects, properties){
	for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.typize = function(object, family){
	if (!object.type) object.type = function(item){
		return ($type(item) === family);
	};
};

(function(){
	var natives = {'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String};
	for (var n in natives) new Native({name: n, initialize: natives[n], protect: true});

	var types = {'boolean': Boolean, 'native': Native, 'object': Object};
	for (var t in types) Native.typize(types[t], t);

	var generics = {
		'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
		'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
	};
	for (var g in generics){
		for (var i = generics[g].length; i--;) Native.genericize(window[g], generics[g][i], true);
	}
})();

var Hash = new Native({

	name: 'Hash',

	initialize: function(object){
		if ($type(object) == 'hash') object = $unlink(object.getClean());
		for (var key in object) this[key] = object[key];
		return this;
	}

});

Hash.implement({

	forEach: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
		}
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('forEach', 'each');

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
	}

});

Array.alias('forEach', 'each');

function $A(iterable){
	if (iterable.item){
		var l = iterable.length, array = new Array(l);
		while (l--) array[l] = iterable[l];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

function $arguments(i){
	return function(){
		return arguments[i];
	};
};

function $chk(obj){
	return !!(obj || obj === 0);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $defined(obj){
	return (obj != undefined);
};

function $each(iterable, fn, bind){
	var type = $type(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

function $empty(){};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $H(object){
	return new Hash(object);
};

function $lambda(value){
	return (typeof value == 'function') ? value : function(){
		return value;
	};
};

function $merge(){
	var args = Array.slice(arguments);
	args.unshift({});
	return $mixin.apply(null, args);
};

function $mixin(mix){
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		if ($type(object) != 'object') continue;
		for (var key in object){
			var op = object[key], mp = mix[key];
			mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $mixin(mp, op) : $unlink(op);
		}
	}
	return mix;
};

function $pick(){
	for (var i = 0, l = arguments.length; i < l; i++){
		if (arguments[i] != undefined) return arguments[i];
	}
	return null;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
	var type = $type(obj);
	return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
	return +new Date;
};

function $try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

function $type(obj){
	if (obj == undefined) return false;
	if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}
	return typeof obj;
};

function $unlink(object){
	var unlinked;
	switch ($type(object)){
		case 'object':
			unlinked = {};
			for (var p in object) unlinked[p] = $unlink(object[p]);
		break;
		case 'hash':
			unlinked = new Hash(object);
		break;
		case 'array':
			unlinked = [];
			for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
		break;
		default: return object;
	}
	return unlinked;
};
/*
Script: Browser.js
	The Browser Core. Contains Browser initialization, Window and Document, and the Browser Hash.

License:
	MIT-style license.
*/

var Browser = $merge({

	Engine: {name: 'unknown', version: 0},

	Platform: {name: (window.orientation != undefined) ? 'ipod' : (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()},

	Features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},

	Plugins: {},

	Engines: {

		presto: function(){
			return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
		},

		trident: function(){
			return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? 5 : 4);
		},

		webkit: function(){
			return (navigator.taintEnabled) ? false : ((Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419);
		},

		gecko: function(){
			return (document.getBoxObjectFor == undefined) ? false : ((document.getElementsByClassName) ? 19 : 18);
		}

	}

}, Browser || {});

Browser.Platform[Browser.Platform.name] = true;

Browser.detect = function(){

	for (var engine in this.Engines){
		var version = this.Engines[engine]();
		if (version){
			this.Engine = {name: engine, version: version};
			this.Engine[engine] = this.Engine[engine + version] = true;
			break;
		}
	}

	return {name: engine, version: version};

};

Browser.detect();

Browser.Request = function(){
	return $try(function(){
		return new XMLHttpRequest();
	}, function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	});
};

Browser.Features.xhr = !!(Browser.Request());

Browser.Plugins.Flash = (function(){
	var version = ($try(function(){
		return navigator.plugins['Shockwave Flash'].description;
	}, function(){
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);
	return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
})();

function $exec(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script[(Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerText' : 'text'] = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

Native.UID = 1;

var $uid = (Browser.Engine.trident) ? function(item){
	return (item.uid || (item.uid = [Native.UID++]))[0];
} : function(item){
	return item.uid || (item.uid = Native.UID++);
};

var Window = new Native({

	name: 'Window',

	legacy: (Browser.Engine.trident) ? null: window.Window,

	initialize: function(win){
		$uid(win);
		if (!win.Element){
			win.Element = $empty;
			if (Browser.Engine.webkit) win.document.createElement("iframe"); //fixes safari 2
			win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
		}
		win.document.window = win;
		return $extend(win, Window.Prototype);
	},

	afterImplement: function(property, value){
		window[property] = Window.Prototype[property] = value;
	}

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

	name: 'Document',

	legacy: (Browser.Engine.trident) ? null: window.Document,

	initialize: function(doc){
		$uid(doc);
		doc.head = doc.getElementsByTagName('head')[0];
		doc.html = doc.getElementsByTagName('html')[0];
		if (Browser.Engine.trident && Browser.Engine.version <= 4) $try(function(){
			doc.execCommand("BackgroundImageCache", false, true);
		});
		if (Browser.Engine.trident) doc.window.attachEvent('onunload', function() {
			doc.window.detachEvent('onunload', arguments.callee);
			doc.head = doc.html = doc.window = null;
		});
		return $extend(doc, Document.Prototype);
	},

	afterImplement: function(property, value){
		document[property] = Document.Prototype[property] = value;
	}

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);
/*
Script: Array.js
	Contains Array Prototypes like each, contains, and erase.

License:
	MIT-style license.
*/

Array.implement({

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function() {
		return this.filter($defined);
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = $type(this[i]);
			if (!type) continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});
/*
Script: Function.js
	Contains Function Prototypes like create, bind, pass, and delay.

License:
	MIT-style license.
*/

Function.implement({

	extend: function(properties){
		for (var property in properties) this[property] = properties[property];
		return this;
	},

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return $try(returns);
			return returns();
		};
	},

	run: function(args, bind){
		return this.apply(bind, $splat(args));
	},

	pass: function(args, bind){
		return this.create({bind: bind, arguments: args});
	},

	bind: function(bind, args){
		return this.create({bind: bind, arguments: args});
	},

	bindWithEvent: function(bind, args){
		return this.create({bind: bind, arguments: args, event: true});
	},

	attempt: function(args, bind){
		return this.create({bind: bind, arguments: args, attempt: true})();
	},

	delay: function(delay, bind, args){
		return this.create({bind: bind, arguments: args, delay: delay})();
	},

	periodical: function(periodical, bind, args){
		return this.create({bind: bind, arguments: args, periodical: periodical})();
	}

});
/*
Script: Number.js
	Contains Number Prototypes like limit, round, times, and ceil.

License:
	MIT-style license.
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('times', 'each');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat($A(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);
/*
Script: String.js
	Contains String Prototypes like camelCase, capitalize, test, and toInt.

License:
	MIT-style license.
*/

String.implement({

	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}

});
/*
Script: Hash.js
	Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

License:
	MIT-style license.
*/

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		for (var key in this){
			if (this.hasOwnProperty(key) && this[key] === value) return key;
		}
		return null;
	},

	hasValue: function(value){
		return (Hash.keyOf(this, value) !== null);
	},

	extend: function(properties){
		Hash.each(properties, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			results.set(key, fn.call(bind, value, key, this));
		}, this);
		return results;
	},

	filter: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			if (fn.call(bind, value, key, this)) results.set(key, value);
		}, this);
		return results;
	},

	every: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
		}
		return false;
	},

	getKeys: function(){
		var keys = [];
		Hash.each(this, function(value, key){
			keys.push(key);
		});
		return keys;
	},

	getValues: function(){
		var values = [];
		Hash.each(this, function(value){
			values.push(value);
		});
		return values;
	},

	toQueryString: function(base){
		var queryString = [];
		Hash.each(this, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch ($type(value)){
				case 'object': result = Hash.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Hash.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});

		return queryString.join('&');
	}

});

Hash.alias({keyOf: 'indexOf', hasValue: 'contains'});
/*
Script: Event.js
	Contains the Event Native, to make the event object completely crossbrowser.

License:
	MIT-style license.
*/
var Event = new Native({

	name: 'Event',

	initialize: function(event, win){
		win = win || window;
		var doc = win.document;
		event = event || win.event;
		if (event.$extended) return event;
		this.$extended = true;
		var type = event.type;
		var target = event.target || event.srcElement;
		while (target && target.nodeType == 3) target = target.parentNode;

		if (type.test(/key/)){
			var code = event.which || event.keyCode;
			var key = Event.Keys.keyOf(code);
			if (type == 'keydown'){
				var fKey = code - 111;
				if (fKey > 0 && fKey < 13) key = 'f' + fKey;
			}
			key = key || String.fromCharCode(code).toLowerCase();
		} else if (type.match(/(click|mouse|menu)/i)){
			doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
			var page = {
				x: event.pageX || event.clientX + doc.scrollLeft,
				y: event.pageY || event.clientY + doc.scrollTop
			};
			var client = {
				x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
				y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
			};
			if (type.match(/DOMMouseScroll|mousewheel/)){
				var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			}
			var rightClick = (event.which == 3) || (event.button == 2);
			var related = null;
			if (type.match(/over|out/)){
				switch (type){
					case 'mouseover': related = event.relatedTarget || event.fromElement; break;
					case 'mouseout': related = event.relatedTarget || event.toElement;
				}
				if (!(function(){
					while (related && related.nodeType == 3) related = related.parentNode;
					return true;
				}).create({attempt: Browser.Engine.gecko})()) related = false;
			}
		}

		return $extend(this, {
			event: event,
			type: type,

			page: page,
			client: client,
			rightClick: rightClick,

			wheel: wheel,

			relatedTarget: related,
			target: target,

			code: code,
			key: key,

			shift: event.shiftKey,
			control: event.ctrlKey,
			alt: event.altKey,
			meta: event.metaKey
		});
	}

});

Event.Keys = new Hash({
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
});

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});
/*
Script: Class.js
	Contains the Class Function for easily creating, extending, and implementing reusable Classes.

License:
	MIT-style license.
*/

function Class(params){
	
	if (params instanceof Function) params = {initialize: params};
	
	var newClass = function(){
		Object.reset(this);
		if (newClass._prototyping) return this;
		this._current = $empty;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		delete this._current; delete this.caller;
		return value;
	}.extend(this);
	
	newClass.implement(params);
	
	newClass.constructor = Class;
	newClass.prototype.constructor = newClass;

	return newClass;

};

Function.prototype.protect = function(){
	this._protected = true;
	return this;
};

Object.reset = function(object, key){
		
	if (key == null){
		for (var p in object) Object.reset(object, p);
		return object;
	}
	
	delete object[key];
	
	switch ($type(object[key])){
		case 'object':
			var F = function(){};
			F.prototype = object[key];
			var i = new F;
			object[key] = Object.reset(i);
		break;
		case 'array': object[key] = $unlink(object[key]); break;
	}
	
	return object;
	
};

new Native({name: 'Class', initialize: Class}).extend({

	instantiate: function(F){
		F._prototyping = true;
		var proto = new F;
		delete F._prototyping;
		return proto;
	},
	
	wrap: function(self, key, method){
		if (method._origin) method = method._origin;
		
		return function(){
			if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
			var caller = this.caller, current = this._current;
			this.caller = current; this._current = arguments.callee;
			var result = method.apply(this, arguments);
			this._current = current; this.caller = caller;
			return result;
		}.extend({_owner: self, _origin: method, _name: key});

	}
	
});

Class.implement({
	
	implement: function(key, value){
		
		if ($type(key) == 'object'){
			for (var p in key) this.implement(p, key[p]);
			return this;
		}
		
		var mutator = Class.Mutators[key];
		
		if (mutator){
			value = mutator.call(this, value);
			if (value == null) return this;
		}
		
		var proto = this.prototype;

		switch ($type(value)){
			
			case 'function':
				if (value._hidden) return this;
				proto[key] = Class.wrap(this, key, value);
			break;
			
			case 'object':
				var previous = proto[key];
				if ($type(previous) == 'object') $mixin(previous, value);
				else proto[key] = $unlink(value);
			break;
			
			case 'array':
				proto[key] = $unlink(value);
			break;
			
			default: proto[key] = value;

		}
		
		return this;

	}
	
});

Class.Mutators = {
	
	Extends: function(parent){

		this.parent = parent;
		this.prototype = Class.instantiate(parent);

		this.implement('parent', function(){
			var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
			if (!previous) throw new Error('The method "' + name + '" has no parent.');
			return previous.apply(this, arguments);
		}.protect());

	},

	Implements: function(items){
		$splat(items).each(function(item){
			if (item instanceof Function) item = Class.instantiate(item);
			this.implement(item);
		}, this);

	}
	
};
/*
Script: Class.Extras.js
	Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

License:
	MIT-style license.
*/

var Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.extend(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = Events.removeOn(type);
		if (fn != $empty){
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = Events.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = Events.removeOn(type);
		if (!this.$events[type]) return this;
		if (!fn.internal) this.$events[type].erase(fn);
		return this;
	},

	removeEvents: function(events){
		if ($type(events) == 'object'){
			for (var type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = Events.removeOn(events);
		for (var type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

Events.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first) {
		return first.toLowerCase();
	});
};

var Options = new Class({

	setOptions: function(){
		this.options = $merge.run([this.options].extend(arguments));
		if (!this.addEvent) return this;
		for (var option in this.options){
			if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}

});
/*
Script: Element.js
	One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser,
	time-saver methods to let you easily work with HTML Elements.

License:
	MIT-style license.
*/

var Element = new Native({

	name: 'Element',

	legacy: window.Element,

	initialize: function(tag, props){
		var konstructor = Element.Constructors.get(tag);
		if (konstructor) return konstructor(props);
		if (typeof tag == 'string') return document.newElement(tag, props);
		return $(tag).set(props);
	},

	afterImplement: function(key, value){
		Element.Prototype[key] = value;
		if (Array[key]) return;
		Elements.implement(key, function(){
			var items = [], elements = true;
			for (var i = 0, j = this.length; i < j; i++){
				var returns = this[i][key].apply(this[i], arguments);
				items.push(returns);
				if (elements) elements = ($type(returns) == 'element');
			}
			return (elements) ? new Elements(items) : items;
		});
	}

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

	name: 'IFrame',

	generics: false,

	initialize: function(){
		var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
		var props = params.properties || {};
		var iframe = $(params.iframe) || false;
		var onload = props.onload || $empty;
		delete props.onload;
		props.id = props.name = $pick(props.id, props.name, iframe.id, iframe.name, 'IFrame_' + $time());
		iframe = new Element(iframe || 'iframe', props);
		var onFrameLoad = function(){
			var host = $try(function(){
				return iframe.contentWindow.location.host;
			});
			if (host && host == window.location.host){
				var win = new Window(iframe.contentWindow);
				new Document(iframe.contentWindow.document);
				$extend(win.Element.prototype, Element.Prototype);
			}
			onload.call(iframe.contentWindow, iframe.contentWindow.document);
		};
		(window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
		return iframe;
	}

});

var Elements = new Native({

	initialize: function(elements, options){
		options = $extend({ddup: true, cash: true}, options);
		elements = elements || [];
		if (options.ddup || options.cash){
			var uniques = {}, returned = [];
			for (var i = 0, l = elements.length; i < l; i++){
				var el = $.element(elements[i], !options.cash);
				if (options.ddup){
					if (uniques[el.uid]) continue;
					uniques[el.uid] = true;
				}
				returned.push(el);
			}
			elements = returned;
		}
		return (options.cash) ? $extend(elements, this) : elements;
	}

});

Elements.implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeof filter == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}

});

Document.implement({

	newElement: function(tag, props){
		if (Browser.Engine.trident && props){
			['name', 'type', 'checked'].each(function(attribute){
				if (!props[attribute]) return;
				tag += ' ' + attribute + '="' + props[attribute] + '"';
				if (attribute != 'checked') delete props[attribute];
			});
			tag = '<' + tag + '>';
		}
		return $.element(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	}

});

Window.implement({

	$: function(el, nocash){
		if (el && el.$family && el.uid) return el;
		var type = $type(el);
		return ($[type]) ? $[type](el, nocash, this.document) : null;
	},

	$$: function(selector){
		if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
		var elements = [];
		var args = Array.flatten(arguments);
		for (var i = 0, l = args.length; i < l; i++){
			var item = args[i];
			switch ($type(item)){
				case 'element': elements.push(item); break;
				case 'string': elements.extend(this.document.getElements(item, true));
			}
		}
		return new Elements(elements);
	},

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

$.string = function(id, nocash, doc){
	id = doc.getElementById(id);
	return (id) ? $.element(id, nocash) : null;
};

$.element = function(el, nocash){
	$uid(el);
	if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
		var proto = Element.Prototype;
		for (var p in proto) el[p] = proto[p];
	};
	return el;
};

$.object = function(obj, nocash, doc){
	if (obj.toElement) return $.element(obj.toElement(doc), nocash);
	return null;
};

$.textnode = $.whitespace = $.window = $.document = $arguments(0);

Native.implement([Element, Document], {

	getElement: function(selector, nocash){
		return $(this.getElements(selector, true)[0] || null, nocash);
	},

	getElements: function(tags, nocash){
		tags = tags.split(',');
		var elements = [];
		var ddup = (tags.length > 1);
		tags.each(function(tag){
			var partial = this.getElementsByTagName(tag.trim());
			(ddup) ? elements.extend(partial) : elements = partial;
		}, this);
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: (Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerHTML' : 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item, retain){
	if (!item) return;
	var uid = item.uid;
	if (Browser.Engine.trident){
		if (item.clearAttributes){
			var clone = retain && item.cloneNode(false);
			item.clearAttributes();
			if (clone) item.mergeAttributes(clone);
		} else if (item.removeEvents){
			item.removeEvents();
		}
		if ((/object/i).test(item.tagName)){
			for (var p in item){
				if (typeof item[p] == 'function') item[p] = $empty;
			}
			Element.dispose(item);
		}
	}	
	if (!uid) return;
	collected[uid] = storage[uid] = null;
};

var purge = function(){
	Hash.each(collected, clean);
	if (Browser.Engine.trident) $A(document.getElementsByTagName('object')).each(clean);
	if (window.CollectGarbage) CollectGarbage();
	collected = storage = null;
};

var walk = function(element, walk, start, match, all, nocash){
	var el = element[start || walk];
	var elements = [];
	while (el){
		if (el.nodeType == 1 && (!match || Element.match(el, match))){
			if (!all) return $(el, nocash);
			elements.push(el);
		}
		el = el[walk];
	}
	return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : null;
};

var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'text': (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version < 420)) ? 'innerText' : 'textContent'
};
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'];
var camels = ['value', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap'];

bools = bools.associate(bools);

Hash.extend(attributes, bools);
Hash.extend(attributes, camels.associate(camels.map(String.toLowerCase)));

var inserters = {

	before: function(context, element){
		if (element.parentNode) element.parentNode.insertBefore(context, element);
	},

	after: function(context, element){
		if (!element.parentNode) return;
		var next = element.nextSibling;
		(next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		var first = element.firstChild;
		(first) ? element.insertBefore(context, first) : element.appendChild(context);
	}

};

inserters.inside = inserters.bottom;

Hash.each(inserters, function(inserter, where){

	where = where.capitalize();

	Element.implement('inject' + where, function(el){
		inserter(this, $(el, true));
		return this;
	});

	Element.implement('grab' + where, function(el){
		inserter($(el, true), this);
		return this;
	});

});

Element.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				var property = Element.Properties.get(prop);
				(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
		}
		return this;
	},

	get: function(prop){
		var property = Element.Properties.get(prop);
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	},

	erase: function(prop){
		var property = Element.Properties.get(prop);
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		var key = attributes[attribute];
		if (value == undefined) return this.removeProperty(attribute);
		if (key && bools[attribute]) value = !!value;
		(key) ? this[key] = value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		var key = attributes[attribute];
		var value = (key) ? this[key] : this.getAttribute(attribute, 2);
		return (bools[attribute]) ? !!value : (key) ? value : value || null;
	},

	getProperties: function(){
		var args = $A(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		var key = attributes[attribute];
		(key) ? this[key] = (key && bools[attribute]) ? false : '' : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	adopt: function(){
		Array.flatten(arguments).each(function(element){
			element = $(element, true);
			if (element) this.appendChild(element);
		}, this);
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom']($(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, $(el, true));
		return this;
	},

	replaces: function(el){
		el = $(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = $(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, false, nocash);
	},

	getAllPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, true, nocash);
	},

	getNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, false, nocash);
	},

	getAllNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, true, nocash);
	},

	getFirst: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
	},

	getLast: function(match, nocash){
		return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
	},

	getParent: function(match, nocash){
		return walk(this, 'parentNode', null, match, false, nocash);
	},

	getParents: function(match, nocash){
		return walk(this, 'parentNode', null, match, true, nocash);
	},
	
	getSiblings: function(match, nocash) {
		return this.getParent().getChildren(match, nocash).erase(this);
	},

	getChildren: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id, nocash){
		var el = this.ownerDocument.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return $.element(el, nocash);
	},

	getSelected: function(){
		return new Elements($A(this.options).filter(function(option){
			return option.selected;
		}));
	},

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var computed = this.getDocument().defaultView.getComputedStyle(this, null);
		return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea', true).each(function(el){
			if (!el.name || el.disabled) return;
			var value = (el.tagName.toLowerCase() == 'select') ? Element.getSelected(el).map(function(opt){
				return opt.value;
			}) : ((el.type == 'radio' || el.type == 'checkbox') && !el.checked) ? null : el.value;
			$splat(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(el.name + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.Engine.trident){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (var i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		return $(clone);
	},

	destroy: function(){
		Element.empty(this);
		Element.dispose(this);
		clean(this, true);
		return null;
	},

	empty: function(){
		$A(this.childNodes).each(function(node){
			Element.destroy(node);
		});
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	hasChild: function(el){
		el = $(el, true);
		if (!el) return false;
		if (Browser.Engine.webkit && Browser.Engine.version < 420) return $A(this.getElementsByTagName(el.tagName)).contains(el);
		return (this.contains) ? (this != el && this.contains(el)) : !!(this.compareDocumentPosition(el) & 16);
	},

	match: function(tag){
		return (!tag || (tag == this) || (Element.get(this, 'tag') == tag));
	}

});

Native.implement([Element, Window, Document], {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != undefined && prop == undefined) prop = storage[property] = dflt;
		return $pick(prop);
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

window.addListener('unload', purge);

})();

Element.Properties = new Hash;

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

Element.Properties.html = (function(){
	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = Browser.Engine.trident && translations[this.get('tag')];
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();

if (Browser.Engine.webkit && Browser.Engine.version < 420) Element.Properties.text = {
	get: function(){
		if (this.innerText) return this.innerText;
		var temp = this.ownerDocument.newElement('div', {html: this.innerHTML}).inject(this.ownerDocument.body);
		var text = temp.innerText;
		temp.destroy();
		return text;
	}
};
/*
Script: Element.Event.js
	Contains Element methods for dealing with events, and custom Events.

License:
	MIT-style license.
*/

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

Native.implement([Element, Window, Document], {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		events[type] = events[type] || {'keys': [], 'values': []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type, custom = Element.Events.get(type), condition = fn, self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var pos = events[type].keys.indexOf(fn);
		if (pos == -1) return this;
		events[type].keys.splice(pos, 1);
		var value = events[type].values.splice(pos, 1)[0];
		var custom = Element.Events.get(type);
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		if ($type(events) == 'object'){
			for (var type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (var type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			while (attached[events].keys[0]) this.removeEvent(events, attached[events].keys[0]);
			attached[events] = null;
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		events[type].keys.each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = $(from);
		var fevents = from.retrieve('events');
		if (!fevents) return this;
		if (!type){
			for (var evType in fevents) this.cloneEvents(from, evType);
		} else if (fevents[type]){
			fevents[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 1, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

(function(){

var $check = function(event){
	var related = event.relatedTarget;
	if (related == undefined) return true;
	if (related === false) return false;
	return ($type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related));
};

Element.Events = new Hash({

	mouseenter: {
		base: 'mouseover',
		condition: $check
	},

	mouseleave: {
		base: 'mouseout',
		condition: $check
	},

	mousewheel: {
		base: (Browser.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel'
	}

});

})();
/*
Script: Element.Style.js
	Contains methods for interacting with the styles of Elements in a fashionable way.

License:
	MIT-style license.
*/

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

Element.Properties.opacity = {

	set: function(opacity, novisibility){
		if (!novisibility){
			if (opacity == 0){
				if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
			} else {
				if (this.style.visibility != 'visible') this.style.visibility = 'visible';
			}
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		this.style.opacity = opacity;
		this.store('opacity', opacity);
	},

	get: function(){
		return this.retrieve('opacity', 1);
	}

};

Element.implement({

	setOpacity: function(value){
		return this.set('opacity', value, true);
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		if ($type(value) != 'string'){
			var map = (Element.Styles.get(property) || '@').split(' ');
			value = $splat(value).map(function(val, i){
				if (!map[i]) return '';
				return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if ((Browser.Engine.presto) && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.each(arguments, function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = new Hash({
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
});

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});
/*
Script: Element.Dimensions.js
	Contains methods to work with size, scroll, or positioning of Elements and the window object.

License:
	MIT-style license.

Credits:
	- Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
	- Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).
*/

(function(){

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: function(){
		var element = this;
		if (isBody(element)) return null;
		if (!Browser.Engine.trident) return element.offsetParent;
		while ((element = element.parentNode) && !isBody(element)){
			if (styleString(element, 'position') != 'static') return element;
		}
		return null;
	},

	getOffsets: function(){		
		if (Browser.Engine.trident){
			var bound = this.getBoundingClientRect(), html = this.getDocument().documentElement;
			var isFixed = styleString(this, 'position') == 'fixed';
			return {
				x: bound.left + ((isFixed) ? 0 : html.scrollLeft) - html.clientLeft,
				y: bound.top +  ((isFixed) ? 0 : html.scrollTop)  - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.Engine.gecko){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.Engine.webkit){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.Engine.gecko && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(), scroll = this.getScrolls();
		var position = {x: offset.x - scroll.x, y: offset.y - scroll.y};
		var relativePosition = (relative && (relative = $(relative))) ? relative.getPosition() : {x: 0, y: 0};
		return {x: position.x - relativePosition.x, y: position.y - relativePosition.y};
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element), size = this.getSize();
		var obj = {left: position.x, top: position.y, width: size.x, height: size.y};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {left: obj.x - styleNumber(this, 'margin-left'), top: obj.y - styleNumber(this, 'margin-top')};
	},

	position: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});

Native.implement([Document, Window], {

	getSize: function(){
		if (Browser.Engine.presto || Browser.Engine.webkit) {
			var win = this.getWindow();
			return {x: win.innerWidth, y: win.innerHeight};
		}
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this), min = this.getSize();
		return {x: Math.max(doc.scrollWidth, min.x), y: Math.max(doc.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
};

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
	return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
};

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases

Native.implement([Window, Document, Element], {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});
/*
Script: Selectors.js
	Adds advanced CSS Querying capabilities for targeting elements. Also includes pseudoselectors support.

License:
	MIT-style license.
*/

Native.implement([Document, Element], {

	getElements: function(expression, nocash){
		expression = expression.split(',');
		var items, local = {};
		for (var i = 0, l = expression.length; i < l; i++){
			var selector = expression[i], elements = Selectors.Utils.search(this, selector, local);
			if (i != 0 && elements.item) elements = $A(elements);
			items = (i == 0) ? elements : (items.item) ? $A(items).concat(elements) : items.concat(elements);
		}
		return new Elements(items, {ddup: (expression.length > 1), cash: !nocash});
	}

});

Element.implement({

	match: function(selector){
		if (!selector || (selector == this)) return true;
		var tagid = Selectors.Utils.parseTagAndID(selector);
		var tag = tagid[0], id = tagid[1];
		if (!Selectors.Filters.byID(this, id) || !Selectors.Filters.byTag(this, tag)) return false;
		var parsed = Selectors.Utils.parseSelector(selector);
		return (parsed) ? Selectors.Utils.filter(this, parsed, {}) : true;
	}

});

var Selectors = {Cache: {nth: {}, parsed: {}}};

Selectors.RegExps = {
	id: (/#([\w-]+)/),
	tag: (/^(\w+|\*)/),
	quick: (/^(\w+|\*)$/),
	splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
	combined: (/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

Selectors.Utils = {

	chk: function(item, uniques){
		if (!uniques) return true;
		var uid = $uid(item);
		if (!uniques[uid]) return uniques[uid] = true;
		return false;
	},

	parseNthArgument: function(argument){
		if (Selectors.Cache.nth[argument]) return Selectors.Cache.nth[argument];
		var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
		if (!parsed) return false;
		var inta = parseInt(parsed[1], 10);
		var a = (inta || inta === 0) ? inta : 1;
		var special = parsed[2] || false;
		var b = parseInt(parsed[3], 10) || 0;
		if (a != 0){
			b--;
			while (b < 1) b += a;
			while (b >= a) b -= a;
		} else {
			a = b;
			special = 'index';
		}
		switch (special){
			case 'n': parsed = {a: a, b: b, special: 'n'}; break;
			case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
			case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
			case 'first': parsed = {a: 0, special: 'index'}; break;
			case 'last': parsed = {special: 'last-child'}; break;
			case 'only': parsed = {special: 'only-child'}; break;
			default: parsed = {a: (a - 1), special: 'index'};
		}

		return Selectors.Cache.nth[argument] = parsed;
	},

	parseSelector: function(selector){
		if (Selectors.Cache.parsed[selector]) return Selectors.Cache.parsed[selector];
		var m, parsed = {classes: [], pseudos: [], attributes: []};
		while ((m = Selectors.RegExps.combined.exec(selector))){
			var cn = m[1], an = m[2], ao = m[3], av = m[5], pn = m[6], pa = m[7];
			if (cn){
				parsed.classes.push(cn);
			} else if (pn){
				var parser = Selectors.Pseudo.get(pn);
				if (parser) parsed.pseudos.push({parser: parser, argument: pa});
				else parsed.attributes.push({name: pn, operator: '=', value: pa});
			} else if (an){
				parsed.attributes.push({name: an, operator: ao, value: av});
			}
		}
		if (!parsed.classes.length) delete parsed.classes;
		if (!parsed.attributes.length) delete parsed.attributes;
		if (!parsed.pseudos.length) delete parsed.pseudos;
		if (!parsed.classes && !parsed.attributes && !parsed.pseudos) parsed = null;
		return Selectors.Cache.parsed[selector] = parsed;
	},

	parseTagAndID: function(selector){
		var tag = selector.match(Selectors.RegExps.tag);
		var id = selector.match(Selectors.RegExps.id);
		return [(tag) ? tag[1] : '*', (id) ? id[1] : false];
	},

	filter: function(item, parsed, local){
		var i;
		if (parsed.classes){
			for (i = parsed.classes.length; i--; i){
				var cn = parsed.classes[i];
				if (!Selectors.Filters.byClass(item, cn)) return false;
			}
		}
		if (parsed.attributes){
			for (i = parsed.attributes.length; i--; i){
				var att = parsed.attributes[i];
				if (!Selectors.Filters.byAttribute(item, att.name, att.operator, att.value)) return false;
			}
		}
		if (parsed.pseudos){
			for (i = parsed.pseudos.length; i--; i){
				var psd = parsed.pseudos[i];
				if (!Selectors.Filters.byPseudo(item, psd.parser, psd.argument, local)) return false;
			}
		}
		return true;
	},

	getByTagAndID: function(ctx, tag, id){
		if (id){
			var item = (ctx.getElementById) ? ctx.getElementById(id, true) : Element.getElementById(ctx, id, true);
			return (item && Selectors.Filters.byTag(item, tag)) ? [item] : [];
		} else {
			return ctx.getElementsByTagName(tag);
		}
	},

	search: function(self, expression, local){
		var splitters = [];

		var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
			splitters.push(m1);
			return ':)' + m2;
		}).split(':)');

		var items, filtered, item;

		for (var i = 0, l = selectors.length; i < l; i++){

			var selector = selectors[i];

			if (i == 0 && Selectors.RegExps.quick.test(selector)){
				items = self.getElementsByTagName(selector);
				continue;
			}

			var splitter = splitters[i - 1];

			var tagid = Selectors.Utils.parseTagAndID(selector);
			var tag = tagid[0], id = tagid[1];

			if (i == 0){
				items = Selectors.Utils.getByTagAndID(self, tag, id);
			} else {
				var uniques = {}, found = [];
				for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
				items = found;
			}

			var parsed = Selectors.Utils.parseSelector(selector);

			if (parsed){
				filtered = [];
				for (var m = 0, n = items.length; m < n; m++){
					item = items[m];
					if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
				}
				items = filtered;
			}

		}

		return items;

	}

};

Selectors.Getters = {

	' ': function(found, self, tag, id, uniques){
		var items = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = items.length; i < l; i++){
			var item = items[i];
			if (Selectors.Utils.chk(item, uniques)) found.push(item);
		}
		return found;
	},

	'>': function(found, self, tag, id, uniques){
		var children = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = children.length; i < l; i++){
			var child = children[i];
			if (child.parentNode == self && Selectors.Utils.chk(child, uniques)) found.push(child);
		}
		return found;
	},

	'+': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (Selectors.Utils.chk(self, uniques) && Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
				break;
			}
		}
		return found;
	},

	'~': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (!Selectors.Utils.chk(self, uniques)) break;
				if (Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
			}
		}
		return found;
	}

};

Selectors.Filters = {

	byTag: function(self, tag){
		return (tag == '*' || (self.tagName && self.tagName.toLowerCase() == tag));
	},

	byID: function(self, id){
		return (!id || (self.id && self.id == id));
	},

	byClass: function(self, klass){
		return (self.className && self.className.contains(klass, ' '));
	},

	byPseudo: function(self, parser, argument, local){
		return parser.call(self, argument, local);
	},

	byAttribute: function(self, name, operator, value){
		var result = Element.prototype.getProperty.call(self, name);
		if (!result) return (operator == '!=');
		if (!operator || value == undefined) return true;
		switch (operator){
			case '=': return (result == value);
			case '*=': return (result.contains(value));
			case '^=': return (result.substr(0, value.length) == value);
			case '$=': return (result.substr(result.length - value.length) == value);
			case '!=': return (result != value);
			case '~=': return result.contains(value, ' ');
			case '|=': return result.contains(value, '-');
		}
		return false;
	}

};

Selectors.Pseudo = new Hash({

	// w3c pseudo selectors

	checked: function(){
		return this.checked;
	},
	
	empty: function(){
		return !(this.innerText || this.textContent || '').length;
	},

	not: function(selector){
		return !Element.match(this, selector);
	},

	contains: function(text){
		return (this.innerText || this.textContent || '').contains(text);
	},

	'first-child': function(){
		return Selectors.Pseudo.index.call(this, 0);
	},

	'last-child': function(){
		var element = this;
		while ((element = element.nextSibling)){
			if (element.nodeType == 1) return false;
		}
		return true;
	},

	'only-child': function(){
		var prev = this;
		while ((prev = prev.previousSibling)){
			if (prev.nodeType == 1) return false;
		}
		var next = this;
		while ((next = next.nextSibling)){
			if (next.nodeType == 1) return false;
		}
		return true;
	},

	'nth-child': function(argument, local){
		argument = (argument == undefined) ? 'n' : argument;
		var parsed = Selectors.Utils.parseNthArgument(argument);
		if (parsed.special != 'n') return Selectors.Pseudo[parsed.special].call(this, parsed.a, local);
		var count = 0;
		local.positions = local.positions || {};
		var uid = $uid(this);
		if (!local.positions[uid]){
			var self = this;
			while ((self = self.previousSibling)){
				if (self.nodeType != 1) continue;
				count ++;
				var position = local.positions[$uid(self)];
				if (position != undefined){
					count = position + count;
					break;
				}
			}
			local.positions[uid] = count;
		}
		return (local.positions[uid] % parsed.a == parsed.b);
	},

	// custom pseudo selectors

	index: function(index){
		var element = this, count = 0;
		while ((element = element.previousSibling)){
			if (element.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	even: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n+1', local);
	},

	odd: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n', local);
	},
	
	selected: function() {
		return this.selected;
	}

});
/*
Script: Domready.js
	Contains the domready custom event.

License:
	MIT-style license.
*/

Element.Events.domready = {

	onAdd: function(fn){
		if (Browser.loaded) fn.call(this);
	}

};

(function(){

	var domready = function(){
		if (Browser.loaded) return;
		Browser.loaded = true;
		window.fireEvent('domready');
		document.fireEvent('domready');
	};

	if (Browser.Engine.trident){
		var temp = document.createElement('div');
		(function(){
			($try(function(){
				temp.doScroll('left');
				return $(temp).inject(document.body).set('html', 'temp').dispose();
			})) ? domready() : arguments.callee.delay(50);
		})();
	} else if (Browser.Engine.webkit && Browser.Engine.version < 525){
		(function(){
			(['loaded', 'complete'].contains(document.readyState)) ? domready() : arguments.callee.delay(50);
		})();
	} else {
		window.addEvent('load', domready);
		document.addEvent('DOMContentLoaded', domready);
	}

})();
/*
Script: JSON.js
	JSON encoder and decoder.

License:
	MIT-style license.

See Also:
	<http://www.json.org/>
*/

var JSON = new Hash({

	$specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

	$replaceChars: function(chr){
		return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	},

	encode: function(obj){
		switch ($type(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.encode).filter($defined)) + ']';
			case 'object': case 'hash':
				var string = [];
				Hash.each(obj, function(value, key){
					var json = JSON.encode(value);
					if (json) string.push(JSON.encode(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case false: return 'null';
		}
		return null;
	},

	decode: function(string, secure){
		if ($type(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}

});

Native.implement([Hash, Array, String, Number], {

	toJSON: function(){
		return JSON.encode(this);
	}

});
/*
Script: Cookie.js
	Class for creating, loading, and saving browser Cookies.

License:
	MIT-style license.

Credits:
	Based on the functions by Peter-Paul Koch (http://quirksmode.org).
*/

var Cookie = new Class({

	Implements: Options,

	options: {
		path: false,
		domain: false,
		duration: false,
		secure: false,
		document: document
	},

	initialize: function(key, options){
		this.key = key;
		this.setOptions(options);
	},

	write: function(value){
		value = encodeURIComponent(value);
		if (this.options.domain) value += '; domain=' + this.options.domain;
		if (this.options.path) value += '; path=' + this.options.path;
		if (this.options.duration){
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) value += '; secure';
		this.options.document.cookie = this.key + '=' + value;
		return this;
	},

	read: function(){
		var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function(){
		new Cookie(this.key, $merge(this.options, {duration: -1})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options){
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
	return new Cookie(key, options).dispose();
};
/*
Script: Swiff.js
	Wrapper for embedding SWF movies. Supports (and fixes) External Interface Communication.

License:
	MIT-style license.

Credits:
	Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.
*/

var Swiff = new Class({

	Implements: [Options],

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'transparent',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + $time();

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = $(options.container);

		Swiff.CallBacks[this.instance] = {};

		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = $extend({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Hash.toQueryString(vars);
		if (Browser.Engine.trident){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
			properties.data = path;
		}
		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = $(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		$(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].extend(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};
/*
Script: Fx.js
	Contains the basic animation logic to be extended by all other Fx Classes.

License:
	MIT-style license.
*/

var Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: $empty,
		onCancel: $empty,
		onComplete: $empty,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
		this.options.duration = Fx.Durations[this.options.duration] || this.options.duration.toInt();
		var wait = this.options.wait;
		if (wait === false) this.options.link = 'cancel';
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = $time();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = $time() - this.time;
		this.timer = $clear(this.timer);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = $time() - this.time;
		this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};
/*
Script: Fx.CSS.js
	Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

License:
	MIT-style license.
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = $lambda(value)();
		value = (typeof value == 'string') ? value.split(' ') : $splat(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Fx.CSS.Parsers.each(function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if ($chk(parsed)) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = {name: 'fx:css:value'};
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if ($type(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = new Hash({

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: $lambda(false),
		compute: $arguments(1),
		serve: $arguments(0)
	}

});
/*
Script: Fx.Tween.js
	Formerly Fx.Style, effect to transition any CSS property for an element.

License:
	MIT-style license.
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = $(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		var tween = this.retrieve('tween');
		if (tween) tween.cancel();
		return this.eliminate('tween').store('tween:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('tween')){
			if (options || !this.retrieve('tween:options')) this.set('tween', options);
			this.store('tween', new Fx.Tween(this, this.retrieve('tween:options')));
		}
		return this.retrieve('tween');
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = $pick(how, 'toggle');
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});
/*
Script: Fx.Morph.js
	Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

License:
	MIT-style license.
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = $(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		var morph = this.retrieve('morph');
		if (morph) morph.cancel();
		return this.eliminate('morph').store('morph:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('morph')){
			if (options || !this.retrieve('morph:options')) this.set('morph', options);
			this.store('morph', new Fx.Morph(this, this.retrieve('morph:options')));
		}
		return this.retrieve('morph');
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});
/*
Script: Fx.Transitions.js
	Contains a set of advanced transitions to be used with any of the Fx Classes.

License:
	MIT-style license.

Credits:
	Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = $splat(params);
	return $extend(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = new Hash({

	linear: $arguments(0)

});

Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});
/*
Script: Request.js
	Powerful all purpose Request Class. Uses XMLHTTPRequest.

License:
	MIT-style license.
*/

var Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: $empty,
		onComplete: $empty,
		onCancel: $empty,
		onSuccess: $empty,
		onFailure: $empty,
		onException: $empty,*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.headers = new Hash(this.options.headers);
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		$try(function(){
			this.status = this.xhr.status;
		}.bind(this));
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: this.xhr.responseText, xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
		this.xhr.onreadystatechange = $empty;
	},

	isSuccess: function(){
		return ((this.status >= 200) && (this.status < 300));
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return $exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers.set(name, value);
		return this;
	},

	getHeader: function(name){
		return $try(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;
		this.running = true;

		var type = $type(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = $extend({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = options.url, method = options.method;

		switch ($type(data)){
			case 'element': data = $(data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && ['put', 'delete'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}

		if(this.options.noCache) {
			var noCache = "noCache=" + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}


		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}


		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		this.headers.each(function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = $empty;
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

(function(){

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(){
		var params = Array.link(arguments, {url: String.type, data: $defined});
		return this.send($extend(params, {method: method.toLowerCase()}));
	};
});

Request.implement(methods);

})();/*
Script: Request.HTML.js
	Extends the basic Request Class with additional methods for interacting with HTML responses.

License:
	MIT-style license.
*/

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		append: false,
		evalScripts: true,
		filter: false
	},

	processHTML: function(text){
		var match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		text = (match) ? match[1] : text;

		var container = new Element('div');

		return $try(function(){
			var root = '<root>' + text + '</root>', doc;
			if (Browser.Engine.trident){
				doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = false;
				doc.loadXML(root);
			} else {
				doc = new DOMParser().parseFromString(root, 'text/xml');
			}
			root = doc.getElementsByTagName('root')[0];
			if (!root) return;
			for (var i = 0, k = root.childNodes.length; i < k; i++){
				var child = Element.clone(root.childNodes[i], true, true);
				if (child) container.grab(child);
			}
			return container;
		}) || container.set('html', text);
	},

	success: function(text){
		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		});

		var temp = this.processHTML(response.html);

		response.tree = temp.childNodes;
		response.elements = temp.getElements('*');

		if (options.filter) response.tree = response.elements.filter(options.filter);
		if (options.update) $(options.update).empty().set('html', response.html);
		else if (options.append) $(options.append).adopt(temp.getChildren());
		if (options.evalScripts) $exec(response.javascript);

		this.onSuccess(response.tree, response.elements, response.html, response.javascript);
	}

});

Element.Properties.send = {

	set: function(options){
		var send = this.retrieve('send');
		if (send) send.cancel();
		return this.eliminate('send').store('send:options', $extend({
			data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
		}, options));
	},

	get: function(options){
		if (options || !this.retrieve('send')){
			if (options || !this.retrieve('send:options')) this.set('send', options);
			this.store('send', new Request(this.retrieve('send:options')));
		}
		return this.retrieve('send');
	}

};

Element.Properties.load = {

	set: function(options){
		var load = this.retrieve('load');
		if (load) load.cancel();
		return this.eliminate('load').store('load:options', $extend({data: this, link: 'cancel', update: this, method: 'get'}, options));
	},

	get: function(options){
		if (options || ! this.retrieve('load')){
			if (options || !this.retrieve('load:options')) this.set('load', options);
			this.store('load', new Request.HTML(this.retrieve('load:options')));
		}
		return this.retrieve('load');
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	},

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Object.type, url: String.type}));
		return this;
	}

});
/*
Script: Request.JSON.js
	Extends the basic Request Class with additional methods for sending and receiving JSON data.

License:
	MIT-style license.
*/

Request.JSON = new Class({

	Extends: Request,

	options: {
		secure: true
	},

	initialize: function(options){
		this.parent(options);
		this.headers.extend({'Accept': 'application/json', 'X-Request': 'JSON'});
	},

	success: function(text){
		this.response.json = JSON.decode(text, this.options.secure);
		this.onSuccess(this.response.json, text);
	}

});
MooTools.More = {
	'version': '1.2.2.1'
};/*
Script: MooTools.Lang.js
	Provides methods for localization.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){

	var data = {
		language: 'en-US',
		languages: {
			'en-US': {}
		},
		cascades: ['en-US']
	};
	
	var cascaded;

	MooTools.lang = new Events();

	$extend(MooTools.lang, {

		setLanguage: function(lang){
			if (!data.languages[lang]) return this;
			data.language = lang;
			this.load();
			this.fireEvent('langChange', lang);
			return this;
		},

		load: function() {
			var langs = this.cascade(this.getCurrentLanguage());
			cascaded = {};
			$each(langs, function(set, setName){
				cascaded[setName] = this.lambda(set);
			}, this);
		},

		getCurrentLanguage: function(){
			return data.language;
		},

		addLanguage: function(lang){
			data.languages[lang] = data.languages[lang] || {};
			return this;
		},

		cascade: function(lang){
			var cascades = (data.languages[lang] || {}).cascades || [];
			cascades.combine(data.cascades);
			cascades.erase(lang).push(lang);
			var langs = cascades.map(function(lng){
				return data.languages[lng];
			}, this);
			return $merge.apply(this, langs);
		},

		lambda: function(set) {
			(set || {}).get = function(key, args){
				return $lambda(set[key]).apply(this, $splat(args));
			};
			return set;
		},

		get: function(set, key, args){
			if (cascaded && cascaded[set]) return (key ? cascaded[set].get(key, args) : cascaded[set]);
		},

		set: function(lang, set, members){
			this.addLanguage(lang);
			langData = data.languages[lang];
			if (!langData[set]) langData[set] = {};
			$extend(langData[set], members);
			if (lang == this.getCurrentLanguage()){
				this.load();
				this.fireEvent('langChange', lang);
			}
			return this;
		},

		list: function(){
			return Hash.getKeys(data.languages);
		}

	});

})();/*
Script: Log.js
	Provides basic logging functionality for plugins to implement.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

var Log = new Class({
	
	log: function(){
		Log.logger.call(this, arguments);
	}
	
});

Log.logged = [];

Log.logger = function(){
	if(window.console && console.log) console.log.apply(console, arguments);
	else Log.logged.push(arguments);
};/*
Script: Class.Refactor.js
	Extends a class onto itself with new property, preserving any items attached to the class's namespace.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.refactor = function(original, refactors){

	$each(refactors, function(item, name){
		var origin = original.prototype[name];
		if (origin && (origin = origin._origin) && typeof item == 'function') original.implement(name, function(){
			var old = this.previous;
			this.previous = origin;
			var value = item.apply(this, arguments);
			this.previous = old;
			return value;
		}); else original.implement(name, item);
	});

	return original;

};/*
Script: Class.Binds.js
	Automagically binds specified methods in a class to the instance of the class.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.Mutators.Binds = function(binds){
    return binds;
};

Class.Mutators.initialize = function(initialize){
	return function(){
		$splat(this.Binds).each(function(name){
			var original = this[name];
			if (original) this[name] = original.bind(this);
		}, this);
		return initialize.apply(this, arguments);
	};
};/*
Script: Class.Occlude.js
	Prevents a class from being applied to a DOM element twice.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.Occlude = new Class({

	occlude: function(property, element){
		element = $(element || this.element);
		var instance = element.retrieve(property || this.property);
		if (instance && !$defined(this.occluded)){
			this.occluded = instance;
		} else {
			this.occluded = false;
			element.store(property || this.property, this);
		}
		return this.occluded;
	}

});/*
Script: Chain.Wait.js
	Adds a method to inject pauses between chained events.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){

	var wait = {
		wait: function(duration){
			return this.chain(function(){
				this.callChain.delay($pick(duration, 500), this);
			}.bind(this));
		}
	};

	Chain.implement(wait);

	if (window.Fx){
		Fx.implement(wait);
		['Css', 'Tween', 'Elements'].each(function(cls){
			if (Fx[cls]) Fx[cls].implement(wait);
		});
	}

	try {
		Element.implement({
			chains: function(effects){
				$splat($pick(effects, ['tween', 'morph', 'reveal'])).each(function(effect){
					effect = this.get(effect);
					if (!effect) return;
					effect.setOptions({
						link:'chain'
					});
				}, this);
				return this;
			},
			pauseFx: function(duration, effect){
				this.chains(effect).get($pick(effect, 'tween')).wait(duration);
				return this;
			}
		});
	} catch(e){}

})();/*
Script: Array.Extras.js
	Extends the Array native object to include useful methods to work with arrays.

	License:
		MIT-style license.

	Authors:
		Christoph Pojer

*/
Array.implement({

	min: function(){
		return Math.min.apply(null, this);
	},

	max: function(){
		return Math.max.apply(null, this);
	},

	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},

	sum: function(){
		var result = 0, l = this.length;
		if (l){
			do {
				result += this[--l];
			} while (l);
		}
		return result;
	},

	unique: function(){
		return [].combine(this);
	}

});/*
Script: Date.js
	Extends the Date native object to include methods useful in managing dates.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
		Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
		Harald Kirshner - mail [at] digitarald.de; http://digitarald.de

*/

(function(){

new Native({name: 'Date', initialize: Date, protect: true});

['now','parse','UTC'].each(function(method){
	Native.genericize(Date, method, true);
});

Date.Methods = {};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

$each({
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
}, function(value, key){
	Date.Methods[key] = value;
});

var zeroize = function(what, length){
	return '0'.repeat(length - what.toString().length) + what;
};

Date.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				prop = prop.toLowerCase();
				var m = Date.Methods;
				if (m[prop]) this['set' + m[prop]](value);
		}
		return this;
	},

	get: function(key){
		key = key.toLowerCase();
		var m = Date.Methods;
		if (m[key]) return this['get' + m[key]]();
		return null;
	},

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		return this.multiply(interval, times);
	},

	decrement: function(interval, times){
		return this.multiply(interval, times, false);
	},

	multiply: function(interval, times, increment){
		interval = interval || 'day';
		times = $pick(times, 1);
		increment = $pick(increment, true);
		var multiplier = increment ? 1 : -1;
		var month = this.format('%m').toInt() - 1;
		var year = this.format('%Y').toInt();
		var time = this.get('time');
		var offset = 0;
		switch (interval) {
				case 'year':
					times.times(function(val) {
						if (Date.isLeapYear(year+val) && month > 1 && multiplier > 0) val++;
						if (Date.isLeapYear(year+val) && month <= 1 && multiplier < 0) val--;
						offset += Date.units.year(year+val);
					});
					break;
				case 'month':
					times.times(function(val){
						if (multiplier < 0) val++;
						var mo = month+(val * multiplier);
						var year = year;
						if (mo < 0) {
							year--;
							mo = 12+mo;
						}
						if (mo > 11 || mo < 0) {
							year += (mo / 12).toInt() * multiplier;
							mo = mo % 12;
						}
						offset += Date.units.month(mo, year);
					});
					break;
				case 'day':
					return this.set('date', this.get('date')+(multiplier*times));
				default:
					offset = Date.units[interval]() * times;
					break;
		}
		this.set('time', time + (offset * multiplier));
		return this;
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		['hr', 'min', 'sec', 'ms'].each(function(t){
			this.set(t, 0);
		}, this);
		return this;
	},

	diff: function(d, resolution){
		resolution = resolution || 'day';
		if ($type(d) == 'string') d = Date.parse(d);
		switch (resolution){
			case 'year':
				return d.format('%Y').toInt() - this.format('%Y').toInt();
				break;
			case 'month':
				var months = (d.format('%Y').toInt() - this.format('%Y').toInt())*12;
				return months + d.format('%m').toInt() - this.format('%m').toInt();
				break;
			default:
				var diff = d.get('time') - this.get('time');
				if (diff < 0 && Date.units[resolution]() > (-1*(diff))) return 0;
				else if (diff >= 0 && diff < Date.units[resolution]()) return 0;
				return ((d.get('time') - this.get('time')) / Date.units[resolution]()).round();
		}
		return null;
	},

	getWeek: function(){
		var day = (new Date(this.get('year'), 0, 1)).get('date');
		return Math.round((this.get('dayofyear') + (day > 3 ? day - 4 : day + 3)) / 7);
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : ' + ')
			+ zeroize(Math.floor(Math.abs(off) / 60), 2)
			+ zeroize(off % 60, 2);
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date) {
		return !!(date || this).valueOf();
	},

	format: function(f){
		if (!this.isValid()) return 'invalid date';
		f = f || '%x %X';
		//replace short-hand with actual format
		f = ({
			db: '%Y-%m-%d %H:%M:%S',
			compact: '%Y%m%dT%H%M%S',
			iso8601: '%Y-%m-%dT%H:%M:%S%T',
			rfc822: '%a, %d %b %Y %H:%M:%S %Z',
			'short': '%d %b %H:%M',
			'long': '%B %d, %Y %H:%M'
		})[f.toLowerCase()] || f;
		var d = this;
		return f.replace(/\%([aAbBcdHIjmMpSUWwxXyYTZ\%])/g,
			function($1, $2){
				switch ($2){
					case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.toString();
					case 'd': return zeroize(d.get('date'), 2);
					case 'H': return zeroize(d.get('hr'), 2);
					case 'I': return ((d.get('hr') % 12) || 12);
					case 'j': return zeroize(d.get('dayofyear'), 3);
					case 'm': return zeroize((d.get('mo') + 1), 2);
					case 'M': return zeroize(d.get('min'), 2);
					case 'p': return Date.getMsg(d.get('hr') < 12 ? 'AM' : 'PM');
					case 'S': return zeroize(d.get('seconds'), 2);
					case 'U': return zeroize(d.get('week'), 2);
					case 'W': throw new Error('%W is not supported yet');
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'T': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
					case '%': return '%';
				}
				return $2;
			}
		);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		if (this.format('%H').toInt() > 11 && ampm == 'AM')
			return this.decrement('hour', 12);
		else if (this.format('%H').toInt() < 12 && ampm == 'PM')
			return this.increment('hour', 12);
		return this;
	}

});

Date.alias('diff', 'compare');
Date.alias('format', 'strftime');

var nativeParse = Date.parse;

var daysInMonth = function(monthIndex, year){
	if (Date.isLeapYear(year.toInt()) && monthIndex === 1) return 29;
	return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
};


$extend(Date, {

	getMsg: function(key, args) {
		return MooTools.lang.get('Date', key, args);
	},

	units: {
		ms: $lambda(1),
		second: $lambda(1000),
		minute: $lambda(60000),
		hour: $lambda(3600000),
		day: $lambda(86400000),
		week: $lambda(608400000),
		month: function(monthIndex, year){
			var d = new Date();
			return daysInMonth($pick(monthIndex,d.format('%m').toInt()), $pick(year,d.format('%Y').toInt())) * 86400000;
		},
		year: function(year){
			year = year || new Date().format('%Y').toInt();
			return Date.isLeapYear(year.toInt()) ? 31622400000 : 31536000000;
		}
	},

	isLeapYear: function(yr){
		return new Date(yr , 1, 29).getDate() == 29;
	},

	fixY2K: function(d){
		if (!isNaN(d)){
			var newDate = new Date(d);
			if (newDate.get('year') < 2000 && d.toString().indexOf(newDate.get('year')) < 0) newDate.increment('year', 100);
			return newDate;
		} else {
			return d;
		}
	},

	parse: function(from){
		var t = $type(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		if (!from.length) return null;
		var parsed;
		Date.parsePatterns.each(function(pattern, i){
			if (parsed) return;
			var r = pattern.re.exec(from);
			if (r) parsed = pattern.handler(r);
		});
		return parsed || new Date(nativeParse(from));
	},

	parseDay: function(day, num){
		var ret = -1;
		switch ($type(day)){
			case 'number':
				ret = Date.getMsg('days')[day - 1] || false;
				if (!ret) throw new Error('Invalid day index value must be between 1 and 7');
				break;
			case 'string':
				var match = Date.getMsg('days').filter(function(name){
					return this.test(name);
				}, new RegExp('^' + day, 'i'));
				if (!match.length) throw new Error('Invalid day string');
				if (match.length > 1) throw new Error('Ambiguous day');
				ret = match[0];
		}
		return (num) ? Date.getMsg('days').indexOf(ret) : ret;
	},

	parseMonth: function(month, num){
		var ret = -1;
		switch ($type(month)){
			case 'object':
				ret = Date.getMsg('months')[month.get('mo')];
				break;
			case 'number':
				ret = Date.getMsg('months')[month - 1] || false;
				if (!ret) throw new Error('Invalid month index value must be between 1 and 12:' + index);
				break;
			case 'string':
				var match = Date.getMsg('months').filter(function(name){
					return this.test(name);
				}, new RegExp('^' + month, 'i'));
				if (!match.length) throw new Error('Invalid month string');
				if (match.length > 1) throw new Error('Ambiguous month');
				ret = match[0];
		}
		return (num) ? Date.getMsg('months').indexOf(ret) : ret;
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(localDate.get('year'), localDate.get('mo'),
		localDate.get('date'), localDate.get('hr'), localDate.get('min'), localDate.get('sec'));
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	parsePatterns: [
		{
			//"1999-12-31"
			re: /^(\d{4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})$/,
			handler: function(bits){
				return new Date(bits[1], bits[2] - 1, bits[3]);
			}
		},
		{
			//"1999-12-31 23:59:59"
			re: /^(\d{4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})\s(\d{1,2}):(\d{1,2})(?:\:(\d{1,2}))?(\w{2})?$/,
			handler: function(bits){
				var d = new Date(bits[1], bits[2] - 1, bits[3]);
				d.set('hr', bits[4]);
				d.set('min', bits[5]);
				d.set('sec', bits[6] || 0);
				if (bits[7]) d.set('ampm', bits[7]);
				return d;
			}
		},
		{
			//"12.31.08", "12-31-08", "12/31/08", "12.31.2008", "12-31-2008", "12/31/2008"
			re: /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})$/,
			handler: function(bits){
				var d = new Date(bits[Date.orderIndex('year')],
								 bits[Date.orderIndex('month')] - 1,
								 bits[Date.orderIndex('date')]);
				return Date.fixY2K(d);
			}
		},
		//"12.31.08", "12-31-08", "12/31/08", "12.31.2008", "12-31-2008", "12/31/2008"
		//above plus "10:45pm" ex: 12.31.08 10:45pm
		{
			re: /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})\s(\d{1,2})[:\.](\d{1,2})(?:[\:\.](\d{1,2}))?(\w{2})?$/,
			handler: function(bits){
				var d = new Date(bits[Date.orderIndex('year')],
								 bits[Date.orderIndex('month')] - 1,
								 bits[Date.orderIndex('date')]);
				d.set('hr', bits[4]);
				d.set('min', bits[5]);
				d.set('sec', bits[6] || 0);
				if (bits[7]) d.set('ampm', bits[7]);
				return Date.fixY2K(d);
			}
		}
	]

});

})();/*
Script: Date.Extras.js
	Extends the Date native object to include extra methods (on top of those in Date.js).

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

['LastDayOfMonth', 'Ordinal'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});


Date.implement({

	timeDiffInWords: function(relative_to){
		return Date.distanceOfTimeInWords(this, relative_to || new Date);
	},

	getOrdinal: function(dayOfMonth){
		return Date.getMsg('ordinal', dayOfMonth || this.get('date'));
	},

	getDayOfYear: function(){
		return ((Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 1, 0, 0, 0)
			- Date.UTC(this.getFullYear(), 0, 1, 0, 0, 0) ) / Date.units.day());
	},

	getLastDayOfMonth: function(){
		var ret = this.clone();
		ret.setMonth(ret.getMonth() + 1, 0);
		return ret.getDate();
	}

});

Date.alias('timeDiffInWords', 'timeAgoInWords');

$extend(Date, {

	distanceOfTimeInWords: function(fromTime, toTime){
		return this.getTimePhrase(((toTime.getTime() - fromTime.getTime()) / 1000).toInt(), fromTime, toTime);
	},

	getTimePhrase: function(delta, fromTime, toTime){
		var getPhrase = function(){
			var suffix;
			if (delta >= 0){
				suffix = 'Ago';
			} else {
				delta = delta * -1;
				suffix = 'Until';
			}
			if (delta < 60){
				return Date.getMsg('lessThanMinute' + suffix, delta);
			} else if (delta < 120){
				return Date.getMsg('minute' + suffix, delta);
			} else if (delta < (45 * 60)){
				delta = (delta / 60).round();
				return Date.getMsg('minutes' + suffix, delta);
			} else if (delta < (90 * 60)){
				return Date.getMsg('hour' + suffix, delta);
			} else if (delta < (24 * 60 * 60)){
				delta = (delta / 3600).round();
				return Date.getMsg('hours' + suffix, delta);
			} else if (delta < (48 * 60 * 60)){
				return Date.getMsg('day' + suffix, delta);
			} else {
				delta = (delta / 86400).round();
				return Date.getMsg('days' + suffix, delta);
			}
		};
		return getPhrase().substitute({delta: delta});
	}

});


Date.parsePatterns.extend([

	{
		// yyyy-mm-ddTHH:MM:SS-0500 (ISO8601) i.e.2007-04-17T23:15:22Z
		// inspired by: http://delete.me.uk/2005/03/iso8601.html
		re: /^(\d{4})(?:-?(\d{2})(?:-?(\d{2})(?:[T ](\d{2})(?::?(\d{2})(?::?(\d{2})(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d{2})(?::?(\d{2}))?)?)?)?)?)?$/,
		handler: function(bits){
			var offset = 0;
			var d = new Date(bits[1], 0, 1);
			if (bits[3]) d.set('date', bits[3]);
			if (bits[2]) d.set('mo', bits[2] - 1);
			if (bits[4]) d.set('hr', bits[4]);
			if (bits[5]) d.set('min', bits[5]);
			if (bits[6]) d.set('sec', bits[6]);
			if (bits[7]) d.set('ms', ('0.' + bits[7]).toInt() * 1000);
			if (bits[9]){
				offset = (bits[9].toInt() * 60) + bits[10].toInt();
				offset *= ((bits[8] == '-') ? 1 : -1);
			}
			//offset -= d.getTimezoneOffset();
			d.setTime((d * 1) + (offset * 60 * 1000).toInt());
			return d;
		}
	},

	{
		//"today"
		re: /^tod/i,
		handler: function(){
			return new Date();
		}
	},

	{
		//"tomorow"
		re: /^tom/i,
		handler: function(){
			return new Date().increment();
		}
	},

	{
		//"yesterday"
		re: /^yes/i,
		handler: function(){
			return new Date().decrement();
		}
	},

	{
		//4th, 23rd
		re: /^(\d{1,2})(st|nd|rd|th)?$/i,
		handler: function(bits){
			var d = new Date();
			d.set('date', bits[1].toInt());
			return d;
		}
	},

	{
		//4th Jan, 23rd May
		re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+)$/i,
		handler: function(bits){
			var d = new Date();
			d.set('mo', Date.parseMonth(bits[2], true), bits[1].toInt());
			return d;
		}
	},

	{
		//4th Jan 2000, 23rd May 2004
		re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+),? (\d{4})$/i,
		handler: function(bits){
			var d = new Date();
			d.set('mo', Date.parseMonth(bits[2], true), bits[1].toInt());
			d.setYear(bits[3]);
			return d;
		}
	},

	{
		//Jan 4th
		re: /^(\w+) (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/i,
		handler: function(bits){
			var d = new Date();
			d.set('mo', Date.parseMonth(bits[1], true), bits[2].toInt());
			d.setYear(bits[3]);
			return d;
		}
	},

	{
		//Jan 4th 2003
		re: /^next (\w+)$/i,
		handler: function(bits){
			var d = new Date();
			var day = d.getDay();
			var newDay = Date.parseDay(bits[1], true);
			var addDays = newDay - day;
			if (newDay <= day){
				addDays += 7;
			}
			d.set('date', d.getDate() + addDays);
			return d;
		}
	},

	{
		//4 May 08:12
		re: /^\d+\s[a-zA-z]..\s\d.\:\d.$/,
		handler: function(bits){
			var d = new Date();
			bits = bits[0].split(' ');
			d.set('date', bits[0]);
			var m;
			Date.getMsg('months').each(function(mo, i){
				if (new RegExp('^' + bits[1]).test(mo)) m = i;
			});
			d.set('mo', m);
			d.set('hr', bits[2].split(':')[0]);
			d.set('min', bits[2].split(':')[1]);
			d.set('ms', 0);
			return d;
		}
	},

	{
		re: /^last (\w+)$/i,
		handler: function(bits){
			return Date.parse('next ' + bits[0]).decrement('day', 7);
		}
	}

]);/*
Script: Hash.Extras.js
	Extends the Hash native object to include getFromPath which allows a path notation to child elements.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Hash.implement({

	getFromPath: function(notation){
		var source = this.getClean();
		notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
			if (!source) return null;
			var prop = arguments[2] || arguments[1] || arguments[0];
			source = (prop in source) ? source[prop] : null;
			return match;
		});
		return source;
	},

	cleanValues: function(method){
		method = method || $defined;
		this.each(function(v, k){
			if (!method(v)) this.erase(k);
		}, this);
		return this;
	},

	run: function(){
		var args = arguments;
		this.each(function(v, k){
			if ($type(v) == 'function') v.run(args);
		});
	}

});/*
Script: String.Extras.js
	Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

	License:
		MIT-style license.

	Authors:
		Aaron Newton
		Guillermo Rauch

*/

(function(){
  
var special = ['À','à','Á','á','Â','â','Ã','ã','Ä','ä','Å','å','Ă','ă','Ą','ą','Ć','ć','Č','č','Ç','ç', 'Ď','ď','Đ','đ', 'È','è','É','é','Ê','ê','Ë','ë','Ě','ě','Ę','ę', 'Ğ','ğ','Ì','ì','Í','í','Î','î','Ï','ï', 'Ĺ','ĺ','Ľ','ľ','Ł','ł', 'Ñ','ñ','Ň','ň','Ń','ń','Ò','ò','Ó','ó','Ô','ô','Õ','õ','Ö','ö','Ø','ø','ő','Ř','ř','Ŕ','ŕ','Š','š','Ş','ş','Ś','ś', 'Ť','ť','Ť','ť','Ţ','ţ','Ù','ù','Ú','ú','Û','û','Ü','ü','Ů','ů', 'Ÿ','ÿ','ý','Ý','Ž','ž','Ź','ź','Ż','ż', 'Þ','þ','Ð','ð','ß','Œ','œ','Æ','æ','µ'];

var standard = ['A','a','A','a','A','a','A','a','Ae','ae','A','a','A','a','A','a','C','c','C','c','C','c','D','d','D','d', 'E','e','E','e','E','e','E','e','E','e','E','e','G','g','I','i','I','i','I','i','I','i','L','l','L','l','L','l', 'N','n','N','n','N','n', 'O','o','O','o','O','o','O','o','Oe','oe','O','o','o', 'R','r','R','r', 'S','s','S','s','S','s','T','t','T','t','T','t', 'U','u','U','u','U','u','Ue','ue','U','u','Y','y','Y','y','Z','z','Z','z','Z','z','TH','th','DH','dh','ss','OE','oe','AE','ae','u'];

var tidymap = {
	"[\xa0\u2002\u2003\u2009]": " ",
	"\xb7": "*",
	"[\u2018\u2019]": "'",
	"[\u201c\u201d]": '"',
	"\u2026": "...",
	"\u2013": "-",
	"\u2014": "--",
	"\uFFFD": "&raquo;"
};

String.implement({

	standardize: function(){
		var text = this;
		special.each(function(ch, i){
			text = text.replace(new RegExp(ch, 'g'), standard[i]);
		});
		return text;
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, dir){
		if (this.length >= length) return this;
		str = str || ' ';
		var pad = str.repeat(length - this.length).substr(0, length - this.length);
		if (!dir || dir == 'right') return this + pad;
		if (dir == 'left') return pad + this;
		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	stripTags: function(){
		return this.replace(/<\/?[^>]+>/gi, '');
	},

	tidy: function(){
		var txt = this.toString();
		$each(tidymap, function(value, key){
			txt = txt.replace(new RegExp(key, 'g'), value);
		});
		return txt;
	}

});

})();/*
Script: String.QueryString.js
	...

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge, Aaron Newton, Lennart Pilon, Valerio Proietti
*/
String.implement({

	parseQueryString: function(){
		var vars = this.split(/[&;]/), res = {};
		if (vars.length) vars.each(function(val){
			var index = val.indexOf('='),
				keys = index < 0 ? [''] : val.substr(0, index).match(/[^\]\[]+/g),
				value = decodeURIComponent(val.substr(index + 1)),
				obj = res;
			keys.each(function(key, i){
				var current = obj[key];
				if(i < keys.length - 1)
					obj = obj[key] = current || {};
				else if($type(current) == 'array')
					current.push(value);
				else
					obj[key] = $defined(current) ? [current, value] : value;
			});
		});
		return res;
	},

	cleanQueryString: function(method){
		return this.split('&').filter(function(val){
			var index = val.indexOf('='),
			key = index < 0 ? '' : val.substr(0, index),
			value = val.substr(index + 1);
			return method ? method.run([key, value]) : $chk(value);
		}).join('&');
	}

});/*
Script: URI.js
	Provides methods useful in managing the window location and uris.

	License:
		MIT-style license.

	Authors:
		Sebastian Markb�ge, Aaron Newton
*/

var URI = new Class({

	Implements: Options,

	/*
	options: {
		base: false
	},
	*/

	regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
	parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
	schemes: { http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0 },

	initialize: function(uri, options){
		this.setOptions(options);
		var base = this.options.base || URI.base;
		uri = uri || base;
		if (uri && uri.parsed)
			this.parsed = $unlink(uri.parsed);
		else
			this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
	},

	parse: function(value, base){
		var bits = value.match(this.regex);
		if (!bits) return false;
		bits.shift();
		return this.merge(bits.associate(this.parts), base);
	},

	merge: function(bits, base){
		if (!bits.scheme && !base.scheme) return false;
		if (base){
			this.parts.every(function(part){
				if (bits[part]) return false;
				bits[part] = base[part] || '';
				return true;
			});
		}
		bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
		bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
		return bits;
	},

	parseDirectory: function(directory, baseDirectory) {
		directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
		if (!directory.test(URI.regs.directoryDot)) return directory;
		var result = [];
		directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
			if (dir == '..' && result.length > 0) result.pop();
			else if (dir != '.') result.push(dir);
		});
		return result.join('/') + '/';
	},

	combine: function(bits){
		return bits.value || bits.scheme + '://' +
			(bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
			(bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
			(bits.directory || '/') + (bits.file || '') +
			(bits.query ? '?' + bits.query : '') +
			(bits.fragment ? '#' + bits.fragment : '');
	},

	set: function(part, value, base){
		if (part == 'value'){
			var scheme = value.match(URI.regs.scheme);
			if (scheme) scheme = scheme[1];
			if (scheme && !$defined(this.schemes[scheme.toLowerCase()])) this.parsed = { scheme: scheme, value: value };
			else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
		} else {
			this.parsed[part] = value;
		}
		return this;
	},

	get: function(part, base){
		switch(part){
			case 'value': return this.combine(this.parsed, base ? base.parsed : false);
			case 'data' : return this.getData();
		}
		return this.parsed[part] || undefined;
	},

	go: function(){
		document.location.href = this.toString();
	},

	toURI: function(){
		return this;
	},

	getData: function(key, part){
		var qs = this.get(part || 'query');
		if (!$chk(qs)) return key ? null : {};
		var obj = qs.parseQueryString();
		return key ? obj[key] : obj;
	},

	setData: function(values, merge, part){
		if ($type(arguments[0]) == 'string'){ 
			values = this.getData(); 
			values[arguments[0]] = arguments[1]; 
		} else if (merge) {
			values = $merge(this.getData(), values);
		}
		return this.set(part || 'query', Hash.toQueryString(values));
	},

	clearData: function(part){
		return this.set(part || 'query', '');
	}

});

['toString', 'valueOf'].each(function(method){
	URI.prototype[method] = function(){
		return this.get('value');
	};
});


URI.regs = {
	endSlash: /\/$/,
	scheme: /^(\w+):/,
	directoryDot: /\.\/|\.$/
};

URI.base = new URI($$('base[href]').getLast(), { base: document.location });

String.implement({

	toURI: function(options){ return new URI(this, options); }

});/*
Script: URI.Relative.js
	Extends the URI class to add methods for computing relative and absolute urls.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

URI = Class.refactor(URI, {

	combine: function(bits, base){
		if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
			return this.previous.apply(this, arguments);
		var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

		if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

		var baseDir = base.directory.split('/'),
			relDir = bits.directory.split('/'),
			path = '',
			offset;

		var i = 0;
		for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
		for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
		for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

		return (path || (bits.file ? '' : './')) + end;
	},

	toAbsolute: function(base){
		base = new URI(base);
		if (base) base.set('directory', '').set('file', '');
		return this.toRelative(base);
	},

	toRelative: function(base){
		return this.get('value', new URI(base));
	}

});/*
Script: Element.Forms.js
	Extends the Element native object to include methods useful in managing inputs.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/
Element.implement({

	tidy: function(){
		this.set('value', this.get('value').tidy());
	},

	getTextInRange: function(start, end){
		return this.get('value').substring(start, end);
	},

	getSelectedText: function(){
		if (document.selection && document.selection.createRange) return document.selection.createRange().text;
		return this.getTextInRange(this.getSelectionStart(), this.getSelectionEnd());
	},

	getSelectedRange: function() {
		if ($defined(this.selectionStart)) return {start: this.selectionStart, end: this.selectionEnd};
		var pos = {start: 0, end: 0};
		var range = this.getDocument().selection.createRange();
		if (!range || range.parentElement() != this) return pos;
		var dup = range.duplicate();
		if (this.type == 'text') {
			pos.start = 0 - dup.moveStart('character', -100000);
			pos.end = pos.start + range.text.length;
		} else {
			var value = this.get('value');
			var offset = value.length - value.match(/[\n\r]*$/)[0].length;
			dup.moveToElementText(this);
			dup.setEndPoint('StartToEnd', range);
			pos.end = offset - dup.text.length;
			dup.setEndPoint('StartToStart', range);
			pos.start = offset - dup.text.length;
		}
		return pos;
	},

	getSelectionStart: function(){
		return this.getSelectedRange().start;
	},

	getSelectionEnd: function(){
		return this.getSelectedRange().end;
	},

	setCaretPosition: function(pos){
		if (pos == 'end') pos = this.get('value').length;
		this.selectRange(pos, pos);
		return this;
	},

	getCaretPosition: function(){
		return this.getSelectedRange().start;
	},

	selectRange: function(start, end){
		if (this.createTextRange){
			var value = this.get('value');
			var diff = value.substr(start, end - start).replace(/\r/g, '').length;
			start = value.substr(0, start).replace(/\r/g, '').length;
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', start + diff);
			range.moveStart('character', start);
			range.select();
		} else {
			this.focus();
			this.setSelectionRange(start, end);
		}
		return this;
	},

	insertAtCursor: function(value, select){
		var pos = this.getSelectedRange();
		var text = this.get('value');
		this.set('value', text.substring(0, pos.start) + value + text.substring(pos.end, text.length));
		if ($pick(select, true)) this.selectRange(pos.start, pos.start + value.length);
		else this.setCaretPosition(pos.start + value.length);
		return this;
	},

	insertAroundCursor: function(options, select){
		options = $extend({
			before: '',
			defaultMiddle: '',
			after: ''
		}, options);
		var value = this.getSelectedText() || options.defaultMiddle;
		var pos = this.getSelectedRange();
		var text = this.get('value');
		if (pos.start == pos.end){
			this.set('value', text.substring(0, pos.start) + options.before + value + options.after + text.substring(pos.end, text.length));
			this.selectRange(pos.start + options.before.length, pos.end + options.before.length + value.length);
		} else {
			var current = text.substring(pos.start, pos.end);
			this.set('value', text.substring(0, pos.start) + options.before + current + options.after + text.substring(pos.end, text.length));
			var selStart = pos.start + options.before.length;
			if ($pick(select, true)) this.selectRange(selStart, selStart + current.length);
			else this.setCaretPosition(selStart + text.length);
		}
		return this;
	}

});/*
Script: Element.Measure.js
	Extends the Element native object to include methods useful in measuring dimensions.

	Element.measure / .expose methods by Daniel Steigerwald
	License: MIT-style license.
	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Element.implement({

	measure: function(fn){
		var vis = function(el) {
			return !!(!el || el.offsetHeight || el.offsetWidth);
		};
		if (vis(this)) return fn.apply(this);
		var parent = this.getParent(),
			toMeasure = [], 
			restorers = [];
		while (!vis(parent) && parent != document.body) {
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose();
		var result = fn.apply(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return $empty;
		var before = this.getStyles('display', 'position', 'visibility');
		return this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		}).setStyles.pass(before, this);
	},

	getDimensions: function(options){
		options = $merge({computeSize: false},options);
		var dim = {};
		var getSize = function(el, options){
			return (options.computeSize)?el.getComputedSize(options):el.getSize();
		};
		if (this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else {
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		}
		return $chk(dim.x) ? $extend(dim, {width: dim.x, height: dim.y}) : $extend(dim, {x: dim.width, y: dim.height});
	},

	getComputedSize: function(options){
		options = $merge({
			styles: ['padding','border'],
			plains: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);
		var size = {width: 0,height: 0};
		switch (options.mode){
			case 'vertical':
				delete size.width;
				delete options.plains.width;
				break;
			case 'horizontal':
				delete size.height;
				delete options.plains.height;
				break;
		}
		var getStyles = [];
		//this function might be useful in other places; perhaps it should be outside this function?
		$each(options.plains, function(plain, key){
			plain.each(function(edge){
				options.styles.each(function(style){
					getStyles.push((style == 'border') ? style + '-' + edge + '-' + 'width' : style + '-' + edge);
				});
			});
		});
		var styles = {};
		getStyles.each(function(style){ styles[style] = this.getComputedStyle(style); }, this);
		var subtracted = [];
		$each(options.plains, function(plain, key){ //keys: width, height, plains: ['left', 'right'], ['top','bottom']
			var capitalized = key.capitalize();
			size['total' + capitalized] = 0;
			size['computed' + capitalized] = 0;
			plain.each(function(edge){ //top, left, right, bottom
				size['computed' + edge.capitalize()] = 0;
				getStyles.each(function(style, i){ //padding, border, etc.
					//'padding-left'.test('left') size['totalWidth'] = size['width'] + [padding-left]
					if (style.test(edge)){
						styles[style] = styles[style].toInt() || 0; //styles['padding-left'] = 5;
						size['total' + capitalized] = size['total' + capitalized] + styles[style];
						size['computed' + edge.capitalize()] = size['computed' + edge.capitalize()] + styles[style];
					}
					//if width != width (so, padding-left, for instance), then subtract that from the total
					if (style.test(edge) && key != style &&
						(style.test('border') || style.test('padding')) && !subtracted.contains(style)){
						subtracted.push(style);
						size['computed' + capitalized] = size['computed' + capitalized]-styles[style];
					}
				});
			});
		});

		['Width', 'Height'].each(function(value){
			var lower = value.toLowerCase();
			if(!$chk(size[lower])) return;

			size[lower] = size[lower] + this['offset' + value] + size['computed' + value];
			size['total' + value] = size[lower] + size['total' + value];
			delete size['computed' + value];
		}, this);

		return $extend(styles, size);
	}

});/*
Script: Element.Pin.js
	Extends the Element native object to include the pin method useful for fixed positioning for elements.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){
	var supportsPositionFixed = false;
	window.addEvent('domready', function(){
		var test = new Element('div').setStyles({
			position: 'fixed',
			top: 0,
			right: 0
		}).inject(document.body);
		supportsPositionFixed = (test.offsetTop === 0);
		test.dispose();
	});

	Element.implement({

		pin: function(enable){
			if (this.getStyle('display') == 'none') return null;
			
			var p;
			if (enable !== false){
				p = this.getPosition();
				if (!this.retrieve('pinned')){
					var pos = {
						top: p.y - window.getScroll().y,
						left: p.x - window.getScroll().x
					};
					if (supportsPositionFixed){
						this.setStyle('position', 'fixed').setStyles(pos);
					} else {
						this.store('pinnedByJS', true);
						this.setStyles({
							position: 'absolute',
							top: p.y,
							left: p.x
						});
						this.store('scrollFixer', (function(){
							if (this.retrieve('pinned'))
								this.setStyles({
									top: pos.top.toInt() + window.getScroll().y,
									left: pos.left.toInt() + window.getScroll().x
								});
						}).bind(this));
						window.addEvent('scroll', this.retrieve('scrollFixer'));
					}
					this.store('pinned', true);
				}
			} else {
				var op;
				if (!Browser.Engine.trident){
					if (this.getParent().getComputedStyle('position') != 'static') op = this.getParent();
					else op = this.getParent().getOffsetParent();
				}
				p = this.getPosition(op);
				this.store('pinned', false);
				var reposition;
				if (supportsPositionFixed && !this.retrieve('pinnedByJS')){
					reposition = {
						top: p.y + window.getScroll().y,
						left: p.x + window.getScroll().x
					};
				} else {
					this.store('pinnedByJS', false);
					window.removeEvent('scroll', this.retrieve('scrollFixer'));
					reposition = {
						top: p.y,
						left: p.x
					};
				}
				this.setStyles($merge(reposition, {position: 'absolute'}));
			}
			return this.addClass('isPinned');
		},

		unpin: function(){
			return this.pin(false).removeClass('isPinned');
		},

		togglepin: function(){
			this.pin(!this.retrieve('pinned'));
		}

	});

})();/*
Script: Element.Position.js
	Extends the Element native object to include methods useful positioning elements relative to others.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){

var original = Element.prototype.position;

Element.implement({

	position: function(options){
		//call original position if the options are x/y values
		if (options && ($defined(options.x) || $defined(options.y))) return original ? original.apply(this, arguments) : this;
		$each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
		options = $merge({
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x: 0, y: 0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false,
			allowNegative: false
		}, options);
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0};
		var parentPositioned = false;
		/* dollar around getOffsetParent should not be necessary, but as it does not return
		 * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = this.measure(function(){
			return $(this.getOffsetParent());
		});
		if (offsetParent && offsetParent != this.getDocument().body){
			parentOffset = offsetParent.measure(function(){
				return this.getPosition();
			});
			parentPositioned = true;
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		var fixValue = function(option){
			if ($type(option) != 'string') return option;
			option = option.toLowerCase();
			var val = {};
			if (option.test('left')) val.x = 'left';
			else if (option.test('right')) val.x = 'right';
			else val.x = 'center';
			if (option.test('upper') || option.test('top')) val.y = 'top';
			else if (option.test('bottom')) val.y = 'bottom';
			else val.y = 'center';
			return val;
		};
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if (!options.edge){
			if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
			else options.edge = {x:'left', y:'top'};
		}

		this.setStyle('position', 'absolute');
		var rel = $(options.relativeTo) || document.body;
		var calc = rel == document.body ? window.getScroll() : rel.getPosition();
		var top = calc.y;
		var left = calc.x;

		if (Browser.Engine.trident){
			var scrolls = rel.getScrolls();
			top += scrolls.y;
			left += scrolls.x;
		}

		var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
		if (options.ignoreMargins){
			options.offset.x = options.offset.x - dim['margin-left'];
			options.offset.y = options.offset.y - dim['margin-top'];
		}
		var pos = {};
		var prefY = options.offset.y;
		var prefX = options.offset.x;
		var winSize = window.getSize();
		switch(options.position.x){
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
				break;
		}
		switch(options.position.y){
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
				break;
		}

		if (options.edge){
			var edgeOffset = {};

			switch(options.edge.x){
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.x/2);
					break;
			}
			switch(options.edge.y){
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.y/2);
					break;
			}
			pos.x = pos.x + edgeOffset.x;
			pos.y = pos.y + edgeOffset.y;
		}
		pos = {
			left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
			top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
		};
		if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
			var winScroll = window.getScroll();
			pos.top = pos.top.toInt() + winScroll.y;
			pos.left = pos.left.toInt() + winScroll.x;
		}

		if (options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}

});

})();/*
Script: Element.Shortcuts.js
	Extends the Element native object to include some shortcut methods.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Element.implement({

	isDisplayed: function(){
		return this.getStyle('display') != 'none';
	},

	toggle: function(){
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},

	hide: function(){
		var d;
		try {
			//IE fails here if the element is not in the dom
			if ('none' != this.getStyle('display')) d = this.getStyle('display');
		} catch(e){}

		return this.store('originalDisplay', d || 'block').setStyle('display', 'none');
	},

	show: function(display){
		return this.setStyle('display', display || this.retrieve('originalDisplay') || 'block');
	},

	swapClass: function(remove, add){
		return this.removeClass(remove).addClass(add);
	}

});
/*
Script: FormValidator.js
	A css-class based form validation system.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/
var InputValidator = new Class({

	Implements: [Options],

	options: {
		errorMsg: 'Validation failed.',
		test: function(field){return true;}
	},

	initialize: function(className, options){
		this.setOptions(options);
		this.className = className;
	},

	test: function(field, props){
		if ($(field)) return this.options.test($(field), props||this.getProps(field));
		else return false;
	},

	getError: function(field, props){
		var err = this.options.errorMsg;
		if ($type(err) == 'function') err = err($(field), props||this.getProps(field));
		return err;
	},

	getProps: function(field){
		if (!$(field)) return {};
		return field.get('validatorProps');
	}

});

Element.Properties.validatorProps = {

	set: function(props){
		return this.eliminate('validatorProps').store('validatorProps', props);
	},

	get: function(props){
		if (props) this.set(props);
		if (this.retrieve('validatorProps')) return this.retrieve('validatorProps');
		if (this.getProperty('validatorProps')){
			try {
				this.store('validatorProps', JSON.decode(this.getProperty('validatorProps')));
			}catch(e){
				return {};
			}
		} else {
			var vals = this.get('class').split(' ').filter(function(cls){
				return cls.test(':');
			});
			if (!vals.length){
				this.store('validatorProps', {});
			} else {
				props = {};
				vals.each(function(cls){
					var split = cls.split(':');
					if (split[1]) {
						try {
							props[split[0]] = JSON.decode(split[1]);
						} catch(e) {}
					}
				});
				this.store('validatorProps', props);
			}
		}
		return this.retrieve('validatorProps');
	}

};

var FormValidator = new Class({

	Implements:[Options, Events],

	Binds: ['onSubmit'],

	options: {/*
		onFormValidate: $empty(isValid, form, event),
		onElementValidate: $empty(isValid, field, className, warn),
		onElementPass: $empty(field),
		onElementFail: $empty(field, validatorsFailed) */
		fieldSelectors: 'input, select, textarea',
		ignoreHidden: true,
		useTitles: false,
		evaluateOnSubmit: true,
		evaluateFieldsOnBlur: true,
		evaluateFieldsOnChange: true,
		serial: true,
		stopOnFailure: true,
		warningPrefix: function(){
			return FormValidator.getMsg('warningPrefix') || 'Warning: ';
		},
		errorPrefix: function(){
			return FormValidator.getMsg('errorPrefix') || 'Error: ';
		}
	},

	initialize: function(form, options){
		this.setOptions(options);
		this.element = $(form);
		this.element.store('validator', this);
		this.warningPrefix = $lambda(this.options.warningPrefix)();
		this.errorPrefix = $lambda(this.options.errorPrefix)();
		if (this.options.evaluateOnSubmit) this.element.addEvent('submit', this.onSubmit);
		if (this.options.evaluateFieldsOnBlur) this.watchFields(this.getFields());
	},

	toElement: function(){
		return this.element;
	},

	getFields: function(){
		return (this.fields = this.element.getElements(this.options.fieldSelectors));
	},

	watchFields: function(fields){
		fields.each(function(el){
				el.addEvent('blur', this.validateField.pass([el, false], this));
			if (this.options.evaluateFieldsOnChange)
				el.addEvent('change', this.validateField.pass([el, true], this));
		}, this);
	},

	onSubmit: function(event){
		if (!this.validate(event) && event) event.preventDefault();
		else this.reset();
	},

	reset: function(){
		this.getFields().each(this.resetField, this);
		return this;
	},

	validate: function(event){
		var result = this.getFields().map(function(field){
			return this.validateField(field, true);
		}, this).every(function(v){ return v;});
		this.fireEvent('formValidate', [result, this.element, event]);
		if (this.options.stopOnFailure && !result && event) event.preventDefault();
		return result;
	},

	validateField: function(field, force){
		if (this.paused) return true;
		field = $(field);
		var passed = !field.hasClass('validation-failed');
		var failed, warned;
		if (this.options.serial && !force){
			failed = this.element.getElement('.validation-failed');
			warned = this.element.getElement('.warning');
		}
		if (field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
			var validators = field.className.split(' ').some(function(cn){
				return this.getValidator(cn);
			}, this);
			var validatorsFailed = [];
			field.className.split(' ').each(function(className){
				if (className && !this.test(className, field)) validatorsFailed.include(className);
			}, this);
			passed = validatorsFailed.length === 0;
			if (validators && !field.hasClass('warnOnly')){
				if (passed){
					field.addClass('validation-passed').removeClass('validation-failed');
					this.fireEvent('elementPass', field);
				} else {
					field.addClass('validation-failed').removeClass('validation-passed');
					this.fireEvent('elementFail', [field, validatorsFailed]);
				}
			}
			if (!warned){
				var warnings = field.className.split(' ').some(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.getValidator(cn.replace(/^warn-/,''));
					else return null;
				}, this);
				field.removeClass('warning');
				var warnResult = field.className.split(' ').map(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.test(cn.replace(/^warn-/,''), field, true);
					else return null;
				}, this);
			}
		}
		return passed;
	},

	test: function(className, field, warn){
		var validator = this.getValidator(className);
		field = $(field);
		if (field.hasClass('ignoreValidation')) return true;
		warn = $pick(warn, false);
		if (field.hasClass('warnOnly')) warn = true;
		var isValid = validator ? validator.test(field) : true;
		if (validator && this.isVisible(field)) this.fireEvent('elementValidate', [isValid, field, className, warn]);
		if (warn) return true;
		return isValid;
	},

	isVisible : function(field){
		if (!this.options.ignoreHidden) return true;
		while(field != document.body){
			if ($(field).getStyle('display') == 'none') return false;
			field = field.getParent();
		}
		return true;
	},

	resetField: function(field){
		field = $(field);
		if (field){
			field.className.split(' ').each(function(className){
				if (className.test('^warn-')) className = className.replace(/^warn-/, '');
				field.removeClass('validation-failed');
				field.removeClass('warning');
				field.removeClass('validation-passed');
			}, this);
		}
		return this;
	},

	stop: function(){
		this.paused = true;
		return this;
	},

	start: function(){
		this.paused = false;
		return this;
	},

	ignoreField: function(field, warn){
		field = $(field);
		if (field){
			this.enforceField(field);
			if (warn) field.addClass('warnOnly');
			else field.addClass('ignoreValidation');
		}
		return this;
	},

	enforceField: function(field){
		field = $(field);
		if (field) field.removeClass('warnOnly').removeClass('ignoreValidation');
		return this;
	}

});

FormValidator.getMsg = function(key){
	return MooTools.lang.get('FormValidator', key);
};

FormValidator.adders = {

	validators:{},

	add : function(className, options){
		this.validators[className] = new InputValidator(className, options);
		//if this is a class (this method is used by instances of FormValidator and the FormValidator namespace)
		//extend these validators into it
		//this allows validators to be global and/or per instance
		if (!this.initialize){
			this.implement({
				validators: this.validators
			});
		}
	},

	addAllThese : function(validators){
		$A(validators).each(function(validator){
			this.add(validator[0], validator[1]);
		}, this);
	},

	getValidator: function(className){
		return this.validators[className.split(':')[0]];
	}

};

$extend(FormValidator, FormValidator.adders);

FormValidator.implement(FormValidator.adders);

FormValidator.add('IsEmpty', {

	errorMsg: false,
	test: function(element){
		if (element.type == 'select-one' || element.type == 'select')
			return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != '');
		else
			return ((element.get('value') == null) || (element.get('value').length == 0));
	}

});

FormValidator.addAllThese([

	['required', {
		errorMsg: function(){
			return FormValidator.getMsg('required');
		},
		test: function(element){
			return !FormValidator.getValidator('IsEmpty').test(element);
		}
	}],

	['minLength', {
		errorMsg: function(element, props){
			if ($type(props.minLength))
				return FormValidator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			if ($type(props.minLength)) return (element.get('value').length >= $pick(props.minLength, 0));
			else return true;
		}
	}],

	['maxLength', {
		errorMsg: function(element, props){
			//props is {maxLength:10}
			if ($type(props.maxLength))
				return FormValidator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			//if the value is <= than the maxLength value, element passes test
			return (element.get('value').length <= $pick(props.maxLength, 10000));
		}
	}],

	['validate-integer', {
		errorMsg: FormValidator.getMsg.pass('integer'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^-?[1-9]\d*$/).test(element.get('value'));
		}
	}],

	['validate-numeric', {
		errorMsg: FormValidator.getMsg.pass('numeric'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) ||
				(/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(element.get('value'));
		}
	}],

	['validate-digits', {
		errorMsg: FormValidator.getMsg.pass('digits'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
		}
	}],

	['validate-alpha', {
		errorMsg: FormValidator.getMsg.pass('alpha'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) ||  (/^[a-zA-Z]+$/).test(element.get('value'));
		}
	}],

	['validate-alphanum', {
		errorMsg: FormValidator.getMsg.pass('alphanum'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || !(/\W/).test(element.get('value'));
		}
	}],

	['validate-date', {
		errorMsg: function(element, props){
			if (Date.parse){
				var format = props.dateFormat || '%x';
				return FormValidator.getMsg('dateSuchAs').substitute({date: new Date().format(format)});
			} else {
				return FormValidator.getMsg('dateInFormatMDY');
			}
		},
		test: function(element, props){
			if (FormValidator.getValidator('IsEmpty').test(element)) return true;
			var d;
			if (Date.parse){
				var format = props.dateFormat || '%x';
				d = Date.parse(element.get('value'));
				var formatted = d.format(format);
				if (formatted != 'invalid date') element.set('value', formatted);
				return !isNaN(d);
			} else {
				var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
				if (!regex.test(element.get('value'))) return false;
				d = new Date(element.get('value').replace(regex, '$1/$2/$3'));
				return (parseInt(RegExp.$1, 10) == (1 + d.getMonth())) &&
					(parseInt(RegExp.$2, 10) == d.getDate()) &&
					(parseInt(RegExp.$3, 10) == d.getFullYear());
			}
		}
	}],

	['validate-email', {
		errorMsg: FormValidator.getMsg.pass('email'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(element.get('value'));
		}
	}],

	['validate-url', {
		errorMsg: FormValidator.getMsg.pass('url'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(element.get('value'));
		}
	}],

	['validate-currency-dollar', {
		errorMsg: FormValidator.getMsg.pass('currencyDollar'),
		test: function(element){
			// [$]1[##][,###]+[.##]
			// [$]1###+[.##]
			// [$]0.##
			// [$].##
			return FormValidator.getValidator('IsEmpty').test(element) ||  (/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
		}
	}],

	['validate-one-required', {
		errorMsg: FormValidator.getMsg.pass('oneRequired'),
		test: function(element, props){
			var p = $(props['validate-one-required']) || element.parentNode;
			return p.getElements('input').some(function(el){
				if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
				return el.get('value');
			});
		}
	}]

]);

Element.Properties.validator = {

	set: function(options){
		var validator = this.retrieve('validator');
		if (validator) validator.setOptions(options);
		return this.store('validator:options');
	},

	get: function(options){
		if (options || !this.retrieve('validator')){
			if (options || !this.retrieve('validator:options')) this.set('validator', options);
			this.store('validator', new FormValidator(this, this.retrieve('validator:options')));
		}
		return this.retrieve('validator');
	}

};

Element.implement({

	validate: function(options){
		this.set('validator', options);
		return this.get('validator', options).validate();
	}

});/*
Script: FormValidator.Inline.js
	Extends FormValidator to add inline messages.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

FormValidator.Inline = new Class({

	Extends: FormValidator,

	options: {
		scrollToErrorsOnSubmit: true,
		scrollFxOptions: {
			offset: {
				y: -20
			}
		}
	},

	initialize: function(form, options){
		this.parent(form, options);
		this.addEvent('onElementValidate', function(isValid, field, className, warn){
			var validator = this.getValidator(className);
			if (!isValid && validator.getError(field)){
				if (warn) field.addClass('warning');
				var advice = this.makeAdvice(className, field, validator.getError(field), warn);
				this.insertAdvice(advice, field);
				this.showAdvice(className, field);
			} else {
				this.hideAdvice(className, field);
			}
		});
	},

	makeAdvice: function(className, field, error, warn){
		var errorMsg = (warn)?this.warningPrefix:this.errorPrefix;
				errorMsg += (this.options.useTitles) ? field.title || error:error;
		var cssClass = (warn) ? 'warning-advice' : 'validation-advice';
		var advice = this.getAdvice(className, field);
		if(advice) {
			advice = advice.clone(true).set('html', errorMsg).replaces(advice);
		} else {
			advice = new Element('div', {
				html: errorMsg,
				styles: { display: 'none' },
				id: 'advice-' + className + '-' + this.getFieldId(field)
			}).addClass(cssClass);
		}
		field.store('advice-' + className, advice);
		return advice;
	},

	getFieldId : function(field){
		return field.id ? field.id : field.id = 'input_' + field.name;
	},

	showAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && !field.retrieve(this.getPropName(className))
				&& (advice.getStyle('display') == 'none'
				|| advice.getStyle('visiblity') == 'hidden'
				|| advice.getStyle('opacity') == 0)){
			field.store(this.getPropName(className), true);
			if (advice.reveal) advice.reveal();
			else advice.setStyle('display', 'block');
		}
	},

	hideAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && field.retrieve(this.getPropName(className))){
			field.store(this.getPropName(className), false);
			//if Fx.Reveal.js is present, transition the advice out
			if (advice.dissolve) advice.dissolve();
			else advice.setStyle('display', 'none');
		}
	},

	getPropName: function(className){
		return 'advice' + className;
	},

	resetField: function(field){
		field = $(field);
		if (!field) return this;
		this.parent(field);
		field.className.split(' ').each(function(className){
			this.hideAdvice(className, field);
		}, this);
		return this;
	},

	getAllAdviceMessages: function(field, force){
		var advice = [];
		if (field.hasClass('ignoreValidation') && !force) return advice;
		var validators = field.className.split(' ').some(function(cn){
			var warner = cn.test('^warn-') || field.hasClass('warnOnly');
			if (warner) cn = cn.replace(/^warn-/, '');
			var validator = this.getValidator(cn);
			if (!validator) return;
			advice.push({
				message: validator.getError(field),
				warnOnly: warner,
				passed: validator.test(),
				validator: validator
			});
		}, this);
		return advice;
	},

	getAdvice: function(className, field){
		return field.retrieve('advice-' + className);
	},

	insertAdvice: function(advice, field){
		//Check for error position prop
		var props = field.get('validatorProps');
		//Build advice
		if (!props.msgPos || !$(props.msgPos)){
			if(field.type.toLowerCase() == 'radio') field.getParent().adopt(advice);
			else advice.inject($(field), 'after');
		} else {
			$(props.msgPos).grab(advice);
		}
	},

	validate: function(field, force){
		var result = this.parent(field, force);
		if (this.options.scrollToErrorsOnSubmit && !result){
			var failed = $(this).getElement('.validation-failed');
			var par = $(this).getParent();
			var isScrolled = function(p){
				return p.getScrollSize().y != p.getSize().y;
			};
			var scrolls;
			while (par != document.body && !isScrolled(par)){
				par = par.getParent();
			}
			var fx = par.retrieve('fvScroller');
			if (!fx && window.Fx && Fx.Scroll){
				fx = new Fx.Scroll(par, {
					transition: 'quad:out',
					offset: {
						y: -20
					}
				});
				par.store('fvScroller', fx);
			}
			if (failed){
				if (fx) fx.toElement(failed);
				else par.scrollTo(par.getScroll().x, failed.getPosition(par).y - 20);
			}
		}
	}

});
/*
Script: FormValidator.Extras.js
	Additional validators for the FormValidator class.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/
FormValidator.addAllThese([

	['validate-enforce-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toEnforce || $(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-ignore-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toIgnore || $(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			}
			return true;
		}
	}],

	['validate-nospace', {
		errorMsg: function(){
			return FormValidator.getMsg('noSpace');
		},
		test: function(element, props){
			return !element.get('value').test(/\s/);
		}
	}],

	['validate-toggle-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			var eleArr = props.toToggle || $(props.toToggleChildrenOf).getElements('input, select, textarea');
			if (!element.checked){
				eleArr.each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			} else {
				eleArr.each(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-reqchk-bynode', {
		errorMsg: function(){
			return FormValidator.getMsg('reqChkByNode');
		},
		test: function(element, props){
			return ($(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
				return item.checked;
			});
		}
	}],

	['validate-required-check', {
		errorMsg: function(element, props){
			return props.useTitle ? element.get('title') : FormValidator.getMsg('requiredChk');
		},
		test: function(element, props){
			return !!element.checked;
		}
	}],

	['validate-reqchk-byname', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
		},
		test: function(element, props){
			var grpName = props.groupName || element.get('name');
			var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
				return item.checked;
			});
			var fv = element.getParent('form').retrieve('validator');
			if (oneCheckedItem && fv) fv.resetField(element);
			return oneCheckedItem;
		}
	}],

	['validate-match', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('match').substitute({matchName: props.matchName || $(props.matchInput).get('name')});
		},
		test: function(element, props){
			var eleVal = element.get('value');
			var matchVal = $(props.matchInput) && $(props.matchInput).get('value');
			return eleVal && matchVal ? eleVal == matchVal : true;
		}
	}],

	['validate-after-date', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('afterDate').substitute({
				label: props.afterLabel || (props.afterElement ? FormValidator.getMsg('startDate') : FormValidator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = $(props.afterElement) ? Date.parse($(props.afterElement).get('value')) : new Date();
			var end = Date.parse(element.get('value'));
			return end && start ? end >= start : true;
		}
	}],

	['validate-before-date', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('beforeDate').substitute({
				label: props.beforeLabel || (props.beforeElement ? FormValidator.getMsg('endDate') : FormValidator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = Date.parse(element.get('value'));
			var end = $(props.beforeElement) ? Date.parse($(props.beforeElement).get('value')) : new Date();
			return end && start ? end >= start : true;
		}
	}],

	['validate-custom-required', {
		errorMsg: function(){
			return FormValidator.getMsg('required');
		},
		test: function(element, props){
			return element.get('value') != props.emptyValue;
		}
	}],

	['validate-same-month', {
		errorMsg: function(element, props){
			var startMo = $(props.sameMonthAs) && $(props.sameMonthAs).get('value');
			var eleVal = element.get('value');
			if (eleVal != '') return FormValidator.getMsg(startMo ? 'sameMonth' : 'startMonth');
		},
		test: function(element, props){
			var d1 = Date.parse(element.get('value'));
			var d2 = Date.parse($(props.sameMonthAs) && $(props.sameMonthAs).get('value'));
			return d1 && d2 ? d1.format('%B') == d2.format('%B') : true;
		}
	}]

]);/*
Script: OverText.js
	Shows text over an input that disappears when the user clicks into it. The text remains hidden if the user adds a value.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var OverText = new Class({

	Implements: [Options, Events, Class.Occlude],

	Binds: ['reposition', 'assert', 'focus'],

	options: {/*
		textOverride: null,
		onFocus: $empty()
		onTextHide: $empty(textEl, inputEl),
		onTextShow: $empty(textEl, inputEl), */
		positionOptions: {
			position: 'upperLeft',
			edge: 'upperLeft',
			offset: {
				x: 4,
				y: 2
			}
		},
		poll: false,
		pollInterval: 250
	},

	property: 'OverText',

	initialize: function(element, options){
		this.element = $(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.attach(this.element);
		OverText.instances.push(this);
		if (this.options.poll) this.poll();
		return this;
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		var val = this.options.textOverride || this.element.get('alt') || this.element.get('title');
		if (!val) return;
		this.text = new Element('div', {
			'class': 'overTxtDiv',
			styles: {
				lineHeight: 'normal',
				position: 'absolute'
			},
			html: val,
			events: {
				click: this.hide.pass(true, this)
			}
		}).inject(this.element, 'after');
		this.element.addEvents({
			focus: this.focus,
			blur: this.assert,
			change: this.assert
		}).store('OverTextDiv', this.text);
		window.addEvent('resize', this.reposition.bind(this));
		this.assert();
		this.reposition();
	},

	startPolling: function(){
		this.pollingPaused = false;
		return this.poll();
	},

	poll: function(stop){
		//start immediately
		//pause on focus
		//resumeon blur
		if (this.poller && !stop) return this;
		var test = function(){
			if (!this.pollingPaused) this.assert();
		}.bind(this);
		if (stop) $clear(this.poller);
		else this.poller = test.periodical(this.options.pollInterval, this);
		return this;
	},

	stopPolling: function(){
		this.pollingPaused = true;
		return this.poll(true);
	},

	focus: function(){
		if (!this.text.isDisplayed() || this.element.get('disabled')) return;
		this.hide();
	},

	hide: function(){
		if (this.text.isDisplayed() && !this.element.get('disabled')){
			this.text.hide();
			this.fireEvent('textHide', [this.text, this.element]);
			this.pollingPaused = true;
			try {
				this.element.fireEvent('focus').focus();
			} catch(e){} //IE barfs if you call focus on hidden elements
		}
		return this;
	},

	show: function(){
		if (!this.text.isDisplayed()){
			this.text.show();
			this.reposition();
			this.fireEvent('textShow', [this.text, this.element]);
			this.pollingPaused = false;
		}
		return this;
	},

	assert: function(){
		this[this.test() ? 'show' : 'hide']();
	},

	test: function(){
		var v = this.element.get('value');
		return !v;
	},

	reposition: function(){
		try {
			this.assert();
			if (!this.element.getParent() || !this.element.offsetHeight) return this.hide();
			if (this.test()) this.text.position($merge(this.options.positionOptions, {relativeTo: this.element}));
		} catch(e){	}
		return this;
	}

});

OverText.instances = [];

OverText.update = function(){

	return OverText.instances.map(function(ot){
		if (ot.element && ot.text) return ot.reposition();
		return null; //the input or the text was destroyed
	});

};

if (window.Fx && Fx.Reveal) {
	Fx.Reveal.implement({
		hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed, .overTxtDiv' : false
	});
}/*
Script: Fx.Elements.js
	Effect to change any number of CSS properties of any number of Elements.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Elements = new Class({

	Extends: Fx.CSS,

	initialize: function(elements, options){
		this.elements = this.subject = $$(elements);
		this.parent(options);
	},

	compute: function(from, to, delta){
		var now = {};
		for (var i in from){
			var iFrom = from[i], iTo = to[i], iNow = now[i] = {};
			for (var p in iFrom) iNow[p] = this.parent(iFrom[p], iTo[p], delta);
		}
		return now;
	},

	set: function(now){
		for (var i in now){
			var iNow = now[i];
			for (var p in iNow) this.render(this.elements[i], p, iNow[p], this.options.unit);
		}
		return this;
	},

	start: function(obj){
		if (!this.check(obj)) return this;
		var from = {}, to = {};
		for (var i in obj){
			var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
			for (var p in iProps){
				var parsed = this.prepare(this.elements[i], p, iProps[p]);
				iFrom[p] = parsed.from;
				iTo[p] = parsed.to;
			}
		}
		return this.parent(from, to);
	}

});/*
Script: Fx.Accordion.js
	An Fx.Elements extension which allows you to easily create accordion type controls.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Accordion = Fx.Accordion = new Class({

	Extends: Fx.Elements,

	options: {/*
		onActive: $empty(toggler, section),
		onBackground: $empty(toggler, section),*/
		display: 0,
		show: false,
		height: true,
		width: false,
		opacity: true,
		fixedHeight: false,
		fixedWidth: false,
		wait: false,
		alwaysHide: false,
		trigger: 'click',
		initialDisplayFx: true
	},

	initialize: function(){
		var params = Array.link(arguments, {'container': Element.type, 'options': Object.type, 'togglers': $defined, 'elements': $defined});
		this.parent(params.elements, params.options);
		this.togglers = $$(params.togglers);
		this.container = $(params.container);
		this.previous = -1;
		if (this.options.alwaysHide) this.options.wait = true;
		if ($chk(this.options.show)){
			this.options.display = false;
			this.previous = this.options.show;
		}
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		this.effects = {};
		if (this.options.opacity) this.effects.opacity = 'fullOpacity';
		if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		this.elements.each(function(el, i){
			if (this.options.show === i){
				this.fireEvent('active', [this.togglers[i], el]);
			} else {
				for (var fx in this.effects) el.setStyle(fx, 0);
			}
		}, this);
		if ($chk(this.options.display)) this.display(this.options.display, this.options.initialDisplayFx);
	},

	addSection: function(toggler, element){
		toggler = $(toggler);
		element = $(element);
		var test = this.togglers.contains(toggler);
		this.togglers.include(toggler);
		this.elements.include(element);
		var idx = this.togglers.indexOf(toggler);
		toggler.addEvent(this.options.trigger, this.display.bind(this, idx));
		if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
		if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		if (!test){
			for (var fx in this.effects) element.setStyle(fx, 0);
		}
		return this;
	},

	display: function(index, useFx){
		useFx = $pick(useFx, true);
		index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		this.previous = index;
		var obj = {};
		this.elements.each(function(el, i){
			obj[i] = {};
			var hide = (i != index) || (this.options.alwaysHide && (el.offsetHeight > 0));
			this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
			for (var fx in this.effects) obj[i][fx] = hide ? 0 : el[this.effects[fx]];
		}, this);
		return useFx ? this.start(obj) : this.set(obj);
	}

});/*
Script: Fx.Move.js
	Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Move = new Class({

	Extends: Fx.Morph,

	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x: 0, y: 0}
	},

	start: function(destination){
		return this.parent(this.element.position($merge(this.options, destination, {returnPos: true})));
	}

});

Element.Properties.move = {

	set: function(options){
		var morph = this.retrieve('move');
		if (morph) morph.cancel();
		return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('move')){
			if (options || !this.retrieve('move:options')) this.set('move', options);
			this.store('move', new Fx.Move(this, this.retrieve('move:options')));
		}
		return this.retrieve('move');
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});
/*
Script: Fx.Reveal.js
	Defines Fx.Reveal, a class that shows and hides elements with a transition.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Reveal = new Class({

	Extends: Fx.Morph,

	options: {/*	  
		onShow: $empty(thisElemeng),
		onHide: $empty(thisElemeng),
		onComplete: $empty(thisElemeng),
		heightOverride: null,
		widthOverride: null, */
		styles: ['padding', 'border', 'margin'],
		transitionOpacity: !Browser.Engine.trident4,
		mode: 'vertical',
		display: 'block',
		hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed' : false
	},

	dissolve: function(){
		try {
			if (!this.hiding && !this.showing){
				if (this.element.getStyle('display') != 'none'){
					this.hiding = true;
					this.showing = false;
					this.hidden = true;
					var startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
					var setToAuto = (this.element.style.height === ''||this.element.style.height == 'auto');
					this.element.setStyle('display', 'block');
					if (this.options.transitionOpacity) startStyles.opacity = 1;
					var zero = {};
					$each(startStyles, function(style, name){
						zero[name] = [style, 0];
					}, this);
					var overflowBefore = this.element.getStyle('overflow');
					this.element.setStyle('overflow', 'hidden');
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					this.$chain.unshift(function(){
						if (this.hidden){
							this.hiding = false;
							$each(startStyles, function(style, name){
								startStyles[name] = style;
							}, this);
							this.element.setStyles($merge({display: 'none', overflow: overflowBefore}, startStyles));
							if (setToAuto){
								if (['vertical', 'both'].contains(this.options.mode)) this.element.style.height = '';
								if (['width', 'both'].contains(this.options.mode)) this.element.style.width = '';
							}
							if (hideThese) hideThese.setStyle('visibility', 'visible');
						}
						this.fireEvent('hide', this.element);
						this.callChain();
					}.bind(this));
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					this.start(zero);
				} else {
					this.callChain.delay(10, this);
					this.fireEvent('complete', this.element);
					this.fireEvent('hide', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.dissolve.bind(this));
			} else if (this.options.link == 'cancel' && !this.hiding){
				this.cancel();
				this.dissolve();
			}
		} catch(e){
			this.hiding = false;
			this.element.setStyle('display', 'none');
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('hide', this.element);
		}
		return this;
	},

	reveal: function(){
		try {
			if (!this.showing && !this.hiding){
				if (this.element.getStyle('display') == 'none' ||
					 this.element.getStyle('visiblity') == 'hidden' ||
					 this.element.getStyle('opacity') == 0){
					this.showing = true;
					this.hiding = false;
					this.hidden = false;
					var setToAuto, startStyles;
					//toggle display, but hide it
					this.element.measure(function(){
						setToAuto = (this.element.style.height === '' || this.element.style.height == 'auto');
						//create the styles for the opened/visible state
						startStyles = this.element.getComputedSize({
							styles: this.options.styles,
							mode: this.options.mode
						});
					}.bind(this));
					$each(startStyles, function(style, name){
						startStyles[name] = style;
					});
					//if we're overridding height/width
					if ($chk(this.options.heightOverride)) startStyles.height = this.options.heightOverride.toInt();
					if ($chk(this.options.widthOverride)) startStyles.width = this.options.widthOverride.toInt();
					if (this.options.transitionOpacity) {
						this.element.setStyle('opacity', 0);
						startStyles.opacity = 1;
					}
					//create the zero state for the beginning of the transition
					var zero = {
						height: 0,
						display: this.options.display
					};
					$each(startStyles, function(style, name){ zero[name] = 0; });
					var overflowBefore = this.element.getStyle('overflow');
					//set to zero
					this.element.setStyles($merge(zero, {overflow: 'hidden'}));
					//hide inputs
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					//start the effect
					this.start(startStyles);
					this.$chain.unshift(function(){
						this.element.setStyle('overflow', overflowBefore);
						if (!this.options.heightOverride && setToAuto){
							if (['vertical', 'both'].contains(this.options.mode)) this.element.style.height = '';
							if (['width', 'both'].contains(this.options.mode)) this.element.style.width = '';
						}
						if (!this.hidden) this.showing = false;
						if (hideThese) hideThese.setStyle('visibility', 'visible');
						this.callChain();
						this.fireEvent('show', this.element);
					}.bind(this));
				} else {
					this.callChain();
					this.fireEvent('complete', this.element);
					this.fireEvent('show', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.reveal.bind(this));
			} else if (this.options.link == 'cancel' && !this.showing){
				this.cancel();
				this.reveal();
			}
		} catch(e){
			this.element.setStyles({
				display: this.options.display,
				visiblity: 'visible',
				opacity: 1
			});
			this.showing = false;
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('show', this.element);
		}
		return this;
	},

	toggle: function(){
		if (this.element.getStyle('display') == 'none' ||
			 this.element.getStyle('visiblity') == 'hidden' ||
			 this.element.getStyle('opacity') == 0){
			this.reveal();
		} else {
			this.dissolve();
		}
		return this;
	}

});

Element.Properties.reveal = {

	set: function(options){
		var reveal = this.retrieve('reveal');
		if (reveal) reveal.cancel();
		return this.eliminate('reveal').store('reveal:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('reveal')){
			if (options || !this.retrieve('reveal:options')) this.set('reveal', options);
			this.store('reveal', new Fx.Reveal(this, this.retrieve('reveal:options')));
		}
		return this.retrieve('reveal');
	}

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

	reveal: function(options){
		this.get('reveal', options).reveal();
		return this;
	},

	dissolve: function(options){
		this.get('reveal', options).dissolve();
		return this;
	},

	nix: function(){
		var params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
		this.get('reveal', params.options).dissolve().chain(function(){
			this[params.destroy ? 'destroy' : 'dispose']();
		}.bind(this));
		return this;
	},

	wink: function(){
		var params = Array.link(arguments, {duration: Number.type, options: Object.type});
		var reveal = this.get('reveal', params.options);
		reveal.reveal().chain(function(){
			(function(){
				reveal.dissolve();
			}).delay(params.duration || 2000);
		});
	}


});/*
Script: Fx.Scroll.js
	Effect to smoothly scroll any element, including the window.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Scroll = new Class({

	Extends: Fx,

	options: {
		offset: {x: 0, y: 0},
		wheelStops: true
	},

	initialize: function(element, options){
		this.element = this.subject = $(element);
		this.parent(options);
		var cancel = this.cancel.bind(this, false);

		if ($type(this.element) != 'element') this.element = $(this.element.getDocument().body);

		var stopper = this.element;

		if (this.options.wheelStops){
			this.addEvent('start', function(){
				stopper.addEvent('mousewheel', cancel);
			}, true);
			this.addEvent('complete', function(){
				stopper.removeEvent('mousewheel', cancel);
			}, true);
		}
	},

	set: function(){
		var now = Array.flatten(arguments);
		this.element.scrollTo(now[0], now[1]);
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(x, y){
		if (!this.check(x, y)) return this;
		var offsetSize = this.element.getSize(), scrollSize = this.element.getScrollSize();
		var scroll = this.element.getScroll(), values = {x: x, y: y};
		for (var z in values){
			var max = scrollSize[z] - offsetSize[z];
			if ($chk(values[z])) values[z] = ($type(values[z]) == 'number') ? values[z].limit(0, max) : max;
			else values[z] = scroll[z];
			values[z] += this.options.offset[z];
		}
		return this.parent([scroll.x, scroll.y], [values.x, values.y]);
	},

	toTop: function(){
		return this.start(false, 0);
	},

	toLeft: function(){
		return this.start(0, false);
	},

	toRight: function(){
		return this.start('right', false);
	},

	toBottom: function(){
		return this.start(false, 'bottom');
	},

	toElement: function(el){
		var position = $(el).getPosition(this.element);
		return this.start(position.x, position.y);
	}

});
/*
Script: Fx.Slide.js
	Effect to slide an element in and out of view.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Slide = new Class({

	Extends: Fx,

	options: {
		mode: 'vertical'
	},

	initialize: function(element, options){
		this.addEvent('complete', function(){
			this.open = (this.wrapper['offset' + this.layout.capitalize()] != 0);
			if (this.open && Browser.Engine.webkit419) this.element.dispose().inject(this.wrapper);
		}, true);
		this.element = this.subject = $(element);
		this.parent(options);
		var wrapper = this.element.retrieve('wrapper');
		this.wrapper = wrapper || new Element('div', {
			styles: $extend(this.element.getStyles('margin', 'position'), {overflow: 'hidden'})
		}).wraps(this.element);
		this.element.store('wrapper', this.wrapper).setStyle('margin', 0);
		this.now = [];
		this.open = true;
	},

	vertical: function(){
		this.margin = 'margin-top';
		this.layout = 'height';
		this.offset = this.element.offsetHeight;
	},

	horizontal: function(){
		this.margin = 'margin-left';
		this.layout = 'width';
		this.offset = this.element.offsetWidth;
	},

	set: function(now){
		this.element.setStyle(this.margin, now[0]);
		this.wrapper.setStyle(this.layout, now[1]);
		return this;
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(how, mode){
		if (!this.check(how, mode)) return this;
		this[mode || this.options.mode]();
		var margin = this.element.getStyle(this.margin).toInt();
		var layout = this.wrapper.getStyle(this.layout).toInt();
		var caseIn = [[margin, layout], [0, this.offset]];
		var caseOut = [[margin, layout], [-this.offset, 0]];
		var start;
		switch (how){
			case 'in': start = caseIn; break;
			case 'out': start = caseOut; break;
			case 'toggle': start = (layout == 0) ? caseIn : caseOut;
		}
		return this.parent(start[0], start[1]);
	},

	slideIn: function(mode){
		return this.start('in', mode);
	},

	slideOut: function(mode){
		return this.start('out', mode);
	},

	hide: function(mode){
		this[mode || this.options.mode]();
		this.open = false;
		return this.set([-this.offset, 0]);
	},

	show: function(mode){
		this[mode || this.options.mode]();
		this.open = true;
		return this.set([0, this.offset]);
	},

	toggle: function(mode){
		return this.start('toggle', mode);
	}

});

Element.Properties.slide = {

	set: function(options){
		var slide = this.retrieve('slide');
		if (slide) slide.cancel();
		return this.eliminate('slide').store('slide:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('slide')){
			if (options || !this.retrieve('slide:options')) this.set('slide', options);
			this.store('slide', new Fx.Slide(this, this.retrieve('slide:options')));
		}
		return this.retrieve('slide');
	}

};

Element.implement({

	slide: function(how, mode){
		how = how || 'toggle';
		var slide = this.get('slide'), toggle;
		switch (how){
			case 'hide': slide.hide(mode); break;
			case 'show': slide.show(mode); break;
			case 'toggle':
				var flag = this.retrieve('slide:flag', slide.open);
				slide[flag ? 'slideOut' : 'slideIn'](mode);
				this.store('slide:flag', !flag);
				toggle = true;
			break;
			default: slide.start(how, mode);
		}
		if (!toggle) this.eliminate('slide:flag');
		return this;
	}

});
/*
Script: Fx.SmoothScroll.js
	Class for creating a smooth scrolling effect to all internal links on the page.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var SmoothScroll = Fx.SmoothScroll = new Class({

	Extends: Fx.Scroll,

	initialize: function(options, context){
		context = context || document;
		this.doc = context.getDocument();
		var win = context.getWindow();
		this.parent(this.doc, options);
		this.links = this.options.links ? $$(this.options.links) : $$(this.doc.links);
		var location = win.location.href.match(/^[^#]*/)[0] + '#';
		this.links.each(function(link){
			if (link.href.indexOf(location) != 0) {return;}
			var anchor = link.href.substr(location.length);
			if (anchor) this.useLink(link, anchor);
		}, this);
		if (!Browser.Engine.webkit419) {
			this.addEvent('complete', function(){
				win.location.hash = this.anchor;
			}, true);
		}
	},

	useLink: function(link, anchor){
		var el;
		link.addEvent('click', function(event){
			if (el !== false && !el) el = $(anchor) || this.doc.getElement('a[name=' + anchor + ']');
			if (el) {
				event.preventDefault();
				this.anchor = anchor;
				this.toElement(el);
				link.blur();
			}
		}.bind(this));
	}

});/*
Script: Fx.Sort.js
	Defines Fx.Sort, a class that reorders lists with a transition.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Sort = new Class({

	Extends: Fx.Elements,

	options: {
		mode: 'vertical'
	},

	initialize: function(elements, options){
		this.parent(elements, options);
		this.elements.each(function(el){
			if (el.getStyle('position') == 'static') el.setStyle('position', 'relative');
		});
		this.setDefaultOrder();
	},

	setDefaultOrder: function(){
		this.currentOrder = this.elements.map(function(el, index){
			return index;
		});
	},

	sort: function(newOrder){
		if ($type(newOrder) != 'array') return false;
		var top = 0;
		var left = 0;
		var zero = {};
		var vert = this.options.mode == 'vertical';
		var current = this.elements.map(function(el, index){
			var size = el.getComputedSize({styles: ['border', 'padding', 'margin']});
			var val;
			if (vert){
				val = {
					top: top,
					margin: size['margin-top'],
					height: size.totalHeight
				};
				top += val.height - size['margin-top'];
			} else {
				val = {
					left: left,
					margin: size['margin-left'],
					width: size.totalWidth
				};
				left += val.width;
			}
			var plain = vert ? 'top' : 'left';
			zero[index] = {};
			var start = el.getStyle(plain).toInt();
			zero[index][plain] = start || 0;
			return val;
		}, this);
		this.set(zero);
		newOrder = newOrder.map(function(i){ return i.toInt(); });
		if (newOrder.length != this.elements.length){
			this.currentOrder.each(function(index){
				if (!newOrder.contains(index)) newOrder.push(index);
			});
			if (newOrder.length > this.elements.length)
				newOrder.splice(this.elements.length-1, newOrder.length - this.elements.length);
		}
		top = 0;
		left = 0;
		var margin = 0;
		var next = {};
		newOrder.each(function(item, index){
			var newPos = {};
			if (vert){
				newPos.top = top - current[item].top - margin;
				top += current[item].height;
			} else {
				newPos.left = left - current[item].left;
				left += current[item].width;
			}
			margin = margin + current[item].margin;
			next[item]=newPos;
		}, this);
		var mapped = {};
		$A(newOrder).sort().each(function(index){
			mapped[index] = next[index];
		});
		this.start(mapped);
		this.currentOrder = newOrder;
		return this;
	},

	rearrangeDOM: function(newOrder){
		newOrder = newOrder || this.currentOrder;
		var parent = this.elements[0].getParent();
		var rearranged = [];
		this.elements.setStyle('opacity', 0);
		//move each element and store the new default order
		newOrder.each(function(index){
			rearranged.push(this.elements[index].inject(parent).setStyles({
				top: 0,
				left: 0
			}));
		}, this);
		this.elements.setStyle('opacity', 1);
		this.elements = $$(rearranged);
		this.setDefaultOrder();
		return this;
	},

	getDefaultOrder: function(){
		return this.elements.map(function(el, index){
			return index;
		});
	},

	forward: function(){
		return this.sort(this.getDefaultOrder());
	},

	backward: function(){
		return this.sort(this.getDefaultOrder().reverse());
	},

	reverse: function(){
		return this.sort(this.currentOrder.reverse());
	},

	sortByElements: function(elements){
		return this.sort(elements.map(function(el){
			return this.elements.indexOf(el);
		}, this));
	},

	swap: function(one, two){
		if ($type(one) == 'element') one = this.elements.indexOf(one);
		if ($type(two) == 'element') two = this.elements.indexOf(two);
		
		var newOrder = $A(this.currentOrder);
		newOrder[this.currentOrder.indexOf(one)] = two;
		newOrder[this.currentOrder.indexOf(two)] = one;
		this.sort(newOrder);
	}

});/*
Script: Drag.js
	The base Drag Class. Can be used to drag and resize Elements using mouse events.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Tom Occhinno
		Jan Kassens
*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: $empty(thisElement),
		onStart: $empty(thisElement, event),
		onSnap: $empty(thisElement)
		onDrag: $empty(thisElement, event),
		onCancel: $empty(thisElement),
		onComplete: $empty(thisElement, event),*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {'options': Object.type, 'element': $defined});
		this.element = $(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = $type(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : $(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.Engine.trident) ? 'selectstart' : 'mousedown';

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: $lambda(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.start = event.page;
		this.fireEvent('beforeStart', this.element);
		var limit = this.options.limit;
		this.limit = {x: [], y: []};
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
			else this.value.now[z] = this.element[this.options.modifiers[z]];
			if (this.options.invert) this.value.now[z] *= -1;
			this.mouse.pos[z] = event.page[z] - this.value.now[z];
			if (limit && limit[z]){
				for (var i = 2; i--; i){
					if ($chk(limit[z][i])) this.limit[z][i] = $lambda(limit[z][i])();
				}
			}
		}
		if ($type(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
		this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
		this.document.addEvent(this.selection, this.bound.eventStop);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
			if (this.options.invert) this.value.now[z] *= -1;
			if (this.options.limit && this.limit[z]){
				if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}
			if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - this.limit[z][0]) % this.options.grid[z]);
			if (this.options.style) this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
			else this.element[this.options.modifiers[z]] = this.value.now[z];
		}
		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvent('mousemove', this.bound.check);
		this.document.removeEvent('mouseup', this.bound.cancel);
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		this.document.removeEvent(this.selection, this.bound.eventStop);
		this.document.removeEvent('mousemove', this.bound.drag);
		this.document.removeEvent('mouseup', this.bound.stop);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, $merge({modifiers: {x: 'width', y: 'height'}}, options));
		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});
/*
Script: Drag.Move.js
	A Drag extension that provides support for the constraining of draggables to containers and droppables.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Tom Occhinno
		Jan Kassens*/

Drag.Move = new Class({

	Extends: Drag,

	options: {/*
		onEnter: $empty(thisElement, overed),
		onLeave: $empty(thisElement, overed),
		onDrop: $empty(thisElement, overed, event),*/
		droppables: [],
		container: false,
		precalculate: false,
		includeMargins: true,
		checkDroppables: true
	},

	initialize: function(element, options){
		this.parent(element, options);
		this.droppables = $$(this.options.droppables);
		this.container = $(this.options.container);
		if (this.container && $type(this.container) != 'element') this.container = $(this.container.getDocument().body);

		var position = this.element.getStyle('position');
		if (position=='static') position = 'absolute';
		if ([this.element.getStyle('left'), this.element.getStyle('top')].contains('auto')) this.element.position(this.element.getPosition(this.element.offsetParent));
		this.element.setStyle('position', position);

		this.addEvent('start', this.checkDroppables, true);

		this.overed = null;
	},

	start: function(event){
		if (this.container){
			var ccoo = this.container.getCoordinates(this.element.getOffsetParent()), cbs = {}, ems = {};

			['top', 'right', 'bottom', 'left'].each(function(pad){
				cbs[pad] = this.container.getStyle('border-' + pad).toInt();
				ems[pad] = this.element.getStyle('margin-' + pad).toInt();
			}, this);

			var width = this.element.offsetWidth + ems.left + ems.right;
			var height = this.element.offsetHeight + ems.top + ems.bottom;

			if (this.options.includeMargins) {
				$each(ems, function(value, key) {
					ems[key] = 0;
				});
			}
			if (this.container == this.element.getOffsetParent()) {
				this.options.limit = {
					x: [0 - ems.left, ccoo.right - cbs.left - cbs.right - width + ems.right],
					y: [0 - ems.top, ccoo.bottom - cbs.top - cbs.bottom - height + ems.bottom]
				};
			} else {
				this.options.limit = {
					x: [ccoo.left + cbs.left - ems.left, ccoo.right - cbs.right - width + ems.right],
					y: [ccoo.top + cbs.top - ems.top, ccoo.bottom - cbs.bottom - height + ems.bottom]
				};
			}

		}
		if (this.options.precalculate){
			this.positions = this.droppables.map(function(el) {
				return el.getCoordinates();
			});
		}
		this.parent(event);
	},

	checkAgainst: function(el, i){
		el = (this.positions) ? this.positions[i] : el.getCoordinates();
		var now = this.mouse.now;
		return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
	},

	checkDroppables: function(){
		var overed = this.droppables.filter(this.checkAgainst, this).getLast();
		if (this.overed != overed){
			if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
			if (overed) this.fireEvent('enter', [this.element, overed]);
			this.overed = overed;
		}
	},

	drag: function(event){
		this.parent(event);
		if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
	},

	stop: function(event){
		this.checkDroppables();
		this.fireEvent('drop', [this.element, this.overed, event]);
		this.overed = null;
		return this.parent(event);
	}

});

Element.implement({

	makeDraggable: function(options){
		var drag = new Drag.Move(this, options);
		this.store('dragger', drag);
		return drag;
	}

});
/*
Script: Slider.js
	Class for creating horizontal and vertical slider controls.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: $empty(intPosition),
		onChange: $empty(intStep),
		onComplete: $empty(strStep),*/
		onTick: function(position){
			if (this.options.snap) position = this.toPosition(this.step);
			this.knob.setStyle(this.property, position);
		},
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		this.element = $(element);
		this.knob = $(knob);
		this.previousChange = this.previousEnd = this.step = -1;
		var offset, limit = {}, modifiers = {'x': false, 'y': false};
		switch (this.options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				offset = 'offsetWidth';
		}
		this.half = this.knob[offset] / 2;
		this.full = this.element[offset] - this.knob[offset] + (this.options.offset * 2);
		this.min = $chk(this.options.range[0]) ? this.options.range[0] : 0;
		this.max = $chk(this.options.range[1]) ? this.options.range[1] : this.options.steps;
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range) ;

		this.knob.setStyle('position', 'relative').setStyle(this.property, - this.options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [- this.options.offset, this.full - this.options.offset];

		this.bound = {
			clickedElement: this.clickedElement.bind(this),
			scrolledElement: this.scrolledElement.bindWithEvent(this),
			draggedKnob: this.draggedKnob.bind(this)
		};

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.bound.draggedKnob,
			onStart: this.bound.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (this.options.snap){
			dragOptions.grid = Math.ceil(this.stepWidth);
			dragOptions.limit[this.axis][1] = this.full;
		}

		this.drag = new Drag(this.knob, dragOptions);
		this.attach();
	},

	attach: function(){
		this.element.addEvent('mousedown', this.bound.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.bound.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.bound.clickedElement);
		this.element.removeEvent('mousewheel', this.bound.scrolledElement);
		this.drag.detach();
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		this.checkStep();
		this.fireEvent('tick', this.toPosition(this.step));
		this.end();
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1;
		var position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
		this.fireEvent('tick', position);
		this.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(mode ? this.step - this.stepSize : this.step + this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1;
		var position = this.drag.value.now[this.axis];
		position = position.limit(-this.options.offset, this.full -this.options.offset);
		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		if (this.previousChange != this.step){
			this.previousChange = this.step;
			this.fireEvent('change', this.step);
		}
	},

	end: function(){
		if (this.previousEnd !== this.step){
			this.previousEnd = this.step;
			this.fireEvent('complete', this.step + '');
		}
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});/*
Script: Sortables.js
	Class for creating a drag and drop sorting interface for lists of items.

	License:
		MIT-style license.

	Authors:
		Tom Occhino
*/

var Sortables = new Class({

	Implements: [Events, Options],

	options: {/*
		onSort: $empty(element, clone),
		onStart: $empty(element, clone),
		onComplete: $empty(element),*/
		snap: 4,
		opacity: 1,
		clone: false,
		revert: false,
		handle: false,
		constrain: false
	},

	initialize: function(lists, options){
		this.setOptions(options);
		this.elements = [];
		this.lists = [];
		this.idle = true;

		this.addLists($$($(lists) || lists));
		if (!this.options.clone) this.options.revert = false;
		if (this.options.revert) this.effect = new Fx.Morph(null, $merge({duration: 250, link: 'cancel'}, this.options.revert));
	},

	attach: function(){
		this.addLists(this.lists);
		return this;
	},

	detach: function(){
		this.lists = this.removeLists(this.lists);
		return this;
	},

	addItems: function(){
		Array.flatten(arguments).each(function(element){
			this.elements.push(element);
			var start = element.retrieve('sortables:start', this.start.bindWithEvent(this, element));
			(this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
		}, this);
		return this;
	},

	addLists: function(){
		Array.flatten(arguments).each(function(list){
			this.lists.push(list);
			this.addItems(list.getChildren());
		}, this);
		return this;
	},

	removeItems: function(){
		return $$(Array.flatten(arguments).map(function(element){
			this.elements.erase(element);
			var start = element.retrieve('sortables:start');
			(this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
			
			return element;
		}, this));
	},

	removeLists: function(){
		return $$(Array.flatten(arguments).map(function(list){
			this.lists.erase(list);
			this.removeItems(list.getChildren());
			
			return list;
		}, this));
	},

	getClone: function(event, element){
		if (!this.options.clone) return new Element('div').inject(document.body);
		if ($type(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
		return element.clone(true).setStyles({
			margin: '0px',
			position: 'absolute',
			visibility: 'hidden',
			'width': element.getStyle('width')
		}).inject(this.list).position(element.getPosition(element.getOffsetParent()));
	},

	getDroppables: function(){
		var droppables = this.list.getChildren();
		if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
		return droppables.erase(this.clone).erase(this.element);
	},

	insert: function(dragging, element){
		var where = 'inside';
		if (this.lists.contains(element)){
			this.list = element;
			this.drag.droppables = this.getDroppables();
		} else {
			where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
		}
		this.element.inject(element, where);
		this.fireEvent('sort', [this.element, this.clone]);
	},

	start: function(event, element){
		if (!this.idle) return;
		this.idle = false;
		this.element = element;
		this.opacity = element.get('opacity');
		this.list = element.getParent();
		this.clone = this.getClone(event, element);

		this.drag = new Drag.Move(this.clone, {
			snap: this.options.snap,
			container: this.options.constrain && this.element.getParent(),
			droppables: this.getDroppables(),
			onSnap: function(){
				event.stop();
				this.clone.setStyle('visibility', 'visible');
				this.element.set('opacity', this.options.opacity || 0);
				this.fireEvent('start', [this.element, this.clone]);
			}.bind(this),
			onEnter: this.insert.bind(this),
			onCancel: this.reset.bind(this),
			onComplete: this.end.bind(this)
		});

		this.clone.inject(this.element, 'before');
		this.drag.start(event);
	},

	end: function(){
		this.drag.detach();
		this.element.set('opacity', this.opacity);
		if (this.effect){
			var dim = this.element.getStyles('width', 'height');
			var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
			this.effect.element = this.clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: 0.25
			}).chain(this.reset.bind(this));
		} else {
			this.reset();
		}
	},

	reset: function(){
		this.idle = true;
		this.clone.destroy();
		this.fireEvent('complete', this.element);
	},

	serialize: function(){
		var params = Array.link(arguments, {modifier: Function.type, index: $defined});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return element.get('id');
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});
/*
Script: Request.JSONP.js
	Defines Request.JSONP, a class for cross domain javascript via script injection.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
		Guillermo Rauch
*/

Request.JSONP = new Class({

	Implements: [Chain, Events, Options, Log],

	options: {/*
		onRetry: $empty(intRetries),
		onRequest: $empty(scriptElement),
		onComplete: $empty(data),
		onSuccess: $empty(data),
		onCancel: $empty(),*/
		url: '',
		data: {},
		retries: 0,
		timeout: 0,
		link: 'ignore',
		callbackKey: 'callback',
		injectScript: document.head
	},

	initialize: function(options){
		this.setOptions(options);
		this.running = false;
		this.requests = 0;
		this.triesRemaining = [];
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!$chk(arguments[1]) && !this.check(options)) return this;

		var type = $type(options), old = this.options, index = $chk(arguments[1]) ? arguments[1] : this.requests++;
		if (type == 'string' || type == 'element') options = {data: options};

		options = $extend({data: old.data, url: old.url}, options);

		if (!$chk(this.triesRemaining[index])) this.triesRemaining[index] = this.options.retries;
		var remaining = this.triesRemaining[index];

		(function(){
			var script = this.getScript(options);
			this.log('JSONP retrieving script with url: ' + script.get('src'));
			this.fireEvent('request', script);
			this.running = true;

			(function(){
				if (remaining){
					this.triesRemaining[index] = remaining - 1;
					if (script){
						script.destroy();
						this.request(options, index);
						this.fireEvent('retry', this.triesRemaining[index]);
					}
				} else if(script && this.options.timeout){
					script.destroy();
					this.cancel();
					this.fireEvent('failure');
				}
			}).delay(this.options.timeout, this);
		}).delay(Browser.Engine.trident ? 50 : 0, this);
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.fireEvent('cancel');
		return this;
	},

	getScript: function(options){
		var index = Request.JSONP.counter, data;
		Request.JSONP.counter++;

		switch ($type(options.data)){
			case 'element': data = $(options.data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(options.data);
		}

		var src = options.url + 
			 (options.url.test('\\?') ? '&' :'?') + 
			 (options.callbackKey || this.options.callbackKey) + 
			 '=Request.JSONP.request_map.request_'+ index + 
			 (data ? '&' + data : '');
		if (src.length > 2083) this.log('JSONP '+ src +' will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs');

		var script = new Element('script', {type: 'text/javascript', src: src});
		Request.JSONP.request_map['request_' + index] = function(data){ this.success(data, script); }.bind(this);
		return script.inject(this.options.injectScript);
	},

	success: function(data, script){
		if (script) script.destroy();
		this.running = false;
		this.log('JSONP successfully retrieved: ', data);
		this.fireEvent('complete', [data]).fireEvent('success', [data]).callChain();
	}

});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};/*
Script: Request.Queue.js
	Controls several instances of Request and its variants to run only one request at a time.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Request.Queue = new Class({

	Implements: [Options, Events],

	Binds: ['attach', 'request', 'complete', 'cancel', 'success', 'failure', 'exception'],

	options: {/*
		onRequest: $empty(argsPassedToOnRequest),
		onSuccess: $empty(argsPassedToOnSuccess),
		onComplete: $empty(argsPassedToOnComplete),
		onCancel: $empty(argsPassedToOnCancel),
		onException: $empty(argsPassedToOnException),
		onFailure: $empty(argsPassedToOnFailure),*/
		stopOnFailure: true,
		autoAdvance: true,
		concurrent: 1,
		requests: {}
	},

	initialize: function(options){
		this.setOptions(options);
		this.requests = new Hash;
		this.addRequests(this.options.requests);
		this.queue = [];
		this.reqBinders = {};
	},

	addRequest: function(name, request){
		this.requests.set(name, request);
		this.attach(name, request);
		return this;
	},

	addRequests: function(obj){
		$each(obj, this.addRequest, this);
		return this;
	},

	getName: function(req){
		return this.requests.keyOf(req);
	},

	attach: function(name, req){
		if (req._groupSend) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			if(!this.reqBinders[name]) this.reqBinders[name] = {};
			this.reqBinders[name][evt] = function(){
				this['on' + evt.capitalize()].apply(this, [name, req].extend(arguments));
			}.bind(this);
			req.addEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req._groupSend = req.send;
		req.send = function(options){
			this.send(name, options);
			return req;
		}.bind(this);
		return this;
	},

	removeRequest: function(req){
		var name = $type(req) == 'object' ? this.getName(req) : req;
		if (!name && $type(name) != 'string') return this;
		req = this.requests.get(name);
		if (!req) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			req.removeEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req.send = req._groupSend;
		delete req._groupSend;
		return this;
	},

	getRunning: function(){
		return this.requests.filter(function(r){ return r.running; });
	},

	isRunning: function(){
		return !!this.getRunning().getKeys().length;
	},

	send: function(name, options){
		var q = function(){
			this.requests.get(name)._groupSend(options);
			this.queue.erase(q);
		}.bind(this);
		q.name = name;
		if (this.getRunning().getKeys().length >= this.options.concurrent || (this.error && this.options.stopOnFailure)) this.queue.push(q);
		else q();
		return this;
	},

	hasNext: function(name){
		return (!name) ? !!this.queue.length : !!this.queue.filter(function(q){ return q.name == name; }).length;
	},

	resume: function(){
		this.error = false;
		(this.options.concurrent - this.getRunning().getKeys().length).times(this.runNext, this);
		return this;
	},

	runNext: function(name){
		if (!this.queue.length) return this;
		if (!name){
			this.queue[0]();
		} else {
			var found;
			this.queue.each(function(q){
				if (!found && q.name == name){
					found = true;
					q();
				}
			});
		}
		return this;
	},

	runAll: function() {
		this.queue.each(function(q) {
			q();
		});
		return this;
	},

	clear: function(name){
		if (!name){
			this.queue.empty();
		} else {
			this.queue = this.queue.map(function(q){
				if (q.name != name) return q;
				else return false;
			}).filter(function(q){ return q; });
		}
		return this;
	},

	cancel: function(name){
		this.requests.get(name).cancel();
		return this;
	},

	onRequest: function(){
		this.fireEvent('request', arguments);
	},

	onComplete: function(){
		this.fireEvent('complete', arguments);
	},

	onCancel: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('cancel', arguments);
	},

	onSuccess: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('success', arguments);
	},

	onFailure: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('failure', arguments);
	},

	onException: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('exception', arguments);
	}

});
/*
Script: Request.Periodical.js
	Requests the same url at a time interval that increases when no data is returned from the requested server

	License:
		MIT-style license.

	Authors:
		Christoph Pojer

*/

Request.implement({

	options: {
		initialDelay: 5000,
		delay: 5000,
		limit: 60000
	},

	startTimer: function(data){
		var fn = (function(){
			if (!this.running) this.send({data: data});
		});
		this.timer = fn.delay(this.options.initialDelay, this);
		this.lastDelay = this.options.initialDelay;
		this.completeCheck = function(j){
			$clear(this.timer);
			if (j) this.lastDelay = this.options.delay;
			else this.lastDelay = (this.lastDelay+this.options.delay).min(this.options.limit);
			this.timer = fn.delay(this.lastDelay, this);
		};
		this.addEvent('complete', this.completeCheck);
		return this;
	},

	stopTimer: function(){
		$clear(this.timer);
		this.removeEvent('complete', this.completeCheck);
		return this;
	}

});/*
Script: Assets.js
	Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Asset = {

	javascript: function(source, properties){
		properties = $extend({
			onload: $empty,
			document: document,
			check: $lambda(true)
		}, properties);

		var script = new Element('script', {src: source, type: 'text/javascript'});

		var load = properties.onload.bind(script), check = properties.check, doc = properties.document;
		delete properties.onload; delete properties.check; delete properties.document;

		script.addEvents({
			load: load,
			readystatechange: function(){
				if (['loaded', 'complete'].contains(this.readyState)) load();
			}
		}).set(properties);

		if (Browser.Engine.webkit419) var checker = (function(){
			if (!$try(check)) return;
			$clear(checker);
			load();
		}).periodical(50);

		return script.inject(doc.head);
	},

	css: function(source, properties){
		return new Element('link', $merge({
			rel: 'stylesheet', media: 'screen', type: 'text/css', href: source
		}, properties)).inject(document.head);
	},

	image: function(source, properties){
		properties = $merge({
			onload: $empty,
			onabort: $empty,
			onerror: $empty
		}, properties);
		var image = new Image();
		var element = $(image) || new Element('img');
		['load', 'abort', 'error'].each(function(name){
			var type = 'on' + name;
			var event = properties[type];
			delete properties[type];
			image[type] = function(){
				if (!image) return;
				if (!element.parentNode){
					element.width = image.width;
					element.height = image.height;
				}
				image = image.onload = image.onabort = image.onerror = null;
				event.delay(1, element, element);
				element.fireEvent(name, element, 1);
			};
		});
		image.src = element.src = source;
		if (image && image.complete) image.onload.delay(1);
		return element.set(properties);
	},

	images: function(sources, options){
		options = $merge({
			onComplete: $empty,
			onProgress: $empty
		}, options);
		sources = $splat(sources);
		var images = [];
		var counter = 0;
		return new Elements(sources.map(function(source){
			return Asset.image(source, {
				onload: function(){
					options.onProgress.call(this, counter, sources.indexOf(source));
					counter++;
					if (counter == sources.length) options.onComplete();
				}
			});
		}));
	}

};/*
Script: Color.js
	Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Color = new Native({

	initialize: function(color, type){
		if (arguments.length >= 3){
			type = 'rgb'; color = Array.slice(arguments, 0, 3);
		} else if (typeof color == 'string'){
			if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
			else if (color.match(/hsb/)) color = color.hsbToRgb();
			else color = color.hexToRgb(true);
		}
		type = type || 'rgb';
		switch (type){
			case 'hsb':
				var old = color;
				color = color.hsbToRgb();
				color.hsb = old;
			break;
			case 'hex': color = color.hexToRgb(true); break;
		}
		color.rgb = color.slice(0, 3);
		color.hsb = color.hsb || color.rgbToHsb();
		color.hex = color.rgbToHex();
		return $extend(color, this);
	}

});

Color.implement({

	mix: function(){
		var colors = Array.slice(arguments);
		var alpha = ($type(colors.getLast()) == 'number') ? colors.pop() : 50;
		var rgb = this.slice();
		colors.each(function(color){
			color = new Color(color);
			for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
		});
		return new Color(rgb, 'rgb');
	},

	invert: function(){
		return new Color(this.map(function(value){
			return 255 - value;
		}));
	},

	setHue: function(value){
		return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
	},

	setSaturation: function(percent){
		return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
	},

	setBrightness: function(percent){
		return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
	}

});

var $RGB = function(r, g, b){
	return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
	return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
	return new Color(hex, 'hex');
};

Array.implement({

	rgbToHsb: function(){
		var red = this[0], green = this[1], blue = this[2];
		var hue, saturation, brightness;
		var max = Math.max(red, green, blue), min = Math.min(red, green, blue);
		var delta = max - min;
		brightness = max / 255;
		saturation = (max != 0) ? delta / max : 0;
		if (saturation == 0){
			hue = 0;
		} else {
			var rr = (max - red) / delta;
			var gr = (max - green) / delta;
			var br = (max - blue) / delta;
			if (red == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else hue = 4 + gr - rr;
			hue /= 6;
			if (hue < 0) hue++;
		}
		return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
	},

	hsbToRgb: function(){
		var br = Math.round(this[2] / 100 * 255);
		if (this[1] == 0){
			return [br, br, br];
		} else {
			var hue = this[0] % 360;
			var f = hue % 60;
			var p = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
			var q = Math.round((this[2] * (6000 - this[1] * f)) / 600000 * 255);
			var t = Math.round((this[2] * (6000 - this[1] * (60 - f))) / 600000 * 255);
			switch (Math.floor(hue / 60)){
				case 0: return [br, t, p];
				case 1: return [q, br, p];
				case 2: return [p, br, t];
				case 3: return [p, q, br];
				case 4: return [t, p, br];
				case 5: return [br, p, q];
			}
		}
		return false;
	}

});

String.implement({

	rgbToHsb: function(){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHsb() : null;
	},

	hsbToRgb: function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.hsbToRgb() : null;
	}

});
/*
Script: Group.js
	Class for monitoring collections of events

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Group = new Class({

	initialize: function(){
		this.instances = Array.flatten(arguments);
		this.events = {};
		this.checker = {};
	},

	addEvent: function(type, fn){
		this.checker[type] = this.checker[type] || {};
		this.events[type] = this.events[type] || [];
		if (this.events[type].contains(fn)) return false;
		else this.events[type].push(fn);
		this.instances.each(function(instance, i){
			instance.addEvent(type, this.check.bind(this, [type, instance, i]));
		}, this);
		return this;
	},

	check: function(type, instance, i){
		this.checker[type][i] = true;
		var every = this.instances.every(function(current, j){
			return this.checker[type][j] || false;
		}, this);
		if (!every) return;
		this.checker[type] = {};
		this.events[type].each(function(event){
			event.call(this, this.instances, instance);
		}, this);
	}

});
/*
Script: Hash.Cookie.js
	Class for creating, reading, and deleting Cookies in JSON format.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Aaron Newton
*/

Hash.Cookie = new Class({

	Extends: Cookie,

	options: {
		autoSave: true
	},

	initialize: function(name, options){
		this.parent(name, options);
		this.load();
	},

	save: function(){
		var value = JSON.encode(this.hash);
		if (!value || value.length > 4096) return false; //cookie would be truncated!
		if (value == '{}') this.dispose();
		else this.write(value);
		return true;
	},

	load: function(){
		this.hash = new Hash(JSON.decode(this.read(), true));
		return this;
	}

});

Hash.each(Hash.prototype, function(method, name){
	if (typeof method == 'function') Hash.Cookie.implement(name, function(){
		var value = method.apply(this.hash, arguments);
		if (this.options.autoSave) this.save();
		return value;
	});
});/*
Script: IframeShim.js
	Defines IframeShim, a class for obscuring select lists and flash objects in IE.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var IframeShim = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		className: 'iframeShim',
		display: false,
		zIndex: null,
		margin: 0,
		offset: {x: 0, y: 0},
		browsers: true || (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
	},

	property: 'IframeShim',

	initialize: function(element, options){
		this.element = $(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.makeShim();
		return this;
	},

	makeShim: function(){
		if(this.options.browsers){
			var zIndex = this.element.getStyle('zIndex').toInt();

			if (!zIndex){
				var pos = this.element.getStyle('position');
				if (pos == 'static' || !pos) this.element.setStyle('position', 'relative');
				this.element.setStyle('zIndex', zIndex || 1);
			}
			zIndex = ($chk(this.options.zIndex) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1;
			if (zIndex < 0) zIndex = 1;
			this.shim = new Element('iframe', {
				src: (window.location.protocol == 'https') ? '://0' : 'javascript:void(0)',
				scrolling: 'no',
				frameborder: 0,
				styles: {
					zIndex: zIndex,
					position: 'absolute',
					border: 'none',
					filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
				},
				'class': this.options.className
			}).store('IframeShim', this);
			var inject = (function(){
				this.shim.inject(this.element, 'after');
				this[this.options.display ? 'show' : 'hide']();
				this.fireEvent('inject');
			}).bind(this);
			if (Browser.Engine.trident && !IframeShim.ready) window.addEvent('load', inject);
			else inject();
		} else {
			this.position = this.hide = this.show = this.dispose = $lambda(this);
		}
	},

	position: function(){
		if (!IframeShim.ready) return this;
		var size = this.element.measure(function(){ return this.getSize(); });
		if ($type(this.options.margin)){
			size.x = size.x - (this.options.margin * 2);
			size.y = size.y - (this.options.margin * 2);
			this.options.offset.x += this.options.margin;
			this.options.offset.y += this.options.margin;
		}
		if (this.shim) {
			this.shim.set({width: size.x, height: size.y}).position({
				relativeTo: this.element,
				offset: this.options.offset
			});
		}
		return this;
	},

	hide: function(){
		if (this.shim) this.shim.setStyle('display', 'none');
		return this;
	},

	show: function(){
		if (this.shim) this.shim.setStyle('display', 'block');
		return this.position();
	},

	dispose: function(){
		if (this.shim) this.shim.dispose();
		return this;
	},

	destroy: function(){
		if (this.shim) this.shim.destroy();
		return this;
	}

});

window.addEvent('load', function(){
	IframeShim.ready = true;
});/*
Script: Scroller.js
	Class which scrolls the contents of any Element (including the window) when the mouse reaches the Element's boundaries.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Scroller = new Class({

	Implements: [Events, Options],

	options: {
		area: 20,
		velocity: 1,
		onChange: function(x, y){
			this.element.scrollTo(x, y);
		},
		fps: 50
	},

	initialize: function(element, options){
		this.setOptions(options);
		this.element = $(element);
		this.listener = ($type(this.element) != 'element') ? $(this.element.getDocument().body) : this.element;
		this.timer = null;
		this.bound = {
			attach: this.attach.bind(this),
			detach: this.detach.bind(this),
			getCoords: this.getCoords.bind(this)
		};
	},

	start: function(){
		this.listener.addEvents({
			mouseenter: this.bound.attach,
			mouseleave: this.bound.detach
		});
	},

	stop: function(){
		this.listener.removeEvents({
			mouseenter: this.bound.attach,
			mouseleave: this.bound.detach
		});
		this.timer = $clear(this.timer);
	},

	attach: function(){
		this.listener.addEvent('mousemove', this.bound.getCoords);
	},

	detach: function(){
		this.listener.removeEvent('mousemove', this.bound.getCoords);
		this.timer = $clear(this.timer);
	},

	getCoords: function(event){
		this.page = (this.listener.get('tag') == 'body') ? event.client : event.page;
		if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
	},

	scroll: function(){
		var size = this.element.getSize(), 
			scroll = this.element.getScroll(), 
			pos = this.element.getOffsets(), 
			scrollSize = this.element.getScrollSize(), 
			change = {x: 0, y: 0};
		for (var z in this.page){
			if (this.page[z] < (this.options.area + pos[z]) && scroll[z] != 0)
				change[z] = (this.page[z] - this.options.area - pos[z]) * this.options.velocity;
			else if (this.page[z] + this.options.area > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z])
				change[z] = (this.page[z] - size[z] + this.options.area - pos[z]) * this.options.velocity;
		}
		if (change.y || change.x) this.fireEvent('change', [scroll.x + change.x, scroll.y + change.y]);
	}

});/*
Script: Tips.js
	Class for creating nice tips that follow the mouse cursor when hovering an element.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Christoph Pojer
*/

var Tips = new Class({

	Implements: [Events, Options],

	options: {
		onShow: function(tip){
			tip.setStyle('visibility', 'visible');
		},
		onHide: function(tip){
			tip.setStyle('visibility', 'hidden');
		},
		title: 'title',
		text: function(el){
			return el.get('rel') || el.get('href');
		},
		showDelay: 100,
		hideDelay: 100,
		className: null,
		offset: {x: 16, y: 16},
		fixed: false
	},

	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, elements: $defined});
		if (params.options && params.options.offsets) params.options.offset = params.options.offsets;
		this.setOptions(params.options);
		this.container = new Element('div', {'class': 'tip'});
		this.tip = this.getTip();
		
		if (params.elements) this.attach(params.elements);
	},

	getTip: function(){
		return new Element('div', {
			'class': this.options.className,
			styles: {
				visibility: 'hidden',
				display: 'none',
				position: 'absolute',
				top: 0,
				left: 0
			}
		}).adopt(
			new Element('div', {'class': 'tip-top'}),
			this.container,
			new Element('div', {'class': 'tip-bottom'})
		).inject(document.body);
	},

	attach: function(elements){
		var read = function(option, element){
			if (option == null) return '';
			return $type(option) == 'function' ? option(element) : element.get(option);
		};
		$$(elements).each(function(element){
			var title = read(this.options.title, element);
			element.erase('title').store('tip:native', title).retrieve('tip:title', title);
			element.retrieve('tip:text', read(this.options.text, element));
			
			var events = ['enter', 'leave'];
			if (!this.options.fixed) events.push('move');
			
			events.each(function(value){
				element.addEvent('mouse' + value, element.retrieve('tip:' + value, this['element' + value.capitalize()].bindWithEvent(this, element)));
			}, this);
		}, this);
		
		return this;
	},

	detach: function(elements){
		$$(elements).each(function(element){
			['enter', 'leave', 'move'].each(function(value){
				element.removeEvent('mouse' + value, element.retrieve('tip:' + value) || $empty);
			});
			
			element.eliminate('tip:enter').eliminate('tip:leave').eliminate('tip:move');
			
			if ($type(this.options.title) == 'string' && this.options.title == 'title'){
				var original = element.retrieve('tip:native');
				if (original) element.set('title', original);
			}
		}, this);
		
		return this;
	},

	elementEnter: function(event, element){
		$A(this.container.childNodes).each(Element.dispose);
		
		['title', 'text'].each(function(value){
			var content = element.retrieve('tip:' + value);
			if (!content) return;
			
			this[value + 'Element'] = new Element('div', {'class': 'tip-' + value}).inject(this.container);
			this.fill(this[value + 'Element'], content);
		}, this);
		
		this.timer = $clear(this.timer);
		this.timer = this.show.delay(this.options.showDelay, this, element);
		this.tip.setStyle('display', 'block');
		this.position((!this.options.fixed) ? event : {page: element.getPosition()});
	},

	elementLeave: function(event, element){
		$clear(this.timer);
		this.tip.setStyle('display', 'none');
		this.timer = this.hide.delay(this.options.hideDelay, this, element);
	},

	elementMove: function(event){
		this.position(event);
	},

	position: function(event){
		var size = window.getSize(), scroll = window.getScroll(),
			tip = {x: this.tip.offsetWidth, y: this.tip.offsetHeight},
			props = {x: 'left', y: 'top'},
			obj = {};
		
		for (var z in props){
			obj[props[z]] = event.page[z] + this.options.offset[z];
			if ((obj[props[z]] + tip[z] - scroll[z]) > size[z]) obj[props[z]] = event.page[z] - this.options.offset[z] - tip[z];
		}
		
		this.tip.setStyles(obj);
	},

	fill: function(element, contents){
		if(typeof contents == 'string') element.set('html', contents);
		else element.adopt(contents);
	},

	show: function(el){
		this.fireEvent('show', [this.tip, el]);
	},

	hide: function(el){
		this.fireEvent('hide', [this.tip, el]);
	}

});/*
Script: Date.English.US.js
	Date messages for US English.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

MooTools.lang.set('en-US', 'Date', {

	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now'

});/*
Script: FormValidator.English.js
	Date messages for English.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

MooTools.lang.set('en-US', 'FormValidator', {

	required:'This field is required.',
	minLength:'Please enter at least {minLength} characters (you entered {length} characters).',
	maxLength:'Please enter no more than {maxLength} characters (you entered {length} characters).',
	integer:'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
	numeric:'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
	digits:'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
	alpha:'Please use letters only (a-z) with in this field. No spaces or other characters are allowed.',
	alphanum:'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.',
	dateSuchAs:'Please enter a valid date such as {date}',
	dateInFormatMDY:'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
	email:'Please enter a valid email address. For example "fred@domain.com".',
	url:'Please enter a valid URL such as http://www.google.com.',
	currencyDollar:'Please enter a valid $ amount. For example $100.00 .',
	oneRequired:'Please enter something for at least one of these inputs.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Warning: ',

	//FormValidator.Extras

	noSpace: 'There can be no spaces in this input.',
	reqChkByNode: 'No items are selected.',
	requiredChk: 'This field is required.',
	reqChkByName: 'Please select a {label}.',
	match: 'This field needs to match the {matchName} field',
	startDate: 'the start date',
	endDate: 'the end date',
	currendDate: 'the current date',
	afterDate: 'The date should be the same or after {label}.',
	beforeDate: 'The date should be the same or before {label}.',
	startMonth: 'Please select a start month',
	sameMonth: 'These two dates must be in the same month - you must change one or the other.'

});// $Id: common.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx
 * Jx is a global singleton object that contains the entire Jx library
 * within it.  All Jx functions, attributes and classes are accessed
 * through the global Jx object.  Jx should not create any other
 * global variables, if you discover that it does then please report
 * it as a bug
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
 
/* firebug console supressor for IE/Safari/Opera */
window.addEvent('load', function() {
    if (!("console" in window) || !("firebug" in window.console)) {
        var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

        window.console = {};
        for (var i = 0; i < names.length; ++i) {
            window.console[names[i]] = function() {};
        }
    }
});
/* inspired by extjs, apparently removes css image flicker and related problems in IE 6 */
/* This is already done in mootools Source/Core/Browser.js  KASI*/
/*
(function() {
    var ua = navigator.userAgent.toLowerCase();
    var isIE = ua.indexOf("msie") > -1,
        isIE7 = ua.indexOf("msie 7") > -1;
    if(isIE && !isIE7) {
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch(e) {}
    }    
})();
*/
Class.Mutators.Family = function(self,name) {
    if ($defined(name)){
        self.$family = {'name': name};
        $[name] = $.object;
        return self;
    }
    else {
        this.implement('$family',{'name':self});
    }
};

/* Setup global namespace
 * If jxcore is loaded by jx.js, then the namespace and baseURL are
 * already established
 */
if (typeof Jx == 'undefined') {
    var Jx = {};
    (function() {
        var aScripts = document.getElementsByTagName('SCRIPT');
        for (var i=0; i<aScripts.length; i++) {
            var s = aScripts[i].src;
            var matches = /(.*[jx|js|lib])\/jxlib(.*)/.exec(s);
            if (matches && matches[0]) {
                /**
                 * Property: {String} baseURL
                 * This is the URL that Jx was loaded from, it is 
                 * automatically calculated from the script tag
                 * src property that included Jx.
                 *
                 * Note that this assumes that you are loading Jx
                 * from a js/ or lib/ folder in parallel to the
                 * images/ folder that contains the various images
                 * needed by Jx components.  If you have a different
                 * folder structure, you can define Jx's base
                 * by including the following before including
                 * the jxlib javascript file:
                 *
                 * (code)
                 * Jx = {
                 *    baseURL: 'some/path'
                 * }
                 * (end)
                 */ 
                 Jx.aPixel = document.createElement('img', {alt:'',title:''});
                 Jx.aPixel.src = matches[1]+'/a_pixel.png';
                 Jx.baseURL = Jx.aPixel.src.substring(0,
                     Jx.aPixel.src.indexOf('a_pixel.png'));
                
            }
        }
       /**
        * Determine if we're running in Adobe AIR. If so, determine which sandbox we're in
        */
        var src = aScripts[0].src;
        if (src.contains('app:')){
            Jx.isAir = true;
        } else {
            Jx.isAir = false;
        }
    })();
} 

/**
 * Method: applyPNGFilter
 *
 * Static method that applies the PNG Filter Hack for IE browsers
 * when showing 24bit PNG's.  Used automatically for img tags with
 * a class of png24.
 *
 * The filter is applied using a nifty feature of IE that allows javascript to
 * be executed as part of a CSS style rule - this ensures that the hack only
 * gets applied on IE browsers.
 *
 * The CSS that triggers this hack is only in the ie6.css files of the various
 * themes.
 *
 * Parameters:
 * object {Object} the object (img) to which the filter needs to be applied.
 */
Jx.applyPNGFilter = function(o)  {
   var t=Jx.aPixel.src;
   if( o.src != t ) {
       var s=o.src;
       o.src = t;
       o.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+s+"',sizingMethod='scale')";
   }
};

Jx.imgQueue = [];   //The queue of images to be loaded
Jx.imgLoaded = {};  //a hash table of images that have been loaded and cached
Jx.imagesLoading = 0; //counter for number of concurrent image loads 

/**
 * Method: addToImgQueue
 * Request that an image be set to a DOM IMG element src attribute.  This puts 
 * the image into a queue and there are private methods to manage that queue
 * and limit image loading to 2 at a time.
 *
 * Parameters:
 * obj - {Object} an object containing an element and src
 * property, where element is the element to update and src
 * is the url to the image.
 */
Jx.addToImgQueue = function(obj) {
    if (Jx.imgLoaded[obj.src]) {
        //if this image was already requested (i.e. it's in cache) just set it directly
        obj.element.src = obj.src;
    } else {
        //otherwise stick it in the queue
        Jx.imgQueue.push(obj);
        Jx.imgLoaded[obj.src] = true;
    }
    //start the queue management process
    Jx.checkImgQueue();
};

/**
 * Method: checkImgQueue
 *
 * An internal method that ensures no more than 2 images are loading at a time.
 */
Jx.checkImgQueue = function() {
    while (Jx.imagesLoading < 2 && Jx.imgQueue.length > 0) {
        Jx.loadNextImg();
    }
};

/**
 * Method: loadNextImg
 *
 * An internal method actually populate the DOM element with the image source.
 */
Jx.loadNextImg = function() {
    var obj = Jx.imgQueue.shift();
    if (obj) {
        ++Jx.imagesLoading;
        obj.element.onload = function(){--Jx.imagesLoading; Jx.checkImgQueue();};
        obj.element.onerror = function(){--Jx.imagesLoading; Jx.checkImgQueue();};
        obj.element.src = obj.src;
    }
};

/**
 * Method: createIframeShim
 * Creates a new iframe element that is intended to fill a container
 * to mask out other operating system controls (scrollbars, inputs, 
 * buttons, etc) when HTML elements are supposed to be above them.
 *
 * Returns:
 * an HTML iframe element that can be inserted into the DOM.
 */
Jx.createIframeShim = function() {
    return new Element('iframe', {
        'class':'jxIframeShim',
        'scrolling':'no',
        'frameborder':0
    });
};
/**
 * Method: getNumber
 * safely parse a number and return its integer value.  A NaN value 
 * returns 0.  CSS size values are also parsed correctly.
 *
 * Parameters: 
 * n - {Mixed} the string or object to parse.
 *
 * Returns:
 * {Integer} the integer value that the parameter represents
 */
Jx.getNumber = function(n, def) {
  var result = n===null||isNaN(parseInt(n,10))?(def||0):parseInt(n,10);
  return result;
}

/**
 * Method: getPageDimensions
 * return the dimensions of the browser client area.
 *
 * Returns:
 * {Object} an object containing a width and height property 
 * that represent the width and height of the browser client area.
 */
Jx.getPageDimensions = function() {
    return {width: window.getWidth(), height: window.getHeight()};
}

/**
 * Class: Element
 *
 * Element is a global object provided by the mootools library.  The
 * functions documented here are extensions to the Element object provided
 * by Jx to make cross-browser compatibility easier to achieve.  Most of the
 * methods are measurement related.
 *
 * While the code in these methods has been converted to use MooTools methods,
 * there may be better MooTools methods to use to accomplish these things.
 * Ultimately, it would be nice to eliminate most or all of these and find the
 * MooTools equivalent or convince MooTools to add them.
 */
Element.implement({
    /**
     * Method: getBoxSizing
     * return the box sizing of an element, one of 'content-box' or 
     *'border-box'.
     *
     * Parameters: 
     * elem - {Object} the element to get the box sizing of.
     *
     * Returns:
     * {String} the box sizing of the element.
     */
    getBoxSizing : function() {
      var result = 'content-box';
      if (Browser.Engine.trident || Browser.Engine.presto) { 
          var cm = document["compatMode"];
          if (cm == "BackCompat" || cm == "QuirksMode") { 
              result = 'border-box'; 
          } else {
              result = 'content-box'; 
        }
      } else {
          if (arguments.length === 0) {
              node = document.documentElement; 
          }
          var sizing = this.getStyle("-moz-box-sizing");
          if (!sizing) { 
              sizing = this.getStyle("box-sizing"); 
          }
          result = (sizing ? sizing : 'content-box');
      }
      return result;
    },
    /**
     * Method: getContentBoxSize
     * return the size of the content area of an element.  This is the size of
     * the element less margins, padding, and borders.
     *
     * Parameters: 
     * elem - {Object} the element to get the content size of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the content area of the measured element.
     */
    getContentBoxSize : function() {
      var w = this.offsetWidth;
      var h = this.offsetHeight;
      var padding = this.getPaddingSize();
      var border = this.getBorderSize();
      w = w - padding.left - padding.right - border.left - border.right;
      h = h - padding.bottom - padding.top - border.bottom - border.top;
      return {width: w, height: h};
    },
    /**
     * Method: getBorderBoxSize
     * return the size of the border area of an element.  This is the size of
     * the element less margins.
     *
     * Parameters: 
     * elem - {Object} the element to get the border sizing of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the border area of the measured element.
     */
    getBorderBoxSize: function() {
      var w = this.offsetWidth;
      var h = this.offsetHeight;
      return {width: w, height: h}; 
    },
    
    /**
     * Method: getMarginBoxSize
     * return the size of the margin area of an element.  This is the size of
     * the element plus margins.
     *
     * Parameters: 
     * elem - {Object} the element to get the margin sizing of.
     *
     * Returns:
     * {Object} an object with two properties, width and height, that
     * are the size of the margin area of the measured element.
     */
    getMarginBoxSize: function() {
        var margins = this.getMarginSize();
        var w = this.offsetWidth + margins.left + margins.right;
        var h = this.offsetHeight + margins.top + margins.bottom;
        return {width: w, height: h};
    },
    
    /**
     * Method: setContentBoxSize
     * set either or both of the width and height of an element to
     * the provided size.  This function ensures that the content
     * area of the element is the requested size and the resulting
     * size of the element may be larger depending on padding and
     * borders.
     *
     * Parameters: 
     * elem - {Object} the element to set the content area of.
     * size - {Object} an object with a width and/or height property that is the size to set
     * the content area of the element to.
     */
    setContentBoxSize : function(size) {
        if (this.getBoxSizing() == 'border-box') {
            var padding = this.getPaddingSize();
            var border = this.getBorderSize();
            if (typeof size.width != 'undefined') {
                var width = (size.width + padding.left + padding.right + border.left + border.right);
                if (width < 0) {
                    width = 0;
                }
                this.style.width = width + 'px';
            }
            if (typeof size.height != 'undefined') {
                var height = (size.height + padding.top + padding.bottom + border.top + border.bottom);
                if (height < 0) {
                    height = 0;
                }
                this.style.height = height + 'px';
            }
        } else {
            if (typeof size.width != 'undefined') {
                this.style.width = size.width + 'px';
            }
            if (typeof size.height != 'undefined') {
                this.style.height = size.height + 'px';
            }
        }
    },
    /**
     * Method: setBorderBoxSize
     * set either or both of the width and height of an element to
     * the provided size.  This function ensures that the border
     * size of the element is the requested size and the resulting
     * content areaof the element may be larger depending on padding and
     * borders.
     *
     * Parameters: 
     * elem - {Object} the element to set the border size of.
     * size - {Object} an object with a width and/or height property that is the size to set
     * the content area of the element to.
     */
    setBorderBoxSize : function(size) {
      if (this.getBoxSizing() == 'content-box') {
        var padding = this.getPaddingSize();
        var border = this.getBorderSize();
        var margin = this.getMarginSize();
        if (typeof size.width != 'undefined') {
          var width = (size.width - padding.left - padding.right - border.left - border.right - margin.left - margin.right);
          if (width < 0) {
            width = 0;
          }
          this.style.width = width + 'px';
        }
        if (typeof size.height != 'undefined') {
          var height = (size.height - padding.top - padding.bottom - border.top - border.bottom - margin.top - margin.bottom);
          if (height < 0) {
            height = 0;
          }
          this.style.height = height + 'px';
        }
      } else {
        if (typeof size.width != 'undefined' && size.width >= 0) {
          this.style.width = size.width + 'px';
        }
        if (typeof size.height != 'undefined' && size.height >= 0) {
          this.style.height = size.height + 'px';
        }
      }
    },
    /**
     * Method: getPaddingSize
     * returns the padding for each edge of an element
     *
     * Parameters: 
     * elem - {Object} The element to get the padding for.
     *
     * Returns:
     * {Object} an object with properties left, top, right and bottom
     * that contain the associated padding values.
     */
    getPaddingSize : function () {
      var l = Jx.getNumber(this.getStyle('padding-left'));
      var t = Jx.getNumber(this.getStyle('padding-top'));
      var r = Jx.getNumber(this.getStyle('padding-right'));
      var b = Jx.getNumber(this.getStyle('padding-bottom'));
      return {left:l, top:t, right: r, bottom: b};
    },
    /**
     * Method: getBorderSize
     * returns the border size for each edge of an element
     *
     * Parameters: 
     * elem - {Object} The element to get the borders for.
     *
     * Returns:
     * {Object} an object with properties left, top, right and bottom
     * that contain the associated border values.
     */
    getBorderSize : function() {
      var l = Jx.getNumber(this.getStyle('border-left-width'));
      var t = Jx.getNumber(this.getStyle('border-top-width'));
      var r = Jx.getNumber(this.getStyle('border-right-width'));
      var b = Jx.getNumber(this.getStyle('border-bottom-width'));
      return {left:l, top:t, right: r, bottom: b};
    },
    /**
     * Method: getMarginSize
     * returns the margin size for each edge of an element
     *
     * Parameters: 
     * elem - {Object} The element to get the margins for.
     *
     * Returns:
     *: {Object} an object with properties left, top, right and bottom
     * that contain the associated margin values.
     */
    getMarginSize : function() {
      var l = Jx.getNumber(this.getStyle('margin-left'));
      var t = Jx.getNumber(this.getStyle('margin-top'));
      var r = Jx.getNumber(this.getStyle('margin-right'));
      var b = Jx.getNumber(this.getStyle('margin-bottom'));
      return {left:l, top:t, right: r, bottom: b};
    },
    
    /**
     * Method: descendantOf
     * determines if the element is a descendent of the reference node.
     *
     * Parameters:
     * node - {HTMLElement} the reference node
     *
     * Returns:
     * {Boolean} true if the element is a descendent, false otherwise.
     */
    descendantOf: function(node) {
        var parent = $(this.parentNode);
        while (parent != node && parent && parent.parentNode && parent.parentNode != parent) {
            parent = $(parent.parentNode);
        }
        return parent == node;
    },
    
    /**
     * Method: findElement
     * search the parentage of the element to find an element of the given
     * tag name.
     *
     * Parameters:
     * type - {String} the tag name of the element type to search for
     *
     * Returns:
     * {HTMLElement} the first node (this one or first parent) with the
     * requested tag name or false if none are found.
     */
    findElement: function(type) {
        var o = this;
        var tagName = o.tagName;
        while (o.tagName != type && o && o.parentNode && o.parentNode != o) {
            o = $(o.parentNode);
        }
        return o.tagName == type ? o : false;
    }
} );

/**
 * Class: Jx.ContentLoader
 * 
 * ContentLoader is a mix-in class that provides a consistent
 * mechanism for other Jx controls to load content in one of
 * four different ways:
 *
 * o using an existing element, by id
 *
 * o using an existing element, by object reference
 *
 * o using an HTML string
 *
 * o using a URL to get the content remotely
 *
 * Use the Implements syntax in your Class to add Jx.ContentLoader
 * to your class.
 *
 * Option: content
 * content may be an HTML element reference, the id of an HTML element
 * already in the DOM, or an HTML string that becomes the inner HTML of
 * the element.
 *
 * Option: contentURL
 * the URL to load content from
 */
Jx.ContentLoader = new Class ({
    /**
     * Property: contentIsLoaded
     *
     * tracks the load state of the content, specifically useful
     * in the case of remote content.
     */ 
    contentIsLoaded: false,
    /**
     * Method: loadContent
     *
     * triggers loading of content based on options set for the current
     * object.
     *
     * Parameters: 
     * element - {Object} the element to insert the content into
     *
     * Events:
     *
     * ContentLoader adds the following events to an object.  You can
     * register for these events using the addEvent method or by providing
     * callback functions via the on{EventName} properties in the options 
     * object
     *
     * contentLoaded - called when the content has been loaded.  If the
     *     content is not asynchronous then this is called before loadContent
     *     returns.
     * contentLoadFailed - called if the content fails to load, primarily
     *     useful when using the contentURL method of loading content.
     */     
    loadContent: function(element) {
        element = $(element);
        if (this.options.content) {
            var c;
            if (this.options.content.domObj) {
                c = $(this.options.content.domObj);
            } else {
                c = $(this.options.content);
            }
            if (c) {
                if (this.options.content.addTo) {
                    this.options.content.addTo(element);
                } else {
                    element.appendChild(c);                    
                }
                this.contentIsLoaded = true;                
            } else {
                element.innerHTML = this.options.content;
                this.contentIsLoaded = true;
            }
        } else if (this.options.contentURL) {
            this.contentIsLoaded = false;
            this.req = new Request({
                url: this.options.contentURL, 
                method:'get',
                evalScripts:true,
                onSuccess:(function(html) {
                    element.innerHTML = html;
                    this.contentIsLoaded = true;
                    if (Jx.isAir){
                        $clear(this.reqTimeout);
                    }
                    this.fireEvent('contentLoaded', this);
                }).bind(this), 
                onFailure: (function(){
                    this.contentIsLoaded = true;
                    this.fireEvent('contentLoadFailed', this);
                }).bind(this),
                headers: {'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'}
            });
            this.req.send();
            if (Jx.isAir) {
                var timeout = $defined(this.options.timeout) ? this.options.timeout : 10000;
                this.reqTimeout = this.checkRequest.delay(timeout, this);
            }
        } else {
            this.contentIsLoaded = true;
        }
        if (this.options.contentId) {
            element.id = this.options.contentId;
        }
        if (this.contentIsLoaded) {
            this.fireEvent('contentLoaded', this);
        }
    },
    
    processContent: function(element) {
        $A(element.childNodes).each(function(node){
            if (node.tagName == 'INPUT' || node.tagName == 'SELECT' || node.tagName == 'TEXTAREA') {
                if (node.type == 'button') {
                    node.addEvent('click', function(){
                        this.fireEvent('click', this, node);
                    });
                } else {
                    node.addEvent('change', function(){
                        this.fireEvent('change',node);
                    });
                }
            } else {
                if (node.childNodes) {
                    this.processContent(node);
                }
            }
        }, this);
    }
});


/**
 * It seems AIR never returns an XHR that "fails" by not finding the 
 * appropriate file when run in the application sandbox and retrieving a local
 * file. This affects Jx.ContentLoader in that a "failed" event is never fired. 
 * 
 * To fix this, I've added a timeout that waits about 10 seconds or so in the code above
 * for the XHR to return, if it hasn't returned at the end of the timeout, we cancel the
 * XHR and fire the failure event.
 *
 * This code only gets added if we're in AIR.
 */
if (Jx.isAir){
    Jx.ContentLoader.implement({
        /**
         * Method: checkRequest()
         * Is fired after a delay to check the request to make sure it's not
         * failing in AIR.
         */
        checkRequest: function(){
            if (this.req.xhr.readyState === 1) {
                //we still haven't gotten the file. Cancel and fire the
                //failure
                $clear(this.reqTimeout);
                this.req.cancel();
                this.contentIsLoaded = true;
                this.fireEvent('contentLoadFailed', this);
            }
        }
    });
}

/**
 * Class: Jx.AutoPosition
 * Mix-in class that provides a method for positioning
 * elements relative to other elements.
 */
Jx.AutoPosition = new Class({
    /**
     * Method: position
     * positions an element relative to another element
     * based on the provided options.  Positioning rules are
     * a string with two space-separated values.  The first value
     * references the parent element and the second value references
     * the thing being positioned.  In general, multiple rules can be
     * considered by passing an array of rules to the horizontal and
     * vertical options.  The position method will attempt to position
     * the element in relation to the relative element using the rules
     * specified in the options.  If the element does not fit in the
     * viewport using the rule, then the next rule is attempted.  If
     * all rules fail, the last rule is used and element may extend
     * outside the viewport.  Horizontal and vertical rules are
     * processed independently.
     *
     * Horizontal Positioning:
     * Horizontal values are 'left', 'center', 'right', and numeric values.
     * Some common rules are:
     * o 'left left' is interpreted as aligning the left
     * edge of the element to be positioned with the left edge of the
     * reference element.  
     * o 'right right' aligns the two right edges.  
     * o 'right left' aligns the left edge of the element to the right of
     * the reference element.  
     * o 'left right' aligns the right edge of the element to the left
     * edge of the reference element.
     *
     * Vertical Positioning:
     * Vertical values are 'top', 'center', 'bottom', and numeric values.
     * Some common rules are:
     * o 'top top' is interpreted as aligning the top
     * edge of the element to be positioned with the top edge of the
     * reference element.  
     * o 'bottom bottom' aligns the two bottom edges.  
     * o 'bottom top' aligns the top edge of the element to the bottom of
     * the reference element.  
     * o 'top bottom' aligns the bottom edge of the element to the top
     * edge of the reference element.
     * 
     * Parameters:
     * element - the element to position
     * relative - the element to position relative to
     * options - the positioning options, see list below.
     *
     * Options:
     * horizontal - the horizontal positioning rule to use to position the 
     *    element.  Valid values are 'left', 'center', 'right', and a numeric
     *    value.  The default value is 'center center'.
     * vertical - the vertical positioning rule to use to position the 
     *    element.  Valid values are 'top', 'center', 'bottom', and a numeric
     *    value.  The default value is 'center center'.
     * offsets - an object containing numeric pixel offset values for the object
     *    being positioned as top, right, bottom and left properties.
     */
    position: function(element, relative, options) {
        element = $(element);
        relative = $(relative);
        var hor = $splat(options.horizontal || ['center center']);
        var ver = $splat(options.vertical || ['center center']);
        var offsets = $merge({top:0,right:0,bottom:0,left:0}, options.offsets || {});
        
        var coords = relative.getCoordinates(); //top, left, width, height
        var page;
        var scroll;
        if (!$(element.parentNode) || element.parentNode ==  document.body) {
            page = Jx.getPageDimensions();
            scroll = $(document.body).getScroll();
        } else {
            page = $(element.parentNode).getContentBoxSize(); //width, height
            scroll = $(element.parentNode).getScroll();
        }
        if (relative == document.body) {
            // adjust coords for the scroll offsets to make the object
            // appear in the right part of the page.
            coords.left += scroll.x;
            coords.top += scroll.y;            
        } else if (element.parentNode == relative) {
            // if the element is opening *inside* its relative, we want
            // it to position correctly within it so top/left becomes
            // the reference system.
            coords.left = 0;
            coords.top = 0;
        }
        var size = element.getMarginBoxSize(); //width, height
        var left;
        var right;
        var top;
        var bottom;
        var n;
        if (!hor.some(function(opt) {
            var parts = opt.split(' ');
            if (parts.length != 2) {
                return false;
            }
            if (!isNaN(parseInt(parts[0],10))) {
                n = parseInt(parts[0],10);
                if (n>=0) {
                    left = n;                    
                } else {
                    left = coords.left + coords.width + n;
                }
            } else {
                switch(parts[0]) {
                    case 'right':
                        left = coords.left + coords.width;
                        break;
                    case 'center':
                        left = coords.left + Math.round(coords.width/2);
                        break;
                    case 'left':
                    default:
                        left = coords.left;
                        break;
                }                
            }
            if (!isNaN(parseInt(parts[1],10))) {
                n = parseInt(parts[1],10);
                if (n<0) {
                    right = left + n;
                    left = right - size.width;
                } else {
                    left += n;
                    right = left + size.width;
                }
                right = coords.left + coords.width + parseInt(parts[1],10);
                left = right - size.width;
            } else {
                switch(parts[1]) {
                    case 'left':
                        left -= offsets.left;
                        right = left + size.width;
                        break;
                    case 'right':
                        left += offsets.right;
                        right = left;
                        left = left - size.width;
                        break;
                    case 'center':
                    default:
                        left = left - Math.round(size.width/2);
                        right = left + size.width;
                        break;
                }                
            }
            return (left >= scroll.x && right <= scroll.x + page.width);
        })) {
            // all failed, snap the last position onto the page as best
            // we can - can't do anything if the element is wider than the
            // space available.
            if (right > page.width) {
                left = scroll.x + page.width - size.width;
            }
            if (left < 0) {
                left = 0;
            }
        }
        element.setStyle('left', left);
        
        if (!ver.some(function(opt) {
                var parts = opt.split(' ');
                if (parts.length != 2) {
                    return false;
                }
                if (!isNaN(parseInt(parts[0],10))) {
                    top = parseInt(parts[0],10);
                } else {
                    switch(parts[0]) {
                        case 'bottom':
                            top = coords.top + coords.height;
                            break;
                        case 'center':
                            top = coords.top + Math.round(coords.height/2);
                            break;
                        case 'top':
                        default:
                            top = coords.top;
                            break;
                    }
                }
                if (!isNaN(parseInt(parts[1],10))) {
                    var n = parseInt(parts[1],10);
                    if (n>=0) {
                        top += n;
                        bottom = top + size.height;
                    } else {
                        bottom = top + n;
                        top = bottom - size.height; 
                    }
                } else {
                    switch(parts[1]) {
                        case 'top':
                            top -= offsets.top;
                            bottom = top + size.height;
                            break;
                        case 'bottom':
                            top += offsets.bottom;
                            bottom = top;
                            top = top - size.height;
                            break;
                        case 'center':
                        default:
                            top = top - Math.round(size.height/2);
                            bottom = top + size.height;
                            break;
                    }                    
                }
                return (top >= scroll.y && bottom <= scroll.y + page.height);
            })) {
                // all failed, snap the last position onto the page as best
                // we can - can't do anything if the element is higher than the
                // space available.
                if (bottom > page.height) {
                    top = scroll.y + page.height - size.height;
                }
                if (top < 0) {
                    top = 0;
                }
            }
            element.setStyle('top', top);
            
            /* update the jx layout if necessary */
            var jxl = element.retrieve('jxLayout');
            if (jxl) {
                jxl.options.left = left;
                jxl.options.top = top;
            }
        }
});

/**
 * Class: Jx.Chrome
 * A mix-in class that provides chrome helper functions.  Chrome is the
 * extraneous visual element that provides the look and feel to some elements
 * i.e. dialogs.  Chrome is added inside the element specified but may
 * bleed outside the element to provide drop shadows etc.  This is done by
 * absolutely positioning the chrome objects in the container based on
 * calculations using the margins, borders, and padding of the jxChrome
 * class and the element it is added to.
 *
 * Chrome can consist of either pure CSS border and background colors, or
 * a background-image on the jxChrome class.  Using a background-image on
 * the jxChrome class creates four images inside the chrome container that
 * are positioned in the top-left, top-right, bottom-left and bottom-right
 * corners of the chrome container and are sized to fill 50% of the width
 * and height.  The images are positioned and clipped such that the 
 * appropriate corners of the chrome image are displayed in those locations.
 */
Jx.Chrome = new Class({
    /**
     * Property: chrome
     * the DOM element that contains the chrome
     */
    chrome: null,
    
    /**
     * Method: makeChrome
     * create chrome on an element.
     *
     * Parameters:
     * element - {HTMLElement} the element to put the chrome on.
     */
    makeChrome: function(element) {
        var c = new Element('div', {
            'class':'jxChrome',
            events: {
                contextmenu: function(e) { e.stop(); }
            }      
        });
        
        /* add to element so we can get the background image style */
        element.adopt(c);
        
        /* pick up any offset because of chrome, set
         * through padding on the chrome object.  Other code can then
         * make use of these offset values to fix positioning.
         */
        this.chromeOffsets = c.getPaddingSize();
        c.setStyle('padding', 0);
        
        /* get the chrome image from the background image of the element */
        /* the app: protocol check is for adobe air support */
        var src = c.getStyle('backgroundImage');
        if (!(src.contains('http://') || src.contains('https://') || src.contains('file://') || src.contains('app:/'))) {
            src = null;
        } else {
            src = src.slice(4,-1);
            /* this only seems to be IE and Opera, but they add quotes
             * around the url - yuck
             */
            if (src.charAt(0) == '"') {
                src = src.slice(1,-1);
            }

            /* and remove the background image */
            c.setStyle('backgroundImage', 'none');

            /* make chrome */
            ['TR','TL','BL','BR'].each(function(s){
                c.adopt(
                    new Element('div',{
                        'class':'jxChrome'+s
                    }).adopt(
                    new Element('img',{
                        'class':'png24',
                        src:src,
                        alt: '',
                        title: ''
                    })));
            }, this);
        }
        if (!window.opera) {
            c.adopt(Jx.createIframeShim());
        }
        
        /* remove from DOM so the other resizing logic works as expected */
        c.dispose();    
        this.chrome = c;
    },
    /**
     * Method: showChrome
     * show the chrome on an element.  This creates the chrome if necessary.
     * If the chrome has been previously created and not removed, you can
     * call this without an element and it will just resize the chrome within
     * its existing element.  You can also pass in a different element from
     * which the chrome was previously attached to and it will move the chrome
     * to the new element.
     *
     * Parameters:
     * element - {HTMLElement} the element to show the chrome on.
     */
    showChrome: function(element) {
        element = $(element);
        if (!this.chrome) {
            this.makeChrome(element);
        }
        this.resizeChrome(element);
        if (element && this.chrome.parentNode !== element) {
            element.adopt(this.chrome);
        }
    },
    /**
     * Method: hideChrome
     * removes the chrome from the DOM.  If you do this, you can't
     * call showChrome with no arguments.
     */
    hideChrome: function() {
        if (this.chrome) {
            this.chrome.dispose();
        }
    },
    resizeChrome: function(o) {
        if (this.chrome && Browser.Engine.trident4) {
            this.chrome.setContentBoxSize($(o).getBorderBoxSize());
        }
    }
});

/**
 * Class: Jx.Addable
 * A mix-in class that provides a helper function that allows an object
 * to be added to an existing element on the page.
 */
Jx.Addable = new Class({
    addable: null,
    /**
     * Method: addTo
     * adds the object to the DOM relative to another element.  If you use
     * 'top' or 'bottom' then the element is added to the relative
     * element (becomes a child node).  If you use 'before' or 'after'
     * then the element is inserted adjacent to the reference node. 
     *
     * Parameters:
     * reference - {Object} the DOM element or id of a DOM element
     * to append the object relative to
     * where - {String} where to append the element in relation to the
     * reference node.  Can be 'top', 'bottom', 'before' or 'after'.
     * The default is 'bottom'.
     *
     * Returns:
     * the object itself, which is useful for chaining calls together
     */
    addTo: function(reference, where) {
        $(this.addable || this.domObj).inject(reference,where);
        this.fireEvent('addTo',this);
        return this;
    },
    
    toElement: function() {
        return this.addable || this.domObj;
    }
});// $Id: button.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Button
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * Jx.Button creates a clickable element that can be added to a web page.
 * When the button is clicked, it fires a 'click' event.
 *
 * The CSS styling for a button is controlled by several classes related
 * to the various objects in the button's HTML structure:
 *
 * (code)
 * <div class="jxButtonContainer">
 *  <a class="jxButton">
 *   <span class="jxButtonContent">
 *    <img class="jxButtonIcon" src="image_url">
 *    <span class="jxButtonLabel">button label</span>
 *   </span>
 *  </a>
 * </div>
 * (end)
 *
 * The CSS classes will change depending on the type option passed to the
 * constructor of the button.  The default type is Button.  Passing another
 * value such as Tab will cause all the CSS classes to change from jxButton
 * to jxTab.  For example:
 *
 * (code)
 * <div class="jxTabContainer">
 *  <a class="jxTab">
 *   <span class="jxTabContent">
 *    <img class="jxTabIcon" src="image_url">
 *    <span class="jxTabLabel">tab label</span>
 *   </span>
 *  </a>
 * </div>
 * (end)
 *
 * When you construct a new instance of Jx.Button, the button does not
 * automatically get inserted into the web page.  Typically a button
 * is used as part of building another capability such as a Jx.Toolbar.
 * However, if you want to manually insert the button into your application,
 * you may use the addTo method to append or insert the button into the 
 * page.  
 *
 * There are two modes for a button, normal and toggle.  A toggle button
 * has an active state analogous to a checkbox.  A toggle button generates
 * different events (down and up) from a normal button (click).  To create
 * a toggle button, pass toggle: true to the Jx.Button constructor.
 *
 * To use a Jx.Button in an application, you should to register for the
 * 'click' event.  You can pass a function in the 'onClick' option when
 * constructing a button or you can call the addEvent('click', myFunction)
 * method.  The addEvent method can be called several times, allowing more
 * than one function to be called when a button is clicked.  You can use the 
 * removeEvent('click', myFunction) method to stop receiving click events.
 *
 * Example:
 *
 * (code)
 * var button = new Jx.Button(options);
 * button.addTo('myListItem'); // the id of an LI in the page.
 * (end)
 *
 * (code)
 * Example:
 * var options = {
 *     imgPath: 'images/mybutton.png',
 *     tooltip: 'click me!',
 *     label: 'click me',
 *     onClick: function() {
 *         alert('you clicked me');
 *     }
 * };
 * var button = new Jx.Button(options);
 * button.addEvent('click', anotherFunction);
 *
 * function anotherFunction() {
 *   alert('a second alert for a single click');
 * }
 * (end)
 *
 * Events:
 * click - the button was pressed and released (only if type is not 'toggle').
 * down - the button is down (only if type is 'toggle')
 * up - the button is up (only if the type is 'toggle').
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button = new Class({
    Family: 'Jx.Button',
    Implements: [Options,Events,Jx.Addable],
    
    /**
     * the HTML element that is inserted into the DOM for this button.  You
     * may reference this object to append it to the DOM or remove it from
     * the DOM if necessary.
     */
    domObj: null,
    
    options: {
        /* Option: id
         * optional.  A string value to use as the ID of the button
         * container.
         */
        id: '',
        /* Option: type
         * optional.  A string value that indicates what type of button this
         * is.  The default value is Button.  The type is used to form the CSS
         * class names used for various HTML elements within the button.
         */
        type: 'Button',
        /* Option: image
         * optional.  A string value that is the url to load the image to
         * display in this button.  The default styles size this image to 16 x
         * 16.  If not provided, then the button will have no icon.
         */
        image: '',
        /* Option: tooltip
         * optional.  A string value to use as the alt/title attribute of the
         * <A> tag that wraps the button, resulting in a tooltip that appears
         * when the user hovers the mouse over a button in most browsers.  If
         * not provided, the button will have no tooltip.
         */
        tooltip: '',
        /* Option: label
         * optional, default is no label.  A string value that is used as a
         * label on the button.
         */
        label: '',
        /* Option: toggle
         * default true, whether the button is a toggle button or not.
         */
        toggle: false,
        /* Option: toggleClass
         * defaults to Toggle, this is class is added to buttons with the
         * option toggle: true
         */
        toggleClass: 'Toggle',
        /* Option: halign
         * horizontal alignment of the button label, 'center' by default. 
         * Other values are 'left' and 'right'.
         */
        halign: 'center',
        /* Option: valign
         * {String} vertical alignment of the button label, 'middle' by
         * default.  Other values are 'top' and 'bottom'.
         */
        valign: 'middle',
        /* Option: active
         * optional, default false.  Controls the initial state of toggle
         * buttons.
         */
        active: false,
        /* Option: enabled
         * whether the button is enabled or not.
         */
        enabled: true,
        /* Option: container
         * the tag name of the HTML element that should be created to contain
         * the button, by default this is 'div'.
         */
        container: 'div'
    },
    /**
     * Constructor: Jx.Button
     * create a new button.
     *
     * Parameters:
     * options - {Object} an object containing optional properties for this
     * button as below.
     */
    initialize : function( options ) {
        this.setOptions(options);
        
        // the main container for the button
        var d = new Element(this.options.container, {'class': 'jx'+this.options.type+'Container'});
        if (this.options.toggle && this.options.toggleClass) {
            d.addClass('jx'+this.options.type+this.options.toggleClass);
        }
        // the clickable part of the button
        var hasFocus;
        var mouseDown;
        var a = new Element('a', {
            'class': 'jx'+this.options.type, 
            href: 'javascript:void(0)', 
            title: this.options.tooltip, 
            alt: this.options.tooltip,
            events: {
                click: this.clicked.bindWithEvent(this),
                drag: (function(e) {e.stop();}).bindWithEvent(this),
                mousedown: (function(e) {
                    this.domA.addClass('jx'+this.options.type+'Pressed');
                    hasFocus = true;
                    mouseDown = true;
                    this.focus();
                }).bindWithEvent(this),
                mouseup: (function(e) {
                    this.domA.removeClass('jx'+this.options.type+'Pressed');
                    mouseDown = false;
                }).bindWithEvent(this),
                mouseleave: (function(e) {
                    this.domA.removeClass('jx'+this.options.type+'Pressed');
                }).bindWithEvent(this),
                mouseenter: (function(e) {
                    if (hasFocus && mouseDown) {
                        this.domA.addClass('jx'+this.options.type+'Pressed');
                    }
                }).bindWithEvent(this),
                keydown: (function(e) {
                    if (e.key == 'enter') {
                        this.domA.addClass('jx'+this.options.type+'Pressed');
                    }
                }).bindWithEvent(this),
                keyup: (function(e) {
                    if (e.key == 'enter') {
                        this.domA.removeClass('jx'+this.options.type+'Pressed');
                    }
                }).bindWithEvent(this),
                blur: function() { hasFocus = false; }
            }
        });
        d.adopt(a);
        
        if (typeof Drag != 'undefined') {
            new Drag(a, {
                onStart: function() {this.stop();}
            });
        }
        
        var s = new Element('span', {'class': 'jx'+this.options.type+'Content'});
        a.adopt(s);
        
        if (this.options.image || !this.options.label) {
            var i = new Element('img', {
                'class':'jx'+this.options.type+'Icon',
                'src': Jx.aPixel.src,
                title: this.options.tooltip, 
                alt: this.options.tooltip
            });
            //if image is not a_pixel, set the background image of the image
            //otherwise let the default css take over.
            if (this.options.image && this.options.image.indexOf('a_pixel.png') == -1) {
                i.setStyle('backgroundImage',"url("+this.options.image+")");
            }
            s.appendChild(i);
            if (this.options.imageClass) {
                i.addClass(this.options.imageClass);
            }
            this.domImg = i;
        }
        
        var l = new Element('span', {
            html: this.options.label
        });
        if (this.options.label) {
            l.addClass('jx'+this.options.type+'Label');
        }
        s.appendChild(l);
        
        if (this.options.id) {
            d.id = this.options.id;
        }
        if (this.options.halign == 'left') {
            d.addClass('jx'+this.options.type+'ContentLeft');                
        }

        if (this.options.valign == 'top') {
            d.addClass('jx'+this.options.type+'ContentTop');
        }
        
        this.domA = a;
        this.domLabel = l;
        this.domObj = d;        

        //update the enabled state
        this.setEnabled(this.options.enabled);
        
        //update the active state if necessary
        if (this.options.active) {
            this.options.active = false;
            this.setActive(true);
        }
        
    },
    /**
     * Method: clicked
     * triggered when the user clicks the button, processes the
     * actionPerformed event
     *
     * Parameters:
     * evt - {Event} the user click event
     */
    clicked : function(evt) {
        if (this.options.enabled) {
            if (this.options.toggle) {
                this.setActive(!this.options.active);
            } else {
                this.fireEvent('click', {obj: this, event: evt});
            }
        }
        //return false;
    },
    /**
     * Method: isEnabled
     * This returns true if the button is enabled, false otherwise
     *
     * Returns:
     * {Boolean} whether the button is enabled or not
     */
    isEnabled: function() { 
        return this.options.enabled; 
    },
    
    /**
     * Method: setEnabled
     * enable or disable the button.
     *
     * Parameters:
     * enabled - {Boolean} the new enabled state of the button
     */
    setEnabled: function(enabled) {
        this.options.enabled = enabled;
        if (this.options.enabled) {
            this.domObj.removeClass('jxDisabled');
        } else {
            this.domObj.addClass('jxDisabled');
        }
    },
    /**
     * Method: isActive
     * For toggle buttons, this returns true if the toggle button is
     * currently active and false otherwise.
     *
     * Returns:
     * {Boolean} the active state of a toggle button
     */
    isActive: function() { 
        return this.options.active; 
    },
    /**
     * Method: setActive
     * Set the active state of the button
     *
     * Parameters:
     * active - {Boolean} the new active state of the button
     */
    setActive: function(active) {
        if (this.options.active == active) {
            return;
        }
        this.options.active = active;
        if (this.options.active) {
            this.domA.addClass('jx'+this.options.type+'Active');
            this.fireEvent('down', this);
        } else {
            this.domA.removeClass('jx'+this.options.type+'Active');
            this.fireEvent('up', this);
        }
    },
    /**
     * Method: setImage
     * set the image of this button to a new image URL
     *
     * Parameters:
     * path - {String} the new url to use as the image for this button
     */
    setImage: function(path) {
        this.options.image = path;
        if (path) {
            if (!this.domImg) {
                var i = new Element('img', {
                    'class':'jx'+this.options.type+'Icon',
                    'src': Jx.aPixel.src,
                    alt: '',
                    title: ''
                });
                if (this.options.imageClass) {
                    i.addClass(this.options.imageClass);
                }
                this.domA.firstChild.grab(i, 'top');
                this.domImg = i;
            }
            this.domImg.setStyle('backgroundImage',"url("+this.options.image+")");                        
        } else if (this.domImg){
            this.domImg.dispose();
            this.domImg = null;
        }
    },
    /**
     * Method: setLabel
     * 
     * sets the text of the button.  Only works if a label was supplied
     * when the button was constructed
     *
     * Parameters: 
     *
     * label - {String} the new label for the button
     */
    setLabel: function(label) {
        this.domLabel.set('html', label);
        if (!label && this.domLabel.hasClass('jxButtonLabel')) {
            this.domLabel.removeClass('jxButtonLabel');
        } else if (label && !this.domLabel.hasClass('jxButtonLabel')) {
            this.domLabel.addClass('jxButtonLabel');
        }
    },
    /**
     * Method: getLabel
     * 
     * returns the text of the button.
     */
    getLabel: function() {
        return this.domLabel ? this.domLabel.innerHTML : '';
    },
    /**
     * Method: setTooltip
     * sets the tooltip displayed by the button
     *
     * Parameters: 
     * tooltip - {String} the new tooltip
     */
    setTooltip: function(tooltip) {
        if (this.domA) {
            this.domA.set({
                'title':tooltip,
                'alt':tooltip
            });
        }
    },
    /**
     * Method: focus
     * capture the keyboard focus on this button
     */
    focus: function() {
        this.domA.focus();
    },
    /**
     * Method: blur
     * remove the keyboard focus from this button
     */
    blur: function() {
        this.domA.blur();
    }
});
// $Id: flyout.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Button.Flyout
 *
 * Extends: <Jx.Button>
 *
 * Implements: <Jx.ContentLoader>, <Jx.AutoPosition>, <Jx.Chrome>
 *
 * Flyout buttons expose a panel when the user clicks the button.  The
 * panel can have arbitrary content.  You must provide any necessary 
 * code to hook up elements in the panel to your application.
 *
 * When the panel is opened, the 'open' event is fired.  When the panel is
 * closed, the 'close' event is fired.  You can register functions to handle
 * these events in the options passed to the constructor (onOpen, onClose).
 * 
 * The user can close the flyout panel by clicking the button again, by
 * clicking anywhere outside the panel and other buttons, or by pressing the
 * 'esc' key.
 *
 * Flyout buttons implement <Jx.ContentLoader> which provides the hooks to
 * insert content into the Flyout element.  Note that the Flyout element
 * is not appended to the DOM until the first time it is opened, and it is
 * removed from the DOM when closed.
 *
 * It is generally best to specify a width and height for your flyout content
 * area through CSS to ensure that it works correctly across all browsers.
 * You can do this for all flyouts using the .jxFlyout CSS selector, or you
 * can apply specific styles to your content elements.
 *
 * A flyout closes other flyouts when it is opened.  It is possible to embed
 * flyout buttons inside the content area of another flyout button.  In this
 * case, opening the inner flyout will not close the outer flyout but it will
 * close any other flyouts that are siblings.
 *
 * Example:
 * (code)
 * var flyout = new Jx.Button.Flyout({
 *      label: 'flyout',
 *      content: 'flyoutContent',
 *      onOpen: function(flyout) {
 *          console.log('flyout opened');
 *      },
 *      onClose: function(flyout) {
 *          console.log('flyout closed');
 *      }
 * });
 * (end)
 *
 * Events:
 * open - this event is triggered when the flyout is opened.
 * close - this event is triggered when the flyout is closed.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button.Flyout = new Class({
    Family: 'Jx.Button.Flyout',
    Extends: Jx.Button,
    Implements: [Jx.ContentLoader, Jx.AutoPosition, Jx.Chrome],
    
    /**
     * Property: content
     * the HTML element that contains the flyout content
     */
    content: null,
    /**
     * Constructor: initialize
     * construct a new instance of a flyout button.  The single options
     * argument takes a combination of options that apply to <Jx.Button>,
     * <Jx.ContentLoader>, and <Jx.AutoPosition>.
     *
     * Parameters: 
     * options - an options object used to initialize the button, see 
     * <Jx.Button.Options>, <Jx.ContentLoader.Options>, and
     * <Jx.AutoPosition.Options> for details.
     */
    initialize: function(options) {
        if (!Jx.Button.Flyout.Stack) {
            Jx.Button.Flyout.Stack = [];
        }
        this.parent(options);
        this.domA.addClass('jx'+this.options.type+'Flyout');
        
        this.contentContainer = new Element('div',{
            'class':'jxFlyout'
        });
        
        this.content = new Element('div', {
            'class': 'jxFlyoutContent'
        });
        if (this.options.contentClass) {
            this.content.addClass(this.options.contentClass);
        }
        this.contentContainer.adopt(this.content);
        
        this.content.store('jxFlyout', this);
        this.loadContent(this.content);
        this.keypressWatcher = this.keypressHandler.bindWithEvent(this);
        this.hideWatcher = this.clickHandler.bindWithEvent(this);
    },
    /**
     * Method: clicked
     * Override <Jx.Button::clicked> to hide/show the content area of the
     * flyout.
     *
     * Parameters:
     * e - {Event} the user event
     */ 
    clicked: function(e) {
        if (!this.options.enabled) {
            return;
        }
        /* find out what we are contained by if we don't already know */
        if (!this.owner) {
            this.owner = document.body;
            var node = $(this.domObj.parentNode);
            while (node != document.body && this.owner == document.body) {
                var flyout = node.retrieve('jxFlyout');
                if (flyout) {
                    this.owner = flyout;
                    break;
                } else {
                    node = $(node.parentNode);
                }
            }
        }
        if (Jx.Button.Flyout.Stack[Jx.Button.Flyout.Stack.length - 1] == this) {
            this.hide();
            return;
        } else if (this.owner != document.body) {
            /* if we are part of another flyout, close any open flyouts
             * inside the parent and register this as the current flyout
             */
            if (this.owner.currentFlyout == this) {
                /* if the flyout to close is this flyout,
                 * hide this and return */
                this.hide();
                return;
            } else if (this.owner.currentFlyout) {
                this.owner.currentFlyout.hide();
            }
            this.owner.currentFlyout = this;                
        } else {
            /* if we are at the top level, close the entire stack before
             * we open
             */
            while (Jx.Button.Flyout.Stack.length) {
                Jx.Button.Flyout.Stack[Jx.Button.Flyout.Stack.length - 1].hide();
            }
        }
        // now we go on the stack.
        Jx.Button.Flyout.Stack.push(this);

        this.options.active = true;
        this.domA.addClass('jx'+this.options.type+'Active');
        this.contentContainer.setStyle('visibility','hidden');
        $(document.body).adopt(this.contentContainer);
        this.content.getChildren().each(function(child) {
            if (child.resize) { 
                child.resize(); 
            }
        });
        this.showChrome(this.contentContainer);
        
        this.position(this.contentContainer, this.domObj, {
            horizontal: ['left left', 'right right'],
            vertical: ['bottom top', 'top bottom'],
            offsets: this.chromeOffsets
        });
        
        /* we have to size the container for IE to render the chrome correctly
         * there is some horrible peekaboo bug in IE 6
         */
        this.contentContainer.setContentBoxSize($(this.content).getMarginBoxSize());
        
        this.contentContainer.setStyle('visibility','');

        document.addEvent('keydown', this.keypressWatcher);
        document.addEvent('click', this.hideWatcher);
        this.fireEvent('open', this);
    },
    /**
     * Method: hide
     * Closes the flyout if open
     */
    hide: function() {
        if (this.owner != document.body) {
            this.owner.currentFlyout = null;            
        }
        Jx.Button.Flyout.Stack.pop();
        this.setActive(false);
        this.contentContainer.dispose();
        document.removeEvent('keydown', this.keypressWatcher);    
        document.removeEvent('click', this.hideWatcher);
        this.fireEvent('close', this);
    },
    /* hide flyout if the user clicks outside of the flyout */
    clickHandler: function(e) {
        e = new Event(e);
        var elm = $(e.target);
        var flyout = Jx.Button.Flyout.Stack[Jx.Button.Flyout.Stack.length - 1];
        if (!elm.descendantOf(flyout.content) &&
            !elm.descendantOf(flyout.domObj)) {
            flyout.hide();
        }
    },
    /* hide flyout if the user presses the ESC key */
    keypressHandler: function(e) {
        e = new Event(e);
        if (e.key == 'esc') {
            Jx.Button.Flyout.Stack[Jx.Button.Flyout.Stack.length - 1].hide();
        }
    }
});// $Id: layout.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Layout
 *
 * Extends: Object
 * 
 * Implements: Options, Events
 *
 * Jx.Layout is used to provide more flexible layout options for applications
 *
 * Jx.Layout wraps an existing DOM element (typically a div) and provides
 * extra functionality for sizing that element within its parent and sizing
 * elements contained within it that have a 'resize' function attached to them.
 *
 * To create a Jx.Layout, pass the element or id plus an options object to
 * the constructor.
 *
 * Example:
 * (code)
 * var myContainer = new Jx.Layout('myDiv', options);
 * (end)
 *
 * Events:
 * sizeChange - fired when the size of the container changes
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
 
Jx.Layout = new Class({
    Family: 'Jx.Layout',
    Implements: [Options,Events],
    
    options: {
        /* Option: propagate
         * boolean, controls propogation of resize to child nodes.
         * True by default. If set to false, changes in size will not be
         * propogated to child nodes.
         */
        propagate: true,
        /* Option: position
         * how to position the element, either 'absolute' or 'relative'.
         * The default (if not passed) is 'absolute'.  When using
         * 'absolute' positioning, both the width and height are
         * controlled by Jx.Layout.  If 'relative' positioning is used
         * then only the width is controlled, allowing the height to
         * be controlled by its content.
         */
        position: 'absolute',
        /* Option: left
         * the distance (in pixels) to maintain the left edge of the element
         * from its parent element.  The default value is 0.  If this is set
         * to 'null', then the left edge can be any distance from its parent
         * based on other parameters.
         */
        left: 0,
        /* Option: right
         * the distance (in pixels) to maintain the right edge of the element
         * from its parent element.  The default value is 0.  If this is set
         * to 'null', then the right edge can be any distance from its parent
         * based on other parameters.
         */
        right: 0,
        /* Option: top
         * the distance (in pixels) to maintain the top edge of the element
         * from its parent element.  The default value is 0.  If this is set
         * to 'null', then the top edge can be any distance from its parent
         * based on other parameters.
         */
        top: 0,
        /* Option: bottom
         * the distance (in pixels) to maintain the bottom edge of the element
         * from its parent element.  The default value is 0.  If this is set
         * to 'null', then the bottom edge can be any distance from its parent
         * based on other parameters.
         */
        bottom: 0,
        /* Option: width
         * the width (in pixels) of the element.  The default value is null.
         * If this is set to 'null', then the width can be any value based on
         * other parameters.
         */
        width: null,
        /* Option: height
         * the height (in pixels) of the element.  The default value is null.
         * If this is set to 'null', then the height can be any value based on
         * other parameters.
         */
        height: null,
        /* Option: minWidth
         * the minimum width that the element can be sized to.  The default
         * value is 0.
         */
        minWidth: 0,
        /* Option: minHeight
         * the minimum height that the element can be sized to.  The
         * default value is 0.
         */
        minHeight: 0,
        /* Option: maxWidth
         * the maximum width that the element can be sized to.  The default
         * value is -1, which means no maximum.
         */
        maxWidth: -1,
        /* Option: maxHeight
         * the maximum height that the element can be sized to.  The
         * default value is -1, which means no maximum.
         */
        maxHeight: -1
    },
    /**
     * Constructor: Jx.Layout
     * Create a new instance of Jx.Layout.
     *
     * Parameters:
     * domObj - {HTMLElement} element or id to apply the layout to
     * options - <Jx.Layout.Options>
     */
    initialize: function(domObj, options) {
        this.setOptions(options);
        this.domObj = $(domObj);
        this.domObj.resize = this.resize.bind(this);
        this.domObj.setStyle('position', this.options.position);
        this.domObj.store('jxLayout', this);

        if (document.body == this.domObj.parentNode) {
            window.addEvent('resize', this.windowResize.bindWithEvent(this));
            window.addEvent('load', this.windowResize.bind(this));                
        }
        //this.resize();
    },
    
    /**
     * Method: windowResize
     * when the window is resized, any Jx.Layout controlled elements that are
     * direct children of the BODY element are resized
     */
     windowResize: function() {
         this.resize();
         if (this.resizeTimer) {
             $clear(this.resizeTimer);
             this.resizeTimer = null;
         }
         this.resizeTimer = this.resize.delay(50, this);
    },
    
    /**
     * Method: resize
     * resize the element controlled by this Jx.Layout object.
     *
     * Parameters:
     * options - new options to apply, see <Jx.Layout.Options>
     */
    resize: function(options) {
         /* this looks like a really big function but actually not
          * much code gets executed in the two big if statements
          */
        this.resizeTimer = null;
        var needsResize = false;
        if (options) {
            for (var i in options) {
                //prevent forceResize: false from causing a resize
                if (i == 'forceResize') {
                    continue;
                }
                if (this.options[i] != options[i]) {
                    needsResize = true;
                    this.options[i] = options[i];
                }
            }
            if (options.forceResize) {
                needsResize = true;
            }
        }
        if (!$(this.domObj.parentNode)) {
            return;
        }
        
        var parentSize;
        if (this.domObj.parentNode.tagName == 'BODY') {
            parentSize = Jx.getPageDimensions();
        } else {
            parentSize = $(this.domObj.parentNode).getContentBoxSize();
        }
    
        if (this.lastParentSize && !needsResize) {
            needsResize = (this.lastParentSize.width != parentSize.width || 
                          this.lastParentSize.height != parentSize.height);
        } else {
            needsResize = true;
        }
        this.lastParentSize = parentSize;            
        
        if (!needsResize) {
            return;
        }
        
        var l, t, w, h;
        
        /* calculate left and width */
        if (this.options.left != null) {
            /* fixed left */
            l = this.options.left;
            if (this.options.right == null) {
                /* variable right */
                if (this.options.width == null) {
                    /* variable right and width
                     * set right to min, stretch width */
                    w = parentSize.width - l;
                    if (w < this.options.minWidth ) {
                        w = this.options.minWidth;
                    }
                    if (this.options.maxWidth >= 0 && w > this.options.maxWidth) {
                        w = this.options.maxWidth;
                    }
                } else {
                    /* variable right, fixed width
                     * use width
                     */
                    w = this.options.width;
                }
            } else {
                /* fixed right */
                if (this.options.width == null) {
                    /* fixed right, variable width
                     * stretch width
                     */
                    w = parentSize.width - l - this.options.right;
                    if (w < this.options.minWidth) {
                        w = this.options.minWidth;
                    }
                    if (this.options.maxWidth >= 0 && w > this.options.maxWidth) {
                        w = this.options.maxWidth;
                    }
                } else {
                    /* fixed right, fixed width
                     * respect left and width, allow right to stretch
                     */
                    w = this.options.width;
                }
            }
            
        } else {
            if (this.options.right == null) {
                if (this.options.width == null) {
                    /* variable left, width and right
                     * set left, right to min, stretch width
                     */
                     l = 0;
                     w = parentSize.width;
                     if (this.options.maxWidth >= 0 && w > this.options.maxWidth) {
                         l = l + parseInt(w - this.options.maxWidth)/2;
                         w = this.options.maxWidth;
                     }
                } else {
                    /* variable left, fixed width, variable right
                     * distribute space between left and right
                     */
                    w = this.options.width;
                    l = parseInt((parentSize.width - w)/2);
                    if (l < 0) {
                        l = 0;
                    }
                }
            } else {
                if (this.options.width != null) {
                    /* variable left, fixed width, fixed right
                     * left is calculated directly
                     */
                    w = this.options.width;
                    l = parentSize.width - w - this.options.right;
                    if (l < 0) {
                        l = 0;
                    }
                } else {
                    /* variable left and width, fixed right
                     * set left to min value and stretch width
                     */
                    l = 0;
                    w = parentSize.width - this.options.right;
                    if (w < this.options.minWidth) {
                        w = this.options.minWidth;
                    }
                    if (this.options.maxWidth >= 0 && w > this.options.maxWidth) {
                        l = w - this.options.maxWidth - this.options.right;
                        w = this.options.maxWidth;                        
                    }
                }
            }
        }
        
        /* calculate the top and height */
        if (this.options.top != null) {
            /* fixed top */
            t = this.options.top;
            if (this.options.bottom == null) {
                /* variable bottom */
                if (this.options.height == null) {
                    /* variable bottom and height
                     * set bottom to min, stretch height */
                    h = parentSize.height - t;
                    if (h < this.options.minHeight) {
                        h = this.options.minHeight;
                    }
                    if (this.options.maxHeight >= 0 && h > this.options.maxHeight) {
                        h = this.options.maxHeight;
                    }
                } else {
                    /* variable bottom, fixed height
                     * stretch height
                     */
                    h = this.options.height;
                    if (this.options.maxHeight >= 0 && h > this.options.maxHeight) {
                        t = h - this.options.maxHeight;
                        h = this.options.maxHeight;
                    }
                }
            } else {
                /* fixed bottom */
                if (this.options.height == null) {
                    /* fixed bottom, variable height
                     * stretch height
                     */
                    h = parentSize.height - t - this.options.bottom;
                    if (h < this.options.minHeight) {
                        h = this.options.minHeight;
                    }
                    if (this.options.maxHeight >= 0 && h > this.options.maxHeight) {
                        h = this.options.maxHeight;
                    }                
                } else {
                    /* fixed bottom, fixed height
                     * respect top and height, allow bottom to stretch
                     */
                    h = this.options.height;
                }
            }
        } else {
            if (this.options.bottom == null) {
                if (this.options.height == null) {
                    /* variable top, height and bottom
                     * set top, bottom to min, stretch height
                     */
                     t = 0;
                     h = parentSize.height;
                     if (h < this.options.minHeight) {
                         h = this.options.minHeight;
                     }
                     if (this.options.maxHeight >= 0 && h > this.options.maxHeight) {
                         t = parseInt((parentSize.height - this.options.maxHeight)/2);
                         h = this.options.maxHeight;
                     }
                } else {
                    /* variable top, fixed height, variable bottom
                     * distribute space between top and bottom
                     */
                    h = this.options.height;
                    t = parseInt((parentSize.height - h)/2);
                    if (t < 0) {
                        t = 0;
                    }
                }
            } else {
                if (this.options.height != null) {
                    /* variable top, fixed height, fixed bottom
                     * top is calculated directly
                     */
                    h = this.options.height;
                    t = parentSize.height - h - this.options.bottom;
                    if (t < 0) {
                        t = 0;
                    }
                } else {
                    /* variable top and height, fixed bottom
                     * set top to min value and stretch height
                     */
                    t = 0;
                    h = parentSize.height - this.options.bottom;
                    if (h < this.options.minHeight) {
                        h = this.options.minHeight;
                    }
                    if (this.options.maxHeight >= 0 && h > this.options.maxHeight) {
                        t = parentSize.height - this.options.maxHeight - this.options.bottom;
                        h = this.options.maxHeight;
                    }
                }
            }
        }
        
        //TODO: check left, top, width, height against current styles
        // and only apply changes if they are not the same.
        
        /* apply the new sizes */
        var sizeOpts = {width: w};
        if (this.options.position == 'absolute') {
            var padding = $(this.domObj.parentNode).getPaddingSize();
            this.domObj.setStyles({
                position: this.options.position,
                left: l+padding.left,
                top: t+padding.top
            });
            sizeOpts.height = h;
        } else {
            if (this.options.height) {
                sizeOpts.height = this.options.height;
            }
        }
        this.domObj.setBorderBoxSize(sizeOpts);
        
        if (this.options.propagate) {
            // propogate changes to children
            var o = {forceResize: options ? options.forceResize : false};
            $A(this.domObj.childNodes).each(function(child){
                if (child.resize && child.getStyle('display') != 'none') {
                    child.resize.delay(0,child,o);                
                }
            });
        }

        this.fireEvent('sizeChange',this);
    }
});// $Id: tab.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Button.Tab
 *
 * Extends: <Jx.Button>
 *
 * Implements: <Jx.ContentLoader>
 *
 * A single tab in a tab set.  A tab has a label (displayed in the tab) and a
 * content area that is displayed when the tab is active.  A tab has to be
 * added to both a <Jx.TabSet> (for the content) and <Jx.Toolbar> (for the
 * actual tab itself) in order to be useful.  Alternately, you can use
 * a <Jx.TabBox> which combines both into a single control at the cost of
 * some flexibility in layout options.
 *
 * A tab is a <Jx.ContentLoader> and you can specify the initial content of
 * the tab using any of the methods supported by 
 * <Jx.ContentLoader::loadContent>.  You can acccess the actual DOM element
 * that contains the content (if you want to dynamically insert content
 * for instance) via the <Jx.Tab::content> property.
 *
 * A tab is a button of type *toggle* which means that it emits the *up*
 * and *down* events.
 *
 * Example:
 * (code)
 * var tab1 = new Jx.Button.Tab({
 *     label: 'tab 1', 
 *     content: 'content1',
 *     onDown: function(tab) {
 *         console.log('tab became active');
 *     },
 *     onUp: function(tab) {
 *         console.log('tab became inactive');
 *     }
 * });
 * (end)
 *
 * 
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button.Tab = new Class({
    Family: 'Jx.Button.Tab',
    Extends: Jx.Button,
    Implements: [Jx.ContentLoader],
    /**
     * Property: content
     * {HTMLElement} The content area that is displayed when the tab is active.
     */
    content: null,
    /**
     * Constructor: Jx.Button.Tab
     * Create a new instance of Jx.Button.Tab.  Any layout options passed are used
     * to create a <Jx.Layout> for the tab content area.
     *
     * Parameters:
     * options - {Object} an object containing options that are used
     * to control the appearance of the tab.  See <Jx.Button>,
     * <Jx.ContentLoader::loadContent> and <Jx.Layout::Jx.Layout> for
     * valid options.
     */
    initialize : function( options) {
        this.parent($merge(options, {type:'Tab', toggle:true}));
        this.content = new Element('div', {'class':'tabContent'});
        new Jx.Layout(this.content, options);
        this.loadContent(this.content);
        var that = this;
        this.addEvent('down', function(){that.content.addClass('tabContentActive');});
        this.addEvent('up', function(){that.content.removeClass('tabContentActive');});
        
        if (this.options.close) {
            this.domObj.addClass('jxTabClose');
            var a = new Element('a', {
                'class': 'jxTabClose',
                events: {
                    'click': (function(){
                        this.fireEvent('close');                        
                    }).bind(this)
                } 
            });
            a.adopt(new Element('img', {
                src: Jx.aPixel.src,
                alt: '',
                title: ''
            }));
            this.domObj.adopt(a);
        }
    },
    /**
     * Method: clicked
     * triggered when the user clicks the button, processes the
     * actionPerformed event
     */
    clicked : function(evt) {
        if (this.options.enabled) {
            this.setActive(true);            
        }
    }
});// $Id: colorpalette.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.ColorPalette
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * A Jx.ColorPalette presents a user interface for selecting colors.
 * Currently, the user can either enter a HEX colour value or select from a
 * palette of web-safe colours.  The user can also enter an opacity value.
 *
 * A Jx.ColorPalette can be embedded anywhere in a web page using its addTo
 * method.  However, a <Jx.Button> subclass is provided (<Jx.Button.Color>)
 * that embeds a colour panel inside a button for easy use in toolbars.
 *
 * Colour changes are propogated via a change event.  To be notified 
 * of changes in a Jx.ColorPalette, use the addEvent method.
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * change - triggered when the color changes.
 * click - the user clicked on a color swatch (emitted after a change event)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.ColorPalette = new Class({
    Family: 'Jx.ColorPalette',
    Implements: [Options, Events, Jx.Addable],
    /**
     * Property: {HTMLElement} domObj
     * the HTML element representing the color panel
     */
    domObj: null,
    options: {
        /* Option: parent
         * default null, the DOM element to add the palette to.
         */
        parent: null,
        /* Option: color
         * default #000000, the initially selected color
         */
        color: '#000000',
        /* Option: alpha
         * default 100, the initial alpha value
         */
        alpha: 1,
        /* Option: hexColors
         * an array of hex colors for creating the palette, defaults to a
         * set of web safe colors.
         */
        hexColors: ['00', '33', '66', '99', 'CC', 'FF'],
        /* Option: alphaLabel
         * the text to display next to the alpha input for i18n.
         */
        alphaLabel: 'alpha (%)'
    },
    /**
     * Constructor: Jx.ColorPalette
     * initialize a new instance of Jx.ColorPalette
     *
     * Parameters:
     * options - <Jx.ColorPalette.Options>
     */
    initialize: function(options) {
        this.setOptions(options);

        this.domObj = new Element('div', {
            id: this.options.id,
            'class':'jxColorPalette'
        });

        var top = new Element('div', {'class':'jxColorBar'});
        var d = new Element('div', {'class':'jxColorPreview'});

        this.selectedSwatch = new Element('div', {'class':'jxColorSelected'});
        this.previewSwatch = new Element('div', {'class':'jxColorHover'});
        d.adopt(this.selectedSwatch);
        d.adopt(this.previewSwatch);
        
        top.adopt(d);

        this.colorInputLabel = new Element('label', {'class':'jxColorLabel', html:'#'});
        top.adopt(this.colorInputLabel);

        var cc = this.changed.bind(this);
        this.colorInput = new Element('input', {
            'class':'jxHexInput',
            'type':'text',
            'maxLength':6,
            events: {
                'keyup':cc,
                'blur':cc,
                'change':cc
            }
        });

        top.adopt(this.colorInput);

        this.alphaLabel = new Element('label', {'class':'jxAlphaLabel', 'html':this.options.alphaLabel});
        top.adopt(this.alphaLabel);

        this.alphaInput = new Element('input', {
            'class':'jxAlphaInput',
            'type':'text',
            'maxLength':3,
            events: {
                'keyup': this.alphaChanged.bind(this)
            }
        });
        top.adopt(this.alphaInput);

        this.domObj.adopt(top);

        var swatchClick = this.swatchClick.bindWithEvent(this);
        var swatchOver = this.swatchOver.bindWithEvent(this);

        var table = new Element('table', {'class':'jxColorGrid'});
        var tbody = new Element('tbody');
        table.adopt(tbody);
        for (var i=0; i<12; i++) {
            var tr = new Element('tr');
            for (var j=-3; j<18; j++) {
                var bSkip = false;
                var r, g, b;
                /* hacky approach to building first three columns
                 * because I couldn't find a good way to do it
                 * programmatically
                 */

                if (j < 0) {
                    if (j == -3 || j == -1) {
                        r = g = b = 0;
                        bSkip = true;
                    } else {
                        if (i<6) {
                            r = g = b = i;
                        } else {
                            if (i == 6) {
                                r = 5; g = 0; b = 0;
                            } else if (i == 7) {
                                r = 0; g = 5; b = 0;
                            } else if (i == 8) {
                                r = 0; g = 0; b = 5;
                            } else if (i == 9) {
                                r = 5; g = 5; b = 0;
                            } else if (i == 10) {
                                r = 0; g = 5; b = 5;
                            } else if (i == 11) {
                                r = 5; g = 0; b = 5;
                            }
                        }
                    }
                } else {
                    /* remainder of the columns are built
                     * based on the current row/column
                     */
                    r = parseInt(i/6)*3 + parseInt(j/6);
                    g = j%6;
                    b = i%6;
                }
                var bgColor = '#'+this.options.hexColors[r]+this.options.hexColors[g]+this.options.hexColors[b];

                var td = new Element('td');
                if (!bSkip) {
                    td.setStyle('backgroundColor', bgColor);

                    var a = new Element('a', {
                        'class': 'colorSwatch ' + (((r > 2 && g > 2) || (r > 2 && b > 2) || (g > 2 && b > 2)) ? 'borderBlack': 'borderWhite'),
                        'href':'javascript:void(0)',
                        'title':bgColor,
                        'alt':bgColor,
                        events: {
                            'mouseover': swatchOver,
                            'click': swatchClick
                        }
                    });
                    a.store('swatchColor', bgColor);
                    td.adopt(a);
                } else {
                    var span = new Element('span', {'class':'emptyCell'});
                    td.adopt(span);
                }
                tr.adopt(td);
            }
            tbody.adopt(tr);
        }
        this.domObj.adopt(table);
        this.updateSelected();
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },

    /**
     * Method: swatchOver
     * handle the mouse moving over a colour swatch by updating the preview
     *
     * Parameters:
     * e - {Event} the mousemove event object
     */
    swatchOver: function(e) {
        var a = e.target;

        this.previewSwatch.setStyle('backgroundColor', a.retrieve('swatchColor'));
    },

    /**
     * Method: swatchClick
     * handle mouse click on a swatch by updating the color and hiding the
     * panel.
     *
     * Parameters:
     * e - {Event} the mouseclick event object
     */
    swatchClick: function(e) {
        var a = e.target;

        this.options.color = a.retrieve('swatchColor');
        this.updateSelected();
        this.fireEvent('click', this);
    },

    /**
     * Method: changed
     * handle the user entering a new colour value manually by updating the
     * selected colour if the entered value is valid HEX.
     */
    changed: function() {
        var color = this.colorInput.value;
        if (color.substring(0,1) == '#') {
            color = color.substring(1);
        }
        if (color.toLowerCase().match(/^[0-9a-f]{6}$/)) {
            this.options.color = '#' +color.toUpperCase();
            this.updateSelected();
        }
    },

    /**
     * Method: alphaChanged
     * handle the user entering a new alpha value manually by updating the
     * selected alpha if the entered value is valid alpha (0-100).
     */
    alphaChanged: function() {
        var alpha = this.alphaInput.value;
        if (alpha.match(/^[0-9]{1,3}$/)) {
            this.options.alpha = parseFloat(alpha/100);
            this.updateSelected();
        }
    },

    /**
     * Method: setColor
     * set the colour represented by this colour panel
     *
     * Parameters:
     * color - {String} the new hex color value
     */
    setColor: function( color ) {
        this.colorInput.value = color;
        this.changed();
    },

    /**
     * Method: setAlpha
     * set the alpha represented by this colour panel
     *
     * Parameters:
     * alpha - {Integer} the new alpha value (between 0 and 100)
     */
    setAlpha: function( alpha ) {
        this.alphaInput.value = alpha;
        this.alphaChanged();
    },

    /**
     * Method: updateSelected
     * update the colour panel user interface based on the current
     * colour and alpha values
     */
    updateSelected: function() {
        var styles = {'backgroundColor':this.options.color};

        this.colorInput.value = this.options.color.substring(1);

        this.alphaInput.value = parseInt(this.options.alpha*100);
        if (this.options.alpha < 1) {
            styles.opacity = this.options.alpha;
            styles.filter = 'Alpha(opacity='+(this.options.alpha*100)+')';
        } else {
            styles.opacity = '';
            styles.filter = '';
        }
        this.selectedSwatch.setStyles(styles);
        this.previewSwatch.setStyles(styles);
        this.fireEvent('change', this);
    }
});

// $Id: color.js 423 2009-05-12 12:37:56Z pagameba $ 
/**
 * Class: Jx.Button.Color
 *
 * Extends: <Jx.Button.Flyout>
 *
 * A <Jx.ColorPalette> wrapped up in a Jx.Button.  The button includes a
 * preview of the currently selected color.  Clicking the button opens
 * the color panel.
 *
 * A color button is essentially a <Jx.Button.Flyout> where the content
 * of the flyout is a <Jx.ColorPalette>.  For performance, all color buttons
 * share an instance of <Jx.ColorPalette> which means only one button can be
 * open at a time.  This isn't a huge restriction as flyouts already close
 * each other when opened.
 *
 * Example:
 * (code)
 * var colorButton = new Jx.Button.Color({
 *     onChange: function(button) {
 *         console.log('color:' + button.options.color + ' alpha: ' +
 *                     button.options.alpha);
 *     }
 * });
 * (end)
 *
 * Events:
 * change - fired when the color is changed.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button.Color = new Class({
    Family: 'Jx.Button.Color',
    Extends: Jx.Button.Flyout,
    
    swatch: null,
     
    options: {
        /**
         * Option: color
         * a color to initialize the panel with, defaults to #000000
         * (black) if not specified.
         */
        color: '#000000',
        /**
         * Option: alpha
         * an alpha value to initialize the panel with, defaults to 1
         *  (opaque) if not specified.
         *
         */
        alpha: 100
    },

    /**
     * Constructor: Jx.Button.Color
     * initialize a new color button.
     *
     * Parameters:
     * options - <Jx.Button.Color.Options> initialize instance options.
     *
     */
    initialize: function(options) {
        if (!Jx.Button.Color.ColorPalette) {
            Jx.Button.Color.ColorPalette = new Jx.ColorPalette(this.options);
        }
        var d = new Element('span', {'class':'jxButtonSwatch'});

        this.selectedSwatch = new Element('span');
        d.appendChild(this.selectedSwatch);

        this.colorChangeFn = this.changed.bind(this);
        this.hideFn = this.hide.bind(this);
        /* we need to have an image to replace, but if a label is 
           requested, there wouldn't normally be an image. */
        options.image = Jx.aPixel.src;

        /* now we can safely initialize */
        this.parent(options);
        
        // now replace the image with our swatch
        d.replaces(this.domImg);
        this.updateSwatch();
    },

    /**
     * Method: clicked
     * override <Jx.Button.Flyout> to use a singleton color palette.
     */
    clicked: function() {
        if (Jx.Button.Color.ColorPalette.currentButton) {
            Jx.Button.Color.ColorPalette.currentButton.hide();
        }
        Jx.Button.Color.ColorPalette.currentButton = this;
        Jx.Button.Color.ColorPalette.addEvent('change', this.colorChangeFn);
        Jx.Button.Color.ColorPalette.addEvent('click', this.hideFn);
        this.content.appendChild(Jx.Button.Color.ColorPalette.domObj);
        Jx.Button.Color.ColorPalette.domObj.setStyle('display', 'block');
        Jx.Button.Flyout.prototype.clicked.apply(this, arguments);
        /* setting these before causes an update problem when clicking on
         * a second color button when another one is open - the color
         * wasn't updating properly
         */
         
        Jx.Button.Color.ColorPalette.options.color = this.options.color;
        Jx.Button.Color.ColorPalette.options.alpha = this.options.alpha/100;
        Jx.Button.Color.ColorPalette.updateSelected();
},

    /**
     * Method: hide
     * hide the color panel
     */
    hide: function() {
        this.setActive(false);
        Jx.Button.Color.ColorPalette.removeEvent('change', this.colorChangeFn);
        Jx.Button.Color.ColorPalette.removeEvent('click', this.hideFn);
        Jx.Button.Flyout.prototype.hide.apply(this, arguments);
        Jx.Button.Color.ColorPalette.currentButton = null;
    },

    /**
     * Method: setColor
     * set the color represented by this color panel
     *
     * Parameters:
     * color - {String} the new hex color value
     */
    setColor: function(color) {
        this.options.color = color;
        this.updateSwatch();
    },

    /**
     * Method: setAlpha
     * set the alpha represented by this color panel
     *
     * Parameters:
     * alpha - {Integer} the new alpha value (between 0 and 100)
     */
    setAlpha: function(alpha) {
        this.options.alpha = alpha;
        this.updateSwatch();
    },

    /**
     * Method: changed
     * handle the color changing in the palette by updating the preview swatch
     * in the button and firing the change event.
     *
     * Parameters:
     * panel - <Jx.ColorPalette> the palette that changed.
     */
    changed: function(panel) {
        var changed = false;
        if (this.options.color != panel.options.color) {
            this.options.color = panel.options.color;
            changed = true;
        }
        if (this.options.alpha != panel.options.alpha * 100) {
            this.options.alpha = panel.options.alpha * 100;
            changed = true;
        }
        if (changed) {
            this.updateSwatch();
            this.fireEvent('change',this);
        }
    },

    /**
     * Method: updateSwatch
     * Update the swatch color for the current color
     */
    updateSwatch: function() {
        var styles = {'backgroundColor':this.options.color};
        if (this.options.alpha < 100) {
            styles.filter = 'Alpha(opacity='+(this.options.alpha)+')';
            styles.opacity = this.options.alpha / 100;
            
        } else {
            styles.opacity = '';
            styles.filter = '';
        }
        this.selectedSwatch.setStyles(styles);
    }
});
// $Id: menu.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Menu
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.AutoPosition>, <Jx.Chrome>, <Jx.Addable>
 *
 * A main menu as opposed to a sub menu that lives inside the menu.
 *
 * TODO: Jx.Menu
 * revisit this to see if Jx.Menu and Jx.SubMenu can be merged into
 * a single implementation.
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Menu = new Class({
    Family: 'Jx.Menu',
    /**
     * Implements:
     * * Options
     * * Events
     * * <Jx.AutoPosition>
     * * <Jx.Chrome>
     * * <Jx.Addable>
     */
    Implements: [Options, Events, Jx.AutoPosition, Jx.Chrome, Jx.Addable],
    /**
     * Property: domObj
     * {HTMLElement} The HTML element containing the menu.
     */
    domObj : null,
    /**
     * Property: button
     * {<Jx.Button>} The button that represents this menu in a toolbar and
     * opens the menu.
     */
    button : null,
    /**
     * Property: subDomObj
     * {HTMLElement} the HTML element that contains the menu items
     * within the menu.
     */
    subDomObj : null,
    /**
     * Property: items
     * {Array} the items in this menu
     */
    items : null,
    /**
     * Constructor: Jx.Menu
     * Create a new instance of Jx.Menu.
     *
     * Parameters:
     * options - see <Jx.Button.Options>.  If no options are provided then
     * no button is created.
     */
    initialize : function(options) {
        this.setOptions(options);
        if (!Jx.Menu.Menus) {
            Jx.Menu.Menus = [];
        }
        /* stores menu items and sub menus */
        this.items = [];
        
        this.contentContainer = new Element('div',{
            'class':'jxMenuContainer',
            events: {
                contextmenu: function(e){e.stop();}
            }
        });
        
        /* the DOM element that holds the actual menu */
        this.subDomObj = new Element('ul',{
            'class':'jxMenu'
        });
        
        this.contentContainer.adopt(this.subDomObj);
        
        /* if options are passed, make a button inside an LI so the
           menu can be embedded inside a toolbar */
        if (options) {
            this.button = new Jx.Button($merge(options,{
                onClick:this.show.bind(this)
            }));
            this.button.domA.addClass('jxButtonMenu');
            this.button.domA.addEvent('mouseover', this.onMouseOver.bindWithEvent(this));
            
            this.domObj = this.button.domObj;
        }
        
        /* pre-bind the hide function for efficiency */
        this.hideWatcher = this.hide.bindWithEvent(this);
        this.keypressWatcher = this.keypressHandler.bindWithEvent(this);
        
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    /**
     * Method: add
     * Add menu items to the sub menu.
     *
     * Parameters:
     * item - {<Jx.MenuItem>} the menu item to add.  Multiple menu items
     * can be added by passing multiple arguments to this function.
     */
    add : function() {
        $A(arguments).flatten().each(function(item){
            this.items.push(item);
            item.setOwner(this);
            this.subDomObj.adopt(item.domObj);
        }, this);
        return this;
    },
    /**
     * Method: deactivate
     * Deactivate the menu by hiding it.
     */
    deactivate: function() {this.hide();},
    /**
     * Method: onMouseOver
     * Handle the user moving the mouse over the button for this menu
     * by showing this menu and hiding the other menu.
     *
     * Parameters:
     * e - {Event} the mouse event
     */
    onMouseOver: function(e) {
        if (Jx.Menu.Menus[0] && Jx.Menu.Menus[0] != this) {
            this.show({event:e});
        }
    },
    
    /**
     * Method: eventInMenu
     * determine if an event happened inside this menu or a sub menu
     * of this menu.
     *
     * Parameters:
     * e - {Event} the mouse event
     *
     * Returns:
     * {Boolean} true if the event happened in the menu or
     * a sub menu of this menu, false otherwise
     */
    eventInMenu: function(e) {
        var target = $(e.target);
        if (!target) {
            return false;
        }
        if (target.descendantOf(this.domObj) ||
            target.descendantOf(this.subDomObj)) {
            return true;
        } else {
            var ul = target.findElement('ul');
            if (ul) {
                var sm = ul.retrieve('jxSubMenu');
                if (sm) {
                    var owner = sm.owner;
                    while (owner) {
                        if (owner == this) {
                            return true;
                        }
                        owner = owner.owner;
                    }
                }
            }
            return false;
        }
    },
    
    /**
     * Method: hide
     * Hide the menu.
     *
     * Parameters:
     * e - {Event} the mouse event
     */
    hide: function(e) {
        if (e) {
            if (this.visibleItem && this.visibleItem.eventInMenu) {
                if (this.visibleItem.eventInMenu(e)) {
                    return;
                }
            } else if (this.eventInMenu(e)) {
                return;
            }
        }
        if (Jx.Menu.Menus[0] && Jx.Menu.Menus[0] == this) {
            Jx.Menu.Menus[0] = null;
        }
        if (this.button && this.button.domA) {
            this.button.domA.removeClass('jx'+this.button.options.type+'Active');            
        }
        this.items.each(function(item){item.hide(e);});
        document.removeEvent('mousedown', this.hideWatcher);
        document.removeEvent('keydown', this.keypressWatcher);
        this.contentContainer.setStyle('display','none');
        this.fireEvent('hide', this); 
    },
    /**
     * Method: show
     * Show the menu
     *
     * Parameters:
     * e - {Event} the mouse event
     */
    show : function(o) {
        var e = o.event;
        if (Jx.Menu.Menus[0]) {
            if (Jx.Menu.Menus[0] != this) {
                Jx.Menu.Menus[0].button.blur();
                Jx.Menu.Menus[0].hide(e);
            } else {
                this.hide();
                return;
            }  
        } 
        if (this.items.length === 0) {
            return;
        }
        Jx.Menu.Menus[0] = this;
        this.button.focus();
        this.contentContainer.setStyle('visibility','hidden');
        this.contentContainer.setStyle('display','block');
        $(document.body).adopt(this.contentContainer);            
        /* we have to size the container for IE to render the chrome correctly
         * but just in the menu/sub menu case - there is some horrible peekaboo
         * bug in IE related to ULs that we just couldn't figure out
         */
        this.contentContainer.setContentBoxSize(this.subDomObj.getMarginBoxSize());
        this.showChrome(this.contentContainer);
        
        this.position(this.contentContainer, this.button.domObj, {
            horizontal: ['left left'],
            vertical: ['bottom top', 'top bottom'],
            offsets: this.chromeOffsets
        });

        this.contentContainer.setStyle('visibility','');
        
        if (this.button && this.button.domA) {
            this.button.domA.addClass('jx'+this.button.options.type+'Active');            
        }
        if (e) {
            //why were we doing this? it is affecting the closing of
            //other elements like flyouts (issue 13)
            //e.stop();
        }
        /* fix bug in IE that closes the menu as it opens because of bubbling */
        document.addEvent('mousedown', this.hideWatcher);
        document.addEvent('keydown', this.keypressWatcher);
        this.fireEvent('show', this); 
    },
    /**
     * Method: setVisibleItem
     * Set the sub menu that is currently open
     *
     * Parameters:
     * obj- {<Jx.SubMenu>} the sub menu that just became visible
     */
    setVisibleItem: function(obj) {
        if (this.visibleItem != obj) {
            if (this.visibleItem && this.visibleItem.hide) {
                this.visibleItem.hide();
            }
            this.visibleItem = obj;
            this.visibleItem.show();
        }
    },

    /* hide flyout if the user presses the ESC key */
    keypressHandler: function(e) {
        e = new Event(e);
        if (e.key == 'esc') {
            this.hide();
        }
    }
});

// $Id: set.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.ButtonSet
 *
 * Extends: Object
 *
 * Implements: Options, Events
 *
 * A ButtonSet manages a set of <Jx.Button> instances by ensuring that only one
 * of the buttons is active.  All the buttons need to have been created with
 * the toggle option set to true for this to work.
 *
 * Example:
 * (code)
 * var toolbar = new Jx.Toolbar('bar');
 * var buttonSet = new Jx.ButtonSet();
 * 
 * var tab1 = new Jx.Button({label: 'b1', toggle:true, contentID: 'content1'});
 * var tab2 = new Jx.Button({label: 'b2', toggle:true, contentID: 'content2'});
 * var tab3 = new Jx.Button({label: 'b3', toggle:true, contentID: 'content3'});
 * var tab4 = new Jx.Button({label: 'b4', toggle:true, contentURL: 'test_content.html'});
 * 
 * buttonSet.add(b1,b2,b3,b4);
 * (end)
 *
 * Events:
 * change - the current button has changed
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.ButtonSet = new Class({
    Family: 'Jx.ButtonSet',
    Implements: [Options,Events],
    /**
     * Property: buttons
     * {Array} array of buttons that are managed by this button set
     */
    buttons: null,
    /**
     * Constructor: Jx.ButtonSet
     * Create a new instance of <Jx.ButtonSet>
     *
     * Parameters:
     * options - an options object, only event handlers are supported
     * as options at this time.
     */
    initialize : function(options) {
        this.setOptions(options);
        this.buttons = [];
        this.buttonChangedHandler = this.buttonChanged.bind(this);
    },
    
    /**
     * Method: add
     * Add one or more <Jx.Button>s to the ButtonSet.
     *
     * Parameters:
     * button - {<Jx.Button>} an instance of <Jx.Button> to add to the button set.  More
     * than one button can be added by passing extra parameters to this method.
     */
    add : function() {
        $A(arguments).each(function(button) {
            if (button.domObj.hasClass('jx'+button.options.type+'Toggle')) {
                button.domObj.removeClass('jx'+button.options.type+'Toggle');
                button.domObj.addClass('jx'+button.options.type+'Set');                
            }
            button.addEvent('down',this.buttonChangedHandler);
            var that = this;
            button.setActive = function(active) {
                if (this.options.active && that.activeButton == this) {
                    return;
                } else {
                    Jx.Button.prototype.setActive.apply(this, [active]);
                }
            };
            if (!this.activeButton || button.options.active) {
                button.options.active = false;
                button.setActive(true);
            }
            this.buttons.push(button);
        }, this);
        return this;
    },
    /**
     * Method: remove
     * Remove a button from this Button.
     *
     * Parameters:
     * button - {<Jx.Button>} the button to remove.
     */
    remove : function(button) {
        this.buttons.erase(button);
        if (this.activeButton == button) {
            if (this.buttons.length) {
                this.buttons[0].setActive(true);
            }
            button.removeEvent('down',this.buttonChangedHandler);
            button.setActive = Jx.Button.prototype.setActive;
        }
    },
    /**
     * Method: setActiveButton
     * Set the active button to the one passed to this method
     *
     * Parameters:
     * button - {<Jx.Button>} the button to make active.
     */
    setActiveButton: function(button) {
        var b = this.activeButton;
        this.activeButton = button;
        if (b && b != button) {
            b.setActive(false);
        }
    },
    /**
     * Method: selectionChanged
     * Handle selection changing on the buttons themselves and activate the
     * appropriate button in response.
     *
     * Parameters:
     * button - {<Jx.Button>} the button to make active.
     */
    buttonChanged: function(button) {
        this.setActiveButton(button);
        this.fireEvent('change', this);
    }
});



// $Id: multi.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Button.Multi
 *
 * Extends: <Jx.Button>
 *
 * Implements: 
 *
 * Multi buttons are used to contain multiple buttons in a drop down list
 * where only one button is actually visible and clickable in the interface.
 * 
 * When the user clicks the active button, it performs its normal action.
 * The user may also click a drop-down arrow to the right of the button and
 * access the full list of buttons.  Clicking a button in the list causes
 * that button to replace the active button in the toolbar and performs
 * the button's regular action.
 *
 * Other buttons can be added to the Multi button using the add method.
 *
 * This is not really a button, but rather a container for buttons.  The
 * button structure is a div containing two buttons, a normal button and
 * a flyout button.  The flyout contains a toolbar into which all the 
 * added buttons are placed.  The main button content is cloned from the
 * last button clicked (or first button added).
 *
 * The Multi button does not trigger any events itself, only the contained
 * buttons trigger events.
 *
 * Example:
 * (code)
 * var b1 = new Jx.Button({
 *     label: 'b1',
 *     onClick: function(button) {
 *         console.log('b1 clicked');
 *     }
 * });
 * var b2 = new Jx.Button({
 *     label: 'b2',
 *     onClick: function(button) {
 *         console.log('b2 clicked');
 *     }
 * });
 * var b3 = new Jx.Button({
 *     label: 'b3',
 *     onClick: function(button) {
 *         console.log('b3 clicked');
 *     }
 * });
 * var multiButton = new Jx.Button.Multi();
 * multiButton.add(b1, b2, b3);
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button.Multi = new Class({
    Family: 'Jx.Button.Multi',

    Extends: Jx.Button,
    /**
     * Property: {<Jx.Button>} activeButton
     * the currently selected button
     */
    activeButton: null,
    /**
     * Property: buttons
     * {Array} the buttons added to this multi button
     */
    buttons: null,
    /**
     * Constructor: Jx.Button.Multi
     * construct a new instance of Jx.Button.Multi.
     */
    initialize: function(opts) {
        this.parent(opts);

        this.buttons = [];

        this.domA.addClass('jxButtonMulti');
        
        this.menu = new Jx.Menu();
        this.menu.button = this;
        this.buttonSet = new Jx.ButtonSet();
        
        this.clickHandler = this.clicked.bind(this);
        
        var a = new Element('a', {
            'class': 'jxButtonDisclose',
            'href': 'javascript:void(0)'
        });
        var button = this;
        var hasFocus;
        
        a.addEvents({
            'click': (function(e) {
                if (this.items.length === 0) {
                    return;
                }
                if (!button.options.enabled) {
                    return;
                }
                this.contentContainer.setStyle('visibility','hidden');
                this.contentContainer.setStyle('display','block');
                $(document.body).adopt(this.contentContainer);            
                /* we have to size the container for IE to render the chrome correctly
                 * but just in the menu/sub menu case - there is some horrible peekaboo
                 * bug in IE related to ULs that we just couldn't figure out
                 */
                this.contentContainer.setContentBoxSize(this.subDomObj.getMarginBoxSize());

                this.showChrome(this.contentContainer);

                this.position(this.contentContainer, this.button.domObj, {
                    horizontal: ['right right'],
                    vertical: ['bottom top', 'top bottom'],
                    offsets: this.chromeOffsets
                });

                this.contentContainer.setStyle('visibility','');

                document.addEvent('mousedown', this.hideWatcher);
                document.addEvent('keyup', this.keypressWatcher);
                
                /* why were we doing this? It was affecting issue 13
                if (e.$extended) {
                    e.stop();                                        
                } else if (e.event && e.event.$extended) {
                    e.event.stop();
                }
                */
                this.fireEvent('show', this);
            }).bindWithEvent(this.menu),
            'mouseenter':(function(){
                $(this.domObj.firstChild).addClass('jxButtonHover');
                if (hasFocus) {
                    a.addClass('jx'+this.options.type+'Pressed');
                }
            }).bind(this),
            'mouseleave':(function(){
                $(this.domObj.firstChild).removeClass('jxButtonHover');
                a.removeClass('jx'+this.options.type+'Pressed');
            }).bind(this),
            mousedown: (function(e) {
                a.addClass('jx'+this.options.type+'Pressed');
                hasFocus = true;
                this.focus();
            }).bindWithEvent(this),
            mouseup: (function(e) {
                a.removeClass('jx'+this.options.type+'Pressed');                  
            }).bindWithEvent(this),
            keydown: (function(e) {
                if (e.key == 'enter') {
                    a.addClass('jx'+this.options.type+'Pressed');
                }
            }).bindWithEvent(this),
            keyup: (function(e) {
                if (e.key == 'enter') {
                    a.removeClass('jx'+this.options.type+'Pressed');
                }
            }).bindWithEvent(this),
            blur: function() { hasFocus = false; }
            
        });
        if (typeof Drag != 'undefined') {
            new Drag(a, {
                onStart: function() {this.stop();}
            });
        }
        
        this.menu.addEvents({
            'show': (function() {
                this.domA.addClass('jxButtonActive');                    
            }).bind(this),
            'hide': (function() {
                if (this.options.active) {
                    this.domA.addClass('jxButtonActive');                    
                }
            }).bind(this)
        });
        a.adopt(new Element('img', {
            src: Jx.aPixel.src,
            alt: '',
            title: ''
        }));
        this.domObj.adopt(a);
        this.discloser = a;
        if (this.options.items) {
            this.add(this.options.items);
        }
    },
    /**
     * Method: add
     * adds one or more buttons to the Multi button.  The first button
     * added becomes the active button initialize.  This function 
     * takes a variable number of arguments, each of which is expected
     * to be an instance of <Jx.Button>.
     *
     * Parameters: 
     * button - {<Jx.Button>} a <Jx.Button> instance, may be repeated in the parameter list
     */
    add: function() {
        $A(arguments).flatten().each(function(theButton){
            if (!theButton instanceof Jx.Button) {
                return;
            }
            this.buttons.push(theButton);
            var f = this.setButton.bind(this, theButton);
            var opts = $merge(
                theButton.options,
                { toggle: true, onClick: f}
            );
            if (!opts.label) {
                opts.label = '&nbsp;';
            }
            if (!opts.image || opts.image.indexOf('a_pixel') != -1) {
                delete opts.image;
            }
            var button = new Jx.Menu.Item(opts);
            this.buttonSet.add(button);
            this.menu.add(button);
            theButton.multiButton = button;
            theButton.domA.addClass('jxButtonMulti');
            if (!this.activeButton) {
                this.domA.dispose();
                this.setActiveButton(theButton);
            }
        }, this);
    },
    /**
     * Method: remove
     * remove a button from a multi button
     *
     * Parameters:
     * button - {<Jx.Button>} the button to remove
     */
    remove: function(button) {
        if (!button || !button.multiButton) {
            return;
        }
        // the toolbar will only remove the li.toolItem, which is
        // the parent node of the multiButton's domObj.
        if (this.menu.remove(button.multiButton)) {
            button.multiButton = null;
            if (this.activeButton == button) {
                // if any buttons are left that are not this button
                // then set the first one to be the active button
                // otherwise set the active button to nothing
                if (!this.buttons.some(function(b) {
                    if (b != button) {
                        this.setActiveButton(b);
                        return true;
                    } else {
                        return false;
                    }
                }, this)) {
                    this.setActiveButton(null);
                }
            }
            this.buttons.erase(button);
        }
    },
    /**
     * Method: setActiveButton
     * update the menu item to be the requested button.
     *
     * Parameters: 
     * button - {<Jx.Button>} a <Jx.Button> instance that was added to this multi button.
     */
    setActiveButton: function(button) {
        if (this.activeButton) {
            this.activeButton.domA.dispose();
            this.activeButton.domA.removeEvent(this.clickHandler);
        }
        if (button && button.domA) {
            this.domObj.grab(button.domA, 'top');
            this.domA = button.domA;
            this.domA.addEvent('click', this.clickHandler);
            if (this.options.toggle) {
                this.options.active = false;
                this.setActive(true); 
            }         
        }
        this.activeButton = button;
    },
    /**
     * Method: setButton
     * update the active button in the menu item, trigger the button's action
     * and hide the flyout that contains the buttons.
     *
     * Parameters: 
     * button - {<Jx.Button>} The button to set as the active button
     */
    setButton: function(button) {
        this.setActiveButton(button);
        button.clicked();
    }
});// $Id: menu.item.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Menu.Item
 *
 * Extends: <Jx.Button>
 *
 * A menu item is a single entry in a menu.  It is typically composed of
 * a label and an optional icon.  Selecting the menu item emits an event.
 *
 * Jx.Menu.Item is represented by a <Jx.Button> with type MenuItem and the
 * associated CSS changes noted in <Jx.Button>.  The container of a MenuItem
 * is an 'li' element.
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * click - fired when the menu item is clicked.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Menu.Item = new Class({
    Family: 'Jx.Menu.Item',
    Extends: Jx.Button,
    /**
     * Property: owner
     * {<Jx.SubMenu> or <Jx.Menu>} the menu that contains the menu item.
     */
    owner: null,
    options: {
        enabled: true,
        image: null,
        label: '&nbsp;',
        toggleClass: 'Toggle'
    },
    /**
     * Constructor: Jx.Menu.Item
     * Create a new instance of Jx.Menu.Item
     *
     * Parameters:
     * options - See <Jx.Button.Options>
     */
    initialize: function(options) {
        this.parent($merge({
                image: Jx.aPixel.src
            },
            options, {
                container:'li',
                type:'MenuItem',
                toggleClass: (options.image ? null : this.options.toggleClass)
            }
        ));
        this.domObj.addEvent('mouseover', this.onMouseOver.bindWithEvent(this));
    },
    /**
     * Method: setOwner
     * Set the owner of this menu item
     *
     * Parameters:
     * obj - {Object} the new owner
     */
    setOwner: function(obj) {
        this.owner = obj;
    },
    /**
     * Method: hide
     * Hide the menu item.
     */
    hide: function() {this.blur();},
    /**
     * Method: show
     * Show the menu item
     */
    show: $empty,
    /**
     * Method: clicked
     * Handle the user clicking on the menu item, overriding the <Jx.Button::clicked>
     * method to facilitate menu tracking
     *
     * Parameters:
     * obj - {Object} an object containing an event property that was the user
     * event.
     */
    clicked: function(obj) {
        if (this.options.enabled) {
            if (this.options.toggle) {
                this.setActive(!this.options.active);
            }
            this.fireEvent('click', this);
            if (this.owner && this.owner.deactivate) {
                this.owner.deactivate(obj.event);
            }
        }
    },
    /**
     * Method: onmouseover
     * handle the mouse moving over the menu item
     *
     * Parameters:
     * e - {Event} the mousemove event
     */
    onMouseOver: function(e) {
        if (this.owner && this.owner.setVisibleItem) {
            this.owner.setVisibleItem(this);
        }
        this.show(e);
    }
});

// $Id: combo.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Button.Combo
 *
 * Extends: <Jx.Button.Multi>
 *
 * A drop down list of selectable items.  Items can be either a string, an image or both.
 *
 * Example:
 * (code)
 * new Jx.Button.Combo({
 *     label: 'Choose a symbol',
 *     items: [
 *         {label: 'Star', image: 'images/swatches.png', imageClass: 'comboStar'},
 *         {label: 'Square', image: 'images/swatches.png', imageClass: 'comboSquare'},
 *         {label: 'Triangle', image: 'images/swatches.png', imageClass: 'comboTriangle'},
 *         {label: 'Circle', image: 'images/swatches.png', imageClass: 'comboCircle'},
 *         {label: 'Plus', image: 'images/swatches.png', imageClass: 'comboPlus'},
 *         {label: 'Cross', image: 'images/swatches.png', imageClass: 'comboCross'}
 *     ],
 *     onChange: function(combo) { alert('you selected ' + combo.getValue()) }
 * })
 * (end)
 *
 * Events:
 * change - triggered when the user selects a new item from the list
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Button.Combo = new Class({
    Family: 'Jx.Button.Combo',
    Extends: Jx.Button.Multi,
    domObj : null,
    ul : null,
    /**
     * Property: currentSelection
     * {Object} current selection in the list 
     */
    currentSelection : null,
    
    options: {
        /* Option: editable
         * boolean, default false.  Can the value be edited by the user?
         */
        editable: false,
        /* Option: label
         * string, default ''.  The label to display next to the combo.
         */
        label: ''
    },
    
    /** 
     * Constructor: Jx.Combo
     * create a new instance of Jx.Combo
     *
     * Parameters:
     * options - <Jx.button.Combo.Options>
     */
    initialize: function(options) {
        this.parent(); //we don't want to pass options to parent
        this.setOptions(options);
        this.domA.removeClass('jxButtonMulti');
        if (this.options.editable) {
            // remove the button's normal A tag and replace it with a span
            // so the input ends up not being inside an A tag - this was
            // causing all kinds of problems for selecting text inside it
            // due to some user-select: none classes that were introduced
            // to make buttons not selectable in the first place.
            //
            // Ultimately I think we want to fix this so that the discloser
            // in Jx.Button.Multi is a separate beast and we can use it here
            // without inheriting from multi buttons
            var s = new Element('span', {'class':'jxButton'});
            s.adopt(this.domA.firstChild);
            this.domA = s.replaces(this.domA);
            this.domA.addClass('jxButtonComboDefault');
            this.domA.addClass('jxButtonEditCombo');
            this.domInput = new Element('input',{
                type:'text',
                events:{
                    change: this.valueChanged.bindWithEvent(this),
                    keydown: this.onKeyPress.bindWithEvent(this),
                    focus: (function() {
                        if (this.domA.hasClass('jxButtonComboDefault')) {
                            this.domInput.value = '';
                            this.domA.removeClass('jxButtonComboDefault');
                        }
                    }).bind(this)
                },
                value: this.options.label
            });
            this.domLabel.empty();
            this.domLabel.addClass('jxComboInput');
            this.domLabel.adopt(this.domInput);
        } else {
            this.discloser.dispose();
            this.domA.addClass('jxButtonCombo');
            this.addEvent('click', (function(e){
                this.discloser.fireEvent('click', e);
            }).bindWithEvent(this));
        }
        this.buttonSet = new Jx.ButtonSet({
            onChange: (function(set) {
                var button = set.activeButton;            
                this.domA.removeClass('jxButtonComboDefault');
                if (this.options.editable) {
                    this.domInput.value = button.options.label;
                } else {
                    var l = button.options.label;
                    if (l == '&nbsp;') {
                        l = '';
                    }
                    this.setLabel(l);
                }
                var img = button.options.image;
                if (img.indexOf('a_pixel') != -1) {
                    img = '';
                }
                this.setImage(img);
                if (this.options.imageClass && this.domImg) {
                    this.domImg.removeClass(this.options.imageClass);
                }
                if (button.options.imageClass && this.domImg) {
                    this.options.imageClass = button.options.imageClass;
                    this.domImg.addClass(button.options.imageClass);
                }
                this.fireEvent('change', this);
            }).bind(this)
        });
        if (this.options.items) {
            this.add(this.options.items);
        }
        this.setEnabled(this.options.enabled);
    },
    
    /**
     * Method: setEnabled
     * enable or disable the combo button.
     *
     * Parameters:
     * enabled - {Boolean} the new enabled state of the button
     */
    setEnabled: function(enabled) {
        this.options.enabled = enabled;
        if (this.options.enabled) {
            this.domObj.removeClass('jxDisabled');
            if (this.domInput) {
                this.domInput.disabled = false;
            }
        } else {
            this.domObj.addClass('jxDisabled');
            if (this.domInput) {
                this.domInput.disabled = true;
            }
        }
    },
    
    /**
     * Method: valueChanged
     * invoked when the current value is changed
     */
    valueChanged: function() {
        this.fireEvent('change', this);
    },
    
    /**
     * Method: onKeyPress
     * Handle the user pressing a key by looking for an ENTER key to set the
     * value.
     *
     * Parameters:
     * e - {Event} the keypress event
     */
    onKeyPress: function(e) {
        if (e.key == 'enter') {
            this.valueChanged();
        }
    },
    
    /**
     * Method: add
     * add a new item to the pick list
     *
     * Parameters:
     * options - {Object} object with properties suitable to be passed to
     * a <Jx.Menu.Item.Options> object.  More than one options object can be
     * passed, comma separated or in an array.
     */
    add: function() {
        $A(arguments).flatten().each(function(opt) {
            var button = new Jx.Menu.Item($merge(opt,{
                toggle: true
            }));
            this.menu.add(button);
            this.buttonSet.add(button);
        }, this);
    },
    
    /**
     * Method: remove
     * Remove the item at the given index.  Not implemented.
     *
     * Parameters:
     * idx - {Integer} the item to remove.
     */
    remove: function(idx) {
        //TODO: implement remove?
    },
    
    /**
     * Method: setValue
     * set the value of the Combo
     *
     * Parameters:
     * value - {Object} the new value.  May be a string, a text node, or
     * another DOM element.
     */
    setValue: function(value) {
        if (this.options.editable) {
            this.domInput.value = value;
        } else {
            this.setLabel(value);
        }
    },
    
    /**
     * Method: getValue
     * Return the current value
     *
     * Returns:
     * {Object} returns the currently selected item
     */
    getValue: function() {
        value = '';
        if (this.options.editable) {
            value = this.domInput.value;
        } else {
            value = this.getLabel();
        }
        return value;
    }
});// $Id: panel.js 428 2009-05-12 15:40:21Z kasi@arielgrafik.de $
/**
 * Class: Jx.Panel
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.ContentLoader>
 *
 * A panel is a fundamental container object that has a content
 * area and optional toolbars around the content area.  It also
 * has a title bar area that contains an optional label and
 * some user controls as determined by the options passed to the
 * constructor.
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * close - fired when the panel is closed
 * collapse - fired when the panel is collapsed
 * expand - fired when the panel is opened
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Panel = new Class({
    Family: 'Jx.Panel',
    Implements: [Options, Events, Jx.ContentLoader, Jx.Addable],
    
    toolbarContainers: {
        top: null,
        right: null,
        bottom: null,
        left: null
    },
    
     options: {
        position: 'absolute',
        type: 'Panel',
        /* Option: id
         * String, an id to assign to the panel's container
         */
        id: '',
        /* Option: label
         * String, the title of the Jx Panel
         */
        label: '&nbsp;',
        /* Option: height
         * integer, fixed height to give the panel - no fixed height by
         * default.
         */
        height: null,
        /* Option: collapse
         * boolean, determine if the panel can be collapsed and expanded
         * by the user.  This puts a control into the title bar for the user
         * to control the state of the panel.
         */
        collapse: true,
        /* Option: collapseTooltip
         * the tooltip to display over the collapse button
         */
        collapseTooltip: 'Collapse/Expand Panel',
        /* Option: collapseLabel
         * the label to use for the collapse menu item
         */
        collapseLabel: 'Collapse',
        /* Option: expandLabel
         * the label to use for the expand menu item
         */
        expandLabel: 'Expand',
        /* Option: maximizeTooltip
         * the tooltip to display over the maximize button
         */
        maximizeTooltip: 'Maximize Panel',
        /* Option: maximizeLabel
         * the label to use for the maximize menu item
         */
        maximizeLabel: 'Maximize',
        /* Option: close
         * boolean, determine if the panel can be closed (hidden) by the user.
         * The application needs to provide a way to re-open the panel after
         * it is closed.  The closeable property extends to dialogs created by
         * floating panels.  This option puts a control in the title bar of
         * the panel.
         */
        close: false,
        /* Option: closeTooltip
         * the tooltip to display over the close button
         */
        closeTooltip: 'Close Panel',
        /* Option: closeLabel
         * the label to use for the close menu item
         */
        closeLabel: 'Close',
        /* Option: closed
         * boolean, initial state of the panel (true to start the panel
         *  closed), default is false
         */
        closed: false,
        /* Option: hideTitle
         * Boolean, hide the title bar if true.  False by default.
         */
        hideTitle: false,
        /* Option: toolbars
         * array of Jx.Toolbar objects to put in the panel.  The position
         * of each toolbar is used to position the toolbar within the panel.
         */
        toolbars: []
    },
    
    /** 
     * Constructor: Jx.Panel
     * Initialize a new Jx.Panel instance
     *
     * Options: <Jx.Panel.Options>, <Jx.ContentLoader.Options>
     */
    initialize : function(options){
        this.setOptions(options);
        this.toolbars = options ? options.toolbars || [] : [];
        
        if ($defined(this.options.height) && !$defined(options.position)) {
            this.options.position = 'relative';
        }

        /* set up the title object */
        this.title = new Element('div', {
            'class': 'jx'+this.options.type+'Title'
        });
        
        var i = new Element('img', {
            'class': 'jx'+this.options.type+'Icon',
            src: Jx.aPixel.src,
            alt: '',
            title: ''
        });
        if (this.options.image) {
            i.setStyle('backgroundImage', 'url('+this.options.image+')');
        }
        this.title.adopt(i);
        
        this.labelObj = new Element('span', {
            'class': 'jx'+this.options.type+'Label',
            html: this.options.label
        });
        this.title.adopt(this.labelObj);
        
        var controls = new Element('div', {
            'class': 'jx'+this.options.type+'Controls'
        });
        var tbDiv = new Element('div');
        controls.adopt(tbDiv);
        this.toolbar = new Jx.Toolbar({parent:tbDiv});
        this.title.adopt(controls);
        
        var that = this;
        
        if (this.options.menu) {
            this.menu = new Jx.Menu({
                image: Jx.aPixel.src
            });
            this.menu.domObj.addClass('jx'+this.options.type+'Menu');
            this.menu.domObj.addClass('jxButtonContentLeft');
            this.toolbar.add(this.menu);
        }
        
        if (this.options.collapse) {
            var b = new Jx.Button({
                image: Jx.aPixel.src,
                tooltip: this.options.collapseTooltip,
                onClick: function() {
                    that.toggleCollapse();
                }
            });
            b.domObj.addClass('jx'+this.options.type+'Collapse');
            this.toolbar.add(b);
            if (this.menu) {
                var item = new Jx.Menu.Item({
                    label: this.options.collapseLabel,
                    onClick: function() { that.toggleCollapse(); }
                });
                this.addEvents({
                    collapse: function() {
                        item.setLabel(this.options.expandLabel);
                    },
                    expand: function() {
                        item.setLabel(this.options.collapseLabel);
                    }
                });
                this.menu.add(item);
            }
        }
        
        if (this.options.maximize) {
            var b = new Jx.Button({
                image: Jx.aPixel.src,
                tooltip: this.options.maximizeTooltip,
                onClick: function() {
                    that.maximize();
                }
            });
            b.domObj.addClass('jx'+this.options.type+'Maximize');
            this.toolbar.add(b);
            if (this.menu) {
                var item = new Jx.Menu.Item({
                    label: this.options.maximizeLabel,
                    onClick: function() { that.maximize(); }
                });
                this.menu.add(item);
            }
        }
        
        if (this.options.close) {
            var b = new Jx.Button({
                image: Jx.aPixel.src,
                tooltip: this.options.closeTooltip,
                onClick: function() {
                    that.close();
                }
            });
            b.domObj.addClass('jx'+this.options.type+'Close');
            this.toolbar.add(b);
            if (this.menu) {
                var item = new Jx.Menu.Item({
                    label: this.options.closeLabel,
                    onClick: function() {
                        that.close();
                    }
                });
                this.menu.add(item);
            }
            
        }
        
        this.title.addEvent('dblclick', function() {
            that.toggleCollapse();
        });
        
        this.domObj = new Element('div', {
            'class': 'jx'+this.options.type
        });
        if (this.options.id) {
            this.domObj.id = this.options.id;
        }
        var jxl = new Jx.Layout(this.domObj, $merge(this.options, {propagate:false}));
        var layoutHandler = this.layoutContent.bind(this);
        jxl.addEvent('sizeChange', layoutHandler);
        
        if (!this.options.hideTitle) {
            this.domObj.adopt(this.title);
        }
        
        this.contentContainer = new Element('div', {
            'class': 'jx'+this.options.type+'ContentContainer'
        });
        this.domObj.adopt(this.contentContainer);
        
        if ($type(this.options.toolbars) == 'array') {
            this.options.toolbars.each(function(tb){
                var position = tb.options.position;
                var tbc = this.toolbarContainers[position];
                if (!tbc) {
                    var tbc = new Element('div');
                    new Jx.Layout(tbc);
                    this.contentContainer.adopt(tbc);
                    this.toolbarContainers[position] = tbc;
                }
                tb.addTo(tbc);
            }, this);
        }
        
        this.content = new Element('div', {
            'class': 'jx'+this.options.type+'Content'
        });
        
        this.contentContainer.adopt(this.content);
        new Jx.Layout(this.contentContainer);
        new Jx.Layout(this.content);
        
        this.loadContent(this.content);

        this.toggleCollapse(this.options.closed);
        
        this.addEvent('addTo', function() {
            this.domObj.resize();
        });
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    
    /**
     * Method: layoutContent
     * the sizeChange event of the <Jx.Layout> that manages the outer container
     * is intercepted and passed through this method to handle resizing of the
     * panel contents because we need to do some calculations if the panel
     * is collapsed and if there are toolbars to put around the content area.
     */
    layoutContent: function() {
        var titleHeight = 0;
        var top = 0;
        var bottom = 0;
        var left = 0;
        var right = 0;
        var tbc;
        var tb;
        var position;
        if (!this.options.hideTitle && this.title.parentNode == this.domObj) {
            titleHeight = this.title.getMarginBoxSize().height;
        }
        var domSize = this.domObj.getContentBoxSize();
        if (domSize.height > titleHeight) {
            this.contentContainer.setStyle('display','block');
            this.options.closed = false;
            this.contentContainer.resize({
                top: titleHeight, 
                height: null, 
                bottom: 0
            });
            ['left','right'].each(function(position){
                if (this.toolbarContainers[position]) {
                    this.toolbarContainers[position].style.width = 'auto';
                }
            }, this);
            ['top','bottom'].each(function(position){
                if (this.toolbarContainers[position]) {
                    this.toolbarContainers[position].style.height = '';                
                }
            }, this);
            if ($type(this.options.toolbars) == 'array') {
                this.options.toolbars.each(function(tb){
                    position = tb.options.position;
                    tbc = this.toolbarContainers[position];
                    // IE 6 doesn't seem to want to measure the width of 
                    // things correctly
                    if (Browser.Engine.trident4) {
                        var oldParent = $(tbc.parentNode);
                        tbc.style.visibility = 'hidden';
                        $(document.body).adopt(tbc);                    
                    }
                    var size = tbc.getBorderBoxSize();
                    // put it back into its real parent now we are done 
                    // measuring
                    if (Browser.Engine.trident4) {
                        oldParent.adopt(tbc);
                        tbc.style.visibility = '';
                    }
                    switch(position) {
                        case 'top':
                            top = size.height;
                            break;
                        case 'bottom':
                            bottom = size.height;
                            break;
                        case 'left':
                            left = size.width;
                            break;
                        case 'right':
                            right = size.width;
                            break;
                    }                    
                },this);
            }
            tbc = this.toolbarContainers['top'];
            if (tbc) {
                tbc.resize({top: 0, left: left, right: right, bottom: null, height: top, width: null});
            }
            tbc = this.toolbarContainers['bottom'];
            if (tbc) {
                tbc.resize({top: null, left: left, right: right, bottom: 0, height: bottom, width: null});
            }
            tbc = this.toolbarContainers['left'];
            if (tbc) {
                tbc.resize({top: top, left: 0, right: null, bottom: bottom, height: null, width: left});
            }
            tbc = this.toolbarContainers['right'];
            if (tbc) {
                tbc.resize({top: top, left: null, right: 0, bottom: bottom, height: null, width: right});
            }
            this.content.resize({top: top, bottom: bottom, left: left, right: right});
        } else {
            this.contentContainer.setStyle('display','none');
            this.options.closed = true;
        }
        this.fireEvent('sizeChange', this);
    },
    
    /**
     * Method: setLabel
     * Set the label in the title bar of this panel
     *
     * Parameters:
     * s - {String} the new label
     */
    setLabel: function(s) {
        this.labelObj.innerHTML = s;
    },
    /**
     * Method: getLabel
     * Get the label of the title bar of this panel
     *
     * Returns: 
     * {String} the label
     */
    getLabel: function() {
        return this.labelObj.innerHTML;
    },
    /**
     * Method: finalize
     * Clean up the panel
     */
    finalize: function() {
        this.domObj = null;
        this.deregisterIds();
    },
    /**
     * Method: maximize
     * Maximize this panel
     */
    maximize: function() {
        if (this.manager) {
            this.manager.maximizePanel(this);
        }
    },
    /**
     * Method: setContent
     * set the content of this panel to some HTML
     *
     * Parameters:
     * html - {String} the new HTML to go in the panel
     */
    setContent : function (html) {
        this.content.innerHTML = html;
        this.bContentReady = true;
    },
    /**
     * Method: setContentURL
     * Set the content of this panel to come from some URL.
     *
     * Parameters:
     * url - {String} URL to some HTML content for this panel
     */
    setContentURL : function (url) {
        this.bContentReady = false;
        this.setBusy(true);
        if (arguments[1]) {
            this.onContentReady = arguments[1];
        }
        if (url.indexOf('?') == -1) {
            url = url + '?';
        }
        var a = new Request({
            url: url,
            method: 'get',
            evalScripts:true,
            onSuccess:this.panelContentLoaded.bind(this),
            requestHeaders: ['If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT']
        }).send();
    },
    /**
     * Method: panelContentLoaded
     * When the content of the panel is loaded from a remote URL, this 
     * method is called when the ajax request returns.
     *
     * Parameters:
     * html - {String} the html return from xhr.onSuccess
     */
    panelContentLoaded: function(html) {
        this.content.innerHTML = html;
        this.bContentReady = true;
        this.setBusy(false);
        if (this.onContentReady) {
            window.setTimeout(this.onContentReady.bind(this),1);
        }
    },
    /**
     * Method: setBusy
     * Set the panel as busy or not busy, which displays a loading image
     * in the title bar.
     *
     * Parameters:
     * isBusy - {Boolean} the busy state
     */
    setBusy : function(isBusy) {
        this.busyCount += isBusy?1:-1;
        if (this.loadingObj){
            this.loadingObj.img.style.visibility = (this.busyCount>0)?'visible':'hidden';
        }
    },
    
    /**
     * Method: toggleCollapse
     * sets or toggles the collapsed state of the panel.  If a
     * new state is passed, it is used, otherwise the current
     * state is toggled.    
     *
     * Parameters:
     * state - optional, if passed then the state is used, 
     * otherwise the state is toggled.
     */
    toggleCollapse: function(state) {
        if ($defined(state)) {
            this.options.closed = state;
        } else {
            this.options.closed = !this.options.closed;
        }
        if (this.options.closed) {
            if (!this.domObj.hasClass('jx'+this.options.type+'Min')) {
                this.domObj.addClass('jx'+this.options.type+'Min');
                this.contentContainer.setStyle('display','none');
                var margin = this.domObj.getMarginSize();
                var height = margin.top + margin.bottom;
                if (this.title.parentNode == this.domObj) {
                    height += this.title.getMarginBoxSize().height;
                }
                this.domObj.resize({height: height});
                this.fireEvent('collapse', this);
            }
        } else {
            if (this.domObj.hasClass('jx'+this.options.type+'Min')) {
                this.domObj.removeClass('jx'+this.options.type+'Min');
                this.contentContainer.setStyle('display','block');
                this.domObj.resize({height: this.options.height});            
                this.fireEvent('expand', this);
            }
        }
    },
    
    /**
     * Method: close
     * Closes the panel (completely hiding it).
     */
    close: function() {
        this.domObj.dispose();
        this.fireEvent('close', this);
    }
    
});// $Id: dialog.js 431 2009-05-13 12:58:48Z kasi@arielgrafik.de $
/**
 * Class: Jx.Dialog
 *
 * Extends: <Jx.Panel>
 *
 * Implements: <Jx.AutoPosition>, <Jx.Chrome>
 *
 * A Jx.Dialog implements a floating dialog.  Dialogs represent a useful way
 * to present users with certain information or application controls.
 * Jx.Dialog is designed to provide the same types of features as traditional
 * operating system dialog boxes, including:
 *
 * - dialogs may be modal (user must dismiss the dialog to continue) or 
 * non-modal
 *
 * - dialogs are movable (user can drag the title bar to move the dialog
 * around)
 *
 * - dialogs may be a fixed size or allow user resizing.
 *
 * Jx.Dialog uses <Jx.ContentLoader> to load content into the content area
 * of the dialog.  Refer to the <Jx.ContentLoader> documentation for details
 * on content options.
 *
 * Example:
 * (code)
 * var dialog = new Jx.Dialog();
 * (end)
 *
 * Events:
 * open - triggered when the dialog is opened
 * close - triggered when the dialog is closed
 * change - triggered when the value of an input in the dialog is changed
 * resize - triggered when the dialog is resized
 *
 * Extends:
 * Jx.Dialog extends <Jx.Panel>, please go there for more details.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Dialog = new Class({
    Family: 'Jx.Dialog',
    Extends: Jx.Panel,
    Implements: [Jx.AutoPosition, Jx.Chrome],
    
    /**
     * Property: {HTMLElement} blanket
     * modal dialogs prevent interaction with the rest of the application
     * while they are open, this element is displayed just under the
     * dialog to prevent the user from clicking anything.
     */
    blanket: null,
    
    options: {
        /* Option: modal
         * (optional) {Boolean} controls whether the dialog will be modal
         * or not.  The default is to create modal dialogs.
         */
        modal: true,
        /* just overrides default position of panel, don't document this */
        position: 'absolute',
        /* Option: width
         * (optional) {Integer} the initial width in pixels of the dialog.
         * The default value is 250 if not specified.
         */
        width: 250,
        /* Option: height
         * (optional) {Integer} the initial height in pixels of the 
         * dialog. The default value is 250 if not specified.
         */
        height: 250,
        /* Option: horizontal
         * (optional) {String} the horizontal rule for positioning the
         * dialog.  The default is 'center center' meaning the dialog will be
         * centered on the page.  See {<Jx.AutoPosition>} for details.
         */
        horizontal: 'center center',
        /* Option: vertical
         * (optional) {String} the vertical rule for positioning the
         * dialog.  The default is 'center center' meaning the dialog will be
         * centered on the page.  See {<Jx.AutoPosition>} for details.
         */
        vertical: 'center center',
        /* Option: label
         * (optional) {String} the title of the dialog box.  "New Dialog"
         * is the default value.
         */
        label: 'New Dialog',
        /* Option: id
         * (optional) {String} an HTML ID to assign to the dialog, primarily
         * used for applying CSS styles to specific dialogs
         */
        id: '',
        /* Option: parent
         * (optional) {HTMLElement} a reference to an HTML element that
         * the dialog is to be contained by.  The default value is for the dialog
         * to be contained by the body element.
         */
        parent: null,
        /* Option: resize
         * (optional) {Boolean} determines whether the dialog is
         * resizeable by the user or not.  Default is false.
         */
        resize: false,
        /* Option: resizeTooltip
         * the tooltip to display for the resize handle, empty by default.
         */
        resizeTooltip: '',
        /* Option: move
         * (optional) {Boolean} determines whether the dialog is
         * moveable by the user or not.  Default is true.
         */
        move: true,
        /* Option: close
         * (optional) {Boolean} determines whether the dialog is
         * closeable by the user or not.  Default is true.
         */
        close: true
    },
    /**
     * Constructor: Jx.Dialog
     * Construct a new instance of Jx.Dialog
     *
     * Parameters: 
     * options - {Object} an object containing options for the dialog.
     *
     * Options: <Jx.Dialog.Options>, <Jx.Panel.Options>, <Jx.ContentLoader.Options>
     */
    initialize: function(options) {
        this.isOpening = false;
        this.firstShow = true;
        
        /* initialize the panel overriding the type and position */
        this.parent($merge(
            {parent:document.body}, // these are defaults that can be overridden
            options,
            {type:'Dialog', position: 'absolute'} // these override anything passed to the options
        ));
        
        this.options.parent = $(this.options.parent);
        
        if (this.options.modal) {
            this.blanket = new Element('div',{
                'class':'jxDialogModal',
                styles:{
                    display:'none',
                    zIndex: -1
                }
            });
            this.blanket.resize = (function() {
                var ss = $(document.body).getScrollSize();
                this.setStyles({
                    width: ss.x,
                    height: ss.y
                });
            }).bind(this.blanket);
            this.options.parent.adopt(this.blanket);
            window.addEvent('resize', this.blanket.resize);
            
        }

        this.domObj.setStyle('display','none');
        this.options.parent.adopt(this.domObj);
        
        /* the dialog is moveable by its title bar */
        if (this.options.move && typeof Drag != 'undefined') {
            this.title.addClass('jxDialogMoveable');
            new Drag(this.domObj, {
                handle: this.title,
                onBeforeStart: (function(){
                    Jx.Dialog.orderDialogs(this);
                }).bind(this),
                onStart: (function() {
                    this.contentContainer.setStyle('visibility','hidden');
                    this.chrome.addClass('jxChromeDrag');
                }).bind(this),
                onComplete: (function() {
                    this.chrome.removeClass('jxChromeDrag');
                    this.contentContainer.setStyle('visibility','');
                    var left = Math.max(this.chromeOffsets.left, parseInt(this.domObj.style.left,10));
                    var top = Math.max(this.chromeOffsets.top, parseInt(this.domObj.style.top,10));
                    this.options.horizontal = left + ' left';
                    this.options.vertical = top + ' top';
                    this.position(this.domObj, this.options.parent, this.options);
                    this.options.left = parseInt(this.domObj.style.left,10);
                    this.options.top = parseInt(this.domObj.style.top,10);
                    if (!this.options.closed) {
                        this.domObj.resize(this.options);                        
                    }
                }).bind(this)
            });            
        }
        
        /* the dialog is resizeable */
        if (this.options.resize && typeof Drag != 'undefined') {
            this.resizeHandle = new Element('div', {
                'class':'jxDialogResize',
                title: this.options.resizeTooltip,
                styles: {
                    'display':this.options.closed?'none':'block'
                }
            });
            this.domObj.appendChild(this.resizeHandle);

            this.resizeHandleSize = this.resizeHandle.getSize(); 
            this.resizeHandle.setStyles({
                bottom: this.resizeHandleSize.height,
                right: this.resizeHandleSize.width
            });
            this.domObj.makeResizable({
                handle:this.resizeHandle,
                onStart: (function() {
                    this.contentContainer.setStyle('visibility','hidden');
                    this.chrome.addClass('jxChromeDrag');
                }).bind(this),
                onDrag: (function() {
                    this.resizeChrome(this.domObj);
                }).bind(this),
                onComplete: (function() {
                    this.chrome.removeClass('jxChromeDrag');
                    var size = this.domObj.getMarginBoxSize();
                    this.options.width = size.width;
                    this.options.height = size.height;
                    this.layoutContent();
                    this.domObj.resize(this.options);
                    this.contentContainer.setStyle('visibility','');
                    this.fireEvent('resize');
                    this.resizeChrome(this.domObj);
                    
                }).bind(this)
            });
        }
        /* this adjusts the zIndex of the dialogs when activated */
        this.domObj.addEvent('mousedown', (function(){
            Jx.Dialog.orderDialogs(this);
        }).bind(this));
    },
    
    /**
     * Method: resize
     * resize the dialog.  This can be called when the dialog is closed
     * or open.
     *
     * Parameters:
     * width - the new width
     * height - the new height
     * autoPosition - boolean, false by default, if resizing an open dialog
     * setting this to true will reposition it according to its position
     * rules.
     */
    resize: function(width, height, autoPosition) {
        this.options.width = width;
        this.options.height = height;
        if (this.domObj.getStyle('display') != 'none') {
            this.layoutContent();
            this.domObj.resize(this.options);
            this.fireEvent('resize');
            this.resizeChrome(this.domObj);
            if (autoPosition) {
                this.position(this.domObj, this.options.parent, this.options);                
            }
        } else {
            this.firstShow = false;
        }
    },
    
    /**
     * Method: sizeChanged
     * overload panel's sizeChanged method
     */
    sizeChanged: function() {
        if (!this.options.closed) {
            this.layoutContent();
        }
    },
    
    /**
     * Method: toggleCollapse
     * sets or toggles the collapsed state of the panel.  If a
     * new state is passed, it is used, otherwise the current
     * state is toggled.    
     *
     * Parameters:
     * state - optional, if passed then the state is used, 
     * otherwise the state is toggled.
     */
    toggleCollapse: function(state) {
        if ($defined(state)) {
            this.options.closed = state;
        } else {
            this.options.closed = !this.options.closed;
        }
        if (this.options.closed) {
            if (!this.domObj.hasClass('jx'+this.options.type+'Min')) {
                this.domObj.addClass('jx'+this.options.type+'Min');
            }
            this.contentContainer.setStyle('display','none');
            if (this.resizeHandle) {
                this.resizeHandle.setStyle('display','none');
            }
        } else {
            if (this.domObj.hasClass('jx'+this.options.type+'Min')) {
                this.domObj.removeClass('jx'+this.options.type+'Min');
            }
            this.contentContainer.setStyle('display','block');
            if (this.resizeHandle) {
                this.resizeHandle.setStyle('display','block');
            }
        }
        
        if (this.options.closed) {
            var margin = this.domObj.getMarginSize();
            var size = this.title.getMarginBoxSize();
            this.domObj.resize({height: margin.top + size.height + margin.bottom});
            this.fireEvent('collapse');
        } else {
            this.domObj.resize(this.options);
            this.fireEvent('expand');
        }
        this.showChrome(this.domObj);
    },
    
    /**
     * Method: show
     * show the dialog, external code should use the <Jx.Dialog::open> method
     * to make the dialog visible.
     */
    show : function( ) {
        /* prepare the dialog for display */
        this.domObj.setStyles({
            'display': 'block',
            'visibility': 'hidden'
        });
        
        if (this.blanket) {
            this.blanket.resize();            
        }

        Jx.Dialog.orderDialogs(this);
        
        /* do the modal thing */
        if (this.blanket) {
            this.blanket.setStyles({
                visibility: 'visible',
                display: 'block'
            });
        }
        
        if (this.options.closed) {
            var margin = this.domObj.getMarginSize();
            var size = this.title.getMarginBoxSize();
            this.domObj.resize({height: margin.top + size.height + margin.bottom});
        } else {
            this.domObj.resize(this.options);            
        }
        if (this.firstShow) {
            this.contentContainer.resize({forceResize: true});
            this.layoutContent();
            this.firstShow = false;
            /* if the chrome got built before the first dialog show, it might
             * not have been properly created and we should clear it so it
             * does get built properly
             */
            if (this.chrome) {
                this.chrome.dispose();
                this.chrome = null;
            }
        }
        /* update or create the chrome */
        this.showChrome(this.domObj);
        /* put it in the right place using auto-positioning */
        this.position(this.domObj, this.options.parent, this.options);
        this.domObj.setStyle('visibility', '');
    },
    /**
     * Method: hide
     * hide the dialog, external code should use the <Jx.Dialog::close>
     * method to hide the dialog.
     */
    hide : function() {
        Jx.Dialog.Stack.erase(this);
        Jx.Dialog.ZIndex--;
        this.domObj.setStyle('display','none');
        if (this.blanket) {
            this.blanket.setStyle('visibility', 'hidden');
            Jx.Dialog.ZIndex--;
        }
        
    },
    /**
     * Method: openURL
     * open the dialog and load content from the provided url.  If you don't
     * provide a URL then the dialog opens normally.
     *
     * Parameters:
     * url - <String> the url to load when opening.
     */
    openURL: function(url) {
        if (url) {
            this.options.contentURL = url;
            this.loadContent(this.content);
        } else {
            this.open();
        }
    },
    
    /**
     * Method: open
     * open the dialog.  This may be delayed depending on the 
     * asynchronous loading of dialog content.  The onOpen
     * callback function is called when the dialog actually
     * opens
     */
    open: function() {
        if (!this.isOpening) {
            this.isOpening = true;
        }
        if (this.contentIsLoaded) {
            this.show();
            this.fireEvent('open', this);
            this.isOpening = false;
        } else {
            this.addEvent('contentLoaded', this.open.bind(this));
        }
    },
    /**
     * Method: close
     * close the dialog and trigger the onClose callback function
     * if necessary
     */
    close: function() {
        this.isOpening = false;
        this.hide();
        this.fireEvent('close');
    }
});

Jx.Dialog.Stack = [];
Jx.Dialog.BaseZIndex = null;
Jx.Dialog.orderDialogs = function(d) {
    Jx.Dialog.Stack.erase(d).push(d);
    if (Jx.Dialog.BaseZIndex === null) {
        Jx.Dialog.BaseZIndex = Math.max(Jx.Dialog.Stack[0].domObj.getStyle('zIndex').toInt(), 1);
    }
    Jx.Dialog.Stack.each(function(d, i) {
        var z = Jx.Dialog.BaseZIndex+i;
        if (d.blanket) {
            d.blanket.setStyle('zIndex',z);
        }
        d.domObj.setStyle('zIndex',z);
    });
    
};
// $Id: splitter.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Splitter
 *
 * Extends: Object
 *
 * Implements: Options
 *
 * a Jx.Splitter creates two or more containers within a parent container
 * and provides user control over the size of the containers.  The split
 * can be made horizontally or vertically.
 * 
 * A horizontal split creates containers that divide the space horizontally
 * with vertical bars between the containers.  A vertical split divides
 * the space vertically and creates horizontal bars between the containers.
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
 
Jx.Splitter = new Class({
    Family: 'Jx.Splitter',
    Implements: [Options],
    /**
     * Property: domObj
     * {HTMLElement} the element being split
     */
    domObj: null,
    /**
     * Property: elements
     * {Array} an array of elements that are displayed in each of the split 
     * areas
     */
    elements: null,
    /**
     * Property: bars
     * {Array} an array of the bars between each of the elements used to
     * resize the split areas.
     */
    bars: null,
    /**
     * Property: firstUpdate
     * {Boolean} track the first resize event so that unexposed Jx things
     * can be forced to calculate their size the first time they are exposed.
     */
    firstUpdate: true,
    options: {
        /* Option: useChildren
         * {Boolean} if set to true, then the children of the
         * element to be split are used as the elements.  The default value is
         * false.  If this is set, then the elements and splitInto options
         * are ignored.
         */
        useChildren: false,
        /* Option: splitInto
         * {Integer} the number of elements to split the domObj into.
         * If not set, then the length of the elements option is used, or 2 if
         * elements is not specified.  If splitInto is specified and elements
         * is specified, then splitInto is used.  If there are more elements than
         * splitInto specifies, then the extras are ignored.  If there are less
         * elements than splitInto specifies, then extras are created.
         */
        splitInto: 2,
        /* Option: elements
         * {Array} an array of elements to put into the split areas.
         * If splitInto is not set, then it is calculated from the length of
         * this array.
         */
        elements: null,
        /* Option: containerOptions
         * {Array} an array of objects that provide options
         *  for the <Jx.Layout> constraints on each element.
         */
        containerOptions: [],
        /* Option: barOptions
         * {Array} an array of object that provide options for the bars,
         * this array should be one less than the number of elements in the
         * splitter.  The barOptions objects can contain a snap property indicating
         * that a default snap object should be created in the bar and the value
         * of 'before' or 'after' indicates which element it snaps open/shut.
         */
        barOptions: [],
        /* Option: layout
         * {String} either 'horizontal' or 'vertical', indicating the
         * direction in which the domObj is to be split.
         */
        layout: 'horizontal',
        /* Option: snaps
         * {Array} an array of objects which can be used to snap
         * elements open or closed.
         */
        snaps: [],
        /* Option: barTooltip
         * the tooltip to display when the mouse hovers over a split bar, 
         * used for i18n.
         */
        barTooltip: 'drag this bar to resize',
        /* Option: onStart
         * an optional function to call when a bar starts dragging
         */
        onStart: null,
        /* Option: onFinish
         * an optional function to call when a bar finishes dragging
         */
        onFinish: null
    },
    /**
     * Constructor: Jx.Splitter
     * Create a new instance of Jx.Splitter
     *
     * Parameters:
     * domObj - {HTMLElement} the element or id of the element to split
     * options - <Jx.Splitter.Options>
     */
    initialize: function(domObj, options) {
        this.setOptions(options);  
        
        this.domObj = $(domObj);
        this.domObj.addClass('jxSplitContainer');
        var jxLayout = this.domObj.retrieve('jxLayout');
        if (jxLayout) {
            jxLayout.addEvent('sizeChange', this.sizeChanged.bind(this));
        }
       
        this.elements = [];
        this.bars = [];
        
        var nSplits = 2;
        if (this.options.useChildren) {
            this.elements = this.domObj.getChildren();
            nSplits = this.elements.length;
        } else {
            nSplits = this.options.elements ? 
                            this.options.elements.length : 
                            this.options.splitInto;
            for (var i=0; i<nSplits; i++) {
                var el;
                if (this.options.elements && this.options.elements[i]) {
                    if (options.elements[i].domObj) {
                        el = options.elements[i].domObj;
                    } else {
                        el = $(this.options.elements[i]);                        
                    }
                    if (!el) {
                        el = this.prepareElement();
                        el.id = this.options.elements[i];
                    }
                } else {
                    el = this.prepareElement();
                }
                this.elements[i] = el;
                this.domObj.adopt(this.elements[i]);
            }
        }
        this.elements.each(function(el) { el.addClass('jxSplitArea'); });
        for (var i=0; i<nSplits; i++) {
            var jxl = this.elements[i].retrieve('jxLayout');
            if (!jxl) {
                new Jx.Layout(this.elements[i], this.options.containerOptions[i]);
            } else {
                jxl.resize({position: 'absolute'});
            }
        }
        
        for (var i=1; i<nSplits; i++) {
            var bar;
            if (this.options.prepareBar) {
                bar = this.options.prepareBar(i-1);                
            } else {
                bar = this.prepareBar();                
            }
            bar.store('splitterObj', this);
            bar.store('leftSide',this.elements[i-1]);
            bar.store('rightSide', this.elements[i]);
            this.elements[i-1].store('rightBar', bar);
            this.elements[i].store('leftBar', bar);
            this.domObj.adopt(bar);
            this.bars[i-1] = bar;
        }
        
        //making dragging dependent on mootools Drag class
        if ($defined(Drag)) {
        	this.establishConstraints();
        }
        
        for (var i=0; i<this.options.barOptions.length; i++) {
            if (!this.bars[i]) {
                continue;
            }
            var opt = this.options.barOptions[i];
            if (opt && opt.snap && (opt.snap == 'before' || opt.snap == 'after')) {
                var element;
                if (opt.snap == 'before') {
                    element = this.bars[i].retrieve('leftSide');
                } else if (opt.snap == 'after') {
                    element = this.bars[i].retrieve('rightSide');
                }
                var snap;
                var snapEvents;
                if (opt.snapElement) {
                    snap = opt.snapElement;
                    snapEvents = opt.snapEvents || ['click', 'dblclick'];                    
                } else {
                    snap = this.bars[i];
                    snapEvents = opt.snapEvents || ['dblclick'];
                }
                if (!snap.parentNode) {
                    this.bars[i].adopt(snap);             
                }
                new Jx.Splitter.Snap(snap, element, this, snapEvents);
            }
        }
        
        for (var i=0; i<this.options.snaps.length; i++) {
            if (this.options.snaps[i]) {
                new Jx.Splitter.Snap(this.options.snaps[i], this.elements[i], this);
            }
        }
        
        this.sizeChanged();
    },
    /**
     * Method: prepareElement
     * Prepare a new, empty element to go into a split area.
     *
     * Returns:
     * {HTMLElement} an HTMLElement that goes into a split area.
     */
    prepareElement: function(){
        var o = new Element('div', {styles:{position:'absolute'}});
        return o;
    },
    
    /**
     * Method: prepareBar
     * Prepare a new, empty bar to go into between split areas.
     *
     * Returns:
     * {HTMLElement} an HTMLElement that becomes a bar.
     */
    prepareBar: function() {
        var o = new Element('div', {
            'class': 'jxSplitBar'+this.options.layout.capitalize(),
            'title': this.options.barTitle
        });
        return o;
    },
    
    /**
     * Method: establishConstraints
     * Setup the initial set of constraints that set the behaviour of the
     * bars between the elements in the split area.
     */
    establishConstraints: function() {
        var modifiers = {x:null,y:null};
        var fn;
        if (this.options.layout == 'horizontal') {
            modifiers.x = "left";
            fn = this.dragHorizontal;
        } else {
            modifiers.y = "top";
            fn = this.dragVertical;
        }
        if (typeof Drag != 'undefined') {
            this.bars.each(function(bar){
                var mask;
                new Drag(bar, {
                    //limit: limit,
                    modifiers: modifiers,
                    onSnap : function(obj) {
                        obj.addClass('jxSplitBarDrag');
                    },
                    onComplete : (function(obj) {
                        mask.destroy();
                        obj.removeClass('jxSplitBarDrag');
                        if (obj.retrieve('splitterObj') != this) {
                            return;
                        }
                        fn.apply(this,[obj]);
                    }).bind(this),
                    onStart: (function(obj) {
                        mask = new Element('div',{'class':'jxSplitterMask'}).inject(obj, 'after');
                        if (this.options.onStart) {
                            this.options.onStart();
                        }
                    }).bind(this),
                    onFinish: (function() {
                        if (this.options.onFinish) {
                            this.options.onFinish();
                        }
                    }).bind(this)
                });
            }, this);            
        }
    },
    
    /**
     * Method: dragHorizontal
     * In a horizontally split container, handle a bar being dragged left or
     * right by resizing the elements on either side of the bar.
     *
     * Parameters:
     * obj - {HTMLElement} the bar that was dragged
     */
    dragHorizontal: function(obj) {
        var leftEdge = parseInt(obj.style.left);
        var leftSide = obj.retrieve('leftSide');
        var rightSide = obj.retrieve('rightSide');
        var leftJxl = leftSide.retrieve('jxLayout');
        var rightJxl = rightSide.retrieve('jxLayout');
        
        var paddingLeft = this.domObj.getPaddingSize().left;
        
        /* process right side first */
        var rsLeft, rsWidth, rsRight;
        
        var size = obj.retrieve('size');
        if (!size) {
            size = obj.getBorderBoxSize();
            obj.store('size',size);
        }
        rsLeft = leftEdge + size.width - paddingLeft;
        
        var parentSize = this.domObj.getContentBoxSize();
        
        if (rightJxl.options.width != null) {
            rsWidth = rightJxl.options.width + rightJxl.options.left - rsLeft;
            rsRight = parentSize.width - rsLeft - rsWidth;
        } else {
            rsWidth = parentSize.width - rightJxl.options.right - rsLeft;
            rsRight = rightJxl.options.right;
        }
        
        /* enforce constraints on right side */
        if (rsWidth < 0) {
            rsWidth = 0;
        }
        
        if (rsWidth < rightJxl.options.minWidth) {
            rsWidth = rightJxl.options.minWidth;
        }
        if (rightJxl.options.maxWidth >= 0 && rsWidth > rightJxl.options.maxWidth) {
            rsWidth = rightJxl.options.maxWidth;
        }
                
        rsLeft = parentSize.width - rsRight - rsWidth;
        leftEdge = rsLeft - size.width;
        
        /* process left side */
        var lsLeft, lsWidth;
        lsLeft = leftJxl.options.left;
        lsWidth = leftEdge - lsLeft;
        
        /* enforce constraints on left */
        if (lsWidth < 0) {
            lsWidth = 0;
        }
        if (lsWidth < leftJxl.options.minWidth) {
            lsWidth = leftJxl.options.minWidth;
        }
        if (leftJxl.options.maxWidth >= 0 && 
            lsWidth > leftJxl.options.maxWidth) {
            lsWidth = leftJxl.options.maxWidth;
        }
        
        /* update the leftEdge to accomodate constraints */
        if (lsLeft + lsWidth != leftEdge) {
            /* need to update right side, ignoring constraints because left side
               constraints take precedence (arbitrary decision)
             */
            leftEdge = lsLeft + lsWidth;
            var delta = leftEdge + size.width - rsLeft;
            rsLeft += delta;
            rsWidth -= delta; 
        }
        
        /* put bar in its final location based on constraints */
        obj.style.left = paddingLeft + leftEdge + 'px';
        
        /* update leftSide positions */
        if (leftJxl.options.width == null) {
            var parentSize = this.domObj.getContentBoxSize();
            leftSide.resize({right: parentSize.width - lsLeft-lsWidth});
        } else {
            leftSide.resize({width: lsWidth});
        }
        
        /* update rightSide position */
        if (rightJxl.options.width == null) {
            rightSide.resize({left:rsLeft});
        } else {
            rightSide.resize({left: rsLeft, width: rsWidth});
        }
    },
    
    /**
     * Method: dragVertical
     * In a vertically split container, handle a bar being dragged up or
     * down by resizing the elements on either side of the bar.
     *
     * Parameters:
     * obj - {HTMLElement} the bar that was dragged
     */
    dragVertical: function(obj) {
        /* top edge of the bar */
        var topEdge = parseInt(obj.style.top);
        
        /* the containers on either side of the bar */
        var topSide = obj.retrieve('leftSide');
        var bottomSide = obj.retrieve('rightSide');
        var topJxl = topSide.retrieve('jxLayout');
        var bottomJxl = bottomSide.retrieve('jxLayout');
        
        var paddingTop = this.domObj.getPaddingSize().top;
        
        /* measure the bar and parent container for later use */
        var size = obj.retrieve('size');
        if (!size) {
            size = obj.getBorderBoxSize();
            obj.store('size', size);
        }
        var parentSize = this.domObj.getContentBoxSize();

        /* process top side first */
        var bsTop, bsHeight, bsBottom;
        
        /* top edge of bottom side is the top edge of bar plus the height of the bar */
        bsTop = topEdge + size.height - paddingTop;
        
        if (bottomJxl.options.height != null) {
            /* bottom side height is fixed */
            bsHeight = bottomJxl.options.height + bottomJxl.options.top - bsTop;
            bsBottom = parentSize.height - bsTop - bsHeight;
        } else {
            /* bottom side height is not fixed. */
            bsHeight = parentSize.height - bottomJxl.options.bottom - bsTop;
            bsBottom = bottomJxl.options.bottom;
        }
        
        /* enforce constraints on bottom side */
        if (bsHeight < 0) {
            bsHeight = 0;
        }
        
        if (bsHeight < bottomJxl.options.minHeight) {
            bsHeight = bottomJxl.options.minHeight;
        }
        
        if (bottomJxl.options.maxHeight >= 0 && bsHeight > bottomJxl.options.maxHeight) {
            bsHeight = bottomJxl.options.maxHeight;
        }
        
        /* recalculate the top of the bottom side in case it changed
           due to a constraint.  The bar may have moved also.
         */
        bsTop = parentSize.height - bsBottom - bsHeight;
        topEdge = bsTop - size.height;
                
        /* process left side */
        var tsTop, tsHeight;
        tsTop = topJxl.options.top;
        tsHeight = topEdge - tsTop;
                        
        /* enforce constraints on left */
        if (tsHeight < 0) {
            tsHeight = 0;
        }
        if (tsHeight < topJxl.options.minHeight) {
            tsHeight = topJxl.options.minHeight;
        }
        if (topJxl.options.maxHeight >= 0 && 
            tsHeight > topJxl.options.maxHeight) {
            tsHeight = topJxl.options.maxHeight;
        }
        
        /* update the topEdge to accomodate constraints */
        if (tsTop + tsHeight != topEdge) {
            /* need to update right side, ignoring constraints because left side
               constraints take precedence (arbitrary decision)
             */
            topEdge = tsTop + tsHeight;
            var delta = topEdge + size.height - bsTop;
            bsTop += delta;
            bsHeight -= delta; 
        }
        
        /* put bar in its final location based on constraints */
        obj.style.top = paddingTop + topEdge + 'px';
        
        /* update topSide positions */
        if (topJxl.options.height == null) {
            topSide.resize({bottom: parentSize.height - tsTop-tsHeight});
        } else {
            topSide.resize({height: tsHeight});
        }
        
        /* update bottomSide position */
        if (bottomJxl.options.height == null) {
            bottomSide.resize({top:bsTop});
        } else {
            bottomSide.resize({top: bsTop, height: bsHeight});
        }
    },
    
    /**
     * Method: sizeChanged
     * handle the size of the container being changed.
     */
    sizeChanged: function() {
        if (this.options.layout == 'horizontal') {
            this.horizontalResize();
        } else {
            this.verticalResize();
        }
    },
    
    /**
     * Method: horizontalResize
     * Resize a horizontally layed-out container
     */
    horizontalResize: function() {
        var availableSpace = this.domObj.getContentBoxSize().width;
        var overallWidth = availableSpace;

        for (var i=0; i<this.bars.length; i++) {
            var bar = this.bars[i];
            var size = bar.retrieve('size');
            if (!size || size.width == 0) {
                size = bar.getBorderBoxSize();
                bar.store('size',size);
            }
            availableSpace -= size.width;
        }

        var nVariable = 0;
        var jxo;
        for (var i=0; i<this.elements.length; i++) {
            var e = this.elements[i];
            jxo = e.retrieve('jxLayout').options;
            if (jxo.width != null) {
                availableSpace -= parseInt(jxo.width);
            } else {
                var w = 0;
                if (jxo.right != 0 || 
                    jxo.left != 0) {
                    w = e.getBorderBoxSize().width;
                }
                
                availableSpace -= w;
                nVariable++;
            }
        }

        if (nVariable == 0) { /* all fixed */
            /* stick all available space in the last one */
            availableSpace += jxo.width;
            jxo.width = null;
            nVariable = 1;
        }

        var amount = parseInt(availableSpace / nVariable);
        /* account for rounding errors */
        var remainder = availableSpace % nVariable;
        
        var leftPadding = this.domObj.getPaddingSize().left;

        var currentPosition = 0;

        for (var i=0; i<this.elements.length; i++) {
             var e = this.elements[i];
             var jxl = e.retrieve('jxLayout');
             var jxo = jxl.options;
             if (jxo.width != null) {
                 jxl.resize({left: currentPosition});
                 currentPosition += jxo.width;
             } else {
                 var a = amount;
                 if (nVariable == 1) {
                     a += remainder;
                 }
                 nVariable--;
                 
                 var w = 0;
                 if (jxo.right != 0 || jxo.left != 0) {
                     w = e.getBorderBoxSize().width + a;
                 } else {
                     w = a;
                 }
                 
                 if (w < 0) {
                     if (nVariable > 0) {
                         amount = amount + w/nVariable;
                     }
                     w = 0;
                 }
                 if (w < jxo.minWidth) {
                     if (nVariable > 0) {
                         amount = amount + (w - jxo.minWidth)/nVariable;
                     }
                     w = jxo.minWidth;
                 }
                 if (jxo.maxWidth >= 0 && w > jxo.maxWidth) {
                     if (nVariable > 0) {
                         amount = amount + (w - jxo.maxWidth)/nVariable;
                     }
                     w = e.options.maxWidth;
                 }
                 
                 var r = overallWidth - currentPosition - w;
                 jxl.resize({left: currentPosition, right: r});
                 currentPosition += w;
             }
             var rightBar = e.retrieve('rightBar');
             if (rightBar) {
                 rightBar.setStyle('left', leftPadding + currentPosition);
                 currentPosition += rightBar.retrieve('size').width;
             }
         }
    },
    
    /**
     * Method: verticalResize
     * Resize a vertically layed out container.
     */
    verticalResize: function() { 
        var availableSpace = this.domObj.getContentBoxSize().height;
        var overallHeight = availableSpace;

        for (var i=0; i<this.bars.length; i++) {
            var bar = this.bars[i];
            var size = bar.retrieve('size');
            if (!size || size.height == 0) {
                size = bar.getBorderBoxSize();
                bar.store('size', size);
            }
            availableSpace -= size.height;
        }

        var nVariable = 0;
        
        var jxo;
        for (var i=0; i<this.elements.length; i++) {
            var e = this.elements[i];
            jxo = e.retrieve('jxLayout').options;
            if (jxo.height != null) {
                availableSpace -= parseInt(jxo.height);
            } else {
                var h = 0;
                if (jxo.bottom != 0 || jxo.top != 0) {
                    h = e.getBorderBoxSize().height;
                }
                
                availableSpace -= h;
                nVariable++;
            }
        }

        if (nVariable == 0) { /* all fixed */
            /* stick all available space in the last one */
            availableSpace += jxo.height;
            jxo.height = null;
            nVariable = 1;
        }

        var amount = parseInt(availableSpace / nVariable);
        /* account for rounding errors */
        var remainder = availableSpace % nVariable;

        var paddingTop = this.domObj.getPaddingSize().top;
        
        var currentPosition = 0;

        for (var i=0; i<this.elements.length; i++) {
             var e = this.elements[i];
             var jxl = e.retrieve('jxLayout');
             var jxo = jxl.options;
             if (jxo.height != null) {
                 jxl.resize({top: currentPosition});
                 currentPosition += jxo.height;
             } else {
                 var a = amount;
                 if (nVariable == 1) {
                     a += remainder;
                 }
                 nVariable--;
                 
                 var h = 0;
                 if (jxo.bottom != 0 || jxo.top != 0) {
                     h = e.getBorderBoxSize().height + a;
                 } else {
                     h = a;
                 }
                 
                 if (h < 0) {
                     if (nVariable > 0) {
                         amount = amount + h/nVariable;
                     }
                     h = 0;
                 }
                 if (h < jxo.minHeight) {
                     if (nVariable > 0) {
                         amount = amount + (h - jxo.minHeight)/nVariable;
                     }
                     h = jxo.minHeight;
                 }
                 if (jxo.maxHeight >= 0 && h > jxo.maxHeight) {
                     if (nVariable > 0) {
                         amount = amount + (h - jxo.maxHeight)/nVariable;
                     }
                     h = jxo.maxHeight;
                 }
                 
                 var r = overallHeight - currentPosition - h;
                 jxl.resize({top: currentPosition, bottom: r});
                 currentPosition += h;
             }
             var rightBar = e.retrieve('rightBar');
             if (rightBar) {
                 rightBar.style.top = paddingTop + currentPosition + 'px';
                 currentPosition += rightBar.retrieve('size').height;
             }
         }
    }
});// $Id: panelset.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.PanelSet
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * A panel set manages a set of panels within a DOM element.  The PanelSet fills
 * its container by resizing the panels in the set to fill the width and then
 * distributing the height of the container across all the panels.  Panels
 * can be resized by dragging their respective title bars to make them taller
 * or shorter.  The maximize button on the panel title will cause all other
 * panels to be closed and the target panel to be expanded to fill the remaining
 * space.  In this respect, PanelSet works like a traditional Accordion control.
 *
 * When creating panels for use within a panel set, it is important to use the
 * proper options.  You must override the collapse option and set it to false
 * and add a maximize option set to true.  You must also not include options
 * for menu and close.
 *
 * Example:
 * (code)
 * var p1 = new Jx.Panel({collapse: false, maximize: true, content: 'content1'});
 * var p2 = new Jx.Panel({collapse: false, maximize: true, content: 'content2'});
 * var p3 = new Jx.Panel({collapse: false, maximize: true, content: 'content3'});
 * var panelSet = new Jx.PanelSet('panels', [p1,p2,p3]);
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.PanelSet = new Class({
    Family: 'Jx.PanelSet',
    Implements: [Options, Events, Jx.Addable],
    
    options: {
        /* Option: parent
         * the object to add the panel set to
         */
        parent: null,
        /* Option: panels
         * an array of <Jx.Panel> objects that will be managed by the set.
         */
        panels: [],
        /* Option: barTooltip
         * the tooltip to place on the title bars of each panel
         */
        barTooltip: 'drag this bar to resize'
    },
    
    /**
     * Property: panels
     * {Array} the panels being managed by the set
     */
    panels: null,
    /**
     * Property: height
     * {Integer} the height of the container, cached for speed
     */
    height: null,
    /**
     * Property: firstLayout
     * {Boolean} true until the panel set has first been resized
     */
    firstLayout: true,
    /**
     * Constructor: Jx.PanelSet
     * Create a new instance of Jx.PanelSet.
     *
     * Parameters:
     * options - <Jx.PanelSet.Options>
     *
     * TODO: Jx.PanelSet.initialize
     * Remove the panels parameter in favour of an add method.
     */
    initialize: function(options) {
        if (options && options.panels) {
            this.panels = options.panels;
            options.panels = null;
        }
        this.setOptions(options);
        this.domObj = new Element('div');
        new Jx.Layout(this.domObj);
        
        //make a fake panel so we get the right number of splitters
        var d = new Element('div', {styles:{position:'absolute'}});
        new Jx.Layout(d, {minHeight:0,maxHeight:0,height:0});
        var elements = [d];
        this.panels.each(function(panel){
            elements.push(panel.domObj);
            panel.options.hideTitle = true;
            panel.contentContainer.resize({top:0});
            panel.toggleCollapse = this.maximizePanel.bind(this,panel);
            panel.domObj.store('Jx.Panel', panel);
            panel.manager = this;
        }, this);
        
        this.splitter = new Jx.Splitter(this.domObj, {
            splitInto: this.panels.length+1,
            layout: 'vertical',
            elements: elements,
            prepareBar: (function(i) {
                var bar = new Element('div', {
                    'class': 'jxPanelBar',
                    'title': this.options.barTooltip
                });
                
                var panel = this.panels[i];
                panel.title.setStyle('visibility', 'hidden');
                $(document.body).adopt(panel.title);
                var size = panel.title.getBorderBoxSize();
                bar.adopt(panel.title);
                panel.title.setStyle('visibility','');
                
                bar.setStyle('height', size.height);
                bar.store('size', size);
                
                return bar;
            }).bind(this)
        });
        this.addEvent('addTo', function() {
            $(this.domObj.parentNode).setStyle('overflow', 'hidden');
            this.domObj.resize();
        });
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    
    /**
     * Method: maximizePanel
     * Maximize a panel, taking up all available space (taking into
     * consideration any minimum or maximum values)
     */
    maximizePanel: function(panel) {
        var domHeight = this.domObj.getContentBoxSize().height;
        var space = domHeight;
        var panelSize = panel.domObj.retrieve('jxLayout').options.maxHeight;
        var panelIndex;
        
        /* calculate how much space might be left after setting all the panels to
         * their minimum height (except the one we are resizing of course)
         */
        for (var i=1; i<this.splitter.elements.length; i++) {
            var p = this.splitter.elements[i];
            space -= p.retrieve('leftBar').getBorderBoxSize().height;
            if (p !== panel.domObj) {
                var thePanel = p.retrieve('Jx.Panel');
                var o = p.retrieve('jxLayout').options;
                space -= o.minHeight;
            } else {
                panelIndex = i;
            }
        }

        // calculate how much space the panel will take and what will be left over
        if (panelSize == -1 || panelSize >= space) {
            panelSize = space;
            space = 0;
        } else {
            space = space - panelSize;
        }
        var top = 0;
        for (var i=1; i<this.splitter.elements.length; i++) {
            var p = this.splitter.elements[i];
            top += p.retrieve('leftBar').getBorderBoxSize().height;
            if (p !== panel.domObj) {
                var thePanel = p.retrieve('Jx.Panel');
                var o = p.retrieve('jxLayout').options;
                var panelHeight = $chk(o.height) ? o.height : p.getBorderBoxSize().height;
                if (space > 0) {
                    if (space >= panelHeight) {
                        // this panel can stay open at its current height
                        space -= panelHeight;
                        p.resize({top: top, height: panelHeight});
                        top += panelHeight;
                    } else {
                        // this panel needs to shrink some
                        if (space > o.minHeight) {
                            // it can use all the space
                            p.resize({top: top, height: space});
                            top += space;
                            space = 0;
                        } else {
                            p.resize({top: top, height: o.minHeight});
                            top += o.minHeight;
                        }
                    }
                } else {
                    // no more space, just shrink away
                    p.resize({top:top, height: o.minHeight});
                    top += o.minHeight;
                }
                p.retrieve('rightBar').style.top = top + 'px';
            } else {
                break;
            }
        }
        
        /* now work from the bottom up */
        var bottom = domHeight;
        for (var i=this.splitter.elements.length - 1; i > 0; i--) {
            p = this.splitter.elements[i];
            if (p !== panel.domObj) {
                var o = p.retrieve('jxLayout').options;
                var panelHeight = $chk(o.height) ? o.height : p.getBorderBoxSize().height;
                if (space > 0) {
                    if (space >= panelHeight) {
                        // panel can stay open
                        bottom -= panelHeight;
                        space -= panelHeight;
                        p.resize({top: bottom, height: panelHeight});
                    } else {
                        if (space > o.minHeight) {
                            bottom -= space;
                            p.resize({top: bottom, height: space});
                            space = 0;
                        } else {
                            bottom -= o.minHeight;
                            p.resize({top: bottom, height: o.minHeight});
                        }
                    }
                } else {
                    bottom -= o.minHeight;
                    p.resize({top: bottom, height: o.minHeight, bottom: null});                    
                }
                bottom -= p.retrieve('leftBar').getBorderBoxSize().height;
                p.retrieve('leftBar').style.top = bottom + 'px';
                
            } else {
                break;
            }
        }
        panel.domObj.resize({top: top, height:panelSize, bottom: null});
    }
});// $Id: grid.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Grid
 * 
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * A tabular control that has fixed scrolling headers on the rows and columns
 * like a spreadsheet.
 *
 * Jx.Grid is a tabular control with convenient controls for resizing columns,
 * sorting, and inline editing.  It is created inside another element, typically a
 * div.  If the div is resizable (for instance it fills the page or there is a
 * user control allowing it to be resized), you must call the resize() method
 * of the grid to let it know that its container has been resized.
 *
 * When creating a new Jx.Grid, you can specify a number of options for the grid
 * that control its appearance and functionality.
 *
 * Jx.Grid renders data that comes from an external source.  This external 
 * source, called the model, must implement the following interface.
 *
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Grid = new Class({
    Family: 'Jx.Grid',
    Implements: [Options, Events, Jx.Addable],
    domObj : null,
    model : null,
    options: {
         /* Option: parent
          * the HTML element to create the grid inside. The grid will resize
          * to fill the domObj.
          */
         parent: null,
         /* Option: alternateRowColors
          * defaults to false.  If set to true, then alternating CSS classes
          * are used for rows.
          */
        alternateRowColors: false,
         /* Option: rowHeaders
          * defaults to false.  If set to true, then a column of row header
          * cells are displayed.
          */
        rowHeaders: false,
         /* Option: columnHeaders
          * defaults to false.  If set to true, then a column of row header
          * cells are displayed.
          */
        columnHeaders: false,
         /* Option: rowSelection
          * defaults to false.  If set to true, allow the user to select rows.
          */
        rowSelection: false,
         /* Option: columnSelection
          * defaults to false.  If set to true, allow the user to select
          * columns.
          */
        columnSelection: false,
         /* Option: cellPrelight
          * defaults to false.  If set to true, the cell under the mouse is
          * highlighted as the mouse moves.
          */
        cellPrelight: false,
         /* Option: rowPrelight
          * defaults to false.  If set to true, the row under the mouse is
          * highlighted as the mouse moves.
          */
        rowPrelight: false,
         /* Option: columnPrelight
          * defaults to false.  If set to true, the column under the mouse is
          * highlighted as the mouse moves.
          */
        columnPrelight: false,
        /* Option: rowHeaderPrelight
         * defaults to false.  If set to true, the row header of the row under
         * the mouse is highlighted as the mouse moves.
         */
        rowHeaderPrelight: false,
        /* Option: columnHeaderPrelight
         * defaults to false.  If set to true, the column header of the column
         * under the mouse is highlighted as the mouse moves.
         */
        columnHeaderPrelight: false,
         /* Option: cellSelection
          * defaults to false.  If set to true, allow the user to select
          * cells.
          */
        cellSelection: false
    },
    /**
     * Constructor: Jx.Grid
     * construct a new instance of Jx.Grid within the domObj
     *
     * Parameters:
     * options - <Jx.Grid.Options>
     */
    initialize : function( options ) {
        this.setOptions(options);

        this.domObj = new Element('div');
        new Jx.Layout(this.domObj, {
            onSizeChange: this.resize.bind(this)
        });
        
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }        
        
        this.rowColObj = new Element('div', {'class':'jxGridContainer'});
        
        this.colObj = new Element('div', {'class':'jxGridContainer'});
        this.colTable = new Element('table', {'class':'jxGridTable'});
        this.colTableHead = new Element('thead');
        this.colTable.appendChild(this.colTableHead);
        this.colTableBody = new Element('tbody');
        this.colTable.appendChild(this.colTableBody);
        this.colObj.appendChild(this.colTable);
        
        this.rowObj = new Element('div', {'class':'jxGridContainer'});
        this.rowTable = new Element('table', {'class':'jxGridTable'});
        this.rowTableHead = new Element('thead');
        this.rowTable.appendChild(this.rowTableHead);
        this.rowObj.appendChild(this.rowTable);
        
        this.gridObj = new Element('div', {'class':'jxGridContainer',styles:{overflow:'scroll'}});
        this.gridTable = new Element('table', {'class':'jxGridTable'});
        this.gridTableBody = new Element('tbody');
        this.gridTable.appendChild(this.gridTableBody);
        this.gridObj.appendChild(this.gridTable);
        
        this.domObj.appendChild(this.rowColObj);
        this.domObj.appendChild(this.rowObj);
        this.domObj.appendChild(this.colObj);
        this.domObj.appendChild(this.gridObj);
                        
        this.gridObj.addEvent('scroll', this.onScroll.bind(this));
        this.gridObj.addEvent('click', this.onClickGrid.bindWithEvent(this));
        this.rowObj.addEvent('click', this.onClickRowHeader.bindWithEvent(this));
        this.colObj.addEvent('click', this.onClickColumnHeader.bindWithEvent(this));
        this.gridObj.addEvent('mousemove', this.onMouseMoveGrid.bindWithEvent(this));
        this.rowObj.addEvent('mousemove', this.onMouseMoveRowHeader.bindWithEvent(this));
        this.colObj.addEvent('mousemove', this.onMouseMoveColumnHeader.bindWithEvent(this));
    },
    
    /**
     * Method: onScroll
     * handle the grid scrolling by updating the position of the headers
     */
    onScroll: function() {
        this.colObj.scrollLeft = this.gridObj.scrollLeft;
        this.rowObj.scrollTop = this.gridObj.scrollTop;        
    },
    
    /**
     * Method: resize
     * resize the grid to fit inside its container.  This involves knowing something
     * about the model it is displaying (the height of the column header and the
     * width of the row header) so nothing happens if no model is set
     */
    resize: function() {
        if (!this.model) {
            return;
        }
        
        /* TODO: Jx.Grid.resize
         * if not showing column or row, should we handle the resize differently
         */
        var colHeight = this.options.columnHeaders ? this.model.getColumnHeaderHeight() : 1;
        var rowWidth = this.options.rowHeaders ? this.model.getRowHeaderWidth() : 1;
        
        var size = Element.getContentBoxSize(this.domObj);
        
        /* -1 because of the right/bottom borders */
        this.rowColObj.setStyles({
            width: rowWidth-1, 
            height: colHeight-1
        });
        this.rowObj.setStyles({
            top:colHeight,
            left:0,
            width:rowWidth-1,
            height:size.height-colHeight-1
        });

        this.colObj.setStyles({
            top: 0,
            left: rowWidth,
            width: size.width - rowWidth - 1,
            height: colHeight - 1
        });

        this.gridObj.setStyles({
            top: colHeight,
            left: rowWidth,
            width: size.width - rowWidth - 1,
            height: size.height - colHeight - 1 
        });
    },
    
    /**
     * Method: setModel
     * set the model for the grid to display.  If a model is attached to the grid
     * it is removed and the new model is displayed.
     * 
     * Parameters:
     * model - {Object} the model to use for this grid
     */
    setModel: function(model) {
        this.model = model;
        if (this.model) {
            if (this.domObj.resize) {
                this.domObj.resize();
            }
            this.createGrid();
            this.resize();
        } else {
            this.destroyGrid();
        }
    },
    
    /**
     * Method: destroyGrid
     * destroy the contents of the grid safely
     */
    destroyGrid: function() {
        var n = this.colTableHead.cloneNode(false);
        this.colTable.replaceChild(n, this.colTableHead);
        this.colTableHead = n;
        
        n = this.colTableBody.cloneNode(false);
        this.colTable.replaceChild(n, this.colTableBody);
        this.colTableBody = n;
        
        n = this.rowTableHead.cloneNode(false);
        this.rowTable.replaceChild(n, this.rowTableHead);
        this.rowTableHead = n;
        
        n = this.gridTableBody.cloneNode(false);
        this.gridTable.replaceChild(n, this.gridTableBody);
        this.gridTableBody = n;
        
    },
    
    /**
     * Method: createGrid
     * create the grid for the current model
     */
    createGrid: function() {
        this.destroyGrid();
        if (this.model) {
            var model = this.model;
            var nColumns = model.getColumnCount();
            var nRows = model.getRowCount();
            
            /* create header if necessary */
            if (this.options.columnHeaders) {
                var colHeight = model.getColumnHeaderHeight();
                var trHead = new Element('tr');
                this.colTableHead.appendChild(trHead);
                var trBody = new Element('tr');
                this.colTableBody.appendChild(trBody);
                
                var th = new Element('th', {styles:{width:0,height:0}});
                trHead.appendChild(th);
                th = th.cloneNode(true);
                th.setStyle('height',colHeight);
                trBody.appendChild(th);
                for (var i=0; i<nColumns; i++) {
                    var colWidth = model.getColumnWidth(i);
                    th = new Element('th', {'class':'jxGridColHeadHide',styles:{width:colWidth}});
                    var p = new Element('p', {styles:{height:0,width:colWidth}});
                    th.appendChild(p);
                    trHead.appendChild(th);
                    th = new Element('th', {
                        'class':'jxGridColHead', 
                        html:model.getColumnHeaderHTML(i)
                    });
                    trBody.appendChild(th);
                }
                /* one extra column at the end for filler */
                var th = new Element('th',{styles:{width:1000,height:0}});
                trHead.appendChild(th);
                th = th.cloneNode(true);
                th.setStyle('height',colHeight - 1);
                th.className = 'jxGridColHead';
                trBody.appendChild(th);
                
            }
            
            if (this.options.rowHeaders) {
                var rowWidth = model.getRowHeaderWidth();
                var tr = new Element('tr');
                var td = new Element('td', {styles:{width:0,height:0}});
                tr.appendChild(td);
                var th = new Element('th', {styles:{width:rowWidth,height:0}});
                tr.appendChild(th);
                this.rowTableHead.appendChild(tr);
                for (var i=0; i<nRows; i++) {
                    var rowHeight = model.getRowHeight(i);
                    var tr = new Element('tr');
                    var td = new Element('td', {'class':'jxGridRowHeadHide', styles:{width:0,height:rowHeight}});
                    var p = new Element('p', {styles:{width:0,height:rowHeight}});
                    td.appendChild(p);
                    tr.appendChild(td);
                    var th = new Element('th', {'class':'jxGridRowHead', html:model.getRowHeaderHTML(i)});
                    tr.appendChild(th);
                    this.rowTableHead.appendChild(tr);
                }
                /* one extra row at the end for filler */
                var tr = new Element('tr');
                var td = new Element('td',{
                    styles:{
                        width:0,
                        height:1000
                    }
                });
                tr.appendChild(td);
                var th = new Element('th',{
                    'class':'jxGridRowHead',
                    styles:{
                        width:rowWidth,
                        height:1000
                    }
                });
                tr.appendChild(th);
                this.rowTableHead.appendChild(tr);
            }
            
            var colHeight = model.getColumnHeaderHeight();
            var trBody = new Element('tr');
            this.gridTableBody.appendChild(trBody);
            
            var td = new Element('td', {styles:{width:0,height:0}});
            trBody.appendChild(td);
            for (var i=0; i<nColumns; i++) {
                var colWidth = model.getColumnWidth(i);
                td = new Element('td', {'class':'jxGridColHeadHide', styles:{width:colWidth}});
                var p = new Element('p', {styles:{width:colWidth,height:0}});
                td.appendChild(p);
                trBody.appendChild(td);
            }
            
            for (var j=0; j<nRows; j++) {
                var rowHeight = model.getRowHeight(j);
                var actualRowHeight = rowHeight;
                var tr = new Element('tr');
                this.gridTableBody.appendChild(tr);
                
                var td = new Element('td', {
                    'class':'jxGridRowHeadHide',
                    styles: {
                        width: 0,
                        height:rowHeight
                    }
                });
                var p = new Element('p',{styles:{height:rowHeight}});
                td.appendChild(p);
                tr.appendChild(td);
                for (var i=0; i<nColumns; i++) {
                    var colWidth = model.getColumnWidth(i);
                    td = new Element('td', {'class':'jxGridCell'});
                    td.innerHTML = model.getValueAt(j,i);
                    tr.appendChild(td);
                    var tdSize = td.getSize();
                    if (tdSize.height > actualRowHeight) {
                        actualRowHeight = tdSize.height;
                    }
                }
                /* some notes about row sizing
                 * In Safari, the height of a TR is always returned as 0
                 * In Safari, the height of any given TD is the height it would
                 * render at, not the actual height of the row
                 * In IE, the height is returned 1px bigger than any other browser
                 * Firefox just works
                 *
                 * So, for Safari, we have to measure every TD and take the highest one
                 * and if its IE, we subtract 1 from the overall height, making all
                 * browsers identical
                 *
                 * Using document.all is not a good hack for this
                 */
                if (document.all) {
                    actualRowHeight -= 1;
                }
                if (this.options.rowHeaders) {
                    this.setRowHeaderHeight(j, actualRowHeight);                    
                }
                /* if we apply the class before adding content, it
                 * causes a rendering error in IE (off by 1) that is 'fixed'
                 * when another class is applied to the row, causing dynamic
                 * shifting of the row heights
                 */
                if (this.options.alternateRowColors) {
                    tr.className = (j%2) ? 'jxGridRowOdd' : 'jxGridRowEven';
                } else {
                    tr.className = 'jxGridRowAll';
                }
            }
            
        }
    },
    
    /**
     * Method: setRowHeaderHeight
     * set the height of a row.  This is used internally to adjust the height of
     * the row header when cell contents wrap.  A limitation of the table structure
     * is that overflow: hidden on a td will work horizontally but not vertically
     *
     * Parameters:
     * row - {Integer} the row to set the height for
     * height - {Integer} the height to set the row (in pixels)
     */
    setRowHeaderHeight: function(row, height) {
        //this.rowTableHead.childNodes[row+1].childNodes[0].style.height = (height) + 'px';
        this.rowTableHead.childNodes[row+1].childNodes[0].childNodes[0].style.height = (height) + 'px';
    },
    
    /**
     * Method: gridChanged
     * called through the grid listener interface when data has changed in the
     * underlying model
     *
     * Parameters:
     * model - {Object} the model that changed
     * row - {Integer} the row that changed
     * col - {Integer} the column that changed
     * value - {Mixed} the new value
     */
    gridChanged: function(model, row, col, value) {
        if (this.model == model) {
            this.gridObj.childNodes[row].childNodes[col].innerHTML = value;
        }
    },
    
    /** 
     * Method: prelightRowHeader
     * apply the jxGridRowHeaderPrelight style to the header cell of a row.
     * This removes the style from the previously pre-lit row header.
     * 
     * Parameters:
     * row - {Integer} the row to pre-light the header cell of
     */
    prelightRowHeader: function(row) {
        var cell = (row >= 0 && row < this.rowTableHead.rows.length-1) ? this.rowTableHead.rows[row+1].cells[1] : null;
        if (this.prelitRowHeader != cell) {
            if (this.prelitRowHeader) {
                this.prelitRowHeader.removeClass('jxGridRowHeaderPrelight');
            }
            this.prelitRowHeader = cell;
            if (this.prelitRowHeader) {
                this.prelitRowHeader.addClass('jxGridRowHeaderPrelight');
            }
        }
    },
    
    /** 
     * Method: prelightColumnHeader
     * apply the jxGridColumnHeaderPrelight style to the header cell of a column.
     * This removes the style from the previously pre-lit column header.
     * 
     * Parameters:
     * col - {Integer} the column to pre-light the header cell of
     */
    prelightColumnHeader: function(col) {
        if (this.colTableBody.rows.length == 0) {
            return;
        }
        var cell = (col >= 0 && col < this.colTableBody.rows[0].cells.length-1) ? this.colTableBody.rows[0].cells[col+1] : null;
        if (this.prelitColumnHeader != cell) {
            if (this.prelitColumnHeader) {
                this.prelitColumnHeader.removeClass('jxGridColumnHeaderPrelight');
            }
            this.prelitColumnHeader = cell;
            if (this.prelitColumnHeader) {
                this.prelitColumnHeader.addClass('jxGridColumnHeaderPrelight');
            }
        }
    },
    
    /** 
     * Method: prelightRow
     * apply the jxGridRowPrelight style to row.
     * This removes the style from the previously pre-lit row.
     * 
     * Parameters:
     * row - {Integer} the row to pre-light
     */
    prelightRow: function(row) {
        var tr = (row >= 0 && row < this.gridTableBody.rows.length-1) ? this.gridTableBody.rows[row+1] : null;
        
        if (this.prelitRow != row) {
            if (this.prelitRow) {
                this.prelitRow.removeClass('jxGridRowPrelight');
            }
            this.prelitRow = tr;
            if (this.prelitRow) {
                this.prelightRowHeader(row);
                this.prelitRow.addClass('jxGridRowPrelight');
            }
        }
    },
    
    /** 
     * Method: prelightColumn
     * apply the jxGridColumnPrelight style to a column.
     * This removes the style from the previously pre-lit column.
     * 
     * Parameters:
     * col - {Integer} the column to pre-light
     *
     * TODO: Jx.Grid.prelightColumn
     * Not Yet Implemented.
     */
    prelightColumn: function(col) {
        /* TODO: Jx.Grid.prelightColumn
         * implement column prelighting (possibly) 
         */
        if (col >= 0 && col < this.gridTable.rows[0].cells.length) {
            if ($chk(this.prelitColumn)) {
                for (var i=0; i<this.gridTable.rows.length; i++) {
                    this.gridTable.rows[i].cells[this.prelitColumn + 1].removeClass('jxGridColumnPrelight');
                }
            }
            this.prelitColumn = col;
            for (var i=0; i<this.gridTable.rows.length; i++) {
                this.gridTable.rows[i].cells[col + 1].addClass('jxGridColumnPrelight');
            }            
        }
        
        this.prelightColumnHeader(col);
    },
    
    /** 
     * Method: prelightCell
     * apply the jxGridCellPrelight style to a cell.
     * This removes the style from the previously pre-lit cell.
     *
     * Parameters:
     * row - {Integer} the row of the cell to pre-light
     * col - {Integer} the column of the cell to pre-light
     */
    prelightCell: function(row, col) {
         var td = (row >=0 && col >=0 && row < this.gridTableBody.rows.length - 1 && col < this.gridTableBody.rows[row+1].cells.length - 1) ? this.gridTableBody.rows[row+1].cells[col+1] : null;
        if (this.prelitCell != td) {
            if (this.prelitCell) {
                this.prelitCell.removeClass('jxGridCellPrelight');
            }
            this.prelitCell = td;
            if (this.prelitCell) {
                this.prelitCell.addClass('jxGridCellPrelight');
            }
        }    
    },
    
    /** 
     * Method: selectCell
     * Select a cell and apply the jxGridCellSelected style to it.
     * This deselects a previously selected cell.
     *
     * If the model supports cell selection, it should implement
     * a cellSelected function to receive notification of the selection.
     *
     * Parameters:
     * row - {Integer} the row of the cell to select
     * col - {Integer} the column of the cell to select
     */
    selectCell: function(row, col) {
         var td = (row >=0 && col >=0 && row < this.gridTableBody.rows.length - 1 && col < this.gridTableBody.rows[row+1].cells.length - 1) ? this.gridTableBody.rows[row+1].cells[col+1] : null;
         if (!td) {
             return;
         }
         
         if (this.selectedCell) {
             this.selectedCell.removeClass('jxGridCellSelected');
         }
         this.selectedCell = td;
         this.selectedCell.addClass('jxGridCellSelected');
    },
    
    /** 
     * Method: selectRowHeader
     * Apply the jxGridRowHeaderSelected style to the row header cell of a
     * selected row.
     *
     * Parameters:
     * row - {Integer} the row header to select
     * selected - {Boolean} the new state of the row header
     */
    selectRowHeader: function(row, selected) {
        var cell = (row >= 0 && row < this.rowTableHead.rows.length-1) ? this.rowTableHead.rows[row+1].cells[1] : null;
        if (!cell) {
            return;
        }
        if (selected) {
            cell.addClass('jxGridRowHeaderSelected');
        } else {
            cell.removeClass('jxGridRowHeaderSelected');
        }
    },
    
    /** 
     * Method: selectRow
     * Select a row and apply the jxGridRowSelected style to it.
     *
     * If the model supports row selection, it should implement
     * a rowSelected function to receive notification of the selection.
     *
     * Parameters:
     * row - {Integer} the row to select
     * selected - {Boolean} the new state of the row
     */
    selectRow: function(row, selected) {
        var tr = (row >= 0 && row < this.gridTableBody.rows.length - 1) ? this.gridTableBody.rows[row+1] : null;
        if (tr) {
            if (selected) {
                tr.addClass('jxGridRowSelected');
            } else {
                tr.removeClass('jxGridRowSelected');
            }
            this.selectRowHeader(row, selected);
        }
    },
    
    /** 
     * method: selectColumnHeader
     * Apply the jxGridColumnHeaderSelected style to the column header cell of a
     * selected column.
     *
     * Parameters:
     * col - {Integer} the column header to select
     * selected - {Boolean} the new state of the column header
     */
    selectColumnHeader: function(col, selected) {
        if (this.colTableBody.rows.length == 0) {
            return;
        }
        var cell = (col >= 0 && col < this.colTableBody.rows[0].cells.length-1) ? this.colTableBody.rows[0].cells[col+1] : null;
        if (cell == null) { 
            return; 
        }
        
        if (selected) {
            cell.addClass('jxGridColumnHeaderSelected');
        } else {
            cell.removeClass('jxGridColumnHeaderSelected');
        }
    },
    
    /** 
     * Method: selectColumn
     * Select a column.
     * This deselects a previously selected column.
     *
     * Parameters:
     * col - {Integer} the column to select
     * selected - {Boolean} the new state of the column
     */
    selectColumn: function(col, selected) {
        /* todo: implement column selection */
        if (col >= 0 && col < this.gridTable.rows[0].cells.length) {
            if (selected) {
                for (var i=0; i<this.gridTable.rows.length; i++) {
                    this.gridTable.rows[i].cells[col + 1].addClass('jxGridColumnSelected');
                }
            } else {
                for (var i=0; i<this.gridTable.rows.length; i++) {
                    this.gridTable.rows[i].cells[col + 1].removeClass('jxGridColumnSelected');
                }   
            }
            this.selectColumnHeader(col, selected);
        }
    },
    
    /**
     * Method: onMouseMoveGrid
     * handle the mouse moving over the main grid.  This pre-lights the cell,
     * and subsquently the row and column (and headers).
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onMouseMoveGrid: function(e) {
        var rc = this.getRowColumnFromEvent(e);
        if (this.options.cellPrelight) {
            this.prelightCell(rc.row, rc.column);            
        }
        if (this.options.rowPrelight) {
            this.prelightRow(rc.row);            
        }
        if (this.options.rowHeaderPrelight) {
            this.prelightRowHeader(rc.row);            
        }
        if (this.options.columnPrelight) {
            this.prelightColumn(rc.column);
        }        
        if (this.options.columnHeaderPrelight) {
            this.prelightColumnHeader(rc.column);
        }        
    },
    
    /**
     * Method: onMouseMoveRowHeader
     * handle the mouse moving over the row header cells.  This pre-lights
     * the row and subsequently the row header.
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onMouseMoveRowHeader: function(e) {
        if (this.options.rowPrelight) {
            var rc = this.getRowColumnFromEvent(e);
            this.prelightRow(rc.row);            
        }
    },

    /**
     * Method: onMouseMoveColumnHeader
     * handle the mouse moving over the column header cells.  This pre-lights
     * the column and subsequently the column header.
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onMouseMoveColumnHeader: function(e) {
        if (this.options.columnPrelight) {
            var rc = this.getRowColumnFromEvent(e);
            this.prelightColumn(rc.column);
        }
    },
    
    /**
     * Method: onClickGrid
     * handle the user clicking on the grid.  This triggers an
     * event to the model (if a cellSelected function is provided).
     *
     * The following is an example of a function in the model that selects
     * a row when the cellSelected function is called and deselects any rows
     * that are currently selected.
     *
     * (code)
     * cellSelected: function(grid, row,col) { 
     *    if (this.selectedRow != null) {
     *        grid.selectRow(this.selectedRow, false);
     *    }
     *    this.selectedRow = row;
     *    grid.selectRow(row, true);
     * }
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onClickGrid: function(e) {
        var rc = this.getRowColumnFromEvent(e);
        
        if (this.options.cellSelection && this.model.cellSelected) {
            this.model.cellSelected(this, rc.row, rc.column);
        }
        if (this.options.rowSelection && this.model.rowSelected) {
            this.model.rowSelected(this, rc.row);
        }
        if (this.options.columnSelection && this.model.columnSelected) {
            this.model.columnSelected(this, rc.column);
        }
        
    },
    
    /**
     * Method: onClickRowHeader
     * handle the user clicking on the row header.  This triggers an
     * event to the model (if a rowSelected function is provided) which
     * can then select the row if desired.  
     *
     * The following is an example of a function in the model that selects
     * a row when the rowSelected function is called and deselects any rows
     * that are currently selected.  More complex code could be written to 
     * allow the user to select multiple rows.
     *
     * (code)
     * rowSelected: function(grid, row) {
     *    if (this.selectedRow != null) {
     *        grid.selectRow(this.selectedRow, false);
     *    }
     *    this.selectedRow = row;
     *    grid.selectRow(row, true);
     * }
     * (end)
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onClickRowHeader: function(e) {
        var rc = this.getRowColumnFromEvent(e);
        
        if (this.options.rowSelection && this.model.rowSelected) {
            this.model.rowSelected(this, rc.row);
        }
    },
    
    /**
     * Method: onClickColumnHeader
     * handle the user clicking on the column header.  This triggers column
     * selection and column (and header) styling changes and an
     * event to the model (if a columnSelected function is provided)
     *
     * The following is an example of a function in the model that selects
     * a column when the columnSelected function is called and deselects any 
     * columns that are currently selected.  More complex code could be written
     * to allow the user to select multiple columns.
     *
     * (code)
     * colSelected: function(grid, col) {
     *    if (this.selectedColumn != null) {
     *        grid.selectColumn(this.selectedColumn, false);
     *    }
     *    this.selectedColumn = col;
     *    grid.selectColumn(col, true);
     * }
     * (end)
     *
     * Parameters:
     * e - {Event} the browser event object
     */
    onClickColumnHeader: function(e) {
        var rc = this.getRowColumnFromEvent(e);
        
        if (this.options.columnSelection && this.model.columnSelected) {
            this.model.columnSelected(this, rc.column);
        }
    },
    
    /**
     * method: getRowColumnFromEvent
     * retrieve the row and column indexes from an event click.
     * This function is used by the grid, row header and column
     * header to safely get these numbers.
     *
     * If the event isn't valid (i.e. it wasn't on a TD or TH) then
     * the returned values will be -1, -1
     *
     * Parameters:
     * e - {Event} the browser event object
     *
     * @return Object an object with two properties, row and column,
     *         that contain the row and column that was clicked
     */
    getRowColumnFromEvent: function(e) {
        var td = e.target;
        if (td.tagName != 'TD' && td.tagName != 'TH') {
            return {row:-1,column:-1};
        }
        var tr = td.parentNode;
        var col = td.cellIndex - 1; /* because of hidden spacer column */
        var row = tr.rowIndex - 1; /* because of hidden spacer row */
        
        if (col == -1) { 
            /* bug in safari returns 0 for cellIndex - only choice seems
             * to be to loop through the row
             */
            for (var i=0; i<tr.childNodes.length; i++) {
                if (tr.childNodes[i] == td) {
                    col = i - 1;
                    break;
                }
            }
        }
        return {row:row,column:col};
    }
});/**
 * Class: Jx.Grid.Model
 *
 * Extends: Object
 *
 * Implements: Options, Events
 *
 * A Jx.Grid.Model is the source of data for a <Jx.Grid> instance.  The
 * default implementation of the grid model works with two-dimensional
 * arrays of data and acts as a convenient base class for custom models
 * based on other sources of data.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Grid.Model = new Class({
    Family: 'Jx.Grid.Model',
    Implements: [Events, Options],
    options: {
        /* Option: colHeaderHeight
         * default 28, the height of the column header row
         */
        colHeaderHeight: 28,
        /* Option: colHeaderHeight
         * default 28, the height of the column header row
         */
        rowHeaderWidth: 28,
        /* Option: rowHeaderWidth
         * default 28, the width of the row header column.
         */
        colWidth: 50,
        /* Option: colWidth
         * default 50, the width of columns
         */
        rowHeight: 20,
        /* Option: rowHeight
         * default 20, the height of rows
         */
        rowHeaders: null,
        /* Option: columnHeaders
         * optional column headers, defaults to null
         */
        columnHeaders: null
    },
    data: null,
    /**
     * Constructor: Jx.Grid.Model
     * create a new grid model
     *
     * Parameters:
     * data - array of data to display in the grid
     * options - <Jx.Grid.Model.Options>
     */
    initialize: function(data, options) {
        this.data = data || [];
        this.setOptions(options);
    },
    /** 
     * Method: getColumnCount
     * This function returns the number of columns of data in the 
     * model as an integer value.
     */ 
    getColumnCount: function() { return (this.data && this.data[0]) ? this.data[0].length : 0; },
    /* Method: getColumnHeaderHTML
     * This function returns an HTML string to be placed in the
     * column header for the given column index.
     */ 
    getColumnHeaderHTML: function(col) { 
        return this.options.columnHeaders?this.options.columnHeaders[col]:col+1;
     },
     /* Method: getColumnHeaderHeight
      * This function returns an integer which is the height of the
      * column header row in pixels.
      */ 
    getColumnHeaderHeight: function() { return this.options.colHeaderHeight; },
    /* Method: getColumnWidth
     * This function returns an integer which is the width of the
     * given column in pixels.
     */ 
    getColumnWidth: function(col) { return this.options.colWidth; },
    /* Method: getRowHeaderHTML
     * This function returns an HTML string to be placed in the row
     * header for the given row index
     */ 
    getRowHeaderHTML: function(row) { 
        return this.options.rowHeaders?this.options.rowHeaders[row]:row+1; 
    },
    /* Method: getRowHeaderWidth
     * This function returns an integer which is the width of the row
     * header column in pixels.
     */ 
    getRowHeaderWidth: function() { return this.options.rowHeaderWidth; },
    /* Method: getRowHeight
     * This function returns an integer which is the height of the
     * given row in pixels.
     */ 
    getRowHeight: function(row) { return this.options.rowHeight; },
    /* Method: getRowCount
     * This function returns the number of rows of data in the model
     * as an integer value.
     */ 
    getRowCount: function() { return this.data.length },
    /* Method: getValueAt
     * This function returns an HTML string which is the text to place
     * in the cell at the given row and column.
     */ 
    getValueAt: function(row, col) { return (this.data && $chk(this.data[row])) ? this.data[row][col] : ''; },
    /* Method: setColumnWidth
     * This function is called with a column index and width in pixels
     * when a column is resized.  This function is only required if the grid
     * allows resizeable columns.
     */
    setColumnWidth: function() {},
    /* Method: isCellEditable
     * This function returns a boolean value to indicate if a given
     * cell is editable by the user.
     */ 
    isCellEditable: function() { return false },
    /* Method: setValueAt
     * This function is called with the row and column of a cell and a
     * new value for the cell.  It is mandatory to provide this function if any of
     * the cells in the model are editable.
     */ 
    setValueAt: function(row, col, value) {},
    /* Method: rowSelected
     * This function is called by the grid to indicate that the user
     * has selected a row by clicking on the row header.
     */ 
    rowSelected: function(grid, row) {
        if (this.selectedRow != null) {
            grid.selectRow(this.selectedRow, false);
        }
        this.selectedRow = row;
        grid.selectRow(row, true);
        this.fireEvent('select-row', row);
    },
    /* Method: columnSelected
     * This function is called by the grid to indicate that the user
     * has selected a column by clicking on the column header.
     */ 
    columnSelected: function(grid, col) {
        if (this.selectedCol != null) {
            grid.selectColumn(this.selectedCol, false);
        }
        this.selectedCol = col;
        grid.selectColumn(col, true);
        this.fireEvent('select-column', col);
    },
    /* Method: cellSelected
     * This function is called by the grid to indicate that the user
     * has selected a cell by clicking on the cell in the grid.
     */
    cellSelected: function(grid, row,col) { 
        grid.selectCell(row, col);
        this.fireEvent('select-cell', [row, col]);
    
    }
});
// $Id: context.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Menu.Context
 *
 * Extends: Jx.Menu
 *
 * A <Jx.Menu> that has no button but can be opened at a specific 
 * browser location to implement context menus (for instance).
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * TODO - add open/close events?
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Menu.Context = new Class({
    Family: 'Jx.Menu.Context',
    /** Extends:
     * <Jx.Menu>
     */
    Extends: Jx.Menu,
    /**
     * Constructor: Jx.ContextMenu
     * create a new context menu
     *
     * Parameters:
     * id - {HTMLElement} element or id to make this the context menu
     * for.  The menu hooks the oncontextmenu event of the element
     * and shows itself at the mouse position where the right-click
     * happened.
     */
    initialize : function(id) {
        this.parent();
        if ($(id)) {
            $(id).addEvent('contextmenu', this.show.bindWithEvent(this));
        }
    },
    /**
     * Method: show
     * Show the context menu at the location of the mouse click
     *
     * Parameters:
     * e - {Event} the mouse event
     */
    show : function(e) {
        if (this.items.length ==0) {
            return;
        }
        
        this.contentContainer.setStyle('visibility','hidden');
        this.contentContainer.setStyle('display','block');
        $(document.body).adopt(this.contentContainer);            
        /* we have to size the container for IE to render the chrome correctly
         * but just in the menu/sub menu case - there is some horrible peekaboo
         * bug in IE related to ULs that we just couldn't figure out
         */
        this.contentContainer.setContentBoxSize(this.subDomObj.getMarginBoxSize());
        
        this.position(this.contentContainer, document.body, {
            horizontal: [e.page.x + ' left'],
            vertical: [e.page.y + ' top', e.page.y + ' bottom'],
            offsets: this.chromeOffsets
        });

        this.contentContainer.setStyle('visibility','');
        this.showChrome(this.contentContainer);
                
        document.addEvent('mousedown', this.hideWatcher);
        document.addEvent('keyup', this.keypressWatcher);

        e.stop();
    }    
});// $Id: menu.separator.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Menu.Separator
 *
 * Extends: Object
 *
 * A convenience class to create a visual separator in a menu.
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Menu.Separator = new Class({
    Family: 'Jx.Menu.Separator',
    /**
     * Property: domObj
     * {HTMLElement} the HTML element that the separator is contained
     * within
     */
    domObj: null,
    /**
     * Property: owner
     * {<Jx.Menu>, <Jx.Menu.SubMenu>} the menu that the separator is in.
     */
    owner: null,
    /**
     * Constructor: Jx.Menu.Separator
     * Create a new instance of a menu separator
     */
    initialize: function() {
        this.domObj = new Element('li',{'class':'jxMenuItem'});
        var span = new Element('span', {'class':'jxMenuSeparator','html':'&nbsp;'});
        this.domObj.appendChild(span);
    },
    /**
     * Method: setOwner
     * Set the ownder of this menu item
     *
     * Parameters:
     * obj - {Object} the new owner
     */
    setOwner: function(obj) {
        this.owner = obj;
    },
    /**
     * Method: hide
     * Hide the menu item.
     */
    hide: $empty,
    /**
     * Method: show
     * Show the menu item
     */
    show: $empty
});// $Id: submenu.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Menu.SubMenu
 *
 * Extends: <Jx.Menu.Item>
 *
 * Implements: <Jx.AutoPosition>, <Jx.Chrome>
 *
 * A sub menu contains menu items within a main menu or another
 * sub menu.
 *
 * The structure of a SubMenu is the same as a <Jx.Menu.Item> with
 * an additional unordered list element appended to the container.
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Menu.SubMenu = new Class({
    Family: 'Jx.Menu.SubMenu',
    Extends: Jx.Menu.Item,
    Implements: [Jx.AutoPosition, Jx.Chrome],
    /**
     * Property: subDomObj
     * {HTMLElement} the HTML container for the sub menu.
     */
    subDomObj: null,
    /**
     * Property: owner
     * {<Jx.Menu> or <Jx.SubMenu>} the menu or sub menu that this sub menu
     * belongs
     */
    owner: null,
    /**
     * Property: visibleItem
     * {<Jx.MenuItem>} the visible item within the menu
     */
    visibleItem: null,
    /**
     * Property: items
     * {Array} the menu items that are in this sub menu.
     */
    items: null,
    /**
     * Constructor: Jx.SubMenu
     * Create a new instance of Jx.SubMenu
     *
     * Parameters:
     * options - see <Jx.Button.Options>
     */
    initialize: function(options) { 
        this.open = false;
        this.items = [];
        this.parent(options);
        this.domA.addClass('jxButtonSubMenu');
        
        this.contentContainer = new Element('div', {
            'class': 'jxMenuContainer'
        });
        this.subDomObj = new Element('ul', {
            'class':'jxSubMenu'
        });
        this.contentContainer.adopt(this.subDomObj);
    },
    /**
     * Method: setOwner
     * Set the owner of this sub menu
     *
     * Parameters:
     * obj - {Object} the owner
     */
    setOwner: function(obj) {
        this.owner = obj;
    },
    /**
     * Method: show
     * Show the sub menu
     */
    show: function() {
        if (this.open || this.items.length == 0) {
            return;
        }
        
        this.contentContainer.setStyle('visibility','hidden');
        this.contentContainer.setStyle('display','block');
        $(document.body).adopt(this.contentContainer);            
        /* we have to size the container for IE to render the chrome correctly
         * but just in the menu/sub menu case - there is some horrible peekaboo
         * bug in IE related to ULs that we just couldn't figure out
         */
        this.contentContainer.setContentBoxSize(this.subDomObj.getMarginBoxSize());
        this.showChrome(this.contentContainer);
        
        this.position(this.contentContainer, this.domObj, {
            horizontal: ['right left', 'left right'],
            vertical: ['top top'],
            offsets: this.chromeOffsets
        });
        
        this.open = true;
        this.contentContainer.setStyle('visibility','');
        
        this.setActive(true);
    },
    
    eventInMenu: function(e) {
        if (this.visibleItem && 
            this.visibleItem.eventInMenu && 
            this.visibleItem.eventInMenu(e)) {
            return true;
        }
        return $(e.target).descendantOf(this.domObj) ||
               $(e.target).descendantOf(this.subDomObj) ||
               this.items.some(
                   function(item) {
                       return item instanceof Jx.Menu.SubMenu && 
                              item.eventInMenu(e);
                   }
               );
    },
    
    /**
     * Method: hide
     * Hide the sub menu
     */
    hide: function() {
        if (!this.open) {
            return;
        }
        this.open = false;
        this.items.each(function(item){item.hide();});
        this.contentContainer.setStyle('display','none');
        this.visibleItem = null;
    },
    /**
     * Method: add
     * Add menu items to the sub menu.
     *
     * Parameters:
     * item - {<Jx.MenuItem>} the menu item to add.  Multiple menu items
     * can be added by passing multiple arguments to this function.
     */
    add : function() { /* menu */
        var that = this;
        $A(arguments).each(function(item){
            that.items.push(item);
            item.setOwner(that);
            that.subDomObj.adopt(item.domObj);
        });
        return this;
    },
    /**
     * Method: insertBefore
     * Insert a menu item before another menu item.
     *
     * Parameters:
     * newItem - {<Jx.MenuItem>} the menu item to insert
     * targetItem - {<Jx.MenuItem>} the menu item to insert before
     */
    insertBefore: function(newItem, targetItem) {
        var bInserted = false;
        for (var i=0; i<this.items.length; i++) {
            if (this.items[i] == targetItem) {
                this.items.splice(i, 0, newItem);
                this.subDomObj.insertBefore(newItem.domObj, targetItem.domObj);
                bInserted = true;
                break;
            }
        }
        if (!bInserted) {
            this.add(newItem);
        }
    },
    /**
     * Method: remove
     * Remove a single menu item from the menu.
     *
     * Parameters:
     * item - {<Jx.MenuItem} the menu item to remove.
     */
    remove: function(item) {
        for (var i=0; i<this.items.length; i++) {
            if (this.items[i] == item) {
                this.items.splice(i,1);
                this.subDomObj.removeChild(item.domObj);
                break;
            }
        }
    },
    /**
     * Method: deactivate
     * Deactivate the sub menu
     *
     * Parameters:
     * e - {Event} the event that triggered the menu being
     * deactivated.
     */
    deactivate: function(e) {
        if (this.owner) {
            this.owner.deactivate(e);            
        }
    },
    /**
     * Method: isActive
     * Indicate if this sub menu is active
     *
     * Returns:
     * {Boolean} true if the <Jx.Menu> that ultimately contains
     * this sub menu is active, false otherwise.
     */
    isActive: function() { 
        if (this.owner) {
            return this.owner.isActive();
        } else {
            return false;
        }
    },
    /**
     * Method: setActive
     * Set the active state of the <Jx.Menu> that contains this sub menu
     *
     * Parameters:
     * isActive - {Boolean} the new active state
     */
    setActive: function(isActive) { 
        if (this.owner && this.owner.setActive) {
            this.owner.setActive(isActive);
        }
    },
    /**
     * Method: setVisibleItem
     * Set a sub menu of this menu to be visible and hide the previously
     * visible one.
     *
     * Parameters: 
     * obj - {<Jx.SubMenu>} the sub menu that should be visible
     */
    setVisibleItem: function(obj) {
        if (this.visibleItem != obj) {
            if (this.visibleItem && this.visibleItem.hide) {
                this.visibleItem.hide();
            }
            this.visibleItem = obj;
            this.visibleItem.show();
        }
    }
});// $Id: snap.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Splitter.Snap
 *
 * Extends: Object
 *
 * A helper class to create an element that can snap a split panel open or
 * closed.
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Splitter.Snap = new Class({
    Family: 'Jx.Splitter.Snap',
    /**
     * Property: snap
     * {HTMLElement} the DOM element of the snap (the thing that gets
     * clicked).
     */
    snap: null,
    /**
     * Property: element
     * {HTMLElement} An element of the <Jx.Splitter> that gets controlled
     * by this snap
     */
    element: null,
    /**
     * Property: splitter
     * {<Jx.Splitter>} the splitter that this snap is associated with.
     */
    splitter: null,
    /**
     * Property: layout
     * {String} track the layout of the splitter for convenience.
     */
    layout: 'vertical',
    /**
     * Constructor: Jx.Splitter.Snap
     * Create a new Jx.Splitter.Snap
     *
     * Parameters:
     * snap - {HTMLElement} the clickable thing that snaps the element
     *           open and closed
     * element - {HTMLElement} the element that gets controlled by the snap
     * splitter - {<Jx.Splitter>} the splitter that this all happens inside of.
     */
    initialize: function(snap, element, splitter, events) {
        this.snap = snap;
        this.element = element;
        var jxl = element.retrieve('jxLayout');
        jxl.addEvent('sizeChange', this.sizeChange.bind(this));
        this.splitter = splitter;
        this.layout = splitter.options.layout; 
        var jxo = jxl.options;
        var size = this.element.getContentBoxSize();
        if (this.layout == 'vertical') {
            this.originalSize = size.height;
            this.minimumSize = jxo.minHeight ? jxo.minHeight : 0;
        } else {
            this.originalSize = size.width;
            this.minimumSize = jxo.minWidth ? jxo.minWidth : 0;
        }
        events.each(function(eventName) {
            snap.addEvent(eventName, this.toggleElement.bind(this));
        }, this);
    },
    
    /**
     * Method: toggleElement
     * Snap the element open or closed.
     */
    toggleElement: function() {
        var size = this.element.getContentBoxSize();
        var newSize = {};
        if (this.layout == 'vertical') {
            if (size.height == this.minimumSize) {
                newSize.height = this.originalSize;
            } else {
                this.originalSize = size.height;
                newSize.height = this.minimumSize;
            }
        } else {
            if (size.width == this.minimumSize) {
                newSize.width = this.originalSize;
            } else {
                this.originalSize = size.width;
                newSize.width = this.minimumSize;
            }
        }
        this.element.resize(newSize);
        this.splitter.sizeChanged();
    },
    
    /**
     * Method: sizeChanged
     * Handle the size of the element changing to see if the
     * toggle state has changed.
     */
    sizeChange: function() {
        var size = this.element.getContentBoxSize();
        if (this.layout == 'vertical') {
            if (size.height == this.minimumSize) {
                this.snap.addClass('jxSnapClosed');
                this.snap.removeClass('jxSnapOpened');
            } else {
                this.snap.addClass('jxSnapOpened');
                this.snap.removeClass('jxSnapClosed');
            }
        } else {
            if (size.width == this.minimumSize) {
                this.snap.addClass('jxSnapClosed');
                this.snap.removeClass('jxSnapOpened');
            } else {
                this.snap.addClass('jxSnapOpened');
                this.snap.removeClass('jxSnapClosed');
            }
        }
    }
});// $Id: toolbar.js 433 2009-05-14 12:49:46Z pagameba $
/**
 * Class: Jx.Toolbar
 *
 * Extends: Object
 *
 * Implements: Options, Events
 *
 * A toolbar is a container object that contains other objects such as
 * buttons.  The toolbar organizes the objects it contains automatically,
 * wrapping them as necessary.  Multiple toolbars may be placed within
 * the same containing object.
 *
 * Jx.Toolbar includes CSS classes for styling the appearance of a
 * toolbar to be similar to traditional desktop application toolbars.
 *
 * There is one special object, Jx.ToolbarSeparator, that provides
 * a visual separation between objects in a toolbar.
 *
 * While a toolbar is generally a *dumb* container, it serves a special
 * purpose for menus by providing some infrastructure so that menus can behave
 * properly.
 *
 * In general, almost anything can be placed in a Toolbar, and mixed with 
 * anything else.
 *
 * Example:
 * The following example shows how to create a Jx.Toolbar instance and place
 * two objects in it.
 *
 * (code)
 * //myToolbarContainer is the id of a <div> in the HTML page.
 * function myFunction() {}
 * var myToolbar = new Jx.Toolbar('myToolbarContainer');
 * 
 * var myButton = new Jx.Button(buttonOptions);
 *
 * var myElement = document.createElement('select');
 *
 * myToolbar.add(myButton, new Jx.ToolbarSeparator(), myElement);
 * (end)
 *
 * Events:
 * add - fired when one or more buttons are added to a toolbar
 * remove - fired when on eor more buttons are removed from a toolbar
 *
 * Implements: 
 * Options
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Toolbar = new Class({
    Family: 'Jx.Toolbar',
    Implements: [Options,Events],
    /**
     * Property: items
     * {Array} an array of the things in the toolbar.
     */
    items : null,
    /**
     * Property: domObj
     * {HTMLElement} the HTML element that the toolbar lives in
     */
    domObj : null,
    /**
     * Property: isActive
     * When a toolbar contains <Jx.Menu> instances, they want to know
     * if any menu in the toolbar is active and this is how they
     * find out.
     */
    isActive : false,
    options: {
        type: 'Toolbar',
        /* Option: position
         * the position of this toolbar in the container.  The position
         * affects some items in the toolbar, such as menus and flyouts, which
         * need to open in a manner sensitive to the position.  May be one of
         * 'top', 'right', 'bottom' or 'left'.  Default is 'top'.
        position: 'top',
        */
        /* Option: parent
         * a DOM element to add this toolbar to
         */
        parent: null,
        /* Option: autoSize
         * if true, the toolbar will attempt to set its size based on the
         * things it contains.  Default is false.
         */
        autoSize: false,
        /* Option: scroll
         * if true, the toolbar may scroll if the contents are wider than
         * the size of the toolbar
         */
        scroll: true
    },
    /**
     * Constructor: Jx.Toolbar
     * Create a new instance of Jx.Toolbar.
     *
     * Parameters:
     * options - <Jx.Toolbar.Options>
     */
    initialize : function(options) {
        this.setOptions(options);
        this.items = [];
        
        this.domObj = new Element('ul', {
            id: this.options.id,
            'class':'jx'+this.options.type
        });
        
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
        this.deactivateWatcher = this.deactivate.bindWithEvent(this);
        if (this.options.items) {
            this.add(this.options.items);
        }
    },
    
    /**
     * Method: addTo
     * add this toolbar to a DOM element automatically creating a toolbar
     * container if necessary
     *
     * Parameters:
     * parent - the DOM element or toolbar container to add this toolbar to.
     */
    addTo: function(parent) {
        var tbc = $(parent).retrieve('jxBarContainer');
        if (!tbc) {
            tbc = new Jx.Toolbar.Container({
                parent: parent, 
                position: this.options.position, 
                autoSize: this.options.autoSize,
                scroll: this.options.scroll
            });
        }
        tbc.add(this);
        return this;
    },
    
    /**
     * Method: add
     * Add an item to the toolbar.  If the item being added is a Jx component
     * with a domObj property, the domObj is added.  If the item being added
     * is an LI element, then it is given a CSS class of *jxToolItem*.
     * Otherwise, the thing is wrapped in a <Jx.ToolbarItem>.
     *
     * Parameters:
     * thing - {Object} the thing to add.  More than one thing can be added
     * by passing multiple arguments.
     */
    add: function( ) {
        $A(arguments).flatten().each(function(thing) {
            if (thing.domObj) {
                thing = thing.domObj;
            }
            if (thing.tagName == 'LI') {
                if (!thing.hasClass('jxToolItem')) {
                    thing.addClass('jxToolItem');
                }
                this.domObj.appendChild(thing);
            } else {
                var item = new Jx.Toolbar.Item(thing);
                this.domObj.appendChild(item.domObj);
            }            
        }, this);

        if (arguments.length > 0) {
            this.fireEvent('add', this);
        }
        return this;
    },
    /**
     * Method: remove
     * remove an item from a toolbar.  If the item is not in this toolbar
     * nothing happens
     *
     * Parameters:
     * item - {Object} the object to remove
     *
     * Returns:
     * {Object} the item that was removed, or null if the item was not
     * removed.
     */
    remove: function(item) {
        if (item.domObj) {
            item = item.domObj;
        }
        var li = item.findElement('LI');
        if (li && li.parentNode == this.domObj) {
            item.dispose();
            li.dispose();
            this.fireEvent('remove', this);
        } else {
            return null;
        }
    },
    /**
     * Method: deactivate
     * Deactivate the Toolbar (when it is acting as a menu bar).
     */
    deactivate: function() {
        this.items.each(function(o){o.hide();});
        this.setActive(false);
    },
    /**
     * Method: isActive
     * Indicate if the toolbar is currently active (as a menu bar)
     *
     * Returns:
     * {Boolean}
     */
    isActive: function() { 
        return this.isActive; 
    },
    /**
     * Method: setActive
     * Set the active state of the toolbar (for menus)
     *
     * Parameters: 
     * b - {Boolean} the new state
     */
    setActive: function(b) { 
        this.isActive = b;
        if (this.isActive) {
            document.addEvent('click', this.deactivateWatcher);
        } else {
            document.removeEvent('click', this.deactivateWatcher);
        }
    },
    /**
     * Method: setVisibleItem
     * For menus, they want to know which menu is currently open.
     *
     * Parameters:
     * obj - {<Jx.Menu>} the menu that just opened.
     */
    setVisibleItem: function(obj) {
        if (this.visibleItem && this.visibleItem.hide && this.visibleItem != obj) {
            this.visibleItem.hide();
        }
        this.visibleItem = obj;
        if (this.isActive()) {
            this.visibleItem.show();
        }
    },
    showItem: function(item) {
        this.fireEvent('show', item);
    }
});
// $Id: tabset.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.TabSet
 *
 * Extends: Object
 *
 * Implements: Options, Events
 *
 * A TabSet manages a set of <Jx.Button.Tab> content areas by ensuring that only one
 * of the content areas is visible (i.e. the active tab).  TabSet does not
 * manage the actual tabs.  The instances of <Jx.Button.Tab> that are to be managed
 * as a set have to be added to both a TabSet and a <Jx.Toolbar>.  The content
 * areas of the <Jx.Button.Tab>s are sized to fit the content area that the TabSet
 * is managing.
 *
 * Example:
 * (code)
 * var tabBar = new Jx.Toolbar('tabBar');
 * var tabSet = new Jx.TabSet('tabArea');
 * 
 * var tab1 = new Jx.Button.Tab('tab 1', {contentID: 'content1'});
 * var tab2 = new Jx.Button.Tab('tab 2', {contentID: 'content2'});
 * var tab3 = new Jx.Button.Tab('tab 3', {contentID: 'content3'});
 * var tab4 = new Jx.Button.Tab('tab 4', {contentURL: 'test_content.html'});
 * 
 * tabSet.add(t1, t2, t3, t4);
 * tabBar.add(t1, t2, t3, t4);
 * (end)
 *
 * Events:
 * tabChange - the current tab has changed
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.TabSet = new Class({
    Family: 'Jx.TabSet',
    Implements: [Options,Events],
    /**
     * Property: tabs
     * {Array} array of tabs that are managed by this tab set
     */
    tabs: null,
    /**
     * Property: domObj
     * {HTMLElement} The HTML element that represents this tab set in the DOM.
     * The content areas of each tab are sized to fill the domObj.
     */
    domObj : null,
    /**
     * Constructor: Jx.TabSet
     * Create a new instance of <Jx.TabSet> within a specific element of
     * the DOM.
     *
     * Parameters:
     * domObj - {HTMLElement} an element or id of an element to put the
     * content of the tabs into.
     * options - an options object, only event handlers are supported
     * as options at this time.
     */
    initialize: function(domObj, options) {
        this.setOptions(options);
        this.tabs = [];
        this.domObj = $(domObj);
        if (!this.domObj.hasClass('jxTabSetContainer')) {
            this.domObj.addClass('jxTabSetContainer');
        }
        this.setActiveTabFn = this.setActiveTab.bind(this);
    },
    /**
     * Method: resizeTabBox
     * Resize the tab set content area and propogate the changes to
     * each of the tabs managed by the tab set.
     */
    resizeTabBox: function() {
        if (this.activeTab && this.activeTab.content.resize) {
            this.activeTab.content.resize({forceResize: true});
        }
    },
    
    /**
     * Method: add
     * Add one or more <Jx.Button.Tab>s to the TabSet.
     *
     * Parameters:
     * tab - {<Jx.Tab>} an instance of <Jx.Tab> to add to the tab set.  More
     * than one tab can be added by passing extra parameters to this method.
     */
    add: function() {
        $A(arguments).each(function(tab) {
            if (tab instanceof Jx.Button.Tab) {
                tab.addEvent('down',this.setActiveTabFn);
                tab.tabSet = this;
                this.domObj.appendChild(tab.content);
                this.tabs.push(tab);
                if ((!this.activeTab || tab.options.active) && tab.options.enabled) {
                    tab.options.active = false;
                    tab.setActive(true);
                }
            }
        }, this);
        return this;
    },
    /**
     * Method: remove
     * Remove a tab from this TabSet.  Note that it is the caller's responsibility
     * to remove the tab from the <Jx.Toolbar>.
     *
     * Parameters:
     * tab - {<Jx.Tab>} the tab to remove.
     */
    remove: function(tab) {
        if (tab instanceof Jx.Button.Tab && this.tabs.indexOf(tab) != -1) {
            this.tabs.erase(tab);
            if (this.activeTab == tab) {
                if (this.tabs.length) {
                    this.tabs[0].setActive(true);
                }
            }
            tab.removeEvent('down',this.setActiveTabFn);
            tab.content.dispose();
        }
    },
    /**
     * Method: setActiveTab
     * Set the active tab to the one passed to this method
     *
     * Parameters:
     * tab - {<Jx.Button.Tab>} the tab to make active.
     */
    setActiveTab: function(tab) {
        if (this.activeTab && this.activeTab != tab) {
            this.activeTab.setActive(false);
        }
        this.activeTab = tab;
        if (this.activeTab.content.resize) {
          this.activeTab.content.resize({forceResize: true});
        }
        this.fireEvent('tabChange', [this, tab]);
    }
});



// $Id: tabbox.js 425 2009-05-12 15:27:23Z pagameba $
/**
 * Class: Jx.TabBox
 * 
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * A convenience class to handle the common case of a single toolbar
 * directly attached to the content area of the tabs.  It manages both a
 * <Jx.Toolbar> and a <Jx.TabSet> so that you don't have to.  If you are using
 * a TabBox, then tabs only have to be added to the TabBox rather than to
 * both a <Jx.TabSet> and a <Jx.Toolbar>.
 *
 * Example:
 * (code)
 * var tabBox = new Jx.TabBox('subTabArea', 'top');
 * 
 * var tab1 = new Jx.Button.Tab('Tab 1', {contentID: 'content4'});
 * var tab2 = new Jx.Button.Tab('Tab 2', {contentID: 'content5'});
 * 
 * tabBox.add(tab1, tab2);
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.TabBox = new Class({
    Family: 'Jx.TabBox',
    Implements: [Options, Events, Jx.Addable],
    options: {
        /* Option: parent
         * a DOM element to add the tab box to
         */
        parent: null,
        /* Option: position
         * the position of the tab bar in the box, one of 'top', 'right',
         * 'bottom' or 'left'.  Top by default.
         */
        position: 'top',
        /* Option: height
         * a fixed height in pixels for the tab box.  If not set, it will fill
         * its container
         */
        height: null,
        /* Option: width
         * a fixed width in pixels for the tab box.  If not set, it will fill
         * its container
         */
        width: null,
        /* Option: scroll
         * should the tab bar scroll its tabs if there are too many to fit
         * in the toolbar, true by default
         */
        scroll:true
    },
    
    /**
     * Property: tabBar
     * {<Jx.Toolbar>} the toolbar for this tab box.
     */
    tabBar: null,
    /**
     * Property: tabSet
     * {<Jx.TabSet>} the tab set for this tab box.
     */
    tabSet: null,
    /**
     * Constructor: Jx.TabBox
     * Create a new instance of a TabBox.
     *
     * Parameters:
     * options - <Jx.TabBox.Options>
     */
    initialize : function(options) {
        this.setOptions(options);
        this.tabBar = new Jx.Toolbar({
            type: 'TabBar', 
            position: this.options.position,
            scroll: this.options.scroll
        });
        this.panel = new Jx.Panel({
            toolbars: [this.tabBar],
            hideTitle: true,
            height: this.options.height,
            width: this.options.width
        });
        this.panel.domObj.addClass('jxTabBox');
        this.tabSet = new Jx.TabSet(this.panel.content);
        this.tabSet.addEvent('tabChange', function(tabSet, tab) {
            this.showItem(tab);
        }.bind(this.tabBar));
        this.domObj = this.panel.domObj;
        /* when the panel changes size, the tab set needs to update 
         * the content areas.
         */
         this.panel.addEvent('sizeChange', (function() {
             this.tabSet.resizeTabBox();
             this.tabBar.domObj.getParent('.jxBarContainer').retrieve('jxBarContainer').update();
         }).bind(this));
        /* when tabs are added or removed, we might need to layout
         * the panel if the toolbar is or becomes empty
         */
        this.tabBar.addEvents({
            add: (function() {
                this.domObj.resize({forceResize: true});
            }).bind(this),
            remove: (function() {
                this.domObj.resize({forceResize: true});
            }).bind(this)
        });
        /* trigger an initial resize when first added to the DOM */
        this.addEvent('addTo', function() {
            this.domObj.resize({forceResize: true});
        });
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    /**
     * Method: add
     * Add one or more <Jx.Tab>s to the TabBox.
     *
     * Parameters:
     * tab - {<Jx.Tab>} an instance of <Jx.Tab> to add to the tab box.  More
     * than one tab can be added by passing extra parameters to this method.
     * Unlike <Jx.TabSet>, tabs do not have to be added to a separate 
     * <Jx.Toolbar>.
     */
    add : function() { 
        this.tabBar.add.apply(this.tabBar, arguments); 
        this.tabSet.add.apply(this.tabSet, arguments);
        $A(arguments).flatten().each(function(tab){
            tab.addEvents({
                close: (function(){
                    this.tabBar.remove(tab);
                    this.tabSet.remove(tab);
                }).bind(this)
            });
        }, this);
        return this;
    },
    /**
     * Method: remove
     * Remove a tab from the TabSet.
     *
     * Parameters:
     * tab - {<Jx.Tab>} the tab to remove.
     */
    remove : function(tab) {
        this.tabBar.remove(tab);
        this.tabSet.remove(tab);
    }
});
// $Id: container.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Toolbar.Container
 *
 * Extends: Object
 *
 * Implements: Options, Events, <Jx.Addable>
 *
 * A toolbar container contains toolbars.  A single toolbar container fills
 * the available space horizontally.  Toolbars placed in a toolbar container
 * do not wrap when they exceed the available space.
 *
 * Events:
 * add - fired when one or more toolbars are added to a container
 * remove - fired when one or more toolbars are removed from a container
 *
 * Implements: 
 * Options
 * Events
 * {<Jx.Addable>}
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Toolbar.Container = new Class({
    Family: 'Jx.Toolbar.Container',
    Implements: [Options,Events, Jx.Addable],
    /**
     * Property: domObj
     * {HTMLElement} the HTML element that the container lives in
     */
    domObj : null,
    options: {
        /* Option: parent
         * a DOM element to add this to
         */
        parent: null,
        /* Option: position
         * the position of the toolbar container in its parent, one of 'top',
         * 'right', 'bottom', or 'left'.  Default is 'top'
         */
        position: 'top',
        /* Option: autoSize
         * automatically size the toolbar container to fill its container.
         * Default is false
         */
        autoSize: false,
        /* Option: scroll
         * Control whether the user can scroll of the content of the
         * container if the content exceeds the size of the container.  
         * Default is true.
         */
        scroll: true
    },
    /**
     * Constructor: Jx.Toolbar.Container
     * Create a new instance of Jx.Toolbar.Container
     *
     * Parameters:
     * options - <Jx.Toolbar.Options>
     */
    initialize : function(options) {
        this.setOptions(options);
        
        var d = $(this.options.parent);
        this.domObj = d || new Element('div');
        this.domObj.addClass('jxBarContainer');
        
        if (this.options.scroll) {
            this.scroller = new Element('div', {'class':'jxBarScroller'});
            this.domObj.adopt(this.scroller);
        }

        /* this allows toolbars to add themselves to this bar container
         * once it already exists without requiring an explicit reference
         * to the toolbar container
         */
        this.domObj.store('jxBarContainer', this);
        
        if (['top','right','bottom','left'].contains(this.options.position)) {
            this.domObj.addClass('jxBar' +
                           this.options.position.capitalize());            
        } else {
            this.domObj.addClass('jxBarTop');
            this.options.position = 'top';
        }

        if (this.options.scroll && ['top','bottom'].contains(this.options.position)) {
            // make sure we update our size when we get added to the DOM
            this.addEvent('addTo', this.update.bind(this));
            
            //making Fx.Tween optional
            if (typeof Fx != 'undefined' && typeof Fx.Tween != 'undefined'){
                this.scrollFx = scrollFx = new Fx.Tween(this.scroller, {
                    link: 'chain'
                });
            }

            this.scrollLeft = new Jx.Button({
                image: Jx.aPixel.src
            }).addTo(this.domObj);
            this.scrollLeft.domObj.addClass('jxBarScrollLeft');
            this.scrollLeft.addEvents({
               click: (function(){
                   var from = this.scroller.getStyle('left').toInt();
                   if (isNaN(from)) { from = 0; }
                   var to = Math.min(from+100, 0);
                   if (to >= 0) {
                       this.scrollLeft.domObj.setStyle('visibility', 'hidden');
                   }
                   this.scrollRight.domObj.setStyle('visibility', '');
                   if ($defined(this.scrollFx)){
                       this.scrollFx.start('left', from, to);
                   } else {
                       this.scroller.setStyle('left',to);
                   }
               }).bind(this)
            });
            
            this.scrollRight = new Jx.Button({
                image: Jx.aPixel.src
            }).addTo(this.domObj);
            this.scrollRight.domObj.addClass('jxBarScrollRight');
            this.scrollRight.addEvents({
               click: (function(){
                   var from = this.scroller.getStyle('left').toInt();
                   if (isNaN(from)) { from = 0; }
                   var to = Math.max(from - 100, this.scrollWidth);
                   if (to == this.scrollWidth) {
                       this.scrollRight.domObj.setStyle('visibility', 'hidden');
                   }
                   this.scrollLeft.domObj.setStyle('visibility', '');
                   if ($defined(this.scrollFx)){
                       this.scrollFx.start('left', from, to);
                   } else {
                       this.scroller.setStyle('left',to);
                   }
               }).bind(this)
            });         
            
        } else {
            this.options.scroll = false;
        }

        if (this.options.toolbars) {
            this.add(this.options.toolbars);
        }
    },
    
    update: function() {
        if (this.options.autoSize) {
            /* delay the size update a very small amount so it happens
             * after the current thread of execution finishes.  If the
             * current thread is part of a window load event handler,
             * rendering hasn't quite finished yet and the sizes are
             * all wrong
             */
            (function(){
                var x = 0;
                this.scroller.getChildren().each(function(child){
                    x+= child.getSize().x;
                });
                this.domObj.setStyles({width:x});
                this.measure();
            }).delay(1,this);
        } else {
            this.measure();
        }
    },
    
    measure: function() {
        if ((!this.scrollLeftSize || !this.scrollLeftSize.x) && this.domObj.parentNode) {
            this.scrollLeftSize = this.scrollLeft.domObj.getSize();
            this.scrollRightSize = this.scrollRight.domObj.getSize();
        }
        /* decide if we need to show the scroller buttons and
         * do some calculations that will make it faster
         */
        this.scrollWidth = this.domObj.getSize().x;
        this.scroller.getChildren().each(function(child){
            this.scrollWidth -= child.getSize().x;
        }, this);
        if (this.scrollWidth < 0) {
            /* we need to show scrollers on at least one side */
            var l = this.scroller.getStyle('left').toInt();
            if (l < 0) {
                this.scrollLeft.domObj.setStyle('visibility','');
            } else {
                this.scrollLeft.domObj.setStyle('visibility','hidden');
            }
            if (l <= this.scrollWidth) {
                this.scrollRight.domObj.setStyle('visibility', 'hidden');
                if (l < this.scrollWidth) {
                    if ($defined(this.scrollFx)){
                        this.scrollFx.start('left', l, this.scrollWidth);
                    } else {
                        this.scroller.setStyle('left',this.scrollWidth);
                    }
                }
            } else {
                this.scrollRight.domObj.setStyle('visibility', '');                
            }
            
        } else {
            /* don't need any scrollers but we might need to scroll
             * the toolbar into view
             */
            this.scrollLeft.domObj.setStyle('visibility','hidden');
            this.scrollRight.domObj.setStyle('visibility','hidden');
            var from = this.scroller.getStyle('left').toInt();
            if (!isNaN(from) && from !== 0) {
                if ($defined(this.scrollFx)) {
                    this.scrollFx.start('left', 0);
                } else {
                    this.scroller.setStyle('left',0);
                }
            }
        }            
    },
    
    /**
     * Method: add
     * Add a toolbar to the container.
     *
     * Parameters:
     * toolbar - {Object} the toolbar to add.  More than one toolbar
     *    can be added by passing multiple arguments.
     */
    add: function( ) {
        $A(arguments).flatten().each(function(thing) {
            if (this.options.scroll) {
                /* we potentially need to show or hide scroller buttons
                 * when the toolbar contents change
                 */
                thing.addEvent('add', this.update.bind(this));
                thing.addEvent('remove', this.update.bind(this));                
                thing.addEvent('show', this.scrollIntoView.bind(this));                
            }
            if (this.scroller) {
                this.scroller.adopt(thing.domObj);
            } else {
                this.domObj.adopt(thing.domObj);
            }
            this.domObj.addClass('jx'+thing.options.type+this.options.position.capitalize());
        }, this);
        if (this.options.scroll) {
            this.update();            
        }
        if (arguments.length > 0) {
            this.fireEvent('add', this);
        }
        return this;
    },
    /**
     * Method: remove
     * remove an item from a toolbar.  If the item is not in this toolbar
     * nothing happens
     *
     * Parameters:
     * item - {Object} the object to remove
     *
     * Returns:
     * {Object} the item that was removed, or null if the item was not
     * removed.
     */
    remove: function(item) {
        
    },
    /**
     * Method: scrollIntoView
     * scrolls an item in one of the toolbars into the currently visible
     * area of the container if it is not already fully visible
     *
     * Parameters:
     * item - the item to scroll.
     */
    scrollIntoView: function(item) {
        var width = this.domObj.getSize().x;
        var coords = item.domObj.getCoordinates(this.scroller);
        
        //left may be set to auto or even a zero length string. 
        //In the previous version, in air, this would evaluate to
        //NaN which would cause the right hand scroller to show when 
        //the component was first created.
        
        //So, get the left value first
        var l = this.scroller.getStyle('left');
        //then check to see if it's auto or a zero length string 
        if (l === 'auto' || l.length <= 0) {
            //If so, set to 0.
            l = 0;
        } else {
            //otherwise, convert to int
            l = l.toInt();
        }
        var slSize = this.scrollLeftSize ? this.scrollLeftSize.x : 0;
        var srSize = this.scrollRightSize ? this.scrollRightSize.x : 0;
        
        var left = l;
        if (l < -coords.left + slSize) {
            /* the left edge of the item is not visible */
            left = -coords.left + slSize;
            if (left >= 0) {
                left = 0;
            }
        } else if (width - coords.right - srSize< l) {
            /* the right edge of the item is not visible */
            left =  width - coords.right - srSize;
            if (left < this.scrollWidth) {
                left = this.scrollWidth;
            }
        }
                
        if (left < 0) {
            this.scrollLeft.domObj.setStyle('visibility','');                
        } else {
            this.scrollLeft.domObj.setStyle('visibility','hidden');
        }
        if (left <= this.scrollWidth) {
            this.scrollRight.domObj.setStyle('visibility', 'hidden');
        } else {
            this.scrollRight.domObj.setStyle('visibility', '');                
        }
        if (left != l) {
            if ($defined(this.scrollFx)) {
                this.scrollFx.start('left', left);
            } else {
                this.scroller.setStyle('left',left);
            }
        }
    }
});
// $Id: toolbar.item.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Toolbar.Item
 * 
 * Extends: Object
 *
 * Implements: Options
 *
 * A helper class to provide a container for something to go into 
 * a <Jx.Toolbar>.
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Toolbar.Item = new Class( {
    Family: 'Jx.Toolbar.Item',
    Implements: [Options],
    options: {
        /* Option: active
         * is this item active or not?  Default is true.
         */
        active: true
    },
    /**
     * Property: domObj
     * {HTMLElement} an element to contain the thing to be placed in the
     * toolbar.
     */
    domObj: null,
    /**
     * Constructor: Jx.Toolbar.Item
     * Create a new instance of Jx.Toolbar.Item.
     *
     * Parameters:
     * jxThing - {Object} the thing to be contained.
     */
    initialize : function( jxThing ) {
        this.al = [];
        this.domObj = new Element('li', {'class':'jxToolItem'});
        if (jxThing) {
            if (jxThing.domObj) {
                this.domObj.appendChild(jxThing.domObj);
                if (jxThing instanceof Jx.Button.Tab) {
                    this.domObj.addClass('jxTabItem');
                }
            } else {
                this.domObj.appendChild(jxThing);
                if (jxThing.hasClass('jxTab')) {
                    this.domObj.addClass('jxTabItem');
                }
            }
        }
    }
});// $Id: toolbar.separator.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Toolbar.Separator
 *
 * Extends: Object
 *
 * A helper class that represents a visual separator in a <Jx.Toolbar>
 *
 * Example:
 * (code)
 * (end)
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Toolbar.Separator = new Class({
    Family: 'Jx.Toolbar.Separator',
    /**
     * Property: domObj
     * {HTMLElement} The DOM element that goes in the <Jx.Toolbar>
     */
    domObj: null,
    /**
     * Constructor: Jx.Toolbar.Separator
     * Create a new Jx.Toolbar.Separator
     */
    initialize: function() {
        this.domObj = new Element('li', {'class':'jxToolItem'});
        this.domSpan = new Element('span', {'class':'jxBarSeparator'});
        this.domObj.appendChild(this.domSpan);
    }
});
// $Id: treeitem.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.TreeItem 
 *
 * Extends: Object
 *
 * Implements: Options, Events
 *
 * An item in a tree.  An item is a leaf node that has no children.
 *
 * Jx.TreeItem supports selection via the click event.  The application 
 * is responsible for changing the style of the selected item in the tree
 * and for tracking selection if that is important.
 *
 * Example:
 * (code)
 * (end)
 *
 * Events:
 * click - triggered when the tree item is clicked
 *
 * Implements:
 * Events - MooTools Class.Extras
 * Options - MooTools Class.Extras
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.TreeItem = new Class ({
    Family: 'Jx.TreeItem',
    Implements: [Options,Events],
    /**
     * Property: domObj
     * {HTMLElement} a reference to the HTML element that is the TreeItem
     * in the DOM
     */
    domObj : null,
    /**
     * Property: owner
     * {Object} the folder or tree that this item belongs to
     */
    owner: null,
    options: {
        /* Option: label
         * {String} the label to display for the TreeItem
         */        
        label: '',
        /* Option: data
         * {Object} any arbitrary data to be associated with the TreeItem
         */
        data: null,
        /* Option: contextMenu
         * {<Jx.ContextMenu>} the context menu to trigger if there
         * is a right click on the node
         */
        contextMenu: null,
        /* Option: enabled
         * {Boolean} the initial state of the TreeItem.  If the 
         * TreeItem is not enabled, it cannot be clicked.
         */
        enabled: true,
        type: 'Item',
        /* Option: image
         * {String} URL to an image to use as the icon next to the
         * label of this TreeItem
         */
        image: null,
        /* Option: imageClass
         * {String} CSS class to apply to the image, useful for using CSS
         * sprites
         */
        imageClass: ''
    },
    /**
     * Constructor: Jx.TreeItem
     * Create a new instance of Jx.TreeItem with the associated options
     *
     * Parameters:
     * options - <Jx.TreeItem.Options>
     */
    initialize : function( options ) {
        this.setOptions(options);

        this.domObj = new Element('li', {'class':'jxTree'+this.options.type});
        if (this.options.id) {
            this.domObj.id = this.options.id;
        }
      
        this.domNode = new Element('img',{
            'class': 'jxTreeImage', 
            src: Jx.aPixel.src,
            alt: '',
            title: ''
        });
        this.domObj.appendChild(this.domNode);
        
        this.domLabel = (this.options.draw) ? 
            this.options.draw.apply(this) : 
            this.draw();

        this.domObj.appendChild(this.domLabel);
        this.domObj.store('jxTreeItem', this);
        
        if (!this.options.enabled) {
            this.domObj.addClass('jxDisabled');
        }
    },
    draw: function() {
        var domImg = new Element('img',{
            'class':'jxTreeIcon', 
            src: Jx.aPixel.src,
            alt: '',
            title: ''
        });
        if (this.options.image) {
            domImg.setStyle('backgroundImage', 'url('+this.options.image+')');
        }
        if (this.options.imageClass) {
            domImg.addClass(this.options.imageClass);
        }
        // the clickable part of the button
        var hasFocus;
        var mouseDown;
        
        var domA = new Element('a',{
            href:'javascript:void(0)',
            html: this.options.label
        });
        domA.addEvents({
            click: this.selected.bind(this),
            dblclick: this.selected.bind(this),
            drag: function(e) {e.stop();},
            contextmenu: function(e) { e.stop(); },
            mousedown: (function(e) {
               domA.addClass('jxTreeItemPressed');
               hasFocus = true;
               mouseDown = true;
               domA.focus();
               if (e.rightClick && this.options.contextMenu) {
                   this.options.contextMenu.show(e);
               }
            }).bind(this),
            mouseup: function(e) {
                domA.removeClass('jxTreeItemPressed');
                mouseDown = false;
            },
            mouseleave: function(e) {
                domA.removeClass('jxTreeItemPressed');
            },
            mouseenter: function(e) {
                if (hasFocus && mouseDown) {
                    domA.addClass('jxTreeItemPressed');
                }
            },
            keydown: function(e) {
                if (e.key == 'enter') {
                    domA.addClass('jxTreeItemPressed');
                }
            },
            keyup: function(e) {
                if (e.key == 'enter') {
                    domA.removeClass('jxTreeItemPressed');
                }
            },
            blur: function() { hasFocus = false; }
        });
        domA.appendChild(domImg);
        if (typeof Drag != 'undefined') {
            new Drag(domA, {
                onStart: function() {this.stop();}
            });
        }
        return domA;
    },
    /**
     * Method: finalize
     * Clean up the TreeItem and remove all DOM references
     */
    finalize: function() { this.finalizeItem(); },
    /**
     * Method: finalizeItem
     * Clean up the TreeItem and remove all DOM references
     */
    finalizeItem: function() {  
        if (!this.domObj) {
            return;
        }
        //this.domA.removeEvents();
        this.options = null;
        this.domObj.dispose();
        this.domObj = null;
        this.owner = null;
    },
    /**
     * Method: clone
     * Create a clone of the TreeItem
     * 
     * Returns: 
     * {<Jx.TreeItem>} a copy of the TreeItem
     */
    clone : function() {
        return new Jx.TreeItem(this.options);
    },
    /**
     * Method: update
     * Update the CSS of the TreeItem's DOM element in case it has changed
     * position
     *
     * Parameters:
     * shouldDescend - {Boolean} propagate changes to child nodes?
     */
    update : function(shouldDescend) {
        var isLast = (arguments.length > 1) ? arguments[1] : 
                     (this.owner && this.owner.isLastNode(this));
        if (isLast) {
            this.domObj.removeClass('jxTree'+this.options.type);
            this.domObj.addClass('jxTree'+this.options.type+'Last');
        } else {
            this.domObj.removeClass('jxTree'+this.options.type+'Last');
            this.domObj.addClass('jxTree'+this.options.type);
        }
    },
    /**
     * Method: selected
     * Called when the DOM element for the TreeItem is clicked, the
     * node is selected.
     *
     * Parameters:
     * e - {Event} the DOM event
     */
    selected : function(e) {
        this.fireEvent('click', this);
    },
    /**
     * Method: getName
     * Get the label associated with a TreeItem
     *
     * Returns: 
     * {String} the name
     */
    getName : function() { return this.options.label; },
    /**
     * Method: propertyChanged
     * A property of an object has changed, synchronize the state of the 
     * TreeItem with the state of the object
     *
     * Parameters:
     * obj - {Object} the object whose state has changed
     */
    propertyChanged : function(obj) {
        this.options.enabled = obj.isEnabled();
        if (this.options.enabled) {
            this.domObj.removeClass('jxDisabled');
        } else {
            this.domObj.addClass('jxDisabled');
        }
    }
});
// $Id: treefolder.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.TreeFolder
 * 
 * Extends: <Jx.TreeItem>
 *
 * A Jx.TreeFolder is an item in a tree that can contain other items.  It is
 * expandable and collapsible.
 *
 * Example:
 * (code)
 * (end)
 *
 * Extends:
 * <Jx.TreeItem>
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.TreeFolder = new Class({
    Family: 'Jx.TreeFolder',
    Extends: Jx.TreeItem,
    /**
     * Property: subDomObj
     * {HTMLElement} an HTML container for the things inside the folder
     */
    subDomObj : null,
    /**
     * Property: nodes
     * {Array} an array of references to the javascript objects that are
     * children of this folder
     */
    nodes : null,

    options: {
        /* Option: open
         * is the folder open?  false by default.
         */
        open : false
    },
    /**
     * Constructor: Jx.TreeFolder
     * Create a new instance of Jx.TreeFolder
     *
     * Parameters:
     * options - <Jx.TreeFolder.Options> and <Jx.TreeItem.Options>
     */
    initialize : function( options ) {
        this.parent($merge(options,{type:'Branch'}));

        $(this.domNode).addEvent('click', this.clicked.bindWithEvent(this));
        this.addEvent('click', this.clicked.bindWithEvent(this));
                
        this.nodes = [];
        this.subDomObj = new Element('ul', {'class':'jxTree'});
        this.domObj.appendChild(this.subDomObj);
        if (this.options.open) {
            this.expand();
        } else {
            this.collapse();
        }
    },
    /**
     * Method: finalize
     * Clean up a TreeFolder.
     */
    finalize: function() {
        this.finalizeFolder();
        this.finalizeItem();
        this.subDomObj.dispose();
        this.subDomObj = null;
    },
    /**
     * Method: finalizeFolder
     * Internal method to clean up folder-related stuff.
     */
    finalizeFolder: function() {
        this.domObj.childNodes[0].removeEvents();
        for (var i=this.nodes.length-1; i>=0; i--) {
            this.nodes[i].finalize();
            this.nodes.pop();
        }
        
    },
    
    /**
     * Method: clone
     * Create a clone of the TreeFolder
     * 
     * Returns: 
     * {<Jx.TreeFolder>} a copy of the TreeFolder
     */
    clone : function() {
        var node = new Jx.TreeFolder(this.options);
        this.nodes.each(function(n){node.append(n.clone());});
        return node;
    },
    /**
     * Method: isLastNode
     * Indicates if a node is the last thing in the folder.
     *
     * Parameters:
     * node - {Jx.TreeItem} the node to check
     *
     * Returns:
     *
     * {Boolean}
     */
    isLastNode : function(node) {
        if (this.nodes.length == 0) {
            return false;
        } else {
            return this.nodes[this.nodes.length-1] == node;
        }
    },
    /**
     * Method: update
     * Update the CSS of the TreeFolder's DOM element in case it has changed
     * position.
     *
     * Parameters:
     * shouldDescend - {Boolean} propagate changes to child nodes?
     */
    update : function(shouldDescend) {
        /* avoid update if not attached to tree yet */
        if (!this.parent) return;
        var isLast = false;
        if (arguments.length > 1) {
            isLast = arguments[1];
        } else {
            isLast = (this.owner && this.owner.isLastNode(this));
        }
        
        var c = 'jxTree'+this.options.type;
        c += isLast ? 'Last' : '';
        c += this.options.open ? 'Open' : 'Closed';
        this.domObj.className = c;
        
        if (isLast) {
            this.subDomObj.className = 'jxTree';
        } else {
            this.subDomObj.className = 'jxTree jxTreeNest';
        }
        
        if (this.nodes && shouldDescend) {
            var that = this;
            this.nodes.each(function(n,i){
                n.update(false, i==that.nodes.length-1);
            });
        }
    },
    /**
     * Method: append
     * append a node at the end of the sub-tree
     *
     * Parameters:
     * node - {Object} the node to append.
     */
    append : function( node ) {
        node.owner = this;
        this.nodes.push(node);
        this.subDomObj.appendChild( node.domObj );
        this.update(true);
        return this;
    },
    /**
     * Method: insert
     * insert a node after refNode.  If refNode is null, insert at beginning
     *
     * Parameters:
     * node - {Object} the node to insert
     * refNode - {Object} the node to insert before
     */
    insert : function( node, refNode ) {
        node.owner = this;
        //if refNode is not supplied, insert at the beginning.
        if (!refNode) {
            this.nodes.unshift(node);
            //sanity check to make sure there is actually something there
            if (this.subDomObj.childNodes.length ==0) {
                this.subDomObj.appendChild(node.domObj);
            } else {
                this.subDomObj.insertBefore(node.domObj, this.subDomObj.childNodes[0]);                
            }
        } else {
            //walk all nodes looking for the ref node.  Track if it actually
            //happens so we can append if it fails.
            var b = false;
            for(var i=0;i<this.nodes.length;i++) {
                if (this.nodes[i] == refNode) {
                    //increment to append after ref node.  If this pushes us
                    //past the end, it'll get appended below anyway
                    i = i + 1;
                    if (i < this.nodes.length) {
                        this.nodes.splice(i, 0, node);
                        this.subDomObj.insertBefore(node.domObj, this.subDomObj.childNodes[i]);
                        b = true;
                        break;
                    }
                }
            }
            //if the node wasn't inserted, it is because refNode didn't exist
            //and so the fallback is to just append the node.
            if (!b) {
                this.nodes.push(node); 
                this.subDomObj.appendChild(node.domObj); 
            }
        }
        this.update(true);
        return this;
    },
    /**
     * Method: remove
     * remove the specified node from the tree
     *
     * Parameters:
     * node - {Object} the node to remove
     */
    remove : function(node) {
        node.owner = null;
        for(var i=0;i<this.nodes.length;i++) {
            if (this.nodes[i] == node) {
                this.nodes.splice(i, 1);
                this.subDomObj.removeChild(this.subDomObj.childNodes[i]);
                break;
            }
        }
        this.update(true);
        return this;
    },
    /**
     * Method: replace
     * Replace a node with another node
     *
     * Parameters:
     * newNode - {Object} the node to put into the tree
     * refNode - {Object} the node to replace
     *
     * Returns:
     * {Boolean} true if the replacement was successful.
     */
    replace: function( newNode, refNode ) {
        //walk all nodes looking for the ref node. 
        var b = false;
        for(var i=0;i<this.nodes.length;i++) {
            if (this.nodes[i] == refNode) {
                if (i < this.nodes.length) {
                    newNode.owner = this;
                    this.nodes.splice(i, 1, newNode);
                    this.subDomObj.replaceChild(newNode.domObj, refNode.domObj);
                    return true;
                }
            }
        }
        return false;
    },
    
    /**
     * Method: clicked
     * handle the user clicking on this folder by expanding or
     * collapsing it.
     *
     * Parameters: 
     * e - {Event} the event object
     */
    clicked : function(e) {
        if (this.options.open) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    /**
     * Method: expand
     * Expands the folder
     */
    expand : function() {
        this.options.open = true;
        this.subDomObj.setStyle('display', 'block');
        this.update(true);
        this.fireEvent('disclosed', this);    
    },
    /**
     * Method: collapse
     * Collapses the folder
     */
    collapse : function() {
        this.options.open = false;
        this.subDomObj.setStyle('display', 'none');
        this.update(true);
        this.fireEvent('disclosed', this);
    },
    /**
     * Method: findChild
     * Get a reference to a child node by recursively searching the tree
     * 
     * Parameters:
     * path - {Array} an array of labels of nodes to search for
     *
     * Returns:
     * {Object} the node or null if the path was not found
     */
    findChild : function(path) {
        //path is empty - we are asking for this node
        if (path.length == 0)
            return this;
        
        //path has only one thing in it - looking for something in this folder
        if (path.length == 1)
        {
            for (var i=0; i<this.nodes.length; i++)
            {
                if (this.nodes[i].getName() == path[0])
                    return this.nodes[i];
            }
            return null;
        }
        //path has more than one thing in it, find a folder and descend into it    
        var childName = path.shift();
        for (var i=0; i<this.nodes.length; i++)
        {
            if (this.nodes[i].getName() == childName && this.nodes[i].findChild)
                return this.nodes[i].findChild(path);
        }
        return null;
    }
});// $Id: tree.js 423 2009-05-12 12:37:56Z pagameba $
/**
 * Class: Jx.Tree
 *
 * Extends: Jx.TreeFolder
 *
 * Implements: <Jx.Addable>
 *
 * Jx.Tree displays hierarchical data in a tree structure of folders and nodes.
 *
 * Example:
 * (code)
 * (end)
 *
 * Extends: <Jx.TreeFolder>
 *
 * License: 
 * Copyright (c) 2008, DM Solutions Group Inc.
 * 
 * This file is licensed under an MIT style license
 */
Jx.Tree = new Class({
    Extends: Jx.TreeFolder,
    Implements: [Jx.Addable],
    Family: 'Jx.Tree',
    /**
     * Constructor: Jx.Tree
     * Create a new instance of Jx.Tree
     *
     * Parameters:
     * options: options for <Jx.Addable>
     */
    initialize : function( options ) {
        this.parent(options);
        this.subDomObj = new Element('ul',{
            'class':'jxTreeRoot'
        });
        
        this.nodes = [];
        this.isOpen = true;
        
        this.addable = this.subDomObj;
        
        if (this.options.parent) {
            this.addTo(this.options.parent);
        }
    },
    
    /**
     * Method: finalize
     * Clean up a Jx.Tree instance
     */
    finalize: function() { 
        this.clear(); 
        this.subDomObj.parentNode.removeChild(this.subDomObj); 
    },
    /**
     * Method: clear
     * Clear the tree of all child nodes
     */
    clear: function() {
        for (var i=this.nodes.length-1; i>=0; i--) {
            this.subDomObj.removeChild(this.nodes[i].domObj);
            this.nodes[i].finalize();
            this.nodes.pop();
        }
    },
    /**
     * Method: update
     * Update the CSS of the Tree's DOM element in case it has changed
     * position
     *
     * Parameters:
     * shouldDescend - {Boolean} propagate changes to child nodes?
     */
    update: function(shouldDescend) {
        var bLast = true;
        if (this.subDomObj)
        {
            if (bLast) {
                this.subDomObj.removeClass('jxTreeNest');
            } else {
                this.subDomObj.addClass('jxTreeNest');
            }
        }
        if (this.nodes && shouldDescend) {
            this.nodes.each(function(n){n.update(false);});
        }
    },
    /**
     * Method: append
     * Append a node at the end of the sub-tree
     * 
     * Parameters:
     * node - {Object} the node to append.
     */
    append: function( node ) {
        node.owner = this;
        this.nodes.push(node);
        this.subDomObj.appendChild( node.domObj );
        this.update(true);
        return this;    
    }
});

