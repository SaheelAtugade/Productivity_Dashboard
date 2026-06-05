// ===================header section======================//
let headerLeft = document.querySelector("header .left");
let headerRight = document.querySelector("header .right");

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getHeaderDateTime() {
  const now = new Date();

  return {
    date: now.getDate(),
    month: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear(),
    dayName: now.toLocaleString("en-US", { weekday: "long" }),
    time: now.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

function renderHeader(locationText = "Location unavailable") {
  const { date, month, year, dayName, time } = getHeaderDateTime();

  headerLeft.innerHTML = `
    <div>
      <h3>${date} ${month}, ${year}</h3>
      <h1>${dayName}, ${time}</h1>
    </div>
    <p>${escapeHTML(locationText)}</p>
  `;
}

function showWeatherFallback() {
  headerRight.innerHTML = `
    <div>
      <h1>--&deg;C</h1>
      <h3>Weather unavailable (Allow Location)</h3>
    </div>
    <div>
      <p>Desc: Unable to load</p>
      <p>Humidity: --</p>
      <p>Wind: --</p>
    </div>
  `;
}

function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function dateInfo() {
  renderHeader();

  setInterval(() => {
    const locationText =
      headerLeft.querySelector("p")?.textContent || "Location unavailable";
    renderHeader(locationText);
  }, 1000);

  try {
    const position = await getCurrentPositionAsync();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    );

    if (!response.ok) return;

    const location = await response.json();
    const address = location.address || {};
    const placeName =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      "Location unavailable";
    const regionName =
      address.state ||
      address.state_district ||
      address.country ||
      "";
    const locationText = regionName ? `${placeName} (${regionName})` : placeName;

    renderHeader(locationText);
  } catch (err) {
    console.log("Location unavailable:", err);
  }
}
dateInfo();

async function weatherInfo() {
  const apiKey = "d126b7ee626c74765be5c248d310819f";

  try {
    const position = await getCurrentPositionAsync();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    let response = await fetch(apiURL);
    let weatherData = await response.json();

    if (!weatherData || Number(weatherData.cod) !== 200) {
      showWeatherFallback();
      return;
    }

    let data = {
      temp: Math.round(weatherData.main.temp),
      main: weatherData.weather[0].main,
      desc: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
    };
    let { temp, main, desc, humidity, windSpeed } = data;
    headerRight.innerHTML = `
      <div>
        <h1>${temp}&deg;C</h1>
        <h3>${escapeHTML(main)}</h3>
      </div>
      <div>
        <p>Desc: ${escapeHTML(desc)}</p>
        <p>Humidity: ${humidity} %</p>
        <p>Wind: ${windSpeed} Km/h</p>
      </div>
    `;
  } catch (err) {
    console.log("Weather unavailable:", err);
    showWeatherFallback();
  }
}
weatherInfo();

// ===================openFeatures======================//
function openFeatures() {
  let allElems = document.querySelectorAll(".elem");
  let fullElems = document.querySelectorAll(".fullElem");
  let fullElemBackBtn = document.querySelectorAll(".fullElem .back");

  allElems.forEach((elem) => {
    elem.addEventListener("click", function () {
      fullElems[elem.id].style.display = "block";
    });
  });

  fullElemBackBtn.forEach((btn) => {
    btn.addEventListener("click", function () {
      fullElems[btn.id].style.display = "none";
    });
  });
}
openFeatures();

// ====================Task Page========================//
let currentTasks = [];
if (localStorage.getItem("currentTask")) {
  currentTasks = JSON.parse(localStorage.getItem("currentTask"));
}

function renderTask() {
  let allTask = document.querySelector(".allTask");
  let sum = "";

  currentTasks.forEach(function (task, idx) {
    let { title, isImp } = task;
    sum += `
      <div class="task" id="${idx}">
        <h5>${escapeHTML(title)} <sup>${isImp ? "imp" : ""}</sup></h5>
        <div class="right">
          <i id="${idx}" class="ri-information-2-line"></i>
          <button id="${idx}">Mark as completed</button>
        </div>
      </div>
    `;
  });

  allTask.innerHTML = sum;
  allTask.innerHTML += `
    <div class="pop-up">
      <h2>Task Title</h2>
      <p>this is description for the task</p>
      <button>Close</button>
    </div>
  `;

  let complteBtns = document.querySelectorAll(".task button");
  complteBtns.forEach(function (btn) {
    btn.addEventListener("click", () => {
      currentTasks.splice(btn.id, 1);
      localStorage.setItem("currentTask", JSON.stringify(currentTasks));
      renderTask();
    });
  });

  let infoBtn = document.querySelectorAll(".task .right i");
  let popUp = document.querySelector(".pop-up");
  infoBtn.forEach(function (btn) {
    btn.addEventListener("click", () => {
      popUp.style.display = "block";
      popUp.innerHTML = `
        <h2>${escapeHTML(currentTasks[btn.id].title)}</h2>
        <p>${escapeHTML(currentTasks[btn.id].desc)}</p>
        <button>Close</button>
      `;

      let closeBtn = document.querySelector(".pop-up button");
      closeBtn.addEventListener("click", () => {
        popUp.style.display = "none";
      });
    });
  });
}
renderTask();

function todoList() {
  let todoForm = document.querySelector(".toDoListFullPage .addTask form");
  let title = document.querySelector(".toDoListFullPage #title");
  let desc = document.querySelector(".toDoListFullPage #desc");
  let isImp = document.querySelector(".toDoListFullPage #isImp");

  todoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (title.value.trim() === "") {
      alert("Enter the task title...");
      return;
    }

    currentTasks.push({
      title: title.value.trim(),
      desc: desc.value.trim(),
      isImp: isImp.checked,
    });

    localStorage.setItem("currentTask", JSON.stringify(currentTasks));
    title.value = "";
    desc.value = "";
    isImp.checked = false;
    renderTask();
  });
}
todoList();

// ================ Daily planner page code ==================//
let dayPlanner = document.querySelector(".dayPlanner");
let hours = Array.from(
  { length: 18 },
  (_, idx) => `${6 + idx}:00 - ${7 + idx}:00`,
);

let dailyPlansData = JSON.parse(localStorage.getItem("dailyPlansData")) || {};

function renderDailyPlans() {
  let timeRange = "";

  hours.forEach(function (time, idx) {
    let data = dailyPlansData[idx] || "";
    timeRange += `
      <div class="dayPlannerTime">
        <p>${time}</p>
        <input type="text" id="${idx}" placeholder="..." value="${escapeHTML(data)}">
      </div>
    `;
  });

  dayPlanner.innerHTML = timeRange;
  localStorage.setItem("lastVisitDate", today);

  let dayPlannerInputs = document.querySelectorAll(".dayPlannerTime input");
  dayPlannerInputs.forEach((input) => {
    input.addEventListener("input", () => {
      dailyPlansData[input.id] = input.value;
      localStorage.setItem("dailyPlansData", JSON.stringify(dailyPlansData));
    });
  });
}

let today = new Date().toDateString();
let savedDate = localStorage.getItem("lastVisitDate");
if (savedDate !== today) {
  localStorage.removeItem("dailyPlansData");
  dailyPlansData = {};
  localStorage.setItem("lastVisitDate", today);
}
renderDailyPlans();

// ================ Motivation quotes page==================//
const API = "https://api.api-ninjas.com/v2/randomquotes";
const API_KEY = "Y12DgTkBMl52flNNmkfTIieFRKkVuUbBYpWkYhxr";
let dateBox = document.querySelector(".motivationContainer .dateBar .dateBox");
let quoteBox = document.querySelector(".quoteBox");
let now = new Date();
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function getQuotes() {
  try {
    let response = await fetch(API, {
      headers: {
        "X-Api-Key": API_KEY,
      },
    });
    let data = await response.json();

    if (response.ok) {
      quoteBox.innerHTML = `
        <h1>${escapeHTML(data[0].quote)}</h1>
        <h5>-${escapeHTML(data[0].author)}</h5>
      `;

      dateBox.innerHTML = `
        <h2>${days[now.getDay()]}</h2>
        <h3>${now.getDate()}</h3>
      `;
    } else {
      quoteBox.innerHTML = `
        <h1>Quote unavailable right now...</h1>
      `;
    }
  } catch (err) {
    console.log(err);
    quoteBox.innerHTML = `
      <h1>Quote unavailable right now...</h1>
    `;
  }
}
getQuotes();

//================= Pomodoro timer page ===================//
let startBtn = document.querySelector(".timerContainer .btns #start");
let pauseBtn = document.querySelector(".timerContainer .btns #pause");
let resetBtn = document.querySelector(".timerContainer .btns #reset");
let timer = document.querySelector(".timerContainer #timer");
let shortBreakButton = document.querySelector(".timerContainer .breaks #short");
let longBreakButton = document.querySelector(".timerContainer .breaks #long");
let breakTypeShort = true;
let totalSeconds = 25 * 60;
let interval = null;

function updateTimer() {
  let minute = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  let seconds = String(totalSeconds % 60).padStart(2, "0");
  timer.innerHTML = `${minute}:${seconds}`;
}

function startTimer() {
  if (interval != null) return;

  interval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(interval);
      interval = null;
      return;
    }

    totalSeconds--;
    updateTimer();
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  clearInterval(interval);
  interval = null;

  if (breakTypeShort) {
    totalSeconds = 25 * 60;
  } else {
    totalSeconds = 50 * 60;
  }

  updateTimer();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

shortBreakButton.addEventListener("click", () => {
  pauseTimer();
  breakTypeShort = true;
  totalSeconds = 25 * 60;
  shortBreakButton.classList.add("breakActive");
  longBreakButton.classList.remove("breakActive");
  updateTimer();
});

longBreakButton.addEventListener("click", () => {
  pauseTimer();
  breakTypeShort = false;
  totalSeconds = 50 * 60;
  longBreakButton.classList.add("breakActive");
  shortBreakButton.classList.remove("breakActive");
  updateTimer();
});

//==========================habitTracker section============================//
let habitForm = document.querySelector(".habitsFullPage .habitAddCard form");
let habitInput = document.querySelector(".habitsFullPage .habitAddCard input");
let habitList = document.querySelector(".habitList");
let progressText = document.querySelector(".progressText p");
let progressFill = document.querySelector(".progressFill");

let habits = JSON.parse(localStorage.getItem("habitsData")) || [];
let savedHabitDate = localStorage.getItem("habitDate");
let habitToday = new Date().toDateString();

if (savedHabitDate !== habitToday) {
  habits.forEach((habit) => {
    habit.completed = false;
  });

  localStorage.setItem("habitDate", habitToday);
  localStorage.setItem("habitsData", JSON.stringify(habits));
}

function renderHabits() {
  let sum = "";

  habits.forEach((habit, idx) => {
    sum += `
      <div class="habitCard ${habit.completed ? "completed" : ""}">
        <div class="habitInfo">
          <h4>${escapeHTML(habit.name)}</h4>
          <p>${habit.completed ? "Completed for today" : "Pending for today"}</p>
        </div>
        <div class="habitActions">
          <button class="statusBtn" id="${idx}">
            ${habit.completed ? "Done" : "Mark Done"}
          </button>
          <button class="deleteBtn" id="${idx}">Remove</button>
        </div>
      </div>
    `;
  });

  habitList.innerHTML = sum;

  let statusBtns = document.querySelectorAll(".statusBtn");
  let deleteBtns = document.querySelectorAll(".deleteBtn");

  statusBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      let index = btn.id;
      habits[index].completed = !habits[index].completed;
      localStorage.setItem("habitsData", JSON.stringify(habits));
      renderHabits();
    });
  });

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      let index = btn.id;
      habits.splice(index, 1);
      localStorage.setItem("habitsData", JSON.stringify(habits));
      renderHabits();
    });
  });

  updateHabitProgress();
}
renderHabits();

habitForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (habitInput.value.trim() === "") {
    return;
  }

  habits.push({
    name: habitInput.value.trim(),
    completed: false,
  });

  localStorage.setItem("habitsData", JSON.stringify(habits));
  habitInput.value = "";
  renderHabits();
});

function updateHabitProgress() {
  let completedHabits = habits.filter((habit) => habit.completed).length;
  let totalHabits = habits.length;

  progressText.innerText = `${completedHabits} of ${totalHabits} habits completed`;

  let percent = 0;
  if (totalHabits > 0) {
    percent = (completedHabits / totalHabits) * 100;
  }

  progressFill.style.width = `${percent}%`;
}
