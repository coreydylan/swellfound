import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { createAirtableRecord } from './airtable';

const FloatingSubmitForm: React.FC = () => {
  // State and Refs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)[]>([]);
  const timeouts = useRef<number[]>([]);
  
  const [formData, setFormData] = useState({
    Standard: '',
    Title: '',
    Quicktake: '',
    Details: '',
    SubmitForm_ThreeWords: '',
    SubmitForm_Name: '',
    SubmitForm_Email: '',
  });

  // Form steps configuration
  const steps = [
    { 
      id: 'Standard', 
      type: 'text', 
      placeholder: "What's your Standard? (e.g. Eggo Waffles, Method Soap, Taylor Guitars)" 
    },
    { 
      id: 'Title', 
      type: 'text', 
      placeholder: "What's your Standard for? (e.g. Healthy Breakfast, Hand Soap, Acoustic Guitar)" 
    },
    { 
      id: 'Quicktake', 
      type: 'textarea', 
      placeholder: 'Give us your one-liner Quicktake on this Standard? Why is it great?' 
    },
    { 
      id: 'Details', 
      type: 'textarea', 
      placeholder: 'Provide a longer 3-5 sentence description of your Standard' 
    },
    { 
      id: 'SubmitForm_ThreeWords', 
      type: 'text', 
      placeholder: 'Describe your Standard in three words...' 
    },
    { 
      id: 'SubmitForm_Name', 
      type: 'text', 
      placeholder: "What's your first and last name?" 
    },
    { 
      id: 'SubmitForm_Email', 
      type: 'email', 
      placeholder: "What's your email?" 
    },
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFormOpen && 
          formRef.current && 
          !formRef.current.contains(event.target as Node) &&
          !isSubmitting) {
        setIsFormOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormOpen, isSubmitting]);

  // Focus management
  useEffect(() => {
    if (inputRefs.current[currentStep]) {
      inputRefs.current[currentStep]?.focus();
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Event handlers
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [event.target.id]: event.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await createAirtableRecord(formData);
      
      setTimeout(() => {
        setIsFormOpen(false);
        
        setTimeout(() => {
          setFormData({
            Standard: '',
            Title: '',
            Quicktake: '',
            Details: '',
            SubmitForm_ThreeWords: '',
            SubmitForm_Name: '',
            SubmitForm_Email: '',
          });
          setCurrentStep(0);
          setIsSubmitting(false);
        }, 300);
      }, 300);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (currentStep < steps.length - 1) {
        handleNextStep();
      } else {
        handleSubmit();
      }
    }
  };

  const toggleForm = () => {
    if (isSubmitting) return;
    
    if (!isFormOpen) {
      setIsFormOpen(true);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      }, 100);
    } else {
      setIsFormOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Floating Button */}
      <div
        className="fixed bottom-8 right-8 text-[#1C5F5A] text-lg font-medium transition-all duration-200 cursor-pointer"
        onClick={toggleForm}
      >
        <span className="inline-flex items-center">
          <span className="mr-2 hover:text-[#b1d5cb] hover:underline">
            + suggest a Standard
          </span>
          <span className={`inline-block transition-transform duration-500 ${isFormOpen ? 'animate-spin-fast' : ''}`}>
          </span>
        </span>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div
          ref={formRef}
          className={`
            fixed bottom-0 left-0 right-0 shadow-lg
            transition-all duration-300
            ${isSubmitting ? 'translate-y-full' : 'translate-y-0'}
          `}
        >
          <div className="bg-[#034641] rounded-t-lg pt-3 pb-4 px-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-white">suggest a Standard</h3>
              <button
                onClick={toggleForm}
                className="text-xl text-white hover:text-[#A7D6CB] disabled:opacity-50"
                disabled={isSubmitting}
              >
                X
              </button>
            </div>
            <p className="text-sm text-[#A7D6CB] mt-1">
              Share your ideas and contribute your standards for others to discover!
            </p>
          </div>

          <div className="bg-[#f5f5f5] px-6 pb-6 pt-4 min-h-[280px]">
            {/* Form Fields */}
            <div className="relative w-full">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`${currentStep === index ? 'block' : 'hidden'} 
                    transition-all duration-500 ease-in-out`}
                >
                  <div className="mb-6 relative">
                    {step.type === 'text' || step.type === 'email' ? (
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type={step.type}
                        id={step.id}
                        value={formData[step.id as keyof typeof formData]}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full border-none border-b-2 border-[#034641] bg-transparent focus:outline-none focus:border-[#A7D6CB] focus:ring-0 placeholder-[#a0a0a0]"
                        placeholder={step.placeholder}
                        disabled={isSubmitting}
                      />
                    ) : step.type === 'textarea' ? (
                      <textarea
                        ref={(el) => (inputRefs.current[index] = el)}
                        id={step.id}
                        rows={3}
                        value={formData[step.id as keyof typeof formData]}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full border-none border-b-2 border-[#034641] bg-transparent focus:outline-none focus:border-[#A7D6CB] focus:ring-0 placeholder-[#a0a0a0] resize-none"
                        placeholder={step.placeholder}
                        disabled={isSubmitting}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {currentStep > 0 && (
              <button
                onClick={handlePreviousStep}
                className="fixed bottom-6 left-6 text-[#A7D6CB] text-2xl hover:text-[#034641] transition-all duration-200"
                disabled={isSubmitting}
              >
                &lt;
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="fixed bottom-6 right-6 bg-[#A7D6CB] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-[#A0D5C7] transition-all duration-200"
                disabled={isSubmitting}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`fixed bottom-6 right-6 px-6 py-2 rounded-full text-lg text-white transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-[#A7D6CB] border-4 border-dashed border-[#A7D6CB] animate-pulse'
                    : 'bg-[#034641] hover:bg-[#046456]'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CheckCircle className="w-6 h-6 text-white" /> : 'Submit'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingSubmitForm;