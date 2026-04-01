-- Add Invitation table for employee onboarding
CREATE TABLE IF NOT EXISTS Invitation (
  Invitation_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Email TEXT NOT NULL,
  Org_ID INTEGER NOT NULL,
  User_Type_ID INTEGER DEFAULT 3,
  Token TEXT UNIQUE NOT NULL,
  Expires_At DATETIME NOT NULL,
  Is_Used INTEGER DEFAULT 0,
  User_ID INTEGER,
  Created_By INTEGER,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  Used_at DATETIME,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
  FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID),
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Created_By) REFERENCES User(User_ID),
  UNIQUE(Email, Org_ID)
);

-- Add Pending_Employee table to store employee details before account activation
CREATE TABLE IF NOT EXISTS Pending_Employee (
  Pending_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Email TEXT NOT NULL,
  First_Name TEXT NOT NULL,
  SurName TEXT NOT NULL,
  Job_Title TEXT,
  Depart_ID INTEGER,
  Org_ID INTEGER NOT NULL,
  Invitation_ID INTEGER UNIQUE,
  User_Type_ID INTEGER DEFAULT 3,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
  FOREIGN KEY (Invitation_ID) REFERENCES Invitation(Invitation_ID),
  FOREIGN KEY (Depart_ID) REFERENCES Department(Dep_ID),
  FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID)
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitation_token ON Invitation(Token);
CREATE INDEX IF NOT EXISTS idx_invitation_org ON Invitation(Org_ID);
CREATE INDEX IF NOT EXISTS idx_invitation_email ON Invitation(Email, Org_ID);
CREATE INDEX IF NOT EXISTS idx_pending_org ON Pending_Employee(Org_ID);
CREATE INDEX IF NOT EXISTS idx_pending_invitation ON Pending_Employee(Invitation_ID);
