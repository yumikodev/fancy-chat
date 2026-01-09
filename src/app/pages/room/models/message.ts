export interface IMessage {
  type: string;
  temporalId?: string;
  username: string;
  content: string[];
  timestamp: Date;
}

export class SystemMessageBuilder implements IMessage {
  type = 'SYSTEM_MESSAGE';
  username = 'Sistema';

  constructor(public content: string[], public timestamp: Date) {}
}

export class MessageBuilder implements IMessage {
  type = 'MESSAGE';

  constructor(
    public temporalId: string,
    public username: string,
    public content: string[],
    public timestamp: Date
  ) {}
}
