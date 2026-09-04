import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQClient {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async emitUserCreated(payload: unknown): Promise<void> {
    await this.client.emit('user.created', payload).toPromise();
  }
}
