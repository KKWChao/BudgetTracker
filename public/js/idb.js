// create variable to hold db connection
let db;

const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget()
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};


function saveRecord(record) {
  const budget = db.transaction(['new_budget'], 'readwrite');
  const budgetObjectStore = budget.objectStore('new_budget');

  budgetObjectStore.add(record);
}

function uploadBudget() {
  const budget = db.transaction(['new_budget'], 'readwrite');
  const budgetObjectStore = budget.objectStore('new_budget');
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const budget = db.transaction(['new_budget'], 'readwrite');
          const budgetObjectStore = budget.objectStore('new_budget');
          budgetObjectStore.clear();

          alert('All saved pizza has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadBudget);