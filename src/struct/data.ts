/**
 * Data structure manipulation tools.
 *
 * @module struct
 * @license Apache-2.0
 * @author drmats
 */

/* eslint-disable @typescript-eslint/no-explicit-any */




import { append } from "../array/list";
import { intersection } from "../array/set";
import { inc } from "../math/arithmetic";
import { quote } from "../string/transform";
import { space } from "../string/consts";
import {
    isArray,
    isNumber,
    isObject,
    isString,
} from "../type/check";




/**
 * 'Atomic', simple, basic data type (leaf).
 */
export type Atom =
    | boolean
    | number
    | string;

/**
 * Array - mutually recursive with Data (array node).
 */
export type DataArray<T = Atom> = Data<T>[];

/**
 * Object - mutually recursive with Data (object node).
 */
export type DataObject<T = Atom> = {
    [property: string]: Data<T>,
};

/**
 * Recursive data type (leaf or node).
 */
export type Data<T = Atom> =
    | T
    | DataArray<T>
    | DataObject;

/**
 * Node-indexing type.
 */
export type DataIndex =
    | string
    | number;




/**
 * Apply `path` to an object `o`. Return element reachable through
 * that `path` or `def` value.
 *
 * Example:
 *
 * ```
 * access({ a: { b: [10, { c: 42 }] } }, ["a", "b", 1, "c"])  ===  42
 * ```
 *
 * @function access
 * @param {Object} [o={}]
 * @param {Array.<String|Number>} [path=[]]
 * @param {unknown} [def]
 * @returns {any}
 */
export function access (
    o: Data = {},
    path: DataIndex[] = [],
    def?: Data
): Data | void {
    try {
        return path.reduce((acc: any, p) => acc[p], o) || def;
    } catch (_) {
        return def;
    }
}




/**
 * Safe version of standard JavaScript Object.assign();
 * Throws when `base` and `ext` have conflicting keys - prevents
 * accidental overwrite.
 *
 * @function assign
 * @param {Object} base
 * @param {Object} ext
 * @returns {void}
 */
export function assign<T> (base: T, ext: T): void {
    const overlap = intersection(
        Object.keys(base), Object.keys(ext)
    ) as string[];
    if (overlap.length === 0) {
        Object.assign(base, ext);
    } else {
        throw new TypeError([
            "struct.assign() - conflicting keys:",
            overlap.map(x => quote(x)).join(", "),
        ].join(space()));
    }
}




/**
 * Rewrite part of an object (first argument) reachable through passed path
 * (second argument) with provided value (third argument). Creates new object
 * with new data and references to all unchanged parts of the old object.
 * This function implements copy-on-write semantics.
 */
export function rewrite (
    o: Data,
    [h, ...t]: DataIndex[],
    v: Data
): Data {

    if (!h || !(isObject(o) || isArray(o))) return v;

    if (isObject(o)) {
        let data = o as DataObject;
        if (!isString(h) || !(h in data))
            throw new TypeError("struct.rewrite<object> - wrong path");
        let member = h as string;
        return {
            ...data,
            [member]: rewrite(data[member], t, v),
        };
    } else {
        let data = o as DataArray;
        if (!isNumber(h) || !(h in data))
            throw new TypeError("struct.rewrite<array> - wrong path");
        let index = h as number;
        return append(data.slice(0, index)) ([
            rewrite(data[index], t, v),
            ...data.slice(inc(index)),
        ]);
    }

}