import { SESClient } from "@aws-sdk/client-ses";

const region = process.env.AWS_REGION || "ap-south-1";

export const sesClient = new SESClient({ region });
