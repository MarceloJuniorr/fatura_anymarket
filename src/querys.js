import connectionSqldados from "./connection.js";

export const allOrders = async (date, hubId, storeno ) => {
    const [query] = await connectionSqldados.execute(`
        SELECT
            eord.ordno,
            eord.storeno,
            ordnoweb,
            nfeav.nfkey,
            xml
        FROM
            eord
            LEFT JOIN nfeav ON (
                eord.nfno = nfeav.nfno
                AND eord.nfse = nfeav.serie
                AND eord.storeno = nfeav.storeno
            )
            LEFT JOIN nfeavxml ON (nfeav.nfkey = nfeavxml.nfkey)
            LEFT JOIN eordchannelp ON (
                eord.ordno = eordchannelp.ordno
                AND eord.storeno = eordchannelp.storeno
            )
        WHERE
            eord.date = ${date}
            AND eord.storeno = ${storeno}
            AND eord.s11 = ${hubId}
            AND eord.nfno != 0
            AND eord.ordno not in (
                SELECT
                    ordno
                FROM
                    faturadaAnymarket
                WHERE
                    storeno = eord.storeno
            )
        GROUP BY
            ordnoweb`
        )
    return query
}

export const insertOrder = async (ordno, storeno ) => {
    const [query] = await connectionSqldados.execute(`
        INSERT INTO faturadaAnymarket (ordno, storeno) values (${ordno}, ${storeno})`)
    return query
}