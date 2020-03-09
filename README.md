# query-params-data

[![Actions Status](https://github.com/erhathaway/query-params-data/workflows/Continous%20Integration/badge.svg)](https://github.com/erhathaway/query-params-data/actions)

![](https://api.dependabot.com/badges/status?host=github&repo=erhathaway/query-params-data)

Easily control data in query params.

-   set data at a specific query param
-   subscribe to changes of data at different query param keys.

# Usage

```typescript
import UrlStore from 'query-params-data';

// control the `user_id` query param
const userIdUrlStore = new UrlStore('user_id');

// set data to the `user_id` query param
userIdUrlStore.setState('1');

// subscribe to changes of the `user_id` query param or get the existing state at startup
const onChange = state => console.log(`The current user id is ${state}`);
userIdUrlStore.subscribeToStateChanges(onChange);
```
