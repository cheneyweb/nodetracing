const level = require('level')
class LevelDB {
    static init(path) {
        LevelDB.db = level(path, { valueEncoding: "json" })
        LevelDB.PREFIX_SERVICE_SET = 's_'
        LevelDB.PREFIX_SERVICE_OPERATION = 'so_'
        LevelDB.PREFIX_SERVICE_OPERATION_SPAN = 'sos_'
        LevelDB.PREFIX_SERVICE_MAP = 'sm_'
        LevelDB.PREFIX_SERVICE_DAG = 'sdag'
    }
    static queryByPrefix(prefix, limit) {
        let options = { gte: prefix, lte: prefix.substring(0, prefix.length - 1) + String.fromCharCode(prefix[prefix.length - 1].charCodeAt() + 1) }
        if (limit) {
            options.limit = limit
        }
        return new Promise((resolve, reject) => {
            let resArr = []
            LevelDB.db.createValueStream(options)
                .on('data', function (data) {
                    resArr.push(data)
                })
                .on('error', function (err) {
                    console.error(err)
                    resolve(resArr)
                })
                .on('close', function () {
                    resolve(resArr)
                })
                .on('end', function () {
                    resolve(resArr)
                })
        })
    }
    static get(key) {
        return new Promise((resolve, reject) => {
            LevelDB.db.get(key, (err, value) => {
                resolve(value)
            })
        })
    }
}

module.exports = LevelDB