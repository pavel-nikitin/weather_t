//Krasnojarsk coordinates
const cityLat = 56.01;
const cityLong = 92.52;

class WeatherApp {
	#url;

	constructor(lat, long) {
		this.#url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly,current&units=metric&appid=f6ce6ba06d2751b6dbfd746e05927303`;
	}

	async init() {
		try {
			// Get data weather data from API
			const response = await fetch(`${this.#url}`);

			//reject promise if response is not ok
			if (!response.ok) {
				throw new Error(`An error has occurred!`);
			}

			const weatherData = await response.json();

			const { date, amplitude } = this.#getMinFeelsLikeNight(weatherData);
			this.renderText('.day-date-1', this.formatDate(date));
			this.renderText('.amplitude', amplitude.toFixed(2));

			const { dayTime, dayDate } = this.#getLongDay(weatherData);
			this.renderText('.day-length', this.secondsToHms(dayTime));
			this.renderText('.day-date-2', this.formatDate(dayDate));
		} catch (err) {
			console.error(`${err}`);
			//show the error for users
			this.renderText('.error-msg', 'В приложении произошла ошибка.');
		}
	}

	//Method returns an object with minimal amplitude between feels like nigh and night temperatures
	#getMinFeelsLikeNight(data) {
		//daily weather
		const dailyData = data.daily;
		//array of night feels_like and night temperature amplitudes and date
		const tempsArr = dailyData.map((item) => {
			return {
				amplitude: item.temp.night - item.feels_like.night,
				date: item.dt,
			};
		});
		//get object with min amplitude
		const result = tempsArr.reduce(function (prev, curr) {
			return prev.amplitude < curr.amplitude ? prev : curr;
		});

		return result;
	}

	//Method returns an object with maximum length of the day and date for 5 days
	#getLongDay(data) {
		//Weather data for 5 days (array)
		const weatherArr = data.daily.slice(0, 5);

		//get object from array with most long time of the day
		const result = weatherArr
			.map((item) => {
				return {
					dayTime: item.sunset - item.sunrise,
					dayDate: item.dt,
				};
			})
			.reduce(function (prev, curr) {
				return prev.dayTime > curr.dayTime ? prev : curr;
			});

		return result;
	}

	//Method renders text in an selected element
	renderText(selector, value) {
		document.querySelector(selector).textContent = value;
	}

	//Method formats date to readable format
	formatDate(unixTimestamp) {
		// define milliseconds using unix time stamp
		const milliseconds = unixTimestamp * 1000;
		// create a new date using milliseconds
		const date = new Date(milliseconds);

		const day = `${date.getDate()}`.padStart(2, 0);
		const month = `${date.getMonth() + 1}`.padStart(2, 0);
		const year = date.getFullYear();
		const displayDate = `${day}/${month}/${year}`;

		return displayDate;
	}

	//Method formats time in seconds to readable format
	secondsToHms(seconds) {
		return new Date(seconds * 1000).toISOString().substr(11, 8);
	}
}

//init app
const app = new WeatherApp(cityLat, cityLong);
app.init();
