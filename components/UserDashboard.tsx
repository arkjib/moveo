import React, { useState, useMemo } from 'react';
import { Train, Booking, TrainClassName } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import { generateItinerary, ItineraryResult } from '../services/geminiService';

interface UserDashboardProps {
  trains: Train[];
  stations: string[];
  bookings: Booking[];
  onBook: (trainId: string, travelDate: string, passengers: number, selectedClass: TrainClassName) => void;
  onCancel: (booking: Booking) => void;
  showMessage: (message: string) => void;
}

const SearchResults: React.FC<{
    trains: Train[];
    date: string;
    passengers: number;
    onBook: UserDashboardProps['onBook'];
    showMessage: UserDashboardProps['showMessage'];
}> = ({ trains, date, passengers, onBook, showMessage }) => {

    const handleBooking = (trainId: string) => {
        const selectElement = document.getElementById(`classSelect-${trainId}`) as HTMLSelectElement;
        const selectedClass = selectElement.value as TrainClassName;

        if (!selectedClass) {
            showMessage('Please select a class before attempting to book.');
            return;
        }
        onBook(trainId, date, passengers, selectedClass);
    };

    if (trains.length === 0) {
        return <p className="text-center text-slate-300 p-4 bg-slate-800 rounded-lg">No trains found for your selected criteria.</p>;
    }

    return (
        <div className="space-y-4">
            {trains.map(train => (
                <div key={train.id} className="train-card bg-slate-800 p-6 rounded-xl shadow-xl border-l-4 border-[#1a4d8c] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-grow text-center md:text-left">
                        <p className="text-lg font-bold text-sky-300">{train.trainName} ({train.trainNumber})</p>
                        <p className="text-3xl font-extrabold text-white">
                            {train.source} <span className="text-[#f7a01c] mx-2 text-xl">→</span> {train.destination}
                        </p>
                        <p className="text-slate-400 text-sm">Departs: {train.departure}</p>
                        {train.description && <p className="text-xs italic text-slate-400 mt-1 max-w-md">{train.description}</p>}
                    </div>
                    <div className="md:w-1/3 w-full flex-shrink-0">
                        <Select id={`classSelect-${train.id}`} className="mb-3">
                            <option value="">Select Class ({passengers} pass.)</option>
                            {Object.entries(train.classes).map(([name, details]) => {
                                const isAvailable = details.availableSeats >= passengers;
                                const price = (details.price * passengers).toFixed(2);
                                return (
                                    <option key={name} value={name} disabled={!isAvailable} className={!isAvailable ? 'text-red-500' : ''}>
                                        {name} ({details.availableSeats} left) - ₹{price} {isAvailable ? '' : ' (Sold Out)'}
                                    </option>
                                );
                            })}
                        </Select>
                        <Button variant="accent" className="w-full" onClick={() => handleBooking(train.id)}>
                            Book Now
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ItineraryGenerator: React.FC<{ booking: Booking }> = ({ booking }) => {
    const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setItinerary(null);
        try {
            const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const result = await generateItinerary(booking.destination, formattedDate);
            setItinerary(result);
        } catch (e: any) {
            setError(e.message || "Failed to generate itinerary.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-3 flex flex-col items-start">
            <Button variant="sparkle" onClick={handleGenerate} disabled={isLoading}>
                ✨ {isLoading ? 'Generating...' : 'Generate Trip Itinerary'}
            </Button>
            {isLoading && <p className="text-sm text-sky-400 mt-2">✨ Loading itinerary (using Google Search)...</p>}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            {itinerary && (
                <div className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 mt-3">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200">{itinerary.text}</pre>
                    {itinerary.sources.length > 0 && (
                        <div className="text-xs text-slate-400 mt-2 border-t border-slate-700 pt-2">
                            Source(s): {itinerary.sources.join(', ')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const UserDashboard: React.FC<UserDashboardProps> = ({ trains, stations, bookings, onBook, onCancel, showMessage }) => {
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '', passengers: 1, class: 'all' });
  const [searchResults, setSearchResults] = useState<Train[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.date) {
        showMessage('Please select a travel date.');
        return;
    }
    if (searchParams.from && searchParams.from === searchParams.to) {
        showMessage('Source and Destination cannot be the same.');
        return;
    }

    const filtered = trains.filter(train => {
        const sourceMatch = !searchParams.from || train.source === searchParams.from.toUpperCase();
        const destMatch = !searchParams.to || train.destination === searchParams.to.toUpperCase();
        
        let classAvailable = false;
        if (searchParams.class === 'all') {
            classAvailable = Object.values(train.classes).some(c => c.availableSeats >= searchParams.passengers);
        } else {
            const c = train.classes[searchParams.class as TrainClassName];
            classAvailable = c && c.availableSeats >= searchParams.passengers;
        }

        return sourceMatch && destMatch && classAvailable;
    });
    setSearchResults(filtered);
  };
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#f7a01c] pl-3">Plan Your Trip</h2>
      
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Select value={searchParams.from} onChange={e => setSearchParams({...searchParams, from: e.target.value})}>
              <option value="">From Station</option>
              {stations.map(station => <option key={`from-${station}`} value={station}>{station}</option>)}
          </Select>
          <Select value={searchParams.to} onChange={e => setSearchParams({...searchParams, to: e.target.value})}>
              <option value="">To Station</option>
              {stations.map(station => <option key={`to-${station}`} value={station}>{station}</option>)}
          </Select>
          <Input type="date" min={today} value={searchParams.date} onChange={e => setSearchParams({...searchParams, date: e.target.value})} required/>
          <Input type="number" min="1" value={searchParams.passengers} onChange={e => setSearchParams({...searchParams, passengers: parseInt(e.target.value) || 1})}/>
          <Select value={searchParams.class} onChange={e => setSearchParams({...searchParams, class: e.target.value})}>
            <option value="all">All Classes</option>
            <option value="First">First Class</option>
            <option value="Business">Business Class</option>
            <option value="Economy">Economy Class</option>
          </Select>
          <div className="lg:col-span-5 text-right">
            <Button type="submit" variant="accent" className="py-3 px-8">Search Trains</Button>
          </div>
        </form>
      </div>

      {searchResults && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 text-white">Available Trains</h3>
          <SearchResults trains={searchResults} date={searchParams.date} passengers={searchParams.passengers} onBook={onBook} showMessage={showMessage}/>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-white">My Bookings</h3>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-slate-400">You have no active bookings.</p>
          ) : (bookings.map(booking => (
            <div key={booking.id} className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col transition-all hover:bg-slate-600">
              <div className="flex justify-between items-start pb-2 border-b border-slate-600 gap-4">
                <div>
                  <p className="font-bold text-lg text-[#f7a01c]">{booking.trainName} ({booking.trainNumber})</p>
                  <p className="text-sm text-slate-300">ID: {booking.id}</p>
                   <p className="text-sm text-slate-300">Date: {booking.date} | Destination: {booking.destination}</p>
                  <p className="text-sm text-slate-300">{booking.class} Class | {booking.passengers} Passenger(s)</p>
                </div>
                <Button variant="danger" onClick={() => onCancel(booking)} className="flex-shrink-0">Cancel</Button>
              </div>
              <ItineraryGenerator booking={booking} />
            </div>
          )))}
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;