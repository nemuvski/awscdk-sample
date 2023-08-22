import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { HitCounter } from "./hitcounter";
import { TableViewer } from "cdk-dynamo-table-viewer";

export class AwscdkSampleStack extends cdk.Stack {
  // hc = HitCounter
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda resources
    const helloHandler = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: helloHandler,
      readCapacity: 5,
    });

    // API Gateway resources
    const apiGateway = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });
    this.hcEndpoint = new cdk.CfnOutput(this, "GatewayUrl", {
      value: apiGateway.url,
    });

    // DynamoDB Table Viewer
    const tableViewer = new TableViewer(this, "ViewHitCounter", {
      title: "Hello Hits",
      table: helloWithCounter.table,
      sortBy: "-hits",
    });
    this.hcViewerUrl = new cdk.CfnOutput(this, "TableViewerUrl", {
      value: tableViewer.endpoint,
    });
  }
}
