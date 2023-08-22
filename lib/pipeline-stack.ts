import * as cdk from "aws-cdk-lib";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

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
  }
}
