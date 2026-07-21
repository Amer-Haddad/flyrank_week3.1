TASK MANAGEMENT API
====================

A RESTful API built with Express.js and SQLite for managing tasks. This project provides a simple task management system with full CRUD operations.


FEATURES
--------
- Create, Read, Update, and Delete tasks
- SQLite database for lightweight data storage
- Swagger UI documentation at /docs
- Auto-initialized sample data
- Built with Node.js and Express


TECHNOLOGIES USED
-----------------
- Node.js - JavaScript runtime
- Express.js - Web framework for Node.js
- SQLite3 - Lightweight embedded SQL database
- Swagger UI - API documentation


DATABASE
--------

Why SQLite?
-----------
SQLite was chosen for this project because:

1. Lightweight: No separate server process needed, making it perfect for small to medium applications
2. Zero Configuration: No setup or administration required
3. Embedded: The database is stored in a single file, making it portable and easy to backup
4. ACID Compliant: Provides transaction support and data integrity
5. Simple Integration: Works seamlessly with Node.js applications without additional dependencies
6. Good for Prototyping: Perfect for development and proof-of-concept projects

Database File Location
----------------------
The database file (tasks.db) is stored in the root directory of the project. It's automatically created when the application starts for the first time.


PROJECT STRUCTURE
-----------------
task-api/
├── openapi.json          # Swagger/OpenAPI specification
├── tasks.db              # SQLite database file (auto-generated)
├── server.js             # Main application file
├── package.json          # Project dependencies
└── README.md             # This file


GETTING STARTED
---------------

Prerequisites
-------------
- Node.js (v14 or higher)
- npm (Node Package Manager)

Installation
------------
1. Clone the repository:
   git clone <repository-url>
   cd task-api

2. Install dependencies:
   npm install

3. Start the server:
   node server.js

The server will start on http://localhost:3000 and automatically:
- Create the SQLite database file (tasks.db)
- Create the Tasks table
- Insert sample data (if the table is empty)


DATABASE VIEWER
---------------
Here's a screenshot of the SQLite database viewer showing the Tasks table:

![alt text](<Screenshot 2026-07-21 185753.png>)

Example of viewing the tasks.db file using SQLite browser


EXAMPLE SQL QUERY
-----------------
Here's an example SQL query executed on the database:

SELECT id, title, done 
FROM Tasks 
WHERE done = 0 
ORDER BY id;

Result: Returns all incomplete tasks, sorted by ID.


API ENDPOINTS
-------------
Method  | Endpoint        | Description
--------|-----------------|---------------------------------------
GET     | /               | Welcome message
GET     | /api            | API information
GET     | /health         | Health check
GET     | /tasks          | List all tasks
GET     | /tasks/:id      | Get a specific task
POST    | /tasks          | Create a new task
PUT     | /tasks/:id      | Update a task
DELETE  | /tasks/:id      | Delete a task

Sample API Usage
----------------
Create a new task:
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'

Get all tasks:
curl http://localhost:3000/tasks

Update a task:
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": 1}'

Delete a task:
curl -X DELETE http://localhost:3000/tasks/1


API DOCUMENTATION
-----------------
Full API documentation is available via Swagger UI at:
- Local: http://localhost:3000/docs


TESTING
-------
You can test the API using:
- Swagger UI: Interactive documentation at /docs
- Postman: Import the OpenAPI specification
- cURL: Command-line testing
- REST Client: Any HTTP client

