import * as cdk from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { WorkshopPipelineStage } from "./pipeline-stage";

export class WorkshopPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CodeCommitリポジトリを作成
    const repo = new codecommit.Repository(this, "WorkshopRepo", {
      repositoryName: "WorkshopRepo",
    });

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "WorkshopPipeline",
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.codeCommit(repo, "main"),
        commands: ["npm ci", "npm run build", "npm run cdk synth"],
      }),
    });

    // パイプラインのステージを追加
    const deployment = new WorkshopPipelineStage(this, "Deploy");
    const deploymentStage = pipeline.addStage(deployment);

    // エンドポイントの確認のために、デプロイ後にcurlを実行する
    deploymentStage.addPost(
      new CodeBuildStep("TestViewerEndpoint", {
        projectName: "TestViewerEndpoint",
        envFromCfnOutputs: {
          ENDPOINT_URL: deployment.hcViewerUrl,
        },
        commands: ["curl -Ssf $ENDPOINT_URL"],
      }),
      new CodeBuildStep("TestAPIGatewayEndpoint", {
        projectName: "TestAPIGatewayEndpoint",
        envFromCfnOutputs: {
          ENDPOINT_URL: deployment.hcEndpoint,
        },
        commands: ["curl -Ssf $ENDPOINT_URL"],
      })
    );
  }
}
