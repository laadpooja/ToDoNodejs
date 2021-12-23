'use strict';
const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const PORT = 3000;

app.get('/', function(req, res) {
  res.status(200).send(`Alive at ${new Date()}`);
});

app.get('/todos', function(req, res) {
  fs.readFile('./store/todos.json', 'utf-8', (error, data) => {
    if (error) {
      res.status(500).send("Oh! Sorry, there is some technical issue please try again later.");
    } else {
      const todos = JSON.parse(data);
      console.log(data);
      const showIncomplete = req.query.showIncomplete;

      if (showIncomplete !== "1") {
        res.status(200).json({
          todos: todos
        });
      } else {
        res.status(200).json({
          todos: todos.filter((task) => {
            return task.complete === false
          })
        });
      }

    }
  });
});

app.post('/todos', function(req, res) {
  if (!req.body.name) {
    req.status(400).send('Missing task name');
  } else {


    fs.readFile('./store/todos.json', 'utf-8', (err, data) => {
      if (err) {
        res.status(500).send('Oh! Sorry, something went wrong.')
      } else {

        if (data.includes(req.body.name)) {
          return res.status(409).send({
            status: 'Not Ok',
            message: 'Task is already available in your todo list.'
          })
        }

        const todos = JSON.parse(data);
        const maxId = Math.max.apply(Math, todos.map(task => {
          return task.id
        }));

        todos.push({
          id: maxId + 1,
          complete: false,
          name: req.body.name
        });
        fs.writeFile('./store/todos.json', JSON.stringify(todos), () => {
          res.json({
            status: 'OK'
          });
        });

      }
    })
  }

});

app.put('/todos/:id/complete', function(req, res) {
  const id = req.params.id;

  const findTodoById = (todos, id) => {
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].id === parseInt(id)) {
        return i;
      }
    }
    return -1;
  }

  fs.readFile('./store/todos.json', 'utf-8', (error, data) => {
    if (error) {
      res.status(500).send("Oh! Sorry, Technical issue please try again later.");
    } else {
      const todos = JSON.parse(data);
      const todoIndex = findTodoById(todos, id);

      if (todoIndex === -1) {
        res.status(404).send("Sorry, not found.");
      } else {
        todos[todoIndex].complete = true;
        fs.writeFile('./store/todos.json', JSON.stringify(todos), () => {
          res.json({
            status: 'OK'
          });
        });
      }
    }
  })
});


app.listen(PORT, function(req, res) {
  console.log(`Server is running on http://localhost:${PORT}`);
});