import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './auth';

const fallbackMetrics = {
  accuracy: null,
  accuracyPercent: null,
  accuracyLabel: 'Model',
};

export function useModelMetrics() {
  const [metrics, setMetrics] = useState(fallbackMetrics);

  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/model-metrics`)
      .then((response) => {
        if (!active || !response.data?.available || typeof response.data.accuracy !== 'number') {
          return;
        }

        setMetrics({
          ...response.data,
          accuracyPercent: response.data.accuracy * 100,
          accuracyLabel: `${(response.data.accuracy * 100).toFixed(1)}%`,
        });
      })
      .catch(() => {
        if (active) setMetrics(fallbackMetrics);
      });

    return () => {
      active = false;
    };
  }, []);

  return metrics;
}
