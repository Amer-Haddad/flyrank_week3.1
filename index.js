const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpecification = require('./openapi.json');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
app.use(express.json());

// Serve Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));


// Database setup with sqlite3 
const db = new sqlite3.Database('tasks.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER DEFAULT 0 CHECK (done IN (0, 1))  -- 1 = true, 0 = false
    )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table created/verified');
      insertSampleData()

    }
  });
}
function insertSampleData() {
  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM Tasks', (err, row) => {
    if (err) {
      console.error('Error checking data:', err.message);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO Tasks (title, done) VALUES (?, ?)');

      // Sample tasks
      const tasks = [
        ['Learn SQLite', 0],
        ['Build Express API', 1],
        ['Write documentation', 0],
        ['Test endpoints', 1],
        ['Deploy to production', 0]
      ];

      tasks.forEach(task => {
        stmt.run(task, (err) => {
          if (err) console.error('Error inserting:', err.message);
        });
      });
      stmt.finalize();
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('📊 Data already exists, skipping sample data');
    }
  });
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.get('/api', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});


app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

//  GET /tasks - List all tasks ---
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM Tasks', (err, tasks) => {
    if (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({ error: 'Error fetching tasks' });
    }

    res.json(tasks);
    //res.json({test: "test works"});

  });
});

//  GET /tasks/:id - Get single task ---
app.get('/tasks/:id', (req, res) => {
  db.get('SELECT * FROM Tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (err) {
      console.error('Error fetching task:', err.message);
      res.status(500).json({ error: 'Error fetching task' });
    }
    if (!task) {
      res.status(404).json({ error: `Task ${req.params.id} not found` });
    } else {
      res.json(task);
    }

  })

});

//  POST /tasks - Create a new task ---
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      error: "Title is required and cannot be empty"
    });
  }

  const newTask = { title, done: false };
  db.run('INSERT INTO Tasks (title, done) VALUES (?, ?)', [newTask.title, newTask.done], function (err) {
    if (err) {
      console.error('Error inserting task:', err.message);
      res.status(500).json({ error: 'Error inserting task' });
    } else {
      res.status(201).json(newTask);
    }
  });
});

//  PUT /tasks/:id - Update a task ---// PUT /tasks/:id - Update a task (partial update)
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, done } = req.body;
  
  // Check if task exists first
  db.get('SELECT * FROM Tasks WHERE id = ?', [id], (err, existingTask) => {
    if (err) {
      console.error('Error fetching task:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!existingTask) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    
    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Task title must not be empty' });
      }
      updateFields.push('title = ?');
      updateValues.push(title.trim());
    }
    
    if (done !== undefined) {
      if (![0, 1].includes(done)) {
        return res.status(400).json({ error: 'Done must be 0 or 1' });
      }
      updateFields.push('done = ?');
      updateValues.push(done);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id);
    
    // Update the task
    db.run(
      `UPDATE Tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
      function(err) {
        if (err) {
          console.error('Error updating task:', err.message);
          return res.status(500).json({ error: 'Error updating task' });
        }
        
        // Fetch and return updated task
        db.get('SELECT * FROM Tasks WHERE id = ?', [id], (err, updatedTask) => {
          if (err) {
            console.error('Error fetching updated task:', err.message);
            return res.status(500).json({ error: 'Error fetching updated task' });
          }
          res.json(updatedTask);
        });
      }
    );
  });
});

// DELETE /tasks/:id - Delete a task ---
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  // First get the task to return it
  db.get('SELECT * FROM Tasks WHERE id = ?', [id], (err, task) => {
    if (err) {
      console.error('Error fetching task:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!task) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    
    // Delete the task
    db.run('DELETE FROM Tasks WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting task:', err.message);
        return res.status(500).json({ error: 'Error deleting task' });
      }
      
      // Return the deleted task with 200 OK
      res.json({
        message: `Task ${id} deleted successfully`,
        deletedTask: task
      });
    });
  });
});
// --- Start server ---
app.listen(port, () => {
  console.log(`\nServer running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs\n`);
});