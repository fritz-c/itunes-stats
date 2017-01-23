const parseXML = require('xml2js').parseString;

/**
 * Get a promise for parsed xml at the given url
 *
 * @return {Promise} promise that contains the parsed XML
 */
const getParsedXMLAtUrl = (url) =>
    fetch(url) // eslint-disable-line no-undef
        .then(response => response.text()) // First response with headers and start of writable object
        .then((rawXML) => new Promise((resolve, reject) =>
            // By now, the entire text body has been read in.
            // We now parse the xml and resolve the new promise when parsing is done
            parseXML(rawXML, (err, parsed) => err ? reject(err) : resolve(parsed))
        ));

module.exports = {
    getParsedXMLAtUrl,
};
