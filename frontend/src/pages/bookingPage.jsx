import React from 'react';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Dashboard</a></li>
          </ul>
        </nav>
      </div>
      <div className="stats-container">
        <div className="stat">
          <h2>2</h2>
          <p>Sub Admins</p>
          <img src="/sub-admins-icon.png" alt="Sub Admins" />
          <button>More info</button>
        </div>
        <div className="stat">
          <h2>4</h2>
          <p>Listed Locker Types</p>
          <img src="/locker-types-icon.png" alt="Listed Locker Types" />
          <button>More info</button>
        </div>
        <div className="stat">
          <h2>3</h2>
          <p>Assigned Lockers</p>
          <img src="/assigned-lockers-icon.png" alt="Assigned Lockers" />
          <button>More info</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;