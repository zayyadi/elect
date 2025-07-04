import { create } from 'zustand';

// This store will manage the state related to fetching form templates,
// the currently active form template, and the data being entered into a dynamic form.

const useFormStore = create((set, get) => ({
  formTemplates: [], // List of available form templates
  currentFormTemplate: null, // The template being used for a submission
  currentFormData: {}, // Responses for the current form { fieldName: value, ... }

  isLoading: false, // For loading states during API calls (fetching templates, submitting forms)
  error: null,      // For storing errors from API calls

  // Action to set loading state
  setLoading: (loadingStatus) => set({ isLoading: loadingStatus, error: null }), // Clear error when starting to load

  // Action to set error messages
  setError: (errorMessage) => set({ error: errorMessage, isLoading: false }),

  // Action to store fetched form templates
  setFormTemplates: (templates) => set({ formTemplates: templates, isLoading: false, error: null }),

  // Action to store the currently selected/fetched form template
  setCurrentFormTemplate: (template) => {
    set({
      currentFormTemplate: template,
      currentFormData: {}, // Reset form data when a new template is loaded
      isLoading: false,
      error: null
    });
  },

  // Action to update a specific field's value in the current form data
  updateCurrentFormField: (fieldName, value) => {
    set((state) => ({
      currentFormData: {
        ...state.currentFormData,
        [fieldName]: value,
      },
    }));
  },

  // Action to reset the current form (template and data)
  resetCurrentForm: () => {
    set({
      currentFormTemplate: null,
      currentFormData: {},
      isLoading: false,
      error: null,
    });
  },

  // Potentially, actions for submission success/failure if not handled by component directly
  submissionSuccess: (responseData) => {
    console.log("Submission successful (from store):", responseData);
    // Could reset form here or trigger other UI updates
    set({ isLoading: false, error: null });
    // get().resetCurrentForm(); // Example: reset form on successful submission
  },

  submissionFailure: (errorMessage) => {
    console.error("Submission failed (from store):", errorMessage);
    set({ error: errorMessage, isLoading: false });
  },

}));

export default useFormStore;
