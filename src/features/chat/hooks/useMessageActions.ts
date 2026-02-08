import { useCallback } from "react";
import { sendReaction, type ChatMessageType } from "../api/socket";

export const useMessageActions = (currentUsername: string) => {
  
  const onReaction = useCallback((message: ChatMessageType, emoji: string) => {
    if (message._id) {
      sendReaction(message._id, message.roomId, emoji, currentUsername);
    }
  }, [currentUsername]);

  return {
    onReaction
  };
};