import axiosInstance from './axiosConfig';
// import useFormStore from '../store/formStore'; // To be used if formStore handles loading/error states

const FormService = {
  // Fetch a list of available form templates
  fetchFormTemplates: async () => {
    // const { setLoading, setError, setFormTemplates } = useFormStore.getState();
    // setLoading(true);
    try {
      const response = await axiosInstance.get('/form-templates/'); // Adjust endpoint as needed
      // setFormTemplates(response.data);
      // setLoading(false);
      console.log('Form templates fetched:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching form templates:', error.response?.data || error.message);
      // setError(error.response?.data?.detail || 'Failed to fetch form templates.');
      // setLoading(false);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch form templates.' };
    }
  },

  // Fetch a single form template by its ID
  fetchFormTemplateById: async (templateId) => {
    // const { setLoading, setError, setCurrentFormTemplate } = useFormStore.getState();
    // setLoading(true);
    try {
      const response = await axiosInstance.get(`/form-templates/${templateId}/`); // Adjust endpoint
      // setCurrentFormTemplate(response.data);
      // setLoading(false);
      console.log(`Form template ${templateId} fetched:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching form template ${templateId}:`, error.response?.data || error.message);
      // setError(error.response?.data?.detail || `Failed to fetch form template ${templateId}.`);
      // setLoading(false);
      return { success: false, error: error.response?.data?.detail || `Failed to fetch form template ${templateId}.` };
    }
  },

  // Submit form responses for a given observer, polling unit, and form template
  submitSubmission: async (submissionData) => {
    // submissionData should ideally contain:
    // { observer_id, polling_unit_id, form_template_id, responses: { ... } }
    // const { setLoading, setError, clearCurrentForm } = useFormStore.getState();
    // setLoading(true);
    try {
      // Adjust endpoint as needed. This assumes a generic /submissions/ endpoint.
      const response = await axiosInstance.post('/submissions/', submissionData);
      // setLoading(false);
      // clearCurrentForm(); // Or some other success action
      console.log('Submission successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
      // setError(error.response?.data?.detail || 'Failed to submit form.');
      // setLoading(false);
      let errorMessage = 'Failed to submit form.';
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Handle DRF field errors like: { responses: ["This field is required."]}
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      return { success: false, error: errorMessage };
    }
  },
};

export default FormService;
