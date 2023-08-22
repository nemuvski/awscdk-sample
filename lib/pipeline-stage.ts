import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AwscdkSampleStack } from "./awscdk-sample-stack";

export class WorkshopPipelineStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AwscdkSampleStack(this, "WebService");
  }
}
