import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AwscdkSampleStack } from "./awscdk-sample-stack";

export class WorkshopPipelineStage extends cdk.Stage {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const webService = new AwscdkSampleStack(this, "WebService");
    this.hcViewerUrl = webService.hcViewerUrl;
    this.hcEndpoint = webService.hcEndpoint;
  }
}
