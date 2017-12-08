//погода при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {

    /*загрузка данных о погоде по текущим координатам*/
    navigator.geolocation.getCurrentPosition(geo => {
        let lat = geo.coords.latitude.toFixed(1);
        let lon = geo.coords.longitude.toFixed(1);
        
        getData(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=9a3c9a03f9351aa6923d649a4159b858`)
            .then(weatherData => {
                let weather = JSON.parse(weatherData);
                
                let dataWeather = createDataWeather(weather);
                renderHTML("weatherTpl", dataWeather, "result");
                updateData(dataWeather);
                
            })
            .catch(error => {
                console.info(error);
            });
    }, (err) =>{
        alert(`ERROR(${err.code}): ${err.message}`);
        document.getElementById("result").innerHTML = "<h2>Enter city in search</h2>";
    });
});

/*поиск погоды другого города*/
document.getElementById("search").addEventListener("click", () => {
    //искомый город
    let desiredСity = document.getElementById("city").value;

    //загрузка списка городов
    getData("city.list.json")
        .then(listСities => {
            //список городов
            let cities = JSON.parse(listСities);

            //фильтрация массива по конкретному городу
            let city = cities.filter(city => city.name.toLowerCase() == desiredСity.toLowerCase());

            //если ввели город из списка возвращаем ID
            if(city.length !== 0){
                let cityId = city[0]["id"];
                return cityId;
            }

            return false;
        })
        .then(cityId => {
            if(cityId){//если есть такой город

                //Загрузка прогноза погоды выбраного города по ИД
                getData(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&APPID=9a3c9a03f9351aa6923d649a4159b858`)
                .then(weatherData => {
                    let weather = JSON.parse(weatherData);
                    let dataWeather = createDataWeather(weather);
                    document.querySelector("#result").innerHTML = "";
                    
                    renderHTML("weatherTpl", dataWeather, "result");
                    updateData(dataWeather);

                    //Очистка поля ввода
                    document.getElementById("city").value = null;
                })
                .catch(error => {
                    console.error(error);
                });

            }else{
                alert("Такого города нет!");
                document.getElementById("city").value = null;
            }
        })
        .catch(error => {
            console.error(error);
        });
});/*поиск погоды другого города*/

/*
* AJAX запрос
* return Promise
*/
function getData(link){
    return new Promise((resolve, reject)=>{
        let xhr = new XMLHttpRequest();
        
        xhr.open("GET", link);
        
        xhr.send();

        xhr.onload = function() {  
            if(xhr.response){
                resolve(xhr.response);
            }else{
                reject("Error!!!");
            }
        };       
        
   });
}

/*
* транслитерация строки
* return string
*/
function translit(str){
    //если строка не на английском
    if(!isEnglish(str)){
        const list = {
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
            "я": "ya",
//a, b, v, h, g, d, e, ye, zh, z, y, i, yi, y, k, l, m, n, o, p, r, s, t, u, f, kh, ts, ch, sh, shch, ', yu, ya
        }
        
        let resStr = "";
        for(let symbol of str){
            resStr += list[symbol];
        }
        return resStr;
    }
    
    return str;
}

/*
* проверяет строку на английские символы
* return true/false
*/
function isEnglish(str){
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    
    for(let symbol of str){  
        if(!~alphabet.indexOf(symbol)){
            return false;
        }
    }
    
    return true;
}

/*
* отрисовка шаблона
*/
function renderHTML(templateId, data, DOMId){
    let source = document.getElementById(templateId).innerHTML;
    let template = Handlebars.compile(source);
    
    let html = template(data);
    
    document.getElementById(DOMId).innerHTML = html;
}

/*
* создание объекта данных о погоде по API для вывода в шаблоне
* return {}
*/
function createDataWeather(api){
    //создание объекта, получение данных через get/set у массива days
    let data = {
        city: api.city.name,
        get time(){
            let time = this.days.filter(day => {
                return day.name === this.day;
            });
            return time[0].weatherTime[0].time;
        },
        get temp(){
            let temp = this.days.filter(day => {
                return day.name === this.day;
            });
            return temp[0].weatherTime[0].temp;
        },
        get img(){
            let img = this.days.filter(day => {
                return day.name === this.day;
            });
            return img[0].weatherTime[0].img;
        },
        get humidity(){
            let humidity = this.days.filter(day => {
                return day.name === this.day;
            });
            return humidity[0].weatherTime[0].humidity;
        },
        get wind(){
            let wind = this.days.filter(day => {
                return day.name === this.day;
            });
            return wind[0].weatherTime[0].wind;
        },
        get weather(){
            let weather = this.days.filter(day => {
                return day.name === this.day;
            });
            return weather[0].weatherTime[0].weather;
        },
        get weatherTime(){
            let weatherTime = this.days.filter(day => {
                return day.name === this.day;
            });
            return weatherTime[0].weatherTime;
        },
        day: api.list[0].dt_txt.split(" ")[0],
        set setDay(date){
            this.day = date;
        },
        days: [],
    }
    
    //создание массива days
    let preDate = "";// предыдущая дата
    let i = -1;//счетчик
    let minTemp = 0; //начальная минимальная температура
    let maxTemp = 0; //начальная максимальная температура
    
    for(let item of api.list){
        let [date, time] = item.dt_txt.split(" ");

        if(preDate !== date){// запись информации для каждого дня
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
                }],
            });
            i++;
        }else{// запись информации для конкртного дня через 3 часа
            minTemp = (minTemp <= item.main.temp) ? minTemp : minTemp = item.main.temp;
            maxTemp = (maxTemp >= item.main.temp) ? maxTemp : maxTemp = item.main.temp;
            
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

    return data;
}

/*
* форматирование кельвин в цельсий
* return number
*/
function kelvinToCelsius(kelvin){
    let celsius = -273.15 + kelvin;
    
    if(celsius > 0){
        return "+"+celsius.toFixed();
    }
    
    return celsius.toFixed();
}

/*
* создание название картинки
* return string
*/
function createNameImg(weatherDescription){
    let nameImg = "";
    if(~weatherDescription.indexOf(" ")){
        let parts = weatherDescription.split(" ");
        
        for(let part of parts){
            nameImg += `${part}_`;
        }
        return nameImg.slice(0, -1) + ".png";
    }
    
    return `${weatherDescription}.png`;
}

/*
* обновление погоды по клику
*/
function updateData(data){
    document.querySelector(".days").addEventListener("click", (event) => {
        let div = event.target.closest('div');

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
        document.querySelector("#img").setAttribute("src", `img/${data.img}`);

        document.querySelector(".temp-for-time").innerHTML = "";

        for(let item of data.weatherTime){
            let html = `<div class="column">
                            <p>${item.temp}°C</p>
                            <div class="ui clearing divider"></div>
                            <p>${item.time}</p>
                        </div>`;

            document.querySelector(".temp-for-time").innerHTML += html;
        }
    });
}