import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket.service';
import { Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = wsService.connect();
    setSocket(ws);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    ws.on('connect', handleConnect);
    ws.on('disconnect', handleDisconnect);

    return () => {
      ws.off('connect', handleConnect);
      ws.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
};
