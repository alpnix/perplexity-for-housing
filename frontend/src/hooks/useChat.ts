"use client";

import { useEffect, useState } from "react";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import toast from "react-hot-toast";
import { ApiResponse } from "@/types";

export type ChatMatch = {
  matchId: string;
  otherUser: {
    _id: string;
    firstname: string;
    lastname: string;
    email?: string;
    image?: string;
  } | null;
  tenantProfile?: any;
};

export type ChatMessage = {
  _id: string;
  sender: string;
  match: string;
  content: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const useChat = () => {
  const [matches, setMatches] = useState<ChatMatch[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useMutate(
    async () => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/matches`,
        "GET",
        null
      );
      const result: ApiResponse<ChatMatch[]> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch matches.");
      }
      return result.data;
    },
    {
      onSuccess: (data: ChatMatch[]) => {
        setMatches(data);
      },
      onError: (err: Error) => {
        setError(err.message);
        toast.error(err.message);
      },
    }
  );

  const fetchMessagesByMatch = useMutate(
    async (matchId: string) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/matches/${matchId}/messages`,
        "GET",
        null
      );
      const result: ApiResponse<ChatMessage[]> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch messages.");
      }
      return result.data;
    },
    {
      onSuccess: (data: ChatMessage[]) => {
        setMessages(data);
      },
      onError: (err: Error) => {
        setError(err.message);
        toast.error(err.message);
      },
    }
  );

  const sendMessage = useMutate(
    async ({ matchId, content }: { matchId: string; content: string }) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/matches/${matchId}/messages`,
        "POST",
        { content }
      );
      const result: ApiResponse<ChatMessage> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to send message.");
      }
      return result.data;
    },
    {
      onSuccess: (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      },
      onError: (err: Error) => {
        setError(err.message);
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (!activeMatchId) return;
    fetchMessagesByMatch.mutateAsync(activeMatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatchId]);

  return {
    matches,
    messages,
    activeMatchId,
    setActiveMatchId,
    fetchMatches,
    fetchMessagesByMatch,
    sendMessage,
    error,
    setError,
    setMessages,
  };
};


