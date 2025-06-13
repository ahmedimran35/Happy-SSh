# Web SSH Terminal

A web-based SSH terminal application that allows users to connect to remote servers securely through their browser.

## Features

- User authentication (signup/login)
- Secure SSH connections
- Support for both password and SSH key authentication
- Save and manage multiple SSH connections
- Real-time terminal interaction
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-ssh-terminal
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ssh-terminal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. Create an account or log in
2. Add a new SSH connection with your server details
3. Click on the connection to open a terminal session
4. Use the terminal as you would with any SSH client

## Security Considerations

- All connections are encrypted using SSH
- Passwords are hashed before storage
- JWT tokens are used for authentication
- SSH keys are stored securely
- HTTPS should be used in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 