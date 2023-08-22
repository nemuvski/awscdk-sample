#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WorkshopPipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
new WorkshopPipelineStack(app, "WorkshopPipelineStack");
