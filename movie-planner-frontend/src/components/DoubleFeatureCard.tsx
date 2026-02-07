import './DoubleFeatureCard.css';

export const DoubleFeatureCard = ({ pair, onSelect }: { pair: any, onSelect: () => void }) => {
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="recommendation-card" onClick={onSelect}>
      <div className="rec-movie-slot">
        <span className="rec-label first">Start Here</span>
        <h4 className="rec-title">{pair.first.title}</h4>
        <p className="rec-time">{formatTime(pair.first.start)} — {formatTime(pair.first.end)}</p>
      </div>
      
      <div className="rec-divider">
        <span className="rec-gap">{pair.gap} min gap</span>
      </div>

      <div className="rec-movie-slot">
        <span className="rec-label second">Followed By</span>
        <h4 className="rec-title">{pair.second.title}</h4>
        <p className="rec-time">Starts at {formatTime(pair.second.start)}</p>
      </div>
    </div>
  );
};