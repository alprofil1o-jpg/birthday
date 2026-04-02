export async function getWeather() {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius'
    );
    const data = await response.json();
    const current = data.current;
    const weatherCode = current.weather_code;

    let description = 'Tiszta';
    if (weatherCode === 0) description = 'Tiszta';
    else if (weatherCode === 1 || weatherCode === 2) description = 'Részben felhős';
    else if (weatherCode === 3) description = 'Borús';
    else if (weatherCode === 45 || weatherCode === 48) description = 'Ködös';
    else if (weatherCode >= 51 && weatherCode <= 67) description = 'Szitálás/Eső';
    else if (weatherCode >= 71 && weatherCode <= 77) description = 'Hó';
    else if (weatherCode >= 80 && weatherCode <= 82) description = 'Esőzápor';
    else if (weatherCode >= 85 && weatherCode <= 86) description = 'Hózápor';
    else if (weatherCode >= 80 && weatherCode <= 99) description = 'Vihar';

    return {
      temp: current.temperature_2m,
      description,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
    };
  } catch (error) {
    return { temp: 0, description: 'Nem elérhető', humidity: 0, windSpeed: 0 };
  }
}
