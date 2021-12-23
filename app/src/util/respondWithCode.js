/**
 * Simple Express function for sending a response back with a status code
 * 
 * @param {Response} res - Express response object
 * @param {number} code - HTTP status code
 * @param {*} body - response body to send
 */
 const respondWithCode = (res, code, body) => {
    res.status(code);
    res.send(body);
  };
  
  export default respondWithCode;
  