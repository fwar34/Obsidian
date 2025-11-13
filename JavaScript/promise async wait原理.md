---
tags:
  - promise
---

`promise`，`async`和`wait`是`JavaScript/TypeScript`中用于处理异步操作的重要工具。它们的原理基于时间循环和微任务队列，使你能够编写更清晰和易于维护的异步代码。

##### 1 Promise
`promise` 是一个对象，表示异步操作的最终完成（或失败）及其结果。它有三种状态：
* **Pending**：初始状态，既不是成功也不是失败。
* **Fulfilled**：操作成功完成。 
* **Rejected**：操作失败。
###### 1.1 Promise 的创建与使用
```js
const promise = new Promise((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
        resolve('操作完成');
    }, 1000);
});

promise.then(result => {
    console.log(result); // 输出：操作完成
}).catch(error => {
    console.error(error);
});
```
在这个例子中，`Promise` 在创建时候被设置为 `pending` 状态，创建的时候就启动了异步的执行动作。经过一秒延迟后，`setTimeout` 回调函数被调用，`Promise` 被标记为 `fulfilled`，并且相应的 `.then()` 回调函数被加入到微任务队列中，在当前同步代码执行完毕后立即执行。

---
##### 2 Async 函数
`async` 函数是返回 `Promise` 的函数。可以使用 `await` 关键字来暂停 `async` 函数的执行，直到等待的 `Promise` 解决或拒绝。

###### 2.1 Async 函数的特点
* **总是返回一个 Promise**：<mark style="background: #FFB8EBA6;">即使函数返回的是普通值，也会被自动包装成 Promise</mark>。
* **可以使用 await**：在 `async` 函数内部，你可以使用 `await` 来暂停执行，直到等待的 `Promise` 完成。

##### 3 示例
```js
async function asyncFunction() {
    try {
        const result = await somePromise(); // 暂停执行，直到 somePromise 完成。await 只能在 async 函数内部使用
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}
```

---
##### 4 Await 关键字
`await` 只能在 <mark style="background: #FFB8EBA6;">async</mark> 函数内部使用，它会暂停 <mark style="background: #FFB8EBA6;">async</mark> 函数的执行，直到等待的 <mark style="background: #FFB8EBA6;">Promise</mark> 解决或者拒绝，然后恢复执行并将解决的值作为表达式的返回。

###### 4.1 Await 的行为
* **暂停执行**：await 会暂停 async 函数的执行，直到等待的 Promise 完成。
* **恢复执行**：一旦 Promise 解决，await 表达式将返回 Promise 的解决值，并恢复 async 函数的执行。
* **错误处理**：如果 Promise 被拒绝，await 表达式会抛出异常，可以在 try...catch 块中捕捉。

**示例**
```typescript
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
    console.log('等待前');
    await delay(2000); // 暂停2秒
    console.log('等待后');
}

example();
```

---

##### 5 事件循环与微任务队列
JavaScript 使用时间驱动模型，所有的代码都在一个单线程中执行。时间循环负责管理和调度宏任务（如 I/O 操作、setTimeout 等）和微任务（如 Promise 回调，process nextTick 等）。每次事件循环结束时，都会清空微任务队列。

###### 5.1 事件循环的工作流程
1. **执行同步代码**：首先执行所有的同步代码。
2. **处理微任务队列**：在每次事件循环结束时，清空微任务队列，执行所有微任务。
3. **处理宏任务队列**：从宏任务队列中取出一个任务并执行。
4. **渲染更新**：浏览器环境下，可能会在此时进行页面渲染更新。
5. **重复上述步骤**。

---
##### 6 总结
- **Promise** 是一种表示异步操作最终结果的对象，它依赖于事件循环和微任务队列。
- **Async 函数** 是返回 Promise 的函数，允许使用 await 关键字来简化异步代码。
- **Await 关键字** 暂停 async 函数的执行，直到等待的 Promise 完成，并在完成后恢复执行。
- **事件循环** 和 **微任务队列** 是 JavaScript 引擎管理异步任务的核心机制，确保了异步操作的有序执行。

通过理解这些概念及其工作原理，你可以更好地掌握如何在 JavaScript/TypeScript 中编写高效且易于维护的异步代码。如果你需要更深入的技术细节，可以查阅 V8 引擎或其他 JavaScript 引擎的文档和源代码。