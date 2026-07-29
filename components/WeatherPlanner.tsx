'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { localizedWeatherFallback } from '@/lib/localizedContent';

interface WeatherDay {
  time: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
  precipitation_sum?: number[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysFromToday(date: string) {
  const start = new Date(todayIso()).getTime();
  const target = new Date(date).getTime();
  return Math.round((target - start) / 86400000);
}

export default function WeatherPlanner({ place, fallback }: { place: Place; fallback: string }) {
  const { lang, tr } = useLanguage();
  const [date, setDate] = useState(todayIso());
  const [status, setStatus] = useState('');
  const [forecast, setForecast] = useState<{ high?: number; low?: number; rain?: number; mm?: number } | null>(null);
  const inForecastWindow = useMemo(() => {
    const days = daysFromToday(date);
    return days >= 0 && days <= 15;
  }, [date]);

  useEffect(() => {
    if (!inForecastWindow) {
      setForecast(null);
      setStatus(tr('forecastWindow'));
      return;
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(place.lat));
    url.searchParams.set('longitude', String(place.lng));
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('start_date', date);
    url.searchParams.set('end_date', date);

    setStatus(tr('loadingForecast'));
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('weather failed');
        return res.json();
      })
      .then((data: { daily?: WeatherDay }) => {
        setForecast({
          high: data.daily?.temperature_2m_max?.[0],
          low: data.daily?.temperature_2m_min?.[0],
          rain: data.daily?.precipitation_probability_max?.[0],
          mm: data.daily?.precipitation_sum?.[0]
        });
        setStatus(tr('forecastReady'));
      })
      .catch(() => {
        setForecast(null);
        setStatus(tr('forecastFailed'));
      });
  }, [date, inForecastWindow, place.lat, place.lng, tr]);

  return (
    <article className="rounded-xl border border-black/10 bg-paper-light p-5">
      <p className="mb-2 text-xs uppercase tracking-wide opacity-50">{tr('weatherPlanner')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-black/15 bg-paper px-3 py-2 text-sm"
        />
        {forecast && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-indigo px-3 py-1 text-paper-light">{tr('high')} {Math.round(forecast.high ?? 0)}C</span>
            <span className="rounded-full bg-paper px-3 py-1">{tr('low')} {Math.round(forecast.low ?? 0)}C</span>
            <span className="rounded-full bg-paper px-3 py-1">{tr('rain')} {forecast.rain ?? 0}%</span>
            <span className="rounded-full bg-paper px-3 py-1">{forecast.mm ?? 0} mm</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed opacity-80">{forecast ? status : `${status || tr('chooseDateForecast')} ${localizedWeatherFallback(lang, place) || fallback}`}</p>
    </article>
  );
}
