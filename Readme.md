## Install dependencies

    npm install
    

## Zip and create lambda

    zip the root and upload to AWS lambda
    Set index.handler as the entrypoint
    Set a cloudwatchEvent (15 min) as a trigger
    Set environment variables

![Zip the package](/img/compress.png)

![Lambda Configuration](/img/lambda.png)

![Environment Variables](/img/lambda_env.png)
