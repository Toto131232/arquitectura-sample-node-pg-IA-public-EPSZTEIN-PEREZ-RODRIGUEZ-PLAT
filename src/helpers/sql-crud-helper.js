export const buildSelectAllSql = (tableName) => {
    return `SELECT * FROM ${tableName}`;
}

export const buildSelectByIdSql = (tableName, pkName = 'id') => {
    return `SELECT * FROM ${tableName} WHERE ${pkName}=$1`;
}

export const buildInsertSql = (tableName, columns) => {
    const columnsSql = columns.join(', ');
    const placeholdersSql = columns.map((_, index) => `$${index + 1}`).join(', ');
    return `INSERT INTO ${tableName} (${columnsSql}) VALUES (${placeholdersSql}) RETURNING id`;
}

export const buildUpdateSql = (tableName, columns, pkName = 'id') => {
    const setSql = columns.map((column, index) => `${column} = $${index + 2}`).join(', ');
    return `UPDATE ${tableName} SET ${setSql} WHERE ${pkName} = $1`;
}

export const buildDeleteByIdSql = (tableName, pkName = 'id') => {
    return `DELETE FROM ${tableName} WHERE ${pkName}=$1`;
}
