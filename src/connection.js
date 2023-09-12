import { createPool } from 'mysql2/promise'

const config = {
    database: {
        host: process.env.DB_HOST ? process.env.DB_HOST : "",
        port: process.env.DB_PORT ? process.env.DB_PORT : "",
        user: process.env.DB_USER ? process.env.DB_USER : "",
        password: process.env.DB_PASS ? process.env.DB_PASS : "",
        name: process.env.DB_NAME ? process.env.DB_NAME : "sqldados",
      }
}

const {database} = config


export const connectionSqldados = createPool({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
    database: database.name
})


export default connectionSqldados
