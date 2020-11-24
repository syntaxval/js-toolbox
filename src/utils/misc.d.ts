/**
 * Utils - type declarations.
 *
 * @module @xcmats/js-toolbox/utils
 * @license Apache-2.0
 * @author drmats
 */




/**
 * Run "main" function:
 *     - in browser on "load" event,
 *     - via setTimeout if there's no event API available
 */
export declare function run (main: () => void): void;




/**
 * Time units represented in milliseconds.
 *
 * - `second` - `1000 milliseconds`
 * - `minute` - `60 seconds`
 * - `hour` - `60 minutes`
 * - `day` - `24 hours`
 * - `week` - `7 days`
 * - `month` - [**average** month]: `30.4375 days` (`365.25 days / 12`)
 * - `quarter` - [**average** quarter]: `3 months` (`365.25 days / 4`)
 * - `year` - [**average** year]: `365.25 days`
 */
export interface TimeUnit {
    second: number;
    minute: number;
    hour: number;
    day: number;
    week: number;
    month: number;
    quarter: number;
    year: number;
}
export declare const timeUnit: TimeUnit;