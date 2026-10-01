const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/initialUsers.json');

let users = [];
try {
  if (fs.existsSync(usersFilePath)) {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  }
} catch (e) {
  users = [];
}

const User = {
  findByEmail: (email) => {
    return users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  },

  authenticate: (email, password) => {
    const user = User.findByEmail(email);
    if (!user) return null;
    // En producción se utilizaría bcrypt.compare
    if (user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  getAll: () => {
    return users.map(({ password: _, ...rest }) => rest);
  }
};

module.exports = User;
