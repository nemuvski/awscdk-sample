import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Lambda } from "@aws-sdk/client-lambda";

const handler: APIGatewayProxyHandler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    });

  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      Payload: JSON.stringify(event),
    });

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}`,
  };
};

export { handler };
