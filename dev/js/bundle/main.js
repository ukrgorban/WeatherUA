"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

//погода при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {

    /*загрузка данных о погоде по текущим координатам*/
    navigator.geolocation.getCurrentPosition(function (geo) {
        var lat = geo.coords.latitude.toFixed(1);
        var lon = geo.coords.longitude.toFixed(1);

        getData("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&APPID=9a3c9a03f9351aa6923d649a4159b858").then(function (weatherData) {
            var weather = JSON.parse(weatherData);

            var dataWeather = createDataWeather(weather);
            renderHTML("weatherTpl", dataWeather, "result");
            updateData(dataWeather);
        }).catch(function (error) {
            console.info(error);
        });
    }, function (err) {
        alert("ERROR(" + err.code + "): " + err.message);
        document.getElementById("result").innerHTML = "<h2>Enter city in search</h2>";
    });
});

/*поиск погоды другого города*/
document.getElementById("search").addEventListener("click", function () {
    //искомый город
    var desiredСity = document.getElementById("city").value;

    //загрузка списка городов
    getData("city.list.json").then(function (listСities) {
        //список городов
        var cities = JSON.parse(listСities);

        //фильтрация массива по конкретному городу
        var city = cities.filter(function (city) {
            return city.name.toLowerCase() == desiredСity.toLowerCase();
        });

        //если ввели город из списка возвращаем ID
        if (city.length !== 0) {
            var cityId = city[0]["id"];
            return cityId;
        }

        return false;
    }).then(function (cityId) {
        if (cityId) {
            //если есть такой город

            //Загрузка прогноза погоды выбраного города по ИД
            getData("https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&APPID=9a3c9a03f9351aa6923d649a4159b858").then(function (weatherData) {
                var weather = JSON.parse(weatherData);
                var dataWeather = createDataWeather(weather);
                document.querySelector("#result").innerHTML = "";

                renderHTML("weatherTpl", dataWeather, "result");
                updateData(dataWeather);

                //Очистка поля ввода
                document.getElementById("city").value = null;
            }).catch(function (error) {
                console.error(error);
            });
        } else {
            alert("Такого города нет!");
            document.getElementById("city").value = null;
        }
    }).catch(function (error) {
        console.error(error);
    });
}); /*поиск погоды другого города*/

/*
* AJAX запрос
* return Promise
*/
function getData(link) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open("GET", link);

        xhr.send();

        xhr.onload = function () {
            if (xhr.response) {
                resolve(xhr.response);
            } else {
                reject("Error!!!");
            }
        };
    });
}

/*
* транслитерация строки
* return string
*/
function translit(str) {
    //если строка не на английском
    if (!isEnglish(str)) {
        var list = {
            "а": "a",
            "б": "b",
            "в": "v",
            "г": "h",
            "ґ": "g",
            "д": "d",
            "е": "e",
            "є": "ye",
            "ж": "zh",
            "з": "z",
            "и": "y",
            "і": "i",
            "ї": "yi",
            "й": "y",
            "к": "k",
            "л": "l",
            "м": "m",
            "н": "n",
            "о": "o",
            "п": "p",
            "р": "r",
            "с": "s",
            "т": "t",
            "у": "u",
            "ф": "f",
            "х": "kh",
            "ц": "ts",
            "ч": "ch",
            "ш": "sh",
            "щ": "shch",
            "ь": "'",
            "ю": "yu",
            "я": "ya"
            //a, b, v, h, g, d, e, ye, zh, z, y, i, yi, y, k, l, m, n, o, p, r, s, t, u, f, kh, ts, ch, sh, shch, ', yu, ya
        };

        var resStr = "";
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = str[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var symbol = _step.value;

                resStr += list[symbol];
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return resStr;
    }

    return str;
}

/*
* проверяет строку на английские символы
* return true/false
*/
function isEnglish(str) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = str[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var symbol = _step2.value;

            if (!~alphabet.indexOf(symbol)) {
                return false;
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return true;
}

/*
* отрисовка шаблона
*/
function renderHTML(templateId, data, DOMId) {
    var source = document.getElementById(templateId).innerHTML;
    var template = Handlebars.compile(source);

    var html = template(data);

    document.getElementById(DOMId).innerHTML = html;
}

/*
* создание объекта данных о погоде по API для вывода в шаблоне
* return {}
*/
function createDataWeather(api) {
    //создание объекта, получение данных через get/set у массива days
    var data = {
        city: api.city.name,
        get time() {
            var _this = this;

            var time = this.days.filter(function (day) {
                return day.name === _this.day;
            });
            return time[0].weatherTime[0].time;
        },
        get temp() {
            var _this2 = this;

            var temp = this.days.filter(function (day) {
                return day.name === _this2.day;
            });
            return temp[0].weatherTime[0].temp;
        },
        get img() {
            var _this3 = this;

            var img = this.days.filter(function (day) {
                return day.name === _this3.day;
            });
            return img[0].weatherTime[0].img;
        },
        get humidity() {
            var _this4 = this;

            var humidity = this.days.filter(function (day) {
                return day.name === _this4.day;
            });
            return humidity[0].weatherTime[0].humidity;
        },
        get wind() {
            var _this5 = this;

            var wind = this.days.filter(function (day) {
                return day.name === _this5.day;
            });
            return wind[0].weatherTime[0].wind;
        },
        get weather() {
            var _this6 = this;

            var weather = this.days.filter(function (day) {
                return day.name === _this6.day;
            });
            return weather[0].weatherTime[0].weather;
        },
        get weatherTime() {
            var _this7 = this;

            var weatherTime = this.days.filter(function (day) {
                return day.name === _this7.day;
            });
            return weatherTime[0].weatherTime;
        },
        day: api.list[0].dt_txt.split(" ")[0],
        set setDay(date) {
            this.day = date;
        },
        days: []

        //создание массива days
    };var preDate = ""; // предыдущая дата
    var i = -1; //счетчик
    var minTemp = 0; //начальная минимальная температура
    var maxTemp = 0; //начальная максимальная температура

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = api.list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            var _item$dt_txt$split = item.dt_txt.split(" "),
                _item$dt_txt$split2 = _slicedToArray(_item$dt_txt$split, 2),
                date = _item$dt_txt$split2[0],
                time = _item$dt_txt$split2[1];

            if (preDate !== date) {
                // запись информации для каждого дня
                minTemp = item.main.temp;
                maxTemp = item.main.temp;
                data.days.push({
                    'name': date,
                    'img': createNameImg(item.weather[0].description),
                    'weatherTime': [{
                        'time': time,
                        'temp': kelvinToCelsius(item.main.temp),
                        'img': createNameImg(item.weather[0].description),
                        'humidity': item.main.humidity,
                        'wind': item.wind.speed,
                        'weather': item.weather[0].description
                    }]
                });
                i++;
            } else {
                // запись информации для конкртного дня через 3 часа
                minTemp = minTemp <= item.main.temp ? minTemp : minTemp = item.main.temp;
                maxTemp = maxTemp >= item.main.temp ? maxTemp : maxTemp = item.main.temp;

                data.days[i].minTemp = kelvinToCelsius(minTemp);
                data.days[i].maxTemp = kelvinToCelsius(maxTemp);
                data.days[i].weatherTime.push({
                    'time': time,
                    'temp': kelvinToCelsius(item.main.temp),
                    'img': createNameImg(item.weather[0].description),
                    'humidity': item.main.humidity,
                    'wind': item.wind.speed,
                    'weather': item.weather[0].description
                });
            }

            preDate = date;
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return data;
}

/*
* форматирование кельвин в цельсий
* return number
*/
function kelvinToCelsius(kelvin) {
    var celsius = -273.15 + kelvin;

    if (celsius > 0) {
        return "+" + celsius.toFixed();
    }

    return celsius.toFixed();
}

/*
* создание название картинки
* return string
*/
function createNameImg(weatherDescription) {
    var nameImg = "";
    if (~weatherDescription.indexOf(" ")) {
        var parts = weatherDescription.split(" ");

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = parts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var part = _step4.value;

                nameImg += part + "_";
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        return nameImg.slice(0, -1) + ".png";
    }

    return weatherDescription + ".png";
}

/*
* обновление погоды по клику
*/
function updateData(data) {
    document.querySelector(".days").addEventListener("click", function (event) {
        var div = event.target.closest('div');

        //удаляется класс active
        document.querySelector(".active").setAttribute("class", "day");

        //добавляеться класс active выбраному элементу
        document.getElementById(div.getAttribute("id")).setAttribute("class", "day active");

        //устанавливаеться выбраный день в объект с погодой
        data.setDay = div.getAttribute("id");

        //обновляються данные
        document.querySelector("#time").innerText = data.time;
        document.querySelector("#weather").innerText = data.weather;
        document.querySelector("#humidity").innerText = data.humidity;
        document.querySelector("#wind").innerText = data.wind;
        document.querySelector("#temp").innerText = data.temp;
        document.querySelector("#img").setAttribute("src", "img/" + data.img);

        document.querySelector(".temp-for-time").innerHTML = "";

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = data.weatherTime[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var item = _step5.value;

                var html = "<div class=\"column\">\n                            <p>" + item.temp + "\xB0C</p>\n                            <div class=\"ui clearing divider\"></div>\n                            <p>" + item.time + "</p>\n                        </div>";

                document.querySelector(".temp-for-time").innerHTML += html;
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }
    });
}