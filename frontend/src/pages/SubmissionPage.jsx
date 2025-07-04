import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicFormComponent from '../components/forms/DynamicFormComponent';
import FormService from '../services/formService';
import useFormStore from '../store/formStore'; // To manage global form state (template, loading, error)
import useAuthStore from '../store/authStore'; // To get observer/user ID

const SubmissionPage = () => {
  const { templateId } = useParams(); // Get templateId from URL
  const navigate = useNavigate();

  // Global state from formStore
  const {
    currentFormTemplate,
    setCurrentFormTemplate,
    isLoading: isFormLoading,
    error: formError,
    setLoading: setFormLoading,
    setError: setFormError,
    resetCurrentForm
  } = useFormStore();

  // Global state from authStore
  const { user, isAuthenticated } = useAuthStore();

  const [pageError, setPageError] = useState(null); // For page-level errors not from store

  useEffect(() => {
    // Reset form state when component unmounts or templateId changes
    return () => {
      resetCurrentForm();
    };
  }, [resetCurrentForm, templateId]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/submissions/template/${templateId}/new` } });
      return;
    }

    if (templateId) {
      setFormLoading(true);
      setPageError(null);
      FormService.fetchFormTemplateById(templateId)
        .then(response => {
          if (response.success) {
            setCurrentFormTemplate(response.data);
          } else {
            setFormError(response.error || `Failed to load form template ${templateId}.`);
            setPageError(response.error || `Failed to load form template ${templateId}.`);
          }
        })
        .catch(err => {
          // This catch might be redundant if FormService always returns a structured response
          const errMsg = err.message || `An unexpected error occurred while fetching template ${templateId}.`;
          setFormError(errMsg);
          setPageError(errMsg);
        })
        .finally(() => {
            // setLoading(false) is called by setCurrentFormTemplate or setError in store
        });
    } else {
      setPageError("No form template ID provided.");
      setFormError("No form template ID provided.");
    }
  }, [templateId, setCurrentFormTemplate, setFormLoading, setFormError, isAuthenticated, navigate]);

  const handleFormSubmit = async (formData) => {
    if (!user || !user.id) {
        setFormError("User not authenticated or user ID is missing. Cannot submit.");
        return;
    }
    if (!currentFormTemplate || !currentFormTemplate.id) {
        setFormError("Form template not loaded. Cannot submit.");
        return;
    }

    // In a real scenario, polling_unit_id would come from context, props, or another selection process
    // For now, let's assume it's hardcoded or needs to be added to the form/page logic.
    const placeholderPollingUnitId = 1; // Replace with actual logic

    const submissionData = {
      observer: user.id, // Assuming user object has an id property
      polling_unit: placeholderPollingUnitId,
      form_template: currentFormTemplate.id,
      responses: formData,
    };

    setFormLoading(true);
    const result = await FormService.submitSubmission(submissionData);
    setFormLoading(false); // Explicitly set loading false after service call

    if (result.success) {
      console.log('Submission successful:', result.data);
      alert('Form submitted successfully!'); // Replace with better UX (e.g., toast notification)
      navigate('/dashboard'); // Or to a list of submissions, or back to form selection
      resetCurrentForm(); // Clear the form store
    } else {
      setFormError(result.error || 'Submission failed. Please try again.');
      // Error is now in formStore.error, DynamicFormComponent can display it if needed
      // Or display it here:
      // setPageError(result.error || 'Submission failed. Please try again.');
    }
  };

  if (isFormLoading && !currentFormTemplate) { // Show loading only if template isn't there yet
    return <div className="p-6 text-center text-xl font-semibold">Loading form template...</div>;
  }

  if (pageError || formError && !currentFormTemplate) { // If there's an error and no template, show error
    return <div className="p-6 text-center text-red-600 text-xl">Error: {pageError || formError}</div>;
  }

  if (!currentFormTemplate || !currentFormTemplate.json_content) {
    return <div className="p-6 text-center text-gray-600">Form template not found or is invalid.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-indigo-600 hover:text-indigo-800">
        &larr; Back
      </button>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
        <DynamicFormComponent
          formSchema={currentFormTemplate.json_content}
          onSubmit={handleFormSubmit}
          // initialData can be passed if editing an existing submission
        />
        {/* Display submission loading/error from formStore if needed, though button in DynamicForm can handle its own state */}
        {isFormLoading && <p className="mt-4 text-center text-blue-600">Submitting...</p>}
        {formError && <p className="mt-4 text-center text-red-600">Submission Error: {formError}</p>}
      </div>
    </div>
  );
};

export default SubmissionPage;
