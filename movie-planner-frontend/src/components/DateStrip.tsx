import './DateStrip.css';

interface DateStripProps {
  availableDates: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const DateStrip = ({ availableDates, selectedDate, setSelectedDate }: DateStripProps) => {
  return (
    <div className="date-strip-container">
      <div className="date-strip">
        {/* "All" Option */}
        <div 
          className={`date-pill ${selectedDate === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedDate('all')}
        >
          <div className="date-pill-day">Show</div>
          <div className="date-pill-number">All</div>
        </div>

        {/* Dynamic Dates */}
        {availableDates.map(date => (
          <div 
            key={date}
            className={`date-pill ${selectedDate === date ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <div className="date-pill-day">
              {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            <div className="date-pill-number">
              {new Date(date + 'T00:00:00').getDate()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
