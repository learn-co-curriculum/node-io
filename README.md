# Basic Node I/O

## Overview

This lesson will cover the ...

## Objectives

1. Illustrate the basic async code (non-blocking I/O) vs. sync code, e.g., `setTimeout()` in Node
1. Describe `process.nextTick()`
2. Describe `setImmediate()`

## Node Asynchronous Code

One of the major selling point (a.k.a. benefits) of Node is it's non-blocking I/O which is powered by asynchronous code. Writing asynchronous code in JavaScript is straightforward, but for developers coming from other languages it can pose a challenge. If you are one of them, then you need to change your thinking a bit to understand asynchronous code.

Note: It's still possible to write blocking code in Node. It won't prevent you from doing that and in some edge cases you want or have to write blocking code, e.g., cryptographic hashing of password. However in most cases non-blocking code should be used with one of the asynchronous patterns, e.g., callbacks or event emitters.

Consider the following example, we have a few print statement in Ruby and then we put the process to sleep to delay the later statements:

```ruby
puts "step 1"
sleep(1)
puts "step 2"
```

To run the file from this repository, execute `$ ruby sleep.rb`. You will see "step 1", then the program will wait one second and you'll see "step 2". So far so good? That's how synchronous code works because during the sleep method, nothing else were running. 

On the contrary, in JavaScript and Node we can schedule some logic in the future (in a callback) and our program will be able to run something else while waiting for this future date/time. Look at this code with a `setTimeout()` which will output the same two lines as the Ruby code (second line with a 1 second delay):

```js
console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 1000)
```

However, if we had some code after asynchronous `setTimeout()`, the program will run that code first, before the callback delayed by 1 second. 

```js
console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 1000)
console.log('step 1.5?')
```

So the snippet above is in the `sleep.js` file. You can run it with `$ node sleep.js`. It will result in "step 1", "step 1.5", 1-second wait and in "step 2". 

Note: If you never heard a term callback, think about it as just a function. Often we define this function anonymously right in the other function's (like `setTimeout()`) call, meaning our callback doesn't have a name (example above), but nothing prevent us from declaring a named function or a variable which value is function and then using that name.

The reason why I'm using `setTimeout()` is because it emulates time-intensive input/output operations where you don't have the results immediately and you still want your system to be functioning and doing something else while waiting (non-blocking I/O). For example, instead of `setTimeout()`, you would have `fs.readFile(path, callback)` to read from a file, or `db.users.find({}, callback)` to read from a database.



Okey dokey, but what if we don't want to delay the program by one second or even one millisecond and we still want to postpone some action? Who wants to wait?! Time is money. ;)
Going back to our neat example, the problem is that we need "step 2" to be printed after "step 1.5", but without the wait. Can't we just say timeout is 0 milliseconds? The answer is yes.

```js
console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 0)
console.log('step 1.5?')
```

By running the code (file `sleep0.js`), you'll see "step 1", "step 1.5" and "step 2" all at once, but in our code we wrote the "step 2" statement before "step 1.5" in the code. Most languages can't do that (execute code which is before after the code which is later in the listing). What actually happened was that `setTimeout()` schedule the callback ("step 2") and the next cycle of the event loop picked it up. 

Event loop? Think about it as a huge loop like a `for` of `while` loop that runs and constantly looks for things to execute. So event loop finished the cycle on "step 1.5" and went back to the top, found "step 2" and the time was 0 so it executed that puppy right away.

Most of the times we don't have control on when the input/output callback will come back so we need to code the logic accordingly using asynchronous functions (which rely on event loop under the hood).


## `process.nextTick()`

So `setTimeout()` is like making an HTTP request to a remote server, reading from a file or a database. It signifies I/O callbacks. What if you want to do something on the next event loop cycle but **before** the I/O callbacks? Meet `process.nextTick()`. 

To illustrate how `nextTick()` works, observe this example from `nexttick.js`:

```js
console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 0)
process.nextTick(function(){
  console.log('step 2*')
})
console.log('step 1.5?')
```

The result will print the following lines without any delay: 

```
step 1
step 1.5?
step 2*
step 2
```

So you can observe that `nextTick()` will schedule the callback before the queue of I/O callback (with `setTimeout()` being one of them).

## `setImmediate()`

I bet now you want to know how do we schedule something on the next event loop cycle (i.e., in the future) but **after** the I/O callbacks if there are any. We use poorly-named method `setImmediate()`. Take a look at the code from `immediate.js`:

```js
console.log('step 1')
setTimeout(function(){
  console.log('step 2')
}, 0)
setImmediate(function(){
  console.log('step 2*')
})
console.log('step 1.5?')
```

The snippet will print lines which tell you that `setImmediate()` schedules callbacks after the other callbacks:

```
step 1
step 1.5?
step 2
step 2*
```

Note: `setImmediate()` is poorly-named because it doesn't schedule callbacks before, it schedules them after. To remember `nextTick()` and `setImmediate()` — think the opposite of their names. `setImmediate()` will execute after `nextTick()`!

Now you know the basics of Node I/O and how asynchronous code works. We'll cover asynchronous patterns in more details later in the course. Functions like `nextTick()` and `setImmediate()` are helpful when working with asynchronous code. For example, you can have an event, but you need to trigger it after the event listener is registered. Another example, if you have a huge CPU-intensive task (which is blocking) you can break in down into chucks to let the system handle some other tasks before proceeding to the CPU-intensive monster of a task again.

## Resources

1. [Process.nextTick Official Documentation](https://nodejs.org/api/process.html#process_process_nexttick_callback_arg)
1. [Node.js: process.nextTick() vs. setImmediate()](http://becausejavascript.com/node-js-process-nexttick-vs-setimmediate)
1. [The process.nextTick Function video](https://www.youtube.com/watch?v=-niA5XOlCWI)
2. [What does process.nextTick(callback) actually do in Node.js?](https://www.quora.com/What-does-process-nextTick-callback-actually-do-in-Node-js)
3. [Understanding process.nextTick()](http://howtonode.org/understanding-process-next-tick)
4. [A talk on `process.nextTick()` & `setImmediate()` for flow control video](https://www.youtube.com/watch?v=aqyv_FMp0n8)


---

<a href='https://learn.co/lessons/node-io' data-visibility='hidden'>View this lesson on Learn.co</a>
