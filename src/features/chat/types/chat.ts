// features/chat/types/chat.ts
export interface Reaction {
  user: string;
  emoji: string;
}

export interface IMessage {
  _id: string;
  msg: string;
  content?: string;
  sender: string;
  roomId: string;
  timestamp: number;
  seen?: boolean;
  reactions?: Reaction[];
}