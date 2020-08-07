import { GetContents, GetPromotions, LoadCategory } from './load-page';
import { writeFile } from 'fs';

console.log('Wait')
LoadCategory().then(categories => {
  return Promise.all(categories
    .filter(category => category.id === 'dailyneeds' || category.id === 'others_promo')
    .map(category => {
      console.log(`Get Category ${category.id}`)
      return GetContents(category)
    }))
}).then(categories => {
  console.log('Get Promotions')
  return Promise.all(categories.map(content => GetPromotions(content)))
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
