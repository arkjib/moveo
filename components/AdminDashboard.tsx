import React, { useState } from 'react';
import { Train } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { generateMarketingDescription } from '../services/geminiService';
import EditTrainModal from './EditTrainModal';

interface AdminDashboardProps {
  trains: Train[];
  onAddTrain: (train: Omit<Train, 'id'>) => void;
  onUpdateTrain: (train: Train) => void;
  onDeleteTrain: (trainId: string) => void;
  showMessage: (message: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ trains, onAddTrain, onUpdateTrain, onDeleteTrain, showMessage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);

  const initialFormState = {
    trainName: '',
    trainNumber: '',
    source: '',
    destination: '',
    departure: '',
    description: '',
    priceFirst: '3500',
    totalSeatsFirst: '50',
    availableSeatsFirst: '50',
    priceBusiness: '2000',
    totalSeatsBusiness: '100',
    availableSeatsBusiness: '100',
    priceEconomy: '800',
    totalSeatsEconomy: '200',
    availableSeatsEconomy: '200',
  };
  const [formState, setFormState] = useState(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({...prevState, [id]: value }));
  };
  
  const handleGenerateDescription = async () => {
    const { source, destination, priceFirst, priceEconomy } = formState;
    if (!source || !destination || !priceFirst || !priceEconomy) {
      showMessage('Please fill in Source, Destination, First Class Price, and Economy Class Price before generating a description.');
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generateMarketingDescription(source, destination, parseFloat(priceFirst), parseFloat(priceEconomy));
      setFormState(prevState => ({ ...prevState, description }));
    } catch (error: any) {
      showMessage(error.message || 'An error occurred while generating the description.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const classes = {
        First: { price: parseFloat(formState.priceFirst), totalSeats: parseInt(formState.totalSeatsFirst), availableSeats: parseInt(formState.availableSeatsFirst) },
        Business: { price: parseFloat(formState.priceBusiness), totalSeats: parseInt(formState.totalSeatsBusiness), availableSeats: parseInt(formState.availableSeatsBusiness) },
        Economy: { price: parseFloat(formState.priceEconomy), totalSeats: parseInt(formState.totalSeatsEconomy), availableSeats: parseInt(formState.availableSeatsEconomy) },
    };

    // Validation
    for (const [className, data] of Object.entries(classes)) {
        if (data.availableSeats > data.totalSeats) {
            showMessage(`Error in ${className} Class: Available seats (${data.availableSeats}) cannot be greater than total seats (${data.totalSeats}).`);
            return;
        }
    }

    const newTrain = {
      trainName: formState.trainName,
      trainNumber: formState.trainNumber,
      source: formState.source.toUpperCase(),
      destination: formState.destination.toUpperCase(),
      departure: formState.departure,
      description: formState.description,
      classes,
    };

    if (!newTrain.trainName || !newTrain.trainNumber || !newTrain.source || !newTrain.destination) {
      showMessage("Please fill all required train fields.");
      return;
    }
    onAddTrain(newTrain);
    // Reset form
    setFormState(initialFormState);
  };

  const handleSaveEdit = (updatedTrain: Train) => {
    onUpdateTrain(updatedTrain);
    setEditingTrain(null);
    showMessage('Train details updated successfully!');
  };

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#f7a01c] pl-3 text-[#f7a01c]">Admin Panel: Manage Trains</h2>
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Add New Train</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input id="trainName" value={formState.trainName} onChange={handleInputChange} placeholder="Train Name (e.g., Express)" required />
          <Input id="trainNumber" value={formState.trainNumber} onChange={handleInputChange} placeholder="Train Number (e.g., 12051)" required />
          <Input id="source" value={formState.source} onChange={handleInputChange} placeholder="Source City" required />
          <Input id="destination" value={formState.destination} onChange={handleInputChange} placeholder="Destination City" required />
          <Input id="departure" value={formState.departure} onChange={handleInputChange} placeholder="Departure Time (HH:MM)" required />

          <div className="md:col-span-3">
            <textarea id="description" value={formState.description} onChange={handleInputChange} rows={2} placeholder="Train Marketing Description (Optional, or generate with AI)" className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f7a01c]"></textarea>
            <Button type="button" variant="sparkle" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm mt-2">
              ✨ {isGenerating ? 'Generating...' : 'Generate Marketing Description'}
            </Button>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-700 pt-4 mt-4">
            {[{name: 'First', price: 'priceFirst', total: 'totalSeatsFirst', available: 'availableSeatsFirst'}, {name: 'Business', price: 'priceBusiness', total: 'totalSeatsBusiness', available: 'availableSeatsBusiness'}, {name: 'Economy', price: 'priceEconomy', total: 'totalSeatsEconomy', available: 'availableSeatsEconomy'}].map(cls => (
                <div key={cls.name} className="bg-slate-700 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold text-sky-300 mb-2">{cls.name} Class</h4>
                    <Input id={cls.price} value={(formState as any)[cls.price]} onChange={handleInputChange} type="number" placeholder="Price" min="100" className="w-full p-2 !bg-slate-600" required />
                    <Input id={cls.total} value={(formState as any)[cls.total]} onChange={handleInputChange} type="number" placeholder="Total Seats" min="1" className="w-full p-2 !bg-slate-600" required />
                    <Input id={cls.available} value={(formState as any)[cls.available]} onChange={handleInputChange} type="number" placeholder="Available Seats" min="0" className="w-full p-2 !bg-slate-600" required />
                </div>
            ))}
          </div>

          <div className="md:col-span-3 text-right">
            <Button type="submit" variant="primary" className="py-3 px-8 mt-4">Save Train Details</Button>
          </div>
        </form>
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-white">Current Train List</h3>
      <div className="space-y-4">
        {trains.length === 0 ? (
            <p className="text-slate-400">No trains defined yet.</p>
        ) : (trains.map(train => (
          <div key={train.id} className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col transition-all border-l-4 border-[#f7a01c]">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-xl text-white">{train.trainName} ({train.trainNumber})</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setEditingTrain(train)} className="text-sky-300 hover:text-sky-400 transition-colors font-semibold">Edit</button>
                <button onClick={() => onDeleteTrain(train.id)} className="text-red-400 hover:text-red-500 transition-colors font-semibold">Delete</button>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-2">{train.source} → {train.destination} at {train.departure}</p>
            {train.description && <p className="text-xs italic text-slate-400 mt-1">{train.description}</p>}
            <div className="text-slate-400 text-sm mt-2 pt-2 border-t border-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(train.classes).map(([className, data]) => (
                <span key={className} className="text-xs">
                  <span className="font-bold text-sky-400">{className}:</span> Seats: {data.availableSeats}/{data.totalSeats} | Price: ₹{data.price}
                </span>
              ))}
            </div>
          </div>
        )))}
      </div>

      {editingTrain && (
        <EditTrainModal
          train={editingTrain}
          onClose={() => setEditingTrain(null)}
          onSave={handleSaveEdit}
          showMessage={showMessage}
        />
      )}
    </section>
  );
};

export default AdminDashboard;