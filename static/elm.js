
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				return _elm_lang$core$Json_Decode$succeed(fallback);
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _elm_community$easing_functions$Ease$reverse = F2(
	function (easing, time) {
		return easing(1 - time);
	});
var _elm_community$easing_functions$Ease$flip = F2(
	function (easing, time) {
		return 1 - easing(1 - time);
	});
var _elm_community$easing_functions$Ease$retour = F2(
	function (easing, time) {
		return (_elm_lang$core$Native_Utils.cmp(time, 0.5) < 0) ? easing(time * 2) : A2(_elm_community$easing_functions$Ease$flip, easing, (time - 0.5) * 2);
	});
var _elm_community$easing_functions$Ease$inOut = F3(
	function (e1, e2, time) {
		return (_elm_lang$core$Native_Utils.cmp(time, 0.5) < 0) ? (e1(time * 2) / 2) : (0.5 + (e2((time - 0.5) * 2) / 2));
	});
var _elm_community$easing_functions$Ease$inElastic = function (time) {
	if (_elm_lang$core$Native_Utils.eq(time, 0.0)) {
		return 0.0;
	} else {
		var t = time - 1;
		var p = 0.3;
		var s = 7.5e-2;
		return 0 - (Math.pow(2, 10 * t) * _elm_lang$core$Basics$sin(((t - s) * (2 * _elm_lang$core$Basics$pi)) / p));
	}
};
var _elm_community$easing_functions$Ease$outElastic = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inElastic);
var _elm_community$easing_functions$Ease$inOutElastic = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inElastic, _elm_community$easing_functions$Ease$outElastic);
var _elm_community$easing_functions$Ease$outBounce = function (time) {
	var t4 = time - (2.625 / 2.75);
	var t3 = time - (2.25 / 2.75);
	var t2 = time - (1.5 / 2.75);
	var a = 7.5625;
	return (_elm_lang$core$Native_Utils.cmp(time, 1 / 2.75) < 0) ? ((a * time) * time) : ((_elm_lang$core$Native_Utils.cmp(time, 2 / 2.75) < 0) ? (((a * t2) * t2) + 0.75) : ((_elm_lang$core$Native_Utils.cmp(time, 2.5 / 2.75) < 0) ? (((a * t3) * t3) + 0.9375) : (((a * t4) * t4) + 0.984375)));
};
var _elm_community$easing_functions$Ease$inBounce = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$outBounce);
var _elm_community$easing_functions$Ease$inOutBounce = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inBounce, _elm_community$easing_functions$Ease$outBounce);
var _elm_community$easing_functions$Ease$inBack = function (time) {
	return (time * time) * ((2.70158 * time) - 1.70158);
};
var _elm_community$easing_functions$Ease$outBack = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inBack);
var _elm_community$easing_functions$Ease$inOutBack = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inBack, _elm_community$easing_functions$Ease$outBack);
var _elm_community$easing_functions$Ease$outCirc = function (time) {
	return _elm_lang$core$Basics$sqrt(
		1 - Math.pow(time - 1, 2));
};
var _elm_community$easing_functions$Ease$inCirc = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$outCirc);
var _elm_community$easing_functions$Ease$inOutCirc = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inCirc, _elm_community$easing_functions$Ease$outCirc);
var _elm_community$easing_functions$Ease$inExpo = function (time) {
	return _elm_lang$core$Native_Utils.eq(time, 0.0) ? 0.0 : Math.pow(2, 10 * (time - 1));
};
var _elm_community$easing_functions$Ease$outExpo = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inExpo);
var _elm_community$easing_functions$Ease$inOutExpo = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inExpo, _elm_community$easing_functions$Ease$outExpo);
var _elm_community$easing_functions$Ease$outSine = function (time) {
	return _elm_lang$core$Basics$sin(time * (_elm_lang$core$Basics$pi / 2));
};
var _elm_community$easing_functions$Ease$inSine = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$outSine);
var _elm_community$easing_functions$Ease$inOutSine = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inSine, _elm_community$easing_functions$Ease$outSine);
var _elm_community$easing_functions$Ease$inQuint = function (time) {
	return Math.pow(time, 5);
};
var _elm_community$easing_functions$Ease$outQuint = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inQuint);
var _elm_community$easing_functions$Ease$inOutQuint = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inQuint, _elm_community$easing_functions$Ease$outQuint);
var _elm_community$easing_functions$Ease$inQuart = function (time) {
	return Math.pow(time, 4);
};
var _elm_community$easing_functions$Ease$outQuart = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inQuart);
var _elm_community$easing_functions$Ease$inOutQuart = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inQuart, _elm_community$easing_functions$Ease$outQuart);
var _elm_community$easing_functions$Ease$inCubic = function (time) {
	return Math.pow(time, 3);
};
var _elm_community$easing_functions$Ease$outCubic = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inCubic);
var _elm_community$easing_functions$Ease$inOutCubic = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inCubic, _elm_community$easing_functions$Ease$outCubic);
var _elm_community$easing_functions$Ease$inQuad = function (time) {
	return Math.pow(time, 2);
};
var _elm_community$easing_functions$Ease$outQuad = _elm_community$easing_functions$Ease$flip(_elm_community$easing_functions$Ease$inQuad);
var _elm_community$easing_functions$Ease$inOutQuad = A2(_elm_community$easing_functions$Ease$inOut, _elm_community$easing_functions$Ease$inQuad, _elm_community$easing_functions$Ease$outQuad);
var _elm_community$easing_functions$Ease$bezier = F5(
	function (x1, y1, x2, y2, time) {
		var pair = F4(
			function (interpolate, _p1, _p0, v) {
				var _p2 = _p1;
				var _p3 = _p0;
				return {
					ctor: '_Tuple2',
					_0: A3(interpolate, _p2._0, _p3._0, v),
					_1: A3(interpolate, _p2._1, _p3._1, v)
				};
			});
		var lerp = F3(
			function (from, to, v) {
				return from + ((to - from) * v);
			});
		var casteljau = function (ps) {
			casteljau:
			while (true) {
				var _p4 = ps;
				if (((_p4.ctor === '::') && (_p4._0.ctor === '_Tuple2')) && (_p4._1.ctor === '[]')) {
					return _p4._0._1;
				} else {
					var _p5 = _p4;
					var _v3 = A3(
						_elm_lang$core$List$map2,
						F2(
							function (x, y) {
								return A4(pair, lerp, x, y, time);
							}),
						_p5,
						A2(
							_elm_lang$core$Maybe$withDefault,
							{ctor: '[]'},
							_elm_lang$core$List$tail(_p5)));
					ps = _v3;
					continue casteljau;
				}
			}
		};
		return casteljau(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 0, _1: 0},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: x1, _1: y1},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: x2, _1: y2},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 1, _1: 1},
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _elm_community$easing_functions$Ease$linear = _elm_lang$core$Basics$identity;

var _elm_lang$animation_frame$Native_AnimationFrame = function()
{

function create()
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}

return {
	create: create
};

}();

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$animation_frame$AnimationFrame$rAF = _elm_lang$animation_frame$Native_AnimationFrame.create(
	{ctor: '_Tuple0'});
var _elm_lang$animation_frame$AnimationFrame$subscription = _elm_lang$core$Native_Platform.leaf('AnimationFrame');
var _elm_lang$animation_frame$AnimationFrame$State = F3(
	function (a, b, c) {
		return {subs: a, request: b, oldTime: c};
	});
var _elm_lang$animation_frame$AnimationFrame$init = _elm_lang$core$Task$succeed(
	A3(
		_elm_lang$animation_frame$AnimationFrame$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing,
		0));
var _elm_lang$animation_frame$AnimationFrame$onEffects = F3(
	function (router, subs, _p0) {
		var _p1 = _p0;
		var _p5 = _p1.request;
		var _p4 = _p1.oldTime;
		var _p2 = {ctor: '_Tuple2', _0: _p5, _1: subs};
		if (_p2._0.ctor === 'Nothing') {
			if (_p2._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(
					A3(
						_elm_lang$animation_frame$AnimationFrame$State,
						{ctor: '[]'},
						_elm_lang$core$Maybe$Nothing,
						_p4));
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (time) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$animation_frame$AnimationFrame$State,
										subs,
										_elm_lang$core$Maybe$Just(pid),
										time));
							},
							_elm_lang$core$Time$now);
					},
					_elm_lang$core$Process$spawn(
						A2(
							_elm_lang$core$Task$andThen,
							_elm_lang$core$Platform$sendToSelf(router),
							_elm_lang$animation_frame$AnimationFrame$rAF)));
			}
		} else {
			if (_p2._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p3) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								{ctor: '[]'},
								_elm_lang$core$Maybe$Nothing,
								_p4));
					},
					_elm_lang$core$Process$kill(_p2._0._0));
			} else {
				return _elm_lang$core$Task$succeed(
					A3(_elm_lang$animation_frame$AnimationFrame$State, subs, _p5, _p4));
			}
		}
	});
var _elm_lang$animation_frame$AnimationFrame$onSelfMsg = F3(
	function (router, newTime, _p6) {
		var _p7 = _p6;
		var _p10 = _p7.subs;
		var diff = newTime - _p7.oldTime;
		var send = function (sub) {
			var _p8 = sub;
			if (_p8.ctor === 'Time') {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(newTime));
			} else {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(diff));
			}
		};
		return A2(
			_elm_lang$core$Task$andThen,
			function (pid) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p9) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								_p10,
								_elm_lang$core$Maybe$Just(pid),
								newTime));
					},
					_elm_lang$core$Task$sequence(
						A2(_elm_lang$core$List$map, send, _p10)));
			},
			_elm_lang$core$Process$spawn(
				A2(
					_elm_lang$core$Task$andThen,
					_elm_lang$core$Platform$sendToSelf(router),
					_elm_lang$animation_frame$AnimationFrame$rAF)));
	});
var _elm_lang$animation_frame$AnimationFrame$Diff = function (a) {
	return {ctor: 'Diff', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$diffs = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Diff(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$Time = function (a) {
	return {ctor: 'Time', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$times = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Time(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$subMap = F2(
	function (func, sub) {
		var _p11 = sub;
		if (_p11.ctor === 'Time') {
			return _elm_lang$animation_frame$AnimationFrame$Time(
				function (_p12) {
					return func(
						_p11._0(_p12));
				});
		} else {
			return _elm_lang$animation_frame$AnimationFrame$Diff(
				function (_p13) {
					return func(
						_p11._0(_p13));
				});
		}
	});
_elm_lang$core$Native_Platform.effectManagers['AnimationFrame'] = {pkg: 'elm-lang/animation-frame', init: _elm_lang$animation_frame$AnimationFrame$init, onEffects: _elm_lang$animation_frame$AnimationFrame$onEffects, onSelfMsg: _elm_lang$animation_frame$AnimationFrame$onSelfMsg, tag: 'sub', subMap: _elm_lang$animation_frame$AnimationFrame$subMap};

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _evancz$url_parser$UrlParser$toKeyValuePair = function (segment) {
	var _p0 = A2(_elm_lang$core$String$split, '=', segment);
	if (((_p0.ctor === '::') && (_p0._1.ctor === '::')) && (_p0._1._1.ctor === '[]')) {
		return A3(
			_elm_lang$core$Maybe$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			_elm_lang$http$Http$decodeUri(_p0._0),
			_elm_lang$http$Http$decodeUri(_p0._1._0));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _evancz$url_parser$UrlParser$parseParams = function (queryString) {
	return _elm_lang$core$Dict$fromList(
		A2(
			_elm_lang$core$List$filterMap,
			_evancz$url_parser$UrlParser$toKeyValuePair,
			A2(
				_elm_lang$core$String$split,
				'&',
				A2(_elm_lang$core$String$dropLeft, 1, queryString))));
};
var _evancz$url_parser$UrlParser$splitUrl = function (url) {
	var _p1 = A2(_elm_lang$core$String$split, '/', url);
	if ((_p1.ctor === '::') && (_p1._0 === '')) {
		return _p1._1;
	} else {
		return _p1;
	}
};
var _evancz$url_parser$UrlParser$parseHelp = function (states) {
	parseHelp:
	while (true) {
		var _p2 = states;
		if (_p2.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p4 = _p2._0;
			var _p3 = _p4.unvisited;
			if (_p3.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p4.value);
			} else {
				if ((_p3._0 === '') && (_p3._1.ctor === '[]')) {
					return _elm_lang$core$Maybe$Just(_p4.value);
				} else {
					var _v4 = _p2._1;
					states = _v4;
					continue parseHelp;
				}
			}
		}
	}
};
var _evancz$url_parser$UrlParser$parse = F3(
	function (_p5, url, params) {
		var _p6 = _p5;
		return _evancz$url_parser$UrlParser$parseHelp(
			_p6._0(
				{
					visited: {ctor: '[]'},
					unvisited: _evancz$url_parser$UrlParser$splitUrl(url),
					params: params,
					value: _elm_lang$core$Basics$identity
				}));
	});
var _evancz$url_parser$UrlParser$parseHash = F2(
	function (parser, location) {
		return A3(
			_evancz$url_parser$UrlParser$parse,
			parser,
			A2(_elm_lang$core$String$dropLeft, 1, location.hash),
			_evancz$url_parser$UrlParser$parseParams(location.search));
	});
var _evancz$url_parser$UrlParser$parsePath = F2(
	function (parser, location) {
		return A3(
			_evancz$url_parser$UrlParser$parse,
			parser,
			location.pathname,
			_evancz$url_parser$UrlParser$parseParams(location.search));
	});
var _evancz$url_parser$UrlParser$intParamHelp = function (maybeValue) {
	var _p7 = maybeValue;
	if (_p7.ctor === 'Nothing') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Result$toMaybe(
			_elm_lang$core$String$toInt(_p7._0));
	}
};
var _evancz$url_parser$UrlParser$mapHelp = F2(
	function (func, _p8) {
		var _p9 = _p8;
		return {
			visited: _p9.visited,
			unvisited: _p9.unvisited,
			params: _p9.params,
			value: func(_p9.value)
		};
	});
var _evancz$url_parser$UrlParser$State = F4(
	function (a, b, c, d) {
		return {visited: a, unvisited: b, params: c, value: d};
	});
var _evancz$url_parser$UrlParser$Parser = function (a) {
	return {ctor: 'Parser', _0: a};
};
var _evancz$url_parser$UrlParser$s = function (str) {
	return _evancz$url_parser$UrlParser$Parser(
		function (_p10) {
			var _p11 = _p10;
			var _p12 = _p11.unvisited;
			if (_p12.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p13 = _p12._0;
				return _elm_lang$core$Native_Utils.eq(_p13, str) ? {
					ctor: '::',
					_0: A4(
						_evancz$url_parser$UrlParser$State,
						{ctor: '::', _0: _p13, _1: _p11.visited},
						_p12._1,
						_p11.params,
						_p11.value),
					_1: {ctor: '[]'}
				} : {ctor: '[]'};
			}
		});
};
var _evancz$url_parser$UrlParser$custom = F2(
	function (tipe, stringToSomething) {
		return _evancz$url_parser$UrlParser$Parser(
			function (_p14) {
				var _p15 = _p14;
				var _p16 = _p15.unvisited;
				if (_p16.ctor === '[]') {
					return {ctor: '[]'};
				} else {
					var _p18 = _p16._0;
					var _p17 = stringToSomething(_p18);
					if (_p17.ctor === 'Ok') {
						return {
							ctor: '::',
							_0: A4(
								_evancz$url_parser$UrlParser$State,
								{ctor: '::', _0: _p18, _1: _p15.visited},
								_p16._1,
								_p15.params,
								_p15.value(_p17._0)),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '[]'};
					}
				}
			});
	});
var _evancz$url_parser$UrlParser$string = A2(_evancz$url_parser$UrlParser$custom, 'STRING', _elm_lang$core$Result$Ok);
var _evancz$url_parser$UrlParser$int = A2(_evancz$url_parser$UrlParser$custom, 'NUMBER', _elm_lang$core$String$toInt);
var _evancz$url_parser$UrlParser_ops = _evancz$url_parser$UrlParser_ops || {};
_evancz$url_parser$UrlParser_ops['</>'] = F2(
	function (_p20, _p19) {
		var _p21 = _p20;
		var _p22 = _p19;
		return _evancz$url_parser$UrlParser$Parser(
			function (state) {
				return A2(
					_elm_lang$core$List$concatMap,
					_p22._0,
					_p21._0(state));
			});
	});
var _evancz$url_parser$UrlParser$map = F2(
	function (subValue, _p23) {
		var _p24 = _p23;
		return _evancz$url_parser$UrlParser$Parser(
			function (_p25) {
				var _p26 = _p25;
				return A2(
					_elm_lang$core$List$map,
					_evancz$url_parser$UrlParser$mapHelp(_p26.value),
					_p24._0(
						{visited: _p26.visited, unvisited: _p26.unvisited, params: _p26.params, value: subValue}));
			});
	});
var _evancz$url_parser$UrlParser$oneOf = function (parsers) {
	return _evancz$url_parser$UrlParser$Parser(
		function (state) {
			return A2(
				_elm_lang$core$List$concatMap,
				function (_p27) {
					var _p28 = _p27;
					return _p28._0(state);
				},
				parsers);
		});
};
var _evancz$url_parser$UrlParser$top = _evancz$url_parser$UrlParser$Parser(
	function (state) {
		return {
			ctor: '::',
			_0: state,
			_1: {ctor: '[]'}
		};
	});
var _evancz$url_parser$UrlParser_ops = _evancz$url_parser$UrlParser_ops || {};
_evancz$url_parser$UrlParser_ops['<?>'] = F2(
	function (_p30, _p29) {
		var _p31 = _p30;
		var _p32 = _p29;
		return _evancz$url_parser$UrlParser$Parser(
			function (state) {
				return A2(
					_elm_lang$core$List$concatMap,
					_p32._0,
					_p31._0(state));
			});
	});
var _evancz$url_parser$UrlParser$QueryParser = function (a) {
	return {ctor: 'QueryParser', _0: a};
};
var _evancz$url_parser$UrlParser$customParam = F2(
	function (key, func) {
		return _evancz$url_parser$UrlParser$QueryParser(
			function (_p33) {
				var _p34 = _p33;
				var _p35 = _p34.params;
				return {
					ctor: '::',
					_0: A4(
						_evancz$url_parser$UrlParser$State,
						_p34.visited,
						_p34.unvisited,
						_p35,
						_p34.value(
							func(
								A2(_elm_lang$core$Dict$get, key, _p35)))),
					_1: {ctor: '[]'}
				};
			});
	});
var _evancz$url_parser$UrlParser$stringParam = function (name) {
	return A2(_evancz$url_parser$UrlParser$customParam, name, _elm_lang$core$Basics$identity);
};
var _evancz$url_parser$UrlParser$intParam = function (name) {
	return A2(_evancz$url_parser$UrlParser$customParam, name, _evancz$url_parser$UrlParser$intParamHelp);
};

var _folkertdev$svg_path_dsl$Svg_Path_Point$angleWithX = function (_p0) {
	var _p1 = _p0;
	var _p4 = _p1._1;
	var _p3 = _p1._0;
	var partial = _elm_lang$core$Native_Utils.eq(_p3, 0) ? 0 : _elm_lang$core$Basics$atan(
		A2(_elm_lang$core$Debug$log, 'y / x', _p4 / _p3));
	var _p2 = A2(
		_elm_lang$core$Debug$log,
		'x, y',
		{ctor: '_Tuple2', _0: _p3, _1: _p4});
	return (_elm_lang$core$Native_Utils.cmp(partial, 0) < 0) ? (_elm_lang$core$Basics$pi + partial) : partial;
};
var _folkertdev$svg_path_dsl$Svg_Path_Point$rotate = F2(
	function (angle, _p5) {
		var _p6 = _p5;
		var _p9 = _p6._1;
		var _p8 = _p6._0;
		var _p7 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$cos(angle),
			_1: _elm_lang$core$Basics$sin(angle)
		};
		var cs = _p7._0;
		var sn = _p7._1;
		return {ctor: '_Tuple2', _0: (_p8 * cs) - (_p9 * sn), _1: (_p8 * sn) + (_p9 * cs)};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$length = function (_p10) {
	var _p11 = _p10;
	var _p13 = _p11._1;
	var _p12 = _p11._0;
	return _elm_lang$core$Basics$sqrt((_p12 * _p12) + (_p13 * _p13));
};
var _folkertdev$svg_path_dsl$Svg_Path_Point$mul = F2(
	function (_p14, n) {
		var _p15 = _p14;
		return {ctor: '_Tuple2', _0: n * _p15._0, _1: n * _p15._1};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$point = F2(
	function (x, y) {
		return {ctor: '_Tuple2', _0: x, _1: y};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$div = F2(
	function (p, n) {
		return _elm_lang$core$Native_Utils.eq(n, 0) ? A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, 0, 0) : A2(_folkertdev$svg_path_dsl$Svg_Path_Point$mul, p, 1 / n);
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$normalize = function (v) {
	return A2(
		_folkertdev$svg_path_dsl$Svg_Path_Point$div,
		v,
		_folkertdev$svg_path_dsl$Svg_Path_Point$length(v));
};
var _folkertdev$svg_path_dsl$Svg_Path_Point$negate = function (_p16) {
	var _p17 = _p16;
	return {ctor: '_Tuple2', _0: 0 - _p17._0, _1: 0 - _p17._1};
};
var _folkertdev$svg_path_dsl$Svg_Path_Point$add = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return {ctor: '_Tuple2', _0: _p20._0 + _p21._0, _1: _p20._1 + _p21._1};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$sub = F2(
	function (a, b) {
		return A2(
			_folkertdev$svg_path_dsl$Svg_Path_Point$add,
			a,
			_folkertdev$svg_path_dsl$Svg_Path_Point$negate(b));
	});
var _folkertdev$svg_path_dsl$Svg_Path_Point$direction = F2(
	function (x, y) {
		var _p22 = A2(
			_elm_lang$core$Debug$log,
			'x, y',
			{ctor: '_Tuple2', _0: x, _1: y});
		return A2(
			_elm_lang$core$Debug$log,
			'the direction',
			_folkertdev$svg_path_dsl$Svg_Path_Point$normalize(
				A2(_folkertdev$svg_path_dsl$Svg_Path_Point$sub, x, y)));
	});

var _folkertdev$svg_path_dsl$Svg_Path_Instruction$propagate = F2(
	function (instruction, _p0) {
		var _p1 = _p0;
		var _p20 = _p1;
		var _p19 = _p1.start;
		var _p18 = _p1.current;
		var resultContinuation = F2(
			function (continuation, state) {
				var _p2 = continuation;
				switch (_p2.ctor) {
					case 'QuadContAbsolute':
						return _elm_lang$core$Native_Utils.update(
							state,
							{current: _p2._0});
					case 'QuadContRelative':
						return _elm_lang$core$Native_Utils.update(
							state,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, state.current, _p2._0)
							});
					case 'CubiContAbsolute':
						return _elm_lang$core$Native_Utils.update(
							state,
							{current: _p2._1});
					default:
						return _elm_lang$core$Native_Utils.update(
							state,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, state.current, _p2._1)
							});
				}
			});
		var _p3 = _p18;
		var cx = _p3._0;
		var cy = _p3._1;
		var _p4 = instruction;
		switch (_p4.ctor) {
			case 'Absolute':
				switch (_p4._0.ctor) {
					case 'Move':
						var _p5 = _p4._0._0;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: _p5,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p5, _p20.current)
							});
					case 'Line':
						var _p6 = _p4._0._0;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: _p6,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, _p6)
							});
					case 'Vertical':
						var _p7 = _p4._0._0;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, cx, _p7),
								direction: A2(
									_folkertdev$svg_path_dsl$Svg_Path_Point$direction,
									_p18,
									A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, cx, _p7))
							});
					case 'Horizontal':
						var _p8 = _p4._0._0;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, _p8, cy),
								direction: A2(
									_folkertdev$svg_path_dsl$Svg_Path_Point$direction,
									_p18,
									A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, _p8, cy))
							});
					case 'Arc':
						var _p15 = _p4._0._3;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: _p15,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p20.current, _p15)
							});
					case 'Quadratic':
						var _p16 = _p4._0._1;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: _p16,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p20.current, _p16)
							});
					case 'Cubic':
						var _p17 = _p4._0._2;
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: _p17,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, _p17)
							});
					default:
						switch (_p4._0._0.ctor) {
							case 'LineMany':
								var _p12 = _p4._0._0._0;
								var _p9 = A2(
									_elm_lang$core$List$drop,
									_elm_lang$core$List$length(_p12) - 2,
									_p12);
								_v3_2:
								do {
									if (_p9.ctor === '::') {
										if (_p9._1.ctor === '::') {
											if (_p9._1._1.ctor === '[]') {
												var _p10 = _p9._1._0;
												return _elm_lang$core$Native_Utils.update(
													_p20,
													{
														current: _p10,
														direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p9._0, _p10)
													});
											} else {
												break _v3_2;
											}
										} else {
											var _p11 = _p9._0;
											return _elm_lang$core$Native_Utils.update(
												_p20,
												{
													current: _p11,
													direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p20.current, _p11)
												});
										}
									} else {
										break _v3_2;
									}
								} while(false);
								return _p20;
							case 'QuadraticMany':
								var newState = A3(
									_elm_lang$core$List$foldl,
									resultContinuation,
									_elm_lang$core$Native_Utils.update(
										_p20,
										{current: _p4._0._0._1}),
									_p4._0._0._2);
								return _elm_lang$core$Native_Utils.update(
									newState,
									{
										direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, newState.current)
									});
							default:
								var newState = A3(
									_elm_lang$core$List$foldl,
									resultContinuation,
									_elm_lang$core$Native_Utils.update(
										_p20,
										{current: _p4._0._0._2}),
									_p4._0._0._3);
								return _elm_lang$core$Native_Utils.update(
									newState,
									{
										direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, newState.current)
									});
						}
				}
			case 'Relative':
				switch (_p4._0.ctor) {
					case 'Move':
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p4._0._0, _p18)
							});
					case 'Line':
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._0)
							});
					case 'Vertical':
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, cx, cy + _p4._0._0)
							});
					case 'Horizontal':
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$point, cx + _p4._0._0, cy)
							});
					case 'Arc':
						var $new = A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._3);
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: $new,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, $new)
							});
					case 'Quadratic':
						var $new = A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._1);
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: $new,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, $new)
							});
					case 'Cubic':
						var $new = A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._2);
						return _elm_lang$core$Native_Utils.update(
							_p20,
							{
								current: $new,
								direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, $new)
							});
					default:
						switch (_p4._0._0.ctor) {
							case 'LineMany':
								var _p14 = _p4._0._0._0;
								var newState = A3(
									_elm_lang$core$List$foldl,
									F2(
										function (rel, newState) {
											return _elm_lang$core$Native_Utils.update(
												newState,
												{
													current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, rel, newState.current)
												});
										}),
									_p20,
									_p14);
								var _p13 = A2(
									_elm_lang$core$List$drop,
									_elm_lang$core$List$length(_p14) - 2,
									_p14);
								_v4_2:
								do {
									if (_p13.ctor === '::') {
										if (_p13._1.ctor === '::') {
											if (_p13._1._1.ctor === '[]') {
												return _elm_lang$core$Native_Utils.update(
													newState,
													{
														direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p13._0, _p13._1._0)
													});
											} else {
												break _v4_2;
											}
										} else {
											return _elm_lang$core$Native_Utils.update(
												newState,
												{
													direction: _folkertdev$svg_path_dsl$Svg_Path_Point$normalize(_p13._0)
												});
										}
									} else {
										break _v4_2;
									}
								} while(false);
								return newState;
							case 'QuadraticMany':
								var newState = A3(
									_elm_lang$core$List$foldl,
									resultContinuation,
									_elm_lang$core$Native_Utils.update(
										_p20,
										{
											current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._0._1)
										}),
									_p4._0._0._2);
								return _elm_lang$core$Native_Utils.update(
									newState,
									{
										direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, newState.current)
									});
							default:
								var newState = A3(
									_elm_lang$core$List$foldl,
									resultContinuation,
									_elm_lang$core$Native_Utils.update(
										_p20,
										{
											current: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$add, _p18, _p4._0._0._2)
										}),
									_p4._0._0._3);
								return _elm_lang$core$Native_Utils.update(
									newState,
									{
										direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, newState.current)
									});
						}
				}
			default:
				return _elm_lang$core$Native_Utils.update(
					_p20,
					{
						current: _p19,
						direction: A2(_folkertdev$svg_path_dsl$Svg_Path_Point$direction, _p18, _p19)
					});
		}
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$fixed = F2(
	function (i, n) {
		var pow = _elm_lang$core$Basics$toFloat(
			Math.pow(10, i));
		var nInt = _elm_lang$core$Basics$round(n * pow);
		return _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$toFloat(nInt) / pow);
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$roundToAtMost = function (doRound) {
	var _p21 = doRound;
	if (_p21.ctor === 'Nothing') {
		return _elm_lang$core$Basics$toString;
	} else {
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$fixed(_p21._0);
	}
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$formatPointWithPrecision = F2(
	function (dp, _p22) {
		var _p23 = _p22;
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$roundToAtMost, dp, _p23._0),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$roundToAtMost, dp, _p23._1)));
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative = function (a) {
	return {ctor: 'Relative', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute = function (a) {
	return {ctor: 'Absolute', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$ClosePath = {ctor: 'ClosePath'};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic = F3(
	function (a, b, c) {
		return {ctor: 'Cubic', _0: a, _1: b, _2: c};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic = F2(
	function (a, b) {
		return {ctor: 'Quadratic', _0: a, _1: b};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString = F2(
	function (dp, instruction) {
		var concatMapString = function (f) {
			return A2(
				_elm_lang$core$List$foldl,
				F2(
					function (e, accum) {
						return A2(
							_elm_lang$core$Basics_ops['++'],
							accum,
							f(e));
					}),
				'');
		};
		var doRound = _folkertdev$svg_path_dsl$Svg_Path_Instruction$roundToAtMost(dp);
		var letterAndFloat = F2(
			function (letter, num) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					letter,
					doRound(num));
			});
		var formatPoint = _folkertdev$svg_path_dsl$Svg_Path_Instruction$formatPointWithPrecision(dp);
		var letterAndPoint = F2(
			function (letter, point) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					letter,
					formatPoint(point));
			});
		var letterAndPoints = F2(
			function (letter, points) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					letter,
					A2(
						_elm_lang$core$String$join,
						' ',
						A2(_elm_lang$core$List$map, formatPoint, points)));
			});
		var letterAndPoint2 = F3(
			function (letter, p1, p2) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					letter,
					A2(
						_elm_lang$core$Basics_ops['++'],
						formatPoint(p1),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							formatPoint(p2))));
			});
		var formatCurveContinuation = function (continuation) {
			var _p24 = continuation;
			switch (_p24.ctor) {
				case 'QuadContAbsolute':
					return A2(letterAndPoint, 'T', _p24._0);
				case 'QuadContRelative':
					return A2(letterAndPoint, 't', _p24._0);
				case 'CubiContAbsolute':
					return A3(letterAndPoint2, 'S', _p24._0, _p24._1);
				default:
					return A3(letterAndPoint2, 's', _p24._0, _p24._1);
			}
		};
		var letterAndPoint3 = F4(
			function (letter, p1, p2, p3) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					letter,
					A2(
						_elm_lang$core$Basics_ops['++'],
						formatPoint(p1),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								formatPoint(p2),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' ',
									formatPoint(p3))))));
			});
		var _p25 = instruction;
		switch (_p25.ctor) {
			case 'ClosePath':
				return 'Z';
			case 'Absolute':
				switch (_p25._0.ctor) {
					case 'Move':
						return A2(letterAndPoint, 'M', _p25._0._0);
					case 'Line':
						return A2(letterAndPoint, 'L', _p25._0._0);
					case 'Vertical':
						return A2(letterAndFloat, 'V', _p25._0._0);
					case 'Horizontal':
						return A2(letterAndFloat, 'H', _p25._0._0);
					case 'Quadratic':
						return A3(letterAndPoint2, 'Q', _p25._0._0, _p25._0._1);
					case 'Cubic':
						return A4(letterAndPoint3, 'C', _p25._0._0, _p25._0._1, _p25._0._2);
					case 'Many':
						switch (_p25._0._0.ctor) {
							case 'LineMany':
								var _p27 = _p25._0._0._0;
								var _p26 = _p27;
								if (_p26.ctor === '[]') {
									return '';
								} else {
									return A2(letterAndPoints, 'L', _p27);
								}
							case 'QuadraticMany':
								return A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString,
										dp,
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
											A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic, _p25._0._0._0, _p25._0._0._1))),
									A2(concatMapString, formatCurveContinuation, _p25._0._0._2));
							default:
								return A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString,
										dp,
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
											A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic, _p25._0._0._0, _p25._0._0._1, _p25._0._0._2))),
									A2(concatMapString, formatCurveContinuation, _p25._0._0._3));
						}
					default:
						var sweep = function () {
							var _p30 = _p25._0._2._1;
							if (_p30.ctor === 'AntiClockwise') {
								return '0';
							} else {
								return '1';
							}
						}();
						var arc = function () {
							var _p31 = _p25._0._2._0;
							if (_p31.ctor === 'Smallest') {
								return '0';
							} else {
								return '1';
							}
						}();
						return A2(
							_elm_lang$core$Basics_ops['++'],
							'A',
							A2(
								_elm_lang$core$Basics_ops['++'],
								formatPoint(
									{ctor: '_Tuple2', _0: _p25._0._0._0, _1: _p25._0._0._1}),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										doRound(_p25._0._1),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												arc,
												A2(
													_elm_lang$core$Basics_ops['++'],
													',',
													A2(
														_elm_lang$core$Basics_ops['++'],
														sweep,
														A2(
															_elm_lang$core$Basics_ops['++'],
															' ',
															formatPoint(
																{ctor: '_Tuple2', _0: _p25._0._3._0, _1: _p25._0._3._1}))))))))));
				}
			default:
				switch (_p25._0.ctor) {
					case 'Move':
						return A2(letterAndPoint, 'm', _p25._0._0);
					case 'Line':
						return A2(letterAndPoint, 'l', _p25._0._0);
					case 'Vertical':
						return A2(letterAndFloat, 'v', _p25._0._0);
					case 'Horizontal':
						return A2(letterAndFloat, 'h', _p25._0._0);
					case 'Quadratic':
						return A3(letterAndPoint2, 'q', _p25._0._0, _p25._0._1);
					case 'Cubic':
						return A4(letterAndPoint3, 'c', _p25._0._0, _p25._0._1, _p25._0._2);
					case 'Many':
						switch (_p25._0._0.ctor) {
							case 'LineMany':
								var _p29 = _p25._0._0._0;
								var _p28 = _p29;
								if (_p28.ctor === '[]') {
									return '';
								} else {
									return A2(letterAndPoints, 'l', _p29);
								}
							case 'QuadraticMany':
								return A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString,
										dp,
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
											A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic, _p25._0._0._0, _p25._0._0._1))),
									A2(concatMapString, formatCurveContinuation, _p25._0._0._2));
							default:
								return A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString,
										dp,
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
											A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic, _p25._0._0._0, _p25._0._0._1, _p25._0._0._2))),
									A2(concatMapString, formatCurveContinuation, _p25._0._0._3));
						}
					default:
						var sweep = function () {
							var _p32 = _p25._0._2._1;
							if (_p32.ctor === 'AntiClockwise') {
								return '0';
							} else {
								return '1';
							}
						}();
						var arc = function () {
							var _p33 = _p25._0._2._0;
							if (_p33.ctor === 'Smallest') {
								return '0';
							} else {
								return '1';
							}
						}();
						return A2(
							_elm_lang$core$Basics_ops['++'],
							'a',
							A2(
								_elm_lang$core$Basics_ops['++'],
								formatPoint(
									{ctor: '_Tuple2', _0: _p25._0._0._0, _1: _p25._0._0._1}),
								A2(
									_elm_lang$core$Basics_ops['++'],
									' ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										doRound(_p25._0._1),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												arc,
												A2(
													_elm_lang$core$Basics_ops['++'],
													',',
													A2(
														_elm_lang$core$Basics_ops['++'],
														sweep,
														A2(
															_elm_lang$core$Basics_ops['++'],
															' ',
															formatPoint(
																{ctor: '_Tuple2', _0: _p25._0._3._0, _1: _p25._0._3._1}))))))))));
				}
		}
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Arc = F4(
	function (a, b, c, d) {
		return {ctor: 'Arc', _0: a, _1: b, _2: c, _3: d};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Horizontal = function (a) {
	return {ctor: 'Horizontal', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Vertical = function (a) {
	return {ctor: 'Vertical', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Move = function (a) {
	return {ctor: 'Move', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$CubicMany = F4(
	function (a, b, c, d) {
		return {ctor: 'CubicMany', _0: a, _1: b, _2: c, _3: d};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadraticMany = F3(
	function (a, b, c) {
		return {ctor: 'QuadraticMany', _0: a, _1: b, _2: c};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$LineMany = function (a) {
	return {ctor: 'LineMany', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$CubiContRelative = F2(
	function (a, b) {
		return {ctor: 'CubiContRelative', _0: a, _1: b};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$CubiContAbsolute = F2(
	function (a, b) {
		return {ctor: 'CubiContAbsolute', _0: a, _1: b};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadContRelative = function (a) {
	return {ctor: 'QuadContRelative', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadContAbsolute = function (a) {
	return {ctor: 'QuadContAbsolute', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsoluteCurveCont = F2(
	function (f, curveCont) {
		var _p34 = curveCont;
		switch (_p34.ctor) {
			case 'QuadContAbsolute':
				return _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadContAbsolute(
					f(_p34._0));
			case 'CubiContAbsolute':
				return A2(
					_folkertdev$svg_path_dsl$Svg_Path_Instruction$CubiContAbsolute,
					f(_p34._0),
					f(_p34._1));
			default:
				return curveCont;
		}
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsolute = F2(
	function (f, instruction) {
		var _p35 = instruction;
		switch (_p35.ctor) {
			case 'ClosePath':
				return _folkertdev$svg_path_dsl$Svg_Path_Instruction$ClosePath;
			case 'Relative':
				var _p36 = _p35._0;
				if (_p36.ctor === 'Many') {
					var _p38 = _p36._0;
					var _p37 = _p38;
					switch (_p37.ctor) {
						case 'QuadraticMany':
							return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
								_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
									A3(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadraticMany,
										_p37._0,
										_p37._1,
										A2(
											_elm_lang$core$List$map,
											_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsoluteCurveCont(f),
											_p37._2))));
						case 'CubicMany':
							return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
								_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
									A4(
										_folkertdev$svg_path_dsl$Svg_Path_Instruction$CubicMany,
										_p37._0,
										_p37._1,
										_p37._2,
										A2(
											_elm_lang$core$List$map,
											_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsoluteCurveCont(f),
											_p37._3))));
						default:
							return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
								_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(_p38));
					}
				} else {
					return instruction;
				}
			default:
				return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
					function () {
						var _p39 = _p35._0;
						switch (_p39.ctor) {
							case 'Move':
								return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Move(
									f(_p39._0));
							case 'Line':
								return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Line(
									f(_p39._0));
							case 'Arc':
								return A4(
									_folkertdev$svg_path_dsl$Svg_Path_Instruction$Arc,
									_p39._0,
									_p39._1,
									_p39._2,
									f(_p39._3));
							case 'Quadratic':
								return A2(
									_folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic,
									f(_p39._0),
									f(_p39._1));
							case 'Cubic':
								return A3(
									_folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic,
									f(_p39._0),
									f(_p39._1),
									f(_p39._2));
							case 'Horizontal':
								return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Horizontal(
									_elm_lang$core$Tuple$first(
										f(
											{ctor: '_Tuple2', _0: _p39._0, _1: 0})));
							case 'Vertical':
								return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Vertical(
									_elm_lang$core$Tuple$second(
										f(
											{ctor: '_Tuple2', _0: 0, _1: _p39._0})));
							default:
								var _p40 = _p39._0;
								switch (_p40.ctor) {
									case 'LineMany':
										return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
											_folkertdev$svg_path_dsl$Svg_Path_Instruction$LineMany(
												A2(_elm_lang$core$List$map, f, _p40._0)));
									case 'QuadraticMany':
										return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
											A3(
												_folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadraticMany,
												_p40._0,
												_p40._1,
												A2(
													_elm_lang$core$List$map,
													_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsoluteCurveCont(f),
													_p40._2)));
									default:
										return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
											A4(
												_folkertdev$svg_path_dsl$Svg_Path_Instruction$CubicMany,
												_p40._0,
												_p40._1,
												_p40._2,
												A2(
													_elm_lang$core$List$map,
													_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsoluteCurveCont(f),
													_p40._3)));
								}
						}
					}());
		}
	});
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Largest = {ctor: 'Largest'};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Smallest = {ctor: 'Smallest'};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$Clockwise = {ctor: 'Clockwise'};
var _folkertdev$svg_path_dsl$Svg_Path_Instruction$AntiClockwise = {ctor: 'AntiClockwise'};

var _folkertdev$svg_path_dsl$Svg_Path_Subpath$subpathToInstructions = F2(
	function (_p0, accum) {
		var _p1 = _p0;
		var _p3 = _p1._0._0;
		var _p2 = _p1._2;
		return _p1._1._0 ? A2(
			_elm_lang$core$Basics_ops['++'],
			{ctor: '::', _0: _p3, _1: _p2},
			{ctor: '::', _0: _folkertdev$svg_path_dsl$Svg_Path_Instruction$ClosePath, _1: accum}) : A2(
			_elm_lang$core$Basics_ops['++'],
			{ctor: '::', _0: _p3, _1: _p2},
			accum);
	});
var _folkertdev$svg_path_dsl$Svg_Path_Subpath$Subpath = F3(
	function (a, b, c) {
		return {ctor: 'Subpath', _0: a, _1: b, _2: c};
	});
var _folkertdev$svg_path_dsl$Svg_Path_Subpath$subpath = _folkertdev$svg_path_dsl$Svg_Path_Subpath$Subpath;
var _folkertdev$svg_path_dsl$Svg_Path_Subpath$CloseOption = function (a) {
	return {ctor: 'CloseOption', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Subpath$StartingPoint = function (a) {
	return {ctor: 'StartingPoint', _0: a};
};
var _folkertdev$svg_path_dsl$Svg_Path_Subpath$mapAbsolute = F2(
	function (f, _p4) {
		var _p5 = _p4;
		return A3(
			_folkertdev$svg_path_dsl$Svg_Path_Subpath$Subpath,
			_folkertdev$svg_path_dsl$Svg_Path_Subpath$StartingPoint(
				A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsolute, f, _p5._0._0)),
			_p5._1,
			A2(
				_elm_lang$core$List$map,
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$mapAbsolute(f),
				_p5._2));
	});

var _folkertdev$svg_path_dsl$Svg_Path$quadraticContinueBy = _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadContRelative;
var _folkertdev$svg_path_dsl$Svg_Path$quadraticContinueTo = _folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadContAbsolute;
var _folkertdev$svg_path_dsl$Svg_Path$cubicContinueBy = _folkertdev$svg_path_dsl$Svg_Path_Instruction$CubiContRelative;
var _folkertdev$svg_path_dsl$Svg_Path$cubicContinueTo = _folkertdev$svg_path_dsl$Svg_Path_Instruction$CubiContAbsolute;
var _folkertdev$svg_path_dsl$Svg_Path$cubicByMany = F3(
	function (c1, c2, p) {
		return function (_p0) {
			return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
					A4(_folkertdev$svg_path_dsl$Svg_Path_Instruction$CubicMany, c1, c2, p, _p0)));
		};
	});
var _folkertdev$svg_path_dsl$Svg_Path$cubicToMany = F3(
	function (c1, c2, p) {
		return function (_p1) {
			return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
					A4(_folkertdev$svg_path_dsl$Svg_Path_Instruction$CubicMany, c1, c2, p, _p1)));
		};
	});
var _folkertdev$svg_path_dsl$Svg_Path$cubicBy = F3(
	function (c1, c2, p) {
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
			A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic, c1, c2, p));
	});
var _folkertdev$svg_path_dsl$Svg_Path$cubicTo = F3(
	function (c1, c2, p) {
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
			A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Cubic, c1, c2, p));
	});
var _folkertdev$svg_path_dsl$Svg_Path$quadraticByMany = F3(
	function (c, p, cs) {
		return function (_p2) {
			return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(_p2));
		}(
			A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadraticMany, c, p, cs));
	});
var _folkertdev$svg_path_dsl$Svg_Path$quadraticToMany = F3(
	function (c, p, cs) {
		return function (_p3) {
			return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(_p3));
		}(
			A3(_folkertdev$svg_path_dsl$Svg_Path_Instruction$QuadraticMany, c, p, cs));
	});
var _folkertdev$svg_path_dsl$Svg_Path$quadraticBy = function (c) {
	return function (_p4) {
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
			A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic, c, _p4));
	};
};
var _folkertdev$svg_path_dsl$Svg_Path$quadraticTo = function (c) {
	return function (_p5) {
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
			A2(_folkertdev$svg_path_dsl$Svg_Path_Instruction$Quadratic, c, _p5));
	};
};
var _folkertdev$svg_path_dsl$Svg_Path$toStart = _folkertdev$svg_path_dsl$Svg_Path_Instruction$ClosePath;
var _folkertdev$svg_path_dsl$Svg_Path$smallestArc = _folkertdev$svg_path_dsl$Svg_Path_Instruction$Smallest;
var _folkertdev$svg_path_dsl$Svg_Path$largestArc = _folkertdev$svg_path_dsl$Svg_Path_Instruction$Largest;
var _folkertdev$svg_path_dsl$Svg_Path$antiClockwise = _folkertdev$svg_path_dsl$Svg_Path_Instruction$AntiClockwise;
var _folkertdev$svg_path_dsl$Svg_Path$clockwise = _folkertdev$svg_path_dsl$Svg_Path_Instruction$Clockwise;
var _folkertdev$svg_path_dsl$Svg_Path$arcBy = F4(
	function (radius, xstartangle, _p6, point) {
		var _p7 = _p6;
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
			A4(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Arc,
				radius,
				xstartangle,
				{ctor: '_Tuple2', _0: _p7._0, _1: _p7._1},
				point));
	});
var _folkertdev$svg_path_dsl$Svg_Path$arcTo = F4(
	function (radius, xstartangle, _p8, point) {
		var _p9 = _p8;
		return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
			A4(
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$Arc,
				radius,
				xstartangle,
				{ctor: '_Tuple2', _0: _p9._0, _1: _p9._1},
				point));
	});
var _folkertdev$svg_path_dsl$Svg_Path$horizontalBy = function (_p10) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Horizontal(_p10));
};
var _folkertdev$svg_path_dsl$Svg_Path$horizontalTo = function (_p11) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Horizontal(_p11));
};
var _folkertdev$svg_path_dsl$Svg_Path$verticalBy = function (_p12) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Vertical(_p12));
};
var _folkertdev$svg_path_dsl$Svg_Path$verticalTo = function (_p13) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Vertical(_p13));
};
var _folkertdev$svg_path_dsl$Svg_Path$lineByMany = function (_p14) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
			_folkertdev$svg_path_dsl$Svg_Path_Instruction$LineMany(_p14)));
};
var _folkertdev$svg_path_dsl$Svg_Path$lineBy = function (_p15) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Line(_p15));
};
var _folkertdev$svg_path_dsl$Svg_Path$lineToMany = function (_p16) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Many(
			_folkertdev$svg_path_dsl$Svg_Path_Instruction$LineMany(_p16)));
};
var _folkertdev$svg_path_dsl$Svg_Path$lineTo = function (_p17) {
	return _folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Line(_p17));
};
var _folkertdev$svg_path_dsl$Svg_Path$instructionsToString = function (maxNumOfDecimals) {
	return function (_p18) {
		return A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString(maxNumOfDecimals),
				_p18));
	};
};
var _folkertdev$svg_path_dsl$Svg_Path$instructionsToAttribute = function (maxNumOfDecimals) {
	return function (_p19) {
		return _elm_lang$svg$Svg_Attributes$d(
			A2(_folkertdev$svg_path_dsl$Svg_Path$instructionsToString, maxNumOfDecimals, _p19));
	};
};
var _folkertdev$svg_path_dsl$Svg_Path$instructionToString = _folkertdev$svg_path_dsl$Svg_Path_Instruction$instructionToString;
var _folkertdev$svg_path_dsl$Svg_Path$open = _folkertdev$svg_path_dsl$Svg_Path_Subpath$CloseOption(false);
var _folkertdev$svg_path_dsl$Svg_Path$closed = _folkertdev$svg_path_dsl$Svg_Path_Subpath$CloseOption(true);
var _folkertdev$svg_path_dsl$Svg_Path$moveBy = function (_p20) {
	return _folkertdev$svg_path_dsl$Svg_Path_Subpath$StartingPoint(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Relative(
			_folkertdev$svg_path_dsl$Svg_Path_Instruction$Move(_p20)));
};
var _folkertdev$svg_path_dsl$Svg_Path$startAt = function (_p21) {
	return _folkertdev$svg_path_dsl$Svg_Path_Subpath$StartingPoint(
		_folkertdev$svg_path_dsl$Svg_Path_Instruction$Absolute(
			_folkertdev$svg_path_dsl$Svg_Path_Instruction$Move(_p21)));
};
var _folkertdev$svg_path_dsl$Svg_Path$subpath = _folkertdev$svg_path_dsl$Svg_Path_Subpath$subpath;
var _folkertdev$svg_path_dsl$Svg_Path$emptySubpath = A3(
	_folkertdev$svg_path_dsl$Svg_Path$subpath,
	_folkertdev$svg_path_dsl$Svg_Path$moveBy(
		{ctor: '_Tuple2', _0: 0, _1: 0}),
	_folkertdev$svg_path_dsl$Svg_Path$open,
	{ctor: '[]'});
var _folkertdev$svg_path_dsl$Svg_Path$pathToStringWithPrecision = F2(
	function (decimalPlaces, path) {
		return A2(
			_folkertdev$svg_path_dsl$Svg_Path$instructionsToString,
			_elm_lang$core$Maybe$Just(decimalPlaces),
			A3(
				_elm_lang$core$List$foldr,
				_folkertdev$svg_path_dsl$Svg_Path_Subpath$subpathToInstructions,
				{ctor: '[]'},
				path));
	});
var _folkertdev$svg_path_dsl$Svg_Path$pathToAttribute = function (path) {
	return _elm_lang$svg$Svg_Attributes$d(
		A2(
			_folkertdev$svg_path_dsl$Svg_Path$instructionsToString,
			_elm_lang$core$Maybe$Nothing,
			A3(
				_elm_lang$core$List$foldr,
				_folkertdev$svg_path_dsl$Svg_Path_Subpath$subpathToInstructions,
				{ctor: '[]'},
				path)));
};
var _folkertdev$svg_path_dsl$Svg_Path$pathToString = function (path) {
	return A2(
		_folkertdev$svg_path_dsl$Svg_Path$instructionsToString,
		_elm_lang$core$Maybe$Nothing,
		A3(
			_elm_lang$core$List$foldr,
			_folkertdev$svg_path_dsl$Svg_Path_Subpath$subpathToInstructions,
			{ctor: '[]'},
			path));
};

var _lukewestby$elm_http_builder$HttpBuilder$replace = F2(
	function (old, $new) {
		return function (_p0) {
			return A2(
				_elm_lang$core$String$join,
				$new,
				A2(_elm_lang$core$String$split, old, _p0));
		};
	});
var _lukewestby$elm_http_builder$HttpBuilder$queryEscape = function (_p1) {
	return A3(
		_lukewestby$elm_http_builder$HttpBuilder$replace,
		'%20',
		'+',
		_elm_lang$http$Http$encodeUri(_p1));
};
var _lukewestby$elm_http_builder$HttpBuilder$queryPair = function (_p2) {
	var _p3 = _p2;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_lukewestby$elm_http_builder$HttpBuilder$queryEscape(_p3._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'=',
			_lukewestby$elm_http_builder$HttpBuilder$queryEscape(_p3._1)));
};
var _lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded = function (args) {
	return A2(
		_elm_lang$core$String$join,
		'&',
		A2(_elm_lang$core$List$map, _lukewestby$elm_http_builder$HttpBuilder$queryPair, args));
};
var _lukewestby$elm_http_builder$HttpBuilder$toRequest = function (builder) {
	var encodedParams = _lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded(builder.queryParams);
	var fullUrl = _elm_lang$core$String$isEmpty(encodedParams) ? builder.url : A2(
		_elm_lang$core$Basics_ops['++'],
		builder.url,
		A2(_elm_lang$core$Basics_ops['++'], '?', encodedParams));
	return _elm_lang$http$Http$request(
		{method: builder.method, url: fullUrl, headers: builder.headers, body: builder.body, expect: builder.expect, timeout: builder.timeout, withCredentials: builder.withCredentials});
};
var _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain = function (builder) {
	return _elm_lang$http$Http$toTask(
		_lukewestby$elm_http_builder$HttpBuilder$toRequest(builder));
};
var _lukewestby$elm_http_builder$HttpBuilder$withCacheBuster = F2(
	function (paramName, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				cacheBuster: _elm_lang$core$Maybe$Just(paramName)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withQueryParams = F2(
	function (queryParams, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				queryParams: A2(_elm_lang$core$Basics_ops['++'], builder.queryParams, queryParams)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$toTaskWithCacheBuster = F2(
	function (paramName, builder) {
		var request = function (timestamp) {
			return _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain(
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withQueryParams,
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: paramName,
							_1: _elm_lang$core$Basics$toString(timestamp)
						},
						_1: {ctor: '[]'}
					},
					builder));
		};
		return A2(_elm_lang$core$Task$andThen, request, _elm_lang$core$Time$now);
	});
var _lukewestby$elm_http_builder$HttpBuilder$toTask = function (builder) {
	var _p4 = builder.cacheBuster;
	if (_p4.ctor === 'Just') {
		return A2(_lukewestby$elm_http_builder$HttpBuilder$toTaskWithCacheBuster, _p4._0, builder);
	} else {
		return _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain(builder);
	}
};
var _lukewestby$elm_http_builder$HttpBuilder$send = F2(
	function (tagger, builder) {
		return A2(
			_elm_lang$core$Task$attempt,
			tagger,
			_lukewestby$elm_http_builder$HttpBuilder$toTask(builder));
	});
var _lukewestby$elm_http_builder$HttpBuilder$withExpect = F2(
	function (expect, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{expect: expect});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withCredentials = function (builder) {
	return _elm_lang$core$Native_Utils.update(
		builder,
		{withCredentials: true});
};
var _lukewestby$elm_http_builder$HttpBuilder$withTimeout = F2(
	function (timeout, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				timeout: _elm_lang$core$Maybe$Just(timeout)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withBody = F2(
	function (body, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{body: body});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withStringBody = F2(
	function (contentType, value) {
		return _lukewestby$elm_http_builder$HttpBuilder$withBody(
			A2(_elm_lang$http$Http$stringBody, contentType, value));
	});
var _lukewestby$elm_http_builder$HttpBuilder$withUrlEncodedBody = function (_p5) {
	return A2(
		_lukewestby$elm_http_builder$HttpBuilder$withStringBody,
		'application/x-www-form-urlencoded',
		_lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded(_p5));
};
var _lukewestby$elm_http_builder$HttpBuilder$withJsonBody = function (value) {
	return _lukewestby$elm_http_builder$HttpBuilder$withBody(
		_elm_lang$http$Http$jsonBody(value));
};
var _lukewestby$elm_http_builder$HttpBuilder$withMultipartStringBody = function (partPairs) {
	return _lukewestby$elm_http_builder$HttpBuilder$withBody(
		_elm_lang$http$Http$multipartBody(
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Basics$uncurry(_elm_lang$http$Http$stringPart),
				partPairs)));
};
var _lukewestby$elm_http_builder$HttpBuilder$withHeaders = F2(
	function (headerPairs, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				headers: A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$map,
						_elm_lang$core$Basics$uncurry(_elm_lang$http$Http$header),
						headerPairs),
					builder.headers)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withHeader = F3(
	function (key, value, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				headers: {
					ctor: '::',
					_0: A2(_elm_lang$http$Http$header, key, value),
					_1: builder.headers
				}
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl = F2(
	function (method, url) {
		return {
			method: method,
			url: url,
			headers: {ctor: '[]'},
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectStringResponse(
				function (_p6) {
					return _elm_lang$core$Result$Ok(
						{ctor: '_Tuple0'});
				}),
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false,
			queryParams: {ctor: '[]'},
			cacheBuster: _elm_lang$core$Maybe$Nothing
		};
	});
var _lukewestby$elm_http_builder$HttpBuilder$get = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('GET');
var _lukewestby$elm_http_builder$HttpBuilder$post = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('POST');
var _lukewestby$elm_http_builder$HttpBuilder$put = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('PUT');
var _lukewestby$elm_http_builder$HttpBuilder$patch = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('PATCH');
var _lukewestby$elm_http_builder$HttpBuilder$delete = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('DELETE');
var _lukewestby$elm_http_builder$HttpBuilder$options = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('OPTIONS');
var _lukewestby$elm_http_builder$HttpBuilder$trace = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('TRACE');
var _lukewestby$elm_http_builder$HttpBuilder$head = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('HEAD');
var _lukewestby$elm_http_builder$HttpBuilder$RequestBuilder = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g, queryParams: h, cacheBuster: i};
	});

var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$horizontalAlignOption = function (align) {
	var _p0 = align;
	switch (_p0.ctor) {
		case 'Left':
			return 'start';
		case 'Center':
			return 'center';
		case 'Right':
			return 'end';
		case 'Around':
			return 'around';
		default:
			return 'between';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption = function (align) {
	var _p1 = align;
	switch (_p1.ctor) {
		case 'Top':
			return 'start';
		case 'Middle':
			return 'center';
		default:
			return 'end';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption = function (size) {
	var _p2 = size;
	switch (_p2.ctor) {
		case 'Move0':
			return '0';
		case 'Move1':
			return '1';
		case 'Move2':
			return '2';
		case 'Move3':
			return '3';
		case 'Move4':
			return '4';
		case 'Move5':
			return '5';
		case 'Move6':
			return '6';
		case 'Move7':
			return '7';
		case 'Move8':
			return '8';
		case 'Move9':
			return '9';
		case 'Move10':
			return '10';
		case 'Move11':
			return '11';
		default:
			return '12';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption = function (size) {
	var _p3 = size;
	switch (_p3.ctor) {
		case 'Offset0':
			return '0';
		case 'Offset1':
			return '1';
		case 'Offset2':
			return '2';
		case 'Offset3':
			return '3';
		case 'Offset4':
			return '4';
		case 'Offset5':
			return '5';
		case 'Offset6':
			return '6';
		case 'Offset7':
			return '7';
		case 'Offset8':
			return '8';
		case 'Offset9':
			return '9';
		case 'Offset10':
			return '10';
		default:
			return '11';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption = function (size) {
	var _p4 = size;
	switch (_p4.ctor) {
		case 'Col':
			return _elm_lang$core$Maybe$Nothing;
		case 'Col1':
			return _elm_lang$core$Maybe$Just('1');
		case 'Col2':
			return _elm_lang$core$Maybe$Just('2');
		case 'Col3':
			return _elm_lang$core$Maybe$Just('3');
		case 'Col4':
			return _elm_lang$core$Maybe$Just('4');
		case 'Col5':
			return _elm_lang$core$Maybe$Just('5');
		case 'Col6':
			return _elm_lang$core$Maybe$Just('6');
		case 'Col7':
			return _elm_lang$core$Maybe$Just('7');
		case 'Col8':
			return _elm_lang$core$Maybe$Just('8');
		case 'Col9':
			return _elm_lang$core$Maybe$Just('9');
		case 'Col10':
			return _elm_lang$core$Maybe$Just('10');
		case 'Col11':
			return _elm_lang$core$Maybe$Just('11');
		case 'Col12':
			return _elm_lang$core$Maybe$Just('12');
		default:
			return _elm_lang$core$Maybe$Just('auto');
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption = function (size) {
	var _p5 = size;
	switch (_p5.ctor) {
		case 'XS':
			return _elm_lang$core$Maybe$Nothing;
		case 'SM':
			return _elm_lang$core$Maybe$Just('sm');
		case 'MD':
			return _elm_lang$core$Maybe$Just('md');
		case 'LG':
			return _elm_lang$core$Maybe$Just('lg');
		default:
			return _elm_lang$core$Maybe$Just('xl');
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString = function (screenSize) {
	var _p6 = _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(screenSize);
	if (_p6.ctor === 'Just') {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'-',
			A2(_elm_lang$core$Basics_ops['++'], _p6._0, '-'));
	} else {
		return '-';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignClass = function (_p7) {
	var _p8 = _p7;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'justify-content-',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], v, '-');
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p8.screenSize))),
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$horizontalAlignOption(_p8.align))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes = function (aligns) {
	var align = function (a) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignClass, a);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, align, aligns));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass = F2(
	function (prefix, _p9) {
		var _p10 = _p9;
		return _elm_lang$html$Html_Attributes$class(
			A2(
				_elm_lang$core$Basics_ops['++'],
				prefix,
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$Maybe$withDefault,
						'',
						A2(
							_elm_lang$core$Maybe$map,
							function (v) {
								return A2(_elm_lang$core$Basics_ops['++'], v, '-');
							},
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p10.screenSize))),
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption(_p10.align))));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes = F2(
	function (prefix, aligns) {
		var align = function (a) {
			return A2(
				_elm_lang$core$Maybe$map,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass(prefix),
				a);
		};
		return A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			A2(_elm_lang$core$List$map, align, aligns));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes = function (pushes) {
	var push = function (m) {
		var _p11 = m;
		if (_p11.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'push',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p11._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p11._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, push, pushes));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes = function (pulls) {
	var pull = function (m) {
		var _p12 = m;
		if (_p12.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'pull',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p12._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p12._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, pull, pulls));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass = function (_p13) {
	var _p14 = _p13;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'offset',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p14.screenSize),
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption(_p14.offsetCount))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes = function (offsets) {
	var offset = function (m) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass, m);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, offset, offsets));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass = function (_p15) {
	var _p16 = _p15;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'col',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p16.screenSize))),
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption(_p16.columnCount))))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes = function (widths) {
	var width = function (w) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass, w);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, width, widths));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions = {
	attributes: {ctor: '[]'},
	vAlignXs: _elm_lang$core$Maybe$Nothing,
	vAlignSm: _elm_lang$core$Maybe$Nothing,
	vAlignMd: _elm_lang$core$Maybe$Nothing,
	vAlignLg: _elm_lang$core$Maybe$Nothing,
	vAlignXl: _elm_lang$core$Maybe$Nothing,
	hAlignXs: _elm_lang$core$Maybe$Nothing,
	hAlignSm: _elm_lang$core$Maybe$Nothing,
	hAlignMd: _elm_lang$core$Maybe$Nothing,
	hAlignLg: _elm_lang$core$Maybe$Nothing,
	hAlignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions = {
	attributes: {ctor: '[]'},
	widthXs: _elm_lang$core$Maybe$Nothing,
	widthSm: _elm_lang$core$Maybe$Nothing,
	widthMd: _elm_lang$core$Maybe$Nothing,
	widthLg: _elm_lang$core$Maybe$Nothing,
	widthXl: _elm_lang$core$Maybe$Nothing,
	offsetXs: _elm_lang$core$Maybe$Nothing,
	offsetSm: _elm_lang$core$Maybe$Nothing,
	offsetMd: _elm_lang$core$Maybe$Nothing,
	offsetLg: _elm_lang$core$Maybe$Nothing,
	offsetXl: _elm_lang$core$Maybe$Nothing,
	pullXs: _elm_lang$core$Maybe$Nothing,
	pullSm: _elm_lang$core$Maybe$Nothing,
	pullMd: _elm_lang$core$Maybe$Nothing,
	pullLg: _elm_lang$core$Maybe$Nothing,
	pullXl: _elm_lang$core$Maybe$Nothing,
	pushXs: _elm_lang$core$Maybe$Nothing,
	pushSm: _elm_lang$core$Maybe$Nothing,
	pushMd: _elm_lang$core$Maybe$Nothing,
	pushLg: _elm_lang$core$Maybe$Nothing,
	pushXl: _elm_lang$core$Maybe$Nothing,
	alignXs: _elm_lang$core$Maybe$Nothing,
	alignSm: _elm_lang$core$Maybe$Nothing,
	alignMd: _elm_lang$core$Maybe$Nothing,
	alignLg: _elm_lang$core$Maybe$Nothing,
	alignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign = F2(
	function (align, options) {
		var _p17 = align.screenSize;
		switch (_p17.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign = F2(
	function (align, options) {
		var _p18 = align.screenSize;
		switch (_p18.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption = F2(
	function (modifier, options) {
		var _p19 = modifier;
		switch (_p19.ctor) {
			case 'RowAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p19._0)
					});
			case 'RowVAlign':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign, _p19._0, options);
			default:
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign, _p19._0, options);
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign = F2(
	function (align, options) {
		var _p20 = align.screenSize;
		switch (_p20.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush = F2(
	function (push, options) {
		var _p21 = push.screenSize;
		switch (_p21.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXs: _elm_lang$core$Maybe$Just(push)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushSm: _elm_lang$core$Maybe$Just(push)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushMd: _elm_lang$core$Maybe$Just(push)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushLg: _elm_lang$core$Maybe$Just(push)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXl: _elm_lang$core$Maybe$Just(push)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull = F2(
	function (pull, options) {
		var _p22 = pull.screenSize;
		switch (_p22.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXs: _elm_lang$core$Maybe$Just(pull)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullSm: _elm_lang$core$Maybe$Just(pull)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullMd: _elm_lang$core$Maybe$Just(pull)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullLg: _elm_lang$core$Maybe$Just(pull)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXl: _elm_lang$core$Maybe$Just(pull)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset = F2(
	function (offset, options) {
		var _p23 = offset.screenSize;
		switch (_p23.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXs: _elm_lang$core$Maybe$Just(offset)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetSm: _elm_lang$core$Maybe$Just(offset)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetMd: _elm_lang$core$Maybe$Just(offset)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetLg: _elm_lang$core$Maybe$Just(offset)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXl: _elm_lang$core$Maybe$Just(offset)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth = F2(
	function (width, options) {
		var _p24 = width.screenSize;
		switch (_p24.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXs: _elm_lang$core$Maybe$Just(width)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthSm: _elm_lang$core$Maybe$Just(width)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthMd: _elm_lang$core$Maybe$Just(width)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthLg: _elm_lang$core$Maybe$Just(width)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXl: _elm_lang$core$Maybe$Just(width)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption = F2(
	function (modifier, options) {
		var _p25 = modifier;
		switch (_p25.ctor) {
			case 'ColAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p25._0)
					});
			case 'ColWidth':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth, _p25._0, options);
			case 'ColOffset':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset, _p25._0, options);
			case 'ColPull':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull, _p25._0, options);
			case 'ColPush':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush, _p25._0, options);
			default:
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign, _p25._0, options);
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('row'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
				'align-items-',
				{
					ctor: '::',
					_0: options.vAlignXs,
					_1: {
						ctor: '::',
						_0: options.vAlignSm,
						_1: {
							ctor: '::',
							_0: options.vAlignMd,
							_1: {
								ctor: '::',
								_0: options.vAlignLg,
								_1: {
									ctor: '::',
									_0: options.vAlignXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes(
					{
						ctor: '::',
						_0: options.hAlignXs,
						_1: {
							ctor: '::',
							_0: options.hAlignSm,
							_1: {
								ctor: '::',
								_0: options.hAlignMd,
								_1: {
									ctor: '::',
									_0: options.hAlignLg,
									_1: {
										ctor: '::',
										_0: options.hAlignXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width = F2(
	function (a, b) {
		return {screenSize: a, columnCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset = F2(
	function (a, b) {
		return {screenSize: a, offsetCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$HAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return function (y) {
																									return function (z) {
																										return {attributes: a, widthXs: b, widthSm: c, widthMd: d, widthLg: e, widthXl: f, offsetXs: g, offsetSm: h, offsetMd: i, offsetLg: j, offsetXl: k, pullXs: l, pullSm: m, pullMd: n, pullLg: o, pullXl: p, pushXs: q, pushSm: r, pushMd: s, pushLg: t, pushXl: u, alignXs: v, alignSm: w, alignMd: x, alignLg: y, alignXl: z};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {attributes: a, vAlignXs: b, vAlignSm: c, vAlignMd: d, vAlignLg: e, vAlignXl: f, hAlignXs: g, hAlignSm: h, hAlignMd: i, hAlignLg: j, hAlignXl: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs = function (a) {
	return {ctor: 'ColAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign = function (a) {
	return {ctor: 'ColAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush = function (a) {
	return {ctor: 'ColPush', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$push = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull = function (a) {
	return {ctor: 'ColPull', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset = function (a) {
	return {ctor: 'ColOffset', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth = function (a) {
	return {ctor: 'ColWidth', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$width = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs = function (a) {
	return {ctor: 'RowAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign = function (a) {
	return {ctor: 'RowHAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$HAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign = function (a) {
	return {ctor: 'RowVAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL = {ctor: 'XL'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG = {ctor: 'LG'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD = {ctor: 'MD'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM = {ctor: 'SM'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS = {ctor: 'XS'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto = {ctor: 'ColAuto'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12 = {ctor: 'Col12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11 = {ctor: 'Col11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10 = {ctor: 'Col10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9 = {ctor: 'Col9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8 = {ctor: 'Col8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7 = {ctor: 'Col7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6 = {ctor: 'Col6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5 = {ctor: 'Col5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4 = {ctor: 'Col4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3 = {ctor: 'Col3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2 = {ctor: 'Col2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1 = {ctor: 'Col1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col = {ctor: 'Col'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions, modifiers);
	var shouldAddDefaultXs = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: options.widthXs,
					_1: {
						ctor: '::',
						_0: options.widthSm,
						_1: {
							ctor: '::',
							_0: options.widthMd,
							_1: {
								ctor: '::',
								_0: options.widthLg,
								_1: {
									ctor: '::',
									_0: options.widthXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				})),
		0);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes(
			{
				ctor: '::',
				_0: shouldAddDefaultXs ? _elm_lang$core$Maybe$Just(
					A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col)) : options.widthXs,
				_1: {
					ctor: '::',
					_0: options.widthSm,
					_1: {
						ctor: '::',
						_0: options.widthMd,
						_1: {
							ctor: '::',
							_0: options.widthLg,
							_1: {
								ctor: '::',
								_0: options.widthXl,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes(
				{
					ctor: '::',
					_0: options.offsetXs,
					_1: {
						ctor: '::',
						_0: options.offsetSm,
						_1: {
							ctor: '::',
							_0: options.offsetMd,
							_1: {
								ctor: '::',
								_0: options.offsetLg,
								_1: {
									ctor: '::',
									_0: options.offsetXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes(
					{
						ctor: '::',
						_0: options.pullXs,
						_1: {
							ctor: '::',
							_0: options.pullSm,
							_1: {
								ctor: '::',
								_0: options.pullMd,
								_1: {
									ctor: '::',
									_0: options.pullLg,
									_1: {
										ctor: '::',
										_0: options.pullXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes(
						{
							ctor: '::',
							_0: options.pushXs,
							_1: {
								ctor: '::',
								_0: options.pushSm,
								_1: {
									ctor: '::',
									_0: options.pushMd,
									_1: {
										ctor: '::',
										_0: options.pushLg,
										_1: {
											ctor: '::',
											_0: options.pushXl,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
							'align-self-',
							{
								ctor: '::',
								_0: options.alignXs,
								_1: {
									ctor: '::',
									_0: options.alignSm,
									_1: {
										ctor: '::',
										_0: options.alignMd,
										_1: {
											ctor: '::',
											_0: options.alignLg,
											_1: {
												ctor: '::',
												_0: options.alignXl,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						options.attributes)))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11 = {ctor: 'Offset11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10 = {ctor: 'Offset10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9 = {ctor: 'Offset9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8 = {ctor: 'Offset8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7 = {ctor: 'Offset7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6 = {ctor: 'Offset6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5 = {ctor: 'Offset5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4 = {ctor: 'Offset4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3 = {ctor: 'Offset3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2 = {ctor: 'Offset2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1 = {ctor: 'Offset1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0 = {ctor: 'Offset0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12 = {ctor: 'Move12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11 = {ctor: 'Move11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10 = {ctor: 'Move10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9 = {ctor: 'Move9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8 = {ctor: 'Move8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7 = {ctor: 'Move7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6 = {ctor: 'Move6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5 = {ctor: 'Move5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4 = {ctor: 'Move4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3 = {ctor: 'Move3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2 = {ctor: 'Move2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1 = {ctor: 'Move1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0 = {ctor: 'Move0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom = {ctor: 'Bottom'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle = {ctor: 'Middle'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top = {ctor: 'Top'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between = {ctor: 'Between'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around = {ctor: 'Around'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right = {ctor: 'Right'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center = {ctor: 'Center'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left = {ctor: 'Left'};

var _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignDirOption = function (dir) {
	var _p0 = dir;
	switch (_p0.ctor) {
		case 'Center':
			return 'center';
		case 'Left':
			return 'left';
		default:
			return 'right';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignClass = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'text',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'-',
					A2(
						_elm_lang$core$Maybe$map,
						function (s) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								A2(_elm_lang$core$Basics_ops['++'], s, '-'));
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(_p2.size))),
				_rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignDirOption(_p2.dir))));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$HAlign = F2(
	function (a, b) {
		return {dir: a, size: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Right = {ctor: 'Right'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Center = {ctor: 'Center'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Left = {ctor: 'Left'};

var _rundis$elm_bootstrap$Bootstrap_Text$alignXl = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlRight = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLg = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgRight = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMd = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdRight = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSm = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmRight = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXs = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsRight = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);

var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$roleClass = function (role) {
	return _elm_lang$html$Html_Attributes$class(
		function () {
			var _p0 = role;
			switch (_p0.ctor) {
				case 'Success':
					return 'list-group-item-success';
				case 'Info':
					return 'list-group-item-info';
				case 'Warning':
					return 'list-group-item-warning';
				default:
					return 'list-group-item-danger';
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$itemAttributes = function (options) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'list-group-item', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'disabled', _1: options.disabled},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'active', _1: options.active},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'list-group-item-action', _1: options.action},
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					A2(
						_elm_lang$core$Maybe$map,
						function (r) {
							return {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$roleClass(r),
								_1: {ctor: '[]'}
							};
						},
						options.role)),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$preventClick = A2(_elm_lang$html$Html_Attributes$attribute, 'onclick', 'var event = arguments[0] || window.event; event.preventDefault();');
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$applyModifier = F2(
	function (modifier, options) {
		var _p1 = modifier;
		switch (_p1.ctor) {
			case 'Roled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						role: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Action':
				return _elm_lang$core$Native_Utils.update(
					options,
					{action: true});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: true});
			case 'Active':
				return _elm_lang$core$Native_Utils.update(
					options,
					{active: true});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p1._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$defaultOptions = {
	role: _elm_lang$core$Maybe$Nothing,
	active: false,
	disabled: false,
	action: false,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderCustomItem = function (_p2) {
	var _p3 = _p2;
	return A2(
		_p3._0.itemFn,
		_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$itemAttributes(
			A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$defaultOptions, _p3._0.options)),
		_p3._0.children);
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderItem = function (_p4) {
	var _p5 = _p4;
	return A2(
		_p5._0.itemFn,
		_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$itemAttributes(
			A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$defaultOptions, _p5._0.options)),
		_p5._0.children);
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$ItemOptions = F5(
	function (a, b, c, d, e) {
		return {role: a, active: b, disabled: c, action: d, attributes: e};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Action = {ctor: 'Action'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Disabled = {ctor: 'Disabled'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Active = {ctor: 'Active'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Item = function (a) {
	return {ctor: 'Item', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$CustomItem = function (a) {
	return {ctor: 'CustomItem', _0: a};
};

var _rundis$elm_bootstrap$Bootstrap_ListGroup$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_ListGroup$disabled = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Disabled;
var _rundis$elm_bootstrap$Bootstrap_ListGroup$active = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Active;
var _rundis$elm_bootstrap$Bootstrap_ListGroup$danger = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Danger);
var _rundis$elm_bootstrap$Bootstrap_ListGroup$warning = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Warning);
var _rundis$elm_bootstrap$Bootstrap_ListGroup$info = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Info);
var _rundis$elm_bootstrap$Bootstrap_ListGroup$success = _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Success);
var _rundis$elm_bootstrap$Bootstrap_ListGroup$button = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$CustomItem(
			{
				itemFn: _elm_lang$html$Html$button,
				children: children,
				options: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Action,
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						options,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Attrs(
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$type_('button'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						})
				}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_ListGroup$anchor = F2(
	function (options, children) {
		var updOptions = A2(
			_elm_lang$core$List$any,
			F2(
				function (x, y) {
					return _elm_lang$core$Native_Utils.eq(x, y);
				})(_rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Disabled),
			options) ? A2(
			_elm_lang$core$Basics_ops['++'],
			options,
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Attrs(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$preventClick,
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}) : options;
		return _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$CustomItem(
			{
				itemFn: _elm_lang$html$Html$a,
				children: children,
				options: {ctor: '::', _0: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Action, _1: updOptions}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_ListGroup$keyedCustom = function (items) {
	return A3(
		_elm_lang$html$Html_Keyed$node,
		'div',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('list-group'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				return {
					ctor: '_Tuple2',
					_0: _p1._0,
					_1: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderCustomItem(_p1._1)
				};
			},
			items));
};
var _rundis$elm_bootstrap$Bootstrap_ListGroup$custom = function (items) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('list-group'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderCustomItem, items));
};
var _rundis$elm_bootstrap$Bootstrap_ListGroup$li = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$Item(
			{itemFn: _elm_lang$html$Html$li, children: children, options: options});
	});
var _rundis$elm_bootstrap$Bootstrap_ListGroup$keyedUl = function (keyedItems) {
	return A2(
		_elm_lang$html$Html_Keyed$ul,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('list-group'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$List$map,
			function (_p2) {
				var _p3 = _p2;
				return {
					ctor: '_Tuple2',
					_0: _p3._0,
					_1: _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderItem(_p3._1)
				};
			},
			keyedItems));
};
var _rundis$elm_bootstrap$Bootstrap_ListGroup$ul = function (items) {
	return A2(
		_elm_lang$html$Html$ul,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('list-group'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderItem, items));
};

var _rundis$elm_bootstrap$Bootstrap_Internal_Card$toRGBString = function (color) {
	var _p0 = _elm_lang$core$Color$toRgb(color);
	var red = _p0.red;
	var green = _p0.green;
	var blue = _p0.blue;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'RGB(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						',',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							')'))))));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$roleOption = function (role) {
	var _p1 = role;
	switch (_p1.ctor) {
		case 'Primary':
			return 'primary';
		case 'Success':
			return 'success';
		case 'Info':
			return 'info';
		case 'Warning':
			return 'warning';
		default:
			return 'danger';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$applyModifier = F2(
	function (option, options) {
		var _p2 = option;
		switch (_p2.ctor) {
			case 'Aligned':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						aligned: _elm_lang$core$Maybe$Just(_p2._0)
					});
			case 'Coloring':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						coloring: _elm_lang$core$Maybe$Just(_p2._0)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p2._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$defaultOptions = {
	aligned: _elm_lang$core$Maybe$Nothing,
	coloring: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$cardAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_Card$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_Card$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('card'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p3 = options.coloring;
				if (_p3.ctor === 'Just') {
					switch (_p3._0.ctor) {
						case 'Roled':
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'card-inverse card-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Card$roleOption(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						case 'Outlined':
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'card-outline-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Card$roleOption(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						default:
							var _p4 = _p3._0._0;
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('card-inverse'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'background-color',
												_1: _rundis$elm_bootstrap$Bootstrap_Internal_Card$toRGBString(_p4)
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'border-color',
													_1: _rundis$elm_bootstrap$Bootstrap_Internal_Card$toRGBString(_p4)
												},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								}
							};
					}
				} else {
					return {ctor: '[]'};
				}
			}(),
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p5 = options.aligned;
					if (_p5.ctor === 'Just') {
						return {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignClass(_p5._0),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$applyBlockModifier = F2(
	function (option, options) {
		var _p6 = option;
		if (_p6.ctor === 'AlignedBlock') {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					aligned: _elm_lang$core$Maybe$Just(_p6._0)
				});
		} else {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p6._0)
				});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$defaultBlockOptions = {
	aligned: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$blockAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_Card$applyBlockModifier, _rundis$elm_bootstrap$Bootstrap_Internal_Card$defaultBlockOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('card-block'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p7 = options.aligned;
				if (_p7.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignClass(_p7._0),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			options.attributes));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$renderBlock = function (block) {
	var _p8 = block;
	if (_p8.ctor === 'CardBlock') {
		return _p8._0;
	} else {
		return _p8._0;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$renderBlocks = function (blocks) {
	return A2(
		_elm_lang$core$List$map,
		function (block) {
			var _p9 = block;
			if (_p9.ctor === 'CardBlock') {
				return _p9._0;
			} else {
				return _p9._0;
			}
		},
		blocks);
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$CardOptions = F3(
	function (a, b, c) {
		return {aligned: a, coloring: b, attributes: c};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockOptions = F2(
	function (a, b) {
		return {aligned: a, attributes: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring = function (a) {
	return {ctor: 'Coloring', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Aligned = function (a) {
	return {ctor: 'Aligned', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Inverted = function (a) {
	return {ctor: 'Inverted', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined = function (a) {
	return {ctor: 'Outlined', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$Primary = {ctor: 'Primary'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockAttrs = function (a) {
	return {ctor: 'BlockAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$AlignedBlock = function (a) {
	return {ctor: 'AlignedBlock', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$ListGroup = function (a) {
	return {ctor: 'ListGroup', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$listGroup = function (items) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$ListGroup(
		A2(
			_elm_lang$html$Html$ul,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('list-group list-group-flush'),
				_1: {ctor: '[]'}
			},
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Internal_ListGroup$renderItem, items)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$CardBlock = function (a) {
	return {ctor: 'CardBlock', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$block = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_Card$CardBlock(
			A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_Internal_Card$blockAttributes(options),
				A2(
					_elm_lang$core$List$map,
					function (_p10) {
						var _p11 = _p10;
						return _p11._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem = function (a) {
	return {ctor: 'BlockItem', _0: a};
};

var _rundis$elm_bootstrap$Bootstrap_Card$title = F3(
	function (elemFn, attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem(
			A2(
				elemFn,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('card-title'),
					_1: attributes
				},
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$titleH6 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h6);
var _rundis$elm_bootstrap$Bootstrap_Card$titleH5 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h5);
var _rundis$elm_bootstrap$Bootstrap_Card$titleH4 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h4);
var _rundis$elm_bootstrap$Bootstrap_Card$titleH3 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h3);
var _rundis$elm_bootstrap$Bootstrap_Card$titleH2 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h2);
var _rundis$elm_bootstrap$Bootstrap_Card$titleH1 = _rundis$elm_bootstrap$Bootstrap_Card$title(_elm_lang$html$Html$h1);
var _rundis$elm_bootstrap$Bootstrap_Card$blockQuote = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem(
			A2(
				_elm_lang$html$Html$blockquote,
				A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('card-blockquote'),
						_1: {ctor: '[]'}
					},
					attributes),
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$custom = function (element) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem(element);
};
var _rundis$elm_bootstrap$Bootstrap_Card$text = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem(
			A2(
				_elm_lang$html$Html$p,
				A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('card-text'),
						_1: {ctor: '[]'}
					},
					attributes),
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$link = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockItem(
			A2(
				_elm_lang$html$Html$a,
				A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('card-link'),
						_1: {ctor: '[]'}
					},
					attributes),
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$blockAttrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$BlockAttrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Card$blockAlign = function (align) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$AlignedBlock(align);
};
var _rundis$elm_bootstrap$Bootstrap_Card$view = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$html$Html$div,
		_rundis$elm_bootstrap$Bootstrap_Internal_Card$cardAttributes(_p1._0.options),
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Maybe$map,
						function (_p2) {
							var _p3 = _p2;
							return _p3._0;
						},
						_p1._0.header),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Maybe$map,
							function (_p4) {
								var _p5 = _p4;
								return _p5._0;
							},
							_p1._0.imgTop),
						_1: {ctor: '[]'}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Internal_Card$renderBlocks(_p1._0.blocks),
				A2(
					_elm_lang$core$List$filterMap,
					_elm_lang$core$Basics$identity,
					{
						ctor: '::',
						_0: A2(
							_elm_lang$core$Maybe$map,
							function (_p6) {
								var _p7 = _p6;
								return _p7._0;
							},
							_p1._0.footer),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Maybe$map,
								function (_p8) {
									var _p9 = _p8;
									return _p9._0;
								},
								_p1._0.imgBottom),
							_1: {ctor: '[]'}
						}
					}))));
};
var _rundis$elm_bootstrap$Bootstrap_Card$group = function (cards) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('card-group'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Card$view, cards));
};
var _rundis$elm_bootstrap$Bootstrap_Card$deck = function (cards) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('card-deck'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Card$view, cards));
};
var _rundis$elm_bootstrap$Bootstrap_Card$columns = function (cards) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('card-columns'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Card$view, cards));
};
var _rundis$elm_bootstrap$Bootstrap_Card$keyedMulti = F2(
	function (clazz, keyedCards) {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'div',
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(clazz),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				function (_p10) {
					var _p11 = _p10;
					return {
						ctor: '_Tuple2',
						_0: _p11._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Card$view(_p11._1)
					};
				},
				keyedCards));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$keyedGroup = _rundis$elm_bootstrap$Bootstrap_Card$keyedMulti('card-group');
var _rundis$elm_bootstrap$Bootstrap_Card$keyedDeck = _rundis$elm_bootstrap$Bootstrap_Card$keyedMulti('card-deck');
var _rundis$elm_bootstrap$Bootstrap_Card$keyedColumns = _rundis$elm_bootstrap$Bootstrap_Card$keyedMulti('card-columns');
var _rundis$elm_bootstrap$Bootstrap_Card$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Card$inverted = function (color) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
		_rundis$elm_bootstrap$Bootstrap_Internal_Card$Inverted(color));
};
var _rundis$elm_bootstrap$Bootstrap_Card$outlineDanger = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Danger));
var _rundis$elm_bootstrap$Bootstrap_Card$outlineWarning = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Warning));
var _rundis$elm_bootstrap$Bootstrap_Card$outlineInfo = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Info));
var _rundis$elm_bootstrap$Bootstrap_Card$outlineSuccess = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Success));
var _rundis$elm_bootstrap$Bootstrap_Card$outlinePrimary = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Primary));
var _rundis$elm_bootstrap$Bootstrap_Card$danger = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Danger));
var _rundis$elm_bootstrap$Bootstrap_Card$warning = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Warning));
var _rundis$elm_bootstrap$Bootstrap_Card$info = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Info));
var _rundis$elm_bootstrap$Bootstrap_Card$success = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Success));
var _rundis$elm_bootstrap$Bootstrap_Card$primary = _rundis$elm_bootstrap$Bootstrap_Internal_Card$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Card$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Card$Primary));
var _rundis$elm_bootstrap$Bootstrap_Card$align = function (align) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Card$Aligned(align);
};
var _rundis$elm_bootstrap$Bootstrap_Card$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Card$config = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Card$Config(
		{
			options: options,
			header: _elm_lang$core$Maybe$Nothing,
			footer: _elm_lang$core$Maybe$Nothing,
			imgTop: _elm_lang$core$Maybe$Nothing,
			imgBottom: _elm_lang$core$Maybe$Nothing,
			blocks: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Card$block = F3(
	function (options, items, _p12) {
		var _p13 = _p12;
		var _p14 = _p13._0;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p14,
				{
					blocks: A2(
						_elm_lang$core$Basics_ops['++'],
						_p14.blocks,
						{
							ctor: '::',
							_0: A2(_rundis$elm_bootstrap$Bootstrap_Internal_Card$block, options, items),
							_1: {ctor: '[]'}
						})
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$listGroup = F2(
	function (items, _p15) {
		var _p16 = _p15;
		var _p17 = _p16._0;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p17,
				{
					blocks: A2(
						_elm_lang$core$Basics_ops['++'],
						_p17.blocks,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Internal_Card$listGroup(items),
							_1: {ctor: '[]'}
						})
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$CardHeader = function (a) {
	return {ctor: 'CardHeader', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate = F4(
	function (elemFn, attributes, children, _p18) {
		var _p19 = _p18;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p19._0,
				{
					header: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Card$CardHeader(
							A2(
								elemFn,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('card-header'),
									_1: attributes
								},
								children)))
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$header = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$div);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH1 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h1);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH2 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h2);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH3 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h3);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH4 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h4);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH5 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h5);
var _rundis$elm_bootstrap$Bootstrap_Card$headerH6 = _rundis$elm_bootstrap$Bootstrap_Card$headerPrivate(_elm_lang$html$Html$h6);
var _rundis$elm_bootstrap$Bootstrap_Card$CardFooter = function (a) {
	return {ctor: 'CardFooter', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Card$footer = F3(
	function (attributes, children, _p20) {
		var _p21 = _p20;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p21._0,
				{
					footer: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Card$CardFooter(
							A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('card-footer'),
									_1: attributes
								},
								children)))
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$CardImageTop = function (a) {
	return {ctor: 'CardImageTop', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Card$imgTop = F3(
	function (attributes, children, _p22) {
		var _p23 = _p22;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p23._0,
				{
					imgTop: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Card$CardImageTop(
							A2(
								_elm_lang$html$Html$img,
								A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('card-img-top'),
										_1: {ctor: '[]'}
									},
									attributes),
								children)))
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Card$CardImageBottom = function (a) {
	return {ctor: 'CardImageBottom', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Card$imgBottom = F3(
	function (attributes, children, _p24) {
		var _p25 = _p24;
		return _rundis$elm_bootstrap$Bootstrap_Card$Config(
			_elm_lang$core$Native_Utils.update(
				_p25._0,
				{
					imgBottom: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Card$CardImageBottom(
							A2(
								_elm_lang$html$Html$img,
								A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('card-img-bottom'),
										_1: {ctor: '[]'}
									},
									attributes),
								children)))
				}));
	});

var _rundis$elm_bootstrap$Bootstrap_Alert$roleClass = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Success':
			return 'alert-success';
		case 'Info':
			return 'alert-info';
		case 'Warning':
			return 'alert-warning';
		default:
			return 'alert-danger';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Alert$heading = F3(
	function (elemFn, attributes, children) {
		return A2(
			elemFn,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('alert-header'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h6 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h6, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h5 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h5, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h4 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h4, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h3 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h3, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h2 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h2, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$h1 = F2(
	function (attributes, children) {
		return A3(_rundis$elm_bootstrap$Bootstrap_Alert$heading, _elm_lang$html$Html$h1, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$link = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('alert-link'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$alertCustom = F2(
	function (role, children) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'alert ',
						_rundis$elm_bootstrap$Bootstrap_Alert$roleClass(role))),
				_1: {ctor: '[]'}
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Alert$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Alert$danger = function (children) {
	return A2(_rundis$elm_bootstrap$Bootstrap_Alert$alertCustom, _rundis$elm_bootstrap$Bootstrap_Alert$Danger, children);
};
var _rundis$elm_bootstrap$Bootstrap_Alert$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Alert$warning = function (children) {
	return A2(_rundis$elm_bootstrap$Bootstrap_Alert$alertCustom, _rundis$elm_bootstrap$Bootstrap_Alert$Warning, children);
};
var _rundis$elm_bootstrap$Bootstrap_Alert$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Alert$info = function (children) {
	return A2(_rundis$elm_bootstrap$Bootstrap_Alert$alertCustom, _rundis$elm_bootstrap$Bootstrap_Alert$Info, children);
};
var _rundis$elm_bootstrap$Bootstrap_Alert$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Alert$success = function (children) {
	return A2(_rundis$elm_bootstrap$Bootstrap_Alert$alertCustom, _rundis$elm_bootstrap$Bootstrap_Alert$Success, children);
};

var _rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Primary':
			return 'primary';
		case 'Secondary':
			return 'secondary';
		case 'Success':
			return 'success';
		case 'Info':
			return 'info';
		case 'Warning':
			return 'warning';
		case 'Danger':
			return 'danger';
		default:
			return 'link';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier = F2(
	function (modifier, options) {
		var _p1 = modifier;
		switch (_p1.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Coloring':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						coloring: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Block':
				return _elm_lang$core$Native_Utils.update(
					options,
					{block: true});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: _p1._0});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p1._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions = {
	coloring: _elm_lang$core$Maybe$Nothing,
	block: false,
	disabled: false,
	size: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'btn-block', _1: options.block},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'disabled', _1: options.disabled},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p2 = A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption, options.size);
				if (_p2.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$Basics_ops['++'], 'btn-', _p2._0)),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p3 = options.coloring;
					if (_p3.ctor === 'Just') {
						if (_p3._0.ctor === 'Roled') {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						} else {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-outline-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						}
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Options = F5(
	function (a, b, c, d, e) {
		return {coloring: a, block: b, disabled: c, size: d, attributes: e};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled = function (a) {
	return {ctor: 'Disabled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block = {ctor: 'Block'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring = function (a) {
	return {ctor: 'Coloring', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined = function (a) {
	return {ctor: 'Outlined', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Link = {ctor: 'Link'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary = {ctor: 'Secondary'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary = {ctor: 'Primary'};

var _rundis$elm_bootstrap$Bootstrap_Button$disabled = function (disabled) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled(disabled);
};
var _rundis$elm_bootstrap$Bootstrap_Button$block = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block;
var _rundis$elm_bootstrap$Bootstrap_Button$outlineDanger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineWarning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineInfo = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSuccess = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSecondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$outlinePrimary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$roleLink = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Link));
var _rundis$elm_bootstrap$Bootstrap_Button$danger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$warning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$info = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$success = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$secondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$primary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$large = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_Button$small = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_Button$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Button$onClick = function (message) {
	var defaultOptions = _elm_lang$html$Html_Events$defaultOptions;
	return _rundis$elm_bootstrap$Bootstrap_Button$attrs(
		{
			ctor: '::',
			_0: A3(
				_elm_lang$html$Html_Events$onWithOptions,
				'click',
				_elm_lang$core$Native_Utils.update(
					defaultOptions,
					{preventDefault: true}),
				_elm_lang$core$Json_Decode$succeed(message)),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Button$checkboxButton = F3(
	function (checked, options, children) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$radioButton = F3(
	function (checked, options, children) {
		var hideRadio = A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'button');
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: hideRadio,
					_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$linkButton = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'button'),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Button$button = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$button,
			_rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options),
			children);
	});

var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString = function (validation) {
	var _p0 = validation;
	switch (_p0.ctor) {
		case 'Success':
			return 'success';
		case 'Warning':
			return 'warning';
		default:
			return 'danger';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute = function (validation) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'has-',
			_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString(validation)));
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success = {ctor: 'Success'};

var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xlAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lgAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$mdAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$smAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xsAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Form$renderCol = function (_p0) {
	var _p1 = _p0;
	return A2(
		_p1._0.elemFn,
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p1._0.options),
		_p1._0.children);
};
var _rundis$elm_bootstrap$Bootstrap_Form$rowValidation = function (validation) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute(validation),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$rowDanger = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);
var _rundis$elm_bootstrap$Bootstrap_Form$rowWarning = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning);
var _rundis$elm_bootstrap$Bootstrap_Form$rowSuccess = _rundis$elm_bootstrap$Bootstrap_Form$rowValidation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form$row = F2(
	function (options, cols) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-group'),
				_1: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options)
			},
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Form$renderCol, cols));
	});
var _rundis$elm_bootstrap$Bootstrap_Form$applyModifier = F2(
	function (modifier, options) {
		var _p2 = modifier;
		if (_p2.ctor === 'Validation') {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					validation: _elm_lang$core$Maybe$Just(_p2._0)
				});
		} else {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p2._0)
				});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Form$defaultOptions = {
	validation: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Form$toAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Form$applyModifier, _rundis$elm_bootstrap$Bootstrap_Form$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-group'),
			_1: {ctor: '[]'}
		},
		function () {
			var _p3 = options.validation;
			if (_p3.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute(_p3._0),
					_1: {ctor: '[]'}
				};
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					{ctor: '[]'},
					options.attributes);
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Form$validationText = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-control-feedback'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$helpInline = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$small,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('text-muted'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$help = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$small,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-text text-muted'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$label = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('form-control-label'),
				_1: attributes
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$group = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$div,
			_rundis$elm_bootstrap$Bootstrap_Form$toAttributes(options),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$form = F2(
	function (attributes, children) {
		return A2(_elm_lang$html$Html$form, attributes, children);
	});
var _rundis$elm_bootstrap$Bootstrap_Form$formInline = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Form$form(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-inline'),
			_1: attributes
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$Options = F2(
	function (a, b) {
		return {validation: a, attributes: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Form$Col = function (a) {
	return {ctor: 'Col', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$col = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form$Col(
			{elemFn: _elm_lang$html$Html$div, options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Form$colLabel = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form$Col(
			{
				elemFn: _elm_lang$html$Html$label,
				options: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('col-form-label'),
							_1: {ctor: '[]'}
						}),
					_1: options
				},
				children: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Form$colLabelSm = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form$colLabel(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('col-form-label-sm'),
					_1: {ctor: '[]'}
				}),
			_1: options
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$colLabelLg = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form$colLabel(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('col-form-label-lg'),
					_1: {ctor: '[]'}
				}),
			_1: options
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$Validation = function (a) {
	return {ctor: 'Validation', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form$groupSuccess = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form$groupWarning = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning);
var _rundis$elm_bootstrap$Bootstrap_Form$groupDanger = _rundis$elm_bootstrap$Bootstrap_Form$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);

var _rundis$elm_bootstrap$Bootstrap_Form_Input$validationAttribute = function (validation) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'form-control-',
			_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString(validation)));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$typeAttribute = function (inputType) {
	return _elm_lang$html$Html_Attributes$type_(
		function () {
			var _p0 = inputType;
			switch (_p0.ctor) {
				case 'Text':
					return 'text';
				case 'Password':
					return 'password';
				case 'DatetimeLocal':
					return 'datetime-local';
				case 'Date':
					return 'date';
				case 'Month':
					return 'month';
				case 'Time':
					return 'time';
				case 'Week':
					return 'week';
				case 'Number':
					return 'number';
				case 'Email':
					return 'email';
				case 'Url':
					return 'url';
				case 'Search':
					return 'search';
				case 'Tel':
					return 'tel';
				default:
					return 'color';
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$sizeAttribute = function (size) {
	return A2(
		_elm_lang$core$Maybe$map,
		function (s) {
			return _elm_lang$html$Html_Attributes$class(
				A2(_elm_lang$core$Basics_ops['++'], 'form-control-', s));
		},
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(size));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$applyModifier = F2(
	function (modifier, options) {
		var _p1 = modifier;
		switch (_p1.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Id':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						id: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Type':
				return _elm_lang$core$Native_Utils.update(
					options,
					{tipe: _p1._0});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: _p1._0});
			case 'Value':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						value: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'DefaultValue':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						defaultValue: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Placeholder':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						placeholder: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'OnInput':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						onInput: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Validation':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						validation: _elm_lang$core$Maybe$Just(_p1._0)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p1._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Options = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {tipe: a, id: b, size: c, disabled: d, value: e, defaultValue: f, placeholder: g, onInput: h, validation: i, attributes: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Placeholder = function (a) {
	return {ctor: 'Placeholder', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$placeholder = function (value) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$Placeholder(value);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Validation = function (a) {
	return {ctor: 'Validation', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$success = _rundis$elm_bootstrap$Bootstrap_Form_Input$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$warning = _rundis$elm_bootstrap$Bootstrap_Form_Input$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Warning);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$danger = _rundis$elm_bootstrap$Bootstrap_Form_Input$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$OnInput = function (a) {
	return {ctor: 'OnInput', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput = function (toMsg) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$OnInput(toMsg);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$DefaultValue = function (a) {
	return {ctor: 'DefaultValue', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$defaultValue = function (value) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$DefaultValue(value);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Value = function (a) {
	return {ctor: 'Value', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$value = function (value) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$Value(value);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Disabled = function (a) {
	return {ctor: 'Disabled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$disabled = function (disabled) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$Disabled(disabled);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Type = function (a) {
	return {ctor: 'Type', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$create = F2(
	function (tipe, options) {
		return _rundis$elm_bootstrap$Bootstrap_Form_Input$Input(
			{
				options: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$Type(tipe),
					_1: options
				}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Id = function (a) {
	return {ctor: 'Id', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$id = function (id) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Input$Id(id);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$small = _rundis$elm_bootstrap$Bootstrap_Form_Input$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$large = _rundis$elm_bootstrap$Bootstrap_Form_Input$Size(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Color = {ctor: 'Color'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Tel = {ctor: 'Tel'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Search = {ctor: 'Search'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Url = {ctor: 'Url'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Email = {ctor: 'Email'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Number = {ctor: 'Number'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Week = {ctor: 'Week'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Time = {ctor: 'Time'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Month = {ctor: 'Month'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Date = {ctor: 'Date'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$DatetimeLocal = {ctor: 'DatetimeLocal'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Password = {ctor: 'Password'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$Text = {ctor: 'Text'};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$defaultOptions = {
	tipe: _rundis$elm_bootstrap$Bootstrap_Form_Input$Text,
	id: _elm_lang$core$Maybe$Nothing,
	size: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	value: _elm_lang$core$Maybe$Nothing,
	defaultValue: _elm_lang$core$Maybe$Nothing,
	placeholder: _elm_lang$core$Maybe$Nothing,
	onInput: _elm_lang$core$Maybe$Nothing,
	validation: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$toAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Form_Input$applyModifier, _rundis$elm_bootstrap$Bootstrap_Form_Input$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-control'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$typeAttribute(options.tipe),
					_1: {ctor: '[]'}
				}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$id, options.id),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_Form_Input$sizeAttribute, options.size),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$value, options.value),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$defaultValue, options.defaultValue),
								_1: {
									ctor: '::',
									_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$placeholder, options.placeholder),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Events$onInput, options.onInput),
										_1: {
											ctor: '::',
											_0: A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Form_Input$validationAttribute, options.validation),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}),
			options.attributes));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$view = function (_p2) {
	var _p3 = _p2;
	return A2(
		_elm_lang$html$Html$input,
		_rundis$elm_bootstrap$Bootstrap_Form_Input$toAttributes(_p3._0.options),
		{ctor: '[]'});
};
var _rundis$elm_bootstrap$Bootstrap_Form_Input$input = F2(
	function (tipe, options) {
		return _rundis$elm_bootstrap$Bootstrap_Form_Input$view(
			A2(_rundis$elm_bootstrap$Bootstrap_Form_Input$create, tipe, options));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Input$text = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Text);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$password = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Password);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$datetimeLocal = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$DatetimeLocal);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$date = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Date);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$month = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Month);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$time = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Time);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$week = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Week);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$number = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Number);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$email = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Email);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$url = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Url);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$search = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Search);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$tel = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Tel);
var _rundis$elm_bootstrap$Bootstrap_Form_Input$color = _rundis$elm_bootstrap$Bootstrap_Form_Input$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$Color);

var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$sizeAttribute = function (size) {
	return A2(
		_elm_lang$core$Maybe$map,
		function (s) {
			return _elm_lang$html$Html_Attributes$class(
				A2(_elm_lang$core$Basics_ops['++'], 'input-group-', s));
		},
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(size));
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$view = function (_p0) {
	var _p1 = _p0;
	var _p7 = _p1._0;
	var _p2 = _p7.input;
	var input = _p2._0;
	return A2(
		_elm_lang$html$Html$div,
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('input-group'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$filterMap,
					_elm_lang$core$Basics$identity,
					{
						ctor: '::',
						_0: A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$sizeAttribute, _p7.size),
						_1: {ctor: '[]'}
					}),
				_p7.attributes)),
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$map,
				function (_p3) {
					var _p4 = _p3;
					return _p4._0;
				},
				_p7.predecessors),
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: input,
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$List$map,
					function (_p5) {
						var _p6 = _p5;
						return _p6._0;
					},
					_p7.successors))));
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$config = function (input) {
	return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
		{
			input: input,
			predecessors: {ctor: '[]'},
			successors: {ctor: '[]'},
			size: _elm_lang$core$Maybe$Nothing,
			attributes: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$predecessors = F2(
	function (addons, _p8) {
		var _p9 = _p8;
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
			_elm_lang$core$Native_Utils.update(
				_p9._0,
				{predecessors: addons}));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$successors = F2(
	function (addons, _p10) {
		var _p11 = _p10;
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
			_elm_lang$core$Native_Utils.update(
				_p11._0,
				{successors: addons}));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$large = function (_p12) {
	var _p13 = _p12;
	return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
		_elm_lang$core$Native_Utils.update(
			_p13._0,
			{
				size: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG)
			}));
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$small = function (_p14) {
	var _p15 = _p14;
	return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
		_elm_lang$core$Native_Utils.update(
			_p15._0,
			{
				size: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM)
			}));
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$attrs = F2(
	function (attributes, _p16) {
		var _p17 = _p16;
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Config(
			_elm_lang$core$Native_Utils.update(
				_p17._0,
				{attributes: attributes}));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input = F2(
	function (inputFn, options) {
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Input(
			inputFn(options));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$text = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$text);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$password = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$password);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$datetimeLocal = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$datetimeLocal);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$date = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$date);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$month = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$month);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$time = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$time);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$week = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$week);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$number = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$number);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$email = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$email);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$url = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$url);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$search = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$search);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$tel = _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$input(_rundis$elm_bootstrap$Bootstrap_Form_Input$tel);
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Addon = function (a) {
	return {ctor: 'Addon', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$span = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Addon(
			A2(
				_elm_lang$html$Html$span,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('input-group-addon'),
					_1: attributes
				},
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$button = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$Addon(
			A2(
				_elm_lang$html$Html$span,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('input-group-btn'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(_rundis$elm_bootstrap$Bootstrap_Button$button, options, children),
					_1: {ctor: '[]'}
				}));
	});

var _rundis$elm_bootstrap$Bootstrap_Grid$renderCol = function (column) {
	var _p0 = column;
	switch (_p0.ctor) {
		case 'Column':
			return A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
		case 'ColBreak':
			return _p0._0;
		default:
			return A3(
				_elm_lang$html$Html_Keyed$node,
				'div',
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedRow = F2(
	function (options, keyedCols) {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'div',
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(
				_elm_lang$core$List$map,
				function (_p1) {
					var _p2 = _p1;
					return {
						ctor: '_Tuple2',
						_0: _p2._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Grid$renderCol(_p2._1)
					};
				},
				keyedCols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$row = F2(
	function (options, cols) {
		return A2(
			_elm_lang$html$Html$div,
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Grid$renderCol, cols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$simpleRow = function (cols) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$row,
		{ctor: '[]'},
		cols);
};
var _rundis$elm_bootstrap$Bootstrap_Grid$containerFluid = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container-fluid'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$container = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn = function (a) {
	return {ctor: 'KeyedColumn', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedCol = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn(
			{options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak = function (a) {
	return {ctor: 'ColBreak', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$colBreak = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak(
		A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('w-100'),
					_1: {ctor: '[]'}
				},
				attributes),
			{ctor: '[]'}));
};
var _rundis$elm_bootstrap$Bootstrap_Grid$Column = function (a) {
	return {ctor: 'Column', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$col = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$Column(
			{options: options, children: children});
	});

var _rundis$elm_bootstrap$Bootstrap_Navbar$toRGBString = function (color) {
	var _p0 = _elm_lang$core$Color$toRgb(color);
	var red = _p0.red;
	var green = _p0.green;
	var blue = _p0.blue;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'RGB(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						',',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							')'))))));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$backgroundColorOption = function (bgClass) {
	var _p1 = bgClass;
	switch (_p1.ctor) {
		case 'Faded':
			return _elm_lang$html$Html_Attributes$class('bg-faded');
		case 'Primary':
			return _elm_lang$html$Html_Attributes$class('bg-primary');
		case 'Success':
			return _elm_lang$html$Html_Attributes$class('bg-success');
		case 'Info':
			return _elm_lang$html$Html_Attributes$class('bg-info');
		case 'Warning':
			return _elm_lang$html$Html_Attributes$class('bg-warning');
		case 'Danger':
			return _elm_lang$html$Html_Attributes$class('bg-danger');
		case 'Inverse':
			return _elm_lang$html$Html_Attributes$class('bg-inverse');
		case 'Custom':
			return _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'background-color',
						_1: _rundis$elm_bootstrap$Bootstrap_Navbar$toRGBString(_p1._0)
					},
					_1: {ctor: '[]'}
				});
		default:
			return _elm_lang$html$Html_Attributes$class(_p1._0);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$linkModifierClass = function (modifier) {
	return _elm_lang$html$Html_Attributes$class(
		function () {
			var _p2 = modifier;
			if (_p2.ctor === 'Dark') {
				return 'navbar-inverse';
			} else {
				return 'navbar-light';
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$schemeAttributes = function (_p3) {
	var _p4 = _p3;
	return {
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Navbar$linkModifierClass(_p4.modifier),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Navbar$backgroundColorOption(_p4.bgColor),
			_1: {ctor: '[]'}
		}
	};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$fixOption = function (fix) {
	var _p5 = fix;
	if (_p5.ctor === 'Top') {
		return 'fixed-top';
	} else {
		return 'fixed-bottom';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$navbarAttributes = function (options) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'navbar', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'container', _1: options.isContainer},
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'navbar-toggleable',
						A2(
							_elm_lang$core$Maybe$withDefault,
							'',
							A2(
								_elm_lang$core$Maybe$map,
								function (s) {
									return A2(_elm_lang$core$Basics_ops['++'], '-', s);
								},
								_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeOption(options.toggleAt))))),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p6 = options.scheme;
				if (_p6.ctor === 'Just') {
					return _rundis$elm_bootstrap$Bootstrap_Navbar$schemeAttributes(_p6._0);
				} else {
					return {ctor: '[]'};
				}
			}(),
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p7 = options.fix;
					if (_p7.ctor === 'Just') {
						return {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class(
								_rundis$elm_bootstrap$Bootstrap_Navbar$fixOption(_p7._0)),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$renderCustom = function (items) {
	return A2(
		_elm_lang$core$List$map,
		function (_p8) {
			var _p9 = _p8;
			return _p9._0;
		},
		items);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$renderItemLink = function (_p10) {
	var _p11 = _p10;
	return A2(
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('nav-item'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$a,
				A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('nav-link'),
						_1: {ctor: '[]'}
					},
					_p11.attributes),
				_p11.children),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$maybeBrand = function (brand) {
	var _p12 = brand;
	if (_p12.ctor === 'Just') {
		return {
			ctor: '::',
			_0: _p12._0._0,
			_1: {ctor: '[]'}
		};
	} else {
		return {ctor: '[]'};
	}
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$transitionStyle = function (maybeHeight) {
	var pixelHeight = A2(
		_elm_lang$core$Maybe$withDefault,
		'0',
		A2(
			_elm_lang$core$Maybe$map,
			function (v) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(v),
					'px');
			},
			maybeHeight));
	return _elm_lang$html$Html_Attributes$style(
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'position', _1: 'relative'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'height', _1: pixelHeight},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: '-webkit-transition-timing-function', _1: 'ease'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: '-o-transition-timing-function', _1: 'ease'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'transition-timing-function', _1: 'ease'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: '-webkit-transition-duration', _1: '0.35s'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: '-o-transition-duration', _1: '0.35s'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'transition-duration', _1: '0.35s'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: '-webkit-transition-property', _1: 'height'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: '-o-transition-property', _1: 'height'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'transition-property', _1: 'height'},
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$toScreenSize = function (_p13) {
	var _p14 = _p13;
	var _p15 = _p14.width;
	return (_elm_lang$core$Native_Utils.cmp(_p15, 576) < 1) ? _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS : ((_elm_lang$core$Native_Utils.cmp(_p15, 768) < 1) ? _rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM : ((_elm_lang$core$Native_Utils.cmp(_p15, 992) < 1) ? _rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD : ((_elm_lang$core$Native_Utils.cmp(_p15, 1200) < 1) ? _rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG : _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL)));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$sizeToComparable = function (size) {
	var _p16 = size;
	switch (_p16.ctor) {
		case 'XS':
			return 1;
		case 'SM':
			return 2;
		case 'MD':
			return 3;
		case 'LG':
			return 4;
		default:
			return 5;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$shouldHideMenu = F2(
	function (_p18, _p17) {
		var _p19 = _p18;
		var _p20 = _p17;
		var winMedia = function () {
			var _p21 = _p19._0.windowSize;
			if (_p21.ctor === 'Just') {
				return _rundis$elm_bootstrap$Bootstrap_Navbar$toScreenSize(_p21._0);
			} else {
				return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS;
			}
		}();
		return _elm_lang$core$Native_Utils.cmp(
			_rundis$elm_bootstrap$Bootstrap_Navbar$sizeToComparable(winMedia),
			_rundis$elm_bootstrap$Bootstrap_Navbar$sizeToComparable(_p20._0.options.toggleAt)) > 0;
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$menuWrapperAttributes = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p30 = _p24;
		var _p25 = _p22;
		var _p29 = _p25._0.withAnimation;
		var _p28 = _p25;
		var display = function () {
			var _p26 = _p24._0.height;
			if (_p26.ctor === 'Nothing') {
				return ((!_p29) || A2(_rundis$elm_bootstrap$Bootstrap_Navbar$shouldHideMenu, _p30, _p28)) ? 'flex' : 'block';
			} else {
				return 'flex';
			}
		}();
		var styleBlock = {
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		};
		var _p27 = _p24._0.visibility;
		switch (_p27.ctor) {
			case 'Hidden':
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'display', _1: display},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				};
			case 'StartDown':
				return styleBlock;
			case 'AnimatingDown':
				return styleBlock;
			case 'AnimatingUp':
				return styleBlock;
			case 'StartUp':
				return styleBlock;
			default:
				return ((!_p29) || A2(_rundis$elm_bootstrap$Bootstrap_Navbar$shouldHideMenu, _p30, _p28)) ? {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('collapse navbar-collapse show'),
					_1: {ctor: '[]'}
				} : {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$heightDecoder = function () {
	var resToDec = function (res) {
		var _p31 = res;
		if (_p31.ctor === 'Ok') {
			return _elm_lang$core$Json_Decode$succeed(_p31._0);
		} else {
			return _elm_lang$core$Json_Decode$fail(_p31._0);
		}
	};
	var fromNavDec = _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'childNodes',
					_1: {
						ctor: '::',
						_0: '2',
						_1: {
							ctor: '::',
							_0: 'childNodes',
							_1: {
								ctor: '::',
								_0: '0',
								_1: {
									ctor: '::',
									_0: 'offsetHeight',
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				_elm_lang$core$Json_Decode$float),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'childNodes',
						_1: {
							ctor: '::',
							_0: '1',
							_1: {
								ctor: '::',
								_0: 'childNodes',
								_1: {
									ctor: '::',
									_0: '0',
									_1: {
										ctor: '::',
										_0: 'offsetHeight',
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					_elm_lang$core$Json_Decode$float),
				_1: {ctor: '[]'}
			}
		});
	var fromButtonDec = _debois$elm_dom$DOM$parentElement(fromNavDec);
	var tagDecoder = A3(
		_elm_lang$core$Json_Decode$map2,
		F2(
			function (tag, val) {
				return {ctor: '_Tuple2', _0: tag, _1: val};
			}),
		A2(_elm_lang$core$Json_Decode$field, 'tagName', _elm_lang$core$Json_Decode$string),
		_elm_lang$core$Json_Decode$value);
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (_p32) {
			var _p33 = _p32;
			var _p35 = _p33._1;
			var _p34 = _p33._0;
			switch (_p34) {
				case 'NAV':
					return resToDec(
						A2(_elm_lang$core$Json_Decode$decodeValue, fromNavDec, _p35));
				case 'BUTTON':
					return resToDec(
						A2(_elm_lang$core$Json_Decode$decodeValue, fromButtonDec, _p35));
				default:
					return _elm_lang$core$Json_Decode$succeed(0);
			}
		},
		_debois$elm_dom$DOM$target(
			_debois$elm_dom$DOM$parentElement(tagDecoder)));
}();
var _rundis$elm_bootstrap$Bootstrap_Navbar$VisibilityState = F4(
	function (a, b, c, d) {
		return {visibility: a, height: b, windowSize: c, dropdowns: d};
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$ConfigRec = F6(
	function (a, b, c, d, e, f) {
		return {options: a, toMsg: b, withAnimation: c, brand: d, items: e, customItems: f};
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Options = F5(
	function (a, b, c, d, e) {
		return {fix: a, isContainer: b, scheme: c, toggleAt: d, attributes: e};
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Scheme = F2(
	function (a, b) {
		return {modifier: a, bgColor: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$State = function (a) {
	return {ctor: 'State', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$mapState = F2(
	function (mapper, _p36) {
		var _p37 = _p36;
		return _rundis$elm_bootstrap$Bootstrap_Navbar$State(
			mapper(_p37._0));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$initWindowSize = F2(
	function (toMsg, state) {
		return A2(
			_elm_lang$core$Task$perform,
			function (size) {
				return toMsg(
					A2(
						_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
						function (s) {
							return _elm_lang$core$Native_Utils.update(
								s,
								{
									windowSize: _elm_lang$core$Maybe$Just(size)
								});
						},
						state));
			},
			_elm_lang$window$Window$size);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Shown = {ctor: 'Shown'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingUp = {ctor: 'AnimatingUp'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$StartUp = {ctor: 'StartUp'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingDown = {ctor: 'AnimatingDown'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$StartDown = {ctor: 'StartDown'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Hidden = {ctor: 'Hidden'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$initialState = function (toMsg) {
	var state = _rundis$elm_bootstrap$Bootstrap_Navbar$State(
		{visibility: _rundis$elm_bootstrap$Bootstrap_Navbar$Hidden, height: _elm_lang$core$Maybe$Nothing, windowSize: _elm_lang$core$Maybe$Nothing, dropdowns: _elm_lang$core$Dict$empty});
	return {
		ctor: '_Tuple2',
		_0: state,
		_1: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$initWindowSize, toMsg, state)
	};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$visibilityTransition = F2(
	function (withAnimation, visibility) {
		var _p38 = {ctor: '_Tuple2', _0: withAnimation, _1: visibility};
		_v22_8:
		do {
			if (_p38.ctor === '_Tuple2') {
				if (_p38._0 === true) {
					switch (_p38._1.ctor) {
						case 'Hidden':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$StartDown;
						case 'StartDown':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingDown;
						case 'AnimatingDown':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Shown;
						case 'Shown':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$StartUp;
						case 'StartUp':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingUp;
						default:
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Hidden;
					}
				} else {
					switch (_p38._1.ctor) {
						case 'Hidden':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Shown;
						case 'Shown':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Hidden;
						default:
							break _v22_8;
					}
				}
			} else {
				break _v22_8;
			}
		} while(false);
		return _rundis$elm_bootstrap$Bootstrap_Navbar$Hidden;
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$toggleHandler = F2(
	function (_p40, _p39) {
		var _p41 = _p40;
		var _p42 = _p39;
		var updState = function (h) {
			return A2(
				_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
				function (s) {
					return _elm_lang$core$Native_Utils.update(
						s,
						{
							height: _elm_lang$core$Maybe$Just(h),
							visibility: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$visibilityTransition, _p42._0.withAnimation, s.visibility)
						});
				},
				_p41);
		};
		return A2(
			_elm_lang$html$Html_Events$on,
			'click',
			A2(
				_elm_lang$core$Json_Decode$andThen,
				function (v) {
					return _elm_lang$core$Json_Decode$succeed(
						_p42._0.toMsg(
							(_elm_lang$core$Native_Utils.cmp(v, 0) > 0) ? updState(v) : updState(
								A2(_elm_lang$core$Maybe$withDefault, 0, _p41._0.height))));
				},
				_rundis$elm_bootstrap$Bootstrap_Navbar$heightDecoder));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$transitionHandler = F2(
	function (state, _p43) {
		var _p44 = _p43;
		return _elm_lang$core$Json_Decode$succeed(
			_p44._0.toMsg(
				A2(
					_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
					function (s) {
						return _elm_lang$core$Native_Utils.update(
							s,
							{
								visibility: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$visibilityTransition, _p44._0.withAnimation, s.visibility)
							});
					},
					state)));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$menuAttributes = F2(
	function (_p46, _p45) {
		var _p47 = _p46;
		var _p53 = _p47;
		var _p52 = _p47._0.height;
		var _p48 = _p45;
		var _p51 = _p48;
		var defaults = {
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('collapse navbar-collapse'),
			_1: {ctor: '[]'}
		};
		var _p49 = _p47._0.visibility;
		switch (_p49.ctor) {
			case 'Hidden':
				var _p50 = _p52;
				if (_p50.ctor === 'Nothing') {
					return ((!_p48._0.withAnimation) || A2(_rundis$elm_bootstrap$Bootstrap_Navbar$shouldHideMenu, _p53, _p51)) ? defaults : {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'height', _1: '0'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					};
				} else {
					return defaults;
				}
			case 'StartDown':
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Navbar$transitionStyle(_elm_lang$core$Maybe$Nothing),
					_1: {ctor: '[]'}
				};
			case 'AnimatingDown':
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Navbar$transitionStyle(_p52),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html_Events$on,
							'transitionend',
							A2(_rundis$elm_bootstrap$Bootstrap_Navbar$transitionHandler, _p53, _p51)),
						_1: {ctor: '[]'}
					}
				};
			case 'AnimatingUp':
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Navbar$transitionStyle(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html_Events$on,
							'transitionend',
							A2(_rundis$elm_bootstrap$Bootstrap_Navbar$transitionHandler, _p53, _p51)),
						_1: {ctor: '[]'}
					}
				};
			case 'StartUp':
				return {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Navbar$transitionStyle(_p52),
					_1: {ctor: '[]'}
				};
			default:
				return A2(
					_elm_lang$core$Basics_ops['++'],
					defaults,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('show'),
						_1: {ctor: '[]'}
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Closed = {ctor: 'Closed'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$getOrInitDropdownStatus = F2(
	function (id, _p54) {
		var _p55 = _p54;
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_rundis$elm_bootstrap$Bootstrap_Navbar$Closed,
			A2(_elm_lang$core$Dict$get, id, _p55._0.dropdowns));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$ListenClicks = {ctor: 'ListenClicks'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Open = {ctor: 'Open'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdownSubscriptions = F2(
	function (_p56, toMsg) {
		var _p57 = _p56;
		var _p64 = _p57._0.dropdowns;
		var needsSub = function (s) {
			return A2(
				_elm_lang$core$List$any,
				function (_p58) {
					var _p59 = _p58;
					return _elm_lang$core$Native_Utils.eq(_p59._1, s);
				},
				_elm_lang$core$Dict$toList(_p64));
		};
		var updDropdowns = A2(
			_elm_lang$core$Dict$map,
			F2(
				function (_p60, status) {
					var _p61 = status;
					switch (_p61.ctor) {
						case 'Open':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$ListenClicks;
						case 'ListenClicks':
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Closed;
						default:
							return _rundis$elm_bootstrap$Bootstrap_Navbar$Closed;
					}
				}),
			_p64);
		var updState = A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
			function (s) {
				return _elm_lang$core$Native_Utils.update(
					s,
					{dropdowns: updDropdowns});
			},
			_p57);
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: needsSub(_rundis$elm_bootstrap$Bootstrap_Navbar$Open) ? _elm_lang$animation_frame$AnimationFrame$times(
					function (_p62) {
						return toMsg(updState);
					}) : _elm_lang$core$Platform_Sub$none,
				_1: {
					ctor: '::',
					_0: needsSub(_rundis$elm_bootstrap$Bootstrap_Navbar$ListenClicks) ? _elm_lang$mouse$Mouse$clicks(
						function (_p63) {
							return toMsg(updState);
						}) : _elm_lang$core$Platform_Sub$none,
					_1: {ctor: '[]'}
				}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$subscriptions = F2(
	function (_p65, toMsg) {
		var _p66 = _p65;
		var _p70 = _p66;
		var updState = function (v) {
			return A2(
				_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
				function (s) {
					return _elm_lang$core$Native_Utils.update(
						s,
						{visibility: v});
				},
				_p70);
		};
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: function () {
					var _p67 = _p66._0.visibility;
					switch (_p67.ctor) {
						case 'StartDown':
							return _elm_lang$animation_frame$AnimationFrame$times(
								function (_p68) {
									return toMsg(
										updState(_rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingDown));
								});
						case 'StartUp':
							return _elm_lang$animation_frame$AnimationFrame$times(
								function (_p69) {
									return toMsg(
										updState(_rundis$elm_bootstrap$Bootstrap_Navbar$AnimatingUp));
								});
						default:
							return _elm_lang$core$Platform_Sub$none;
					}
				}(),
				_1: {
					ctor: '::',
					_0: _elm_lang$window$Window$resizes(
						function (size) {
							return toMsg(
								A2(
									_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
									function (s) {
										return _elm_lang$core$Native_Utils.update(
											s,
											{
												windowSize: _elm_lang$core$Maybe$Just(size)
											});
									},
									_p70));
						}),
					_1: {
						ctor: '::',
						_0: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$dropdownSubscriptions, _p70, toMsg),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$toggleOpen = F3(
	function (state, id, _p71) {
		var _p72 = _p71;
		var currStatus = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$getOrInitDropdownStatus, id, state);
		var newStatus = function () {
			var _p73 = currStatus;
			switch (_p73.ctor) {
				case 'Open':
					return _rundis$elm_bootstrap$Bootstrap_Navbar$Closed;
				case 'ListenClicks':
					return _rundis$elm_bootstrap$Bootstrap_Navbar$Closed;
				default:
					return _rundis$elm_bootstrap$Bootstrap_Navbar$Open;
			}
		}();
		return _p72._0.toMsg(
			A2(
				_rundis$elm_bootstrap$Bootstrap_Navbar$mapState,
				function (s) {
					return _elm_lang$core$Native_Utils.update(
						s,
						{
							dropdowns: A3(_elm_lang$core$Dict$insert, id, newStatus, s.dropdowns)
						});
				},
				state));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$renderDropdownToggle = F4(
	function (state, id, config, _p74) {
		var _p75 = _p74;
		return A2(
			_elm_lang$html$Html$a,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('nav-link dropdown-toggle'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$href('#'),
						_1: {
							ctor: '::',
							_0: A3(
								_elm_lang$html$Html_Events$onWithOptions,
								'click',
								{stopPropagation: false, preventDefault: true},
								_elm_lang$core$Json_Decode$succeed(
									A3(_rundis$elm_bootstrap$Bootstrap_Navbar$toggleOpen, state, id, config))),
							_1: {ctor: '[]'}
						}
					}
				},
				_p75._0.attributes),
			_p75._0.children);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$renderDropdown = F3(
	function (state, _p77, _p76) {
		var _p78 = _p77;
		var _p79 = _p76;
		var _p83 = _p79._0.id;
		var needsDropup = A2(
			_elm_lang$core$Maybe$withDefault,
			false,
			A2(
				_elm_lang$core$Maybe$map,
				function (fix) {
					var _p80 = fix;
					if (_p80.ctor === 'Bottom') {
						return true;
					} else {
						return false;
					}
				},
				_p78._0.options.fix));
		return A2(
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'nav-item', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'dropdown', _1: true},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'dropup', _1: needsDropup},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'show',
										_1: !_elm_lang$core$Native_Utils.eq(
											A2(_rundis$elm_bootstrap$Bootstrap_Navbar$getOrInitDropdownStatus, _p83, state),
											_rundis$elm_bootstrap$Bootstrap_Navbar$Closed)
									},
									_1: {ctor: '[]'}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A4(_rundis$elm_bootstrap$Bootstrap_Navbar$renderDropdownToggle, state, _p83, _p78, _p79._0.toggle),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('dropdown-menu'),
							_1: {ctor: '[]'}
						},
						A2(
							_elm_lang$core$List$map,
							function (_p81) {
								var _p82 = _p81;
								return _p82._0;
							},
							_p79._0.items)),
					_1: {ctor: '[]'}
				}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$renderNav = F3(
	function (state, config, navItems) {
		return A2(
			_elm_lang$html$Html$ul,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('navbar-nav mr-auto'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				function (item) {
					var _p84 = item;
					if (_p84.ctor === 'Item') {
						return _rundis$elm_bootstrap$Bootstrap_Navbar$renderItemLink(_p84._0);
					} else {
						return A3(_rundis$elm_bootstrap$Bootstrap_Navbar$renderDropdown, state, config, _p84._0);
					}
				},
				navItems));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$view = F2(
	function (state, _p85) {
		var _p86 = _p85;
		var _p89 = _p86;
		var _p88 = _p86._0.brand;
		return A2(
			_elm_lang$html$Html$nav,
			_rundis$elm_bootstrap$Bootstrap_Navbar$navbarAttributes(_p86._0.options),
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'navbar-toggler',
									A2(
										_elm_lang$core$Maybe$withDefault,
										'',
										A2(
											_elm_lang$core$Maybe$map,
											function (_p87) {
												return ' navbar-toggler-right';
											},
											_p88)))),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('button'),
								_1: {
									ctor: '::',
									_0: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$toggleHandler, state, _p89),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('navbar-toggler-icon'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					_rundis$elm_bootstrap$Bootstrap_Navbar$maybeBrand(_p88),
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							A2(_rundis$elm_bootstrap$Bootstrap_Navbar$menuAttributes, state, _p89),
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									A2(_rundis$elm_bootstrap$Bootstrap_Navbar$menuWrapperAttributes, state, _p89),
									A2(
										_elm_lang$core$Basics_ops['++'],
										{
											ctor: '::',
											_0: A3(_rundis$elm_bootstrap$Bootstrap_Navbar$renderNav, state, _p89, _p86._0.items),
											_1: {ctor: '[]'}
										},
										_rundis$elm_bootstrap$Bootstrap_Navbar$renderCustom(_p86._0.customItems))),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					})));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$updateConfig = F2(
	function (mapper, _p90) {
		var _p91 = _p90;
		return _rundis$elm_bootstrap$Bootstrap_Navbar$Config(
			mapper(_p91._0));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$withAnimation = function (config) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$updateConfig,
		function (conf) {
			return _elm_lang$core$Native_Utils.update(
				conf,
				{withAnimation: true});
		},
		config);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$items = F2(
	function (items, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateConfig,
			function (conf) {
				return _elm_lang$core$Native_Utils.update(
					conf,
					{items: items});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$customItems = F2(
	function (items, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateConfig,
			function (conf) {
				return _elm_lang$core$Native_Utils.update(
					conf,
					{customItems: items});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions = F2(
	function (mapper, _p92) {
		var _p93 = _p92;
		var _p94 = _p93._0;
		return _rundis$elm_bootstrap$Bootstrap_Navbar$Config(
			_elm_lang$core$Native_Utils.update(
				_p94,
				{
					options: mapper(_p94.options)
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$container = function (config) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
		function (opts) {
			return _elm_lang$core$Native_Utils.update(
				opts,
				{isContainer: true});
		},
		config);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$scheme = F3(
	function (modifier, bgColor, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
			function (opt) {
				return _elm_lang$core$Native_Utils.update(
					opt,
					{
						scheme: _elm_lang$core$Maybe$Just(
							{modifier: modifier, bgColor: bgColor})
					});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$toggleAt = F2(
	function (size, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
			function (opt) {
				return _elm_lang$core$Native_Utils.update(
					opt,
					{toggleAt: size});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$collapseSmall = _rundis$elm_bootstrap$Bootstrap_Navbar$toggleAt(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_Navbar$collapseMedium = _rundis$elm_bootstrap$Bootstrap_Navbar$toggleAt(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$MD);
var _rundis$elm_bootstrap$Bootstrap_Navbar$collapseLarge = _rundis$elm_bootstrap$Bootstrap_Navbar$toggleAt(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_Navbar$collapseExtraLarge = _rundis$elm_bootstrap$Bootstrap_Navbar$toggleAt(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$XL);
var _rundis$elm_bootstrap$Bootstrap_Navbar$attrs = F2(
	function (attrs, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
			function (opt) {
				return _elm_lang$core$Native_Utils.update(
					opt,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], opt.attributes, attrs)
					});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Bottom = {ctor: 'Bottom'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$fixBottom = function (config) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
		function (opts) {
			return _elm_lang$core$Native_Utils.update(
				opts,
				{
					fix: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_Navbar$Bottom)
				});
		},
		config);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Top = {ctor: 'Top'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$fixTop = function (config) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$updateOptions,
		function (opts) {
			return _elm_lang$core$Native_Utils.update(
				opts,
				{
					fix: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_Navbar$Top)
				});
		},
		config);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Light = {ctor: 'Light'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Dark = {ctor: 'Dark'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Class = function (a) {
	return {ctor: 'Class', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$darkCustomClass = function (classString) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$scheme,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Dark,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Class(classString));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$lightCustomClass = function (classString) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$scheme,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Light,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Class(classString));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Custom = function (a) {
	return {ctor: 'Custom', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$darkCustom = function (color) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$scheme,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Dark,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Custom(color));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$lightCustom = function (color) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Navbar$scheme,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Light,
		_rundis$elm_bootstrap$Bootstrap_Navbar$Custom(color));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Inverse = {ctor: 'Inverse'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$inverse = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Inverse);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$danger = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Danger);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$warning = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Warning);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$info = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Info);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$success = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Success);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Primary = {ctor: 'Primary'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$primary = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Dark, _rundis$elm_bootstrap$Bootstrap_Navbar$Primary);
var _rundis$elm_bootstrap$Bootstrap_Navbar$Faded = {ctor: 'Faded'};
var _rundis$elm_bootstrap$Bootstrap_Navbar$config = function (toMsg) {
	return _rundis$elm_bootstrap$Bootstrap_Navbar$Config(
		{
			toMsg: toMsg,
			withAnimation: false,
			brand: _elm_lang$core$Maybe$Nothing,
			items: {ctor: '[]'},
			customItems: {ctor: '[]'},
			options: {
				fix: _elm_lang$core$Maybe$Nothing,
				isContainer: false,
				scheme: _elm_lang$core$Maybe$Just(
					{modifier: _rundis$elm_bootstrap$Bootstrap_Navbar$Light, bgColor: _rundis$elm_bootstrap$Bootstrap_Navbar$Faded}),
				toggleAt: _rundis$elm_bootstrap$Bootstrap_Grid_Internal$XS,
				attributes: {ctor: '[]'}
			}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$faded = A2(_rundis$elm_bootstrap$Bootstrap_Navbar$scheme, _rundis$elm_bootstrap$Bootstrap_Navbar$Light, _rundis$elm_bootstrap$Bootstrap_Navbar$Faded);
var _rundis$elm_bootstrap$Bootstrap_Navbar$NavDropdown = function (a) {
	return {ctor: 'NavDropdown', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Item = function (a) {
	return {ctor: 'Item', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$itemLink = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Navbar$Item(
			{attributes: attributes, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$itemLinkActive = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Navbar$itemLink(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('active'),
			_1: attributes
		});
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$CustomItem = function (a) {
	return {ctor: 'CustomItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$textItem = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Navbar$CustomItem(
			A2(
				_elm_lang$html$Html$span,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('navbar-text'),
					_1: attributes
				},
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$formItem = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Navbar$CustomItem(
			A2(
				_elm_lang$html$Html$form,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('form-inline'),
					_1: attributes
				},
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$customItem = function (elem) {
	return _rundis$elm_bootstrap$Bootstrap_Navbar$CustomItem(elem);
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$Brand = function (a) {
	return {ctor: 'Brand', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$brand = F3(
	function (attributes, children, config) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$updateConfig,
			function (conf) {
				return _elm_lang$core$Native_Utils.update(
					conf,
					{
						brand: _elm_lang$core$Maybe$Just(
							_rundis$elm_bootstrap$Bootstrap_Navbar$Brand(
								A2(
									_elm_lang$html$Html$a,
									A2(
										_elm_lang$core$Basics_ops['++'],
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('navbar-brand'),
											_1: {ctor: '[]'}
										},
										attributes),
									children)))
					});
			},
			config);
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$Dropdown = function (a) {
	return {ctor: 'Dropdown', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdown = function (config) {
	return _rundis$elm_bootstrap$Bootstrap_Navbar$NavDropdown(
		_rundis$elm_bootstrap$Bootstrap_Navbar$Dropdown(config));
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownToggle = function (a) {
	return {ctor: 'DropdownToggle', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdownToggle = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownToggle(
			{attributes: attributes, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownItem = function (a) {
	return {ctor: 'DropdownItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdownItem = F2(
	function (attributes, children) {
		return _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownItem(
			A2(
				_elm_lang$html$Html$a,
				A2(
					_elm_lang$core$Basics_ops['++'],
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('dropdown-item'),
						_1: {ctor: '[]'}
					},
					attributes),
				children));
	});
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdownDivider = _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownItem(
	A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('dropdown-divider'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'}));
var _rundis$elm_bootstrap$Bootstrap_Navbar$dropdownHeader = function (children) {
	return _rundis$elm_bootstrap$Bootstrap_Navbar$DropdownItem(
		A2(
			_elm_lang$html$Html$h6,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('dropdown-header'),
				_1: {ctor: '[]'}
			},
			children));
};

var _rundis$elm_bootstrap$Bootstrap_Table$roleOption = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Active':
			return 'active';
		case 'Success':
			return 'success';
		case 'Warning':
			return 'warning';
		case 'Danger':
			return 'danger';
		default:
			return 'info';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$cellAttribute = function (option) {
	var _p1 = option;
	switch (_p1.ctor) {
		case 'RoledCell':
			return _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'table-',
					_rundis$elm_bootstrap$Bootstrap_Table$roleOption(_p1._0)));
		case 'InversedCell':
			return _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'bg-',
					_rundis$elm_bootstrap$Bootstrap_Table$roleOption(_p1._0)));
		default:
			return _p1._0;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$cellAttributes = function (options) {
	return A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$cellAttribute, options);
};
var _rundis$elm_bootstrap$Bootstrap_Table$rowClass = function (option) {
	var _p2 = option;
	switch (_p2.ctor) {
		case 'RoledRow':
			return _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'table-',
					_rundis$elm_bootstrap$Bootstrap_Table$roleOption(_p2._0)));
		case 'InversedRow':
			return _elm_lang$html$Html_Attributes$class(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'bg-',
					_rundis$elm_bootstrap$Bootstrap_Table$roleOption(_p2._0)));
		default:
			return _p2._0;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$rowAttributes = function (options) {
	return A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$rowClass, options);
};
var _rundis$elm_bootstrap$Bootstrap_Table$theadAttribute = function (option) {
	var _p3 = option;
	switch (_p3.ctor) {
		case 'InversedHead':
			return _elm_lang$html$Html_Attributes$class('thead-inverse');
		case 'DefaultHead':
			return _elm_lang$html$Html_Attributes$class('thead-default');
		default:
			return _p3._0;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$theadAttributes = function (options) {
	return A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$theadAttribute, options);
};
var _rundis$elm_bootstrap$Bootstrap_Table$tableClass = function (option) {
	var _p4 = option;
	switch (_p4.ctor) {
		case 'Inversed':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-inverse'));
		case 'Striped':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-striped'));
		case 'Bordered':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-bordered'));
		case 'Hover':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-hover'));
		case 'Small':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-sm'));
		case 'Responsive':
			return _elm_lang$core$Maybe$Nothing;
		case 'Reflow':
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class('table-reflow'));
		default:
			return _elm_lang$core$Maybe$Just(_p4._0);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$tableAttributes = function (options) {
	return {
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('table'),
		_1: A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$tableClass, options))
	};
};
var _rundis$elm_bootstrap$Bootstrap_Table$renderCell = function (cell) {
	var _p5 = cell;
	if (_p5.ctor === 'Td') {
		return A2(
			_elm_lang$html$Html$td,
			_rundis$elm_bootstrap$Bootstrap_Table$cellAttributes(_p5._0.options),
			_p5._0.children);
	} else {
		return A2(
			_elm_lang$html$Html$th,
			_rundis$elm_bootstrap$Bootstrap_Table$cellAttributes(_p5._0.options),
			_p5._0.children);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$renderRow = function (row) {
	var _p6 = row;
	if (_p6.ctor === 'Row') {
		return A2(
			_elm_lang$html$Html$tr,
			_rundis$elm_bootstrap$Bootstrap_Table$rowAttributes(_p6._0.options),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$renderCell, _p6._0.cells));
	} else {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'tr',
			_rundis$elm_bootstrap$Bootstrap_Table$rowAttributes(_p6._0.options),
			A2(
				_elm_lang$core$List$map,
				function (_p7) {
					var _p8 = _p7;
					return {
						ctor: '_Tuple2',
						_0: _p8._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Table$renderCell(_p8._1)
					};
				},
				_p6._0.cells));
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$renderTHead = function (_p9) {
	var _p10 = _p9;
	return A2(
		_elm_lang$html$Html$thead,
		_rundis$elm_bootstrap$Bootstrap_Table$theadAttributes(_p10._0.options),
		A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$renderRow, _p10._0.rows));
};
var _rundis$elm_bootstrap$Bootstrap_Table$wrapResponsiveWhen = F2(
	function (isResponsive, table) {
		return isResponsive ? A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('table-responsive'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: table,
				_1: {ctor: '[]'}
			}) : table;
	});
var _rundis$elm_bootstrap$Bootstrap_Table$RowConfig = F2(
	function (a, b) {
		return {options: a, cells: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Table$CellConfig = F2(
	function (a, b) {
		return {options: a, children: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Table$TableAttr = function (a) {
	return {ctor: 'TableAttr', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$attr = function (attr) {
	return _rundis$elm_bootstrap$Bootstrap_Table$TableAttr(attr);
};
var _rundis$elm_bootstrap$Bootstrap_Table$Reflow = {ctor: 'Reflow'};
var _rundis$elm_bootstrap$Bootstrap_Table$reflow = _rundis$elm_bootstrap$Bootstrap_Table$Reflow;
var _rundis$elm_bootstrap$Bootstrap_Table$Responsive = {ctor: 'Responsive'};
var _rundis$elm_bootstrap$Bootstrap_Table$responsive = _rundis$elm_bootstrap$Bootstrap_Table$Responsive;
var _rundis$elm_bootstrap$Bootstrap_Table$Small = {ctor: 'Small'};
var _rundis$elm_bootstrap$Bootstrap_Table$small = _rundis$elm_bootstrap$Bootstrap_Table$Small;
var _rundis$elm_bootstrap$Bootstrap_Table$Hover = {ctor: 'Hover'};
var _rundis$elm_bootstrap$Bootstrap_Table$hover = _rundis$elm_bootstrap$Bootstrap_Table$Hover;
var _rundis$elm_bootstrap$Bootstrap_Table$Bordered = {ctor: 'Bordered'};
var _rundis$elm_bootstrap$Bootstrap_Table$bordered = _rundis$elm_bootstrap$Bootstrap_Table$Bordered;
var _rundis$elm_bootstrap$Bootstrap_Table$Striped = {ctor: 'Striped'};
var _rundis$elm_bootstrap$Bootstrap_Table$striped = _rundis$elm_bootstrap$Bootstrap_Table$Striped;
var _rundis$elm_bootstrap$Bootstrap_Table$Inversed = {ctor: 'Inversed'};
var _rundis$elm_bootstrap$Bootstrap_Table$inversed = _rundis$elm_bootstrap$Bootstrap_Table$Inversed;
var _rundis$elm_bootstrap$Bootstrap_Table$HeadAttr = function (a) {
	return {ctor: 'HeadAttr', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$headAttr = function (attr) {
	return _rundis$elm_bootstrap$Bootstrap_Table$HeadAttr(attr);
};
var _rundis$elm_bootstrap$Bootstrap_Table$DefaultHead = {ctor: 'DefaultHead'};
var _rundis$elm_bootstrap$Bootstrap_Table$defaultHead = _rundis$elm_bootstrap$Bootstrap_Table$DefaultHead;
var _rundis$elm_bootstrap$Bootstrap_Table$InversedHead = {ctor: 'InversedHead'};
var _rundis$elm_bootstrap$Bootstrap_Table$inversedHead = _rundis$elm_bootstrap$Bootstrap_Table$InversedHead;
var _rundis$elm_bootstrap$Bootstrap_Table$RowAttr = function (a) {
	return {ctor: 'RowAttr', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$rowAttr = function (attr) {
	return _rundis$elm_bootstrap$Bootstrap_Table$RowAttr(attr);
};
var _rundis$elm_bootstrap$Bootstrap_Table$InversedRow = function (a) {
	return {ctor: 'InversedRow', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$RoledRow = function (a) {
	return {ctor: 'RoledRow', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$CellAttr = function (a) {
	return {ctor: 'CellAttr', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$cellAttr = function (attr) {
	return _rundis$elm_bootstrap$Bootstrap_Table$CellAttr(attr);
};
var _rundis$elm_bootstrap$Bootstrap_Table$InversedCell = function (a) {
	return {ctor: 'InversedCell', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$RoledCell = function (a) {
	return {ctor: 'RoledCell', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Table$rowInfo = _rundis$elm_bootstrap$Bootstrap_Table$RoledRow(_rundis$elm_bootstrap$Bootstrap_Table$Info);
var _rundis$elm_bootstrap$Bootstrap_Table$cellInfo = _rundis$elm_bootstrap$Bootstrap_Table$RoledCell(_rundis$elm_bootstrap$Bootstrap_Table$Info);
var _rundis$elm_bootstrap$Bootstrap_Table$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Table$rowDanger = _rundis$elm_bootstrap$Bootstrap_Table$RoledRow(_rundis$elm_bootstrap$Bootstrap_Table$Danger);
var _rundis$elm_bootstrap$Bootstrap_Table$cellDanger = _rundis$elm_bootstrap$Bootstrap_Table$RoledCell(_rundis$elm_bootstrap$Bootstrap_Table$Danger);
var _rundis$elm_bootstrap$Bootstrap_Table$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Table$rowWarning = _rundis$elm_bootstrap$Bootstrap_Table$RoledRow(_rundis$elm_bootstrap$Bootstrap_Table$Warning);
var _rundis$elm_bootstrap$Bootstrap_Table$cellWarning = _rundis$elm_bootstrap$Bootstrap_Table$RoledCell(_rundis$elm_bootstrap$Bootstrap_Table$Warning);
var _rundis$elm_bootstrap$Bootstrap_Table$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Table$rowSuccess = _rundis$elm_bootstrap$Bootstrap_Table$RoledRow(_rundis$elm_bootstrap$Bootstrap_Table$Success);
var _rundis$elm_bootstrap$Bootstrap_Table$cellSuccess = _rundis$elm_bootstrap$Bootstrap_Table$RoledCell(_rundis$elm_bootstrap$Bootstrap_Table$Success);
var _rundis$elm_bootstrap$Bootstrap_Table$Active = {ctor: 'Active'};
var _rundis$elm_bootstrap$Bootstrap_Table$rowActive = _rundis$elm_bootstrap$Bootstrap_Table$RoledRow(_rundis$elm_bootstrap$Bootstrap_Table$Active);
var _rundis$elm_bootstrap$Bootstrap_Table$cellActive = _rundis$elm_bootstrap$Bootstrap_Table$RoledCell(_rundis$elm_bootstrap$Bootstrap_Table$Active);
var _rundis$elm_bootstrap$Bootstrap_Table$KeyedRow = function (a) {
	return {ctor: 'KeyedRow', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$keyedTr = F2(
	function (options, keyedCells) {
		return _rundis$elm_bootstrap$Bootstrap_Table$KeyedRow(
			{options: options, cells: keyedCells});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$Row = function (a) {
	return {ctor: 'Row', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$tr = F2(
	function (options, cells) {
		return _rundis$elm_bootstrap$Bootstrap_Table$Row(
			{options: options, cells: cells});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$Th = function (a) {
	return {ctor: 'Th', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$addScopeIfTh = function (cell) {
	var _p11 = cell;
	if (_p11.ctor === 'Th') {
		var _p12 = _p11._0;
		return _rundis$elm_bootstrap$Bootstrap_Table$Th(
			_elm_lang$core$Native_Utils.update(
				_p12,
				{
					options: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Table$cellAttr(
							_elm_lang$html$Html_Attributes$scope('row')),
						_1: _p12.options
					}
				}));
	} else {
		return cell;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$maybeAddScopeToFirstCell = function (row) {
	var _p13 = row;
	if (_p13.ctor === 'Row') {
		var _p14 = _p13._0.cells;
		if (_p14.ctor === '[]') {
			return row;
		} else {
			return _rundis$elm_bootstrap$Bootstrap_Table$Row(
				{
					options: _p13._0.options,
					cells: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Table$addScopeIfTh(_p14._0),
						_1: _p14._1
					}
				});
		}
	} else {
		var _p15 = _p13._0.cells;
		if (_p15.ctor === '[]') {
			return row;
		} else {
			return _rundis$elm_bootstrap$Bootstrap_Table$KeyedRow(
				{
					options: _p13._0.options,
					cells: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _p15._0._0,
							_1: _rundis$elm_bootstrap$Bootstrap_Table$addScopeIfTh(_p15._0._1)
						},
						_1: _p15._1
					}
				});
		}
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$renderTBody = function (body) {
	var _p16 = body;
	if (_p16.ctor === 'TBody') {
		return A2(
			_elm_lang$html$Html$tbody,
			_p16._0.attributes,
			A2(
				_elm_lang$core$List$map,
				function (row) {
					return _rundis$elm_bootstrap$Bootstrap_Table$renderRow(
						_rundis$elm_bootstrap$Bootstrap_Table$maybeAddScopeToFirstCell(row));
				},
				_p16._0.rows));
	} else {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'tbody',
			_p16._0.attributes,
			A2(
				_elm_lang$core$List$map,
				function (_p17) {
					var _p18 = _p17;
					return {
						ctor: '_Tuple2',
						_0: _p18._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Table$renderRow(
							_rundis$elm_bootstrap$Bootstrap_Table$maybeAddScopeToFirstCell(_p18._1))
					};
				},
				_p16._0.rows));
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$th = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Table$Th(
			{options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$Td = function (a) {
	return {ctor: 'Td', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$mapInversedCell = function (cell) {
	var inverseOptions = function (options) {
		return A2(
			_elm_lang$core$List$map,
			function (opt) {
				var _p19 = opt;
				if (_p19.ctor === 'RoledCell') {
					return _rundis$elm_bootstrap$Bootstrap_Table$InversedCell(_p19._0);
				} else {
					return opt;
				}
			},
			options);
	};
	var _p20 = cell;
	if (_p20.ctor === 'Th') {
		var _p21 = _p20._0;
		return _rundis$elm_bootstrap$Bootstrap_Table$Th(
			_elm_lang$core$Native_Utils.update(
				_p21,
				{
					options: inverseOptions(_p21.options)
				}));
	} else {
		var _p22 = _p20._0;
		return _rundis$elm_bootstrap$Bootstrap_Table$Td(
			_elm_lang$core$Native_Utils.update(
				_p22,
				{
					options: inverseOptions(_p22.options)
				}));
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$mapInversedRow = function (row) {
	var inversedOptions = function (options) {
		return A2(
			_elm_lang$core$List$map,
			function (opt) {
				var _p23 = opt;
				if (_p23.ctor === 'RoledRow') {
					return _rundis$elm_bootstrap$Bootstrap_Table$InversedRow(_p23._0);
				} else {
					return opt;
				}
			},
			options);
	};
	var _p24 = row;
	if (_p24.ctor === 'Row') {
		return _rundis$elm_bootstrap$Bootstrap_Table$Row(
			{
				options: inversedOptions(_p24._0.options),
				cells: A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$mapInversedCell, _p24._0.cells)
			});
	} else {
		return _rundis$elm_bootstrap$Bootstrap_Table$KeyedRow(
			{
				options: inversedOptions(_p24._0.options),
				cells: A2(
					_elm_lang$core$List$map,
					function (_p25) {
						var _p26 = _p25;
						return {
							ctor: '_Tuple2',
							_0: _p26._0,
							_1: _rundis$elm_bootstrap$Bootstrap_Table$mapInversedCell(_p26._1)
						};
					},
					_p24._0.cells)
			});
	}
};
var _rundis$elm_bootstrap$Bootstrap_Table$td = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Table$Td(
			{options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$THead = function (a) {
	return {ctor: 'THead', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$maybeMapInversedTHead = F2(
	function (isTableInversed, _p27) {
		var _p28 = _p27;
		var _p29 = _p28._0;
		var isHeadInversed = A2(
			_elm_lang$core$List$any,
			function (opt) {
				return _elm_lang$core$Native_Utils.eq(opt, _rundis$elm_bootstrap$Bootstrap_Table$InversedHead);
			},
			_p29.options);
		return _rundis$elm_bootstrap$Bootstrap_Table$THead(
			(isTableInversed || isHeadInversed) ? _elm_lang$core$Native_Utils.update(
				_p29,
				{
					rows: A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$mapInversedRow, _p29.rows)
				}) : _p29);
	});
var _rundis$elm_bootstrap$Bootstrap_Table$thead = F2(
	function (options, rows) {
		return _rundis$elm_bootstrap$Bootstrap_Table$THead(
			{options: options, rows: rows});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$simpleThead = function (cells) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Table$thead,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Table$tr,
				{ctor: '[]'},
				cells),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Table$KeyedTBody = function (a) {
	return {ctor: 'KeyedTBody', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$keyedTBody = F2(
	function (attributes, rows) {
		return _rundis$elm_bootstrap$Bootstrap_Table$KeyedTBody(
			{attributes: attributes, rows: rows});
	});
var _rundis$elm_bootstrap$Bootstrap_Table$TBody = function (a) {
	return {ctor: 'TBody', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Table$maybeMapInversedTBody = F2(
	function (isTableInversed, tbody) {
		var _p30 = {ctor: '_Tuple2', _0: isTableInversed, _1: tbody};
		if (_p30._0 === false) {
			return tbody;
		} else {
			if (_p30._1.ctor === 'TBody') {
				var _p31 = _p30._1._0;
				return _rundis$elm_bootstrap$Bootstrap_Table$TBody(
					_elm_lang$core$Native_Utils.update(
						_p31,
						{
							rows: A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Table$mapInversedRow, _p31.rows)
						}));
			} else {
				var _p34 = _p30._1._0;
				return _rundis$elm_bootstrap$Bootstrap_Table$KeyedTBody(
					_elm_lang$core$Native_Utils.update(
						_p34,
						{
							rows: A2(
								_elm_lang$core$List$map,
								function (_p32) {
									var _p33 = _p32;
									return {
										ctor: '_Tuple2',
										_0: _p33._0,
										_1: _rundis$elm_bootstrap$Bootstrap_Table$mapInversedRow(_p33._1)
									};
								},
								_p34.rows)
						}));
			}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Table$table = function (_p35) {
	var _p36 = _p35;
	var _p37 = _p36.options;
	var isInversed = A2(
		_elm_lang$core$List$any,
		function (opt) {
			return _elm_lang$core$Native_Utils.eq(opt, _rundis$elm_bootstrap$Bootstrap_Table$Inversed);
		},
		_p37);
	var isResponsive = A2(
		_elm_lang$core$List$any,
		function (opt) {
			return _elm_lang$core$Native_Utils.eq(opt, _rundis$elm_bootstrap$Bootstrap_Table$Responsive);
		},
		_p37);
	var classOptions = A2(
		_elm_lang$core$List$filter,
		function (opt) {
			return !_elm_lang$core$Native_Utils.eq(opt, _rundis$elm_bootstrap$Bootstrap_Table$Responsive);
		},
		_p37);
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Table$wrapResponsiveWhen,
		isResponsive,
		A2(
			_elm_lang$html$Html$table,
			_rundis$elm_bootstrap$Bootstrap_Table$tableAttributes(classOptions),
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Table$renderTHead(
					A2(_rundis$elm_bootstrap$Bootstrap_Table$maybeMapInversedTHead, isInversed, _p36.thead)),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Table$renderTBody(
						A2(_rundis$elm_bootstrap$Bootstrap_Table$maybeMapInversedTBody, isInversed, _p36.tbody)),
					_1: {ctor: '[]'}
				}
			}));
};
var _rundis$elm_bootstrap$Bootstrap_Table$simpleTable = function (_p38) {
	var _p39 = _p38;
	return _rundis$elm_bootstrap$Bootstrap_Table$table(
		{
			options: {ctor: '[]'},
			thead: _p39._0,
			tbody: _p39._1
		});
};
var _rundis$elm_bootstrap$Bootstrap_Table$tbody = F2(
	function (attributes, rows) {
		return _rundis$elm_bootstrap$Bootstrap_Table$TBody(
			{attributes: attributes, rows: rows});
	});

var _user$project$Animation$lerp = F3(
	function (x0, x1, u) {
		return (u * x1) + ((1 - u) * x0);
	});
var _user$project$Animation$easeMove = F5(
	function (startPos, stopPos, duration, startTime, curTime) {
		var v = A3(_elm_lang$core$Basics$clamp, 0, 1, (curTime - startTime) / duration);
		return A3(
			_user$project$Animation$lerp,
			startPos,
			stopPos,
			_elm_community$easing_functions$Ease$outQuint(v));
	});
var _user$project$Animation$slide = F3(
	function (updater, startTime, nowTime) {
		var currentValue = A4(_user$project$Animation$easeMove, 0, 1, _elm_lang$core$Time$second, startTime);
		return updater(
			currentValue(nowTime));
	});

var _user$project$Util$encodeMaybe = F2(
	function (encoder, maybeVal) {
		var _p0 = maybeVal;
		if (_p0.ctor === 'Just') {
			return encoder(_p0._0);
		} else {
			return _elm_lang$core$Json_Encode$null;
		}
	});
var _user$project$Util$rotateList = function (list) {
	var _p1 = list;
	if (_p1.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		return A2(
			_elm_lang$core$List$append,
			_p1._1,
			{
				ctor: '::',
				_0: _p1._0,
				_1: {ctor: '[]'}
			});
	}
};
var _user$project$Util$appendErrors = F2(
	function (model, errors) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				errors: A2(_elm_lang$core$Basics_ops['++'], model.errors, errors)
			});
	});
var _user$project$Util$onClickStopPropagation = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'click',
		_elm_lang$core$Native_Utils.update(
			_elm_lang$html$Html_Events$defaultOptions,
			{stopPropagation: true}),
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Util$viewIf = F2(
	function (condition, content) {
		return condition ? content : _elm_lang$html$Html$text('');
	});
var _user$project$Util_ops = _user$project$Util_ops || {};
_user$project$Util_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _user$project$Util$pair = F2(
	function (first, second) {
		return A2(_user$project$Util_ops['=>'], first, second);
	});

var _user$project$Data_Allocation$encodeVote = function (vote) {
	var intMaybe = _user$project$Util$encodeMaybe(_elm_lang$core$Json_Encode$int);
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: A2(
				_user$project$Util_ops['=>'],
				'weight',
				intMaybe(vote.weight)),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Util_ops['=>'],
					'personal_abs_max',
					intMaybe(vote.personalMax)),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Util_ops['=>'],
						'global_abs_max',
						intMaybe(vote.globalMax)),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Data_Allocation$slugToString = function (_p0) {
	var _p1 = _p0;
	return _p1._0;
};
var _user$project$Data_Allocation$Allocation = F3(
	function (a, b, c) {
		return {expenses: a, amount: b, numVoters: c};
	});
var _user$project$Data_Allocation$Expense = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {name: a, owner: b, detailText: c, partialAllowed: d, excessAllowed: e, requestedFunds: f, currentAllocatedFunds: g, newAllocatedFunds: h, userNewAllocatedFunds: i, slug: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Data_Allocation$Vote = F3(
	function (a, b, c) {
		return {weight: a, personalMax: b, globalMax: c};
	});
var _user$project$Data_Allocation$voteDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'global_abs_max',
	_elm_lang$core$Json_Decode$nullable(_elm_lang$core$Json_Decode$int),
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'personal_abs_max',
		_elm_lang$core$Json_Decode$nullable(_elm_lang$core$Json_Decode$int),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'weight',
			_elm_lang$core$Json_Decode$nullable(_elm_lang$core$Json_Decode$int),
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Data_Allocation$Vote))));
var _user$project$Data_Allocation$Slug = function (a) {
	return {ctor: 'Slug', _0: a};
};
var _user$project$Data_Allocation$slugParser = A2(
	_evancz$url_parser$UrlParser$custom,
	'SLUG',
	function (_p2) {
		return _elm_lang$core$Result$Ok(
			_user$project$Data_Allocation$Slug(_p2));
	});
var _user$project$Data_Allocation$expenseDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'slug',
	A2(_elm_lang$core$Json_Decode$map, _user$project$Data_Allocation$Slug, _elm_lang$core$Json_Decode$string),
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'user_new_allocated_funds',
		_elm_lang$core$Json_Decode$int,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'new_allocated_funds',
			_elm_lang$core$Json_Decode$int,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'current_allocated_funds',
				_elm_lang$core$Json_Decode$int,
				A3(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
					'requested_funds',
					_elm_lang$core$Json_Decode$int,
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'excess_allowed',
						_elm_lang$core$Json_Decode$bool,
						A3(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
							'partial_allowed',
							_elm_lang$core$Json_Decode$bool,
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'detail_text',
								_elm_lang$core$Json_Decode$string,
								A3(
									_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
									'owner',
									_elm_lang$core$Json_Decode$string,
									A3(
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
										'name',
										_elm_lang$core$Json_Decode$string,
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Data_Allocation$Expense)))))))))));
var _user$project$Data_Allocation$decoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'num_voters',
	_elm_lang$core$Json_Decode$int,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'amount',
		_elm_lang$core$Json_Decode$int,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'expenses',
			_elm_lang$core$Json_Decode$list(_user$project$Data_Allocation$expenseDecoder),
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Data_Allocation$Allocation))));

var _user$project$Data_Budget$Budget = F4(
	function (a, b, c, d) {
		return {coreExpenses: a, leases: b, leaseAdmin: c, leaseMember: d};
	});
var _user$project$Data_Budget$Lease = F4(
	function (a, b, c, d) {
		return {currentRent: a, proposedRent: b, name: c, adminName: d};
	});
var _user$project$Data_Budget$decoder = function () {
	var rent = A5(
		_elm_lang$core$Json_Decode$map4,
		_user$project$Data_Budget$Lease,
		A2(_elm_lang$core$Json_Decode$field, 'current_rent', _elm_lang$core$Json_Decode$float),
		A2(_elm_lang$core$Json_Decode$field, 'proposed_rent', _elm_lang$core$Json_Decode$float),
		A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string),
		A2(_elm_lang$core$Json_Decode$field, 'admin_name', _elm_lang$core$Json_Decode$string));
	return A5(
		_elm_lang$core$Json_Decode$map4,
		_user$project$Data_Budget$Budget,
		A2(_elm_lang$core$Json_Decode$field, 'core_expenses', _elm_lang$core$Json_Decode$float),
		A2(
			_elm_lang$core$Json_Decode$field,
			'leases',
			_elm_lang$core$Json_Decode$list(rent)),
		_elm_lang$core$Json_Decode$maybe(
			A2(_elm_lang$core$Json_Decode$field, 'lease_admin', _elm_lang$core$Json_Decode$string)),
		A2(
			_elm_lang$core$Json_Decode$field,
			'lease_member',
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)));
}();

var _user$project$Data_User$User = F2(
	function (a, b) {
		return {username: a, fullname: b};
	});
var _user$project$Data_User$decoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'fullname',
	_elm_lang$core$Json_Decode$string,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'username',
		_elm_lang$core$Json_Decode$string,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Data_User$User)));

var _user$project$Data_Token$Token = function (a) {
	return {ctor: 'Token', _0: a};
};
var _user$project$Data_Token$decoder = A2(_elm_lang$core$Json_Decode$map, _user$project$Data_Token$Token, _elm_lang$core$Json_Decode$string);

var _user$project$Data_Session$withAuthorization = F2(
	function (session, builder) {
		var _p0 = session.authToken;
		if (_p0.ctor === 'Just') {
			return A3(_lukewestby$elm_http_builder$HttpBuilder$withHeader, 'X-CSRFToken', _p0._0._0, builder);
		} else {
			return builder;
		}
	});
var _user$project$Data_Session$Session = F2(
	function (a, b) {
		return {user: a, authToken: b};
	});
var _user$project$Data_Session$decoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_user$project$Data_Session$Session,
	A2(
		_elm_lang$core$Json_Decode$field,
		'user',
		_elm_lang$core$Json_Decode$nullable(_user$project$Data_User$decoder)),
	A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Maybe$Just,
		A2(_elm_lang$core$Json_Decode$field, 'auth_token', _user$project$Data_Token$decoder)));

var _user$project$Route$routeToString = function (page) {
	var _p0 = page;
	switch (_p0.ctor) {
		case 'Home':
			return '/process#home';
		case 'Login':
			return '/process#login';
		case 'Budget':
			return '/process#budget';
		case 'Expense':
			return '/process#expense';
		case 'Profile':
			return '/process#profile';
		default:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'/process#expense/',
				_user$project$Data_Allocation$slugToString(_p0._0));
	}
};
var _user$project$Route$href = function (route) {
	return _elm_lang$html$Html_Attributes$href(
		_user$project$Route$routeToString(route));
};
var _user$project$Route$modifyUrl = function (_p1) {
	return _elm_lang$navigation$Navigation$modifyUrl(
		_user$project$Route$routeToString(_p1));
};
var _user$project$Route$ExpenseDetail = function (a) {
	return {ctor: 'ExpenseDetail', _0: a};
};
var _user$project$Route$Profile = {ctor: 'Profile'};
var _user$project$Route$Expense = {ctor: 'Expense'};
var _user$project$Route$Budget = {ctor: 'Budget'};
var _user$project$Route$Login = {ctor: 'Login'};
var _user$project$Route$Home = {ctor: 'Home'};
var _user$project$Route$route = _evancz$url_parser$UrlParser$oneOf(
	{
		ctor: '::',
		_0: A2(
			_evancz$url_parser$UrlParser$map,
			_user$project$Route$Home,
			_evancz$url_parser$UrlParser$s('home')),
		_1: {
			ctor: '::',
			_0: A2(
				_evancz$url_parser$UrlParser$map,
				_user$project$Route$Login,
				_evancz$url_parser$UrlParser$s('login')),
			_1: {
				ctor: '::',
				_0: A2(
					_evancz$url_parser$UrlParser$map,
					_user$project$Route$Budget,
					_evancz$url_parser$UrlParser$s('budget')),
				_1: {
					ctor: '::',
					_0: A2(
						_evancz$url_parser$UrlParser$map,
						_user$project$Route$Expense,
						_evancz$url_parser$UrlParser$s('expense')),
					_1: {
						ctor: '::',
						_0: A2(
							_evancz$url_parser$UrlParser$map,
							_user$project$Route$Profile,
							_evancz$url_parser$UrlParser$s('profile')),
						_1: {
							ctor: '::',
							_0: A2(
								_evancz$url_parser$UrlParser$map,
								_user$project$Route$ExpenseDetail,
								A2(
									_evancz$url_parser$UrlParser_ops['</>'],
									_evancz$url_parser$UrlParser$s('expense'),
									_user$project$Data_Allocation$slugParser)),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	});
var _user$project$Route$fromLocation = function (location) {
	return _elm_lang$core$String$isEmpty(location.hash) ? _elm_lang$core$Maybe$Just(_user$project$Route$Home) : A2(
		_elm_lang$core$Debug$log,
		'Route',
		A2(
			_evancz$url_parser$UrlParser$parseHash,
			_user$project$Route$route,
			A2(_elm_lang$core$Debug$log, 'Location', location)));
};

var _user$project$View_Page$viewFooter = A2(
	_rundis$elm_bootstrap$Bootstrap_Grid$containerFluid,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('mt-4'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('attribution small text-muted'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Stoneship, LLC. 2017. MIT license.'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}),
		_1: {ctor: '[]'}
	});
var _user$project$View_Page$activeLinkIf = F2(
	function (activePage, page) {
		return _elm_lang$core$Native_Utils.eq(activePage, page) ? _rundis$elm_bootstrap$Bootstrap_Navbar$itemLinkActive : _rundis$elm_bootstrap$Bootstrap_Navbar$itemLink;
	});
var _user$project$View_Page$Other = {ctor: 'Other'};
var _user$project$View_Page$Profile = {ctor: 'Profile'};
var _user$project$View_Page$Login = {ctor: 'Login'};
var _user$project$View_Page$Expense = {ctor: 'Expense'};
var _user$project$View_Page$Budget = {ctor: 'Budget'};
var _user$project$View_Page$viewHeader = F5(
	function (toMsg, navState, page, session, isLoading) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Navbar$view,
			navState,
			A2(
				_rundis$elm_bootstrap$Bootstrap_Navbar$items,
				function () {
					var _p0 = session.user;
					if (_p0.ctor === 'Just') {
						return {
							ctor: '::',
							_0: A4(
								_user$project$View_Page$activeLinkIf,
								_user$project$View_Page$Profile,
								page,
								{
									ctor: '::',
									_0: _user$project$Route$href(_user$project$Route$Profile),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(_p0._0.fullname),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A4(
									_user$project$View_Page$activeLinkIf,
									_user$project$View_Page$Budget,
									page,
									{
										ctor: '::',
										_0: _user$project$Route$href(_user$project$Route$Budget),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Income'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A4(
										_user$project$View_Page$activeLinkIf,
										_user$project$View_Page$Expense,
										page,
										{
											ctor: '::',
											_0: _user$project$Route$href(_user$project$Route$Expense),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Expenses'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						};
					} else {
						return {
							ctor: '::',
							_0: A4(
								_user$project$View_Page$activeLinkIf,
								_user$project$View_Page$Login,
								page,
								{
									ctor: '::',
									_0: _user$project$Route$href(_user$project$Route$Login),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Sign in'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						};
					}
				}(),
				A3(
					_rundis$elm_bootstrap$Bootstrap_Navbar$brand,
					{
						ctor: '::',
						_0: _user$project$Route$href(_user$project$Route$Home),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Bloomcraft'),
						_1: {ctor: '[]'}
					},
					_rundis$elm_bootstrap$Bootstrap_Navbar$withAnimation(
						_rundis$elm_bootstrap$Bootstrap_Navbar$config(toMsg)))));
	});
var _user$project$View_Page$frame = F6(
	function (toMsg, navState, isLoading, session, page, content) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A5(_user$project$View_Page$viewHeader, toMsg, navState, page, session, isLoading),
				_1: {
					ctor: '::',
					_0: content,
					_1: {
						ctor: '::',
						_0: _user$project$View_Page$viewFooter,
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$View_Page$Home = {ctor: 'Home'};

var _user$project$Page_Errored$view = F2(
	function (session, _p0) {
		var _p1 = _p0;
		return A2(
			_elm_lang$html$Html$main_,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$id('content'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$tabindex(-1),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$h1,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Error Loading Page'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('row'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(_p1._0.errorMessage),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Page_Errored$Model = F2(
	function (a, b) {
		return {activePage: a, errorMessage: b};
	});
var _user$project$Page_Errored$PageLoadError = function (a) {
	return {ctor: 'PageLoadError', _0: a};
};
var _user$project$Page_Errored$pageLoadError = F2(
	function (activePage, errorMessage) {
		return _user$project$Page_Errored$PageLoadError(
			{activePage: activePage, errorMessage: errorMessage});
	});

var _user$project$Request_Helpers$apiUrl = function (url) {
	return A2(_elm_lang$core$Basics_ops['++'], '/process/api', url);
};

var _user$project$Request_Budget$changeRent = F2(
	function (newRent, session) {
		var body = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: A2(
					_user$project$Util_ops['=>'],
					'new_rent',
					_elm_lang$core$Json_Encode$int(newRent)),
				_1: {ctor: '[]'}
			});
		return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
			A2(
				_user$project$Data_Session$withAuthorization,
				session,
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withExpect,
					_elm_lang$http$Http$expectJson(
						_elm_lang$core$Json_Decode$succeed(
							{ctor: '_Tuple0'})),
					A2(
						_lukewestby$elm_http_builder$HttpBuilder$withJsonBody,
						body,
						_lukewestby$elm_http_builder$HttpBuilder$post(
							_user$project$Request_Helpers$apiUrl('/rent.json'))))));
	});
var _user$project$Request_Budget$budget = _lukewestby$elm_http_builder$HttpBuilder$toRequest(
	A2(
		_lukewestby$elm_http_builder$HttpBuilder$withExpect,
		_elm_lang$http$Http$expectJson(
			A2(_elm_lang$core$Json_Decode$field, 'budget', _user$project$Data_Budget$decoder)),
		_lukewestby$elm_http_builder$HttpBuilder$get(
			_user$project$Request_Helpers$apiUrl('/budget.json'))));

var _user$project$View_BarPlot$lerp = F5(
	function (u, d0, d1, r0, r1) {
		var ud = (u - d0) / (d1 - d0);
		return (r1 * ud) + (r0 * (1 - ud));
	});
var _user$project$View_BarPlot$polyPoints = function (points) {
	return A2(
		_elm_lang$core$String$join,
		' ',
		A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p1._0),
					A2(
						_elm_lang$core$Basics_ops['++'],
						', ',
						_elm_lang$core$Basics$toString(_p1._1)));
			},
			points));
};
var _user$project$View_BarPlot$annotationOptionBuilder = F2(
	function (option, optionSet) {
		var _p2 = option;
		switch (_p2.ctor) {
			case 'Text':
				return _elm_lang$core$Native_Utils.update(
					optionSet,
					{text: _p2._0});
			case 'Location':
				return _elm_lang$core$Native_Utils.update(
					optionSet,
					{location: _p2._0});
			case 'Type':
				return _elm_lang$core$Native_Utils.update(
					optionSet,
					{atype: _p2._0});
			default:
				return _elm_lang$core$Native_Utils.update(
					optionSet,
					{fontSize: _p2._0});
		}
	});
var _user$project$View_BarPlot$plotToVis = F2(
	function (params, value) {
		return A5(_user$project$View_BarPlot$lerp, value, params.minValue, params.maxValue, 0, 100);
	});
var _user$project$View_BarPlot$bracket = F4(
	function (params, location, pleft, pright) {
		var position = function () {
			var _p3 = location;
			switch (_p3.ctor) {
				case 'Above':
					return 'translate (0,-0.5) scale(1, -1)';
				case 'Below':
					return 'translate (0, 10.5)';
				default:
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'translate (0, ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(params.height / 2),
							')'));
			}
		}();
		var right = A2(_user$project$View_BarPlot$plotToVis, params, pright);
		var left = A2(_user$project$View_BarPlot$plotToVis, params, pleft);
		var midpoint = (left + right) / 2;
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(position),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$polyline,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$stroke('#000000'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeWidth('.5'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('none'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$points(
										_user$project$View_BarPlot$polyPoints(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: left, _1: 0},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: A2(_elm_lang$core$Basics$min, left + 1.5, midpoint),
														_1: 1.5
													},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: A2(_elm_lang$core$Basics$max, right - 1.5, midpoint),
															_1: 1.5
														},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: right, _1: 0},
															_1: {ctor: '[]'}
														}
													}
												}
											})),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$line,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$x1(
								_elm_lang$core$Basics$toString(midpoint)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y1('1.5'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$x2(
										_elm_lang$core$Basics$toString(midpoint)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$y2('2.5'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke('#000000'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$strokeWidth('0.5'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('none'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$View_BarPlot$tupleMap2 = F2(
	function (f, _p4) {
		var _p5 = _p4;
		return {
			ctor: '_Tuple2',
			_0: f(_p5._0),
			_1: f(_p5._1)
		};
	});
var _user$project$View_BarPlot$drawSeparator = F3(
	function (params, textLoc, location) {
		var _p6 = A2(
			_user$project$View_BarPlot$tupleMap2,
			_elm_lang$core$Basics$toString,
			function () {
				var _p7 = textLoc;
				switch (_p7.ctor) {
					case 'Above':
						return {ctor: '_Tuple2', _0: -3, _1: params.height};
					case 'Below':
						return {ctor: '_Tuple2', _0: 0, _1: params.height + 3};
					default:
						return {ctor: '_Tuple2', _0: 0, _1: params.height};
				}
			}());
		var y1s = _p6._0;
		var y2s = _p6._1;
		var pos = _elm_lang$core$Basics$toString(
			A2(_user$project$View_BarPlot$plotToVis, params, location));
		return A2(
			_elm_lang$svg$Svg$line,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$x1(pos),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$y1(y1s),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$x2(pos),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y2(y2s),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth('.5'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('none'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke('#000000'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'});
	});
var _user$project$View_BarPlot$drawBox = F2(
	function (params, _p8) {
		var _p9 = _p8;
		var _p13 = _p9._1;
		var _p12 = _p9._0;
		var _p11 = _p9._2;
		var h = _elm_lang$core$Basics$toString(params.height);
		var v1 = A2(
			_user$project$View_BarPlot$plotToVis,
			params,
			A2(_elm_lang$core$Basics$max, _p12, _p13));
		var v0 = A2(
			_user$project$View_BarPlot$plotToVis,
			params,
			A2(_elm_lang$core$Basics$min, _p13, _p12));
		return A2(
			_elm_lang$svg$Svg$rect,
			A2(
				_elm_lang$core$List$append,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x(
						_elm_lang$core$Basics$toString(v0)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y('0'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$width(
								_elm_lang$core$Basics$toString(v1 - v0)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$height(
									_elm_lang$core$Basics$toString(params.height)),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				function () {
					var _p10 = params.filled;
					if (_p10 === true) {
						return {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(_p11),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
								_1: {ctor: '[]'}
							}
						};
					} else {
						return {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill('none'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(_p11),
								_1: {ctor: '[]'}
							}
						};
					}
				}()),
			{ctor: '[]'});
	});
var _user$project$View_BarPlot$defaultPlotParams = {minValue: 0, maxValue: 0, height: 10, filled: true};
var _user$project$View_BarPlot$BarPlot = F4(
	function (a, b, c, d) {
		return {minValue: a, maxValue: b, height: c, filled: d};
	});
var _user$project$View_BarPlot$AnnotationOptions = F4(
	function (a, b, c, d) {
		return {location: a, atype: b, text: c, fontSize: d};
	});
var _user$project$View_BarPlot$Right = {ctor: 'Right'};
var _user$project$View_BarPlot$Left = {ctor: 'Left'};
var _user$project$View_BarPlot$Inside = function (a) {
	return {ctor: 'Inside', _0: a};
};
var _user$project$View_BarPlot$Below = {ctor: 'Below'};
var _user$project$View_BarPlot$Above = {ctor: 'Above'};
var _user$project$View_BarPlot$TextOnly = function (a) {
	return {ctor: 'TextOnly', _0: a};
};
var _user$project$View_BarPlot$defaultOptions = {
	location: _user$project$View_BarPlot$Below,
	atype: _user$project$View_BarPlot$TextOnly(0),
	text: '',
	fontSize: '5px'
};
var _user$project$View_BarPlot$annotate = F2(
	function (params, optList) {
		var options = A3(_elm_lang$core$List$foldr, _user$project$View_BarPlot$annotationOptionBuilder, _user$project$View_BarPlot$defaultOptions, optList);
		var initTextCenter = A2(
			_user$project$View_BarPlot$plotToVis,
			params,
			function () {
				var _p14 = options.atype;
				switch (_p14.ctor) {
					case 'Bracket':
						return (_p14._0 + _p14._1) / 2;
					case 'Separator':
						return _p14._0;
					default:
						return _p14._0;
				}
			}());
		var textCenter = _elm_lang$core$Basics$toString(
			function () {
				var _p15 = options.location;
				if (_p15.ctor === 'Inside') {
					if (_p15._0.ctor === 'Left') {
						return initTextCenter - 1;
					} else {
						return initTextCenter + 1;
					}
				} else {
					return initTextCenter;
				}
			}());
		var _p16 = function () {
			var _p17 = options.location;
			switch (_p17.ctor) {
				case 'Above':
					return {ctor: '_Tuple2', _0: -4, _1: 'bottom'};
				case 'Below':
					return {ctor: '_Tuple2', _0: params.height + 3.5, _1: 'hanging'};
				default:
					return {ctor: '_Tuple2', _0: params.height / 2, _1: 'central'};
			}
		}();
		var yPos = _p16._0;
		var textBaseline = _p16._1;
		var anchor = function () {
			var _p18 = options.location;
			if (_p18.ctor === 'Inside') {
				if (_p18._0.ctor === 'Left') {
					return 'end';
				} else {
					return 'start';
				}
			} else {
				return 'middle';
			}
		}();
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: function () {
						var _p19 = options.atype;
						switch (_p19.ctor) {
							case 'Bracket':
								return {
									ctor: '::',
									_0: A4(_user$project$View_BarPlot$bracket, params, options.location, _p19._0, _p19._1),
									_1: {ctor: '[]'}
								};
							case 'Separator':
								return {
									ctor: '::',
									_0: A3(_user$project$View_BarPlot$drawSeparator, params, options.location, _p19._0),
									_1: {ctor: '[]'}
								};
							default:
								return {ctor: '[]'};
						}
					}(),
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$text_,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$x(textCenter),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$y(
											_elm_lang$core$Basics$toString(yPos)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$textAnchor(anchor),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$alignmentBaseline(textBaseline),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$style(
														A2(_elm_lang$core$Basics_ops['++'], 'font-size: ', options.fontSize)),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$pointerEvents('none'),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg$text(options.text),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				}));
	});
var _user$project$View_BarPlot$Separator = function (a) {
	return {ctor: 'Separator', _0: a};
};
var _user$project$View_BarPlot$Bracket = F2(
	function (a, b) {
		return {ctor: 'Bracket', _0: a, _1: b};
	});
var _user$project$View_BarPlot$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _user$project$View_BarPlot$Type = function (a) {
	return {ctor: 'Type', _0: a};
};
var _user$project$View_BarPlot$Location = function (a) {
	return {ctor: 'Location', _0: a};
};
var _user$project$View_BarPlot$Text = function (a) {
	return {ctor: 'Text', _0: a};
};

var _user$project$View_Colors$nextColor = function (wheel) {
	var _p0 = wheel;
	if (_p0.ctor === '[]') {
		return '#FF0000';
	} else {
		return _p0._0;
	}
};
var _user$project$View_Colors$defaultColorWheel = {
	ctor: '::',
	_0: '#1D9382',
	_1: {
		ctor: '::',
		_0: '#3933A3',
		_1: {
			ctor: '::',
			_0: '#93D72B',
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$View_Colors$lightRedColor = '#EE494B';
var _user$project$View_Colors$redColor = '#CE292B';
var _user$project$View_Colors$darkGreenColor = '#16660D';
var _user$project$View_Colors$greenColor = '#30CE1E';
var _user$project$View_Colors$greyColor = '#808080';
var _user$project$View_Colors$lightBlueColor = '#3B70FE';
var _user$project$View_Colors$blueColor = '#0B40CE';

var _user$project$Page_Budget$interpolateBudget = F3(
	function (startBudget, u, targetBudget) {
		var findLease = F2(
			function (leaseList, targetLease) {
				var _p0 = A2(
					_elm_lang$core$List$partition,
					function (lease) {
						return _elm_lang$core$Native_Utils.eq(lease.name, targetLease.name);
					},
					leaseList);
				var matched = _p0._0;
				var _p1 = matched;
				if ((_p1.ctor === '::') && (_p1._1.ctor === '[]')) {
					return _elm_lang$core$Maybe$Just(_p1._0);
				} else {
					return _elm_lang$core$Maybe$Nothing;
				}
			});
		var interpolateLease = F3(
			function (u, maybeSL, tL) {
				var _p2 = maybeSL;
				if (_p2.ctor === 'Just') {
					var _p3 = _p2._0;
					return _elm_lang$core$Native_Utils.update(
						tL,
						{
							currentRent: A3(_user$project$Animation$lerp, _p3.currentRent, tL.currentRent, u),
							proposedRent: A3(_user$project$Animation$lerp, _p3.proposedRent, tL.proposedRent, u)
						});
				} else {
					return tL;
				}
			});
		var interpIfFound = F3(
			function (u, sLlist, tL) {
				return A3(
					interpolateLease,
					u,
					A2(findLease, sLlist, tL),
					tL);
			});
		var interpolateLeases = F3(
			function (u, sLList, tLList) {
				return A2(
					_elm_lang$core$List$map,
					A2(interpIfFound, u, sLList),
					tLList);
			});
		var tB = targetBudget;
		var sB = startBudget;
		return _elm_lang$core$Native_Utils.update(
			tB,
			{
				coreExpenses: A3(_user$project$Animation$lerp, sB.coreExpenses, tB.coreExpenses, u),
				leases: A3(interpolateLeases, u, sB.leases, tB.leases)
			});
	});
var _user$project$Page_Budget$validateRent = function (input) {
	if (_elm_lang$core$Native_Utils.eq(
		_elm_lang$core$String$length(input),
		0)) {
		return _elm_lang$core$Result$Err('');
	} else {
		var _p4 = _elm_lang$core$String$toInt(input);
		if (_p4.ctor === 'Ok') {
			var _p5 = _p4._0;
			return (_elm_lang$core$Native_Utils.cmp(_p5, 0) > -1) ? _elm_lang$core$Result$Ok(_p5) : _elm_lang$core$Result$Err('Nice try.  Rent can\'t be negative');
		} else {
			return _elm_lang$core$Result$Err('Rent must be a whole number');
		}
	}
};
var _user$project$Page_Budget$summaryRow = F2(
	function (lStr, rStr) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$row,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$col,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('pr-0'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('text-right'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(lStr),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(rStr),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Page_Budget$totalIncome = function (budget) {
	return _elm_lang$core$List$sum(
		A2(
			_elm_lang$core$List$map,
			function (t) {
				return t.proposedRent;
			},
			budget.leases));
};
var _user$project$Page_Budget$startingIncome = function (budget) {
	return _elm_lang$core$List$sum(
		A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.currentRent;
			},
			budget.leases));
};
var _user$project$Page_Budget$requiredPctIncrease = function (budget) {
	var expenses = budget.coreExpenses;
	var income = _user$project$Page_Budget$startingIncome(budget);
	return A2(_elm_lang$core$Basics$max, 0, (expenses - income) / income);
};
var _user$project$Page_Budget$pctStr = function (x) {
	var signStr = function (x) {
		return (_elm_lang$core$Native_Utils.cmp(x, 0) > 0) ? '+' : '';
	};
	return A2(
		_elm_lang$core$Basics_ops['++'],
		signStr(x),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(
				_elm_lang$core$Basics$round(x * 100)),
			'%'));
};
var _user$project$Page_Budget$change = function (lease) {
	return (lease.proposedRent - lease.currentRent) / lease.currentRent;
};
var _user$project$Page_Budget$viewRent = F3(
	function (pp, lease, baseLine) {
		var color = (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Basics$round(lease.proposedRent),
			_elm_lang$core$Basics$floor((1 + baseLine) * lease.currentRent)) > -1) ? _user$project$View_Colors$blueColor : _user$project$View_Colors$redColor;
		var val = _user$project$Page_Budget$change(lease);
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			A2(
				_elm_lang$core$List$append,
				(_elm_lang$core$Native_Utils.cmp(val, baseLine) > 0) ? {
					ctor: '::',
					_0: A2(
						_user$project$View_BarPlot$drawBox,
						pp,
						{ctor: '_Tuple3', _0: 0, _1: baseLine, _2: _user$project$View_Colors$blueColor}),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$View_BarPlot$drawBox,
							pp,
							{ctor: '_Tuple3', _0: baseLine, _1: val, _2: _user$project$View_Colors$lightBlueColor}),
						_1: {ctor: '[]'}
					}
				} : {
					ctor: '::',
					_0: A2(
						_user$project$View_BarPlot$drawBox,
						pp,
						{ctor: '_Tuple3', _0: 0, _1: val, _2: _user$project$View_Colors$blueColor}),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$View_BarPlot$drawBox,
							pp,
							{ctor: '_Tuple3', _0: val, _1: baseLine, _2: _user$project$View_Colors$lightRedColor}),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_user$project$View_BarPlot$annotate,
						pp,
						{
							ctor: '::',
							_0: _user$project$View_BarPlot$Text(lease.name),
							_1: {
								ctor: '::',
								_0: _user$project$View_BarPlot$Location(
									_user$project$View_BarPlot$Inside(_user$project$View_BarPlot$Right)),
								_1: {
									ctor: '::',
									_0: _user$project$View_BarPlot$Type(
										_user$project$View_BarPlot$TextOnly(0)),
									_1: {
										ctor: '::',
										_0: _user$project$View_BarPlot$Size('3px'),
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				}));
	});
var _user$project$Page_Budget$compareRentsByPctChangePlot = function (budget) {
	var leaseName = function (lease) {
		return lease.name;
	};
	var increasePct = _user$project$Page_Budget$requiredPctIncrease(budget);
	var unsortedLeases = budget.leases;
	var sortedLeases = _elm_lang$core$List$reverse(
		A2(_elm_lang$core$List$sortBy, _user$project$Page_Budget$change, unsortedLeases));
	var leasePair = A2(
		_elm_lang$core$List$partition,
		function (_p6) {
			return function (n) {
				return A2(_elm_lang$core$List$member, n, budget.leaseMember);
			}(
				function (_) {
					return _.name;
				}(_p6));
		},
		sortedLeases);
	var _p7 = leasePair;
	var usersLeases = _p7._0;
	var otherLeases = _p7._1;
	var leases = A2(_elm_lang$core$List$append, usersLeases, otherLeases);
	var changes = A2(_elm_lang$core$List$map, _user$project$Page_Budget$change, leases);
	var maxChange = A2(
		_elm_lang$core$Basics$max,
		increasePct * 1.2,
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$maximum(changes)));
	var minChange = A2(
		_elm_lang$core$Basics$min,
		0,
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$minimum(changes)));
	var barWidth = _elm_lang$core$Native_Utils.update(
		_user$project$View_BarPlot$defaultPlotParams,
		{minValue: minChange, maxValue: maxChange});
	var pp = _elm_lang$core$Native_Utils.update(
		barWidth,
		{height: 5});
	var drawLease = F2(
		function (pos, lease) {
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'translate (0, ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Basics$toFloat(pos) * (pp.height + 1)),
								')'))),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A3(_user$project$Page_Budget$viewRent, pp, lease, increasePct),
					_1: {ctor: '[]'}
				});
		});
	var nLease = _elm_lang$core$List$length(leases);
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$viewBox(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'0 0 120 ',
					_elm_lang$core$Basics$toString(
						(_elm_lang$core$Basics$toFloat(nLease) * (pp.height + 1)) + 10))),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('100%'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform('translate(20,10)'),
					_1: {ctor: '[]'}
				},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: A2(_elm_lang$core$List$indexedMap, drawLease, leases),
						_1: {
							ctor: '::',
							_0: {
								ctor: '::',
								_0: A2(
									_user$project$View_BarPlot$annotate,
									_elm_lang$core$Native_Utils.update(
										barWidth,
										{
											height: _elm_lang$core$Basics$toFloat(nLease) * (pp.height + 1)
										}),
									{
										ctor: '::',
										_0: _user$project$View_BarPlot$Text('Default New Rent'),
										_1: {
											ctor: '::',
											_0: _user$project$View_BarPlot$Location(_user$project$View_BarPlot$Above),
											_1: {
												ctor: '::',
												_0: _user$project$View_BarPlot$Type(
													_user$project$View_BarPlot$Separator(increasePct)),
												_1: {
													ctor: '::',
													_0: _user$project$View_BarPlot$Size('3px'),
													_1: {ctor: '[]'}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$View_BarPlot$annotate,
										_elm_lang$core$Native_Utils.update(
											barWidth,
											{
												height: _elm_lang$core$Basics$toFloat(nLease) * (pp.height + 1)
											}),
										{
											ctor: '::',
											_0: _user$project$View_BarPlot$Text('Current Rent'),
											_1: {
												ctor: '::',
												_0: _user$project$View_BarPlot$Location(_user$project$View_BarPlot$Above),
												_1: {
													ctor: '::',
													_0: _user$project$View_BarPlot$Type(
														_user$project$View_BarPlot$Separator(0)),
													_1: {
														ctor: '::',
														_0: _user$project$View_BarPlot$Size('3px'),
														_1: {ctor: '[]'}
													}
												}
											}
										}),
									_1: {ctor: '[]'}
								}
							},
							_1: {ctor: '[]'}
						}
					})),
			_1: {ctor: '[]'}
		});
};
var _user$project$Page_Budget$compareRentsView = function (budget) {
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					_user$project$Page_Budget$compareRentsByPctChangePlot(budget)),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Proposed New Rents'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_Budget$topLineSvg = function (budget) {
	var currentIncome = _user$project$Page_Budget$startingIncome(budget);
	var coreExpenses = budget.coreExpenses;
	var income = _user$project$Page_Budget$totalIncome(budget);
	var scaleMax = 1.25 * A2(_elm_lang$core$Basics$max, income, coreExpenses);
	var plotParam = _elm_lang$core$Native_Utils.update(
		_user$project$View_BarPlot$defaultPlotParams,
		{maxValue: scaleMax});
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$row,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Grid$col,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$svg,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 110 30'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('100%'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$g,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$transform('translate(5,10)'),
									_1: {ctor: '[]'}
								},
								A2(
									_elm_lang$core$List$append,
									(_elm_lang$core$Native_Utils.cmp(income, currentIncome) > 0) ? {
										ctor: '::',
										_0: A2(
											_user$project$View_BarPlot$annotate,
											plotParam,
											{
												ctor: '::',
												_0: _user$project$View_BarPlot$Text('New Income'),
												_1: {
													ctor: '::',
													_0: _user$project$View_BarPlot$Type(
														A2(_user$project$View_BarPlot$Bracket, currentIncome, income)),
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									} : {
										ctor: '::',
										_0: A2(
											_user$project$View_BarPlot$annotate,
											plotParam,
											{
												ctor: '::',
												_0: _user$project$View_BarPlot$Type(
													_user$project$View_BarPlot$TextOnly(0)),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									},
									(_elm_lang$core$Native_Utils.cmp(income, coreExpenses) > -1) ? {
										ctor: '::',
										_0: A2(
											_user$project$View_BarPlot$drawBox,
											plotParam,
											{ctor: '_Tuple3', _0: 0, _1: coreExpenses, _2: _user$project$View_Colors$redColor}),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$View_BarPlot$drawBox,
												plotParam,
												{ctor: '_Tuple3', _0: 0, _1: income, _2: _user$project$View_Colors$lightBlueColor}),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$View_BarPlot$drawBox,
													plotParam,
													{ctor: '_Tuple3', _0: 0, _1: currentIncome, _2: _user$project$View_Colors$blueColor}),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$View_BarPlot$annotate,
														plotParam,
														{
															ctor: '::',
															_0: _user$project$View_BarPlot$Text('Current Income'),
															_1: {
																ctor: '::',
																_0: _user$project$View_BarPlot$Type(
																	A2(_user$project$View_BarPlot$Bracket, 0, currentIncome)),
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$View_BarPlot$annotate,
															plotParam,
															{
																ctor: '::',
																_0: _user$project$View_BarPlot$Text('Core Expenses'),
																_1: {
																	ctor: '::',
																	_0: _user$project$View_BarPlot$Type(
																		A2(_user$project$View_BarPlot$Bracket, 0, coreExpenses)),
																	_1: {
																		ctor: '::',
																		_0: _user$project$View_BarPlot$Location(_user$project$View_BarPlot$Above),
																		_1: {ctor: '[]'}
																	}
																}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_user$project$View_BarPlot$annotate,
																plotParam,
																{
																	ctor: '::',
																	_0: _user$project$View_BarPlot$Text('Surplus'),
																	_1: {
																		ctor: '::',
																		_0: _user$project$View_BarPlot$Type(
																			A2(_user$project$View_BarPlot$Bracket, coreExpenses, income)),
																		_1: {
																			ctor: '::',
																			_0: _user$project$View_BarPlot$Location(_user$project$View_BarPlot$Above),
																			_1: {ctor: '[]'}
																		}
																	}
																}),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									} : {
										ctor: '::',
										_0: A2(
											_user$project$View_BarPlot$drawBox,
											plotParam,
											{ctor: '_Tuple3', _0: 0, _1: coreExpenses, _2: _user$project$View_Colors$redColor}),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$View_BarPlot$drawBox,
												plotParam,
												{ctor: '_Tuple3', _0: 0, _1: income, _2: _user$project$View_Colors$lightBlueColor}),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$View_BarPlot$drawBox,
													plotParam,
													{ctor: '_Tuple3', _0: 0, _1: currentIncome, _2: _user$project$View_Colors$blueColor}),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$View_BarPlot$annotate,
														plotParam,
														{
															ctor: '::',
															_0: _user$project$View_BarPlot$Text('Current Income'),
															_1: {
																ctor: '::',
																_0: _user$project$View_BarPlot$Type(
																	A2(_user$project$View_BarPlot$Bracket, 0, currentIncome)),
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$View_BarPlot$annotate,
															plotParam,
															{
																ctor: '::',
																_0: _user$project$View_BarPlot$Text('Core Expenses'),
																_1: {
																	ctor: '::',
																	_0: _user$project$View_BarPlot$Type(
																		A2(_user$project$View_BarPlot$Bracket, 0, coreExpenses)),
																	_1: {
																		ctor: '::',
																		_0: _user$project$View_BarPlot$Location(_user$project$View_BarPlot$Above),
																		_1: {ctor: '[]'}
																	}
																}
															}),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									})),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Page_Budget$detailSummaryText = F2(
	function (lease, defaultRent) {
		var moreOrLess = function (val) {
			return (_elm_lang$core$Native_Utils.cmp(val, 0) > -1) ? 'more' : 'less';
		};
		var rentDiff = function (lease) {
			return lease.proposedRent - lease.currentRent;
		};
		var raiseOrLower = function (lease) {
			return (_elm_lang$core$Native_Utils.cmp(
				rentDiff(lease),
				0) > -1) ? 'raise' : 'lower';
		};
		return _elm_lang$html$Html$text(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'The current proposal is to ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					raiseOrLower(lease),
					A2(
						_elm_lang$core$Basics_ops['++'],
						' ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							lease.name,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'\'s monthly rent by $',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(
										_elm_lang$core$Basics$round(
											_elm_lang$core$Basics$abs(
												rentDiff(lease)))),
									A2(
										_elm_lang$core$Basics_ops['++'],
										' to $',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(
												_elm_lang$core$Basics$round(lease.proposedRent)),
											A2(
												_elm_lang$core$Basics_ops['++'],
												'.  This is $',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_elm_lang$core$Basics$toString(
														_elm_lang$core$Basics$round(
															_elm_lang$core$Basics$abs(lease.proposedRent - defaultRent))),
													A2(
														_elm_lang$core$Basics_ops['++'],
														' ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															moreOrLess(lease.proposedRent - defaultRent),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' than the minimum recommended new rent of $',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_elm_lang$core$Basics$toString(
																		_elm_lang$core$Basics$round(defaultRent)),
																	'.')))))))))))))));
	});
var _user$project$Page_Budget$explainerText = function (budget) {
	var changeWord = function (val) {
		return (_elm_lang$core$Native_Utils.cmp(val, 0) > -1) ? 'an increase' : 'a decrease';
	};
	var increaseOrDecrease = function (val) {
		return (_elm_lang$core$Native_Utils.cmp(val, 0) > -1) ? 'increase' : 'decrease';
	};
	var surplusOrDeficit = function (val) {
		return (_elm_lang$core$Native_Utils.cmp(val, 0) > -1) ? 'surplus' : 'deficit';
	};
	var format = function (num) {
		var intStr = _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$round(num * 1000));
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$String$left, 2, intStr),
			A2(
				_elm_lang$core$Basics_ops['++'],
				'.',
				A2(_elm_lang$core$String$right, 1, intStr)));
	};
	var showPct = function (num) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			format(num),
			'%');
	};
	var defaultIncreasePct = showPct(
		_user$project$Page_Budget$requiredPctIncrease(budget));
	var currentIncome = _user$project$Page_Budget$startingIncome(budget);
	var coreExpense = budget.coreExpenses;
	var income = _user$project$Page_Budget$totalIncome(budget);
	var summaryExplainerText = function (budget) {
		return _elm_lang$html$Html$text(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'This page shows proposed changes to rents, and how those changes would affect Bloomcraft\'s budget.',
				A2(
					_elm_lang$core$Basics_ops['++'],
					' To cover our core expenses, the proposed budget must ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						increaseOrDecrease(coreExpense - currentIncome),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' total rental income by $',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(coreExpense - currentIncome),
								A2(
									_elm_lang$core$Basics_ops['++'],
									', ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										changeWord(
											_user$project$Page_Budget$requiredPctIncrease(budget)),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' of ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												defaultIncreasePct,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'.  Currently the proposed rents will ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														increaseOrDecrease(income - currentIncome),
														A2(
															_elm_lang$core$Basics_ops['++'],
															' income by $',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_elm_lang$core$Basics$toString(
																	_elm_lang$core$Basics$round(income - currentIncome)),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'.  This change will create a projected $',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_elm_lang$core$Basics$toString(
																			_elm_lang$core$Basics$abs(
																				_elm_lang$core$Basics$round(income - coreExpense))),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' ',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				surplusOrDeficit(income - coreExpense),
																				A2(_elm_lang$core$Basics_ops['++'], '.', ' If we have a surplus, those funds will be available for discretionary spending at the end of the upcoming quarter.')))))))))))))))))));
	};
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Grid$row,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Grid$col,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _user$project$Page_Budget$topLineSvg(budget),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('lead'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: summaryExplainerText(budget),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						})),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Summary of Proposed Budget'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_Budget$animate = function (_p8) {
	var _p9 = _p8;
	var _p13 = _p9.budget;
	var _p10 = _p9.animation;
	if (_p10.ctor === 'Just') {
		var _p12 = _p10._0;
		var _p11 = _p12.startTime;
		if (_p11.ctor === 'Just') {
			return A3(_p12.budget, _p11._0, _p9.time, _p13);
		} else {
			return A3(_p12.budget, 0, 0, _p13);
		}
	} else {
		return _p13;
	}
};
var _user$project$Page_Budget$init = function () {
	var initModel = F2(
		function (budget, time) {
			return {
				budget: budget,
				requestedRent: _elm_lang$core$Result$Err(''),
				time: time,
				animation: _elm_lang$core$Maybe$Nothing
			};
		});
	var handleLoadError = function (err) {
		var l = A2(_elm_lang$core$Debug$log, 'Budget Load Err', err);
		return A2(_user$project$Page_Errored$pageLoadError, _user$project$View_Page$Budget, 'Failed to load budget');
	};
	var loadBudget = _elm_lang$http$Http$toTask(_user$project$Request_Budget$budget);
	return A2(
		_elm_lang$core$Task$mapError,
		handleLoadError,
		A3(_elm_lang$core$Task$map2, initModel, loadBudget, _elm_lang$core$Time$now));
}();
var _user$project$Page_Budget$Model = F4(
	function (a, b, c, d) {
		return {budget: a, requestedRent: b, time: c, animation: d};
	});
var _user$project$Page_Budget$Animation = F2(
	function (a, b) {
		return {startTime: a, budget: b};
	});
var _user$project$Page_Budget$Animate = function (a) {
	return {ctor: 'Animate', _0: a};
};
var _user$project$Page_Budget$subscriptions = function (model) {
	var _p14 = model.animation;
	if (_p14.ctor === 'Just') {
		return _elm_lang$animation_frame$AnimationFrame$times(_user$project$Page_Budget$Animate);
	} else {
		return _elm_lang$core$Platform_Sub$none;
	}
};
var _user$project$Page_Budget$ChangeRent = {ctor: 'ChangeRent'};
var _user$project$Page_Budget$UpdateRentInput = function (a) {
	return {ctor: 'UpdateRentInput', _0: a};
};
var _user$project$Page_Budget$rentInputView = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$view(
				A2(
					_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$successors,
					{
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$button,
							A2(
								_elm_lang$core$List$append,
								function () {
									var _p15 = model.requestedRent;
									if (_p15.ctor === 'Ok') {
										return {ctor: '[]'};
									} else {
										return {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Button$disabled(true),
											_1: {ctor: '[]'}
										};
									}
								}(),
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$primary,
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Page_Budget$ChangeRent),
										_1: {ctor: '[]'}
									}
								}),
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Change'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					A2(
						_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$predecessors,
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$span,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('$'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$config(
							_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$number(
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$placeholder(
										_elm_lang$core$Basics$toString(0)),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_Budget$UpdateRentInput),
										_1: {ctor: '[]'}
									}
								}))))),
			_1: {
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Form$validationText,
					{ctor: '[]'},
					function () {
						var _p16 = model.requestedRent;
						if (_p16.ctor === 'Ok') {
							return {ctor: '[]'};
						} else {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html$text(_p16._0),
								_1: {ctor: '[]'}
							};
						}
					}()),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Page_Budget$changeRentView = F3(
	function (model, budget, viewLease) {
		var changeRentButton = F2(
			function (budget, adminLease) {
				return _rundis$elm_bootstrap$Bootstrap_Alert$info(
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Change proposed rent'),
						_1: {
							ctor: '::',
							_0: _user$project$Page_Budget$rentInputView(model),
							_1: {ctor: '[]'}
						}
					});
			});
		var nonAdminView = A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('mt-4'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Alert$info(
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								viewLease.adminName,
								A2(
									_elm_lang$core$Basics_ops['++'],
									' is able to change the proposed ',
									A2(_elm_lang$core$Basics_ops['++'], viewLease.name, ' rent')))),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
		var _p17 = budget.leaseAdmin;
		if (_p17.ctor === 'Just') {
			var _p18 = _p17._0;
			return _elm_lang$core$Native_Utils.eq(_p18, viewLease.name) ? A2(changeRentButton, budget, _p18) : nonAdminView;
		} else {
			return nonAdminView;
		}
	});
var _user$project$Page_Budget$leaseDetailView = F3(
	function (model, budget, lease) {
		var defaultRent = _elm_lang$core$Basics$ceiling(
			lease.currentRent * (1 + _user$project$Page_Budget$requiredPctIncrease(budget)));
		return _rundis$elm_bootstrap$Bootstrap_Card$view(
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$block,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
						A2(
							_elm_lang$html$Html$div,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('lead'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_user$project$Page_Budget$detailSummaryText,
											lease,
											_elm_lang$core$Basics$toFloat(defaultRent)),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							})),
					_1: {ctor: '[]'}
				},
				A2(
					_rundis$elm_bootstrap$Bootstrap_Card$listGroup,
					{
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_ListGroup$li,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A3(_user$project$Page_Budget$changeRentView, model, budget, lease),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					A3(
						_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								A2(_elm_lang$core$Basics_ops['++'], 'Detail: ', lease.name)),
							_1: {ctor: '[]'}
						},
						_rundis$elm_bootstrap$Bootstrap_Card$config(
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mt-2'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							})))));
	});
var _user$project$Page_Budget$leaseDetailViews = F2(
	function (model, budget) {
		var leases = A2(
			_elm_lang$core$List$filter,
			function (_p19) {
				return function (n) {
					return A2(_elm_lang$core$List$member, n, budget.leaseMember);
				}(
					function (_) {
						return _.name;
					}(_p19));
			},
			budget.leases);
		var detailCards = A2(
			_elm_lang$core$List$map,
			A2(_user$project$Page_Budget$leaseDetailView, model, budget),
			leases);
		return A2(
			_elm_lang$core$List$map,
			function (x) {
				return A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$col,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md4,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: x,
						_1: {ctor: '[]'}
					});
			},
			detailCards);
	});
var _user$project$Page_Budget$view = F2(
	function (session, model) {
		var animatedBudget = _user$project$Page_Budget$animate(model);
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$container,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$row,
					{ctor: '[]'},
					_elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Grid$col,
									{
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _user$project$Page_Budget$explainerText(animatedBudget),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Grid$col,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md8,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _user$project$Page_Budget$compareRentsView(animatedBudget),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								},
								_1: {
									ctor: '::',
									_0: A2(_user$project$Page_Budget$leaseDetailViews, model, animatedBudget),
									_1: {ctor: '[]'}
								}
							}
						})),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Page_Budget$RentChanged = function (a) {
	return {ctor: 'RentChanged', _0: a};
};
var _user$project$Page_Budget$NewBudget = function (a) {
	return {ctor: 'NewBudget', _0: a};
};
var _user$project$Page_Budget$update = F3(
	function (session, msg, model) {
		var _p20 = msg;
		switch (_p20.ctor) {
			case 'NewBudget':
				if (_p20._0.ctor === 'Err') {
					return {
						ctor: '_Tuple2',
						_0: A2(
							_elm_lang$core$Debug$log,
							_elm_lang$core$Basics$toString(_p20._0._0),
							model),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								budget: _p20._0._0,
								animation: function () {
									var currentAnimatedBudget = _user$project$Page_Budget$animate(model);
									return _elm_lang$core$Maybe$Just(
										{
											startTime: _elm_lang$core$Maybe$Nothing,
											budget: _user$project$Animation$slide(
												_user$project$Page_Budget$interpolateBudget(currentAnimatedBudget))
										});
								}()
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
			case 'ChangeRent':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: function () {
						var _p21 = model.requestedRent;
						if (_p21.ctor === 'Ok') {
							return A2(
								_elm_lang$http$Http$send,
								_user$project$Page_Budget$RentChanged,
								A2(_user$project$Request_Budget$changeRent, _p21._0, session));
						} else {
							return _elm_lang$core$Platform_Cmd$none;
						}
					}()
				};
			case 'RentChanged':
				if (_p20._0.ctor === 'Ok') {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: A2(_elm_lang$http$Http$send, _user$project$Page_Budget$NewBudget, _user$project$Request_Budget$budget)
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'UpdateRentInput':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							requestedRent: _user$project$Page_Budget$validateRent(_p20._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				var _p25 = _p20._0;
				var _p22 = model.animation;
				if (_p22.ctor === 'Just') {
					var _p24 = _p22._0;
					var _p23 = _p24.startTime;
					if (_p23.ctor === 'Just') {
						return (_elm_lang$core$Native_Utils.cmp(_p23._0 + _elm_lang$core$Time$second, _p25) > 0) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{time: _p25}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{time: _p25, animation: _elm_lang$core$Maybe$Nothing}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									time: _p25,
									animation: _elm_lang$core$Maybe$Just(
										_elm_lang$core$Native_Utils.update(
											_p24,
											{
												startTime: _elm_lang$core$Maybe$Just(_p25)
											}))
								}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					}
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{time: _p25}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
		}
	});

var _user$project$Request_User$logout = function (session) {
	return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
		A2(
			_user$project$Data_Session$withAuthorization,
			session,
			A2(
				_lukewestby$elm_http_builder$HttpBuilder$withExpect,
				_elm_lang$http$Http$expectJson(_user$project$Data_Session$decoder),
				_lukewestby$elm_http_builder$HttpBuilder$post(
					_user$project$Request_Helpers$apiUrl('/logout.json')))));
};
var _user$project$Request_User$login = F2(
	function (username, password) {
		var credentials = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: A2(
					_user$project$Util_ops['=>'],
					'username',
					_elm_lang$core$Json_Encode$string(username)),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Util_ops['=>'],
						'password',
						_elm_lang$core$Json_Encode$string(password)),
					_1: {ctor: '[]'}
				}
			});
		var body = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: A2(_user$project$Util_ops['=>'], 'credentials', credentials),
				_1: {ctor: '[]'}
			});
		return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
			A2(
				_lukewestby$elm_http_builder$HttpBuilder$withJsonBody,
				body,
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withExpect,
					_elm_lang$http$Http$expectJson(_user$project$Data_Session$decoder),
					_lukewestby$elm_http_builder$HttpBuilder$post(
						_user$project$Request_Helpers$apiUrl('/login.json')))));
	});

var _user$project$Page_Profile$init = {ctor: '_Tuple0'};
var _user$project$Page_Profile$LoggedOut = function (a) {
	return {ctor: 'LoggedOut', _0: a};
};
var _user$project$Page_Profile$Logout = {ctor: 'Logout'};
var _user$project$Page_Profile$view = F2(
	function (session, model) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$row,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$col,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('text-center mt-4'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Button$button,
									{
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$warning,
										_1: {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Page_Profile$Logout),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Sign out'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Page_Profile$SetSession = function (a) {
	return {ctor: 'SetSession', _0: a};
};
var _user$project$Page_Profile$update = F3(
	function (session, msg, model) {
		var _p0 = msg;
		if (_p0.ctor === 'Logout') {
			return {
				ctor: '_Tuple3',
				_0: model,
				_1: A2(
					_elm_lang$http$Http$send,
					_user$project$Page_Profile$LoggedOut,
					_user$project$Request_User$logout(session)),
				_2: _elm_lang$core$Maybe$Nothing
			};
		} else {
			if (_p0._0.ctor === 'Ok') {
				return {
					ctor: '_Tuple3',
					_0: model,
					_1: _elm_lang$core$Platform_Cmd$none,
					_2: _elm_lang$core$Maybe$Just(
						_user$project$Page_Profile$SetSession(_p0._0._0))
				};
			} else {
				return {ctor: '_Tuple3', _0: model, _1: _elm_lang$core$Platform_Cmd$none, _2: _elm_lang$core$Maybe$Nothing};
			}
		}
	});

var _user$project$Page_Home$view = F2(
	function (session, model) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('jumbotron m-4'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$h1,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('display-3'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Welcome!'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('lead'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('This site helps to support Bloomcraft\'s governance process.  Today, you can use it to help make decisions about '),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$a,
									{
										ctor: '::',
										_0: _user$project$Route$href(_user$project$Route$Budget),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('rents'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text(' and '),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$a,
											{
												ctor: '::',
												_0: _user$project$Route$href(_user$project$Route$Expense),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('budgeting'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text('.'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$hr,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('my-4'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('If you run into trouble, contact admin@bloomcraft.space'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _user$project$Page_Home$initialModel = {ctor: '_Tuple0'};

var _user$project$Page_Login$initialModel = {username: '', password: ''};
var _user$project$Page_Login$Model = F2(
	function (a, b) {
		return {username: a, password: b};
	});
var _user$project$Page_Login$LoginResponse = function (a) {
	return {ctor: 'LoginResponse', _0: a};
};
var _user$project$Page_Login$SubmitLogin = {ctor: 'SubmitLogin'};
var _user$project$Page_Login$SetPassword = function (a) {
	return {ctor: 'SetPassword', _0: a};
};
var _user$project$Page_Login$SetUsername = function (a) {
	return {ctor: 'SetUsername', _0: a};
};
var _user$project$Page_Login$view = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					A2(
						_rundis$elm_bootstrap$Bootstrap_Form$form,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Form$group,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Form$label,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$for('username'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Username'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$text(
											{
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$id('username'),
												_1: {
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_Login$SetUsername),
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_Form$help,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Check your email for a message with your username'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Form$group,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Form$label,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$for('password'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Password'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$password(
												{
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$id('password'),
													_1: {
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_Login$SetPassword),
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Button$button,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Button$primary,
											_1: {
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Page_Login$SubmitLogin),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Login'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						})),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Sign in to Bloomcraft Here!'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('m-4'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_Login$SetSession = function (a) {
	return {ctor: 'SetSession', _0: a};
};
var _user$project$Page_Login$update = F2(
	function (msg, model) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'SetPassword':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{password: _p0._0}),
					_1: _elm_lang$core$Platform_Cmd$none,
					_2: _elm_lang$core$Maybe$Nothing
				};
			case 'SetUsername':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{username: _p0._0}),
					_1: _elm_lang$core$Platform_Cmd$none,
					_2: _elm_lang$core$Maybe$Nothing
				};
			case 'SubmitLogin':
				return {
					ctor: '_Tuple3',
					_0: model,
					_1: A2(
						_elm_lang$http$Http$send,
						_user$project$Page_Login$LoginResponse,
						A2(_user$project$Request_User$login, model.username, 'development')),
					_2: _elm_lang$core$Maybe$Nothing
				};
			default:
				if (_p0._0.ctor === 'Ok') {
					return {
						ctor: '_Tuple3',
						_0: model,
						_1: _elm_lang$core$Platform_Cmd$none,
						_2: _elm_lang$core$Maybe$Just(
							_user$project$Page_Login$SetSession(_p0._0._0))
					};
				} else {
					return {ctor: '_Tuple3', _0: model, _1: _elm_lang$core$Platform_Cmd$none, _2: _elm_lang$core$Maybe$Nothing};
				}
		}
	});

var _user$project$View_PieChart$pieChart = function (data) {
	var pieStart = {
		startAngle: 0,
		colorWheel: _user$project$View_Colors$defaultColorWheel,
		elements: {
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		}
	};
	var totalAmount = _elm_lang$core$Basics$toFloat(
		_elm_lang$core$List$sum(
			A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, data)));
	var radius = 50;
	var wedgePath = F2(
		function (startAngle, endAngle) {
			var arcType = (_elm_lang$core$Native_Utils.cmp(endAngle - startAngle, _elm_lang$core$Basics$pi) > 0) ? _folkertdev$svg_path_dsl$Svg_Path$largestArc : _folkertdev$svg_path_dsl$Svg_Path$smallestArc;
			return A3(
				_folkertdev$svg_path_dsl$Svg_Path$subpath,
				_folkertdev$svg_path_dsl$Svg_Path$startAt(
					{ctor: '_Tuple2', _0: 0, _1: 0}),
				_folkertdev$svg_path_dsl$Svg_Path$closed,
				{
					ctor: '::',
					_0: _folkertdev$svg_path_dsl$Svg_Path$lineTo(
						{
							ctor: '_Tuple2',
							_0: radius * _elm_lang$core$Basics$cos(startAngle),
							_1: radius * (0 - _elm_lang$core$Basics$sin(startAngle))
						}),
					_1: {
						ctor: '::',
						_0: A4(
							_folkertdev$svg_path_dsl$Svg_Path$arcTo,
							{ctor: '_Tuple2', _0: radius, _1: radius},
							0,
							{ctor: '_Tuple2', _0: arcType, _1: _folkertdev$svg_path_dsl$Svg_Path$antiClockwise},
							{
								ctor: '_Tuple2',
								_0: radius * _elm_lang$core$Basics$cos(endAngle),
								_1: radius * (0 - _elm_lang$core$Basics$sin(endAngle))
							}),
						_1: {ctor: '[]'}
					}
				});
		});
	var wedge = F2(
		function (_p1, _p0) {
			var _p2 = _p1;
			var _p7 = _p2._0;
			var _p3 = _p0;
			var _p6 = _p3.startAngle;
			var _p5 = _p3.colorWheel;
			var _p4 = _p3.elements;
			var texts = _p4._0;
			var paths = _p4._1;
			var textTranslate = A2(
				_elm_lang$core$Basics_ops['++'],
				' translate (',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(20),
					',0) '));
			var endAngle = _p6 + (((2 * _elm_lang$core$Basics$pi) * _elm_lang$core$Basics$toFloat(_p7)) / totalAmount);
			var midAngle = (_p6 + endAngle) / 2;
			var textRotation = A2(
				_elm_lang$core$Basics_ops['++'],
				'rotate(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString((-360 / (2 * _elm_lang$core$Basics$pi)) * midAngle),
					')'));
			var flipText = (_elm_lang$core$Native_Utils.cmp(midAngle, _elm_lang$core$Basics$pi / 2) > 0) && (_elm_lang$core$Native_Utils.cmp(midAngle, (3 * _elm_lang$core$Basics$pi) / 2) < 0);
			var anchor = flipText ? 'end' : 'start';
			var textFlip = flipText ? 'scale(-1,-1)' : '';
			return (!_elm_lang$core$Native_Utils.eq(_p7, 0)) ? {
				startAngle: endAngle,
				colorWheel: _user$project$Util$rotateList(_p5),
				elements: {
					ctor: '_Tuple2',
					_0: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$g,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$transform(
									A2(
										_elm_lang$core$Basics_ops['++'],
										textRotation,
										A2(_elm_lang$core$Basics_ops['++'], textTranslate, textFlip))),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$text_,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$x('0'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$y('0'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fontSize('5px'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$alignmentBaseline('middle'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$textAnchor(anchor),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg$text(_p2._1),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: texts
					},
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d(
									_folkertdev$svg_path_dsl$Svg_Path$pathToString(
										{
											ctor: '::',
											_0: A2(wedgePath, _p6, endAngle),
											_1: {ctor: '[]'}
										})),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(
										_user$project$View_Colors$nextColor(_p5)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke('#FFFFFF'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
											_1: {ctor: '[]'}
										}
									}
								}
							},
							{ctor: '[]'}),
						_1: paths
					}
				}
			} : _p3;
		});
	var _p8 = function (_) {
		return _.elements;
	}(
		A3(_elm_lang$core$List$foldr, wedge, pieStart, data));
	var texts = _p8._0;
	var paths = _p8._1;
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$transform('translate(50,50)'),
			_1: {ctor: '[]'}
		},
		A2(_elm_lang$core$Basics_ops['++'], paths, texts));
};

var _user$project$Request_Allocation$postVote = F3(
	function (session, vote, slug) {
		var voteJson = _user$project$Data_Allocation$encodeVote(vote);
		var body = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: A2(_user$project$Util_ops['=>'], 'vote', voteJson),
				_1: {ctor: '[]'}
			});
		return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
			A2(
				_user$project$Data_Session$withAuthorization,
				session,
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withJsonBody,
					body,
					A2(
						_lukewestby$elm_http_builder$HttpBuilder$withExpect,
						_elm_lang$http$Http$expectJson(
							A2(_elm_lang$core$Json_Decode$field, 'result', _elm_lang$core$Json_Decode$string)),
						_lukewestby$elm_http_builder$HttpBuilder$post(
							_user$project$Request_Helpers$apiUrl(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'/expenses/',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_user$project$Data_Allocation$slugToString(slug),
										'/vote.json'))))))));
	});
var _user$project$Request_Allocation$vote = function (slug) {
	return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
		A2(
			_lukewestby$elm_http_builder$HttpBuilder$withExpect,
			_elm_lang$http$Http$expectJson(
				A2(
					_elm_lang$core$Json_Decode$field,
					'vote',
					_elm_lang$core$Json_Decode$nullable(_user$project$Data_Allocation$voteDecoder))),
			_lukewestby$elm_http_builder$HttpBuilder$get(
				_user$project$Request_Helpers$apiUrl(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'/expenses/',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_user$project$Data_Allocation$slugToString(slug),
							'/vote.json'))))));
};
var _user$project$Request_Allocation$expense = function (slug) {
	return _lukewestby$elm_http_builder$HttpBuilder$toRequest(
		A2(
			_lukewestby$elm_http_builder$HttpBuilder$withExpect,
			_elm_lang$http$Http$expectJson(
				A2(_elm_lang$core$Json_Decode$field, 'expense', _user$project$Data_Allocation$expenseDecoder)),
			_lukewestby$elm_http_builder$HttpBuilder$get(
				_user$project$Request_Helpers$apiUrl(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'/expenses/',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_user$project$Data_Allocation$slugToString(slug),
							'/expense.json'))))));
};
var _user$project$Request_Allocation$allocation = _lukewestby$elm_http_builder$HttpBuilder$toRequest(
	A2(
		_lukewestby$elm_http_builder$HttpBuilder$withExpect,
		_elm_lang$http$Http$expectJson(
			A2(_elm_lang$core$Json_Decode$field, 'allocation', _user$project$Data_Allocation$decoder)),
		_lukewestby$elm_http_builder$HttpBuilder$get(
			_user$project$Request_Helpers$apiUrl('/allocation.json'))));

var _user$project$Page_Expense$init = function () {
	var initModel = function (allocation) {
		return {allocation: allocation};
	};
	var handleLoadError = function (err) {
		var l = A2(_elm_lang$core$Debug$log, 'Expense Load Err', err);
		return A2(_user$project$Page_Errored$pageLoadError, _user$project$View_Page$Expense, 'Failed to load expenses');
	};
	var loadAllocation = _elm_lang$http$Http$toTask(_user$project$Request_Allocation$allocation);
	return A2(
		_elm_lang$core$Task$mapError,
		handleLoadError,
		A2(_elm_lang$core$Task$map, initModel, loadAllocation));
}();
var _user$project$Page_Expense$update = F2(
	function (msg, model) {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Page_Expense$expenseView = function (expense) {
	var totalFunds = expense.currentAllocatedFunds + expense.newAllocatedFunds;
	var width = A2(_elm_lang$core$Basics$max, expense.requestedFunds, totalFunds);
	var pp = _elm_lang$core$Native_Utils.update(
		_user$project$View_BarPlot$defaultPlotParams,
		{
			maxValue: _elm_lang$core$Basics$toFloat(width),
			height: 50
		});
	var isFunded = _elm_lang$core$Native_Utils.cmp(totalFunds, expense.requestedFunds) > -1;
	var fundColor = function () {
		var _p0 = isFunded;
		if (_p0 === true) {
			return _user$project$View_Colors$greenColor;
		} else {
			return _user$project$View_Colors$blueColor;
		}
	}();
	var greyFundColor = function () {
		var _p1 = isFunded;
		if (_p1 === true) {
			return _user$project$View_Colors$darkGreenColor;
		} else {
			return _user$project$View_Colors$greyColor;
		}
	}();
	var svg = A2(
		_elm_lang$svg$Svg$g,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_user$project$View_BarPlot$drawBox,
				pp,
				{
					ctor: '_Tuple3',
					_0: 0,
					_1: _elm_lang$core$Basics$toFloat(totalFunds),
					_2: _user$project$View_Colors$greyColor
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$View_BarPlot$drawBox,
					pp,
					{
						ctor: '_Tuple3',
						_0: _elm_lang$core$Basics$toFloat(expense.currentAllocatedFunds),
						_1: _elm_lang$core$Basics$toFloat(expense.currentAllocatedFunds + expense.newAllocatedFunds),
						_2: fundColor
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$View_BarPlot$drawBox,
						_elm_lang$core$Native_Utils.update(
							pp,
							{filled: false}),
						{
							ctor: '_Tuple3',
							_0: 0,
							_1: _elm_lang$core$Basics$toFloat(width),
							_2: '#202020'
						}),
					_1: {ctor: '[]'}
				}
			}
		});
	return svg;
};
var _user$project$Page_Expense$expenseDetailsView = function (expenses) {
	var voteResultText = function (expense) {
		return (_elm_lang$core$Native_Utils.cmp(expense.userNewAllocatedFunds, 0) > 0) ? A2(
			_elm_lang$core$Basics_ops['++'],
			' You\'ve allocated $',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(expense.userNewAllocatedFunds),
				' to this item.')) : '';
	};
	var expenseBoxer = function (expense) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$col,
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs6,
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border-width', _1: '1px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'border-style', _1: 'solid'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'box-shadow', _1: '2px 3px 6px 3px rgba(0,0,0,0.1)'},
												_1: {ctor: '[]'}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('rounded p-1 mb-2'),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('h5'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(expense.name),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$svg,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 100 50'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$width('100%'),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _user$project$Page_Expense$expenseView(expense),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$p,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('small mb-0'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													voteResultText(expense)),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$hr,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('m-1'),
													_1: {ctor: '[]'}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$p,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('small mb-0 text-muted'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text(
															A2(
																_elm_lang$core$Basics_ops['++'],
																expense.owner,
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	' requested $',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_elm_lang$core$Basics$toString(expense.requestedFunds),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			' and is currently allocated $',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_elm_lang$core$Basics$toString(expense.newAllocatedFunds),
																				'.')))))),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_Button$linkButton,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Button$primary,
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Button$block,
																_1: {
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
																		{
																			ctor: '::',
																			_0: _user$project$Route$href(
																				_user$project$Route$ExpenseDetail(expense.slug)),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Vote'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	};
	var maxFunds = function (e) {
		return A2(_elm_lang$core$Basics$max, e.requestedFunds, e.currentAllocatedFunds + e.newAllocatedFunds);
	};
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$row,
						{ctor: '[]'},
						A2(_elm_lang$core$List$map, expenseBoxer, expenses))),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Expense Funding'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_Expense$allocationPieSummary = function (allocation) {
	var toPieData = function (expense) {
		return {ctor: '_Tuple2', _0: expense.newAllocatedFunds, _1: expense.name};
	};
	return A2(_elm_lang$core$List$map, toPieData, allocation.expenses);
};
var _user$project$Page_Expense$allocationSummary = function (model) {
	var allocation = model.allocation;
	var amtPerPerson = (_elm_lang$core$Native_Utils.cmp(allocation.numVoters, 0) > 0) ? _elm_lang$core$Basics$ceiling(
		_elm_lang$core$Basics$toFloat(allocation.amount) / _elm_lang$core$Basics$toFloat(allocation.numVoters)) : allocation.amount;
	var summaryText = A2(
		_elm_lang$core$Basics_ops['++'],
		'This page shows how the $',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(allocation.amount),
			A2(
				_elm_lang$core$Basics_ops['++'],
				' in surplus funds will be allocated.',
				A2(
					_elm_lang$core$Basics_ops['++'],
					' Because ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(allocation.numVoters),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' Bloomcraft keyholders have participated so far, you have ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'$',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(amtPerPerson),
									' to allocate. Use the vote buttons to share your preferences, and the allocation will change to reflect them.'))))))));
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'margin', _1: '0 auto'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$svg,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$viewBox('-25 -15 150 130'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _user$project$View_PieChart$pieChart(
												_user$project$Page_Expense$allocationPieSummary(model.allocation)),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('lead'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(summaryText),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						})),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH3,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Summary of Allocation'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_Expense$view = function (model) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$container,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Grid$row,
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerMd,
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$Page_Expense$allocationSummary(model),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Grid$col,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _user$project$Page_Expense$expenseDetailsView(model.allocation.expenses),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Page_Expense$Model = function (a) {
	return {allocation: a};
};
var _user$project$Page_Expense$AllocationLoaded = function (a) {
	return {ctor: 'AllocationLoaded', _0: a};
};

var _user$project$Page_ExpenseDetail$expenseSummaryTable = function (expense) {
	var maybeNot = function (x) {
		return x ? '' : 'not';
	};
	return _rundis$elm_bootstrap$Bootstrap_Table$table(
		{
			options: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Table$striped,
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Table$small,
					_1: {ctor: '[]'}
				}
			},
			thead: _rundis$elm_bootstrap$Bootstrap_Table$simpleThead(
				{ctor: '[]'}),
			tbody: A2(
				_rundis$elm_bootstrap$Bootstrap_Table$tbody,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Table$tr,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Table$td,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Requested this cycle'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Table$td,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'$',
												_elm_lang$core$Basics$toString(expense.requestedFunds))),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Table$tr,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Table$td,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Currently allocated this cycle'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Table$td,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'$',
													_elm_lang$core$Basics$toString(expense.newAllocatedFunds))),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Table$tr,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Table$td,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Carried over from previous cycle'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Table$td,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													A2(
														_elm_lang$core$Basics_ops['++'],
														'$',
														_elm_lang$core$Basics$toString(expense.currentAllocatedFunds))),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Table$tr,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Table$td,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Person responsible'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_Table$td,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(expense.owner),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Table$tr,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_Table$td,
												{
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Table$cellAttr(
														_elm_lang$html$Html_Attributes$colspan(2)),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'Will ',
															A2(
																_elm_lang$core$Basics_ops['++'],
																maybeNot(expense.excessAllowed),
																' accept more than requested'))),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Table$tr,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: A2(
													_rundis$elm_bootstrap$Bootstrap_Table$td,
													{
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Table$cellAttr(
															_elm_lang$html$Html_Attributes$colspan(2)),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text(
															A2(
																_elm_lang$core$Basics_ops['++'],
																'Will ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	maybeNot(expense.partialAllowed),
																	'accept less than requested'))),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				})
		});
};
var _user$project$Page_ExpenseDetail$expenseView = function (expense) {
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Alert$info(
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(expense.detailText),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _user$project$Page_ExpenseDetail$expenseSummaryTable(expense),
								_1: {ctor: '[]'}
							}
						})),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH4,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(
						A2(_elm_lang$core$Basics_ops['++'], 'Expense: ', expense.name)),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_ExpenseDetail$init = function (slug) {
	var initModel = F2(
		function (expense, maybeVote) {
			return {
				expense: expense,
				weight: A2(
					_elm_lang$core$Maybe$map,
					_elm_lang$core$Result$Ok,
					A2(
						_elm_lang$core$Maybe$andThen,
						function (_) {
							return _.weight;
						},
						maybeVote)),
				personalMax: A2(
					_elm_lang$core$Maybe$map,
					_elm_lang$core$Result$Ok,
					A2(
						_elm_lang$core$Maybe$andThen,
						function (_) {
							return _.personalMax;
						},
						maybeVote)),
				globalMax: A2(
					_elm_lang$core$Maybe$map,
					_elm_lang$core$Result$Ok,
					A2(
						_elm_lang$core$Maybe$andThen,
						function (_) {
							return _.globalMax;
						},
						maybeVote))
			};
		});
	var handleLoadError = function (err) {
		var l = A2(_elm_lang$core$Debug$log, 'Expense Load Err', err);
		return A2(_user$project$Page_Errored$pageLoadError, _user$project$View_Page$Other, 'Failed to load expense');
	};
	var loadVote = _elm_lang$http$Http$toTask(
		_user$project$Request_Allocation$vote(slug));
	var loadExpense = _elm_lang$http$Http$toTask(
		_user$project$Request_Allocation$expense(slug));
	return A2(
		_elm_lang$core$Task$mapError,
		handleLoadError,
		A3(_elm_lang$core$Task$map2, initModel, loadExpense, loadVote));
};
var _user$project$Page_ExpenseDetail$Model = F4(
	function (a, b, c, d) {
		return {expense: a, personalMax: b, globalMax: c, weight: d};
	});
var _user$project$Page_ExpenseDetail$LoadedExpense = function (a) {
	return {ctor: 'LoadedExpense', _0: a};
};
var _user$project$Page_ExpenseDetail$VoteResponse = function (a) {
	return {ctor: 'VoteResponse', _0: a};
};
var _user$project$Page_ExpenseDetail$update = F3(
	function (session, msg, model) {
		var makeVote = function (model) {
			return {
				weight: A2(_elm_lang$core$Maybe$andThen, _elm_lang$core$Result$toMaybe, model.weight),
				personalMax: A2(_elm_lang$core$Maybe$andThen, _elm_lang$core$Result$toMaybe, model.personalMax),
				globalMax: A2(_elm_lang$core$Maybe$andThen, _elm_lang$core$Result$toMaybe, model.globalMax)
			};
		};
		var maybeToInt = function (str) {
			var _p0 = str;
			if (_p0 === '') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$String$toInt(str));
			}
		};
		var _p1 = msg;
		switch (_p1.ctor) {
			case 'SubmitVote':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A2(
						_elm_lang$http$Http$send,
						_user$project$Page_ExpenseDetail$VoteResponse,
						A3(
							_user$project$Request_Allocation$postVote,
							session,
							makeVote(model),
							model.expense.slug))
				};
			case 'SetWeight':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							weight: maybeToInt(_p1._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SetGlobalMax':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							globalMax: maybeToInt(_p1._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'SetPersonalMax':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							personalMax: maybeToInt(_p1._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'VoteResponse':
				if (_p1._0.ctor === 'Ok') {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: _elm_lang$core$Platform_Cmd$batch(
							{
								ctor: '::',
								_0: A2(
									_elm_lang$http$Http$send,
									_user$project$Page_ExpenseDetail$LoadedExpense,
									_user$project$Request_Allocation$expense(model.expense.slug)),
								_1: {
									ctor: '::',
									_0: _user$project$Route$modifyUrl(_user$project$Route$Expense),
									_1: {ctor: '[]'}
								}
							})
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			default:
				if (_p1._0.ctor === 'Ok') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{expense: _p1._0._0}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
		}
	});
var _user$project$Page_ExpenseDetail$SubmitVote = {ctor: 'SubmitVote'};
var _user$project$Page_ExpenseDetail$SetPersonalMax = function (a) {
	return {ctor: 'SetPersonalMax', _0: a};
};
var _user$project$Page_ExpenseDetail$SetGlobalMax = function (a) {
	return {ctor: 'SetGlobalMax', _0: a};
};
var _user$project$Page_ExpenseDetail$SetWeight = function (a) {
	return {ctor: 'SetWeight', _0: a};
};
var _user$project$Page_ExpenseDetail$voteForm = function (model) {
	var disableSubmit = A2(
		_elm_lang$core$Debug$log,
		'DIS',
		function () {
			var _p2 = {ctor: '_Tuple3', _0: model.weight, _1: model.globalMax, _2: model.personalMax};
			_v2_3:
			do {
				if (_p2.ctor === '_Tuple3') {
					if ((_p2._0.ctor === 'Just') && (_p2._0._0.ctor === 'Err')) {
						return true;
					} else {
						if ((_p2._1.ctor === 'Just') && (_p2._1._0.ctor === 'Err')) {
							return true;
						} else {
							if ((_p2._2.ctor === 'Just') && (_p2._2._0.ctor === 'Err')) {
								return true;
							} else {
								break _v2_3;
							}
						}
					}
				} else {
					break _v2_3;
				}
			} while(false);
			return false;
		}());
	var errState = function (result) {
		var _p3 = result;
		if (_p3.ctor === 'Nothing') {
			return {
				ctor: '_Tuple4',
				_0: {ctor: '[]'},
				_1: '.',
				_2: '',
				_3: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'visibility', _1: 'hidden'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			};
		} else {
			if (_p3._0.ctor === 'Ok') {
				return {
					ctor: '_Tuple4',
					_0: {ctor: '[]'},
					_1: '.',
					_2: _elm_lang$core$Basics$toString(_p3._0._0),
					_3: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'visibility', _1: 'hidden'},
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				};
			} else {
				return {
					ctor: '_Tuple4',
					_0: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form$groupDanger,
						_1: {ctor: '[]'}
					},
					_1: 'Must be a whole number',
					_2: '',
					_3: {ctor: '[]'}
				};
			}
		}
	};
	var _p4 = errState(model.weight);
	var wError = _p4._0;
	var wValTxt = _p4._1;
	var wDef = _p4._2;
	var wHidden = _p4._3;
	var _p5 = errState(model.globalMax);
	var gError = _p5._0;
	var gValTxt = _p5._1;
	var gDef = _p5._2;
	var gHidden = _p5._3;
	var _p6 = errState(model.personalMax);
	var pError = _p6._0;
	var pValTxt = _p6._1;
	var pDef = _p6._2;
	var pHidden = _p6._3;
	var viewString = function (maybeVal) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			A2(_elm_lang$core$Maybe$map, _elm_lang$core$Basics$toString, maybeVal));
	};
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Form$form,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Form$group,
				wError,
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Form$label,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$for('weight'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Importance (0-100)'),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$text(
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$id('weight'),
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_ExpenseDetail$SetWeight),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$defaultValue(wDef),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Form$help,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('How important is this expense?  Higher numbers get funded first. Equal numbers are funded equally.'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Form$validationText,
									wHidden,
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(wValTxt),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Form$group,
					gError,
					{
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Form$label,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$for('global_max'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Funding Limit'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$view(
								A2(
									_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$predecessors,
									{
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$span,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('$'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									},
									_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$config(
										_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$text(
											{
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$placeholder(gDef),
												_1: {
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_ExpenseDetail$SetGlobalMax),
													_1: {ctor: '[]'}
												}
											})))),
							_1: {
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Form$help,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Optional: You will stop funding this expense once its allocation reaches this limit'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Form$validationText,
										gHidden,
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(gValTxt),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Form$group,
						pError,
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Form$label,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Personal Limit'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Form_InputGroup$view(
									A2(
										_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$predecessors,
										{
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$span,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('$'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										},
										_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$config(
											_rundis$elm_bootstrap$Bootstrap_Form_InputGroup$text(
												{
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$placeholder(pDef),
													_1: {
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Form_Input$onInput(_user$project$Page_ExpenseDetail$SetPersonalMax),
														_1: {ctor: '[]'}
													}
												})))),
								_1: {
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Form$help,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Optional: You will stop funding this expense once your contribution reaches this limit'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Form$validationText,
											pHidden,
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(pValTxt),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Button$button,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$primary,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Page_ExpenseDetail$SubmitVote),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$disabled(disableSubmit),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Vote'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Button$linkButton,
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('ml-3'),
												_1: {
													ctor: '::',
													_0: _user$project$Route$href(_user$project$Route$Expense),
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Back to Expense Summary'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$Page_ExpenseDetail$voteView = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Card$view(
		A3(
			_rundis$elm_bootstrap$Bootstrap_Card$block,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Card$custom(
					_user$project$Page_ExpenseDetail$voteForm(model)),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Card$headerH4,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Your Vote'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Card$config(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Card$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mt-2'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Page_ExpenseDetail$view = function (model) {
	var expense = model.expense;
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$container,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Grid$row,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$Page_ExpenseDetail$expenseView(expense),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Grid$col,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _user$project$Page_ExpenseDetail$voteView(model),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};

var _user$project$Request_Session$getSession = A2(
	_elm_lang$http$Http$get,
	_user$project$Request_Helpers$apiUrl('/session.json'),
	_user$project$Data_Session$decoder);

var _user$project$Main$getPage = function (pageState) {
	var _p0 = pageState;
	if (_p0.ctor === 'Loaded') {
		return _p0._0;
	} else {
		return _p0._0;
	}
};
var _user$project$Main$Model = F3(
	function (a, b, c) {
		return {session: a, pageState: b, navState: c};
	});
var _user$project$Main$ExpenseDetail = function (a) {
	return {ctor: 'ExpenseDetail', _0: a};
};
var _user$project$Main$Expense = function (a) {
	return {ctor: 'Expense', _0: a};
};
var _user$project$Main$Profile = function (a) {
	return {ctor: 'Profile', _0: a};
};
var _user$project$Main$Budget = function (a) {
	return {ctor: 'Budget', _0: a};
};
var _user$project$Main$Login = function (a) {
	return {ctor: 'Login', _0: a};
};
var _user$project$Main$Home = function (a) {
	return {ctor: 'Home', _0: a};
};
var _user$project$Main$Errored = function (a) {
	return {ctor: 'Errored', _0: a};
};
var _user$project$Main$NotFound = {ctor: 'NotFound'};
var _user$project$Main$Blank = {ctor: 'Blank'};
var _user$project$Main$TransitioningFrom = function (a) {
	return {ctor: 'TransitioningFrom', _0: a};
};
var _user$project$Main$Loaded = function (a) {
	return {ctor: 'Loaded', _0: a};
};
var _user$project$Main$pageErrored = F3(
	function (model, activePage, errorMessage) {
		var error = A2(_user$project$Page_Errored$pageLoadError, activePage, errorMessage);
		return A2(
			_user$project$Util_ops['=>'],
			_elm_lang$core$Native_Utils.update(
				model,
				{
					pageState: _user$project$Main$Loaded(
						_user$project$Main$Errored(error))
				}),
			_elm_lang$core$Platform_Cmd$none);
	});
var _user$project$Main$WaitingForSession = function (a) {
	return {ctor: 'WaitingForSession', _0: a};
};
var _user$project$Main$HaveSession = function (a) {
	return {ctor: 'HaveSession', _0: a};
};
var _user$project$Main$ExpenseDetailMsg = function (a) {
	return {ctor: 'ExpenseDetailMsg', _0: a};
};
var _user$project$Main$ExpenseMsg = function (a) {
	return {ctor: 'ExpenseMsg', _0: a};
};
var _user$project$Main$ProfileMsg = function (a) {
	return {ctor: 'ProfileMsg', _0: a};
};
var _user$project$Main$LoginMsg = function (a) {
	return {ctor: 'LoginMsg', _0: a};
};
var _user$project$Main$BudgetMsg = function (a) {
	return {ctor: 'BudgetMsg', _0: a};
};
var _user$project$Main$NavMsg = function (a) {
	return {ctor: 'NavMsg', _0: a};
};
var _user$project$Main$viewPage = F3(
	function (model, isLoading, page) {
		var session = model.session;
		var frame = A4(_user$project$View_Page$frame, _user$project$Main$NavMsg, model.navState, isLoading, session);
		var _p1 = page;
		switch (_p1.ctor) {
			case 'Errored':
				return A2(
					frame,
					_user$project$View_Page$Other,
					A2(_user$project$Page_Errored$view, session, _p1._0));
			case 'Home':
				return A2(
					frame,
					_user$project$View_Page$Home,
					A2(_user$project$Page_Home$view, session, _p1._0));
			case 'Budget':
				return A2(
					frame,
					_user$project$View_Page$Budget,
					A2(
						_elm_lang$html$Html$map,
						_user$project$Main$BudgetMsg,
						A2(_user$project$Page_Budget$view, session, _p1._0)));
			case 'Login':
				return A2(
					frame,
					_user$project$View_Page$Budget,
					A2(
						_elm_lang$html$Html$map,
						_user$project$Main$LoginMsg,
						_user$project$Page_Login$view(_p1._0)));
			case 'Profile':
				return A2(
					frame,
					_user$project$View_Page$Profile,
					A2(
						_elm_lang$html$Html$map,
						_user$project$Main$ProfileMsg,
						A2(_user$project$Page_Profile$view, session, _p1._0)));
			case 'Expense':
				return A2(
					frame,
					_user$project$View_Page$Expense,
					A2(
						_elm_lang$html$Html$map,
						_user$project$Main$ExpenseMsg,
						_user$project$Page_Expense$view(_p1._0)));
			case 'ExpenseDetail':
				return A2(
					frame,
					_user$project$View_Page$Other,
					A2(
						_elm_lang$html$Html$map,
						_user$project$Main$ExpenseDetailMsg,
						_user$project$Page_ExpenseDetail$view(_p1._0)));
			case 'NotFound':
				return A2(
					frame,
					_user$project$View_Page$Other,
					_elm_lang$html$Html$text('Page Not Found'));
			default:
				return A2(
					frame,
					_user$project$View_Page$Other,
					_elm_lang$html$Html$text(''));
		}
	});
var _user$project$Main$view = function (model) {
	var _p2 = model.pageState;
	if (_p2.ctor === 'Loaded') {
		return A3(_user$project$Main$viewPage, model, false, _p2._0);
	} else {
		return A3(_user$project$Main$viewPage, model, true, _p2._0);
	}
};
var _user$project$Main$startupView = function (model) {
	var _p3 = model;
	if (_p3.ctor === 'WaitingForSession') {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{ctor: '[]'});
	} else {
		return _user$project$Main$view(_p3._0);
	}
};
var _user$project$Main$subscriptions = function (startModel) {
	var _p4 = startModel;
	if (_p4.ctor === 'WaitingForSession') {
		return _elm_lang$core$Platform_Sub$none;
	} else {
		var _p6 = _p4._0;
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: function () {
					var _p5 = _p6.pageState;
					if ((_p5.ctor === 'Loaded') && (_p5._0.ctor === 'Budget')) {
						return A2(
							_elm_lang$core$Platform_Sub$map,
							_user$project$Main$BudgetMsg,
							_user$project$Page_Budget$subscriptions(_p5._0._0));
					} else {
						return _elm_lang$core$Platform_Sub$none;
					}
				}(),
				_1: {
					ctor: '::',
					_0: A2(_rundis$elm_bootstrap$Bootstrap_Navbar$subscriptions, _p6.navState, _user$project$Main$NavMsg),
					_1: {ctor: '[]'}
				}
			});
	}
};
var _user$project$Main$ExpenseDetailLoaded = function (a) {
	return {ctor: 'ExpenseDetailLoaded', _0: a};
};
var _user$project$Main$ExpenseLoaded = function (a) {
	return {ctor: 'ExpenseLoaded', _0: a};
};
var _user$project$Main$BudgetLoaded = function (a) {
	return {ctor: 'BudgetLoaded', _0: a};
};
var _user$project$Main$setRoute = F2(
	function (maybeRoute, model) {
		var loggedIn = !_elm_lang$core$Native_Utils.eq(model.session.user, _elm_lang$core$Maybe$Nothing);
		var errored = _user$project$Main$pageErrored(model);
		var transition = F2(
			function (toMsg, task) {
				return A2(
					_user$project$Util_ops['=>'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							pageState: _user$project$Main$TransitioningFrom(
								_user$project$Main$getPage(model.pageState))
						}),
					A2(_elm_lang$core$Task$attempt, toMsg, task));
			});
		var _p7 = maybeRoute;
		if (_p7.ctor === 'Nothing') {
			return A2(
				_user$project$Util_ops['=>'],
				_elm_lang$core$Native_Utils.update(
					model,
					{
						pageState: _user$project$Main$Loaded(_user$project$Main$NotFound)
					}),
				_elm_lang$core$Platform_Cmd$none);
		} else {
			switch (_p7._0.ctor) {
				case 'Home':
					return A2(
						_user$project$Util_ops['=>'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								pageState: _user$project$Main$Loaded(
									_user$project$Main$Home(_user$project$Page_Home$initialModel))
							}),
						_elm_lang$core$Platform_Cmd$none);
				case 'Budget':
					return loggedIn ? A2(transition, _user$project$Main$BudgetLoaded, _user$project$Page_Budget$init) : {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Route$modifyUrl(_user$project$Route$Login)
					};
				case 'Expense':
					return loggedIn ? A2(transition, _user$project$Main$ExpenseLoaded, _user$project$Page_Expense$init) : {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Route$modifyUrl(_user$project$Route$Login)
					};
				case 'Login':
					return loggedIn ? {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Route$modifyUrl(_user$project$Route$Home)
					} : A2(
						_user$project$Util_ops['=>'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								pageState: _user$project$Main$Loaded(
									_user$project$Main$Login(_user$project$Page_Login$initialModel))
							}),
						_elm_lang$core$Platform_Cmd$none);
				case 'Profile':
					return loggedIn ? A2(
						_user$project$Util_ops['=>'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								pageState: _user$project$Main$Loaded(
									_user$project$Main$Profile(_user$project$Page_Profile$init))
							}),
						_elm_lang$core$Platform_Cmd$none) : {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Route$modifyUrl(_user$project$Route$Login)
					};
				default:
					return loggedIn ? A2(
						transition,
						_user$project$Main$ExpenseDetailLoaded,
						_user$project$Page_ExpenseDetail$init(_p7._0._0)) : {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Route$modifyUrl(_user$project$Route$Login)
					};
			}
		}
	});
var _user$project$Main$init = F2(
	function (location, session) {
		var _p8 = _rundis$elm_bootstrap$Bootstrap_Navbar$initialState(_user$project$Main$NavMsg);
		var navState = _p8._0;
		var navCmd = _p8._1;
		var _p9 = A2(
			_user$project$Main$setRoute,
			_user$project$Route$fromLocation(
				A2(_elm_lang$core$Debug$log, 'Starting Loc', location)),
			{
				pageState: _user$project$Main$Loaded(_user$project$Main$Blank),
				session: session,
				navState: navState
			});
		var model = _p9._0;
		var cmd = _p9._1;
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{
				ctor: '::',
				_0: cmd,
				_1: {
					ctor: '::',
					_0: navCmd,
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$updatePage = F3(
	function (page, msg, model) {
		var toPageWithOut = F5(
			function (toModel, toMsg, subUpdate, subMsg, subModel) {
				var _p10 = A2(subUpdate, subMsg, subModel);
				var newModel = _p10._0;
				var newCmd = _p10._1;
				var outMsg = _p10._2;
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pageState: _user$project$Main$Loaded(
								toModel(newModel))
						}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, toMsg, newCmd),
					_2: outMsg
				};
			});
		var toPage = F5(
			function (toModel, toMsg, subUpdate, subMsg, subModel) {
				var _p11 = A2(subUpdate, subMsg, subModel);
				var newModel = _p11._0;
				var newCmd = _p11._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							pageState: _user$project$Main$Loaded(
								toModel(newModel))
						}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, toMsg, newCmd)
				};
			});
		var setSession = F3(
			function (newModel, cmd, newSession) {
				var sessionCmd = (!_elm_lang$core$Native_Utils.eq(model.session.authToken, _elm_lang$core$Maybe$Nothing)) ? _user$project$Route$modifyUrl(_user$project$Route$Home) : _elm_lang$core$Platform_Cmd$none;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						newModel,
						{session: newSession}),
					{
						ctor: '::',
						_0: cmd,
						_1: {
							ctor: '::',
							_0: sessionCmd,
							_1: {ctor: '[]'}
						}
					});
			});
		var session = model.session;
		var _p12 = {ctor: '_Tuple2', _0: msg, _1: page};
		_v7_14:
		do {
			switch (_p12._0.ctor) {
				case 'SetRoute':
					return A2(_user$project$Main$setRoute, _p12._0._0, model);
				case 'SetSession':
					if (_p12._0._0.ctor === 'Ok') {
						return A3(setSession, model, _elm_lang$core$Platform_Cmd$none, _p12._0._0._0);
					} else {
						return _elm_lang$core$Tuple$first(
							{
								ctor: '_Tuple2',
								_0: A3(_user$project$Main$pageErrored, model, _user$project$View_Page$Home, 'Failed to get session state from server'),
								_1: A2(_elm_lang$core$Debug$log, 'Load Error: ', _p12._0._0._0)
							});
					}
				case 'BudgetLoaded':
					if (_p12._0._0.ctor === 'Ok') {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$Budget(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					} else {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$Errored(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					}
				case 'ExpenseLoaded':
					if (_p12._0._0.ctor === 'Ok') {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$Expense(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					} else {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$Errored(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					}
				case 'ExpenseDetailLoaded':
					if (_p12._0._0.ctor === 'Ok') {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$ExpenseDetail(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					} else {
						return A2(
							_user$project$Util_ops['=>'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									pageState: _user$project$Main$Loaded(
										_user$project$Main$Errored(_p12._0._0._0))
								}),
							_elm_lang$core$Platform_Cmd$none);
					}
				case 'NavMsg':
					return A2(
						_user$project$Util_ops['=>'],
						_elm_lang$core$Native_Utils.update(
							model,
							{navState: _p12._0._0}),
						_elm_lang$core$Platform_Cmd$none);
				case 'BudgetMsg':
					if (_p12._1.ctor === 'Budget') {
						return A5(
							toPage,
							_user$project$Main$Budget,
							_user$project$Main$BudgetMsg,
							_user$project$Page_Budget$update(session),
							_p12._0._0,
							_p12._1._0);
					} else {
						break _v7_14;
					}
				case 'LoginMsg':
					if (_p12._1.ctor === 'Login') {
						var _p13 = A5(toPageWithOut, _user$project$Main$Login, _user$project$Main$LoginMsg, _user$project$Page_Login$update, _p12._0._0, _p12._1._0);
						var newModel = _p13._0;
						var cmd = _p13._1;
						var outMsg = _p13._2;
						var _p14 = outMsg;
						if (_p14.ctor === 'Just') {
							return A3(setSession, newModel, cmd, _p14._0._0);
						} else {
							return {ctor: '_Tuple2', _0: newModel, _1: cmd};
						}
					} else {
						break _v7_14;
					}
				case 'ProfileMsg':
					if (_p12._1.ctor === 'Profile') {
						var _p15 = A5(
							toPageWithOut,
							_user$project$Main$Profile,
							_user$project$Main$ProfileMsg,
							_user$project$Page_Profile$update(session),
							_p12._0._0,
							_p12._1._0);
						var newModel = _p15._0;
						var cmd = _p15._1;
						var outMsg = _p15._2;
						var _p16 = outMsg;
						if (_p16.ctor === 'Just') {
							return A3(setSession, newModel, cmd, _p16._0._0);
						} else {
							return {ctor: '_Tuple2', _0: newModel, _1: cmd};
						}
					} else {
						break _v7_14;
					}
				case 'ExpenseDetailMsg':
					if (_p12._1.ctor === 'ExpenseDetail') {
						return A5(
							toPage,
							_user$project$Main$ExpenseDetail,
							_user$project$Main$ExpenseDetailMsg,
							_user$project$Page_ExpenseDetail$update(session),
							_p12._0._0,
							_p12._1._0);
					} else {
						break _v7_14;
					}
				default:
					break _v7_14;
			}
		} while(false);
		return A2(_user$project$Util_ops['=>'], model, _elm_lang$core$Platform_Cmd$none);
	});
var _user$project$Main$update = F2(
	function (msg, model) {
		return A3(
			_user$project$Main$updatePage,
			_user$project$Main$getPage(model.pageState),
			msg,
			model);
	});
var _user$project$Main$startupUpdate = F2(
	function (msg, startModel) {
		var _p17 = startModel;
		if (_p17.ctor === 'WaitingForSession') {
			var _p18 = msg;
			if ((_p18.ctor === 'SetSession') && (_p18._0.ctor === 'Ok')) {
				var _p19 = A2(_user$project$Main$init, _p17._0, _p18._0._0);
				var model = _p19._0;
				var cmd = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: _user$project$Main$HaveSession(model),
					_1: cmd
				};
			} else {
				return A2(
					_elm_lang$core$Native_Utils.crash(
						'Main',
						{
							start: {line: 230, column: 24},
							end: {line: 230, column: 35}
						}),
					'Got a non-session message during startup',
					_p18);
			}
		} else {
			var _p20 = A2(_user$project$Main$update, msg, _p17._0);
			var newModel = _p20._0;
			var cmd = _p20._1;
			return {
				ctor: '_Tuple2',
				_0: _user$project$Main$HaveSession(newModel),
				_1: cmd
			};
		}
	});
var _user$project$Main$SetRoute = function (a) {
	return {ctor: 'SetRoute', _0: a};
};
var _user$project$Main$SetSession = function (a) {
	return {ctor: 'SetSession', _0: a};
};
var _user$project$Main$startupInit = function (location) {
	return {
		ctor: '_Tuple2',
		_0: _user$project$Main$WaitingForSession(location),
		_1: A2(_elm_lang$http$Http$send, _user$project$Main$SetSession, _user$project$Request_Session$getSession)
	};
};
var _user$project$Main$main = A2(
	_elm_lang$navigation$Navigation$program,
	function (_p21) {
		return _user$project$Main$SetRoute(
			_user$project$Route$fromLocation(_p21));
	},
	{init: _user$project$Main$startupInit, view: _user$project$Main$startupView, update: _user$project$Main$startupUpdate, subscriptions: _user$project$Main$subscriptions})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

