document.addEventListener("DOMContentLoaded", () => {
  const check = document.getElementById("selesai");
  const submitButton = document.getElementById("submitButton");

  check.addEventListener("change", () => {
    if (check.checked == true) {
      submitButton.value = "Masukkan ke Rak Sudah Dibaca";
    } else {
      submitButton.value = "Masukkan ke Rak Belum Dibaca";
    }
  });

  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();

    addTodo();
  });

  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
  });

  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    searchBook();
  });

  // const searchForm = document.getElementById("search-form");
  // searchForm.addEventListener("submit", (e) => {
  //   e.preventDefault();

  //   searchBook();
  // });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addTodo() {
  const title = document.getElementById("bookName").value;
  const year = document.getElementById("year").value;
  const author = document.getElementById("author").value;
  const check = document.getElementById("selesai").checked;

  const generateID = generateId();
  const todoObject = generateTodoObject(generateID, title, year, author, check);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, year, author, check) {
  return {
    id,
    title,
    year,
    author,
    check,
  };
}

const todos = [];

const RENDER_EVENT = "render-todo";

document.addEventListener(RENDER_EVENT, () => {
  console.log(todos);
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.check) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  }
});

function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = `Title: ${todoObject.title}`;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${todoObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${todoObject.year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  const containerButton = document.createElement("div");
  containerButton.classList.add("containerButton");
  container.append(containerButton);

  if (todoObject.check) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerText = "Belum Dibaca";

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.innerText = "Remove";

    removeButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    containerButton.append(undoButton, removeButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.innerText = "Sudah Dibaca";

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.innerText = "Remove";

    removeButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    containerButton.append(checkButton, removeButton);
  }

  return container;
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.check = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.check = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// FUNGSI SEARCH BUTTON

function searchBook() {
  const searchBookInput = document.getElementById("search");
  const searchTerm = searchBookInput.value.toLowerCase();
  filterBooksByTitle(searchTerm);
}

function filterBooksByTitle(searchTerm) {
  const filteredBooks = todos.filter((book) => {
    const title = book.title.toLowerCase();
    return title.includes(searchTerm);
  });

  displayBooks(filteredBooks);
}

function displayBooks(booksToDisplay) {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

  for (const todoItem of booksToDisplay) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.check) {
      uncompletedTODOList.appendChild(todoElement);
    } else {
      completedTODOList.appendChild(todoElement);
    }
  }
}

//PENUTUP FUNGSI SEARCH BUTTON
