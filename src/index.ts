export type Store<T> = { [key: string]: T } | Map<string, T>;

export interface UniqueOptions<T> {
    /**
     * The time in milliseconds this method may take before throwing an error.
     *
     * @default 50
     */
    maxTime?: number;

    /**
     * The total number of attempts to try before throwing an error.
     *
     * @default 50
     */
    maxRetries?: number;

    /**
     * The value or values that should be excluded.
     *
     * If the callback returns one of these values, it will be called again and the internal retries counter will be incremented.
     *
     * @default []
     */
    exclude?: T | T[];

    /**
     * The store of already fetched results.
     *
     * @default {}
     */
    readonly store?: Store<T>;
}

export type UniqueReturn<T, U extends readonly any[] = readonly any[]> = (
    ...args: [...U]
) => T;

type ExecReturn<T, U extends readonly any[] = readonly any[]> = (
    method: UniqueReturn<T, U>,
    args: U,
    retry: number
) => T;

/**
 * Generates a unique result using the results of the given method. Used unique entries will be stored internally and filtered from subsequent calls.
 *
 * @param method The method used to generate the values.
 * @param options The optional options used to configure this method.
 * @param options.maxTime The time in milliseconds this method may take before throwing an error. Defaults to `50`.
 * @param options.maxRetries The total number of attempts to try before throwing an error. Defaults to `50`.
 * @param options.exclude The value or values that should be excluded/skipped. Defaults to `[]`.
 * @param options.store The store of unique entries. Defaults to `new Map()`.
 */
export default function unique<T, U extends readonly any[] = readonly any[]>(
    method: UniqueReturn<T, U>,
    options: UniqueOptions<T> = {}
): UniqueReturn<T, U> {
    /**
     * @todo implement maxTime
     */
    const {
        maxTime = 50,
        maxRetries = 50,
        exclude: excludeOption = [],
        store: storeOption,
    } = options;
    const store: Map<string, T> = storeOption
        ? new Map(Object.entries(storeOption))
        : new Map();
    const exclude = Array.isArray(excludeOption)
        ? excludeOption
        : [excludeOption];
    const startTime = Date.now();
    return (...args) => {
        const exec: ExecReturn<T, U> = (method, args, retry) => {
            if ((Date.now() - startTime) > maxTime) {
                throw new Error(
                    `unique-callback: maxTime of ${maxTime}ms exceeded after ${retry} retries`
                );
            }
            if (retry > maxRetries) {
                throw new Error(
                    `unique-callback: maxRetries of ${maxRetries} exceeded`
                );
            }
            const result = method(...args);
            const key = JSON.stringify(args) + JSON.stringify(result);
            if ((exclude as T[]).includes(result)) {
                return exec(method, args, retry + 1);
            }
            if (store.has(key)) {
                return exec(method, args, retry + 1);
            }
            store.set(key, result);
            return result;
        };
        return exec(method, args, 0);
    };
}
