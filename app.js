const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/", async (req, res) => {
  let data = null;
  let getTodosQuery = "";

  const { search_q = "", priority, status } = req.query;

  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  switch (true) {
    case hasPriorityAndStatusProperties(req.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(req.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(req.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  res.send(data);
});

// GET Todo by ID API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `SELECT 
  *
  FROM todo WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  res.send(todo);
});

// Add Todo API 3
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const addTodoQuery = `
    INSERT INTO
      todo ( id, todo, priority, status )
    VALUES
      (
         ${id},
        '${todo}',
        '${priority}',
        '${status}'
      );`;
  await db.run(addTodoQuery);
  res.send("Todo Successfully Added");
});

// Update Todo API 4
app.put("/todosxyz", async (req, res) => {
  const { todoId } = req.params;

  let requestForUpdate = req.body;

  let updateTodoQuery = "";

  switch (true) {
    case requestForUpdate.status !== undefined:
      updateTodoQuery = `
        UPDATE 
        todo
        SET
        status='${status}'
        WHERE
        id = ${todoId}`;
      await db.run(updateTodoQuery);
      res.send("Status Updated");
      break;

    case requestForUpdate.priority !== undefined:
      updateTodoQuery = `
        UPDATE 
        todo
        SET
        priority='${priority}'
        WHERE
        id = ${todoId}`;
      await db.run(updateTodoQuery);
      res.send("Priority Updated");
      break;

    case requestForUpdate.todo !== undefined:
      updateTodoQuery = `
        UPDATE 
        todo
        SET
        todo='${todo}'
        WHERE
        id = ${todoId}`;
      await db.run(updateTodoQuery);
      res.send("Todo Updated");
      break;
  }
});

// Delete Todo API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
