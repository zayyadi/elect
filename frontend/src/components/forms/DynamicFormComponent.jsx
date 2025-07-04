import React, { useState, useEffect, useCallback } from 'react';
// Not directly using useFormStore here for formData, keeping it local to this component for now.
// Parent (SubmissionPage) will use useFormStore for template loading and overall submission state.

const DynamicFormComponent = ({ formSchema, onSubmit, initialData = {}, isSubmitting = false }) => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Initialize or re-initialize formData when formSchema or initialData changes
  useEffect(() => {
    const defaultData = { ...initialData };
    if (formSchema && formSchema.fields) {
      formSchema.fields.forEach(field => {
        // Prioritize initialData, then schema defaultValue, then type-specific default
        if (initialData[field.name] === undefined) {
          if (field.defaultValue !== undefined) {
            defaultData[field.name] = field.defaultValue;
          } else {
            // Set default based on type if no defaultValue provided
            switch (field.type) {
              case 'checkbox':
                defaultData[field.name] = false;
                break;
              case 'number':
                defaultData[field.name] = ''; // Or 0, depending on desired behavior
                break;
              default:
                defaultData[field.name] = '';
            }
          }
        }
      });
    }
    setFormData(defaultData);
    setFormErrors({}); // Clear errors when schema changes
  }, [formSchema, initialData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: val,
    }));

    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  }, [formErrors]);

  const validateField = (field, value) => {
    if (field.required) {
      if (field.type === 'checkbox' && !value) return `${field.label || field.name} is required.`;
      if (field.type !== 'checkbox' && (value === undefined || value === null || value === '')) {
        return `${field.label || field.name} is required.`;
      }
    }
    if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      return `Please enter a valid email for ${field.label || field.name}.`;
    }
    if (field.minLength && value && value.length < field.minLength) {
      return `${field.label || field.name} must be at least ${field.minLength} characters.`;
    }
    if (field.maxLength && value && value.length > field.maxLength) {
      return `${field.label || field.name} must be no more than ${field.maxLength} characters.`;
    }
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      return field.patternErrorMessage || `Invalid format for ${field.label || field.name}.`;
    }
    // Add more specific validations (min, max for numbers, etc.)
    return null;
  };

  const validateForm = () => {
    if (!formSchema || !formSchema.fields) return true;

    const errors = {};
    formSchema.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      console.log('Form validation failed:', formErrors);
    }
  };

  const renderField = (field) => {
    const commonInputClass = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors[field.name] ? 'border-red-500' : 'border-gray-300'}`;
    const fieldId = `field-${field.name}`; // Ensure unique ID

    let inputElement;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'tel':
        inputElement = (
          <input
            type={field.type}
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || ''}
            className={commonInputClass}
            minLength={field.minLength}
            maxLength={field.maxLength}
            pattern={field.pattern}
            disabled={isSubmitting}
          />
        );
        break;
      case 'number':
        inputElement = (
          <input
            type="number"
            id={fieldId}
            name={field.name}
            value={formData[field.name] === undefined ? '' : formData[field.name]}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || ''}
            className={commonInputClass}
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
            disabled={isSubmitting}
          />
        );
        break;
      case 'textarea':
        inputElement = (
          <textarea
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || ''}
            rows={field.rows || 3}
            className={commonInputClass}
            minLength={field.minLength}
            maxLength={field.maxLength}
            disabled={isSubmitting}
          />
        );
        break;
      case 'select':
        inputElement = (
          <select
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            className={commonInputClass}
            disabled={isSubmitting}
          >
            <option value="" disabled>{field.placeholder || 'Select an option'}</option>
            {field.options && field.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
        break;
      case 'radio':
        inputElement = (
          <div className="mt-2 space-y-2">
            {field.options && field.options.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={handleChange}
                  required={field.required && field.options.indexOf(option) === 0} // Only first radio required for group
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
        break;
      case 'checkbox':
        inputElement = (
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              checked={!!formData[field.name]} // Ensure boolean
              onChange={handleChange}
              // required={field.required} // HTML5 'required' on checkbox can be tricky if it means "must be checked"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:opacity-50"
              disabled={isSubmitting}
            />
             {/* Checkbox often has label to the right, not above */}
             {/* So we don't use the main label from above for this one, instead use field.label directly */}
            <label htmlFor={fieldId} className="ml-2 block text-sm text-gray-900">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
        break;
      default:
        inputElement = (
          <input
            type="text" // Fallback to text
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || `Unsupported field type: ${field.type}`}
            className={commonInputClass}
            disabled={isSubmitting}
          />
        );
    }

    return (
      <div key={field.name} className="mb-6">
        {/* For checkbox, the label is part of the inputElement itself */}
        {field.type !== 'checkbox' && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {inputElement}
        {formErrors[field.name] && <p className="mt-1 text-xs text-red-600">{formErrors[field.name]}</p>}
        {field.description && field.type !== 'checkbox' && <p className="mt-1 text-xs text-gray-500">{field.description}</p>}
        {field.description && field.type === 'checkbox' && <p className="ml-6 text-xs text-gray-500">{field.description}</p>}
      </div>
    );
  };

  if (!formSchema || !formSchema.fields || formSchema.fields.length === 0) {
    return <p className="text-gray-600 p-4">No form fields defined in the schema or schema not loaded.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4"> {/* Reduced space-y for denser forms */}
      {formSchema.name && <h2 className="text-2xl font-semibold text-gray-800 mb-6">{formSchema.name}</h2>}
      {formSchema.description && <p className="text-base text-gray-600 mb-8">{formSchema.description}</p>}

      {formSchema.fields.map(field => renderField(field))}

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : (formSchema.submitText || 'Submit Responses')}
      </button>
    </form>
  );
};

export default DynamicFormComponent;
