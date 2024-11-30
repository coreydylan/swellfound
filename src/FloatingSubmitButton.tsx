import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle, Send } from 'lucide-react';
import { createAirtableRecord } from './airtable';

const FloatingSubmitForm: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const timeouts = useRef<number[]>([]);

  const [formData, setFormData] = useState({
    SubmitForm_ThreeWords: '',
    SubmitForm_Name: '',
    SubmitForm_Email: '',
  });

  const steps = [
    {
      id: 'SubmitForm_ThreeWords',
      type: 'text',
      placeholder: 'Tell us about your suggested Standard and how it makes your life better',
    },
    {
      id: 'SubmitForm_Name',
      type: 'text',
      placeholder: "What's your first and last name?",
    },
    {
      id: 'SubmitForm_Email',
      type: 'email',
      placeholder: "What's your email?",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFormOpen && formRef.current && !formRef.current.contains(event.target as Node) && !isSubmitting) {
        setIsFormOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormOpen, isSubmitting]);

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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.id]: event.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
  
    try {
      setIsSubmitting(true);
  
      await createAirtableRecord({
        SubmitForm_ThreeWords: formData.SubmitForm_ThreeWords,
        SubmitForm_Name: formData.SubmitForm_Name,
        SubmitForm_Email: formData.SubmitForm_Email,
      });
  
      console.log('Form successfully submitted.');
  
      // Show success state
      setIsSubmitted(true);
      setShowThankYou(true);
  
      // Reset form state after success
      setTimeout(() => {
        setIsSliding(true);
  
        setTimeout(() => {
          setIsFormOpen(false);
          setShowThankYou(false); // Fade out thank-you message
  
          // Reset form for new submission
          setIsSubmitted(false);
          setCurrentStep(0);
          setFormData({
            SubmitForm_ThreeWords: '',
            SubmitForm_Name: '',
            SubmitForm_Email: '',
          });
        }, 1500); // Matches slide-down and fade-out animations
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log(`Key pressed: ${event.key}`);
    if (event.key === 'Enter') {
      event.preventDefault();
      if (currentStep < steps.length - 1) {
        console.log('Advancing to the next step.');
        handleNextStep();
      } else {
        console.log('Submitting the form.');
        handleSubmit();
      }
    }
  };
  const toggleForm = () => {
    if (isSubmitting) return;
  
    setIsFormOpen((prev) => {
      const newFormState = !prev;
  
      if (newFormState) {
        console.log('Opening form: resetting state and focusing first input');
        // Reset the form state
        setIsSubmitted(false);
        setCurrentStep(0);
        setFormData({
          SubmitForm_ThreeWords: '',
          SubmitForm_Name: '',
          SubmitForm_Email: '',
        });
  
        // Focus on the first input field
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
          } else {
            console.warn('First input field ref not found.');
          }
        }, 0);
      }
  
      return newFormState;
    });
  };

  const submitButton = (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className={`
        fixed bottom-6 right-6 
        text-white rounded-full
        flex items-center justify-center gap-2
        transition-all duration-300
        ${isSubmitting 
          ? 'w-12 h-12 bg-[#A7D6CB]' 
          : 'px-6 py-2 min-w-[100px] bg-[#034641] hover:bg-[#046456]'
        }
      `}
    >
      {isSubmitting ? (
        <Send className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <span>Submit</span>
          <Send className="w-4 h-4" />
        </>
      )}
    </button>
  );

  return (
    <div className="relative">
      {/* Floating Button */}
      <div
        className="fixed bottom-8 right-8 text-[#1C5F5A] text-lg font-medium transition-all duration-200 cursor-pointer"
        onClick={toggleForm}
      >
        <span className="inline-flex items-center">
          <span className="mr-2 hover:text-[#b1d5cb] hover:underline">+ suggest a Standard</span>
        </span>
      </div>

{/* Thank You Message */}
<div
  className={`
    fixed bottom-24 left-0 right-0
    flex items-center justify-center
    text-[#31706a] text-2xl font-semibold
    transition-opacity duration-1000
    ${showThankYou ? 'opacity-100' : 'opacity-0'}
  `}
  style={{
    pointerEvents: 'none', // Ensure it doesn't block clicks
  }}
>
  your Standard has been submitted
</div>

      {/* Form Modal */}
      {isFormOpen && (
        <div
          ref={formRef}
          className={`
            fixed bottom-0 left-0 right-0 shadow-lg
            transition-transform duration-500 ease-in-out
            ${isSliding ? 'translate-y-full' : 'translate-y-0'}
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

          {/* Form Content */}
          <div className="bg-[#f5f5f5] px-6 pb-6 pt-4 min-h-[280px]">
            <div className="relative w-full">
              <div>
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`${currentStep === index ? 'block' : 'hidden'} 
                      transition-all duration-500 ease-in-out`}
                  >
                    <div className="relative">
  <input
    ref={(el) => (inputRefs.current[index] = el)}
    type={step.type}
    id={step.id}
    value={formData[step.id as keyof typeof formData]}
    onChange={handleInputChange}
    onKeyDown={handleKeyDown}
    className="w-full border-none border-b-2 border-[#034641] bg-transparent focus:outline-none focus:border-[#A7D6CB] focus:ring-0 placeholder-[#a0a0a0] pr-10"
    placeholder={step.placeholder}
    disabled={isSubmitting}
  />
  <span className="absolute top-1/2 right-2 transform -translate-y-1/2 text-[#034641]">
    ↵
  </span>
</div>
                  </div>
                ))}
              </div>
            </div>
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
            submitButton
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingSubmitForm;