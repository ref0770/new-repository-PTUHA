async function login() {
  try {
    this.error = 'Завантаження...';
    
    const res = await fetch('https://matrix.org/_matrix/client/r0/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'm.login.password', 
        user: this.username, 
        password: this.password 
      })
    });
    
    const data = await res.json();
    if (data.access_token) {
      this.accessToken = data.access_token;
      this.userId = data.user_id;
      this.error = '';
      await this.fetchRoomsWithNames();
      this.fetchMessages();
      
      setInterval(() => {
        this.fetchRoomsWithNames();
        this.fetchMessages();
      }, 5000);
    } else {
      this.error = 'Невірний логін або пароль: ' + (data.error || 'Невідома помилка');
    }
  } catch (e) {
    this.error = 'Помилка під час авторизації: ' + e.message;
    console.error(e);
  }
}