const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
// dynamodbclient-olio
const ddbcli = new DynamoDBClient({ region: 'eu-north-1' });
// määritykset kun muutetaan JS-tyypit DDB-tyypeiksi
const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false,
};
// määritykset kun muutetaan DDB-tyypit JS-tyypeiksi
const unmarshallOptions = {
  wrapNumbers: false,
};
// documentclient-olio
const doccli = DynamoDBDocumentClient.from(ddbcli, {
  marshallOptions,
  unmarshallOptions,
});
// exportataan documentclient -olio
module.exports = { doccli };
