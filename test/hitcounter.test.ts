import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "../lib/hitcounter";
import { Capture, Template } from "aws-cdk-lib/assertions";

/**
 * 生成されたスタックにDynamoDBテーブルが含まれているか確認するテスト
 */
test("DynamoDB Table Created", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

/**
 * 生成されたスタックにLambda関数が含まれているか確認するテスト
 * その関数には、環境変数が設定されていることをテスト
 */
test("Lambda has environment variables", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      DOWNSTREAM_FUNCTION_NAME: {
        // 末尾にハッシュが付与されるので注意
        Ref: "TestFunction22AD90FC",
      },
      HITS_TABLE_NAME: {
        // 末尾にハッシュが付与されるので注意
        Ref: "MyTestConstructHits24A357F0",
      },
    },
  });
});

/**
 * DynamoDBテーブルが暗号化されているか確認するテスト
 */
test("DynamoDB Table created with encryption", () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});

/**
 * DynamoDBテーブルの読み取りキャパシティが5以上20以下であることを確認するテスト
 */
test("readCapacity can be configured", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 3,
    });
  }).toThrowError(/readCapacity must be greater than 5 and lower than 20/);
});
