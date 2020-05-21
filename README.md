# Kafka-Import-Error

When running a Kafka microservice, both caller and receiver, in an E2E test, after the caller and receiver applications close, Kafka tries to run a `heartbeat` check after the test and it results in the following error

```
Jest did not exit one second after the test run has completed.

This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.

      at 1 (../node_modules/kafkajs/src/protocol/requests/heartbeat/index.js:11:21)
      at Broker.heartbeat (../node_modules/kafkajs/src/broker/index.js:314:39)
      at ConsumerGroup.heartbeat (../node_modules/kafkajs/src/consumer/consumerGroup.js:310:30)
      at Runner.fetch (../node_modules/kafkajs/src/consumer/runner.js:317:30)
```

## Reproduction Steps

1) Run `docker-compose up -d`
2) Wait for the Kafka Server to be up and listening 
   1) you can check with `docker-compose logs -f` and wait to see the start logs
3) Run `test:e2e`.

## Reason

I'm trying to create some minimal tests for my `@ogma/` packages and the interceptor which requires requests to run through a successful request, an error, and a skipped request. I figured this would be the easiest way to send requests in an e2e context. 