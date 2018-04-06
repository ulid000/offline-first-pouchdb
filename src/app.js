const PouchDB = require('pouchdb').default;

function init() {
  let title = document.createElement('h1');
  title.textContent = 'Offline Demo PouchDB';
  document.body.appendChild(title);
  let p = document.createElement('p');
  p.textContent = "Sync with PouchDB";
  document.body.appendChild(p);

  let syncDiv = document.createElement('div');
  let syncButton = document.createElement('button');
  syncButton.textContent = 'Sync';
  syncButton.addEventListener('click', syncButtonClickHandler, false);
  syncDiv.appendChild(syncButton);
  let syncMessageDiv = document.createElement('div');
  syncMessageDiv.id = 'syncMessageDiv';
  syncDiv.appendChild(syncMessageDiv);
  document.body.appendChild(syncDiv);

  let messageInput = document.createElement('input');
  messageInput.id = 'messageInput';
  messageInput.addEventListener('keypress', messageInputKeyPressHandler, false);
  document.body.appendChild(messageInput);

  let messagesList = document.createElement('ul');
  messagesList.id = 'messagesList';
  document.body.appendChild(messagesList);
};

function createListItem(doc) {
  let li = document.createElement('li');
  let input = document.createElement('input');
  input.value = doc.message;
  input.id = 'input_' +  doc._id;
  input.addEventListener('keypress', itemInputKeyPressHandler, false);
  li.appendChild(input);
  return li;
}

function redrawMessagesList(rows) {
  let messagesList = document.getElementById('messagesList');
  messagesList.innerHTML = '';
  rows.forEach(function(row) {
    messagesList.appendChild(createListItem(row.doc));
  });
}

function addMessage(text) {
  var doc = {
    _id: new Date().toISOString(),
    message: text
  };
  db.put(doc, function callback(err, result) {
    if (!err) {
      console.log('posted a message');
    }
  });
}

function updateMessage(id, text) {
  db.get(id).then(function (doc) {
    doc.message = text;
    return doc;
  }).then(function (doc) {
    db.put(doc)
  }).then(function () {
        console.log('updated message');
  }).catch(function (err) {
        console.log('updating message failed: ' + err);
  });
}

function showMessages() {
  db.allDocs({include_docs: true, descending: true}).then(function (docs) {
    redrawMessagesList(docs.rows);
  });
}

function messageInputKeyPressHandler( event ) {
  if (event.keyCode === 13) {
    // ENTER pressed
    addMessage(event.target.value);
    event.target.value = '';
  }
}

function itemInputKeyPressHandler( event ) {
  if (event.keyCode === 13) {
    // ENTER pressed
    let message = event.target.value;
    let id = event.target.id.split('_')[1];
    updateMessage(id, message);
    event.target.blur();
  }
}

function syncButtonClickHandler( event ) {
  sync();
}

var db = new PouchDB('messages');

db.changes({
  since: 'now',
  live: true
}).on('change', showMessages);

function sync() {
  document.getElementById('syncMessageDiv').textContent = 'Syncing';
  var sync = PouchDB.sync('messages', 'http://testuser:testpw@localhost:5984/messages', {
    live: false,
    retry: false
  }).on('change', function (info) {
    // handle change
    console.log('change: ' + info);
  }).on('paused', function (err) {
    // replication paused (e.g. replication up to date, user went offline)
    console.log('paused: ' + err);
  }).on('active', function () {
    // replicate resumed (e.g. new changes replicating, user went back online)
    console.log('active');
  }).on('denied', function (err) {
    // a document failed to replicate (e.g. due to permissions)
    console.log('denied: ' + err);
  }).on('complete', function (info) {
    // handle complete
    document.getElementById('syncMessageDiv').textContent = 'Sync completed';
    console.log('complete: ' + info);
  }).on('error', function (err) {
    document.getElementById('syncMessageDiv').textContent = 'Sync failed';
    console.log('error: ' + err);
  });
}

init();
showMessages();