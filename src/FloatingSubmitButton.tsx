import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { createAirtableRecord } from './airtable';

const FloatingSubmitForm: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    SubmitForm_Name: '',
    SubmitForm_Email: '',
    SubmitForm_ThreeWords: '',
    Title: '',
    Standard: '',
    SubmitForm_Type: '',
    Quicktake: '',
    Details: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize refs for inputs
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)[]>([]);

  const steps = [
    { id: 'SubmitForm_Name', type: 'text', placeholder: 'Enter your name' },
    { id: 'SubmitForm_Email', type: 'email', placeholder: 'Enter your email' },
    { id: 'SubmitForm_ThreeWords', type: 'text', placeholder: 'Describe in three words' },
    { id: 'Title', type: 'text', placeholder: 'Enter the title' },
    { id: 'Standard', type: 'text', placeholder: 'Enter the standard' },
    { id: 'SubmitForm_Type', type: 'select', options: ['Taste', 'Technique', 'Tool', 'Toy'] },
    { id: 'Quicktake', type: 'textarea', placeholder: 'Give a quick take on the standard' },
    { id: 'Details', type: 'textarea', placeholder: 'Describe the standard in detail' },
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
    try {
      const formattedData = {
        SubmitForm_Name: formData.SubmitForm_Name,
        SubmitForm_Email: formData.SubmitForm_Email,
        SubmitForm_ThreeWords: formData.SubmitForm_ThreeWords,
        Title: formData.Title,
        Standard: formData.Standard,
        SubmitForm_Type: formData.SubmitForm_Type,
        Quicktake: formData.Quicktake,
        Details: formData.Details,
      };

      await createAirtableRecord(formattedData);

      // Trigger success animation
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsFormOpen(false);
      }, 2000);

      setFormData({
        SubmitForm_Name: '',
        SubmitForm_Email: '',
        SubmitForm_ThreeWords: '',
        Title: '',
        Standard: '',
        SubmitForm_Type: '',
        Quicktake: '',
        Details: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
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
    setIsFormOpen(!isFormOpen);
  };

  useEffect(() => {
    if (inputRefs.current[currentStep]) {
      inputRefs.current[currentStep]?.focus();
    }
  }, [currentStep]);

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
          className={`fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-lg animate-bounce-in`}
        >
          <div className="flex justify-end">
            <button onClick={toggleForm} className="text-xl text-[#034641] hover:text-[#A7D6CB]">
              X
            </button>
          </div>
          <h3 className="text-xl font-semibold text-[#034641] mb-4">Submit A Standard</h3>
          <p className="text-sm text-[#1c5f5a] mb-6">
            Have an idea that you think should be considered a Standard? Share your thoughts!
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
                    />
                  ) : step.type === 'select' ? (
                    <select
                      ref={(el) => (inputRefs.current[index] = el)}
                      id={step.id}
                      value={formData[step.id as keyof typeof formData]}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="w-full border-none border-b-2 border-[#034641] bg-transparent focus:outline-none focus:border-[#A7D6CB] focus:ring-0"
                    >
                      <option value="">Select an option</option>
                      {step.options?.map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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
            >
              &lt;
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="fixed bottom-6 right-6 bg-[#A7D6CB] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-[#A0D5C7] transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="fixed bottom-6 right-6 px-6 py-2 bg-[#034641] text-white rounded-full text-lg hover:bg-[#046456] transition-all duration-200"
            >
              Submit
            </button>
          )}
        </div>
      )}

      {isSubmitted && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="firework-animation">🎇</div>
        </div>
      )}
    </div>
  );
};

export default FloatingSubmitForm;