>ts 的底层就是条件变量等待吗？

`TypeScript` 中的 `Promise` 并不是基于条件变量实现的，相反，`Promise` 是一种用于异步操作的的结果的对象，它代表了一个异步操作的最终完成（或失败）及其结果值。`Promise` 的底层实现依赖于<mark style="background: #FFB8EBA6;">事件循环</mark>和<mark style="background: #FFB8EBA6;">（回调）任务队列</mark>，而不是传统的多线程编程中的条件变量。可参考另一篇 [[promise async wait原理]]

##### JavaScript/TypeScript 的事件驱动模型
`JavaScript` 和 `TypeScript` 运行在单线程环境中，使用的是时间驱动模型。这意味着所有的代码执行都是通过一个循环来管理的，这个事件循环会不断检查任务队列是否为空，并从任务队列中取出任务（如定时器、I/O 事件等）来执行。

##### 一、Promise 的工作原理
`Promise` 的核心概念是它可以处于三种状态之一：
1. <font color="#c0504d">Pending</font>（进行中）：初始状态，既不是成功，也不是失败。
2. <font color="#c0504d">Fulfilled</font>（已成功）：操作成功完成。
3. <font color="#c0504d">Rejected</font>（已失败）：操作失败。
当一个 `Promise` 被创建时，它最初处于 pending 状态。一旦异步操作完成，`Promise` 会转换为 fulfilled 或 rejected 状态，并出发相应的回调函数（then 或 catch）。这些回调函数会被添加到任务队列中，并在当前同步代码执行完成后由事件循环处理。

##### 二、Promise 的实现机制
`Promise` 的实现并不涉及条件变量，而是依赖以下机制：
- **微任务队列 (Microtask Queue)**：
`Promise` 的回调（如 .then() 和 .catch()）会被放入微任务队列。每次事件循环结束时，都会清空微任务队列，确保所有微任务在下一个宏任务开始前被执行。
- **事件循环 (Event Loop)**：负责管理和调度宏任务（如 I/O 操作、setTimeout 等）和微任务。它确保了即使有多个异步操作，程序也能按正确的顺序执行。
- **异步操作的完成通知**：当异步操作完成时，
<font color="#c0504d">Promise 会将自己标记为已完成（fulfilled 或 rejected），并安排相应的回调函数在下一个事件循环周期中执行。</font>

##### 三、与条件变量的区别
条件变量通常用于多线程环境，允许一个或多个线程等待某个特定条件的发生，它们需要线程间的同步或互斥锁支持。而 `Promise` 是为了简化异步编程而设计的，它不涉及线程同步，也不需要互斥锁，完全依赖于事件驱动的单线程模型。

###### 示例
```js
const promise = new Promise((resolve, reject) => {
  // 模拟异步操作
  setTimeout(() => {
    resolve('操作完成');
  }, 1000);
});

promise.then(result => {
  console.log(result); // 输出: 操作完成
});
```
在这个例子中，Promise 在创建时被设置为 pending 状态。经过一秒的延迟后，setTimeout 回调函数被调用，Promise 被标记为 fulfilled，并且相应的 .then() 回调函数被加入到微任务队列中，在当前同步代码执行完毕后立即执行。

##### 四、总结
Promise 的底层实现并不是基于条件变量，而是利用了 JavaScript/TypeScript 的事件驱动模型和事件循环。这种设计使得异步编程更加直观和易于理解，同时避免了多线程编程中常见的复杂性和潜在问题。如果你对 Promise 的具体实现感兴趣，可以查阅 V8 引擎或其他 JavaScript 引擎的源代码，了解更深入的技术细节。