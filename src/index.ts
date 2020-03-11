import queryString from 'query-string';

type StateObserver<State> = (newState: State | undefined) => any; // eslint-disable-line

export interface ICurrentLocationStore<State> {
    setState: (location: State | undefined, options?: {replaceLocation: boolean}) => void;
    getState: () => State | undefined | void;
    subscribeToStateChanges: (
        observer: StateObserver<State>,
        options?: {getCurrentState: boolean}
    ) => void;
}

class UrlStore<State> implements ICurrentLocationStore<State> {
    public queryParamKey: string;
    public observers: Array<StateObserver<State>>;
    public stateWatcher: ReturnType<typeof window.setInterval>;
    public existingLocation: string;
    public setIntervalHandle: number;

    constructor(queryParamKey: string) {
        this.queryParamKey = queryParamKey;
        this.observers = [];

        this.existingLocation = '';
        this.setIntervalHandle = setInterval(() => {
            this._monitorLocation();
        }, 100);
    }

    public cleanUpSetIntervalInstance = (): void => {
        clearInterval(this.setIntervalHandle);
    };

    public subscribeToStateChanges = (
        fn: StateObserver<State>,
        options?: {getCurrentState: boolean}
    ): void => {
        this.observers.push(fn);

        // send existing state to observer
        if (options.getCurrentState) {
            const deserializedState = this.getState();
            if (deserializedState) {
                fn(deserializedState);
            }
        }
    };

    public setState(newState: State | undefined, options?: {replaceLocation: boolean}): void {
        const location = this.serializer(newState);

        if (options && options.replaceLocation === true) {
            window.history.replaceState({url: location}, '', location);
        } else {
            window.history.pushState({url: location}, '', location);
        }
    }

    public getState = (): State | undefined => {
        const queryStringWithState = window.location.search || '';
        const queryParamOfInterest = this.queryParamsExtractor(queryStringWithState);

        if (typeof queryParamOfInterest === 'string') {
            try {
                return JSON.parse(queryParamOfInterest);
            } catch {
                return undefined;
            }
            // tslint:disable-next-line
        } else if (queryParamOfInterest == null) {
            return undefined;
        } else {
            throw new Error(
                `Could not decode query param: ${queryParamOfInterest}. There is no support for type ${typeof queryParamOfInterest}`
            );
        }
    };

    public queryParamsExtractor = (
        queryStringWithState: string
    ): string | string[] | null | undefined => {
        const queryParams = queryString.parse(queryStringWithState, {
            decode: true
        });

        return queryParams[this.queryParamKey];
    };

    public _monitorLocation(): void {
        const newLocation = window.location.href;
        if (this.existingLocation !== newLocation) {
            this.existingLocation = newLocation;
            this.notifyObservers();
        }
    }

    public notifyObservers = (): void => {
        const deserializedState = this.getState();
        this.observers.forEach(fn => fn(deserializedState));
    };

    public unsubscribeFromStateChanges(fn: StateObserver<State>): void {
        this.observers = this.observers.filter(existingFn => existingFn !== fn);
    }

    /**
     * Serializes state into the location string
     */
    // tslint:disable-next-line
    public serializer = (newState: State | undefined): string => {
        const originString = window.location.origin;
        const pathnameString = window.location.pathname === '' ? '' : `${window.location.pathname}`;
        const queryParams = queryString.parse(window.location.search || '');

        const queryParamsWithNewState = {
            ...queryParams,
            [this.queryParamKey]: newState ? JSON.stringify(newState) : undefined
        };
        if (queryParamsWithNewState[this.queryParamKey] === undefined) {
            delete queryParamsWithNewState[this.queryParamKey];
        }

        const queryStringWithNewState = queryString.stringify(queryParamsWithNewState);

        return queryStringWithNewState === ''
            ? `${originString}${pathnameString}`
            : `${originString}${pathnameString}?${queryStringWithNewState}`;
    };
}

export default UrlStore;
