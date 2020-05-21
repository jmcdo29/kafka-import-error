import { INestApplication, INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { KafkaClientModule } from '../src/client/kafka-client.module';
import { KafkaServerModule } from '../src/server/kafka-server.module';
import { hello, httpPromise } from './utils';

describe('kafka test', () => {
  let server: INestMicroservice;
  let client: INestApplication;

  beforeAll(async () => {
    const serverModRef = await Test.createTestingModule({
      imports: [KafkaServerModule],
    }).compile();
    server = serverModRef.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
      },
    });
    await server.listenAsync();
    const clientModRef = await Test.createTestingModule({
      imports: [KafkaClientModule],
    }).compile();
    client = clientModRef.createNestApplication();
    await client.listen(0);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  describe('server calls', () => {
    let baseUrl: string;

    beforeAll(async () => {
      baseUrl = await client.getUrl();
    });

    it.each`
      url         | data
      ${'/'}      | ${hello}
      ${'/error'} | ${'Borked'}
      ${'/skip'}  | ${hello}
    `('$url call', async ({ url, data }: { url: string; data: any }) => {
      const res = await httpPromise(baseUrl + url);
      expect(res).toEqual(data);
    });
  });
});
