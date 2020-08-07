# Get Bank Mega Promotions (Node.JS) #

This project is used to scrap [Bank Mega Promotions](https://www.bankmega.com/promolainnya.php) website.

## Getting Started

This project has been tested with [Node.JS 8](https://nodejs.org/dist/latest-v8.x/docs/api/).

## Installation
Install _node_modules_ package using:
```shell script
$ npm install
or 
$ yarn install
```

## Usage
- To avoid Error: read ECONNRESET, set this value so every request can be delayed and repeated
```typescript
const MILLISECONDS_WAITING = 1000
const MAXIMUM_RETRIES = 4
```

- Run via ts-node
```shell script
$ ts-node src/solution.ts
```

- Or, build and run via node
```shell script
$ yarn build
or
$ npm run-scripts build

$ node build/src/solution.js 
```

## Unit Test
```shell script
$ yarn test
or
$ npm run-scripts test
```

## Library
1. [rxjs][rxjs]
2. [rx-http-requests][rx-http-requests]
3. [jest][jest]

[rxjs]: "https://github.com/ReactiveX/rxjs"
[rx-http-requests]: "https://github.com/akanass/rx-http-request/"
[jest]: "https://github.com/facebook/jest"
