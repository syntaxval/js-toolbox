/**
 * Asynchronous tools.
 *
 * @module async
 * @license Apache-2.0
 * @author drmats
 */




import { head } from "../array/list"
import { curry } from "../func/curry"
import { inc } from "../math/arithmetic"
import { quote } from "../string/transform"
import {
    isArray,
    isFunction,
} from "../type/check"




/**
 * Asynchronous version of standard `Array.prototype.map` function.
 *
 * - `arr` - array to operate on
 * - `f` - async or sync function with signature:
 *     - `this` - bound to `arr`
 *     - `element` - currently processed element
 *     - `index` - current index
 *
 * `f` can return `Promise.<any>` or `<any>`
 *
 * Example:
 *
 * ```
 * (async () => {
 *     let x = await async.map(
 *         array.range(10),
 *         (x) => async.timeout(() => 4*x, 100*x)
 *     )
 *     console.log(x)
 * })()
 * ```
 *
 * @async
 * @function map
 * @param {Array} arr
 * @param {Function} f
 * @returns {Promise.<Array>}
 */
export const map = curry((arr, f) => {
    let
        results = [],
        i = 0,
        resolve = null,
        promise = new Promise((res) => { resolve = res }),
        progress = (r) => {
            results.push(r)
            i = inc(i)
            if (i < arr.length) {
                Promise
                    .resolve(f.call(arr, arr[i], i))
                    .then(progress).catch(progress)
            } else resolve(results)
        },
        bquote = x => quote(typeof x, "[]")

    if (isArray(arr)  &&  isFunction(f)) {
        if (arr.length > 0) {
            Promise
                .resolve(f.call(arr, head(arr), 0))
                .then(progress).catch(progress)
        } else return Promise.resolve(results)
    } else throw new TypeError(
        "async.map() expected array and function, " +
        `got ${bquote(arr)} and ${bquote(f)}`
    )

    return promise
})




/**
 * Asynchronous version of standard `Array.prototype.map` function.
 *
 * *Implementation that does paralell execution*.
 *
 * - `arr` - array to operate on
 * - `f` - async or sync function with signature:
 *     - `this` - bound to `arr`
 *     - `element` - currently processed element
 *     - `index` - current index
 *
 * `f` can return `Promise.<any>` or `<any>`
 *
 * Example:
 *
 * ```
 * (async () => {
 *     let x = await async.parMap(
 *         array.range(10),
 *         (x) => async.timeout(() => 4*x, 100*x)
 *     )
 *     console.log(x)
 * })()
 * ```
 *
 * @async
 * @function parMap
 * @param {Array} arr
 * @param {Function} f
 * @returns {Promise.<Array>}
 */
export const parMap = curry((arr, f) =>
    Promise.all(arr.map(el => Promise.resolve(f(el))))
)




/**
 * Asynchronous version of standard `Array.prototype.reduce` function.
 *
 * - `arr` - array to operate on
 * - `f` - async or sync function with signature:
 *     - `this` - bound to `arr`
 *     - `acc` - accumulates the `f`'s return values; it is
 *         the accumulated value previously returned
 *         in the last invocation of `f`, or `initAcc`, if supplied.
 *     - `element` - currently processed element
 *     - `index` - current index
 * - `initAcc` - value to use as the first argument to the first call
 *     of the `f`. If no initial value is supplied, the first element
 *     in the array will be used.
 *
 * `f` can return `Promise.<any>` or `<any>`
 *
 * Example:
 *
 * ```
 * (async () => {
 *     let x = await async.reduce(
 *         array.range(10),
 *         (acc, x) => async.timeout(() => acc+x, 100*x),
 *         0
 *     )
 *     console.log(x)
 * })()
 * ```
 *
 * @async
 * @function reduce
 * @param {Array} arr
 * @param {Function} f
 * @param {any} [initAcc]
 * @returns {Promise.<any>}
 */
export const reduce = curry((arr, f, initAcc) => {
    let
        i = 0,
        resolve = null,
        promise = new Promise((res) => { resolve = res }),
        progress = (r) => {
            i = inc(i)
            if (i < arr.length) {
                Promise
                    .resolve(f.call(arr, r, arr[i], i))
                    .then(progress).catch(progress)
            } else resolve(r)
        },
        bquote = x => quote(typeof x, "[]")

    if (isArray(arr)  &&  isFunction(f)) {
        if (arr.length > 0) {
            Promise
                .resolve(f.call(arr, initAcc || head(arr), head(arr), 0))
                .then(progress).catch(progress)
        } else return Promise.resolve(initAcc)
    } else throw new TypeError(
        "async.reduce() expected array and function, " +
        `got ${bquote(arr)} and ${bquote(f)}`
    )

    return promise
})