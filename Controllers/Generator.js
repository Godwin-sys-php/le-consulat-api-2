const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const Sessions = require('../Models/Sessions');

module.exports = (req, res) => {
  const number = fs.readFileSync(path.join(__dirname, '../Assets/', 'number.txt'), 'utf-8');
  Sessions.findItem({ idSession: req.session.idSession })
    .then(items => {
      const now = moment().utcOffset(1);
      const data = {
        data: {
          number: number,
          date: now.format('DD/MM/yyyy'),
          hours: now.format('H:mm'),
          client: req.session.nameOfClient,
          nameOfServer: req.session.nameOfServer,
          item: items,
          total: req.session.total,
          reduction: req.session.reduction,
          totalGeneral: Number(req.session.total) - Number(req.session.reduction),
          payed: Number(req.session.total) - Number(req.session.reduction),
          imgPath: path.join(__dirname, '../Assets/', "logo.png"),
        }
      }
	const nameOfTemplate = req.session.idUser == 0 ? "billTEF.ejs" : "bill.ejs";       
      ejs.renderFile(path.join(__dirname, '../Assets/', nameOfTemplate), data, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let options = {
            width: "7.5cm",
            localUrlAccess: true,
          };
        
          const nameOfFile = `Facture_${fs.readFileSync(path.join(__dirname, '../Assets/', 'number.txt'), 'utf-8')}_${req.session.nameOfClient}.pdf`;
          pdf.create(data, options).toFile(`Invoices/${nameOfFile}`, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              Sessions.updateOne({ invoiceUrl: `${req.protocol}://le-consulat-drc.com/Invoices/${nameOfFile}` }, req.session.idSession)
                .then(() => {
                  fs.writeFile(path.join(__dirname, '../Assets/', 'number.txt'), `${Number(number) + 1}`, 'utf8', () => {
                    res.status(200).json({ update: true });
                  });
                })
                .catch((error) => {
                  console.log(error);
                  res.status(500).json({ error: true, errorMessage: error });
                });
            }
          });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};
