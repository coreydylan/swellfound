import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { createAirtableRecord } from './airtable';

const FloatingSubmitForm: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    Standard: '',
    Title: '',
    Quicktake: '',
    Details: '',
    SubmitForm_ThreeWords: '',
    SubmitForm_Name: '',
    SubmitForm_Email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)[]>([]);
  const timeouts = useRef<number[]>([]);

  const steps = [
    { id: 'Standard', type: 'text', placeholder: "What's your Standard? (e.g. Eggo Waffles, Method Soap, Taylor Guitars)" },
    { id: 'Title', type: 'text', placeholder: "What's your Standard for? (e.g. Healthy Breakfast, Hand Soap, Acoustic Guitar)" },
    { id: 'Quicktake', type: 'textarea', placeholder: 'Give us your one-liner Quicktake on this Standard? Why is it great?' },
    { id: 'Details', type: 'textarea', placeholder: 'Provide a longer 3-5 sentence description of your Standard' },
    { id: 'SubmitForm_ThreeWords', type: 'text', placeholder: 'Describe your Standard in three words...' },
    { id: 'SubmitForm_Name', type: 'text', placeholder: "What's your first and last name?" },
    { id: 'SubmitForm_Email', type: 'email', placeholder: "What's your email?" },
  ];

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
      setIsFormOpen(false);
      setIsSubmitting(false);
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
    setIsFormOpen(!isFormOpen);
  };

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

  return (
    <div className="relative">
      <button
        onClick={toggleForm}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#A7D6CB] text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#A0D5C7] transition-all duration-200"
      >
        +
      </button>

      {isFormOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-lg ${
            isSubmitting ? 'animate-slide-down' : ''
          }`}
        >
          <div className="flex justify-end">
            <button
              onClick={toggleForm}
              className="text-xl text-[#034641] hover:text-[#A7D6CB] disabled:opacity-50"
              disabled={isSubmitting}
            >
              X
            </button>
          </div>

          <h3 className="text-xl font-semibold text-[#034641] mb-4">Submit A Standard</h3>
          <p className="text-sm text-[#1c5f5a] mb-6">
            Share your ideas and contribute your standards for others to discover!
          </p>

          <div className="relative w-full">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${
                  currentStep === index ? 'block' : 'hidden'
                } transition-all duration-500 ease-in-out`}
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
      )}
    </div>
  );
};

export default FloatingSubmitForm;