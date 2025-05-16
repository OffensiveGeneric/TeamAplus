import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  useEffect(() => {
  if (user && user.id) {
    fetch('http://134.209.161.6/api/get_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    })
      .then(res => res.text())
      .then(text => {
        console.log("RAW get_user.php response:", text);
        try {
          const data = JSON.parse(text);
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          console.error("Error parsing get_user response as JSON:", err);
        }
      })
      .catch(err => {
        console.error("Failed to refresh user:", err);
      });
  }
}, [user && user.id]); // this line is valid

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
