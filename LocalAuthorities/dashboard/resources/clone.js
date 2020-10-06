// https://medium.com/javascript-in-plain-english/write-a-better-deep-clone-function-in-javascript-d0e798e5f550
(function(root){

	function cloneOtherType(target) {
		const constrFun = target.constructor;
		switch (toRawType(target)) {
			case "Boolean":
			case "Number":
			case "String":
			case "Error":
			case "Date":
				return new constrFun(target);
			case "RegExp":
				return cloneReg(target);
			case "Symbol":
				return cloneSymbol(target);
			case "Function":
				return target;
			default:
				return null;
		}
	}

	function toRawType (value) {
	  let _toString = Object.prototype.toString;
	  let str = _toString.call(value)
	  return str.slice(8, -1)
	}

	function cloneSymbol(targe) {
		return Object(Symbol.prototype.valueOf.call(targe));
	}

	function cloneReg(targe) {
		const reFlags = /\w*$/;
		const result = new targe.constructor(targe.source, reFlags.exec(targe));
		result.lastIndex = targe.lastIndex;
		return result;
	}

	function forEach(array, iteratee) {
		let index = -1;
		const length = array.length;
		while (++index < length) {
			iteratee(array[index], index);
		}
		return array;
	}

	// core function
	function clone(target, map = new WeakMap()) {

		// clone primitive types
		if (typeof target != "object" || target == null) {
			return target;
		}

		const type = toRawType(target);
		let cloneTarget = null;

		if (map.get(target)) {
			return map.get(target);
		}
		map.set(target, cloneTarget);

		if (type != "Set" && type != "Map" && type != "Array" && type != "Object") {
			return cloneOtherType(target)
		}

		// clone Set
		if (type == "Set") {
			cloneTarget = new Set();
			target.forEach(value => {
				cloneTarget.add(clone(value, map));
			});
			return cloneTarget;
		}

		// clone Map
		if (type == "Map") {
			cloneTarget = new Map();
			target.forEach((value, key) => {
				cloneTarget.set(key, clone(value, map));
			});
			return cloneTarget;
		}

		// clone Array
		if (type == "Array") {
			cloneTarget = new Array();
			forEach(target, (value, index) => {
			  cloneTarget[index] = clone(value, map);
			})
		}

		// clone normal Object
		if (type == "Object") {
			cloneTarget = new Object();
			forEach(Object.keys(target), (key, index) => {
			  cloneTarget[key] = clone(target[key], map);
			})
		}

		return cloneTarget;
	}


	// test 

	const map = new Map();
	map.set('key', 'value');

	const set = new Set();
	set.add('value1');
	set.add('value2');

	const example = {
		field1: 1,
		field2: undefined,
		field3: {
			child: 'child'
		},
		field4: [2, 4, 8],
		empty: null,
		map,
		set,
		bool: new Boolean(true),
		num: new Number(2),
		str: new String(2),
		symbol: Object(Symbol(1)),
		date: new Date(),
		reg: /\d+/,
		error: new Error(),
		func1: () => {
			console.log('hello friend!');
		},
		func2: function (a, b) {
			return a + b;
		}
	};

	window.clone = clone;

})(window || this);
