async function createRoom() {
  if (!this.newRoomName.trim()) return;
  try {
    const res = await fetch('https://matrix.org/_matrix/client/r0/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({ 
        preset: 'private_chat', 
        name: this.newRoomName.trim(), 
        invite: this.inviteUser ? [this.inviteUser.trim()] : [] 
      })
    });
    
    const data = await res.json();
    if (data.room_id) {
      this.newRoomId = data.room_id;
      this.roomId = data.room_id;
      this.messages = [];
      this.lastSyncToken = '';
      await this.fetchRoomsWithNames();
      this.fetchMessages();
      this.inviteUser = '';
      alert(`Кімнату "${this.newRoomName}" створено з ID: ${this.newRoomId}`);
    } else {
      console.error('Помилка створення кімнати:', data);
      alert('Помилка створення кімнати: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    console.error('Помилка створення кімнати:', e);
    alert('Помилка створення кімнати: ' + e.message);
  }
}

async function fetchRoomsWithNames() {
  if (!this.accessToken) return;
  try {
    const res = await fetch('https://matrix.org/_matrix/client/r0/joined_rooms', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    
    const data = await res.json();
    if (data.joined_rooms) {
      const roomPromises = data.joined_rooms.map(async (roomId) => {
        try {
          const nameRes = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/state/m.room.name`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
          });
          
          if (nameRes.ok) {
            const nameData = await nameRes.json();
            return {
              roomId,
              name: nameData?.name || this.getRoomName(roomId) || roomId
            };
          }
        } catch (e) {
          console.error('Error fetching room name:', e);
        }
        
        return {
          roomId,
          name: this.getRoomName(roomId) || roomId
        };
      });
      
      this.rooms = (await Promise.all(roomPromises))
        .sort((a, b) => a.roomId.localeCompare(b.roomId));
      
      if (this.rooms.length > 0 && !this.roomId) {
        this.roomId = this.rooms[0].roomId;
        this.fetchMessages();
      }
    }
  } catch (e) {
    console.error('Помилка завантаження кімнат:', e);
  }
}