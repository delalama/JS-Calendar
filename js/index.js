/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */

/**
 *
 */
function refreshTable() {
  drawSavedEvents();
}

function draw(event) {
  // deserialize event
  const eventToDraw = new eventObject(event.name, event.participants, event.day, event.time);

  // create selector
  const element = document.getElementById(eventToDraw.time).children[eventToDraw.day];

  // Draw event
  element.innerHTML = eventToDraw.name;
  element.classList.add('eventAdded');
  element.classList.add('droptarget');
  element.onclick = askToDelete;

  function askToDelete() {
    document.getElementById('eventDataPrompt').innerHTML = ` ${event.name} event ?`;
    sessionStorage.setItem('eventToRemove', JSON.stringify(event));
    modal.style.display = 'block';
}
}

function drawSavedEvents() {
  // get events
  let events = [];
  const previousEvents = JSON.parse(sessionStorage.getItem('events'));

  if (Array.isArray(previousEvents)) {
    previousEvents.forEach((element) => {
      events.push(element);
    });

    // draw each event
    for (let i = 0; i < events.length; i++) {
      draw(events[i]);
    }
  } else {
    events = JSON.parse(sessionStorage.getItem('events'));
    draw(events);
  }
}

function deleteEvent() {
  const eventToBeDelete = JSON.parse(sessionStorage.getItem('eventToRemove'));
  const events = JSON.parse(sessionStorage.getItem('events'));

  for (i = 0; i < events.length; i++) {
    if (eventToBeDelete.day === events[i].day && eventToBeDelete.time === events[i].time) {
      deleteBook(events[i]);
      events.splice(i, 1);
    }
  }
  sessionStorage.setItem('events', JSON.stringify(events));

  cancelDelete();
}

function setEvent() {
  const eventName = sessionStorage.getItem('eventName');
  const eventParticipants = sessionStorage.getItem('participants');
  const eventDay = sessionStorage.getItem('day');
  const eventTime = sessionStorage.getItem('time');

  const timeSelector = `#${eventTime}`;
  document.getElementById(timeSelector).innerHTML = 'lefazo';
}

function cancelEvent() {
  sessionStorage.setItem('newEventSet', false);
  location.href = '../index.html';
}

/**
 * Set event data on sesssionStorage
 */
function confirmEvent() {
  // event object
  const event = new eventObject(getById('inputName'), getParticipants(), getById('inputDay'), getById('inputTime'));

  handleEventErrors(event);
  saveEventData();

  // navigate to calendar
  location.href = '../index.html';

  function getParticipants() {
    const participants = [];

    if (document.getElementById('inlineCheckbox1').checked === true) {
      participants.push('John');
    }
    if (document.getElementById('inlineCheckbox2').checked === true) {
      participants.push('Mary');
    }
    if (document.getElementById('inlineCheckbox3').checked === true) {
      participants.push('Alfred');
    }
    if (document.getElementById('inlineCheckbox4').checked === true) {
      participants.push('Claudia');
    }

    return participants;
  }

  function handleEventErrors(event) {
    let error = false;

    if (event.name === '') {
      blinkElement('inputName');
    }
    if (event.participants.length === 0) {
      blinkElement('inputParticipants');
    }
    if (event.day === 'Select day') {
      blinkElement('inputDay');
    }
    if (event.time === 'Select time') {
      blinkElement('inputTime');
    }

    checkAvailability(event);

    if (error === true) {
      throw new Error();
    }

    function blinkElement(element) {
      error = true;
      document.getElementById(element).classList.add('blink_me');
      setTimeout(() => {
        document.getElementById(element).classList.remove('blink_me');
      }, 5000);
    }

    function checkAvailability(event) {
      const candidateBook = new book(event.day, `time${event.time}`);

      const savedEvents = JSON.parse(sessionStorage.getItem('events'));

      // Multiple events
      if (Array.isArray(savedEvents)) {
        for (i = 0; i < savedEvents.length; i++) {
          let dataBooked = new book(savedEvents[i].day, savedEvents[i].time);
          compareBooks(candidateBook, dataBooked);
        }
        // Single event
      } else if (savedEvents !== null) {
        let dataBooked = new book(savedEvents.day, savedEvents.time);
        compareBooks(candidateBook, dataBooked);
      }
    }

    function compareBooks(candidateBook, dataBooked) {
      if (dataBooked.day === candidateBook.day && dataBooked.time === candidateBook.time) {
        document.getElementById('alertDiv').style.visibility = 'visible';

        setTimeout(() => {
          document.getElementById('alertDiv').style.visibility = 'hidden';
        }, 5000);

        blinkElement('inputDay');
        blinkElement('inputTime');

        error = true;
      }
    }
  }

  function saveEventData() {
    // get event data
    const eventData = new eventObject(getById('inputName'), getParticipants(), getById('inputDay'), `time${getById('inputTime')}`);

    // add Event on Session Storage
    sessionStorage.setItem('newEventSet', true);
    const previousEvents = [];

    if (sessionStorage.getItem('events') !== null) {
      const savedEvents = JSON.parse(sessionStorage.getItem('events'));
      if (Array.isArray(savedEvents)) {
        savedEvents.forEach((element) => previousEvents.push(element));
      } else {
        previousEvents.push(savedEvents);
      }
    }

    if (previousEvents.length > 0) {
      previousEvents.push(eventData);
      sessionStorage.setItem('events', JSON.stringify(previousEvents));
    } else {
      sessionStorage.setItem('events', JSON.stringify(eventData));
    }
  }
}

function filterBooks() {
  const member = document.getElementById('memberFilter').value;
  if (member === 'All members') {
    refreshTable();
  } else {
    filterByMember(member);
  }

  function filterByMember(member) {
    const events = JSON.parse(sessionStorage.getItem('events'));

    if (Array.isArray(events)) {
      events.forEach((event) => {
        drawOrDeleteEvent(event);
      });
    } else {
      drawOrDeleteEvent(events);
    }
  }

  function drawOrDeleteEvent(event) {
    if (eventIncludesMember(event, member)) {
      draw(event);
    } else {
      deleteBook(event);
    }
  }
}

function eventIncludesMember(book, member) {
  if (book.participants.includes(member)) {
    return true;
  }
  return false;

}

function deleteBook(book) {
  const selector = document.getElementById(book.time).children[book.day];
  selector.classList.remove('eventAdded');
  selector.innerHTML = '';
}

/**
 * Utils
 */
function getById(id) {
  return document.getElementById(id).value;
}

function deleteSessionStorage() {
  sessionStorage.clear();
  refreshTable();
}

/**
 * Classes
 */
function eventObject(name, participants, day, time) {
  this.name = name;
  this.participants = participants;
  this.day = day;
  this.time = time;
}

function book(day, time) {
  this.day = day;
  this.time = time;
}

/**
 * Modal
 */
// Get the modal
const modal = document.getElementById('myModal');

// Get the button that opens the modal
const btn = document.getElementById('myBtn');

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

function cancelDelete() {
  modal.style.display = 'none';
}
