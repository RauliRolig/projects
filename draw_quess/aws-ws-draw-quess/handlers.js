const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');
const { doccli } = require('./ddbconn');

const CONNECTION_DB_TABLE = process.env.CONNECTION_DB_TABLE;

// Fetches all connections from DynamoDB
const getAllConnections = async () => {
  const params = {
    TableName: CONNECTION_DB_TABLE,
    ProjectionExpression: 'connectionId, #n', // Only connectionId and name
    ExpressionAttributeNames: {
      '#n': 'name', // Name alias
    },
  };
  try {
    const data = await doccli.send(new ScanCommand(params));
    return data.Items; // Returns all connections
  } catch (err) {
    console.error(err);
  }
};

// Adds a new connection to DynamoDB
const addConnection = async (connectionId) => {
  const params = {
    TableName: CONNECTION_DB_TABLE,
    Item: {
      connectionId: connectionId,
    },
  };
  try {
    const data = await doccli.send(new PutCommand(params));
    console.log('Success, connectionId created', data);
  } catch (err) {
    console.log('error' + err);
  }
};

// Deletes a connection from DynamoDB
const deleteConnection = async (connectionId) => {
  const params = {
    TableName: CONNECTION_DB_TABLE,
    Key: {
      connectionId: connectionId,
    },
  };
  try {
    return await doccli.send(new DeleteCommand(params));
  } catch (err) {
    console.log('Error deleting', err);
  }
};

// Adds a username to a specific connection in DynamoDB
const addUserName = async (connectionId, name) => {
  const params = {
    TableName: CONNECTION_DB_TABLE,
    Key: {
      connectionId: connectionId, // Connection ID
    },
    UpdateExpression: 'set #n = :n',
    ExpressionAttributeNames: {
      '#n': 'name', // Name alias
    },
    ExpressionAttributeValues: {
      ':n': name, // New name
    },
  };
  try {
    await doccli.send(new UpdateCommand(params));
    console.log('Success, user name added');
  } catch (err) {
    console.error('Error adding user name', err);
  }
};

// Successful HTTP response
const successfulResponse = {
  statusCode: 200,
  body: 'Success',
};

// Failed HTTP response
const failedResponse = (statusCode, error) => ({
  statusCode,
  body: error,
});

// Handler for adding a new connection
const connectHandler = (event, context, callback) => {
  addConnection(event.requestContext.connectionId)
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Handler for deleting a connection
const disconnectHandler = (event, context, callback) => {
  deleteConnection(event.requestContext.connectionId)
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      console.log(err);
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Default handler for unknown events
const defaultHandler = (event, context, callback) => {
  callback(null, failedResponse(404, 'No event found'));
};

// Handler for setting a username
const setNameHandler = (event, context, callback) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const name = body.name;

  addUserName(connectionId, name)
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Handler for draw events
const drawHandler = (event, context, callback) => {
  sendMessageToAllConnected(event, 'draw')
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Handler for guess events
const guessHandler = (event, context, callback) => {
  sendMessageToAllConnected(event, 'guess')
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Handler for clear canvas events
const clearHandler = (event, context, callback) => {
  sendMessageToAllConnected(event, 'clear')
    .then(() => {
      callback(null, successfulResponse);
    })
    .catch((err) => {
      callback(failedResponse(500, JSON.stringify(err)));
    });
};

// Sends a message to all connections
const sendMessageToAllConnected = async (event, type) => {
  const allConnections = await getAllConnections(); // Fetches all connections from DynamoDB

  const body = JSON.parse(event.body);

  // Creates API Gateway client for sending messages
  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  // Iterates through all connections and sends a message
  await Promise.all(
    allConnections.map(async (connection) => {
      let message;

      // Determines the message type
      if (type === 'draw') {
        // If the message type is 'draw', creates a draw message

        const drawData = JSON.parse(body.data); // Converts JSON string to object
        message = {
          type: 'draw',
          x: drawData.x,
          y: drawData.y,
          color: drawData.color,
        };
      } else if (type === 'guess') {
        // If the message type is 'guess', creates a guess message

        message = {
          type: 'guess',
          guess: body.guess,
          name: allConnections.find(
            (conn) => conn.connectionId === event.requestContext.connectionId
          ).name, // Finds the connection name
        };
      } else if (type === 'clear') {
        // If the message type is 'clear', creates a clear message

        message = {
          type: 'clear',
        };
      }

      const postParams = {
        ConnectionId: connection.connectionId,
        Data: JSON.stringify(message),
      };

      try {
        // Sends the message to the connection
        await apiClient.send(new PostToConnectionCommand(postParams));
      } catch (err) {
        // If error is due to stale connection, deletes it
        if (err.statusCode === 410) {
          console.log(
            `Found stale connection, deleting ${connection.connectionId}`
          );
          await deleteConnection(connection.connectionId);
        } else {
          // If error is due to something else, throws the error
          throw err;
        }
      }
    })
  );
};

module.exports = {
  connectHandler,
  disconnectHandler,
  defaultHandler,
  setNameHandler,
  drawHandler,
  guessHandler,
  clearHandler,
};
