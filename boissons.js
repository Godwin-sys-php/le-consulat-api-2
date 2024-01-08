const fs = require('fs');
const csv = require('csv-parser');

const sqlFile = fs.createWriteStream('spiritus.sql');

fs.createReadStream('spiritus.csv')
  .pipe(csv({separator: ';'}))
  .on('data', (row) => {
    console.log(row);
    // Créer la requête INSERT pour chaque ligne
    if (Number(row.Reel) > 0) {
      const insertQuery = `UPDATE products SET inStock = ${Number(row.Reel)} where name="${row.Nom}";\n`;
      
      // Écrire la requête dans le fichier SQL
      sqlFile.write(insertQuery);
    } else {
      const insertQuery = `UPDATE products SET inStock = ${0} where name="${row.Nom}";\n`;
      
      // Écrire la requête dans le fichier SQL
      sqlFile.write(insertQuery);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed. SQL queries written to inserts.sql');
  });
