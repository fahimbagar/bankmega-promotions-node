import { Category, GetContents, GetPages, GetPromotions, LoadCategory } from '../src/load-page';

describe('- main.test.ts file', () => {
  test('- test LoadCategory', (done) => {
    LoadCategory().then(categories => {
      expect(categories.length).toBeGreaterThan(0)
      expect(categories).toBeInstanceOf(Array)
      expect(categories[0]).toHaveProperty('id')
      done()
    })
  });

  test('- test GetPages', (done) => {
    const testCategory: Category = {
      id: 'dailyneeds',
      url: 'ajax.promolainnya.php?product=0&subcat=5'
    }
    expect(testCategory.pages).toBeUndefined()
    GetPages(testCategory).then(category => {
      expect(category.pages).toBeGreaterThan(0)
      done()
    })
  });


  test('- test GetContents', (done) => {
    const testCategory: Category = {
      id: 'dailyneeds',
      url: 'ajax.promolainnya.php?product=0&subcat=5',
      pages: 3
    }
    GetContents(testCategory).then(category => {
      expect(category.contents.length).toBeGreaterThan(0)
      expect(category.contents[0].title).toBeUndefined()
      expect(category.contents[0].image).toBeDefined()
      expect(category.contents[0].url.startsWith('http')).toBeTruthy()
      expect(category.contents[0].area).toBeUndefined()
      expect(category.contents[0].period).toBeUndefined()
      expect(category.contents[0].information).toBeUndefined()
      expect(category.contents[0].redirect).toBeUndefined()
      done()
    })
  });

  test('- test GetPromotions', (done) => {
    const testCategory: Category = {
      id: 'dailyneeds',
      url: 'ajax.promolainnya.php?product=0&subcat=5',
      pages: 3,
      contents: [{url: 'https://www.bankmega.com/promo_detail.php?id=1992'}]
    }
    GetContents(testCategory).then(category => {
      return GetPromotions(category)
    }).then(category => {
      expect(category.contents.length).toBeGreaterThan(0)
      expect(category.contents[0].title).toBeDefined()
      expect(category.contents[0].image).toBeDefined()
      expect(category.contents[0].url.startsWith('http')).toBeTruthy()
      expect(category.contents[0].area).toBeDefined()
      expect(category.contents[0].period).toBeDefined()
      expect(category.contents[0].information.startsWith('http')).toBeTruthy()
      expect(category.contents[0].redirect).toBeUndefined()

      expect(category.contents[2].title).toBeDefined()
      expect(category.contents[2].image).toBeDefined()
      expect(category.contents[2].url.startsWith('http')).toBeTruthy()
      expect(category.contents[2].area).toBeDefined()
      expect(category.contents[2].period).toBeDefined()
      expect(category.contents[2].information.startsWith('http')).toBeTruthy()
      expect(category.contents[2].redirect.startsWith('http')).toBeTruthy()
      done()
    })
  });
})
