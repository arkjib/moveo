import React, { useState } from 'react';
import { Train } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface EditTrainModalProps {
  train: Train;
  onClose: () => void;
  onSave: (train: Train) => void;
  showMessage: (message: string) => void;
}

const EditTrainModal: React.FC<EditTrainModalProps> = ({ train, onClose, onSave, showMessage }) => {
  const [formState, setFormState] = useState({
    trainName: train.trainName,
    trainNumber: train.trainNumber,
    source: train.source,
    destination: train.destination,
    departure: train.departure,
    description: train.description || '',
    priceFirst: train.classes.First.price.toString(),
    totalSeatsFirst: train.classes.First.totalSeats.toString(),
    availableSeatsFirst: train.classes.First.availableSeats.toString(),
    priceBusiness: train.classes.Business.price.toString(),
    totalSeatsBusiness: train.classes.Business.totalSeats.toString(),
    availableSeatsBusiness: train.classes.Business.availableSeats.toString(),
    priceEconomy: train.classes.Economy.price.toString(),
    totalSeatsEconomy: train.classes.Economy.totalSeats.toString(),
    availableSeatsEconomy: train.classes.Economy.availableSeats.toString(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
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

    const updatedTrain: Train = {
      id: train.id, // Keep the original ID
      trainName: formState.trainName,
      trainNumber: formState.trainNumber,
      source: formState.source.toUpperCase(),
      destination: formState.destination.toUpperCase(),
      departure: formState.departure,
      description: formState.description,
      classes,
    };
    
    onSave(updatedTrain);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full border-t-4 border-[#1a4d8c] relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        <h3 className="text-2xl font-bold mb-6 text-white">Edit Train: {train.trainName} ({train.trainNumber})</h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="trainName" value={formState.trainName} onChange={handleInputChange} placeholder="Train Name" required />
          <Input id="trainNumber" value={formState.trainNumber} onChange={handleInputChange} placeholder="Train Number" required />
          <Input id="source" value={formState.source} onChange={handleInputChange} placeholder="Source City" required />
          <Input id="destination" value={formState.destination} onChange={handleInputChange} placeholder="Destination City" required />
          <Input id="departure" value={formState.departure} onChange={handleInputChange} placeholder="Departure Time (HH:MM)" required />
          
          <div className="md:col-span-2">
            <textarea id="description" value={formState.description} onChange={handleInputChange} rows={3} placeholder="Train Marketing Description" className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f7a01c]"></textarea>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-700 pt-4 mt-2">
            {[{name: 'First', price: 'priceFirst', total: 'totalSeatsFirst', available: 'availableSeatsFirst'}, {name: 'Business', price: 'priceBusiness', total: 'totalSeatsBusiness', available: 'availableSeatsBusiness'}, {name: 'Economy', price: 'priceEconomy', total: 'totalSeatsEconomy', available: 'availableSeatsEconomy'}].map(cls => (
                <div key={cls.name} className="bg-slate-700 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold text-sky-300 mb-2">{cls.name} Class</h4>
                    <Input id={cls.price} value={(formState as any)[cls.price]} onChange={handleInputChange} type="number" placeholder="Price" min="100" className="w-full p-2 !bg-slate-600" required />
                    <Input id={cls.total} value={(formState as any)[cls.total]} onChange={handleInputChange} type="number" placeholder="Total Seats" min="1" className="w-full p-2 !bg-slate-600" required />
                    <Input id={cls.available} value={(formState as any)[cls.available]} onChange={handleInputChange} type="number" placeholder="Available Seats" min="0" className="w-full p-2 !bg-slate-600" required />
                </div>
            ))}
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <Button type="button" variant="danger" onClick={onClose} className="border-slate-500 text-slate-300 hover:bg-slate-600">Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrainModal;