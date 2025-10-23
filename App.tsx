import React, { useState, useCallback, useMemo } from 'react';
import { User, UserRole, Train, Booking, TrainClassName } from './types';
import LoginModal, { LoginCredentials } from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import MessageBox from './components/MessageBox';
import Button from './components/common/Button';

// --- MOCK DATA (replaces Firestore) ---
const initialTrains: Train[] = [
  {
    id: 'T001', trainName: 'Capital Express', trainNumber: '12051', source: 'DELHI', destination: 'MUMBAI', departure: '08:00',
    description: "Journey from the heart of India to the financial capital in style. Our Capital Express offers unparalleled comfort and scenic views.",
    classes: {
      First: { price: 3500, totalSeats: 50, availableSeats: 45 },
      Business: { price: 2000, totalSeats: 100, availableSeats: 90 },
      Economy: { price: 800, totalSeats: 200, availableSeats: 150 }
    }
  },
  {
    id: 'T002', trainName: 'Metro Link', trainNumber: '22301', source: 'MUMBAI', destination: 'KOLKATA', departure: '14:30',
    description: "Connect between two major metro cities with speed and efficiency. Perfect for business travelers and tourists alike.",
    classes: {
      First: { price: 4000, totalSeats: 40, availableSeats: 40 },
      Business: { price: 2500, totalSeats: 80, availableSeats: 75 },
      Economy: { price: 1000, totalSeats: 180, availableSeats: 180 }
    }
  },
   {
    id: 'T003', trainName: 'Eastern Arrow', trainNumber: '15929', source: 'KOLKATA', destination: 'DELHI', departure: '21:00',
    classes: {
      First: { price: 3800, totalSeats: 40, availableSeats: 20 },
      Business: { price: 2200, totalSeats: 90, availableSeats: 80 },
      Economy: { price: 950, totalSeats: 210, availableSeats: 150 }
    }
  },
  {
    id: 'T004', trainName: 'South Connect', trainNumber: '11021', source: 'BENGALURU', destination: 'CHENNAI', departure: '06:15',
    description: "Experience the swift journey between two of South India's biggest hubs. Ideal for a quick weekend getaway or a business trip.",
    classes: {
      First: { price: 1800, totalSeats: 30, availableSeats: 25 },
      Business: { price: 1200, totalSeats: 70, availableSeats: 60 },
      Economy: { price: 550, totalSeats: 150, availableSeats: 140 }
    }
  },
  {
    id: 'T005', trainName: 'Deccan Queen', trainNumber: '12124', source: 'PUNE', destination: 'MUMBAI', departure: '17:10',
    description: "The legendary Deccan Queen, connecting Pune and Mumbai with impeccable service and a rich history.",
    classes: {
      First: { price: 1000, totalSeats: 20, availableSeats: 10 },
      Business: { price: 700, totalSeats: 50, availableSeats: 45 },
      Economy: { price: 300, totalSeats: 120, availableSeats: 100 }
    }
  },
  {
    id: 'T006', trainName: 'Tech Express', trainNumber: '20608', source: 'HYDERABAD', destination: 'BENGALURU', departure: '22:00',
    description: "Overnight service linking the tech capitals of Hyderabad and Bengaluru. Travel while you sleep and arrive fresh for your meetings.",
    classes: {
      First: { price: 2500, totalSeats: 40, availableSeats: 35 },
      Business: { price: 1800, totalSeats: 80, availableSeats: 80 },
      Economy: { price: 750, totalSeats: 160, availableSeats: 120 }
    }
  },
  {
    id: 'T007', trainName: 'Western Star', trainNumber: '12957', source: 'AHMEDABAD', destination: 'DELHI', departure: '19:30',
    description: "Travel from the vibrant city of Ahmedabad to the nation's capital with our premium overnight service.",
    classes: {
      First: { price: 3200, totalSeats: 35, availableSeats: 30 },
      Business: { price: 2100, totalSeats: 90, availableSeats: 85 },
      Economy: { price: 900, totalSeats: 200, availableSeats: 190 }
    }
  },
  {
    id: 'T008', trainName: 'Coastal Cruiser', trainNumber: '12842', source: 'CHENNAI', destination: 'KOLKATA', departure: '11:45',
    description: "Enjoy the scenic coastal route from Chennai to Kolkata. A journey as beautiful as the destination.",
    classes: {
      First: { price: 4200, totalSeats: 30, availableSeats: 15 },
      Business: { price: 2800, totalSeats: 70, availableSeats: 50 },
      Economy: { price: 1100, totalSeats: 180, availableSeats: 175 }
    }
  },
  {
    id: 'T009', trainName: 'Mumbai Duronto', trainNumber: '12262', source: 'MUMBAI', destination: 'DELHI', departure: '23:00',
    description: "The fastest connection back to the capital. Experience a non-stop, high-speed journey overnight.",
    classes: {
      First: { price: 3600, totalSeats: 50, availableSeats: 50 },
      Business: { price: 2100, totalSeats: 100, availableSeats: 95 },
      Economy: { price: 850, totalSeats: 200, availableSeats: 180 }
    }
  },
  {
    id: 'T010', trainName: 'Garden City Express', trainNumber: '11022', source: 'CHENNAI', destination: 'BENGALURU', departure: '16:00',
    description: "Return to the Garden City with our comfortable and convenient afternoon service.",
    classes: {
      First: { price: 1800, totalSeats: 30, availableSeats: 30 },
      Business: { price: 1200, totalSeats: 70, availableSeats: 65 },
      Economy: { price: 550, totalSeats: 150, availableSeats: 125 }
    }
  },
  {
    id: 'T011', trainName: 'Rajdhani Express', trainNumber: '12493', source: 'PUNE', destination: 'DELHI', departure: '11:00',
    description: 'Connects the cultural capital of Maharashtra to the national capital with premium, high-speed service.',
    classes: {
      First: { price: 4500, totalSeats: 40, availableSeats: 38 },
      Business: { price: 3200, totalSeats: 80, availableSeats: 70 },
      Economy: { price: 1500, totalSeats: 150, availableSeats: 120 },
    },
  },
  {
    id: 'T012', trainName: 'Charminar Express', trainNumber: '12759', source: 'HYDERABAD', destination: 'CHENNAI', departure: '18:30',
    description: 'A popular choice for comfortable overnight travel between Hyderabad and Chennai.',
    classes: {
      First: { price: 2200, totalSeats: 30, availableSeats: 25 },
      Business: { price: 1600, totalSeats: 60, availableSeats: 55 },
      Economy: { price: 650, totalSeats: 180, availableSeats: 150 },
    },
  },
  {
    id: 'T013', trainName: 'Shatabdi Express', trainNumber: '12009', source: 'AHMEDABAD', destination: 'MUMBAI', departure: '06:40',
    description: 'High-speed, premium day service connecting the commercial hubs of Gujarat and Maharashtra.',
    classes: {
      First: { price: 1500, totalSeats: 25, availableSeats: 20 },
      Business: { price: 900, totalSeats: 80, availableSeats: 78 },
      Economy: { price: 450, totalSeats: 140, availableSeats: 130 },
    },
  },
  {
    id: 'T014', trainName: 'Udyan Express', trainNumber: '11302', source: 'BENGALURU', destination: 'PUNE', departure: '20:30',
    description: 'Travel comfortably overnight from the Garden City to the Oxford of the East.',
    classes: {
      First: { price: 2800, totalSeats: 35, availableSeats: 30 },
      Business: { price: 1900, totalSeats: 75, availableSeats: 65 },
      Economy: { price: 800, totalSeats: 160, availableSeats: 140 },
    },
  },
  {
    id: 'T015', trainName: 'Falaknuma Express', trainNumber: '12703', source: 'KOLKATA', destination: 'HYDERABAD', departure: '07:25',
    description: 'A superfast express connecting the City of Joy with the City of Pearls.',
    classes: {
      First: { price: 4300, totalSeats: 30, availableSeats: 22 },
      Business: { price: 2900, totalSeats: 90, availableSeats: 80 },
      Economy: { price: 1200, totalSeats: 200, availableSeats: 195 },
    },
  },
  {
    id: 'T016', trainName: 'Karnataka Express', trainNumber: '12628', source: 'DELHI', destination: 'BENGALURU', departure: '21:15',
    description: 'A long-distance superfast train covering the length of the country, connecting the capital to the Silicon Valley of India.',
    classes: {
      First: { price: 5500, totalSeats: 50, availableSeats: 45 },
      Business: { price: 3800, totalSeats: 120, availableSeats: 110 },
      Economy: { price: 1800, totalSeats: 250, availableSeats: 220 },
    },
  },
];

const Header: React.FC<{
    user: User | null;
    onLoginClick: () => void;
    onLogout: () => void;
}> = ({ user, onLoginClick, onLogout }) => (
    <header className="flex justify-between items-center pb-6 border-b border-slate-700">
        <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-300">
            MOVEO
        </h1>
        <nav>
            {user ? (
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium text-sky-200">
                        <span className="text-xs text-slate-400 mr-2">Role:</span>
                        <span className="font-bold">{user.role.toUpperCase()}</span>
                    </span>
                    <button onClick={onLogout} className="text-red-400 hover:text-red-500 text-sm font-semibold">Logout</button>
                </div>
            ) : (
                <Button variant="accent" onClick={onLoginClick}>Login / Sign Up</Button>
            )}
        </nav>
    </header>
);

const GreetingSection: React.FC<{ onStart: () => void; }> = ({ onStart }) => (
    <section className="text-center py-20">
        <h2 className="text-5xl font-bold mb-4 text-white">Your Journey Starts Here.</h2>
        <p className="text-xl text-slate-300">Please log in or sign up to search and book your train tickets.</p>
        <div className="mt-8">
            <Button variant="primary" onClick={onStart} className="py-3 px-8 text-lg rounded-full">
                Start Booking
            </Button>
        </div>
    </section>
);


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [trains, setTrains] = useState<Train[]>(initialTrains);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [message, setMessage] = useState<string>('');

    const allStations = useMemo(() => {
        const stationSet = new Set<string>();
        trains.forEach(train => {
            stationSet.add(train.source);
            stationSet.add(train.destination);
        });
        return Array.from(stationSet).sort();
    }, [trains]);

    const showMessage = (msg: string) => {
        setMessage(msg);
    };

    const handleLogin = (creds: LoginCredentials) => {
        // Mock authentication
        if (creds.role === 'admin' && creds.email !== 'admin@moveo.com') {
            showMessage("Invalid admin credentials. Use 'admin@moveo.com'.");
            return;
        }
        if (creds.role === 'admin' && creds.password !== 'admin123') {
             showMessage("Invalid admin password. Use 'admin123'.");
            return;
        }
        setCurrentUser({ uid: `user-${Date.now()}`, email: creds.email, role: creds.role });
        setLoginModalOpen(false);
        showMessage(`Welcome, ${creds.role} ${creds.email}!`);
    };

    const handleSignup = (creds: Omit<LoginCredentials, 'role'>) => {
        setCurrentUser({ uid: `user-${Date.now()}`, email: creds.email, role: 'user' });
        setLoginModalOpen(false);
        showMessage(`Account created for ${creds.email}. Welcome!`);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        showMessage("You have been logged out.");
    };

    const handleAddTrain = (newTrainData: Omit<Train, 'id'>) => {
        const newTrain: Train = {
            id: `T${Date.now()}`,
            ...newTrainData
        };
        setTrains(prev => [...prev, newTrain]);
        showMessage(`Train ${newTrain.trainNumber} added successfully!`);
    };

    const handleUpdateTrain = (updatedTrain: Train) => {
        setTrains(prevTrains => 
            prevTrains.map(train => 
                train.id === updatedTrain.id ? updatedTrain : train
            )
        );
    };
    
    const handleDeleteTrain = (trainId: string) => {
        setTrains(prev => prev.filter(t => t.id !== trainId));
        showMessage(`Train ID ${trainId} has been deleted.`);
    };

    const handleBook = (trainId: string, travelDate: string, passengers: number, selectedClass: TrainClassName) => {
        const train = trains.find(t => t.id === trainId);
        if (!train) {
            showMessage("Error: Train not found.");
            return;
        }

        const classData = train.classes[selectedClass];
        if (classData.availableSeats < passengers) {
            showMessage(`Booking failed: Only ${classData.availableSeats} seats available.`);
            return;
        }

        // Update train seats
        const updatedTrains = trains.map(t => {
            if (t.id === trainId) {
                return {
                    ...t,
                    classes: {
                        ...t.classes,
                        [selectedClass]: {
                            ...t.classes[selectedClass],
                            availableSeats: t.classes[selectedClass].availableSeats - passengers
                        }
                    }
                };
            }
            return t;
        });
        setTrains(updatedTrains);

        // Create new booking
        const newBooking: Booking = {
            id: `B${Date.now()}`,
            userId: currentUser!.uid,
            trainId: train.id,
            trainName: train.trainName,
            trainNumber: train.trainNumber,
            destination: train.destination,
            date: travelDate,
            class: selectedClass,
            passengers: passengers,
            totalPrice: classData.price * passengers,
            status: 'Confirmed'
        };
        setBookings(prev => [...prev, newBooking]);
        showMessage(`Booking confirmed! Total: ₹${newBooking.totalPrice.toFixed(2)}.`);
    };

    const handleCancel = (bookingToCancel: Booking) => {
        // Restore seats
        const updatedTrains = trains.map(t => {
            if (t.id === bookingToCancel.trainId) {
                return {
                    ...t,
                    classes: {
                        ...t.classes,
                        [bookingToCancel.class]: {
                            ...t.classes[bookingToCancel.class],
                            availableSeats: t.classes[bookingToCancel.class].availableSeats + bookingToCancel.passengers
                        }
                    }
                };
            }
            return t;
        });
        setTrains(updatedTrains);

        // Remove booking
        setBookings(prev => prev.filter(b => b.id !== bookingToCancel.id));
        showMessage(`Booking ${bookingToCancel.id} has been cancelled.`);
    };

    const userBookings = useCallback(() => {
        if (!currentUser) return [];
        return bookings.filter(b => b.userId === currentUser.uid);
    }, [bookings, currentUser]);

    return (
        <div className="app-container w-full max-w-7xl mx-auto my-auto p-4 md:p-8 rounded-xl shadow-2xl text-white flex flex-col min-h-[90vh]">
            <Header user={currentUser} onLoginClick={() => setLoginModalOpen(true)} onLogout={handleLogout} />

            <main className="pt-6 flex-grow">
                {!currentUser && <GreetingSection onStart={() => setLoginModalOpen(true)} />}
                {currentUser?.role === 'user' && (
                    <UserDashboard
                        trains={trains}
                        stations={allStations}
                        bookings={userBookings()}
                        onBook={handleBook}
                        onCancel={handleCancel}
                        showMessage={showMessage}
                    />
                )}
                {currentUser?.role === 'admin' && (
                    <AdminDashboard 
                        trains={trains} 
                        onAddTrain={handleAddTrain}
                        onUpdateTrain={handleUpdateTrain}
                        onDeleteTrain={handleDeleteTrain} 
                        showMessage={showMessage}
                    />
                )}
            </main>

            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => setLoginModalOpen(false)}
                    onLogin={handleLogin}
                    onSignup={handleSignup}
                />
            )}
            
            {message && <MessageBox message={message} onClose={() => setMessage('')} />}
        </div>
    );
};

export default App;