const csv = require("csv-parser")
var fs = require('fs');

class CSVReader {
    constructor() {
        this.results = [];
    }

    read(path) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(path)
            .pipe(csv())
            .on('data', (data) => {
                this.results.push(data);
            })
            .on('end', () => {
                resolve(this.results);
            });
        });
    }
}

module.exports = CSVReader