import React, { useState, useCallback, useMemo } from 'react';
import { CheckCircleIcon, CloseIcon } from './icons';
import { Spinner } from './Spinner';

interface ContactFormProps {
    onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
    
    const isFormValid = useMemo(() => {
        if (!name.trim() || !email.trim() || message.trim().length < 10) return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
        return true;
    }, [name, email, message]);

    const handleBlur = (field: 'email' | 'message') => {
        if (field === 'email') {
            if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setErrors(prev => ({ ...prev, email: 'Please enter a valid email format.' }));
            } else {
                setErrors(prev => { const next = {...prev}; delete next.email; return next; });
            }
        }
        if (field === 'message') {
            if (message.trim() && message.trim().length > 0 && message.trim().length < 10) {
                setErrors(prev => ({ ...prev, message: `Message must be at least 10 characters. (current: ${message.trim().length})` }));
            } else {
                setErrors(prev => { const next = {...prev}; delete next.message; return next; });
            }
        }
    };

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
    }, [isFormValid]);

    if (isSubmitting) {
        return <Spinner message="Sending inquiry..." />;
    }

    if (isSubmitted) {
        return (
            <div className="text-center p-8">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-300">Inquiry Sent!</h3>
                <p className="text-slate-300 mt-2">Your message has been successfully sent. The importer will contact you at {email}.</p>
                <button
                    onClick={onClose}
                    className="mt-6 bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-500 transition-colors"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
             <button
                type="button"
                onClick={onClose}
                className="absolute -top-2 -right-2 p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Close contact form"
            >
                <CloseIcon className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Your Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="you@example.com"
                        required
                        className={`w-full px-3 py-2 bg-slate-900 border rounded-md text-white placeholder-slate-500 focus:ring-1 focus:outline-none ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-orange-500 focus:ring-orange-500'}`}
                    />
                     {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => handleBlur('message')}
                    placeholder="Enter your inquiry here..."
                    required
                    minLength={10}
                    className={`w-full px-3 py-2 bg-slate-900 border rounded-md text-white placeholder-slate-500 focus:ring-1 focus:outline-none ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-orange-500 focus:ring-orange-500'}`}
                ></textarea>
                 {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
            </div>
            <button
                type="submit"
                className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                disabled={!isFormValid}
            >
                Send Inquiry
            </button>
        </form>
    );
};