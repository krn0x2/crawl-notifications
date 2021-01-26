import { AWSError, SES } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
const ses = new SES();

export async function sendEmail(
  email: string,
  title: string,
  body: string
): Promise<PromiseResult<SES.SendEmailResponse, AWSError>> {
  const params = {
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: title
      }
    },
    ReplyToAddresses: [],
    Source: 'krn0x2@gmail.com'
  };
  return ses.sendEmail(params).promise();
}
