import { GetContents, GetPromotions, LoadCategory } from './load-page';
import { writeFile } from 'fs';

/**
 * To avoid Error: read ECONNRESET, set this value so every request can be delayed
 */
const MILLISECONDS_WAITING = 1000
const MAXIMUM_RETRIES = 4

console.log('Wait')
LoadCategory().then(categories => {
  /**
   * Load all category and run it parallel
   */
  return Promise.all(categories
    .map(category => {
      console.log(`Get Category ${category.id}`)
      return GetContents(category)
    }))
}).then(categories => {
  /**
   * To avoid Error: read ECONNRESET, rather than run as Promise.all(),
   * it's better to run every category sequentially
   */
  return categories.map(content => GetPromotions(content, MILLISECONDS_WAITING, MAXIMUM_RETRIES))
    .reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult =>
        [ ...chainResults, currentResult ]
      )
    );
  }, Promise.resolve([]))
}).then(categories => {
  const solution = categories.reduce((map, obj) => {
    map[obj.id] = obj.contents;
    return map;
  }, {})
  console.log('Done')
  writeFile('solution.json', JSON.stringify(solution, null, 2), err => {
    if (err) {
      console.log(err);
    }
  })
})
