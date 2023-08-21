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
