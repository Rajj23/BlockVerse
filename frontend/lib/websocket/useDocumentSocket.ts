"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useAuthStore } from "@/lib/store/authStore";
import { CursorEvent, PresenceEvent, TypingEvent } from "@/types";

export const useDocumentSocket = (documentId: number) => {
  const clientRef = useRef<Client | null>(null);
  const { user } = useAuthStore();
  const { addActiveUser, removeActiveUser, setTypingUser } = useDocumentStore();

  useEffect(() => {
    if (!documentId || !user) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(typeof window !== "undefined" ? `${window.location.origin}/ws` : "/ws"),

      reconnectDelay: 3000,
      onConnect: () => {
        
        client.subscribe(
          `/topic/document/${documentId}/presence`,
          (msg) => {
            const event: PresenceEvent = JSON.parse(msg.body);
            if (event.action === "join") {
              addActiveUser(event.userId, event.userName);
            } else {
              removeActiveUser(event.userId);
              setTypingUser(event.userId, null);
            }
          }
        );

        
        client.subscribe(
          `/topic/document/${documentId}/typing`,
          (msg) => {
            const event: TypingEvent = JSON.parse(msg.body);
            if (event.userId === user.id) return; 
            setTypingUser(
              event.userId,
              event.action === "typing" ? event.blockId : null
            );
          }
        );

        
        client.subscribe(
          `/topic/document/${documentId}/cursor`,
          () => {
            
          }
        );

        
        client.publish({
          destination: "/app/document.join",
          body: JSON.stringify({
            documentId,
            userId: user.id,
            userName: user.name,
            action: "join",
          } as PresenceEvent),
        });
      },
      onDisconnect: () => {
        removeActiveUser(user.id);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.connected) {
        client.publish({
          destination: "/app/document.leave",
          body: JSON.stringify({
            documentId,
            userId: user.id,
            userName: user.name,
            action: "leave",
          } as PresenceEvent),
        });
      }
      client.deactivate();
    };
  }, [documentId, user, addActiveUser, removeActiveUser, setTypingUser]);

  const sendCursor = (blockId: number, cursorPosition: number) => {
    if (!clientRef.current?.connected || !user) return;
    clientRef.current.publish({
      destination: "/app/document.cursor",
      body: JSON.stringify({
        documentId,
        blockId,
        userId: user.id,
        cursorPosition,
      } as CursorEvent),
    });
  };

  const sendTyping = (blockId: number, action: "typing" | "stopped") => {
    if (!clientRef.current?.connected || !user) return;
    clientRef.current.publish({
      destination: "/app/document.typing",
      body: JSON.stringify({
        documentId,
        blockId,
        userId: user.id,
        action,
      } as TypingEvent),
    });
  };

  return { sendCursor, sendTyping };
};