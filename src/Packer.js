// @flow
import moment from 'moment';
const offset = 100;

const fifteenMinutes = 1000 * 60 * 15;

function buildEvent(column, left, width, dayStart) {
  const startTime = moment(column.start);
  const endTime = column.end
    ? moment(column.end)
    : startTime.clone().add(1, 'hour');
  const dayStartTime = startTime
    .clone()
    .hour(dayStart)
    .minute(0);
  const diffHours = startTime.diff(dayStartTime, 'hours', true);

  column.top = diffHours * offset;
  column.height = endTime.diff(startTime, 'hours', true) * offset;
  column.width = width;
  column.left = left;
  return column;
}

function collision(a, b) {    
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const padding = fifteenMinutes;

  // Add some padding to the collision logic
  return (aEnd + padding) > bStart && a.start < b.end;
}

function expand(ev, column, columns) {
  var colSpan = 1;

  for (var i = column + 1; i < columns.length; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var ev1 = col[j];
      if (collision(ev, ev1)) {
        return colSpan;
      }
    }
    colSpan++;
  }

  return colSpan;
}

function pack(columns, width, calculatedEvents, dayStart) {
  var colLength = columns.length;

  for (var i = 0; i < colLength; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var colSpan = expand(col[j], i, columns);
      var L = (i / colLength) * width;
      var W = (width * colSpan) / colLength - 2;

      calculatedEvents.push(buildEvent(col[j], L, W, dayStart));
    }
  }
}

function populateEvents(events, screenWidth, dayStart) {
  let lastEnd;
  let columns;
  let self = this;
  let calculatedEvents = [];

  events = events
    .map((ev, index) => ({ ...ev, index: index }))
    .sort(function(a, b) {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      if (a.end < b.end) return -1;
      if (a.end > b.end) return 1;
      return 0;
    });

  columns = [];
  lastEnd = null;
  lastDuration = null;

  events.forEach(function(ev, index) {
    const evStartDate = new Date(ev.start);
    const lastEndDate = lastEnd ? new Date(lastEnd) : null;
    const timePadding = lastDuration && lastDuration < fifteenMinutes ? fifteenMinutes : 0;

    if (lastEndDate !== null && evStartDate.getTime() >= lastEndDate.getTime() + timePadding) {     
      pack(columns, screenWidth, calculatedEvents, dayStart);
      columns = [];
      lastEnd = null;
    }

    var placed = false;
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      if (!collision(col[col.length - 1], ev)) {
        col.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([ev]);
    }

    if (lastEnd === null || ev.end > lastEnd) {
      lastEnd = ev.end;
      lastDuration = new Date(ev.end).getTime() - evStartDate.getTime();
    }
  });

  if (columns.length > 0) {
    pack(columns, screenWidth, calculatedEvents, dayStart);
  }
  return calculatedEvents;
}

export default populateEvents;
