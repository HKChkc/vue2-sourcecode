/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 获取数组原型
const arrayProto = Array.prototype
// 复制原型
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// 拦截改变原数组的方法，并且派发事件
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存原始方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 执行原始方法
    const result = original.apply(this, args)
    // 扩展行为：通知更新
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 新加入的元素要执行响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 小管家通知更新，让组件相关的watcher更新
    ob.dep.notify()
    return result
  })
})
