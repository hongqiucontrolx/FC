const csv = require('csv-parser');
const fs = require('fs');

function csvToDish(filePath, onFinish) {

  let i = 1;
  const dishes = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const id = i++;
      const name = row['dishName'];
      const dish = {
        id,
        name,
        category: row['category'],
        ingredients: {}
      }

      for (const [key, value] of Object.entries(row)) {
        if (key === 'dishName' || key === 'category') continue;
        if (value === '') continue;
        dish.ingredients[key] = parseFloat(value);
      }

      dishes.push(dish);

    })
    .on('end', () => {
      onFinish(dishes);
    });

}

csvToDish('./data spreadsheet.csv', (dishes) => {
  console.log('done');
  fs.writeFileSync('menu.json', JSON.stringify(dishes, null, 2));
});
