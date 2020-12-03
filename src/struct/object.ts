/**
 * Struct - type declarations.
 *
 * @module struct
 * @license Apache-2.0
 * @author drmats
 */

/* eslint-disable @typescript-eslint/no-explicit-any */




import type {
    JSAnyArrObj,
    JSAnyObj,
} from "../type/consts";
import { curry } from "../func/curry";
import { flow } from "../func/combinators";
import { btquote } from "../utils/misc";
import {
    isFunction,
    isObject,
} from "../type/check";




/**
 * Do the deep-copy of any JavaScript object
 * that doesn't contain functions.
 *
 * @function clone
 * @param {JSAnyArrObj} o
 * @returns {JSAnyArrObj}
 */
export const clone = flow(
    JSON.stringify,
    JSON.parse
) as (o: JSAnyArrObj) => JSAnyArrObj;




/**
 * Construct `Object` from the result of `Object.entries()` call.
 *
 * ```
 * entries = [[k1, v1], ..., [kn, vn]]
 * ```
 *
 * Imitates Python's `dict()`.
 *
 * @function dict
 * @param {Array.<Array>} entries
 * @returns {Object}
 */
export function dict<T> (
    entries: [PropertyKey, T][]
): { [k in PropertyKey]?: T; } {
    return entries.reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v }), {}
    );
}




/**
 * Map (iteration) on objects - shallow.
 *
 * - `o` - `Object` to enumerate on.
 * - `f` - `Function` to call on each key, params:
 *     - `this` - bound to the enumerated object,
 *     - `kv` - current `[key, value]` array,
 *
 * `f` should return `[key, value]` array.
 *
 * @function objectMap
 * @param {Object} o
 * @param {Function} f
 * @returns {Object}
 */
export const objectMap: {
    /* specialized-case overload (output keys related to input keys) */
    <
        In,
        Keys extends keyof In,
        Out
    >(
        o: JSAnyObj<In>,
        f: (kv: [Keys, In[Keys]]) => [Keys, Out]
    ): { [k in Keys]: Out; };
    /* specialized-case - curried */
    <In>(
        o: JSAnyObj<In>
    ): {
        <Keys extends keyof In, Out>(
            f: (kv: [Keys, In[Keys]]) => [Keys, Out]
        ): { [k in Keys]: Out; };
    };
    /* general-case overload (output keys not related to input keys) */
    <
        In,
        Keys extends keyof In,
        Out
    >(
        o: JSAnyObj<In>,
        f: (kv: [Keys, In[Keys]]) => [PropertyKey, Out]
    ): { [k in PropertyKey]?: Out; };
    /* general-case - curried */
    <In>(
        o: JSAnyObj<In>
    ): {
        <Keys extends keyof In, Out>(
            f: (kv: [Keys, In[Keys]]) => [PropertyKey, Out]
        ): { [k in PropertyKey]?: Out; };
    };
} = curry((o: any, f: any) => {
    if (!isObject(o) || !isFunction(f)) throw new TypeError(
        "struct.objectMap() expected object and function, " +
        `got ${btquote(o)} and ${btquote(f)}`
    );
    return dict(Object.entries(o).map((kv => f.call(o, kv))));
});




/**
 * Reduce (fold) on objects - shallow.
 *
 * - `o` - `Object` to enumerate on.
 * - `f` - `Function` to call on each key, params:
 *     - `this` - bound to the enumerated object,
 *     - `acc` - accumulated value,
 *     - `kv` - current `[key, value]` array,
 * - `init` - accumulated value initializer,
 *
 * `f` should return value of the same type as `init`.
 *
 * @function objectReduce
 * @param {Object} o
 * @param {Function} f
 * @param {T} init
 * @returns {T}
 */
export const objectReduce: {
    /* uncurried */
    <
        In,
        Keys extends keyof In,
        Out
    >(
        o: JSAnyObj<In>,
        f: (acc: Out, kv: [Keys, In[Keys]]) => Out,
        init: Out,
    ): Out;
    /* curried */
    <In>(o: JSAnyObj<In>): {
        <Keys extends keyof In, Out>(
            f: (acc: Out, kv: [Keys, In[Keys]]) => Out
        ): {
            (init: Out): Out;
        };
    };
} = curry((o, f, init) => {
    if (!isObject(o) || !isFunction(f)) throw new TypeError(
        "struct.objectReduce() expected object and function, " +
        `got ${btquote(o)} and ${btquote(f)}`
    );
    return Object.entries(o).reduce((acc, kv) => f.call(o, acc, kv), init);
});




/**
 * When `o == { a: "b", c: "d" }`
 * then `swap(o) == { b: "a", d: "c" }`.
 *
 * @function swap
 * @param {JSAnyObj} o
 * @returns {JSAnyObj}
 */
export const swap = (
    o: JSAnyObj
): JSAnyObj => objectMap(o) (([k, v]) => [v, k]);