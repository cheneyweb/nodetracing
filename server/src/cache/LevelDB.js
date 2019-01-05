const level = require('level')
class LevelDB {
    static init(path) {
        LevelDB.db = level(path, { valueEncoding: "json" })
    }
    static get(key) {
        return new Promise((resolve, reject) => {
            LevelDB.db.get(key, (err, value) => {
                err ? reject(err) : resolve(value)
            })
        })
    }
}

module.exports = LevelDB