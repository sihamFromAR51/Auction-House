import { useState, useEffect } from 'react';
import './BidTimer.css';

export default function BidTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endDate) {
      setTimeLeft('No end date');
      return;
    }

    const update = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);

      if (d > 0) {
        setTimeLeft(`${d}d ${h}h ${m}m`);
      } else if (h > 0) {
        setTimeLeft(`${h}h ${m}m`);
      } else {
        setTimeLeft(`${m}m`);
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="bid-timer">
      <span className="bid-timer-label">Time Left</span>
      <span className={`bid-timer-value ${timeLeft === 'Ended' ? 'ended' : ''}`}>{timeLeft}</span>
    </div>
  );
}
