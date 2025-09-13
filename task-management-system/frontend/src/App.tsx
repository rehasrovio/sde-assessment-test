import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Task Management System</h1>
        <p className="welcome-message">
          Welcome to the Task Management System! 
          <br />
          A powerful tool to organize and track your tasks efficiently.
        </p>
      </header>
      
      <main className="app-main">
        <div className="features">
          <div className="feature-card">
            <h3>📋 Task Management</h3>
            <p>Create, update, and organize your tasks with ease</p>
          </div>
          
          <div className="feature-card">
            <h3>👥 User Management</h3>
            <p>Manage team members and assign tasks</p>
          </div>
          
          <div className="feature-card">
            <h3>🔍 Advanced Filtering</h3>
            <p>Filter and search tasks by status, priority, and more</p>
          </div>
          
          <div className="feature-card">
            <h3>📊 Real-time Updates</h3>
            <p>Track progress with live updates and notifications</p>
          </div>
        </div>
        
        <div className="getting-started">
          <h2>Getting Started</h2>
          <p>
            This frontend application is ready to connect to the backend API.
            <br />
            Make sure the backend server is running on <code>http://localhost:3001</code>
          </p>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Built with React + TypeScript + Vite</p>
      </footer>
    </div>
  )
}

export default App
