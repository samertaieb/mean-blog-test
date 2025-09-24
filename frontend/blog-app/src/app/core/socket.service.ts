import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  connect(userId: string){
    if (this.socket) return;
    this.socket = io(environment.wsUrl, { transports: ['websocket'] });
    this.socket.on('connect', ()=> this.socket?.emit('join_user_room', userId));
  }
  onNotification(cb:(p:any)=>void){ this.socket?.on('notification', cb); }
  disconnect(){ this.socket?.disconnect(); this.socket = undefined; }
}
