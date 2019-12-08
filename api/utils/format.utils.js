/**
 * Enable content negotiation
 * @param {{
 *  res: Express.Response;
 *  config: {
 *      [field: string]: () => void
 *  };
 * }} param0
 */
export function contentNegotiator({ res, config }) {
  res.format(config);
}

/**
 * Convert array to CSV string
 * @param {any[]} arr
 * @returns {string}
 */
export function convertToCSV(arr) {
  return [Object.keys(arr[0])] // field labels
    .concat(arr)
    .map(it => Object.values(it).toString())
    .join("\n");
}

/**
 *
 * @param {*} contact
 */
export function orderContactProps(contact) {
  return Object.keys(contact)
    .sort()
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: contact[key]
      }),
      {
        _id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName
      }
    );
}

/**
 *
 * @param {object} obj
 */
export function getKeys(obj) {
  return Object.keys(obj);
}

/**
 *
 * @param {object} obj
 */
export function getValues(obj) {
  return Object.values(obj);
}

/**
 * Return a POJO array from Mongoose Document array
 * @param {*} mongooseDocumentArray
 * @returns {object[]}
 */
export function getPOJOArrayFrom(mongooseDocumentArray) {
  return mongooseDocumentArray.map(doc => doc.toObject());
}

/**
 * Return a contact POJO with ordered properties array from
 *  Mongoose Document array of contacts
 * @param {*} contactsDocumentArray
 */
export function getOrderedContactsPOJOArrayFrom(contactsDocumentArray) {
  return getPOJOArrayFrom(contactsDocumentArray).map(orderContactProps);
}

/**
 * Generate HTML table cells from object
 * @param {*} data
 */
export function generateHTMLCells(data, style) {
  return getValues(data).reduce((acc, value) => {
    return acc.concat(
      "\n",
      `
      <td style="${style}padding: 1%;border-bottom: 1px solid #ddd;">
        ${JSON.stringify(value, (k, v) => {
          //   console.log(v);
          if (Array.isArray(v) && Object.keys(v[0]).length == 3 && v[0].name) {
            return v.map(
              s => `<a target="blank" href="${s.link}">${s.name}</a>`
            ).join(" ");
          }
          return k === "_id" ? undefined : v;
        })
          .replace(/"/g, "")
          .replace(/,/g, "<br>")
          .replace(/\{/g, "{<br>")
          .replace(/\}/g, "<br>}")
          .replace(/\[|\]/g, "")}
      </td>
      `
    );
  }, "");
}

/**
 * Generate HTML table headers from object
 * @param {*} data
 */
export function generateHTMLTableHeaders(data, style) {
  return getKeys(data).reduce((acc, key) => {
    return acc.concat(
      "\n",
      `
        <th style="${style}border-bottom: 1px solid #ddd;height: 50px;background-color: #4CAF50; color: white;">
          ${key}
        </th>
        `
    );
  }, "");
}

/**
 * Generate HTML table
 * @param {*} tableBody
 */
export function generateHTMLTable(tableBody) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            table {
                font-family: arial, sans-serif;
                border-collapse: collapse;
                width: 100%;
            }
        
            th {
                padding: 8px;
            }
            td {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
            }
            HTML
            tr:nth-child(even) {
                background-color: #dddddd;
            }
        </style>
    </head>
    <body>
        <div style="display: flex; flex-flow: row wrap;">
            <table style="width: 100%;">
                <tbody>
                        ${tableBody}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
}
